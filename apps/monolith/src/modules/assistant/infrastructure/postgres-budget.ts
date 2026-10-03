import { sql } from 'drizzle-orm';
import type { Database } from '../../../shared/db/connection.js';
import { todayIn } from '../../../shared/domain/iso-date.js';
import { AssistantError, type UsageBudget } from '../domain/assistant.js';

/** Consultas al día por cuenta (el administrador no tiene límite). */
export const DAILY_QUERIES = 5;

export class PostgresBudget implements UsageBudget {
  constructor(private readonly db: Database, private readonly dailyTokens: number) {}
  async reserve(userId: string, tokens: number, isAdmin = false): Promise<string> {
    // El administrador está exento de cuotas de consultas y tokens diarios.
    if (isAdmin) return 'admin';
    const day = todayIn('Europe/Madrid'), bucket = `user:${userId}`;
    await this.db.transaction(async tx => {
      // Bloqueo entre procesos: ningún reinicio o réplica salta el presupuesto.
      await tx.execute(sql`SELECT pg_advisory_xact_lock(723945)`);
      await tx.execute(sql`DELETE FROM assistant.usage WHERE day < ${day}::date - 30`);
      for (const key of ['global', bucket]) {
        await tx.execute(sql`INSERT INTO assistant.usage (bucket,day) VALUES (${key},${day}) ON CONFLICT DO NOTHING`);
        const rows = await tx.execute(sql`SELECT requests,tokens,last_request_at FROM assistant.usage WHERE bucket=${key} AND day=${day} FOR UPDATE`);
        const row = rows[0]!;
        if (key !== 'global' && Number(row.requests) >= DAILY_QUERIES) throw new AssistantError(429, `Has utilizado tus ${DAILY_QUERIES} consultas de hoy. Podrás volver a preguntar mañana (hora de Madrid).`);
        if (key === 'global' && (Number(row.requests) >= 200 || Number(row.tokens) + tokens > this.dailyTokens)) throw new AssistantError(429, 'Se ha alcanzado el límite diario del asistente. Vuelve mañana.');
        if (key !== 'global' && row.last_request_at && Date.now() - new Date(String(row.last_request_at)).getTime() < 10_000) throw new AssistantError(429, 'Espera unos segundos entre consultas.');
        await tx.execute(sql`UPDATE assistant.usage SET requests=requests+1,tokens=tokens+${tokens},last_request_at=now() WHERE bucket=${key} AND day=${day}`);
      }
    });
    return `${day}|${bucket}`;
  }
  async settle(reservation: string, reserved: number, used: number): Promise<void> {
    if (reservation === 'admin') return;
    const [day, bucket] = reservation.split('|');
    const returned = Math.max(0, reserved - used);
    await this.db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(723945)`);
      await tx.execute(sql`UPDATE assistant.usage SET tokens=greatest(0,tokens-${returned}) WHERE day=${day} AND bucket IN ('global',${bucket})`);
    });
  }
}
