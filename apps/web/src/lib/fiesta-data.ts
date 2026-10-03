/**
 * Datos curados sobre quién paga (y quién recibe) en el sistema fiscal español.
 *
 * Fuentes de referencia: AEAT (Informe anual de recaudación 2025, Estadística
 * de declarantes del IRPF), FEDEA (Observatorio sobre el reparto de impuestos
 * y prestaciones), notas de prensa de Hacienda y resúmenes de EpData/RTVE.
 *
 * DOS UNIVERSOS QUE NO SON EL MISMO (y que antes se comparaban a la ligera):
 *   · CONCENTRACION_IRPF y TRAMOS_FINOS van por deciles de DECLARANTES —el
 *     reparto clásico de AEAT: el top 10 % pone ~50 % de la cuota, el top 20 %
 *     ~66 %—. Solo cuentan a quien presenta declaración.
 *   · GRUPOS_RENTA, CARGA_AMPLIADA e IVA_POR_DECIL van por deciles de
 *     POBLACIÓN (48,6 M, niños incluidos). Sobre esa base el mismo tramo alto
 *     pone ~55 % del IRPF, no ~66 %: el denominador es otro.
 * Las dos lecturas son correctas; lo que no vale es cruzarlas en la misma
 * frase. Cada bloque dice de cuál habla.
 *
 * Cesta «justa» de referencia en toda la página:
 *   IRPF trabajo + IRPF capital + Sociedades (incidencia) + IVA (por decil).
 * La cesta sin IVA (solo trabajo + capital + IS) se conserva como contraste
 * porque concentra más el tramo alto (~60 % vs ~52 % con IVA).
 *
 * No es un simulador personal ni un panel en tiempo real: son órdenes de
 * magnitud redondeados para una lectura clara. Cuando se actualicen, hay que
 * revisar a la vez los textos de PanelFiesta que citan las mismas cifras.
 */

export type FuenteDato = {
  etiqueta: string;
  url?: string;
};

export const FUENTES: Record<string, FuenteDato> = {
  aeat: {
    etiqueta: "Agencia Tributaria (AEAT)",
    url: "https://sede.agenciatributaria.gob.es",
  },
  fedea: {
    etiqueta: "FEDEA — Observatorio impuestos y prestaciones",
    url: "https://fedea.net",
  },
  hacienda: {
    etiqueta: "Ministerio de Hacienda",
    url: "https://www.hacienda.gob.es",
  },
};

/**
 * Instantánea de recaudación tributaria (territorio de régimen común).
 * Corte: Informe anual AEAT ejercicio 2025 (total 325.356 M€, +10,4 % vs 2024).
 * Desglose IRPF 142.466 M€ (notas de cierre / IMR); resto escalado con las
 * tasas del resumen AEAT (IS +8,1 %, IVA +9,9 %, IIEE +4,3 %) y residual en
 * `otrosMillones`. El nombre export `RECAUDACION_2024` se mantiene por
 * compatibilidad de imports; el periodo real es `periodo`.
 */
export const RECAUDACION_2025 = {
  periodo: "2025",
  totalMillones: 325_356,
  irpfMillones: 142_466,
  ivaMillones: 99_460,
  sociedadesMillones: 42_263,
  especialesMillones: 24_511,
  otrosMillones: 16_656,
  /** IRPF como % de ingresos tributarios del Estado. */
  irpfPctTotal: 43.8,
  /** Declarantes aproximados de la campaña de Renta. */
  declarantesAprox: 23_500_000,
} as const;

/** Alias de compatibilidad: mismos datos que RECAUDACION_2025. */
export const RECAUDACION_2024 = RECAUDACION_2025;

/**
 * Inflación oficial del último año natural cerrado (INE, IPC general).
 *
 * `pct` es la MEDIA ANUAL, que es la cifra que el INE publica como «la
 * inflación de 2025». Se guarda también el interanual de diciembre porque es
 * el otro dato que se cita en prensa y conviene dejar explícito cuál se
 * enseña en pantalla.
 *
 * No es un impuesto legal: no lo recauda la AEAT ni sale en la nómina. Por eso
 * se muestra SUMADO APARTE y nunca dentro del total tributario: la pérdida de
 * poder adquisitivo por degradación monetaria detrae renta igual, pero
 * mezclarla con la cuña fiscal falsearía el %.
 *
 * Al cerrar un año nuevo: actualizar `anio`, `pct` y `pctInteranualDic`.
 */
export const INFLACION_OFICIAL = {
  anio: 2025,
  /** IPC medio anual 2025 (INE). */
  pct: 2.7,
  /** IPC interanual de diciembre 2025 (INE). */
  pctInteranualDic: 3.0,
  fuente: "INE",
} as const;

