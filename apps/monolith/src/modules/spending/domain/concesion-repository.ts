import type { IsoDate } from "../../../shared/domain/iso-date.js";
import type { Concesion } from "./concesion.js";
import type { SectorBeneficiario } from "./sector-beneficiario.js";

export interface TramoSector {
  readonly sector: SectorBeneficiario;
  readonly concesiones: number;
  readonly importe: string;
}

/**
 * Destino de las adjudicaciones ligadas a convocatorias de concesión
 * directa del periodo: público vs privado vs desconocido.
 */
export interface RepartoDirectasPorSector {
  readonly desde: IsoDate;
  readonly hasta: IsoDate;
  readonly publico: TramoSector;
  readonly privado: TramoSector;
  readonly desconocido: TramoSector;
  /** True si aún no hay concesiones ingeridas para el periodo. */
  readonly sinDatos: boolean;
}

/** Una de las mayores adjudicaciones directas, para el listado de la web. */
export interface MayorConcesionDirecta {
  readonly codConcesion: string;
  readonly fechaConcesion: IsoDate;
  readonly numeroConvocatoria: string;
  readonly beneficiario: string;
  readonly importe: string | null;
  readonly sector: SectorBeneficiario;
  readonly nivel1: string | null;
  readonly nivel2: string | null;
  /** Descripción de la convocatoria asociada. */
  readonly descripcionConvocatoria: string;
  readonly urlOficial: string;
}

export interface ConcesionRepository {
  /** UPSERT por código de concesión. */
  saveMany(concesiones: readonly Concesion[]): Promise<void>;

  /**
   * Solo adjudicaciones cuya convocatoria es concesión directa (join con
   * `convocatorias`). Por fecha de la concesión.
   */
  repartoDirectasPorSector(
    desde: IsoDate,
    hasta: IsoDate,
  ): Promise<RepartoDirectasPorSector>;

  /**
   * Mayores adjudicaciones de directas por importe.
   * `sector` null = todas; "publico" / "privado" filtra.
   */
  listarMayoresConcesionesDirectas(
    desde: IsoDate,
    hasta: IsoDate,
    limite: number,
    sector?: "publico" | "privado" | null,
  ): Promise<MayorConcesionDirecta[]>;
}
