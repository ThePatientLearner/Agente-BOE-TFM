import { describe, expect, it } from "vitest";
import type { CatalogEntry } from "./api";
import { relatedEntries } from "./related-entries";

const entry = (id: string, title: string, department = "Departamento", date = "2026-09-20"): CatalogEntry => ({
  id, title, plainTitle: title, department, publicationDate: date, shortPhrase: null,
  officialHtmlUrl: "", officialPdfUrl: "", bulletPoints: null, impact: null,
  model: null, gobierno: null, lastOfficialUpdateAt: date,
});

describe("siguiente lectura", () => {
  const current = entry("actual", "Cotizaciones y pensiones de deportistas");
  it("excluye la ficha actual y duplicados, y prioriza coincidencias de tema", () => {
    const close = entry("afin", "Pensiones para deportistas profesionales", "Otro");
    const weak = entry("menor", "Pensiones contributivas", "Otro");
    expect(relatedEntries(current, [current, weak, close, close]).map((item) => item.id)).toEqual(["afin", "menor"]);
  });
  it("no presenta como relacionadas noticias que solo comparten ministerio", () => {
    expect(relatedEntries(current, [entry("otra", "Precios del tabaco en estancos")])).toEqual([]);
  });
  it("desempata por fecha y limita el número de sugerencias", () => {
    expect(relatedEntries(current, [entry("vieja", "Pensiones contributivas"), entry("nueva", "Pensiones contributivas", "Departamento", "2026-09-21")], 1)[0]?.id).toBe("nueva");
  });
  it("trata igual las palabras con acentos y sin ellos", () => {
    expect(relatedEntries(entry("actual", "Cotización agrícola"), [entry("otra", "Cotizacion agricola")])).toHaveLength(1);
  });
});
