/**
 * Datos curados del sistema público de pensiones en España.
 *
 * No salen de una API en vivo: se han seleccionado a mano a partir de
 * comunicaciones oficiales (Seguridad Social / Ministerio de Inclusión),
 * AIReF y resúmenes de EpData. El objetivo es una radiografía legible, no
 * un panel de control en tiempo real: por eso cada bloque lleva su
 * referencia temporal y un matiz de aproximación cuando el dato se
 * redondea para la lectura.
 *
 * Si se actualizan, hay que revisar a la vez los textos de PanelPensiones
 * que citan las mismas cifras en prosa.
 */

import { ASALARIADOS_TRAMOS, HUECO_FISCAL, RECAUDACION_2025 } from "./fiesta-data";

export type FuenteDato = {
  etiqueta: string;
  url?: string;
};

export const FUENTES: Record<string, FuenteDato> = {
  segSocial: {
    etiqueta: "Seguridad Social / Ministerio de Inclusión",
    url: "https://www.inclusion.gob.es",
  },
  airef: {
    etiqueta: "AIReF — regla de gasto y sostenibilidad",
    url: "https://www.airef.es",
  },
  integraSS: {
    etiqueta: "INTegraSS (proyecciones del Ministerio)",
  },
  epdata: {
    etiqueta: "EpData (agregación de series oficiales)",
    url: "https://www.epdata.es/datos/pensiones-graficos-datos/20/espana/106",
  },
};

/**
 * Instantánea principal: nómina de julio de 2026.
 * Fuente: nota Inclusión / SS 28/07/2026 (La Moncloa): 10.517.634 pensiones,
 * nómina 14.431,9 M€, media 1.372,2 €, jubilación 1.573,7 €.
 */
export const INSTANTANEA = {
  periodo: "Julio 2026",
  periodoCorto: "jul. 2026",
  pensiones: 10_517_634,
  pensionistas: 9_510_000,
  nominaMensualMillones: 14_431.9,
  pensionMedia: 1_372.2,
  jubilacionMedia: 1_573.7,
  /**
   * Afiliados medios de julio de 2026 (nota de afiliación del 04/08/2026:
   * 22.508.065, primer mes por encima de los 22,5 millones).
   */
  afiliadosAprox: 22_508_065,
  /** Ratio bruto afiliados / pensionistas: 22,51 / 9,51 ≈ 2,4. */
  ratioCotizantes: 2.4,
} as const;

/**
 * Cierre del ejercicio 2025.
 *
 * Gasto en pensiones contributivas: 189.598 M€ — récord de la serie y +6,2 %
 * sobre los 178.500 M€ de 2024. Se descompone en 162.985 M€ de nóminas
 * mensuales más 26.413 M€ de las dos pagas extra (junio y noviembre).
 *
 * Comprobación de coherencia con la nómina: 162.985 / 12 ≈ 13.582 M€ de media
 * mensual, por debajo de los 13.750,1 M€ de diciembre (la nómina crece a lo
 * largo del año). Cualquier cifra anual por debajo de ~184.000 M€ sería
 * incompatible con esta serie.
 *
 * Revalorización general 2025: +2,8 % IPC.
 */
export const ANUAL_2025 = {
  gastoContributivoMillones: 189_598,
  nominaDiciembreMillones: 13_750.1,
  pensionesDiciembre: 10_434_856,
  pensionistasDiciembre: 9_400_000,
  pensionMediaDiciembre: 1_317.7,
  jubilacionMediaDiciembre: 1_512.7,
  viudedadMediaDiciembre: 937.6,
  revalorizacionIpc: 2.8,
} as const;

/**
 * Desglose de la nómina de diciembre de 2025 por clase.
 * Importes en millones de euros; pensiones en unidades.
 * Fuente: nota de la Seguridad Social (26/12/2025).
 *
 * Los recuentos de jubilación y viudedad se derivan de importe/media en vez de
 * redondearse a la centena de mil: así el desglose reproduce los agregados.
 * Comprobaciones: los importes suman 13.750,2 ≈ `nominaDiciembreMillones` y los
 * recuentos suman 10.435.176 ≈ `pensionesDiciembre` (±320, ruido de redondear
 * las medias a un decimal).
 */
export const POR_CLASE = [
  {
    id: "jubilacion",
    nombre: "Jubilación",
    pensiones: 6_646_658,
    importeMillones: 10_054.1,
    media: 1_512.7,
    color: "#c9a86a",
    /** Contraste sobre el dorado para rótulos dentro del tramo. */
    tinta: "#0d1626",
  },
  {
    id: "viudedad",
    nombre: "Viudedad",
    pensiones: 2_349_616,
    importeMillones: 2_203.0,
    media: 937.6,
    color: "#3f80bd",
    tinta: "#0d1626",
  },
  {
    id: "incapacidad",
    nombre: "Incapacidad permanente",
    pensiones: 1_054_935,
    importeMillones: 1_278.7,
    media: 1_212.0,
    color: "#a9576f",
    tinta: "#ffffff",
  },
  {
    id: "orfandad",
    nombre: "Orfandad",
    pensiones: 337_183,
    importeMillones: 177.7,
    media: 527.0,
    color: "#5a9e7a",
    tinta: "#0d1626",
  },
  {
    id: "favor",
    nombre: "En favor de familiares",
    pensiones: 46_784,
    importeMillones: 36.7,
    media: 784.0,
    color: "#7a6a9a",
    tinta: "#ffffff",
  },
] as const;

export type ClasePension = (typeof POR_CLASE)[number];

