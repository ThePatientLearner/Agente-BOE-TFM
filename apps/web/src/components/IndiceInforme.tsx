"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

export type IndiceItem = {
  id: string;
  label: string;
};

/**
 * Barra horizontal «Índice»: al pulsar despliega enlaces a anclas del
 * informe. Si el destino está dentro de «Ver resto del informe» (oculto),
 * el hash abre ese panel (VerRestoInforme ya reacciona a #ancla) y luego
 * se hace scroll.
 */
export function IndiceInforme({
  items,
  label = "Índice",
}: {
  items: readonly IndiceItem[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLElement>(null);

  const irA = useCallback((id: string) => {
    const go = () => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    };

    // Hash primero: VerRestoInforme abre el cuerpo si el ancla está dentro.
    if (window.location.hash !== `#${id}`) {
      window.location.hash = id;
    } else {
      // Mismo hash otra vez: forzar el listener (hashchange no dispara).
      window.dispatchEvent(new Event("hashchange"));
    }

    setOpen(false);
    // Tras un frame (y un pelín más si había que revelar el resto).
    requestAnimationFrame(() => {
      go();
      window.setTimeout(go, 120);
      window.setTimeout(() => window.dispatchEvent(new Event("resize")), 160);
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onOutside = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onOutside);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <nav
      ref={rootRef}
      className={`informe-indice${open ? " is-open" : ""}`}
      aria-label="Índice del informe"
    >
      <button
        type="button"
        className="informe-indice-bar"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="informe-indice-bar-text">{label}</span>
        <span className="informe-indice-bar-meta" aria-hidden="true">
          {open ? "Cerrar" : `${items.length} secciones`}
        </span>
        <span className="informe-indice-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div id={panelId} className="informe-indice-panel" role="region">
          <ol className="informe-indice-lista">
            {items.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="informe-indice-link"
                  onClick={(e) => {
                    e.preventDefault();
                    irA(item.id);
                  }}
                >
                  <span className="informe-indice-num">{i + 1}</span>
                  <span className="informe-indice-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}
    </nav>
  );
}
