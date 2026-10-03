import { isoDate, type IsoDate } from "../../../shared/domain/iso-date.js";
import { err, ok, type Result } from "../../../shared/domain/result.js";
import type { BdnsGateway, ConvocatoriaResumen } from "../domain/bdns-gateway.js";
import type { Concesion } from "../domain/concesion.js";
import { clasificar, urlOficialDe, type Convocatoria } from "../domain/convocatoria.js";
import {
  clasificarSectorBeneficiario,
  extraerNifCif,
} from "../domain/sector-beneficiario.js";

const BASE_URL = "https://www.infosubvenciones.es/bdnstrans/api";

/** La BDNS pagina de 0 en adelante; 100 es su tope habitual por página. */
const PAGE_SIZE = 100;

/**
 * Adapter contra la API pública de la BDNS (Base de Datos Nacional de
 * Subvenciones). No necesita clave: es abierta y se actualiza a diario.
 *
 * El aviso legal de la BDNS recuerda que sus datos son dinámicos y pueden
 * corregirse después de la extracción, y que pueden restringir el acceso
 * ante abuso del servicio. De ahí las pausas entre peticiones: la ingesta
 * diaria es de unas 150 fichas, no hay ninguna prisa.
 */
export class BdnsApiGateway implements BdnsGateway {
  constructor(private readonly pausaMs = 250) {}

  async listarConvocatorias(
    desde: IsoDate,
    hasta: IsoDate,
  ): Promise<Result<ConvocatoriaResumen[]>> {
    const resumenes: ConvocatoriaResumen[] = [];

    for (let page = 0; ; page += 1) {
      const url =
        `${BASE_URL}/convocatorias/busqueda?page=${page}&pageSize=${PAGE_SIZE}` +
        `&fechaDesde=${aFormatoBdns(desde)}&fechaHasta=${aFormatoBdns(hasta)}`;

      const body = await pedirJson(url);
      if (!body.ok) return body;

      const pagina = body.value as { content?: unknown; last?: unknown };
      const content = Array.isArray(pagina.content) ? pagina.content : [];

      for (const item of content) {
        const resumen = aResumen(item);
        if (resumen) resumenes.push(resumen);
      }

      // `last` marca la última página. Si faltara, el corte por página
      // incompleta evita un bucle infinito.
      if (pagina.last === true || content.length < PAGE_SIZE) break;

      await pausa(this.pausaMs);
    }

    return ok(resumenes);
  }

  async obtenerConvocatoria(codigoBdns: string): Promise<Result<Convocatoria>> {
    const body = await pedirJson(
      `${BASE_URL}/convocatorias?numConv=${encodeURIComponent(codigoBdns)}`,
    );
    if (!body.ok) return body;

    return aConvocatoria(body.value, codigoBdns);
  }

  async listarConcesiones(desde: IsoDate, hasta: IsoDate): Promise<Result<Concesion[]>> {
    const lista: Concesion[] = [];

    for (let page = 0; ; page += 1) {
      const url =
        `${BASE_URL}/concesiones/busqueda?page=${page}&pageSize=${PAGE_SIZE}` +
        `&fechaDesde=${aFormatoBdns(desde)}&fechaHasta=${aFormatoBdns(hasta)}`;

      const body = await pedirJson(url);
      if (!body.ok) return body;

      const pagina = body.value as { content?: unknown; last?: unknown };
      const content = Array.isArray(pagina.content) ? pagina.content : [];

      for (const item of content) {
        const fila = aConcesion(item);
        if (fila) lista.push(fila);
      }

      if (pagina.last === true || content.length < PAGE_SIZE) break;
      await pausa(this.pausaMs);
    }

    return ok(lista);
  }
}

/* ── HTTP ─────────────────────────────────────────────────────────── */

async function pedirJson(url: string): Promise<Result<unknown>> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "boe-inspector (+https://boe.es)" },
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      return err(new Error(`La API de la BDNS respondió ${response.status} en ${url}`));
    }
    return ok(await response.json());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

