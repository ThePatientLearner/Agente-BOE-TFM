import type { IsoDate } from "../../../shared/domain/iso-date.js";
import type { Convocatoria } from "./convocatoria.js";

/** Fila del informe de concesiones directas. */
export interface ResumenDirectas {
  readonly nivel1: string;
  readonly nivel2: string | null;
  readonly convocatorias: number;
  readonly importeTotal: string | null;
}

export interface ConvocatoriaRepository {
  /** UPSERT por código BDNS: repetir la ingesta no duplica. */
  save(convocatoria: Convocatoria): Promise<void>;

  /** Códigos ya guardados, para no volver a pedir su detalle a la BDNS. */
  existentes(codigos: readonly string[]): Promise<Set<string>>;

  /** Concesiones directas del periodo, agrupadas por administración. */
  resumenDirectas(desde: IsoDate, hasta: IsoDate): Promise<ResumenDirectas[]>;

  /** Concesiones directas del periodo, de mayor a menor importe. */
  listarDirectas(desde: IsoDate, hasta: IsoDate, limite: number): Promise<Convocatoria[]>;
}