/**
 * Desglose por clases de la nómina vigente (julio de 2026), de la misma nota
 * que `INSTANTANEA`: jubilación 10.589,3 M€ (73,4 % de la nómina) y media de
 * 1.573,7 €; viudedad 2.287,7 M€ y media de 975,7 €; incapacidad permanente
 * 1.330,6 M€; orfandad 185,7 M€ y 336.294 pensiones; favor de familiares
 * 38,7 M€ y 46.895 pensiones.
 *
 * Va aparte de `POR_CLASE` a propósito: aquel es el cierre de diciembre de
 * 2025 y sostiene el gráfico del año cerrado; este es la foto de hoy y es el
 * que tiene que cuadrar con la nómina de `INSTANTANEA`.
 *
 * La nota redondea los recuentos de jubilación, viudedad e incapacidad, así
 * que se derivan: los dos primeros de importe/media —que sí son exactos— y el
 * tercero como residuo, para que los cinco sumen exactamente
 * `INSTANTANEA.pensiones`. Comprobación de importes: 10.589,3 + 2.287,7 +
 * 1.330,6 + 185,7 + 38,7 = 14.432,0 ≈ 14.431,9 M€ (±0,1 de redondeo).
 */
export const INSTANTANEA_POR_CLASE = (() => {
  const jubilacion = {
    id: "jubilacion",
    nombre: "Jubilación",
    importeMillones: 10_589.3,
    media: INSTANTANEA.jubilacionMedia,
    pensiones: Math.round((10_589.3 * 1e6) / INSTANTANEA.jubilacionMedia),
  };
  const viudedad = {
    id: "viudedad",
    nombre: "Viudedad",
    importeMillones: 2_287.7,
    media: 975.7,
    pensiones: Math.round((2_287.7 * 1e6) / 975.7),
  };
  const orfandad = {
    id: "orfandad",
    nombre: "Orfandad",
    importeMillones: 185.7,
    pensiones: 336_294,
    media: (185.7 * 1e6) / 336_294,
  };
  const favor = {
    id: "favor",
    nombre: "En favor de familiares",
    importeMillones: 38.7,
    pensiones: 46_895,
    media: (38.7 * 1e6) / 46_895,
  };
  const incapacidadPensiones =
    INSTANTANEA.pensiones -
    jubilacion.pensiones -
    viudedad.pensiones -
    orfandad.pensiones -
    favor.pensiones;
  const incapacidad = {
    id: "incapacidad",
    nombre: "Incapacidad permanente",
    importeMillones: 1_330.6,
    pensiones: incapacidadPensiones,
    media: (1_330.6 * 1e6) / incapacidadPensiones,
  };
  return [jubilacion, viudedad, incapacidad, orfandad, favor] as const;
})();

/**
 * Evolución reciente del gasto anual en pensiones contributivas (M€).
 * 2020–2022 son órdenes de magnitud; 2023–2025 están cerrados.
 * El último punto debe coincidir con `ANUAL_2025.gastoContributivoMillones`.
 */
export const GASTO_ANUAL = [
  { anio: 2020, millones: 144_000, nota: "aprox." },
  { anio: 2021, millones: 151_000, nota: "aprox." },
  { anio: 2022, millones: 160_000, nota: "aprox." },
  { anio: 2023, millones: 168_000, nota: null },
  { anio: 2024, millones: 178_500, nota: null },
  {
    anio: 2025,
    millones: ANUAL_2025.gastoContributivoMillones,
    nota: null,
  },
] as const;

/**
 * Proyecciones de gasto en pensiones sobre PIB.
 * AIReF (estudio evaluación regla de gasto, mayo 2026: pico 16,4 % en 2050)
 * e INTegraSS (Ministerio: pico 15,3 % en 2050).
 * Puntos intermedios interpolados de forma divulgativa para el gráfico;
 * los hitos con `oficial: true` son los que citan las fuentes.
 */
export const PROYECCION_PIB = {
  airef: [
    { anio: 2023, pct: 12.9, oficial: true },
    { anio: 2030, pct: 14.0, oficial: false },
    { anio: 2040, pct: 15.4, oficial: false },
    { anio: 2050, pct: 16.4, oficial: true },
    { anio: 2060, pct: 15.0, oficial: false },
    { anio: 2070, pct: 14.0, oficial: false },
  ],
  ministerio: [
    { anio: 2023, pct: 12.9, oficial: true },
    { anio: 2030, pct: 13.5, oficial: false },
    { anio: 2040, pct: 14.6, oficial: false },
    { anio: 2050, pct: 15.3, oficial: true },
    { anio: 2060, pct: 14.2, oficial: false },
    { anio: 2070, pct: 13.4, oficial: false },
  ],
} as const;

/**
 * ¿Qué parte del esfuerzo fiscal (impuestos + cotizaciones) se come la nómina
 * de pensiones, y cómo sube ese peso según la trayectoria AIReF del gasto/PIB?
 *
 * Método (divulgativo, no un acta de Hacienda):
 *  1. Ancla oficial: gasto en pensiones / PIB (serie AIReF en PROYECCION_PIB).
 *  2. Presión fiscal total (impuestos + cotizaciones SS) ≈ 38 % del PIB en
 *     España (orden de magnitud OCDE / Eurostat; se mantiene constante en la
 *     proyección para aislar el efecto pensiones).
 *  3. % de ese esfuerzo que va a pensiones ≈ (gasto pensiones / PIB) ÷ 0,38.
 *
 * Instantánea en euros: gasto contributivo 2025 vs recaudación AEAT 2025 +
 * cotizaciones SS (orden de magnitud) — para aterrizar el % en cajas reales.
 *
 * Fuentes: AIReF (regla de gasto / sostenibilidad), AEAT (recaudación),
 * Seguridad Social (gasto contributivo), OCDE/Eurostat (presión fiscal).
 */
const PIB_2025_MILLONES = 1_687_152;
const PRESION_FISCAL_PCT_PIB = 38;
const GASTO_PENSIONES_PCT_PIB = 13.0;

/**
 * Peso en las retenciones del trabajo de los tramos por debajo de 50.000 €.
 * Se suma de `ASALARIADOS_TRAMOS` en vez de escribir el 60 a mano, para que
 * no se descuadre si allí se actualizan los tramos.
 */
const IRPF_HASTA_50K_PCT = ASALARIADOS_TRAMOS.filter(
  (t) => t.id === "bajo" || t.id === "medio",
).reduce((s, t) => s + t.retencionesPct, 0);

/** Salario anual a partir del cual se empieza a retener (SMI 2025, 14 pagas). */
const UMBRAL_RETENCION_EUROS = 15_876;

