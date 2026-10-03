"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buildSharePayload, useShareModal } from "./ShareDato";

/** Partículas que centellean alrededor del botón en reposo. */
const SPARKS = 8;
/** Partículas que salen disparadas al pulsar. */
const BURST = 12;

/**
 * Compartir el resumen de una disposición.
 *
 * Donde hay menú nativo de compartir (móvil, Safari) se usa ese: ya trae
 * WhatsApp, Telegram, correo… y es lo que la gente reconoce. Donde no, se copia
 * el texto con el enlace y se abre el mismo panel de redes que usa el resto de
 * la web para compartir cifras, para que no haya dos maneras de compartir.
 *
 * El texto dice que el resumen es de IA y no oficial: lo que se comparte sale
 * de la web y tiene que seguir llevando esa advertencia (LEGAL.md).
 */
export function ShareSummaryButton({ title }: { title: string }) {
  const pathname = usePathname() || "/";
  const openShareModal = useShareModal();
  const [copied, setCopied] = useState(false);
  // Cada pulsación vuelve a montar las partículas para relanzar la explosión.
  const [burst, setBurst] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const text = `«${title}», explicado en lenguaje claro en Agente BOE (resumen con IA, no oficial):`;
  const payload = buildSharePayload(text, pathname);
  const url = payload.slice(payload.lastIndexOf("\n") + 1);

  async function share() {
    setBurst((n) => n + 1);
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        track("summary_share", { method: "native" });
        return;
      } catch (error) {
        // Cerrar el menú sin elegir nada no es un fallo: no se hace nada más.
        if ((error as Error).name === "AbortError") return;
      }
    }
    let ok = false;
    try {
      await navigator.clipboard.writeText(payload);
      ok = true;
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      /* sin portapapeles: el panel lo dice y X y LinkedIn siguen sirviendo */
    }
    openShareModal?.(payload, { what: "Enlace", copied: ok });
    track("summary_share", { method: "copy" });
  }

  return (
    <button
      type="button"
      className={`share-summary-btn${copied ? " is-copied" : ""}`}
      onClick={() => void share()}
      title="Compartir este resumen"
      aria-label={copied ? "Enlace copiado para compartir" : "Compartir este resumen"}
    >
      <span className="share-summary-sparks" aria-hidden="true">
        {Array.from({ length: SPARKS }, (_, i) => <i key={i} />)}
      </span>
      {burst > 0 && (
        <span key={burst} className="share-summary-burst" aria-hidden="true">
          {Array.from({ length: BURST }, (_, i) => <i key={i} style={{ ["--angle" as string]: `${(360 / BURST) * i}deg` }} />)}
        </span>
      )}
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
        {/* Flecha de compartir: sale curvada hacia la derecha. */}
        <path d="M14 4.5 21.5 12 14 19.5v-4.6c-5.3 0-8.9 1.7-11.5 5.6 1-5.6 4.1-10.6 11.5-11.6V4.5Z" />
      </svg>
      <span className="share-summary-label">{copied ? "¡Enlace copiado!" : "Compartir"}</span>
    </button>
  );
}
