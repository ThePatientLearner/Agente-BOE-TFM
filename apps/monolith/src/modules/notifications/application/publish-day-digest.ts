import type { Logger } from "../../../shared/logger/logger.js";
import { impactDots, type Announcement } from "../domain/notifier.js";
import type { NotificationLogRepository } from "../domain/notification-log.js";
import type { Notifier } from "../domain/notifier.js";

/**
 * Cuántas disposiciones trae un día y con qué impacto. Es lo único que el
 * parte público dice: ni títulos ni resúmenes, que ya salen en su propio
 * mensaje (y solo a partir de `minImpact`).
 */
export interface DayDigest {
  /** "yyyy-mm-dd". */
  readonly date: string;
  readonly total: number;
  /** Cuántas hay de cada nivel; el índice 0 es el impacto 1. */
  readonly byImpact: readonly [number, number, number, number, number];
  /** Ingeridas pero todavía sin resumen: no tienen impacto que contar. */
  readonly withoutSummary: number;
}

/** Clave del registro de envíos. No puede chocar con un id del BOE. */
export function digestKey(date: string): string {
  return `resumen-diario:${date}`;
}

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

/**
 * "2026-09-12" → "12 de septiembre de 2026". A mano y no con `Intl` porque
 * el mensaje sale siempre en español, y el formato no puede depender de qué
 * datos de localización traiga el Node del contenedor.
 */
export function fechaEnCastellano(date: string): string {
  const [year, month, day] = date.split("-");
  const nombre = MESES[Number(month) - 1];
  if (!year || !day || !nombre) return date;
  return `${Number(day)} de ${nombre} de ${year}`;
}

/**
 * Redacta el parte público del día: el recuento y su reparto por impacto,
 * con el enlace a la web. Función pura para poder fijar el texto en un test.
 *
 * El pie legal es el formato corto de LEGAL.md §5.3, el previsto para los
 * mensajes agrupados: aquí no hay ningún resumen que enlazar a su texto
 * oficial, pero el impacto sí lo pone la IA y hay que decirlo.
 */
export function buildDigestAnnouncement(
  digest: DayDigest,
  publicWebUrl: string,
  minImpact: number,
): Announcement {
  const lines: string[] = [
    digest.total === 1
      ? "1 disposición analizada."
      : `${digest.total} disposiciones analizadas.`,
    "",
  ];

  // De mayor a menor impacto, y sin los niveles vacíos: un día corriente
  // solo tiene dos o tres, y cinco líneas con ceros no dicen nada.
  for (let impact = 5; impact >= 1; impact--) {
    const count = digest.byImpact[impact - 1] ?? 0;
    if (count === 0) continue;
    lines.push(`${impactDots(impact)} impacto ${impact}/5 — ${count}`);
  }

  if (digest.withoutSummary > 0) {
    lines.push(
      digest.withoutSummary === 1
        ? "1 todavía sin resumir."
        : `${digest.withoutSummary} todavía sin resumir.`,
    );
  }

  lines.push("");
  lines.push(
    `Se publican aquí las de impacto ${minImpact} o superior; todas están en la web.`,
  );
  lines.push("");
  lines.push("ℹ️ Resúmenes por IA · No oficial · Válido solo el texto del BOE");

  return {
    title: `📊 BOE del ${fechaEnCastellano(digest.date)}`,
    body: lines.join("\n"),
    url: publicWebUrl,
  };
}

/**
 * Publica el parte del día en los canales públicos, una sola vez.
 *
 * La idempotencia sale del mismo registro que usa `NotifyEntry`, con una
 * clave sintética por fecha en lugar de un id del BOE. Sin esto, las tres
 * pasadas del cron publicarían el mismo recuento tres veces.
 *
 * No emite ningún evento: el parte no forma parte del ciclo de vida de
 * ninguna disposición y nada depende de que se haya enviado.
 */
export class PublishDayDigest {
  constructor(
    private readonly notifiers: readonly Notifier[],
    private readonly log: NotificationLogRepository,
    private readonly logger: Logger,
    private readonly publicWebUrl: string,
    private readonly minImpact: number,
  ) {}

  async execute(digest: DayDigest): Promise<void> {
    // Un día sin disposiciones no se anuncia. El BOE no publica los domingos
    // y casi la mitad de los días no trae Sección I: decirlo cada vez sería
    // ruido en el canal, y quien vigila que el sistema siga vivo tiene para
    // eso el parte privado de operación.
    if (digest.total === 0) return;

    const key = digestKey(digest.date);
    const announcement = buildDigestAnnouncement(digest, this.publicWebUrl, this.minImpact);

    for (const notifier of this.notifiers) {
      if (await this.log.wasSent(key, notifier.channel)) {
        continue;
      }
      const result = await notifier.sendAnnouncement(announcement);
      await this.log.record({
        entryId: key,
        channel: notifier.channel,
        sentAt: new Date(),
        success: result.ok,
      });
      if (result.ok) {
        this.logger.info(
          { date: digest.date, channel: notifier.channel, total: digest.total },
          "Parte del día publicado",
        );
      } else {
        // Se reintenta solo en la pasada siguiente del cron, porque
        // `wasSent` únicamente mira los envíos con éxito.
        this.logger.error(
          { date: digest.date, channel: notifier.channel, error: result.error.message },
          "Fallo publicando el parte del día",
        );
      }
    }
  }
}
