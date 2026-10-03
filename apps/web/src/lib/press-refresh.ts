export const PRESS_REFRESH_MS = 10 * 60 * 1000;

/** Esperar a que venza la consulta más reciente: las cuatro fuentes se
 * consultan en paralelo, pero pueden terminar en segundos distintos. */
export function pressRefreshDelay(checkedAt: Array<string | null>, now: number): number {
  const timestamps = checkedAt.map((value) => value ? Date.parse(value) : NaN).filter(Number.isFinite);
  if (!timestamps.length) return 0;
  return Math.min(PRESS_REFRESH_MS, Math.max(0, Math.max(...timestamps) + PRESS_REFRESH_MS - now));
}

export function formatPressCountdown(ms: number): string {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
