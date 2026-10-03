/**
 * Estimador divulgativo de carga fiscal personal.
 *
 * NO es un simulador de Hacienda, ni Renta WEB, ni un asesor fiscal.
 * Usa órdenes de magnitud y perfiles medios por tramo de renta para situar
 * al lector en la distribución y desglosar vías típicas de un asalariado
 * en régimen general: impuesto sobre la renta, cotizaciones del trabajador,
 * cotizaciones de la empresa (incidencia sobre el coste del puesto), IVA y
 * especiales.
 *
 * La cotización empresarial se suma a la factura personal: no aparece en el
 * neto de nómina, pero es parte del coste del trabajo y de la cuña fiscal
 * (quién la «paga» económicamente es debatible; aquí se imputa al puesto).
 *
 * MISMA METODOLOGÍA PARA TODOS LOS PAÍSES. El motor es único: cambia el
 * juego de parámetros (`src/lib/paises-fiscal.ts`), no el modelo. España
 * sigue saliendo exactamente igual que antes de abrir la calculadora al
 * resto de países: su tabla de tipos efectivos y su escalera de deciles son
 * las mismas, y el factor de IVA de España vale 1 por construcción.
 *
 * Cualquier decisión fiscal, reclamación o declaración debe basarse en
 * cálculos propios, la normativa vigente y, si procede, un profesional.
 */

import { IVA_POR_DECIL } from "./fiesta-data";
import {
  PAIS_POR_DEFECTO,
  type Cotizacion,
  type EscalaImpuesto,
  type OpcionFiscal,
  type OpcionFiscalId,
  type OpcionesActivas,
  type PaisFiscal,
  factorIva,
  getPais,
} from "./paises-fiscal";

/**
 * Umbrales de renta bruta anual para situar el percentil/decil.
 * Alineados con las rentas medias de IVA_POR_DECIL (punto medio del tramo).
 * `escala` lleva la escalera española al nivel salarial de cada país y
 * `fIva` ajusta el peso del IVA a su tipo efectivo (España: escala 1, fIva 1).
 */
function decilesDePais(pais: PaisFiscal) {
  const escala = pais.escalaRenta;
  const fIva = factorIva(pais);

  return IVA_POR_DECIL.map((d, i, arr) => {
    const rentaMedia = d.rentaMedia * escala;
    const prevMid =
      i === 0 ? 0 : ((arr[i - 1].rentaMedia + d.rentaMedia) / 2) * escala;
    const nextMid =
      i === arr.length - 1
        ? rentaMedia * 1.8
        : ((d.rentaMedia + arr[i + 1].rentaMedia) / 2) * escala;

    return {
      decil: d.decil,
      percentilDesde: (d.decil - 1) * 10,
      percentilHasta: d.decil * 10,
      rentaDesde: i === 0 ? 0 : prevMid,
      rentaHasta: i === arr.length - 1 ? Number.POSITIVE_INFINITY : nextMid,
      rentaMedia,
      /** % de la renta que se va en IVA, ajustado al tipo efectivo del país. */
      ivaSobreRenta: d.ivaSobreRenta * fIva,
      /** El mismo peso en España: ancla de los impuestos especiales. */
      ivaSobreRentaEs: d.ivaSobreRenta,
      consumoSobreRenta: d.consumoSobreRenta,
      cuotaIvaPct: d.cuotaIvaPct,
      /**
       * Peso orientativo del decil en la recaudación tributaria total del
       * país (renta + consumo + especiales + resto; sin cotizaciones).
       */
      cuotaImpuestosTotalesPct: pais.cuotaImpuestosDecilPct[i]!,
      color: d.color,
      nombre: d.nombre,
      percentilLabel: d.percentil,
      detalle: d.detalle,
    };
  });
}

const DECILES_CALC = decilesDePais(getPais(PAIS_POR_DEFECTO));

/** Suma de control (debe ~100). */
export const CUOTA_IMPUESTOS_CHECK = DECILES_CALC.reduce(
  (s, d) => s + d.cuotaImpuestosTotalesPct,
  0,
);