const pausa = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/* ── Parsing ──────────────────────────────────────────────────────── */

/** El buscador de la BDNS espera dd/MM/yyyy, no ISO. */
function aFormatoBdns(fecha: IsoDate): string {
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

function aResumen(item: unknown): ConvocatoriaResumen | null {
  if (typeof item !== "object" || item === null) return null;
  const obj = item as Record<string, unknown>;

  const codigoBdns = obj["numeroConvocatoria"];
  const fechaRecepcion = obj["fechaRecepcion"];
  if (typeof codigoBdns !== "string" || typeof fechaRecepcion !== "string") return null;

  return { codigoBdns, fechaRecepcion };
}

/**
 * Convierte la ficha de la BDNS al dominio. Solo `codigoBdns`, `fecha`,
 * `descripcion` y `nivel1` son obligatorios; el resto puede faltar y se
 * guarda como NULL. `tipoConvocatoria` ausente no es un error: se guarda
 * sin clasificar y el informe lo cuenta aparte.
 */
function aConvocatoria(body: unknown, codigoBdns: string): Result<Convocatoria> {
  if (typeof body !== "object" || body === null) {
    return err(new Error(`Respuesta no interpretable para la convocatoria ${codigoBdns}`));
  }
  const obj = body as Record<string, unknown>;

  const fechaCruda = texto(obj["fechaRecepcion"]);
  if (!fechaCruda) {
    return err(new Error(`La convocatoria ${codigoBdns} no trae fechaRecepcion`));
  }
  const fecha = isoDate(fechaCruda);
  if (!fecha.ok) {
    return err(new Error(`Convocatoria ${codigoBdns}: ${fecha.error.message}`));
  }

  const organo = (obj["organo"] ?? {}) as Record<string, unknown>;
  const nivel1 = texto(organo["nivel1"]);
  if (!nivel1) {
    return err(new Error(`La convocatoria ${codigoBdns} no trae el órgano convocante`));
  }

  const tipoConvocatoria = texto(obj["tipoConvocatoria"]);

  return ok({
    codigoBdns,
    fechaRecepcion: fecha.value,
    descripcion: texto(obj["descripcion"]) ?? "(sin descripción)",
    tipoConvocatoria,
    esConcesionDirecta: clasificar(tipoConvocatoria),
    nivel1,
    nivel2: texto(organo["nivel2"]),
    nivel3: texto(organo["nivel3"]),
    presupuestoTotal: numeroComoTexto(obj["presupuestoTotal"]),
    urlBasesReguladoras: texto(obj["urlBasesReguladoras"]),
    urlOficial: urlOficialDe(codigoBdns),
  });
}

function texto(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : null;
}

/** Los euros viajan como número JSON; se guardan como texto para `numeric`. */
function numeroComoTexto(valor: unknown): string | null {
  if (typeof valor === "number" && Number.isFinite(valor)) return valor.toString();
  if (typeof valor === "string" && valor.trim().length > 0) return valor.trim();
  return null;
}

function aConcesion(item: unknown): Concesion | null {
  if (typeof item !== "object" || item === null) return null;
  const obj = item as Record<string, unknown>;

  const codConcesion = texto(obj["codConcesion"]);
  const fechaCruda = texto(obj["fechaConcesion"]);
  const numeroConvocatoria = texto(obj["numeroConvocatoria"]);
  const beneficiario = texto(obj["beneficiario"]);
  if (!codConcesion || !fechaCruda || !numeroConvocatoria || !beneficiario) return null;

  const fecha = isoDate(fechaCruda);
  if (!fecha.ok) return null;

  return {
    codConcesion,
    fechaConcesion: fecha.value,
    numeroConvocatoria,
    beneficiario,
    nifCif: extraerNifCif(beneficiario),
    importe: numeroComoTexto(obj["importe"]),
    sector: clasificarSectorBeneficiario(beneficiario),
    nivel1: texto(obj["nivel1"]),
    nivel2: texto(obj["nivel2"]),
  };
}
