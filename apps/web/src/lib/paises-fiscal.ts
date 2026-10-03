/**
 * Parámetros fiscales por país para la calculadora de «¿Quién paga la fiesta?».
 *
 * MISMA METODOLOGÍA QUE ESPAÑA, PAÍS A PAÍS. La calculadora no cambia de
 * modelo al cambiar de bandera: siempre estima la misma cesta sobre un
 * asalariado individual sin hijos ni deducciones personales…
 *
 *   IRPF (o su equivalente) + cotización del trabajador + cotización de la
 *   empresa + IVA embebido en el consumo + impuestos especiales + otros
 *   (tasas y locales),
 *
 * …y siempre sitúa al usuario en la misma escalera de deciles, escalada al
 * nivel salarial del país (`escalaRenta`). Lo único que cambia son los
 * parámetros de cada jurisdicción, que viven aquí y solo aquí.
 *
 * QUÉ ES CADA COSA
 * · `irpf`: escalas de tipo marginal sobre el bruto una vez restadas las
 *   deducciones declaradas. España se queda con la tabla de tipos EFECTIVOS
 *   que ya estaba calibrada (`modo: "nodos"`), para no mover cifras que el
 *   resto de la página cita; los demás países usan sus tramos legales
 *   (`modo: "escalas"`), que son verificables uno a uno.
 * · `cotizaciones`: lista de conceptos con tipo, suelo y techo propios. Así
 *   caben desde el tope único español hasta el NI británico por tramos, los
 *   dos topes alemanes o el Social Security estadounidense.
 * · `iva.tipo` × `iva.eficiencia` = tipo efectivo sobre el consumo. La
 *   eficiencia recoge que ni todo el consumo tributa al tipo general ni todo
 *   el gasto lleva IVA (alquiler imputado, sanidad, educación…). El peso del
 *   IVA por decil se obtiene escalando la tabla española por la razón entre
 *   ese tipo efectivo y el español, así que España sale idéntica a antes.
 *
 * ÓRDENES DE MAGNITUD, NO NORMATIVA. Los tipos son los vigentes en 2025 con
 * el redondeo propio de una herramienta divulgativa; sanidad, escalas
 * cantonales/estatales y bonificaciones se aproximan. NO ES ASESORAMIENTO
 * FISCAL en ningún país. Para revisarlo: cada país lleva su `notas`, que es
 * lo que se enseña en pantalla como letra pequeña.
 */

/** Tramo de tipo marginal: se aplica desde `desde` hasta el siguiente tramo. */
export type TramoImpuesto = {
  desde: number;
  /** Tipo marginal en tanto por uno. */
  tipo: number;
};

/**
 * Una figura del impuesto sobre la renta (estatal, municipal, USC irlandés…).
 * Se suman todas las escalas del país para formar el concepto «IRPF».
 */
export type EscalaImpuesto = {
  id: string;
  nombre: string;
  /** Mínimo exento / deducción fija antes de aplicar los tramos. */
  deduccion?: number;
  /** Deducción proporcional al bruto (p. ej. Vorsorgepauschale alemana). */
  deduccionPctBruto?: number;
  /** Tope de la parte proporcional. */
  deduccionTope?: number;
  /** Crédito en cuota (tax credits irlandeses, jobbskatteavdrag sueco). */
  credito?: number;
  /** Recargo sobre la propia cuota a partir de un umbral de cuota (Soli). */
  recargo?: { nombre: string; pct: number; desdeCuota: number };
  tramos: readonly TramoImpuesto[];
};

/** Cotización social con su propio tipo, suelo y techo sobre el bruto. */
export type Cotizacion = {
  id: string;
  nombre: string;
  /** Tipo en tanto por uno sobre la parte del bruto dentro de la banda. */
  tipo: number;
  desde?: number;
  hasta?: number;
  /**
   * Regla de escalón: al superar `desde`, el tipo se aplica al bruto ENTERO,
   * no solo al exceso. Es como funciona el PRSI irlandés —por debajo del
   * umbral no pagas nada; por encima, pagas por todo—, que con una banda
   * normal saldría muy por debajo de la nómina real.
   */
  aplicaDesdeCero?: boolean;
};

/**
 * Opciones personales que cambian la factura de verdad y que un bruto anual
 * solo no captura. Se activan con un tick en la calculadora.
 *
 * Existen porque comparar países por el bruto es engañoso cuando uno de ellos
 * tiene una ventaja fiscal grande atada al estado civil: en Alemania, un casado
 * con un solo sueldo en casa paga bastante menos que un soltero por el mismo
 * dinero, y sin poder activarlo la comparación le hacía parecer más caro de lo
 * que es para media población.
 *
 * · `splitting`  — tributación conjunta con reparto de base (Ehegattensplitting).
 * · `conjunta`   — tributación conjunta con reducción fija en base (España).
 * · `iglesia`    — impuesto religioso sobre la cuota (Kirchensteuer).
 * · `sinHijos`   — recargo en la cotización de dependencia por no tener hijos.
 *
 * España lleva `conjunta` aunque su ventaja sea mucho menor que la alemana, y
 * eso es a propósito: si solo se modelara la de Alemania, marcar el tick haría
 * que Alemania adelantara a España en la comparación por un efecto que en
 * realidad existe en los dos sitios, solo que con tamaños muy distintos. La
 * diferencia de tamaño es justamente lo que hay que poder ver.
 */
export type OpcionFiscalId = "splitting" | "iglesia" | "sinHijos" | "conjunta";

