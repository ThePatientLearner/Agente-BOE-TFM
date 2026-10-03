import { describe, expect, it } from "vitest";
import { formatPressCountdown, pressRefreshDelay, PRESS_REFRESH_MS } from "./press-refresh";

describe("actualización automática de prensa", () => {
  const now = Date.parse("2026-09-26T12:00:00Z");

  it("espera diez minutos desde la última consulta, sin depender del reloj del visitante", () => {
    expect(pressRefreshDelay(["2026-09-26T11:55:00Z", "2026-09-26T11:55:02Z"], now)).toBe(302_000);
  });
  it("solicita actualización al vencer o cuando no hay ninguna consulta válida", () => {
    expect(pressRefreshDelay(["2026-09-26T11:50:00Z"], now)).toBe(0);
    expect(pressRefreshDelay([null, "inválida"], now)).toBe(0);
  });
  it("no deja que una fuente caída bloquee el contador ni que un desfase alargue el intervalo", () => {
    expect(pressRefreshDelay([null, "2026-09-26T11:58:00Z"], now)).toBe(480_000);
    expect(pressRefreshDelay(["2026-09-26T13:00:00Z"], now)).toBe(PRESS_REFRESH_MS);
  });
  it("formatea minutos y segundos sin números negativos", () => {
    expect(formatPressCountdown(PRESS_REFRESH_MS)).toBe("10:00");
    expect(formatPressCountdown(59_001)).toBe("01:00");
    expect(formatPressCountdown(58_000)).toBe("00:58");
    expect(formatPressCountdown(-1000)).toBe("00:00");
  });
});
