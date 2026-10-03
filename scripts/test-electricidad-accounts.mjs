/** Ejecutar contra una BD desechable electricidad_test_<timestamp>, nunca producción.
 * En la imagen de app: ELECTRICIDAD_MODULE_ROOT=/app/dist ELECTRICIDAD_MIGRATION=/app/drizzle/0005_electricidad_accounts.sql
 * node --input-type=module < scripts/test-electricidad-accounts.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { randomUUID } from 'node:crypto';
const url = process.env.TEST_DATABASE_URL;
if (!url || !/^\/electricidad_test_\d+$/.test(new URL(url).pathname)) throw Error('Se exige una base desechable electricidad_test_<timestamp>');
const root = process.env.ELECTRICIDAD_MODULE_ROOT || resolve('apps/monolith/dist');
const load = path => import(pathToFileURL(resolve(root, path)).href);
const { createDatabase } = await load('shared/db/connection.js');
const { ElectricidadAccounts } = await load('modules/electricidad/index.js');
const { hashPassword, digest } = await load('modules/electricidad/infrastructure/password.js');
const { sql } = await import('drizzle-orm');
const handle = createDatabase(url), db = handle.db, invite = 'test-invite-only', accounts = new ElectricidadAccounts(db, await hashPassword(invite));
const rejected = (call, status) => assert.rejects(call, e => e.status === status);
try {
 const migration = await readFile(process.env.ELECTRICIDAD_MIGRATION || 'apps/monolith/drizzle/0005_electricidad_accounts.sql', 'utf8');
 for (const statement of migration.split('--> statement-breakpoint')) await db.execute(sql.raw(statement));
 const adminId = randomUUID(), hash = await hashPassword('test-admin-password');
 await db.execute(sql`INSERT INTO electricidad.users (id,username,username_key,password_hash,role,status) VALUES (${adminId},'Test Admin','test admin',${hash},'admin','active')`);
 await rejected(() => new ElectricidadAccounts(db).register('Alumno', 'student-password', invite), 503);
 await rejected(() => accounts.register('Alumno', 'student-password', undefined), 403);
 await rejected(() => accounts.register('Alumno', 'student-password', 'incorrect'), 403);
 assert.equal((await db.execute(sql`SELECT id FROM electricidad.users WHERE username_key='alumno'`)).length, 0);
 await rejected(() => accounts.register('Alumno', 'short', invite), 400);
 await accounts.register('Alumno', 'student-password', invite);
 await rejected(() => accounts.register('alumno', 'another-password', invite), 409);
 await rejected(() => accounts.login('Alumno', 'student-password'), 403);
 await rejected(() => accounts.login('Test Admin', 'wrong'), 401);
 const admin = await accounts.login('test admin', 'test-admin-password');
 assert.equal((await accounts.me(admin.token)).role, 'admin');
 const students = await accounts.users(admin.token), student = students.find(u => u.username === 'Alumno');
 assert.equal(student.status, 'pending');
 await accounts.setStatus(admin.token, student.id, 'active');
 let login = await accounts.login('Alumno', 'student-password');
 assert.equal((await accounts.me(login.token)).role, 'student');
 await rejected(() => accounts.users(login.token), 403);
 await rejected(() => accounts.setStatus(login.token, adminId, 'blocked'), 403);
 await rejected(() => accounts.setStatus(admin.token, adminId, 'blocked'), 400);
 await accounts.setStatus(admin.token, student.id, 'blocked');
 await rejected(() => accounts.me(login.token), 401);
 await rejected(() => accounts.login('Alumno', 'student-password'), 403);
 await accounts.setStatus(admin.token, student.id, 'active');
 login = await accounts.login('Alumno', 'student-password');
 await rejected(() => accounts.changePassword(login.token, 'wrong', 'new-student-password'), 401);
 await accounts.changePassword(login.token, 'student-password', 'new-student-password');
 await rejected(() => accounts.me(login.token), 401);
 await rejected(() => accounts.login('Alumno', 'student-password'), 401);
 login = await accounts.login('Alumno', 'new-student-password');
 await db.execute(sql`UPDATE electricidad.sessions SET expires_at=now()-interval '1 minute' WHERE token_hash=${digest(login.token)}`);
 await rejected(() => accounts.me(login.token), 401);
 const fresh = await accounts.login('Test Admin', 'test-admin-password');
 await accounts.logout(fresh.token);
 await rejected(() => accounts.me(fresh.token), 401);
 for (let i=0; i<8; i++) await rejected(() => accounts.login('Unknown', 'wrong'), 401);
 await rejected(() => accounts.login('Unknown', 'wrong'), 429);
 const stored = await db.execute(sql`SELECT password_hash FROM electricidad.users WHERE id=${student.id}`);
 assert.notEqual(stored[0].password_hash, 'new-student-password');
 console.log('PASS: registro, duplicados, aprobación, roles, bloqueo, revocación, cambio de contraseña, caducidad, logout y límite de intentos.');
} finally { await handle.close(); }
