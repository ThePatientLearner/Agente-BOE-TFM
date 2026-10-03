import { index, integer, pgSchema, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Schema del módulo `juego`: partidas terminadas de "¡Haz que todos se
 * suscriban!".
 *
 * Como el resto de módulos, tiene su propio schema de Postgres y no lee las
 * tablas de nadie. Aquí no hay usuarios ni sesiones: la fila es la partida y
 * su clave natural es el código que se le entrega al jugador.
 */
export const juegoSchema = pgSchema("juego");

export const partidas = juegoSchema.table(
  "partidas",
  {
    /**
     * `BOE-K7Q2-M4XR`. Clave primaria, así que Postgres es quien garantiza
     * que dos jugadores no compartan resguardo.
     */
    codigo: text("codigo").primaryKey(),

    /**
     * NULL = partida anónima. Solo las que tienen seudónimo salen en el
     * ranking público; el índice de abajo las filtra por eso.
     */
    seudonimo: text("seudonimo"),

    /**
     * Dinero en la caja fuerte al morir, en euros enteros. Es el marcador
     * del juego: lo que se lleva encima al final no cuenta, solo lo guardado.
     * integer y no numeric porque son euros redondos del juego, no dinero.
     */
    puntos: integer("puntos").notNull(),

    nivel: integer("nivel").notNull(),
    segundos: integer("segundos").notNull(),
    mejorCombo: integer("mejor_combo").notNull().default(0),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    // El ranking: mejores marcadores con seudónimo. El orden va en el índice
    // porque es la única consulta que se hace en caliente, una por partida.
    index("juego_partidas_puntos_idx").on(table.puntos.desc()),
    index("juego_partidas_fecha_idx").on(table.createdAt),
  ],
);
