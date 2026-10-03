import { registerElectricidad } from "./electricidad.js";
import { registerAssistant } from "./assistant.js";
import type { AskBoe } from "../modules/assistant/index.js";
import type { Accounts } from "../modules/electricidad/index.js";
import { timingSafeEqual } from "node:crypto";
import Fastify from "fastify";
import { isoDate, type IsoDate } from "../shared/domain/iso-date.js";
import type { Logger } from "../shared/logger/logger.js";
import type { CatalogReadModel } from "../modules/catalog/index.js";
import type { SpendingReadModel } from "../modules/spending/index.js";
import type { JuegoReadModel, RegistrarPartida } from "../modules/juego/index.js";
import type { ReadReviewStatus } from "../shared/domain/review-status.js";

/** Cuántas convocatorias directas devuelve el panel como "las mayores". */
const MAYORES_POR_DEFECTO = 25;

/** Tope de filas de la búsqueda completa (el archivo puede crecer). */
const BUSQUEDA_LIMITE = 300;

/** Puestos del ranking del juego que devuelve la API. */
const RANKING_LIMITE = 5;

/**
 * Cuántas partidas puede registrar una misma IP en la ventana de abajo.
 *
 * Doce y no media docena: el juego termina invitando a volver a jugar en el
 * acto, y una partida mala dura medio minuto. Con seis, alguien que muere
 * rápido varias veces seguidas se quedaba fuera trece minutos sin haber
 * hecho nada raro. Doce sigue parando en seco un bucle, que haría cientos.
 */
const PARTIDAS_POR_IP = 12;
const VENTANA_MS = 15 * 60 * 1000;

export interface ServerOptions {
  accounts?: Accounts;
  assistant?: AskBoe;
  /**
   * Contraseña de la búsqueda sobre el archivo completo. Sin ella, los
   * endpoints `/api/search*` responden 401: la portada pública sigue en 15 días.
   */
  fullSearchPassword?: string;
  readReviewStatus?: ReadReviewStatus;
}

/**
 * API HTTP de solo lectura para el frontend. Consulta puertos de lectura
 * (`catalog` para el BOE, `spending` para las subvenciones) y nunca los
 * módulos que escriben.
 */
