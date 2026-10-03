import { describe, expect, it, vi } from 'vitest';
import { AskBoe } from './ask-boe.js';
import { excerpts } from './context.js';
import type { CatalogEntryView, CatalogReadModel } from '../../catalog/index.js';
import { isoDate } from '../../../shared/domain/iso-date.js';
import type { AssistantModel, AssistantSettings, UsageBudget } from '../domain/assistant.js';

const parsed = isoDate('2026-09-01');
if (!parsed.ok) throw parsed.error;
const entry = { id: 'BOE-A-2026-123', title: 'Ayudas de vivienda', publicationDate: parsed.value, lastOfficialUpdateAt: parsed.value, department: 'Ministerio', plainTitle: 'Ayudas', shortPhrase: 'Nuevas ayudas.', bulletPoints: ['Un plazo de 30 días.'], officialHtmlUrl: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2026-123' } as CatalogEntryView;
/** Ajuste global en memoria: lo mismo que assistant.settings, sin base de datos. */
function memorySettings(initial: string | null = null): AssistantSettings & { by: string | null } {
  let value = initial;
  const settings = { by: null as string | null, model: async () => value, setModel: async (id: string, by: string) => { value = id; settings.by = by; } };
  return settings;
}
function setup() {
  const retrieve = vi.fn().mockResolvedValue([entry]), getEntry = vi.fn().mockResolvedValue(entry);
  const catalog = { retrieve, getEntry } as unknown as CatalogReadModel;
  const answer = vi.fn().mockResolvedValue({ text: 'Hay un plazo de 30 días [1].', tokens: 100 });
  const model: AssistantModel = { id: 'gpt', label: 'GPT', enabled: true, reserveTokens: 6000, answer };
  const budget: UsageBudget = { reserve: vi.fn().mockResolvedValue('reservation'), settle: vi.fn().mockResolvedValue(undefined) };
  const read = vi.fn().mockResolvedValue('Texto oficial: plazo de 30 días.');
  return { ask: new AskBoe(catalog, { read }, [model], 'gpt', budget, memorySettings()), retrieve, getEntry, answer, budget, read, model };
}
describe('asistente: contexto y coste', () => {
  it('en una ficha solo usa ese decreto incluso ante una pregunta ambigua', async () => {
    const s = setup();
    const result = await s.ask.execute('user', { question: '¿A quién afecta?', entryId: entry.id, history: [{ role: 'user', content: 'Antes hablaba de pensiones.' }] });
    expect(s.getEntry).toHaveBeenCalledWith(entry.id); expect(s.retrieve).not.toHaveBeenCalled();
    const context = JSON.parse(s.answer.mock.calls[0]![0]);
    expect(context.scope).toContain('exclusivamente'); expect(context.documents).toHaveLength(1);
    expect(result.sources[0]?.officialUrl).toBe(entry.officialHtmlUrl);
  });
  it('cuenta la consulta sin gastar tokens de IA si no hay resultados', async () => {
    const s = setup(); s.retrieve.mockResolvedValue([]);
    const result = await s.ask.execute('user', { question: 'tema ausente', history: [] });
    expect(result.sources).toEqual([]); expect(s.answer).not.toHaveBeenCalled(); expect(s.budget.reserve).toHaveBeenCalledWith('user', 0, false);
  });
  it('un identificador explícito usa acceso directo en vez de una búsqueda amplia', async () => {
    const s = setup(); await s.ask.execute('user', { question: `Explica ${entry.id}`, history: [] });
    expect(s.getEntry).toHaveBeenCalledWith(entry.id); expect(s.retrieve).not.toHaveBeenCalled();
  });
  it('la fecha solicitada limita los resultados y no arrastra el tema anterior', async () => {
    const s = setup(); await s.ask.execute('user', { question: 'Qué se ha publicado el 2026-09-01', history: [{ role: 'user', content: 'Pensiones' }] });
    expect(s.retrieve).toHaveBeenCalledWith({ query: 'Qué se ha publicado el 2026-09-01', from: parsed.value, to: parsed.value });
  });
  it('reserva antes de llamar al modelo, hace una sola llamada y ajusta la cuota', async () => {
    const s = setup(); await s.ask.execute('user', { question: 'Ayudas de vivienda', history: [] });
    expect(s.answer).toHaveBeenCalledTimes(1);
    expect(vi.mocked(s.budget.reserve).mock.invocationCallOrder[0]).toBeLessThan(s.answer.mock.invocationCallOrder[0]!);
    expect(s.budget.settle).toHaveBeenCalledWith('reservation', expect.any(Number), 100);
    expect(JSON.parse(s.answer.mock.calls[0]![0])).not.toHaveProperty('user');
  });
  it('una cuota agotada impide gastar en OpenAI', async () => {
    const s = setup(); vi.mocked(s.budget.reserve).mockRejectedValue(new Error('agotado'));
    await expect(s.ask.execute('user', { question: 'Ayudas vivienda', history: [] })).rejects.toThrow('agotado');
    expect(s.answer).not.toHaveBeenCalled();
  });
  it('mantiene la reserva tras un timeout y permite una consulta posterior', async () => {
    const s = setup(); s.answer.mockRejectedValueOnce(new Error('timeout'));
    await expect(s.ask.execute('user', { question: 'Ayudas vivienda', history: [] })).rejects.toThrow('timeout');
    expect(s.budget.settle).not.toHaveBeenCalled();
    await expect(s.ask.execute('user', { question: 'Ayudas vivienda', history: [] })).resolves.toHaveProperty('answer');
  });
  it('entrega el borrador conservando la reserva si se desconoce el coste de un repaso cortado', async () => {
    const s = setup();
    s.answer.mockResolvedValueOnce({ text: 'Borrador útil [1].', tokens: 100, usageUncertain: true });
    const result = await s.ask.execute('user', { question: 'Ayudas vivienda', history: [] });
    expect(result.answer).toBe('Borrador útil [1].');
    expect(s.budget.reserve).toHaveBeenCalled();
    expect(s.budget.settle).not.toHaveBeenCalled();
    await expect(s.ask.execute('user', { question: 'Ayudas vivienda', history: [] })).resolves.toHaveProperty('answer');
    expect(s.budget.settle).toHaveBeenCalledTimes(1);
  });
  it('bloquea consultas concurrentes de una misma cuenta', async () => {
    const s = setup(); let finish!: (value: { text: string; tokens: number }) => void;
    s.answer.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
    const first = s.ask.execute('user', { question: 'Ayudas vivienda', history: [] });
    await vi.waitFor(() => expect(s.answer).toHaveBeenCalledTimes(1));
    await expect(s.ask.execute('user', { question: 'Otra pregunta', history: [] })).rejects.toThrow('en curso');
    finish({ text: 'Resultado [1]', tokens: 50 }); await first;
  });
  it('elige fragmentos relevantes y limita los textos enormes', () => {
    const text = ('Información de relleno. '.repeat(2000)) + 'PLAZO ESPECIAL: treinta días para vivienda. ' + ('Otra información. '.repeat(5000));
    const selected = excerpts(text, 'plazo especial vivienda', 3000);
    expect(selected).toContain('PLAZO ESPECIAL'); expect(selected.length).toBeLessThanOrEqual(3000);
  });
});

/**
 * Qué IA responde es un ajuste GLOBAL que solo cambia el administrador, y se
 * guarda: vale para todos los usuarios y sobrevive a reinicios.
 */
describe('asistente: qué IA responde a todos', () => {
  function bot(id: string, enabled = true): AssistantModel {
    return { id, label: id.toUpperCase(), enabled, reserveTokens: 6000, answer: vi.fn().mockResolvedValue({ text: `Desde ${id} [1].`, tokens: 10 }) };
  }
  function setupBots(bots: AssistantModel[], defaultId: string, stored: string | null = null) {
    const catalog = { retrieve: vi.fn().mockResolvedValue([entry]), getEntry: vi.fn().mockResolvedValue(entry) } as unknown as CatalogReadModel;
    const budget: UsageBudget = { reserve: vi.fn().mockResolvedValue('reservation'), settle: vi.fn().mockResolvedValue(undefined) };
    const settings = memorySettings(stored);
    return { ask: new AskBoe(catalog, { read: vi.fn().mockResolvedValue('Texto oficial.') }, bots, defaultId, budget, settings), budget, settings };
  }
  const pregunta = { question: 'ayudas de vivienda', history: [] };

  it('sin elección guardada responde el de partida (BOT_MODEL)', async () => {
    const gpt = bot('gpt'), minimax = bot('minimax');
    const { ask } = setupBots([gpt, minimax], 'minimax');
    await ask.execute('u1', pregunta);
    expect(minimax.answer).toHaveBeenCalled();
    expect(gpt.answer).not.toHaveBeenCalled();
  });

  it('lo que elige el administrador responde a TODOS los usuarios', async () => {
    const gpt = bot('gpt'), minimax = bot('minimax');
    const { ask, settings } = setupBots([gpt, minimax], 'minimax');
    await ask.select('gpt', true, 'Roberto');
    await ask.execute('cliente-cualquiera', pregunta, false);
    expect(gpt.answer).toHaveBeenCalled();
    expect(minimax.answer).not.toHaveBeenCalled();
    expect(settings.by).toBe('Roberto');
  });

  it('la elección guardada manda sobre BOT_MODEL (sobrevive a un reinicio)', async () => {
    const gpt = bot('gpt');
    const { ask } = setupBots([gpt, bot('minimax')], 'minimax', 'gpt');
    await ask.execute('u1', pregunta);
    expect(gpt.answer).toHaveBeenCalled();
  });

  it('un cliente no puede cambiar la IA', async () => {
    const { ask, settings } = setupBots([bot('gpt'), bot('minimax')], 'minimax');
    await expect(ask.select('gpt', false, 'cliente')).rejects.toThrow('Solo el administrador');
    expect(await settings.model()).toBeNull();
  });

  it('no se puede elegir una IA sin clave ni una inexistente', async () => {
    const { ask } = setupBots([bot('gpt', false), bot('minimax')], 'minimax');
    await expect(ask.select('gpt', true, 'Roberto')).rejects.toThrow('no tiene clave');
    await expect(ask.select('inventado', true, 'Roberto')).rejects.toThrow('no está configurado');
  });

  // Una clave retirada no puede dejar el asistente apagado para todos.
  it('si la elegida pierde la clave, responde la primera que la tenga', async () => {
    const minimax = bot('minimax');
    const { ask } = setupBots([bot('gpt', false), minimax], 'gpt', 'gpt');
    await ask.execute('u1', pregunta);
    expect(minimax.answer).toHaveBeenCalled();
  });

  it('sin ninguna IA con clave lo dice en vez de fallar de cualquier manera', async () => {
    const { ask } = setupBots([bot('gpt', false), bot('minimax', false)], 'gpt');
    await expect(ask.execute('u1', pregunta)).rejects.toThrow('en preparación');
  });

  it('SOLO al administrador se le dice qué IA ha respondido', async () => {
    const { ask } = setupBots([bot('gpt'), bot('minimax')], 'minimax');
    const cliente = await ask.execute('u1', pregunta, false);
    // Ni siquiera el campo: un cliente no debe verlo inspeccionando la respuesta.
    expect('model' in cliente).toBe(false);
    expect(JSON.stringify(cliente)).not.toContain('MINIMAX');
    expect((await ask.execute('roberto', pregunta, true)).model).toBe('MINIMAX');
  });

  it('reserva según lo que declara la IA que responde', async () => {
    const caro: AssistantModel = { ...bot('minimax'), reserveTokens: 24_000 };
    const { ask, budget } = setupBots([bot('gpt'), caro], 'minimax');
    await ask.execute('u1', pregunta);
    expect(vi.mocked(budget.reserve).mock.calls[0]![1]).toBeGreaterThan(24_000);
  });

  it('el selector marca la que responde ahora', async () => {
    const { ask } = setupBots([bot('gpt'), bot('minimax')], 'minimax', 'gpt');
    expect(await ask.available()).toEqual([
      { id: 'gpt', label: 'GPT', enabled: true, selected: true },
      { id: 'minimax', label: 'MINIMAX', enabled: true, selected: false },
    ]);
  });
});

describe('asistente: derogación', () => {
  it('sin resultados, a «¿cómo sé si está derogada?» contesta cómo comprobarlo, sin gastar IA', async () => {
    const s = setup();
    s.retrieve.mockResolvedValue([]);
    const answer = await s.ask.execute('u1', { question: '¿Cómo sé si una norma ha sido derogada?', history: [] });

    expect(answer.answer).toContain('Referencias posteriores');
    expect(answer.answer).not.toContain('No he encontrado');
    expect(s.answer).not.toHaveBeenCalled();
  });

  it('sin resultados y sin hablar de derogación, se queda el aviso de siempre', async () => {
    const s = setup();
    s.retrieve.mockResolvedValue([]);
    const answer = await s.ask.execute('u1', { question: 'ayudas para comprar bicicletas', history: [] });

    expect(answer.answer).toContain('No he encontrado');
  });
});
