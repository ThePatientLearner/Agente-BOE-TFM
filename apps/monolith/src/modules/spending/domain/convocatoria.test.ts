import { describe, expect, it } from "vitest";
import { clasificar } from "./convocatoria.js";

describe("clasificar", () => {
  it("reconoce la concesión directa", () => {
    expect(clasificar("Concesión directa - canónica")).toBe(true);
  });

  it("reconoce la concurrencia competitiva", () => {
    expect(clasificar("Concurrencia competitiva - canónica")).toBe(false);
  });

  it("no depende de acentos, mayúsculas ni espacios sobrantes", () => {
    expect(clasificar("  CONCESION DIRECTA - NO CANONICA  ")).toBe(true);
    expect(clasificar("concurrencia competitiva")).toBe(false);
  });

  /**
   * El caso que protege la herramienta: ante un tipo que no conocemos, la
   * respuesta es "no lo sé", nunca "hubo concurso". Clasificar por defecto
   * como competitiva escondería justo lo que se busca.
   */
  it("devuelve null ante un tipo desconocido o ausente", () => {
    expect(clasificar(null)).toBeNull();
    expect(clasificar("")).toBeNull();
    expect(clasificar("Régimen especial de algo nuevo")).toBeNull();
  });
});
