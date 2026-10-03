import { pino } from "pino";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import cron from "node-cron";

import { isoDate, type IsoDate } from "../shared/domain/iso-date.js";
import { err, ok } from "../shared/domain/result.js";
import type { IngestReport } from "../modules/ingestion/index.js";
import type { Alerter, DayDigest } from "../modules/notifications/index.js";
import { runScheduledPass, startScheduler, type SchedulerDeps } from "./cron.js";
import type { DayStatus } from "./daily-report.js";
import { buildDayDigest } from "./day-digest.js";
import type { ResumeReport } from "./resume-pending.js";

const logger = pino({ level: "silent" });

function day(raw: string): IsoDate {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

const HOY = day("2026-08-11");
const AYER = day("2026-08-10");

function ingestReport(
  date: IsoDate,
  overrides: Partial<IngestReport> = {},
): IngestReport {
  return {
    date,
    bulletinPublished: true,
    newEntries: 0,
    skippedExisting: 3,
    failures: 0,
    ...overrides,
  };
}

function resumeReport(overrides: Partial<ResumeReport> = {}): ResumeReport {
  return { resummarized: 0, renotified: 0, failures: 0, ...overrides };
}

function healthyDay(overrides: Partial<DayStatus> = {}): DayStatus {
  return {
    total: 3,
    pending: 0,
    summarized: 0,
    notified: 3,
    failed: 0,
    ok: true,
    ...overrides,
  };
}

function makeDeps(options?: {
  ingestByDate?: Record<string, IngestReport | Error>;
  dayByDate?: Record<string, DayStatus>;
  resumeByDate?: Record<string, ResumeReport>;
  /** Impactos del día, tal y como los devolvería el catálogo. */
  impactsByDate?: Record<string, readonly (number | null)[]>;
}): SchedulerDeps & {
  alerts: string[];
  ingestDates: IsoDate[];
  resumeDates: IsoDate[];
  published: DayDigest[];
} {
  const alerts: string[] = [];
  const ingestDates: IsoDate[] = [];
  const resumeDates: IsoDate[] = [];
  const published: DayDigest[] = [];

  const alerter: Alerter = {
    enabled: true,
    send: async (text) => {
      alerts.push(text);
      return ok(undefined);
    },
  };

  const ingest = {
    execute: vi.fn(async (date: IsoDate) => {
      ingestDates.push(date);
      const configured = options?.ingestByDate?.[date];
      if (configured instanceof Error) return err(configured);
      return ok(configured ?? ingestReport(date));
    }),
  };

  const resume = {
    execute: vi.fn(async (date: IsoDate) => {
      resumeDates.push(date);
      return options?.resumeByDate?.[date] ?? resumeReport();
    }),
  };

  const status = {
    read: vi.fn(async (date: IsoDate) => options?.dayByDate?.[date] ?? healthyDay()),
  };

  const digestReader = {
    read: vi.fn(async (date: IsoDate) =>
      buildDayDigest(
        date,
        (options?.impactsByDate?.[date] ?? [3, 1, 1]).map((impact) => ({ impact })),
      ),
    ),
  };

  // Doble del publicador: aquí solo interesa CUÁNDO se le llama. Que no
  // publique dos veces lo mismo es cosa suya y se prueba en su propio test.
  const digest = {
    execute: vi.fn(async (value: DayDigest) => {
      published.push(value);
    }),
  };

  return {
    ingest: ingest as unknown as SchedulerDeps["ingest"],
    resume: resume as unknown as SchedulerDeps["resume"],
    status: status as unknown as SchedulerDeps["status"],
    logger,
    alerter,
    digestReader,
    digest: digest as unknown as SchedulerDeps["digest"],
    alerts,
    ingestDates,
    resumeDates,
    published,
  };
}

const baseOptions = {
  today: HOY,
  lookbackDays: 1,
  attempt: 2,
  totalAttempts: 3,
  reportAttempt: 2,
  previouslyFailedToday: false,
} as const;

describe("estado público del scheduler", () => {
  afterEach(() => vi.restoreAllMocks());

  function start(deps: SchedulerDeps) {
    const callbacks: Array<() => Promise<void>> = [];
    vi.spyOn(cron, "schedule").mockImplementation((_expression, callback) => {
      callbacks.push(callback as () => Promise<void>);
      return {} as ReturnType<typeof cron.schedule>;
    });
    const read = startScheduler(deps.ingest, deps.resume, deps.status,
      ["30 8 * * *", "0 10 * * *", "0 12 * * *"], "Europe/Madrid",
      deps.logger, deps.alerter, deps.digestReader, deps.digest, 0);
    return { read, run: callbacks[0]! };
  }

  it("refleja el trabajo real y mantiene la protección contra pasadas solapadas", async () => {
    const deps = makeDeps();
    let finish!: () => void;
    const gate = new Promise<void>((resolve) => { finish = resolve; });
    vi.mocked(deps.ingest.execute).mockImplementation(async (date) => {
      await gate;
      return ok(ingestReport(date));
    });
    const { read, run } = start(deps);
    expect(read().reviewing).toBe(false);
    const running = run();
    expect(read().reviewing).toBe(true);
    await run();
    expect(deps.ingest.execute).toHaveBeenCalledTimes(1);
    finish();
    await running;
    expect(read().reviewing).toBe(false);
    expect(read().nextReviewAt).not.toBeNull();
  });

  it("no deja el spinner activo si una pasada lanza un error inesperado", async () => {
    const deps = makeDeps();
    vi.mocked(deps.ingest.execute).mockRejectedValueOnce(new Error("Fallo de prueba"));
    const { read, run } = start(deps);
    await expect(run()).rejects.toThrow("Fallo de prueba");
    expect(read().reviewing).toBe(false);
  });
});

describe("runScheduledPass — lookback", () => {
  let deps: ReturnType<typeof makeDeps>;

  beforeEach(() => {
    deps = makeDeps();
  });

  it("procesa ayer y luego hoy cuando lookbackDays=1", async () => {
    await runScheduledPass(deps, baseOptions);

    expect(deps.ingestDates).toEqual([AYER, HOY]);
    expect(deps.resumeDates).toEqual([AYER, HOY]);
  });

  it("con lookbackDays=0 solo procesa hoy", async () => {
    await runScheduledPass(deps, { ...baseOptions, lookbackDays: 0 });

    expect(deps.ingestDates).toEqual([HOY]);
    expect(deps.resumeDates).toEqual([HOY]);
  });

  it("si ayer ya estaba bien, el parte de hoy no menciona lookback", async () => {
    await runScheduledPass(deps, baseOptions);

    expect(deps.alerts).toHaveLength(1);
    expect(deps.alerts[0]).toContain(`BOE ${HOY}`);
    expect(deps.alerts[0]).not.toContain("Lookback");
    expect(deps.alerts[0]).not.toContain(AYER);
  });

  it("si ayer trae disposiciones nuevas, las anota en el parte", async () => {
    deps = makeDeps({
      ingestByDate: {
        [AYER]: ingestReport(AYER, { newEntries: 2, skippedExisting: 0 }),
      },
    });

    await runScheduledPass(deps, baseOptions);

    expect(deps.alerts).toHaveLength(1);
    expect(deps.alerts[0]).toContain("Lookback");
    expect(deps.alerts[0]).toContain(`${AYER}: ✅ recuperado · 2 nueva(s)`);
  });

  it("si ayer sigue con fallos, avisa en el lookback", async () => {
    deps = makeDeps({
      dayByDate: {
        [AYER]: healthyDay({
          total: 2,
          pending: 1,
          notified: 1,
          ok: false,
        }),
      },
    });

    await runScheduledPass(deps, baseOptions);

    expect(deps.alerts[0]).toContain("Lookback");
    expect(deps.alerts[0]).toContain(`${AYER}: ⚠️ sin resumen 1`);
  });

  it("si la ingesta de ayer revienta, hoy se procesa igual", async () => {
    deps = makeDeps({
      ingestByDate: {
        [AYER]: new Error("API BOE caída"),
      },
    });

    const result = await runScheduledPass(deps, baseOptions);

    expect(deps.ingestDates).toEqual([AYER, HOY]);
    expect(result.failedToday).toBeNull();
    expect(deps.alerts[0]).toContain(`${AYER}: ⚠️ ingesta falló`);
    expect(deps.alerts[0]).toContain(`BOE ${HOY}`);
  });

  it("si hoy falla la ingesta, sigue marcando el día como fallido", async () => {
    deps = makeDeps({
      ingestByDate: {
        [HOY]: new Error("timeout"),
      },
    });

    const result = await runScheduledPass(deps, baseOptions);

    expect(result.failedToday).toBe(HOY);
    expect(deps.alerts.some((text) => text.includes("La ingesta ha fallado"))).toBe(true);
  });
});

describe("runScheduledPass — parte público del día", () => {
  it("lo publica en la pasada del parte, con el recuento de hoy", async () => {
    const deps = makeDeps({ impactsByDate: { [HOY]: [5, 3, 3, 1, null] } });

    await runScheduledPass(deps, baseOptions);

    expect(deps.published).toHaveLength(1);
    expect(deps.published[0]).toMatchObject({
      date: HOY,
      total: 5,
      byImpact: [1, 0, 2, 0, 1],
      withoutSummary: 1,
    });
  });

  it("no lo publica en la primera pasada: el día aún puede moverse", async () => {
    const deps = makeDeps();

    await runScheduledPass(deps, { ...baseOptions, attempt: 1 });

    expect(deps.published).toEqual([]);
  });

  it("espera al último intento si el día aún tiene disposiciones a medias", async () => {
    const aMedias = healthyDay({ pending: 2, notified: 1, ok: false });
    const deps = makeDeps({ dayByDate: { [HOY]: aMedias } });

    await runScheduledPass(deps, baseOptions);
    expect(deps.published).toEqual([]);

    await runScheduledPass(deps, { ...baseOptions, attempt: 3 });
    expect(deps.published).toHaveLength(1);
  });

  it("no publica nada de los días del lookback: el parte es solo de hoy", async () => {
    const deps = makeDeps();

    await runScheduledPass(deps, baseOptions);

    expect(deps.published.map((digest) => digest.date)).toEqual([HOY]);
  });

  it("si la ingesta de hoy falla no hay parte que publicar", async () => {
    const deps = makeDeps({ ingestByDate: { [HOY]: new Error("BOE caído") } });

    await runScheduledPass(deps, baseOptions);

    expect(deps.published).toEqual([]);
  });

  it("un fallo al publicarlo no tumba la pasada ni marca el día como averiado", async () => {
    const deps = makeDeps();
    deps.digest.execute = vi.fn(async () => {
      throw new Error("Telegram caído");
    });

    const result = await runScheduledPass(deps, baseOptions);

    expect(result.failedToday).toBeNull();
    // El parte de operación sí salió: el público no es un bloqueante.
    expect(deps.alerts).toHaveLength(1);
  });
});
