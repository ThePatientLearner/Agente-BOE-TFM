"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  ASALARIADOS_TRAMOS,
  CARGA_AMPLIADA,
  CARGA_POR_GRUPO,
  CESTA_AMPLIADA_MILLONES,
  CESTA_TOP20_PCT,
  CESTA_TOP_TRAMOS,
  CONCENTRACION_IRPF,
  GRUPOS_RENTA,
  HERO,
  HUECO_FISCAL,
  HUECO_FISCAL_FUENTES,
  HUECO_FISCAL_TOTAL_MILLONES,
  IVA_META,
  IVA_POR_DECIL,
  IVA_RESUMEN,
  IVA_TIPOS,
  MIX_IMPUESTOS,
  PERFILES,
  POBLACION_ESPANA_MILLONES,
  POBLACION_ROLES,
  RECAUDACION_2024,
  SALDO_QUINTILES,
  TRAMOS_FINOS,
} from "@/lib/fiesta-data";
import { INSTANTANEA } from "@/lib/pensiones-data";
import { useFiestaSinIva } from "./FiestaModoCalculo";
import { ShareDato } from "./ShareDato";

/* ── Helpers ────────────────────────────────────────────────────── */

function fmtInt(n: number): string {
  return Math.round(n).toLocaleString("es-ES");
}

function fmtEuros(n: number): string {
  return `${n.toLocaleString("es-ES", { maximumFractionDigits: 0 })} €`;
}

function fmtMillones(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toLocaleString("es-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} mil M€`;
  }
  return `${n.toLocaleString("es-ES", {
    maximumFractionDigits: 0,
  })} M€`;
}

