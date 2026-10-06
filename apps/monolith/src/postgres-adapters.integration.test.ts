/**
 * Tests de integración de los adapters de Postgres.
 *
 * Necesitan un Postgres real levantado (`docker compose up -d db`) y se
 * ejecutan con `npm run test:integration`, aparte de los unitarios.
 * Usan su propia base de datos (`..._test`), que se crea sola: nunca tocan
 * los datos reales.
 */
import { sql } from "drizzle-orm";
import { pino } from "pino";
import postgres from "postgres";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createDatabase, type Database, type DatabaseHandle } from "./shared/db/connection.js";
import { runMigrations } from "./shared/db/migrate.js";
import { BoeId } from "./shared/domain/boe-id.js";
import { isoDate, todayIn, type IsoDate } from "./shared/domain/iso-date.js";
import { InMemoryEventBus } from "./shared/event-bus/in-memory-event-bus.js";
import { BoeEntry, entryIngested, PostgresEntryRepository } from "./modules/ingestion/index.js";
import { PostgresSummaryRepository, summaryGenerated } from "./modules/summarization/index.js";
import { PostgresNotificationLog } from "./modules/notifications/index.js";
import { PostgresCatalogProjection } from "./modules/catalog/index.js";
import { PostgresConvocatoriaRepository, urlOficialDe } from "./modules/spending/index.js";
import { PostgresBudget } from "./modules/assistant/infrastructure/postgres-budget.js";

const logger = pino({ level: "silent" });

const BASE_URL =
  process.env["DATABASE_URL"] ?? "postgres://boe:boe@localhost:5432/boe_inspector";
const TEST_DB = "boe_inspector_test";

function urlForDatabase(name: string): string {
  const url = new URL(BASE_URL);
  url.pathname = `/${name}`;
  return url.toString();
}

/** Crea la base de datos de test si no existe, conectándose a `postgres`. */
async function ensureTestDatabase(): Promise<void> {
  const admin = postgres(urlForDatabase("postgres"), { max: 1, onnotice: () => {} });
  try {
    const existing = await admin`select 1 from pg_database where datname = ${TEST_DB}`;
    if (existing.length === 0) {
      await admin.unsafe(`create database "${TEST_DB}"`);
    }
  } finally {
    await admin.end();
  }
}

let handle: DatabaseHandle;
let db: Database;

beforeAll(async () => {
  await ensureTestDatabase();
  handle = createDatabase(urlForDatabase(TEST_DB));
  db = handle.db;
  await runMigrations(db);
}, 60_000);

afterAll(async () => {
  await handle?.close();
});

beforeEach(async () => {
  await db.execute(
    sql.raw(
      "truncate ingestion.entries, summarization.summaries, notifications.notification_log, catalog.entries, spending.convocatorias, assistant.usage restart identity",
    ),
  );
});

// ── Helpers ──────────────────────────────────────────────────────

