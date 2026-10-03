/** Alta inicial por stdin: no incluye contraseñas en Git ni en argumentos. */
import { randomUUID } from 'node:crypto';
import { sql } from 'drizzle-orm';
import { createDatabase } from '../shared/db/connection.js';
import { hashPassword } from '../modules/electricidad/infrastructure/password.js';
const name = process.argv[2];
if (!name || !process.env.DATABASE_URL) throw Error('Indica usuario y DATABASE_URL');
let password = '';
for await (const chunk of process.stdin) password += chunk.toString();
password = password.replace(/\r?\n$/, '');
if (!password || password.length > 128) throw Error('Contraseña inválida');
const database = createDatabase(process.env.DATABASE_URL);
try {
  const hash = await hashPassword(password);
  const rows = await database.db.execute(sql`INSERT INTO electricidad.users (id,username,username_key,password_hash,role,status) VALUES (${randomUUID()},${name},${name.toLowerCase()},${hash},'admin','active') ON CONFLICT (username_key) DO NOTHING RETURNING id`);
  console.log(rows.length ? 'Administrador creado.' : 'El usuario ya existe; no se ha modificado.');
} finally { await database.close(); }
