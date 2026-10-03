import type { IsoDate } from "../shared/domain/iso-date.js";
import type { EntryRepository } from "../modules/ingestion/index.js";

export interface DayStatus {
  readonly total: number;
  /** Guardadas pero sin resumen: la IA no llegó a responder. */
  readonly pending: number;
  /** Resumidas pero sin notificar: algún canal no respondió. */
  readonly summarized: number;
  /** Ciclo completo. Incluye las de impacto bajo, que no se notifican a nadie. */
  readonly notified: number;
  readonly failed: number;
  readonly ok: boolean;
}

/**
 * Cuenta en qué punto del ciclo está cada disposición del día.
 *
 * Se lee del estado que `TrackEntryProgress` mantiene en la propia fila, así
 * que el informe describe la realidad de la base de datos y no lo que una
 * pasada concreta creyó hacer. Es la diferencia entre «esta ejecución no
 * ingirió nada nuevo» —cierto y perfectamente inútil— y «las cuatro del día
 * están publicadas».
 */
export class DailyStatusReader {
  constructor(private readonly entries: EntryRepository) {}

  async read(date: IsoDate): Promise<DayStatus> {
    const [pending, summarized, notified, failed] = await Promise.all([
      this.countByStatus("pending", date),
      this.countByStatus("summarized", date),
      this.countByStatus("notified", date),
      this.countByStatus("failed", date),
    ]);

    return {
      total: pending + summarized + notified + failed,
      pending,
      summarized,
      notified,
      failed,
      ok: pending === 0 && summarized === 0 && failed === 0,
    };
  }

  private async countByStatus(
    status: "pending" | "summarized" | "notified" | "failed",
    date: IsoDate,
  ): Promise<number> {
    const found = await this.entries.findByStatus(status);
    return found.filter((entry) => entry.toProps().publicationDate === date).length;
  }
}

/**
 * Redacta el parte diario. Va SIEMPRE al chat privado de operación, nunca al
 * canal público: quien lo lee necesita saber si tiene que intervenir, y eso no
 * le interesa a nadie más.
 *
 * Se escribe para leerlo de un vistazo en el móvil: el veredicto primero y el
 * detalle debajo, y solo se enumera lo que está mal.
 */
export function buildDailyReport(
  date: IsoDate,
  status: DayStatus,
  /** `null` cuando no se ha consultado al BOE en esta ejecución. */
  bulletinPublished: boolean | null,
  hasMoreAttempts: boolean,
): string {
  const lines: string[] = [];

  // Un día en blanco tiene dos causas muy distintas y conviene no confundirlas:
  // que el BOE no publique (domingos y algunos festivos) o que publique y no
  // traiga nada en la Sección I, que es lo habitual —pasa casi la mitad de los
  // días—. Las dos son normales; ninguna es una avería. Decir solo "0
  // disposiciones" dejaría dudando de si se ha roto algo.
  if (status.total === 0) {
    if (bulletinPublished === false) {
      return `BOE ${date}\n\n😴 Hoy no hay boletín. Nada que hacer.`;
    }
    if (bulletinPublished === true) {
      return `BOE ${date}\n\n😴 El BOE ha publicado, pero hoy no trae ninguna disposición general (Sección I). Nada que resumir.`;
    }
    return `BOE ${date}\n\n😴 No hay ninguna disposición registrada para este día.`;
  }

  lines.push(status.ok ? `BOE ${date}\n\n✅ Todo correcto.` : `BOE ${date}\n\n⚠️ Requiere atención.`);
  lines.push("");
  lines.push(`Disposiciones del día: ${status.total}`);
  lines.push(`Publicadas del todo: ${status.notified}`);

  if (status.pending > 0) {
    lines.push(`Sin resumen (falló la IA): ${status.pending}`);
  }
  if (status.summarized > 0) {
    lines.push(`Resumidas pero sin notificar (falló un canal): ${status.summarized}`);
  }
  if (status.failed > 0) {
    lines.push(`Marcadas como fallidas: ${status.failed}`);
  }

  if (!status.ok) {
    lines.push("");
    lines.push(
      hasMoreAttempts
        ? "Queda un reintento hoy, que volverá a intentarlo solo."
        : "Era el último intento del día: hay que mirarlo a mano.",
    );
  }

  return lines.join("\n");
}
