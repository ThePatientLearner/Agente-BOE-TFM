import { sql } from 'drizzle-orm';
import type { Database } from '../../../shared/db/connection.js';
import type { AssistantSettings } from '../domain/assistant.js';

/**
 * Se consulta en cada pregunta en vez de guardarse en memoria: es una lectura
 * por clave primaria, y así el cambio del administrador se aplica al instante
 * aunque algún día haya más de un proceso sirviendo la API.
 */
export class PostgresAssistantSettings implements AssistantSettings {
  constructor(private readonly db: Database) {}
  async model(): Promise<string | null> {
    const rows = await this.db.execute(sql`SELECT value FROM assistant.settings WHERE key = 'model'`);
    return rows[0] ? String(rows[0].value) : null;
  }
  async setModel(id: string, by: string): Promise<void> {
    await this.db.execute(sql`INSERT INTO assistant.settings (key, value, updated_by, updated_at) VALUES ('model', ${id}, ${by}, now())
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now()`);
  }
}
