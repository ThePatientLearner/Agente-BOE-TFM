/**
 * Solo concesiones (adjudicaciones) de la BDNS.
 * Uso: npm run subvenciones:concesiones -- 2026-07-28 2026-08-11
 */
import { loadConfig } from "../shared/config/config.js";
import { createDatabase } from "../shared/db/connection.js";
import { createLogger } from "../shared/logger/logger.js";
import { isoDate, todayIn, type IsoDate } from "../shared/domain/iso-date.js";
import {
  BdnsApiGateway,
  IngestConcesiones,
  PostgresConvocatoriaRepository,
} from "../modules/spending/index.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger();
  const database = createDatabase(config.databaseUrl);

  try {
    const fechas = process.argv.slice(2).filter((a) => !a.startsWith("--"));
    let desde: IsoDate;
    let hasta: IsoDate;

    if (fechas.length === 0) {
      hasta = todayIn(config.timeZone);
      const d = new Date(`${hasta}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() - 14);
      desde = d.toISOString().slice(0, 10) as IsoDate;
    } else if (fechas.length === 2) {
      const a = isoDate(fechas[0]!);
      const b = isoDate(fechas[1]!);
      if (!a.ok || !b.ok) {
        console.error("Fechas inválidas. Formato yyyy-mm-dd");
        process.exitCode = 1;
        return;
      }
      desde = a.value;
      hasta = b.value;
    } else {
      console.error("Uso: subvenciones:concesiones [desde hasta]");
      process.exitCode = 1;
      return;
    }

    const caso = new IngestConcesiones(
      new BdnsApiGateway(),
      new PostgresConvocatoriaRepository(database.db),
    );
    logger.info({ desde, hasta }, "BDNS: solo concesiones");
    const r = await caso.execute(desde, hasta);
    if (!r.ok) {
      logger.error({ error: r.error.message }, "falló");
      process.exitCode = 1;
      return;
    }
    logger.info(r.value, "concesiones ok");
  } finally {
    await database.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
