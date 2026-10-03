import type { IsoDate } from "../../../shared/domain/iso-date.js";
import type { Result } from "../../../shared/domain/result.js";
import type { Concesion } from "./concesion.js";
import type { Convocatoria } from "./convocatoria.js";

/** Una convocatoria en el listado: la BDNS no da el tipo hasta el detalle. */
export interface ConvocatoriaResumen {
  readonly codigoBdns: string;
  readonly fechaRecepcion: string;
}

/**
 * Puerto contra la BDNS. Dos pasos porque la API obliga: el buscador
 * lista códigos por rango de fechas, y el tipo de convocatoria —el dato
 * que nos interesa— solo aparece pidiendo el detalle de cada una.
 *
 * Las concesiones (adjudicaciones) sí vienen completas en el listado:
 * beneficiario e importe bastan para clasificar público/privado.
 */
export interface BdnsGateway {
  /** Códigos publicados entre dos fechas, ambas incluidas. */
  listarConvocatorias(desde: IsoDate, hasta: IsoDate): Promise<Result<ConvocatoriaResumen[]>>;

  /** Ficha completa, con `tipoConvocatoria` y presupuesto. */
  obtenerConvocatoria(codigoBdns: string): Promise<Result<Convocatoria>>;

  /** Adjudicaciones del periodo (paginadas en el adapter). */
  listarConcesiones(desde: IsoDate, hasta: IsoDate): Promise<Result<Concesion[]>>;
}
