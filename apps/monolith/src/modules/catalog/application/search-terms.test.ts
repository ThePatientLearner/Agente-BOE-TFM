import { describe, expect, it } from 'vitest';
import { searchTerms } from './search-terms.js';
describe('términos de búsqueda del bot', () => {
  it('la pregunta de novedades no convierte verbos o fechas en filtros de tema', () => {
    expect(searchTerms('¿Qué se ha publicado hoy?')).toEqual([]);
    expect(searchTerms('Qué se ha publicado el 2026-09-01')).toEqual([]);
  });
  it('quita acentos y limita preguntas repetitivas', () => {
    expect(searchTerms('¿Qué novedades hay sobre pensiones y cotización?')).toEqual(['pensiones', 'cotizacion']);
    expect(searchTerms('pensiones '.repeat(200))).toEqual(['pensiones']);
  });
});
