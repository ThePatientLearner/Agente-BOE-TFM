import type { Logger } from "../../../shared/logger/logger.js";
import { err, ok, type Result } from "../../../shared/domain/result.js";
import {
  generarCodigo,
  limpiarSeudonimo,
  validarPartida,
  type PartidaNueva,
} from "../domain/partida.js";
import type { PartidaRepository, PuestoRanking } from "../domain/partida-repository.js";

/** Lo que recibe el jugador al terminar: su código y dónde ha quedado. */
export interface Resguardo {
  /** El código de un solo uso. Es lo único que prueba que jugó esa partida. */
  readonly codigo: string;
  /** Puesto en el ranking con seudónimo; nulo si jugó en anónimo. */
  readonly puesto: number | null;
  /** Ranking ya actualizado, para pintarlo sin una segunda petición. */
  readonly ranking: PuestoRanking[];
  readonly partidasJugadas: number;
}

/**
 * Cuántas veces se reintenta si el código generado ya existía. Con 30^8
 * combinaciones esto no debería ocurrir nunca; existe para que, si ocurre,
 * el jugador no pierda su partida por una casualidad.
 */
const REINTENTOS = 5;

/**
 * Registra una partida terminada y devuelve el resguardo.
 *
 * Es el único camino de escritura del módulo. Valida antes de guardar
 * (`validarPartida`) porque el marcador llega del navegador y el ranking que
 * alimenta es público.
 */
export class RegistrarPartida {
  constructor(
    private readonly partidas: PartidaRepository,
    private readonly logger: Logger,
    private readonly tamanoRanking: number,
    private readonly partidasDeSalida: number,
  ) {}

  async ejecutar(nueva: PartidaNueva): Promise<Result<Resguardo, Error>> {
    const valida = validarPartida(nueva);
    if (!valida.ok) {
      this.logger.warn(
        { puntos: nueva.puntos, nivel: nueva.nivel, segundos: nueva.segundos },
        `Partida descartada: ${valida.error.message}`,
      );
      return err(valida.error);
    }

    const seudonimo = limpiarSeudonimo(nueva.seudonimo);

    for (let intento = 0; intento < REINTENTOS; intento++) {
      const codigo = generarCodigo();
      const guardada = await this.partidas.guardar({
        codigo,
        seudonimo,
        puntos: nueva.puntos,
        nivel: nueva.nivel,
        segundos: nueva.segundos,
        mejorCombo: nueva.mejorCombo,
        creadoEl: new Date(),
      });
      if (!guardada) continue;

      const [ranking, jugadas] = await Promise.all([
        this.partidas.ranking(this.tamanoRanking),
        this.partidas.total(),
      ]);

      // El puesto solo tiene sentido con seudónimo: quien juega en anónimo no
      // está en la lista, y decirle "eres el 3º" de una tabla en la que no
      // aparece sería mentirle.
      const puesto = seudonimo ? await this.partidas.puestoDe(nueva.puntos) : null;

      return ok({
        codigo,
        puesto,
        ranking,
        partidasJugadas: jugadas + this.partidasDeSalida,
      });
    }

    this.logger.error("No se pudo generar un código de partida libre");
    return err(new Error("No se pudo registrar la partida"));
  }
}
