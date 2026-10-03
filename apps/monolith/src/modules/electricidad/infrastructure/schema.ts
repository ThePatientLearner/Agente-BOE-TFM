import { sql } from 'drizzle-orm';
import { pgSchema, uuid, text, timestamp, integer, boolean, index, check } from 'drizzle-orm/pg-core';
const schema = pgSchema('electricidad');
export const users = schema.table('users', {
  id: uuid('id').primaryKey(), username: text('username').notNull(),
  usernameKey: text('username_key').notNull().unique(), passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('student'), status: text('status').notNull().default('pending'),
  studyAccess: boolean('study_access').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [check('users_role_check', sql`${t.role} IN ('admin','student')`), check('users_status_check', sql`${t.status} IN ('pending','active','blocked')`)]);
export const sessions = schema.table('sessions', {
  tokenHash: text('token_hash').primaryKey(), userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
}, t => [index('electricidad_sessions_user').on(t.userId)]);
export const limits = schema.table('limits', {
  key: text('key').primaryKey(), hits: integer('hits').notNull(), expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});