/**
 * Lo mismo, pero cortando en 25.000 €. Aquí hay una estimación de por medio y
 * conviene saberlo: la AEAT publica los tramos en múltiplos del SMI y no corta
 * en esa cifra, así que el subtramo 20.000–25.000 € hay que sacarlo de dentro
 * del tramo «medio» (20.000–50.000 €) con dos supuestos:
 *
 *  1. asalariados repartidos de forma uniforme por renta dentro del tramo;
 *  2. retención proporcional a lo que excede del umbral en que se empieza a
 *     retener, que es el proxy más simple de la progresividad.
 *
 * Con eso el subtramo se lleva ~5,8 % de las retenciones del tramo medio y el
 * total de los sueldos por debajo de 25.000 € queda en ~14,8 %. Los tipos
 * marginales suben con la renta, así que el reparto lineal le asigna de más:
 * es una cota alta, igual que el dato de 50.000 €.
 */
const IRPF_HASTA_25K_PCT = (() => {
  const bajo = ASALARIADOS_TRAMOS.find((t) => t.id === "bajo")!;
  const medio = ASALARIADOS_TRAMOS.find((t) => t.id === "medio")!;
  // Masa retenida de un intervalo: renta media sobre el umbral × nº de rentas
  // (uniforme ⇒ proporcional a la anchura del intervalo).
  const masa = (desde: number, hasta: number) =>
    ((desde + hasta) / 2 - UMBRAL_RETENCION_EUROS) * (hasta - desde);
  const cuotaSubtramo = masa(20_000, 25_000) / masa(20_000, 50_000);
  return (
    Math.round((bajo.retencionesPct + medio.retencionesPct * cuotaSubtramo) * 10) /
    10
  );
})();

export const PESO_FISCAL_PENSIONES = {
  /**
   * Impuestos + cotizaciones como % del PIB (presión fiscal total, redondeo
   * de lectura; España ronda el alto 30–40 % según definición OCDE).
   */
  presionFiscalPctPib: PRESION_FISCAL_PCT_PIB,
  actual: {
    anioGasto: 2025,
    anioImpuestos: 2025,
    /** PIB nominal 2025 (INE, Contabilidad Nacional Trimestral, 4T 2025). */
    pibMillones: PIB_2025_MILLONES,
    /**
     * Ojo al universo, que es donde estaba el descuadre:
     *
     * · `gastoContributivoMillones` son SOLO las contributivas que paga la
     *   Seguridad Social (189.598 M€ = 11,2 % del PIB).
     * · `gastoPctPib` (13 %) es el agregado que usa AIReF: contributivas +
     *   clases pasivas + no contributivas. Es el que hay que usar para el
     *   porcentaje, porque es el que continúa en PROYECCION_PIB.
     *
     * Mezclarlos daba dos respuestas distintas a la misma pregunta. Ahora los
     * euros del agregado se derivan del PIB, así que el % en euros y el % del
     * modelo coinciden por construcción (13 / 38 = 34,2 %).
     */
    gastoContributivoMillones: ANUAL_2025.gastoContributivoMillones,
    gastoPctPib: GASTO_PENSIONES_PCT_PIB,
    gastoPensionesMillones: Math.round(
      (PIB_2025_MILLONES * GASTO_PENSIONES_PCT_PIB) / 100,
    ),
    /** Impuestos + cotizaciones de todas las administraciones. */
    esfuerzoFiscalMillones: Math.round(
      (PIB_2025_MILLONES * PRESION_FISCAL_PCT_PIB) / 100,
    ),
    /**
     * Las dos cajas observadas más grandes, para enseñar de dónde sale.
     * No suman `esfuerzoFiscalMillones` y no deben presentarse como si lo
     * hicieran: la AEAT solo recauda en territorio de régimen común y quedan
     * fuera haciendas forales, tributos autonómicos y locales.
     */
    recaudacionAeatMillones: 325_356,
    /**
     * Cuota del IRPF del ejercicio, la caja individual más grande de la AEAT.
     * Es la vara de medir de la barra del simulador: sobre la recaudación
     * total, mover la nómina un 10 % apenas movía la barra, y el IRPF es
     * además el impuesto que el lector reconoce en su nómina.
     *
     * Ojo al leerlo: las contributivas se pagan con cotizaciones, no con
     * IRPF. La barra no dice que salgan de ahí, dice a cuánto IRPF equivale
     * la diferencia.
     */
    irpfMillones: RECAUDACION_2025.irpfMillones,
    /**
     * La parte de ese IRPF que ponen las rentas bajas y medias: los tramos de
     * retribución por debajo de 50.000 € (`ASALARIADOS_TRAMOS`, AEAT sobre
     * rentas del trabajo). Son el {@link IRPF_HASTA_50K_PCT} % de las
     * retenciones y el 82 % de los asalariados.
     *
     * El porcentaje es de RETENCIONES DEL TRABAJO y se aplica al IRPF entero,
     * que además incluye capital y actividades económicas. Como esas rentas
     * se concentran arriba, esto es una cota alta de lo que pone el tramo
     * bajo-medio: sirve de orden de magnitud, no de liquidación.
     */
    irpfHasta50kMillones: Math.round(
      (RECAUDACION_2025.irpfMillones * IRPF_HASTA_50K_PCT) / 100,
    ),
    irpfHasta50kPct: IRPF_HASTA_50K_PCT,
    /**
     * Y la caja más pequeña de las tres: los sueldos por debajo de 25.000 €.
     * Mismo tratamiento y mismas cautelas que el dato de 50.000 €, con el
     * añadido de que el corte no es un tramo publicado sino una estimación
     * dentro del tramo medio ({@link IRPF_HASTA_25K_PCT}).
     */
    irpfHasta25kMillones: Math.round(
      (RECAUDACION_2025.irpfMillones * IRPF_HASTA_25K_PCT) / 100,
    ),
    irpfHasta25kPct: IRPF_HASTA_25K_PCT,
    /** Umbral usado en esa estimación, para poder contarlo en el método. */
    umbralRetencionEuros: UMBRAL_RETENCION_EUROS,
    /**
     * Cotizaciones a la Seguridad Social (orden de magnitud anual). La
     * ejecución presupuestaria a noviembre de 2025 iba por 162.032 M€ (+6,9 %
     * interanual), así que el año cierra en el entorno de 177.000 M€.
     * No es un cierre contable fino: sirve para no comparar pensiones solo
     * con la AEAT (la nómina sale sobre todo de cotizaciones).
     */
    cotizacionesSsMillones: 177_000,
  },
  fuentes: [
    {
      etiqueta: "AIReF — gasto en pensiones / PIB y regla de gasto",
      url: "https://www.airef.es",
    },
    {
      etiqueta: "AEAT — Informe anual de recaudación tributaria 2025",
      url: "https://sede.agenciatributaria.gob.es",
    },
    {
      etiqueta: "INE — Contabilidad Nacional Trimestral (PIB nominal 2025)",
      url: "https://www.ine.es",
    },
    {
      etiqueta: "Seguridad Social — gasto contributivo 2025",
      url: "https://www.inclusion.gob.es",
    },
    {
      etiqueta: "OCDE / Eurostat — presión fiscal (impuestos + cotizaciones)",
      url: "https://www.oecd.org/tax/tax-policy/revenue-statistics.htm",
    },
  ],
} as const;

