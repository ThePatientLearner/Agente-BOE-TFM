import { describe, expect, it } from "vitest";
import { formatReviewCountdown, readReviewSnapshot, remainingReviewMs } from "./review-status";

const payload = { reviewing: false, nextReviewAt: "2026-09-26T06:30:00Z",
  serverTime: "2026-09-26T06:29:00Z", timeZone: "Europe/Madrid" };

describe("cuenta atrás de la revisión", () => {
  it("usa la diferencia del servidor y descuenta tiempo transcurrido y latencia", () => {
    const snapshot = readReviewSnapshot(payload, 10_000, 200);
    expect(remainingReviewMs(snapshot, 20_000)).toBe(49_900);
    expect(formatReviewCountdown(remainingReviewMs(snapshot, 20_000)!)).toBe("00:00:50");
  });

  it("no convierte un contador vencido en una revisión real", () => {
    const snapshot = readReviewSnapshot(payload, 0, 0);
    expect(remainingReviewMs(snapshot, 70_000)).toBe(0);
    expect(snapshot.reviewing).toBe(false);
  });

  it("permite revisión activa aunque no se conozca la próxima fecha", () => {
    const snapshot = readReviewSnapshot({ ...payload, reviewing: true, nextReviewAt: null }, 0, 0);
    expect(snapshot.reviewing).toBe(true);
    expect(remainingReviewMs(snapshot, 2000)).toBeNull();
  });

  it.each([null, {}, { ...payload, reviewing: "true" }, { ...payload, nextReviewAt: "inválida" },
    { ...payload, serverTime: "inválida" }])("rechaza una respuesta incompleta o inválida", (value) => {
    expect(() => readReviewSnapshot(value, 0, 0)).toThrow();
  });

  it("muestra horas de más de un día y nunca valores negativos", () => {
    expect(formatReviewCountdown(25 * 60 * 60 * 1000)).toBe("25:00:00");
    expect(formatReviewCountdown(-500)).toBe("00:00:00");
  });
});
