import { describe, expect, it, vi } from 'vitest';
import { AskBoe } from './ask-boe.js';
import { buildStudyContext } from './study-context.js';
import { ELECTRICIDAD_TUTOR_INSTRUCTIONS, type StudyCourse } from '../domain/study-course.js';
import type { AssistantModel, UsageBudget } from '../domain/assistant.js';
import type { CatalogReadModel } from '../../catalog/index.js';

const course: StudyCourse = { updatedAt: '2026-09-28', sections: [
  { id: 'fund', title: 'Fundamentos', cards: [
    { id: 'ohm', title: 'Ley de Ohm', text: 'U = R · I. Tensión en V, resistencia en Ω e intensidad en A.', references: [{ label: 'REBT', url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2002-18099' }, { label: 'No oficial', url: 'https://ejemplo.invalid' }] },
    { id: 'potencia', title: 'Potencia', text: 'P = U · I en continua; se mide en W.', references: [] },
  ] },
  { id: 'bt25', title: 'Circuitos de vivienda', cards: [{ id: 'vivienda', title: 'C1 alumbrado', text: 'Material de circuitos de vivienda.', references: [] }] },
] };
const request = { question: 'Explica Ohm con un ejemplo', history: [], study: { sectionId: 'fund', cardId: 'ohm' } };

describe('contexto de electricidad seleccionado en servidor', () => {
  it('prioriza la ficha abierta, aporta contenido curado y diferencia fuentes de apuntes y enlaces oficiales', () => {
    const result = buildStudyContext(course, request);
    const context = JSON.parse(result.input);
    expect(context.selectedTopic).toEqual({ id: 'fund', title: 'Fundamentos', cardId: 'ohm' });
    expect(context.documents[0]).toMatchObject({ cardId: 'ohm', text: expect.stringContaining('U = R · I') });
    expect(context.documents.every((document: { sectionId: string }) => document.sectionId === 'fund')).toBe(true);
    expect(result.sources[0]).toMatchObject({ kind: 'course', officialUrl: '/electricidad/#ohm' });
    expect(result.sources.at(-1)).toMatchObject({ kind: 'official', lastOfficialUpdateAt: '', publicationDate: '' });
    expect(result.sources.some(source => source.officialUrl.includes('ejemplo.invalid'))).toBe(false);
    expect(context.sources.at(-1).note).toContain('No se ha aportado extracto oficial');
  });

  it('para consultas generales busca fichas pertinentes en todo el curso', () => {
    const result = buildStudyContext(course, { ...request, question: 'Circuitos de vivienda C1 alumbrado', study: { sectionId: 'all' } });
    expect(JSON.parse(result.input).documents[0].cardId).toBe('vivienda');
  });

  it('una pregunta de práctica conserva el tema abierto y aporta un fundamento relacionado con su fuente', () => {
    const material: StudyCourse = { ...course, sections: [...course.sections, { id: 'pract', title: 'Práctica', cards: [{ id: 'repasar', title: 'Revisión de errores', text: 'Compara tu cálculo con el ejemplo y repasa.', references: [] }] }] };
    const result = buildStudyContext(material, { ...request, question: 'Ayúdame a comprender esta pregunta del simulacro: tensión, resistencia y ley de Ohm.', study: { sectionId: 'pract' } });
    const context = JSON.parse(result.input);
    expect(context.documents[0]).toMatchObject({ sectionId: 'pract', relation: 'Apartado abierto' });
    expect(context.documents.some((document: { cardId: string; relation: string }) => document.cardId === 'ohm' && document.relation === 'Fundamento relacionado del curso')).toBe(true);
    expect(result.sources.some(source => source.officialUrl === '/electricidad/#ohm')).toBe(true);
    expect(context.documents.length).toBeLessThanOrEqual(5);
  });

  it.each([{ sectionId: 'inventado' }, { sectionId: 'fund', cardId: 'vivienda' }, { sectionId: 'all', cardId: 'ohm' }])('no permite escoger material ajeno al apartado: %j', study => {
    expect(() => buildStudyContext(course, { ...request, study })).toThrow();
  });

  it('limita material y enlaces sin devolver un curso entero al proveedor', () => {
    const enormous: StudyCourse = { updatedAt: '', sections: [{ id: 'fund', title: 'Grande', cards: Array.from({ length: 100 }, (_, i) => ({ id: `c${i}`, title: 'Ficha', text: 'x'.repeat(100_000), references: [] })) }] };
    const result = buildStudyContext(enormous, { ...request, study: { sectionId: 'fund' } });
    expect(JSON.parse(result.input).documents).toHaveLength(5);
    expect(Buffer.byteLength(result.input)).toBeLessThan(32_000);
  });
});

function setup() {
  const retrieve = vi.fn(), getEntry = vi.fn(), read = vi.fn();
  const answer = vi.fn().mockResolvedValue({ text: 'Si R = 10 Ω e I = 2 A, U = 20 V [1].', tokens: 120 });
  const model: AssistantModel = { id: 'gpt', label: 'GPT', enabled: true, reserveTokens: 6000, answer };
  const budget: UsageBudget = { reserve: vi.fn().mockResolvedValue('r1'), settle: vi.fn().mockResolvedValue(undefined) };
  const ask = new AskBoe({ retrieve, getEntry } as unknown as CatalogReadModel, { read }, [model], 'gpt', budget, { model: async () => null, setModel: async () => {} }, course);
  return { ask, retrieve, getEntry, read, answer, budget };
}
describe('caso de uso tutor', () => {
  it('vuelve a exigir acceso al curso fuera de HTTP, antes de usar IA o cuota', async () => {
    const s = setup();
    await expect(s.ask.execute('público', request)).rejects.toMatchObject({ status: 403 });
    expect(s.answer).not.toHaveBeenCalled();
    expect(s.budget.reserve).not.toHaveBeenCalled();
  });

  it('explica desde el curso sin buscar disposiciones y reserva la consulta antes de llamar al modelo', async () => {
    const s = setup();
    const result = await s.ask.execute('alumno', request, false, true);
    expect(s.retrieve).not.toHaveBeenCalled();
    expect(s.getEntry).not.toHaveBeenCalled();
    expect(s.read).not.toHaveBeenCalled();
    expect(s.answer).toHaveBeenCalledWith(expect.stringContaining('U = R · I'), ELECTRICIDAD_TUTOR_INSTRUCTIONS);
    expect(vi.mocked(s.budget.reserve).mock.invocationCallOrder[0]).toBeLessThan(s.answer.mock.invocationCallOrder[0]!);
    expect(s.budget.settle).toHaveBeenCalledWith('r1', expect.any(Number), 120);
    expect(result.sources[0]?.kind).toBe('course');
    expect(result).not.toHaveProperty('model');
  });

  it('permite al administrador y conserva el nombre de IA solo para él', async () => {
    const s = setup();
    expect((await s.ask.execute('admin', request, true)).model).toBe('GPT');
  });

  it('un ID de ficha inválido no consume cuota ni IA', async () => {
    const s = setup();
    await expect(s.ask.execute('alumno', { ...request, study: { sectionId: 'fund', cardId: 'noexiste' } }, false, true)).rejects.toMatchObject({ status: 400 });
    expect(s.budget.reserve).not.toHaveBeenCalled();
    expect(s.answer).not.toHaveBeenCalled();
  });

  it('conserva la reserva si la respuesta consume tokens inciertos', async () => {
    const s = setup();
    s.answer.mockResolvedValueOnce({ text: 'Borrador', tokens: 100, usageUncertain: true });
    await s.ask.execute('alumno', request, false, true);
    expect(s.budget.settle).not.toHaveBeenCalled();
    await s.ask.execute('alumno', request, false, true);
    expect(s.budget.settle).toHaveBeenCalledTimes(1);
  });
});
