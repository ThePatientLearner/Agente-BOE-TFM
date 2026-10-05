export interface ReviewSnapshot {
  reviewing: boolean;
  nextReviewAt: string | null;
  timeZone: string;
  remainingMs: number | null;
  receivedAt: number;
  reviewWindowMs: number | null;
}

/** El contador usa el reloj del servidor y tiempo transcurrido monotónico,
 * no la hora ni la zona configuradas en el teléfono. */
export function readReviewSnapshot(value: unknown, receivedAt: number, latencyMs: number): ReviewSnapshot {
  if (!value || typeof value !== "object") throw new Error("Estado inválido");
  const data = value as Record<string, unknown>;
  if (typeof data.reviewing !== "boolean" || typeof data.timeZone !== "string"
    || typeof data.serverTime !== "string" || !Number.isFinite(Date.parse(data.serverTime))
    || (data.reviewStartedAt != null && (typeof data.reviewStartedAt !== "string"
      || !Number.isFinite(Date.parse(data.reviewStartedAt))))
    || (data.nextReviewAt !== null && (typeof data.nextReviewAt !== "string"
      || !Number.isFinite(Date.parse(data.nextReviewAt))))) throw new Error("Estado inválido");
  return {
    reviewing: data.reviewing, nextReviewAt: data.nextReviewAt as string | null,
    timeZone: data.timeZone, receivedAt,
    reviewWindowMs: typeof data.reviewStartedAt !== "string" ? null
      : Math.max(0, Date.parse(data.reviewStartedAt) + 15 * 60_000 - Date.parse(data.serverTime) - latencyMs / 2),
    remainingMs: data.nextReviewAt === null ? null
      : Math.max(0, Date.parse(data.nextReviewAt as string) - Date.parse(data.serverTime) - latencyMs / 2),
  };
}

/** La ventana visual dura 15 minutos desde un inicio confirmado, incluso
 * al volver a abrir la página. Una pasada más larga sigue mostrando actividad. */
export function isReviewing(snapshot: ReviewSnapshot, now: number): boolean {
  return snapshot.reviewing || (snapshot.reviewWindowMs !== null
    && snapshot.reviewWindowMs > now - snapshot.receivedAt);
}

export function remainingReviewMs(snapshot: ReviewSnapshot, now: number): number | null {
  return snapshot.remainingMs === null ? null : Math.max(0, snapshot.remainingMs - (now - snapshot.receivedAt));
}

export function formatReviewCountdown(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
}
