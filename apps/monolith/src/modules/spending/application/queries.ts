import type { IsoDate } from "../../../shared/domain/iso-date.js";
import type {
  MayorConcesionDirecta,
  RepartoDirectasPorSector,
  TramoSector,
} from "../domain/concesion-repository.js";
import type { Convocatoria } from "../domain/convocatoria.js";
import type { ResumenDirectas } from "../domain/convocatoria-repository.js";

export type { MayorConcesionDirecta, RepartoDirectasPorSector, TramoSector };

/**
 * Un tramo del reparto. El importe viaja como cadena, no como número: son
 * euros en `numeric(16,2)` y el `number` de JavaScript pierde precisión a
 * partir de cierto tamaño. Quien lo formatea decide cómo redondear.
 */
export interface RepartoTramo {
  readonly convocatorias: number;
  /** Suma en euros. `"0"` si no hay ninguna; nunca `null`. */
  readonly importe: string;
}

/**
 * Cómo se reparte el dinero del periodo entre los dos regímenes del
 * artículo 22 de la Ley General de Subvenciones, más lo que no se ha podido
 * clasificar.
 *
 * `sinClasificar` no es un detalle: son las filas cuyo `tipoConvocatoria` no
 * encaja en ninguna categoría conocida. Se expone aparte a propósito, porque
 * repartirlas entre los otros dos tramos falsearía justo el dato que se está
 * midiendo.
 */
export interface RepartoPeriodo {
  readonly desde: IsoDate;
  readonly hasta: IsoDate;
  readonly directas: RepartoTramo;
  readonly competitivas: RepartoTramo;
  readonly sinClasificar: RepartoTramo;
}

/**
 * Qué periodo hay realmente ingerido. La web lo necesita para no prometer un
 * histórico que no existe: hoy la tabla cubre unos días, no años.
 */
export interface Cobertura {
  readonly desde: IsoDate;
  readonly hasta: IsoDate;
  readonly convocatorias: number;
}

/**
 * Un mes con datos. La web genera una página estática por cada uno, así que
 * esta lista es la que decide cuántas páginas existen.
 */
export interface PeriodoDisponible {
  /** `"2026-08"`. Es también el segmento de la URL. */
  readonly mes: string;
  readonly desde: IsoDate;
  readonly hasta: IsoDate;
  readonly convocatorias: number;
}

/**
 * Puerto de SOLO LECTURA del módulo `spending`.
 *
 * Existe para que la API HTTP pueda consultar subvenciones sin que le llegue
 * `save()` ni la ingesta. `catalog` cumple ese papel para el BOE siendo una
 * proyección alimentada por eventos; aquí no hace falta: `spending` es una
 * sola tabla que se llena por un comando manual, sin eventos de por medio,
 * así que montar una proyección paralela sería ceremonia sin beneficio. Lo
 * que sí hace falta es que la frontera exista y se vea, y de eso se encarga
 * esta interfaz junto con las reglas de `.dependency-cruiser.cjs`.
 */
export interface SpendingReadModel {
  /** `null` cuando la tabla está vacía. */
  cobertura(): Promise<Cobertura | null>;
  /** Meses con datos, del más reciente al más antiguo. */
  periodos(): Promise<PeriodoDisponible[]>;
  reparto(desde: IsoDate, hasta: IsoDate): Promise<RepartoPeriodo>;
  resumenDirectas(desde: IsoDate, hasta: IsoDate): Promise<ResumenDirectas[]>;
  listarDirectas(desde: IsoDate, hasta: IsoDate, limite: number): Promise<Convocatoria[]>;
  /**
   * De las adjudicaciones ligadas a directas: % a entidades públicas vs
   * privadas (por NIF/CIF del beneficiario).
   */
  repartoDirectasPorSector(desde: IsoDate, hasta: IsoDate): Promise<RepartoDirectasPorSector>;
  /** Mayores adjudicaciones de directas a entidades públicas. */
  listarMayoresPublicas(
    desde: IsoDate,
    hasta: IsoDate,
    limite: number,
  ): Promise<MayorConcesionDirecta[]>;
  /** Mayores adjudicaciones de directas a privados. */
  listarMayoresPrivadas(
    desde: IsoDate,
    hasta: IsoDate,
    limite: number,
  ): Promise<MayorConcesionDirecta[]>;
}
