/** Próxima pasada de los horarios diarios configurados en el agente.
 * Recorre instantes UTC para respetar los cambios de hora en Madrid. El
 * resultado se reutiliza hasta vencer; no se recalcula en cada petición.
 * Si se configura un cron no diario, se omite el contador antes que mentir.
 */
export function createNextReview(schedules: readonly string[], timeZone: string) {
  const times = new Set<number>();
  for (const schedule of schedules) {
    const match = /^(\d{1,2})\s+(\d{1,2})\s+\*\s+\*\s+\*$/.exec(schedule.trim());
    if (!match || Number(match[1]) > 59 || Number(match[2]) > 23) return () => null;
    times.add(Number(match[2]) * 60 + Number(match[1]));
  }
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });
  let cachedAt = 0;
  let next: number | null = null;
  return (now: Date): Date | null => {
    const nowMs = now.getTime();
    if (!times.size) return null;
    if (next !== null && nowMs >= cachedAt && nowMs < next) return new Date(next);
    cachedAt = nowMs;
    next = null;
    const firstMinute = (Math.floor(nowMs / 60_000) + 1) * 60_000;
    for (let minute = 0; minute < 48 * 60; minute++) {
      const candidate = firstMinute + minute * 60_000;
      const parts = formatter.formatToParts(candidate);
      const hour = Number(parts.find((part) => part.type === "hour")?.value);
      const minutes = Number(parts.find((part) => part.type === "minute")?.value);
      if (times.has(hour * 60 + minutes)) {
        next = candidate;
        break;
      }
    }
    return next === null ? null : new Date(next);
  };
}
