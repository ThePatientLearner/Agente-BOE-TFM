import { date, integer, pgSchema, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
const assistantSchema = pgSchema('assistant');
export const assistantUsage = assistantSchema.table('usage', {
  bucket: text('bucket').notNull(), day: date('day').notNull(),
  requests: integer('requests').notNull().default(0), tokens: integer('tokens').notNull().default(0),
  lastRequestAt: timestamp('last_request_at', { withTimezone: true }),
}, t => [primaryKey({ columns: [t.bucket, t.day] })]);
/** Ajustes del asistente que el administrador cambia en caliente (p. ej. qué IA responde). */
export const assistantSettings = assistantSchema.table('settings', {
  key: text('key').primaryKey(), value: text('value').notNull(),
  updatedBy: text('updated_by'), updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
