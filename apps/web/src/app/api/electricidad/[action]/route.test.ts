import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
afterEach(() => vi.unstubAllGlobals());
const context = { params: Promise.resolve({ action: 'login' }) };
describe('proxy de acceso', () => {
  it('rechaza peticiones de otro origen sin llamar a la API', async () => {
    const fetcher = vi.fn();vi.stubGlobal('fetch', fetcher);
    const r = await POST(new NextRequest('https://agenteboe.com/api/electricidad/login', { method: 'POST', headers: { Origin: 'https://otro.example', 'Content-Type': 'application/json' }, body: '{}' }), context);
    expect(r.status).toBe(403);expect(fetcher).not.toHaveBeenCalled();
  });
  it('guarda la sesión en HttpOnly y no devuelve el token al JS', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ token: 'secret-session', user: { username: 'Alumno' } })));
    const r = await POST(new NextRequest('https://agenteboe.com/api/electricidad/login', { method: 'POST', headers: { Origin: 'https://agenteboe.com', 'Content-Type': 'application/json' }, body: '{}' }), context);
    expect(await r.json()).toEqual({ user: { username: 'Alumno' } });
    expect(r.headers.get('set-cookie')).toContain('HttpOnly');expect(r.headers.get('set-cookie')).toContain('SameSite=strict');
  });
});
