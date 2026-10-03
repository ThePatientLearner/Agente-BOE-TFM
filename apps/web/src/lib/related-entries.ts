import type { CatalogEntry } from "./api";

const STOP_WORDS = new Set("para como sobre entre desde hasta mediante durante nuevo nueva nuevos nuevas esta este estos estas aprueba aprobado orden real decreto resolucion ministerio espana estado gobierno septiembre enero febrero marzo abril mayo junio julio agosto octubre noviembre diciembre".split(" "));
function terms(entry: CatalogEntry) {
  return new Set(`${entry.plainTitle ?? entry.title} ${entry.shortPhrase ?? ""}`
    .normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    .split(/[^a-z0-9]+/).filter((word) => word.length > 4 && !STOP_WORDS.has(word)));
}

/** Afinidad de texto y departamento; sin IA, consultas nuevas ni selección manual. */
export function relatedEntries(current: CatalogEntry, candidates: CatalogEntry[], limit = 3): CatalogEntry[] {
  const currentTerms = terms(current);
  const unique = [...new Map(candidates.map((entry) => [entry.id, entry])).values()];
  return unique.filter((entry) => entry.id !== current.id).map((entry) => ({
    entry,
    score: [...terms(entry)].filter((term) => currentTerms.has(term)).length * 2
      + (current.department === entry.department ? 1 : 0),
  })).filter(({ score }) => score >= 2)
    .sort((a, b) => b.score - a.score || b.entry.publicationDate.localeCompare(a.entry.publicationDate) || a.entry.id.localeCompare(b.entry.id))
    .slice(0, limit).map(({ entry }) => entry);
}
