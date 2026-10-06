import { pino } from "pino";
import { expect, it } from "vitest";
import { isoDate, type IsoDate } from "../../../shared/domain/iso-date.js";
import { ok } from "../../../shared/domain/result.js";
import { InMemoryEventBus } from "../../../shared/event-bus/in-memory-event-bus.js";
import { entryIngested } from "../../ingestion/index.js";
import type { SummaryGenerated } from "../domain/events.js";
import type { Summarizer } from "../domain/summarizer.js";
import { InMemorySummaryRepository } from "../infrastructure/in-memory-summary-repository.js";
import { SummarizeEntry } from "./summarize-entry.js";

function day(raw: string): IsoDate {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

it("conserva la fecha oficial al generar el evento del resumen, distinta de publicación", async () => {
  const logger = pino({ level: "silent" });
  const bus = new InMemoryEventBus(logger);
  const received: SummaryGenerated[] = [];
  const summarizer: Summarizer = {
    async summarize() {
      return ok({ plainTitle: "Título claro", shortPhrase: "Resumen.", bulletPoints: ["Punto"], impact: 3, model: "modelo-de-prueba" });
    },
  };
  new SummarizeEntry(summarizer, new InMemorySummaryRepository(), bus, logger).register(bus);
  bus.subscribe<SummaryGenerated>("summarization.summary-generated", async event => { received.push(event); });

  await bus.publish(entryIngested({
    entryId: "BOE-A-2026-1", publicationDate: day("2026-02-01"),
    department: "MINISTERIO DE PRUEBAS", title: "Título oficial",
    officialHtmlUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-1",
    officialPdfUrl: "https://www.boe.es/ejemplo.pdf", text: "Texto oficial de prueba.",
    lastOfficialUpdateAt: day("2026-02-03"),
  }));

  expect(received).toHaveLength(1);
  expect(received[0]!.payload.lastOfficialUpdateAt).toBe("2026-02-03");
  expect(received[0]!.payload.publicationDate).toBe("2026-02-01");
});
