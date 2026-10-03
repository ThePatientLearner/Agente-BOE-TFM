"use client";

/**
 * Abre el diálogo de impresión del navegador (Imprimir / Guardar como PDF)
 * sobre la ficha del resumen. Es un botón de cliente porque `window.print`
 * solo existe en el navegador.
 */
export function PrintSummaryButton() {
  return (
    <button
      type="button"
      className="print-summary-btn"
      onClick={() => window.print()}
      title="Imprimir o guardar este resumen como PDF"
    >
      <svg
        viewBox="0 0 24 24"
        width="15"
        height="15"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9V3h12v6" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <path d="M6 14h12v7H6z" />
      </svg>
      Imprimir resumen
    </button>
  );
}
