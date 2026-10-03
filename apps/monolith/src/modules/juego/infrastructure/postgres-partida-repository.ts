import { count, desc, gt, isNotNull, sql } from "drizzle-orm";
import type { Database } from "../../../shared/db/connection.js";
import type { JuegoReadModel } from "../application/queries.js";
import { PARTIDAS_DE_SALIDA } from "../domain/contador.js";
import type { Partida } from "../domain/partida.js";
import type { PartidaRepository, PuestoRanking } from "../domain/partida-repository.js";
import { partidas } from "./schema.js";

/**
 * Persistencia de partidas en el schema `juego`.
 *
 * Implementa a la vez el repositorio de escritura y el puerto de lectura,
 * igual que hace `spending`: son la misma tabla y separarlos en dos clases
 * solo duplicaría la conexión.
 */
export class PostgresPartidaRepository implements PartidaRepository, JuegoReadModel {
  constructor(private readonly db: Database) {}

  /**
   * INSERT que no pisa nada. `onConflictDoNothing` sobre la clave primaria
   * devuelve cero filas si el código ya existía, y eso es lo que le dice a
   * `RegistrarPartida` que tiene que probar con otro.
   */
  async guardar(partida: Partida): Promise<boolean> {
    const filas = await this.db
      .insert(partidas)
      .values({
        codigo: partida.codigo,
        seudonimo: partida.seudonimo,
        puntos: partida.puntos,
        nivel: partida.nivel,
        segundos: partida.segundos,
        mejorCombo: partida.mejorCombo,
        createdAt: partida.creadoEl,
      })
      .onConflictDoNothing({ target: partidas.codigo })
      .returning({ codigo: partidas.codigo });

    return filas.length > 0;
  }

  async ranking(limite: number): Promise<PuestoRanking[]> {
    const filas = await this.db
      .select({
        seudonimo: partidas.seudonimo,
        puntos: partidas.puntos,
        nivel: partidas.nivel,
      })
      .from(partidas)
      .where(isNotNull(partidas.seudonimo))
      // A igual marcador, primero quien lo consiguió antes: el ranking no
      // cambia de orden cuando alguien empata con un puesto ya ganado.
      .orderBy(desc(partidas.puntos), partidas.createdAt)
      .limit(limite);

    return filas.map((fila, i) => ({
      puesto: i + 1,
      seudonimo: fila.seudonimo ?? "",
      puntos: fila.puntos,
      nivel: fila.nivel,
    }));
  }

  async total(): Promise<number> {
    const [fila] = await this.db.select({ total: count() }).from(partidas);
    return Number(fila?.total ?? 0);
  }

  /**
   * Puesto de un marcador: cuántas partidas con seudónimo lo superan, más
   * uno. Se cuenta contra la tabla y no sobre el ranking recortado porque
   * quedar el 80º también es un puesto, aunque no salga en la lista.
   */
  async puestoDe(puntos: number): Promise<number> {
    const [fila] = await this.db
      .select({ mejores: count() })
      .from(partidas)
      .where(sql`${isNotNull(partidas.seudonimo)} and ${gt(partidas.puntos, puntos)}`);
    return Number(fila?.mejores ?? 0) + 1;
  }

  /** Puerto de lectura: el contador de la portada, con el arranque sumado. */
  async partidasJugadas(): Promise<number> {
    return (await this.total()) + PARTIDAS_DE_SALIDA;
  }
}