export type OpcionFiscal = {
  id: OpcionFiscalId;
  etiqueta: string;
  nota: string;
  /** % sobre la cuota (iglesia) o puntos de cotización (sin hijos). */
  parametro?: number;
};

/** Qué ticks están marcados. Sin nada marcado, el cálculo es el de siempre. */
export type OpcionesActivas = Partial<Record<OpcionFiscalId, boolean>>;

export type MonedaPais = {
  codigo: string;
  /** Símbolo tal y como se pinta detrás de la cifra. */
  simbolo: string;
  /** Unidades de moneda local por 1 €. Solo se usa para comparar países. */
  porEuro: number;
};

export type PaisFiscal = {
  id: string;
  /** Nombre completo, el que ordena el desplegable. */
  nombre: string;
  /** Nombre corto para chips y tablas estrechas. */
  nombreCorto: string;
  bandera: string;
  moneda: MonedaPais;
  /**
   * Multiplicador de la escalera de deciles española, en moneda local.
   * Aproximado por la razón entre el salario mediano del país y el español.
   */
  escalaRenta: number;
  irpf:
    | { modo: "nodos"; nombre: string; nodos: readonly { renta: number; pct: number }[] }
    | { modo: "escalas"; nombre: string; escalas: readonly EscalaImpuesto[] };
  cotizacionesTrabajador: readonly Cotizacion[];
  cotizacionesEmpresa: readonly Cotizacion[];
  iva: {
    /** Nombre local: IVA, VAT, GST, MwSt, sales tax… */
    nombre: string;
    /** Tipo general en %. */
    tipo: number;
    /**
     * Fracción del consumo que acaba tributando al tipo general, una vez
     * contados tipos reducidos, exenciones y gasto sin IVA. España = 0,544,
     * que es justo el valor con el que la tabla de deciles ya estaba hecha.
     */
    eficiencia: number;
    nota: string;
  };
  /** Multiplicador de los impuestos especiales frente a los españoles. */
  especialesFactor: number;
  /** Tasas y tributos locales como % de la renta, por nivel de renta. */
  otros: { bajo: number; medio: number; alto: number; nota: string };
  inflacion: { anio: number; pct: number; fuente: string };
  recaudacion: {
    /** Millones de moneda local recaudados en impuestos (sin cotizaciones). */
    totalMillones: number;
    etiqueta: string;
  };
  /** Peso de cada decil en la recaudación del país (suma 100). */
  cuotaImpuestosDecilPct: readonly number[];
  /** Ticks disponibles en este país. Sin declarar, no se ofrece ninguno. */
  opciones?: readonly OpcionFiscal[];
  /** Letra pequeña propia del país: qué se aproxima y qué no está dentro. */
  notas: readonly string[];
};

/* ── Perfiles de concentración de la recaudación por decil ──────────────
   Cuánto del total de impuestos pone cada decil de población. Cambia con
   el peso relativo del impuesto sobre la renta (concentrado arriba) frente
   al IVA y las cotizaciones (más repartidos). Las tres filas suman 100. */

/** Mezcla continental: renta progresiva con IVA alto (ES, DE, CH). */
const CONCENTRACION_MEDIA = [
  3.2, 4.0, 5.0, 5.8, 6.8, 7.8, 9.2, 11.2, 15.0, 32.0,
] as const;

/** Renta muy progresiva y base estrecha abajo (IE, UK, AU). */
const CONCENTRACION_ALTA = [
  1.8, 2.6, 3.6, 4.6, 5.8, 7.2, 9.0, 11.4, 16.0, 38.0,
] as const;

/** Federal sin IVA y con deducción estándar amplia (EEUU). */
const CONCENTRACION_MUY_ALTA = [
  1.5, 2.4, 3.4, 4.4, 5.6, 7.0, 8.8, 11.4, 16.5, 39.0,
] as const;

/** Tipo local casi plano y IVA muy alto (SE, FI, PL). */
const CONCENTRACION_BAJA = [
  4.0, 4.8, 5.6, 6.4, 7.2, 8.2, 9.4, 11.2, 14.2, 29.0,
] as const;

/**
 * Puntos de IRPF efectivo sobre renta bruta del trabajo en España
 * (asalariado individual, sin hijos, solo nómina). Interpolación lineal
 * entre nodos. No replica mínimos, deducciones autonómicas ni retenciones.
 */
const IRPF_EFECTIVO_ES: readonly { renta: number; pct: number }[] = [
  { renta: 11_000, pct: 0 },
  { renta: 14_000, pct: 0.8 },
  { renta: 16_000, pct: 2.5 },
  { renta: 18_000, pct: 4.5 },
  { renta: 20_000, pct: 6.5 },
  { renta: 22_000, pct: 8.5 },
  { renta: 25_000, pct: 10.5 },
  { renta: 28_000, pct: 12.5 },
  { renta: 32_000, pct: 14.5 },
  { renta: 35_000, pct: 16 },
  { renta: 40_000, pct: 18 },
  { renta: 45_000, pct: 19.5 },
  { renta: 50_000, pct: 21 },
  { renta: 55_000, pct: 22.5 },
  { renta: 60_000, pct: 24 },
  { renta: 70_000, pct: 26.5 },
  { renta: 80_000, pct: 28.5 },
  { renta: 100_000, pct: 32 },
  { renta: 120_000, pct: 34 },
  { renta: 150_000, pct: 36.5 },
  { renta: 200_000, pct: 39 },
  { renta: 300_000, pct: 42 },
  { renta: 500_000, pct: 44 },
];

const EUR = { codigo: "EUR", simbolo: "€", porEuro: 1 } as const;

