import { daysBefore, todayIn, type IsoDate } from "../shared/domain/iso-date.js";
import type { BoeGateway, BoeSummaryItem } from "../modules/ingestion/index.js";

export interface LatestDay {
  readonly date: IsoDate;
  readonly items: readonly BoeSummaryItem[];
}

/**
 * Busca hacia atrás el día más reciente que tenga disposiciones de las
 * secciones pedidas. Hace falta porque no todos los días hay Sección I:
 * midiendo diez días reales, cuatro no tenían ninguna.
 */
export async function findLatestDayWithEntries(
  gateway: BoeGateway,
  sections: readonly string[],
  timeZone: string,
  maxDaysBack = 21,
): Promise<LatestDay | null> {
  const today = todayIn(timeZone);
  for (let back = 0; back <= maxDaysBack; back++) {
    const date = daysBefore(today, back);
    const summary = await gateway.fetchDailySummary(date);
    if (!summary.ok || summary.value === null) continue;
    const items = summary.value.filter((item) => sections.includes(item.section));
    if (items.length > 0) return { date, items };
  }
  return null;
}
