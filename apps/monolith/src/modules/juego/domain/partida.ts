import { randomInt } from "node:crypto";
import { err, ok, type Result } from "../../../shared/domain/result.js";

/**
 * Una partida terminada de "¡Haz que todos se suscriban!".
 *
 * `codigo` es lo único que el jugador se lleva: su resguardo. No hay cuentas
 * ni sesiones —el juego es anónimo a propósito— así que la única forma de
 * demostrar «esa partida la jugué yo» es enseñar el código, que solo se
 * entrega una vez y no se puede volver a consultar.
 */
export interface Partida {
  readonly codigo: string;
  /**
   * Nulo = partida anónima. Solo las que llevan seudónimo entran en el
   * ranking público: nadie aparece en una lista sin haber elegido un nombre.
   */
  readonly seudonimo: string | null;
  /** Dinero en la caja fuerte al terminar, en euros enteros. */
  readonly puntos: number;
  readonly nivel: number;
  readonly segundos: number;
  readonly mejorCombo: number;
  readonly creadoEl: Date;
}

/** Lo que manda el navegador al acabar la partida. */
export interface PartidaNueva {
  readonly seudonimo: string | null;
  readonly puntos: number;
  readonly nivel: number;
  readonly segundos: number;
  readonly mejorCombo: number;
}

/**
 * Alfabeto del código: sin I, O, 0, 1, U ni vocales que formen palabras.
 * El código se dicta por teléfono y se copia a mano de una captura de
 * pantalla; una O que era un 0 convierte el resguardo del premio en una
 * discusión. La U fuera evita además que salgan palabrotas por azar.
 */
const ALFABETO = "ACDEFGHJKLMNPQRSTVWXYZ23456789";

/** Longitud de cada uno de los dos bloques del código. */
const BLOQUE = 4;

/**
 * Código de partida con la pinta de `BOE-K7Q2-M4XR`.
 *
 * Dos bloques de 4 sobre 30 símbolos = 30^8 ≈ 6,5·10^11 combinaciones. Con
 * unos pocos miles de partidas la probabilidad de colisión es despreciable,
 * y de todos modos la columna es clave primaria: si alguna vez coincidiera,
 * el INSERT falla y se reintenta en vez de pisar la partida de otro.
 *
 * `randomInt` (CSPRNG), no `Math.random()`: el código da derecho a un premio,
 * así que no debe poder adivinarse a partir de otro.
 */
export function generarCodigo(): string {
  const simbolo = (): string => ALFABETO[randomInt(ALFABETO.length)] ?? "X";
  const bloque = (): string => Array.from({ length: BLOQUE }, simbolo).join("");
  return `BOE-${bloque()}-${bloque()}`;
}

/** Largo máximo del seudónimo: el marcador del juego reserva 6 casillas. */
export const SEUDONIMO_MAX = 6;

/**
 * Caracteres admitidos en el seudónimo. Es el mismo juego de letras que
 * ofrecen las casillas del marcador; lo que no esté aquí se cae al limpiar.
 */
const SEUDONIMO_VALIDO = /[A-ZÑ0-9 ]/;

/**
 * Deja el seudónimo como lo pinta el marcador, o `null` si no queda nada.
 *
 * Se normaliza en el servidor y no solo en el navegador porque el ranking es
 * público: cualquiera puede llamar al endpoint a mano, y lo que llegue de
 * fuera acaba en una lista que ven los demás jugadores.
 */
export function limpiarSeudonimo(bruto: unknown): string | null {
  if (typeof bruto !== "string") return null;
  const limpio = bruto
    .toUpperCase()
    .split("")
    .filter((c) => SEUDONIMO_VALIDO.test(c))
    .join("")
    .trim()
    .slice(0, SEUDONIMO_MAX);
  return limpio.length > 0 ? limpio : null;
}

/**
 * Objetivo de la caja fuerte en cada nivel, copiado de `GOALS` del juego.
 * Vive aquí duplicado a sabiendas: el servidor no puede importar nada del
 * HTML del juego, y necesita una idea propia de qué marcador es posible.
 */
const OBJETIVOS = [1500, 2200, 3000, 4000, 5200, 6600];
const objetivoDe = (nivel: number): number =>
  nivel <= OBJETIVOS.length
    ? (OBJETIVOS[nivel - 1] ?? 0)
    : (OBJETIVOS[OBJETIVOS.length - 1] ?? 0) + (nivel - OBJETIVOS.length) * 1500;

/**
 * Holgura sobre el techo teórico. Se puede terminar un nivel con más dinero
 * del que pedía el objetivo (se sigue recogiendo botín mientras la caja ya
 * está llena), así que el techo exacto dejaría fuera a buenos jugadores.
 */
const HOLGURA = 1.5;

/** Nivel más alto que se admite. Muy por encima de cualquier partida real. */
const NIVEL_MAX = 100;

/** Duración máxima de una partida: más de seis horas es un script, no alguien jugando. */
const SEGUNDOS_MAX = 6 * 60 * 60;

/**
 * Lo mínimo que dura llegar a morir. Por debajo de esto no ha habido
 * partida: el jugador empieza con 300 € y nadie los pierde en cinco segundos.
 */
const SEGUNDOS_MIN = 10;

/**
 * Ritmo máximo de ingreso. La bolsa llena son 4.000 € y hay que caminar
 * hasta la caja para soltarlos; 400 €/s es varias veces lo que da el juego
 * incluso jugando perfecto, y basta para descartar un marcador inventado.
 */
const EUROS_POR_SEGUNDO_MAX = 400;

/**
 * Comprueba que el marcador podría salir de una partida real.
 *
 * Esto NO es antitrampas: el juego corre entero en el navegador y quien
 * sepa abrir la consola puede mandar el número que quiera. Lo que filtra es
 * el disparate —un millón de euros en doce segundos— para que el ranking
 * público siga siendo legible. Quien gane el premio hay que verificarlo a
 * mano; el código de la partida es el hilo del que tirar.
 */
export function validarPartida(nueva: PartidaNueva): Result<PartidaNueva, Error> {
  const { puntos, nivel, segundos, mejorCombo } = nueva;

  if (!Number.isInteger(puntos) || puntos <= 0) {
    return err(new Error("La partida no llegó a guardar nada en la caja fuerte"));
  }
  if (!Number.isInteger(nivel) || nivel < 1 || nivel > NIVEL_MAX) {
    return err(new Error("Nivel fuera de rango"));
  }
  if (!Number.isInteger(segundos) || segundos < SEGUNDOS_MIN || segundos > SEGUNDOS_MAX) {
    return err(new Error("Duración de partida imposible"));
  }
  if (!Number.isInteger(mejorCombo) || mejorCombo < 0 || mejorCombo > 1000) {
    return err(new Error("Combo fuera de rango"));
  }

  // Techo por nivel: la suma de los objetivos hasta el nivel siguiente, que
  // es lo que cabe haber guardado antes de morir en él.
  let techo = 0;
  for (let n = 1; n <= nivel + 1; n++) techo += objetivoDe(n);
  if (puntos > techo * HOLGURA) {
    return err(new Error("El marcador no encaja con el nivel alcanzado"));
  }

  if (puntos > segundos * EUROS_POR_SEGUNDO_MAX) {
    return err(new Error("El marcador no encaja con la duración de la partida"));
  }

  return ok(nueva);
}