function fmtPct(n: number, digitos = 0): string {
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

/* ── Hero impactante ────────────────────────────────────────────── */

/**
 * Dato estrella del tramo alto (cesta justa sin IVA por defecto).
 * El IVA se suma a mano con la barra de modo que hay justo debajo.
 */
export function FiestaHero() {
  const sinIva = useFiestaSinIva();
  const pct = sinIva ? CESTA_TOP20_PCT.sinIva : CESTA_TOP20_PCT.conIva;
  // Entrada una sola vez; al cambiar de modo solo anima la barra (width CSS)
  // y el pulso de la cifra, sin rehacer el fade del bloque.
  const crecida = useCrecida();

  const cifra = `${pct} %`;
  // Cortes más estrechos que el 20 % del dato principal: 10 % y 5 % de arriba.
  const tramosTop = CESTA_TOP_TRAMOS.filter((t) => t.id !== "top20");
  // El modo de partida es sin IVA, así que se queda con el gancho principal;
  // el de con IVA pasa a anunciarse como lo que el lector acaba de activar.
  const kicker = sinIva
    ? "¿Quién paga la fiesta?"
    : "Contando también el IVA del consumo";
  const etiquetaPrefijo = sinIva
    ? "de IRPF + capital + Sociedades"
    : HERO.etiquetaPrefijo;
  const contrasteDer = sinIva
    ? { valor: cifra, label: "del total sin IVA" }
    : HERO.contrasteDer;
  const cestaLabel = sinIva
    ? "IRPF, capital y Sociedades"
    : "IRPF, capital, Sociedades e IVA";
  const shareText = sinIva
    ? `El 20% de la población (desde ~50.000 €) aporta ~${CESTA_TOP20_PCT.sinIva}% de IRPF + capital + Sociedades en España (sin IVA). Con IVA serían ~${CESTA_TOP20_PCT.conIva}%.`
    : `El 20% de la población (desde ~50.000 €) aporta ~${CESTA_TOP20_PCT.conIva}% de IRPF + capital + Sociedades + IVA en España. Sin IVA serían ~${CESTA_TOP20_PCT.sinIva}%.`;

  return (
    <section
      className={`fiesta-hero share-host${crecida ? " es-crecida" : ""}`}
      aria-label={`Dato principal: el 20% de arriba aporta el ${pct}% de la cesta (${sinIva ? "sin" : "con"} IVA)`}
    >
      <ShareDato text={shareText} />
      <div className="fiesta-hero-glow" aria-hidden="true" />
      <p className="fiesta-hero-kicker">{kicker}</p>
      <p className="fiesta-hero-cifra" key={sinIva ? "sin" : "con"}>
        {cifra}
      </p>
      <p className="fiesta-hero-etiqueta">
        {etiquetaPrefijo}{" "}
        <mark className="fiesta-hero-marca">{HERO.etiquetaDestacado}</mark>
      </p>

      <div className="fiesta-hero-contraste" aria-hidden="true">
        <div className="fiesta-hero-chip">
          <strong>{HERO.contrasteIzq.valor}</strong>
          <span>{HERO.contrasteIzq.label}</span>
        </div>
        <span className="fiesta-hero-flecha">→</span>
        <div className="fiesta-hero-chip fiesta-hero-chip-gold">
          <strong key={sinIva ? "sin" : "con"}>{contrasteDer.valor}</strong>
          <span>{contrasteDer.label}</span>
        </div>
      </div>

      <div
        className="fiesta-hero-barra"
        role="img"
        aria-label={`El 20% de arriba aporta el ${pct}% de ${cestaLabel}`}
      >
        <div className="fiesta-hero-barra-pista">
          <span
            className="fiesta-hero-barra-fill"
            style={{ width: crecida ? `${pct}%` : "0%" }}
          />
        </div>
        <div className="fiesta-hero-barra-labels">
          <span>20 % con + rentas</span>
          <span>
            {pct} % del total ({sinIva ? "sin" : "con"} IVA)
          </span>
        </div>
      </div>

      <div className="fiesta-hero-tramos">
        {tramosTop.map((t) => {
          const tramoPct = sinIva ? t.sinIva : t.conIva;
          return (
            <div
              key={t.id}
              className={`fiesta-hero-tramo es-${t.id}`}
              role="img"
              aria-label={`El ${t.poblacionPct}% con más renta aporta el ${tramoPct}% de ${cestaLabel}`}
            >
              <div className="fiesta-hero-tramo-cifras">
                <strong>{t.etiqueta}</strong>
                <span className="fiesta-hero-tramo-flecha">→</span>
                <strong
                  className="fiesta-hero-tramo-pct"
                  key={sinIva ? "sin" : "con"}
                >
                  {tramoPct} %
                </strong>
              </div>
              <div className="fiesta-hero-barra-pista">
                <span
                  className="fiesta-hero-barra-fill"
                  style={{ width: crecida ? `${tramoPct}%` : "0%" }}
                />
              </div>
              <p className="fiesta-hero-tramo-nota">
                {t.detalle} · {sinIva ? "sin" : "con"} IVA
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── KPIs de recaudación ────────────────────────────────────────── */

const KPIS = [
  {
    id: "total",
    etiqueta: "Recaudación total",
    valor: () => fmtMillones(RECAUDACION_2024.totalMillones),
    nota: "AEAT · 2024",
    acento: "gold" as const,
  },
  {
    id: "irpf",
    etiqueta: "IRPF",
    valor: () => fmtMillones(RECAUDACION_2024.irpfMillones),
    nota: `${RECAUDACION_2024.irpfPctTotal.toLocaleString("es-ES", { maximumFractionDigits: 1 })} % de la caja`,
    acento: "gold" as const,
  },
  {
    id: "soc",
    etiqueta: "Sociedades",
    valor: () => fmtMillones(RECAUDACION_2024.sociedadesMillones),
    nota: "Beneficio empresarial",
    acento: "rose" as const,
  },
  {
    id: "cesta",
    etiqueta: "Cesta justa",
    valor: () => fmtMillones(CESTA_AMPLIADA_MILLONES),
    nota: "IRPF + IS + IVA",
    acento: "gold" as const,
  },
  {
    id: "top20",
    etiqueta: "Top 20 % → cesta",
    valor: () => fmtPct(CESTA_TOP20_PCT.conIva),
    nota: `Con IVA · sin IVA ~${CESTA_TOP20_PCT.sinIva} %`,
    acento: "rose" as const,
  },
  {
    id: "top10irpf",
    etiqueta: "Top 10 % → IRPF",
    valor: () => fmtPct(CONCENTRACION_IRPF.top10PctCuota),
    nota: "Solo cuota del IRPF",
    acento: "blue" as const,
  },
] as const;

export function FiestaKpis() {
  const crecida = useCrecida();
  return (
    <div className={`share-host fiesta-kpis-host${crecida ? " es-crecida" : ""}`}>
      <ShareDato text="Recaudación AEAT 2025: ~325 mil M€. El top 20% de renta aporta ~52% del total (IRPF + capital + IS + IVA)." />
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

/* ── Población: quién trabaja / recibe / niños (barra horizontal) ─ */

export function FiestaPoblacionRoles() {
  const crecida = useCrecida();
  const total = POBLACION_ROLES.reduce((s, r) => s + r.millones, 0);
  const trabajan = POBLACION_ROLES.find((r) => r.id === "trabajan");
  const trabajanM = trabajan?.millones ?? 0;

  // Tramos de la barra: si un rol tiene subpartes (trabajan), se pintan
  // por separado con tonos distintos; el resto va de un color.
  const tramosBarra = POBLACION_ROLES.flatMap((r) =>
    r.partes && r.partes.length > 0
      ? r.partes.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          millones: p.millones,
          color: p.color,
          grupo: r.nombre,
        }))
      : [
          {
            id: r.id,
            nombre: r.nombre,
            millones: r.millones,
            color: r.color,
            grupo: r.nombre,
          },
        ],
  );

  const shareTrabajan =
    trabajan?.partes
      ?.map(
        (p) =>
          `${p.millones.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M ${p.nombre.toLowerCase()}`,
      )
      .join("; ") ?? `${trabajanM.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M trabajan`;

  return (
    <section
      className={`fiesta-pob share-host${crecida ? " es-crecida" : ""}`}
      aria-label="Composición de la población: quién trabaja y quién recibe"
    >
      <ShareDato
        text={`España ~${POBLACION_ESPANA_MILLONES.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M: de los que trabajan (${trabajanM.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M) → ${shareTrabajan}. El resto: prestación, inactivos o niños.`}
      />
      <div className="fiesta-pob-cab">
        <div>
          <p className="fiesta-pob-kicker">Antes de repartir impuestos</p>
          <h2 className="fiesta-pob-titulo">Quién es quién en la población</h2>
        </div>
        <p className="fiesta-pob-total">
          ~{POBLACION_ESPANA_MILLONES.toLocaleString("es-ES", {
            maximumFractionDigits: 1,
          })}{" "}
          M habitantes
        </p>
      </div>

      <div
        className="fiesta-pob-barra"
        role="img"
        aria-label={tramosBarra
          .map(
            (t) =>
              `${t.nombre}: ${t.millones.toLocaleString("es-ES", { maximumFractionDigits: 1 })} millones`,
          )
          .join(". ")}
      >
        {tramosBarra.map((t) => {
          const pct = (t.millones / total) * 100;
          return (
            <div
              key={t.id}
              className="fiesta-pob-tramo"
              style={{
                flexGrow: crecida ? t.millones : 0.01,
                background: t.color,
                minWidth: crecida && pct > 0 ? "2px" : 0,
              }}
              title={`${t.nombre}: ${t.millones.toLocaleString("es-ES", { maximumFractionDigits: 1 })} M (${fmtPct(pct, 0)})`}
            >
              {pct >= 12 && (
                <span className="fiesta-pob-tramo-label">
                  {t.millones.toLocaleString("es-ES", {
                    maximumFractionDigits: 1,
                  })}
                  M
                </span>
              )}
            </div>
          );
        })}
      </div>

      <ul className="fiesta-pob-leyenda">
        {POBLACION_ROLES.map((r) => {
          const pct = (r.millones / total) * 100;
          const tienePartes = Boolean(r.partes && r.partes.length > 0);
          return (
            <li
              key={r.id}
              className={tienePartes ? "fiesta-pob-leyenda-con-partes" : undefined}
            >
              <i style={{ background: r.color }} aria-hidden="true" />
              <div className="fiesta-pob-leyenda-txt">
                <strong>{r.nombre}</strong>
                <span>{r.detalle}</span>
              </div>
              <div className="fiesta-pob-leyenda-nums">
                <strong>
                  {r.millones.toLocaleString("es-ES", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  M
                </strong>
                <span>{fmtPct(pct, 0)}</span>
              </div>
              {tienePartes && r.partes && (
                <ul className="fiesta-pob-subleyenda">
                  {r.partes.map((p) => {
                    const pctGrupo = (p.millones / r.millones) * 100;
                    const pctPob = (p.millones / total) * 100;
                    return (
                      <li key={p.id}>
                        <i style={{ background: p.color }} aria-hidden="true" />
                        <div className="fiesta-pob-leyenda-txt">
                          <strong>{p.nombre}</strong>
                          <span>
                            {p.detalle} · {fmtPct(pctGrupo, 0)} de quien trabaja
                          </span>
                        </div>
                        <div className="fiesta-pob-leyenda-nums">
                          <strong>
                            {p.millones.toLocaleString("es-ES", {
                              maximumFractionDigits: 1,
                            })}{" "}
                            M
                          </strong>
                          <span>{fmtPct(pctPob, 0)} pob.</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <p className="fiesta-pob-pie">
        Órdenes de magnitud INE / EPA / Seguridad Social · partición
        simplificada (sin solapes a propósito) · ~{fmtPct((trabajanM / total) * 100)}{" "}
        trabaja (cuenta ajena privada, empleo público y autónomos); el resto es
        dependencia, prestación o infancia
      </p>
    </section>
  );
}

/* ── Hueco fiscal: evasión vs elusión (barras horizontales) ─────── */

export function FiestaHuecoFiscal() {
  const crecida = useCrecida();
  const totalHueco = HUECO_FISCAL_TOTAL_MILLONES;
  /**
   * Referencia = caja tributaria **total** de la AEAT (IRPF + IVA + IS +
   * especiales + resto), no el IRPF solo. El hueco (evasión/elusión) abarca
   * fugas de todas esas vías; compararlo con un solo impuesto inflaría el %.
   */
  const recaudacion = RECAUDACION_2024.totalMillones;
  // Escala del gráfico: la recaudación total es la barra más larga (100 %).
  const max = recaudacion;
  const pctRecaudacion = (totalHueco / recaudacion) * 100;

  const filas = [
    {
      id: "evasion",
      nombre: "Evasión / fraude",
      detalle:
        "Ilegal · no declarar, economía sumergida, facturas falsas. Brecha anual de IRPF (neta) e IVA de hogares, FEDEA",
      millones: HUECO_FISCAL.evasionMillones,
      color: HUECO_FISCAL.colorEvasion,
    },
    {
      id: "elusion",
      nombre: "Elusión fiscal",
      detalle:
        "Legal o zona gris · traslado de beneficios y paraísos. Cifra ANUAL de Tax Justice Network, no su acumulado de seis años",
      millones: HUECO_FISCAL.elusionMillones,
      color: HUECO_FISCAL.colorElusion,
    },
    {
      id: "total",
      nombre: "Hueco total estimado",
      detalle: "Evasión + elusión · lo que no llega a la caja en un año",
      millones: totalHueco,
      color: "#c9a86a",
    },
    {
      id: "grandes",
      nombre: "De ese hueco · grandes patrimonios y empresas",
      detalle:
        "Elusión de multinacionales y grandes fortunas (TJN) más la parte de la brecha del IRPF que cae en capital",
      millones: HUECO_FISCAL.grandesMillones,
      color: HUECO_FISCAL.colorGrandes,
    },
    {
      id: "recaudacion",
      nombre: "Recaudación AEAT total",
      detalle: `Caja completa ${RECAUDACION_2024.periodo} · IRPF + IVA + IS + especiales + resto`,
      millones: recaudacion,
      color: HUECO_FISCAL.colorRecaudacion,
    },
  ] as const;

  return (
    <section className="fiesta-hueco share-host" aria-label="Evasión y elusión fiscal estimadas">
      <ShareDato text={`Hueco fiscal en España: del orden de ${fmtMillones(HUECO_FISCAL_TOTAL_MILLONES)} al año (~${Math.round((HUECO_FISCAL_TOTAL_MILLONES / RECAUDACION_2024.totalMillones) * 100)} % de la recaudación AEAT). Y no sale de donde se suele decir: según FEDEA manda la renta de actividades económicas y alquileres, no el capital de las grandes fortunas.`} />
      <header className="fiesta-hueco-header">
        <p className="fiesta-hueco-kicker">Antes de repartir la factura</p>
        <h2 className="fiesta-hueco-titulo">Lo que se escapa de la fiesta</h2>
        <p className="fiesta-hueco-intro">
          No todo el impuesto teórico llega a Hacienda. Una parte se pierde por{" "}
          <strong>evasión</strong> (ilegal) y otra por <strong>elusión</strong>{" "}
          (ingeniería legal o en zona gris). Las barras comparan esas fugas con
          la recaudación real: así se ve si el agujero es anecdótico o un
          problema de tamaño de Estado.
        </p>
      </header>

      <figure className={`pen-chart fiesta-hueco-chart${crecida ? " es-crecida" : ""}`}>
        <figcaption className="pen-chart-cabecera">
          <span className="pen-chart-titulo">
            Millones de euros al año · escenario orientativo
          </span>
        </figcaption>

        <ul className="fiesta-hueco-barras">
          {filas.map((f) => {
            const ancho = (f.millones / max) * 100;
            return (
              <li key={f.id} className="fiesta-hueco-fila">
                <div className="fiesta-hueco-meta">
                  <strong style={{ color: f.color }}>{f.nombre}</strong>
                  <span>{f.detalle}</span>
                </div>
                <div className="fiesta-hueco-pista" aria-hidden="true">
                  <span
                    className="fiesta-hueco-fill"
                    style={{
                      width: crecida ? `${ancho}%` : "0%",
                      background: f.color,
                    }}
                  />
                </div>
                <div className="fiesta-hueco-nums">
                  <strong>
                    {fmtMillones(f.millones)}
                    <small> / año</small>
                  </strong>
                  <span>
                    {f.id === "recaudacion"
                      ? "caja real de un año"
                      : `${fmtPct((f.millones / recaudacion) * 100, 1)} de la caja anual`}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="pen-chart-pie">
          {HUECO_FISCAL.periodo} · los % se miden sobre la{" "}
          <strong>recaudación tributaria total</strong> de la AEAT (
          {RECAUDACION_2024.periodo}: ~
          {fmtMillones(recaudacion)}
          ), no solo sobre el IRPF: el hueco mezcla fugas de IRPF, IVA, IS y
          resto. La evasión sale de sumar dos estimaciones de FEDEA: la brecha
          del IRPF una vez descontado lo que la AEAT ya recupera cada año con
          sus inspecciones, y la del IVA de los hogares. En conjunto,{" "}
          {fmtMillones(HUECO_FISCAL.rangoEvasion[0])}–
          {fmtMillones(HUECO_FISCAL.rangoEvasion[1])}, y se usa el centro; la
          elusión, del traslado de beneficios que calcula Tax Justice Network,
          repartido por años. <strong>No es un acta de la AEAT</strong>: la
          Agencia calcula su brecha por dentro y no la publica, así que todo
          esto son estimaciones académicas con horquillas anchas.
        </p>
      </figure>

      <div className="fiesta-hueco-veredicto">
        <p>
          El hueco total (~
          <strong className="disclaimer-highlight">
            {fmtMillones(totalHueco)}
          </strong>
          ) ronda el{" "}
          <strong className="disclaimer-highlight">
            {fmtPct(pctRecaudacion, 0)}
          </strong>{" "}
          de la <strong>caja tributaria completa</strong> de la AEAT en un año
          (IRPF + IVA + Sociedades + especiales + resto), no del IRPF solo. No
          es «cuatro duros»: es del orden de una partida entera de Estado. La
          mayor parte es <strong>evasión</strong> (~
          {fmtPct((HUECO_FISCAL.evasionMillones / totalHueco) * 100, 0)} del
          hueco); la <strong>elusión</strong> es menor en volumen estimado.
          Dentro del total, del orden de{" "}
          <strong className="disclaimer-highlight">
            {fmtMillones(HUECO_FISCAL.grandesMillones)}
          </strong>{" "}
          (~
          {fmtPct((HUECO_FISCAL.grandesMillones / totalHueco) * 100, 0)}) se
          atribuye a <strong>grandes patrimonios y empresas</strong>, sobre todo
          por traslado de beneficios de multinacionales.
        </p>
      </div>

      {/* El reparto por tipo de renta va aquí y no en la letra pequeña porque
          contesta a la pregunta que todo el mundo trae hecha —«se lo saltan los
          ricos»— y la contesta que no del todo. Callarlo sería dejar que el
          gráfico insinuara lo contrario de lo que dice el estudio. */}
      <div className="fiesta-hueco-composicion">
        <p className="fiesta-hueco-composicion-k">
          ¿Y quién se lo salta? No quien se suele decir
        </p>
        <p className="fiesta-hueco-composicion-intro">
          FEDEA reparte la brecha del IRPF por tipo de renta y el orden
          sorprende: el grueso está donde no hay retención automática, no en el
          capital de las grandes fortunas.
        </p>
        <ul>
          {HUECO_FISCAL.composicion.map((c) => (
            <li key={c.id}>
              <span className="fiesta-hueco-comp-k">{c.etiqueta}</span>
              <span className="fiesta-hueco-comp-v">{c.pesoPct}</span>
              <span className="fiesta-hueco-comp-n">{c.nota}</span>
            </li>
          ))}
        </ul>
        <p className="fiesta-hueco-composicion-pie">
          Esto no dice que las grandes fortunas cumplan más ni menos: dice dónde
          está el volumen. Una parte grande de ese dinero se escapa en muchas
          operaciones pequeñas, no en pocas muy grandes. Fuentes:{" "}
          {HUECO_FISCAL_FUENTES.map((f) => f.etiqueta).join(" · ")}.
        </p>
      </div>

      <h3 className="fiesta-hueco-sub">¿Cuánto cubriría recuperar ese hueco?</h3>

      {/* Primer cotejo: hueco total vs grandes patrimonios → nómina de pensiones. */}
      {(() => {
        const nominaMes = INSTANTANEA.nominaMensualMillones;
        const grandes = HUECO_FISCAL.grandesMillones;
        const diasTotal = (totalHueco / nominaMes) * 30;
        const diasGrandes = (grandes / nominaMes) * 30;
        const partes = (dias: number) => {
          const m = Math.floor(dias / 30);
          const d = Math.round(dias - m * 30);
          return { m, d: d === 30 ? 0 : d, mAdj: d === 30 ? m + 1 : m };
        };
        const t = partes(diasTotal);
        const g = partes(diasGrandes);
        const fmtMD = (p: { mAdj: number; d: number }) => {
          if (p.mAdj <= 0) return `~${p.d} días`;
          if (p.d <= 0) return `~${p.mAdj} ${p.mAdj === 1 ? "mes" : "meses"}`;
          return `~${p.mAdj} ${p.mAdj === 1 ? "mes" : "meses"} y ${p.d} días`;
        };
        const maxDias = Math.max(diasTotal, diasGrandes, 1);
        return (
          <div className="fiesta-hueco-pensiones share-host">
            <ShareDato
              text={`Recuperar el hueco fiscal (~${fmtMillones(totalHueco)}) cubriría ~${Math.round(diasTotal)} días de nómina de pensiones; la parte de grandes patrimonios y empresas (~${fmtMillones(grandes)}), ~${Math.round(diasGrandes)} días.`}
            />
            <p className="fiesta-hueco-pensiones-kicker">
              Frente a la nómina de pensiones · {INSTANTANEA.periodoCorto}
            </p>
            <p className="fiesta-hueco-pensiones-intro">
              Una nómina mensual de pensiones ronda{" "}
              <strong>{fmtMillones(nominaMes)}</strong>. Así de «largos» serían
              el hueco total y la parte de grandes patrimonios y empresas si se
              recuperaran enteros (escenario teórico).
            </p>
            <ul className="fiesta-hueco-pensiones-filas" aria-label="Huecos frente a nómina de pensiones">
              <li>
                <div className="fiesta-hueco-ref-meta">
                  <strong style={{ color: "var(--gold-bright)" }}>
                    Hueco total estimado
                  </strong>
                  <span>{fmtMillones(totalHueco)} / año</span>
                </div>
                <div className="fiesta-hueco-ref-pistas">
                  <div
                    className="fiesta-hueco-ref-pista fiesta-hueco-ref-pista-total"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width: crecida
                          ? `${Math.min(100, (diasTotal / maxDias) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <div className="fiesta-hueco-ref-nums">
                  <strong>{fmtMD(t)}</strong>
                  <span>
                    de pensiones (~
                    {(totalHueco / nominaMes).toLocaleString("es-ES", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    nóminas)
                  </span>
                </div>
              </li>
              <li>
                <div className="fiesta-hueco-ref-meta">
                  <strong style={{ color: HUECO_FISCAL.colorGrandes }}>
                    Grandes patrimonios y empresas
                  </strong>
                  <span>{fmtMillones(grandes)} / año · parte del hueco</span>
                </div>
                <div className="fiesta-hueco-ref-pistas">
                  <div
                    className="fiesta-hueco-ref-pista fiesta-hueco-ref-pista-grandes"
                    aria-hidden="true"
                  >
                    <span
                      style={{
                        width: crecida
                          ? `${Math.min(100, (diasGrandes / maxDias) * 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
                <div className="fiesta-hueco-ref-nums">
                  <strong style={{ color: HUECO_FISCAL.colorGrandes }}>
                    {fmtMD(g)}
                  </strong>
                  <span>
                    de pensiones (~
                    {(grandes / nominaMes).toLocaleString("es-ES", {
                      maximumFractionDigits: 1,
                    })}{" "}
                    nóminas)
                  </span>
                </div>
              </li>
            </ul>
            <p className="fiesta-hueco-pensiones-pie">
              Cálculo: hueco ÷ nómina mensual de pensiones (
              {fmtMillones(nominaMes)}, {INSTANTANEA.periodo}) × 30 días. Orden
              de magnitud, no un calendario de pagos.
            </p>
          </div>
        );
      })()}

      <ul className="fiesta-hueco-refs">
        {HUECO_FISCAL.referencias.map((ref) => {
          const grandes = HUECO_FISCAL.grandesMillones;
          const vecesTotal = totalHueco / ref.millones;
          const vecesGrandes = grandes / ref.millones;
          const pctTotal = Math.min(100, (totalHueco / ref.millones) * 100);
          const pctGrandes = Math.min(100, (grandes / ref.millones) * 100);
          // Escala de la pista: el mayor de los dos huecos respecto a la partida.
          const maxPct = Math.max(pctTotal, pctGrandes, 1);

          const etiqueta = (
            veces: number,
            pct: number,
            quien: string,
          ) =>
            veces >= 1 ? (
              <>
                <strong>
                  ×
                  {veces.toLocaleString("es-ES", {
                    maximumFractionDigits: 1,
                  })}
                </strong>
                <span>{quien}</span>
              </>
            ) : (
              <>
                <strong>{fmtPct(pct, 0)}</strong>
                <span>{quien}</span>
              </>
            );

          return (
            <li key={ref.id}>
              <div className="fiesta-hueco-ref-meta">
                <strong>{ref.etiqueta}</strong>
                <span>
                  {fmtMillones(ref.millones)} · {ref.nota}
                </span>
              </div>
              <div className="fiesta-hueco-ref-barras">
                <div className="fiesta-hueco-ref-bar-row">
                  <div
                    className="fiesta-hueco-ref-pista fiesta-hueco-ref-pista-total"
                    aria-hidden="true"
                    title="Hueco total"
                  >
                    <span
                      style={{
                        width: crecida
                          ? `${(pctTotal / maxPct) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <div className="fiesta-hueco-ref-nums">
                    {etiqueta(vecesTotal, pctTotal, "hueco total")}
                  </div>
                </div>
                <div className="fiesta-hueco-ref-bar-row">
                  <div
                    className="fiesta-hueco-ref-pista fiesta-hueco-ref-pista-grandes"
                    aria-hidden="true"
                    title="Grandes patrimonios y empresas"
                  >
                    <span
                      style={{
                        width: crecida
                          ? `${(pctGrandes / maxPct) * 100}%`
                          : "0%",
                      }}
                    />
                  </div>
                  <div className="fiesta-hueco-ref-nums fiesta-hueco-ref-nums-grandes">
                    {etiqueta(vecesGrandes, pctGrandes, "grandes patrim.")}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pen-callout fiesta-hueco-callout">
        <p>
          <strong>Cómo leerlo sin trampa.</strong> Recuperar el 100 % del hueco
          es imposible (coste de inspección, economía sumergida residual,
          elusión que se adapta). Pero la escala importa: aunque solo se
          recuperara una fracción, el orden de magnitud compite con debates de
          tipos del IRPF o del IVA. El problema no es simbólico; otra cosa es
          cuánto se puede cerrar de verdad cada año.
        </p>
      </div>
    </section>
  );
}

/* ── Barras apiladas: población vs cuota ────────────────────────── */

export function FiestaPoblacionVsCuota() {
  const [modo, setModo] = useState<"cuota" | "poblacion">("cuota");
  const crecida = useCrecida(modo);
  const altas = CARGA_POR_GRUPO.find((g) => g.id === "altas")!;
  const medias = CARGA_POR_GRUPO.find((g) => g.id === "medias")!;
  const bajos = CARGA_POR_GRUPO.find((g) => g.id === "bajos")!;

  return (
    <div className="fiesta-irpf-acotado share-host">
      <ShareDato text="El 10% con más renta paga ~50% del IRPF en España; el 50% de abajo, solo ~8%. El diseño del impuesto es progresivo." />
      <figure className="pen-chart fiesta-irpf-acotado-izq">
        <figcaption className="pen-chart-cabecera">
          <span className="pen-chart-titulo">
            Solo IRPF: población frente a cuota
          </span>
          <span className="pen-medidas" role="group" aria-label="Mostrar">
            <button
              type="button"
              className="pen-medida"
              aria-pressed={modo === "cuota"}
              onClick={() => setModo("cuota")}
            >
              Cuota pagada
            </button>
            <button
              type="button"
              className="pen-medida"
              aria-pressed={modo === "poblacion"}
              onClick={() => setModo("poblacion")}
            >
              Población
            </button>
          </span>
        </figcaption>

        <div className="fiesta-stack-wrap">
          <div
            className={`fiesta-stack${crecida ? " es-crecida" : ""}`}
            role="img"
            aria-label={
              modo === "cuota"
                ? "Reparto de la cuota del IRPF por tramos de renta"
                : "Reparto de la población por tramos de renta"
            }
          >
            {TRAMOS_FINOS.map((t) => {
              const pct = modo === "cuota" ? t.cuotaIrpfPct : t.poblacionPct;
              return (
                <div
                  key={t.id}
                  className="fiesta-stack-tramo"
                  style={{
                    flexGrow: crecida ? pct : 0.01,
                    background: t.color,
                    minWidth: crecida && pct > 0 ? "2px" : 0,
                  }}
                  title={`${t.nombre}: ${pct} %`}
                >
                  {pct >= 12 && (
                    <span className="fiesta-stack-label">{fmtPct(pct)}</span>
                  )}
                </div>
              );
            })}
          </div>

          <ul className="fiesta-stack-leyenda">
            {TRAMOS_FINOS.map((t) => (
              <li key={t.id}>
                <i style={{ background: t.color }} aria-hidden="true" />
                <span className="fiesta-stack-nombre">{t.nombre}</span>
                <span className="fiesta-stack-vals">
                  <strong>{fmtPct(t.cuotaIrpfPct)}</strong>
                  <em>cuota</em>
                  <span className="fiesta-stack-sep">·</span>
                  <strong>{fmtPct(t.poblacionPct)}</strong>
                  <em>pob.</em>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="pen-chart-pie">
          Dato clásico: el decil más alto ≈ 50 % del IRPF · orientativo AEAT
        </p>
      </figure>

      {/* Acotación a la derecha: capital + Sociedades del tramo alto */}
      <aside className="fiesta-acotacion" aria-label="Acotación con capital y Sociedades">
        <p className="fiesta-acotacion-kicker">Acotación · tramo alto</p>
        <p className="fiesta-acotacion-lead">
          El <strong>50 % del IRPF</strong> del 10 % más rico es solo una
          casilla. Si sumamos capital, dividendos, Sociedades y el contraste
          del <strong>IVA</strong>, el grupo que más carga la cesta justa sigue
          siendo el de <strong>rentas altas</strong> (desde ~50.000 €).
        </p>

        <div className="fiesta-acotacion-dato">
          <span className="fiesta-acotacion-cifra">
            {fmtPct(altas.pctCestaSinIva, 0)}
          </span>
          <span className="fiesta-acotacion-txt">
            de IRPF + capital + IS lo ponen las{" "}
            <strong>rentas altas</strong> (~{fmtPct(altas.poblacionPct)} de la
            población)
          </span>
        </div>

        <ul className="fiesta-acotacion-vias">
          <li>
            <i style={{ background: CARGA_AMPLIADA.vias[0].color }} aria-hidden="true" />
            <span>IRPF trabajo</span>
            <strong>{fmtMillones(altas.irpfTrabajo)}</strong>
          </li>
          <li>
            <i style={{ background: CARGA_AMPLIADA.vias[1].color }} aria-hidden="true" />
            <span>IRPF capital / div.</span>
            <strong>{fmtMillones(altas.irpfCapital)}</strong>
          </li>
          <li>
            <i style={{ background: CARGA_AMPLIADA.vias[2].color }} aria-hidden="true" />
            <span>Sociedades ~</span>
            <strong>{fmtMillones(altas.sociedades)}</strong>
          </li>
        </ul>

        <div className="fiesta-acotacion-vs">
          <div>
            <span>Rentas medias</span>
            <strong>{fmtPct(medias.pctCestaSinIva, 0)}</strong>
          </div>
          <div>
            <span>Rentas bajas</span>
            <strong>{fmtPct(bajos.pctCestaSinIva, 0)}</strong>
          </div>
        </div>

        <p className="fiesta-acotacion-pie">
          Conclusión: en trabajo + ahorro + IS el tramo alto pone ~{fmtPct(CESTA_TOP20_PCT.sinIva)}.
          Si sumamos el <strong>IVA</strong>, baja a ~{fmtPct(CESTA_TOP20_PCT.conIva)}
          del total —sigue siendo el grupo que más carga, no la clase media—.
        </p>
      </aside>
    </div>
  );
}

/* ── Tres grupos: pobres / medios / ricos ───────────────────────── */

export function FiestaGrupos() {
  const crecida = useCrecida();
  const maxCuota = Math.max(...GRUPOS_RENTA.map((g) => g.cuotaAmpliadaPct));

  return (
    <div className={`fiesta-grupos share-host${crecida ? " es-crecida" : ""}`}>
      <ShareDato text="Cesta justa (IRPF+capital+IS+IVA): rentas bajas ~14%, medias ~34%, altas ~52%. Altas = desde ~50.000 €/año (~20% de la población)." />
      {GRUPOS_RENTA.map((g) => (
        <article key={g.id} className={`fiesta-grupo fiesta-grupo-${g.id}`}>
          <header>
            <span
              className="fiesta-grupo-dot"
              style={{ background: g.color }}
              aria-hidden="true"
            />
            <div>
              <h3>{g.nombre}</h3>
              <p className="fiesta-grupo-sub">{g.subtitulo}</p>
            </div>
          </header>

          <div className="fiesta-grupo-metricas">
            <div>
              <span className="fiesta-grupo-k">Cesta con IVA</span>
              <span className="fiesta-grupo-v" style={{ color: g.color }}>
                {fmtPct(g.cuotaAmpliadaPct)}
                <small className="fiesta-grupo-v-sub">
                  sin IVA ~{fmtPct(g.cuotaSinIvaPct)}
                </small>
              </span>
            </div>
            <div>
              <span className="fiesta-grupo-k">Solo IRPF</span>
              <span className="fiesta-grupo-v">{fmtPct(g.cuotaIrpfPct)}</span>
            </div>
            <div>
              <span className="fiesta-grupo-k">Población</span>
              <span className="fiesta-grupo-v">
                {fmtPct(g.poblacionPct)}
                <small className="fiesta-grupo-v-sub">
                  ~{g.poblacionMillones.toLocaleString("es-ES", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  M · {g.rentaRango}
                </small>
              </span>
            </div>
          </div>

          <div className="fiesta-grupo-barra" aria-hidden="true">
            <span
              style={{
                width: crecida
                  ? `${(g.cuotaAmpliadaPct / maxCuota) * 100}%`
                  : "0%",
                background: g.color,
              }}
            />
          </div>

          <p className="fiesta-grupo-saldo">
            {g.saldoNeto === "beneficiario" && (
              <span className="fiesta-badge fiesta-badge-ok">Beneficiario neto</span>
            )}
            {g.saldoNeto === "mixto" && (
              <span className="fiesta-badge fiesta-badge-mid">Cerca del equilibrio</span>
            )}
            {g.saldoNeto === "pagador" && (
              <span className="fiesta-badge fiesta-badge-pay">Contribuyente neto</span>
            )}
            <span className="fiesta-grupo-saldo-num">
              {g.saldoSobreRenta > 0 ? "+" : ""}
              {fmtPct(g.saldoSobreRenta)} sobre renta bruta
            </span>
          </p>

          <p className="fiesta-grupo-desc">{g.descripcion}</p>
        </article>
      ))}
    </div>
  );
}

/* ── Carga ampliada: IRPF trabajo + capital + Sociedades ────────── */

export function FiestaCargaAmpliada() {
  const [modo, setModo] = useState<"ampliada" | "solo-irpf">("ampliada");
  const crecida = useCrecida(modo);
  const max =
    modo === "ampliada"
      ? Math.max(...CARGA_POR_GRUPO.map((g) => g.total))
      : Math.max(...CARGA_POR_GRUPO.map((g) => g.soloIrpf));

  return (
    <figure className="pen-chart">
      <ShareDato text="Comparación justa: rentas altas (desde ~50k) aportan ~52% de IRPF + capital + Sociedades + IVA. Sin IVA serían ~60%." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">
          Comparación justa: qué pone cada tramo
        </span>
        <span className="pen-medidas" role="group" aria-label="Qué cesta medir">
          <button
            type="button"
            className="pen-medida"
            aria-pressed={modo === "ampliada"}
            onClick={() => setModo("ampliada")}
          >
            IRPF + capital + IS + IVA
          </button>
          <button
            type="button"
            className="pen-medida"
            aria-pressed={modo === "solo-irpf"}
            onClick={() => setModo("solo-irpf")}
          >
            Solo IRPF
          </button>
        </span>
      </figcaption>

      <ul className="fiesta-carga-lista">
        {CARGA_POR_GRUPO.map((g) => {
          const total = modo === "ampliada" ? g.total : g.soloIrpf;
          const pctBarra = (total / max) * 100;
          const pctCesta =
            modo === "ampliada"
              ? g.pctCesta
              : (g.soloIrpf /
                  (CARGA_AMPLIADA.irpfTrabajoMillones +
                    CARGA_AMPLIADA.irpfCapitalMillones)) *
                100;

          return (
            <li key={g.id} className="fiesta-carga-fila">
              <div className="fiesta-carga-meta">
                <strong style={{ color: g.color }}>{g.nombre}</strong>
                <span>
                  {fmtPct(g.poblacionPct)} de la población
                  <span className="fiesta-carga-renta"> · {g.rentaRango}</span>
                </span>
              </div>

              <div className="fiesta-carga-barras">
                {modo === "ampliada" ? (
                  <div className="fiesta-carga-stack" aria-hidden="true">
                    <span
                      className="fiesta-carga-seg"
                      title={`IRPF trabajo · ${fmtMillones(g.irpfTrabajo)}`}
                      style={{
                        width: crecida
                          ? `${(g.irpfTrabajo / max) * 100}%`
                          : "0%",
                        background: CARGA_AMPLIADA.vias[0].color,
                      }}
                    />
                    <span
                      className="fiesta-carga-seg"
                      title={`IRPF capital · ${fmtMillones(g.irpfCapital)}`}
                      style={{
                        width: crecida
                          ? `${(g.irpfCapital / max) * 100}%`
                          : "0%",
                        background: CARGA_AMPLIADA.vias[1].color,
                      }}
                    />
                    <span
                      className="fiesta-carga-seg"
                      title={`Sociedades · ${fmtMillones(g.sociedades)}`}
                      style={{
                        width: crecida
                          ? `${(g.sociedades / max) * 100}%`
                          : "0%",
                        background: CARGA_AMPLIADA.vias[2].color,
                      }}
                    />
                    <span
                      className="fiesta-carga-seg"
                      title={`IVA · ${fmtMillones(g.iva)}`}
                      style={{
                        width: crecida ? `${(g.iva / max) * 100}%` : "0%",
                        background: CARGA_AMPLIADA.vias[3].color,
                      }}
                    />
                  </div>
                ) : (
                  <div className="fiesta-carga-stack" aria-hidden="true">
                    <span
                      className="fiesta-carga-seg"
                      style={{
                        width: crecida ? `${pctBarra}%` : "0%",
                        background: g.color,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="fiesta-carga-nums">
                <strong>{fmtMillones(total)}</strong>
                <span>{fmtPct(pctCesta, 0)} del total</span>
                {modo === "ampliada" && (
                  <span className="fiesta-carga-iva-nota">
                    IVA ~{fmtMillones(g.iva)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {modo === "ampliada" && (
        <ul className="fiesta-carga-leyenda">
          {CARGA_AMPLIADA.vias.map((v) => (
            <li key={v.id}>
              <i style={{ background: v.color }} aria-hidden="true" />
              <span>
                {v.nombre}
                <em> · {v.detalle}</em>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="pen-chart-pie">
        {CARGA_AMPLIADA.periodo} · cesta ≈ {fmtMillones(CESTA_AMPLIADA_MILLONES)}{" "}
        (IRPF + IS + IVA) · el IVA se reparte con los pesos por decil; la
        incidencia del IS es un escenario divulgativo, no un censo de
        accionistas
      </p>
    </figure>
  );
}

/* ── Saldo neto por quintiles ───────────────────────────────────── */

export function FiestaSaldoQuintiles() {
  const crecida = useCrecida();
  const maxAbs = Math.max(...SALDO_QUINTILES.map((q) => Math.abs(q.saldoPctRenta)));

  return (
    <figure className="pen-chart">
      <ShareDato text="Saldo neto del Estado (FEDEA): el 60% de hogares con menos renta es beneficiario neto; el 40% de arriba financia el saldo." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">
          Saldo neto: prestaciones − impuestos (% renta bruta)
        </span>
      </figcaption>

      <div className="fiesta-saldo-eje" aria-hidden="true">
        <span>Recibe más</span>
        <span className="fiesta-saldo-cero">0</span>
        <span>Paga más</span>
      </div>

      <ul className={`fiesta-saldo-lista${crecida ? " es-crecida" : ""}`}>
        {SALDO_QUINTILES.map((q) => {
          const positivo = q.saldoPctRenta >= 0;
          const ancho = (Math.abs(q.saldoPctRenta) / maxAbs) * 100;
          return (
            <li key={q.id} className="fiesta-saldo-fila">
              <div className="fiesta-saldo-meta">
                <strong>{q.nombre}</strong>
                <span>{q.detalle}</span>
              </div>
              <div className="fiesta-saldo-pista">
                <div className="fiesta-saldo-mitad fiesta-saldo-izq">
                  {positivo && (
                    <span
                      className="fiesta-saldo-fill fiesta-saldo-fill-ok"
                      style={{
                        width: crecida ? `${ancho}%` : "0%",
                        background: q.color,
                      }}
                    />
                  )}
                </div>
                <div className="fiesta-saldo-mitad fiesta-saldo-der">
                  {!positivo && (
                    <span
                      className="fiesta-saldo-fill fiesta-saldo-fill-pay"
                      style={{
                        width: crecida ? `${ancho}%` : "0%",
                        background: q.color,
                      }}
                    />
                  )}
                </div>
              </div>
              <span
                className={`fiesta-saldo-num ${positivo ? "es-ok" : "es-pay"}`}
              >
                {positivo ? "+" : ""}
                {fmtPct(q.saldoPctRenta)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="pen-chart-pie">
        Orden de magnitud · FEDEA Observatorio (impuestos + prestaciones, 2022)
      </p>
    </figure>
  );
}

/* ── Donut mix de impuestos ─────────────────────────────────────── */

export function FiestaMixDonut() {
  const [activa, setActiva] = useState<string | null>(null);
  const crecida = useCrecida();
  const uid = useId();

  const total = useMemo(
    () => MIX_IMPUESTOS.reduce((s, c) => s + c.millones, 0),
    [],
  );

  const tramos = useMemo(() => {
    let acc = 0;
    return MIX_IMPUESTOS.map((c) => {
      const pct = (c.millones / total) * 100;
      const start = acc;
      acc += pct;
      return { ...c, pct, start };
    });
  }, [total]);

  const R = 42;
  const C = 2 * Math.PI * R;
  const destacada =
    tramos.find((t) => t.id === (activa ?? "irpf")) ?? tramos[0];

  return (
    <figure className="pen-chart pen-donut-wrap">
      <ShareDato text="Caja tributaria 2025 (AEAT): ~325 mil M€. IRPF ~142 mil M€ (~44%); el IVA es el segundo gran pilar." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">De dónde sale el dinero (2024)</span>
      </figcaption>

      <div className="pen-donut-body">
        <div className="pen-donut-svg-wrap">
          <svg viewBox="0 0 100 100" className="pen-donut" aria-hidden="true">
            <defs>
              <filter id={`${uid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="0"
                  stdDeviation="1.2"
                  floodColor="#c9a86a"
                  floodOpacity="0.35"
                />
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
            <span className="pen-donut-centro-pct">{fmtPct(destacada.pct, 1)}</span>
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
                {fmtPct(t.pct, 1)}
                <span className="pen-donut-leyenda-bruto">
                  {fmtMillones(t.millones)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="pen-chart-pie">
        Ingresos tributarios AEAT {RECAUDACION_2024.periodo} · ~
        {fmtMillones(RECAUDACION_2024.totalMillones)}
      </p>
    </figure>
  );
}

/* ── Asalariados: peso vs retenciones ───────────────────────────── */

export function FiestaAsalariados() {
  const [medida, setMedida] = useState<"retenciones" | "trabajadores">(
    "retenciones",
  );
  const crecida = useCrecida(medida);

  return (
    <figure className="pen-chart">
      <ShareDato text="Entre asalariados, la franja 20–50 mil € concentra ~48% de las retenciones del trabajo. Es la columna del IRPF de las nóminas." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">Asalariados: gente vs retenciones</span>
        <span className="pen-medidas" role="group" aria-label="Medir por">
          <button
            type="button"
            className="pen-medida"
            aria-pressed={medida === "retenciones"}
            onClick={() => setMedida("retenciones")}
          >
            Retenciones
          </button>
          <button
            type="button"
            className="pen-medida"
            aria-pressed={medida === "trabajadores"}
            onClick={() => setMedida("trabajadores")}
          >
            Trabajadores
          </button>
        </span>
      </figcaption>

      <ul className="pen-barras">
        {ASALARIADOS_TRAMOS.map((t) => {
          const pct =
            medida === "retenciones" ? t.retencionesPct : t.trabajadoresPct;
          return (
            <li key={t.id}>
              <div className="pen-barra-meta">
                <span className="pen-barra-nombre">{t.etiqueta}</span>
                <span className="pen-barra-valor">{fmtPct(pct)}</span>
              </div>
              <div className="pen-barra-pista" role="presentation">
                <div
                  className="pen-barra-fill"
                  style={{
                    width: crecida ? `${pct}%` : "0%",
                    background: t.color,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      <p className="pen-chart-pie">
        Rentas del trabajo · AEAT (retenciones 2023, órdenes de magnitud)
      </p>
    </figure>
  );
}

/* ── Perfiles: cuánto pone cada uno ─────────────────────────────── */

export function FiestaPerfiles() {
  const crecida = useCrecida();
  const totales = PERFILES.map(
    (p) => p.irpfAnual + p.capitalAnual + p.sociedadesAnual + p.ivaAnual,
  );
  const maxTotal = Math.max(...totales);

  return (
    <div className={`fiesta-perfiles share-host${crecida ? " es-crecida" : ""}`}>
      <ShareDato text="Misma cesta fiscal, cuatro facturas: en renta baja pesa el IVA; arriba, capital y Sociedades. El IRPF de nómina no cuenta toda la historia." />
      {PERFILES.map((p) => {
        const total =
          p.irpfAnual + p.capitalAnual + p.sociedadesAnual + p.ivaAnual;
        return (
          <article key={p.id} className="fiesta-perfil">
            <span
              className="fiesta-perfil-barra"
              style={{ background: p.color }}
              aria-hidden="true"
            />
            <h3>{p.titulo}</h3>
            <p className="fiesta-perfil-renta">
              Renta ~ {fmtEuros(p.rentaAnual)}/año
            </p>
            <p className="fiesta-perfil-irpf" style={{ color: p.color }}>
              {fmtEuros(total)}
              <small> total orientativo (IRPF + capital + IS + IVA)</small>
            </p>
            <ul className="fiesta-perfil-desglose">
              <li>
                <span>IRPF trabajo</span>
                <strong>{fmtEuros(p.irpfAnual)}</strong>
              </li>
              {p.capitalAnual > 0 && (
                <li>
                  <span>Capital / div.</span>
                  <strong>{fmtEuros(p.capitalAnual)}</strong>
                </li>
              )}
              {p.sociedadesAnual > 0 && (
                <li>
                  <span>Sociedades ~</span>
                  <strong>{fmtEuros(p.sociedadesAnual)}</strong>
                </li>
              )}
              <li>
                <span>IVA estimado</span>
                <strong>{fmtEuros(p.ivaAnual)}</strong>
              </li>
            </ul>
            <div className="fiesta-perfil-pista" aria-hidden="true">
              <span
                style={{
                  width: crecida ? `${(total / maxTotal) * 100}%` : "0%",
                  background: p.color,
                }}
              />
            </div>
            <p className="fiesta-perfil-tipo">
              Tipo efectivo IRPF ~ {fmtPct(p.tipoEfectivo, 1)}
              {" · "}
              IVA ~{fmtPct((p.ivaAnual / p.rentaAnual) * 100, 1)} renta
            </p>
            <p className="fiesta-perfil-nota">{p.nota}</p>
          </article>
        );
      })}
    </div>
  );
}

/* ── Comparador visual: 10 pagan = 50 de cuota ─────────────────── */

export function FiestaComparador() {
  const crecida = useCrecida();
  const dotsPob = Array.from({ length: 10 }, (_, i) => i);
  // ~52 % ≈ 5 de cada 10 € del total con IVA.
  const dotsCuota = Array.from({ length: 10 }, (_, i) => i);
  const eurosDelTop = Math.round(CESTA_TOP20_PCT.conIva / 10);

  return (
    <figure className={`pen-chart fiesta-comparador${crecida ? " es-crecida" : ""}`}>
      <ShareDato text="Si fuéramos 10 personas: 2 del tramo alto (desde ~50k) pondrían ~5 de cada 10€ de IRPF + capital + IS + IVA." />
      <figcaption className="pen-chart-cabecera">
        <span className="pen-chart-titulo">
          Si la población fueran 10 personas… (cesta con IVA)
        </span>
      </figcaption>

      <div className="fiesta-comp-grid">
        <div className="fiesta-comp-lado">
          <span className="fiesta-comp-tag">Quiénes son</span>
          <div className="fiesta-comp-dots" aria-hidden="true">
            {dotsPob.map((i) => (
              <span
                key={i}
                className={`fiesta-comp-dot ${i >= 8 ? "es-rico" : "es-resto"}`}
                style={{ transitionDelay: `${i * 40}ms` }}
              />
            ))}
          </div>
          <p>
            <strong>2 de 10</strong> están en el tramo alto (desde ~50.000 €)
          </p>
        </div>

        <div className="fiesta-comp-vs" aria-hidden="true">
          =
        </div>

        <div className="fiesta-comp-lado">
          <span className="fiesta-comp-tag fiesta-comp-tag-gold">Qué pagan</span>
          <div className="fiesta-comp-dots" aria-hidden="true">
            {dotsCuota.map((i) => (
              <span
                key={i}
                className={`fiesta-comp-dot ${i < eurosDelTop ? "es-rico" : "es-resto-dim"}`}
                style={{ transitionDelay: `${i * 40 + 120}ms` }}
              />
            ))}
          </div>
          <p>
            Esos <strong>2</strong> ponen{" "}
            <strong>{eurosDelTop} de cada 10 €</strong> de IRPF + capital + IS
            + IVA
          </p>
        </div>
      </div>
      <p className="pen-chart-pie">
        Metáfora visual · top 20 % ≈ {CESTA_TOP20_PCT.conIva} % del total con
        IVA (sin IVA ~{CESTA_TOP20_PCT.sinIva} %) · no un censo literal
      </p>
    </figure>
  );
}

/* ── IVA por percentil / decil de renta ─────────────────────────── */

type IvaPestana = "renta" | "cuota" | "euros" | "consumo";

const IVA_PESTANAS: {
  id: IvaPestana;
  label: string;
  titulo: string;
  lead: string;
}[] = [
  {
    id: "renta",
    label: "% sobre la renta",
    titulo: "Cuánto supone el IVA sobre ingresos",
    lead:
      "Aquí se ve la regresividad: el mismo impuesto de consumo se come una parte mayor de la renta de quien menos gana, porque gasta casi todo lo que entra.",
  },
  {
    id: "cuota",
    label: "Parte del IVA total",
    titulo: "Qué percentil paga cuánto del IVA del país",
    lead:
      "En euros de caja, el tramo alto aporta más: consume más en absoluto. No contradice lo anterior: una cosa es el peso sobre tu sueldo y otra el trozo del pastel total.",
  },
  {
    id: "euros",
    label: "Euros al año",
    titulo: "Factura de IVA embebida en el consumo",
    lead:
      "Orden de magnitud del IVA que «lleva» el carrito, la luz, el ocio y el resto del gasto de un hogar típico de cada decil. No es un recibo: va dentro de los precios.",
  },
  {
    id: "consumo",
    label: "Consumo vs ahorro",
    titulo: "Por qué el IVA pesa más abajo",
    lead:
      "Quien está abajo destina casi toda la renta al consumo (base del IVA). Arriba se ahorra más: esa parte no paga IVA. Por eso el tipo legal es el mismo y el tipo efectivo sobre renta no.",
  },
];

function valorIvaPestana(
  d: (typeof IVA_POR_DECIL)[number],
  pestana: IvaPestana,
): number {
  switch (pestana) {
    case "renta":
      return d.ivaSobreRenta;
    case "cuota":
      return d.cuotaIvaPct;
    case "euros":
      return d.ivaAnual;
    case "consumo":
      return d.consumoSobreRenta;
  }
}

function formatoIvaValor(pestana: IvaPestana, n: number): string {
  if (pestana === "euros") return fmtEuros(n);
  return fmtPct(n, pestana === "renta" ? 1 : 0);
}

export function FiestaIva() {
  const [pestana, setPestana] = useState<IvaPestana>("renta");
  const crecida = useCrecida(pestana);
  const meta = IVA_PESTANAS.find((p) => p.id === pestana)!;
  const max = Math.max(...IVA_POR_DECIL.map((d) => valorIvaPestana(d, pestana)));
  const pobre = IVA_RESUMEN.decilMasPobre;
  const rico = IVA_RESUMEN.decilMasRico;

  return (
    <section className="fiesta-iva share-host" aria-label="IVA por percentil de renta">
      <ShareDato text="El IVA pesa ~11% de la renta en el decil más pobre y ~3,5% en el más rico. En euros, el tramo alto pone más del total." />
      <div className="fiesta-iva-kpis" aria-label="Cifras clave del IVA">
        <div className="fiesta-iva-kpi">
          <span className="fiesta-iva-kpi-k">Recaudación IVA</span>
          <span className="fiesta-iva-kpi-v">
            {fmtMillones(IVA_META.recaudacionMillones)}
          </span>
          <span className="fiesta-iva-kpi-n">AEAT · 2024</span>
        </div>
        <div className="fiesta-iva-kpi">
          <span className="fiesta-iva-kpi-k">Decil 1 · sobre renta</span>
          <span className="fiesta-iva-kpi-v" style={{ color: pobre.color }}>
            {fmtPct(pobre.ivaSobreRenta, 1)}
          </span>
          <span className="fiesta-iva-kpi-n">~{fmtEuros(pobre.ivaAnual)}/año</span>
        </div>
        <div className="fiesta-iva-kpi">
          <span className="fiesta-iva-kpi-k">Decil 10 · sobre renta</span>
          <span className="fiesta-iva-kpi-v" style={{ color: rico.color }}>
            {fmtPct(rico.ivaSobreRenta, 1)}
          </span>
          <span className="fiesta-iva-kpi-n">~{fmtEuros(rico.ivaAnual)}/año</span>
        </div>
        <div className="fiesta-iva-kpi fiesta-iva-kpi-gold">
          <span className="fiesta-iva-kpi-k">Ratio D1 / D10</span>
          <span className="fiesta-iva-kpi-v">
            ×{IVA_META.ratioRegresividad.toLocaleString("es-ES", { maximumFractionDigits: 1 })}
          </span>
          <span className="fiesta-iva-kpi-n">más peso sobre la renta abajo</span>
        </div>
      </div>

      <ul className="fiesta-iva-tipos" aria-label="Tipos impositivos del IVA">
        {IVA_TIPOS.map((t) => (
          <li key={t.id}>
            <span className="fiesta-iva-tipo-pct" style={{ color: t.color }}>
              {fmtPct(t.tipo)}
            </span>
            <div>
              <strong>{t.nombre}</strong>
              <span>{t.ejemplos}</span>
            </div>
          </li>
        ))}
      </ul>

      <figure className="pen-chart fiesta-iva-chart">
        <figcaption className="pen-chart-cabecera">
          <span className="pen-chart-titulo">{meta.titulo}</span>
          <span
            className="pen-medidas fiesta-iva-tabs"
            role="tablist"
            aria-label="Vista del IVA por decil"
          >
            {IVA_PESTANAS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                className="pen-medida"
                aria-selected={pestana === p.id}
                aria-pressed={pestana === p.id}
                onClick={() => setPestana(p.id)}
              >
                {p.label}
              </button>
            ))}
          </span>
        </figcaption>

        <p className="fiesta-iva-lead">{meta.lead}</p>

        <ul
          className={`fiesta-iva-barras${crecida ? " es-crecida" : ""}`}
          role="img"
          aria-label={`${meta.titulo} por decil de renta`}
        >
          {IVA_POR_DECIL.map((d) => {
            const valor = valorIvaPestana(d, pestana);
            const ancho = max > 0 ? (valor / max) * 100 : 0;
            return (
              <li key={d.id} className="fiesta-iva-fila">
                <div className="fiesta-iva-meta">
                  <strong style={{ color: d.color }}>{d.nombre}</strong>
                  <span className="fiesta-iva-percentil">{d.percentil}</span>
                  <span className="fiesta-iva-detalle">{d.detalle}</span>
                </div>
                <div className="fiesta-iva-pista" aria-hidden="true">
                  <span
                    className="fiesta-iva-fill"
                    style={{
                      width: crecida ? `${ancho}%` : "0%",
                      background: d.color,
                    }}
                  />
                </div>
                <div className="fiesta-iva-nums">
                  <strong>{formatoIvaValor(pestana, valor)}</strong>
                  {pestana === "renta" && (
                    <span>de ~{fmtEuros(d.rentaMedia)}</span>
                  )}
                  {pestana === "cuota" && (
                    <span>del IVA total</span>
                  )}
                  {pestana === "euros" && (
                    <span>sobre ~{fmtEuros(d.rentaMedia)}</span>
                  )}
                  {pestana === "consumo" && (
                    <span>de la renta se consume</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {pestana === "renta" && (
          <div className="fiesta-iva-contraste" aria-hidden="true">
            <div className="fiesta-iva-contraste-lado">
              <span>Decil 1</span>
              <strong style={{ color: pobre.color }}>
                {fmtPct(pobre.ivaSobreRenta, 1)}
              </strong>
              <em>de la renta en IVA</em>
            </div>
            <span className="fiesta-iva-contraste-vs">vs</span>
            <div className="fiesta-iva-contraste-lado">
              <span>Decil 10</span>
              <strong style={{ color: rico.color }}>
                {fmtPct(rico.ivaSobreRenta, 1)}
              </strong>
              <em>de la renta en IVA</em>
            </div>
          </div>
        )}

        {pestana === "cuota" && (
          <div className="fiesta-iva-mitades">
            <div>
              <span>Mitad inferior (P0–50)</span>
              <strong>
                {fmtPct(IVA_RESUMEN.mitadInferior.cuotaIvaPct, 0)} del IVA
              </strong>
              <em>
                peso medio sobre renta ~
                {fmtPct(IVA_RESUMEN.mitadInferior.ivaSobreRentaMedia, 1)}
              </em>
            </div>
            <div>
              <span>Mitad superior (P50–100)</span>
              <strong>
                {fmtPct(IVA_RESUMEN.mitadSuperior.cuotaIvaPct, 0)} del IVA
              </strong>
              <em>
                peso medio sobre renta ~
                {fmtPct(IVA_RESUMEN.mitadSuperior.ivaSobreRentaMedia, 1)}
              </em>
            </div>
          </div>
        )}

        <p className="pen-chart-pie">
          {IVA_META.periodo} · deciles de renta del hogar · no un recibo
          personal · patrones tipo INE/IEF/FEDEA
        </p>
      </figure>

      <div className="fiesta-iva-paradoja">
        <h3>La paradoja en una frase</h3>
        <p>
          El <strong>10 % más pobre</strong> destina del orden del{" "}
          <strong className="disclaimer-highlight">
            {fmtPct(pobre.ivaSobreRenta, 1)}
          </strong>{" "}
          de su renta al IVA y aporta ~{fmtPct(pobre.cuotaIvaPct, 0)} de la
          recaudación. El <strong>10 % más rico</strong> destina solo{" "}
          <strong className="disclaimer-highlight">
            {fmtPct(rico.ivaSobreRenta, 1)}
          </strong>{" "}
          de su renta, pero pone ~{fmtPct(rico.cuotaIvaPct, 0)} del IVA total
          (~{fmtEuros(rico.ivaAnual)} frente a ~{fmtEuros(pobre.ivaAnual)} al
          año). Mismo impuesto; dos lecturas distintas según mires{" "}
          <em>esfuerzo</em> o <em>caja</em>.
        </p>
      </div>
    </section>
  );
}

/* ── Mini tabla de concentración ────────────────────────────────── */

export function FiestaTablaConcentracion() {
  const filas = [
    {
      tramo: "Top 1 %",
      cuotaIrpf: CONCENTRACION_IRPF.top1PctCuota,
      cesta: "—",
      nota: `Renta orientativa > ${fmtInt(CONCENTRACION_IRPF.umbralTop1)} €`,
    },
    {
      tramo: "Top 10 %",
      cuotaIrpf: CONCENTRACION_IRPF.top10PctCuota,
      cesta: "Dentro del tramo alto",
      nota: `Renta orientativa > ${fmtInt(CONCENTRACION_IRPF.umbralTop10)} € · ≈ mitad del IRPF`,
    },
    {
      tramo: "Top 20 % (rentas altas)",
      cuotaIrpf: CONCENTRACION_IRPF.top20PctCuota,
      cesta: `${fmtPct(CESTA_TOP20_PCT.conIva)} / ${fmtPct(CESTA_TOP20_PCT.sinIva)}`,
      nota: "Cesta con IVA / sin IVA · desde ~50.000 €",
    },
    {
      tramo: "Mitad inferior",
      cuotaIrpf: CONCENTRACION_IRPF.mitadInferiorPctCuota,
      cesta: "Mínimo",
      nota: "El 50 % con menos renta · casi sin capital; sí IVA",
    },
  ];

  return (
    <div className="fiesta-tabla-wrap share-host">
      <ShareDato text="Top 20% de renta: ~52% del total con IVA (~60% sin IVA). El 10% más rico paga ~50% del IRPF." />
      <table className="fiesta-tabla">
        <thead>
          <tr>
            <th scope="col">Tramo de renta</th>
            <th scope="col">% cuota IRPF</th>
            <th scope="col">Cesta con/sin IVA</th>
            <th scope="col">Nota</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => (
            <tr key={f.tramo}>
              <td>{f.tramo}</td>
              <td>
                <strong className="disclaimer-highlight">
                  {fmtPct(f.cuotaIrpf)}
                </strong>
              </td>
              <td>
                <strong>{f.cesta}</strong>
              </td>
              <td>{f.nota}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
