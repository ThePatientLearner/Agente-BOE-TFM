/**
 * `npm run notify:test`
 *
 * Envía un mensaje de prueba por cada canal PÚBLICO configurado en .env
 * (resúmenes del BOE), y opcionalmente una alerta al chat PRIVADO.
 *
 *   npm run notify:test           → solo canales públicos
 *   npm run notify:test -- alert  → solo la alerta privada de ops
 *   npm run notify:test -- all    → públicos + alerta privada
 *
 * No toca la base de datos ni el BOE.
 */
import { loadConfig } from "../shared/config/config.js";
import { gobiernoDeDisposicion } from "../shared/domain/comunidad.js";
import { createLogger } from "../shared/logger/logger.js";
import {
  ConsoleNotifier,
  DiscordNotifier,
  TelegramNotifier,
  TelegramPrivateAlerter,
  type Notifier,
} from "../modules/notifications/index.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const logger = createLogger();
  const mode = (process.argv[2] ?? "public").toLowerCase();
  const testPublic = mode === "public" || mode === "all";
  const testAlert = mode === "alert" || mode === "all";

  let failures = 0;

  if (testPublic) {
    const notifiers: Notifier[] = [];
    if (config.telegramBotToken && config.telegramChannel) {
      notifiers.push(new TelegramNotifier(config.telegramBotToken, config.telegramChannel));
    }
    if (config.discordWebhookUrl) {
      notifiers.push(new DiscordNotifier(config.discordWebhookUrl));
    }

    if (notifiers.length === 0) {
      console.error("Ningún canal público configurado en .env.");
      console.error("Telegram necesita TELEGRAM_BOT_TOKEN y TELEGRAM_CHANNEL.");
      console.error("Discord necesita DISCORD_WEBHOOK_URL.");
      process.exitCode = 1;
      return;
    }

    const message = {
      title: "PRUEBA · Nuevos horarios para camiones con mercancías peligrosas en Cataluña",
      shortPhrase:
        "Mensaje de prueba de BOE Inspector. Si lo estás leyendo, el canal está bien configurado.",
      impact: 3,
      officialUrl: "https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-16758",
      summaryUrl: `${config.publicWebUrl}/d/BOE-A-2026-16758`,
      // Con comunidad a propósito: la prueba también sirve para ver cómo
      // queda la línea de "quién gobierna" en cada canal.
      gobierno: gobiernoDeDisposicion("COMUNIDAD AUTÓNOMA DE CATALUÑA"),
    };

    console.log(`Canales públicos: ${notifiers.map((n) => n.channel).join(", ")}\n`);

    for (const notifier of notifiers) {
      const result = await notifier.send(message);
      if (result.ok) {
        console.log(`✓ ${notifier.channel}: enviado`);
      } else {
        failures += 1;
        console.error(`✗ ${notifier.channel}: ${result.error.message}`);
      }
    }

    console.log();
    await new ConsoleNotifier(logger).send(message);
  }

  if (testAlert) {
    if (!config.telegramBotToken || !config.telegramAlertChatId) {
      console.error(
        "\nAlerta privada: falta TELEGRAM_BOT_TOKEN o TELEGRAM_ALERT_CHAT_ID en .env",
      );
      console.error(
        "El chat id es numérico (tu usuario), NO el @ del canal público.",
      );
      failures += 1;
    } else {
      const alerter = new TelegramPrivateAlerter(
        config.telegramBotToken,
        config.telegramAlertChatId,
      );
      const result = await alerter.send(
        "PRUEBA de alerta privada.\nSi lees esto, los fallos de ingesta te llegarán aquí y no al canal público.",
      );
      if (result.ok) {
        console.log("\n✓ alerta privada (Telegram): enviada a TELEGRAM_ALERT_CHAT_ID");
      } else {
        failures += 1;
        console.error(`\n✗ alerta privada: ${result.error.message}`);
      }
    }
  }

  if (failures > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error("Fallo inesperado:", error);
  process.exit(1);
});
