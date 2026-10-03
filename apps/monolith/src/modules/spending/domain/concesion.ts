import type { IsoDate } from "../../../shared/domain/iso-date.js";
import type { SectorBeneficiario } from "./sector-beneficiario.js";

/** Una adjudicación concreta de la BDNS (dinero que llega a un beneficiario). */
export interface Concesion {
  readonly codConcesion: string;
  readonly fechaConcesion: IsoDate;
  readonly numeroConvocatoria: string;
  readonly beneficiario: string;
  readonly nifCif: string | null;
  readonly importe: string | null;
  readonly sector: SectorBeneficiario;
  readonly nivel1: string | null;
  readonly nivel2: string | null;
}
