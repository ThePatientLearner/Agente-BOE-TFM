import { afterEach, describe, expect, it, vi } from 'vitest';
import { OpenAiAssistant } from './openai-assistant.js';
afterEach(() => vi.unstubAllGlobals());
describe('contrato OpenAI del bot', () => {
  it('fija el modelo, el razonamiento, el tope y no almacena respuestas', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'Respuesta [1]' }] }], usage: { total_tokens: 50 } }));
    vi.stubGlobal('fetch', fetcher);
    expect(await new OpenAiAssistant('test-only').answer('context')).toEqual({ text: 'Respuesta [1]', tokens: 50 });
    const body = JSON.parse(fetcher.mock.calls[0]![1].body);
    expect(body).toMatchObject({ model: 'gpt-6-luna', reasoning: { effort: 'high' }, max_output_tokens: 2048, store: false });
    expect(body.tools).toBeUndefined(); expect(body.previous_response_id).toBeUndefined();
  });
  it('no reintenta respuestas incompletas que agotan el presupuesto', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ status: 'incomplete', output: [], usage: { total_tokens: 2048 } }));
    vi.stubGlobal('fetch', fetcher);
    await expect(new OpenAiAssistant('test-only').answer('context')).rejects.toThrow('límite');
    expect(fetcher).toHaveBeenCalledTimes(1);
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
