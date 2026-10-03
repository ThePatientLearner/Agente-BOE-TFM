export class AssistantError extends Error {
  /**
   * `message` se le ENSEÑA al cliente; `detail` solo va al log del servidor.
   * Existe porque sin él un 529 del proveedor y una clave caducada son el
   * mismo "inténtalo más tarde" y no hay forma de distinguirlos en producción.
   */
  constructor(readonly status: number, message: string, readonly detail?: string) { super(message); }
}
export interface ChatTurn { role: 'user' | 'assistant'; content: string }
export interface ChatRequest { question: string; entryId?: string; history: ChatTurn[] }
export interface Source {
  id: string; title: string; officialUrl: string; summaryUrl: string;
  publicationDate: string; lastOfficialUpdateAt: string;
}
export interface ChatAnswer { answer: string; sources: Source[]; contextEntryId?: string; model?: string }
export interface ModelAnswer {
  text: string;
  tokens: number;
  /** Una llamada cortada pudo facturarse: se conserva la reserva de cuota. */
  usageUncertain?: boolean;
}
export interface AssistantModel {
  /**
   * Identificador estable. Es lo que el administrador elige en el selector y
   * lo que viaja por la API, así que renombrarlo rompe las sesiones abiertas.
   */
  readonly id: string;
  /** Nombre para el selector. Se puede cambiar sin romper nada. */
  readonly label: string;
  readonly enabled: boolean;
  /**
   * Tokens de salida que hay que reservar por consulta. Lo declara cada
   * adapter porque no es lo mismo un modelo que razona antes de escribir que
   * uno que responde directo, ni una pasada que tres.
   */
  readonly reserveTokens: number;
  /**
   * `instructions` permite reutilizar el mismo modelo para otra tarea —los
   * repasos, por ejemplo— sin montar un segundo adapter. Omitido, se usan las
   * instrucciones del asistente.
   */
  /** La señal cancela también la lectura de la respuesta y los reintentos. */
  answer(input: string, instructions?: string, signal?: AbortSignal): Promise<ModelAnswer>;
}
export interface UsageBudget {
  reserve(userId: string, tokens: number, isAdmin?: boolean): Promise<string>;
  settle(reservation: string, reserved: number, used: number): Promise<void>;
}
export interface OfficialTextReader { read(id: string): Promise<string | null> }
/**
 * Qué IA responde a TODOS. La elige el administrador desde el panel y se
 * guarda en la base: sobrevive a reinicios y vale para cualquier usuario.
 */
export interface AssistantSettings {
  model(): Promise<string | null>;
  setModel(id: string, by: string): Promise<void>;
}
