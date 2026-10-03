import { describe, expect, it } from "vitest";

import { isoDate, type IsoDate } from "../shared/domain/iso-date.js";
import { buildDayDigest, CatalogDayDigestReader } from "./day-digest.js";
import type { CatalogDayView, CatalogReadModel } from "../modules/catalog/index.js";

function day(raw: string): IsoDate {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

const HOY = day("2026-09-12");

function entries(...impacts: readonly (number | null)[]) {
  return impacts.map((impact) => ({ impact }));
}

describe("buildDayDigest", () => {
  it("reparte las disposiciones por nivel de impacto", () => {
    const digest = buildDayDigest(HOY, entries(1, 3, 3, 5, 2, 3));

    expect(digest.total).toBe(6);
    expect(digest.byImpact).toEqual([1, 1, 3, 0, 1]);
    expect(digest.withoutSummary).toBe(0);
  });

  it("cuenta aparte las que la IA todavía no ha resumido", () => {
    const digest = buildDayDigest(HOY, entries(4, null, null));

    expect(digest.total).toBe(3);
    expect(digest.byImpact).toEqual([0, 0, 0, 1, 0]);
    expect(digest.withoutSummary).toBe(2);
  });

  it("el total siempre cuadra con lo repartido", () => {
    const digest = buildDayDigest(HOY, entries(1, 2, 3, 4, 5, null));
    const sumadas = digest.byImpact.reduce((a, b) => a + b, 0) + digest.withoutSummary;

    expect(sumadas).toBe(digest.total);
  });

  // La columna la escribe el dominio, que solo admite 1..5; si algo se
  // colara, es preferible contarlo como "sin resumir" a perderlo.
  it("un impacto imposible no descuadra el total", () => {
    const digest = buildDayDigest(HOY, entries(0, 9, 2.5, 3));

    expect(digest.total).toBe(4);
    expect(digest.byImpact).toEqual([0, 0, 1, 0, 0]);
    expect(digest.withoutSummary).toBe(3);
  });

  it("un día sin disposiciones da un parte vacío, no un error", () => {
    const digest = buildDayDigest(HOY, []);

    expect(digest).toEqual({
      date: HOY,
      total: 0,
      byImpact: [0, 0, 0, 0, 0],
      withoutSummary: 0,
    });
  });
});

describe("CatalogDayDigestReader", () => {
  function catalogoCon(dia: CatalogDayView | null): CatalogReadModel {
    return {
      getDay: async () => dia,
      listDays: async () => [],
      getEntry: async () => null,
      listReferences: async () => [],
      search: async () => [],
    };
  }

  it("cuenta lo que hay en el catálogo del día", async () => {
    const reader = new CatalogDayDigestReader(
      catalogoCon({
        date: HOY,
        entries: entries(3, 3, 1) as unknown as CatalogDayView["entries"],
      }),
    );

    expect(await reader.read(HOY)).toMatchObject({ total: 3, byImpact: [1, 0, 2, 0, 0] });
  });

  it("un día que el catálogo no conoce cuenta como cero, no como fallo", async () => {
    const reader = new CatalogDayDigestReader(catalogoCon(null));

    expect(await reader.read(HOY)).toMatchObject({ total: 0 });
  });
});
