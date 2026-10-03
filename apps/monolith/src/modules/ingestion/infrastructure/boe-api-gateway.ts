import type { BoeId } from "../../../shared/domain/boe-id.js";
import { isoDate, todayIn, type IsoDate } from "../../../shared/domain/iso-date.js";
import { err, ok, type Result } from "../../../shared/domain/result.js";
import type { BoeEntryContent, BoeGateway, BoeSummaryItem } from "../domain/boe-gateway.js";

const BASE_URL = "https://boe.es/datosabiertos/api/boe/sumario";

/** Identificadores de disposición del sumario (no BOE-S- del PDF diario). */
const BOE_A_ID = /^BOE-A-\d{4}-\d{1,6}$/;

/**
 * Adapter contra la API de datos abiertos del BOE.
 *
 * El JSON del sumario anida diario → sección → departamento → epígrafe →
 * ítem, y cada nivel puede llegar como objeto o como array, a veces con
 * contenedores extra (`texto`) en cualquier capa. El parser no asume un
 * árbol fijo: recorre todo el documento, detecta ítems por forma
 * (`identificador` BOE-A-… + `titulo`) y hereda sección/departamento al
 * entrar en nodos `seccion` / `departamento`. Si el recorrido encuentra
 * menos BOE-A-… de los que hay en el JSON, la ingesta FALLA en lugar de
 * reportar "0 nuevas" en silencio.
 */
