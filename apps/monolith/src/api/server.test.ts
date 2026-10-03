/**
 * El endpoint de subvenciones tiene dos responsabilidades propias que no
 * dependen de la base de datos: validar el periodo y decidir qué rango usar
 * cuando no se pide ninguno. Se prueban con dobles porque son justo la parte
 * donde un fallo devuelve datos de un periodo distinto al que dice.
 */
import { pino } from "pino";
import { describe, expect, it } from "vitest";

import { isoDate, type IsoDate } from "../shared/domain/iso-date.js";
import type { CatalogReadModel } from "../modules/catalog/index.js";
import type { SpendingReadModel } from "../modules/spending/index.js";
import {
  InMemoryPartidaRepository,
  PARTIDAS_DE_SALIDA,
  RegistrarPartida,
} from "../modules/juego/index.js";
import { buildServer } from "./server.js";

const logger = pino({ level: "silent" });

/**
 * Monta el servidor con el juego resuelto en memoria. El módulo `juego` no
 * es el asunto de la mayoría de estos tests, pero `buildServer` lo necesita
 * montado; con el repositorio real en memoria los endpoints del juego quedan
 * además comprobables sin dobles.
 */
function servidor(
  catalog: CatalogReadModel,
  spending: SpendingReadModel,
  options?: Parameters<typeof buildServer>[5],
) {
  const partidas = new InMemoryPartidaRepository();
  const registrar = new RegistrarPartida(partidas, logger, 5, PARTIDAS_DE_SALIDA);
  return buildServer(catalog, spending, partidas, registrar, logger, options);
}