/** Serie proyectada: % del esfuerzo fiscal (impuestos + cotiz.) → pensiones. */
export const PESO_FISCAL_PROYECCION = PROYECCION_PIB.airef.map((p) => ({
  anio: p.anio,
  gastoPctPib: p.pct,
  oficial: p.oficial,
  /** (gasto/PIB) / presión fiscal ≈ parte del esfuerzo que se va a pensiones. */
  pctEsfuerzoFiscal: Math.round(
    (p.pct / PESO_FISCAL_PENSIONES.presionFiscalPctPib) * 1000,
  ) / 10,
})) as readonly {
  anio: number;
  gastoPctPib: number;
  oficial: boolean;
  pctEsfuerzoFiscal: number;
}[];

/** Ratio cotizantes/pensionistas a lo largo del tiempo (aprox. divulgativa). */
export const RATIO_HISTORICO = [
  { anio: 1980, ratio: 3.8 },
  { anio: 1990, ratio: 2.9 },
  { anio: 2000, ratio: 2.5 },
  { anio: 2010, ratio: 2.4 },
  { anio: 2015, ratio: 2.2 },
  { anio: 2020, ratio: 2.2 },
  { anio: 2025, ratio: 2.3 },
  { anio: 2026, ratio: 2.4 },
] as const;

/**
 * Proyección orientativa del ratio afiliados/pensionistas desde el ancla
 * actual (2026) hasta 2070. No es una serie oficial punto a punto: se
 * alinea con el orden de magnitud que manejan AIReF / BdE / notas públicas
 * («menos de 2 cotizantes por pensionista hacia 2050», cresta demográfica
 * a mitad de siglo y alivio relativo después). El gráfico la pinta con
 * trazo de puntos para no confundirla con el histórico.
 *
 * El primer punto repite 2026 para empalmar con RATIO_HISTORICO.
 */
export const RATIO_PROYECCION = [
  { anio: 2026, ratio: 2.4, oficial: true },
  { anio: 2030, ratio: 2.2, oficial: false },
  { anio: 2040, ratio: 1.9, oficial: false },
  /** Orden de magnitud AIReF/BdE: por debajo de 2 hacia 2050. */
  { anio: 2050, ratio: 1.7, oficial: true },
  { anio: 2060, ratio: 1.75, oficial: false },
  { anio: 2070, ratio: 1.85, oficial: false },
] as const;

/** Brecha de género en la pensión media (julio 2026, EpData). */
export const BRECHA_GENERO = {
  hombres: 1_636.06,
  mujeres: 1_136.42,
  periodo: "Julio 2026",
} as const;

/**
 * Edad ordinaria de jubilación y años de cotización (régimen general, 2026).
 * Se simplifica: la edad efectiva media de alta es inferior por jubilaciones
 * anticipadas y demoradas.
 *
 * Calendario de la transición (los dos valores van del brazo, no sueltos):
 *   · 2026 → 66 años y 10 meses, salvo con 38 años y 3 meses cotizados o más.
 *   · 2027 → 67 años, salvo con 38 años y 6 meses cotizados o más.
 * `edadPlena` es el destino del calendario (67 desde 2027) y es la que se usa
 * para proyectar el año de jubilación del lector, que siempre cae en 2027+.
 */
export const REGLAS_JUBILACION = {
  /** 66 años y 10 meses: edad ordinaria vigente en 2026. */
  edadOrdinaria: 66 + 10 / 12,
  /** Años cotizados que en 2026 permiten jubilarse a los 65: 38 años y 3 meses. */
  aniosCotizacionPlena: 38.25,
  /** Régimen ya maduro, vigente desde 2027. */
  edadPlena: 67,
  aniosCotizacionPlena2027: 38.5,
  periodoCalculoAnios: 25,
  pagasAnuales: 14,
} as const;

/** «66 a. 10 m.» a partir de una edad decimal, para rótulos. */
export function formatEdadAniosMeses(edad: number): string {
  const anios = Math.floor(edad + 1e-9);
  const meses = Math.round((edad - anios) * 12);
  if (meses === 0) return `${anios} años`;
  return `${anios} a. ${meses} m.`;
}

