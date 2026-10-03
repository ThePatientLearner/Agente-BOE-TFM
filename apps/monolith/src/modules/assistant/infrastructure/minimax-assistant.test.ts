/**
 * MiniMax devuelve 529 "overloaded" a menudo (medido: 2 de 3 llamadas
 * seguidas contra la API real). Sin reintento el bot es inservible, así que
 * esto fija que reintenta, que no reintenta lo que no debe, y que el motivo
 * llega al log sin llegar al cliente.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AssistantError } from '../domain/assistant.js';
import { MinimaxAssistant } from './minimax-assistant.js';

const options = { apiKey: 'k', baseUrl: 'https://api.minimax.io/v1', model: 'MiniMax-M3' };

function respuestas(...items: Array<number | { text: string; tokens?: number }>) {
  const fetchMock = vi.fn(async () => {
    const next = items.shift() ?? 500;
    if (typeof next === 'number') {
      return new Response(JSON.stringify({ error: { type: 'overloaded_error' }, request_id: 'abc123' }), { status: next });
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: next.text } }],
      ...(next.tokens === undefined ? {} : { usage: { total_tokens: next.tokens } }),
    }), { status: 200 });
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('MinimaxAssistant', () => {
  it('sin clave no se habilita y no aparece en el selector', () => {
    expect(new MinimaxAssistant({ ...options, apiKey: undefined }).enabled).toBe(false);
  });

  it('el selector muestra el modelo configurado', () => {
    expect(new MinimaxAssistant(options).label).toBe('MiniMax · MiniMax-M3');
  });

  it('responde y devuelve los tokens que informa el proveedor', async () => {
    respuestas({ text: 'Hay un plazo de 30 días [1].', tokens: 1046 });
    const result = await new MinimaxAssistant(options).answer('contexto');

    expect(result).toEqual({ text: 'Hay un plazo de 30 días [1].', tokens: 1046 });
  });

  it('reintenta un 529 y acaba respondiendo', async () => {
    const fetchMock = respuestas(529, 529, { text: 'Respuesta buena.', tokens: 10 });
    const result = await new MinimaxAssistant(options).answer('contexto');

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.text).toBe('Respuesta buena.');
  });

  it('agotados los reintentos, falla con un mensaje que no delata nada', async () => {
    respuestas(529, 529, 529);
    await expect(new MinimaxAssistant(options).answer('c')).rejects.toThrow('Inténtalo más tarde');
  });

  // Reintentar un 401 solo gastaría tiempo: la clave no se arregla esperando.
  it('no reintenta lo que no es un bache del proveedor', async () => {
    const fetchMock = respuestas(401);
    await expect(new MinimaxAssistant(options).answer('c')).rejects.toThrow(AssistantError);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('el motivo real va al log, nunca al cliente', async () => {
    respuestas(401);
    try {
      await new MinimaxAssistant(options).answer('c');
      expect.unreachable();
    } catch (error) {
      const e = error as AssistantError;
      expect(e.message).not.toContain('401');
      expect(e.detail).toContain('HTTP 401');
      // El request_id de MiniMax es lo único con lo que se les puede reclamar.
      expect(e.detail).toContain('abc123');
    }
  });

  it('un corte de red se reintenta igual que un 529', async () => {
    let call = 0;
    const fetchMock = vi.fn(async () => {
      if (++call === 1) throw new Error('fetch failed');
      return new Response(JSON.stringify({ choices: [{ message: { content: 'Vale.' } }], usage: { total_tokens: 5 } }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);
    const result = await new MinimaxAssistant(options).answer('c');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.text).toBe('Vale.');
    expect(result.usageUncertain).toBe(true);
  });

  it('cancelar una llamada pendiente impide reintentos que excedan el plazo del chat', async () => {
    const controller = new AbortController();
    const fetchMock = vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal!.addEventListener('abort', () => reject(init.signal!.reason), { once: true });
    }));
    vi.stubGlobal('fetch', fetchMock);
    const pending = new MinimaxAssistant(options).answer('c', undefined, controller.signal);
    controller.abort(new Error('plazo agotado'));
    await expect(pending).rejects.toThrow('Inténtalo más tarde');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('cancelar durante la espera de reintento no abre otra petición', async () => {
    const controller = new AbortController();
    const fetchMock = respuestas(529, { text: 'No debe pedirse.' });
    const pending = new MinimaxAssistant(options).answer('c', undefined, controller.signal);
    // Da tiempo a leer el 529 e iniciar la espera de 800 ms.
    await new Promise(resolve => setTimeout(resolve, 10));
    controller.abort(new Error('plazo agotado'));
    await expect(pending).rejects.toThrow('Inténtalo más tarde');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('una respuesta vacía no se entrega como si fuera válida', async () => {
    respuestas({ text: '   ' });
    await expect(new MinimaxAssistant(options).answer('c')).rejects.toThrow('más concreta');
  });

  // Quedarse corto gastaría presupuesto que nadie cuenta y la cuota diaria
  // dejaría de ser cierta, así que sin `usage` se estima POR ENCIMA.
  it('sin usage estima los tokens por encima en vez de darlos por cero', async () => {
    respuestas({ text: 'x'.repeat(100) });
    const result = await new MinimaxAssistant(options).answer('y'.repeat(100));

    expect(result.tokens).toBe(100);
  });
});
