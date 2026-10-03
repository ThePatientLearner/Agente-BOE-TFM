"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { TopicLogo } from "./TopicLogo";

/**
 * Menú de la cabecera. Reúne las secciones de la propia web y los enlaces
 * externos, en dos grupos separados: mezclarlos haría que una sección del
 * sitio pareciera un salto fuera de él.
 *
 * Se eligió este menú como puerta de las secciones temáticas (subvenciones,
 * pensiones, quién paga la fiesta…) en lugar de pestañas en la portada porque
 * cada una trae datos de origen distinto —el BOE es normativa diaria, la BDNS
 * son subvenciones, las pensiones y el reparto fiscal son radiografías
 * estadísticas— y presentarlas como vistas de lo mismo confundiría sobre la
 * procedencia del dato. El menú además ya existe, ya es accesible y no toca
 * la geometría de la cabecera, que en pantallas estrechas va justa de sitio.
 *
 * Se cierra con Escape, al hacer clic fuera y al pulsar cualquier enlace.
 * Los tres comportamientos son necesarios: sin ellos el panel se queda
 * abierto tapando contenido cuando alguien lo abre por error.
 */
const INTERNOS = [
  {
    href: "/",
    label: "Resumen diario del BOE",
    note: "Disposiciones generales",
  },
  {
    href: "/subvenciones",
    label: "Subvenciones sin concurso",
    note: "Concesión directa · BDNS",
  },
  {
    href: "/pensiones",
    label: "Pensiones en España",
    note: "Sostenibilidad y proyección",
  },
  {
    href: "/quien-paga",
    label: "¿Quién paga la fiesta?",
    note: "Impuestos y reparto",
  },
  {
    href: "/juego",
    label: "¡Haz que todos se suscriban!",
    note: "Juego · premio FinanFocus PRO",
  },
] as const;

/**
 * FinanFocus sale de la lista y se renderiza aparte porque es el único enlace
 * que buscamos que se pulse, no solo que esté. Con el mismo estilo que los
 * demás quedaba como la cuarta línea de una lista de cuatro, que es donde
 * menos se mira. Va con marca propia —verde, no dorado— para que se lea como
 * un destino distinto y no como otra sección de esta web.
 */
const DESTACADO = {
  href: "https://finanfocus.com",
  label: "FinanFocus",
  // Corta, y no "Gestiona tus finanzas personales": a 15rem de panel esa
  // partía en dos líneas y descuadraba la fila respecto al icono.
  note: "Finanzas personales",
} as const;

/**
 * Logotipos de las redes. Van con su color de marca —casi negro para X, rojo
 * para YouTube— porque son marcas que se reconocen antes por el color y el
 * icono que por el nombre.
 *
 * El del BOE se queda sin marca a propósito: es la fuente oficial, no una red
 * social, y darle el mismo tratamiento lo pondría al mismo nivel.
 */
const MARCAS = {
  x: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93ZM17.61 20.64h2.04L6.49 3.24H4.3Z"
      />
    </svg>
  ),
  // Rectángulo redondeado + triángulo de play: el glifo oficial de YouTube,
  // no solo el play suelto, para que se lea como la marca y no como un botón
  // genérico de reproducción.
  youtube: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8ZM9.75 15.5v-7l6.2 3.5-6.2 3.5Z"
      />
    </svg>
  ),
} as const;

type MarcaId = keyof typeof MARCAS;

/**
 * El BOE va el primero de los externos y por delante de FinanFocus, no
 * intercalado entre las tarjetas de color. Por dos motivos que apuntan al
 * mismo sitio: es la fuente oficial de todo lo que publica esta web y le
 * corresponde el sitio de honor, y así las tres tarjetas de marca quedan
 * seguidas en vez de partidas por un enlace plano que abría un hueco en
 * mitad de la columna.
 */
const FUENTE = {
  href: "https://www.boe.es",
  label: "Boletín Oficial del Estado",
  note: "La fuente oficial",
} as const;

/** Lo que queda aquí son las redes, y todas llevan logo. */
const LINKS: readonly {
  href: string;
  label: string;
  note: string;
  marca: MarcaId;
  hidden?: boolean;
}[] = [
  {
    href: "https://x.com/ValueAcademia",
    label: "Síguenos en X",
    note: "@ValueAcademia",
    marca: "x",
    // Oculto temporalmente; quitar esta propiedad para volver a mostrarlo.
    hidden: true,
  },
  {
    href: "https://www.youtube.com/@valueacademia7329/videos",
    label: "Aprende sobre mercados",
    note: "YouTube · gratis",
    marca: "youtube",
  },
];

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    // `mousedown` y no `click`: si el enlace de destino quita el elemento del
    // DOM, un `click` posterior ya no encuentra dónde comprobar el "fuera".
    const onOutside = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onOutside);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onOutside);
    };
  }, [open]);

  return (
    <div className="site-menu" ref={wrapRef}>
      <button
        type="button"
        className="menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="menu-bars" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="menu-word">Menú</span>
      </button>

      {open && (
        <div className="menu-panel" role="menu">
          <p className="menu-group" role="presentation">
            En esta web
          </p>
          {/* `next/link` y sin `target="_blank"`: son rutas del propio sitio,
              y abrirlas en otra pestaña rompería la navegación hacia atrás. */}
          {INTERNOS.map((link) => (
            <Link
              key={link.href}
              className="menu-link"
              role="menuitem"
              href={link.href}
              onClick={() => setOpen(false)}
            >
              <span className="menu-link-label">{link.href === '/subvenciones' || link.href === '/pensiones' || link.href === '/quien-paga' ? <TopicLogo topic={link.href.slice(1) as 'subvenciones' | 'pensiones' | 'quien-paga'} /> : null}{link.label}</span>
              <span className="menu-link-note">{link.note}</span>
            </Link>
          ))}

          <p className="menu-group" role="presentation">
            Enlaces externos
          </p>

          <a
            className="menu-link"
            role="menuitem"
            href={FUENTE.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span className="menu-link-label">{FUENTE.label}</span>
            <span className="menu-link-note">{FUENTE.note}</span>
          </a>

          <a
            className="menu-link menu-link-destacado"
            role="menuitem"
            href={DESTACADO.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <span className="ff-mark" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 16.5 9.5 11l3.5 3.5L20 7" />
                <path d="M20 11.5V7h-4.5" />
              </svg>
            </span>
            <span className="ff-text">
              <span className="menu-link-label">{DESTACADO.label}</span>
              <span className="menu-link-note">{DESTACADO.note}</span>
            </span>
          </a>

          {LINKS.filter((link) => !link.hidden).map((link) => (
            <a
              key={link.href}
              className={`menu-link menu-link-marca menu-link-marca-${link.marca}`}
              role="menuitem"
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              <span className="menu-marca" aria-hidden="true">
                {MARCAS[link.marca]}
              </span>
              <span className="menu-marca-text">
                <span className="menu-link-label">{link.label}</span>
                <span className="menu-link-note">{link.note}</span>
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
