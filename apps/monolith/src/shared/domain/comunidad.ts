/**
 * Quién gobierna cada comunidad autónoma —y España— hoy.
 *
 * POR QUÉ ESTO ES UNA TABLA Y NO SE LE PREGUNTA A LA IA:
 * el modelo tiene fecha de corte y contesta con el gobierno que había cuando
 * lo entrenaron. Comprobado al escribir este archivo: de las 19 autonomías,
 * cuatro habían cambiado de color o de socios en los últimos doce meses
 * (Andalucía, Aragón, Castilla y León y Extremadura). Un resumen que dijera
 * "gobierna el PP" donde ahora gobierna PP+VOX sería un error de dato
 * disfrazado de resumen, y el resto de la ficha es literal del BOE.
 *
 * POR QUÉ NO SE GUARDA EN EL RESUMEN:
 * el resumen se genera una vez y se queda. El gobierno cambia. Si la frase
 * "gobierna X" se escribiera dentro del texto del resumen, cada elección
 * dejaría mintiendo a todo el archivo histórico. Aquí se resuelve en cada
 * lectura a partir del código de comunidad, así que actualizar este archivo
 * corrige de golpe la portada, las fichas y las notificaciones.
 *
 * MANTENIMIENTO: tras cada elección —autonómica o general— o cada cambio de
 * socios, tocar `gobierno`, `presidente`, `desde` y subir `VERIFICADO_EL`.
 * Es el único sitio que hay que tocar.
 */

/** Códigos ISO 3166-2:ES de las comunidades y ciudades autónomas. */
export type ComunidadCode =
  | "AN"
  | "AR"
  | "AS"
  | "CB"
  | "CE"
  | "CL"
  | "CM"
  | "CN"
  | "CT"
  | "EX"
  | "GA"
  | "IB"
  | "LR"
  | "MC"
  | "MD"
  | "ML"
  | "NC"
  | "PV"
  | "VC";

/** Lo que comparten el Estado y las diecinueve autonomías. */
export interface GobiernoBase {
  /** Nombre corto, el que se pinta en la web. */
  readonly nombre: string;
  /**
   * Partidos que ocupan el gobierno, en orden de peso. Uno solo si gobierna
   * en solitario (con o sin apoyos externos de investidura: un socio que
   * apoya desde fuera no gobierna, y mezclarlos daría una etiqueta falsa).
   */
  readonly gobierno: readonly string[];
  readonly presidente: string;
  /** Cuándo tomó posesión este gobierno. Texto: la precisión de día sobra. */
  readonly desde: string;
}

export interface Comunidad extends GobiernoBase {
  readonly codigo: ComunidadCode;
  /**
   * Cómo aparece la comunidad en el campo `departamento` del BOE y, de
   * rebote, en los títulos oficiales. Sin tildes ni mayúsculas: la
   * comparación se hace sobre texto normalizado.
   */
  readonly alias: readonly string[];
}

/**
 * El Gobierno de España. Vive APARTE de la lista de comunidades y sin alias,
 * y las dos cosas son deliberadas:
 *
 *  - Sin alias porque no se detecta, se deduce. Es el caso por defecto: una
 *    disposición que no señala a ninguna comunidad concreta la firma el
 *    Estado, que es quien llena la Sección I del BOE.
 *  - Fuera de `LISTA` porque, si entrara con alias, "España" aparecería en
 *    medio título oficial del boletín ("Banco de España", "Gobierno de
 *    España") y ensuciaría la detección autonómica, que sí es literal.
 */
export const GOBIERNO_DE_ESPANA = {
  codigo: "ES",
  nombre: "Gobierno de España",
  gobierno: ["PSOE", "Sumar"],
  presidente: "Pedro Sánchez",
  desde: "noviembre de 2023",
} as const satisfies GobiernoBase & { codigo: "ES" };

/**
 * Fecha en la que se contrastó la tabla contra fuentes públicas. Se muestra
 * junto al dato: quien lo lea tiene que poder saber si está mirando algo de
 * anteayer o de hace dos elecciones.
 */
export const VERIFICADO_EL = "2026-08-20";

