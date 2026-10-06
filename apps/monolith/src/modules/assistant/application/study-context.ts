import { AssistantError, type ChatRequest, type Source } from '../domain/assistant.js';
import type { StudyCard, StudyCourse, StudySection } from '../domain/study-course.js';

const COMMON_WORDS = new Set(['que', 'como', 'para', 'con', 'por', 'del', 'las', 'los', 'una', 'uno', 'unos', 'unas', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'son', 'hay', 'tiene', 'tienen', 'puede', 'pueden', 'debe', 'deben', 'mas', 'sin', 'sobre', 'sus', 'entre', 'cuando', 'cual', 'explica', 'explicame', 'ayudame', 'comprender', 'pregunta', 'simulacro', 'ejemplo', 'breve', 'concepto', 'metodo', 'calculo']);
function terms(value: string): string[] {
  return [...new Set(value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])].filter(term => !COMMON_WORDS.has(term));
}
function relevance(card: StudyCard, query: string[]): number {
  const title = terms(card.title).join(' '), text = terms(card.text).join(' ');
  return query.reduce((score, term) => score + (title.includes(term) ? 4 : 0) + (text.includes(term) ? 1 : 0), 0);
}

/** IDs del navegador seleccionan material conocido; no suministran contexto. */
export function buildStudyContext(course: StudyCourse | undefined, request: ChatRequest): { input: string; sources: Source[] } {
  if (!course) throw new AssistantError(503, 'El tutor de electricidad está en preparación. Vuelve a intentarlo más tarde.');
  const topic = request.study!;
  const section = topic.sectionId === 'all' ? undefined : course.sections.find(s => s.id === topic.sectionId);
  if (topic.sectionId !== 'all' && !section) throw new AssistantError(400, 'Ese apartado no existe en el curso.');
  const selected = topic.cardId ? section?.cards.find(c => c.id === topic.cardId) : undefined;
  if (topic.cardId && !selected) throw new AssistantError(400, 'Esa ficha no pertenece al apartado seleccionado.');
  const query = terms(`${request.question} ${request.history.filter(t => t.role === 'user').at(-1)?.content ?? ''}`);
  const candidates: Array<{ section: StudySection; card: StudyCard }> = course.sections.flatMap(s => s.cards.map(card => ({ section: s, card })));
  const priority = ({ card }: { card: StudyCard }) => card === selected ? Number.MAX_SAFE_INTEGER : relevance(card, query);
  const related = candidates.filter(candidate => candidate.section !== section && relevance(candidate.card, query) > 0).sort((a, b) => priority(b) - priority(a));
  // Mantener el tema abierto y sumar hasta dos fundamentos útiles. Así una
  // duda de cálculo desde «Práctica» también dispone de su fórmula del curso.
  const ranked = section
    ? [...candidates.filter(candidate => candidate.section === section).sort((a, b) => priority(b) - priority(a)).slice(0, related.length ? 3 : 5), ...related.slice(0, 2)]
    : candidates.sort((a, b) => priority(b) - priority(a)).slice(0, 5);
  const sources: Source[] = [];
  const documents = ranked.map(({ section: s, card }) => {
    const source = sources.length + 1;
    const url = `/electricidad/#${card.id}`;
    sources.push({ id: `curso-${s.id}-${card.id}`, title: `${s.title} · ${card.title}`, officialUrl: url, summaryUrl: url, publicationDate: '', lastOfficialUpdateAt: course.updatedAt, kind: 'course' });
    return { source, sectionId: s.id, cardId: card.id, title: card.title, relation: s === section ? 'Apartado abierto' : 'Fundamento relacionado del curso', type: 'Apuntes didácticos propios, no texto oficial', text: card.text.slice(0, 3500), references: card.references };
  });
  for (const { card } of ranked) {
    for (const reference of card.references) {
      // El servidor solo publica referencias oficiales conocidas del curso.
      let url: URL;
      try { url = new URL(reference.url); } catch { continue; }
      if (url.protocol !== 'https:' || !['boe.es', 'www.boe.es'].includes(url.hostname) || sources.some(s => s.officialUrl === reference.url) || sources.length >= 8) continue;
      sources.push({ id: `referencia-${sources.length + 1}`, title: reference.label, officialUrl: reference.url, summaryUrl: reference.url, publicationDate: '', lastOfficialUpdateAt: '', kind: 'official' });
    }
  }
  const input = JSON.stringify({
    scope: 'Tutor de estudio de electricidad: explica conceptos y cálculos del material didáctico seleccionado; no certifica vigencia ni habilitación profesional.',
    selectedTopic: section ? { id: section.id, title: section.title, ...(selected ? { cardId: selected.id } : {}) } : { id: 'all', title: 'Curso completo' },
    materialUpdatedAt: course.updatedAt,
    documents,
    sources: sources.map((s, index) => ({ number: index + 1, title: s.title, kind: s.kind, ...(s.kind === 'official' ? { note: 'Enlace de consulta. No se ha aportado extracto oficial ni comprobado su vigencia.' } : {}) })),
    history: request.history,
    question: request.question,
  });
  return { input, sources };
}
