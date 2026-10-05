import { describe, expect, it, vi } from 'vitest';
import { CachedOfficialTextReader } from './cached-official-text-reader.js';

describe('caché de textos oficiales', () => {
  it('no acepta URLs ni identificadores inválidos', async () => {
    const load = vi.fn();
    expect(await new CachedOfficialTextReader(load).read('https://otro-servidor.test/')).toBeNull();
    expect(load).not.toHaveBeenCalled();
  });
  it('comparte descargas simultáneas y conserva documentos por separado', async () => {
    const load = vi.fn(async (id: string) => `Texto completo de ${id}`);
    const reader = new CachedOfficialTextReader(load);
    const [first, second] = await Promise.all([reader.read('BOE-A-2026-123'), reader.read('BOE-A-2026-123')]);
    expect(first).toBe(second); expect(load).toHaveBeenCalledTimes(1);
    expect(await reader.read('BOE-A-2026-124')).toContain('124');
    expect(await reader.read('BOE-A-2026-123')).toContain('123');
    expect(load).toHaveBeenCalledTimes(2);
  });
  it('vuelve a intentar un fallo y renueva una copia caducada', async () => {
    const load = vi.fn().mockResolvedValueOnce(null).mockResolvedValue('Texto recuperado');
    const reader = new CachedOfficialTextReader(load, 0);
    expect(await reader.read('BOE-A-2026-123')).toBeNull();
    expect(await reader.read('BOE-A-2026-123')).toBe('Texto recuperado');
    await reader.read('BOE-A-2026-123');
    expect(load).toHaveBeenCalledTimes(3);
  });
  it('limita el número de documentos guardados', async () => {
    const load = vi.fn(async (id: string) => id);
    const reader = new CachedOfficialTextReader(load);
    for (let i = 1; i <= 13; i++) await reader.read(`BOE-A-2026-${i}`);
    await reader.read('BOE-A-2026-13');
    expect(load).toHaveBeenCalledTimes(13);
    await reader.read('BOE-A-2026-1');
    expect(load).toHaveBeenCalledTimes(14);
  });
});
