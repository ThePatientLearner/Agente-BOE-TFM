import type { Metadata } from "next";
import BoeBot from '@/components/BoeBot';
import './boe-bot.css';
import { Analytics } from "@vercel/analytics/next";
import { ContactButton } from "@/components/ContactButton";
import { EngagementAnalytics } from "@/components/EngagementAnalytics";
import { ShareDatoProvider } from "@/components/ShareDato";
import { SiteMenu } from "@/components/SiteMenu";
import { TopicLogo } from "@/components/TopicLogo";
import { SubscribePanel } from "@/components/SubscribePanel";
import { SubscribePrompt } from "@/components/SubscribePrompt";
import "./globals.css";
import "./editorial.css";
import "./portada.css";

export const metadata: Metadata = {
  title: "Agente BOE — el BOE, resumido cada día",
  description: "Resúmenes diarios de las disposiciones generales del BOE, generados por IA, con enlace al texto oficial. Servicio gratuito e independiente, no vinculado al BOE.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="editorial-theme">
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <header className="site-header">
          <div className="header-inner">
            <div className="header-brand-row">
              <SiteMenu />
              <a href="/" className="site-title">Agente<span>BOE</span><span className="brand-domain">.com</span></a>
              <a href="#seguir-boe" className="header-subscribe" aria-label="Notifícame por Telegram o Discord">
                <svg className="header-subscribe-telegram" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M21.5 3.4 2.7 10.6c-1.2.5-1.2 1.3-.2 1.6l4.8 1.5 1.9 5.6c.2.6.4.8.8.9.4 0 .7-.2 1-.4l2.4-2.3 4.9 3.6c.9.5 1.6.2 1.8-.8l3.3-15.5c.3-1.4-.5-2-1.9-1.4Z" /></svg>
                <span>Notifícame</span>
                <svg className="header-subscribe-discord" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M19.3 5.3a16.4 16.4 0 0 0-4.1-1.3l-.2.4a14.4 14.4 0 0 1 3.7 1.1 13.5 13.5 0 0 0-12.4 0c1.1-.5 2.3-.9 3.7-1.1l-.2-.4a16.4 16.4 0 0 0-4.1 1.3 17 17 0 0 0-2.9 11c1.7 1.3 3.3 2 4.9 2.5l.6-1a11 11 0 0 1-2-1l.5-.4a12.2 12.2 0 0 0 10.4 0l.5.4-2 1 .6 1c1.6-.5 3.2-1.2 4.9-2.5.2-4.1-.7-7.9-2.9-11ZM9 14.3c-1 0-1.7-.9-1.7-1.9S8.1 10.5 9 10.5c1 0 1.8.9 1.7 1.9 0 1-.8 1.9-1.7 1.9Zm6 0c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9c1 0 1.8.9 1.7 1.9 0 1-.7 1.9-1.7 1.9Z" /></svg>
              </a>
            </div>
            <p className="site-disclaimer">Proyecto independiente y <strong>gratuito</strong>. Resúmenes generados por IA; no sustituyen al texto oficial del BOE.</p>
            <nav className="editorial-nav" aria-label="Navegación principal">
              <a href="/#boe-diario">BOE diario</a><a href="/#prensa">La prensa</a><a href="/subvenciones"><TopicLogo topic="subvenciones" />Subvenciones</a><a href="/pensiones"><TopicLogo topic="pensiones" />Pensiones</a><a href="/quien-paga"><TopicLogo topic="quien-paga" />Quién paga</a>
            </nav>
          </div>
        </header>
        <main className="site-main" id="contenido">
          <ShareDatoProvider>{children}</ShareDatoProvider>
          <SubscribePanel />
        </main>
        <footer className="site-footer">
          <p className="footer-motto">La información es la moneda de la democracia.</p>
          <p>Basado en datos de la <a href="https://www.boe.es" rel="noopener noreferrer">Agencia Estatal Boletín Oficial del Estado</a>. Servicio no oficial: el BOE no participa, patrocina ni apoya esta actividad.</p>
          <nav><a href="/legal">Aviso legal</a> · <a href="/privacidad">Privacidad</a> · <a href="/juego">El juego</a></nav>
          <ContactButton />
        </footer>
        <SubscribePrompt />
        <BoeBot telegramContactUrl={process.env.BOT_TELEGRAM_CONTACT_URL} />
        <Analytics />
        <EngagementAnalytics />
      </body>
    </html>
  );
}
