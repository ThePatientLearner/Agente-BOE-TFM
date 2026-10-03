import type { PressSnapshot } from "@/lib/press";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: "Europe/Madrid", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
});

// Formato numérico estable también entre el servidor y el navegador.
const timestamp = (iso: string) => {
  const parts = dateFormatter.formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get("day")}/${get("month")} · ${get("hour")}:${get("minute")}`;
};

export function PressCards({ headlines }: { headlines: PressSnapshot["headlines"] }) {
  return (
    <div className="press-grid">
      {headlines.map(({ source, headline, checkedAt }) => (
        <article className="press-card" key={source.id}>
          <p className="press-masthead">{source.name}</p>
          <span className="press-label">{source.label}</span>
          {headline ? (
            <>
              <h3><a href={headline.url} target="_blank" rel="noopener noreferrer" data-engagement="press_open" data-source={source.id}>{headline.title}</a></h3>
              <p className="press-date">Publicado <time dateTime={headline.publishedAt}>{timestamp(headline.publishedAt)}</time></p>
              <a className="text-link" href={headline.url} target="_blank" rel="noopener noreferrer" data-engagement="press_open" data-source={source.id}>Leer en {source.name} <span aria-hidden="true">↗</span></a>
              {checkedAt && <small className="press-checked">Consultado {timestamp(checkedAt)} · Madrid</small>}
            </>
          ) : (
            <>
              <h3>El titular no está disponible ahora.</h3>
              <p className="press-date">Puedes consultar las noticias del medio.</p>
              <a className="text-link" href={source.home} target="_blank" rel="noopener noreferrer">Ir a {source.name} <span aria-hidden="true">↗</span></a>
            </>
          )}
        </article>
      ))}
    </div>
  );
}
