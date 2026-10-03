import cron from "node-cron";
import {
  datesForCronPass,
  todayIn,
  type IsoDate,
} from "../shared/domain/iso-date.js";
import type { Logger } from "../shared/logger/logger.js";
import type { IngestDailyBulletin, IngestReport } from "../modules/ingestion/index.js";
import type { Alerter, PublishDayDigest } from "../modules/notifications/index.js";
import type { ResumePendingEntries, ResumeReport } from "./resume-pending.js";
import { buildDailyReport, type DailyStatusReader, type DayStatus } from "./daily-report.js";
import type { DayDigestReader } from "./day-digest.js";
import type { ReadReviewStatus } from "../shared/domain/review-status.js";
import { createNextReview } from "./review-clock.js";

export interface SchedulerDeps {
  readonly ingest: IngestDailyBulletin;
  readonly resume: ResumePendingEntries;
  readonly status: DailyStatusReader;
  readonly logger: Logger;
  readonly alerter: Alerter;
  /** Recuento por impacto del día; alimenta el parte público. */
  readonly digestReader: DayDigestReader;
  /** Publica ese recuento en los canales públicos, una sola vez por día. */
  readonly digest: PublishDayDigest;
}

/**
 * Dispara la ingesta del día varias veces: la pasada principal a las 08:30 y
 * los reintentos que haya configurados (por defecto 10:00 y 12:00).
 *
 * Los reintentos existen porque el sumario del BOE no siempre está disponible
 * a las 08:30 —a veces se publica más tarde, a veces la API falla— y porque la
 * IA o un canal de notificación pueden estar caídos en ese momento. Cada
 * pasada hace dos cosas:
 *
 *   1. Reejecuta la ingesta. Es idempotente: si el día ya está entero, se
 *      queda en una petición al BOE y ni toca la IA.
 *   2. Reanuda lo que se quedó a medias (ver `ResumePendingEntries`), que es
 *      lo que la ingesta por sí sola NO puede arreglar.
 *
 * Además, por defecto reintenta también el día anterior (`lookbackDays`).
 * Así se cubre el boletín de ayer que salió después del último reintento, o
 * un día entero en el que el proceso estuvo caído, sin tener que lanzar la
 * CLI a mano. El parte diario y el veredicto principal siguen siendo de
 * hoy; de los días de lookback solo se avisa si hay algo que mirar.
 *
 * Nada se duplica: la idempotencia está en cada módulo, no aquí. Lo que sí
 * vigila este archivo es que dos pasadas no se solapen, porque ahí sí habría
 * carrera: dos procesos comprobando «¿ya se notificó?» a la vez, antes de que
 * ninguno haya anotado el envío, sí podrían publicar dos veces.
 *
 * Los fallos se avisan SOLO por el alerter privado (Telegram al chat del
 * responsable), nunca por el canal público de resúmenes. Y solo en el último
 * intento del día: un fallo transitorio a las 08:30 que se arregla solo a las
 * 10:00 no merece despertar a nadie.
 */
export function startScheduler(
  ingest: IngestDailyBulletin,
  resume: ResumePendingEntries,
  status: DailyStatusReader,
  schedules: readonly string[],
  timeZone: string,
  logger: Logger,
  alerter: Alerter,
  digestReader: DayDigestReader,
  digest: PublishDayDigest,
  lookbackDays = 1,
): ReadReviewStatus {
  let running = false;
  const nextReview = createNextReview(schedules, timeZone);
  const readReviewStatus: ReadReviewStatus = () => {
    const now = new Date();
    return { reviewing: running, nextReviewAt: nextReview(now)?.toISOString() ?? null,
      serverTime: now.toISOString(), timeZone };
  };
  if (schedules.length === 0) {
    logger.warn("Scheduler sin ninguna programación: la ingesta no se lanzará sola");
    return readReviewStatus;
  }

  // El parte diario sale en la segunda pasada: a las 08:30 la mañana aún puede
  // arreglarse sola y avisar entonces sería ruido. Si no hay reintentos
  // configurados, sale en la única que haya, porque un parte tardío sigue
  // siendo mejor que ninguno.
  const reportAttempt = Math.min(2, schedules.length);

  // Una pasada en curso bloquea la siguiente. Basta con una variable porque
  // todo esto vive en un único proceso Node; el día que haya varias réplicas
  // hará falta un cerrojo en la base de datos.
  // `running` también alimenta el indicador público, sin iniciar trabajo.

  // Recuerda si hoy ya falló algo, para poder avisar de que se ha resuelto.
  // Es información en memoria a propósito: si el proceso se reinicia, lo peor
  // que pasa es que no se mande el aviso de «resuelto».
  let failedToday: IsoDate | null = null;

  const deps: SchedulerDeps = { ingest, resume, status, logger, alerter, digestReader, digest };

  const runOnce = async (attempt: number): Promise<void> => {
    const isLast = attempt === schedules.length;

    if (running) {
      logger.warn(
        { attempt },
        "Cron: la pasada anterior sigue en marcha, se salta esta para no duplicar",
      );
      return;
    }
    running = true;

    try {
      const today = todayIn(timeZone);
      const outcome = await runScheduledPass(deps, {
        today,
        lookbackDays,
        attempt,
        totalAttempts: schedules.length,
        reportAttempt,
        previouslyFailedToday: failedToday === today,
      });
      failedToday = outcome.failedToday;
    } finally {
      running = false;
    }
  };

  schedules.forEach((expression, index) => {
    cron.schedule(expression, () => runOnce(index + 1), { timezone: timeZone });
  });

  logger.info(
    {
      schedule: schedules[0],
      retries: schedules.slice(1),
      lookbackDays,
      timeZone,
      privateAlerts: alerter.enabled,
    },
    "Scheduler iniciado",
  );
  return readReviewStatus;
}

