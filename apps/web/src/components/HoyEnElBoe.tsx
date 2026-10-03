import type { CatalogDay, CatalogEntry } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { ImpactMeter } from "./ImpactMeter";

/**
 * «Hoy en el BOE»: lo que la portada promete —descubre cómo te afecta— dicho
 * con los datos del último boletín, en la cabecera y no 1.000 píxeles más
 * abajo. Cuántas disposiciones hay, cómo se reparten por impacto y cuál es la
 * más importante.
 *
 * LEGAL.md §6: el enlace al texto oficial va POR ENCIMA del resumen, y el
 * resumen se identifica como IA y no oficial. Aquí también.
 */
const NIVELES = [
  { impact: 5, label: "Muy alto" },
  { impact: 4, label: "Alto" },
  { impact: 3, label: "Amplio" },
  { impact: 2, label: "Reducido" },
  { impact: 1, label: "Trámite" },
] as const;

/** La de mayor impacto; a igualdad, la primera del boletín. */
function masImportante(entries: CatalogEntry[]): CatalogEntry | null {
  return entries.reduce<CatalogEntry | null>(
    (best, e) => (e.impact !== null && e.plainTitle && (best === null || e.impact > (best.impact ?? 0)) ? e : best),
    null,
  );
}

export function HoyEnElBoe({ day }: { day: CatalogDay }) {
  const total = day.entries.length;
  const conImpacto = day.entries.filter((e) => e.impact !== null);
  const relevantes = conImpacto.filter((e) => (e.impact ?? 0) >= 3).length;
  const destacada = masImportante(day.entries);
  const reparto = NIVELES.map((n) => ({ ...n, count: conImpacto.filter((e) => e.impact === n.impact).length })).filter((n) => n.count > 0);

  return (
    <section className="hoy-boe" aria-labelledby="hoy-boe-title">
      <div className="hoy-boe-overview">
      <header className="hoy-boe-head">
        <p className="hoy-boe-kicker"><span className="hoy-boe-live" aria-hidden="true" />Último boletín</p>
        <h2 id="hoy-boe-title"><time dateTime={day.date}>{formatDate(day.date)}</time></h2>
      </header>

      <div className="hoy-boe-cifras">
        <p className="hoy-boe-cifra"><strong>{total}</strong><span>{total === 1 ? "disposición" : "disposiciones"}</span></p>
        <p className="hoy-boe-cifra hoy-boe-cifra-gold"><strong>{relevantes}</strong><span>con impacto 3 o superior</span></p>
      </div>

      {conImpacto.length > 0 && (
        <div className="hoy-boe-reparto">
          {/* La barra es decorativa: la misma información va en la leyenda. */}
          <div className="hoy-boe-barra" aria-hidden="true">
            {reparto.map((n) => <i key={n.impact} className={`nivel-${n.impact}`} style={{ flexGrow: n.count }} />)}
          </div>
          <ul className="hoy-boe-leyenda">
            {reparto.map((n) => <li key={n.impact}><i className={`nivel-${n.impact}`} aria-hidden="true" />{n.count} {n.label.toLowerCase()}</li>)}
          </ul>
        </div>
      )}
      {conImpacto.length < total && <p className="hoy-boe-pending">{total - conImpacto.length} pendientes de valorar</p>}
      </div>

      {destacada && (
        <article className="hoy-boe-destacada">
          <p className="hoy-boe-etiqueta">Destacado del boletín</p>
          {destacada.impact !== null && <ImpactMeter impact={destacada.impact} />}
          <h3><a href={`/d/${destacada.id}`} data-engagement="boe_open">{destacada.plainTitle}</a></h3>
          <a className="hoy-boe-oficial" href={destacada.officialHtmlUrl} rel="noopener noreferrer">Texto oficial · BOE <span aria-hidden="true">↗</span></a>
          {destacada.shortPhrase && <p className="hoy-boe-frase">{destacada.shortPhrase}</p>}
          <p className="hoy-boe-updated">Actualización del texto oficial: <time dateTime={destacada.lastOfficialUpdateAt}>{formatDate(destacada.lastOfficialUpdateAt.slice(0, 10))}</time></p>
          <p className="hoy-boe-pie"><span>Resumen IA · no oficial</span><a href={`/d/${destacada.id}`} data-engagement="boe_open">Leer resumen <span aria-hidden="true">→</span></a></p>
        </article>
      )}
    </section>
  );
}