export type ConceptoFiscal = {
  id: string;
  nombre: string;
  euros: number;
  pctRenta: number;
  color: string;
  nota: string;
};

export type ResultadoCalculadora = {
  /** País con el que se ha calculado: moneda, notas y letra pequeña. */
  pais: PaisFiscal;
  renta: number;
  decil: number;
  percentilAprox: number;
  percentilLabel: string;
  nombreTramo: string;
  detalleTramo: string;
  color: string;
  /** Posición 0–100 en la barra de renta (percentil). */
  posicionBarra: number;
  conceptos: ConceptoFiscal[];
  /**
   * Suma de todos los conceptos del desglose, **incluida** la cotización
   * de la empresa (cuña del puesto, no solo lo que sale del neto).
   */
  totalImpuestos: number;
  /** totalImpuestos / renta bruta · 100. */
  totalPctRenta: number;
  /**
   * totalImpuestos / coste laboral (bruto + SS empresa) · 100.
   * Es la lectura de «cuña fiscal» más comparable entre países.
   */
  totalPctCosteLaboral: number;
  /** Cotización empresarial (incluida en totalImpuestos y en conceptos). */
  ssEmpresa: number;
  /** Cotización del trabajador (también en conceptos). */
  ssTrabajador: number;
  /** Suma de ambas cotizaciones SS. */
  ssTotal: number;
  /** Bruto + cotización empresa. */
  costeLaboralTotal: number;
  /** % orientativo de la recaudación del país que aporta su decil entero. */
  cuotaDecilImpuestosPct: number;
  cuotaDecilIvaPct: number;
  recaudacionNacionalMillones: number;
  /** Si todo el país fueran 100 € de impuestos, cuántos pone su decil. */
  deCada100DelDecil: number;
  rentaNetaAprox: number;
};

function interpolarPct(
  renta: number,
  nodos: readonly { renta: number; pct: number }[],
): number {
  if (renta <= nodos[0].renta) return nodos[0].pct;
  const last = nodos[nodos.length - 1]!;
  if (renta >= last.renta) return last.pct;
  for (let i = 1; i < nodos.length; i++) {
    const a = nodos[i - 1]!;
    const b = nodos[i]!;
    if (renta <= b.renta) {
      const t = (renta - a.renta) / (b.renta - a.renta);
      return a.pct + t * (b.pct - a.pct);
    }
  }
  return last.pct;
}

/** Base imponible de una escala: el bruto menos sus deducciones. */
function baseEscala(bruto: number, escala: EscalaImpuesto): number {
  const proporcional = Math.min(
    bruto * (escala.deduccionPctBruto ?? 0),
    escala.deduccionTope ?? Number.POSITIVE_INFINITY,
  );
  return Math.max(0, bruto - (escala.deduccion ?? 0) - proporcional);
}

/**
 * Tarifa de la escala aplicada a una base. Separada de las deducciones porque
 * el splitting alemán parte la BASE, no el bruto: las deducciones se aplican
 * una vez y la tarifa, a cada mitad.
 */
function tarifa(base: number, escala: EscalaImpuesto, conRecargo = true): number {
  let cuota = 0;
  for (let i = 0; i < escala.tramos.length; i++) {
    const tramo = escala.tramos[i]!;
    const techo = escala.tramos[i + 1]?.desde ?? Number.POSITIVE_INFINITY;
    if (base <= tramo.desde) break;
    cuota += (Math.min(base, techo) - tramo.desde) * tramo.tipo;
  }

  cuota = Math.max(0, cuota - (escala.credito ?? 0));

  // El recargo (tipo Soli alemán) se calcula sobre la cuota ya neta de
  // créditos y solo por encima de su umbral.
  if (conRecargo && escala.recargo && cuota > escala.recargo.desdeCuota) {
    cuota += (cuota - escala.recargo.desdeCuota) * escala.recargo.pct;
  }

  return cuota;
}

