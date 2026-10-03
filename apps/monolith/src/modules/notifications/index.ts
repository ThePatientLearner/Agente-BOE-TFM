/** API pública del módulo `notifications`. */
export { NotifyEntry } from "./application/notify-entry.js";
export {
  PublishDayDigest,
  buildDigestAnnouncement,
  digestKey,
  fechaEnCastellano,
  type DayDigest,
} from "./application/publish-day-digest.js";
export type { Announcement, NotificationMessage, Notifier } from "./domain/notifier.js";
export type { Alerter } from "./domain/alerter.js";
export { NoopAlerter } from "./domain/alerter.js";
export type {
  NotificationLogEntry,
  NotificationLogRepository,
} from "./domain/notification-log.js";
export { entryNotified, type EntryNotified } from "./domain/events.js";
export { TelegramNotifier } from "./infrastructure/telegram-notifier.js";
export { TelegramPrivateAlerter } from "./infrastructure/telegram-private-alerter.js";
export { DiscordNotifier } from "./infrastructure/discord-notifier.js";
export { ConsoleNotifier } from "./infrastructure/console-notifier.js";
export { InMemoryNotificationLog } from "./infrastructure/in-memory-notification-log.js";
export { PostgresNotificationLog } from "./infrastructure/postgres-notification-log.js";
