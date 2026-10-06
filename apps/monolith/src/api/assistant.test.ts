import Fastify from 'fastify';
import { pino } from 'pino';
import { describe, expect, it, vi } from 'vitest';
import { AccountError, type Accounts } from '../modules/electricidad/index.js';
import type { AskBoe } from '../modules/assistant/index.js';
import { registerAssistant } from './assistant.js';

function setup(user: { role: 'admin' | 'user'; studyAccess: boolean } = { role: 'user', studyAccess: true }) {
  const me = vi.fn().mockResolvedValue({ id: 'u1', username: 'Alumno', ...user });
  const execute = vi.fn().mockResolvedValue({ answer: 'U = R · I.', sources: [] });
  const available = vi.fn().mockResolvedValue([{ id: 'minimax', enabled: true, selected: true }]);
  const select = vi.fn().mockResolvedValue(undefined);
  const app = Fastify({ loggerInstance: pino({ level: 'silent' }) });
  registerAssistant(app, { me } as unknown as Accounts, { execute, available, select } as unknown as AskBoe);
  return { app, me, execute, available, select };
}
const payload = { question: 'Explica la ley de Ohm', history: [], study: { sectionId: 'fund', cardId: 'ohm' } };

describe('tutor de electricidad por HTTP', () => {
  it('exige una sesión y no gasta IA si falta', async () => {
    const s = setup();
    s.me.mockRejectedValue(new AccountError(401, 'Inicia sesión.'));
    try {
      expect((await s.app.inject({ method: 'POST', url: '/api/assistant', payload })).statusCode).toBe(401);
      expect(s.execute).not.toHaveBeenCalled();
    } finally { await s.app.close(); }
  });

  it('una cuenta pública no puede activar el tutor ni suplantar permisos en el cuerpo', async () => {
    const s = setup({ role: 'user', studyAccess: false });
    try {
      const response = await s.app.inject({ method: 'POST', url: '/api/assistant', payload: { ...payload, studyAccess: true, role: 'admin' } });
      expect(response.statusCode).toBe(403);
      expect(response.headers['cache-control']).toBe('private, no-store');
      expect(s.execute).not.toHaveBeenCalled();
    } finally { await s.app.close(); }
  });

  it.each([{ role: 'user' as const, studyAccess: true }, { role: 'admin' as const, studyAccess: false }])('admite una cuenta autorizada y usa permisos de la sesión: %j', async user => {
    const s = setup(user);
    try {
      const response = await s.app.inject({ method: 'POST', url: '/api/assistant', headers: { authorization: 'Bearer token' }, payload });
      expect(response.statusCode).toBe(200);
      expect(s.me).toHaveBeenCalledWith('token');
      expect(s.execute).toHaveBeenCalledWith('u1', payload, user.role === 'admin', user.studyAccess);
    } finally { await s.app.close(); }
  });

  it.each([
    { ...payload, study: { sectionId: '../privado' } },
    { ...payload, study: { sectionId: 'fund', material: 'Contexto inventado por el cliente' } },
    { ...payload, study: { sectionId: 'fund', cardId: 'a'.repeat(65) } },
    { ...payload, entryId: 'BOE-A-2002-18099' },
    { ...payload, question: 'a'.repeat(801) },
    { ...payload, history: Array.from({ length: 5 }, () => ({ role: 'user', content: 'Más contexto' })) },
  ])('rechaza un contexto o una consulta no válidos', async body => {
    const s = setup();
    try {
      expect((await s.app.inject({ method: 'POST', url: '/api/assistant', payload: body })).statusCode).toBe(400);
      expect(s.execute).not.toHaveBeenCalled();
    } finally { await s.app.close(); }
  });

  it('conserva el bot público para usuarios sin acceso al curso', async () => {
    const s = setup({ role: 'user', studyAccess: false });
    try {
      expect((await s.app.inject({ method: 'POST', url: '/api/assistant', payload: { question: 'Ayudas de vivienda', history: [] } })).statusCode).toBe(200);
      expect(s.execute).toHaveBeenCalledWith('u1', { question: 'Ayudas de vivienda', history: [] }, false, false);
    } finally { await s.app.close(); }
  });
});

describe('selección global del modelo reservada a Roberto', () => {
  it.each([
    { username: 'Roberto', role: 'admin', allowed: true },
    { username: 'roberto', role: 'admin', allowed: true },
    { username: 'Guille', role: 'student', allowed: false },
    { username: 'Roberto', role: 'student', allowed: false },
    { username: 'Otro admin', role: 'admin', allowed: false },
  ])('aplica la identidad y el rol de la sesión: %j', async user => {
    const s = setup();
    s.me.mockResolvedValue({ id: 'u1', username: user.username, role: user.role, studyAccess: true });
    try {
      const list = await s.app.inject({ method: 'GET', url: '/api/assistant/models', headers: { authorization: 'Bearer token' } });
      expect(list.statusCode).toBe(user.allowed ? 200 : 403);
      const change = await s.app.inject({ method: 'POST', url: '/api/assistant/model', headers: { authorization: 'Bearer token' }, payload: { model: 'gpt', username: 'Roberto', role: 'admin' } });
      expect(change.statusCode).toBe(user.allowed ? 200 : 403);
      if (user.allowed) expect(s.select).toHaveBeenCalledWith('gpt', true, user.username);
      else { expect(s.select).not.toHaveBeenCalled(); expect(s.available).not.toHaveBeenCalled(); }
    } finally { await s.app.close(); }
  });

  it('una sesión caducada no puede consultar ni cambiar el modelo', async () => {
    const s = setup();
    s.me.mockRejectedValue(new AccountError(401, 'Inicia sesión.'));
    try {
      expect((await s.app.inject({ method: 'GET', url: '/api/assistant/models' })).statusCode).toBe(401);
      expect((await s.app.inject({ method: 'POST', url: '/api/assistant/model', payload: { model: 'gpt' } })).statusCode).toBe(401);
      expect(s.select).not.toHaveBeenCalled(); expect(s.available).not.toHaveBeenCalled();
    } finally { await s.app.close(); }
  });
});
