import type { CatalogDay, CatalogEntry } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { ImpactMeter } from "./ImpactMeter";

/**
 * «Hoy en el BOE»: lo que la portada promete —descubre cómo te afecta— dicho
 * con los datos del último boletín, en la cabecera y no 1.000 píxeles más
 * abajo. Cuántas disposiciones hay, cuántas son relevantes y cuál es la
 * más importante.
 *
 * LEGAL.md §6: el enlace al texto oficial va POR ENCIMA del resumen, y el
 * resumen se identifica como IA y no oficial. Aquí también.
 */
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

  return (
    <section className="hoy-boe" aria-labelledby="hoy-boe-title">
      <div className="hoy-boe-overview">
      <header className="hoy-boe-head">
        <p className="hoy-boe-kicker"><span className="hoy-boe-live" aria-hidden="true" />Último boletín</p>
        <h2 id="hoy-boe-title"><time dateTime={day.date}>{formatDate(day.date)}</time></h2>
      </header>

      <p className="hoy-boe-cifras"><strong>{total}</strong> {total === 1 ? "disposición" : "disposiciones"}{" "}<span><strong>{relevantes}</strong> con impacto 3 o superior</span></p>
      {conImpacto.length < total && <p className="hoy-boe-pending">{total - conImpacto.length} pendientes de valorar</p>}
      </div>

      {destacada && (
        <article className="hoy-boe-destacada">
          <div className="hoy-boe-meta"><p className="hoy-boe-etiqueta">Destacado</p>{destacada.impact !== null && <ImpactMeter impact={destacada.impact} />}</div>
          <h3><a href={`/d/${destacada.id}`} data-engagement="boe_open">{destacada.plainTitle}</a></h3>
          <div className="hoy-boe-links"><a className="hoy-boe-oficial" href={destacada.officialHtmlUrl} rel="noopener noreferrer">Texto oficial · BOE <span aria-hidden="true">↗</span></a><a href={`/d/${destacada.id}`} data-engagement="boe_open">Leer resumen <span aria-hidden="true">→</span></a></div>
          {destacada.shortPhrase && <p className="hoy-boe-frase">{destacada.shortPhrase}</p>}
          <p className="hoy-boe-updated">Actualización del texto oficial: <time dateTime={destacada.lastOfficialUpdateAt}>{formatDate(destacada.lastOfficialUpdateAt.slice(0, 10))}</time></p>
          <p className="hoy-boe-pie">Resumen IA · no oficial</p>
        </article>
      )}
    </section>
  );
}
