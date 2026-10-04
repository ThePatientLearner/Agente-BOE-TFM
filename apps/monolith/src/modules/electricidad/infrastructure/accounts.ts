import { randomBytes, randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import type { Database } from '../../../shared/db/connection.js';
import { AccountError, type Account, type Accounts } from '../accounts.js';
import { passwordProblem } from '../password-policy.js';
import { digest, hashPassword, verifyPassword } from './password.js';

function username(value: unknown): string {
  if (typeof value !== 'string' || !/^[\p{L}\p{N}_ .-]{3,40}$/u.test(value.trim())) throw new AccountError(400, 'Usuario: entre 3 y 40 letras, números, espacios, guiones o puntos.');
  return value.trim();
}
/**
 * Para ENTRAR. Solo comprueba que haya algo: la exigencia de seguridad se
 * aplica al elegir contraseña, no al usarla, o subirla dejaría fuera a quien
 * ya tiene cuenta.
 */
function password(value: unknown, minimum = 8): string {
  if (typeof value !== 'string' || value.length < minimum || value.length > 128) throw new AccountError(400, `La contraseña debe tener entre ${minimum} y 128 caracteres.`);
  return value;
}
/** Para ELEGIR contraseña, al registrarse o al cambiarla. */
function newPassword(value: unknown, user?: string): string {
  const problem = passwordProblem(value, user);
  if (problem) throw new AccountError(400, problem);
  return value as string;
}
const publicUser = (row: Record<string, unknown>): Account => ({ id: String(row.id), username: String(row.username), role: row.role as Account['role'], status: row.status as Account['status'], studyAccess: row.role === 'admin' || row.study_access === true });

/** Cuentas independientes del BOE: solo utiliza el esquema electricidad. */
export class ElectricidadAccounts implements Accounts {
  constructor(private db: Database, private registrationCodeHash = '', private botRegistrationCodeHash = '') {}

  // Un contador atómico persistente impide eludir el límite reiniciando el proceso.
  private async limit(key: string, maximum: number, seconds = 900) {
    const rows = await this.db.execute(sql`INSERT INTO electricidad.limits (key, hits, expires_at)
      VALUES (${digest(key)}, 1, now() + ${seconds} * interval '1 second')
      ON CONFLICT (key) DO UPDATE SET hits = CASE WHEN electricidad.limits.expires_at < now() THEN 1 ELSE electricidad.limits.hits + 1 END,
      expires_at = CASE WHEN electricidad.limits.expires_at < now() THEN now() + ${seconds} * interval '1 second' ELSE electricidad.limits.expires_at END RETURNING hits`);
    if (Number(rows[0]?.hits) > maximum) throw new AccountError(429, `Demasiados intentos. Espera ${Math.ceil(seconds / 60)} minutos antes de volver a intentarlo.`);
  }
  async register(name: unknown, offered: unknown, code: unknown) {
    if (!this.registrationCodeHash) throw new AccountError(503, 'El registro no está disponible temporalmente.');
    await this.limit('registration-code', 20);
    if (typeof code !== 'string' || code.length > 128 || !await verifyPassword(code, this.registrationCodeHash)) throw new AccountError(403, 'El código de registro no es correcto.');
    const display = username(name), secret = newPassword(offered, String(name ?? ''));
    await this.limit('registration', 20);
    const hash = await hashPassword(secret);
    const rows = await this.db.execute(sql`INSERT INTO electricidad.users (id, username, username_key, password_hash)
      VALUES (${randomUUID()}, ${display}, ${display.toLowerCase()}, ${hash}) ON CONFLICT (username_key) DO NOTHING RETURNING id`);
    if (!rows.length) throw new AccountError(409, 'Ese nombre de usuario ya está registrado.');
  }
  async login(name: unknown, offered: unknown) {
    const key = username(name).toLowerCase(), secret = password(offered, 1);
    await this.limit('login-global', 100);
    await this.limit('login:' + key, 8);
    const rows = await this.db.execute(sql`SELECT * FROM electricidad.users WHERE username_key = ${key}`);
    const row = rows[0];
    // Ejecuta scrypt también si la cuenta no existe.
    const hash = row?.password_hash ? String(row.password_hash) : '00000000000000000000000000000000:' + '0'.repeat(128);
    if (!await verifyPassword(secret, hash) || !row) throw new AccountError(401, 'Usuario o contraseña incorrectos.');
    if (row.status !== 'active') throw new AccountError(403, row.status === 'pending' ? 'Tu cuenta está pendiente de aprobación por Roberto.' : 'Esta cuenta está bloqueada.');
    const token = randomBytes(32).toString('hex');
    await this.db.execute(sql`DELETE FROM electricidad.sessions WHERE expires_at < now()`);
    await this.db.execute(sql`DELETE FROM electricidad.limits WHERE expires_at < now()`);
    await this.db.transaction(async tx => {
      // Serializa el alta de sesión con bloqueos y cambios de contraseña.
      const current = await tx.execute(sql`SELECT id FROM electricidad.users WHERE id=${row.id} AND password_hash=${hash} AND status='active' FOR UPDATE`);
      if (!current.length) throw new AccountError(401, 'La cuenta ha cambiado. Vuelve a iniciar sesión.');
      await tx.execute(sql`INSERT INTO electricidad.sessions (token_hash,user_id,expires_at) VALUES (${digest(token)},${row.id},now()+interval '7 days')`);
    });
    return { token, user: publicUser(row) };
  }
  async registerPublic(name: unknown, offered: unknown, code: unknown) {
    if (!this.botRegistrationCodeHash) throw new AccountError(503, 'El registro no está disponible temporalmente.');
    // Validar también las llamadas directas a la API, antes de crear la cuenta.
    await this.limit('public-registration-code', 20, 3600);
    if (typeof code !== 'string' || code.length > 128 || !await verifyPassword(code, this.botRegistrationCodeHash)) throw new AccountError(403, 'La contraseña de registro no es correcta.');
    const display = username(name), secret = newPassword(offered, String(name ?? ''));
    // Comparte identidad y sesiones; el alta pública nunca concede el cuaderno.
    await this.limit('public-registration', 20, 3600);
    const hash = await hashPassword(secret);
    const rows = await this.db.execute(sql`INSERT INTO electricidad.users (id, username, username_key, password_hash, status, study_access)
      VALUES (${randomUUID()}, ${display}, ${display.toLowerCase()}, ${hash}, 'active', false)
      ON CONFLICT (username_key) DO NOTHING RETURNING id`);
    if (!rows.length) throw new AccountError(409, 'Ese nombre ya existe. Puedes entrar con tu cuenta actual.');
  }
  async me(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) throw new AccountError(401, 'Inicia sesión para continuar.');
    const rows = await this.db.execute(sql`SELECT u.id,u.username,u.role,u.status,u.study_access FROM electricidad.users u JOIN electricidad.sessions s ON s.user_id=u.id WHERE s.token_hash=${digest(token)} AND s.expires_at>now() AND u.status='active'`);
    if (!rows[0]) throw new AccountError(401, 'Tu sesión ha caducado. Vuelve a entrar.');
    return publicUser(rows[0]);
  }
  async logout(token: string) { await this.db.execute(sql`DELETE FROM electricidad.sessions WHERE token_hash=${digest(token)}`); }
  async changePassword(token: string, current: unknown, next: unknown) {
    const user = await this.me(token), old = password(current, 1);
    const secret = newPassword(next, user.username);
    // Una contraseña nueva idéntica a la anterior no es un cambio: quien la
    // cambia suele hacerlo porque cree que la ha comprometido.
    if (typeof next === 'string' && next === old) throw new AccountError(400, 'La contraseña nueva tiene que ser distinta de la actual.');
    await this.limit('password:' + user.id, 8);
    const rows = await this.db.execute(sql`SELECT password_hash FROM electricidad.users WHERE id=${user.id}`);
    if (!await verifyPassword(old, String(rows[0]?.password_hash))) throw new AccountError(401, 'La contraseña actual no es correcta.');
    const hash = await hashPassword(secret);
    await this.db.transaction(async tx => {
      await tx.execute(sql`UPDATE electricidad.users SET password_hash=${hash} WHERE id=${user.id}`);
      await tx.execute(sql`DELETE FROM electricidad.sessions WHERE user_id=${user.id}`);
    });
  }
  async users(token: string) {
    const user = await this.me(token);
    if (user.role !== 'admin') throw new AccountError(403, 'Acceso reservado al administrador.');
    const rows = await this.db.execute(sql`SELECT id,username,role,status,study_access FROM electricidad.users ORDER BY created_at DESC LIMIT 500`);
    return rows.map(publicUser);
  }
  async setStatus(token: string, id: unknown, status: unknown) {
    const user = await this.me(token);
    if (user.role !== 'admin') throw new AccountError(403, 'Acceso reservado al administrador.');
    if (typeof id !== 'string' || !/^[a-f0-9-]{36}$/.test(id) || !['active','blocked'].includes(String(status))) throw new AccountError(400, 'Cambio de estado inválido.');
    await this.db.transaction(async tx => {
      const rows = await tx.execute(sql`UPDATE electricidad.users SET status=${status}, study_access=${status === 'active'} WHERE id=${id} AND role='student' RETURNING id`);
      if (!rows.length) throw new AccountError(400, 'No se puede modificar esa cuenta.');
      await tx.execute(sql`DELETE FROM electricidad.sessions WHERE user_id=${id}`);
    });
  }
}
