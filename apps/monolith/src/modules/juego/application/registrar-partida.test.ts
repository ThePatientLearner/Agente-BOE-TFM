import { describe, expect, it, vi } from "vitest";
import { PARTIDAS_DE_SALIDA } from "../domain/contador.js";
import { InMemoryPartidaRepository } from "../infrastructure/in-memory-partida-repository.js";
import { RegistrarPartida } from "./registrar-partida.js";

const testLogger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as never;
const TOP = 5;

const crear = (): { repo: InMemoryPartidaRepository; caso: RegistrarPartida } => {
  const repo = new InMemoryPartidaRepository();
  return { repo, caso: new RegistrarPartida(repo, testLogger, TOP, PARTIDAS_DE_SALIDA) };
};

const partida = {
  seudonimo: "ROBER",
  puntos: 4200,
  nivel: 3,
  segundos: 180,
  mejorCombo: 4,
};

describe("RegistrarPartida", () => {
  it("devuelve un código distinto en cada partida", async () => {
    const { caso } = crear();
    const a = await caso.ejecutar(partida);
    const b = await caso.ejecutar(partida);
    if (!a.ok || !b.ok) throw new Error("las dos partidas eran válidas");
    expect(a.value.codigo).not.toBe(b.value.codigo);
  });

  it("no guarda una partida con un marcador imposible", async () => {
    const { repo, caso } = crear();
    const resultado = await caso.ejecutar({ ...partida, puntos: 999999, nivel: 1 });
    expect(resultado.ok).toBe(false);
    expect(await repo.total()).toBe(0);
  });

  it("solo entran en el ranking los que ponen seudónimo", async () => {
    const { caso } = crear();
    await caso.ejecutar({ ...partida, seudonimo: "ANA", puntos: 3000 });
    await caso.ejecutar({ ...partida, seudonimo: null, puntos: 9000 });
    const ultimo = await caso.ejecutar({ ...partida, seudonimo: "LUIS", puntos: 1000 });
    if (!ultimo.ok) throw new Error("la partida era válida");

    expect(ultimo.value.ranking.map((p) => p.seudonimo)).toEqual(["ANA", "LUIS"]);
  });

  it("no da puesto a quien juega en anónimo: no está en la lista", async () => {
    const { caso } = crear();
    const resultado = await caso.ejecutar({ ...partida, seudonimo: "   " });
    if (!resultado.ok) throw new Error("la partida era válida");
    expect(resultado.value.puesto).toBeNull();
  });

  it("ordena el ranking por dinero en la caja fuerte", async () => {
    const { caso } = crear();
    await caso.ejecutar({ ...partida, seudonimo: "BAJO", puntos: 1200 });
    await caso.ejecutar({ ...partida, seudonimo: "ALTO", puntos: 7000 });
    const medio = await caso.ejecutar({ ...partida, seudonimo: "MEDIO", puntos: 4000 });
    if (!medio.ok) throw new Error("la partida era válida");

    expect(medio.value.ranking.map((p) => p.seudonimo)).toEqual(["ALTO", "MEDIO", "BAJO"]);
    expect(medio.value.puesto).toBe(2);
  });

  it("recorta el ranking al tamaño pedido", async () => {
    const { caso } = crear();
    for (let i = 1; i <= 8; i++) {
      await caso.ejecutar({ ...partida, seudonimo: `J${i}`, puntos: i * 500 });
    }
    const ultimo = await caso.ejecutar({ ...partida, seudonimo: "FIN", puntos: 100 });
    if (!ultimo.ok) throw new Error("la partida era válida");
    expect(ultimo.value.ranking).toHaveLength(TOP);
  });

  it("el contador parte del arranque de cortesía y sube con cada partida", async () => {
    const { caso } = crear();
    const primera = await caso.ejecutar(partida);
    if (!primera.ok) throw new Error("la partida era válida");
    expect(primera.value.partidasJugadas).toBe(PARTIDAS_DE_SALIDA + 1);

    const segunda = await caso.ejecutar(partida);
    if (!segunda.ok) throw new Error("la partida era válida");
    expect(segunda.value.partidasJugadas).toBe(PARTIDAS_DE_SALIDA + 2);
  });

  it("a igual marcador, delante quien lo consiguió antes", async () => {
    const { caso } = crear();
    await caso.ejecutar({ ...partida, seudonimo: "UNO", puntos: 5000 });
    const segundo = await caso.ejecutar({ ...partida, seudonimo: "DOS", puntos: 5000 });
    if (!segundo.ok) throw new Error("la partida era válida");
    expect(segundo.value.ranking.map((p) => p.seudonimo)).toEqual(["UNO", "DOS"]);
  });
});
