/**
 * Los repasos tienen que mejorar la respuesta SIN poder dejar al cliente sin
 * ella. Estos tests fijan las dos mitades de esa frase.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AssistantModel } from '../domain/assistant.js';
import { ReviewedAssistant } from './reviewed-assistant.js';

function inner(answers: Array<{ text: string; tokens: number } | Error>): AssistantModel & { answer: ReturnType<typeof vi.fn> } {
  let call = 0;
  const answer = vi.fn(async () => {
    const next = answers[Math.min(call++, answers.length - 1)]!;
    if (next instanceof Error) throw next;
    return next;
  });
  return { id: 'gpt', label: 'GPT', enabled: true, reserveTokens: 6000, answer };
}

const largo = (texto: string) => texto.padEnd(60, ' .');
afterEach(() => vi.useRealTimers());

describe('ReviewedAssistant', () => {
  it('redacta y repasa dos veces: tres llamadas en total', async () => {
    const model = inner([
      { text: largo('Borrador'), tokens: 100 },
      { text: largo('Repaso uno'), tokens: 50 },
      { text: largo('Repaso dos'), tokens: 40 },
    ]);
    const result = await new ReviewedAssistant(model, 2).answer('contexto');

    expect(model.answer).toHaveBeenCalledTimes(3);
    expect(result.text).toContain('Repaso dos');
  });

  it('suma los tokens de las tres pasadas: es lo que el proveedor factura', async () => {
    const model = inner([
      { text: largo('Borrador'), tokens: 100 },
      { text: largo('Repaso uno'), tokens: 50 },
      { text: largo('Repaso dos'), tokens: 40 },
    ]);
    const result = await new ReviewedAssistant(model, 2).answer('contexto');

    expect(result.tokens).toBe(190);
  });

  it('reserva presupuesto para las tres pasadas, no para una', () => {
    expect(new ReviewedAssistant(inner([{ text: largo('x'), tokens: 1 }]), 2).reserveTokens).toBe(18_000);
  });

  it('si un repaso falla, entrega el borrador en vez de dejar al cliente sin nada', async () => {
    const model = inner([{ text: largo('Borrador'), tokens: 100 }, new Error('503')]);
    const result = await new ReviewedAssistant(model, 2).answer('contexto');

    expect(result.text).toContain('Borrador');
    expect(result.tokens).toBe(100);
  });

  // Un borrador que falla NO se puede tragar: sin él no hay respuesta ninguna.
  it('si falla la redacción, propaga el error', async () => {
    const model = inner([new Error('no hay modelo')]);

    await expect(new ReviewedAssistant(model, 2).answer('contexto')).rejects.toThrow('no hay modelo');
  });

  it('un repaso que devuelve algo vacío o ridículo no sustituye a la respuesta buena', async () => {
    const model = inner([{ text: largo('Borrador bueno'), tokens: 100 }, { text: 'ok', tokens: 5 }]);
    const result = await new ReviewedAssistant(model, 2).answer('contexto');

    expect(result.text).toContain('Borrador bueno');
    // Pero los tokens del repaso se cobran: el proveedor ya los ha facturado.
    expect(result.tokens).toBe(110);
  });

  it('con el plazo agotado se entrega lo que haya en vez de hacer esperar más', async () => {
    const model = inner([{ text: largo('Borrador'), tokens: 100 }, { text: largo('Repaso'), tokens: 50 }]);
    // Plazo de 0 ms: ni el primer repaso cabe.
    const result = await new ReviewedAssistant(model, 2, 0).answer('contexto');

    expect(model.answer).toHaveBeenCalledTimes(1);
    expect(result.text).toContain('Borrador');
  });

  it('con 0 repasos contesta a la primera', async () => {
    const model = inner([{ text: largo('Borrador'), tokens: 100 }]);
    await new ReviewedAssistant(model, 0).answer('contexto');

    expect(model.answer).toHaveBeenCalledTimes(1);
  });

  it('con cero repasos también limita la redacción para que no desborde el proxy web', async () => {
    vi.useFakeTimers();
    const model = inner([{ text: largo('Borrador'), tokens: 100 }]);
    model.answer.mockImplementation(() => new Promise(() => {}));
    const pending = new ReviewedAssistant(model, 0, 10_000).answer('contexto');
    const failed = expect(pending).rejects.toThrow('Plazo de la consulta agotado');
    await vi.advanceTimersByTimeAsync(10_000);
    await failed;
    expect(model.answer).toHaveBeenCalledTimes(1);
  });

  it('corta un repaso lento al plazo total y entrega la mejor versión disponible', async () => {
    vi.useFakeTimers();
    const model = inner([{ text: largo('Borrador'), tokens: 100 }]);
    let reviewSignal!: AbortSignal;
    model.answer.mockImplementationOnce(async () => ({ text: largo('Borrador'), tokens: 100 }))
      .mockImplementationOnce(async () => ({ text: largo('Repaso bueno'), tokens: 50 }))
      // El adaptador simula un proveedor que no atiende la cancelación.
      .mockImplementationOnce((_input: string, _instructions: string, signal: AbortSignal) => {
        reviewSignal = signal;
        return new Promise(() => {});
      });
    let delivered = false;
    const pending = new ReviewedAssistant(model, 2, 10_000).answer('contexto').then(result => {
      delivered = true;
      return result;
    });
    await vi.advanceTimersByTimeAsync(9_999);
    expect(delivered).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(await pending).toEqual({ text: largo('Repaso bueno'), tokens: 150, usageUncertain: true });
    expect(reviewSignal.aborted).toBe(true);
    expect(model.answer).toHaveBeenCalledTimes(3);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('si la primera llamada no acaba, también respeta el plazo y libera el temporizador', async () => {
    vi.useFakeTimers();
    const model = inner([{ text: largo('Borrador'), tokens: 100 }]);
    model.answer.mockImplementation(() => new Promise(() => {}));
    const pending = new ReviewedAssistant(model, 2, 10_000).answer('contexto');
    const failed = expect(pending).rejects.toThrow('Plazo de la consulta agotado');
    await vi.advanceTimersByTimeAsync(10_000);
    await failed;
    expect(model.answer).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('una cancelación anterior no inicia ninguna llamada al proveedor', async () => {
    const model = inner([{ text: largo('Borrador'), tokens: 100 }]);
    const controller = new AbortController();
    controller.abort(new Error('cancelada'));
    await expect(new ReviewedAssistant(model).answer('contexto', undefined, controller.signal)).rejects.toThrow('cancelada');
    expect(model.answer).not.toHaveBeenCalled();
  });

  it('el repaso usa instrucciones propias, no las del asistente', async () => {
    const model = inner([{ text: largo('Borrador'), tokens: 100 }, { text: largo('Repaso'), tokens: 50 }]);
    await new ReviewedAssistant(model, 1).answer('contexto', 'INSTRUCCIONES DEL ASISTENTE');

    expect(model.answer.mock.calls[0]![1]).toBe('INSTRUCCIONES DEL ASISTENTE');
    expect(model.answer.mock.calls[1]![1]).toContain('Revisas la respuesta');
  });

  it('el repaso conserva pregunta y fuentes como objeto y no como JSON doblemente escapado', async () => {
    const context = { question: '¿A quién afecta?', documents: [{ source: 1, officialExcerpts: 'Personas con discapacidad.' }], history: [] };
    const model = inner([{ text: largo('Borrador [1]'), tokens: 100 }, { text: largo('Respuesta [1]'), tokens: 50 }]);
    await new ReviewedAssistant(model, 1).answer(JSON.stringify(context));
    const review = JSON.parse(model.answer.mock.calls[1]![0]);
    expect(review.contexto).toEqual(context);
    expect(review.respuestaARevisar).toContain('Borrador [1]');
  });

  // El selector del administrador elige MODELO; que se repase o no es política
  // del servicio. Si el decorador cambiara el id, el selector no lo encontraría.
  it('conserva la identidad del modelo que envuelve', () => {
    const wrapped = new ReviewedAssistant(inner([{ text: largo('x'), tokens: 1 }]), 2);

    expect(wrapped.id).toBe('gpt');
    expect(wrapped.label).toBe('GPT');
    expect(wrapped.enabled).toBe(true);
  });
});
