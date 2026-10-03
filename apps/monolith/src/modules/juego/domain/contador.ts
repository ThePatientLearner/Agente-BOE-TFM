/**
 * Arranque del contador de "partidas jugadas" que enseña la pantalla de
 * inicio.
 *
 * NO son partidas reales: es un número de cortesía para que el contador no
 * salga a cero el primer día. Está aquí, con nombre propio y sumándose al
 * final, para que nadie confunda nunca el número de la portada con el de la
 * tabla: `juego.partidas` sigue contando solo lo que ha pasado de verdad, y
 * los informes que salgan de ella no llevan este sumando.
 *
 * Ponerlo a 0 devuelve el contador a la realidad sin tocar nada más.
 */
export const PARTIDAS_DE_SALIDA = 200;
