import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenAiAssistant } from './openai-assistant.js';
afterEach(() => vi.unstubAllGlobals());
describe('contrato OpenAI del bot', () => {
  it('fija el modelo, el razonamiento, el tope y no almacena respuestas', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Respuesta [1]' }] }], usage: { total_tokens: 50 } }));
    vi.stubGlobal('fetch', fetcher);
    expect(await new OpenAiAssistant('test-only').answer('context')).toEqual({ text: 'Respuesta [1]', tokens: 50 });
    const body = JSON.parse(fetcher.mock.calls[0]![1].body);
    expect(body).toMatchObject({ model: 'gpt-6-luna', reasoning: { effort: 'high' }, max_output_tokens: 4096, store: false });
    expect(new OpenAiAssistant('test-only').reserveTokens).toBeGreaterThanOrEqual(body.max_output_tokens);
    expect(body.tools).toBeUndefined(); expect(body.previous_response_id).toBeUndefined();
  });
  it('no reintenta respuestas incompletas que agotan el presupuesto', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ status: 'incomplete', output: [], usage: { total_tokens: 2048 } }));
    vi.stubGlobal('fetch', fetcher);
    await expect(new OpenAiAssistant('test-only').answer('context')).rejects.toMatchObject({ status: 503, detail: 'OpenAI incomplete: unknown' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it('registra el motivo de una respuesta sin texto sin incluir preguntas, claves ni razonamiento', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [{ type: 'reasoning', content: [{ type: 'output_text', text: 'Razonamiento privado' }] }], usage: { total_tokens: 4096, output_tokens_details: { reasoning_tokens: 4096 } } })));
    const diagnostic = vi.fn();
    await expect(new OpenAiAssistant('clave-privada', diagnostic).answer('pregunta-privada')).rejects.toMatchObject({ status: 503, detail: 'OpenAI incomplete: max_output_tokens' });
    expect(diagnostic).toHaveBeenCalledWith({ model: 'gpt-6-luna', httpStatus: 200, status: 'incomplete', incompleteReason: 'max_output_tokens', hasAnswer: false, tokens: 4096, reasoningTokens: 4096, durationMs: expect.any(Number) });
    expect(JSON.stringify(diagnostic.mock.calls)).not.toMatch(/clave-privada|pregunta-privada|Razonamiento privado/);
  });
  it('el diagnóstico distingue un rechazo HTTP del proveedor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    await expect(new OpenAiAssistant('test-only').answer('context')).rejects.toMatchObject({ status: 503, detail: 'OpenAI HTTP 503' });
  });
  it('la señal del plazo común cancela la petición al proveedor', async () => {
    const controller = new AbortController();
    const fetcher = vi.fn((_url: string, init: RequestInit) => new Promise((_resolve, reject) => {
      init.signal!.addEventListener('abort', () => reject(init.signal!.reason), { once: true });
    }));
    vi.stubGlobal('fetch', fetcher);
    const pending = new OpenAiAssistant('test-only').answer('context', undefined, controller.signal);
    controller.abort(new Error('plazo agotado'));
    await expect(pending).rejects.toThrow('plazo agotado');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
