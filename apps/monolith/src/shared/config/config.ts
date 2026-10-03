import { z } from "zod";

/**
 * Configuración validada en el arranque: si falta algo, el proceso
 * muere aquí, no a las 8:30 de la mañana en mitad del cron.
 * Los tokens de notificadores son opcionales: sin token, ese canal
 * simplemente no se activa.
 */
const configSchema = z.object({
  databaseUrl: z.string().min(1),
  // Proveedor de IA: cualquier API compatible con el formato de OpenAI.
  // Cambiar de proveedor = cambiar estas tres variables, sin tocar código.
  aiBaseUrl: z.string().url().default("https://api.minimax.io/v1"),
  aiModel: z.string().min(1).default("MiniMax-M3"),
  aiApiKey: z.string().min(1),
  /** Clave independiente para el bot público. Nunca usa el proveedor de resúmenes. */
  botOpenaiApiKey: z.string().optional(),
  /**
   * El bot público admite varios modelos y el administrador elige cuál corre
   * desde el propio panel. Esto es solo el que sale por defecto para todos los
   * demás; si se queda sin clave, se cae al primero que tenga una.
   *
   * Lo que se declare aquí tiene que coincidir con /privacidad, que nombra a
   * quién se envían las preguntas del asistente. Esa lista de encargados del
   * tratamiento es una obligación legal: cambiar este valor sin cambiar la
   * página deja a la web mintiendo sobre adónde van los datos de la gente.
   */
  botModel: z.enum(["gpt", "minimax"]).default("minimax"),
  /** Token de MiniMax para el bot. DISTINTO de AI_API_KEY (los resúmenes). */
  botMinimaxApiKey: z.string().optional(),
  botMinimaxBaseUrl: z.string().url().default("https://api.minimax.io/v1"),
  botMinimaxModel: z.string().min(1).default("MiniMax-M3"),
  /**
   * Repasos que el bot hace a su propia respuesta antes de entregarla. Cada
   * uno es una llamada más al modelo, así que multiplica coste y espera; con
   * 0 se contesta a la primera. Mejoran pero no bloquean: si no caben en el
   * plazo, sale el borrador.
   */
  botReviewPasses: z.coerce.number().int().min(0).max(3).default(2),
  botDailyTokens: z.coerce.number().int().min(20_000).max(2_000_000).default(200_000),
  // Segunda pasada: la IA revisa su propio resumen contra el texto oficial.
  // Duplica el coste (céntimos) y corrige idioma, fidelidad y precisión.
  aiReview: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  /**
   * Impacto mínimo (1-5) para publicar en los canales. Por debajo, la
   * disposición se ingiere y aparece en la web, pero no se notifica: los
   * trámites internos no merecen un aviso en el móvil de nadie.
   * Poner 1 equivale a notificarlo todo.
   */
  notifyMinImpact: z.coerce.number().int().min(1).max(5).default(3),
  // Cada mañana a las 08:30 Europe/Madrid, los 7 días de la semana.
  // Si un domingo el BOE no publica, la ingesta es no-op (sin sumario).
  cronSchedule: z.string().min(1).default("30 8 * * *"),
  /**
   * Reintentos del día, separados por comas. El sumario no siempre está
   * publicado a las 08:30, y la IA o un canal pueden estar caídos justo
   * entonces. Cada reintento reejecuta la ingesta (idempotente) y reanuda lo
   * que quedó a medias. Poner cadena vacía los desactiva.
   */
  cronRetrySchedules: z
    .string()
    .default("0 10 * * *,0 12 * * *")
    .transform((value) =>
      value
        .split(",")
        .map((expression) => expression.trim())
        .filter((expression) => expression.length > 0),
    ),
  /**
   * Días naturales anteriores al de hoy que cada pasada del cron reintenta
   * "por si acaso". Cubre el boletín de ayer publicado tras el último
   * reintento, o un día entero caído. 1 es el valor sensato: la ingesta es
   * idempotente, así que si ayer ya está bien solo cuesta una petición al
   * BOE. 0 desactiva el lookback. No uses valores altos: un atasco de
   * semanas en el canal público es otra operación (la CLI).
   */
  cronLookbackDays: z.coerce.number().int().min(0).max(7).default(1),
  timeZone: z.string().min(1).default("Europe/Madrid"),
  apiPort: z.coerce.number().int().positive().default(3001),
  publicWebUrl: z.string().url().default("http://localhost:3000"),
  boeSections: z.string().default("1"),
  telegramBotToken: z.string().optional(),
  /** Canal público de resúmenes del BOE (@canal o id). Nunca para alertas. */
  telegramChannel: z.string().optional(),
  /**
   * Chat privado (tu user id numérico) para alertas de operación:
   * fallos de ingesta, parser, etc. El bot te escribe solo a ti.
   * No uses aquí el @ del canal público.
   */
  telegramAlertChatId: z.string().optional(),
  discordWebhookUrl: z.string().optional(),
  /**
   * Contraseña de la "Búsqueda completa" de la web. Sin ella el endpoint
   * de búsqueda del archivo entero responde 401: la portada sigue
   * limitada a los 15 últimos boletines.
   */
  fullSearchPassword: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return configSchema.parse({
    databaseUrl: env["DATABASE_URL"],
    aiBaseUrl: env["AI_BASE_URL"],
    aiModel: env["AI_MODEL"],
    aiApiKey: env["AI_API_KEY"],
    botOpenaiApiKey: env["BOT_OPENAI_API_KEY"] || undefined,
    botModel: env["BOT_MODEL"],
    botMinimaxApiKey: env["BOT_MINIMAX_API_KEY"] || undefined,
    botMinimaxBaseUrl: env["BOT_MINIMAX_BASE_URL"],
    botMinimaxModel: env["BOT_MINIMAX_MODEL"],
    botReviewPasses: env["BOT_REVIEW_PASSES"],
    botDailyTokens: env["BOT_DAILY_TOKENS"],
    aiReview: env["AI_REVIEW"],
    notifyMinImpact: env["NOTIFY_MIN_IMPACT"],
    cronSchedule: env["CRON_SCHEDULE"],
    cronRetrySchedules: env["CRON_RETRY_SCHEDULES"],
    cronLookbackDays: env["CRON_LOOKBACK_DAYS"],
    timeZone: env["TZ"],
    apiPort: env["API_PORT"],
    publicWebUrl: env["PUBLIC_WEB_URL"],
    boeSections: env["BOE_SECTIONS"],
    telegramBotToken: env["TELEGRAM_BOT_TOKEN"] || undefined,
    telegramChannel: env["TELEGRAM_CHANNEL"] || undefined,
    telegramAlertChatId: env["TELEGRAM_ALERT_CHAT_ID"] || undefined,
    discordWebhookUrl: env["DISCORD_WEBHOOK_URL"] || undefined,
    fullSearchPassword: env["FULL_SEARCH_PASSWORD"] || undefined,
  });
}