export interface ScheduledPassOptions {
  readonly today: IsoDate;
  readonly lookbackDays: number;
  readonly attempt: number;
  readonly totalAttempts: number;
  readonly reportAttempt: number;
  /** Si la pasada anterior del mismo día civil dejó fallos pendientes. */
  readonly previouslyFailedToday: boolean;
}

export interface ScheduledPassResult {
  /** Fecha de hoy si sigue en fallo; null si hoy está sano. */
  readonly failedToday: IsoDate | null;
}

/**
 * Una pasada completa del cron (lookback + hoy + alertas). Exportada para
 * poder probar el lookback sin montar node-cron.
 */
export async function runScheduledPass(
  deps: SchedulerDeps,
  options: ScheduledPassOptions,
): Promise<ScheduledPassResult> {
  const { ingest, resume, status, logger, alerter } = deps;
  const { today, lookbackDays, attempt, totalAttempts, reportAttempt, previouslyFailedToday } =
    options;
  const isLast = attempt === totalAttempts;
  const dates = datesForCronPass(today, lookbackDays);

  logger.info(
    { today, dates, lookbackDays, attempt, of: totalAttempts },
    "Cron: arrancando pasada diaria",
  );

  // Primero los días de lookback (ayer, …), luego hoy. Así, si ayer se
  // perdió, se recupera antes de montar el parte de hoy.
  const catchUpNotes: string[] = [];
  for (const date of dates) {
    if (date === today) continue;
    const note = await processCatchUpDay(date, ingest, resume, status, logger);
    if (note) catchUpNotes.push(note);
  }

  const todayOutcome = await processDay(today, ingest, resume, status, logger);
  if (!todayOutcome.ingestOk) {
    if (isLast || attempt === reportAttempt) {
      await notifyOps(
        alerter,
        logger,
        `BOE ${today}\n\n⚠️ La ingesta ha fallado${isLast ? ` en los ${totalAttempts} intentos del día` : ""}.\n\n${todayOutcome.ingestError}`,
      );
    }
    // Aunque hoy falle del todo, si el lookback recuperó o dejó fallos
    // visibles, conviene decirlo en el último intento (o en el del parte).
    if ((isLast || attempt === reportAttempt) && catchUpNotes.length > 0) {
      await notifyOps(alerter, logger, ["BOE lookback", "", ...catchUpNotes].join("\n"));
    }
    return { failedToday: today };
  }

  const { report, resumed, day } = todayOutcome;
  const healthy = day.ok && report.failures === 0 && resumed.failures === 0;

  logger.info(
    {
      date: today,
      attempt,
      bulletinPublished: report.bulletinPublished,
      newEntries: report.newEntries,
      skippedExisting: report.skippedExisting,
      resummarized: resumed.resummarized,
      renotified: resumed.renotified,
      day,
      catchUpNotes: catchUpNotes.length,
    },
    "Cron: pasada terminada",
  );

  // Parte público del día: cuántas disposiciones trae y con qué impacto, con
  // el enlace a la web. Va al canal, no al chat privado, y no sustituye a
  // nada: los resúmenes de impacto >= NOTIFY_MIN_IMPACT siguen saliendo uno a
  // uno durante la ingesta.
  //
  // Sale en la misma pasada que el parte de operación, que es cuando el día
  // se da por cerrado. Si a esas alturas queda algo sin resumir, se espera al
  // último intento antes que publicar un recuento que se sabe incompleto;
  // como `PublishDayDigest` es idempotente, esperar no arriesga duplicarlo.
  if (attempt >= reportAttempt && (day.ok || isLast)) {
    await publishDayDigest(deps, today);
  }

  // Como mucho un mensaje por pasada del día de hoy, y siempre al chat
  // privado. El lookback se añade debajo si hay algo que mirar.
  if (attempt === reportAttempt) {
    const body = buildDailyReport(today, day, report.bulletinPublished, !isLast);
    const withCatchUp =
      catchUpNotes.length > 0
        ? `${body}\n\n—— Lookback ——\n${catchUpNotes.join("\n")}`
        : body;
    await notifyOps(alerter, logger, withCatchUp);
  } else if (isLast && !healthy) {
    await notifyOps(
      alerter,
      logger,
      [
        `BOE ${today}`,
        "",
        `⚠️ Siguen quedando fallos tras los ${totalAttempts} intentos del día.`,
        `Sin resumen: ${day.pending} · Sin notificar: ${day.summarized} · Fallidas: ${day.failed}`,
        ...(catchUpNotes.length > 0 ? ["", "—— Lookback ——", ...catchUpNotes] : []),
      ].join("\n"),
    );
  } else if (healthy && previouslyFailedToday && attempt > 1) {
    await notifyOps(
      alerter,
      logger,
      `BOE ${today}\n\n✅ Resuelto en el intento ${attempt}. Ya está todo publicado.`,
    );
  } else if (isLast && catchUpNotes.length > 0) {
    // Hoy bien, pero el lookback dejó rastro (recuperación o fallos).
    await notifyOps(alerter, logger, ["BOE lookback", "", ...catchUpNotes].join("\n"));
  }

  return { failedToday: healthy ? null : today };
}