/**
 * Hueco fiscal: lo que se estima que no llega a la caja.
 *
 * Revisado en agosto de 2026 contra los estudios disponibles, porque las
 * cifras anteriores (55.000 de evasión y 30.000 atribuidos a grandes
 * patrimonios) venían de estimaciones sindicales que se citan mucho y se
 * comprueban poco. Lo que sostiene cada número ahora:
 *
 * · **Evasión** — FEDEA estimó la brecha del IRPF de 2022 entre 21.000 y
 *   51.000 M€, que bajan a 11.300–41.300 M€ después de descontar los ~10.000
 *   que la AEAT ya recupera con sus actuaciones de control. A eso se suma la
 *   brecha del IVA de los hogares, 9.428 M€ en 2022 según el mismo equipo.
 *   El punto que se usa aquí es el centro de esa horquilla, no su techo.
 *
 * · **Elusión** — Tax Justice Network publica DOS cifras para España y hay que
 *   coger la que toca: un acumulado de 31.000 M€ para 2016-2021 y una anual.
 *   Aquí manda la anual, porque todo este bloque está en términos de año:
 *   8.455 M€ de multinacionales más 935 M€ de grandes fortunas = 9.385 M€.
 *
 *   Este campo se ha equivocado ya en las dos direcciones: primero puso 8.000
 *   tomando el acumulado como si fuera anual, y al corregirlo se dividió ese
 *   acumulado entre seis años (5.500) cuando la cifra anual ya estaba
 *   publicada. Si el informe cambia, buscar la anual explícita; no prorratear.
 *
 * · **Grandes patrimonios y empresas** — aquí estaba el error de bulto. Se les
 *   atribuía casi la mitad del hueco. Ahora sale de sumar lo que sí tiene
 *   fuente: la elusión entera de TJN (multinacionales y grandes fortunas son,
 *   por definición, este grupo) más la parte de la brecha del IRPF que cae en
 *   capital mobiliario. Y esa parte es pequeña: FEDEA reparte la brecha por
 *   tipo de renta y manda actividades económicas y capital inmobiliario
 *   (46-61 %), luego el trabajo, y el capital mobiliario —la renta típica de
 *   una gran fortuna— queda el último «a considerable distancia».
 *
 * Nada de esto es un censo de Hacienda: la AEAT calcula su brecha fiscal por
 * dentro y no la publica (lo dice la OCDE). Son estimaciones académicas con
 * horquillas anchas, y por eso van con horquilla a la vista.
 *
 * REGLA DEL BLOQUE: **todo aquí es anual**. Es el error más fácil de cometer,
 * porque los informes de elusión suelen titular con acumulados de varios años
 * —quedan más impresionantes— y la cifra anual va enterrada dentro. Antes de
 * meter un número, comprobar a qué periodo se refiere.
 */
export const HUECO_FISCAL = {
  periodo: "Estimación anual · horquillas de estudios académicos",
  /**
   * IRPF neto (11.300-41.300, centro ~26.300) más la brecha del IVA de los
   * hogares (~9.400). Centro: ~35.700, que se redondea a 36.000.
   *
   * La horquilla resultante —20.700 a 50.700— cae casi encima del rango BRUTO
   * del IRPF que citan los titulares (21.000-51.000). Es una coincidencia, y
   * conviene saberlo: si alguien la lee como si fuera el bruto y luego le resta
   * el control de la AEAT, estará descontando dos veces lo mismo.
   */
  evasionMillones: 36_000,
  rangoEvasion: [21_000, 51_000] as const,
  /** TJN, cifra ANUAL: 8.455 M€ de multinacionales + 935 M€ de grandes fortunas. */
  elusionMillones: 9_400,
  rangoElusion: [7_000, 13_000] as const,
  /**
   * Elusión corporativa entera más la parte de la brecha del IRPF que cae en
   * capital mobiliario. Es la cifra con más incertidumbre de la página y la
   * que más se infla en el debate público, así que va con su horquilla.
   */
  grandesMillones: 11_000,
  rangoGrandes: [8_000, 15_000] as const,
  /**
   * De dónde sale realmente la brecha del IRPF, según FEDEA (2003-2022). Es
   * la respuesta a «¿quién se lo salta?», y no coincide con la intuición: el
   * grueso no está en las grandes fortunas sino en la renta que no pasa por
   * una nómina ni por un banco que retenga.
   */
  composicion: [
    {
      id: "actividades",
      etiqueta: "Actividades económicas y capital inmobiliario",
      pesoPct: "46-61 %",
      nota: "Autónomos, negocios y alquileres: donde no hay retención automática",
    },
    {
      id: "trabajo",
      etiqueta: "Rentas del trabajo",
      pesoPct: "el segundo",
      nota: "Menos margen: la nómina lleva retención en origen",
    },
    {
      id: "mobiliario",
      etiqueta: "Capital mobiliario",
      pesoPct: "el último",
      nota: "«A considerable distancia», dice el estudio. Dividendos e intereses van con retención y con información bancaria automática",
    },
  ],
  colorEvasion: "#a9576f",
  colorElusion: "#e9a05c",
  colorGrandes: "#8b5a9e",
  colorRecaudacion: "#3f80bd",
  /**
   * Referencias de gasto público para contestar «¿cuánto cubriría?».
   *
   * Cada una lleva su ejercicio porque no todas cierran a la vez: sanidad y
   * educación publican su estadística con año y medio de retraso, mientras que
   * defensa se mide sobre el PIB del año corriente. Mezclarlas sin decirlo
   * daría una foto falsamente homogénea.
   *
   * Son también la fuente única de estas cifras para la página de pensiones
   * (`GASTO_COMPARADO` y `COMPARATIVA_PENSIONES` las leen de aquí): había dos
   * copias y llegaron a decir cosas distintas.
   */
  referencias: [
    {
      id: "sociedades",
      etiqueta: "Impuesto de Sociedades recaudado",
      millones: RECAUDACION_2024.sociedadesMillones,
      nota: "Lo que sí entra por IS en un año",
    },
    {
      id: "educacion",
      etiqueta: "Gasto público en educación",
      millones: 71_349,
      nota: "Todas las administraciones y universidades públicas · 2024",
    },
    {
      id: "sanidad",
      etiqueta: "Gasto público en sanidad",
      millones: 101_739,
      nota: "Todas las administraciones · 6,4 % del PIB · 2024",
    },
    {
      /**
       * Criterio OTAN (2,0 % del PIB en 2025), no el presupuesto del
       * Ministerio de Defensa, que es menos de la mitad. Se elige el primero
       * porque es el que se debate en público cuando se habla de «lo que
       * España gasta en defensa».
       *
       * Tiene una consecuencia que hay que declarar donde se compare con
       * pensiones: el criterio OTAN incluye las clases pasivas militares, así
       * que una parte pequeña se cuenta en las dos partidas.
       */
      id: "defensa",
      etiqueta: "Gasto en defensa",
      millones: 33_743,
      nota: "Criterio OTAN · 2,0 % del PIB · 2025",
    },
  ],
} as const;

export const HUECO_FISCAL_TOTAL_MILLONES =
  HUECO_FISCAL.evasionMillones + HUECO_FISCAL.elusionMillones;