export function buildServer(
  catalog: CatalogReadModel,
  spending: SpendingReadModel,
  juego: JuegoReadModel,
  registrarPartida: RegistrarPartida,
  logger: Logger,
  options: ServerOptions = {},
) {
  const app = Fastify({ loggerInstance: logger });
  if (options.accounts) registerElectricidad(app, options.accounts);
  if (options.accounts && options.assistant) registerAssistant(app, options.accounts, options.assistant);
  const fullSearchPassword = options.fullSearchPassword?.trim() || undefined;
  const limitador = new LimitadorPorIp(PARTIDAS_POR_IP, VENTANA_MS);

  app.get("/health", async () => ({ status: "ok" }));

  app.get("/api/review-status", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    if (!options.readReviewStatus) return reply.status(503).send({ error: "Estado no disponible" });
    return options.readReviewStatus();
  });

  app.get("/api/days", async () => {
    return catalog.listDays(15);
  });

  // Archivo completo, sin el límite de 15 días de la portada: lo consume el
  // sitemap. Sin esto, las disposiciones antiguas no tienen ningún enlace
  // que las alcance y dejan de ser accesibles para los buscadores.
  app.get("/api/entries", async () => {
    return catalog.listReferences();
  });

  app.get<{ Params: { date: string } }>("/api/days/:date", async (request, reply) => {
    const date = isoDate(request.params.date);
    if (!date.ok) {
      return reply.status(400).send({ error: date.error.message });
    }
    const day = await catalog.getDay(date.value);
    if (!day) {
      return reply.status(404).send({ error: "Sin boletín para esa fecha" });
    }
    return day;
  });

  app.get<{ Params: { id: string } }>("/api/entries/:id", async (request, reply) => {
    const entry = await catalog.getEntry(request.params.id);
    if (!entry) {
      return reply.status(404).send({ error: "Disposición no encontrada" });
    }
    return entry;
  });

  /**
   * Comprueba la contraseña de la búsqueda completa sin devolver datos.
   * La web la usa al desbloquear el buscador para no filtrar a ciegas.
   */
  app.post<{ Body: { password?: string } }>("/api/search/unlock", async (request, reply) => {
    if (!fullSearchPassword) {
      return reply.status(503).send({ error: "Búsqueda completa no configurada" });
    }
    const offered = typeof request.body?.password === "string" ? request.body.password : "";
    if (!passwordsMatch(fullSearchPassword, offered)) {
      return reply.status(401).send({ error: "Contraseña incorrecta" });
    }
    return reply.status(204).send();
  });

  /**
   * Búsqueda sobre todo el catálogo. Protegida por la misma contraseña:
   * sin ella la portada solo filtra los 15 días que ya trajo al navegador.
   */
  app.get<{
    Querystring: { q?: string; from?: string; to?: string; minImpact?: string };
    Headers: { "x-full-search-password"?: string };
  }>("/api/search", async (request, reply) => {
    if (!fullSearchPassword) {
      return reply.status(503).send({ error: "Búsqueda completa no configurada" });
    }
    const offered = request.headers["x-full-search-password"] ?? "";
    if (!passwordsMatch(fullSearchPassword, offered)) {
      return reply.status(401).send({ error: "Contraseña incorrecta" });
    }

    let from: IsoDate | undefined;
    let to: IsoDate | undefined;
    if (request.query.from) {
      const parsed = isoDate(request.query.from);
      if (!parsed.ok) return reply.status(400).send({ error: parsed.error.message });
      from = parsed.value;
    }
    if (request.query.to) {
      const parsed = isoDate(request.query.to);
      if (!parsed.ok) return reply.status(400).send({ error: parsed.error.message });
      to = parsed.value;
    }
    if (from && to && from > to) {
      return reply.status(400).send({ error: "El inicio del periodo es posterior al final" });
    }

    let minImpact: number | undefined;
    if (request.query.minImpact !== undefined && request.query.minImpact !== "") {
      const n = Number(request.query.minImpact);
      if (!Number.isInteger(n) || n < 1 || n > 5) {
        return reply.status(400).send({ error: "minImpact debe ser un entero entre 1 y 5" });
      }
      minImpact = n;
    }

    return catalog.search({
      query: request.query.q?.trim() || undefined,
      from,
      to,
      minImpact,
      limit: BUSQUEDA_LIMITE,
    });
  });

  /**
   * Panel de subvenciones de concesión directa.
   *
   * Devuelve las cuatro piezas de una vez —cobertura, reparto, desglose por
   * administración y las mayores— en lugar de cuatro endpoints. La página es
   * un Server Component que las necesita todas juntas: partirlo en cuatro
   * multiplicaría por cuatro la latencia sin que nadie consuma las piezas por
   * separado.
   *
   * Sin `desde`/`hasta` responde con todo el periodo ingerido, que hoy son
   * unos días. Así la web nunca promete un histórico que no existe.
   */
  /**
   * Meses con datos. La web genera una página estática por cada uno, así que
   * esta lista es la que decide cuántas páginas existen y hay que consultarla
   * en el build, no en cada visita.
   */
  app.get("/api/subvenciones/periodos", async () => {
    return spending.periodos();
  });

  app.get<{ Querystring: { desde?: string; hasta?: string } }>(
    "/api/subvenciones",
    async (request, reply) => {
      const cobertura = await spending.cobertura();
      if (!cobertura) {
        return {
          cobertura: null,
          reparto: null,
          porAdministracion: [],
          mayores: [],
          mayoresPublicas: [],
          mayoresPrivadas: [],
          directasPorSector: null,
        };
      }

      const rango = resolverRango(request.query, cobertura.desde, cobertura.hasta);
      if (!rango.ok) {
        return reply.status(400).send({ error: rango.error });
      }
      const { desde, hasta } = rango;

      const [
        reparto,
        porAdministracion,
        mayores,
        mayoresPublicas,
        mayoresPrivadas,
        directasPorSector,
      ] = await Promise.all([
        spending.reparto(desde, hasta),
        spending.resumenDirectas(desde, hasta),
        spending.listarDirectas(desde, hasta, MAYORES_POR_DEFECTO),
        spending.listarMayoresPublicas(desde, hasta, MAYORES_POR_DEFECTO),
        spending.listarMayoresPrivadas(desde, hasta, MAYORES_POR_DEFECTO),
        spending.repartoDirectasPorSector(desde, hasta),
      ]);

      return {
        cobertura,
        reparto,
        porAdministracion,
        mayores,
        mayoresPublicas,
        mayoresPrivadas,
        directasPorSector,
      };
    },
  );

  // ── Juego ("¡Haz que todos se suscriban!") ───────────────────────
  // El único camino de escritura de esta API. Está aquí y no en un servicio
  // aparte porque la partida termina en el navegador del jugador y no hay
  // ningún otro sitio desde el que pueda entrar.

  /** Contador de la portada y top público. Lo pide el juego al arrancar. */
  app.get("/api/juego/marcador", async () => {
    const [ranking, partidasJugadas] = await Promise.all([
      juego.ranking(RANKING_LIMITE),
      juego.partidasJugadas(),
    ]);
    return { ranking, partidasJugadas };
  });

  /**
   * Registra una partida terminada y devuelve el código de un solo uso.
   *
   * El marcador llega del navegador y es, por tanto, falsificable: el juego
   * corre entero en el cliente. `validarPartida` descarta lo imposible y el
   * limitador corta los bucles, pero al ganador del premio hay que
   * verificarlo a mano. El código es el hilo del que tirar.
   */
  app.post<{
    Body: {
      seudonimo?: unknown;
      puntos?: unknown;
      nivel?: unknown;
      segundos?: unknown;
      mejorCombo?: unknown;
    };
  }>("/api/juego/partidas", async (request, reply) => {
    if (!limitador.admite(clienteDe(request.headers["x-forwarded-for"], request.ip))) {
      return reply.status(429).send({ error: "Demasiadas partidas seguidas; prueba en un rato" });
    }

    const body = request.body ?? {};
    const entero = (valor: unknown): number =>
      typeof valor === "number" && Number.isFinite(valor) ? Math.floor(valor) : Number.NaN;

    const resultado = await registrarPartida.ejecutar({
      seudonimo: typeof body.seudonimo === "string" ? body.seudonimo : null,
      puntos: entero(body.puntos),
      nivel: entero(body.nivel),
      segundos: entero(body.segundos),
      mejorCombo: entero(body.mejorCombo),
    });

    if (!resultado.ok) {
      return reply.status(400).send({ error: resultado.error.message });
    }
    return resultado.value;
  });

  return app;
}

