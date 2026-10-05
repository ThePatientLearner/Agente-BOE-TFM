import { searchTerms, type CatalogEntryView } from '../../catalog/index.js';
import { AssistantError, type ChatRequest, type OfficialTextReader } from '../domain/assistant.js';

const OMITTED = '\n[…]\n';
const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Busca en TODO el documento, también en anexos y artículos finales. */
export function excerpts(text: string, question: string, maximum = 40_000, maximumBytes = 48_000): string {
  if (text.length <= maximum && Buffer.byteLength(text) <= maximumBytes) return text;
  const words = searchTerms(question);
  const article = normalize(question).match(/\b(?:articulo|art\.?)\s+(\d+[a-z]?|unico)\b/)?.[1];
  if (article) {
    const heading = new RegExp(`(?:^|\\n)\\s*Art[ií]culo\\s+${article === 'unico' ? '[uú]nico' : article}\\s*[.\\s]`, 'i');
    const match = heading.exec(text);
    if (match) {
      const start = match.index + match[0].search(/\S/);
      const next = /\n\s*(?:Art[ií]culo\s|Disposici[oó]n\s|ANEXO\b)/i.exec(text.slice(start + match[0].length));
      const end = next ? start + match[0].length + next.index : text.length;
      const section = text.slice(start, end).trim();
      if (section.length <= maximum && Buffer.byteLength(section) <= maximumBytes) return section;
      // Un artículo enorme se busca dentro de ese artículo, sin mezclar otros.
      return excerpts(section, question.replace(/art[ií]culo|art\.?/gi, ''), maximum, maximumBytes);
    }
  }
  const chunks: Array<{ chunk: string; index: number; rank: number }> = [];
  const chunkSize = Math.min(2000, maximum);
  for (let i = 0; i < text.length; i += Math.max(1, Math.floor(chunkSize * 0.85))) {
    const chunk = text.slice(i, i + chunkSize);
    const normalized = normalize(chunk);
    chunks.push({ chunk, index: i, rank: words.reduce((n, w) => n + (normalized.includes(w) ? 1 : 0), 0) });
  }
  const ranked = chunks.sort((a, b) => b.rank - a.rank || a.index - b.index);
  const selected: typeof chunks = [];
  let remaining = maximum;
  let remainingBytes = maximumBytes;
  for (const candidate of ranked) {
    const cost = candidate.chunk.length + (selected.length ? OMITTED.length : 0);
    const bytes = Buffer.byteLength(candidate.chunk) + (selected.length ? Buffer.byteLength(OMITTED) : 0);
    if (cost > remaining || bytes > remainingBytes) continue;
    selected.push(candidate); remaining -= cost; remainingBytes -= bytes;
  }
  return selected.sort((a, b) => a.index - b.index).map(x => x.chunk).join(OMITTED);
}

export async function buildContext(entries: CatalogEntryView[], request: ChatRequest, texts: OfficialTextReader): Promise<string> {
  // El permiso de lectura depende del contexto de ficha, nunca de un ID
  // escrito en la pregunta del menú principal. No se lee ningún otro BOE.
  if (request.entryId && (entries.length !== 1 || entries[0]?.id !== request.entryId)) {
    throw new AssistantError(400, 'La consulta debe referirse únicamente a la disposición abierta.');
  }
  const documents = [];
  for (const [index, entry] of entries.entries()) {
    const raw = request.entryId ? await texts.read(entry.id) : null;
    if (request.entryId && !raw?.trim()) throw new AssistantError(503, 'No se ha podido leer el documento oficial de esta disposición. Inténtalo de nuevo o abre su texto en el BOE.');
    const previous = request.history.filter(t => t.role === 'user').at(-1)?.content ?? '';
    const continuation = /\b(?:esto|eso|esa|ese|sus)\b|^(?:¿\s*)?(?:y\b|qu[eé] (?:plazos|requisitos|excepciones)\b)/i.test(request.question);
    const query = continuation ? `${request.question} ${previous}` : request.question;
    const selected = raw ? excerpts(raw, query) : null;
    documents.push({
      source: index + 1, id: entry.id, date: entry.publicationDate,
      updated: entry.lastOfficialUpdateAt, title: entry.title.slice(0, 450),
      department: entry.department.slice(0, 150),
      summaryByAI: [entry.shortPhrase ?? '', ...(entry.bulletPoints ?? [])].join('\n').slice(0, 1300),
      officialExcerpts: selected,
      officialTextCoverage: raw ? (selected === raw ? 'complete' : 'selected-passages') : 'not-loaded',
    });
  }
  return JSON.stringify({
    mode: request.entryId ? 'entry-document' : 'archive-summaries',
    scope: request.entryId ? `La pregunta se refiere exclusivamente a ${request.entryId}, la disposición abierta. Texto oficial completo si cabe; en documentos extensos, pasajes seleccionados buscando en todo su contenido.` : 'Solo resúmenes de IA del archivo. No se ha leído ningún documento oficial. Para consultar artículos o detalles, hay que abrir la ficha de esa disposición y preguntar allí.',
    documents,
    history: request.history.slice(-4), question: request.question,
  });
}