const LISTA: readonly Comunidad[] = [
  {
    codigo: "AN",
    nombre: "Andalucía",
    gobierno: ["PP", "VOX"],
    presidente: "Juanma Moreno",
    desde: "julio de 2026",
    alias: ["andalucia", "junta de andalucia"],
  },
  {
    codigo: "AR",
    nombre: "Aragón",
    gobierno: ["PP", "VOX"],
    presidente: "Jorge Azcón",
    desde: "mayo de 2026",
    alias: ["aragon", "diputacion general de aragon"],
  },
  {
    codigo: "AS",
    nombre: "Asturias",
    gobierno: ["PSOE", "IU"],
    presidente: "Adrián Barbón",
    desde: "julio de 2023",
    alias: ["principado de asturias", "asturias"],
  },
  {
    codigo: "CB",
    nombre: "Cantabria",
    gobierno: ["PP"],
    presidente: "María José Sáenz de Buruaga",
    desde: "julio de 2023",
    alias: ["cantabria"],
  },
  {
    codigo: "CE",
    nombre: "Ceuta",
    gobierno: ["PP"],
    presidente: "Juan Jesús Vivas",
    desde: "junio de 2023",
    alias: ["ciudad de ceuta", "ceuta"],
  },
  {
    codigo: "CL",
    nombre: "Castilla y León",
    gobierno: ["PP", "VOX"],
    presidente: "Alfonso Fernández Mañueco",
    desde: "junio de 2026",
    alias: ["castilla y leon", "junta de castilla y leon"],
  },
  {
    codigo: "CM",
    nombre: "Castilla-La Mancha",
    gobierno: ["PSOE"],
    presidente: "Emiliano García-Page",
    desde: "julio de 2023",
    alias: ["castilla-la mancha", "castilla la mancha"],
  },
  {
    codigo: "CN",
    nombre: "Canarias",
    // AHI entra con una consejería propia (de las 12): gobierna, aunque sea
    // el socio pequeño. El apoyo externo de ASG, en cambio, no cuenta aquí.
    gobierno: ["CC", "PP", "AHI"],
    presidente: "Fernando Clavijo",
    desde: "julio de 2023",
    alias: ["canarias"],
  },
  {
    codigo: "CT",
    nombre: "Cataluña",
    gobierno: ["PSC"],
    presidente: "Salvador Illa",
    desde: "agosto de 2024",
    alias: ["cataluna", "catalunya", "generalitat de catalunya"],
  },
  {
    codigo: "EX",
    nombre: "Extremadura",
    gobierno: ["PP", "VOX"],
    presidente: "María Guardiola",
    desde: "abril de 2026",
    alias: ["extremadura", "junta de extremadura"],
  },
  {
    codigo: "GA",
    nombre: "Galicia",
    gobierno: ["PP"],
    presidente: "Alfonso Rueda",
    desde: "abril de 2024",
    alias: ["galicia", "xunta de galicia"],
  },
  {
    codigo: "IB",
    nombre: "Illes Balears",
    gobierno: ["PP"],
    presidente: "Marga Prohens",
    desde: "julio de 2023",
    alias: ["illes balears", "islas baleares", "les illes balears", "baleares"],
  },
  {
    codigo: "LR",
    nombre: "La Rioja",
    gobierno: ["PP"],
    presidente: "Gonzalo Capellán",
    desde: "julio de 2023",
    alias: ["la rioja"],
  },
  {
    codigo: "MC",
    nombre: "Región de Murcia",
    gobierno: ["PP"],
    presidente: "Fernando López Miras",
    desde: "julio de 2023",
    alias: ["region de murcia", "murcia"],
  },
  {
    codigo: "MD",
    nombre: "Madrid",
    gobierno: ["PP"],
    presidente: "Isabel Díaz Ayuso",
    desde: "junio de 2023",
    alias: ["comunidad de madrid", "madrid"],
  },
  {
    codigo: "ML",
    nombre: "Melilla",
    gobierno: ["PP"],
    presidente: "Juan José Imbroda",
    desde: "julio de 2023",
    alias: ["ciudad de melilla", "melilla"],
  },
  {
    codigo: "NC",
    nombre: "Navarra",
    gobierno: ["PSN", "Geroa Bai", "Contigo"],
    presidente: "María Chivite",
    desde: "agosto de 2023",
    alias: ["navarra", "nafarroa"],
  },
  {
    codigo: "PV",
    nombre: "País Vasco",
    gobierno: ["PNV", "PSE-EE"],
    presidente: "Imanol Pradales",
    desde: "junio de 2024",
    alias: ["pais vasco", "euskadi", "euskal autonomia erkidegoa"],
  },
  {
    codigo: "VC",
    nombre: "Comunitat Valenciana",
    gobierno: ["PP", "VOX"],
    presidente: "Juanfran Pérez Llorca",
    desde: "diciembre de 2025",
    alias: ["comunitat valenciana", "comunidad valenciana", "generalitat valenciana"],
  },
];

export const COMUNIDADES: ReadonlyMap<ComunidadCode, Comunidad> = new Map(
  LISTA.map((comunidad) => [comunidad.codigo, comunidad]),
);

/**
 * Alias ordenados de más largo a más corto. El orden importa: "murcia" está
 * dentro de "region de murcia" y "castilla y leon" comparte prefijo con
 * "castilla-la mancha". Buscando primero los largos, gana siempre la
 * coincidencia más específica.
 */
const ALIAS_ORDENADOS: readonly (readonly [string, Comunidad])[] = LISTA.flatMap((comunidad) =>
  comunidad.alias.map((alias) => [alias, comunidad] as const),
).sort(([a], [b]) => b.length - a.length);