/**
 * De quién viene la petición, a efectos del límite por IP.
 *
 * La web de Vercel hace de proxy, así que `request.ip` sería siempre la
 * misma dirección —la de ese proceso— y el límite caería sobre todos los
 * jugadores a la vez. La primera entrada de `x-forwarded-for` es la del
 * visitante.
 *
 * La cabecera es falsificable por quien llame a la API directamente, y no se
 * intenta impedirlo: esto limita el ritmo de un bucle descuidado, no defiende
 * nada. Lo que protege el premio es verificar al ganador a mano.
 */
function clienteDe(reenviada: string | string[] | undefined, pordefecto: string): string {
  const cabecera = Array.isArray(reenviada) ? reenviada[0] : reenviada;
  const primera = cabecera?.split(",")[0]?.trim();
  return primera && primera.length > 0 ? primera : pordefecto;
}

/**
 * Límite de partidas por IP en una ventana deslizante, en memoria.
 *
 * En memoria a propósito: hay un solo proceso de API y perder el recuento en
 * un reinicio no tiene consecuencias. Lo que evita es que alguien deje un
 * bucle mandando partidas y llene el ranking, no que un humano juegue mucho.
 */
class LimitadorPorIp {
  private readonly visitas = new Map<string, number[]>();

  constructor(
    private readonly maximo: number,
    private readonly ventanaMs: number,
  ) {}

  admite(ip: string): boolean {
    const ahora = Date.now();
    const recientes = (this.visitas.get(ip) ?? []).filter((t) => ahora - t < this.ventanaMs);

    if (recientes.length >= this.maximo) {
      this.visitas.set(ip, recientes);
      return false;
    }

    recientes.push(ahora);
    this.visitas.set(ip, recientes);

    // Barrido perezoso: sin esto el mapa crece con cada IP que pasa por aquí
    // y no se vacía nunca, porque el proceso vive semanas.
    if (this.visitas.size > 5000) {
      for (const [otra, marcas] of this.visitas) {
        if (marcas.every((t) => ahora - t >= this.ventanaMs)) this.visitas.delete(otra);
      }
    }

    return true;
  }
}

type Rango = { ok: true; desde: IsoDate; hasta: IsoDate } | { ok: false; error: string };

/** Valida los parámetros de fecha; si faltan, cae al periodo ingerido. */
function resolverRango(
  query: { desde?: string; hasta?: string },
  pordefectoDesde: IsoDate,
  pordefectoHasta: IsoDate,
): Rango {
  let desde = pordefectoDesde;
  let hasta = pordefectoHasta;

  if (query.desde) {
    const parsed = isoDate(query.desde);
    if (!parsed.ok) return { ok: false, error: parsed.error.message };
    desde = parsed.value;
  }
  if (query.hasta) {
    const parsed = isoDate(query.hasta);
    if (!parsed.ok) return { ok: false, error: parsed.error.message };
    hasta = parsed.value;
  }

  // Comparar como cadenas basta: ISO 8601 ordena igual alfabética que
  // cronológicamente, que es media razón de existir del formato.
  if (desde > hasta) {
    return { ok: false, error: "El inicio del periodo es posterior al final" };
  }

  return { ok: true, desde, hasta };
}

/**
 * Comparación en tiempo constante. Evita que un atacante mida latencias
 * para adivinar la contraseña carácter a carácter. Si las longitudes
 * difieren, se compara contra sí misma para no filtrar la longitud.
 */
function passwordsMatch(expected: string, offered: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(offered, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}
