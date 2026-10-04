import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PgDialect } from 'drizzle-orm/pg-core';
import type { SQL } from 'drizzle-orm';
import type { Database } from '../../../shared/db/connection.js';
import { AccountError } from '../accounts.js';
import { ElectricidadAccounts } from './accounts.js';
import { hashPassword } from './password.js';

const code = 'Invitación de prueba';
const password = 'Una cuenta de prueba 2026!';
let codeHash: string;
beforeAll(async () => { codeHash = await hashPassword(code); });
function database() {
  const execute = vi.fn(async (_query: SQL) => [{ hits: 1, id: 'test-account' }]);
  return { db: { execute } as unknown as Database, execute };
}

describe('contraseña de registro del BoeBot', () => {
  it('sin configuración mantiene cerrado el registro sin escribir datos', async () => {
    const { db, execute } = database();
    await expect(new ElectricidadAccounts(db).registerPublic('Invitado', password, code)).rejects.toMatchObject({ status: 503 });
    expect(execute).not.toHaveBeenCalled();
  });

  it.each([undefined, '', 'incorrecta', 123, 'x'.repeat(129), code.toLowerCase()])('no crea una cuenta con una clave ausente o incorrecta', async offered => {
    const { db, execute } = database();
    await expect(new ElectricidadAccounts(db, '', codeHash).registerPublic('Invitado', password, offered)).rejects.toMatchObject({ status: 403 });
    // Solo se incrementa el contador de intentos; nunca se inserta un usuario.
    expect(execute).toHaveBeenCalledTimes(1);
    expect(new PgDialect().sqlToQuery(execute.mock.calls[0]![0]).sql).toContain('electricidad.limits');
  });

  it('una clave correcta permite crear una cuenta con contraseña propia y sin acceso al cuaderno', async () => {
    const { db, execute } = database();
    await new ElectricidadAccounts(db, '', codeHash).registerPublic('Invitado', password, code);
    expect(execute).toHaveBeenCalledTimes(3);
    const insert = new PgDialect().sqlToQuery(execute.mock.calls[2]![0]);
    expect(insert.sql).toContain("'active', false");
    expect(insert.params).not.toContain(code);
    expect(insert.params).not.toContain(password);
  });

  it('limita los intentos antes de verificar la clave y de crear la cuenta', async () => {
    const { db, execute } = database();
    execute.mockResolvedValue([{ hits: 21, id: '' }]);
    await expect(new ElectricidadAccounts(db, '', codeHash).registerPublic('Invitado', password, code)).rejects.toMatchObject({ status: 429 });
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('sigue exigiendo una contraseña personal válida aunque se conozca la clave', async () => {
    const { db, execute } = database();
    await expect(new ElectricidadAccounts(db, '', codeHash).registerPublic('Invitado', '123', code)).rejects.toBeInstanceOf(AccountError);
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