/** Hitos del calendario demográfico que explican la presión 2025–2050. */
export const HITOS_DEMOGRAFICOS = [
  {
    anio: "2025–2030",
    anioDesde: 2025,
    anioHasta: 2030,
    titulo: "Entrada del baby boom",
    texto: "Las cohortes nacidas a finales de los 50 y en los 60 empiezan a jubilarse en masa. Más altas, con pensiones medias más altas que las que salen del sistema.",
  },
  {
    anio: "2030–2045",
    anioDesde: 2030,
    anioHasta: 2045,
    titulo: "Pico de presión",
    texto: "El número de pensionistas crece más deprisa que el de cotizantes. Es la ventana en la que las proyecciones sitúan el máximo de gasto sobre el PIB.",
  },
  {
    anio: "2045–2055",
    anioDesde: 2045,
    anioHasta: 2055,
    titulo: "Cresta y meseta",
    texto: "AIReF e INTegraSS sitúan el pico de gasto en torno a 2050. Después, las cohortes más pequeñas empiezan a aliviar la ratio.",
  },
  {
    anio: "2055–2070",
    anioDesde: 2055,
    anioHasta: 2070,
    titulo: "Alivio demográfico relativo",
    texto: "Si se cumplen las hipótesis de empleo, productividad y migración, el gasto sobre PIB baja del pico aunque el sistema siga siendo grande en euros.",
  },
] as const;

/**
 * Hero de portada de la sección: el dato más visceral.
 * ~14.432 M€ / 30 días ≈ 481 M€ al día natural.
 */
export const HERO_PENSIONES = {
  millonesDia: 481,
  nominaMensualMillones: INSTANTANEA.nominaMensualMillones,
  periodo: INSTANTANEA.periodo,
  etiqueta: "millones de euros cada día en pensiones",
  sub:
    "La nómina de un solo mes supera los 14.400 M€. Es la partida social más grande del Estado: sale de cotizaciones (y transferencias) de quien trabaja hoy.",
} as const;

/**
 * Comparómetro irónico: un año de pensiones contributivas frente a
 * proyectos y partidas que sí suenan (públicas y privadas).
 *
 * Los importes de referencia son órdenes de magnitud redondeados (presupuestos
 * / costes públicos conocidos, fichajes, ticket medio). No son auditorías:
 * sirven para aterrizar la escala, no para un debate contable fino.
 *
 * AVISO DE MANTENIMIENTO: los remates de `punch` llevan el múltiplo escrito a
 * mano («~21 veces», «más de 850»). Están calibrados contra `anualMillones`
 * (189.598 M€). Si esa cifra cambia, hay que releerlos uno a uno: el campo
 * derivado `veces` de COMPARATIVA_VECES da el múltiplo real de cada ítem.
 */
/**
 * Déficit del conjunto de las administraciones públicas en 2025: 36.780 M€,
 * el 2,18 % del PIB (Hacienda/IGAE, cierre publicado el 31/03/2026). Es el
 * dato sin el gasto excepcional de la DANA; contándolo sube a 40.330 M€
 * (2,39 %). Se usa el primero porque es el que Hacienda presenta como cierre
 * comparable, y la diferencia no cambia el orden de magnitud.
 *
 * Sirve de vara de medir en el simulador: mover la nómina de pensiones un
 * punto se lee mucho mejor contra el agujero anual del Estado que contra
 * cifras abstractas.
 */
export const DEFICIT_2025 = {
  periodo: "2025",
  millones: 36_780,
  pctPib: 2.18,
  conDanaMillones: 40_330,
} as const;

export const COMPARATIVA_PENSIONES = {
  /** Gasto contributivo del ejercicio de referencia. */
  anualMillones: ANUAL_2025.gastoContributivoMillones,
  periodo: "2025",
  kicker: "El tamaño, en cosas que sí te suenan",
  titulo: "¿A qué equivale un año de pensiones?",
  intro: `${(ANUAL_2025.gastoContributivoMillones / 1000).toLocaleString("es-ES", { maximumFractionDigits: 1 })} mil millones de euros en doce meses. Es un número tan grande que se vuelve abstracto. Aquí lo traducimos a defensa, impuestos, AVE, hospitales y hasta fichajes de fútbol —con ironía, pero sin inventar ceros.`,
  items: [
    {
      id: "irpf",
      etiqueta: "Todo el IRPF de un año… y un tercio más",
      detalle: "Recaudación del impuesto de la renta (AEAT 2025)",
      millones: RECAUDACION_2025.irpfMillones,
      color: "#c9a86a",
      punch:
        "El impuesto estrella del Estado se queda a un tercio de cubrir la nómina anual de pensiones. Y eso que el IRPF es «el que paga la clase media».",
    },
    {
      id: "defensa",
      etiqueta: "Todo el gasto en defensa de España",
      detalle: "Criterio OTAN · 2,0 % del PIB (2025)",
      millones: referenciaGasto("defensa"),
      color: "#3f80bd",
      punch:
        "Un año de cheques ≈ cinco años y medio de ejércitos, fragatas y desfiles, y eso contando ya la subida al 2 % del PIB.",
    },
    {
      id: "sociedades",
      etiqueta: "Todo el Impuesto de Sociedades",
      detalle: "Lo que pagan las empresas en un año (AEAT 2025)",
      millones: RECAUDACION_2025.sociedadesMillones,
      color: "#5a9e7a",
      punch:
        "Si mañana el IS se multiplicara por cuatro… todavía no pagaría un año de pensiones. «Que paguen las empresas» no es un interruptor mágico.",
    },
    {
      id: "educacion",
      etiqueta: "Gasto público en educación",
      detalle: "Todas las administraciones y universidades (2024)",
      millones: referenciaGasto("educacion"),
      color: "#e9a05c",
      punch:
        "Dos cursos escolares y medio del país caben en un solo ejercicio de pensiones. Formar y jubilar no pesan lo mismo en la caja.",
    },
    {
      id: "ave",
      etiqueta: "AVE Madrid–Barcelona (coste del tramo)",
      detalle: "Inversión histórica redondeada del corredor",
      millones: 9_000,
      color: "#6b7a94",
      punch:
        "Podrías tender ~21 veces el AVE Madrid–Bcn… o pagar las pensiones de un año. El hormigón es caro; la nómina, otra galaxia.",
    },
    {
      id: "hospital",
      etiqueta: "Hospitales de 1.000 M€",
      detalle: "Cada uno ≈ un gran hospital terciario de libro",
      millones: 1_000,
      color: "#a9576f",
      punch:
        "Casi 190 hospitales de mil millones. O un año de pensiones. Elige: ladrillo para curar… o cheques que ya están firmados.",
    },
    {
      id: "fichaje",
      etiqueta: "El fichaje más caro del fútbol (~222 M€)",
      detalle: "Orden de magnitud del récord histórico (Neymar et al.)",
      millones: 222,
      color: "#c9a86a",
      punch:
        "Más de 850 Neymars. Te compras la Liga entera, la Champions y el merchandising… y la Seguridad Social sigue siendo el fichaje del siglo.",
    },
    {
      id: "iphone",
      etiqueta: "iPhones de 1.000 €",
      detalle: "Ticket redondo de un móvil de gama alta",
      millones: 0.001,
      color: "#3f80bd",
      punch:
        "Casi 190 millones de móviles: cuatro para cada habitante de España, y aún sobran para quejarte de que no hay stock.",
    },
  ],
} as const;

