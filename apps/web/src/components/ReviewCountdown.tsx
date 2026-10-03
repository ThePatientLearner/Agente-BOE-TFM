"use client";

import { useEffect, useState } from "react";
import { formatReviewCountdown, readReviewSnapshot, remainingReviewMs, type ReviewSnapshot } from "@/lib/review-status";

export function ReviewCountdown() {
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(null);
  const [now, setNow] = useState(0);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 720px)");
    let stopped = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    let fastUntil = 0;

    async function refresh() {
      if (stopped || controller || document.hidden || !mobile.matches) return;
      clearTimeout(pollTimer);
      controller = new AbortController();
      const timeout = setTimeout(() => controller?.abort(), 7000);
      const startedAt = performance.now();
      let delay = 30_000;
      try {
        const response = await fetch("/api/review-status", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Estado no disponible");
        const payload: unknown = await response.json();
        const receivedAt = performance.now();
        const next = readReviewSnapshot(payload, receivedAt, receivedAt - startedAt);
        if (stopped) return;
        setSnapshot(next);
        setNow(receivedAt);
        setUnavailable(false);
        // Consultar más cerca del disparo y mientras trabaja; nunca se
        // convierte una hora prevista en una actividad inventada.
        if (next.remainingMs !== null && next.remainingMs <= 30_000) {
          fastUntil = receivedAt + next.remainingMs + 15_000;
        }
        // Mantener consultas rápidas unos segundos tras el horario previsto:
        // el cron puede empezar después de la petición que cruza ese minuto.
        delay = next.reviewing ? 3000 : receivedAt < fastUntil ? 1000
          : Math.min(30_000, Math.max(1000, (next.remainingMs ?? 60_000) - 30_000));
      } catch {
        if (!stopped) setUnavailable(true);
      } finally {
        clearTimeout(timeout);
        controller = null;
        if (!stopped) pollTimer = setTimeout(refresh, delay);
      }
    }

    const tick = setInterval(() => {
      if (!document.hidden && mobile.matches) setNow(performance.now());
    }, 1000);
    const onVisibility = () => {
      clearTimeout(pollTimer);
      if (!document.hidden && mobile.matches) {
        setNow(performance.now());
        void refresh();
      }
    };
    void refresh();
    document.addEventListener("visibilitychange", onVisibility);
    mobile.addEventListener("change", onVisibility);
    return () => {
      stopped = true;
      clearInterval(tick);
      clearTimeout(pollTimer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
      mobile.removeEventListener("change", onVisibility);
    };
  }, []);

  const stale = snapshot !== null && now - snapshot.receivedAt > 90_000;
  const reviewing = !unavailable && !stale && snapshot?.reviewing === true;
  const remaining = snapshot ? remainingReviewMs(snapshot, now) : null;
  const label = unavailable || stale ? "Estado no disponible" : reviewing ? "Revisando"
    : snapshot && remaining === null ? "Horario no disponible" : "Próxima revisión";

  return (
    <div className={`hero-review${reviewing ? " is-reviewing" : ""}`} title={snapshot ? `Horario del agente · ${snapshot.timeZone}` : undefined}>
      {reviewing ? <span className="hero-review-spinner" aria-hidden="true" /> : (
        <svg className="hero-review-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" strokeLinecap="round" />
        </svg>
      )}
      <span className="hero-review-copy">
        <span className="hero-review-label" role="status">{label}</span>
        {!reviewing && !unavailable && !stale && (!snapshot || remaining !== null) && (
          <span className="hero-review-time" role="timer" aria-live="off">
            {remaining === null ? "--:--:--" : formatReviewCountdown(remaining)}
          </span>
        )}
      </span>
    </div>
  );
}
