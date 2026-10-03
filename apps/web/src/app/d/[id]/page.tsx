import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GobiernoBadge } from "@/components/GobiernoBadge";
import { ImpactMeter } from "@/components/ImpactMeter";
import { PrintSummaryButton } from "@/components/PrintSummaryButton";
import { ShareSummaryButton } from "@/components/ShareSummaryButton";
import { fetchAllReferences, fetchDays, fetchEntry } from "@/lib/api";
import { relatedEntries } from "@/lib/related-entries";
import { formatDate } from "@/lib/format";

/**
 * Genera de antemano una página por disposición.
 *
 * Sin esto la ruta era dinámica: cada visita ejecutaba una función en Vercel y
 * una consulta contra la API, incluso repitiendo la misma ficha (comprobado en
 * producción, `x-vercel-cache: MISS` tres veces seguidas). Y son justo las
 * páginas que más tráfico reciben, porque son las que enlazan Google, Telegram
 * y Discord.
 *
 * Con la lista completa —la misma que ya alimenta el sitemap— cada ficha se
 * genera una vez y se sirve desde el CDN. El coste deja de crecer con las
 * visitas y pasa a crecer solo con el archivo, que suma ~3,5 al día.
 */
export async function generateStaticParams() {
  const referencias = await fetchAllReferences();
  return referencias.map((referencia) => ({ id: referencia.id }));
}

/**
 * `true` a propósito, al revés que en las subvenciones.
 *
 * Allí los meses son un conjunto cerrado y un valor inventado debía dar 404.
 * Aquí llegan disposiciones nuevas cada mañana, y entre la ingesta y el
 * siguiente despliegue de la web hay horas: sin esto, una ficha recién
 * publicada daría 404 justo cuando se acaba de anunciar en Telegram. Con
 * `true` se genera la primera vez que alguien la pide y queda cacheada; un
 * identificador que no existe sigue dando 404 porque `fetchEntry` devuelve
 * null y la página llama a `notFound()`.
 */
export const dynamicParams = true;

/**
 * Título y descripción propios de cada disposición.
 *
 * Sin esto todas las fichas heredaban el título del layout y eran
 * indistinguibles entre sí para un buscador, desperdiciando lo único que
 * este sitio tiene de valor: contenido nuevo y distinto cada día. El título
 * llano es además, casi literalmente, lo que alguien teclearía al buscar.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const entry = await fetchEntry(id);
  if (!entry) return { title: "Disposición no encontrada — Agente BOE" };

  const title = entry.plainTitle ?? entry.title;
  const description =
    entry.shortPhrase ??
    `${entry.department}. Disposición ${entry.id} publicada en el BOE el ${formatDate(entry.publicationDate)}.`;
  const url = `https://agenteboe.com/d/${entry.id}`;

  return {
    title: `${title} — Agente BOE`,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
  };
}

export default async function EntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [entry, days] = await Promise.all([fetchEntry(id), fetchDays()]);
  if (!entry) notFound();
  const related = relatedEntries(entry, days?.flatMap((day) => day.entries) ?? []);

  return (
    <article className="dossier">
      <a href="/#boe-diario" className="back-to-catalog">← Volver al BOE diario</a>
      <div className="entry-head">
        <p className="case-label">Expediente {entry.id}</p>
        <div className="entry-head-actions">
          {entry.impact !== null && <ImpactMeter impact={entry.impact} />}
          <ShareSummaryButton title={entry.plainTitle ?? entry.title} />
          <PrintSummaryButton />
        </div>
      </div>

      <h1 className="dossier-title">{entry.plainTitle ?? entry.title}</h1>
      <p className="entry-department">{entry.department}</p>
      <GobiernoBadge gobierno={entry.gobierno} variante="detalle" />
      <p className="entry-meta">
        Publicado el {formatDate(entry.publicationDate)} · Última actualización del texto oficial:{" "}
        {formatDate(entry.lastOfficialUpdateAt)}
      </p>

      {/* El enlace oficial va SIEMPRE por encima del resumen (LEGAL.md) */}
      <div className="official-links">
        <a className="btn-official" href={entry.officialHtmlUrl} rel="noopener noreferrer">
          Leer el texto oficial en boe.es
        </a>
        <a className="btn-secondary" href={entry.officialPdfUrl} rel="noopener noreferrer">
          PDF oficial
        </a>
      </div>

      {/* El título oficial es exacto pero ilegible: se muestra aquí, sin
          robarle el sitio al que sí se entiende. */}
      {entry.plainTitle && (
        <details className="official-title">
          <summary>Título oficial en el BOE</summary>
          <p>{entry.title}</p>
        </details>
      )}

      {entry.bulletPoints ? (
        <section className="summary">
          <div className="summary-head">
            <h2>Resumen del caso</h2>
            <span className="stamp">Resumen IA · No oficial</span>
          </div>
          {entry.shortPhrase && <p className="summary-lead">{entry.shortPhrase}</p>}
          <ul>
            {entry.bulletPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
          <div data-reading-end className="reading-end" aria-hidden="true" />
        </section>
      ) : (
        <p className="empty-state">El resumen de esta disposición aún se está generando.</p>
      )}

      <footer className="legal-note">
        <p>
          Resumen y título en lenguaje llano generados por inteligencia artificial
          {entry.model ? ` (${entry.model})` : ""}. Pueden contener errores. El único texto con
          valor oficial es el publicado en el BOE.
        </p>
        <p>
          Basado en datos de la Agencia Estatal Boletín Oficial del Estado (www.boe.es). Última
          actualización del documento oficial: {formatDate(entry.lastOfficialUpdateAt)}. Este
          servicio es independiente y no está vinculado al BOE.
        </p>
      </footer>
      <section className="continue-reading" aria-labelledby="continue-title">
        <p className="eyebrow">Sigue explorando</p>
        <h2 id="continue-title">{related.length ? "Más sobre estos temas" : "Hay más por descubrir"}</h2>
        {related.length > 0 && <div className="related-grid">
          {related.map((item) => <a key={item.id} href={`/d/${item.id}`} className="related-card" data-engagement="related_open">
            <span>{formatDate(item.publicationDate)}</span><h3>{item.plainTitle ?? item.title}</h3><span className="text-link">Leer resumen →</span>
          </a>)}
        </div>}
        <nav className="explore-links" aria-label="Explorar más contenidos">
          <a href="/#boe-diario">Últimos boletines →</a><a href="/pensiones">Pensiones →</a><a href="/quien-paga">Quién paga los impuestos →</a><a href="/subvenciones">Subvenciones →</a>
        </nav>
      </section>
    </article>
  );
}
