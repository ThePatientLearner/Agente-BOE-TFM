/** "2026-08-01" → "1 de agosto de 2026". El mediodía evita saltos de zona horaria. */
export function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * "12345678.90" → "12.345.679 €". Sin céntimos: en cifras de gasto público
 * los dos decimales son ruido y estorban la comparación entre filas.
 *
 * El importe llega como cadena porque en la base es `numeric(16,2)`. Al
 * convertirlo aquí se pierde exactitud teórica, pero el máximo que cabe en esa
 * columna sigue estando muy por debajo del entero seguro de JavaScript, así
 * que para mostrarlo es inofensivo.
 */
export function formatEuros(importe: string | null): string {
  if (importe === null) return "Sin importe publicado";
  const numero = Number(importe);
  if (!Number.isFinite(numero)) return "Sin importe publicado";
  return `${numero.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;
}

/** Porcentaje con un decimal, en formato español: 48.8 → "48,8 %". */
export function formatPorcentaje(parte: number, total: number): string {
  if (total <= 0) return "—";
  return `${((parte / total) * 100).toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`;
}
