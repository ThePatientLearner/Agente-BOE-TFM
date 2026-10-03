import { describe, expect, it } from "vitest";
import {
  clasificarSectorBeneficiario,
  extraerNifCif,
} from "./sector-beneficiario.js";

describe("extraerNifCif", () => {
  it("saca el CIF del prefijo del beneficiario BDNS", () => {
    expect(extraerNifCif("P2807900B AYUNTAMIENTO DE MADRID")).toBe("P2807900B");
    expect(extraerNifCif("G31679889 FUNDACION CENER")).toBe("G31679889");
    expect(extraerNifCif("12345678Z FULANO DE TAL")).toBe("12345678Z");
  });

  it("devuelve null si no hay identificador reconocible", () => {
    expect(extraerNifCif("SIN DATOS")).toBeNull();
    expect(extraerNifCif("")).toBeNull();
  });
});

describe("clasificarSectorBeneficiario", () => {
  it("marca como público P, Q y S", () => {
    expect(clasificarSectorBeneficiario("P2807900B AYUNTAMIENTO")).toBe("publico");
    expect(clasificarSectorBeneficiario("Q2818018H ORGANISMO")).toBe("publico");
    expect(clasificarSectorBeneficiario("S2800549A MINISTERIO")).toBe("publico");
  });

  it("marca como privado empresas, asociaciones y personas", () => {
    expect(clasificarSectorBeneficiario("A28015865 TELEFONICA")).toBe("privado");
    expect(clasificarSectorBeneficiario("B12345678 SL CUALQUIERA")).toBe("privado");
    expect(clasificarSectorBeneficiario("G31679889 FUNDACION")).toBe("privado");
    expect(clasificarSectorBeneficiario("12345678Z PERSONA")).toBe("privado");
  });

  it("trata el NIF enmascarado de personas físicas como privado", () => {
    expect(clasificarSectorBeneficiario("***0666** JAVIER CHUST MARTINEZ")).toBe(
      "privado",
    );
  });

  it("desconocido si no hay NIF/CIF ni máscara", () => {
    expect(clasificarSectorBeneficiario("BENEFICIARIO SIN CIF")).toBe("desconocido");
  });
});
