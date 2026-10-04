import type { FastifyInstance, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression } from 'fastify';
import type { Logger } from '../shared/logger/logger.js';
import { AccountError, type Accounts } from '../modules/electricidad/index.js';

export function registerElectricidad(app: FastifyInstance<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, Logger>, accounts: Accounts) {
  for (const area of ['electricidad', 'account']) app.route<{ Params: { action: string }; Body: Record<string, unknown> }>({
    method: ['GET', 'POST'], url: `/api/${area}/:action`, bodyLimit: 4096,
    handler: async (req, reply) => {
      reply.header('Cache-Control', 'private, no-store').header('X-Robots-Tag', 'noindex, nofollow, noarchive');
      const token = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
      const body = req.body ?? {};
      try {
        if (req.method === 'GET') {
          if (req.params.action === 'me') return { user: await accounts.me(token) };
          if (area === 'electricidad' && req.params.action === 'users') return { users: await accounts.users(token) };
        } else {
          switch (req.params.action) {
            case 'register':
              if (area === 'account') { await accounts.registerPublic(body.username, body.password, body.code); return { message: 'Cuenta creada. Ya puedes entrar al asistente BOE.' }; }
              await accounts.register(body.username, body.password, body.code); return { message: 'Cuenta creada. Roberto debe aprobarla antes de que puedas entrar.' };
            case 'login': return await accounts.login(body.username, body.password);
            case 'logout': await accounts.logout(token); return { ok: true };
            case 'password': await accounts.changePassword(token, body.current, body.password); return { ok: true };
            case 'status': if (area !== 'electricidad') break; await accounts.setStatus(token, body.id, body.status); return { ok: true };
          }
        }
        return reply.status(404).send({ error: 'No encontrado.' });
      } catch (error) {
        if (error instanceof AccountError) return reply.status(error.status).send({ error: error.message });
        // No registrar cuerpos de petición ni contraseñas.
        req.log.error({ error: error instanceof Error ? error.name : 'Error' }, 'Fallo en cuentas de electricidad');
        return reply.status(503).send({ error: 'El acceso no está disponible. Inténtalo más tarde.' });
      }
    },
  });
}
