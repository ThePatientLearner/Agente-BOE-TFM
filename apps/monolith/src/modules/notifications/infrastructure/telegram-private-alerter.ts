import { err, ok, type Result } from "../../../shared/domain/result.js";
import type { Alerter } from "../domain/alerter.js";

/**
 * Envía alertas de sistema SOLO a un chat privado del bot (tu user id o
 * un grupo de ops). Nunca usa TELEGRAM_CHANNEL: ese destino es solo para
 * resúmenes del BOE que ven los suscriptores.
 *
 * Para obtener el chat_id: escribe /start al bot y consulta
 * https://api.telegram.org/bot<token>/getUpdates
 */
export class TelegramPrivateAlerter implements Alerter {
  readonly enabled = true;

  constructor(
    private readonly botToken: string,
    /** Chat id numérico del usuario (p. ej. 123456789), no el @canal. */
    private readonly privateChatId: string,
  ) {}

  async send(text: string): Promise<Result<void>> {
    const body = [
      "<b>⚠️ BOE Inspector · alerta</b>",
      "",
      escapeHtml(text),
      "",
      "<i>Este mensaje es privado de operación. No se publica en el canal.</i>",
    ].join("\n");

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: this.privateChatId,
            text: body,
            parse_mode: "HTML",
            // Por si en el futuro se reutiliza el mismo bot en un grupo:
            // no reenviar a hilos públicos por error de config.
            disable_notification: false,
          }),
        },
      );
      if (!response.ok) {
        return err(
          new Error(`Telegram alerta respondió ${response.status}: ${await response.text()}`),
        );
      }
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
