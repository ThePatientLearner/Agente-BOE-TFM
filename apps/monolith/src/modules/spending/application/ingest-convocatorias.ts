import type { IsoDate } from "../../../shared/domain/iso-date.js";
import { err, ok, type Result } from "../../../shared/domain/result.js";
import type { BdnsGateway } from "../domain/bdns-gateway.js";
import type { ConvocatoriaRepository } from "../domain/convocatoria-repository.js";

export interface IngestReport {
  readonly encontradas: number;
  /** Fichas cuyo detalle se pidió (las ya guardadas se saltan). */
  readonly nuevas: number;
  readonly directas: number;
  readonly competitivas: number;
  /** `tipoConvocatoria` desconocido o ausente. Hay que mirarlas a mano. */
  readonly sinClasificar: number;
  readonly fallos: number;
}

/**
 * Ingesta de convocatorias de la BDNS para un rango de fechas.
 *
 * Dos pasos, porque la API obliga: el buscador da los códigos del periodo,
 * y el tipo de convocatoria —concurrencia competitiva o concesión directa—
 * solo aparece en el detalle de cada ficha.
 *
 * Idempotente por el código BDNS. Por defecto salta las que ya están
 * guardadas para no pedir su detalle otra vez; `refrescar` fuerza la
 * relectura, que sirve para arrastrar las correcciones que la BDNS hace
 * sobre fichas ya publicadas.
 *
 * Un fallo en una ficha suelta no aborta la ingesta: se cuenta y se sigue.
 * Solo falla entero si no se puede ni listar el periodo.
 */
export class IngestConvocatorias {
  constructor(
    private readonly gateway: BdnsGateway,
    private readonly repository: ConvocatoriaRepository,
  ) {}

  async execute(
    desde: IsoDate,
    hasta: IsoDate,
    opciones: { readonly refrescar?: boolean } = {},
  ): Promise<Result<IngestReport>> {
    if (desde > hasta) {
      return err(new Error(`Rango de fechas invertido: ${desde} … ${hasta}`));
    }

    const listado = await this.gateway.listarConvocatorias(desde, hasta);
    if (!listado.ok) return err(listado.error);

    const codigos = [...new Set(listado.value.map((resumen) => resumen.codigoBdns))];
    const yaGuardadas = opciones.refrescar
      ? new Set<string>()
      : await this.repository.existentes(codigos);
    const pendientes = codigos.filter((codigo) => !yaGuardadas.has(codigo));

    let directas = 0;
    let competitivas = 0;
    let sinClasificar = 0;
    let fallos = 0;

    for (const codigo of pendientes) {
      const ficha = await this.gateway.obtenerConvocatoria(codigo);
      if (!ficha.ok) {
        fallos += 1;
        continue;
      }

      await this.repository.save(ficha.value);

      if (ficha.value.esConcesionDirecta === true) directas += 1;
      else if (ficha.value.esConcesionDirecta === false) competitivas += 1;
      else sinClasificar += 1;
    }

    return ok({
      encontradas: codigos.length,
      nuevas: pendientes.length,
      directas,
      competitivas,
      sinClasificar,
      fallos,
    });
  }
}
