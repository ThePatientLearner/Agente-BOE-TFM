/**
 * `npm run subvenciones:ingest`                        → últimos 7 días
 * `npm run subvenciones:ingest -- 2026-08-01 2026-08-08` → rango concreto
 * `npm run subvenciones:ingest -- 2026-08-01 2026-08-08 --refrescar`
 *
 * Descarga las convocatorias de la BDNS del periodo y las guarda con su
 * tipo: concurrencia competitiva o concesión directa. Después ingiere
 * las adjudicaciones (concesiones) del mismo rango para clasificar el
 * destino público/privado de las directas por NIF/CIF del beneficiario.
 *
 * Es seguro repetirlo: la clave natural es el código BDNS / codConcesion
 * y la ingesta hace UPSERT. Sin `--refrescar` se salta las fichas de
 * convocatoria ya guardadas; con `--refrescar` las vuelve a pedir.
 * Las concesiones siempre se re-UPSERTean (son baratas en listado).
 */
import { loadConfig } from "../shared/config/config.js";
import { createDatabase } from "../shared/db/connection.js";
import { createLogger } from "../shared/logger/logger.js";
import { isoDate, todayIn, type IsoDate } from "../shared/domain/iso-date.js";
import {
  BdnsApiGateway,
  IngestConcesiones,
  IngestConvocatorias,
  PostgresConvocatoriaRepository,
} from "../modules/spending/index.js";

const DIAS_POR_DEFECTO = 7;

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger();
  const database = createDatabase(config.databaseUrl);

  try {
    const argumentos = process.argv.slice(2);
    const refrescar = argumentos.includes("--refrescar");
    const fechas = argumentos.filter((argumento) => !argumento.startsWith("--"));

    const rango = resolverRango(fechas, config.timeZone);
    if (!rango.ok) {
      console.error(rango.error.message);
      process.exitCode = 1;
      return;
    }
    const { desde, hasta } = rango.value;

    const gateway = new BdnsApiGateway();
    const repo = new PostgresConvocatoriaRepository(database.db);
    const caso = new IngestConvocatorias(gateway, repo);
    const casoConcesiones = new IngestConcesiones(gateway, repo);

    logger.info({ desde, hasta, refrescar }, "BDNS: empezando ingesta de convocatorias");
    const resultado = await caso.execute(desde, hasta, { refrescar });

    if (!resultado.ok) {
      logger.error({ desde, hasta, error: resultado.error.message }, "BDNS: ingesta falló");
      process.exitCode = 1;
      return;
    }

    logger.info({ desde, hasta, ...resultado.value }, "BDNS: convocatorias terminadas");

    if (resultado.value.sinClasificar > 0) {
      logger.warn(
        { sinClasificar: resultado.value.sinClasificar },
        "Convocatorias con tipo desconocido: revísalas antes de publicar cifras",
      );
    }

    logger.info({ desde, hasta }, "BDNS: empezando ingesta de concesiones (público/privado)");
    const concesiones = await casoConcesiones.execute(desde, hasta);
    if (!concesiones.ok) {
      logger.error(
        { desde, hasta, error: concesiones.error.message },
        "BDNS: ingesta de concesiones falló",
      );
      process.exitCode = 1;
      return;
    }
    logger.info({ desde, hasta, ...concesiones.value }, "BDNS: concesiones terminadas");
  } finally {
    await database.close();
  }
}

function resolverRango(
  fechas: readonly string[],
  timeZone: string,
): { ok: true; value: { desde: IsoDate; hasta: IsoDate } } | { ok: false; error: Error } {
  if (fechas.length === 0) {
    const hasta = todayIn(timeZone);
    const desde = restarDias(hasta, DIAS_POR_DEFECTO);
    return { ok: true, value: { desde, hasta } };
  }

  if (fechas.length !== 2) {
    return {
      ok: false,
      error: new Error("Uso: subvenciones:ingest [-- desde hasta] [--refrescar] (yyyy-mm-dd)"),
    };
  }

  const desde = isoDate(fechas[0] as string);
  if (!desde.ok) return { ok: false, error: desde.error };
  const hasta = isoDate(fechas[1] as string);
  if (!hasta.ok) return { ok: false, error: hasta.error };

  return { ok: true, value: { desde: desde.value, hasta: hasta.value } };
}

function restarDias(fecha: IsoDate, dias: number): IsoDate {
  const fin = new Date(`${fecha}T00:00:00Z`);
  fin.setUTCDate(fin.getUTCDate() - dias);
  return (fin.toISOString().slice(0, 10) as IsoDate);
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
