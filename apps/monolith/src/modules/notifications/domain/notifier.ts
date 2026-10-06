import type { GobiernoView } from "../../../shared/domain/comunidad.js";
import type { Result } from "../../../shared/domain/result.js";

export interface NotificationMessage {
  /** Título en lenguaje llano: el oficial no cabe ni se entiende en el móvil. */
  readonly title: string;
  readonly shortPhrase: string;
  /** Impacto en el ciudadano, 1-5; se pinta como ●●●○○. */
  readonly impact: number;
  readonly officialUrl: string;
  /** Fecha ISO del texto oficial; no la de generación ni la de envío. */
  readonly lastOfficialUpdateAt: string;
  readonly summaryUrl: string;
  /** Quién gobierna lo que toca: la comunidad afectada, o el Estado. */
  readonly gobierno: GobiernoView;
}

/**
 * La línea de procedencia del mensaje:
 *   "🏛️ Afecta a Extremadura (gobierna PP+VOX)"
 *   "🏛️ Gobierno de España (PSOE+Sumar)"
 *
 * Dos frases y no una porque una disposición autonómica AFECTA a su
 * comunidad, mientras que una estatal simplemente viene de quien gobierna
 * España; "afecta a Gobierno de España" no querría decir nada.
 */
export function lineaGobierno(gobierno: GobiernoView): string {
  return gobierno.ambito === "estatal"
    ? `🏛️ ${gobierno.nombre} (${gobierno.etiqueta})`
    : `🏛️ Afecta a ${gobierno.nombre} (gobierna ${gobierno.etiqueta})`;
}

/**
 * Aviso suelto (no una disposición del BOE): actualización semanal de
 * subvenciones, parte operativo, etc. Misma canalización, otro formato.
 */
export interface Announcement {
  readonly title: string;
  /** Una o dos frases; el canal no debe parecer un muro de texto. */
  readonly body: string;
  readonly url: string;
}

/** "●●●○○" — indicador compacto que se ve igual en Telegram y en Discord. */
export function impactDots(impact: number): string {
  const level = Math.min(5, Math.max(1, Math.round(impact)));
  return "●".repeat(level) + "○".repeat(5 - level);
}

/**
 * Puerto único de notificación: cada canal (Telegram, Discord, WhatsApp
 * en fase 2…) es un adapter. Añadir un canal = añadir una clase, cero
 * cambios en los casos de uso.
 */
export interface Notifier {
  readonly channel: string;
  send(message: NotificationMessage): Promise<Result<void>>;
  sendAnnouncement(announcement: Announcement): Promise<Result<void>>;
}