/**
 * Cuota de una escala sobre el bruto.
 *
 * Con `splitting`, la tarifa se aplica a media base y el resultado se dobla:
 * es el Ehegattensplitting alemán. El efecto secundario es correcto y
 * deliberado: al partir la base, el mínimo exento y el umbral del recargo
 * cuentan dos veces, que es exactamente lo que pasa en tributación conjunta.
 */
function cuotaEscala(
  bruto: number,
  escala: EscalaImpuesto,
  splitting = false,
  conRecargo = true,
): number {
  const base = baseEscala(bruto, escala);
  return splitting
    ? 2 * tarifa(base / 2, escala, conRecargo)
    : tarifa(base, escala, conRecargo);
}

/** Impuesto sobre la renta del país: suma de todas sus figuras. */
function impuestoRenta(
  bruto: number,
  pais: PaisFiscal,
  splitting = false,
  conRecargo = true,
): number {
  if (pais.irpf.modo === "nodos") {
    // Las escalas por nodos son tipos medios observados; no hay tarifa que
    // partir, así que el splitting no se puede modelar y no se ofrece.
    return (bruto * interpolarPct(bruto, pais.irpf.nodos)) / 100;
  }
  return pais.irpf.escalas.reduce(
    (s, e) => s + cuotaEscala(bruto, e, splitting, conRecargo),
    0,
  );
}

/**
 * Qué ticks tienen efecto en este país: los que el propio país declara. Marcar
 * «casado» en un país que no lo modela no puede cambiar nada, o la comparación
 * mentiría en silencio.
 */
function opcionActiva(
  pais: PaisFiscal,
  opciones: OpcionesActivas | undefined,
  id: OpcionFiscalId,
): OpcionFiscal | null {
  if (!opciones?.[id]) return null;
  return pais.opciones?.find((o) => o.id === id) ?? null;
}

/** Cotizaciones: cada concepto se aplica solo dentro de su banda de bruto. */
function totalCotizaciones(bruto: number, cots: readonly Cotizacion[]): number {
  return cots.reduce((s, c) => {
    const desde = c.desde ?? 0;
    const hasta = c.hasta ?? Number.POSITIVE_INFINITY;
    if (c.aplicaDesdeCero) {
      return bruto >= desde ? s + Math.min(bruto, hasta) * c.tipo : s;
    }
    return s + Math.max(0, Math.min(bruto, hasta) - desde) * c.tipo;
  }, 0);
}

function fmtTipo(tipo: number): string {
  return `${(tipo * 100).toLocaleString("es-ES", { maximumFractionDigits: 2 })} %`;
}

/** Letra pequeña de una lista de cotizaciones, legible en una línea. */
function notaCotizaciones(
  bruto: number,
  cots: readonly Cotizacion[],
  pais: PaisFiscal,
): string {
  if (cots.length === 0) return "No hay cotización propia en este país";

  if (cots.length === 1) {
    const c = cots[0]!;
    const tope = c.hasta
      ? ` (tope ~${c.hasta.toLocaleString("es-ES")} ${pais.moneda.simbolo})`
      : "";
    const suelo = c.desde
      ? c.aplicaDesdeCero
        ? ` y solo si cobras más de ${c.desde.toLocaleString("es-ES")} ${pais.moneda.simbolo}`
        : ` desde ${c.desde.toLocaleString("es-ES")} ${pais.moneda.simbolo}`
      : "";
    return `~${fmtTipo(c.tipo)} sobre base${tope}${suelo} · ${c.nombre}`;
  }

  const efectivo = bruto > 0 ? totalCotizaciones(bruto, cots) / bruto : 0;
  const detalle = cots.map((c) => `${fmtTipo(c.tipo)} ${c.nombre}`).join(" + ");
  return `~${fmtTipo(efectivo)} efectivo sobre tu bruto · ${detalle}`;
}

function decilDeRenta(renta: number, deciles: ReturnType<typeof decilesDePais>) {
  for (const d of deciles) {
    if (renta >= d.rentaDesde && renta < d.rentaHasta) return d;
  }
  return deciles[deciles.length - 1]!;
}

