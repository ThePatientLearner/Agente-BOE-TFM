/** Estado público de solo lectura; no incluye configuración ni errores internos. */
export interface ReviewStatus {
  readonly reviewing: boolean;
  /** Inicio real de la última pasada: permite mostrar su ventana de 15 minutos. */
  readonly reviewStartedAt?: string | null;
  readonly nextReviewAt: string | null;
  readonly serverTime: string;
  readonly timeZone: string;
}

export type ReadReviewStatus = () => ReviewStatus;
