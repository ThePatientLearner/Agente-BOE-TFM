import { searchTerms, type CatalogReadModel } from '../../catalog/index.js';
import { daysBefore, isoDate, todayIn } from '../../../shared/domain/iso-date.js';
import { AssistantError, type AssistantModel, type AssistantSettings, type ChatAnswer, type ChatRequest, type OfficialTextReader, type UsageBudget } from '../domain/assistant.js';
import { buildContext } from './context.js';

const DEROGACION = /\b(derog|vigen)/i;
const COMO_COMPROBAR_DEROGACION = 'Este servicio no puede comprobar si una norma sigue vigente o ha sido derogada: resume lo que se publicó, no su situación actual. Para saberlo, abre su ficha oficial en el BOE y mira el apartado «Análisis», dentro de «Referencias posteriores»: ahí constan las normas que la derogan o la modifican. Si me preguntas desde la ficha de una disposición, te digo además lo que su propio texto establece sobre su entrada en vigor y su duración.';

export class AskBoe {
  private readonly active = new Set<string>();
  constructor(
    private readonly catalog: CatalogReadModel,
    private readonly texts: OfficialTextReader,
    /**
     * Los bots configurados. Si el elegido se queda sin clave, responde el
     * primero que la tenga: una variable mal puesta degrada, no apaga.
     */
    private readonly models: readonly AssistantModel[],
    /** El de partida (BOT_MODEL) mientras el administrador no haya elegido. */
    private readonly defaultModelId: string,
    private readonly budget: UsageBudget,
    /** Lo que eligió el administrador. Manda sobre BOT_MODEL y vale para todos. */
    private readonly settings: AssistantSettings,
  ) {}

  /** Lo que el selector del administrador necesita saber. Sin claves ni URLs. */
  async available(): Promise<Array<{ id: string; label: string; enabled: boolean; selected: boolean }>> {
    const current = (await this.resolve())?.id;
    return this.models.map(m => ({ id: m.id, label: m.label, enabled: m.enabled, selected: m.id === current }));
  }

  /**
   * Cambia la IA de TODA la aplicación. El privilegio lo comprueba la capa
   * HTTP contra la sesión, y se vuelve a exigir aquí: un caso de uso no puede
   * depender de que quien lo llama se haya acordado.
   */
  async select(modelId: string, isAdmin: boolean, by: string): Promise<void> {
    if (!isAdmin) throw new AssistantError(403, 'Solo el administrador puede cambiar la IA.');
    if (!this.models.some(m => m.id === modelId && m.enabled)) throw new AssistantError(400, 'Ese bot no está configurado o no tiene clave.');
    await this.settings.setModel(modelId, by);
  }

  private async resolve(): Promise<AssistantModel | undefined> {
    const chosen = (await this.settings.model()) ?? this.defaultModelId;
    return this.models.find(m => m.id === chosen && m.enabled) ?? this.models.find(m => m.enabled);
  }

  async execute(userId: string, request: ChatRequest, isAdmin = false): Promise<ChatAnswer> {
    const model = await this.resolve();
    if (!model?.enabled) throw new AssistantError(503, 'El asistente está en preparación. Vuelve a intentarlo más tarde.');
    if (this.active.has(userId) || this.active.size >= 3) throw new AssistantError(429, 'Hay una consulta en curso. Espera unos instantes.');
    this.active.add(userId);
    try {
      let entries;
      if (request.entryId) {
        const entry = await this.catalog.getEntry(request.entryId);
        if (!entry) throw new AssistantError(404, 'No encuentro esta disposición en nuestro archivo.');
        entries = [entry];
      } else {
        const explicitId = request.question.match(/\bBOE-[A-Z]-\d{4}-\d{1,6}\b/i)?.[0]?.toUpperCase();
        if (explicitId) {
          const entry = await this.catalog.getEntry(explicitId);
          entries = entry ? [entry] : [];
        } else {
          const today = todayIn('Europe/Madrid');
          const date = request.question.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
          const parsed = date ? isoDate(date) : null;
          const exactDate = parsed?.ok ? parsed.value : /\bhoy\b/i.test(request.question) ? today : /\bayer\b/i.test(request.question) ? daysBefore(today, 1) : undefined;
          const previous = request.history.filter(t => t.role === 'user').at(-1)?.content ?? '';
          // Un tema nuevo y corto ("vivienda") no debe arrastrar el anterior.
          const continuation = /\b(?:esto|eso|esa|ese|estas|estos|esas|esos|sus)\b|^(?:¿\s*)?(?:y\b|a qui[eé]n\b|qu[eé] (?:cambia|plazos|requisitos|excepciones|implica)\b|c[oó]mo (?:me afecta|solicito|se aplica)\b)/i.test(request.question);
          const followUp = request.history.length > 0 && !exactDate && (continuation || searchTerms(request.question).length === 0);
          entries = await this.catalog.retrieve({ query: followUp ? `${request.question} ${previous}` : request.question, ...(exactDate ? { from: exactDate, to: exactDate } : {}) });
        }
      }
      if (!entries.length) {
        // Una respuesta sin resultados también es una consulta; no gasta IA.
        await this.budget.reserve(userId, 0, isAdmin);
        // «¿Cómo sé si está derogada?» es una pregunta del panel y no busca
        // nada concreto: sin esto caería en el «no he encontrado» genérico,
        // que no la responde. La respuesta es siempre la misma y exacta.
        if (DEROGACION.test(request.question)) return { answer: COMO_COMPROBAR_DEROGACION, sources: [] };
        return { answer: 'No he encontrado disposiciones que respondan a esa consulta en nuestro archivo. Prueba con un tema más concreto, una fecha (AAAA-MM-DD) o el identificador BOE. Esto no significa que no exista una norma sobre ese tema.', sources: [] };
      }
      const input = await buildContext(entries, request, this.texts);
      if (Buffer.byteLength(input) > (request.entryId ? 64_000 : 32_000)) throw new AssistantError(400, 'La consulta es demasiado amplia. Acorta la pregunta.');
      // Un byte por token es una cota conservadora. La reserva incluye las
      // instrucciones y el máximo de salida Y razonamiento que declara el
      // modelo elegido, que con los repasos activados cuenta las tres pasadas.
      const reserved = Buffer.byteLength(input) + model.reserveTokens;
      const reservation = await this.budget.reserve(userId, reserved, isAdmin);
      // Ante timeout o resultado desconocido se mantiene la reserva: el
      // proveedor pudo facturar aunque nuestra conexión no recibiera respuesta.
      const result = await model.answer(input);
      // Un repaso cancelado puede haber sido facturado aunque entreguemos el
      // borrador. Igual que al fallar la redacción, no devolvemos tokens inciertos.
      if (!result.usageUncertain) await this.budget.settle(reservation, reserved, result.tokens);
      return {
        answer: result.text,
        sources: entries.map(e => ({ id: e.id, title: e.plainTitle ?? e.title, officialUrl: e.officialHtmlUrl, summaryUrl: `/d/${e.id}`, publicationDate: e.publicationDate, lastOfficialUpdateAt: e.lastOfficialUpdateAt })),
        ...(request.entryId ? { contextEntryId: request.entryId } : {}),
        // SOLO al administrador: es él quien elige la IA y quien necesita saber
        // cuál ha contestado. A un cliente no se le manda ni el campo, para que
        // no aparezca aunque inspeccione la respuesta. Va el nombre legible.
        ...(isAdmin ? { model: model.label } : {}),
      };
    } finally { this.active.delete(userId); }
  }
}
