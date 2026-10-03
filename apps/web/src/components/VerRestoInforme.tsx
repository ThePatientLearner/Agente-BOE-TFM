"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Tras el gancho del informe (primeros bloques), oculta el resto detrás de un
 * CTA. El contenido sigue en el DOM (SEO y accesibilidad); solo se colapsa la
 * vista. Si la URL trae un #ancla que cae dentro, se abre solo.
 */
export function VerRestoInforme({
  children,
  label = "Ver resto del informe",
  labelOpen = "Ocultar resto del informe",
}: {
  children: ReactNode;
  label?: string;
  labelOpen?: string;
}) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const openIfHashInside = useCallback(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || !bodyRef.current) return;
    try {
      const target =
        bodyRef.current.querySelector(`#${CSS.escape(hash)}`) ??
        document.getElementById(hash);
      if (target && bodyRef.current.contains(target)) {
        setOpen(true);
      }
    } catch {
      // hash no es un selector válido; ignorar
    }
  }, []);

  useEffect(() => {
    openIfHashInside();
    window.addEventListener("hashchange", openIfHashInside);
    return () => window.removeEventListener("hashchange", openIfHashInside);
  }, [openIfHashInside]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) {
        // Tras pintar el cuerpo: scroll + resize para que los gráficos
        // (Recharts u otros) midan el ancho real al dejar de estar ocultos.
        requestAnimationFrame(() => {
          bodyRef.current?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "auto"
              : "smooth",
            block: "start",
          });
          window.dispatchEvent(new Event("resize"));
        });
      }
      return next;
    });
  };

  return (
    <div
      ref={rootRef}
      className={`ver-resto${open ? " is-open" : " is-collapsed"}`}
    >
      {!open && <div className="ver-resto-fade" aria-hidden="true" />}

      <div className="ver-resto-cta-wrap">
        <button
          type="button"
          className="ver-resto-cta"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
        >
          <span className="ver-resto-cta-label">{open ? labelOpen : label}</span>
          <svg
            className="ver-resto-cta-icon"
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path
              d="M3.5 6.2 8 10.5l4.5-4.3"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        id={panelId}
        ref={bodyRef}
        className="ver-resto-body"
        role="region"
        aria-label="Resto del informe"
        hidden={!open}
      >
        {children}
      </div>
    </div>
  );
}
