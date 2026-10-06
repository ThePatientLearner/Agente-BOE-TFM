import type { FastifyInstance, RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression } from 'fastify';
import { z } from 'zod';
import type { Logger } from '../shared/logger/logger.js';
import { AccountError, type Accounts } from '../modules/electricidad/index.js';
import { AssistantError, type AskBoe } from '../modules/assistant/index.js';

const requestSchema = z.object({
  question: z.string().trim().min(2).max(800),
  entryId: z.string().regex(/^BOE-[A-Z]-\d{4}-\d{1,6}$/).optional(),
  history: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1000) })).max(4).default([]),
  study: z.object({ sectionId: z.string().regex(/^[a-z0-9_-]{1,64}$/), cardId: z.string().regex(/^[a-z0-9_-]{1,64}$/).optional() }).strict().optional(),
}).refine(value => !value.study || !value.entryId);
export function registerAssistant(app: FastifyInstance<RawServerDefault, RawRequestDefaultExpression, RawReplyDefaultExpression, Logger>, accounts: Accounts, assistant: AskBoe) {
  const canSelectModel = (user: { role: string; username: string }) => user.role === 'admin' && user.username.trim().toLowerCase() === 'roberto';
  // Qué bots hay configurados. SOLO para Roberto administrador: a un cliente no le
  // incumbe con qué modelo se le contesta, y la lista delata la infraestructura.
  app.get('/api/assistant/models', async (req, reply) => {
    reply.header('Cache-Control', 'private, no-store');
    try {
      const token = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
      const user = await accounts.me(token);
      if (!canSelectModel(user)) return reply.status(403).send({ error: 'No disponible.' });
      return { models: await assistant.available() };
    } catch (error) {
      if (error instanceof AssistantError || error instanceof AccountError) return reply.status(error.status).send({ error: error.message });
      return reply.status(503).send({ error: 'No disponible ahora.' });
    }
  });

  // Cambia la IA de toda la aplicación. Solo Roberto, comprobado contra
  // la sesión validada y otra vez dentro de `AskBoe.select`.
  app.post('/api/assistant/model', { bodyLimit: 1024 }, async (req, reply) => {
    reply.header('Cache-Control', 'private, no-store');
    try {
      const token = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
      const user = await accounts.me(token);
      if (!canSelectModel(user)) return reply.status(403).send({ error: 'No disponible.' });
      const parsed = z.object({ model: z.string().trim().min(1).max(40) }).safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ error: 'Indica qué IA usar.' });
      await assistant.select(parsed.data.model, true, user.username);
      req.log.info({ model: parsed.data.model, by: user.username }, 'IA del asistente cambiada para toda la aplicación');
      return { models: await assistant.available() };
    } catch (error) {
      if (error instanceof AssistantError || error instanceof AccountError) return reply.status(error.status).send({ error: error.message });
      return reply.status(503).send({ error: 'No se ha podido guardar. Inténtalo de nuevo.' });
    }
  });

  app.post('/api/assistant', { bodyLimit: 12_288 }, async (req, reply) => {
    reply.header('Cache-Control', 'private, no-store');
    try {
      const token = req.headers.authorization?.replace(/^Bearer /, '') ?? '';
      const user = await accounts.me(token);
      const parsed = requestSchema.safeParse(req.body);
      if (!parsed.success) return reply.status(400).send({ error: 'Escribe una pregunta de 2 a 800 caracteres.' });
      if (parsed.data.study && user.role !== 'admin' && user.studyAccess !== true) return reply.status(403).send({ error: 'Necesitas acceso aprobado al curso para usar el tutor de electricidad.' });
      // El privilegio procede de la sesión validada, nunca del cuerpo enviado.
      // Qué IA responde no se decide aquí: es el ajuste global del administrador.
      return await assistant.execute(user.id, parsed.data, user.role === 'admin', user.studyAccess === true);
    } catch (error) {
      if (error instanceof AssistantError || error instanceof AccountError) {
        // Un 503 del asistente suele venir del proveedor y antes no dejaba
        // rastro: se devolvía al cliente y se perdía. Sin esto, diagnosticar
        // "el bot no responde" obligaba a reproducirlo a mano.
        if (error instanceof AssistantError && error.detail) req.log.warn({ detail: error.detail }, 'El proveedor del asistente ha fallado');
        return reply.status(error.status).send({ error: error.message });
      }
      req.log.error({ error: error instanceof Error ? error.name : 'Error' }, 'Fallo del asistente BOE');
      return reply.status(503).send({ error: 'El asistente no está disponible ahora. Inténtalo más tarde.' });
    }
  });
}
