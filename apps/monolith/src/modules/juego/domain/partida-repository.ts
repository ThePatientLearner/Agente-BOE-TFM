import type { Partida, PartidaNueva } from "./partida.js";

/** Una línea del ranking público. Solo partidas con seudónimo. */
export interface PuestoRanking {
  readonly puesto: number;
  readonly seudonimo: string;
  readonly puntos: number;
  readonly nivel: number;
}

export interface PartidaRepository {
  /**
   * Guarda la partida. Devuelve `false` si el código ya existía, para que
   * quien llama reintente con otro en vez de pisar la partida de alguien.
   */
  guardar(partida: Partida): Promise<boolean>;
  /** Mejores marcadores con seudónimo, de mayor a menor. */
  ranking(limite: number): Promise<PuestoRanking[]>;
  /** Partidas jugadas realmente (sin el arranque de cortesía del contador). */
  total(): Promise<number>;
  /** En qué puesto quedaría ese marcador dentro del ranking con seudónimo. */
  puestoDe(puntos: number): Promise<number>;
}

/** Reexportado por comodidad de los adapters. */
export type { Partida, PartidaNueva };