/** Percentil aproximado (0–100) interpolando dentro del decil. */
function percentilDeRenta(
  renta: number,
  d: ReturnType<typeof decilesDePais>[number],
): number {
  if (renta <= 0) return 0;
  const span = d.rentaHasta === Number.POSITIVE_INFINITY
    ? Math.max(d.rentaMedia * 0.5, 1)
    : d.rentaHasta - d.rentaDesde;
  const t = Math.min(1, Math.max(0, (renta - d.rentaDesde) / span));
  return d.percentilDesde + t * (d.percentilHasta - d.percentilDesde);
}

/**
 * Especiales (hidrocarburos, tabaco, alcohol…) como % de la renta:
 * algo más altos abajo (consumo de carburante relativo) y se aplanan arriba.
 * Se anclan al peso del IVA ESPAÑOL —que describe la estructura de consumo
 * del decil— y luego se multiplican por el factor del país, porque un litro
 * de gasolina no lleva los mismos céntimos de impuesto en Texas que en
 * Finlandia.
 */
function especialesSobreRenta(pctIvaEs: number, factor: number): number {
  return Math.min(3.2, Math.max(0.6, pctIvaEs * 0.22)) * factor;
}

export function estimarCargaFiscal(
  rentaBruta: number,
  paisId: string = PAIS_POR_DEFECTO,
  opciones?: OpcionesActivas,
): ResultadoCalculadora | null {
  if (!Number.isFinite(rentaBruta) || rentaBruta < 1) return null;

  const pais = getPais(paisId);
  const deciles = decilesDePais(pais);
  const renta = Math.min(Math.round(rentaBruta), 5_000_000 * pais.escalaRenta);

  const tramo = decilDeRenta(renta, deciles);
  const percentilAprox = percentilDeRenta(renta, tramo);

  const splitting = opcionActiva(pais, opciones, "splitting") != null;

  // Reducción fija en base por tributación conjunta (España). Con escalas se
  // resta de la base; con nodos —tipos medios observados— se aplica el tipo a
  // la renta ya reducida, que es la aproximación honesta que permite el modelo.
  const opConjunta = opcionActiva(pais, opciones, "conjunta");
  const baseIrpf = Math.max(0, renta - (opConjunta?.parametro ?? 0));

  const irpf = impuestoRenta(baseIrpf, pais, splitting);
  const irpfPct = (irpf / renta) * 100;

  // Impuesto religioso: un % de la cuota, y sobre la cuota SIN el recargo de
  // solidaridad, que es como se calcula la Kirchensteuer.
  const opIglesia = opcionActiva(pais, opciones, "iglesia");
  const iglesia = opIglesia
    ? (impuestoRenta(baseIrpf, pais, splitting, false) * (opIglesia.parametro ?? 0)) / 100
    : 0;

  // Recargo por no tener hijos: puntos extra sobre la cotización de
  // dependencia, y los paga el trabajador solo. Se cuelga de la banda de la
  // propia cotización para que respete su tope.
  const opSinHijos = opcionActiva(pais, opciones, "sinHijos");
  const cotsTrabajador: readonly Cotizacion[] = opSinHijos
    ? [
        ...pais.cotizacionesTrabajador,
        {
          id: "pv-recargo",
          nombre: "Dependencia · recargo sin hijos",
          tipo: (opSinHijos.parametro ?? 0) / 100,
          hasta: pais.cotizacionesTrabajador.find((c) => c.id === "pv")?.hasta,
        },
      ]
    : pais.cotizacionesTrabajador;

  const ssTrabajador = totalCotizaciones(renta, cotsTrabajador);
  const ssEmpresa = totalCotizaciones(renta, pais.cotizacionesEmpresa);

  const ivaPct = tramo.ivaSobreRenta;
  const iva = (renta * ivaPct) / 100;

  const espPct = especialesSobreRenta(
    tramo.ivaSobreRentaEs,
    pais.especialesFactor,
  );
  const especiales = (renta * espPct) / 100;

  // Otros tributos de bolsillo (tasas, pequeños impuestos locales…). Los
  // umbrales se escalan con el nivel salarial del país, igual que los deciles.
  const otrosPct =
    renta < 20_000 * pais.escalaRenta
      ? pais.otros.bajo
      : renta < 50_000 * pais.escalaRenta
        ? pais.otros.medio
        : pais.otros.alto;
  const otros = (renta * otrosPct) / 100;

  const conceptos: ConceptoFiscal[] = [
    {
      id: "irpf",
      nombre: pais.irpf.nombre,
      euros: irpf,
      pctRenta: irpfPct,
      color: "#c9a86a",
      nota: "Tipo efectivo orientativo sobre bruto · sin deducciones personales",
    },
    {
      id: "ss",
      nombre: "Cotizaciones (trabajador)",
      euros: ssTrabajador,
      pctRenta: (ssTrabajador / renta) * 100,
      color: "#3f80bd",
      nota: `${notaCotizaciones(renta, cotsTrabajador, pais)} · sale de tu nómina`,
    },
    {
      id: "ss-empresa",
      nombre: "Cotizaciones (empresa)",
      euros: ssEmpresa,
      pctRenta: (ssEmpresa / renta) * 100,
      color: "#1e4f7a",
      nota: `${notaCotizaciones(renta, pais.cotizacionesEmpresa, pais)} · no sale del neto, sí del coste de tu puesto`,
    },
    ...(iglesia > 0 && opIglesia
      ? [
          {
            id: "iglesia",
            nombre: "Impuesto religioso",
            euros: iglesia,
            pctRenta: (iglesia / renta) * 100,
            color: "#8b5a9e",
            nota: `${opIglesia.parametro} % de la cuota · voluntario, se puede salir`,
          },
        ]
      : []),
    {
      id: "iva",
      nombre: `${pais.iva.nombre} (en el consumo)`,
      euros: iva,
      pctRenta: ivaPct,
      color: "#5a9e7a",
      nota: `${pais.iva.nota} · propensión a consumir del tramo`,
    },
    {
      id: "especiales",
      nombre: "Especiales (carburante, etc.)",
      euros: especiales,
      pctRenta: espPct,
      color: "#e9a05c",
      nota: "Hidrocarburos, tabaco, alcohol… orden de magnitud",
    },
    {
      id: "otros",
      nombre: "Otros (tasas y locales)",
      euros: otros,
      pctRenta: otrosPct,
      color: "#6b7a94",
      nota: pais.otros.nota,
    },
  ];

  const totalImpuestos = conceptos.reduce((s, c) => s + c.euros, 0);
  const costeLaboralTotal = renta + ssEmpresa;
  const totalPctRenta = (totalImpuestos / renta) * 100;
  const totalPctCosteLaboral = (totalImpuestos / costeLaboralTotal) * 100;
  const rentaNetaAprox = Math.max(0, renta - irpf - iglesia - ssTrabajador);
  // La renta «disponible» para consumir ya descuenta IRPF+SS trabajador; el
  // IVA/especiales salen de ese bolsillo. La SS empresa no resta del neto
  // contable, pero sí entra en totalImpuestos (cuña del puesto).

  return {
    pais,
    renta,
    decil: tramo.decil,
    percentilAprox,
    percentilLabel: tramo.percentilLabel,
    nombreTramo: tramo.nombre,
    detalleTramo: tramo.detalle,
    color: tramo.color,
    posicionBarra: percentilAprox,
    conceptos,
    totalImpuestos,
    totalPctRenta,
    totalPctCosteLaboral,
    ssEmpresa,
    ssTrabajador,
    ssTotal: ssTrabajador + ssEmpresa,
    costeLaboralTotal,
    cuotaDecilImpuestosPct: tramo.cuotaImpuestosTotalesPct,
    cuotaDecilIvaPct: tramo.cuotaIvaPct,
    recaudacionNacionalMillones: pais.recaudacion.totalMillones,
    deCada100DelDecil: tramo.cuotaImpuestosTotalesPct,
    rentaNetaAprox,
  };
}
