import { z } from 'zod';
import { setTimeout as wait } from 'node:timers/promises';
import { AssistantError, type AssistantModel, type ModelAnswer } from '../domain/assistant.js';
import { INSTRUCTIONS } from './openai-assistant.js';
import { ELECTRICIDAD_REVIEW_INSTRUCTIONS, ELECTRICIDAD_TUTOR_INSTRUCTIONS } from '../domain/study-course.js';

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
 * Usa Chat Completions para controlar explícitamente el razonamiento de M3.
 * El resumidor mantiene su adapter independiente y su configuración.
 */

/** Otros modelos de MiniMax no permiten desactivar el razonamiento. */
const MAX_OUTPUT_TOKENS = 4_000;
const DIRECT_OUTPUT_TOKENS = 1_600;

const MINIMAX_INSTRUCTIONS = `${INSTRUCTIONS}
Para que la explicación sea clara:
- Empieza contestando la pregunta en una frase breve y concreta. No empieces enumerando los nombres completos de leyes anteriores.
- Si preguntan qué cambia o qué se aprueba, explica el objetivo y a quién afecta en una frase; después, elige como máximo tres cambios relevantes apoyados por las fuentes. Resume los nombres largos de leyes con palabras habituales.
- Usa palabras habituales y frases cortas. Aclara un término jurídico en pocas palabras si es necesario. No describas el preámbulo, la estructura ni el número de artículos salvo que lo pidan.
- Da normalmente entre 60 y 120 palabras, nunca más de 160. Si basta una frase, no la alargues. No repitas la pregunta ni los avisos generales que ya muestra la interfaz.
- Si falta el dato concreto, contesta en una o dos frases: indica qué dato no aparece y qué documento concreto permitiría comprobarlo. No menciones otros plazos ni asuntos para rellenar. No deduzcas requisitos, cuantías o plazos de una ayuda a partir de una reforma general.
- Conserva las referencias [1], [2] junto a los hechos que explicas. Entrega solo la respuesta final, sin razonamiento interno ni comentarios sobre cómo vas a responder.`;

const STYLE_EXAMPLES = `Ejemplos de formato, no datos sobre los documentos:
Pregunta: «¿Qué se aprueba?» → «Se amplían los derechos de [colectivo] [1]. Los cambios principales son: [hasta tres puntos breves con sus referencias].» No añadas una cuarta lista ni una conclusión que repita los puntos.
Pregunta: «¿A quién afecta?» → «A [colectivos que indica el documento] [1].» Añade obligaciones solo si ayudan a contestar esa pregunta.
Pregunta sobre el plazo de solicitud, cuando no consta una convocatoria concreta → «En los fragmentos disponibles no aparece un plazo de solicitud para esa ayuda. Necesito la convocatoria concreta para comprobarlo.» No menciones plazos de desarrollo de la ley ni asegures que el documento completo carece de ese dato.`;

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
  model: z.string().optional(),
  choices: z.array(z.object({
    finish_reason: z.string().nullable().optional(),
    message: z.object({ content: z.string().nullable().optional() }),
  })).min(1),
  usage: z.object({ total_tokens: z.number().int().nonnegative() }).optional(),
  base_resp: z.object({ status_code: z.number().int() }).optional(),
});

export interface MinimaxAssistantOptions {
  readonly apiKey: string | undefined;
  readonly baseUrl: string;
  readonly model: string;
  /** Diagnóstico sin preguntas, contexto, credenciales ni razonamiento. */
  readonly onResponse?: (metadata: {
    requestedModel: string; returnedModel: string | null;
    thinking: 'disabled' | 'adaptive'; tokens: number; durationMs: number;
  }) => void;
}

export class MinimaxAssistant implements AssistantModel {
  readonly id = 'minimax';
  readonly label: string;
  /** Reserva conservadora, también válida para modelos con razonamiento. */
  readonly reserveTokens = 8000;
  readonly enabled: boolean;

  constructor(private readonly options: MinimaxAssistantOptions) {
    this.enabled = Boolean(options.apiKey);
    this.label = `MiniMax · ${options.model}`;
  }

  async answer(input: string, instructions = MINIMAX_INSTRUCTIONS, signal?: AbortSignal): Promise<ModelAnswer> {
    const started = Date.now();
    // El tutor y su repaso tienen reglas didácticas propias. En el bot público
    // los repasos siguen conservando las restricciones del archivo del BOE.
    const study = instructions === ELECTRICIDAD_TUTOR_INSTRUCTIONS || instructions === ELECTRICIDAD_REVIEW_INSTRUCTIONS;
    const system = study ? instructions : `${instructions === MINIMAX_INSTRUCTIONS ? instructions : `${MINIMAX_INSTRUCTIONS}\n${instructions}`}\n${STYLE_EXAMPLES}`;
    // M3.1 y M2.x tienen otro contrato: no enviarles un parámetro que ignoran
    // o rechazan. Nunca cambiar de modelo silenciosamente.
    const direct = this.options.model.toLowerCase() === 'minimax-m3';
    const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
    const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    const body = JSON.stringify({
      model: this.options.model,
      max_completion_tokens: direct ? DIRECT_OUTPUT_TOKENS : MAX_OUTPUT_TOKENS,
      thinking: { type: direct ? 'disabled' : 'adaptive' },
      reasoning_split: true,
      temperature: 0.3,
      messages: [
        { role: 'system', content: system },
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
        response = await fetch(`${this.options.baseUrl}/chat/completions`, {
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
    if (parsed.success && parsed.data.base_resp && parsed.data.base_resp.status_code !== 0) {
      throw new AssistantError(503, 'El asistente no ha podido responder. Inténtalo más tarde.', `MiniMax status ${parsed.data.base_resp.status_code}`);
    }
    if (parsed.success && parsed.data.model && parsed.data.model.toLowerCase() !== this.options.model.toLowerCase()) {
      throw new AssistantError(503, 'El asistente no ha podido responder. Inténtalo más tarde.', 'MiniMax devolvió un modelo distinto del solicitado');
    }
    if (parsed.success && parsed.data.choices[0]?.finish_reason === 'length') {
      throw new AssistantError(503, 'No se ha podido completar la respuesta dentro del límite de la consulta. Prueba con una pregunta más concreta.');
    }
    const content = parsed.success ? (parsed.data.choices[0]?.message.content ?? '') : '';
    // Protección adicional si el proveedor mezcla el razonamiento en content:
    // nunca se presenta como respuesta ni vuelve al historial del ciudadano.
    const text = content.replace(/<(think|thinking)>[\s\S]*?<\/\1>/gi, '')
      .replace(/<(think|thinking)>[\s\S]*$/gi, '')
      .split(/<\/(?:think|thinking)>/i).at(-1)!.trim();
    if (!text) throw new AssistantError(503, 'No se ha podido completar la respuesta dentro del límite de la consulta. Prueba con una pregunta más concreta.');

    // Sin usage no puede conocerse el coste (incluido el razonamiento de otros
    // modelos). Se conserva la reserva; la estimación solo sirve al diagnóstico.
    const tokens = parsed.success && parsed.data.usage
      ? parsed.data.usage.total_tokens
      : Math.ceil((system.length + input.length + content.length) / 2);
    usageUncertain ||= !parsed.success || !parsed.data.usage;
    this.options.onResponse?.({
      requestedModel: this.options.model, returnedModel: parsed.success ? parsed.data.model ?? null : null,
      thinking: direct ? 'disabled' : 'adaptive', tokens, durationMs: Date.now() - started,
    });

    return { text: text.slice(0, 6000), tokens, ...(usageUncertain ? { usageUncertain: true } : {}) };
  }
}
