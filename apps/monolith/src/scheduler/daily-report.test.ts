/**
 * El parte diario es lo único que se lee cada mañana, así que el veredicto
 * tiene que ser inequívoco: si dice "todo correcto" con algo a medias, deja de
 * servir para lo único que sirve.
 */
import { describe, expect, it } from "vitest";

import { BoeId } from "../shared/domain/boe-id.js";
import { isoDate, type IsoDate } from "../shared/domain/iso-date.js";
import { BoeEntry, InMemoryEntryRepository } from "../modules/ingestion/index.js";
import { buildDailyReport, DailyStatusReader } from "./daily-report.js";

function day(raw: string): IsoDate {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

const HOY = day("2026-08-10");
const AYER = day("2026-08-09");

function entry(raw: string, publicationDate: IsoDate): BoeEntry {
  const id = BoeId.create(raw);
  if (!id.ok) throw id.error;
  return BoeEntry.ingest({
    id: id.value,
    publicationDate,
    section: "1",
    department: "MINISTERIO DE PRUEBAS",
    title: "Orden PRU/1/2026",
    officialHtmlUrl: "https://www.boe.es/",
    officialPdfUrl: "https://www.boe.es/",
    officialXmlUrl: null,
    rawText: "Texto.",
    lastOfficialUpdateAt: publicationDate,
  });
}

/** Avanza una entrada por el ciclo hasta el estado pedido. */
function at(raw: string, date: IsoDate, status: "pending" | "summarized" | "notified"): BoeEntry {
  const e = entry(raw, date);
  if (status === "summarized" || status === "notified") e.markSummarized();
  if (status === "notified") e.markNotified();
  return e;
}

describe("DailyStatusReader", () => {
  it("cuenta cada disposición en su fase y solo las del día pedido", async () => {
    const entries = new InMemoryEntryRepository();
    await entries.save(at("BOE-A-2026-00001", HOY, "notified"));
    await entries.save(at("BOE-A-2026-00002", HOY, "summarized"));
    await entries.save(at("BOE-A-2026-00003", HOY, "pending"));
    await entries.save(at("BOE-A-2026-00004", AYER, "pending"));

    const status = await new DailyStatusReader(entries).read(HOY);

    expect(status).toMatchObject({
      total: 3,
      notified: 1,
      summarized: 1,
      pending: 1,
      failed: 0,
      ok: false,
    });
  });

  it("solo da el día por correcto cuando no queda nada a medias", async () => {
    const entries = new InMemoryEntryRepository();
    await entries.save(at("BOE-A-2026-00005", HOY, "notified"));
    await entries.save(at("BOE-A-2026-00006", HOY, "notified"));

    const status = await new DailyStatusReader(entries).read(HOY);

    expect(status.ok).toBe(true);
    expect(status.total).toBe(2);
  });
});

describe("buildDailyReport", () => {
  const sano = { total: 3, pending: 0, summarized: 0, notified: 3, failed: 0, ok: true };
  const roto = { total: 3, pending: 1, summarized: 1, notified: 1, failed: 0, ok: false };

  it("cuando todo va bien lo dice en la primera línea y no enumera problemas", () => {
    const text = buildDailyReport(HOY, sano, true, true);

    expect(text).toContain("✅ Todo correcto");
    expect(text).toContain("Disposiciones del día: 3");
    expect(text).not.toContain("Sin resumen");
  });

  it("cuando algo falta lo detalla y dice si queda un reintento", () => {
    const text = buildDailyReport(HOY, roto, true, true);

    expect(text).toContain("⚠️ Requiere atención");
    expect(text).toContain("Sin resumen (falló la IA): 1");
    expect(text).toContain("Resumidas pero sin notificar (falló un canal): 1");
    expect(text).toContain("Queda un reintento hoy");
  });

  it("si era el último intento lo dice, para que se mire a mano", () => {
    const text = buildDailyReport(HOY, roto, true, false);

    expect(text).toContain("Era el último intento del día");
  });

  const vacio = { total: 0, pending: 0, summarized: 0, notified: 0, failed: 0, ok: true };

  it("un domingo sin boletín no es un problema y se cuenta como tal", () => {
    const text = buildDailyReport(HOY, vacio, false, true);

    expect(text).toContain("Hoy no hay boletín");
    expect(text).not.toContain("⚠️");
  });

  /** El caso más frecuente de día en blanco: pasa casi la mitad de los días. */
  it("distingue el boletín publicado sin Sección I de que no haya boletín", () => {
    const text = buildDailyReport(HOY, vacio, true, true);

    expect(text).toContain("no trae ninguna disposición general");
    expect(text).not.toContain("no hay boletín");
    expect(text).not.toContain("⚠️");
  });

  it("sin saber si hubo boletín, no afirma ninguna de las dos cosas", () => {
    const text = buildDailyReport(HOY, vacio, null, false);

    expect(text).toContain("No hay ninguna disposición registrada");
    expect(text).not.toContain("⚠️");
  });
});
