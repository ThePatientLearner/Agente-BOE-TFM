import { z } from 'zod';
import { setTimeout as wait } from 'node:timers/promises';
import { AssistantError, type AssistantModel, type ModelAnswer } from '../domain/assistant.js';
import { INSTRUCTIONS } from './openai-assistant.js';

/**
 * Adapter de MiniMax para el bot público. Comparte las INSTRUCTIONS con el
 * adapter de GPT a propósito: el bot tiene que contestar lo mismo y con las
 * mismas reglas legales sea quien sea el que responda, o cambiar de modelo
 * dejaría de ser una decisión reversible.
 *
 * ──────────────────────────────────────────────────────────────────────
 *  EL TOKEN VA EN .env, EN `BOT_MINIMAX_API_KEY`. NO SE ESCRIBE AQUÍ.
 *
 *    BOT_MINIMAX_API_KEY=tu-token-de-minimax
 *    BOT_MODEL=minimax          # para que el bot lo use por defecto
 *
 *  Sin la clave, este adapter queda `enabled = false` y simplemente no
 *  aparece en el selector del administrador: nada se rompe.
 * ──────────────────────────────────────────────────────────────────────
 *
 * Es una clave DISTINTA de `AI_API_KEY`, que es la de los resúmenes del BOE.
 * Separadas para que una fuga o un agotamiento de cuota del bot público no
 * tumbe la ingesta diaria, que es el servicio que de verdad no puede fallar.
 *
 * La API es la misma que usa `http-summarizer` (`/text/chatcompletion_v2`),
 * ya probada en producción contra MiniMax.
 */

/**
 * Generoso a propósito: los MiniMax razonan antes de escribir y gastan tokens
 * pensando. Con un tope bajo llega la respuesta vacía y solo el razonamiento
 * —el mismo fallo que ya documenta el resumidor del BOE.
 */
const MAX_OUTPUT_TOKENS = 4_000;

/**
 * Plazo total, incluidos reintentos y lectura del cuerpo. Un límite por
 * intento permitía tres esperas de 40 s y desbordaba el proxy web de 55 s.
 */
const REQUEST_TIMEOUT_MS = 40_000;

/**
 * MiniMax devuelve 529 `overloaded_error` con bastante frecuencia —medido
 * contra la API real: 2 de 3 llamadas seguidas— y su propio mensaje pide
 * reintentar. Falla rápido (~1,5 s) frente a los 8-12 s que tarda cuando
 * responde, así que reintentar sale baratísimo en tiempo.
 *
 * Sin esto el bot era inservible: con los repasos activados hay tres llamadas
 * seguidas, y basta con que falle la primera para dejar al cliente sin nada.
 */
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504, 529]);

/** Esperas entre intentos. Dos reintentos: el tercero ya no es un bache. */
const RETRY_WAITS_MS = [800, 2_000];

const responseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable().optional() }) })).min(1),
  usage: z.object({ total_tokens: z.number().int().nonnegative() }).optional(),
});

export interface MinimaxAssistantOptions {
  readonly apiKey: string | undefined;
  readonly baseUrl: string;
  readonly model: string;
}

export class MinimaxAssistant implements AssistantModel {
  readonly id = 'minimax';
  readonly label: string;
  /** Más que GPT: razona antes de escribir, así que consume más de salida. */
  readonly reserveTokens = 8000;
  readonly enabled: boolean;

  constructor(private readonly options: MinimaxAssistantOptions) {
    this.enabled = Boolean(options.apiKey);
    this.label = `MiniMax · ${options.model}`;
  }

  async answer(input: string, instructions = INSTRUCTIONS, signal?: AbortSignal): Promise<ModelAnswer> {
    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const body = JSON.stringify({
      model: this.options.model,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: input },
      ],
    });

    let response: Response | null = null;
    let detail = 'sin respuesta del proveedor';
    let usageUncertain = false;

    for (let attempt = 0; attempt <= RETRY_WAITS_MS.length; attempt++) {
      if (requestSignal.aborted) { detail = 'plazo de la consulta agotado'; break; }
      try {
        if (attempt > 0) await wait(RETRY_WAITS_MS[attempt - 1]!, undefined, { signal: requestSignal });
        response = await fetch(`${this.options.baseUrl}/text/chatcompletion_v2`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.options.apiKey}`, 'Content-Type': 'application/json' },
          signal: requestSignal,
          body,
        });
      } catch (error) {
        // Un timeout o un corte de red: se reintenta igual que un 529.
        response = null;
        detail = `red: ${error instanceof Error ? error.name : 'desconocido'}`;
        // El proveedor pudo procesar la petición antes del corte de red. Un
        // reintento exitoso no revela los tokens que gastó el intento anterior.
        usageUncertain = true;
        if (requestSignal.aborted) break;
        continue;
      }
      if (response.ok) break;
      // El cuerpo del error trae el motivo (y el request_id de MiniMax), que
      // es lo único que permite abrir un ticket con ellos.
      detail = `HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`;
      if (!RETRYABLE_STATUS.has(response.status)) break;
      response = null;
    }

    // Al cliente no se le distingue el motivo: una clave caducada y un clúster
    // saturado se resuelven distinto, pero ninguno es asunto suyo y el detalle
    // solo ayudaría a sondear. Va al log del servidor por `detail`.
    if (!response?.ok) throw new AssistantError(503, 'El asistente no ha podido responder. Inténtalo más tarde.', detail);

    const parsed = responseSchema.safeParse(await response.json());
    const text = parsed.success ? (parsed.data.choices[0]?.message.content ?? '').trim() : '';
    if (!text) throw new AssistantError(503, 'No se ha podido completar la respuesta dentro del límite de la consulta. Prueba con una pregunta más concreta.');

    // Si MiniMax no devuelve `usage`, se estima POR ENCIMA (un token por cada
    // dos caracteres). Quedarse corto gastaría presupuesto que nadie ha
    // contado y dejaría la cuota diaria mintiendo.
    const tokens = parsed.success && parsed.data.usage
      ? parsed.data.usage.total_tokens
      : Math.ceil((input.length + text.length) / 2);

    return { text: text.slice(0, 6000), tokens, ...(usageUncertain ? { usageUncertain: true } : {}) };
  }
}
