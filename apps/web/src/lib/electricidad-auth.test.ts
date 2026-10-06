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
  it('inserta el tutor privado después de comprobar el permiso de estudio', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user: { id: 'uuid', username: 'Alumno', role: 'student', studyAccess: true } })));
    mocks.readFile.mockImplementation(async (path: string) => path.endsWith('.css') ? '.tutor{}' : path.endsWith('.js') ? 'window.ElectricidadTutor={};' : '<html><head></head><body><header class="header"></header></body></html>');
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidad');
    const body = await r.text();
    expect(body).toContain('<style>.tutor{}</style>');
    expect(body).toContain('<script>window.ElectricidadTutor={};</script>');
    expect(mocks.readFile.mock.calls.every(([path]) => String(path).includes('/private/'))).toBe(true);
    expect(r.headers.get('X-Robots-Tag')).toContain('noindex');
  });
  it.each([
    { username: 'Roberto', role: 'admin', controls: true },
    { username: 'roberto', role: 'admin', controls: true },
    { username: 'Guille', role: 'student', controls: false },
    { username: 'Roberto', role: 'student', controls: false },
    { username: 'Otro admin', role: 'admin', controls: false },
  ])('solo la sesión de Roberto administrador habilita el selector del tutor: %j', async user => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => Response.json({ user: { id: 'uuid', ...user, studyAccess: true } })));
    mocks.readFile.mockImplementation(async (path: string) => path.endsWith('index.html') ? '<html><head></head><body><header class="header"></header></body></html>' : '');
    for (const section of ['electricidad', 'electricidadTest'] as const) {
      const response = await serveElectricidad(new NextRequest(`https://agenteboe.com/${section}`, { headers: { Cookie: 'electricidad_session=abc' } }), section);
      expect(response.status).toBe(200);
      const body = await response.text();
      if (user.controls) expect(body).toContain('data-tutor-admin="true"');
      else expect(body).not.toContain('data-tutor-admin="true"');
    }
  });
  it('una cuenta del bot no recibe el curso y dispone de una salida para cambiar de cuenta', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => Response.json({ user: { id: 'uuid', username: 'Lector', role: 'student', studyAccess: false } })));
    for (const section of ['electricidad', 'electricidadTest'] as const) {
      for (const path of [[], ['index.html']]) {
        const r = await serveElectricidad(new NextRequest(`https://agenteboe.com/${section}`, { headers: { Cookie: 'electricidad_session=abc' } }), section, path);
        expect(r.status).toBe(403);
        const body = await r.text();
        expect(body).toContain('Lector');
        expect(body).toContain('href="/electricidad/cuenta"');
        expect(body).not.toContain('study-tutor-panel');
        expect(mocks.readFile).not.toHaveBeenCalled();
      }
    }
  });
  it('deja gestionar la propia sesión sin autorizar el curso ni cargar el tutor', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user: { id: 'uuid', username: 'Lector', role: 'student', studyAccess: false } })));
    mocks.readFile.mockResolvedValue('__DESTINATION__ __ACCOUNT_VIEW__');
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad/cuenta', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidad', ['cuenta']);
    expect(r.status).toBe(200);
    expect(await r.text()).toBe('/electricidad true');
    expect(mocks.readFile).toHaveBeenCalledTimes(1);
    expect(mocks.readFile.mock.calls[0][0]).toContain('electricidad-account.html');
    expect(r.headers.get('cache-control')).toContain('no-store');
  });
  it('escapa el nombre de la sesión en el aviso de acceso', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user: { id: 'uuid', username: '<img src=x onerror=alert(1)>', role: 'student', studyAccess: false } })));
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidad', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidad');
    const body = await r.text();
    expect(body).toContain('&lt;img');
    expect(body).not.toContain('<img');
  });
  it('falla cerrado si una API antigua no informa del permiso del cuaderno', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ user: { id: 'uuid', username: 'Lector', role: 'student' } })));
    const r = await serveElectricidad(new NextRequest('https://agenteboe.com/electricidadTest', { headers: { Cookie: 'electricidad_session=abc' } }), 'electricidadTest');
    expect(r.status).toBe(403); expect(mocks.readFile).not.toHaveBeenCalled();
  });
});
