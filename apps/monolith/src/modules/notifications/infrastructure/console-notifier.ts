import { ok, type Result } from "../../../shared/domain/result.js";
import type { Logger } from "../../../shared/logger/logger.js";
import type { Announcement, NotificationMessage, Notifier } from "../domain/notifier.js";

/** Canal de desarrollo: imprime la notificación en el log. */
export class ConsoleNotifier implements Notifier {
  readonly channel = "console";

  constructor(private readonly logger: Logger) {}

  async send(message: NotificationMessage): Promise<Result<void>> {
    this.logger.info({ ...message }, "Notificación (canal de consola)");
    return ok(undefined);
  }

  async sendAnnouncement(announcement: Announcement): Promise<Result<void>> {
    this.logger.info({ ...announcement }, "Anuncio (canal de consola)");
    return ok(undefined);
  }
}
