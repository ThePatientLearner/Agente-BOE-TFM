import { LINKEDIN_URL, TELEGRAM_CONTACT_URL } from '@/lib/legal';

const telegramIcon = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.5 3.4 2.7 10.6c-1.2.5-1.2 1.3-.2 1.6l4.8 1.5 1.9 5.6c.2.6.4.8.8.9.4 0 .7-.2 1-.4l2.4-2.3 4.9 3.6c.9.5 1.6.2 1.8-.8l3.3-15.5c.3-1.4-.5-2-1.9-1.4Z" /></svg>;
const linkedinIcon = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5.4 3.5A1.9 1.9 0 1 1 5.4 7.3a1.9 1.9 0 0 1 0-3.8ZM3.8 9h3.3v11H3.8V9Zm5.5 0h3.2v1.5h.1c.5-.9 1.6-1.8 3.3-1.8 3.5 0 4.2 2.3 4.2 5.3v6h-3.3v-5.3c0-1.3 0-3-1.9-3s-2.2 1.4-2.2 2.9V20H9.3V9Z" /></svg>;

function validTelegram(url?: string): string | undefined {
  if (!url) return;
  try { const parsed = new URL(url); if (parsed.protocol === 'https:' && parsed.hostname === 't.me') return url; } catch { /* Configuración ausente o inválida. */ }
}

export function BoeBotContact({ telegramUrl, featured = false }: { telegramUrl?: string; featured?: boolean }) {
  const telegram = validTelegram(telegramUrl) ?? TELEGRAM_CONTACT_URL;
  return <section className={`boe-bot-contact${featured ? ' boe-bot-contact-featured' : ''}`} aria-label="Contacto para usar BoeBot">
    {featured && <span className="boe-bot-contact-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</span>}
    <p>¿Quieres usar el BoeBot? <strong>Contacta conmigo</strong></p>
    <div className="boe-bot-contact-buttons">
      <a href={telegram} target="_blank" rel="noopener noreferrer">{telegramIcon}<span>Telegram</span><span aria-hidden="true">↗</span></a>
      <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">{linkedinIcon}<span>LinkedIn</span><span aria-hidden="true">↗</span></a>
    </div>
  </section>;
}