/**
 * Múltiplo real de cada ítem del comparómetro (cuántas veces cabe en un año
 * de pensiones). Es la fuente de verdad para revisar los remates escritos a
 * mano y lo que debe pintar cualquier componente que enseñe «×N».
 */
export const COMPARATIVA_VECES = COMPARATIVA_PENSIONES.items.map((item) => ({
  id: item.id,
  veces: COMPARATIVA_PENSIONES.anualMillones / item.millones,
}));

/**
 * Revalorizaciones anuales de las pensiones contributivas (IPC / IRP
 * según el marco vigente cada año). Cifras redondeadas de referencia.
 */
export const REVALORIZACION_ANUAL = [
  { anio: 2022, pct: 2.5, nota: "IRP / transición" },
  { anio: 2023, pct: 8.5, nota: "IPC · pico inflación" },
  { anio: 2024, pct: 3.8, nota: "IPC medio" },
  { anio: 2025, pct: 2.8, nota: "IPC medio" },
  { anio: 2026, pct: 2.8, nota: "IPC · orientativo" },
] as const;

/**
 * Tipo del Mecanismo de Equidad Intergeneracional (cotización adicional).
 * Escala prevista hasta el 1,2 % en 2029.
 */
export const MEI_ESCALA = [
  { anio: 2023, pct: 0.6 },
  { anio: 2024, pct: 0.7 },
  { anio: 2025, pct: 0.8 },
  { anio: 2026, pct: 0.9 },
  { anio: 2027, pct: 1.0 },
  { anio: 2028, pct: 1.1 },
  { anio: 2029, pct: 1.2 },
] as const;

/** Datos del bloque “seis datos” con cifras listas para gráficos. */
export const DATOS_CLAVE = [
  {
    id: "nomina-dia",
    titulo: "Casi 480 M€ al día",
    texto: "La nómina mensual de julio de 2026 (~14.400 M€) equivale a unos 480 millones de euros cada día natural. Es la partida social más grande del Estado.",
  },
  {
    id: "tres-cuartas",
    titulo: "3 de cada 4 euros, a jubilación",
    texto: "El 73 % de la nómina contributiva va a pensiones de jubilación. Viudedad es la segunda (≈16 %) e incapacidad permanente la tercera.",
  },
  {
    id: "doble-pension",
    titulo: "Más pensiones que personas",
    texto: "Hay ~10,5 M de pensiones y ~9,5 M de pensionistas: alrededor de uno de cada diez cobra dos prestaciones (p. ej. jubilación + viudedad).",
  },
  {
    id: "brecha",
    titulo: "500 € de brecha de género",
    texto: "La pensión media de los hombres supera en unos 500 € mensuales a la de las mujeres. Es el eco de carreras laborales más cortas e interrumpidas.",
  },
  {
    id: "revalorizacion",
    titulo: "Atadas al IPC",
    texto: "Desde la reforma de 2021–2023 las pensiones contributivas se revalorizan con la inflación media. Protege el poder de compra y eleva la factura cada enero.",
  },
  {
    id: "mei",
    titulo: "MEI: el colchón de cotización",
    texto: "El Mecanismo de Equidad Intergeneracional sube un poco la cotización para reforzar el sistema ante el pico demográfico, sin tocar la pensión actual.",
  },
] as const;

/** Comparación simple del “contrato” intergeneracional. */
export const FLUJO_SISTEMA = [
  {
    id: "cotizan",
    titulo: "Quien trabaja cotiza",
    detalle: "~22 M de afiliados",
    color: "#3f80bd",
  },
  {
    id: "cobran",
    titulo: "Quien tiene derecho cobra",
    detalle: "~9,5 M de pensionistas",
    color: "#a9576f",
  },
] as const;

/* ── Escala del gasto: pensiones frente a otras partidas ────────── */

/**
 * Prestaciones por desempleo (contributivas y asistenciales): gasto del SEPE
 * en el cierre de 2025, ~1.260 M€ más que en 2024 pese a haber menos parados.
 *
 * Se usa el gasto ejecutado y no el presupuesto inicial del SEPE (20.878 M€),
 * que se quedaba tres mil millones corto.
 *
 * Se suma a las pensiones porque la barra de comparación mide «lo que el
 * Estado paga en transferencias a personas», no solo la nómina de la
 * Seguridad Social. Dejarla fuera encogería la partida principal justo en la
 * comparación en la que su tamaño es el argumento.
 */
const DESEMPLEO_MILLONES = 24_400;

/**
 * Superávit primario de 2025: +3.534 M€ (0,21 % del PIB), el primero en 18
 * años. Fuente: nota de Hacienda del cierre de 2025 (31/03/2026).
 */
export const SUPERAVIT_PRIMARIO_2025_MILLONES = 3_534;

/**
 * Intereses de la deuda pública del conjunto de las administraciones.
 *
 * No hay que estimarlos ni buscar una cifra suelta: son exactamente la
 * distancia entre el saldo primario y el saldo total, que es lo que significa
 * «primario». 36.780 M€ de déficit + 3.534 M€ de superávit primario = 40.314
 * M€, un 2,39 % del PIB.
 *
 * Derivarlo tiene una ventaja sobre copiar el número: si alguien actualiza el
 * déficit y se olvida de esto, la cifra se mueve sola en vez de quedarse
 * mintiendo.
 *
 * No es una partida de servicio público —es lo que cuesta financiar lo ya
 * gastado— y por eso resulta útil verla al lado del resto.
 */