function id(raw: string): BoeId {
  const parsed = BoeId.create(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

function day(raw: string): IsoDate {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

function anEntry(rawId = "BOE-A-2026-16758"): BoeEntry {
  return BoeEntry.ingest({
    id: id(rawId),
    publicationDate: day("2026-08-01"),
    section: "1",
    department: "COMUNIDAD AUTÓNOMA DE CATALUÑA",
    title: "Resolución ISP/1933/2026, de 15 de junio",
    officialHtmlUrl: `https://www.boe.es/diario_boe/txt.php?id=${rawId}`,
    officialPdfUrl: `https://www.boe.es/boe/dias/2026/08/01/pdfs/${rawId}.pdf`,
    officialXmlUrl: `https://www.boe.es/diario_boe/xml.php?id=${rawId}`,
    rawText: "Texto oficial de la disposición.",
    // Distinta de la fecha de publicación a propósito: es la que exigen las
    // condiciones de reutilización del BOE y la que más fácil se confunde.
    lastOfficialUpdateAt: day("2026-08-04"),
  });
}

// ── ingestion ────────────────────────────────────────────────────

describe("PostgresBudget", () => {
  it("permite la décima consulta y rechaza la undécima sin consumir cuota global", async () => {
    const budget = new PostgresBudget(db, 200_000);
    const today = todayIn("Europe/Madrid");
    await db.execute(sql`INSERT INTO assistant.usage (bucket,day,requests,tokens) VALUES ('user:quota-test',${today},9,900)`);

    await expect(budget.reserve("quota-test", 100)).resolves.toBe(`${today}|user:quota-test`);
    const afterTenth = await db.execute(sql`SELECT bucket,requests,tokens FROM assistant.usage WHERE day=${today} ORDER BY bucket`);
    expect(afterTenth.map(row => ({ bucket: row.bucket, requests: Number(row.requests), tokens: Number(row.tokens) }))).toEqual([
      { bucket: "global", requests: 1, tokens: 100 },
      { bucket: "user:quota-test", requests: 10, tokens: 1000 },
    ]);

    await expect(budget.reserve("quota-test", 100)).rejects.toMatchObject({
      status: 429,
      message: "Has utilizado tus 10 consultas de hoy. Podrás volver a preguntar mañana (hora de Madrid).",
    });
    expect(await db.execute(sql`SELECT bucket,requests,tokens FROM assistant.usage WHERE day=${today} ORDER BY bucket`)).toEqual(afterTenth);
  });

  it("renueva la cuota al cambiar el día de Madrid y mantiene al administrador sin límite", async () => {
    const budget = new PostgresBudget(db, 200_000);
    const today = todayIn("Europe/Madrid");
    await db.execute(sql`INSERT INTO assistant.usage (bucket,day,requests,tokens) VALUES ('user:quota-test',${today}::date - 1,10,1000)`);
    await expect(budget.reserve("quota-test", 100)).resolves.toBe(`${today}|user:quota-test`);
    await db.execute(sql`UPDATE assistant.usage SET requests=10 WHERE bucket='user:quota-test' AND day=${today}`);
    await expect(budget.reserve("quota-test", 100, true)).resolves.toBe("admin");
    const current = await db.execute(sql`SELECT requests FROM assistant.usage WHERE bucket='user:quota-test' AND day=${today}`);
    expect(Number(current[0]!.requests)).toBe(10);
  });
});

describe("PostgresEntryRepository", () => {
  it("guarda y recupera una disposición sin perder ningún campo", async () => {
    const repository = new PostgresEntryRepository(db);
    await repository.save(anEntry());

    const found = await repository.findById(id("BOE-A-2026-16758"));
    expect(found).not.toBeNull();

    const props = found!.toProps();
    expect(props.id.value).toBe("BOE-A-2026-16758");
    expect(props.section).toBe("1");
    expect(props.rawText).toBe("Texto oficial de la disposición.");
    expect(props.status).toBe("pending");
    expect(props.publicationDate).toBe("2026-08-01");
    expect(props.lastOfficialUpdateAt).toBe("2026-08-04");
  });

  it("no duplica al guardar dos veces la misma clave natural", async () => {
    const repository = new PostgresEntryRepository(db);
    await repository.save(anEntry());
    await repository.save(anEntry());

    expect(await repository.exists(id("BOE-A-2026-16758"))).toBe(true);
    expect(await repository.findByStatus("pending")).toHaveLength(1);
  });

  it("persiste las transiciones de estado", async () => {
    const repository = new PostgresEntryRepository(db);
    const entry = anEntry();
    await repository.save(entry);

    entry.markSummarized();
    await repository.save(entry);
    expect(await repository.findByStatus("summarized")).toHaveLength(1);

    entry.markNotified();
    await repository.save(entry);
    expect(await repository.findByStatus("pending")).toHaveLength(0);
    expect(await repository.findByStatus("notified")).toHaveLength(1);
  });
});

// ── summarization ────────────────────────────────────────────────

describe("PostgresSummaryRepository", () => {
  const summary = {
    entryId: "BOE-A-2026-16758",
    plainTitle: "Cambios de horario para camiones de mercancías peligrosas",
    shortPhrase: "Se modifican las restricciones de circulación.",
    bulletPoints: ["Primer punto", "Segundo punto"],
    impact: 2 as const,
    model: "MiniMax-M3",
    generatedAt: new Date("2026-08-06T10:00:00Z"),
  };

  it("guarda y recupera el resumen con sus puntos", async () => {
    const repository = new PostgresSummaryRepository(db);
    await repository.save(summary);

    const found = await repository.findByEntryId("BOE-A-2026-16758");
    expect(found?.plainTitle).toBe(summary.plainTitle);
    expect(found?.shortPhrase).toBe(summary.shortPhrase);
    expect(found?.bulletPoints).toEqual(["Primer punto", "Segundo punto"]);
    expect(found?.impact).toBe(2);
    expect(found?.model).toBe("MiniMax-M3");
  });

  it("devuelve null cuando no hay resumen todavía", async () => {
    const repository = new PostgresSummaryRepository(db);
    expect(await repository.findByEntryId("BOE-A-2026-99999")).toBeNull();
  });

  it("sobrescribe al regenerar en lugar de fallar", async () => {
    const repository = new PostgresSummaryRepository(db);
    await repository.save(summary);
    await repository.save({ ...summary, shortPhrase: "Frase corregida." });

    const found = await repository.findByEntryId("BOE-A-2026-16758");
    expect(found?.shortPhrase).toBe("Frase corregida.");
  });
});

// ── notifications ────────────────────────────────────────────────

describe("PostgresNotificationLog", () => {
  it("solo da por enviado lo que tuvo éxito", async () => {
    const log = new PostgresNotificationLog(db);

    await log.record({
      entryId: "BOE-A-2026-16758",
      channel: "telegram",
      sentAt: new Date(),
      success: false,
    });
    expect(await log.wasSent("BOE-A-2026-16758", "telegram")).toBe(false);

    await log.record({
      entryId: "BOE-A-2026-16758",
      channel: "telegram",
      sentAt: new Date(),
      success: true,
    });
    expect(await log.wasSent("BOE-A-2026-16758", "telegram")).toBe(true);
  });

  it("lleva la cuenta por canal, no por disposición", async () => {
    const log = new PostgresNotificationLog(db);
    await log.record({
      entryId: "BOE-A-2026-16758",
      channel: "telegram",
      sentAt: new Date(),
      success: true,
    });

    expect(await log.wasSent("BOE-A-2026-16758", "telegram")).toBe(true);
    expect(await log.wasSent("BOE-A-2026-16758", "discord")).toBe(false);
  });
});

// ── catalog ──────────────────────────────────────────────────────

describe("PostgresCatalogProjection", () => {
  const ingested = entryIngested({
    entryId: "BOE-A-2026-16758",
    publicationDate: day("2026-08-01"),
    department: "COMUNIDAD AUTÓNOMA DE CATALUÑA",
    title: "Resolución ISP/1933/2026",
    officialHtmlUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-16758",
    officialPdfUrl: "https://www.boe.es/boe/dias/2026/08/01/pdfs/BOE-A-2026-16758.pdf",
    text: "Texto oficial.",
    lastOfficialUpdateAt: day("2026-08-04"),
  });

  const summarized = summaryGenerated({
    entryId: "BOE-A-2026-16758",
    publicationDate: day("2026-08-01"),
    lastOfficialUpdateAt: day("2026-08-04"),
    department: "COMUNIDAD AUTÓNOMA DE CATALUÑA",
    title: "Resolución ISP/1933/2026",
    plainTitle: "Cambios de horario para camiones de mercancías peligrosas",
    shortPhrase: "Se modifican las restricciones de circulación.",
    bulletPoints: ["Primer punto", "Segundo punto"],
    impact: 2,
    officialHtmlUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-16758",
    model: "MiniMax-M3",
  });

  function projection(): { catalog: PostgresCatalogProjection; bus: InMemoryEventBus } {
    const bus = new InMemoryEventBus(logger);
    const catalog = new PostgresCatalogProjection(db, logger);
    catalog.register(bus);
    return { catalog, bus };
  }

  it("proyecta la disposición en cuanto se ingiere, aunque no haya resumen", async () => {
    const { catalog, bus } = projection();
    await bus.publish(ingested);

    const view = await catalog.getEntry("BOE-A-2026-16758");
    expect(view?.title).toBe("Resolución ISP/1933/2026");
    // Sin resumen todavía: la web cae al título oficial y no pinta impacto.
    expect(view?.plainTitle).toBeNull();
    expect(view?.impact).toBeNull();
    expect(view?.shortPhrase).toBeNull();
    // La fecha de actualización oficial viaja en el evento; confundirla con
    // la de publicación incumpliría las condiciones de reutilización.
    expect(view?.lastOfficialUpdateAt).toBe("2026-08-04");
  });

  it("añade el resumen cuando llega", async () => {
    const { catalog, bus } = projection();
    await bus.publish(ingested);
    await bus.publish(summarized);

    const view = await catalog.getEntry("BOE-A-2026-16758");
    expect(view?.plainTitle).toBe("Cambios de horario para camiones de mercancías peligrosas");
    expect(view?.shortPhrase).toBe("Se modifican las restricciones de circulación.");
    expect(view?.bulletPoints).toEqual(["Primer punto", "Segundo punto"]);
    expect(view?.impact).toBe(2);
    expect(view?.model).toBe("MiniMax-M3");
  });

  it("no borra el resumen si se vuelve a ingerir el mismo día", async () => {
    const { catalog, bus } = projection();
    await bus.publish(ingested);
    await bus.publish(summarized);
    await bus.publish(ingested);

    const view = await catalog.getEntry("BOE-A-2026-16758");
    expect(view?.shortPhrase).toBe("Se modifican las restricciones de circulación.");
  });

  it("avisa a gritos si el resumen llega antes que la disposición", async () => {
    // Este es el fallo real que tuvo la primera versión: el bus entrega en
    // orden de suscripción y `SummarizeEntry` publica `summary-generated`
    // dentro de su propio handler, así que si el catálogo se suscribe
    // después, el UPDATE no encuentra fila y el resumen se pierde. Antes
    // ocurría en silencio; ahora tiene que quedar registrado.
    const errors: string[] = [];
    const capturing = pino(
      { level: "error" },
      { write: (line: string) => errors.push(line) },
    );

    const bus = new InMemoryEventBus(capturing);
    const catalog = new PostgresCatalogProjection(db, capturing);
    catalog.register(bus);

    await bus.publish(summarized); // sin el `ingested` previo

    expect(await catalog.getEntry("BOE-A-2026-16758")).toBeNull();
    expect(errors.join("\n")).toContain("no está en el catálogo");
  });

  it("agrupa por día, del más reciente al más antiguo", async () => {
    const { catalog, bus } = projection();
    await bus.publish(ingested);
    await bus.publish({
      ...ingested,
      payload: {
        ...ingested.payload,
        entryId: "BOE-A-2026-16800",
        publicationDate: day("2026-08-03"),
      },
    });

    const days = await catalog.listDays(10);
    expect(days.map((d) => d.date)).toEqual(["2026-08-03", "2026-08-01"]);
    expect(days[0]?.entries).toHaveLength(1);

    const first = await catalog.getDay(day("2026-08-01"));
    expect(first?.entries).toHaveLength(1);
    expect(await catalog.getDay(day("2026-07-01"))).toBeNull();
  });
});

describe("PostgresConvocatoriaRepository (lectura)", () => {
  function convocatoria(
    codigo: string,
    fecha: string,
    directa: boolean | null,
    importe: string | null,
    nivel2 = "MINISTERIO DE PRUEBAS",
  ) {
    return {
      codigoBdns: codigo,
      fechaRecepcion: day(fecha),
      descripcion: `Convocatoria ${codigo}`,
      tipoConvocatoria: directa === null ? "Vete a saber" : "Concesión directa - canónica",
      esConcesionDirecta: directa,
      nivel1: "ESTADO",
      nivel2,
      nivel3: null,
      presupuestoTotal: importe,
      urlBasesReguladoras: null,
      urlOficial: urlOficialDe(codigo),
    };
  }

  it("reparte el periodo en los tres regímenes y no se come las no clasificadas", async () => {
    const repo = new PostgresConvocatoriaRepository(db);
    await repo.save(convocatoria("1", "2026-08-02", true, "300.00"));
    await repo.save(convocatoria("2", "2026-08-03", false, "700.00"));
    await repo.save(convocatoria("3", "2026-08-04", null, "50.00"));
    // Fuera del periodo: no debe contarse.
    await repo.save(convocatoria("4", "2026-09-01", true, "9999.00"));

    const reparto = await repo.reparto(day("2026-08-01"), day("2026-08-08"));

    expect(reparto.directas).toEqual({ convocatorias: 1, importe: "300.00" });
    expect(reparto.competitivas).toEqual({ convocatorias: 1, importe: "700.00" });
    expect(reparto.sinClasificar).toEqual({ convocatorias: 1, importe: "50.00" });
  });

  it("devuelve cero, y no null, cuando un régimen no tiene ninguna", async () => {
    const repo = new PostgresConvocatoriaRepository(db);
    await repo.save(convocatoria("1", "2026-08-02", true, "300.00"));

    const reparto = await repo.reparto(day("2026-08-01"), day("2026-08-08"));

    expect(reparto.competitivas).toEqual({ convocatorias: 0, importe: "0" });
    expect(reparto.sinClasificar).toEqual({ convocatorias: 0, importe: "0" });
  });

  it("informa del periodo realmente cargado", async () => {
    const repo = new PostgresConvocatoriaRepository(db);
    expect(await repo.cobertura()).toBeNull();

    await repo.save(convocatoria("1", "2026-08-05", true, "1.00"));
    await repo.save(convocatoria("2", "2026-08-01", true, "1.00"));
    await repo.save(convocatoria("3", "2026-08-08", true, "1.00"));

    expect(await repo.cobertura()).toEqual({
      desde: "2026-08-01",
      hasta: "2026-08-08",
      convocatorias: 3,
    });
  });

  it("agrupa las directas por administración y las ordena por dinero", async () => {
    const repo = new PostgresConvocatoriaRepository(db);
    await repo.save(convocatoria("1", "2026-08-02", true, "100.00", "MINISTERIO PEQUEÑO"));
    await repo.save(convocatoria("2", "2026-08-02", true, "900.00", "MINISTERIO GRANDE"));
    await repo.save(convocatoria("3", "2026-08-02", false, "5000.00", "MINISTERIO PEQUEÑO"));

    const resumen = await repo.resumenDirectas(day("2026-08-01"), day("2026-08-08"));

    // La competitiva de 5.000 no aparece: este informe es solo de directas.
    expect(resumen.map((f) => f.nivel2)).toEqual(["MINISTERIO GRANDE", "MINISTERIO PEQUEÑO"]);
  });

  it("las mayores dejan al final las que no publican importe", async () => {
    const repo = new PostgresConvocatoriaRepository(db);
    await repo.save(convocatoria("sin-importe", "2026-08-02", true, null));
    await repo.save(convocatoria("con-importe", "2026-08-02", true, "10.00"));

    const mayores = await repo.listarDirectas(day("2026-08-01"), day("2026-08-08"), 10);

    expect(mayores.map((c) => c.codigoBdns)).toEqual(["con-importe", "sin-importe"]);
  });
});
