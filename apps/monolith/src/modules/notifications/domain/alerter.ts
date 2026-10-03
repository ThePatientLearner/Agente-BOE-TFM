import { ok, type Result } from "../../../shared/domain/result.js";

/**
 * Canal de alertas de operación (fallos de ingesta, parser, etc.).
 * Separado a propósito de `Notifier`: las alertas NUNCA van al canal
 * público de Telegram/Discord donde se publican los resúmenes del BOE.
 */
export interface Alerter {
  /** true si hay un destino configurado (p. ej. chat privado). */
  readonly enabled: boolean;
  send(text: string): Promise<Result<void>>;
}

/** No-op cuando no hay chat de alerta configurado. */
export class NoopAlerter implements Alerter {
  readonly enabled = false;
  async send(): Promise<Result<void>> {
    return ok(undefined);
  }
}
