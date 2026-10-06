import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildTfmDemoServer, DEMO_USERNAME, DEMO_PASSWORD } from './tfm-server.js';

afterEach(() => vi.unstubAllGlobals());
describe('demo TFM aislada', () => {
  it('recorre catálogo, sesión de alumno, bot y tutor sin red ni privilegios de administración', async () => {
    const network = vi.fn(() => { throw new Error('La demo no debe salir a Internet'); });
    vi.stubGlobal('fetch', network);
    const app = buildTfmDemoServer();
    try {
      expect((await app.inject('/api/tfm-demo')).json()).toMatchObject({ storage: 'memory', provider: 'simulated', externalCalls: false });
      expect((await app.inject('/api/days')).json()[0].entries).toHaveLength(2);
      expect((await app.inject({ method: 'POST', url: '/api/assistant', payload: { question: 'procedimiento', history: [] } })).statusCode).toBe(401);
      const login = await app.inject({ method: 'POST', url: '/api/account/login', payload: { username: DEMO_USERNAME, password: DEMO_PASSWORD } });
      expect(login.statusCode).toBe(200);
      expect(login.json().user).toMatchObject({ role: 'student', status: 'active', studyAccess: true });
      const headers = { authorization: `Bearer ${login.json().token}` };
      expect((await app.inject({ url: '/api/electricidad/me', headers })).json().user.studyAccess).toBe(true);
      expect((await app.inject({ url: '/api/electricidad/users', headers })).statusCode).toBe(403);
      expect((await app.inject({ url: '/api/assistant/models', headers })).statusCode).toBe(403);
      const bot = await app.inject({ method: 'POST', url: '/api/assistant', headers, payload: { question: 'procedimiento', history: [] } });
      expect(bot.statusCode).toBe(200);
      expect(bot.json().answer).toContain('respuesta simulada');
      expect(bot.json().sources[0].officialUrl).toBe('https://www.boe.es/buscar/doc.php?id=BOE-A-2015-10565');
      const tutor = await app.inject({ method: 'POST', url: '/api/assistant', headers, payload: { question: 'Explica la ley de Ohm', history: [], study: { sectionId: 'fund', cardId: 'ohm' } } });
      expect(tutor.statusCode).toBe(200);
      expect(tutor.json().answer).toContain('respuesta simulada');
      expect(tutor.json().sources[0].kind).toBe('course');
      await app.inject({ method: 'POST', url: '/api/account/logout', headers });
      expect((await app.inject({ url: '/api/account/me', headers })).statusCode).toBe(401);
      expect(network).not.toHaveBeenCalled();
    } finally { await app.close(); }
  });

  it('rechaza contraseñas incorrectas, desactiva registros y no comparte sesiones entre instancias', async () => {
    const first = buildTfmDemoServer(), second = buildTfmDemoServer();
    try {
      expect((await first.inject({ method: 'POST', url: '/api/account/register', payload: { username: 'intruso', password: 'no-es-valida', code: 'cualquiera' } })).statusCode).toBe(403);
      expect((await first.inject({ method: 'POST', url: '/api/account/login', payload: { username: DEMO_USERNAME, password: 'incorrecta' } })).statusCode).toBe(401);
      const login = await first.inject({ method: 'POST', url: '/api/account/login', payload: { username: DEMO_USERNAME, password: DEMO_PASSWORD } });
      expect((await second.inject({ url: '/api/account/me', headers: { authorization: `Bearer ${login.json().token}` } })).statusCode).toBe(401);
    } finally { await first.close(); await second.close(); }
  });

  it('responde desde ambas fichas con fragmentos originales locales y límites explícitos sin consultar la red', async () => {
    const network = vi.fn(() => { throw new Error('No debe descargar el texto oficial en la demo'); });
    vi.stubGlobal('fetch', network);
    const app = buildTfmDemoServer();
    try {
      const login = await app.inject({ method: 'POST', url: '/api/account/login', payload: { username: DEMO_USERNAME, password: DEMO_PASSWORD } });
      for (const id of ['BOE-A-2015-10565', 'BOE-A-2015-10566']) {
        const response = await app.inject({ method: 'POST', url: '/api/assistant', headers: { authorization: `Bearer ${login.json().token}` }, payload: { question: 'Explica esta ley', entryId: id, history: [] } });
        expect(response.statusCode).toBe(200);
        expect(response.json().answer).toContain('respuesta simulada');
        expect(response.json().answer).toContain('Artículo 1. Objeto');
        expect(response.json().answer).toContain('2015-10-02');
        expect(response.json().answer).toContain('no la ley completa');
        expect(response.json().sources[0].officialUrl).toBe(`https://www.boe.es/buscar/doc.php?id=${id}`);
        expect(response.json().contextEntryId).toBe(id);
      }
      expect(network).not.toHaveBeenCalled();
    } finally { await app.close(); }
  });
});
