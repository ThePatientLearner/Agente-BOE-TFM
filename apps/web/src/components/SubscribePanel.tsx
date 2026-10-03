export function SubscribePanel() {
  return (
    <section className="subscribe-panel" id="seguir-boe" aria-labelledby="subscribe-title">
      <div>
        <p className="eyebrow">Sigue al día, sin buscar cada mañana</p>
        <h2 id="subscribe-title">Las novedades relevantes, donde tú estás.</h2>
        <p>Recibe gratis los resúmenes de impacto 3, 4 y 5 en Telegram o Discord.</p>
      </div>
      <div className="subscribe-actions">
        <a className="editorial-button" href="https://t.me/EscudoFinanciero" target="_blank" rel="noopener noreferrer" data-engagement="subscribe_click" data-source="telegram">Seguir en Telegram <span aria-hidden="true">↗</span></a>
        <a className="editorial-button secondary" href="https://discord.gg/EEq8CtKQqu" target="_blank" rel="noopener noreferrer" data-engagement="subscribe_click" data-source="discord">Unirme a Discord <span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
