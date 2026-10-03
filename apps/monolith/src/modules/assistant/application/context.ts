import { searchTerms, type CatalogEntryView } from '../../catalog/index.js';
import type { ChatRequest, OfficialTextReader } from '../domain/assistant.js';

/** Fragmentos elegidos localmente. El documento entero nunca viaja al modelo. */
export function excerpts(text: string, question: string, maximum = 4200): string {
  const words = searchTerms(question);
  const chunks: string[] = [];
  // Se acota también el trabajo local ante disposiciones enormes.
  const bounded = text.slice(0, 300_000);
  for (let i = 0; i < bounded.length; i += 700) chunks.push(bounded.slice(i, i + 950));
  const ranked = chunks.map((chunk, index) => {
    const normalized = chunk.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    return { chunk, index, rank: words.reduce((n, w) => n + (normalized.includes(w) ? 1 : 0), 0) };
  }).sort((a, b) => b.rank - a.rank || a.index - b.index);
  const relevant = ranked.some(x => x.rank > 0) ? ranked.filter(x => x.rank > 0) : ranked;
  // Elegir dentro del presupuesto ANTES de volver al orden del documento:
  // truncar después de ordenar podía eliminar justo el fragmento relevante.
  return relevant.slice(0, Math.max(1, Math.min(5, Math.floor(maximum / 960)))).sort((a, b) => a.index - b.index).map(x => x.chunk).join('\n[…]\n').slice(0, maximum);
}

export async function buildContext(entries: CatalogEntryView[], request: ChatRequest, texts: OfficialTextReader): Promise<string> {
  const documents = [];
  for (const [index, entry] of entries.entries()) {
    const raw = index < 2 ? await texts.read(entry.id) : null;
    documents.push({
      source: index + 1, id: entry.id, date: entry.publicationDate,
      updated: entry.lastOfficialUpdateAt, title: entry.title.slice(0, 450),
      department: entry.department.slice(0, 150),
      summaryByAI: [entry.shortPhrase ?? '', ...(entry.bulletPoints ?? [])].join('\n').slice(0, 1300),
      officialExcerpts: raw ? excerpts(raw, request.question, request.entryId ? 5000 : 2400) : null,
      // Se explicita el alcance: fragmentos, sin pretender ver el texto completo.
    });
  }
  return JSON.stringify({
    scope: request.entryId ? `La pregunta se refiere exclusivamente a ${request.entryId}, la disposición abierta.` : 'Solo documentos encontrados en nuestro archivo; no es el BOE completo ni una consulta de vigencia.',
    documents,
    history: request.history.slice(-4), question: request.question,
  });
}
