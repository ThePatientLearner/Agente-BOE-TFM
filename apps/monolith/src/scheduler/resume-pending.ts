import type { IsoDate } from "../shared/domain/iso-date.js";
import type { EventBus } from "../shared/event-bus/event-bus.js";
import type { Logger } from "../shared/logger/logger.js";
import { entryIngested, type EntryRepository } from "../modules/ingestion/index.js";
import { summaryGenerated, type SummaryRepository } from "../modules/summarization/index.js";

export interface ResumeReport {
  /** Disposiciones sin resumen que se han vuelto a mandar a la IA. */
  readonly resummarized: number;
  /** Disposiciones ya resumidas cuya notificación quedó pendiente. */
  readonly renotified: number;
  readonly failures: number;
}

/**
 * Reanuda las disposiciones que se quedaron a medias.
 *
 * Volver a lanzar la ingesta NO basta, y esta es la razón: `IngestDailyBulletin`
 * solo emite `EntryIngested` para las disposiciones **nuevas**. Si una se
 * guardó a las 08:30 pero la IA estaba caída, en el siguiente intento la
 * ingesta la ve con `exists()` y la cuenta como «ya existente»: no emite nada
 * y esa disposición se queda sin resumen para siempre, sin que nada falle a la
 * vista. Lo mismo si el resumen salió bien pero Telegram no respondió.
 *
 * Aquí se cierra ese hueco releyendo el estado que `TrackEntryProgress` mantiene
 * en la propia fila (pendiente → resumida → notificada) y volviendo a publicar
 * el evento que corresponda. No se llama a nadie directamente: se reinyectan los
 * eventos y cada módulo decide, con la misma lógica de siempre.
 *
 * Por qué esto no duplica nada:
 *
 * · `SummarizeEntry` comprueba si ya hay resumen antes de llamar a la IA.
 * · `NotifyEntry` consulta el log por canal, y en Postgres `wasSent` solo
 *   cuenta los envíos **con éxito**, así que reintenta el canal que falló y
 *   respeta el que ya salió.
 * · `TrackEntryProgress` exige que el estado actual encaje con la transición,
 *   de modo que un evento repetido no la aplica dos veces.
 *
 * Se limita al día que se está procesando. Recuperar días viejos es otra
 * operación —tiene el riesgo de publicar de golpe un atasco de hace semanas—
 * y para eso está la CLI.
 */
export class ResumePendingEntries {
  constructor(
    private readonly entries: EntryRepository,
    private readonly summaries: SummaryRepository,
    private readonly eventBus: EventBus,
    private readonly logger: Logger,
  ) {}

  async execute(date: IsoDate): Promise<ResumeReport> {
    let resummarized = 0;
    let renotified = 0;
    let failures = 0;

    // Las dos listas se leen ANTES de publicar nada. Si no, la primera vuelta
    // mueve filas de "pendiente" a "resumida" —eso hace `TrackEntryProgress`
    // al recibir el evento— y la segunda vuelta se encontraría con las mismas
    // disposiciones que acaba de tratar la primera. No llegaría a duplicar
    // envíos, porque el log por canal lo impide, pero sí publicaría eventos de
    // más y contaría el doble en el informe.
    const pending = await this.entries.findByStatus("pending");
    const summarized = await this.entries.findByStatus("summarized");
    const alreadyHandled = new Set<string>();

    for (const entry of pending) {
      const props = entry.toProps();
      if (props.publicationDate !== date) continue;

      const entryId = props.id.value;

      // Caso raro pero real: el resumen se guardó y el estado no llegó a
      // avanzar (proceso muerto entre una cosa y otra). Reemitir el evento
      // de ingesta no serviría —`SummarizeEntry` vería el resumen y se
      // saldría—, así que se salta directamente al de resumen generado.
      const existing = await this.summaries.findByEntryId(entryId);
      if (existing) {
        await this.publishSummary(props, existing);
        alreadyHandled.add(entryId);
        renotified += 1;
        continue;
      }

      if (!props.rawText) {
        this.logger.error(
          { entryId },
          "Reanudación: sin texto oficial guardado, no se puede resumir",
        );
        failures += 1;
        continue;
      }

      this.logger.warn({ entryId }, "Reanudación: disposición sin resumen, se reintenta");
      await this.eventBus.publish(
        entryIngested({
          entryId,
          publicationDate: props.publicationDate,
          department: props.department,
          title: props.title,
          officialHtmlUrl: props.officialHtmlUrl,
          officialPdfUrl: props.officialPdfUrl,
          text: props.rawText,
          lastOfficialUpdateAt: props.lastOfficialUpdateAt,
        }),
      );
      resummarized += 1;
    }

    for (const entry of summarized) {
      const props = entry.toProps();
      if (props.publicationDate !== date) continue;

      const entryId = props.id.value;
      if (alreadyHandled.has(entryId)) continue;

      const summary = await this.summaries.findByEntryId(entryId);
      if (!summary) {
        this.logger.error(
          { entryId },
          "Reanudación: marcada como resumida pero sin resumen guardado",
        );
        failures += 1;
        continue;
      }

      this.logger.warn({ entryId }, "Reanudación: notificación pendiente, se reintenta");
      await this.publishSummary(props, summary);
      renotified += 1;
    }

    if (resummarized > 0 || renotified > 0 || failures > 0) {
      this.logger.info({ date, resummarized, renotified, failures }, "Reanudación completada");
    }
    return { resummarized, renotified, failures };
  }

  private async publishSummary(
    props: {
      id: { value: string };
      publicationDate: IsoDate;
      lastOfficialUpdateAt: IsoDate;
      department: string;
      title: string;
      officialHtmlUrl: string;
    },
    summary: {
      plainTitle: string;
      shortPhrase: string;
      bulletPoints: readonly string[];
      impact: 1 | 2 | 3 | 4 | 5;
      model: string;
    },
  ): Promise<void> {
    await this.eventBus.publish(
      summaryGenerated({
        entryId: props.id.value,
        publicationDate: props.publicationDate,
        lastOfficialUpdateAt: props.lastOfficialUpdateAt,
        department: props.department,
        title: props.title,
        plainTitle: summary.plainTitle,
        shortPhrase: summary.shortPhrase,
        bulletPoints: summary.bulletPoints,
        impact: summary.impact,
        officialHtmlUrl: props.officialHtmlUrl,
        model: summary.model,
      }),
    );
  }
}
