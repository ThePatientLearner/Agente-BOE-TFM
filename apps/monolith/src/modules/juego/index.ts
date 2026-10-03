/**
 * API pública del módulo `juego`: el marcador de "¡Haz que todos se
 * suscriban!", el juego de la web.
 *
 * Es el único módulo con un camino de escritura abierto a la API HTTP —los
 * demás solo se leen— porque la partida la termina el jugador en su
 * navegador y no hay ningún otro sitio desde el que pueda entrar. La
 * frontera está declarada a propósito en `.dependency-cruiser.cjs`.
 *
 * Nada fuera del módulo importa de sus carpetas internas.
 */
export { RegistrarPartida, type Resguardo } from "./application/registrar-partida.js";
export type { JuegoReadModel, PuestoRanking } from "./application/queries.js";
export { PARTIDAS_DE_SALIDA } from "./domain/contador.js";
export {
  generarCodigo,
  limpiarSeudonimo,
  validarPartida,
  SEUDONIMO_MAX,
  type Partida,
  type PartidaNueva,
} from "./domain/partida.js";
export type { PartidaRepository } from "./domain/partida-repository.js";
export { InMemoryPartidaRepository } from "./infrastructure/in-memory-partida-repository.js";
export { PostgresPartidaRepository } from "./infrastructure/postgres-partida-repository.js";