function day(raw: string): IsoDate {
  const parsed = isoDate(raw);
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

const catalogVacio: CatalogReadModel = {
  listDays: async () => [],
  getDay: async () => null,
  getEntry: async () => null,
  listReferences: async () => [],
  search: async () => [],
};

/** Registra con qué rango se le llamó, que es lo que se quiere comprobar. */
function spendingDoble(cobertura: { desde: string; hasta: string } | null) {
  const llamadas: { desde: string; hasta: string }[] = [];

  const spending: SpendingReadModel = {
    cobertura: async () =>
      cobertura
        ? { desde: day(cobertura.desde), hasta: day(cobertura.hasta), convocatorias: 1059 }
        : null,
    reparto: async (desde, hasta) => {
      llamadas.push({ desde, hasta });
      return {
        desde,
        hasta,
        directas: { convocatorias: 3, importe: "300" },
        competitivas: { convocatorias: 1, importe: "700" },
        sinClasificar: { convocatorias: 0, importe: "0" },
      };
    },
    periodos: async () =>
      cobertura
        ? [
            {
              mes: cobertura.desde.slice(0, 7),
              desde: day(cobertura.desde),
              hasta: day(cobertura.hasta),
              convocatorias: 1059,
            },
          ]
        : [],
    resumenDirectas: async () => [],
    listarDirectas: async () => [],
    listarMayoresPublicas: async () => [],
    listarMayoresPrivadas: async () => [],
    repartoDirectasPorSector: async (desde, hasta) => ({
      desde,
      hasta,
      publico: { sector: "publico", concesiones: 1, importe: "100" },
      privado: { sector: "privado", concesiones: 2, importe: "200" },
      desconocido: { sector: "desconocido", concesiones: 0, importe: "0" },
      sinDatos: false,
    }),
  };

  return { spending, llamadas };
}

describe("GET /api/review-status", () => {
  it("publica solo el estado de lectura y evita cachear una revisión en curso", async () => {
    const { spending } = spendingDoble(null);
    let reviewing = false;
    const app = servidor(catalogVacio, spending, {
      readReviewStatus: () => ({ reviewing, nextReviewAt: "2026-09-26T08:00:00.000Z",
        serverTime: "2026-09-26T06:30:00.000Z", timeZone: "Europe/Madrid" }),
    });
    const idle = await app.inject({ method: "GET", url: "/api/review-status" });
    expect(idle.statusCode).toBe(200);
    expect(idle.headers["cache-control"]).toBe("no-store");
    expect(idle.json().reviewing).toBe(false);
    reviewing = true;
    const active = await app.inject({ method: "GET", url: "/api/review-status" });
    expect(active.json()).toEqual({ reviewing: true, nextReviewAt: "2026-09-26T08:00:00.000Z",
      serverTime: "2026-09-26T06:30:00.000Z", timeZone: "Europe/Madrid" });
    await app.close();
  });

  it("devuelve 503 si no tiene un lector, sin afirmar que está trabajando", async () => {
    const { spending } = spendingDoble(null);
    const app = servidor(catalogVacio, spending);
    const res = await app.inject({ method: "GET", url: "/api/review-status" });
    expect(res.statusCode).toBe(503);
    expect(res.headers["cache-control"]).toBe("no-store");
    await app.close();
  });
});

describe("GET /api/subvenciones", () => {
  it("sin parámetros usa el periodo realmente ingerido", async () => {
    const { spending, llamadas } = spendingDoble({ desde: "2026-08-01", hasta: "2026-08-08" });
    const app = servidor(catalogVacio, spending);

    const res = await app.inject({ method: "GET", url: "/api/subvenciones" });

    expect(res.statusCode).toBe(200);
    expect(llamadas).toEqual([{ desde: "2026-08-01", hasta: "2026-08-08" }]);
    expect(res.json().cobertura.convocatorias).toBe(1059);
  });

  it("respeta el periodo pedido cuando se indica", async () => {
    const { spending, llamadas } = spendingDoble({ desde: "2026-08-01", hasta: "2026-08-08" });
    const app = servidor(catalogVacio, spending);

    await app.inject({
      method: "GET",
      url: "/api/subvenciones?desde=2026-08-03&hasta=2026-08-05",
    });

    expect(llamadas).toEqual([{ desde: "2026-08-03", hasta: "2026-08-05" }]);
  });

  it("rechaza una fecha inválida con 400 en vez de inventarse un rango", async () => {
    const { spending, llamadas } = spendingDoble({ desde: "2026-08-01", hasta: "2026-08-08" });
    const app = servidor(catalogVacio, spending);

    const res = await app.inject({ method: "GET", url: "/api/subvenciones?desde=3-agosto" });

    expect(res.statusCode).toBe(400);
    expect(llamadas).toHaveLength(0);
  });

  it("rechaza un periodo del revés", async () => {
    const { spending } = spendingDoble({ desde: "2026-08-01", hasta: "2026-08-08" });
    const app = servidor(catalogVacio, spending);

    const res = await app.inject({
      method: "GET",
      url: "/api/subvenciones?desde=2026-08-08&hasta=2026-08-01",
    });

    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain("posterior");
  });

  it("con la tabla vacía responde 200 y en blanco, no un error", async () => {
    const { spending } = spendingDoble(null);
    const app = servidor(catalogVacio, spending);

    const res = await app.inject({ method: "GET", url: "/api/subvenciones" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({
      cobertura: null,
      reparto: null,
      porAdministracion: [],
      mayores: [],
      mayoresPublicas: [],
      mayoresPrivadas: [],
      directasPorSector: null,
    });
  });
});

describe("POST /api/search/unlock y GET /api/search", () => {
  it("sin contraseña configurada responde 503", async () => {
    const app = servidor(catalogVacio, spendingDoble(null).spending);

    const unlock = await app.inject({
      method: "POST",
      url: "/api/search/unlock",
      payload: { password: "cualquiera" },
    });
    expect(unlock.statusCode).toBe(503);

    const search = await app.inject({ method: "GET", url: "/api/search?q=canarias" });
    expect(search.statusCode).toBe(503);
  });

  it("rechaza contraseña incorrecta y acepta la buena", async () => {
    let lastQuery: string | undefined;
    const catalog: CatalogReadModel = {
      ...catalogVacio,
      search: async (params) => {
        lastQuery = params.query;
        return [];
      },
    };
    const app = servidor(catalog, spendingDoble(null).spending, {
      fullSearchPassword: "secreto",
    });

    const bad = await app.inject({
      method: "POST",
      url: "/api/search/unlock",
      payload: { password: "mal" },
    });
    expect(bad.statusCode).toBe(401);

    const ok = await app.inject({
      method: "POST",
      url: "/api/search/unlock",
      payload: { password: "secreto" },
    });
    expect(ok.statusCode).toBe(204);

    const denied = await app.inject({ method: "GET", url: "/api/search?q=canarias" });
    expect(denied.statusCode).toBe(401);

    const allowed = await app.inject({
      method: "GET",
      url: "/api/search?q=canarias&minImpact=3",
      headers: { "x-full-search-password": "secreto" },
    });
    expect(allowed.statusCode).toBe(200);
    expect(lastQuery).toBe("canarias");
    expect(allowed.json()).toEqual([]);
  });
});

describe("GET /api/subvenciones/periodos", () => {
  it("enumera los meses con datos", async () => {
    const { spending } = spendingDoble({ desde: "2026-08-01", hasta: "2026-08-08" });
    const app = servidor(catalogVacio, spending);

    const res = await app.inject({ method: "GET", url: "/api/subvenciones/periodos" });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      { mes: "2026-08", desde: "2026-08-01", hasta: "2026-08-08", convocatorias: 1059 },
    ]);
  });

  it("con la tabla vacía devuelve una lista vacía, no un error", async () => {
    const { spending } = spendingDoble(null);
    const app = servidor(catalogVacio, spending);

    const res = await app.inject({ method: "GET", url: "/api/subvenciones/periodos" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });
});

describe("juego", () => {
  const partida = { seudonimo: "ROBER", puntos: 4200, nivel: 3, segundos: 180, mejorCombo: 4 };

  const jugar = (app: ReturnType<typeof servidor>, cuerpo: Record<string, unknown>) =>
    app.inject({ method: "POST", url: "/api/juego/partidas", payload: cuerpo });

  it("devuelve el contador con el arranque de cortesía antes de la primera partida", async () => {
    const app = servidor(catalogVacio, spendingDoble(null).spending);
    const res = await app.inject({ method: "GET", url: "/api/juego/marcador" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ranking: [], partidasJugadas: PARTIDAS_DE_SALIDA });
  });

  it("entrega un código al terminar la partida", async () => {
    const app = servidor(catalogVacio, spendingDoble(null).spending);
    const res = await jugar(app, partida);
    expect(res.statusCode).toBe(200);
    expect(res.json().codigo).toMatch(/^BOE-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
    expect(res.json().puesto).toBe(1);
  });

  it("rechaza un marcador imposible sin dar código", async () => {
    const app = servidor(catalogVacio, spendingDoble(null).spending);
    const res = await jugar(app, { ...partida, puntos: 999999, nivel: 1 });
    expect(res.statusCode).toBe(400);
    expect(res.json().codigo).toBeUndefined();
  });

  it("rechaza un cuerpo sin los campos de la partida", async () => {
    const app = servidor(catalogVacio, spendingDoble(null).spending);
    const res = await jugar(app, { seudonimo: "NADIE" });
    expect(res.statusCode).toBe(400);
  });

  it("no admite números colados como texto", async () => {
    // Un `"9999999"` que pasara el validador entraría en el ranking público.
    const app = servidor(catalogVacio, spendingDoble(null).spending);
    const res = await jugar(app, { ...partida, puntos: "4200" });
    expect(res.statusCode).toBe(400);
  });

  it("corta el bucle de partidas desde la misma IP", async () => {
    const app = servidor(catalogVacio, spendingDoble(null).spending);
    const codigos: number[] = [];
    for (let i = 0; i < 15; i++) codigos.push((await jugar(app, partida)).statusCode);
    // Doce entran y el resto rebota: el número exacto es el de PARTIDAS_POR_IP.
    expect(codigos.filter((c) => c === 200)).toHaveLength(12);
    expect(codigos.at(-1)).toBe(429);
  });
});
