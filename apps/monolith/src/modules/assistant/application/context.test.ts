import { describe, expect, it, vi } from 'vitest';
import { buildContext, excerpts } from './context.js';
import type { CatalogEntryView } from '../../catalog/index.js';

const entry = { id: 'BOE-A-2026-123', title: 'Norma de prueba', department: 'Ministerio', publicationDate: '2026-01-01', lastOfficialUpdateAt: '2026-01-01', shortPhrase: 'Resumen de IA.' } as CatalogEntryView;
const padding = 'Información general sin relación con la consulta. '.repeat(8000);

describe('lectura del documento oficial', () => {
  it('incluye entero un documento que cabe, también su final', async () => {
    const text = 'Artículo 1. Objeto.\nUna ayuda.\nDisposición final. Entrada en vigor al día siguiente.';
    const read = vi.fn().mockResolvedValue(text);
    const input = JSON.parse(await buildContext([entry], { question: 'Qué aprueba', entryId: entry.id, history: [] }, { read }));
    expect(input.documents[0].officialExcerpts).toBe(text);
    expect(input.documents[0].officialTextCoverage).toBe('complete');
  });
  it('encuentra un plazo en el anexo después de los primeros 300.000 caracteres', () => {
    const selected = excerpts(padding + '\nANEXO II\nPLAZO ESPECIAL: sesenta días para solicitudes de bicicletas.', 'plazo especial bicicletas', 6000);
    expect(selected).toContain('sesenta días');
    expect(selected.length).toBeLessThanOrEqual(6000);
  });
  it('selecciona el artículo pedido, sin confundirse con referencias o el artículo 11', () => {
    const text = 'Véase el artículo 1 de otra norma.\n' + padding + '\nArtículo 11. Otro ámbito.\nNo es este.\nArtículo 1. Requisitos.\nDeben presentar un certificado.\nArtículo 2. Plazos.\nVeinte días.';
    const selected = excerpts(text, 'Explica el artículo 1');
    expect(selected).toContain('Deben presentar un certificado.');
    expect(selected).not.toContain('Otro ámbito');
    expect(selected).not.toContain('Veinte días');
    expect(selected).not.toContain('Véase');
  });
  it('reconoce artículo único sin depender de tildes en la pregunta', () => {
    const selected = excerpts(padding + '\nArtículo único. Objeto.\nContenido solicitado.\nDisposición final. Otros efectos.', 'explica el articulo unico');
    expect(selected).toContain('Contenido solicitado');
    expect(selected).not.toContain('Otros efectos');
  });
  it('mantiene el pasaje relevante al acotar caracteres y bytes antes de ordenar', () => {
    const selected = excerpts('á'.repeat(50_000) + '\nOBJETIVO FINAL: bicicletas de carga.\n', 'bicicletas carga', 6000, 6000);
    expect(selected).toContain('bicicletas de carga');
    expect(Buffer.byteLength(selected)).toBeLessThanOrEqual(6000);
  });
  it('usa la pregunta anterior solo para entender una continuación', async () => {
    const read = vi.fn().mockResolvedValue(padding + '\nRequisitos de bicicletas de carga: certificado municipal.');
    const input = JSON.parse(await buildContext([entry], { question: '¿Y sus requisitos?', entryId: entry.id, history: [{ role: 'user', content: 'Bicicletas de carga' }] }, { read }));
    expect(input.documents[0].officialExcerpts).toContain('certificado municipal');
    expect(input.documents[0].officialTextCoverage).toBe('selected-passages');
    expect(Buffer.byteLength(JSON.stringify(input))).toBeLessThan(64_000);
  });
  it('rechaza varios documentos o una identidad distinta antes de leer', async () => {
    const read = vi.fn();
    for (const entries of [[entry, entry], [{ ...entry, id: 'BOE-A-2026-124' }]]) {
      await expect(buildContext(entries, { question: 'Una pregunta', entryId: entry.id, history: [] }, { read })).rejects.toThrow('únicamente');
    }
    expect(read).not.toHaveBeenCalled();
  });
});
