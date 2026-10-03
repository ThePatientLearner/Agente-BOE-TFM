import type { IsoDate } from "../../../shared/domain/iso-date.js";
import { err, ok, type Result } from "../../../shared/domain/result.js";
import type { BdnsGateway } from "../domain/bdns-gateway.js";
import type { ConcesionRepository } from "../domain/concesion-repository.js";

export interface IngestConcesionesReport {
  readonly encontradas: number;
  readonly guardadas: number;
  readonly publicas: number;
  readonly privadas: number;
  readonly desconocidas: number;
}

/**
 * Ingesta de adjudicaciones (concesiones) de la BDNS para un rango de fechas.
 *
 * Sirve para saber a quién llega el dinero —en particular, si el beneficiario
 * es una entidad pública (CIF P/Q/S) o privada— y contrastarlo con las
 * convocatorias de concesión directa.
 *
 * Idempotente por `codConcesion` (UPSERT).
 */
export class IngestConcesiones {
  constructor(
    private readonly gateway: BdnsGateway,
    private readonly repository: ConcesionRepository,
  ) {}

  async execute(desde: IsoDate, hasta: IsoDate): Promise<Result<IngestConcesionesReport>> {
    if (desde > hasta) {
      return err(new Error(`Rango de fechas invertido: ${desde} … ${hasta}`));
    }

    const listado = await this.gateway.listarConcesiones(desde, hasta);
    if (!listado.ok) return err(listado.error);

    let publicas = 0;
    let privadas = 0;
    let desconocidas = 0;

    for (const fila of listado.value) {
      if (fila.sector === "publico") publicas += 1;
      else if (fila.sector === "privado") privadas += 1;
      else desconocidas += 1;
    }

    await this.repository.saveMany(listado.value);

    return ok({
      encontradas: listado.value.length,
      guardadas: listado.value.length,
      publicas,
      privadas,
      desconocidas,
    });
  }
}