/** Fuentes del bloque, para citarlas en la propia página. */
export const HUECO_FISCAL_FUENTES = [
  {
    etiqueta: "FEDEA — brecha fiscal del IRPF, 2003-2022 (enero de 2026)",
    url: "https://fedea.net/la-brecha-fiscal-en-el-irpf-en-espana-2003-2022/",
  },
  {
    etiqueta: "FEDEA — brecha fiscal del IVA de los hogares",
    url: "https://fedea.net/la-brecha-fiscal-en-el-iva-de-los-hogares/",
  },
  {
    etiqueta: "Tax Justice Network — State of Tax Justice",
    url: "https://taxjustice.net",
  },
] as const;

/**
 * Concentración de la cuota del IRPF por tramos de renta.
 * Escenario orientativo alineado con la Estadística de declarantes y
 * resúmenes públicos habituales (top 10 % ≈ mitad de la cuota).
 *
 * UNIVERSO: deciles de DECLARANTES (~23,5 M), no de población. Es el reparto
 * que citan AEAT y la prensa. No es comparable con `GRUPOS_RENTA.cuotaIrpfPct`,
 * que va sobre los 48,6 M de habitantes.
 */
export const CONCENTRACION_IRPF = {
  periodo: "Ejercicio reciente (orientativo)",
  top1PctCuota: 18,
  top10PctCuota: 50,
  top20PctCuota: 66,
  mitadInferiorPctCuota: 8,
  /** Renta bruta orientativa a partir de la cual se entra en el top 10 %. */
  umbralTop10: 60_000,
  /** Renta bruta orientativa del percentil 99. */
  umbralTop1: 150_000,
} as const;

/**
 * Población residente de referencia (España) para traducir % de tramo
 * a millones de personas. Orden de magnitud INE; no un censo del año
 * fiscal de cada gráfico.
 */
export const POBLACION_ESPANA_MILLONES = 48.6;

/**
 * Quién es quién en la población (órdenes de magnitud INE / EPA / SS).
 * Partición didáctica y excluyente a propósito: un ocupado no se cuenta
 * también como «recibe prestación», aunque cobre un plus; un pensionista
 * que sigue trabajando en poca medida se simplifica. Sirve para anclar el
 * relato fiscal: no toda la población es cotizante, ni toda la que no
 * trabaja está «a cargo» del erario de la misma forma.
 *
 * «Trabajan» se desglosa en tres (suman el total de ocupados):
 *   · cuenta ajena privada · empleo público · autónomos / cuenta propia.
 * Los millones de los roles de primer nivel suman ~POBLACION_ESPANA_MILLONES.
 */
export type PoblacionParte = {
  readonly id: string;
  readonly nombre: string;
  readonly detalle: string;
  readonly millones: number;
  readonly color: string;
  readonly nota: string;
};

export type PoblacionRol = PoblacionParte & {
  /** Subpartes excluyentes que suman `millones` (solo en «trabajan»). */
  readonly partes?: readonly PoblacionParte[];
};

/**
 * Ocupados ~21,6 M (orden de magnitud; la EPA reciente ronda 22 M).
 * Desglose interno redondeado a décimas que suma 21,6:
 *   · ~14,7 M asalariados del sector privado
 *   · ~3,5 M asalariados del sector público (empleo público / «funcionarios»
 *     en sentido amplio EPA, no solo carrera)
 *   · ~3,4 M por cuenta propia (autónomos y similares)
 */
export const POBLACION_TRABAJAN_PARTES: readonly PoblacionParte[] = [
  {
    id: "cuenta-ajena",
    nombre: "Cuenta ajena (privado)",
    detalle: "Asalariados del sector privado",
    millones: 14.7,
    color: "#3f80bd",
    nota: "Mayor base de IRPF del trabajo y cotizaciones del régimen general",
  },
  {
    id: "publicos",
    nombre: "Empleo público",
    detalle: "Funcionarios y asalariados del sector público",
    millones: 3.5,
    color: "#5a9ec9",
    nota: "Nómina pública · EPA «sector público» (no solo funcionarios de carrera)",
  },
  {
    id: "autonomos",
    nombre: "Autónomos",
    detalle: "Por cuenta propia",
    millones: 3.4,
    color: "#2a5f8f",
    nota: "RETA y asimilados · cotización e IRPF distintos del asalariado",
  },
] as const;

const TRABAJAN_MILLONES = POBLACION_TRABAJAN_PARTES.reduce(
  (s, p) => s + p.millones,
  0,
);

export const POBLACION_ROLES: readonly PoblacionRol[] = [
  {
    id: "trabajan",
    nombre: "Trabajan",
    detalle: "Ocupados (EPA) · desglose abajo",
    millones: TRABAJAN_MILLONES,
    color: "#3f80bd",
    nota: "Base principal de IRPF del trabajo y cotizaciones",
    partes: POBLACION_TRABAJAN_PARTES,
  },
  {
    id: "reciben",
    nombre: "No trabajan y reciben",
    detalle: "Pensiones, paro, IMV…",
    millones: 11.2,
    color: "#c9a86a",
    nota: "Ingreso público sin estar ocupados (simplificado)",
  },
  {
    id: "sin-ingreso",
    nombre: "No trabajan y no reciben",
    detalle: "Inactivos sin prestación",
    millones: 8.0,
    color: "#6b7a94",
    nota: "Hogar, estudios, parados sin prestación, etc.",
  },
  {
    id: "ninos",
    nombre: "Niños",
    detalle: "Menores de 16 años",
    millones: 7.8,
    color: "#5a9e7a",
    nota: "Dependientes; no cotizan ni declaran IRPF",
  },
];

/**
 * Tres grandes bloques de población para la narrativa "quién paga la fiesta".
 *
 * UNIVERSO: deciles de POBLACIÓN (48,6 M). Todos los % de este bloque salen
 * del modelo de CARGA_AMPLIADA, así que no pueden contradecirlo.
 *
 * · `cuotaIrpfPct` — solo IRPF (trabajo + capital del modelo).
 * · `cuotaAmpliadaPct` — cesta justa CON IVA (IRPF trab. + capital + IS + IVA).
 * · `cuotaSinIvaPct` — misma cesta SIN IVA (contraste: concentra más arriba).
 * Los % de cesta se alinean con CARGA_POR_GRUPO (redondeo de lectura).
 *
 * Umbrales de renta bruta anual orientativos (deciles 1–4 / 5–8 / 9–10):
 * no son el tramo del IRPF de Hacienda, sino cortes de distribución.
 */
