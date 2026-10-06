import { afterEach, describe, expect, it, vi } from "vitest";
import type { NotificationMessage } from "../domain/notifier.js";
import { DiscordNotifier } from "./discord-notifier.js";
import { TelegramNotifier } from "./telegram-notifier.js";

const message: NotificationMessage = {
  title: "Título llano generado",
  shortPhrase: "Resumen generado de la disposición.",
  impact: 3,
  officialUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-1",
  summaryUrl: "https://example.test/d/BOE-A-2026-1",
  lastOfficialUpdateAt: "2026-02-03",
  gobierno: {
    codigo: "ES", nombre: "Gobierno de prueba", ambito: "estatal", etiqueta: "PRUEBA",
    partidos: ["PRUEBA"], presidente: "Persona de prueba", desde: "2020-01-01", verificadoEl: "2026-01-01",
  },
};

afterEach(() => vi.unstubAllGlobals());

describe.each([
  { channel: "Telegram", notifier: new TelegramNotifier("token-de-prueba", "canal-de-prueba"), field: "text" },
  { channel: "Discord", notifier: new DiscordNotifier("https://example.test/webhook"), field: "content" },
])("$channel · atribución de fuente", ({ notifier, field }) => {
  it("sitúa el enlace y la fecha oficial antes del título y del resumen IA", async () => {
    // No se envía ningún mensaje: el transporte se sustituye íntegramente.
    const fetcher = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetcher);

    expect((await notifier.send(message)).ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(1);
    const request = fetcher.mock.calls[0]![1] as RequestInit;
    const text = JSON.parse(String(request.body))[field] as string;
    const official = text.indexOf(message.officialUrl);
    const updated = text.indexOf("Última actualización del texto oficial: 2026-02-03");
    expect(official).toBeGreaterThanOrEqual(0);
    expect(updated).toBeGreaterThan(official);
    expect(updated).toBeLessThan(text.indexOf(message.title));
    expect(updated).toBeLessThan(text.indexOf(message.shortPhrase));
    expect(text).toContain("Resumen generado por IA");
    expect(text).toContain("Servicio no oficial");
  });
});
