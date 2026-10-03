/**
 * `npm run subvenciones:notify`
 *
 * Avisa en Telegram y Discord de que el panel de subvenciones se ha
 * actualizado. Lo lanza el script semanal de los lunes tras la ingesta.
 *
 * No vuelve a descargar la BDNS: lee la cobertura y el reparto ya guardados
 * y compone una o dos frases con el dato principal + el enlace a la web.
 */
import { loadConfig } from "../shared/config/config.js";
import { createDatabase } from "../shared/db/connection.js";
import { createLogger } from "../shared/logger/logger.js";
import {
  ConsoleNotifier,
  DiscordNotifier,
  TelegramNotifier,
  type Announcement,
  type Notifier,
} from "../modules/notifications/index.js";
import { PostgresConvocatoriaRepository } from "../modules/spending/index.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger();
  const database = createDatabase(config.databaseUrl);

  try {
    const spending = new PostgresConvocatoriaRepository(database.db);
    const cobertura = await spending.cobertura();
    if (!cobertura) {
      console.error("No hay convocatorias en la base de datos. ¿Has ingerido la BDNS?");
      process.exitCode = 1;
      return;
    }

    const reparto = await spending.reparto(cobertura.desde, cobertura.hasta);
    const announcement = componerAnuncio(reparto, config.publicWebUrl);

    const notifiers: Notifier[] = [];
    if (config.telegramBotToken && config.telegramChannel) {
      notifiers.push(new TelegramNotifier(config.telegramBotToken, config.telegramChannel));
    }
    if (config.discordWebhookUrl) {
      notifiers.push(new DiscordNotifier(config.discordWebhookUrl));
    }
    if (notifiers.length === 0) {
      notifiers.push(new ConsoleNotifier(logger));
      console.warn("Sin canales públicos en .env: se imprime en consola.");
    }

    console.log(`Título: ${announcement.title}`);
    console.log(`Cuerpo: ${announcement.body}`);
    console.log(`Enlace: ${announcement.url}`);
    console.log(`Canales: ${notifiers.map((n) => n.channel).join(", ")}\n`);

    let failures = 0;
    for (const notifier of notifiers) {
      const result = await notifier.sendAnnouncement(announcement);
      if (result.ok) {
        console.log(`✓ ${notifier.channel}: enviado`);
      } else {
        failures += 1;
        console.error(`✗ ${notifier.channel}: ${result.error.message}`);
      }
    }

    if (failures > 0) process.exitCode = 1;
  } finally {
    await database.close();
  }
}

function componerAnuncio(
  reparto: {
    desde: string;
    hasta: string;
    directas: { convocatorias: number; importe: string };
    competitivas: { convocatorias: number; importe: string };
    sinClasificar: { convocatorias: number; importe: string };
  },
  publicWebUrl: string,
): Announcement {
  const dineroDirectas = Number(reparto.directas.importe) || 0;
  const dineroTotal =
    dineroDirectas +
    (Number(reparto.competitivas.importe) || 0) +
    (Number(reparto.sinClasificar.importe) || 0);

  const porcentaje =
    dineroTotal > 0
      ? ((dineroDirectas / dineroTotal) * 100).toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })
      : "0";

  const body = [
    `Entre el ${fechaCorta(reparto.desde)} y el ${fechaCorta(reparto.hasta)}, la concesión directa se llevó el ${porcentaje}% del dinero convocado: ${eurosCompactos(dineroDirectas)} de un total de ${eurosCompactos(dineroTotal)}.`,
    `${reparto.directas.convocatorias.toLocaleString("es-ES")} convocatorias directas frente a ${reparto.competitivas.convocatorias.toLocaleString("es-ES")} con concurso.`,
  ].join(" ");

  return {
    title: "Actualización semanal · Subvenciones sin concurso",
    body,
    url: `${publicWebUrl.replace(/\/$/, "")}/subvenciones`,
  };
}

function fechaCorta(iso: string): string {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${Number(d)}/${Number(m)}/${y}`;
}

function eurosCompactos(importe: number): string {
  if (importe >= 1_000_000) {
    return `${(importe / 1_000_000).toLocaleString("es-ES", {
      maximumFractionDigits: 1,
    })} M€`;
  }
  return `${importe.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
