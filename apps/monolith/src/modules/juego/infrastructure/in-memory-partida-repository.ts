import type { JuegoReadModel } from "../application/queries.js";
import { PARTIDAS_DE_SALIDA } from "../domain/contador.js";
import type { Partida } from "../domain/partida.js";
import type { PartidaRepository, PuestoRanking } from "../domain/partida-repository.js";

/**
 * Repositorio en memoria. Solo para los tests: en producción todo persiste
 * en Postgres (ver el comentario de `composition.ts`).
 */
export class InMemoryPartidaRepository implements PartidaRepository, JuegoReadModel {
  private readonly filas: Partida[] = [];

  async guardar(partida: Partida): Promise<boolean> {
    if (this.filas.some((f) => f.codigo === partida.codigo)) return false;
    this.filas.push(partida);
    return true;
  }

  async ranking(limite: number): Promise<PuestoRanking[]> {
    return this.conSeudonimo()
      .slice(0, limite)
      .map((fila, i) => ({
        puesto: i + 1,
        seudonimo: fila.seudonimo ?? "",
        puntos: fila.puntos,
        nivel: fila.nivel,
      }));
  }

  async total(): Promise<number> {
    return this.filas.length;
  }

  async puestoDe(puntos: number): Promise<number> {
    return this.conSeudonimo().filter((f) => f.puntos > puntos).length + 1;
  }

  async partidasJugadas(): Promise<number> {
    return this.filas.length + PARTIDAS_DE_SALIDA;
  }

  private conSeudonimo(): Partida[] {
    return this.filas
      .filter((f) => f.seudonimo !== null)
      .sort((a, b) => b.puntos - a.puntos || a.creadoEl.getTime() - b.creadoEl.getTime());
  }
}
