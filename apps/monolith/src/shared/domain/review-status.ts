/** Estado público de solo lectura; no incluye configuración ni errores internos. */
export interface ReviewStatus {
  readonly reviewing: boolean;
  readonly nextReviewAt: string | null;
  readonly serverTime: string;
  readonly timeZone: string;
}

export type ReadReviewStatus = () => ReviewStatus;
