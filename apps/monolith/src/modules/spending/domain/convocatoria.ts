import type { IsoDate } from "../../../shared/domain/iso-date.js";

/** Administración que convoca, tal y como la clasifica la BDNS. */
export type NivelAdministracion = string;

export interface Convocatoria {
  readonly codigoBdns: string;
  readonly fechaRecepcion: IsoDate;
  readonly descripcion: string;
  readonly tipoConvocatoria: string | null;
  /** `null` = tipo desconocido, no clasificado. Ver `clasificar`. */
  readonly esConcesionDirecta: boolean | null;
  readonly nivel1: NivelAdministracion;
  readonly nivel2: string | null;
  readonly nivel3: string | null;
  readonly presupuestoTotal: string | null;
  readonly urlBasesReguladoras: string | null;
  readonly urlOficial: string;
}

/**
 * Traduce el `tipoConvocatoria` de la BDNS a la pregunta que nos importa:
 * ¿se repartió este dinero sin concurso?
 *
 * La BDNS distingue dos regímenes (art. 22 de la Ley General de
 * Subvenciones): concurrencia competitiva, donde las solicitudes compiten
 * entre sí, y concesión directa, donde no hay procedimiento selectivo.
 * Los valores llegan como "Concesión directa - canónica",
 * "Concurrencia competitiva - canónica" y variantes.
 *
 * Devuelve `null` si el texto no encaja en ninguno de los dos: preferimos
 * un hueco visible a una clasificación inventada. `contarSinClasificar`
 * en el caso de uso los saca por pantalla para revisarlos.
 */
export function clasificar(tipoConvocatoria: string | null): boolean | null {
  if (!tipoConvocatoria) return null;

  const normalizado = tipoConvocatoria
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // sin acentos: "Concesión" → "Concesion"
    .toLowerCase()
    .trim();

  if (normalizado.startsWith("concesion directa")) return true;
  if (normalizado.startsWith("concurrencia competitiva")) return false;
  return null;
}

/** Ficha pública de la convocatoria en la BDNS. La fuente oficial, siempre delante. */
export function urlOficialDe(codigoBdns: string): string {
  return `https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias/${codigoBdns}`;
}