interface DayOutcome {
  readonly ingestOk: true;
  readonly report: IngestReport;
  readonly resumed: ResumeReport;
  readonly day: DayStatus;
}

interface DayIngestFailed {
  readonly ingestOk: false;
  readonly ingestError: string;
}

async function processDay(
  date: IsoDate,
  ingest: IngestDailyBulletin,
  resume: ResumePendingEntries,
  status: DailyStatusReader,
  logger: Logger,
): Promise<DayOutcome | DayIngestFailed> {
  const result = await ingest.execute(date);
  if (!result.ok) {
    logger.error({ date, error: result.error.message }, "Cron: la ingesta falló");
    return { ingestOk: false, ingestError: result.error.message };
  }

  const report = result.value;
  const resumed = await resume.execute(date);

  // El veredicto sale de la base de datos, no de lo que esta pasada creyó
  // hacer: a las 10:00 lo normal es que la ingesta no traiga nada nuevo
  // porque ya está todo de las 08:30, y eso no significa que vaya bien.
  const day = await status.read(date);
  return { ingestOk: true, report, resumed, day };
}

/**
 * Procesa un día del lookback. Devuelve una línea para el parte de ops solo
 * si hay algo que merezca atención o se haya recuperado trabajo perdido.
 * Si el día ya estaba bien (caso normal), no dice nada.
 */
async function processCatchUpDay(
  date: IsoDate,
  ingest: IngestDailyBulletin,
  resume: ResumePendingEntries,
  status: DailyStatusReader,
  logger: Logger,
): Promise<string | null> {
  const outcome = await processDay(date, ingest, resume, status, logger);
  if (!outcome.ingestOk) {
    logger.warn({ date, error: outcome.ingestError }, "Cron lookback: ingesta falló");
    return `${date}: ⚠️ ingesta falló — ${outcome.ingestError}`;
  }

  const { report, resumed, day } = outcome;
  const recovered =
    report.newEntries > 0 || resumed.resummarized > 0 || resumed.renotified > 0;
  const unhealthy = !day.ok || report.failures > 0 || resumed.failures > 0;

  logger.info(
    {
      date,
      bulletinPublished: report.bulletinPublished,
      newEntries: report.newEntries,
      skippedExisting: report.skippedExisting,
      resummarized: resumed.resummarized,
      renotified: resumed.renotified,
      day,
    },
    "Cron lookback: día procesado",
  );

  if (!recovered && !unhealthy) return null;

  if (unhealthy) {
    return (
      `${date}: ⚠️ sin resumen ${day.pending}, sin notificar ${day.summarized}, ` +
      `fallidas ${day.failed}` +
      (report.newEntries > 0 ? ` · nuevas ${report.newEntries}` : "")
    );
  }

  return (
    `${date}: ✅ recuperado` +
    (report.newEntries > 0 ? ` · ${report.newEntries} nueva(s)` : "") +
    (resumed.resummarized > 0 ? ` · ${resumed.resummarized} re-resumida(s)` : "") +
    (resumed.renotified > 0 ? ` · ${resumed.renotified} re-notificada(s)` : "")
  );
}

/**
 * Publica el recuento del día en los canales públicos. Los fallos se tragan
 * a propósito: la ingesta y los resúmenes ya están hechos, y que el parte no
 * salga no puede tumbar la pasada ni marcar el día como averiado. El intento
 * siguiente lo reintentará, porque el registro de envíos solo da por bueno
 * lo que salió bien.
 */
async function publishDayDigest(deps: SchedulerDeps, date: IsoDate): Promise<void> {
  const { digestReader, digest, logger } = deps;
  try {
    await digest.execute(await digestReader.read(date));
  } catch (error) {
    logger.error(
      { date, error: error instanceof Error ? error.message : String(error) },
      "No se pudo publicar el parte del día",
    );
  }
}

async function notifyOps(alerter: Alerter, logger: Logger, text: string): Promise<void> {
  if (!alerter.enabled) {
    logger.warn({ text }, "Alerta de ops no enviada: sin chat privado configurado");
    return;
  }
  const sent = await alerter.send(text);
  if (!sent.ok) {
    logger.error({ error: sent.error.message }, "No se pudo enviar la alerta privada");
  }
}
