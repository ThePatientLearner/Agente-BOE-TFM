import { Suspense } from "react";
import { EntryBrowser } from "@/components/EntryBrowser";
import { HeroVideo } from "@/components/HeroVideo";
import { HoyEnElBoe } from "@/components/HoyEnElBoe";
import { GamePromo } from "@/components/GamePromo";
import { PressHeadlines } from "@/components/PressHeadlines";
import { PromoSubvenciones } from "@/components/PromoSubvenciones";
import { TopicLogo } from "@/components/TopicLogo";
import { fetchDays } from "@/lib/api";

export default async function HomePage() {
  const days = await fetchDays();
  // El último boletín con contenido: es lo que «Hoy en el BOE» enseña.
  const latest = days?.filter((day) => day.entries.length > 0).sort((a, b) => a.date.localeCompare(b.date)).at(-1);
  const total = latest?.entries.length ?? 0;
  return (
    <>
      <section className="editorial-hero hero-impacto" aria-labelledby="home-title">
        <div className="editorial-emblem"><HeroVideo /></div>
        <div className="editorial-hero-copy">
          <p className="eyebrow">El BOE, en lenguaje claro</p>
          <h1 id="home-title">Resúmenes diarios del BOE.<br /><em>Descubre cómo te afecta.</em></h1>
          <p className="hero-description">Vivienda, trabajo, impuestos. Encuentra qué cambia, lee lo esencial y contrástalo con el texto oficial.</p>
          <div className="hero-actions">
            <a href="#boe-diario" className="editorial-button hero-primary">{total > 0 ? `Ver ${total === 1 ? "la novedad" : `las ${total} novedades`} del último boletín` : "Ver las novedades"} <span aria-hidden="true">↓</span></a>
            <a href="#seguir-boe" className="text-link">Recibir avisos gratis <span aria-hidden="true">↗</span></a>
          </div>
          <p className="hero-assurance">Gratis · Sin registro para leer · Disposiciones generales</p>
        </div>
        {latest && <HoyEnElBoe day={latest} />}
      </section>
      <nav className="home-shortcuts" aria-label="Explora el dinero público">
        <a href="/subvenciones" data-engagement="special_open"><TopicLogo topic="subvenciones" /><span><strong>Subvenciones</strong><small>Sigue el destino de las ayudas</small></span><span aria-hidden="true">↗</span></a>
        <a href="/pensiones" data-engagement="special_open"><TopicLogo topic="pensiones" /><span><strong>Pensiones</strong><small>Entiende cómo se financian</small></span><span aria-hidden="true">↗</span></a>
        <a href="/quien-paga" data-engagement="special_open"><TopicLogo topic="quien-paga" /><span><strong>Quién paga</strong><small>Pon tus impuestos en perspectiva</small></span><span aria-hidden="true">↗</span></a>
      </nav>
      <div className="home-columns">
        <section id="boe-diario" aria-labelledby="daily-heading">
          <div className="section-heading">
            <p className="eyebrow">Tu lectura diaria</p>
            <h2 id="daily-heading">Lo que publica el BOE</h2>
            <p>Busca un tema o recorre los últimos boletines.</p>
          </div>
          {!days?.length ? <p className="empty-state">Todavía no hay boletines disponibles. Vuelve a intentarlo en unos minutos.</p> : <EntryBrowser days={days} />}
        </section>
        <aside id="radiografias" aria-labelledby="specials-heading">
          <div className="home-follow">
            <p className="eyebrow">Para tu próxima visita</p>
            <h2>Lo relevante, a tu móvil.</h2>
            <p>Recibe gratis los resúmenes de impacto 3, 4 y 5 en Telegram o Discord.</p>
            <a href="#seguir-boe" className="editorial-button secondary">Elegir mis avisos <span aria-hidden="true">↗</span></a>
          </div>
          <div className="section-heading">
            <p className="eyebrow">Más allá del boletín</p>
            <h2 id="specials-heading">Pon los datos en perspectiva.</h2>
            <p>Tres radiografías para entender el dinero público.</p>
          </div>
          <PromoSubvenciones />
        </aside>
      </div>
      {/* La prensa acompaña al boletín; no va delante de él. */}
      <Suspense fallback={<section className="press-placeholder" aria-label="Cargando titulares de España e internacionales">Consultando los titulares…</section>}>
        <PressHeadlines />
      </Suspense>
      <GamePromo />
    </>
  );
}