export const INTERESES_DEUDA_MILLONES =
  DEFICIT_2025.millones + SUPERAVIT_PRIMARIO_2025_MILLONES;

/**
 * Gasto político y Casa Real.
 *
 * Es el dato más discutible de toda la página, así que va con horquilla y con
 * el desglose a la vista. «Gasto político» no es una partida presupuestaria
 * sino una etiqueta, y cada estudio mete cosas distintas dentro:
 *
 * · Definición estrecha (`estrechoMillones`, suma de `partidas`): las
 *   instituciones representativas y los partidos. Se puede señalar con el
 *   dedo en un presupuesto publicado.
 * · Definición amplia (`amplioMillones`): además, altos cargos, personal
 *   eventual y asesores de las tres administraciones. Es una estimación, no
 *   una liquidación.
 *
 * Circulan cifras de decenas de miles de millones. No se usan aquí: cuentan
 * estructuras administrativas enteras —funcionarios incluidos— como si fueran
 * políticos, y entonces el número ya no mide lo que dice medir.
 *
 * La barra del gráfico se pinta con la cifra AMPLIA a propósito. Si el dato
 * admite discusión, que la comparación se haga con el número que más favorece
 * a la tesis de que el gasto político pesa; aun así cabe decenas de veces en
 * la factura de pensiones, que es justo lo que el gráfico enseña.
 */
const GASTO_POLITICO_PARTIDAS = [
  {
    id: "autonomicos",
    etiqueta: "Parlamentos autonómicos",
    millones: 430,
    nota: "Los 17, sumados. Última recopilación completa: 388 M€ en 2021",
  },
  {
    id: "cortes",
    etiqueta: "Congreso y Senado",
    millones: 260,
    nota: "Congreso 109 M€ + Senado 68 M€ + gastos comunes de las Cortes 83 M€ (2025)",
  },
  {
    /**
     * Solo la subvención estatal: 13,17 M€ por trimestre según las
     * resoluciones publicadas en el BOE, ~53 M€ al año, más los gastos de
     * seguridad.
     *
     * Las aportaciones a los grupos parlamentarios NO se suman aquí: ya van
     * dentro del presupuesto de las cámaras, y contarlas dos veces inflaría
     * justo la cifra que esta página pone bajo sospecha.
     */
    id: "partidos",
    etiqueta: "Financiación pública de partidos",
    millones: 60,
    nota: "Subvención estatal de funcionamiento (~53 M€, BOE) más gastos de seguridad",
  },
  {
    id: "casa-real",
    etiqueta: "Casa del Rey",
    millones: 8.4,
    nota: "Asignación en los PGE, congelada desde 2022. Sumando lo que aportan otros ministerios se estima un coste de ~105 M€",
  },
] as const;

export const GASTO_POLITICO = {
  periodo: "Órdenes de magnitud anuales",
  partidas: GASTO_POLITICO_PARTIDAS,
  /** Suma del desglose: lo que sí aparece en presupuestos publicados. */
  estrechoMillones: GASTO_POLITICO_PARTIDAS.reduce((s, p) => s + p.millones, 0),
  /** Con altos cargos, eventuales y asesores de las tres administraciones. */
  amplioMillones: 4_500,
} as const;

/** Importe de una referencia de gasto del bloque fiscal, por id. */
function referenciaGasto(id: string): number {
  const ref = HUECO_FISCAL.referencias.find((r) => r.id === id);
  if (!ref) throw new Error(`Falta la referencia de gasto «${id}»`);
  return ref.millones;
}

/**
 * Las barras de la comparación. Sanidad, educación y defensa se leen de
 * `HUECO_FISCAL.referencias` en vez de repetirse aquí: son las mismas cifras
 * que ya usa «¿Quién paga la fiesta?» y tener dos copias garantizaba que un
 * día dijeran cosas distintas.
 */
export const GASTO_COMPARADO = {
  kicker: "El tamaño, en su sitio",
  titulo: "Pensiones y prestaciones frente al resto del gasto",
  periodo: "Gasto anual · órdenes de magnitud",
  items: [
    {
      id: "pensiones",
      etiqueta: "Pensiones y prestaciones",
      etiquetaCorta: "Pensiones",
      millones:
        PESO_FISCAL_PENSIONES.actual.gastoPensionesMillones + DESEMPLEO_MILLONES,
      nota: `Todas las pensiones (~${GASTO_PENSIONES_PCT_PIB.toLocaleString("es-ES", { maximumFractionDigits: 1 })} % del PIB) más el desempleo`,
      anio: 2025,
      color: "#e7ce99",
      colorFondo: "#b28f3a",
      referencia: true,
    },
    {
      id: "sanidad",
      etiqueta: "Sanidad pública",
      etiquetaCorta: "Sanidad",
      millones: referenciaGasto("sanidad"),
      nota: "Todas las administraciones · 6,4 % del PIB",
      anio: 2024,
      color: "#7cc0a0",
      colorFondo: "#3f7a5c",
      referencia: false,
    },
    {
      id: "educacion",
      etiqueta: "Educación pública",
      etiquetaCorta: "Educación",
      millones: referenciaGasto("educacion"),
      nota: "Administraciones y universidades públicas",
      anio: 2024,
      color: "#e9a05c",
      colorFondo: "#b8763a",
      referencia: false,
    },
    {
      id: "intereses",
      etiqueta: "Intereses de la deuda",
      etiquetaCorta: "Deuda",
      millones: INTERESES_DEUDA_MILLONES,
      nota: "Lo que cuesta financiar lo ya gastado · 2,4 % del PIB",
      anio: 2025,
      color: "#8fa0bb",
      colorFondo: "#4d5a70",
      referencia: false,
    },
    {
      id: "defensa",
      etiqueta: "Defensa",
      etiquetaCorta: "Defensa",
      millones: referenciaGasto("defensa"),
      nota: "Criterio OTAN · 2,0 % del PIB",
      anio: 2025,
      color: "#5f9cd6",
      colorFondo: "#2e5f8d",
      referencia: false,
    },
    {
      id: "politico",
      etiqueta: "Gasto político y Casa Real",
      etiquetaCorta: "Político y Casa Real",
      millones: GASTO_POLITICO.amplioMillones,
      nota: "Estimación amplia: instituciones, partidos, altos cargos y asesores",
      anio: 2025,
      color: "#d08aa1",
      colorFondo: "#8c4459",
      referencia: false,
    },
  ],
  fuentes: [
    {
      etiqueta: "AIReF / INE — gasto en pensiones sobre el PIB",
      url: "https://www.airef.es",
    },
    {
      etiqueta: "SEPE — gasto en prestaciones por desempleo (cierre 2025)",
      url: "https://www.sepe.es",
    },
    {
      etiqueta: "Sanidad — Estadística de Gasto Sanitario Público 2024",
      url: "https://www.sanidad.gob.es",
    },
    {
      etiqueta: "Educación — Estadística del Gasto Público en Educación 2024",
      url: "https://www.educacionfpydeportes.gob.es",
    },
    {
      etiqueta: "Hacienda — cierre de 2025 (déficit y saldo primario) e informe anual de la OTAN",
      url: "https://www.hacienda.gob.es",
    },
    {
      etiqueta: "Cortes Generales, parlamentos autonómicos y Casa Real — presupuestos anuales",
      url: "https://www.congreso.es",
    },
  ],
} as const;