export const GRUPOS_RENTA = [
  {
    id: "bajos",
    nombre: "Rentas bajas",
    subtitulo: "Deciles 1–4 · ~40 % de la población",
    poblacionPct: 40,
    /** ~40 % de ~48,6 M habitantes. */
    poblacionMillones: 19.4,
    rentaDesde: 0,
    rentaHasta: 22_000,
    rentaRango: "hasta ~22.000 €/año",
    /** Solo IRPF · ~7,3 % del modelo. */
    cuotaIrpfPct: 7,
    /** Cesta justa con IVA · ~13,5 % exacto del modelo → 14 %. */
    cuotaAmpliadaPct: 14,
    /** Sin IVA · ~6,5 % → 7 %. */
    cuotaSinIvaPct: 7,
    tipoEfectivoIrpf: 3,
    saldoNeto: "beneficiario",
    saldoSobreRenta: 55,
    color: "#5a9e7a",
    tinta: "#0d1626",
    descripcion:
      "Poco IRPF y casi nada de capital societario; sí pagan IVA (consumen casi toda la renta). Reciben más en pensiones, paro y transferencias de lo que aportan en impuestos directos.",
  },
  {
    id: "medias",
    nombre: "Rentas medias",
    subtitulo: "Deciles 5–8 · ~40 % de la población",
    poblacionPct: 40,
    poblacionMillones: 19.4,
    rentaDesde: 22_000,
    rentaHasta: 50_000,
    rentaRango: "~22.000 – 50.000 €/año",
    /** Solo IRPF · ~38,3 % del modelo. */
    cuotaIrpfPct: 38,
    /** Con IVA · ~34,3 % → 34 %. */
    cuotaAmpliadaPct: 34,
    /** Sin IVA · ~33,1 % → 33 %. */
    cuotaSinIvaPct: 33,
    tipoEfectivoIrpf: 14,
    saldoNeto: "mixto",
    saldoSobreRenta: 5,
    color: "#3f80bd",
    tinta: "#0d1626",
    descripcion:
      "El grueso de las nóminas y del IRPF del trabajo, más una buena parte del IVA. Casi no son dueños del capital societario: su factura es sueldo + consumo, no dividendos ni IS.",
  },
  {
    id: "altas",
    nombre: "Rentas altas",
    subtitulo: "Deciles 9–10 · ~20 % de la población",
    poblacionPct: 20,
    poblacionMillones: 9.7,
    rentaDesde: 50_000,
    rentaHasta: null,
    rentaRango: "desde ~50.000 €/año",
    /**
     * Solo IRPF · ~54,5 % del modelo. Ojo: NO es el ~66 % de
     * `CONCENTRACION_IRPF.top20PctCuota`, que va por declarantes.
     */
    cuotaIrpfPct: 55,
    /** Con IVA · ~52,2 % → 52 % (el IVA diluye un poco el peso relativo). */
    cuotaAmpliadaPct: 52,
    /** Sin IVA · ~60,4 % → 60 %. */
    cuotaSinIvaPct: 60,
    tipoEfectivoIrpf: 28,
    saldoNeto: "pagador",
    saldoSobreRenta: -18,
    color: "#c9a86a",
    tinta: "#0d1626",
    descripcion:
      "Dominan el IRPF y, sobre todo, el capital (ahorro, dividendos, IS). En euros también aportan mucho IVA, pero sobre su renta pesa menos. No se les puede medir solo por la casilla del trabajo.",
  },
] as const;

export type GrupoRenta = (typeof GRUPOS_RENTA)[number];

/**
 * Desglose fino del top: para el hero y la tabla de "cuánto pone cada uno".
 * UNIVERSO: deciles de DECLARANTES, igual que CONCENTRACION_IRPF (con la que
 * cuadra: 16 + 50 = 66 el top 20 %, 8 la mitad de abajo). Las columnas suman
 * 100 tanto en población como en cuota.
 */
export const TRAMOS_FINOS = [
  {
    id: "d1-5",
    nombre: "50 % con menos renta",
    poblacionPct: 50,
    cuotaIrpfPct: 8,
    color: "#5a9e7a",
  },
  {
    id: "d6-8",
    nombre: "Siguiente 30 % (media-alta)",
    poblacionPct: 30,
    cuotaIrpfPct: 26,
    color: "#3f80bd",
  },
  {
    id: "d9",
    nombre: "Decil 9 (altas)",
    poblacionPct: 10,
    cuotaIrpfPct: 16,
    color: "#a9576f",
  },
  {
    id: "d10",
    nombre: "Decil 10 (más altas)",
    poblacionPct: 10,
    cuotaIrpfPct: 50,
    color: "#c9a86a",
  },
] as const;

/**
 * Asalariados por tramo de retribución y peso en retenciones (AEAT / RTVE
 * sobre datos 2023 de rentas del trabajo). Órdenes de magnitud.
 */
export const ASALARIADOS_TRAMOS = [
  {
    id: "bajo",
    etiqueta: "Hasta 20.000 €",
    trabajadoresPct: 42,
    retencionesPct: 12,
    color: "#5a9e7a",
  },
  {
    id: "medio",
    etiqueta: "20.000 – 50.000 €",
    trabajadoresPct: 40,
    retencionesPct: 48,
    color: "#3f80bd",
  },
  {
    id: "alto",
    etiqueta: "50.000 – 100.000 €",
    trabajadoresPct: 15,
    retencionesPct: 23,
    color: "#a9576f",
  },
  {
    id: "muyAlto",
    etiqueta: "Más de 100.000 €",
    trabajadoresPct: 3,
    retencionesPct: 17,
    color: "#c9a86a",
  },
] as const;