/* ── Países ──────────────────────────────────────────────────────────── */

const ALEMANIA: PaisFiscal = {
  id: "de",
  nombre: "Alemania",
  nombreCorto: "Alemania",
  bandera: "🇩🇪",
  moneda: EUR,
  escalaRenta: 1.65,
  irpf: {
    modo: "escalas",
    nombre: "Einkommensteuer + Soli",
    escalas: [
      {
        id: "lohnsteuer",
        nombre: "Einkommensteuer (clase I)",
        // Werbungskostenpauschale (1.230 €) más la Vorsorgepauschale, que
        // descuenta buena parte de las cotizaciones de la base imponible.
        deduccion: 1_230,
        deduccionPctBruto: 0.2,
        deduccionTope: 11_000,
        // La tarifa alemana es una fórmula continua de 14 % a 45 %; aquí va
        // escalonada por tramos que reproducen su tipo medio.
        tramos: [
          { desde: 0, tipo: 0 },
          // Grundfreibetrag 2026: 12.348 € (24.696 € en tributación conjunta,
          // que sale solo al aplicar el splitting sobre media base).
          { desde: 12_348, tipo: 0.2 },
          { desde: 17_443, tipo: 0.3 },
          { desde: 30_000, tipo: 0.35 },
          { desde: 45_000, tipo: 0.4 },
          { desde: 68_480, tipo: 0.42 },
          { desde: 277_825, tipo: 0.45 },
        ],
        recargo: {
          nombre: "Solidaritätszuschlag",
          pct: 0.055,
          desdeCuota: 19_950,
        },
      },
    ],
  },
  cotizacionesTrabajador: [
    { id: "rv", nombre: "Pensiones (RV)", tipo: 0.093, hasta: 101_400 },
    { id: "av", nombre: "Desempleo (AV)", tipo: 0.013, hasta: 101_400 },
    { id: "kv", nombre: "Sanidad (KV)", tipo: 0.0875, hasta: 69_750 },
    { id: "pv", nombre: "Dependencia (PV)", tipo: 0.018, hasta: 69_750 },
  ],
  cotizacionesEmpresa: [
    { id: "rv", nombre: "Pensiones (RV)", tipo: 0.093, hasta: 101_400 },
    { id: "av", nombre: "Desempleo (AV)", tipo: 0.013, hasta: 101_400 },
    { id: "kv", nombre: "Sanidad (KV)", tipo: 0.0875, hasta: 69_750 },
    { id: "pv", nombre: "Dependencia (PV)", tipo: 0.018, hasta: 69_750 },
    { id: "umlagen", nombre: "Umlagen U1/U2/insolvencia", tipo: 0.016, hasta: 69_750 },
  ],
  iva: {
    nombre: "MwSt",
    tipo: 19,
    eficiencia: 0.544,
    nota: "Tipo general 19 % · 7 % reducido en alimentos, libros y transporte",
  },
  especialesFactor: 1.2,
  otros: {
    bajo: 0.6,
    medio: 0.7,
    alto: 0.8,
    nota: "Grundsteuer prorrateada, tasas municipales, canon audiovisual…",
  },
  inflacion: { anio: 2025, pct: 2.2, fuente: "Destatis" },
  recaudacion: {
    totalMillones: 995_000,
    etiqueta: "Steuereinnahmen (Bund + Länder + municipios)",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_MEDIA,
  opciones: [
    {
      id: "splitting",
      etiqueta: "Casado y único sueldo en casa",
      nota: "Ehegattensplitting: se parte la base en dos, se aplica la tarifa a cada mitad y se dobla. Con un solo sueldo baja mucho la factura; si los dos cobran parecido, el ahorro es casi cero",
    },
    {
      id: "iglesia",
      etiqueta: "Paga impuesto religioso",
      nota: "Kirchensteuer: 9 % de la cuota (8 % en Baviera y Baden-Wurtemberg). Solo si estás inscrito en una confesión; se puede salir",
      parametro: 9,
    },
    {
      id: "sinHijos",
      etiqueta: "Sin hijos",
      nota: "Recargo de 0,6 puntos en la cotización de dependencia a partir de los 23 años, y lo paga el trabajador entero",
      parametro: 0.6,
    },
  ],
  notas: [
    "Los dos topes de cotización van por separado: 101.400 € en pensiones y desempleo, 69.750 € en sanidad y dependencia (2026).",
    "Sanidad al 17,5 % (14,6 % general + 2,9 % de recargo medio de caja), repartido al 50 % con la empresa.",
    "Los ticks de casado, iglesia y sin hijos cambian la factura de verdad: en Alemania el estado civil pesa más que en casi cualquier otro sistema.",
  ],
};

const AUSTRALIA: PaisFiscal = {
  id: "au",
  nombre: "Australia",
  nombreCorto: "Australia",
  bandera: "🇦🇺",
  moneda: { codigo: "AUD", simbolo: "A$", porEuro: 1.65 },
  escalaRenta: 2.9,
  irpf: {
    modo: "escalas",
    nombre: "Income tax (residentes)",
    escalas: [
      {
        id: "ato",
        nombre: "Income tax ATO",
        tramos: [
          { desde: 0, tipo: 0 },
          { desde: 18_200, tipo: 0.16 },
          { desde: 45_000, tipo: 0.3 },
          { desde: 135_000, tipo: 0.37 },
          { desde: 190_000, tipo: 0.45 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    // El Medicare levy entra en rampa: 10 % del exceso sobre 27.222 hasta
    // igualar el 2 % de todo el sueldo, y a partir de ahí 2 % plano.
    { id: "medicare-rampa", nombre: "Medicare levy (rampa)", tipo: 0.1, desde: 27_222, hasta: 34_027 },
    { id: "medicare", nombre: "Medicare levy", tipo: 0.02, desde: 34_027 },
  ],
  cotizacionesEmpresa: [
    {
      id: "super",
      nombre: "Superannuation (12 %)",
      tipo: 0.12,
      hasta: 260_280,
    },
  ],
  iva: {
    nombre: "GST",
    tipo: 10,
    eficiencia: 0.52,
    nota: "GST 10 % · alimentos frescos, sanidad y educación quedan fuera",
  },
  especialesFactor: 0.9,
  otros: {
    bajo: 1.2,
    medio: 1.0,
    alto: 0.8,
    nota: "Council rates, stamp duty prorrateado y tasas estatales",
  },
  inflacion: { anio: 2025, pct: 2.9, fuente: "ABS" },
  recaudacion: {
    totalMillones: 780_000,
    etiqueta: "Impuestos de todos los niveles de gobierno",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_ALTA,
  notas: [
    "La superannuation del 12 % es ahorro de jubilación del propio trabajador, no un impuesto: se cuenta como coste del puesto, igual que una cotización.",
    "Sin payroll tax estatal (~4,85 %), que solo pagan empresas por encima del umbral de nómina.",
    "Sin Low Income Tax Offset ni HELP (préstamo universitario), que mueven bastante el neto real.",
  ],
};

const EEUU_NY: PaisFiscal = {
  id: "us-ny",
  nombre: "EEUU · Nueva York",
  nombreCorto: "EEUU-NY",
  bandera: "🇺🇸",
  moneda: { codigo: "USD", simbolo: "$", porEuro: 1.08 },
  escalaRenta: 2.35,
  irpf: {
    modo: "escalas",
    nombre: "Federal + estado de Nueva York",
    escalas: [
      {
        id: "federal",
        nombre: "Federal income tax",
        deduccion: 15_000,
        tramos: [
          { desde: 0, tipo: 0.1 },
          { desde: 11_925, tipo: 0.12 },
          { desde: 48_475, tipo: 0.22 },
          { desde: 103_350, tipo: 0.24 },
          { desde: 197_300, tipo: 0.32 },
          { desde: 250_525, tipo: 0.35 },
          { desde: 626_350, tipo: 0.37 },
        ],
      },
      {
        id: "ny",
        nombre: "New York State tax",
        deduccion: 8_000,
        tramos: [
          { desde: 0, tipo: 0.04 },
          { desde: 8_500, tipo: 0.045 },
          { desde: 11_700, tipo: 0.0525 },
          { desde: 13_900, tipo: 0.055 },
          { desde: 80_650, tipo: 0.06 },
          { desde: 215_400, tipo: 0.0685 },
          { desde: 1_077_550, tipo: 0.0965 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    { id: "ss", nombre: "Social Security", tipo: 0.062, hasta: 176_100 },
    { id: "medicare", nombre: "Medicare", tipo: 0.0145 },
    { id: "medicare-plus", nombre: "Medicare adicional", tipo: 0.009, desde: 200_000 },
  ],
  cotizacionesEmpresa: [
    { id: "ss", nombre: "Social Security", tipo: 0.062, hasta: 176_100 },
    { id: "medicare", nombre: "Medicare", tipo: 0.0145 },
    { id: "futa", nombre: "FUTA (paro federal)", tipo: 0.006, hasta: 7_000 },
    { id: "sui", nombre: "SUI Nueva York", tipo: 0.04, hasta: 12_800 },
  ],
  iva: {
    nombre: "Sales tax",
    tipo: 8.5,
    eficiencia: 0.42,
    nota: "Sales tax estatal + local (~8,5 %) y solo sobre bienes: base mucho más estrecha que un IVA",
  },
  especialesFactor: 0.35,
  otros: {
    bajo: 3.2,
    medio: 3.0,
    alto: 2.6,
    nota: "Property tax prorrateado (de los más altos del país) y tasas locales",
  },
  inflacion: { anio: 2025, pct: 2.9, fuente: "BLS" },
  recaudacion: {
    totalMillones: 5_030_000,
    etiqueta: "Ingresos tributarios federales + estado de Nueva York",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_MUY_ALTA,
  notas: [
    "NO incluye el seguro médico: la prima que paga la empresa (del orden de 8.000 $/año por empleado) es la gran pieza del coste laboral estadounidense y aquí no cuenta como impuesto.",
    "Sin el IRPF municipal de la ciudad de Nueva York (~3,9 %): esto es el estado, no NYC.",
    "Deducción estándar de soltero (15.000 $); quien detalla deducciones o tiene hijos paga bastante menos.",
  ],
};

const EEUU_TEXAS: PaisFiscal = {
  id: "us-tx",
  nombre: "EEUU · Texas",
  nombreCorto: "EEUU-TX",
  bandera: "🇺🇸",
  moneda: { codigo: "USD", simbolo: "$", porEuro: 1.08 },
  escalaRenta: 2.1,
  irpf: {
    modo: "escalas",
    nombre: "Federal (Texas no tiene IRPF estatal)",
    escalas: [
      {
        id: "federal",
        nombre: "Federal income tax",
        deduccion: 15_000,
        tramos: [
          { desde: 0, tipo: 0.1 },
          { desde: 11_925, tipo: 0.12 },
          { desde: 48_475, tipo: 0.22 },
          { desde: 103_350, tipo: 0.24 },
          { desde: 197_300, tipo: 0.32 },
          { desde: 250_525, tipo: 0.35 },
          { desde: 626_350, tipo: 0.37 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    { id: "ss", nombre: "Social Security", tipo: 0.062, hasta: 176_100 },
    { id: "medicare", nombre: "Medicare", tipo: 0.0145 },
    { id: "medicare-plus", nombre: "Medicare adicional", tipo: 0.009, desde: 200_000 },
  ],
  cotizacionesEmpresa: [
    { id: "ss", nombre: "Social Security", tipo: 0.062, hasta: 176_100 },
    { id: "medicare", nombre: "Medicare", tipo: 0.0145 },
    { id: "futa", nombre: "FUTA (paro federal)", tipo: 0.006, hasta: 7_000 },
    { id: "sui", nombre: "SUI Texas", tipo: 0.027, hasta: 9_000 },
  ],
  iva: {
    nombre: "Sales tax",
    tipo: 8.25,
    eficiencia: 0.42,
    nota: "Sales tax estatal + local (hasta 8,25 %) y solo sobre bienes",
  },
  especialesFactor: 0.3,
  otros: {
    bajo: 4.0,
    medio: 3.6,
    alto: 3.0,
    nota: "Property tax alto: Texas financia sin IRPF estatal y lo cobra en el ladrillo",
  },
  inflacion: { anio: 2025, pct: 2.9, fuente: "BLS" },
  recaudacion: {
    totalMillones: 4_980_000,
    etiqueta: "Ingresos tributarios federales + estado de Texas",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_MUY_ALTA,
  notas: [
    "NO incluye el seguro médico que paga la empresa (~8.000 $/año), la gran pieza no fiscal del coste laboral en EEUU.",
    "Texas no tiene impuesto sobre la renta estatal: lo compensa con property tax y sales tax, que aquí sí están.",
    "El property tax se estima como % de la renta; para un propietario con casa cara puede ser bastante más.",
  ],
};

const ESPANA: PaisFiscal = {
  id: "es",
  nombre: "España",
  nombreCorto: "España",
  bandera: "🇪🇸",
  moneda: EUR,
  escalaRenta: 1,
  irpf: { modo: "nodos", nombre: "IRPF (trabajo)", nodos: IRPF_EFECTIVO_ES },
  opciones: [
    {
      /**
       * Reducción de 3.400 € en base por tributación conjunta, la del caso más
       * común: matrimonio en el que solo uno tiene rentas. Al lado del
       * splitting alemán es una ventaja pequeña, y verlo es el objetivo.
       */
      id: "conjunta",
      etiqueta: "Casado y único sueldo en casa",
      nota: "Tributación conjunta: reducción de 3.400 € en la base. No parte la base en dos como el splitting alemán, así que el ahorro es mucho menor",
      parametro: 3_400,
    },
  ],
  cotizacionesTrabajador: [
    {
      id: "ss",
      nombre: "Contingencias + desempleo + FP",
      tipo: 0.0635,
      hasta: 57_000,
    },
  ],
  cotizacionesEmpresa: [
    {
      id: "ss",
      nombre: "Contingencias, desempleo, FOGASA, FP, MEI",
      tipo: 0.298,
      hasta: 57_000,
    },
  ],
  iva: {
    nombre: "IVA",
    tipo: 21,
    eficiencia: 0.544,
    nota: "Tipo general 21 % · reducido 10 % y superreducido 4 %",
  },
  especialesFactor: 1,
  otros: {
    bajo: 0.4,
    medio: 0.55,
    alto: 0.7,
    nota: "IBI prorrateado, basura, tasas… muy variable",
  },
  inflacion: { anio: 2025, pct: 2.7, fuente: "INE" },
  recaudacion: {
    totalMillones: 325_356,
    etiqueta: "Recaudación tributaria AEAT",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_MEDIA,
  notas: [
    "Sin deducciones autonómicas, familiares ni regímenes forales (País Vasco y Navarra van aparte).",
    "Tipos del régimen general: autónomos, agrarios y bonificaciones especiales no están.",
  ],
};

const FINLANDIA: PaisFiscal = {
  id: "fi",
  nombre: "Finlandia",
  nombreCorto: "Finlandia",
  bandera: "🇫🇮",
  moneda: EUR,
  escalaRenta: 1.55,
  irpf: {
    modo: "escalas",
    nombre: "Estatal + municipal",
    escalas: [
      {
        id: "tulovero",
        nombre: "Impuesto estatal + municipal",
        // Tramos que aproximan la suma de escala estatal y tipo municipal
        // (~7,5 % tras la reforma de 2023) ya neta de las deducciones
        // automáticas por rendimientos del trabajo.
        tramos: [
          { desde: 0, tipo: 0.15 },
          { desde: 20_000, tipo: 0.26 },
          { desde: 30_000, tipo: 0.34 },
          { desde: 50_000, tipo: 0.45 },
          { desde: 90_000, tipo: 0.46 },
          { desde: 150_000, tipo: 0.49 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    { id: "tyel", nombre: "Pensiones (TyEL)", tipo: 0.0715 },
    { id: "paro", nombre: "Desempleo", tipo: 0.0059 },
    { id: "sairaus", nombre: "Sanidad (sairausvakuutus)", tipo: 0.0135 },
  ],
  cotizacionesEmpresa: [
    { id: "tyel", nombre: "Pensiones (TyEL)", tipo: 0.1738 },
    { id: "paro", nombre: "Desempleo", tipo: 0.006 },
    { id: "sairaus", nombre: "Sanidad", tipo: 0.0187 },
    { id: "accidentes", nombre: "Accidentes y vida", tipo: 0.007 },
  ],
  iva: {
    nombre: "ALV",
    tipo: 25.5,
    eficiencia: 0.544,
    nota: "Tipo general 25,5 %, de los más altos de la UE · reducidos 14 % y 10 %",
  },
  especialesFactor: 1.3,
  otros: {
    bajo: 0.5,
    medio: 0.6,
    alto: 0.7,
    nota: "Kiinteistövero (inmuebles), canon audiovisual y tasas municipales",
  },
  inflacion: { anio: 2025, pct: 1.5, fuente: "Tilastokeskus" },
  recaudacion: {
    totalMillones: 76_000,
    etiqueta: "Impuestos estatales + municipales (sin cotizaciones)",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_BAJA,
  notas: [
    "El tipo municipal varía por ayuntamiento (unos 3 puntos entre el más caro y el más barato).",
    "Sin impuesto religioso (1–2 %), que solo pagan los miembros de la iglesia luterana u ortodoxa.",
    "La deducción por rendimientos del trabajo ya va incorporada en los tramos, no se aplica aparte.",
  ],
};

const IRLANDA: PaisFiscal = {
  id: "ie",
  nombre: "Irlanda",
  nombreCorto: "Irlanda",
  bandera: "🇮🇪",
  moneda: EUR,
  escalaRenta: 1.65,
  irpf: {
    modo: "escalas",
    nombre: "Income tax + USC",
    escalas: [
      {
        id: "income-tax",
        nombre: "Income tax",
        // Personal credit (2.000 €) + employee credit (2.000 €).
        credito: 4_000,
        tramos: [
          { desde: 0, tipo: 0.2 },
          { desde: 44_000, tipo: 0.4 },
        ],
      },
      {
        id: "usc",
        nombre: "Universal Social Charge",
        tramos: [
          { desde: 0, tipo: 0.005 },
          { desde: 12_012, tipo: 0.02 },
          { desde: 27_382, tipo: 0.03 },
          { desde: 70_044, tipo: 0.08 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    {
      id: "prsi",
      nombre: "PRSI trabajador",
      tipo: 0.041,
      desde: 18_304,
      aplicaDesdeCero: true,
    },
  ],
  cotizacionesEmpresa: [
    { id: "prsi", nombre: "PRSI empresa", tipo: 0.1115 },
  ],
  iva: {
    nombre: "VAT",
    tipo: 23,
    eficiencia: 0.5,
    nota: "VAT 23 % con muchos bienes a tipo cero (alimentos básicos, ropa infantil, libros)",
  },
  especialesFactor: 1.3,
  otros: {
    bajo: 0.4,
    medio: 0.4,
    alto: 0.5,
    nota: "Local Property Tax (baja) y tasas municipales",
  },
  inflacion: { anio: 2025, pct: 1.9, fuente: "CSO" },
  recaudacion: {
    totalMillones: 108_000,
    etiqueta: "Exchequer tax receipts",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_ALTA,
  notas: [
    "PRSI de empresa al 11,15 %; por debajo de 27.400 € anuales el tipo real es 8,9 %.",
    "El USC exime por completo a quien cobra menos de 13.000 € al año.",
    "Sin Rent Tax Credit ni deducciones por hijos, que rebajan la factura real.",
  ],
};

const POLONIA: PaisFiscal = {
  id: "pl",
  nombre: "Polonia",
  nombreCorto: "Polonia",
  bandera: "🇵🇱",
  moneda: { codigo: "PLN", simbolo: "zł", porEuro: 4.25 },
  escalaRenta: 3.3,
  irpf: {
    modo: "escalas",
    nombre: "PIT",
    escalas: [
      {
        id: "pit",
        nombre: "PIT",
        // Base = bruto − cotizaciones sociales (13,71 %) − costes de obtención.
        // Los 30.000 zł exentos van como primer tramo al 0 %, que es
        // exactamente la kwota zmniejszająca de 3.600 zł.
        deduccion: 3_000,
        deduccionPctBruto: 0.1371,
        tramos: [
          { desde: 0, tipo: 0 },
          { desde: 30_000, tipo: 0.12 },
          { desde: 120_000, tipo: 0.32 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    { id: "emerytalne", nombre: "Pensiones (emerytalne)", tipo: 0.0976, hasta: 260_190 },
    { id: "rentowe", nombre: "Invalidez (rentowe)", tipo: 0.015, hasta: 260_190 },
    { id: "chorobowe", nombre: "Enfermedad (chorobowe)", tipo: 0.0245 },
    { id: "zdrowotne", nombre: "Sanidad (zdrowotne, 9 % sobre base)", tipo: 0.0777 },
  ],
  cotizacionesEmpresa: [
    { id: "emerytalne", nombre: "Pensiones (emerytalne)", tipo: 0.0976, hasta: 260_190 },
    { id: "rentowe", nombre: "Invalidez (rentowe)", tipo: 0.065, hasta: 260_190 },
    { id: "wypadkowe", nombre: "Accidentes (wypadkowe)", tipo: 0.0167 },
    { id: "fp", nombre: "Fondo de trabajo + FGŚP", tipo: 0.0255 },
  ],
  iva: {
    nombre: "VAT",
    tipo: 23,
    eficiencia: 0.544,
    nota: "VAT 23 % · reducidos 8 % y 5 % en alimentos y vivienda",
  },
  especialesFactor: 1.2,
  otros: {
    bajo: 0.5,
    medio: 0.6,
    alto: 0.7,
    nota: "Impuesto de bienes inmuebles y tasas locales, comparativamente bajos",
  },
  inflacion: { anio: 2025, pct: 3.7, fuente: "GUS" },
  recaudacion: {
    totalMillones: 700_000,
    etiqueta: "Ingresos tributarios del presupuesto estatal",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_BAJA,
  notas: [
    "La cuota sanitaria (9 % sobre la base tras cotizaciones ≈ 7,8 % del bruto) ya no se deduce del PIT desde 2022.",
    "Sin la exención del PIT para menores de 26 años ni el régimen de autónomos con tipo lineal.",
    "Cifras en zlotys: para comparar con España se convierten a euros al cambio nominal, no por poder adquisitivo.",
  ],
};

const REINO_UNIDO: PaisFiscal = {
  id: "uk",
  nombre: "Reino Unido",
  nombreCorto: "R. Unido",
  bandera: "🇬🇧",
  moneda: { codigo: "GBP", simbolo: "£", porEuro: 0.84 },
  escalaRenta: 1.4,
  irpf: {
    modo: "escalas",
    nombre: "Income tax",
    escalas: [
      {
        id: "income-tax",
        nombre: "Income tax (Inglaterra)",
        // El tramo del 60 % no existe en el BOE británico: es el efecto de
        // perder la personal allowance a razón de 1 £ por cada 2 £ por
        // encima de 100.000 £.
        tramos: [
          { desde: 0, tipo: 0 },
          { desde: 12_570, tipo: 0.2 },
          { desde: 50_270, tipo: 0.4 },
          { desde: 100_000, tipo: 0.6 },
          { desde: 125_140, tipo: 0.45 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    { id: "ni", nombre: "National Insurance", tipo: 0.08, desde: 12_570, hasta: 50_270 },
    { id: "ni-alto", nombre: "National Insurance (tramo alto)", tipo: 0.02, desde: 50_270 },
  ],
  cotizacionesEmpresa: [
    { id: "ni", nombre: "Employer NI (15 %)", tipo: 0.15, desde: 5_000 },
  ],
  iva: {
    nombre: "VAT",
    tipo: 20,
    eficiencia: 0.5,
    nota: "VAT 20 % con tipo cero en alimentos, libros y ropa infantil",
  },
  especialesFactor: 1.3,
  otros: {
    bajo: 2.5,
    medio: 1.8,
    alto: 1.2,
    nota: "Council tax: fija por vivienda, así que pesa más cuanto menos cobras",
  },
  inflacion: { anio: 2025, pct: 3.4, fuente: "ONS" },
  recaudacion: {
    totalMillones: 840_000,
    etiqueta: "HMRC total receipts",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_ALTA,
  notas: [
    "Escala de Inglaterra, Gales e Irlanda del Norte: Escocia tiene seis tramos propios y grava más las rentas altas.",
    "Sin pensión automática (auto-enrolment, 3 % de la empresa) ni préstamo estudiantil (9 % sobre el umbral).",
    "El National Insurance de empresa subió al 15 % con umbral de 5.000 £ en abril de 2025.",
  ],
};

const SUECIA: PaisFiscal = {
  id: "se",
  nombre: "Suecia",
  nombreCorto: "Suecia",
  bandera: "🇸🇪",
  moneda: { codigo: "SEK", simbolo: "kr", porEuro: 11.3 },
  escalaRenta: 16,
  irpf: {
    modo: "escalas",
    nombre: "Kommunalskatt + statlig skatt",
    escalas: [
      {
        id: "skatt",
        nombre: "Impuesto municipal + estatal",
        // grundavdrag medio y jobbskatteavdrag (crédito por trabajar), que
        // en Suecia es lo que separa el tipo nominal del real.
        deduccion: 28_000,
        credito: 33_000,
        tramos: [
          { desde: 0, tipo: 0.324 },
          { desde: 625_800, tipo: 0.524 },
        ],
      },
    ],
  },
  // La allmän pensionsavgift (7 %) se devuelve íntegra vía crédito fiscal:
  // en la práctica el trabajador sueco no ve cotización en la nómina.
  cotizacionesTrabajador: [],
  cotizacionesEmpresa: [
    { id: "arbetsgivaravgift", nombre: "Arbetsgivaravgifter (31,42 %)", tipo: 0.3142 },
  ],
  iva: {
    nombre: "Moms",
    tipo: 25,
    eficiencia: 0.544,
    nota: "Moms 25 % · 12 % en alimentos y hostelería, 6 % en transporte y cultura",
  },
  especialesFactor: 1.25,
  otros: {
    bajo: 0.5,
    medio: 0.6,
    alto: 0.7,
    nota: "Fastighetsavgift (tasa de inmuebles, con tope) y tasas municipales",
  },
  inflacion: { anio: 2025, pct: 2.3, fuente: "SCB" },
  recaudacion: {
    totalMillones: 2_550_000,
    etiqueta: "Impuestos totales (Estado + municipios + regiones)",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_BAJA,
  notas: [
    "La cotización del trabajador sale a cero a propósito: el 7 % de pensión se compensa entero con un crédito fiscal, así que todo el peso está en el impuesto y en el 31,42 % de la empresa.",
    "El tipo municipal medio (32,4 %) varía unos 6 puntos entre municipios.",
    "Cifras en coronas: la conversión a euros para comparar es al cambio nominal.",
  ],
};

const SUIZA: PaisFiscal = {
  id: "ch",
  nombre: "Suiza",
  nombreCorto: "Suiza",
  bandera: "🇨🇭",
  moneda: { codigo: "CHF", simbolo: "CHF", porEuro: 0.94 },
  escalaRenta: 3.15,
  irpf: {
    modo: "escalas",
    nombre: "Federal + cantonal + municipal",
    escalas: [
      {
        id: "impot",
        nombre: "Impuesto federal + cantonal (referencia Zúrich)",
        // Suiza no tiene una escala única: cada cantón y cada municipio
        // pone la suya. Estos tramos reproducen el tipo medio de un
        // soltero en la ciudad de Zúrich, que queda a mitad de tabla.
        tramos: [
          { desde: 0, tipo: 0 },
          { desde: 15_000, tipo: 0.07 },
          { desde: 30_000, tipo: 0.13 },
          { desde: 50_000, tipo: 0.19 },
          { desde: 80_000, tipo: 0.25 },
          { desde: 120_000, tipo: 0.31 },
          { desde: 200_000, tipo: 0.35 },
          { desde: 350_000, tipo: 0.38 },
        ],
      },
    ],
  },
  cotizacionesTrabajador: [
    { id: "avs", nombre: "AVS/AI/APG", tipo: 0.053 },
    { id: "ac", nombre: "Seguro de paro (AC)", tipo: 0.011, hasta: 148_200 },
    { id: "lpp", nombre: "2.º pilar (LPP)", tipo: 0.065, desde: 25_725, hasta: 90_720 },
    { id: "laa", nombre: "Accidentes no laborales (LAA)", tipo: 0.01, hasta: 148_200 },
  ],
  cotizacionesEmpresa: [
    { id: "avs", nombre: "AVS/AI/APG", tipo: 0.053 },
    { id: "ac", nombre: "Seguro de paro (AC)", tipo: 0.011, hasta: 148_200 },
    { id: "lpp", nombre: "2.º pilar (LPP)", tipo: 0.075, desde: 25_725, hasta: 90_720 },
    { id: "laa", nombre: "Accidentes laborales (LAA)", tipo: 0.01 },
    { id: "af", nombre: "Asignaciones familiares", tipo: 0.018 },
  ],
  iva: {
    nombre: "MWST",
    tipo: 8.1,
    eficiencia: 0.58,
    nota: "IVA suizo del 8,1 %, el más bajo de Europa · 2,6 % en alimentos",
  },
  especialesFactor: 0.9,
  otros: {
    bajo: 0.8,
    medio: 0.9,
    alto: 1.1,
    nota: "Impuesto sobre el patrimonio cantonal, tasas municipales y canon",
  },
  inflacion: { anio: 2025, pct: 0.2, fuente: "OFS" },
  recaudacion: {
    totalMillones: 200_000,
    etiqueta: "Impuestos de Confederación + cantones + municipios",
  },
  cuotaImpuestosDecilPct: CONCENTRACION_MEDIA,
  notas: [
    "NO incluye el seguro médico obligatorio, que en Suiza se paga por cabeza y no por renta: del orden de 4.800 CHF al año por adulto.",
    "La escala es la de Zúrich ciudad; entre el cantón más caro y el más barato hay más de 15 puntos de diferencia.",
    "Sin impuesto religioso ni deducciones por 3.er pilar (hasta 7.258 CHF), que casi todo el mundo usa.",
  ],
};

/** Todos los países, en orden alfabético: es el orden del desplegable. */
export const PAISES_FISCALES: readonly PaisFiscal[] = [
  ALEMANIA,
  AUSTRALIA,
  EEUU_NY,
  EEUU_TEXAS,
  ESPANA,
  FINLANDIA,
  IRLANDA,
  POLONIA,
  REINO_UNIDO,
  SUECIA,
  SUIZA,
];

export const PAIS_POR_DEFECTO = "es";

export function getPais(id: string): PaisFiscal {
  return PAISES_FISCALES.find((p) => p.id === id) ?? ESPANA;
}

/**
 * Tipo efectivo de IVA sobre el consumo en España, que es el ancla con la
 * que se escala la tabla de deciles del resto de países.
 */
export const IVA_EFECTIVO_ES = ESPANA.iva.tipo * ESPANA.iva.eficiencia;

/** Cuánto pesa el IVA de un país frente al español (España = 1). */
export function factorIva(pais: PaisFiscal): number {
  return (pais.iva.tipo * pais.iva.eficiencia) / IVA_EFECTIVO_ES;
}

/** Redondeo «bonito» a dos cifras significativas para los botones de ejemplo. */
function redondearEjemplo(valor: number): number {
  const magnitud = Math.pow(10, Math.max(0, Math.floor(Math.log10(valor)) - 1));
  return Math.round(valor / magnitud) * magnitud;
}

/** Rentas de ejemplo del país: la escalera española llevada a su nivel. */
export function ejemplosDePais(pais: PaisFiscal): { label: string; valor: number }[] {
  return [15_000, 25_000, 35_000, 50_000, 80_000, 120_000].map((base) => {
    const valor = redondearEjemplo(base * pais.escalaRenta);
    return {
      valor,
      label: `${valor.toLocaleString("es-ES")} ${pais.moneda.simbolo}`,
    };
  });
}

/** Formatea un importe en la moneda del país, sin decimales. */
export function fmtMoneda(n: number, moneda: MonedaPais): string {
  return `${Math.round(n).toLocaleString("es-ES")} ${moneda.simbolo}`;
}

/** Convierte de la moneda de un país a la de otro pasando por el euro. */
export function convertirMoneda(
  importe: number,
  desde: MonedaPais,
  hasta: MonedaPais,
): number {
  return (importe / desde.porEuro) * hasta.porEuro;
}
