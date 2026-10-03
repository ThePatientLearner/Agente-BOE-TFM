/** Cliente mínimo de la API del monolito (solo lectura). */

const API_URL = process.env.API_URL ?? "http://localhost:3001";

/**
 * Quién gobierna lo que la disposición toca: la comunidad afectada si es
 * autonómica, y el Gobierno de España en todo lo demás. Lo calcula la API en
 * cada respuesta —no está guardado junto al resumen— para que siga siendo
 * cierto después de unas elecciones.
 */
export interface Gobierno {
  /** Código ISO 3166-2:ES ("EX", "CT"…) o "ES" para el Estado. */
  codigo: string;
  nombre: string;
  /** Decide la frase: "afecta a" solo tiene sentido en lo autonómico. */
  ambito: "estatal" | "autonomico";
  /** "PP+VOX" si es coalición, "PP" si gobierna en solitario. */
  etiqueta: string;
  partidos: string[];
  presidente: string;
  desde: string;
  /** Cuándo se contrastó por última vez la tabla de gobiernos (ISO). */
  verificadoEl: string;
}

export interface CatalogEntry {
  id: string;
  publicationDate: string;
  department: string;
  /** Título oficial del BOE, literal. */
  title: string;
  /** Título en lenguaje llano; nulo hasta que la IA resume. */
  plainTitle: string | null;
  officialHtmlUrl: string;
  officialPdfUrl: string;
  shortPhrase: string | null;
  bulletPoints: string[] | null;
  /** Impacto en el ciudadano, 1-5. Nulo hasta que hay resumen. */
  impact: number | null;
  model: string | null;
  /**
   * Nulo solo por desfase de despliegue: la web (Vercel) y la API (VPS) se
   * publican por separado, así que durante unos minutos una web nueva habla
   * con una API vieja. La API siempre lo manda; el tipo lo admite ausente
   * para que un despliegue a medias no tumbe el build del prerender.
   */
  gobierno: Gobierno | null;
  lastOfficialUpdateAt: string;
}

export interface CatalogDay {
  date: string;
  entries: CatalogEntry[];
}

export async function fetchDays(): Promise<CatalogDay[] | null> {
  try {
    const response = await fetch(`${API_URL}/api/days`, { next: { revalidate: 300 } });
    if (!response.ok) return null;
    return (await response.json()) as CatalogDay[];
  } catch {
    return null;
  }
}

/** Referencia mínima de cada disposición del archivo; la usa el sitemap. */
export interface CatalogReference {
  id: string;
  lastOfficialUpdateAt: string;
}

export async function fetchAllReferences(): Promise<CatalogReference[]> {
  try {
    const response = await fetch(`${API_URL}/api/entries`, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    return (await response.json()) as CatalogReference[];
  } catch {
    return [];
  }
}

/** Un tramo del reparto. El importe llega como cadena: son euros exactos. */
export interface RepartoTramo {
  convocatorias: number;
  importe: string;
}

export interface RepartoPeriodo {
  desde: string;
  hasta: string;
  directas: RepartoTramo;
  competitivas: RepartoTramo;
  /** Convocatorias cuyo régimen no se ha podido clasificar. Se muestran aparte. */
  sinClasificar: RepartoTramo;
}

export interface Cobertura {
  desde: string;
  hasta: string;
  convocatorias: number;
}

export interface ResumenAdministracion {
  nivel1: string;
  nivel2: string | null;
  convocatorias: number;
  importeTotal: string | null;
}

export interface ConvocatoriaDirecta {
  codigoBdns: string;
  fechaRecepcion: string;
  descripcion: string;
  nivel1: string;
  nivel2: string | null;
  nivel3: string | null;
  presupuestoTotal: string | null;
  urlOficial: string;
}

/** Tramo de destino de las adjudicaciones directas (público / privado). */
export interface TramoSector {
  sector: "publico" | "privado" | "desconocido";
  concesiones: number;
  importe: string;
}

/**
 * Dinero de concesión directa que llega a entidades públicas vs privadas,
 * clasificado por la letra del NIF/CIF del beneficiario (P/Q/S = público).
 */
export interface RepartoDirectasPorSector {
  desde: string;
  hasta: string;
  publico: TramoSector;
  privado: TramoSector;
  desconocido: TramoSector;
  sinDatos: boolean;
}

/** Adjudicación directa grande (para pestañas pública / privada). */
export interface MayorConcesionDirecta {
  codConcesion: string;
  fechaConcesion: string;
  numeroConvocatoria: string;
  beneficiario: string;
  importe: string | null;
  sector: "publico" | "privado" | "desconocido";
  nivel1: string | null;
  nivel2: string | null;
  descripcionConvocatoria: string;
  urlOficial: string;
}

export interface PanelSubvenciones {
  cobertura: Cobertura | null;
  reparto: RepartoPeriodo | null;
  porAdministracion: ResumenAdministracion[];
  /** Convocatorias directas por presupuesto publicado. */
  mayores: ConvocatoriaDirecta[];
  /**
   * Campos de sector (API): la web ya no los muestra. Un desglose
   * público/privado sobre adjudicaciones parciales no sostiene conclusiones.
   */
  mayoresPublicas?: MayorConcesionDirecta[];
  mayoresPrivadas?: MayorConcesionDirecta[];
  directasPorSector?: RepartoDirectasPorSector | null;
}

export interface PeriodoDisponible {
  /** "2026-08", que es también el segmento de la URL. */
  mes: string;
  desde: string;
  hasta: string;
  convocatorias: number;
}

/**
 * Seis horas de caché, no cinco minutos como el BOE. Los datos de la BDNS se
 * cargan una vez por semana, los lunes, así que revalidar cada hora solo
 * multiplicaría por seis las regeneraciones sin que cambiara nada. Con una
 * página por mes, esa diferencia se nota.
 */
const CADA_SEIS_HORAS = 21600;

/**
 * Panel de subvenciones de concesión directa. Sin rango devuelve todo lo
 * ingerido; con él, el mes que se le pida.
 */
export async function fetchSubvenciones(
  rango?: { desde: string; hasta: string },
): Promise<PanelSubvenciones | null> {
  const query = rango ? `?desde=${rango.desde}&hasta=${rango.hasta}` : "";
  try {
    const response = await fetch(`${API_URL}/api/subvenciones${query}`, {
      next: { revalidate: CADA_SEIS_HORAS },
    });
    if (!response.ok) return null;
    return (await response.json()) as PanelSubvenciones;
  } catch {
    return null;
  }
}

/**
 * Meses con datos. Lo consume `generateStaticParams`, así que de esta lista
 * depende cuántas páginas existen.
 */
export async function fetchPeriodosSubvenciones(): Promise<PeriodoDisponible[]> {
  try {
    const response = await fetch(`${API_URL}/api/subvenciones/periodos`, {
      next: { revalidate: CADA_SEIS_HORAS },
    });
    if (!response.ok) return [];
    return (await response.json()) as PeriodoDisponible[];
  } catch {
    return [];
  }
}

export async function fetchEntry(id: string): Promise<CatalogEntry | null> {
  try {
    const response = await fetch(`${API_URL}/api/entries/${encodeURIComponent(id)}`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return null;
    return (await response.json()) as CatalogEntry;
  } catch {
    return null;
  }
}