/**
 * Saldo neto de la intervención pública por quintil de renta bruta del hogar.
 * Positivo = beneficiario neto (prestaciones > impuestos).
 * Fuente de referencia: FEDEA Observatorio 2022 (publicado 2025).
 */
export const SALDO_QUINTILES = [
  {
    id: "q1",
    nombre: "Quintil 1",
    detalle: "20 % más pobre",
    saldoPctRenta: 85,
    rol: "beneficiario" as const,
    color: "#5a9e7a",
  },
  {
    id: "q2",
    nombre: "Quintil 2",
    detalle: "Siguiente 20 %",
    saldoPctRenta: 42,
    rol: "beneficiario" as const,
    color: "#6faf8a",
  },
  {
    id: "q3",
    nombre: "Quintil 3",
    detalle: "Clase media baja",
    saldoPctRenta: 16,
    rol: "beneficiario" as const,
    color: "#3f80bd",
  },
  {
    id: "q4",
    nombre: "Quintil 4",
    detalle: "Clase media alta",
    saldoPctRenta: -4,
    rol: "pagador" as const,
    color: "#a9576f",
  },
  {
    id: "q5",
    nombre: "Quintil 5",
    detalle: "20 % más rico",
    saldoPctRenta: -20,
    rol: "pagador" as const,
    color: "#c9a86a",
  },
] as const;

/** Composición de la recaudación para el donut. */
export const MIX_IMPUESTOS = [
  {
    id: "irpf",
    nombre: "IRPF",
    millones: RECAUDACION_2024.irpfMillones,
    color: "#c9a86a",
    nota: "Rentas del trabajo, capital y actividades",
  },
  {
    id: "iva",
    nombre: "IVA",
    millones: RECAUDACION_2024.ivaMillones,
    color: "#3f80bd",
    nota: "Consumo · más plano entre rentas",
  },
  {
    id: "sociedades",
    nombre: "Sociedades",
    millones: RECAUDACION_2024.sociedadesMillones,
    color: "#a9576f",
    nota: "Beneficios empresariales",
  },
  {
    id: "especiales",
    nombre: "Especiales",
    millones: RECAUDACION_2024.especialesMillones,
    color: "#e9a05c",
    nota: "Hidrocarburos, tabaco, alcohol…",
  },
  {
    id: "otros",
    nombre: "Resto",
    millones: RECAUDACION_2024.otrosMillones,
    color: "#6b7a94",
    nota: "Otros tributos gestionados por AEAT",
  },
] as const;

/**
 * Carga fiscal ampliada: no solo IRPF del trabajo.
 *
 * Cuatro vías para una comparación «justa» trabajo + capital + consumo:
 *  1) IRPF de rentas del trabajo y actividades (el que sale en la nómina).
 *  2) IRPF de la base del ahorro: dividendos, intereses, ganancias patrimoniales.
 *  3) Impuesto sobre Sociedades, atribuido de forma orientativa a los dueños
 *     del capital (los beneficios societarios no son «de nadie» en la práctica
 *     fiscal personal: acaban en accionistas, muy concentrados arriba).
 *  4) IVA, atribuido por tramo según la incidencia por decil (más plano /
 *     regresivo en % sobre renta; ver IVA_POR_DECIL).
 *
 * Los % de atribución del IS no salen de un único cuadro AEAT (incidencia
 * económica). El IVA sí se ancla a los pesos por decil del bloque de IVA.
 */
/**
 * El IRPF de la cesta se DERIVA del total AEAT (85 % trabajo / 15 % ahorro).
 * Antes estaba escrito a mano sobre un total viejo de 129.408 M€ y se quedó
 * 13.058 M€ por debajo del IRPF que la propia página enseñaba en el donut.
 * Derivándolo, la cesta y `MIX_IMPUESTOS` no pueden volver a contradecirse.
 */
const IRPF_TRABAJO_MILLONES = Math.round(RECAUDACION_2025.irpfMillones * 0.85);
const IRPF_CAPITAL_MILLONES =
  RECAUDACION_2025.irpfMillones - IRPF_TRABAJO_MILLONES;

export const CARGA_AMPLIADA = {
  periodo: "2025 · escenario orientativo",
  /** IRPF total AEAT; se parte en trabajo ≈85 % y capital/ahorro ≈15 %. */
  irpfTrabajoMillones: IRPF_TRABAJO_MILLONES,
  irpfCapitalMillones: IRPF_CAPITAL_MILLONES,
  sociedadesMillones: RECAUDACION_2024.sociedadesMillones,
  ivaMillones: RECAUDACION_2024.ivaMillones,
  /**
   * % de cada vía atribuido a cada grupo (baja / media / alta).
   * Filas suman 100.
   * IVA: suma de cuotaIvaPct de deciles 1–4 / 5–8 / 9–10.
   */
  atribucion: {
    irpfTrabajo: { bajos: 8, medias: 42, altas: 50 },
    irpfCapital: { bajos: 3, medias: 17, altas: 80 },
    sociedades: { bajos: 4, medias: 16, altas: 80 },
    /** D1–4 ≈ 26,5 % · D5–8 ≈ 36,5 % · D9–10 ≈ 37 %. */
    iva: { bajos: 26.5, medias: 36.5, altas: 37 },
  },
  vias: [
    {
      id: "irpf_trabajo",
      nombre: "IRPF trabajo",
      detalle: "Nóminas y actividades",
      color: "#3f80bd",
    },
    {
      id: "irpf_capital",
      nombre: "IRPF capital",
      detalle: "Dividendos, intereses, ganancias",
      color: "#a9576f",
    },
    {
      id: "sociedades",
      nombre: "Sociedades",
      detalle: "Beneficio empresarial (incidencia)",
      color: "#c9a86a",
    },
    {
      id: "iva",
      nombre: "IVA",
      detalle: "Consumo · por decil de renta",
      color: "#5a9e7a",
    },
  ],
} as const;

