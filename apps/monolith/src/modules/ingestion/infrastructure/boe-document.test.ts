import { afterEach, describe, expect, it, vi } from 'vitest';
import { BoeApiGateway } from './boe-api-gateway.js';
import { BoeId } from '../../../shared/domain/boe-id.js';

afterEach(() => vi.unstubAllGlobals());
describe('lectura del XML oficial', () => {
  it('conserva el cuerpo, títulos de artículos y filas de tablas sin leer referencias externas', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('<documento fecha_actualizacion="20260102090000"><analisis><texto>Referencia ajena.</texto></analisis><texto><p>Artículo 1. Objeto.</p><p>Objeto del documento.</p><p>Artículo 2. Tarifas.</p><table><tr><td>Concepto</td><td>Importe</td></tr><tr><td>Bicicletas</td><td>20 euros</td></tr></table></texto></documento>'));
    vi.stubGlobal('fetch', fetchMock);
    const id = BoeId.create('BOE-A-2026-123'); if (!id.ok) throw id.error;
    const signal = AbortSignal.timeout(1000);
    const result = await new BoeApiGateway().fetchEntryContent(id.value, signal);
    expect(result.ok).toBe(true);
    if (!result.ok) throw result.error;
    expect(result.value.text).toContain('Artículo 1. Objeto.\n');
    expect(result.value.text).toContain('Concepto | Importe |\nBicicletas | 20 euros');
    expect(result.value.text).not.toContain('Referencia ajena');
    expect(result.value.lastUpdatedAt).toBe('2026-01-02');
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('https://www.boe.es/diario_boe/xml.php?id=BOE-A-2026-123', { signal });
  });
  it('informa de un documento vacío en vez de presentarlo como leído', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<documento></documento>')));
    const id = BoeId.create('BOE-A-2026-123'); if (!id.ok) throw id.error;
    expect((await new BoeApiGateway().fetchEntryContent(id.value)).ok).toBe(false);
  });
});
