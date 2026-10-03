/**
 * Lo que aquí se fija no es una función, es una garantía de extremo a extremo:
 * un reintento tiene que recuperar lo que se quedó a medias y, a la vez, no
 * publicar dos veces lo que ya salió. Como la garantía nace de la suma de tres
 * módulos, el test los monta juntos con adapters en memoria en vez de simular
 * el bus.
 */
import { pino } from "pino";
import { beforeEach, describe, expect, it } from "vitest";

import { BoeId } from "../shared/domain/boe-id.js";
import { isoDate, type IsoDate } from "../shared/domain/iso-date.js";
import { err, ok, type Result } from "../shared/domain/result.js";
import { InMemoryEventBus } from "../shared/event-bus/in-memory-event-bus.js";
import {
  BoeEntry,
  InMemoryEntryRepository,
  TrackEntryProgress,
} from "../modules/ingestion/index.js";
import {
  InMemorySummaryRepository,
  SummarizeEntry,
  type Summarizer,
  type SummaryDraft,
} from "../modules/summarization/index.js";
import {
  InMemoryNotificationLog,
  NotifyEntry,
  type NotificationMessage,
  type Notifier,
} from "../modules/notifications/index.js";
import { ResumePendingEntries } from "./resume-pending.js";

const logger = pino({ level: "silent" });

