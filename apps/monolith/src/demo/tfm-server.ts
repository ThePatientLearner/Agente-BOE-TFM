import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import pino from 'pino';
import { buildServer } from '../api/server.js';
import { AskBoe, electricidadCourse, type AssistantModel } from '../modules/assistant/index.js';
import type { CatalogEntryView, CatalogReadModel, CatalogSearchParams } from '../modules/catalog/index.js';
import { AccountError, type Account, type Accounts } from '../modules/electricidad/index.js';
import { InMemoryPartidaRepository, RegistrarPartida } from '../modules/juego/index.js';
import type { SpendingReadModel } from '../modules/spending/index.js';
import { isoDate } from '../shared/domain/iso-date.js';
import { officialTextFixtures } from './official-text-fixtures.js';

// Credenciales públicas de una cuenta local desechable; nunca se crean en Postgres.
export const DEMO_USERNAME = 'alumno_demo';
export const DEMO_PASSWORD = 'AulaLocal!2026-TFM';
export const DEMO_SEARCH_PASSWORD = 'ArchivoLocal-TFM';
const student: Account = { id: '00000000-0000-4000-8000-000000000001', username: DEMO_USERNAME, role: 'student', status: 'active', studyAccess: true };

class DemoAccounts implements Accounts {
  private readonly sessions = new Map<string, number>();
  private unavailable(): never { throw new AccountError(403, 'Demo local: utiliza la cuenta alumno_demo. No hay registro ni administración.'); }
  async register(): Promise<void> { this.unavailable(); }
  async registerPublic(): Promise<void> { this.unavailable(); }
  async changePassword(): Promise<void> { this.unavailable(); }
  async users(): Promise<Account[]> { return this.unavailable(); }
  async setStatus(): Promise<void> { this.unavailable(); }
  async login(username: unknown, password: unknown) {
    const candidate = Buffer.from(typeof password === 'string' ? password : '');
    const expected = Buffer.from(DEMO_PASSWORD);
    if (username !== DEMO_USERNAME || candidate.length !== expected.length || !timingSafeEqual(candidate, expected)) {
      throw new AccountError(401, 'Usuario o contraseña incorrectos.');
    }
    const token = randomBytes(32).toString('hex');
    this.sessions.set(token, Date.now() + 7 * 24 * 60 * 60 * 1000);
    return { token, user: { ...student } };
  }
  async me(token: string): Promise<Account> {
    if ((this.sessions.get(token) ?? 0) <= Date.now()) {
      this.sessions.delete(token);
      throw new AccountError(401, 'Inicia sesión en la demo local.');
    }
    return { ...student };
  }
  async logout(token: string): Promise<void> { this.sessions.delete(token); }
}

const parsedDate = isoDate('2015-10-02');
if (!parsedDate.ok) throw parsedDate.error;
const publicationDate = parsedDate.value;

// Fuente: fichas originales del BOE verificadas al preparar la demo. No son
// textos consolidados actuales. Todo contenido derivado es un ejemplo fijo.
const entries: CatalogEntryView[] = [
  { id: 'BOE-A-2015-10565', title: 'Ley 39/2015, de 1 de octubre, del Procedimiento Administrativo Común de las Administraciones Públicas.', plainTitle: '[DEMO TFM] Procedimiento administrativo común' },
  { id: 'BOE-A-2015-10566', title: 'Ley 40/2015, de 1 de octubre, de Régimen Jurídico del Sector Público.', plainTitle: '[DEMO TFM] Régimen jurídico del sector público' },
].map(entry => ({
  ...entry, publicationDate, department: 'Jefatura del Estado',
  officialHtmlUrl: `https://www.boe.es/buscar/doc.php?id=${entry.id}`,
  officialPdfUrl: `https://www.boe.es/boe/dias/2015/10/02/pdfs/${entry.id}.pdf`,
  shortPhrase: 'Ejemplo fijo de demostración: publicación original de 2015, sin comprobación de vigencia.',
  bulletPoints: ['Contenido de ejemplo preparado para comprobar el recorrido de la aplicación.', 'El enlace superior abre la fuente oficial real; este texto no es un resumen jurídico de la norma.', 'La demo no consulta un proveedor de IA y no determina la vigencia actual.'],
  impact: 3, model: 'Demo TFM · contenido simulado', lastOfficialUpdateAt: publicationDate,
  gobierno: { codigo: 'ES', nombre: 'Dato omitido en la demo', ambito: 'estatal', etiqueta: 'No se representa un gobierno real', partidos: [], presidente: 'No incluido', desde: 'No incluido', verificadoEl: '2015-10-02' },
}));