function millonesVia(
  via: "irpfTrabajo" | "irpfCapital" | "sociedades" | "iva",
  grupo: "bajos" | "medias" | "altas",
): number {
  const base =
    via === "irpfTrabajo"
      ? CARGA_AMPLIADA.irpfTrabajoMillones
      : via === "irpfCapital"
        ? CARGA_AMPLIADA.irpfCapitalMillones
        : via === "sociedades"
          ? CARGA_AMPLIADA.sociedadesMillones
          : CARGA_AMPLIADA.ivaMillones;
  const pct = CARGA_AMPLIADA.atribucion[via][grupo];
  return (base * pct) / 100;
}

/** Totales por grupo en M€ y % sobre la cesta (con y sin IVA). */
export const CARGA_POR_GRUPO = (
  ["bajos", "medias", "altas"] as const
).map((id) => {
  const irpfTrabajo = millonesVia("irpfTrabajo", id);
  const irpfCapital = millonesVia("irpfCapital", id);
  const sociedades = millonesVia("sociedades", id);
  const iva = millonesVia("iva", id);
  const totalSinIva = irpfTrabajo + irpfCapital + sociedades;
  const total = totalSinIva + iva;
  const cestaSinIva =
    CARGA_AMPLIADA.irpfTrabajoMillones +
    CARGA_AMPLIADA.irpfCapitalMillones +
    CARGA_AMPLIADA.sociedadesMillones;
  const cesta =
    cestaSinIva + CARGA_AMPLIADA.ivaMillones;
  const meta = GRUPOS_RENTA.find((g) => g.id === id)!;
  return {
    id,
    nombre: meta.nombre,
    color: meta.color,
    poblacionPct: meta.poblacionPct,
    rentaRango: meta.rentaRango,
    irpfTrabajo,
    irpfCapital,
    sociedades,
    iva,
    /** Cesta completa del gráfico justo: IRPF + capital + IS + IVA. */
    total,
    pctCesta: (total / cesta) * 100,
    /** Solo trabajo + capital + IS (sin IVA), para la narrativa del tramo alto. */
    totalSinIva,
    pctCestaSinIva: (totalSinIva / cestaSinIva) * 100,
    /** Solo IRPF (trabajo+capital del modelo) para comparar con la vista clásica. */
    soloIrpf: irpfTrabajo + irpfCapital,
  };
});

/** Cesta del gráfico justo (incluye IVA). */
export const CESTA_AMPLIADA_MILLONES =
  CARGA_AMPLIADA.irpfTrabajoMillones +
  CARGA_AMPLIADA.irpfCapitalMillones +
  CARGA_AMPLIADA.sociedadesMillones +
  CARGA_AMPLIADA.ivaMillones;

/** Cesta sin IVA (IRPF + IS), la del hero «capital incluido». */
export const CESTA_SIN_IVA_MILLONES =
  CARGA_AMPLIADA.irpfTrabajoMillones +
  CARGA_AMPLIADA.irpfCapitalMillones +
  CARGA_AMPLIADA.sociedadesMillones;

/**
 * Cortes finos del tramo alto: qué parte de la cesta pone el 20 %, el 10 % y
 * el 5 % con más renta.
 *
 * Mismo modelo que `CARGA_POR_GRUPO` —se reparte cada vía y se divide entre la
 * cesta—; lo único nuevo es partir el 20 % de arriba en cortes más estrechos
 * con la forma de reparto que ya usan `TRAMOS_FINOS` y `CONCENTRACION_IRPF`:
 * el capital (ahorro + Sociedades) está mucho más concentrado que la nómina, y
 * el IVA mucho menos (consumir tiene tope, cobrar dividendos no).
 *
 * El corte del 20 % reproduce por construcción `CESTA_TOP20_PCT` (60 / 52).
 *
 * UNIVERSO: deciles de POBLACIÓN, como `GRUPOS_RENTA` —no de declarantes—.
 * Escenario orientativo de lectura, no un microdato AEAT.
 */
const ATRIBUCION_TOP = {
  top20: { irpfTrabajo: 50, irpfCapital: 80, sociedades: 80, iva: 37 },
  top10: { irpfTrabajo: 38, irpfCapital: 72, sociedades: 72, iva: 21 },
  top5: { irpfTrabajo: 25, irpfCapital: 58, sociedades: 58, iva: 12 },
} as const;

function pctDeCesta(a: (typeof ATRIBUCION_TOP)[keyof typeof ATRIBUCION_TOP]) {
  const sinIvaMillones =
    (CARGA_AMPLIADA.irpfTrabajoMillones * a.irpfTrabajo) / 100 +
    (CARGA_AMPLIADA.irpfCapitalMillones * a.irpfCapital) / 100 +
    (CARGA_AMPLIADA.sociedadesMillones * a.sociedades) / 100;
  const ivaMillones = (CARGA_AMPLIADA.ivaMillones * a.iva) / 100;
  return {
    sinIva: Math.round((sinIvaMillones / CESTA_SIN_IVA_MILLONES) * 100),
    conIva: Math.round(
      ((sinIvaMillones + ivaMillones) / CESTA_AMPLIADA_MILLONES) * 100,
    ),
  };
}

export const CESTA_TOP_TRAMOS = [
  {
    id: "top20",
    poblacionPct: 20,
    etiqueta: "20 % con + rentas",
    detalle: "Deciles 9–10 · desde ~50.000 €",
    ...pctDeCesta(ATRIBUCION_TOP.top20),
  },
  {
    id: "top10",
    poblacionPct: 10,
    etiqueta: "10 % con + rentas",
    detalle: "Decil 10 · la mitad de arriba del tramo alto",
    ...pctDeCesta(ATRIBUCION_TOP.top10),
  },
  {
    id: "top5",
    poblacionPct: 5,
    etiqueta: "5 % con + rentas",
    detalle: "Medio decil · donde se concentra el capital",
    ...pctDeCesta(ATRIBUCION_TOP.top5),
  },
] as const;

/**
 * Retrato simplificado por perfil: misma lógica de cesta justa
 * (IRPF + capital + IS + IVA). El IVA se estima con ivaSobreRenta del
 * decil más cercano a la renta del perfil.
 *
 * `tipoEfectivo` es siempre `irpfAnual / rentaAnual` redondeado —solo el IRPF
 * de la nómina, que es lo que el lector reconoce en su declaración—. No mezcla
 * capital ni IS: esos van aparte en la cesta.
 */
