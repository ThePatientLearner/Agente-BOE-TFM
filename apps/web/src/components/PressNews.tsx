"use client";

import { useEffect, useState } from "react";
import type { PressSnapshot } from "@/lib/press";
import { formatPressCountdown, PRESS_REFRESH_MS } from "@/lib/press-refresh";
import { PressCards } from "./PressCards";
import { PressTabs } from "./PressTabs";

export function PressNews({ initialHeadlines }: { initialHeadlines: PressSnapshot["headlines"] }) {
  const [headlines, setHeadlines] = useState(initialHeadlines);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [updating, setUpdating] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    let deadline: number | null = null;

    function schedule(delay: number, recheck = false) {
      deadline = performance.now() + delay;
      setRemaining(delay);
      clearTimeout(timer);
      timer = setTimeout(() => void refresh(recheck), delay);
    }

    async function refresh(recheck = false) {
      if (stopped || controller || document.hidden) return;
      clearTimeout(timer);
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 8000);
      setUpdating(true);
      try {
        const response = await fetch("/api/press", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Prensa no disponible");
        const snapshot = await response.json() as PressSnapshot;
        if (!Array.isArray(snapshot.headlines) || snapshot.headlines.length !== 4
          || !Number.isFinite(snapshot.refreshAfterMs) || snapshot.refreshAfterMs < 0
          || snapshot.refreshAfterMs > PRESS_REFRESH_MS) throw new Error("Respuesta inválida");
        if (stopped) return;
        setHeadlines(snapshot.headlines);
        // Next sirve el último resultado mientras renueva una caché vencida.
        // Volver a leerlo después del límite de 5 s de cada RSS permite mostrar
        // el resultado nuevo en esta misma visita, sin invalidaciones globales.
        if (snapshot.refreshAfterMs === 0 && !recheck) {
          schedule(6500, true);
          return;
        }
        const failed = snapshot.refreshAfterMs === 0;
        setRetrying(failed);
        setUpdating(false);
        schedule(failed ? 60_000 : snapshot.refreshAfterMs);
      } catch {
        if (!stopped) {
          setRetrying(true);
          setUpdating(false);
          schedule(60_000);
        }
      } finally {
        clearTimeout(timeout);
        controller = null;
      }
    }

    const tick = setInterval(() => {
      if (!document.hidden && deadline !== null) setRemaining(Math.max(0, deadline - performance.now()));
    }, 1000);
    const onVisibility = () => {
      clearTimeout(timer);
      if (!document.hidden) void refresh();
    };
    void refresh();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      clearTimeout(timer);
      clearInterval(tick);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section className="press-section" id="prensa" aria-labelledby="press-heading">
      <div className="section-heading">
        <a href="#inicio" className="editorial-button press-back-to-top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="m6 12 6-6 6 6M12 6v13" />
          </svg>
          Volver al inicio
        </a>
        <h2 id="press-heading">Principales Portadas</h2>
        <div className="press-refresh">
          {updating && <span className="press-refresh-spinner" aria-hidden="true" />}
          <span className="press-refresh-copy">
            <span className="press-refresh-label">Actualización cada 10 min</span>
            <span className="press-refresh-status" role="status">{updating ? "Actualizando titulares…" : retrying ? "Reintento en" : "Próxima en"}</span>
          </span>
          {!updating && <span className="press-refresh-time" role="timer" aria-live="off">
            {remaining === null ? "--:--" : formatPressCountdown(remaining)}
          </span>}
        </div>
      </div>
      <PressTabs
        spain={<PressCards headlines={headlines.filter(({ source }) => source.section === "espana")} />}
        international={<PressCards headlines={headlines.filter(({ source }) => source.section === "internacional")} />}
      />
      <p className="section-note">Titulares seleccionados automáticamente de los canales de cada medio. Pueden diferir de la noticia principal de su web. Algunos artículos requieren suscripción al medio.</p>
    </section>
  );
}