/** Cómo se muestra el gobierno: "PP", "PP+VOX", "PSOE+Sumar". */
export function etiquetaGobierno(gobierno: GobiernoBase): string {
  return gobierno.gobierno.join("+");
}

/** Quita diacríticos y pasa a minúsculas, para comparar sin sorpresas. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * Todas las comunidades nombradas en un texto, sin repetir. Se usa para
 * decidir si una disposición estatal apunta a una sola región o a varias.
 */
export function comunidadesMencionadas(texto: string): readonly Comunidad[] {
  const limpio = normalizar(texto);
  const encontradas = new Map<ComunidadCode, Comunidad>();

  for (const [alias, comunidad] of ALIAS_ORDENADOS) {
    if (encontradas.has(comunidad.codigo)) continue;
    // Con fronteras de palabra: "leon" no debe saltar dentro de "leonés",
    // ni "ceuta" dentro de un apellido.
    if (new RegExp(`(^|[^a-z0-9])${escaparRegExp(alias)}([^a-z0-9]|$)`).test(limpio)) {
      encontradas.set(comunidad.codigo, comunidad);
    }
  }

  return [...encontradas.values()];
}

/**
 * La comunidad a la que corresponde una disposición, o `null` si no señala a
 * ninguna en concreto (y entonces manda el Estado — ver
 * `gobiernoDeDisposicion`).
 *
 * El departamento manda: en las secciones autonómicas del BOE viene literal
 * ("COMUNIDAD AUTÓNOMA DE CATALUÑA") y no admite duda. Solo si el
 * departamento es estatal —un ministerio— se mira el título oficial, y
 * únicamente se acepta cuando nombra a UNA comunidad: un real decreto que
 * cita a seis no "afecta a" ninguna en particular, y etiquetarlo con la
 * primera sería inventarse un dato.
 */
export function comunidadDeDisposicion(
  department: string,
  title?: string | null,
): Comunidad | null {
  const porDepartamento = comunidadesMencionadas(department);
  if (porDepartamento.length === 1) return porDepartamento[0] ?? null;
  if (porDepartamento.length > 1) return null;

  if (!title) return null;
  const porTitulo = comunidadesMencionadas(title);
  return porTitulo.length === 1 ? (porTitulo[0] ?? null) : null;
}

/**
 * Lo que viaja hasta la web y las notificaciones. Es una foto del momento
 * en que se sirve la respuesta, no un dato almacenado: se recalcula en cada
 * lectura para que un cambio de gobierno no deje resúmenes desactualizados.
 */
export interface GobiernoView {
  /** Código ISO de la comunidad, o "ES" para el Gobierno de España. */
  readonly codigo: ComunidadCode | "ES";
  readonly nombre: string;
  /**
   * Cambia la frase, no solo el nombre: una disposición autonómica "afecta a"
   * su comunidad, mientras que una estatal simplemente la firma el Gobierno
   * de España. Escribir "afecta a Gobierno de España" sería absurdo.
   */
  readonly ambito: "estatal" | "autonomico";
  /** "PP+VOX", "PSOE+Sumar". Lo que se pinta entre paréntesis. */
  readonly etiqueta: string;
  readonly partidos: readonly string[];
  readonly presidente: string;
  readonly desde: string;
  /** Cuándo se contrastó la tabla por última vez (transparencia del dato). */
  readonly verificadoEl: string;
}

export function gobiernoView(comunidad: Comunidad): GobiernoView;
export function gobiernoView(estado: typeof GOBIERNO_DE_ESPANA): GobiernoView;
export function gobiernoView(
  fuente: Comunidad | typeof GOBIERNO_DE_ESPANA,
): GobiernoView {
  return {
    codigo: fuente.codigo,
    nombre: fuente.nombre,
    ambito: fuente.codigo === "ES" ? "estatal" : "autonomico",
    etiqueta: etiquetaGobierno(fuente),
    partidos: fuente.gobierno,
    presidente: fuente.presidente,
    desde: fuente.desde,
    verificadoEl: VERIFICADO_EL,
  };
}

/**
 * Quién gobierna lo que una disposición toca. NUNCA devuelve nulo.
 *
 * Si no señala a ninguna comunidad concreta, la firma el Estado: eso es lo
 * que son las secciones I y III del BOE cuando el departamento es un
 * ministerio. Antes esos casos salían sin etiqueta, lo que dejaba a la mitad
 * del boletín sin decir de quién venía; ahora dicen "Gobierno de España".
 */
export function gobiernoDeDisposicion(
  department: string,
  title?: string | null,
): GobiernoView {
  const comunidad = comunidadDeDisposicion(department, title);
  return comunidad ? gobiernoView(comunidad) : gobiernoView(GOBIERNO_DE_ESPANA);
}

function escaparRegExp(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
