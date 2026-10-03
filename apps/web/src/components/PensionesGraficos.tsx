"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import {
  ANUAL_2025,
  AYUDAS_SUBSISTENCIA,
  BRECHA_GENERO,
  COMPARATIVA_PENSIONES,
  DEFICIT_2025,
  GASTO_ANUAL,
  GASTO_COMPARADO,
  GASTO_POLITICO,
  HERO_PENSIONES,
  INSTANTANEA,
  INSTANTANEA_POR_CLASE,
  MEI_ESCALA,
  PESO_FISCAL_PENSIONES,
  PESO_FISCAL_PROYECCION,
  POR_CLASE,
  PROYECCION_PIB,
  RATIO_HISTORICO,
  RATIO_PROYECCION,
  REGLAS_JUBILACION,
  REVALORIZACION_ANUAL,
  type ClasePension,
} from "@/lib/pensiones-data";
import {
  anioJubilacion,
  edadEnAnio,
  etiquetaEdadCorta,
  useEdadPensiones,
} from "./EdadPensiones";
import { ShareDato } from "./ShareDato";

/** % del esfuerzo fiscal en un año: interpola la serie AIReF divulgativa. */
function pctEsfuerzoEnAnio(anio: number): number | null {
  const serie = PESO_FISCAL_PROYECCION;
  if (serie.length === 0) return null;
  if (anio <= serie[0]!.anio) return serie[0]!.pctEsfuerzoFiscal;
  const last = serie[serie.length - 1]!;
  if (anio >= last.anio) return last.pctEsfuerzoFiscal;
  for (let i = 1; i < serie.length; i++) {
    const a = serie[i - 1]!;
    const b = serie[i]!;
    if (anio <= b.anio) {
      const t = (anio - a.anio) / (b.anio - a.anio);
      return a.pctEsfuerzoFiscal + t * (b.pctEsfuerzoFiscal - a.pctEsfuerzoFiscal);
    }
  }
  return last.pctEsfuerzoFiscal;
}

/**
 * Ratio cotizantes/pensionista en un año concreto, interpolando la serie que
 * corresponda (histórico hasta su último punto, proyección a partir de ahí).
 * Sirve para clavar el marcador de jubilación sobre la curva.
 */
function ratioEnAnio(anio: number): number | null {
  const finHistorico = RATIO_HISTORICO[RATIO_HISTORICO.length - 1]!;
  const serie: readonly { anio: number; ratio: number }[] =
    anio <= finHistorico.anio ? RATIO_HISTORICO : RATIO_PROYECCION;
  if (serie.length === 0) return null;
  if (anio <= serie[0]!.anio) return serie[0]!.ratio;
  const last = serie[serie.length - 1]!;
  if (anio >= last.anio) return last.ratio;
  for (let i = 1; i < serie.length; i++) {
    const a = serie[i - 1]!;
    const b = serie[i]!;
    if (anio <= b.anio) {
      const t = (anio - a.anio) / (b.anio - a.anio);
      return a.ratio + t * (b.ratio - a.ratio);
    }
  }
  return last.ratio;
}

/* ── Helpers de formato ─────────────────────────────────────────── */

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

function fmtEuros(n: number, digitos = 0): string {
  return `${n.toLocaleString("es-ES", {
    minimumFractionDigits: digitos,
    maximumFractionDigits: digitos,
  })} €`;
}

function fmtMillones(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toLocaleString("es-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} mil M€`;
  }
  return `${n.toLocaleString("es-ES", {
    minimumFractionDigits: n < 100 ? 1 : 0,
    maximumFractionDigits: n < 100 ? 1 : 0,
  })} M€`;
}

function fmtPct(n: number, digitos = 1): string {
  return `${n.toLocaleString("es-ES", {
    minimumFractionDigits: digitos,
    maximumFractionDigits: digitos,
  })} %`;
}

function useCrecida(resetKey: string | number = 0) {
  const [crecida, setCrecida] = useState(false);
  useEffect(() => {
    setCrecida(false);
    const t = requestAnimationFrame(() => setCrecida(true));
    return () => cancelAnimationFrame(t);
  }, [resetKey]);
  return crecida;
}

/** Contador animado de 0 → target (ease-out). */
function useCountUp(target: number, ms = 1400, enabled = true) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!enabled) {
      setValor(0);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      const ease = 1 - (1 - p) ** 3;
      setValor(target * ease);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, enabled]);
  return valor;
}

/**
 * Origen común del contador en vivo: se fija la primera vez que arranca un
 * contador en esta carga de página. Al compartirlo, el bloque del hero y el
 * del cierre marcan exactamente la misma cifra aunque monten en momentos
 * distintos (el segundo vive bajo el «ver resto del informe»).
 */
let origenGastoVivo: number | null = null;

function origenGasto(): number {
  origenGastoVivo ??= performance.now();
  return origenGastoVivo;
}

/**
 * Acumula euros a `eurosPorSegundo` desde que se abrió la página. El valor
 * no depende del montaje: sale siempre del origen compartido.
 */
function useGastoDesdeApertura(eurosPorSegundo: number, enabled = true) {
  const [acumulado, setAcumulado] = useState(0);

  useEffect(() => {
    if (!enabled || eurosPorSegundo <= 0) {
      setAcumulado(0);
      return;
    }
    const t0 = origenGasto();
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Con reduced-motion solo un tick por segundo; si no, ~4/s para que
    // se vea «vivo» sin saturar el re-render.
    const cadaMs = reduce ? 1000 : 250;

    const tick = () => {
      const segundos = (performance.now() - t0) / 1000;
      setAcumulado(segundos * eurosPorSegundo);
    };
    tick();
    const id = window.setInterval(tick, cadaMs);
    return () => window.clearInterval(id);
  }, [eurosPorSegundo, enabled]);

  return acumulado;
}

/** Formato del contador en vivo: 5.567 → 1,2 M → 1,3 mil M. */
function fmtEurosAcumulados(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0";
  if (n < 1_000_000) {
    return Math.round(n).toLocaleString("es-ES");
  }
  if (n < 1_000_000_000) {
    return `${(n / 1_000_000).toLocaleString("es-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    })} M`;
  }
  return `${(n / 1_000_000_000).toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })} mil M`;
}

/* ── Contador en vivo del gasto ─────────────────────────────────── */

// 481 M€/día → ~5.567 € cada segundo.
const EUROS_POR_SEGUNDO = (HERO_PENSIONES.millonesDia * 1_000_000) / 86_400;

/**
 * Tarjeta del gasto acumulado desde que se abrió la página. Se usa dos veces
 * —en el hero y al cerrar el informe— y ambas comparten origen, así que
 * siempre cantan la misma cifra.
 *
 * `anunciar` deja el aria-live en una sola instancia: dos regiones vivas
 * repitiendo lo mismo cuatro veces por segundo son ruido para un lector.
 */
function ContadorGastoVivo({
  activo = true,
  grande = false,
  anunciar = false,
}: {
  activo?: boolean;
  grande?: boolean;
  anunciar?: boolean;
}) {
  const gastado = useGastoDesdeApertura(EUROS_POR_SEGUNDO, activo);

  return (
    <div className={`pen-hero-stat pen-vivo${grande ? " es-grande" : ""}`}>
      <strong {...(anunciar ? { "aria-live": "polite" as const } : {})}>
        ~{fmtEurosAcumulados(gastado)} €
      </strong>
      <span>
        desde que abriste esta página · ~
        {Math.round(EUROS_POR_SEGUNDO).toLocaleString("es-ES")} €/s
      </span>
    </div>
  );
}

/* ── KPIs ───────────────────────────────────────────────────────── */

const KPIS = [
  {
    id: "pensiones",
    etiqueta: "Pensiones en pago",
    valor: () => `${(INSTANTANEA.pensiones / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 2 })} M`,
    nota: INSTANTANEA.periodo,
    acento: "gold" as const,
  },
  {
    id: "nomina",
    etiqueta: "Nómina mensual",
    valor: () => fmtMillones(INSTANTANEA.nominaMensualMillones),
    nota: INSTANTANEA.periodo,
    acento: "blue" as const,
  },
  {
    id: "media",
    etiqueta: "Pensión media",
    valor: () => fmtEuros(INSTANTANEA.pensionMedia, 0),
    nota: "Todas las clases",
    acento: "gold" as const,
  },
  {
    id: "jubilacion",
    etiqueta: "Jubilación media",
    valor: () => fmtEuros(INSTANTANEA.jubilacionMedia, 0),
    nota: "La más alta del sistema",
    acento: "green" as const,
  },
  {
    id: "ratio",
    etiqueta: "Cotizantes por pensión",
    valor: () => INSTANTANEA.ratioCotizantes.toLocaleString("es-ES", { minimumFractionDigits: 1 }),
    nota: "Ratio bruto · ~22 M afiliados",
    acento: "rose" as const,
  },
  {
    id: "anual",
    etiqueta: "Gasto 2025",
    valor: () => fmtMillones(ANUAL_2025.gastoContributivoMillones),
    nota: "Pensiones contributivas",
    acento: "blue" as const,
  },
] as const;

