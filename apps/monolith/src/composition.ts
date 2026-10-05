/**
 * Composición del monolito: el ÚNICO lugar donde se decide qué adapter
 * implementa cada puerto. Lo usan tanto el arranque normal (`main.ts`)
 * como los comandos de la CLI, para que no puedan desincronizarse.
 *
 * Todo lo que persiste va contra Postgres. Los adapters en memoria siguen
 * existiendo, pero solo para los tests: no hay un modo "sin base de datos"
 * en producción a propósito, porque perder la ingesta en un reinicio sin
 * enterarse es peor que no arrancar.
 */
import type { Config } from "./shared/config/config.js";
import { AskBoe, CachedOfficialTextReader, MinimaxAssistant, OpenAiAssistant, PostgresAssistantSettings, PostgresBudget, ReviewedAssistant, type AssistantModel } from './modules/assistant/index.js';
import { BoeId } from './shared/domain/boe-id.js';
import type { Database } from "./shared/db/connection.js";
import type { Logger } from "./shared/logger/logger.js";
import { InMemoryEventBus } from "./shared/event-bus/in-memory-event-bus.js";
import type { EventBus } from "./shared/event-bus/event-bus.js";
import {
  BoeApiGateway,
  IngestDailyBulletin,
  PostgresEntryRepository,
  TrackEntryProgress,
} from "./modules/ingestion/index.js";
import {
  HttpSummarizer,
  PostgresSummaryRepository,
  SummarizeEntry,
} from "./modules/summarization/index.js";
import {
  ConsoleNotifier,
  DiscordNotifier,
  NoopAlerter,
  NotifyEntry,
  PostgresNotificationLog,
  PublishDayDigest,
  TelegramNotifier,
  TelegramPrivateAlerter,
  type Alerter,
  type Notifier,
} from "./modules/notifications/index.js";
import { PostgresCatalogProjection } from "./modules/catalog/index.js";
import type { CatalogReadModel } from "./modules/catalog/index.js";
import { PostgresConvocatoriaRepository } from "./modules/spending/index.js";
import type { SpendingReadModel } from "./modules/spending/index.js";
import {
  PARTIDAS_DE_SALIDA,
  PostgresPartidaRepository,
  RegistrarPartida,
} from "./modules/juego/index.js";
import type { JuegoReadModel } from "./modules/juego/index.js";
import { ResumePendingEntries } from "./scheduler/resume-pending.js";
import { DailyStatusReader } from "./scheduler/daily-report.js";
import { CatalogDayDigestReader, type DayDigestReader } from "./scheduler/day-digest.js";

export interface Application {
  readonly assistant: AskBoe;
  readonly ingest: IngestDailyBulletin;
  /** Reanuda lo que se quedó a medias; lo usan los reintentos del cron. */
  readonly resume: ResumePendingEntries;
  /** En qué punto está cada disposición del día; alimenta el parte diario. */
  readonly dayStatus: DailyStatusReader;
  /** Cuántas disposiciones hay de cada impacto; alimenta el parte público. */
  readonly dayDigest: DayDigestReader;
  /** Publica ese recuento en los canales públicos, una vez por día. */
  readonly publishDayDigest: PublishDayDigest;
  readonly catalog: CatalogReadModel;
  /**
   * Subvenciones de la BDNS. Solo el puerto de lectura: la ingesta se lanza a
   * mano desde la CLI, no participa del cron ni del bus de eventos.
   */
  readonly spending: SpendingReadModel;
  /**
   * El juego de la web. Es el único módulo que la API escribe: la partida la
   * termina el jugador en su navegador y no hay ningún otro sitio desde el
   * que pueda entrar. Tampoco participa del bus de eventos —nadie reacciona
   * a que alguien juegue— así que no se suscribe a nada.
   */
  readonly juego: JuegoReadModel;
  readonly registrarPartida: RegistrarPartida;
  readonly eventBus: EventBus;
  readonly channels: readonly string[];
  /** Alertas de operación: solo chat privado de Telegram, nunca el canal público. */
  readonly alerter: Alerter;
}

/**
 * Cuántos puestos del ranking del juego se enseñan. Cinco: caben en la
 * pantalla final sin tapar el marcador de la propia partida, que es lo que
 * el jugador ha ido a ver.
 */
const RANKING_PUBLICO = 5;

