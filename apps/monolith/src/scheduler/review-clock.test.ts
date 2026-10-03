import { describe, expect, it } from "vitest";
import { createNextReview } from "./review-clock.js";

const schedules = ["30 8 * * *", "0 10 * * *", "0 12 * * *"];

describe("próxima revisión en Europe/Madrid", () => {
  it.each([
    ["2026-09-26T06:29:59.000Z", "2026-09-26T06:30:00.000Z"],
    ["2026-09-26T06:30:00.000Z", "2026-09-26T08:00:00.000Z"],
    ["2026-09-26T08:00:00.000Z", "2026-09-26T10:00:00.000Z"],
    ["2026-09-26T10:00:00.000Z", "2026-09-27T06:30:00.000Z"],
    ["2026-03-28T11:00:00.000Z", "2026-03-29T06:30:00.000Z"],
    ["2026-10-24T10:00:00.000Z", "2026-10-25T07:30:00.000Z"],
    ["2026-12-31T11:00:00.000Z", "2027-01-01T07:30:00.000Z"],
  ])("desde %s apunta a %s, incluidos reintentos y fines de semana", (now, expected) => {
    expect(createNextReview(schedules, "Europe/Madrid")(new Date(now))?.toISOString()).toBe(expected);
  });

  it("renueva la caché al vencer y si retrocede el reloj del servidor", () => {
    const next = createNextReview(schedules, "Europe/Madrid");
    expect(next(new Date("2026-09-26T06:29:00Z"))?.toISOString()).toBe("2026-09-26T06:30:00.000Z");
    expect(next(new Date("2026-09-26T08:00:00Z"))?.toISOString()).toBe("2026-09-26T10:00:00.000Z");
    expect(next(new Date("2026-09-26T06:00:00Z"))?.toISOString()).toBe("2026-09-26T06:30:00.000Z");
  });

  it("no inventa una fecha si no hay horarios o el cron deja de ser diario", () => {
    const now = new Date("2026-09-26T06:00:00Z");
    expect(createNextReview([], "Europe/Madrid")(now)).toBeNull();
    expect(createNextReview(["30 8 * * 1-5"], "Europe/Madrid")(now)).toBeNull();
  });
});
