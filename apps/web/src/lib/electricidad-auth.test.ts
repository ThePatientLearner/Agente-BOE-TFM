import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { serveElectricidad } from './electricidad-auth';
const mocks = vi.hoisted(() => ({ readFile: vi.fn() }));
vi.mock('node:fs/promises', () => ({ readFile: mocks.readFile }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe('acceso al HTML de electricidad', () => {
  it('sin cookie solo sirve la pantalla de acceso, incluso index.html', async () => {
    mocks.readFile.mockResolvedValue('__DESTINATION__ __ACCOUNT_VIEW__');
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad/index.html'), 'electricidad', ['index.html']);
    expect(mocks.readFile.mock.calls[0][0]).toContain('electricidad-account.html');
    expect(await r.text()).toBe('/electricidad false');
    expect(r.headers.get('cache-control')).toContain('no-store');
  });
  it('no sirve contenido si el backend no puede validar la sesión', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidad');
    expect(r.status).toBe(503); expect(mocks.readFile).not.toHaveBeenCalled();
  });
  it('rechaza rutas arbitrarias', async () => {
    expect((await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad/no'), 'electricidad', ['no'])).status).toBe(404);
    expect(mocks.readFile).not.toHaveBeenCalled();
  });
  it('separa el progreso por cuenta y escapa el nombre', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user: { id: 'uuid', username: '<b>Alumno</b>', role: 'student', studyAccess: true } })));
    mocks.readFile.mockResolvedValue("<header class=\"header\">KEY='ibtb-secciones-v3'</body>");
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidad');
    const body = await r.text();expect(body).toContain("KEY='ibtb-secciones-v3:uuid'");expect(body).toContain('&lt;b&gt;Alumno');
  });
  it('una cuenta del bot nunca recibe HTML privado ni siquiera en /cuenta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => Response.json({ user: { id: 'uuid', username: 'Lector', role: 'student', studyAccess: false } })));
    for (const path of [[], ['index.html'], ['cuenta']]) {
      const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidad', path);
      expect(r.status).toBe(403);
      expect(mocks.readFile).not.toHaveBeenCalled();
    }
  });
  it('falla cerrado si una API antigua no informa del permiso del cuaderno', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user: { id: 'uuid', username: 'Lector', role: 'student' } })));
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidadTest', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidadTest');
    expect(r.status).toBe(403); expect(mocks.readFile).not.toHaveBeenCalled();
  });
});
