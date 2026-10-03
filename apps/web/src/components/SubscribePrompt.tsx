"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Conservar la marca antigua evita repetir la invitación a quien ya la vio.
const SEEN_KEY = "agenteboe:notify-offered";
const AUTO_OPEN_MS = 9000;

export function SubscribePrompt() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const offeredRef = useRef(false);
  const excluded = ["/juego", "/legal", "/privacidad"].includes(pathname);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (excluded || !dialog || typeof dialog.showModal !== "function") return;

    const alreadyOffered = () => {
      try { return Boolean(window.localStorage.getItem(SEEN_KEY)); }
      catch { return true; } // Sin almacenamiento, mantener los accesos de la página.
    };
    let ready = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let previousOverflow: string | null = null;
    let returnFocus: HTMLElement | null = null;
    const restorePage = () => {
      if (previousOverflow !== null) {
        document.body.style.overflow = previousOverflow;
        previousOverflow = null;
      }
      if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      returnFocus = null;
    };

    function open(opener?: HTMLElement) {
      if (dialog!.open) return true;
      const active = opener ?? document.activeElement;
      try { dialog!.showModal(); }
      catch { return false; } // Conservar el enlace a los canales como alternativa.
      returnFocus = active instanceof HTMLElement ? active : null;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeRef.current?.focus({ preventScroll: true });
      offeredRef.current = true;
      clearTimeout(timer);
      try { window.localStorage.setItem(SEEN_KEY, "1"); }
      catch { /* La referencia conserva la marca durante esta visita. */ }
      return true;
    }

    function offer() {
      clearTimeout(timer);
      if (offeredRef.current || alreadyOffered() || document.hidden) return;
      // Esperar a que termine de escribir o cierre otra ventana.
      if (document.querySelector('dialog[open], [role="dialog"][aria-modal="true"], .boe-bot-launcher[aria-expanded="true"]')
        || document.activeElement?.matches('input, textarea, select, [contenteditable="true"]')) {
        timer = setTimeout(offer, 1000);
        return;
      }
      open(); // El diálogo nativo confina el foco y permite Escape.
    }

    const onChannelLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey
        || event.shiftKey || event.altKey || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href="#seguir-boe"]');
      if (!link || link.hasAttribute("download") || (link.target && link.target !== "_self")) return;
      if (open(link)) event.preventDefault();
    };
    const onVisibility = () => { if (ready && !document.hidden) offer(); };
    if (!offeredRef.current && !alreadyOffered()) {
      timer = setTimeout(() => { ready = true; offer(); }, AUTO_OPEN_MS);
    }
    document.addEventListener("click", onChannelLink);
    document.addEventListener("visibilitychange", onVisibility);
    dialog.addEventListener("close", restorePage);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", onChannelLink);
      document.removeEventListener("visibilitychange", onVisibility);
      dialog.removeEventListener("close", restorePage);
      if (dialog.open) dialog.close();
      restorePage();
    };
  }, [pathname, excluded]);

  if (excluded) return null;
  const close = () => dialogRef.current?.close();

  return (
    <dialog ref={dialogRef} className="subscribe-dialog" aria-modal="true"
      aria-labelledby="subscribe-prompt-title" aria-describedby="subscribe-prompt-description"
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right
          || event.clientY < rect.top || event.clientY > rect.bottom) close();
      }}>
      <button ref={closeRef} type="button" className="subscribe-dialog-close"
        aria-label="Cerrar invitación" onClick={close}>×</button>
      <span className="subscribe-dialog-emblem" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4M12 2V1" />
        </svg>
      </span>
      <p className="eyebrow">Tus avisos, gratis</p>
      <h2 id="subscribe-prompt-title">Lo importante del BOE,<br /><em>directo a tu móvil.</em></h2>
      <p id="subscribe-prompt-description">Recibe gratis los resúmenes de impacto 3, 4 y 5 en Telegram o Discord. Elige tu canal y sigue las novedades sin tener que buscarlas.</p>
      <div className="subscribe-dialog-actions">
        <a className="subscribe-channel" href="https://t.me/EscudoFinanciero" target="_blank"
          rel="noopener noreferrer" data-engagement="subscribe_click" data-source="telegram" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.5 3.4 2.7 10.6c-1.2.5-1.2 1.3-.2 1.6l4.8 1.5 1.9 5.6c.2.6.4.8.8.9.4 0 .7-.2 1-.4l2.4-2.3 4.9 3.6c.9.5 1.6.2 1.8-.8l3.3-15.5c.3-1.4-.5-2-1.9-1.4Z" /></svg>
          <span>Telegram<small>Unirme al canal ↗</small></span>
        </a>
        <a className="subscribe-channel" href="https://discord.gg/EEq8CtKQqu" target="_blank"
          rel="noopener noreferrer" data-engagement="subscribe_click" data-source="discord" onClick={close}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.3 5.3a16.4 16.4 0 0 0-4.1-1.3l-.2.4a14.4 14.4 0 0 1 3.7 1.1 13.5 13.5 0 0 0-12.4 0c1.1-.5 2.3-.9 3.7-1.1l-.2-.4a16.4 16.4 0 0 0-4.1 1.3 17 17 0 0 0-2.9 11c1.7 1.3 3.3 2 4.9 2.5l.6-1a11 11 0 0 1-2-1l.5-.4a12.2 12.2 0 0 0 10.4 0l.5.4-2 1 .6 1c1.6-.5 3.2-1.2 4.9-2.5.2-4.1-.7-7.9-2.9-11ZM9 14.3c-1 0-1.7-.9-1.7-1.9S8.1 10.5 9 10.5c1 0 1.8.9 1.7 1.9 0 1-.8 1.9-1.7 1.9Zm6 0c-1 0-1.7-.9-1.7-1.9s.8-1.9 1.7-1.9c1 0 1.8.9 1.7 1.9 0 1-.7 1.9-1.7 1.9Z" /></svg>
          <span>Discord<small>Unirme al servidor ↗</small></span>
        </a>
      </div>
      <button type="button" className="subscribe-dialog-dismiss" onClick={close}>Ahora no, seguir leyendo</button>
    </dialog>
  );
}
