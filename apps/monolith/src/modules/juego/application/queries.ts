import type { PuestoRanking } from "../domain/partida-repository.js";

/**
 * Puerto de lectura del módulo `juego`, que es lo que consume la API HTTP.
 * Se mantiene aparte del repositorio de escritura para que la web no pueda
 * llegar a `guardar` por la puerta de atrás.
 */
export interface JuegoReadModel {
  /** Los mejores marcadores por dinero en la caja fuerte. */
  ranking(limite: number): Promise<PuestoRanking[]>;
  /** Partidas jugadas, con el arranque de cortesía ya sumado. */
  partidasJugadas(): Promise<number>;
}

export type { PuestoRanking };
