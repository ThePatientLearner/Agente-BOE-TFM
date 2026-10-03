/**
 * `npm run report`            → el parte de hoy
 * `npm run report -- 2026-08-10` → el de una fecha concreta
 *
 * Manda al chat privado de operación el mismo parte que el cron envía en su
 * segunda pasada, y lo imprime también por pantalla. Sirve para dos cosas:
 * comprobar que el aviso llega, y preguntar «¿cómo va hoy?» sin abrir la base
 * de datos.
 *
 * NO ingiere, NO resume y NO notifica a los canales públicos: solo lee el
 * estado de las disposiciones y escribe al chat privado. Es seguro repetirlo.
 */
import { loadConfig } from "../shared/config/config.js";
import { createLogger } from "../shared/logger/logger.js";
import { createDatabase } from "../shared/db/connection.js";
import { isoDate, todayIn } from "../shared/domain/iso-date.js";
import { buildApplication } from "../composition.js";
import { buildDailyReport } from "../scheduler/daily-report.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger();
  const database = createDatabase(config.databaseUrl);

  try {
    const app = buildApplication(config, logger, database.db);

    const argument = process.argv[2];
    let date = todayIn(config.timeZone);
    if (argument) {
      const parsed = isoDate(argument);
      if (!parsed.ok) {
        console.error(`Fecha inválida "${argument}". Formato esperado: yyyy-mm-dd`);
        process.exitCode = 1;
        return;
      }
      date = parsed.value;
    }

    const status = await app.dayStatus.read(date);
    // `null` porque este comando no llama al BOE: solo lee lo que ya hay
    // guardado, y no puede distinguir "no hubo boletín" de "hubo pero sin
    // Sección I". El parte automático del cron sí lo sabe.
    const text = buildDailyReport(date, status, null, false);

    console.log(text);
    console.log();

    if (!app.alerter.enabled) {
      console.error("Sin TELEGRAM_ALERT_CHAT_ID configurado: no se ha enviado a ningún sitio.");
      process.exitCode = 1;
      return;
    }

    const sent = await app.alerter.send(text);
    if (!sent.ok) {
      console.error(`No se pudo enviar: ${sent.error.message}`);
      process.exitCode = 1;
      return;
    }
    console.log("Enviado al chat privado de operación.");
  } finally {
    await database.close();
  }
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
