import { describe, expect, it } from "vitest";
import { datesForCronPass, daysBefore, isoDate } from "./iso-date.js";

function day(raw: string) {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

describe("daysBefore", () => {
  it("resta días dentro del mismo mes", () => {
    expect(daysBefore(day("2026-08-11"), 1)).toBe("2026-08-10");
    expect(daysBefore(day("2026-08-11"), 0)).toBe("2026-08-11");
  });

  it("cruza el cambio de mes y de año", () => {
    expect(daysBefore(day("2026-03-01"), 1)).toBe("2026-02-28");
    expect(daysBefore(day("2026-01-01"), 1)).toBe("2025-12-31");
  });

  it("rechaza un número de días negativo", () => {
    expect(() => daysBefore(day("2026-08-11"), -1)).toThrow(/≥ 0/);
  });
});

describe("datesForCronPass", () => {
  it("con lookback 0 solo devuelve el día de hoy", () => {
    expect(datesForCronPass(day("2026-08-11"), 0)).toEqual(["2026-08-11"]);
  });

  it("con lookback 1 devuelve ayer y hoy, en ese orden", () => {
    expect(datesForCronPass(day("2026-08-11"), 1)).toEqual([
      "2026-08-10",
      "2026-08-11",
    ]);
  });

  it("con lookback 2 ordena del más antiguo al más reciente", () => {
    expect(datesForCronPass(day("2026-08-11"), 2)).toEqual([
      "2026-08-09",
      "2026-08-10",
      "2026-08-11",
    ]);
  });
});
