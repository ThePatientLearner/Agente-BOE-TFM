import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
afterEach(() => vi.unstubAllGlobals());
function request(origin = 'https://agenteboe.com', cookie = '') {
  return new NextRequest('https://agenteboe.com/api/assistant', { method: 'POST', headers: { Origin: origin, Cookie: cookie, 'Content-Type': 'application/json' }, body: JSON.stringify({ question: '¿A quién afecta?', entryId: 'BOE-A-2026-123' }) });
}
describe('proxy del bot', () => {
  it('bloquea otros orígenes y consultas sin cuenta antes de llamar al VPS', async () => {
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    expect((await POST(request('https://otro.example', 'electricidad_session=token'))).status).toBe(403);
    expect((await POST(request())).status).toBe(401);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('transmite la cookie como Bearer solo al VPS y evita caché', async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json({ answer: 'Texto [1]', sources: [] })); vi.stubGlobal('fetch', fetcher);
    const response = await POST(request('https://agenteboe.com', 'electricidad_session=token'));
    expect(fetcher.mock.calls[0]![1].headers.Authorization).toBe('Bearer token');
    expect(JSON.parse(fetcher.mock.calls[0]![1].body).entryId).toBe('BOE-A-2026-123');
    expect(await response.json()).toEqual({ answer: 'Texto [1]', sources: [] });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