export const PERFILES = [
  {
    id: "pobre",
    titulo: "Renta baja",
    rentaAnual: 14_000,
    irpfAnual: 200,
    capitalAnual: 0,
    sociedadesAnual: 0,
    /** ~9,8 % de la renta · tramo bajo (D2). */
    ivaAnual: 1_370,
    tipoEfectivo: 1.5,
    color: "#5a9e7a",
    nota: "Casi solo IVA en la factura real; IRPF nulo o a devolver",
  },
  {
    id: "medio",
    titulo: "Renta media",
    rentaAnual: 28_000,
    irpfAnual: 3_600,
    capitalAnual: 100,
    sociedadesAnual: 0,
    /** ~6,8 % · D6. */
    ivaAnual: 1_900,
    tipoEfectivo: 13,
    color: "#3f80bd",
    nota: "Nómina + IVA del consumo; poco capital societario",
  },
  {
    id: "medioAlto",
    titulo: "Media-alta",
    rentaAnual: 45_000,
    irpfAnual: 9_000,
    capitalAnual: 800,
    sociedadesAnual: 0,
    /** ~5,4 % · D8. */
    ivaAnual: 2_430,
    tipoEfectivo: 20,
    color: "#a9576f",
    nota: "IRPF del trabajo + algo de ahorro + IVA",
  },
  {
    id: "rico",
    titulo: "Renta alta / capital",
    rentaAnual: 100_000,
    irpfAnual: 22_000,
    capitalAnual: 12_000,
    sociedadesAnual: 18_000,
    /** ~3,5 % · D10 (más euros, menos % sobre renta). */
    ivaAnual: 3_500,
    tipoEfectivo: 22,
    color: "#c9a86a",
    nota: "IRPF + capital + IS atribuido + IVA (orden de magnitud)",
  },
] as const;

export const DATOS_CLAVE = [
  {
    id: "mitad",
    titulo: "La mitad del IRPF la paga el 10 %",
    texto:
      "El decil de mayor renta aporta del orden de la mitad de toda la cuota del IRPF. Es el diseño de un impuesto progresivo sobre rentas desiguales —pero no es toda su factura fiscal.",
  },
  {
    id: "cesta",
    titulo: "Con IVA, el top 20 % sigue en ~52 %",
    texto:
      "En la cesta justa (IRPF + capital + Sociedades + IVA), las rentas altas (deciles 9–10) aportan del orden del 52 %. Sin IVA serían ~60 %: el consumo diluye un poco el peso relativo, no lo borra.",
  },
  {
    id: "sociedades",
    titulo: "Sociedades ≈ 42.000 M€ más",
    texto:
      "El Impuesto sobre Sociedades grava el beneficio de las empresas. Quien es dueño del capital (muy concentrado arriba) lo soporta de forma indirecta: no sale en su IRPF de nómina, pero sí en la caja del Estado.",
  },
  {
    id: "iva-tramo",
    titulo: "El IVA pesa más abajo en % de renta",
    texto:
      "Las rentas bajas destinan del orden del 9–11 % de su renta al IVA; las altas, ~3–4 %. En euros, el tramo alto pone más del total porque consume más en absoluto.",
  },
  {
    id: "cincuenta",
    titulo: "El 50 % de abajo pone ~8 % del IRPF",
    texto:
      "La mitad con menos renta aporta menos de una décima parte de la cuota del IRPF y casi nada del capital societario. Su peso fiscal real está más en el IVA y, si cotiza, en la Seguridad Social.",
  },
  {
    id: "netos",
    titulo: "El 60 % de hogares es beneficiario neto",
    texto:
      "Cuando se suman impuestos y prestaciones (FEDEA), los tres primeros quintiles reciben de media más de lo que pagan. El 40 % de arriba financia el saldo.",
  },
] as const;

/**
 * Mensaje hero: cesta justa CON IVA (la de referencia en la página).
 * El contraste sin IVA (~60 %) se menciona en el subtítulo.
 */
export const HERO = {
  cifra: "52 %",
  /** La etiqueta va partida: el destacado se pinta en ámbar en el hero. */
  etiquetaPrefijo: "de IRPF + capital + Sociedades + IVA",
  etiquetaDestacado: "lo paga el 20 % con más renta",
  contrasteIzq: { valor: "20 %", label: "con + rentas" },
  contrasteDer: { valor: "52 %", label: "del total con IVA" },
} as const;

/** Atajo numérico reutilizable en textos (evita hardcodes dispersos). */
export const CESTA_TOP20_PCT = {
  conIva: 52,
  sinIva: 60,
} as const;

/**
 * IVA por decil de renta (hogares): la otra cara de la fiesta.
 *
 * Lectura clave (y contraintuitiva si vienes del IRPF):
 *  · En % sobre la renta, el IVA es regresivo: pesa más abajo porque
 *    se gasta casi todo lo que se ingresa (y se ahorra poco).
 *  · En euros y en % del IVA total, el tramo alto paga más: consume
 *    más en absoluto (aunque ahorre una parte mayor de su renta).
 *
 * Órdenes de magnitud alineados con patrones habituales de incidencia
 * del IVA en España (INE / Encuesta de presupuestos, estudios IEF y
 * resúmenes FEDEA/Eurostat). No es un microdato de un año concreto:
 * es un escenario divulgativo para comparar deciles.
 */
export const IVA_META = {
  periodo: "Escenario orientativo · hogares por decil de renta",
  recaudacionMillones: RECAUDACION_2024.ivaMillones,
  /** Tipo general vigente. */
  tipoGeneral: 21,
  tipoReducido: 10,
  tipoSuperreducido: 4,
  /** Ratio aproximado: el decil más pobre paga ~3× más IVA/renta que el más rico. */
  ratioRegresividad: 3.2,
} as const;

