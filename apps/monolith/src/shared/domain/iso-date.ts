import { err, ok, type Result } from "./result.js";

/** Fecha de publicación en formato "yyyy-mm-dd". */
export type IsoDate = string & { readonly __brand: "IsoDate" };

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isoDate(raw: string): Result<IsoDate> {
  if (!ISO_DATE_PATTERN.test(raw) || Number.isNaN(Date.parse(raw))) {
    return err(new Error(`Fecha inválida (se espera yyyy-mm-dd): "${raw}"`));
  }
  return ok(raw as IsoDate);
}

/** Fecha de hoy en una zona horaria concreta (el BOE vive en Europe/Madrid). */
export function todayIn(timeZone: string): IsoDate {
  const formatted = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return formatted as IsoDate;
}

/**
 * Resta días de calendario a una fecha ISO. Usa mediodía UTC para no
 * tropezar con el cambio de hora al restar en el borde de un DST.
 */
export function daysBefore(date: IsoDate, days: number): IsoDate {
  if (!Number.isInteger(days) || days < 0) {
    throw new Error(`daysBefore: "days" debe ser un entero ≥ 0 (recibido ${days})`);
  }
  const moment = new Date(`${date}T12:00:00Z`);
  moment.setUTCDate(moment.getUTCDate() - days);
  const parsed = isoDate(moment.toISOString().slice(0, 10));
  if (!parsed.ok) throw parsed.error;
  return parsed.value;
}

/**
 * Días a procesar en una pasada del cron: del más antiguo al de hoy.
 * Con lookbackDays=1 → [ayer, hoy]. Con 0 → [hoy].
 */
export function datesForCronPass(today: IsoDate, lookbackDays: number): IsoDate[] {
  if (!Number.isInteger(lookbackDays) || lookbackDays < 0) {
    throw new Error(
      `datesForCronPass: lookbackDays debe ser un entero ≥ 0 (recibido ${lookbackDays})`,
    );
  }
  const dates: IsoDate[] = [];
  for (let back = lookbackDays; back >= 0; back--) {
    dates.push(daysBefore(today, back));
  }
  return dates;
}
