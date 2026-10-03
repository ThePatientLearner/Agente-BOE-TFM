/**
 * `npm run subvenciones:directas`                        → últimos 30 días
 * `npm run subvenciones:directas -- 2026-01-01 2026-08-08`
 *
 * Informe de concesiones directas: subvenciones repartidas sin concurso,
 * agrupadas por administración y ordenadas por dinero.
 *
 * IMPORTANTE — la concesión directa es LEGAL (art. 22.2 de la Ley General
 * de Subvenciones). Una subvención nominativa a una entidad concreta es la
 * forma normal de, por ejemplo, financiar a la Cruz Roja. Este informe NO
 * señala irregularidades: mide cuánto dinero se reparte sin concurrencia y
 * dónde se concentra. La señal está en los patrones y en los importes
 * anómalos, nunca en una convocatoria suelta.
 */
import { loadConfig } from "../shared/config/config.js";
import { createDatabase } from "../shared/db/connection.js";
import { isoDate, todayIn, type IsoDate } from "../shared/domain/iso-date.js";
import { PostgresConvocatoriaRepository } from "../modules/spending/index.js";

const DIAS_POR_DEFECTO = 30;
const TOP = 15;

async function main(): Promise<void> {
  const config = loadConfig();
  const database = createDatabase(config.databaseUrl);

  try {
    const argumentos = process.argv.slice(2);
    let desde: IsoDate;
    let hasta: IsoDate;

    if (argumentos.length === 2) {
      const a = isoDate(argumentos[0] as string);
      const b = isoDate(argumentos[1] as string);
      if (!a.ok || !b.ok) {
        console.error("Fechas inválidas. Formato esperado: yyyy-mm-dd");
        process.exitCode = 1;
        return;
      }
      desde = a.value;
      hasta = b.value;
    } else if (argumentos.length === 0) {
      hasta = todayIn(config.timeZone);
      const inicio = new Date(`${hasta}T00:00:00Z`);
      inicio.setUTCDate(inicio.getUTCDate() - DIAS_POR_DEFECTO);
      desde = inicio.toISOString().slice(0, 10) as IsoDate;
    } else {
      console.error("Uso: subvenciones:directas [-- desde hasta] (yyyy-mm-dd)");
      process.exitCode = 1;
      return;
    }

    const repositorio = new PostgresConvocatoriaRepository(database.db);
    const resumen = await repositorio.resumenDirectas(desde, hasta);
    const mayores = await repositorio.listarDirectas(desde, hasta, TOP);

    console.log(`\nCONCESIONES DIRECTAS  ${desde} … ${hasta}`);
    console.log("Subvenciones convocadas sin concurrencia competitiva (art. 22.2 LGS)\n");

    if (resumen.length === 0) {
      console.log("Sin datos en el periodo. ¿Has ejecutado `npm run subvenciones:ingest`?\n");
      return;
    }

    console.log("Por administración:");
    console.log(`  ${"ADMÓN".padEnd(12)}${"ÁMBITO".padEnd(34)}${"Nº".padStart(6)}${"IMPORTE".padStart(18)}`);
    for (const fila of resumen.slice(0, TOP)) {
      const ambito = (fila.nivel2 ?? "—").slice(0, 32);
      console.log(
        `  ${fila.nivel1.padEnd(12)}${ambito.padEnd(34)}` +
          `${String(fila.convocatorias).padStart(6)}${euros(fila.importeTotal).padStart(18)}`,
      );
    }

    console.log("\nMayores importes:");
    for (const convocatoria of mayores) {
      console.log(`  ${euros(convocatoria.presupuestoTotal).padStart(16)}  ${convocatoria.nivel2 ?? "—"}`);
      console.log(`  ${" ".repeat(16)}  ${convocatoria.descripcion.slice(0, 90)}`);
      console.log(`  ${" ".repeat(16)}  ${convocatoria.urlOficial}`);
    }
    console.log();
  } finally {
    await database.close();
  }
}

/** `numeric` de Postgres llega como texto; se formatea sin perder precisión. */
function euros(importe: string | null): string {
  if (importe === null) return "s/d";
  const valor = Number(importe);
  if (!Number.isFinite(valor)) return importe;
  return `${valor.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
