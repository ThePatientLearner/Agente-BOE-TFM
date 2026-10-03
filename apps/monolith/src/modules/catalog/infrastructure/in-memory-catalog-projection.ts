import { gobiernoDeDisposicion } from "../../../shared/domain/comunidad.js";
import type { IsoDate } from "../../../shared/domain/iso-date.js";
import type { EventBus } from "../../../shared/event-bus/event-bus.js";
import type { EntryIngested } from "../../ingestion/index.js";
import type { SummaryGenerated } from "../../summarization/index.js";
import type { AssistantSearchParams } from "../application/queries.js";
import { searchTerms } from "../application/search-terms.js";
import type {
  CatalogDayView,
  CatalogEntryView,
  CatalogReadModel,
  CatalogReferenceView,
  CatalogSearchParams,
} from "../application/queries.js";

/**
 * Proyección en memoria, solo para tests. En producción se usa
 * `PostgresCatalogProjection`, que además deja constancia en el log si un
 * resumen llega antes que su disposición; aquí se ignora en silencio.
 */
export class InMemoryCatalogProjection implements CatalogReadModel {
  private readonly entries = new Map<string, CatalogEntryView>();

  async retrieve(params: AssistantSearchParams): Promise<CatalogEntryView[]> {
    const words = searchTerms(params.query);
    const ranked = [...this.entries.values()].map(entry => {
      const text = [entry.title, entry.plainTitle, entry.department, entry.shortPhrase, ...(entry.bulletPoints ?? [])].join(' ').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
      return { entry, rank: words.filter(word => text.includes(word)).length };
    }).filter(({ entry, rank }) => (!words.length || rank > 0) && (!params.from || entry.publicationDate >= params.from) && (!params.to || entry.publicationDate <= params.to))
      .sort((a, b) => b.rank - a.rank || b.entry.publicationDate.localeCompare(a.entry.publicationDate));
    return ranked.slice(0, 6).map(({ entry }) => entry);
  }

  register(eventBus: EventBus): void {
    eventBus.subscribe<EntryIngested>("ingestion.entry-ingested", async (event) => {
      const p = event.payload;
      this.entries.set(p.entryId, {
        id: p.entryId,
        publicationDate: p.publicationDate,
        department: p.department,
        title: p.title,
        plainTitle: null,
        officialHtmlUrl: p.officialHtmlUrl,
        officialPdfUrl: p.officialPdfUrl,
        shortPhrase: null,
        bulletPoints: null,
        impact: null,
        model: null,
        gobierno: gobiernoDeDisposicion(p.department, p.title),
        lastOfficialUpdateAt: p.lastOfficialUpdateAt,
      });
    });

    eventBus.subscribe<SummaryGenerated>("summarization.summary-generated", async (event) => {
      const p = event.payload;
      const existing = this.entries.get(p.entryId);
      if (!existing) return;
      this.entries.set(p.entryId, {
        ...existing,
        plainTitle: p.plainTitle,
        shortPhrase: p.shortPhrase,
        bulletPoints: p.bulletPoints,
        impact: p.impact,
        model: p.model,
      });
    });
  }

  async listDays(limit: number): Promise<CatalogDayView[]> {
    const byDate = new Map<IsoDate, CatalogEntryView[]>();
    for (const entry of this.entries.values()) {
      const group = byDate.get(entry.publicationDate) ?? [];
      group.push(entry);
      byDate.set(entry.publicationDate, group);
    }
    return [...byDate.entries()]
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .slice(0, limit)
      .map(([date, entries]) => ({ date, entries }));
  }

  async getDay(date: IsoDate): Promise<CatalogDayView | null> {
    const entries = [...this.entries.values()].filter((e) => e.publicationDate === date);
    return entries.length > 0 ? { date, entries } : null;
  }

  async getEntry(id: string): Promise<CatalogEntryView | null> {
    return this.entries.get(id) ?? null;
  }

  async listReferences(): Promise<CatalogReferenceView[]> {
    return [...this.entries.values()]
      .sort((a, b) =>
        a.publicationDate === b.publicationDate
          ? a.id.localeCompare(b.id)
          : a.publicationDate < b.publicationDate
            ? 1
            : -1,
      )
      .map((entry) => ({ id: entry.id, lastOfficialUpdateAt: entry.lastOfficialUpdateAt }));
  }

  async search(params: CatalogSearchParams): Promise<CatalogDayView[]> {
    const limit = params.limit ?? 300;
    const needle = params.query
      ? params.query
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase()
      : "";

    const matched = [...this.entries.values()]
      .filter((entry) => {
        if (params.from && entry.publicationDate < params.from) return false;
        if (params.to && entry.publicationDate > params.to) return false;
        const impact = entry.impact ?? 1;
        if (params.minImpact && params.minImpact > 1 && impact < params.minImpact) return false;
        if (!needle) return true;
        const haystack = [
          entry.id,
          entry.title,
          entry.plainTitle ?? "",
          entry.department,
          entry.shortPhrase ?? "",
          ...(entry.bulletPoints ?? []),
        ]
          .join(" ")
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();
        return haystack.includes(needle);
      })
      .sort((a, b) =>
        a.publicationDate === b.publicationDate
          ? a.id.localeCompare(b.id)
          : a.publicationDate < b.publicationDate
            ? 1
            : -1,
      )
      .slice(0, limit);

    const byDate = new Map<IsoDate, CatalogEntryView[]>();
    for (const entry of matched) {
      const group = byDate.get(entry.publicationDate) ?? [];
      group.push(entry);
      byDate.set(entry.publicationDate, group);
    }

    return [...byDate.entries()]
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, entries]) => ({ date, entries }));
  }
}