export const IVA_TIPOS = [
  {
    id: "super",
    tipo: 4,
    nombre: "Superreducido",
    ejemplos: "Pan, leche, huevos, libros, medicinas…",
    color: "#5a9e7a",
  },
  {
    id: "reducido",
    tipo: 10,
    nombre: "Reducido",
    ejemplos: "Alimentos en general, transporte, hostelería…",
    color: "#3f80bd",
  },
  {
    id: "general",
    tipo: 21,
    nombre: "General",
    ejemplos: "Resto de bienes y servicios",
    color: "#c9a86a",
  },
] as const;

/**
 * Diez deciles: del 10 % con menos renta (D1) al 10 % con más (D10).
 * `percentil` = tramo de la distribución (P0–10 … P90–100).
 *
 * · rentaMedia: ingreso anual orientativo del hogar del decil.
 * · ivaAnual: factura de IVA embebida en el consumo (~ €/año).
 * · ivaSobreRenta: IVA / renta × 100 → mide el peso real sobre ingresos.
 * · cuotaIvaPct: % del IVA total del país que paga ese decil (suma 100).
 * · consumoSobreRenta: propensión a consumir; explica la regresividad.
 */
export const IVA_POR_DECIL = [
  {
    id: "d1",
    decil: 1,
    percentil: "P0–10",
    nombre: "Decil 1",
    detalle: "10 % con menos renta",
    rentaMedia: 9_500,
    ivaAnual: 1_060,
    ivaSobreRenta: 11.2,
    cuotaIvaPct: 5.5,
    consumoSobreRenta: 98,
    color: "#3d8f6a",
  },
  {
    id: "d2",
    decil: 2,
    percentil: "P10–20",
    nombre: "Decil 2",
    detalle: "Siguiente 10 %",
    rentaMedia: 13_500,
    ivaAnual: 1_320,
    ivaSobreRenta: 9.8,
    cuotaIvaPct: 6.5,
    consumoSobreRenta: 93,
    color: "#4a9874",
  },
  {
    id: "d3",
    decil: 3,
    percentil: "P20–30",
    nombre: "Decil 3",
    detalle: "Renta baja-media",
    rentaMedia: 17_000,
    ivaAnual: 1_510,
    ivaSobreRenta: 8.9,
    cuotaIvaPct: 7.0,
    consumoSobreRenta: 89,
    color: "#5a9e7a",
  },
  {
    id: "d4",
    decil: 4,
    percentil: "P30–40",
    nombre: "Decil 4",
    detalle: "Media baja",
    rentaMedia: 20_500,
    ivaAnual: 1_660,
    ivaSobreRenta: 8.1,
    cuotaIvaPct: 7.5,
    consumoSobreRenta: 85,
    color: "#4a8fa8",
  },
  {
    id: "d5",
    decil: 5,
    percentil: "P40–50",
    nombre: "Decil 5",
    detalle: "Justo por debajo de la mediana",
    rentaMedia: 24_500,
    ivaAnual: 1_810,
    ivaSobreRenta: 7.4,
    cuotaIvaPct: 8.0,
    consumoSobreRenta: 81,
    color: "#3f80bd",
  },
  {
    id: "d6",
    decil: 6,
    percentil: "P50–60",
    nombre: "Decil 6",
    detalle: "Justo por encima de la mediana",
    rentaMedia: 29_000,
    ivaAnual: 1_970,
    ivaSobreRenta: 6.8,
    cuotaIvaPct: 8.5,
    consumoSobreRenta: 77,
    color: "#5a78b0",
  },
  {
    id: "d7",
    decil: 7,
    percentil: "P60–70",
    nombre: "Decil 7",
    detalle: "Media-alta",
    rentaMedia: 35_000,
    ivaAnual: 2_140,
    ivaSobreRenta: 6.1,
    cuotaIvaPct: 9.5,
    consumoSobreRenta: 72,
    color: "#8a6a9a",
  },
  {
    id: "d8",
    decil: 8,
    percentil: "P70–80",
    nombre: "Decil 8",
    detalle: "Alta-media",
    rentaMedia: 43_000,
    ivaAnual: 2_320,
    ivaSobreRenta: 5.4,
    cuotaIvaPct: 10.5,
    consumoSobreRenta: 67,
    color: "#a9576f",
  },
  {
    id: "d9",
    decil: 9,
    percentil: "P80–90",
    nombre: "Decil 9",
    detalle: "Rentas altas",
    rentaMedia: 56_000,
    ivaAnual: 2_580,
    ivaSobreRenta: 4.6,
    cuotaIvaPct: 13.0,
    consumoSobreRenta: 60,
    color: "#b8925c",
  },
  {
    id: "d10",
    decil: 10,
    percentil: "P90–100",
    nombre: "Decil 10",
    detalle: "10 % con más renta",
    rentaMedia: 95_000,
    ivaAnual: 3_320,
    ivaSobreRenta: 3.5,
    cuotaIvaPct: 24.0,
    consumoSobreRenta: 48,
    color: "#c9a86a",
  },
] as const;

export type IvaDecil = (typeof IVA_POR_DECIL)[number];

/** Agregados útiles para KPIs y callouts del bloque IVA. */
export const IVA_RESUMEN = {
  /** Mitad inferior de la distribución (D1–D5). */
  mitadInferior: {
    cuotaIvaPct: IVA_POR_DECIL.slice(0, 5).reduce((s, d) => s + d.cuotaIvaPct, 0),
    ivaSobreRentaMedia:
      IVA_POR_DECIL.slice(0, 5).reduce((s, d) => s + d.ivaSobreRenta, 0) / 5,
  },
  /** Mitad superior (D6–D10). */
  mitadSuperior: {
    cuotaIvaPct: IVA_POR_DECIL.slice(5).reduce((s, d) => s + d.cuotaIvaPct, 0),
    ivaSobreRentaMedia:
      IVA_POR_DECIL.slice(5).reduce((s, d) => s + d.ivaSobreRenta, 0) / 5,
  },
  decilMasPobre: IVA_POR_DECIL[0],
  decilMasRico: IVA_POR_DECIL[9],
} as const;
