"use client";

import { useEffect, useState } from "react";
import { formatReviewCountdown, isReviewing, readReviewSnapshot, remainingReviewMs, type ReviewSnapshot } from "@/lib/review-status";

export function ReviewCountdown() {
  const [snapshot, setSnapshot] = useState<ReviewSnapshot | null>(null);
  const [now, setNow] = useState(0);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let stopped = false;
    let pollTimer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    let fastUntil = 0;

    async function refresh() {
      if (stopped || controller || document.hidden) return;
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
        delay = isReviewing(next, receivedAt) ? 3000 : receivedAt < fastUntil ? 1000
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
      if (!document.hidden) setNow(performance.now());
    }, 1000);
    const onVisibility = () => {
      clearTimeout(pollTimer);
      if (!document.hidden) {
        setNow(performance.now());
        void refresh();
      }
    };
    void refresh();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopped = true;
      clearInterval(tick);
      clearTimeout(pollTimer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const stale = snapshot !== null && now - snapshot.receivedAt > 90_000;
  const reviewing = !unavailable && !stale && snapshot !== null && isReviewing(snapshot, now);
  const remaining = snapshot ? remainingReviewMs(snapshot, now) : null;
  const label = unavailable || stale ? "Estado no disponible" : reviewing ? "Revisando BOE"
    : snapshot && remaining === null ? "Horario no disponible" : "Próxima revisión";

  return (
    <div className={`hero-review${reviewing ? " is-reviewing" : ""}`} title={snapshot ? `Horario del agente · ${snapshot.timeZone}` : undefined}>
      <span className="hero-review-emblem" aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle className="hero-review-orbit" cx="16" cy="16" r="14" strokeDasharray="58 30" />
          <path d="M11 7h8l4 4v9a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" /><path d="M19 7v5h4M12 13h4M12 17h5" strokeLinecap="round" />
          <circle cx="23" cy="23" r="6" fill="#101b2c" /><path d="M23 19v4l3 1.5" strokeLinecap="round" />
        </svg>
      </span>
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
