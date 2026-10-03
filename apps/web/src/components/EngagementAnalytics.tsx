"use client";

import { track } from "@vercel/analytics";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const EVENTS = new Set(["boe_open", "related_open", "press_open", "special_open", "subscribe_click", "game_open"]);
const SOURCES = new Set(["elpais", "abc", "bbc", "france24", "telegram", "discord"]);

/** Solo acciones predefinidas. Nunca se envían búsquedas, claves o texto libre. */
export function EngagementAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const element = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-engagement]") : null;
      const name = element?.dataset.engagement;
      if (!name || !EVENTS.has(name)) return;
      const source = element?.dataset.source;
      track(name, source && SOURCES.has(source) ? { source } : undefined);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    const end = document.querySelector("[data-reading-end]");
    if (!end || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      track("summary_end_visible");
      observer.disconnect();
    }, { threshold: 1 });
    observer.observe(end);
    return () => observer.disconnect();
  }, [pathname]);
  return null;
}