const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
function select(params: CatalogSearchParams) {
  const terms = normalize(params.query ?? '').split(/\s+/).filter(term => term.length > 2);
  return entries.filter(entry => (!params.from || entry.publicationDate >= params.from)
    && (!params.to || entry.publicationDate <= params.to)
    && (entry.impact ?? 0) >= (params.minImpact ?? 1)
    && (!terms.length || terms.some(term => normalize(`${entry.id} ${entry.title}`).includes(term))))
    .slice(0, params.limit ?? 300);
}
const days = (selected: CatalogEntryView[]) => selected.length ? [{ date: publicationDate, entries: selected }] : [];
const catalog: CatalogReadModel = {
  retrieve: async params => select({ ...params, limit: 6 }),
  listDays: async limit => limit > 0 ? days(entries) : [],
  getDay: async date => date === publicationDate ? days(entries)[0]! : null,
  getEntry: async id => entries.find(entry => entry.id === id) ?? null,
  listReferences: async () => entries.map(({ id, lastOfficialUpdateAt }) => ({ id, lastOfficialUpdateAt })),
  search: async params => days(select(params)),
};
const spending: SpendingReadModel = {
  cobertura: async () => null, periodos: async () => [], resumenDirectas: async () => [],
  listarDirectas: async () => [], listarMayoresPublicas: async () => [], listarMayoresPrivadas: async () => [],
  reparto: async (desde, hasta) => ({ desde, hasta, directas: { convocatorias: 0, importe: '0' }, competitivas: { convocatorias: 0, importe: '0' }, sinClasificar: { convocatorias: 0, importe: '0' } }),
  repartoDirectasPorSector: async (desde, hasta) => ({ desde, hasta, publico: { sector: 'publico', concesiones: 0, importe: '0' }, privado: { sector: 'privado', concesiones: 0, importe: '0' }, desconocido: { sector: 'desconocido', concesiones: 0, importe: '0' }, sinDatos: true }),
};
const model: AssistantModel = {
  id: 'tfm-simulado', label: 'Demo TFM · proveedor simulado', enabled: true, reserveTokens: 0,
  async answer(input) {
    const context = JSON.parse(input) as { mode?: string; selectedTopic?: { title: string }; documents?: { title: string; officialExcerpts?: string }[] };
    if (context.mode === 'entry-document') {
      const excerpt = context.documents?.[0]?.officialExcerpts;
      return { text: `DEMO TFM — respuesta simulada, sin llamada a IA. El recorrido de la ficha utiliza únicamente un fragmento local del artículo 1 de la publicación original de 2015 [1], no la ley completa. No interpreta la norma ni comprueba su vigencia.\n\n${excerpt ?? 'Fragmento no disponible.'}`, tokens: 0 };
    }
    const text = context.selectedTopic
      ? `DEMO TFM — respuesta simulada, sin llamada a IA. El servidor ha seleccionado el apartado «${context.selectedTopic.title}» y su material del curso [1]. Esta respuesta fija permite comprobar el tutor y sus fuentes; no resuelve la pregunta. Lee los apuntes citados para estudiar.`
      : 'DEMO TFM — respuesta simulada, sin llamada a IA. El catálogo ha aportado una disposición de ejemplo [1]. El enlace permite consultar su publicación oficial original de 2015. Esta respuesta fija demuestra el recorrido pregunta → contexto → fuentes; no interpreta la norma ni comprueba su vigencia.';
    return { text, tokens: 0 };
  },
};

/** Composición separada: no importa main, config, migraciones ni scheduler. */
export function buildTfmDemoServer() {
  const logger = pino({ level: 'silent' });
  const game = new InMemoryPartidaRepository();
  const assistant = new AskBoe(catalog, { read: async id => officialTextFixtures[id] ?? null }, [model], model.id,
    { reserve: async () => randomUUID(), settle: async () => {} },
    { model: async () => model.id, setModel: async () => {} }, electricidadCourse);
  const server = buildServer(catalog, spending, game, new RegistrarPartida(game, logger, 5, 0), logger, {
    accounts: new DemoAccounts(), assistant, fullSearchPassword: DEMO_SEARCH_PASSWORD,
    readReviewStatus: () => ({ reviewing: false, nextReviewAt: null, serverTime: new Date().toISOString(), timeZone: 'Europe/Madrid' }),
  });
  server.get('/api/tfm-demo', async () => ({ demo: true, storage: 'memory', provider: 'simulated', externalCalls: false }));
  return server;
}
