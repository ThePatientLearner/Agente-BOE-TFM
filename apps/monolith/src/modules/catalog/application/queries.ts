import type { GobiernoView } from "../../../shared/domain/comunidad.js";
import type { IsoDate } from "../../../shared/domain/iso-date.js";

/** Vista de una disposición tal y como la consume la web. */
export interface CatalogEntryView {
  readonly id: string;
  readonly publicationDate: IsoDate;
  readonly department: string;
  /** Título oficial del BOE, literal. Se muestra dentro, junto al enlace. */
  readonly title: string;
  /**
   * Título en lenguaje llano. Es el que encabeza cada ficha; nulo mientras
   * la IA no ha resumido todavía, y entonces la web cae al oficial.
   */
  readonly plainTitle: string | null;
  readonly officialHtmlUrl: string;
  readonly officialPdfUrl: string;
  readonly shortPhrase: string | null;
  readonly bulletPoints: readonly string[] | null;
  /** Impacto en el ciudadano, 1-5. Nulo hasta que hay resumen. */
  readonly impact: number | null;
  readonly model: string | null;
  /**
   * Quién gobierna lo que la disposición toca: la comunidad afectada si es
   * autonómica, y el Gobierno de España en todo lo demás. Nunca es nulo —
   * toda disposición del BOE la firma alguien.
   *
   * NO se guarda en la base: se resuelve al leer, contra la tabla de
   * `shared/domain/comunidad.ts`. Un resumen es de un día concreto, pero
   * "quién gobierna" es de hoy, y tiene que seguir siendo cierto cuando
   * alguien abra la ficha dentro de dos años.
   */
  readonly gobierno: GobiernoView;
  /** Obligatorio mostrarla (condiciones de reutilización del BOE). */
  readonly lastOfficialUpdateAt: IsoDate;
}

export interface CatalogDayView {
  readonly date: IsoDate;
  readonly entries: readonly CatalogEntryView[];
}

/**
 * Referencia mínima a una disposición: lo justo para enumerar el archivo
 * entero sin arrastrar los resúmenes. Existe porque la portada solo muestra
 * los últimos días y, sin una lista completa, las disposiciones antiguas
 * quedan sin ningún enlace que las alcance.
 */
export interface CatalogReferenceView {
  readonly id: string;
  readonly lastOfficialUpdateAt: IsoDate;
}

/**
 * Filtros de la búsqueda sobre el archivo completo. La portada solo sirve
 * 15 días en local; esto es lo que desbloquea la contraseña de "Búsqueda
 * completa" y se ejecuta en SQL.
 */
export interface CatalogSearchParams {
  /** Texto libre: id, título, departamento, resumen… */
  readonly query?: string;
  readonly from?: IsoDate;
  readonly to?: IsoDate;
  /** Umbral mínimo de impacto (1-5). 1 = sin filtro. */
  readonly minImpact?: number;
  /**
   * Tope de filas devueltas. Evita que una consulta vacía arrastre el
   * archivo entero al navegador. La web pide 300.
   */
  readonly limit?: number;
}

export interface AssistantSearchParams {
  readonly query: string;
  readonly from?: IsoDate;
  readonly to?: IsoDate;
}

/**
 * Puerto de lectura del catálogo. `catalog` es el único módulo que la API
 * consulta; se alimenta de los eventos de los demás (CQRS ligero).
 */
export interface CatalogReadModel {
  /** Búsqueda por palabras y relevancia, con un máximo fijo de seis documentos. */
  retrieve(params: AssistantSearchParams): Promise<CatalogEntryView[]>;
  listDays(limit: number): Promise<CatalogDayView[]>;
  getDay(date: IsoDate): Promise<CatalogDayView | null>;
  getEntry(id: string): Promise<CatalogEntryView | null>;
  /** Todas las disposiciones publicadas, de la más reciente a la más antigua. */
  listReferences(): Promise<CatalogReferenceView[]>;
  /**
   * Busca en todo el catálogo (no solo los 15 días de la portada).
   * Devuelve días con al menos un resultado, del más reciente al más antiguo.
   */
  search(params: CatalogSearchParams): Promise<CatalogDayView[]>;
}