export function PensionesKpis() {
  const crecida = useCrecida();
  return (
    <div className={`share-host${crecida ? " es-crecida" : ""}`}>
      <ShareDato text="Pensiones en España: ~10,5 M pensiones, nómina mensual ~14.400 M€ y media ~1.372 € (jul. 2026)." />
      <ul className={`pen-kpis${crecida ? " es-crecida" : ""}`}>
        {KPIS.map((k) => (
          <li key={k.id} className={`pen-kpi pen-kpi-${k.acento}`}>
            <span className="pen-kpi-etiqueta">{k.etiqueta}</span>
            <span className="pen-kpi-valor">{k.valor()}</span>
            <span className="pen-kpi-nota">{k.nota}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Donut por clase ────────────────────────────────────────────── */

type MedidaClase = "dinero" | "pensiones";

export function PensionesDonut() {
  const [medida, setMedida] = useState<MedidaClase>("dinero");
  const [activa, setActiva] = useState<string | null>(null);
  const crecida = useCrecida(medida);
  const uid = useId();

  const total = useMemo(
    () =>
      POR_CLASE.reduce(
        (s, c) => s + (medida === "dinero" ? c.importeMillones : c.pensiones),
        0,
      ),
    [medida],
  );

  const tramos = useMemo(() => {
    let acc = 0;
    return POR_CLASE.map((c) => {
      const valor = medida === "dinero" ? c.importeMillones : c.pensiones;
      const pct = (valor / total) * 100;
      const start = acc;
      acc += pct;
      return { ...c, valor, pct, start };
    });
  }, [medida, total]);

  // Donut SVG: radio 42, circunferencia 2πr ≈ 263.9
  const R = 42;
  const C = 2 * Math.PI * R;
  const destacada = tramos.find((t) => t.id === (activa ?? "jubilacion")) ?? tramos[0];

  return (
    <figure className="pen-chart pen-donut-wrap">
      <ShareDato text="La jubilación se lleva la mayor parte de la nómina de pensiones; viudedad e incapacidad completan el grueso del sistema." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">Reparto por tipo de pensión</span>
        <span className="pen-medidas" role="group" aria-label="Medir el reparto por">
          <button
            type="button"
            className="pen-medida"
            aria-pressed={medida === "dinero"}
            onClick={() => setMedida("dinero")}
          >
            Dinero
          </button>
          <button
            type="button"
            className="pen-medida"
            aria-pressed={medida === "pensiones"}
            onClick={() => setMedida("pensiones")}
          >
            Número
          </button>
        </span>
      </figcaption>

      <div className="pen-donut-body">
        <div className="pen-donut-svg-wrap">
          <svg viewBox="0 0 100 100" className="pen-donut" aria-hidden="true">
            <defs>
              <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#c9a86a" floodOpacity="0.35" />
              </filter>
            </defs>
            {tramos.map((t) => {
              const len = crecida ? (t.pct / 100) * C : 0;
              const gap = 1.2;
              const dash = Math.max(0, len - gap);
              const offset = C - (t.start / 100) * C + C * 0.25;
              const isOn = activa === null || activa === t.id;
              return (
                <circle
                  key={t.id}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={t.color}
                  strokeWidth={activa === t.id ? 14 : 11}
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={offset}
                  strokeLinecap="butt"
                  opacity={isOn ? 1 : 0.28}
                  filter={activa === t.id ? `url(#${uid}-glow)` : undefined}
                  className="pen-donut-arco"
                  onMouseEnter={() => setActiva(t.id)}
                  onMouseLeave={() => setActiva(null)}
                  style={{ cursor: "pointer" }}
                />
              );
            })}
            <circle cx="50" cy="50" r="30" fill="#0d1626" />
          </svg>
          <div className="pen-donut-centro">
            <span className="pen-donut-centro-pct">{fmtPct(destacada.pct)}</span>
            <span className="pen-donut-centro-nombre">{destacada.nombre}</span>
          </div>
        </div>

        <ul className="pen-donut-leyenda">
          {tramos.map((t) => (
            <li
              key={t.id}
              className={activa === t.id ? "es-activa" : undefined}
              onMouseEnter={() => setActiva(t.id)}
              onMouseLeave={() => setActiva(null)}
            >
              <i style={{ background: t.color }} aria-hidden="true" />
              <span className="pen-donut-leyenda-nombre">{t.nombre}</span>
              <span className="pen-donut-leyenda-valor">
                {fmtPct(t.pct)}
                <span className="pen-donut-leyenda-bruto">
                  {medida === "dinero"
                    ? fmtMillones(t.importeMillones)
                    : `${fmtInt(t.pensiones / 1000)} mil`}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="pen-chart-pie">Nómina de diciembre de 2025 · Seguridad Social</p>
    </figure>
  );
}

/* ── Barras de pensión media por clase ──────────────────────────── */

export function PensionesMediasBarras() {
  const crecida = useCrecida();
  const max = Math.max(...POR_CLASE.map((c) => c.media));

  return (
    <figure className="pen-chart">
      <ShareDato text="Pensión media de jubilación ~1.500+ €; viudedad y orfandad quedan muy por debajo. La brecha entre clases es enorme." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">Pensión media por clase</span>
      </figcaption>
      <ul className="pen-barras">
        {POR_CLASE.map((c: ClasePension) => {
          const pct = (c.media / max) * 100;
          return (
            <li key={c.id}>
              <div className="pen-barra-meta">
                <span className="pen-barra-nombre">{c.nombre}</span>
                <span className="pen-barra-valor">{fmtEuros(c.media, 0)}</span>
              </div>
              <div className="pen-barra-pista" role="presentation">
                <div
                  className="pen-barra-fill"
                  style={{
                    width: crecida ? `${pct}%` : "0%",
                    background: c.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="pen-chart-pie">Medias de diciembre de 2025 · 14 pagas al año</p>
    </figure>
  );
}

/* ── Evolución del gasto anual ──────────────────────────────────── */

export function PensionesGastoBarras() {
  const crecida = useCrecida();
  const max = Math.max(...GASTO_ANUAL.map((g) => g.millones));

  return (
    <figure className="pen-chart">
      <ShareDato text="El gasto en pensiones contributivas superó los 182 mil M€ en 2025 y sigue subiendo año tras año." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">Gasto anual en pensiones contributivas</span>
      </figcaption>
      <div className="pen-columnas" role="img" aria-label="Gasto anual de 2020 a 2025">
        {GASTO_ANUAL.map((g) => {
          const h = (g.millones / max) * 100;
          const esUltimo = g.anio === 2025;
          return (
            <div key={g.anio} className={`pen-col${esUltimo ? " es-destacada" : ""}`}>
              <span className="pen-col-valor">
                {g.anio >= 2023 ? fmtMillones(g.millones) : `${Math.round(g.millones / 1000)} mil M€`}
              </span>
              <div className="pen-col-pista">
                <div
                  className="pen-col-fill"
                  style={{ height: crecida ? `${h}%` : "0%" }}
                />
              </div>
              <span className="pen-col-anio">{g.anio}</span>
            </div>
          );
        })}
      </div>
      <p className="pen-chart-pie">
        2020–2022 redondeados · 2023–2025 según cifras publicadas del gasto contributivo
      </p>
    </figure>
  );
}

/* ── Escala del gasto público ───────────────────────────────────── */

/** «×2,5» / «×53»: decimal solo mientras aporta algo. */
function fmtVeces(n: number): string {
  return n < 10
    ? n.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 })
    : Math.round(n).toLocaleString("es-ES");
}

/** «~7 días» / «~1 día y medio»: la comparación en tiempo, redondeada. */
function fmtDias(n: number): string {
  if (n < 2) {
    const redondeado = Math.round(n * 2) / 2;
    return redondeado === 1
      ? "1 día"
      : `${redondeado.toLocaleString("es-ES", { maximumFractionDigits: 1 })} días`;
  }
  return `${Math.round(n)} días`;
}

/**
 * Las partidas grandes del gasto público, en columnas y a escala real.
 *
 * Va en segundo lugar, justo detrás del hero, porque el hero deja una cifra
 * enorme flotando («190 mil millones») y una cifra sin contexto no se puede
 * juzgar: aquí se le pone al lado la sanidad, la educación, la deuda, la
 * defensa y el gasto político para que el lector vea de qué tamaño estamos
 * hablando antes de meterse en el detalle del sistema.
 *
 * Dos decisiones deliberadas sobre la barra pequeña:
 *
 *  1. La escala es REAL, no logarítmica ni recortada. Que la última barra
 *     quede en un hilo no es un defecto del gráfico: es el dato. Se le pone
 *     un mínimo de 3 px solo para que exista visualmente.
 *  2. Se pinta con la estimación AMPLIA del gasto político (la que más
 *     abulta) y el desglose de la estrecha queda debajo, para que nadie tenga
 *     que fiarse de un número que no puede comprobar.
 */
export function PensionesGastoComparado() {
  const crecida = useCrecida();
  const items = GASTO_COMPARADO.items;
  const referencia = items.find((i) => i.referencia) ?? items[0]!;
  const max = Math.max(...items.map((i) => i.millones));

  const porDia = referencia.millones / 365;
  const diasAmplio = GASTO_POLITICO.amplioMillones / porDia;
  const diasEstrecho = GASTO_POLITICO.estrechoMillones / porDia;
  const vecesAmplio = referencia.millones / GASTO_POLITICO.amplioMillones;

  const resumen = items
    .map((i) => `${i.etiqueta}, ${fmtMillones(i.millones)}`)
    .join("; ");

  return (
    <figure className={`pen-chart pen-escala share-host${crecida ? " es-crecida" : ""}`}>
      <ShareDato
        text={`Pensiones y prestaciones: ~${fmtMillones(referencia.millones)} al año. Todo el gasto político y la Casa Real caben ~${fmtVeces(vecesAmplio)} veces dentro, incluso con la estimación más amplia.`}
      />

      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">{GASTO_COMPARADO.titulo}</span>
        <span className="pen-escala-periodo">{GASTO_COMPARADO.periodo}</span>
      </figcaption>

      <p className="pen-escala-intro">
        Las mismas barras, la misma escala y ningún truco de eje. Cada columna
        es lo que cuesta un año de esa partida en el conjunto de las
        administraciones.
      </p>

      <div
        className="pen-columnas pen-escala-cols"
        role="img"
        aria-label={`Gasto público anual comparado a escala real: ${resumen}.`}
      >
        {items.map((item) => {
          const pct = (item.millones / max) * 100;
          const veces = referencia.millones / item.millones;
          return (
            <div
              key={item.id}
              className={`pen-col pen-escala-col${item.referencia ? " es-destacada" : ""}`}
            >
              <span className="pen-escala-valor">
                <strong>{fmtMillones(item.millones)}</strong>
                <small>
                  {item.referencia ? "la referencia" : `×${fmtVeces(veces)}`}
                </small>
              </span>
              <div className="pen-col-pista">
                <div
                  className="pen-col-fill"
                  style={{
                    // Solo el porcentaje real. El mínimo de 3 px que hace
                    // visible la barra pequeña va como `min-height` en el CSS
                    // y no aquí: `max()` dentro de una propiedad con
                    // `transition` deja la animación viva y las barras se
                    // quedan congeladas a mitad de altura.
                    height: crecida ? `${pct.toFixed(2)}%` : "0%",
                    background: `linear-gradient(180deg, ${item.color}, ${item.colorFondo})`,
                  }}
                />
              </div>
              <span className="pen-escala-etq">
                {/* Dos rótulos y no uno: en 375 px «Pensiones y prestaciones»
                    se parte en cuatro líneas y se come la mitad del alto del
                    gráfico. El nombre largo sigue en el aria-label. */}
                <span className="pen-escala-etq-larga">{item.etiqueta}</span>
                <span className="pen-escala-etq-corta">{item.etiquetaCorta}</span>
                <small>
                  {item.nota} · {item.anio}
                </small>
              </span>
            </div>
          );
        })}
      </div>

      <p className="pen-escala-leyenda">
        <strong>×N</strong> = cuántas veces cabe esa partida dentro de la de
        pensiones y prestaciones.
      </p>

      <div className="pen-escala-desglose">
        <p className="pen-escala-desglose-k">Qué hay dentro de la barra pequeña</p>
        <ul>
          {GASTO_POLITICO.partidas.map((p) => (
            <li key={p.id}>
              <span className="pen-escala-p-k">{p.etiqueta}</span>
              <span className="pen-escala-p-v">
                {Number.isInteger(p.millones)
                  ? `${p.millones.toLocaleString("es-ES")} M€`
                  : fmtMillones(p.millones)}
              </span>
              <span className="pen-escala-p-n">{p.nota}</span>
            </li>
          ))}
        </ul>
        <p className="pen-escala-desglose-pie">
          Eso suma ~{fmtMillones(GASTO_POLITICO.estrechoMillones)}: es la
          definición estrecha, la que se puede señalar en presupuestos
          publicados. <strong>La barra del gráfico no usa esa</strong>, usa una
          estimación amplia de ~{fmtMillones(GASTO_POLITICO.amplioMillones)} que
          añade altos cargos, personal eventual y asesores de las tres
          administraciones. Se ha elegido a propósito la cifra que más abulta:
          si aun así la barra queda en un hilo, la conclusión no depende de
          dónde se ponga el corte.
        </p>
      </div>

      <div className="pen-callout pen-escala-punch">
        <p>
          <strong>
            Todo el gasto político y la Casa Real de un año caben en ~
            {fmtDias(diasAmplio)} de pensiones y prestaciones.
          </strong>{" "}
          Con la definición estrecha, en ~{fmtDias(diasEstrecho)}. Esto no dice
          si ese dinero está bien o mal gastado —es una pregunta legítima y
          distinta—: dice que su tamaño no es la palanca del sistema. Lo que
          mueve de verdad la factura de las pensiones son las cotizaciones, los
          impuestos, la edad efectiva de jubilación y la revalorización. Ahí
          están los miles de millones.
        </p>
      </div>

      <p className="pen-chart-pie">
        <strong>Cada barra lleva su año</strong> porque las estadísticas no
        cierran a la vez: sanidad y educación publican la suya con año y medio
        de retraso, así que 2024 es el último dato cerrado. Defensa va por el
        criterio de la OTAN (2,0 % del PIB), que es el que se debate en
        público y más del doble que el presupuesto del Ministerio; incluye las
        clases pasivas militares, así que una parte pequeña se cuenta también
        en la barra de pensiones. Los intereses no son una estimación: son la
        diferencia entre el saldo primario y el déficit total de 2025.
        Sanidad, educación y defensa comparten cifra con la sección «¿Quién
        paga la fiesta?» para que las dos páginas no digan cosas distintas. El
        gasto político no es una partida presupuestaria sino una etiqueta:
        cada estudio mete dentro cosas distintas, y por eso aquí va con
        desglose y horquilla. Fuentes:{" "}
        {GASTO_COMPARADO.fuentes.map((f) => f.etiqueta).join(" · ")}.
      </p>
    </figure>
  );
}

/* ── Proyección % PIB (líneas SVG) ──────────────────────────────── */

export function PensionesProyeccion() {
  const crecida = useCrecida();
  const uid = useId();
  const edad = useEdadPensiones();
  const [serie, setSerie] = useState<"ambas" | "airef" | "ministerio">("ambas");

  const W = 360;
  // Más alto abajo si hay edad: caben año + «tú X a.»
  const H = edad != null ? 196 : 180;
  const pad = { t: 16, r: 12, b: edad != null ? 44 : 28, l: 36 };
  const anios = PROYECCION_PIB.airef.map((p) => p.anio);
  const minA = Math.min(...anios);
  const maxA = Math.max(...anios);
  const minY = 12;
  const maxY = 17;

  const x = (anio: number) =>
    pad.l + ((anio - minA) / (maxA - minA)) * (W - pad.l - pad.r);
  const y = (pct: number) =>
    pad.t + (1 - (pct - minY) / (maxY - minY)) * (H - pad.t - pad.b);

  const pathOf = (pts: readonly { anio: number; pct: number }[]) =>
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.anio).toFixed(1)} ${y(p.pct).toFixed(1)}`)
      .join(" ");

  const gridYs = [13, 14, 15, 16];
  const aniosEje = anios.filter((a) => a === 2023 || a === 2050 || a === 2070);
  const edad2050 = etiquetaEdadCorta(edad, 2050);

  return (
    <figure className="pen-chart">
      <ShareDato text="AIReF proyecta el gasto en pensiones hacia ~16,4% del PIB en 2050. La sostenibilidad es el debate de fondo." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">Proyección del gasto · % del PIB</span>
        <span className="pen-medidas" role="group" aria-label="Series de proyección">
          <button
            type="button"
            className="pen-medida"
            aria-pressed={serie === "ambas"}
            onClick={() => setSerie("ambas")}
          >
            Ambas
          </button>
          <button
            type="button"
            className="pen-medida"
            aria-pressed={serie === "airef"}
            onClick={() => setSerie("airef")}
          >
            AIReF
          </button>
          <button
            type="button"
            className="pen-medida"
            aria-pressed={serie === "ministerio"}
            onClick={() => setSerie("ministerio")}
          >
            Ministerio
          </button>
        </span>
      </figcaption>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className={`pen-lineas${crecida ? " es-crecida" : ""}`}
        role="img"
        aria-label="Proyección del gasto en pensiones como porcentaje del PIB hasta 2070"
      >
        <defs>
          <linearGradient id={`${uid}-area`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a86a" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#c9a86a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridYs.map((g) => (
          <g key={g}>
            <line
              x1={pad.l}
              x2={W - pad.r}
              y1={y(g)}
              y2={y(g)}
              className="pen-grid"
            />
            <text x={pad.l - 6} y={y(g) + 3} className="pen-axis" textAnchor="end">
              {g}%
            </text>
          </g>
        ))}

        {aniosEje.map((a) => {
          const tu = etiquetaEdadCorta(edad, a);
          return (
            <g key={a}>
              <text
                x={x(a)}
                y={H - (tu ? 18 : 8)}
                className="pen-axis"
                textAnchor="middle"
              >
                {a}
              </text>
              {tu && (
                <text
                  x={x(a)}
                  y={H - 6}
                  className="pen-axis pen-axis-edad"
                  textAnchor="middle"
                >
                  {tu}
                </text>
              )}
            </g>
          );
        })}

        {(serie === "ambas" || serie === "airef") && (
          <>
            <path
              d={`${pathOf(PROYECCION_PIB.airef)} L ${x(2070)} ${y(minY)} L ${x(2023)} ${y(minY)} Z`}
              fill={`url(#${uid}-area)`}
              className="pen-area"
            />
            <path
              d={pathOf(PROYECCION_PIB.airef)}
              className="pen-linea pen-linea-airef"
              fill="none"
            />
            {PROYECCION_PIB.airef
              .filter((p) => p.oficial)
              .map((p) => (
                <g key={`a-${p.anio}`}>
                  <circle cx={x(p.anio)} cy={y(p.pct)} r="3.5" className="pen-punto pen-punto-airef" />
                  <text
                    x={x(p.anio)}
                    y={y(p.pct) - 8}
                    className="pen-punto-label"
                    textAnchor="middle"
                  >
                    {fmtPct(p.pct)}
                  </text>
                </g>
              ))}
          </>
        )}

        {(serie === "ambas" || serie === "ministerio") && (
          <>
            <path
              d={pathOf(PROYECCION_PIB.ministerio)}
              className="pen-linea pen-linea-min"
              fill="none"
            />
            {PROYECCION_PIB.ministerio
              .filter((p) => p.oficial)
              .map((p) => (
                <g key={`m-${p.anio}`}>
                  <circle cx={x(p.anio)} cy={y(p.pct)} r="3.5" className="pen-punto pen-punto-min" />
                  {serie === "ministerio" && (
                    <text
                      x={x(p.anio)}
                      y={y(p.pct) - 8}
                      className="pen-punto-label"
                      textAnchor="middle"
                    >
                      {fmtPct(p.pct)}
                    </text>
                  )}
                </g>
              ))}
          </>
        )}
      </svg>

      <ul className="pen-lineas-leyenda">
        <li>
          <i className="pen-clave-airef" aria-hidden="true" />
          AIReF · pico{" "}
          {PROYECCION_PIB.airef
            .find((p) => p.anio === 2050)
            ?.pct.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
          % en 2050
          {edad2050 ? ` · ${edad2050}` : ""}
        </li>
        <li>
          <i className="pen-clave-min" aria-hidden="true" />
          Ministerio (INTegraSS) · pico{" "}
          {PROYECCION_PIB.ministerio
            .find((p) => p.anio === 2050)
            ?.pct.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
          % en 2050
          {edad2050 ? ` · ${edad2050}` : ""}
        </li>
      </ul>
      <p className="pen-chart-pie">
        Hitos oficiales; tramos intermedios orientativos para la curva. No es un
        pronóstico de la pensión individual.
        {edad != null &&
          " Las edades bajo el eje son las tuyas en ese año de calendario."}
      </p>
    </figure>
  );
}

/* ── Ratio histórico ────────────────────────────────────────────── */

export function PensionesRatio() {
  const crecida = useCrecida();
  const edad = useEdadPensiones();
  const max = 4.2;
  const min = 1.5;
  const W = 360;
  const H = edad != null ? 168 : 152;
  const pad = { t: 12, r: 10, b: edad != null ? 40 : 28, l: 28 };

  // Eje X por año calendario: histórico + proyección hasta 2070.
  const anioMin = RATIO_HISTORICO[0]!.anio;
  const anioMax = RATIO_PROYECCION[RATIO_PROYECCION.length - 1]!.anio;
  const x = (anio: number) =>
    pad.l + ((anio - anioMin) / (anioMax - anioMin)) * (W - pad.l - pad.r);
  const y = (r: number) =>
    pad.t + (1 - (r - min) / (max - min)) * (H - pad.t - pad.b);

  const pathOf = (pts: readonly { anio: number; ratio: number }[]) =>
    pts
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"} ${x(p.anio).toFixed(1)} ${y(p.ratio).toFixed(1)}`,
      )
      .join(" ");

  const dHist = pathOf(RATIO_HISTORICO);
  const dProj = pathOf(RATIO_PROYECCION);
  const ratio2050 = RATIO_PROYECCION.find((p) => p.anio === 2050)?.ratio ?? 1.7;
  const edad2050 = etiquetaEdadCorta(edad, 2050);
  const aniosEje = [1980, 2000, 2026, 2050, 2070] as const;

  // Marcador vertical del año en que se jubila el lector.
  const anioJub = anioJubilacion(edad);
  const jubEnRango =
    anioJub != null && anioJub >= anioMin && anioJub <= anioMax;
  const ratioJub = jubEnRango ? ratioEnAnio(anioJub!) : null;
  // El rótulo se ancla al lado con hueco para no salirse del viewBox.
  const jubEtiquetaAlDerecha = jubEnRango && x(anioJub!) < W - pad.r - 52;

  return (
    <figure className="pen-chart">
      <ShareDato text={`Hay ~${INSTANTANEA.ratioCotizantes.toLocaleString("es-ES", { minimumFractionDigits: 1 })} cotizantes por pensionista hoy. La proyección orientativa cae hacia ~${ratio2050.toLocaleString("es-ES", { minimumFractionDigits: 1 })} en 2050: la demografía aprieta el reparto.`} />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">Cotizantes por pensionista</span>
        <span className="pen-badge">
          ~{INSTANTANEA.ratioCotizantes.toLocaleString("es-ES", { minimumFractionDigits: 1 })} hoy · ~{ratio2050.toLocaleString("es-ES", { minimumFractionDigits: 1 })} en 2050
          {edad2050 ? ` · ${edad2050}` : ""}
        </span>
      </figcaption>

      <div className="pen-ratio-hero">
        <div className="pen-ratio-numeros">
          <div>
            <span className="pen-ratio-grande">{INSTANTANEA.ratioCotizantes.toLocaleString("es-ES", { minimumFractionDigits: 1 })}</span>
            <span className="pen-ratio-unidad">afiliados por pensionista</span>
          </div>
          <p className="pen-ratio-explicacion">
            En los años 80 el ratio superaba con holgura los 3. Hoy ronda{" "}
            {INSTANTANEA.ratioCotizantes.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
            })}
            : cada persona que cobra se sostiene, en bruto, con algo más de dos
            cotizantes. La proyección (línea de puntos) apunta a{" "}
            <strong>
              ~{ratio2050.toLocaleString("es-ES", { minimumFractionDigits: 1 })} en
              2050
            </strong>
            {edad2050 ? ` (${edad2050})` : ""}: menos de dos cotizantes por
            pensionista en el pico del baby boom.
          </p>
        </div>

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className={`pen-lineas pen-ratio-svg${crecida ? " es-crecida" : ""}`}
          role="img"
          aria-label={`Evolución del ratio cotizantes por pensionista de 1980 a 2070, con proyección a partir de 2026${
            jubEnRango && ratioJub != null
              ? `. Marca vertical en ${anioJub}, año en que te jubilarías, con ~${ratioJub.toLocaleString("es-ES", { maximumFractionDigits: 1 })} cotizantes por pensionista`
              : ""
          }`}
        >
          <line x1={pad.l} x2={W - pad.r} y1={y(3)} y2={y(3)} className="pen-grid" />
          <line x1={pad.l} x2={W - pad.r} y1={y(2)} y2={y(2)} className="pen-grid" />
          <line x1={pad.l} x2={W - pad.r} y1={y(1.7)} y2={y(1.7)} className="pen-grid" />
          <text x={pad.l - 4} y={y(3) + 3} className="pen-axis" textAnchor="end">
            3
          </text>
          <text x={pad.l - 4} y={y(2) + 3} className="pen-axis" textAnchor="end">
            2
          </text>
          <text x={pad.l - 4} y={y(1.7) + 3} className="pen-axis" textAnchor="end">
            1,7
          </text>

          {/* Marcador de jubilación: va debajo de las curvas para no taparlas. */}
          {jubEnRango && (
            <line
              x1={x(anioJub!)}
              x2={x(anioJub!)}
              y1={pad.t}
              y2={H - pad.b}
              className="pen-ratio-jub-linea"
            />
          )}

          {/* Histórico: trazo continuo. */}
          <path d={dHist} className="pen-linea pen-linea-airef" fill="none" />
          {RATIO_HISTORICO.map((p, i) => (
            <circle
              key={`h-${p.anio}`}
              cx={x(p.anio)}
              cy={y(p.ratio)}
              r={i === RATIO_HISTORICO.length - 1 ? 4 : 2.5}
              className="pen-punto pen-punto-airef"
            />
          ))}

          {/* Proyección: puntos suspensivos (stroke-dasharray). */}
          <path
            d={dProj}
            className="pen-linea pen-linea-proyeccion"
            fill="none"
          />
          {RATIO_PROYECCION.map((p, i) =>
            i === 0 ? null : (
              <circle
                key={`p-${p.anio}`}
                cx={x(p.anio)}
                cy={y(p.ratio)}
                r={p.oficial ? 3.5 : 2.5}
                className={
                  p.oficial
                    ? "pen-punto pen-punto-proyeccion es-oficial"
                    : "pen-punto pen-punto-proyeccion"
                }
              />
            ),
          )}
          {/* Etiqueta del hito 2050 sobre el punto. */}
          <text
            x={x(2050)}
            y={y(ratio2050) - 8}
            className="pen-punto-label"
            textAnchor="middle"
          >
            {ratio2050.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}
          </text>

          {/* Punto y rótulo de la jubilación, encima de todo lo demás. */}
          {jubEnRango && ratioJub != null && (
            <g className="pen-ratio-jub">
              <circle
                cx={x(anioJub!)}
                cy={y(ratioJub)}
                r={4.5}
                className="pen-ratio-jub-punto"
              />
              <text
                x={x(anioJub!) + (jubEtiquetaAlDerecha ? 6 : -6)}
                y={pad.t + 8}
                className="pen-ratio-jub-label"
                textAnchor={jubEtiquetaAlDerecha ? "start" : "end"}
              >
                te jubilas · {anioJub}
              </text>
              <text
                x={x(anioJub!) + (jubEtiquetaAlDerecha ? 6 : -6)}
                y={pad.t + 19}
                className="pen-ratio-jub-label pen-ratio-jub-label-sub"
                textAnchor={jubEtiquetaAlDerecha ? "start" : "end"}
              >
                ~
                {ratioJub.toLocaleString("es-ES", {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}{" "}
                cotizantes
              </text>
            </g>
          )}

          {aniosEje.map((a) => {
            const tu = etiquetaEdadCorta(edad, a);
            const anchor =
              a === anioMin ? "start" : a === anioMax ? "end" : "middle";
            return (
              <g key={a}>
                <text
                  x={x(a)}
                  y={H - (tu ? 18 : 6)}
                  className="pen-axis"
                  textAnchor={anchor}
                >
                  {a}
                </text>
                {tu && (
                  <text
                    x={x(a)}
                    y={H - 6}
                    className="pen-axis pen-axis-edad"
                    textAnchor={anchor}
                  >
                    {tu}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <ul className="pen-lineas-leyenda">
        <li>
          <i className="pen-clave-airef" aria-hidden="true" />
          Histórico (hasta 2026)
        </li>
        <li>
          <i className="pen-clave-proyeccion" aria-hidden="true" />
          Proyección orientativa · ~{ratio2050.toLocaleString("es-ES", { minimumFractionDigits: 1 })} en 2050
          {edad2050 ? ` · ${edad2050}` : ""}
        </li>
        {jubEnRango && ratioJub != null && (
          <li>
            <i className="pen-clave-jub" aria-hidden="true" />
            Tu jubilación ({anioJub}) · ~
            {ratioJub.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            cotizantes por pensionista
          </li>
        )}
        {anioJub != null && !jubEnRango && (
          <li>
            Te jubilarías en <strong>{anioJub}</strong>, más allá de donde llega
            esta proyección ({anioMax}).
          </li>
        )}
      </ul>
      <p className="pen-chart-pie">
        Serie divulgativa; el ratio bruto no pondera por bases de cotización ni
        jornada. La parte de puntos no es un dato oficial año a año: resume el
        orden de magnitud («menos de 2 cotizantes por pensionista hacia 2050»)
        que citan AIReF y el Banco de España en lecturas públicas.
      </p>
    </figure>
  );
}

/* ── Brecha de género ───────────────────────────────────────────── */

export function PensionesBrecha() {
  const crecida = useCrecida();
  const max = BRECHA_GENERO.hombres;
  const diff = BRECHA_GENERO.hombres - BRECHA_GENERO.mujeres;
  const pctMujeres = (BRECHA_GENERO.mujeres / max) * 100;

  return (
    <figure className="pen-chart pen-brecha">
      <ShareDato text="Brecha de género: la pensión media de las mujeres queda claramente por debajo de la de los hombres. No es un detalle, es estructural." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">Brecha de género en la pensión media</span>
      </figcaption>

      <div className="pen-brecha-diff">
        <span className="pen-brecha-diff-num">{fmtEuros(diff, 0)}</span>
        <span className="pen-brecha-diff-txt">de diferencia mensual de media</span>
      </div>

      <div className="pen-brecha-filas">
        <div className="pen-brecha-fila">
          <span className="pen-brecha-label">Hombres</span>
          <div className="pen-barra-pista">
            <div
              className="pen-barra-fill pen-brecha-h"
              style={{ width: crecida ? "100%" : "0%" }}
            />
          </div>
          <span className="pen-brecha-valor">{fmtEuros(BRECHA_GENERO.hombres, 0)}</span>
        </div>
        <div className="pen-brecha-fila">
          <span className="pen-brecha-label">Mujeres</span>
          <div className="pen-barra-pista">
            <div
              className="pen-barra-fill pen-brecha-m"
              style={{ width: crecida ? `${pctMujeres}%` : "0%" }}
            />
          </div>
          <span className="pen-brecha-valor">{fmtEuros(BRECHA_GENERO.mujeres, 0)}</span>
        </div>
      </div>
      <p className="pen-chart-pie">{BRECHA_GENERO.periodo} · EpData / Seguridad Social</p>
    </figure>
  );
}

/* ── Comparador visual afiliados vs pensionistas ────────────────── */

export function PensionesBalance() {
  const crecida = useCrecida();
  // Representación: 22 iconos-slot → ~2,3 : 1
  const cot = 23;
  const pen = 10;

  return (
    <figure className="pen-chart pen-balance">
      <ShareDato text="El sistema de reparto equilibra cotizaciones de hoy con pensiones de hoy. Si baja el ratio cotizante/pensionista, sube la tensión." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">El equilibrio en una imagen</span>
      </figcaption>
      <div className="pen-balance-grid">
        <div className="pen-balance-lado">
          <span className="pen-balance-tag pen-balance-tag-cot">Cotizan</span>
          <div className="pen-balance-dots" aria-hidden="true">
            {Array.from({ length: cot }).map((_, i) => (
              <i
                key={i}
                className="pen-dot pen-dot-cot"
                style={{
                  transitionDelay: crecida ? `${i * 18}ms` : "0ms",
                  opacity: crecida ? 1 : 0,
                  transform: crecida ? "scale(1)" : "scale(0.4)",
                }}
              />
            ))}
          </div>
          <strong>~22 millones</strong>
          <span>afiliados a la Seguridad Social</span>
        </div>
        <div className="pen-balance-vs" aria-hidden="true">
          <span>{INSTANTANEA.ratioCotizantes.toLocaleString("es-ES", { minimumFractionDigits: 1 })}×</span>
        </div>
        <div className="pen-balance-lado">
          <span className="pen-balance-tag pen-balance-tag-pen">Cobran</span>
          <div className="pen-balance-dots" aria-hidden="true">
            {Array.from({ length: pen }).map((_, i) => (
              <i
                key={i}
                className="pen-dot pen-dot-pen"
                style={{
                  transitionDelay: crecida ? `${120 + i * 28}ms` : "0ms",
                  opacity: crecida ? 1 : 0,
                  transform: crecida ? "scale(1)" : "scale(0.4)",
                }}
              />
            ))}
          </div>
          <strong>~9,5 millones</strong>
          <span>pensionistas contributivos</span>
        </div>
      </div>
      <p className="pen-chart-pie">
        Cada punto es simbólico (~1 millón de personas). El sistema es de reparto:
        lo que entra hoy paga lo que se cobra hoy.
      </p>
    </figure>
  );
}

/* ── Hero de portada ────────────────────────────────────────────── */

export function PensionesHero() {
  const crecida = useCrecida();
  const contado = useCountUp(HERO_PENSIONES.millonesDia, 1500, crecida);

  return (
    <section
      className={`pen-hero share-host${crecida ? " es-crecida" : ""}`}
      aria-label="Dato principal: gasto diario en pensiones"
    >
      <ShareDato text="España gasta cientos de millones de euros al día en pensiones. Es el mayor programa de gasto social del Estado." />
      <div className="pen-hero-glow" aria-hidden="true" />
      <p className="pen-hero-kicker">El tamaño real del sistema</p>
      <p className="pen-hero-cifra" aria-live="polite">
        ~{Math.round(contado).toLocaleString("es-ES")}
        <span className="pen-hero-unidad"> M€</span>
      </p>
      <p className="pen-hero-etiqueta">
        millones de euros cada{" "}
        <em className="pen-hero-dia">día</em> en pensiones
      </p>
      <p className="pen-hero-sub">{HERO_PENSIONES.sub}</p>

      <div className="pen-hero-stats">
        <ContadorGastoVivo activo={crecida} anunciar grande />
        <div className="pen-hero-stat">
          <strong>
            {HERO_PENSIONES.nominaMensualMillones.toLocaleString("es-ES", {
              maximumFractionDigits: 0,
            })}{" "}
            M€
          </strong>
          <span>nómina de un mes · {HERO_PENSIONES.periodo}</span>
        </div>
        <div className="pen-hero-stat">
          <strong>
            {(INSTANTANEA.pensiones / 1_000_000).toLocaleString("es-ES", {
              maximumFractionDigits: 1,
            })}{" "}
            M
          </strong>
          <span>pensiones en pago</span>
        </div>
      </div>
    </section>
  );
}

/**
 * Cierre de la página: el mismo contador del hero, sincronizado con él y con
 * la cifra a mayor tamaño. Después de leer el informe, la suma que se ve aquí
 * es lo que el sistema ha pagado mientras tanto.
 */
export function PensionesContadorCierre() {
  const crecida = useCrecida();

  return (
    <section
      className={`pen-cierre-vivo${crecida ? " es-crecida" : ""}`}
      aria-label="Gasto en pensiones acumulado desde que abriste la página"
    >
      <p className="pen-hero-kicker">Y mientras leías esto…</p>
      <ContadorGastoVivo activo={crecida} grande />
    </section>
  );
}

/* ── Palanca: mover la pensión media ────────────────────────────── */

/** Pagas al año de una pensión contributiva: 12 mensualidades + 2 extras. */
const PAGAS_ANUALES = 14;

/**
 * Nómina anualizada de la instantánea vigente (~202 mil M€). Sale de la nómina
 * mensual × 14 pagas, que es como se compone el gasto contributivo real: en
 * 2025 fueron 162.985 M€ de mensualidades + 26.413 M€ de las dos extras.
 */
const NOMINA_ANUAL_MILLONES =
  INSTANTANEA.nominaMensualMillones * PAGAS_ANUALES;

/**
 * Reparto de la nómina en dos bloques, jubilación y el resto de clases
 * (viudedad, incapacidad, orfandad y favor de familiares). Hacen falta dos
 * porque las palancas son dos y no pueden solaparse: si una moviera «todas las
 * pensiones» y la otra «las de jubilación», el 73 % de la nómina contaría dos
 * veces en la factura.
 *
 * Los dos bloques salen del desglose por clases de la propia nómina vigente,
 * no de una estimación: el de jubilación es el que publica la nota y el resto
 * es la suma de las otras cuatro clases. Por construcción suman la nómina y
 * las pensiones de `INSTANTANEA`.
 */
const SIM_BLOQUES = (() => {
  const jub = INSTANTANEA_POR_CLASE.find((c) => c.id === "jubilacion")!;
  const resto = INSTANTANEA_POR_CLASE.filter((c) => c.id !== "jubilacion");
  const restoPensiones = resto.reduce((a, c) => a + c.pensiones, 0);
  const restoMensualMillones = resto.reduce((a, c) => a + c.importeMillones, 0);
  return {
    jubilacion: {
      pensiones: jub.pensiones,
      mensualMillones: jub.importeMillones,
      media: jub.media,
    },
    resto: {
      pensiones: restoPensiones,
      mensualMillones: restoMensualMillones,
      media: (restoMensualMillones * 1e6) / restoPensiones,
    },
  };
})();

/**
 * Nómina mensual según el desglose (14.432,0 M€). Difiere en 0,1 M€ del
 * agregado que publica la nota (14.431,9) porque cada clase viene redondeada a
 * la décima; se usa el desglose para que las partes sumen el todo.
 */
const SIM_NOMINA_MENSUAL =
  SIM_BLOQUES.jubilacion.mensualMillones + SIM_BLOQUES.resto.mensualMillones;

/** Recorrido de las palancas: −30 % a la izquierda, +20 % a la derecha. */
const SIM_PCT_MIN = -30;
const SIM_PCT_MAX = 20;

/**
 * La palanca se mueve en medios puntos porcentuales, no en euros: con la
 * rejilla en euros los redondeos dejaban los extremos fuera de alcance (el
 * +20 % se quedaba en +19,5 %). El estado es el número de medios puntos.
 */
const SIM_PASO_PCT = 0.5;

/**
 * La palanca de ayudas llega hasta quitarlas del todo y hasta doblarlas.
 * El recorrido es a propósito mayor que el de las pensiones: «y si se
 * eliminan» es literalmente la pregunta que se hace en el debate, y una
 * simulación que no la deje llegar al final no la contesta.
 */
const SIM_AYUDAS_PCT_MIN = -100;
const SIM_AYUDAS_PCT_MAX = 100;

/** «0 M€» y no «0,0 M€» cuando la palanca las quita enteras. */
function fmtMillonesPalanca(v: number): string {
  return v <= 0 ? "0 M€" : fmtMillones(v);
}
const SIM_PASOS_MIN = SIM_PCT_MIN / SIM_PASO_PCT;
const SIM_PASOS_MAX = SIM_PCT_MAX / SIM_PASO_PCT;
const SIM_RECORRIDO = SIM_PASOS_MAX - SIM_PASOS_MIN;

/**
 * Escala de las barras de impuestos: la pista entera son 200 puntos sobre el
 * 100 % de cada una, así que el 100 % de hoy cae justo en el centro y las tres
 * barras en reposo llegan a la mitad. Comparten escala a propósito: si cada
 * una se ajustara a su propio máximo, se moverían igual en pantalla y se
 * perdería justo lo que se quiere enseñar —cuanto más pequeña es la caja, más
 * salvaje es el movimiento.
 *
 * A cambio, la barra de los sueldos de menos de 25.000 € se sale por la
 * derecha en la mitad alta del recorrido (con las dos palancas al +20 % llega
 * al 291,7 %). Ahí la barra se corta con un degradado que dice que sigue, y el
 * número de la derecha, que nunca se recorta, es el que lleva el dato.
 */
const SIM_IMP_ESCALA = 200;

/** Ancho en la pista, en % de la escala. Recorta lo que se sale. */
const anchoImp = (pct: number) =>
  `${Math.max(0, Math.min(100, (pct / SIM_IMP_ESCALA) * 100))}%`;

/** Dónde cae el 100 % de hoy dentro de la pista. */
const IZQUIERDA_CIEN = `${(100 / SIM_IMP_ESCALA) * 100}%`;

/**
 * Una fila de la barra de impuestos: rótulo, pista y porcentaje. La pista
 * pinta el escenario (`indice`) y, a un lado u otro de la línea del 100 %, el
 * tramo de diferencia. `rotuloCien` solo lo lleva la última fila: la línea es
 * la misma para todas y repetir el rótulo sería ruido. `asterisco` marca las
 * barras que solo cargan a un tramo, y remite al desplegable de debajo.
 */
function SimBarraImp({
  etiqueta,
  indice,
  deltaPct,
  esRecorte,
  tocada,
  rotuloCien = false,
  asterisco = false,
}: {
  etiqueta: string;
  indice: number;
  deltaPct: number;
  esRecorte: boolean;
  tocada: boolean;
  rotuloCien?: boolean;
  asterisco?: boolean;
}) {
  // Base y diferencia van una detrás de otra en la pista, así que en un
  // recorte tienen que sumar exactamente el 100 % de hoy. En la caja pequeña
  // el recorte puede pasarse de largo (índice negativo: se llevaría por
  // delante todo lo que pagan esos sueldos y aún faltaría); ahí la base es
  // cero y la diferencia se corta en la línea, que es hasta donde hay caja.
  const base = Math.max(0, Math.min(100, indice));
  const delta = esRecorte
    ? Math.min(Math.abs(deltaPct), 100 - base)
    : Math.abs(deltaPct);
  // Se sale de la pista: la barra se corta con un degradado para que se vea
  // que sigue más allá, en vez de fingir que acaba justo en el borde.
  const seSale = tocada && base + delta > SIM_IMP_ESCALA;

  return (
    <div className="pen-sim-imp-fila">
      <span className="pen-sim-imp-k">
        {etiqueta}
        {asterisco && <sup className="pen-sim-imp-ast">*</sup>}
      </span>
      <div
        className={`pen-sim-imp-pista${rotuloCien ? " con-rotulo" : ""}`}
        aria-hidden="true"
      >
        <div className="pen-sim-imp-track">
          <span className="pen-sim-imp-base" style={{ width: anchoImp(base) }} />
          <span
            className={`pen-sim-imp-delta${esRecorte ? " es-menos" : " es-mas"}${
              seSale ? " es-tope" : ""
            }`}
            style={{ width: tocada ? anchoImp(delta) : "0%" }}
          />
          <span className="pen-sim-imp-cien" style={{ left: IZQUIERDA_CIEN }} />
        </div>
        {rotuloCien && (
          <span className="pen-sim-imp-cien-k" style={{ left: IZQUIERDA_CIEN }}>
            hoy · 100 %
          </span>
        )}
      </div>
      <span className="pen-sim-imp-p">{fmtPct(indice, 1)}</span>
    </div>
  );
}

/** Diámetro del pulgar de la barra, en rem. Debe cuadrar con el CSS. */
const SIM_THUMB_REM = 1.35;

/**
 * Sitúa un elemento sobre el centro del pulgar en una posición `pct` del
 * recorrido: el pulgar no llega a los bordes, va inset media anchura.
 */
function anclaEnPista(pct: number): string {
  const rem = SIM_THUMB_REM / 2 - (pct / 100) * SIM_THUMB_REM;
  const signo = rem < 0 ? "-" : "+";
  return `calc(${pct.toFixed(2)}% ${signo} ${Math.abs(rem).toFixed(3)}rem)`;
}

/**
 * Varas de medir: se reutilizan los importes y colores del comparómetro para
 * no tener dos verdades sobre lo que cuesta un hospital o el AVE. Aquí solo se
 * añade cómo se lee «una unidad» de cada partida.
 *
 * El déficit va primero y no sale del comparómetro: no es una partida de gasto
 * sino el agujero del año, y es la comparación que de verdad contesta a «¿esto
 * cuánto descuadra las cuentas?».
 */
type SimReferencia = {
  id: string;
  nombre: string;
  unidad: string;
  millones: number;
  color: string;
};

const SIM_REFERENCIAS: SimReferencia[] = [
  {
    id: "deficit",
    nombre: "Déficit público",
    unidad: `el agujero de las cuentas de ${DEFICIT_2025.periodo}`,
    millones: DEFICIT_2025.millones,
    color: "#e8737d",
  },
  ...[
    {
      id: "educacion",
      nombre: "Educación pública",
      unidad: "un año de gasto educativo de todas las administraciones",
    },
    {
      id: "defensa",
      nombre: "Defensa",
      unidad: "un año entero de gasto militar, criterio OTAN",
    },
    {
      id: "ave",
      nombre: "AVE Madrid–Barcelona",
      unidad: "la obra entera del corredor",
    },
    {
      id: "hospital",
      nombre: "Hospital terciario",
      unidad: "un gran hospital de 1.000 M€",
    },
  ].flatMap((ref) => {
    const item = COMPARATIVA_PENSIONES.items.find((i) => i.id === ref.id);
    return item ? [{ ...ref, millones: item.millones, color: item.color }] : [];
  }),
];

/** «+172 €» / «−172 €»: signo delante y menos tipográfico. */
function fmtDeltaEuros(n: number): string {
  const signo = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${signo}${fmtEuros(Math.abs(n), 0)}`;
}

function fmtDeltaPct(n: number): string {
  const signo = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${signo}${fmtPct(Math.abs(n), 1)}`;
}

/** «+7,4 mil M€» / «−7,4 mil M€»: la misma diferencia, con signo delante. */
function fmtDeltaMillones(n: number): string {
  const signo = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${signo}${fmtMillones(Math.abs(n))}`;
}

/** «+2,4» / «−2,4»: para puntos de PIB, que no llevan el símbolo de %. */
function fmtDeltaPuntos(n: number): string {
  const signo = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${signo}${Math.abs(n).toLocaleString("es-ES", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}`;
}

/**
 * Una palanca del simulador. Las dos son iguales salvo el dato de partida, así
 * que comparten componente: rótulo, dato en grande, pista con la marca de
 * «hoy» y los extremos del recorrido debajo.
 */
function SimPalanca({
  etiqueta,
  nota,
  base,
  pasos,
  onPasos,
  // El recorrido y el formato son configurables porque la tercera palanca no
  // mueve una pensión mensual en euros sino un total anual en millones, y
  // llega hasta quitarlo entero. Los valores por defecto son los de las dos
  // palancas de pensiones, que no cambian.
  pctMin = SIM_PCT_MIN,
  pctMax = SIM_PCT_MAX,
  formato = (v: number) => fmtEuros(v, 0),
  periodo = "al mes",
}: {
  etiqueta: string;
  nota: string;
  base: number;
  pasos: number;
  onPasos: (pasos: number) => void;
  pctMin?: number;
  pctMax?: number;
  formato?: (valor: number) => string;
  periodo?: string;
}) {
  const id = useId();
  const pasosMin = pctMin / SIM_PASO_PCT;
  const pasosMax = pctMax / SIM_PASO_PCT;
  const recorrido = pasosMax - pasosMin;
  const deltaPct = pasos * SIM_PASO_PCT;
  const valor = base * (1 + deltaPct / 100);
  const pos = ((pasos - pasosMin) / recorrido) * 100;
  const posBase = (-pasosMin / recorrido) * 100;

  return (
    <div className="pen-sim-control">
      <div className="pen-sim-control-cab">
        <label className="pen-sim-label" htmlFor={id}>
          {etiqueta}
        </label>
        <output className="pen-sim-out" htmlFor={id}>
          {formato(valor)}
        </output>
      </div>

      <div className="pen-sim-pista">
        <div className="pen-sim-track" aria-hidden="true">
          <span
            className="pen-sim-track-fill"
            style={{ width: anclaEnPista(pos) }}
          />
        </div>
        <span
          className="pen-sim-hoy"
          style={{ left: anclaEnPista(posBase) }}
          aria-hidden="true"
        >
          <span className="pen-sim-hoy-k">hoy</span>
        </span>
        <input
          id={id}
          className="pen-sim-input"
          type="range"
          min={pasosMin}
          max={pasosMax}
          step={1}
          value={pasos}
          onChange={(e) => onPasos(Number(e.target.value))}
          aria-valuetext={`${etiqueta}: ${formato(valor)} ${periodo} · ${
            pasos !== 0 ? fmtDeltaPct(deltaPct) : "dato real"
          }`}
        />
      </div>

      <div className="pen-sim-escala">
        <span>
          {formato(base * (1 + pctMin / 100))} · −{fmtPct(Math.abs(pctMin), 0)}
        </span>
        <span className="pen-sim-escala-delta">
          {pasos !== 0 ? fmtDeltaPct(deltaPct) : nota}
        </span>
        <span>
          {formato(base * (1 + pctMax / 100))} · +{fmtPct(pctMax, 0)}
        </span>
      </div>
    </div>
  );
}

/**
 * Palanca de las pensiones: dos controles independientes —la jubilación media
 * y la media del resto de clases— y, debajo, lo que ese escenario le haría a
 * los impuestos que ya se pagan y a cuánto equivale la diferencia en otras
 * partidas.
 *
 * Es una regla de tres para calibrar la escala («bajar 50 € la media son ~7
 * mil M€ al año»), no una propuesta de trasvase entre cajas. El pie lo dice.
 */
function PensionesPalancaMedia() {
  const [pasosJub, setPasosJub] = useState(0);
  const [pasosResto, setPasosResto] = useState(0);
  const [pasosAyudas, setPasosAyudas] = useState(0);

  const { jubilacion: bJub, resto: bResto } = SIM_BLOQUES;
  const deltaJubPct = pasosJub * SIM_PASO_PCT;
  const deltaRestoPct = pasosResto * SIM_PASO_PCT;

  // Cada bloque mueve su propia parte de la nómina; la diferencia es la suma
  // de las dos, anualizada a 14 pagas. La cuenta va sobre los deltas y no
  // sobre la resta de dos totales: así con las palancas quietas la diferencia
  // es cero exacto y no el ±0,1 M€ que dejan los redondeos de la nota.
  const deltaMensualMillones =
    (deltaJubPct / 100) * bJub.mensualMillones +
    (deltaRestoPct / 100) * bResto.mensualMillones;
  const impactoPensionesMillones = deltaMensualMillones * PAGAS_ANUALES;
  const nominaMensualNueva = SIM_NOMINA_MENSUAL + deltaMensualMillones;

  // La tercera palanca no pasa por la nómina: `AYUDAS_SUBSISTENCIA` ya es un
  // total anual, así que no se multiplica por las 14 pagas. Multiplicarlo
  // habría inflado su efecto catorce veces.
  const ayudasBase = AYUDAS_SUBSISTENCIA.totalMillones;
  const deltaAyudasPct = pasosAyudas * SIM_PASO_PCT;
  const deltaAyudasMillones = (deltaAyudasPct / 100) * ayudasBase;
  const ayudasNuevas = ayudasBase + deltaAyudasMillones;

  // Lo que hay que recaudar de más (o de menos) es la suma de las tres.
  const impactoMillones = impactoPensionesMillones + deltaAyudasMillones;
  const magnitud = Math.abs(impactoMillones);

  // La media de todas las clases ya no la fija una palanca: sale de la nueva
  // nómina repartida entre las mismas pensiones.
  const mediaNueva = (nominaMensualNueva * 1e6) / INSTANTANEA.pensiones;
  const deltaMedia = (deltaMensualMillones * 1e6) / INSTANTANEA.pensiones;
  const deltaMediaPct = (deltaMedia / INSTANTANEA.pensionMedia) * 100;

  const tocada = pasosJub !== 0 || pasosResto !== 0 || pasosAyudas !== 0;
  const tocadasPensiones = pasosJub !== 0 || pasosResto !== 0;
  const esRecorte = impactoMillones < 0;

  // Impuestos: si la diferencia se cubre con recaudación (no con deuda ni con
  // recortes en otras partidas), lo que hoy se ingresa —el 100 %— tiene que
  // pasar a ser otro número. Los puntos de PIB quedan como lectura secundaria.
  const {
    pibMillones,
    irpfMillones,
    irpfHasta50kMillones,
    irpfHasta50kPct,
    irpfHasta25kMillones,
    irpfHasta25kPct,
    umbralRetencionEuros,
  } = PESO_FISCAL_PENSIONES.actual;
  const puntosPib = (impactoMillones / pibMillones) * 100;
  const pctSobreRecaudacion = (impactoMillones / irpfMillones) * 100;
  const indiceImpuestos = 100 + pctSobreRecaudacion;

  // Segunda y tercera lectura: la misma diferencia medida solo contra el IRPF
  // que ponen las rentas bajas y medias, primero cortando en 50.000 € y luego
  // en 25.000 €. Son cajas 1,7 y 6,8 veces más pequeñas, así que el mismo
  // escenario se mueve mucho más: eso es lo que enseñan las barras. No se
  // suman entre sí —son tres formas alternativas de repartir lo mismo.
  const pctSobreIrpfBajo = (impactoMillones / irpfHasta50kMillones) * 100;
  const indiceIrpfBajo = 100 + pctSobreIrpfBajo;
  const pctSobreIrpf25 = (impactoMillones / irpfHasta25kMillones) * 100;
  const indiceIrpf25 = 100 + pctSobreIrpf25;

  return (
    <div
      className={`pen-sim${tocada ? (esRecorte ? " es-recorte" : " es-subida") : ""}`}
    >
      <p className="pen-peso-kicker">Antes de la proyección · pruébalo tú</p>
      <h3 className="pen-sim-titulo">¿Y si las pensiones fueran otras?</h3>
      <p className="pen-sim-intro">
        Tres palancas independientes. Las dos primeras son pensiones: la
        jubilación media y la media del resto de clases (viudedad,
        incapacidad, orfandad y favor de familiares), cada una entre un{" "}
        {fmtPct(Math.abs(SIM_PCT_MIN), 0)} menos y un {fmtPct(SIM_PCT_MAX, 0)}{" "}
        más. Van separadas para no contar dos veces la misma nómina: juntas son
        las {fmtMillones(INSTANTANEA.nominaMensualMillones)} que se pagan cada
        mes ({INSTANTANEA.periodo}). La tercera mueve el bloque entero de{" "}
        <strong>ayudas de subsistencia</strong>, y llega hasta quitarlas del
        todo o doblarlas, porque esa es exactamente la pregunta que se hace
        fuera de aquí. Debajo, tres barras miden la diferencia contra el IRPF
        que se recauda hoy —el 100 %—, sobre todos los sueldos o solo sobre los
        de abajo, y dicen a cuánto equivale en otras partidas.
      </p>

      <SimPalanca
        etiqueta="Jubilación media mensual"
        nota={`${(bJub.pensiones / 1e6).toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })} M de pensiones`}
        base={bJub.media}
        pasos={pasosJub}
        onPasos={setPasosJub}
      />

      <SimPalanca
        etiqueta="Resto de pensiones · media mensual"
        nota={`${(bResto.pensiones / 1e6).toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })} M de pensiones`}
        base={bResto.media}
        pasos={pasosResto}
        onPasos={setPasosResto}
      />

      {/* Tercera palanca. Va separada de las dos de pensiones porque no es
          una pensión: es otra caja del gasto social, con su propio recorrido
          y sin las 14 pagas. */}
      <div className="pen-sim-otra">
        <SimPalanca
          etiqueta="Ayudas de subsistencia · al año"
          nota="IMV, subsidios, rentas mínimas y acogida"
          base={ayudasBase}
          pasos={pasosAyudas}
          onPasos={setPasosAyudas}
          pctMin={SIM_AYUDAS_PCT_MIN}
          pctMax={SIM_AYUDAS_PCT_MAX}
          formato={fmtMillonesPalanca}
          periodo="al año"
        />
      </div>

      <div className="pen-sim-acciones">
        <button
          type="button"
          className="pen-sim-reset"
          onClick={() => {
            setPasosJub(0);
            setPasosResto(0);
            setPasosAyudas(0);
          }}
          disabled={!tocada}
        >
          Volver al dato real
        </button>
      </div>

      <div className="pen-sim-kpis">
        <div className="pen-sim-kpi">
          <span className="pen-sim-kpi-k">Pensión media · todas</span>
          <span className="pen-sim-kpi-v">{fmtEuros(mediaNueva, 0)}</span>
          <span className="pen-sim-kpi-d">
            {tocada
              ? `${fmtDeltaEuros(deltaMedia)} al mes · ${fmtDeltaPct(deltaMediaPct)}`
              : `dato real · ${INSTANTANEA.periodoCorto}`}
          </span>
        </div>
        <div className="pen-sim-kpi">
          <span className="pen-sim-kpi-k">Nómina mensual</span>
          <span className="pen-sim-kpi-v">
            {fmtMillones(nominaMensualNueva)}
          </span>
          <span className="pen-sim-kpi-d">
            {/* Solo las pensiones: meter aquí la palanca de ayudas diría que
                la nómina se mueve por algo que no la toca. */}
            {tocadasPensiones
              ? `${fmtDeltaPct((impactoPensionesMillones / NOMINA_ANUAL_MILLONES) * 100)} sobre hoy`
              : `dato real · ${INSTANTANEA.periodoCorto}`}
          </span>
        </div>
        <div className="pen-sim-kpi pen-sim-kpi-total">
          <span className="pen-sim-kpi-k">
            {tocada
              ? esRecorte
                ? "Se dejaría de pagar al año"
                : "Costaría de más al año"
              : "Factura anual del sistema"}
          </span>
          <span className="pen-sim-kpi-v" aria-live="polite">
            {tocada ? fmtMillones(magnitud) : fmtMillones(NOMINA_ANUAL_MILLONES)}
          </span>
          <span className="pen-sim-kpi-n">
            {!tocada
              ? `nómina de ${INSTANTANEA.periodoCorto} × ${PAGAS_ANUALES} pagas`
              : pasosAyudas === 0
                ? `sobre los ${fmtMillones(NOMINA_ANUAL_MILLONES)} de nómina anual`
                : tocadasPensiones
                  ? `pensiones ${fmtDeltaMillones(impactoPensionesMillones)} · ayudas ${fmtDeltaMillones(deltaAyudasMillones)}`
                  : `solo ayudas · ${fmtMillonesPalanca(ayudasNuevas)} en vez de ${fmtMillones(ayudasBase)}`}
          </span>
        </div>
      </div>

      <div className="pen-sim-imp">
        <div className="pen-sim-imp-cab">
          <span className="pen-sim-kpi-k">
            IRPF · sobre lo que se recauda hoy
          </span>
          <span className="pen-sim-imp-v">
            {fmtPct(100, 0)}
            {tocada ? (
              <>
                {" → "}
                <strong>{fmtPct(indiceImpuestos, 1)}</strong>{" "}
                <em>{fmtDeltaPct(pctSobreRecaudacion)}</em>
              </>
            ) : (
              <em> = lo que se recauda hoy</em>
            )}
          </span>
        </div>

        <SimBarraImp
          etiqueta="Todo el IRPF"
          indice={indiceImpuestos}
          deltaPct={pctSobreRecaudacion}
          esRecorte={esRecorte}
          tocada={tocada}
        />
        <SimBarraImp
          etiqueta="Sueldos hasta 50.000 €"
          indice={indiceIrpfBajo}
          deltaPct={pctSobreIrpfBajo}
          esRecorte={esRecorte}
          tocada={tocada}
          asterisco
        />
        <SimBarraImp
          etiqueta="Sueldos hasta 25.000 €"
          indice={indiceIrpf25}
          deltaPct={pctSobreIrpf25}
          esRecorte={esRecorte}
          tocada={tocada}
          rotuloCien
          asterisco
        />

        <details className="pen-metodo pen-sim-ast-fold">
          <summary className="pen-metodo-summary">
            <span>* Cada barra es un escenario aparte</span>
          </summary>
          <p className="pen-chart-pie pen-metodo-cuerpo">
            Las tres barras no se suman: son tres formas distintas de repartir
            la <em>misma</em> diferencia. La de arriba la carga sobre todo el
            IRPF; las dos de abajo,{" "}
            {esRecorte
              ? "la devuelven solo a ese tramo —es decir, si el ahorro se usara para bajarle los impuestos únicamente a quien gana por debajo de esa cifra—,"
              : "la cargan solo sobre ese tramo —es decir, si la factura extra se la pagara únicamente quien gana por debajo de esa cifra—,"}{" "}
            dejando al resto como está. Además los tramos van uno dentro del
            otro: quien gana menos de 25.000 € también está en la barra de
            50.000 €. Cuanto más estrecho es el grupo, menos caja hay ({fmtMillones(irpfHasta25kMillones)}{" "}
            frente a {fmtMillones(irpfHasta50kMillones)} y a{" "}
            {fmtMillones(irpfMillones)}), y por eso el mismo escenario le pega
            un tirón mucho mayor al porcentaje.
          </p>
        </details>

        <p className="pen-sim-imp-n">
          {tocada ? (
            <>
              {esRecorte ? "Se dejarían de recaudar " : "Habría que recaudar "}
              <strong>{fmtMillones(magnitud)}</strong>
              {esRecorte ? " al año" : " más al año"}: los{" "}
              {fmtMillones(irpfMillones)} que hoy se recaudan por IRPF{" "}
              {esRecorte ? "bajarían" : "subirían"} un{" "}
              {fmtPct(Math.abs(pctSobreRecaudacion), 1)} —del 100 % al{" "}
              {fmtPct(indiceImpuestos, 1)}—, que son{" "}
              {fmtDeltaPuntos(puntosPib)} puntos de PIB. Cargado solo sobre las
              rentas de menos de 50.000 € —{fmtMillones(irpfHasta50kMillones)},
              el {fmtPct(irpfHasta50kPct, 0)} de las retenciones— el mismo
              movimiento es un {fmtPct(Math.abs(pctSobreIrpfBajo), 1)}, hasta el{" "}
              <strong>{fmtPct(indiceIrpfBajo, 1)}</strong>. Y si solo lo pagaran
              los sueldos de menos de 25.000 € —{fmtMillones(irpfHasta25kMillones)},
              el {fmtPct(irpfHasta25kPct, 1)}—, un{" "}
              {fmtPct(Math.abs(pctSobreIrpf25), 1)}, hasta el{" "}
              <strong>{fmtPct(indiceIrpf25, 1)}</strong>: la misma cifra pesa
              más cuanto más pequeña es la caja donde se mete. Es la cuenta si
              la diferencia se cubre solo con recaudación —sin deuda ni recortes
              en otras partidas.
            </>
          ) : (
            <>
              Hoy el Estado recauda {fmtMillones(irpfMillones)} al año por IRPF:{" "}
              {fmtMillones(irpfHasta50kMillones)} salen de quien gana menos de
              50.000 € y {fmtMillones(irpfHasta25kMillones)} de quien no llega a
              25.000 €. Cada barra es su propio 100 % y un escenario aparte: las
              de abajo enseñan cuánto le tocaría a ese tramo si la diferencia se
              cargara solo ahí. Mueve las palancas.
            </>
          )}
        </p>
      </div>

      <p className="pen-sim-puente">
        {tocada
          ? esRecorte
            ? "Ese ahorro anual daría para…"
            : "Ese coste extra habría que sacarlo de sitios como…"
          : "Mueve las palancas para ver a cuánto equivale la diferencia:"}
      </p>

      <ul className="pen-sim-barras">
        {SIM_REFERENCIAS.map((ref) => {
          const veces = magnitud / ref.millones;
          const relleno = Math.min(100, veces * 100);
          const etiqueta =
            veces >= 1
              ? `×${veces.toLocaleString("es-ES", {
                  minimumFractionDigits: veces < 10 ? 1 : 0,
                  maximumFractionDigits: veces < 10 ? 1 : 0,
                })}`
              : fmtPct(veces * 100, veces < 0.1 ? 1 : 0);
          return (
            <li key={ref.id} className={veces >= 1 ? "es-llena" : undefined}>
              <div className="pen-sim-bar-cab">
                <span className="pen-sim-bar-k">{ref.nombre}</span>
                <span className="pen-sim-bar-v" style={{ color: ref.color }}>
                  {tocada ? etiqueta : "—"}
                </span>
              </div>
              <div className="pen-sim-bar-track" aria-hidden="true">
                <span
                  className="pen-sim-bar-fill"
                  style={{
                    width: `${tocada ? relleno : 0}%`,
                    background: ref.color,
                  }}
                />
              </div>
              <span className="pen-sim-bar-n">
                {ref.unidad} · {fmtMillones(ref.millones)}
              </span>
            </li>
          );
        })}
      </ul>

      <details className="pen-metodo">
        <summary className="pen-metodo-summary">
          <span>Método, datos y letra pequeña</span>
        </summary>
        <p className="pen-chart-pie pen-metodo-cuerpo">
          Cada palanca mueve su bloque de la nómina y los dos se suman, llevados
          a la nómina anualizada ({fmtMillones(SIM_NOMINA_MENSUAL)} al mes ×{" "}
          {PAGAS_ANUALES} pagas ≈ {fmtMillones(NOMINA_ANUAL_MILLONES)}). Los dos
          bloques —jubilación,{" "}
          {fmtMillones(SIM_BLOQUES.jubilacion.mensualMillones)} al mes, y el
          resto de clases, {fmtMillones(SIM_BLOQUES.resto.mensualMillones)}—
          salen del desglose de la propia nómina de{" "}
          {INSTANTANEA.periodo.toLowerCase()}, así que suman el total sin contar
          nada dos veces. Anualizar a 14 pagas es el ritmo de hoy, no el cierre
          del año: la nómina crece mes a mes, y por eso 2025 cerró en{" "}
          {fmtMillones(ANUAL_2025.gastoContributivoMillones)}. La barra de arriba
          toma como 100 % la cuota del IRPF de{" "}
          {PESO_FISCAL_PENSIONES.actual.anioImpuestos} ({fmtMillones(irpfMillones)},
          AEAT) y le suma la diferencia. Las de abajo hacen lo mismo con la
          parte que ponen las rentas de menos de 50.000 € —
          {fmtMillones(irpfHasta50kMillones)}, el {fmtPct(irpfHasta50kPct, 0)}{" "}
          de las retenciones del trabajo (AEAT)— y las de menos de 25.000 € —
          {fmtMillones(irpfHasta25kMillones)}, el {fmtPct(irpfHasta25kPct, 1)}—.
          Como el IRPF incluye además capital y actividades económicas, que se
          concentran arriba, las dos son una cota alta de lo que pone el tramo
          bajo-medio, no una liquidación. El corte en 25.000 € lleva encima una
          estimación de más: la AEAT publica los tramos en múltiplos del SMI y
          no corta ahí, así que el trozo de 20.000 a 25.000 € se saca del tramo
          20.000–50.000 € repartiendo a los asalariados de forma uniforme y la
          retención en proporción a lo que excede del umbral en que se empieza
          a retener (~{fmtEuros(umbralRetencionEuros, 0)}). Es un orden de
          magnitud, no un
          dato publicado. Las tres comparten escala —el 100 % de hoy en el centro de
          la pista, el doble en el extremo derecho— para poder compararlas de un
          vistazo; cuando un escenario se pasa de ahí, la barra se corta con un
          degradado y la cifra exacta sigue en el número de la derecha. Antes la referencia era toda la
          recaudación —impuestos + cotizaciones, el{" "}
          {fmtPct(PESO_FISCAL_PENSIONES.presionFiscalPctPib, 0)} del PIB nominal,{" "}
          {fmtMillones(pibMillones)}—, pero es una caja tan grande que movía la
          barra unas décimas; contra el IRPF el mismo escenario se lee a escala
          humana. Los puntos de PIB siguen ahí como segunda lectura. Las varas
          de medir son órdenes de magnitud del comparómetro, no presupuestos
          auditados; la del déficit sí es un dato de cierre:{" "}
          {fmtMillones(DEFICIT_2025.millones)} en {DEFICIT_2025.periodo}, el{" "}
          {fmtPct(DEFICIT_2025.pctPib, 2)} del PIB (Hacienda/IGAE, marzo de
          2026), sin el gasto extraordinario de la DANA —con él serían{" "}
          {fmtMillones(DEFICIT_2025.conDanaMillones)}—. Compararse con el
          déficit no significa que la diferencia vaya ahí: dice si cabe o no en
          el agujero que ya tienen las cuentas.{" "}
          La tercera palanca funciona distinto y conviene saberlo: las ayudas
          de subsistencia ya son un total anual ({fmtMillones(ayudasBase)}), así
          que su movimiento no se multiplica por las 14 pagas. Es el mismo
          bloque del apartado de arriba y con sus mismas reglas —sin pensiones
          no contributivas ni complementos a mínimos, que ya van dentro de la
          nómina que mueven las otras dos palancas, y sin la prestación
          contributiva por desempleo—, así que las tres se pueden sumar sin
          contar nada dos veces. Que el recorrido llegue a quitarlas enteras no
          insinúa que se puedan quitar: hay derechos reconocidos por ley de por
          medio. Solo enseña cuánto se recaudaría de menos si no existieran, que
          es el número que casi nunca acompaña al argumento.{" "}
          <strong>Es una regla de tres, no una propuesta</strong>: las pensiones
          contributivas se pagan con cotizaciones, no con IRPF, y se revalorizan
          por ley con el IPC, así que ni salen de esa caja ni se trasladan a
          educación o a defensa apretando un botón. La barra dice a cuánto IRPF
          equivale la diferencia, que es otra cosa. Sirve para calibrar cuánto
          pesa cada euro de pensión media.
        </p>
      </details>
    </div>
  );
}

/**
 * Justo bajo el hero: qué % del esfuerzo fiscal (impuestos + cotizaciones)
 * se va a pensiones, y cómo sube ese peso hasta el pico demográfico (AIReF).
 */
/**
 * Las ayudas de subsistencia, medidas con el mismo denominador que las
 * pensiones: el esfuerzo fiscal completo.
 *
 * Va aquí y no en un bloque suelto porque solo significa algo pegada a la
 * barra de los 100 €. El objetivo declarado es que el argumento de «las
 * ayudas» se pueda comprobar en vez de discutirse de oído, así que el desglose
 * está entero a la vista, con sus reglas de construcción, y no se esconde
 * ninguna partida por incómoda.
 */
function AyudasSubsistencia({
  esfuerzoFiscalMillones,
}: {
  esfuerzoFiscalMillones: number;
}) {
  const crecida = useCrecida();
  const { partidas, totalMillones, acogidaMillones } = AYUDAS_SUBSISTENCIA;

  const pct = (totalMillones / esfuerzoFiscalMillones) * 100;
  const pctAcogida = (acogidaMillones / esfuerzoFiscalMillones) * 100;
  // Céntimos: a esta escala el porcentaje ya no se lee, y «0,2 %» esconde el
  // orden de magnitud en vez de enseñarlo.
  const centimosAcogida = Math.round(pctAcogida * 100);
  const vecesPensiones =
    PESO_FISCAL_PENSIONES.actual.gastoPensionesMillones / totalMillones;
  const max = Math.max(...partidas.map((p) => p.millones));

  return (
    <section className="pen-ayudas" aria-label="Ayudas y prestaciones de subsistencia">
      <header className="pen-ayudas-cab">
        <h3>¿Y las ayudas de subsistencia?</h3>
        <p>
          Es la comparación que más se pide, así que va con el mismo
          denominador que la de arriba —todos los impuestos y cotizaciones— y
          con el desglose entero delante.
        </p>
      </header>

      <div className="pen-ayudas-kpis">
        <div className="pen-ayudas-kpi">
          <span className="pen-ayudas-kpi-k">Todas juntas</span>
          <span className="pen-ayudas-kpi-v">~{fmtMillones(totalMillones)}</span>
          <span className="pen-ayudas-kpi-n">
            {fmtPct(pct, 1)} del esfuerzo fiscal · unos{" "}
            {Math.round(pct)} € de cada 100
          </span>
        </div>
        <div className="pen-ayudas-kpi">
          <span className="pen-ayudas-kpi-k">Frente a pensiones</span>
          <span className="pen-ayudas-kpi-v">
            ×{vecesPensiones.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
          </span>
          <span className="pen-ayudas-kpi-n">
            Las pensiones son {Math.round(vecesPensiones)} veces todo este
            bloque junto
          </span>
        </div>
        <div className="pen-ayudas-kpi">
          <span className="pen-ayudas-kpi-k">Acogida de asilo</span>
          <span className="pen-ayudas-kpi-v">{centimosAcogida} cts.</span>
          <span className="pen-ayudas-kpi-n">
            de cada 100 € · {fmtMillones(acogidaMillones)} al año
          </span>
        </div>
      </div>

      <ul className="pen-ayudas-lista">
        {partidas.map((p) => (
          <li key={p.id}>
            <div className="pen-ayudas-fila">
              <span className="pen-ayudas-nombre">{p.etiqueta}</span>
              <span className="pen-ayudas-valor">{fmtMillones(p.millones)}</span>
            </div>
            <div className="pen-ayudas-pista" role="presentation">
              <div
                className="pen-ayudas-fill"
                style={{ width: crecida ? `${(p.millones / max) * 100}%` : "0%" }}
              />
            </div>
            <span className="pen-ayudas-nota">{p.nota}</span>
          </li>
        ))}
      </ul>

      {/* Las tres reglas van a la vista, no en un pie de página: sin ellas la
          cifra se puede usar para decir cualquier cosa. */}
      <div className="pen-ayudas-reglas">
        <p className="pen-ayudas-reglas-k">Cómo está montada esta suma</p>
        <ul>
          <li>
            <strong>Nada se cuenta dos veces.</strong> Las pensiones no
            contributivas y los complementos a mínimos no están aquí: ya van
            dentro del 13 % del PIB de la barra de pensiones.
          </li>
          <li>
            <strong>La prestación contributiva por paro tampoco está.</strong>{" "}
            Se cobra por haber cotizado antes: es un seguro, no una ayuda de
            subsistencia. Solo entra el nivel asistencial.
          </li>
          <li>
            <strong>«Ayudas a inmigrantes» no es una partida.</strong> Lo que
            existe es el sistema de acogida de solicitantes de asilo, que está
            aquí con su importe. El resto de prestaciones no se conceden por
            ser extranjero: el Ingreso Mínimo Vital, por ejemplo, exige
            residencia legal y efectiva en España durante al menos el año
            anterior.
          </li>
        </ul>
      </div>

      <p className="pen-ayudas-pie">
        Estos números no dicen si cada ayuda está bien diseñada, ni si llega a
        quien debería, ni si sobra o falta. Dicen cuánto pesan, que es la parte
        de la discusión que sí tiene una respuesta comprobable. Sanidad y
        educación quedan fuera a propósito: son servicios universales, no
        transferencias de subsistencia. Fuentes:{" "}
        {AYUDAS_SUBSISTENCIA.fuentes.map((f) => f.etiqueta).join(" · ")}.
      </p>
    </section>
  );
}

export function PensionesPesoFiscal() {
  const crecida = useCrecida();
  const edad = useEdadPensiones();
  const { actual, presionFiscalPctPib, fuentes } = PESO_FISCAL_PENSIONES;

  // Euros y porcentaje salen del mismo sitio (gasto/PIB ÷ presión fiscal sobre
  // el PIB nominal), así que la barra y la tarjeta en euros no pueden
  // discrepar. Antes el % venía del punto de 2023 de la serie y los euros de
  // sumar AEAT + cotizaciones, que es un agregado más estrecho: daban 34 % y
  // 37 % a la vez bajo el rótulo «hoy».
  const esfuerzoHoyMillones = actual.esfuerzoFiscalMillones;
  const pctEurosHoy =
    (actual.gastoPensionesMillones / esfuerzoHoyMillones) * 100;
  const pctHoy = (actual.gastoPctPib / presionFiscalPctPib) * 100;
  const pctPico =
    PESO_FISCAL_PROYECCION.find((p) => p.anio === 2050)?.pctEsfuerzoFiscal ??
    42;
  const deCada100Hoy = Math.round(pctHoy);
  // La otra pregunta que trae todo el mundo a esta página: cuánto de esos
  // mismos 100 € se va en ayudas de subsistencia. Mismo denominador que las
  // pensiones —el esfuerzo fiscal—, o los dos números no se podrían comparar.
  const pctAyudas =
    (AYUDAS_SUBSISTENCIA.totalMillones / esfuerzoHoyMillones) * 100;
  const deCada100Ayudas = Math.round(pctAyudas);
  const deCada100Pico = Math.round(pctPico);
  const edad2050 = etiquetaEdadCorta(edad, 2050);
  const edadEnPico = edadEnAnio(edad, 2050);

  // Jubilación ordinaria de referencia y % del esfuerzo fiscal en ese año.
  const anioJub = anioJubilacion(edad);
  const pctEnJub =
    anioJub != null ? pctEsfuerzoEnAnio(anioJub) : null;
  const yaJubilable =
    edad != null && edad >= REGLAS_JUBILACION.edadPlena;

  // Gráfico de barras de la proyección.
  const maxPct = Math.max(...PESO_FISCAL_PROYECCION.map((p) => p.pctEsfuerzoFiscal));
  const minPct = Math.min(...PESO_FISCAL_PROYECCION.map((p) => p.pctEsfuerzoFiscal));
  const base = Math.max(0, minPct - 4);

  return (
    <section
      className={`pen-peso share-host${crecida ? " es-crecida" : ""}`}
      aria-label="Qué parte de los impuestos y cotizaciones va a pensiones"
    >
      <ShareDato text={`De cada 100 € de impuestos y cotizaciones, unos ${deCada100Hoy} € van a pensiones hoy. AIReF proyecta que el peso suba hacia ~${deCada100Pico} € de cada 100 en 2050.`} />

      <header className="pen-peso-cab">
        <div>
          <p className="pen-peso-kicker">Después del tamaño · la factura fiscal</p>
          <h2 className="pen-peso-titulo">
            ¿Qué parte de los impuestos se va en pensiones?
          </h2>
        </div>
        <div
          className="pen-peso-badge"
          title="Proyección AIReF · gasto/PIB ÷ presión fiscal; jubilación a edad ordinaria de referencia"
        >
          <span className="pen-peso-chip pen-peso-chip-pico">
            <span className="pen-peso-chip-k">Pico AIReF</span>
            <span className="pen-peso-chip-v">
              ~{fmtPct(pctPico, 0)} · 2050
            </span>
          </span>
          {edadEnPico != null && (
            <span className="pen-peso-chip pen-peso-chip-edad">
              <span className="pen-peso-chip-k">Tú en el pico</span>
              <span className="pen-peso-chip-v">{edadEnPico} años</span>
            </span>
          )}
          {edad != null && (
            <span className="pen-peso-chip pen-peso-chip-jub">
              <span className="pen-peso-chip-k">
                {yaJubilable
                  ? "Jubilación ref."
                  : `Jubilación ~${REGLAS_JUBILACION.edadPlena} a.`}
              </span>
              <span className="pen-peso-chip-v">
                {yaJubilable
                  ? `ya en franja · ~${fmtPct(pctHoy, 0)} hoy`
                  : anioJub != null && pctEnJub != null
                    ? `${anioJub} · ~${fmtPct(pctEnJub, 0)}`
                    : "—"}
              </span>
            </span>
          )}
        </div>
      </header>

      <p className="pen-peso-intro">
        No solo «cuánto es en euros»:{" "}
        <strong>qué fracción del esfuerzo fiscal</strong> (todos los impuestos
        más las cotizaciones sociales, ~{fmtPct(presionFiscalPctPib, 0)} del
        PIB) se destina a las pensiones, y cómo crece ese peso cuando el baby
        boom se jubila.
      </p>

      <div className="pen-peso-kpis">
        <div className="pen-peso-kpi pen-peso-kpi-gold">
          <span className="pen-peso-kpi-k">Hoy · de cada 100 €</span>
          <span className="pen-peso-kpi-v">~{deCada100Hoy} €</span>
          <span className="pen-peso-kpi-n">
            de impuestos y cotizaciones van a pensiones (~{fmtPct(pctHoy, 1)})
          </span>
        </div>
        <div className="pen-peso-kpi">
          <span className="pen-peso-kpi-k">
            En 2050 · proyección AIReF
            {edad2050 ? ` · ${edad2050}` : ""}
          </span>
          <span className="pen-peso-kpi-v">~{deCada100Pico} €</span>
          <span className="pen-peso-kpi-n">
            de cada 100 € del esfuerzo fiscal (~{fmtPct(pctPico, 1)})
          </span>
        </div>
        <div className="pen-peso-kpi">
          <span className="pen-peso-kpi-k">Gasto pensiones {actual.anioGasto}</span>
          <span className="pen-peso-kpi-v">{fmtMillones(actual.gastoPensionesMillones)}</span>
          <span className="pen-peso-kpi-n">
            todas las pensiones (~{fmtPct(actual.gastoPctPib, 1)} del PIB), de
            las que {fmtMillones(actual.gastoContributivoMillones)} son
            contributivas de la Seguridad Social. Frente a ~
            {fmtMillones(esfuerzoHoyMillones)} de impuestos + cotizaciones (~
            {fmtPct(pctEurosHoy, 0)})
          </span>
        </div>
      </div>

      {/* Barra 100 € → pensiones, ayudas de subsistencia y resto */}
      <div
        className="pen-peso-barra100"
        role="img"
        aria-label={`De cada 100 euros de impuestos y cotizaciones, unos ${deCada100Hoy} van a pensiones y unos ${deCada100Ayudas} a ayudas y prestaciones de subsistencia`}
      >
        <div className="pen-peso-barra100-pista">
          <span
            className="pen-peso-barra100-fill"
            style={{ width: crecida ? `${pctHoy}%` : "0%" }}
          />
          {/* La pista es flex: el segundo tramo se coloca solo detrás del
              primero, sin posicionarlo a mano. */}
          <span
            className="pen-peso-barra100-fill pen-peso-barra100-ayudas"
            style={{ width: crecida ? `${pctAyudas}%` : "0%" }}
          />
        </div>
        <div className="pen-peso-barra100-labels">
          <span>
            <strong>~{deCada100Hoy} €</strong> pensiones
          </span>
          <span className="pen-peso-barra100-k-ayudas">
            <strong>~{deCada100Ayudas} €</strong> ayudas de subsistencia
          </span>
          <span>
            <strong>~{100 - deCada100Hoy - deCada100Ayudas} €</strong> resto del
            Estado
          </span>
        </div>
      </div>

      <AyudasSubsistencia esfuerzoFiscalMillones={esfuerzoHoyMillones} />

      <PensionesPalancaMedia />

      <figure className="pen-chart pen-peso-chart">
        <figcaption className="pen-chart-cabecera">
          <span className="pen-chart-titulo">
            Proyección · % del esfuerzo fiscal (impuestos + cotizaciones)
          </span>
        </figcaption>

        <ul className="pen-peso-barras" aria-label="Evolución proyectada del peso fiscal">
          {PESO_FISCAL_PROYECCION.map((p) => {
            const alto = ((p.pctEsfuerzoFiscal - base) / (maxPct - base + 0.01)) * 100;
            const tu = etiquetaEdadCorta(edad, p.anio);
            return (
              <li key={p.anio}>
                <span className="pen-peso-bar-val">
                  {fmtPct(p.pctEsfuerzoFiscal, 0)}
                </span>
                <div className="pen-peso-bar-track" aria-hidden="true">
                  <span
                    className={
                      p.oficial ? "pen-peso-bar-fill es-oficial" : "pen-peso-bar-fill"
                    }
                    style={{
                      height: crecida ? `${Math.max(alto, 8)}%` : "0%",
                      background: p.anio === 2050 ? "var(--gold-bright)" : undefined,
                    }}
                  />
                </div>
                <span className="pen-peso-bar-anio">
                  {p.anio}
                  {p.oficial ? " ·" : ""}
                  {tu && (
                    <span className="pen-edad-badge pen-edad-badge-bar">{tu}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="pen-chart-pie">
          Método: gasto pensiones / PIB (AIReF) ÷ presión fiscal ~{presionFiscalPctPib}{" "}
          % del PIB (OCDE/Eurostat, redondeo). Si las pensiones suben del{" "}
          {fmtPct(actual.gastoPctPib, 1)} al {fmtPct(
            PESO_FISCAL_PROYECCION.find((p) => p.anio === 2050)?.gastoPctPib ?? 16.4,
            1,
          )}{" "}
          del PIB y la presión fiscal se mantiene, el «trozo del pastel» fiscal
          crece aunque nadie suba el tipo del IVA a propósito. Puntos con · =
          hitos oficiales AIReF.
        </p>
      </figure>

      <p className="pen-peso-fuentes">
        <strong>Fuentes:</strong>{" "}
        {fuentes.map((f, i) => (
          <span key={f.etiqueta}>
            {i > 0 ? " · " : ""}
            <a href={f.url} rel="noopener noreferrer" target="_blank">
              {f.etiqueta}
            </a>
          </span>
        ))}
        . Cifras redondeadas para lectura; no sustituyen los informes oficiales.
      </p>
    </section>
  );
}

/* ── Seis datos como gráficos ───────────────────────────────────── */

function DatoCard({
  titulo,
  pie,
  share,
  children,
}: {
  titulo: string;
  pie: string;
  /** Texto listo para copiar/compartir. */
  share: string;
  children: ReactNode;
}) {
  return (
    <figure className="pen-dato-card share-host">
      <ShareDato text={share} />
      <figcaption className="pen-dato-card-titulo">{titulo}</figcaption>
      <div className="pen-dato-card-body">{children}</div>
      <p className="pen-dato-card-pie">{pie}</p>
    </figure>
  );
}

/** 1 · Contador del gasto diario (dinámico). */
function DatoNominaDia() {
  const crecida = useCrecida();
  const contado = useCountUp(HERO_PENSIONES.millonesDia, 1200, crecida);
  const [tick, setTick] = useState(0);

  // Simula el «reloj» del gasto; se desactiva si el usuario pide menos movimiento.
  useEffect(() => {
    if (!crecida) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setTick(100);
      return;
    }
    const id = window.setInterval(() => setTick((t) => (t + 1) % 100), 40);
    return () => window.clearInterval(id);
  }, [crecida]);

  return (
    <DatoCard
      titulo="Casi 480 M€ al día"
      pie="Nómina jul. 2026 ÷ 30 días · orden de magnitud"
      share="Casi 480 M€ al día en pensiones en España. El mayor flujo de gasto social, todos los días."
    >
      <div className="pen-dato-dia">
        <span className="pen-dato-dia-num">
          ~{Math.round(contado).toLocaleString("es-ES")}
          <small> M€/día</small>
        </span>
        <div className="pen-dato-dia-anillo" aria-hidden="true">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" className="pen-dato-dia-bg" />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="pen-dato-dia-fg"
              strokeDasharray={`${(tick / 100) * 251.3} 251.3`}
              strokeDashoffset="62.8"
            />
          </svg>
          <span className="pen-dato-dia-centro">24 h</span>
        </div>
      </div>
      <p className="pen-dato-card-txt">
        Un mes ≈{" "}
        <strong>
          {HERO_PENSIONES.nominaMensualMillones.toLocaleString("es-ES", {
            maximumFractionDigits: 0,
          })}{" "}
          M€
        </strong>
        . La partida social más grande del Estado.
      </p>
    </DatoCard>
  );
}

/** 2 · Donut interactivo: 3 de cada 4 € a jubilación. */
function DatoTresCuartas() {
  const [modo, setModo] = useState<"dinero" | "numero">("dinero");
  const crecida = useCrecida(modo);

  const totalDinero = POR_CLASE.reduce((s, c) => s + c.importeMillones, 0);
  const totalNum = POR_CLASE.reduce((s, c) => s + c.pensiones, 0);

  const tramos = useMemo(() => {
    const total = modo === "dinero" ? totalDinero : totalNum;
    let acc = 0;
    return POR_CLASE.map((c) => {
      const valor = modo === "dinero" ? c.importeMillones : c.pensiones;
      const pct = (valor / total) * 100;
      const start = acc;
      acc += pct;
      return { ...c, pct, start };
    });
  }, [modo, totalDinero, totalNum]);

  const R = 36;
  const C = 2 * Math.PI * R;
  const jub = tramos.find((t) => t.id === "jubilacion")!;

  return (
    <DatoCard
      titulo="3 de cada 4 euros, a jubilación"
      pie="Nómina dic. 2025 · Seguridad Social"
      share="3 de cada 4 euros de la nómina de pensiones van a jubilación. El resto: viudedad, incapacidad y orfandad."
    >
      <div className="pen-dato-toggle" role="group" aria-label="Medir por">
        <button
          type="button"
          className="pen-medida"
          aria-pressed={modo === "dinero"}
          onClick={() => setModo("dinero")}
        >
          Dinero
        </button>
        <button
          type="button"
          className="pen-medida"
          aria-pressed={modo === "numero"}
          onClick={() => setModo("numero")}
        >
          Número
        </button>
      </div>
      <div className="pen-dato-donut-row">
        <div className="pen-dato-donut-wrap">
          <svg viewBox="0 0 100 100" className="pen-dato-donut" aria-hidden="true">
            {tramos.map((t) => {
              const len = crecida ? (t.pct / 100) * C : 0;
              const dash = Math.max(0, len - 1);
              const offset = C - (t.start / 100) * C + C * 0.25;
              return (
                <circle
                  key={t.id}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={t.color}
                  strokeWidth={t.id === "jubilacion" ? 12 : 9}
                  strokeDasharray={`${dash} ${C - dash}`}
                  strokeDashoffset={offset}
                  className="pen-donut-arco"
                  opacity={t.id === "jubilacion" ? 1 : 0.55}
                />
              );
            })}
            <circle cx="50" cy="50" r="26" fill="#0d1626" />
          </svg>
          <div className="pen-dato-donut-centro">
            <strong>{fmtPct(jub.pct, 0)}</strong>
            <span>jubilación</span>
          </div>
        </div>
        <ul className="pen-dato-mini-leyenda">
          {tramos.slice(0, 3).map((t) => (
            <li key={t.id}>
              <i style={{ background: t.color }} aria-hidden="true" />
              <span>{t.nombre}</span>
              <strong>{fmtPct(t.pct, 0)}</strong>
            </li>
          ))}
        </ul>
      </div>
      <p className="pen-dato-card-txt">
        En dinero la jubilación domina; en número de pensiones el peso de
        viudedad e incapacidad se ve más.
      </p>
    </DatoCard>
  );
}

/** 3 · Más pensiones que personas (barras + % con dos). */
function DatoDoblePension() {
  const crecida = useCrecida();
  const pensiones = INSTANTANEA.pensiones / 1_000_000;
  const pensionistas = INSTANTANEA.pensionistas / 1_000_000;
  const max = pensiones;
  const doblesPct = ((pensiones - pensionistas) / pensionistas) * 100;

  return (
    <DatoCard
      titulo="Más pensiones que personas"
      pie={`${INSTANTANEA.periodo} · ~${fmtPct(doblesPct, 0)} de pensionistas con 2 prestaciones`}
      share="Hay más pensiones en pago que pensionistas: una parte cobra dos prestaciones (p. ej. jubilación + viudedad)."
    >
      <div className="pen-dato-doble">
        <div className="pen-dato-doble-col">
          <span className="pen-dato-doble-val" style={{ color: "#c9a86a" }}>
            {pensiones.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M
          </span>
          <div className="pen-dato-doble-pista">
            <span
              style={{
                height: crecida ? `${(pensiones / max) * 100}%` : "0%",
                background: "#c9a86a",
              }}
            />
          </div>
          <span className="pen-dato-doble-lbl">Pensiones</span>
        </div>
        <div className="pen-dato-doble-col">
          <span className="pen-dato-doble-val" style={{ color: "#3f80bd" }}>
            {pensionistas.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M
          </span>
          <div className="pen-dato-doble-pista">
            <span
              style={{
                height: crecida ? `${(pensionistas / max) * 100}%` : "0%",
                background: "#3f80bd",
              }}
            />
          </div>
          <span className="pen-dato-doble-lbl">Pensionistas</span>
        </div>
        <div className="pen-dato-doble-gap">
          <strong>+{(pensiones - pensionistas).toLocaleString("es-ES", { maximumFractionDigits: 1 })} M</strong>
          <span>prestaciones «de más» (p. ej. jubilación + viudedad)</span>
        </div>
      </div>
    </DatoCard>
  );
}

/** 4 · Brecha de género compacta e interactiva (hover). */
function DatoBrecha() {
  const crecida = useCrecida();
  const [hover, setHover] = useState<"h" | "m" | null>(null);
  const diff = BRECHA_GENERO.hombres - BRECHA_GENERO.mujeres;
  const pct = (BRECHA_GENERO.mujeres / BRECHA_GENERO.hombres) * 100;
  const mostrado =
    hover === "h"
      ? BRECHA_GENERO.hombres
      : hover === "m"
        ? BRECHA_GENERO.mujeres
        : diff;

  return (
    <DatoCard
      titulo="500 € de brecha de género"
      pie={`${BRECHA_GENERO.periodo} · pasa el cursor sobre cada barra`}
      share="Brecha de género en pensiones: la media de las mujeres queda cientos de euros por debajo de la de los hombres."
    >
      <div className="pen-dato-brecha-hero">
        <span className="pen-dato-brecha-num">
          {hover ? fmtEuros(mostrado, 0) : `−${fmtEuros(diff, 0)}`}
        </span>
        <span className="pen-dato-brecha-sub">
          {hover === "h"
            ? "pensión media hombres"
            : hover === "m"
              ? "pensión media mujeres"
              : "diferencia mensual de media"}
        </span>
      </div>
      <div className="pen-dato-brecha-filas">
        <button
          type="button"
          className="pen-dato-brecha-fila"
          onMouseEnter={() => setHover("h")}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover("h")}
          onBlur={() => setHover(null)}
        >
          <span>Hombres</span>
          <div className="pen-barra-pista">
            <div
              className="pen-barra-fill pen-brecha-h"
              style={{ width: crecida ? "100%" : "0%" }}
            />
          </div>
          <strong>{fmtEuros(BRECHA_GENERO.hombres, 0)}</strong>
        </button>
        <button
          type="button"
          className="pen-dato-brecha-fila"
          onMouseEnter={() => setHover("m")}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover("m")}
          onBlur={() => setHover(null)}
        >
          <span>Mujeres</span>
          <div className="pen-barra-pista">
            <div
              className="pen-barra-fill pen-brecha-m"
              style={{ width: crecida ? `${pct}%` : "0%" }}
            />
          </div>
          <strong>{fmtEuros(BRECHA_GENERO.mujeres, 0)}</strong>
        </button>
      </div>
    </DatoCard>
  );
}

/** 5 · Revalorización IPC: columnas clicables. */
function DatoRevalorizacion() {
  const crecida = useCrecida();
  const [activo, setActivo] = useState(
    REVALORIZACION_ANUAL[REVALORIZACION_ANUAL.length - 1]!.anio,
  );
  const max = Math.max(...REVALORIZACION_ANUAL.map((r) => r.pct));
  const sel =
    REVALORIZACION_ANUAL.find((r) => r.anio === activo) ??
    REVALORIZACION_ANUAL[REVALORIZACION_ANUAL.length - 1]!;

  return (
    <DatoCard
      titulo="Atadas al IPC"
      pie="Pulsa un año · revalorización de las contributivas"
      share="Las pensiones contributivas se revalorizan con el IPC. El gasto crece con la inflación y con el número de pensionistas."
    >
      <div className="pen-dato-ipc-sel">
        <strong>{fmtPct(sel.pct)}</strong>
        <span>
          en {sel.anio} · {sel.nota}
        </span>
      </div>
      <div
        className="pen-dato-ipc-cols"
        role="listbox"
        aria-label="Revalorización por año"
      >
        {REVALORIZACION_ANUAL.map((r) => {
          const h = (r.pct / max) * 100;
          const on = r.anio === activo;
          return (
            <button
              key={r.anio}
              type="button"
              role="option"
              aria-selected={on}
              className={`pen-dato-ipc-col${on ? " es-activa" : ""}${r.pct >= 5 ? " es-pico" : ""}`}
              onClick={() => setActivo(r.anio)}
            >
              <span className="pen-dato-ipc-val">{fmtPct(r.pct, 1)}</span>
              <span className="pen-dato-ipc-pista">
                <i
                  style={{ height: crecida ? `${h}%` : "0%" }}
                  aria-hidden="true"
                />
              </span>
              <span className="pen-dato-ipc-anio">{r.anio}</span>
            </button>
          );
        })}
      </div>
      <p className="pen-dato-card-txt">
        El 8,5 % de 2023 muestra el efecto de atar la pensión a la inflación
        alta: protege al pensionista y dispara la factura.
      </p>
    </DatoCard>
  );
}

/** 6 · MEI: escalera de cotización animada e interactiva. */
function DatoMei() {
  const crecida = useCrecida();
  const [activo, setActivo] = useState(2026);
  const max = Math.max(...MEI_ESCALA.map((m) => m.pct));
  const sel = MEI_ESCALA.find((m) => m.anio === activo) ?? MEI_ESCALA[3]!;
  const actual = MEI_ESCALA.find((m) => m.anio === 2026)!;

  return (
    <DatoCard
      titulo="MEI: el colchón de cotización"
      pie="Pulsa un año · tipo adicional sobre la base de cotización"
      share="El MEI sube la cotización (del 0,6% al 1,2% en 2029) para reforzar el sistema ante el pico demográfico."
    >
      <div className="pen-dato-mei-sel">
        <strong>{fmtPct(sel.pct, 1)}</strong>
        <span>
          en {sel.anio}
          {sel.anio === 2026 ? " · vigente" : sel.anio > 2026 ? " · previsto" : ""}
        </span>
      </div>
      <div className="pen-dato-mei-stairs" role="listbox" aria-label="Escala MEI">
        {MEI_ESCALA.map((m, i) => {
          const h = (m.pct / max) * 100;
          const on = m.anio === activo;
          return (
            <button
              key={m.anio}
              type="button"
              role="option"
              aria-selected={on}
              className={`pen-dato-mei-step${on ? " es-activa" : ""}${m.anio === 2026 ? " es-hoy" : ""}`}
              onClick={() => setActivo(m.anio)}
              style={{ transitionDelay: crecida ? `${i * 45}ms` : "0ms" }}
            >
              <span className="pen-dato-mei-pct">{fmtPct(m.pct, 1)}</span>
              <span
                className="pen-dato-mei-bar"
                style={{ height: crecida ? `${Math.max(h, 12)}%` : "0%" }}
              />
              <span className="pen-dato-mei-anio">{m.anio}</span>
            </button>
          );
        })}
      </div>
      <p className="pen-dato-card-txt">
        Sube del 0,6 % (2023) al 1,2 % (2029). Hoy ~{fmtPct(actual.pct, 1)}. No
        recorta la pensión actual: refuerza ingresos ante el pico demográfico.
      </p>
    </DatoCard>
  );
}

/** Grid con los seis datos convertidos en gráficos. */
export function PensionesDatosGraficos() {
  return (
    <div className="pen-datos-graficos share-host">
      <ShareDato text="Seis cifras clave de las pensiones en España: gasto diario, reparto, brecha, IPC y MEI." />
      <DatoNominaDia />
      <DatoTresCuartas />
      <DatoDoblePension />
      <DatoBrecha />
      <DatoRevalorizacion />
      <DatoMei />
    </div>
  );
}