export function buildApplication(config: Config, logger: Logger, db: Database): Application {
  const eventBus = new InMemoryEventBus(logger);

  // ── Catálogo (proyección de lectura para la web) ───────────────
  // Se suscribe EL PRIMERO a propósito. El bus entrega en orden de
  // suscripción y `SummarizeEntry` emite `summary-generated` desde dentro
  // de su handler de `entry-ingested`; si el catálogo fuera después, el
  // resumen llegaría antes de existir la fila y se perdería.
  const catalog = new PostgresCatalogProjection(db, logger);
  catalog.register(eventBus);

  // ── Ingesta ────────────────────────────────────────────────────
  const entries = new PostgresEntryRepository(db);
  const boeGateway = new BoeApiGateway();
  // ── Bots del asistente público ─────────────────────────────────
  // Cada uno se activa solo si tiene clave. El administrador elige en caliente
  // cuál responde a TODOS y la elección se guarda en assistant.settings;
  // BOT_MODEL solo cuenta mientras no haya elegido nada. Añadir un proveedor es
  // añadir una línea aquí y su clave en .env.
  //
  // Todos van envueltos en ReviewedAssistant: los repasos son política del
  // servicio, no de un proveedor, así que no pueden depender de cuál se elija.
  // Con cero repasos también se conserva el plazo total de la consulta.
  const reviewed = (model: AssistantModel): AssistantModel =>
    new ReviewedAssistant(model, config.botReviewPasses);
  const bots: AssistantModel[] = [
    reviewed(new OpenAiAssistant(config.botOpenaiApiKey, metadata => logger.info(metadata, 'GPT respondió al asistente'))),
    reviewed(new MinimaxAssistant({
      apiKey: config.botMinimaxApiKey,
      baseUrl: config.botMinimaxBaseUrl,
      model: config.botMinimaxModel,
      onResponse: metadata => logger.info(metadata, 'MiniMax respondió al asistente'),
    })),
  ];
  const assistant = new AskBoe(catalog, new CachedOfficialTextReader(async id => {
    const parsed = BoeId.create(id);
    if (!parsed.ok) return null;
    const fresh = await boeGateway.fetchEntryContent(parsed.value, AbortSignal.timeout(5_000));
    if (fresh.ok) return fresh.value.text;
    // Una caída del BOE no impide leer la copia oficial de la ingesta.
    return (await entries.findById(parsed.value))?.rawText ?? null;
  }), bots, config.botModel, new PostgresBudget(db, config.botDailyTokens), new PostgresAssistantSettings(db));
  const ingest = new IngestDailyBulletin(
    boeGateway,
    entries,
    eventBus,
    logger,
    config.boeSections.split(","),
  );
  // Escucha a los demás módulos para llevar el estado de cada disposición
  // (pendiente → resumida → notificada).
  new TrackEntryProgress(entries, logger).register(eventBus);

  // ── Resúmenes ──────────────────────────────────────────────────
  const summaries = new PostgresSummaryRepository(db);
  new SummarizeEntry(
    new HttpSummarizer({
      baseUrl: config.aiBaseUrl,
      model: config.aiModel,
      apiKey: config.aiApiKey,
      review: config.aiReview,
      onReview: ({ changed }) => {
        if (changed) logger.info("La pasada de revisión corrigió el resumen");
      },
    }),
    summaries,
    eventBus,
    logger,
  ).register(eventBus);

  // ── Notificaciones (cada canal se activa solo si hay credenciales) ─
  const notifiers: Notifier[] = [];
  if (config.telegramBotToken && config.telegramChannel) {
    notifiers.push(new TelegramNotifier(config.telegramBotToken, config.telegramChannel));
  }
  if (config.discordWebhookUrl) {
    notifiers.push(new DiscordNotifier(config.discordWebhookUrl));
  }
  if (notifiers.length === 0) {
    notifiers.push(new ConsoleNotifier(logger));
  }
  const notificationLog = new PostgresNotificationLog(db);
  new NotifyEntry(
    notifiers,
    notificationLog,
    eventBus,
    logger,
    config.publicWebUrl,
    config.notifyMinImpact,
  ).register(eventBus);

  // Parte público del día. Comparte notificadores y registro de envíos con
  // `NotifyEntry`: son los mismos canales, y el mismo registro es lo que
  // impide que las tres pasadas del cron lo publiquen tres veces.
  const publishDayDigest = new PublishDayDigest(
    notifiers,
    notificationLog,
    logger,
    config.publicWebUrl,
    config.notifyMinImpact,
  );

  // ── Juego ──────────────────────────────────────────────────────
  // Fuera del bus a propósito: nada en el BOE depende de que alguien juegue,
  // así que no emite eventos ni se suscribe a ninguno.
  const partidas = new PostgresPartidaRepository(db);

  // Alertas de ops: MISMAS credenciales del bot, DESTINO distinto (chat
  // privado). Si falta TELEGRAM_ALERT_CHAT_ID, no se spamea el canal.
  let alerter: Alerter = new NoopAlerter();
  if (config.telegramBotToken && config.telegramAlertChatId) {
    alerter = new TelegramPrivateAlerter(
      config.telegramBotToken,
      config.telegramAlertChatId,
    );
  } else if (config.telegramBotToken && !config.telegramAlertChatId) {
    logger.warn(
      "TELEGRAM_ALERT_CHAT_ID no configurado: los fallos de ingesta no se avisan por privado",
    );
  }

  return {
    assistant,
    ingest,
    // Se construye aquí, con los mismos repositorios y el mismo bus, para que
    // reanudar sea indistinguible de haber ido bien a la primera.
    resume: new ResumePendingEntries(entries, summaries, eventBus, logger),
    dayStatus: new DailyStatusReader(entries),
    dayDigest: new CatalogDayDigestReader(catalog),
    publishDayDigest,
    catalog,
    spending: new PostgresConvocatoriaRepository(db),
    juego: partidas,
    registrarPartida: new RegistrarPartida(partidas, logger, RANKING_PUBLICO, PARTIDAS_DE_SALIDA),
    eventBus,
    channels: notifiers.map((n) => n.channel),
    alerter,
  };
}
