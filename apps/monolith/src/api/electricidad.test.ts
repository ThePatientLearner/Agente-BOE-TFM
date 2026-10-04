import Fastify from 'fastify';
import { pino } from 'pino';
import { describe, expect, it, vi } from 'vitest';
import { AccountError, type Accounts } from '../modules/electricidad/index.js';
import { registerElectricidad } from './electricidad.js';

describe('registro de cuentas por HTTP', () => {
  it('envía la clave de registro al caso de uso y devuelve su rechazo al cliente', async () => {
    const registerPublic = vi.fn().mockRejectedValue(new AccountError(403, 'La contraseña de registro no es correcta.'));
    const app = Fastify({ loggerInstance: pino({ level: 'silent' }) });
    registerElectricidad(app, { registerPublic } as unknown as Accounts);
    try {
      const response = await app.inject({ method: 'POST', url: '/api/account/register', payload: { username: 'Invitado', password: 'contraseña personal', code: 'incorrecta' } });
      expect(registerPublic).toHaveBeenCalledWith('Invitado', 'contraseña personal', 'incorrecta');
      expect(response.statusCode).toBe(403);
      expect(response.json()).toEqual({ error: 'La contraseña de registro no es correcta.' });
    } finally { await app.close(); }
  });
});
