import type { IsoDate } from "../shared/domain/iso-date.js";
import type { CatalogReadModel } from "../modules/catalog/index.js";
import type { DayDigest } from "../modules/notifications/index.js";

/** Lo único que hace falta de cada disposición para contarla. */
export interface ImpactoDeUnaDisposicion {
  readonly impact: number | null;
}

/**
 * Reparte las disposiciones de un día por nivel de impacto.
 *
 * Se cuenta sobre el catálogo y no sobre el estado del pipeline
 * (`DailyStatusReader`) porque el impacto lo pone el resumen, y la proyección
 * del catálogo es el único sitio donde disposición e impacto viven juntos
 * sin cruzar la frontera de ningún módulo.
 *
 * Un impacto fuera de 1..5 no debería existir —la columna la escribe el
 * dominio, que solo admite esos valores— pero si apareciera se cuenta como
 * "sin resumir" antes que descuadrar el total.
 */
export function buildDayDigest(
  date: IsoDate,
  entries: readonly ImpactoDeUnaDisposicion[],
): DayDigest {
  const byImpact: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let withoutSummary = 0;

  for (const entry of entries) {
    const impact = entry.impact;
    if (impact === null || !Number.isInteger(impact) || impact < 1 || impact > 5) {
      withoutSummary += 1;
      continue;
    }
    // El `?? 0` no puede darse (el índice está acotado a 0..4 justo arriba);
    // lo pide `noUncheckedIndexedAccess`, que no sabe leer esa guarda.
    const nivel = impact - 1;
    byImpact[nivel] = (byImpact[nivel] ?? 0) + 1;
  }

  return { date, total: entries.length, byImpact, withoutSummary };
}

/** Puerto que el cron usa para montar el parte público. */
export interface DayDigestReader {
  read(date: IsoDate): Promise<DayDigest>;
}

export class CatalogDayDigestReader implements DayDigestReader {
  constructor(private readonly catalog: CatalogReadModel) {}

  async read(date: IsoDate): Promise<DayDigest> {
    const day = await this.catalog.getDay(date);
    return buildDayDigest(date, day?.entries ?? []);
  }
}