/* ── Ayudas y prestaciones de subsistencia ──────────────────────── */

/**
 * Qué parte del gasto del SEPE es asistencial y no contributiva.
 *
 * Sale del reparto de la nómina de diciembre de 2025 (2.107 M€): 1.455 de
 * prestación contributiva, 613,5 de subsidio por desempleo, 38,3 del subsidio
 * agrario de Andalucía y Extremadura y 0,6 de renta activa de inserción. Los
 * tres últimos son el nivel asistencial: 31,1 % del total.
 */
const DESEMPLEO_ASISTENCIAL_PCT = 31.1;

/**
 * Ayudas y prestaciones de subsistencia: el bloque que se invoca en el debate
 * sobre «ayudas a quien no trabaja» y «pagas a inmigrantes».
 *
 * Esta radiografía no opina sobre si deben existir ni sobre quién las cobra:
 * mide cuánto pesan al lado de las pensiones, que es una pregunta que tiene
 * respuesta numérica. Para que esa respuesta valga algo, hay tres reglas de
 * construcción que conviene leer antes de citar la cifra:
 *
 *  1. **No se cuenta nada dos veces.** Las pensiones no contributivas y los
 *     complementos a mínimos NO están aquí: ya van dentro del agregado de
 *     pensiones (el 13 % del PIB de `PESO_FISCAL_PENSIONES`). Sumarlas otra
 *     vez engordaría el bloque casi un tercio.
 *  2. **La prestación contributiva por desempleo tampoco está.** Se cobra por
 *     haber cotizado; es un seguro, no una ayuda de subsistencia. Solo entra
 *     el nivel asistencial.
 *  3. **«Ayudas a inmigrantes» no es una partida presupuestaria.** Lo que
 *     existe es el sistema de acogida de solicitantes de protección
 *     internacional, que sí está aquí con su importe. Las demás prestaciones
 *     de esta lista no se conceden por ser extranjero: el IMV, por ejemplo,
 *     exige residencia legal y efectiva en España durante al menos el año
 *     anterior (Ley 19/2021), con excepciones tasadas.
 *
 * Sanidad y educación quedan fuera a propósito: son servicios universales,
 * no transferencias de subsistencia, y meterlas convertiría el bloque en otra
 * cosa.
 */
const AYUDAS_PARTIDAS = [
  {
    id: "desempleo-asistencial",
    etiqueta: "Subsidios por desempleo",
    millones: Math.round((DESEMPLEO_MILLONES * DESEMPLEO_ASISTENCIAL_PCT) / 100),
    nota: "Nivel asistencial: subsidio, subsidio agrario y renta activa de inserción",
  },
  {
    id: "imv",
    etiqueta: "Ingreso Mínimo Vital",
    millones: 4_550,
    nota: "4.170 M€ de enero a noviembre de 2025, elevado al año",
  },
  {
    id: "otros-ss",
    etiqueta: "Otros subsidios no contributivos",
    millones: 2_150,
    nota: "Prestaciones familiares y demás subsidios no contributivos de la Seguridad Social",
  },
  {
    id: "rentas-minimas",
    etiqueta: "Rentas mínimas autonómicas",
    millones: 1_650,
    nota: "Gasto ejecutado por las comunidades (informe de 2023)",
  },
  {
    id: "acogida",
    etiqueta: "Acogida de protección internacional",
    millones: 980,
    nota: "Sistema estatal de acogida de solicitantes de asilo, parte con fondos europeos",
  },
] as const;

export const AYUDAS_SUBSISTENCIA = {
  periodo: "2025 · órdenes de magnitud",
  partidas: AYUDAS_PARTIDAS,
  totalMillones: AYUDAS_PARTIDAS.reduce((s, p) => s + p.millones, 0),
  /** Lo que se destina específicamente a acogida de solicitantes de asilo. */
  acogidaMillones:
    AYUDAS_PARTIDAS.find((p) => p.id === "acogida")?.millones ?? 0,
  fuentes: [
    {
      etiqueta: "Seguridad Social — ejecución presupuestaria 2025 (IMV y subsidios no contributivos)",
      url: "https://www.inclusion.gob.es",
    },
    {
      etiqueta: "SEPE — nómina de prestaciones por desempleo",
      url: "https://www.sepe.es",
    },
    {
      etiqueta: "Derechos Sociales — Informe de Rentas Mínimas de Inserción",
      url: "https://www.dsca.gob.es",
    },
    {
      etiqueta: "Inclusión / Migraciones — presupuesto del sistema de acogida",
      url: "https://www.inclusion.gob.es",
    },
  ],
} as const;
