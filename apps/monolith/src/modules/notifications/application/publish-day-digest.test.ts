/**
 * El parte público sale una vez al día y lo lee gente que no ha pedido nada
 * más que enterarse. Lo que estos tests fijan es que no se repita en cada
 * pasada del cron, que no se publique en los días vacíos, y que el texto
 * siga diciendo lo que LEGAL.md exige.
 */
import { pino } from "pino";
import { describe, expect, it } from "vitest";

import { err, ok, type Result } from "../../../shared/domain/result.js";
import { InMemoryNotificationLog } from "../infrastructure/in-memory-notification-log.js";
import type { Announcement, Notifier } from "../domain/notifier.js";
import {
  buildDigestAnnouncement,
  digestKey,
  fechaEnCastellano,
  PublishDayDigest,
  type DayDigest,
} from "./publish-day-digest.js";

const logger = pino({ level: "silent" });

const WEB = "https://agenteboe.com";

class SpyNotifier implements Notifier {
  readonly channel = "spy";
  readonly announcements: Announcement[] = [];
  falla = false;

  async send(): Promise<Result<void>> {
    return ok(undefined);
  }

  async sendAnnouncement(announcement: Announcement): Promise<Result<void>> {
    if (this.falla) return err(new Error("canal caído"));
    this.announcements.push(announcement);
    return ok(undefined);
  }
}

function digest(overrides: Partial<DayDigest> = {}): DayDigest {
  return {
    date: "2026-09-12",
    total: 5,
    byImpact: [1, 0, 2, 1, 1],
    withoutSummary: 0,
    ...overrides,
  };
}

function setup() {
  const notifier = new SpyNotifier();
  const log = new InMemoryNotificationLog();
  const publish = new PublishDayDigest([notifier], log, logger, WEB, 3);
  return { notifier, log, publish };
}

describe("PublishDayDigest", () => {
  it("publica el parte del día en el canal", async () => {
    const { notifier, publish } = setup();

    await publish.execute(digest());

    expect(notifier.announcements).toHaveLength(1);
    expect(notifier.announcements[0]?.url).toBe(WEB);
  });

  it("no lo repite aunque el cron vuelva a pasar", async () => {
    const { notifier, publish } = setup();

    await publish.execute(digest());
    await publish.execute(digest());
    await publish.execute(digest());

    expect(notifier.announcements).toHaveLength(1);
  });

  it("un día distinto sí se publica", async () => {
    const { notifier, publish } = setup();

    await publish.execute(digest({ date: "2026-09-12" }));
    await publish.execute(digest({ date: "2026-09-13" }));

    expect(notifier.announcements).toHaveLength(2);
  });

  it("calla en los días sin disposiciones, que son casi la mitad", async () => {
    const { notifier, publish } = setup();

    await publish.execute(digest({ total: 0, byImpact: [0, 0, 0, 0, 0] }));

    expect(notifier.announcements).toEqual([]);
  });

  it("un envío fallido no se da por hecho: se reintenta en la pasada siguiente", async () => {
    const { notifier, publish } = setup();

    notifier.falla = true;
    await publish.execute(digest());
    expect(notifier.announcements).toEqual([]);

    notifier.falla = false;
    await publish.execute(digest());
    expect(notifier.announcements).toHaveLength(1);
  });

  it("la clave del registro no puede chocar con un id del BOE", () => {
    expect(digestKey("2026-09-12")).not.toMatch(/^BOE-/);
  });
});

describe("buildDigestAnnouncement", () => {
  it("dice cuántas hay y cuántas de cada impacto, de mayor a menor", () => {
    const announcement = buildDigestAnnouncement(digest(), WEB, 3);

    expect(announcement.title).toBe("📊 BOE del 12 de septiembre de 2026");
    expect(announcement.body).toContain("5 disposiciones analizadas.");
    expect(announcement.body).toContain("impacto 5/5 — 1");
    expect(announcement.body).toContain("impacto 4/5 — 1");
    expect(announcement.body).toContain("impacto 3/5 — 2");
    expect(announcement.body).toContain("impacto 1/5 — 1");

    const cuerpo = announcement.body;
    expect(cuerpo.indexOf("5/5")).toBeLessThan(cuerpo.indexOf("1/5"));
  });

  it("se salta los niveles sin ninguna disposición", () => {
    const announcement = buildDigestAnnouncement(digest(), WEB, 3);

    expect(announcement.body).not.toContain("impacto 2/5");
  });

  it("concuerda el singular", () => {
    const announcement = buildDigestAnnouncement(
      digest({ total: 1, byImpact: [0, 0, 1, 0, 0] }),
      WEB,
      3,
    );

    expect(announcement.body).toContain("1 disposición analizada.");
  });

  it("avisa de las que aún no tienen resumen en vez de descuadrar el total", () => {
    const announcement = buildDigestAnnouncement(
      digest({ total: 4, byImpact: [1, 0, 1, 0, 0], withoutSummary: 2 }),
      WEB,
      3,
    );

    expect(announcement.body).toContain("2 todavía sin resumir.");
  });

  it("explica el umbral que se usa de verdad, no uno fijo", () => {
    const announcement = buildDigestAnnouncement(digest(), WEB, 4);

    expect(announcement.body).toContain("impacto 4 o superior");
  });

  // LEGAL.md §5.3, formato corto: el impacto lo pone la IA y el parte tiene
  // que decirlo, aunque no lleve ningún resumen dentro.
  it("lleva el pie legal de mensaje agrupado", () => {
    const announcement = buildDigestAnnouncement(digest(), WEB, 3);

    expect(announcement.body).toContain(
      "ℹ️ Resúmenes por IA · No oficial · Válido solo el texto del BOE",
    );
  });

  it("enlaza a la web", () => {
    expect(buildDigestAnnouncement(digest(), WEB, 3).url).toBe(WEB);
  });
});

describe("fechaEnCastellano", () => {
  it("escribe el mes con letra y sin cero delante del día", () => {
    expect(fechaEnCastellano("2026-01-05")).toBe("5 de enero de 2026");
    expect(fechaEnCastellano("2026-12-31")).toBe("31 de diciembre de 2026");
  });

  it("ante una fecha que no reconoce, la deja tal cual antes que inventarse un mes", () => {
    expect(fechaEnCastellano("2026-13-01")).toBe("2026-13-01");
  });
});
