import { describe, expect, it } from "vitest";
import { generarCodigo, limpiarSeudonimo, validarPartida } from "./partida.js";

/** Partida verosímil de referencia; cada test rompe solo lo que mira. */
const partida = {
  seudonimo: "ROBER",
  puntos: 4200,
  nivel: 3,
  segundos: 180,
  mejorCombo: 4,
};

describe("generarCodigo", () => {
  it("tiene la forma BOE-XXXX-XXXX", () => {
    expect(generarCodigo()).toMatch(/^BOE-[ACDEFGHJKLMNPQRSTVWXYZ23456789]{4}-[ACDEFGHJKLMNPQRSTVWXYZ23456789]{4}$/);
  });

  it("no usa caracteres que se confunden al copiarlos a mano", () => {
    // El código se dicta y se transcribe desde una captura: una O que era un
    // 0 convierte el resguardo del premio en una discusión.
    // Solo los bloques al azar: la O del prefijo "BOE-" es fija y no se
    // transcribe a ciegas.
    const bloques = Array.from({ length: 200 }, () => generarCodigo().slice(4)).join("");
    expect(bloques).not.toMatch(/[IO01U]/);
  });

  it("no repite", () => {
    const vistos = new Set(Array.from({ length: 500 }, generarCodigo));
    expect(vistos.size).toBe(500);
  });
});

describe("limpiarSeudonimo", () => {
  it("lo deja como lo pinta el marcador: mayúsculas y 6 caracteres", () => {
    expect(limpiarSeudonimo("rober")).toBe("ROBER");
    expect(limpiarSeudonimo("nombrelarguísimo")).toBe("NOMBRE");
  });

  it("tira lo que las casillas del marcador no pueden mostrar", () => {
    expect(limpiarSeudonimo("<b>hola</b>")).toBe("BHOLAB");
    expect(limpiarSeudonimo("ñ4Ñ")).toBe("Ñ4Ñ");
  });

  it("null cuando no queda nada utilizable: eso es jugar en anónimo", () => {
    expect(limpiarSeudonimo("   ")).toBeNull();
    expect(limpiarSeudonimo("!!!")).toBeNull();
    expect(limpiarSeudonimo("")).toBeNull();
    expect(limpiarSeudonimo(null)).toBeNull();
    expect(limpiarSeudonimo(42)).toBeNull();
  });
});

describe("validarPartida", () => {
  it("acepta una partida corriente", () => {
    expect(validarPartida(partida).ok).toBe(true);
  });

  it("acepta una partida larga y muy buena", () => {
    // Un jugador bueno llega lejos: el filtro no puede castigar eso.
    expect(validarPartida({ ...partida, puntos: 38000, nivel: 12, segundos: 1500 }).ok).toBe(
      true,
    );
  });

  it("rechaza no haber guardado nada: sin caja fuerte no hay marcador", () => {
    expect(validarPartida({ ...partida, puntos: 0 }).ok).toBe(false);
    expect(validarPartida({ ...partida, puntos: -100 }).ok).toBe(false);
  });

  it("rechaza un marcador que no cabe en el nivel alcanzado", () => {
    expect(validarPartida({ ...partida, puntos: 900000, nivel: 1 }).ok).toBe(false);
  });

  it("rechaza ganar más dinero del que el juego reparte por segundo", () => {
    expect(validarPartida({ ...partida, puntos: 50000, nivel: 20, segundos: 12 }).ok).toBe(
      false,
    );
  });

  it("rechaza duraciones imposibles por los dos lados", () => {
    expect(validarPartida({ ...partida, segundos: 3 }).ok).toBe(false);
    expect(validarPartida({ ...partida, segundos: 60 * 60 * 24 }).ok).toBe(false);
  });

  it("rechaza valores que no son enteros", () => {
    expect(validarPartida({ ...partida, puntos: 1200.5 }).ok).toBe(false);
    expect(validarPartida({ ...partida, nivel: Number.NaN }).ok).toBe(false);
    expect(validarPartida({ ...partida, mejorCombo: Number.POSITIVE_INFINITY }).ok).toBe(false);
  });
});