function day(raw: string): IsoDate {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

function id(raw: string): BoeId {
  const parsed = BoeId.create(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

const HOY = day("2026-08-10");
const AYER = day("2026-08-09");

function entry(rawId: string, publicationDate: IsoDate): BoeEntry {
  return BoeEntry.ingest({
    id: id(rawId),
    publicationDate,
    section: "1",
    department: "MINISTERIO DE PRUEBAS",
    title: "Orden PRU/1/2026, de 1 de enero, de cosas",
    officialHtmlUrl: "https://www.boe.es/diario_boe/txt.php?id=" + rawId,
    officialPdfUrl: "https://www.boe.es/boe/dias/pdf",
    officialXmlUrl: null,
    rawText: "El texto oficial completo de la disposición.",
    lastOfficialUpdateAt: publicationDate,
  });
}

/** IA de prueba: se le puede pedir que falle para simular la API caída. */
class FakeSummarizer implements Summarizer {
  caida = false;
  llamadas = 0;

  async summarize(): Promise<Result<SummaryDraft>> {
    this.llamadas += 1;
    if (this.caida) return err(new Error("IA no disponible"));
    return ok({
      plainTitle: "Título claro",
      shortPhrase: "Frase corta.",
      bulletPoints: ["Punto uno", "Punto dos"],
      impact: 4,
      model: "fake-model",
    });
  }
}

/** Canal de prueba con interruptor, para simular Telegram caído. */
class SpyNotifier implements Notifier {
  caido = false;
  readonly enviados: NotificationMessage[] = [];

  constructor(readonly channel: string) {}

  async send(message: NotificationMessage): Promise<Result<void>> {
    if (this.caido) return err(new Error(`${this.channel} no disponible`));
    this.enviados.push(message);
    return ok(undefined);
  }

  async sendAnnouncement(): Promise<Result<void>> {
    return ok(undefined);
  }
}

function montar() {
  const bus = new InMemoryEventBus(logger);
  const entries = new InMemoryEntryRepository();
  const summaries = new InMemorySummaryRepository();
  const log = new InMemoryNotificationLog();
  const summarizer = new FakeSummarizer();
  const telegram = new SpyNotifier("telegram");
  const discord = new SpyNotifier("discord");

  // Mismo orden de suscripción que en composition.ts.
  new SummarizeEntry(summarizer, summaries, bus, logger).register(bus);
  new NotifyEntry([telegram, discord], log, bus, logger, "https://agenteboe.com", 3).register(bus);
  new TrackEntryProgress(entries, logger).register(bus);

  return {
    bus,
    entries,
    summaries,
    summarizer,
    telegram,
    discord,
    resume: new ResumePendingEntries(entries, summaries, bus, logger),
  };
}

describe("ResumePendingEntries", () => {
  let sut: ReturnType<typeof montar>;

  beforeEach(() => {
    sut = montar();
  });

  it("recupera una disposición que se quedó sin resumen porque la IA estaba caída", async () => {
    await sut.entries.save(entry("BOE-A-2026-00001", HOY));

    // La IA vuelve a estar en pie cuando llega el reintento.
    const report = await sut.resume.execute(HOY);

    expect(report.resummarized).toBe(1);
    expect(sut.summarizer.llamadas).toBe(1);
    expect(await sut.summaries.findByEntryId("BOE-A-2026-00001")).not.toBeNull();
    expect(sut.telegram.enviados).toHaveLength(1);
    expect(sut.discord.enviados).toHaveLength(1);
  });

  it("no vuelve a notificar lo que ya salió, por muchas pasadas que se hagan", async () => {
    await sut.entries.save(entry("BOE-A-2026-00002", HOY));

    await sut.resume.execute(HOY);
    await sut.resume.execute(HOY);
    await sut.resume.execute(HOY);

    // Una sola llamada a la IA y un solo envío por canal.
    expect(sut.summarizer.llamadas).toBe(1);
    expect(sut.telegram.enviados).toHaveLength(1);
    expect(sut.discord.enviados).toHaveLength(1);
  });

  it("reintenta solo el canal que falló, sin repetir el que sí salió", async () => {
    await sut.entries.save(entry("BOE-A-2026-00003", HOY));

    // Primera pasada: Telegram caído, Discord bien.
    sut.telegram.caido = true;
    await sut.resume.execute(HOY);
    expect(sut.telegram.enviados).toHaveLength(0);
    expect(sut.discord.enviados).toHaveLength(1);

    // Segunda pasada con Telegram recuperado.
    sut.telegram.caido = false;
    const report = await sut.resume.execute(HOY);

    expect(report.renotified).toBe(1);
    expect(sut.telegram.enviados).toHaveLength(1);
    // Discord NO recibe un segundo mensaje.
    expect(sut.discord.enviados).toHaveLength(1);
    // Y no se ha vuelto a gastar un token de IA.
    expect(sut.summarizer.llamadas).toBe(1);
  });

  it("no toca las disposiciones de otros días", async () => {
    await sut.entries.save(entry("BOE-A-2026-00004", AYER));

    const report = await sut.resume.execute(HOY);

    expect(report.resummarized).toBe(0);
    expect(report.renotified).toBe(0);
    expect(sut.summarizer.llamadas).toBe(0);
    expect(sut.telegram.enviados).toHaveLength(0);
  });

  it("si la IA sigue caída lo cuenta como pendiente, sin dar por hecho el resumen", async () => {
    await sut.entries.save(entry("BOE-A-2026-00005", HOY));
    sut.summarizer.caida = true;

    await sut.resume.execute(HOY);

    expect(await sut.summaries.findByEntryId("BOE-A-2026-00005")).toBeNull();
    expect(sut.telegram.enviados).toHaveLength(0);

    // Y la siguiente pasada lo vuelve a intentar, que es justo lo que se quiere.
    sut.summarizer.caida = false;
    const report = await sut.resume.execute(HOY);
    expect(report.resummarized).toBe(1);
    expect(sut.telegram.enviados).toHaveLength(1);
  });

  it("cierra el hueco de la fila que tiene resumen pero se quedó en pendiente", async () => {
    await sut.entries.save(entry("BOE-A-2026-00006", HOY));
    await sut.summaries.save({
      entryId: "BOE-A-2026-00006",
      plainTitle: "Título claro",
      shortPhrase: "Frase corta.",
      bulletPoints: ["Punto"],
      impact: 4,
      model: "fake-model",
      generatedAt: new Date(),
    });

    const report = await sut.resume.execute(HOY);

    // Ni se llama a la IA ni se queda la disposición sin notificar.
    expect(sut.summarizer.llamadas).toBe(0);
    expect(report.renotified).toBe(1);
    expect(sut.telegram.enviados).toHaveLength(1);
  });
});
