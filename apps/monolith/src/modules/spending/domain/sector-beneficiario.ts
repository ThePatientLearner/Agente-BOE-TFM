/**
 * Clasificación del beneficiario de una concesión a partir del NIF/CIF.
 *
 * La BDNS devuelve el beneficiario como «CIF NOMBRE» (p. ej.
 * `P2807900B AYUNTAMIENTO DE…`). La letra del CIF de personas jurídicas
 * identifica el tipo de entidad en la AEAT:
 *
 *   P  Corporaciones locales (ayuntamientos, diputaciones…)
 *   Q  Organismos públicos
 *   S  Órganos de la Administración del Estado y de las CCAA
 *
 * El resto (A/B empresas, G asociaciones/fundaciones, personas físicas…)
 * se cuenta como privado a efectos de esta radiografía. Es una aproximación:
 * alguna fundación del sector público usa G, y alguna empresa pública usa A.
 */

export type SectorBeneficiario = "publico" | "privado" | "desconocido";

/** Extrae el NIF/CIF del prefijo del campo `beneficiario` de la BDNS. */
export function extraerNifCif(beneficiario: string): string | null {
  const token = beneficiario.trim().split(/\s+/)[0] ?? "";
  // Personas jurídicas: letra + 8 dígitos (a veces dígito de control letra).
  if (/^[A-Za-z]\d{7}[A-Za-z0-9]$/.test(token)) return token.toUpperCase();
  // Personas físicas: 8 dígitos + letra.
  if (/^\d{8}[A-Za-z]$/.test(token)) return token.toUpperCase();
  // NIE: X/Y/Z + 7 dígitos + letra.
  if (/^[XYZ]\d{7}[A-Za-z]$/i.test(token)) return token.toUpperCase();
  return null;
}

export function clasificarSectorBeneficiario(beneficiario: string): SectorBeneficiario {
  const texto = beneficiario.trim();
  // La BDNS enmascara el NIF de personas físicas (***0666** NOMBRE).
  // Si aparece, es un particular → privado.
  if (/^\*+/.test(texto) || texto.includes("***")) return "privado";

  const nif = extraerNifCif(texto);
  if (!nif) return "desconocido";

  const letra = nif[0]!;
  // Personas físicas (NIF numérico o NIE).
  if (/\d/.test(letra) || letra === "X" || letra === "Y" || letra === "Z") {
    return "privado";
  }
  // Letras especiales de personas físicas (K, L, M).
  if (letra === "K" || letra === "L" || letra === "M") return "privado";

  // Sector público (criterio AEAT de tipo de entidad).
  if (letra === "P" || letra === "Q" || letra === "S") return "publico";

  // Empresas, cooperativas, asociaciones, religiosas, extranjeras…
  return "privado";
}