export class BoeApiGateway implements BoeGateway {
  async fetchDailySummary(date: IsoDate): Promise<Result<BoeSummaryItem[] | null>> {
    const compact = date.replaceAll("-", "");
    try {
      const response = await fetch(`${BASE_URL}/${compact}`, {
        headers: { Accept: "application/json" },
      });
      if (response.status === 404) {
        return ok(null);
      }
      if (!response.ok) {
        return err(new Error(`API del BOE respondió ${response.status}`));
      }
      const body: unknown = await response.json();
      const items = parseSummaryItems(body);
      const integrity = assertParserComplete(body, items);
      if (!integrity.ok) {
        return err(integrity.error);
      }
      return ok(items);
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async fetchEntryContent(id: BoeId): Promise<Result<BoeEntryContent>> {
    try {
      const response = await fetch(
        `https://www.boe.es/diario_boe/xml.php?id=${encodeURIComponent(id.value)}`,
      );
      if (!response.ok) {
        return err(new Error(`Descarga de ${id.value} respondió ${response.status}`));
      }
      const xml = await response.text();
      const text = extractBodyText(xml);
      if (text.length === 0) {
        return err(new Error(`No se encontró el cuerpo del documento ${id.value}`));
      }
      return ok({ text, lastUpdatedAt: extractLastUpdatedAt(xml) });
    } catch (error) {
      return err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

/* ── Parsing ──────────────────────────────────────────────────────── */

/** Expuesto solo para los tests: el parser es la parte frágil del adapter. */
export function parseSummaryItemsForTest(body: unknown): BoeSummaryItem[] {
  return parseSummaryItems(body);
}

/** Cuenta bruta de disposiciones BOE-A-… con título en el JSON (tests / auditoría). */
export function collectRawBoeAIdsForTest(body: unknown): string[] {
  return collectRawBoeAIds(body);
}

/**
 * Recorrido en profundidad del sumario.
 *
 * Formas reales vistas (no exhaustivo; el walker no depende de la lista):
 *   seccion → departamento → item
 *   seccion → departamento → epigrafe → item
 *   seccion → departamento → texto → epigrafe → item      (2026-08-07)
 *   seccion → texto → departamento → texto → epigrafe → item  (2026-08-09)
 *   item como objeto o como array; seccion/departamento objeto o array
 *
 * Contexto: al entrar en un hijo de la clave `seccion` se toma su `codigo`;
 * al entrar en un hijo de `departamento`, su `nombre`. El resto de claves
 * (`texto`, `epigrafe`, `diario`…) se atraviesan sin cambiar el contexto.
 */
function parseSummaryItems(body: unknown): BoeSummaryItem[] {
  const byId = new Map<string, BoeSummaryItem>();

  const visit = (node: unknown, section: string, department: string): void => {
    if (node === null || node === undefined) return;
    if (Array.isArray(node)) {
      for (const child of node) visit(child, section, department);
      return;
    }
    if (typeof node !== "object") return;

    const obj = node as Record<string, unknown>;

    // Ítem de disposición: identificador BOE-A-… y título (el PDF del diario
    // usa BOE-S-… sin título de norma).
    if (isDispositionItem(obj)) {
      const parsed = parseItem(obj, section, department);
      if (parsed && !byId.has(parsed.id)) {
        byId.set(parsed.id, parsed);
      }
      // No descendemos dentro del ítem: url_pdf/url_html no aportan normas hijas.
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      if (value === null || typeof value !== "object") continue;

      if (key === "seccion") {
        for (const sec of toArray(value)) {
          const code = typeof sec["codigo"] === "string" ? sec["codigo"] : section;
          visit(sec, code, department);
        }
        continue;
      }

      if (key === "departamento") {
        for (const dep of toArray(value)) {
          const name = typeof dep["nombre"] === "string" ? dep["nombre"] : department;
          visit(dep, section, name);
        }
        continue;
      }

      // texto, epigrafe, diario, sumario, data, item[], …
      visit(value, section, department);
    }
  };

  visit(body, "", "");
  return [...byId.values()];
}

function toArray(value: unknown): Record<string, unknown>[] {
  if (value === undefined || value === null) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter(
    (item): item is Record<string, unknown> => typeof item === "object" && item !== null,
  );
}

function isDispositionItem(obj: Record<string, unknown>): boolean {
  const id = obj["identificador"];
  if (typeof id !== "string" || !BOE_A_ID.test(id)) return false;
  // El sumario diario (BOE-S-…) no tiene titulo de norma; las disposiciones sí.
  return typeof obj["titulo"] === "string" && obj["titulo"].length > 0;
}

/**
 * Lista de BOE-A-… con título presentes en el JSON, sin importar el anidamiento.
 * Sirve de auditoria: si el parser devuelve menos, algo se ha perdido.
 */
function collectRawBoeAIds(body: unknown): string[] {
  const ids = new Set<string>();
  const walk = (node: unknown): void => {
    if (node === null || node === undefined) return;
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    if (typeof node !== "object") return;
    const obj = node as Record<string, unknown>;
    if (isDispositionItem(obj)) {
      ids.add(String(obj["identificador"]));
      return;
    }
    for (const value of Object.values(obj)) {
      if (value !== null && typeof value === "object") walk(value);
    }
  };
  walk(body);
  return [...ids];
}

function assertParserComplete(
  body: unknown,
  items: readonly BoeSummaryItem[],
): Result<void> {
  const rawIds = collectRawBoeAIds(body);
  const parsedIds = new Set(items.map((item) => item.id));
  const missing = rawIds.filter((id) => !parsedIds.has(id));
  if (missing.length === 0) {
    return ok(undefined);
  }
  return err(
    new Error(
      `Parser del sumario incompleto: ${missing.length} disposición(es) en el JSON no extraídas (${missing.slice(0, 8).join(", ")}${missing.length > 8 ? "…" : ""}). Revisar anidamiento del BOE.`,
    ),
  );
}

function parseItem(
  item: Record<string, unknown>,
  section: string,
  department: string,
): BoeSummaryItem | null {
  const id = item["identificador"];
  if (typeof id !== "string" || id.length === 0) return null;
  const url = (key: string): string | null => {
    const value = item[key];
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "texto" in value) {
      return String((value as { texto: unknown }).texto);
    }
    return null;
  };
  return {
    id,
    title: String(item["titulo"] ?? ""),
    section,
    department,
    htmlUrl: url("url_html") ?? `https://www.boe.es/diario_boe/txt.php?id=${id}`,
    pdfUrl: url("url_pdf") ?? `https://www.boe.es/boe/dias/pdfs/${id}.pdf`,
    xmlUrl: url("url_xml"),
  };
}

/**
 * Extrae el cuerpo de la disposición del XML.
 *
 * Un documento del BOE trae VARIOS bloques <texto>: los de
 * <analisis><referencias> son citas a otras normas ("el art. 94 de la Ley
 * 34/1998…") y solo el último contiene el articulado real. Coger el primero
 * devolvía fragmentos de decenas de caracteres y la IA resumía sobre nada.
 * Nos quedamos con el bloque más largo, que es robusto aunque cambie el orden.
 */
function extractBodyText(xml: string): string {
  const blocks = [...xml.matchAll(/<texto>([\s\S]*?)<\/texto>/g)].map((match) => match[1] ?? "");
  if (blocks.length === 0) return "";
  const longest = blocks.reduce((a, b) => (b.length > a.length ? b : a));
  return stripMarkup(longest);
}

function stripMarkup(fragment: string): string {
  return fragment
    .replace(/<[^>]+>/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;| /g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * `<documento fecha_actualizacion="20260720115602">` → "2026-07-20".
 * Si el atributo faltara, se cae a la fecha de hoy antes que publicar
 * una fecha inventada.
 */
function extractLastUpdatedAt(xml: string): IsoDate {
  const match = xml.match(/fecha_actualizacion="(\d{4})(\d{2})(\d{2})/);
  if (match) {
    const parsed = isoDate(`${match[1]}-${match[2]}-${match[3]}`);
    if (parsed.ok) return parsed.value;
  }
  return todayIn("Europe/Madrid");
}
