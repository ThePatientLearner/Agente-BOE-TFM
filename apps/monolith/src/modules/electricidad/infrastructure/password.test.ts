import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword, digest } from './password.js';
describe('contraseñas de electricidad', () => {
  it('usa una sal distinta y solo acepta la contraseña correcta', async () => {
    const a = await hashPassword('contraseña de prueba'), b = await hashPassword('contraseña de prueba');
    expect(a).not.toBe(b);
    expect(a).not.toContain('contraseña');
    expect(await verifyPassword('contraseña de prueba', a)).toBe(true);
    expect(await verifyPassword('otra', a)).toBe(false);
    expect(await verifyPassword('otra', 'malformado')).toBe(false);
    expect(digest('sesión')).not.toBe('sesión');
  });
});
