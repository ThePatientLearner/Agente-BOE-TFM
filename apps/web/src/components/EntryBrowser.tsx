"use client";

import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { CatalogDay, CatalogEntry } from "@/lib/api";
import { EMAIL_CONTACTO, LINKEDIN_URL } from "@/lib/legal";
import { formatDate } from "@/lib/format";
import { GobiernoBadge } from "./GobiernoBadge";
import { ImpactMeter } from "./ImpactMeter";

/**
 * Portada con buscador.
 *
 * Por defecto el filtrado ocurre en el navegador: la API solo sirve 15 días
 * (`catalog.listDays(15)`), unas decenas de disposiciones y ~12 KB de JSON.
 * Filtrar eso en local es instantáneo y no cuesta ni una petición.
 *
 * Con la contraseña de "Búsqueda completa" el mismo panel consulta el
 * archivo entero vía `/api/full-search` (proxy de Next hacia el monolito).
 */

/** Umbral mínimo, no selección suelta: se navega buscando "lo importante". */
const IMPACT_FILTERS = [
  { value: 1, label: "Todas" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 5, label: "Solo 5" },
] as const;

const QUICK_TOPICS = ["Vivienda", "Impuestos", "Trabajo", "Energía"] as const;

/** Recuerda el desbloqueo solo mientras dure la pestaña. */
const FULL_SEARCH_KEY = "agenteboe:full-search-password";

/** "canarias" debe encontrar "Canarias", y "aereo" debe encontrar "aéreo". */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Todo el texto visible de una ficha, en un solo campo buscable. */
function haystack(entry: CatalogEntry): string {
  return [
    entry.id,
    entry.title,
    entry.plainTitle ?? "",
    entry.department,
    entry.shortPhrase ?? "",
    ...(entry.bulletPoints ?? []),
  ].join(" ");
}

function filterLocally(
  days: CatalogDay[],
  query: string,
  from: string,
  to: string,
  minImpact: number,
  index: Map<string, string>,
): CatalogDay[] {
  const needle = normalize(query.trim());

  return days
    .filter((day) => (!from || day.date >= from) && (!to || day.date <= to))
    .map((day) => ({
      ...day,
      entries: day.entries.filter((entry) => {
        // Sin resumen todavía no hay impacto: esas fichas solo aparecen
        // en "Todas", para que un filtro alto no prometa lo que no sabe.
        if ((entry.impact ?? 1) < minImpact) return false;
        if (!needle) return true;
        return (index.get(entry.id) ?? "").includes(needle);
      }),
    }))
    .filter((day) => day.entries.length > 0);
}

export function EntryBrowser({ days }: { days: CatalogDay[] }) {
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minImpact, setMinImpact] = useState(1);
  const [visibleDays, setVisibleDays] = useState(2);

  const [fullSearch, setFullSearch] = useState(false);
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [passwordDraft, setPasswordDraft] = useState("");
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  const [remoteDays, setRemoteDays] = useState<CatalogDay[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  // El texto normalizado se calcula una vez, no en cada pulsación de tecla.
  const index = useMemo(() => {
    const map = new Map<string, string>();
    for (const day of days) {
      for (const entry of day.entries) map.set(entry.id, normalize(haystack(entry)));
    }
    return map;
  }, [days]);

  const localDates = days.map((day) => day.date).sort();
  const earliest = localDates[0] ?? "";
  const latest = localDates[localDates.length - 1] ?? "";

  // Restaura el desbloqueo si la pestaña ya lo había conseguido.
  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(FULL_SEARCH_KEY);
      if (stored) {
        setPassword(stored);
        setFullSearch(true);
      }
    } catch {
      /* navegación privada o almacenamiento bloqueado */
    }
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!modalOpen || !dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    passwordRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      const target = previousFocus?.isConnected ? previousFocus : searchRef.current;
      target?.focus({ preventScroll: true });
    };
  }, [modalOpen]);

  // Cancelar al cambiar filtros impide que una respuesta antigua sustituya
  // los resultados actuales, también durante la espera antes de consultar.
  useEffect(() => {
    if (!fullSearch || !password) {
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setSearchError(null);
    setRemoteDays(null);

    async function search() {
      try {
        const params = new URLSearchParams();
        if (query.trim()) params.set("q", query.trim());
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        if (minImpact > 1) params.set("minImpact", String(minImpact));

        const response = await fetch(`/api/full-search?${params.toString()}`, {
          headers: { "x-full-search-password": password },
          cache: "no-store",
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;

        if (response.status === 401) {
          setFullSearch(false);
          setPassword("");
          setRemoteDays(null);
          try {
            window.sessionStorage.removeItem(FULL_SEARCH_KEY);
          } catch {
            /* ignore */
          }
          setSearchError("La sesión de búsqueda completa ha caducado. Vuelve a desbloquearla.");
          return;
        }

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          if (!controller.signal.aborted) setSearchError(payload.error ?? "No se pudo completar la búsqueda");
          return;
        }

        const result = (await response.json()) as CatalogDay[];
        if (!controller.signal.aborted) setRemoteDays(result);
      } catch {
        if (!controller.signal.aborted) setSearchError("No se pudo contactar con el servidor");
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }

    const timer = window.setTimeout(() => void search(), 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [fullSearch, password, query, from, to, minImpact]);

  const filtered = useMemo(() => {
    if (fullSearch) return remoteDays ?? [];
    return filterLocally(days, query, from, to, minImpact, index);
  }, [fullSearch, remoteDays, days, query, from, to, minImpact, index]);

  const totalLocal = days.reduce((sum, day) => sum + day.entries.length, 0);
  const shown = filtered.reduce((sum, day) => sum + day.entries.length, 0);
  const filtering = query !== "" || from !== "" || to !== "" || minImpact !== 1;
  const displayedDays = filtering || fullSearch ? filtered : filtered.slice(0, visibleDays);

  const rangeLabel = useMemo(() => {
    if (fullSearch) {
      if (!remoteDays?.length) return "";
      const dates = remoteDays.map((d) => d.date).sort();
      return `del ${formatDate(dates[0]!)} al ${formatDate(dates[dates.length - 1]!)}`;
    }
    if (earliest && latest) {
      return `del ${formatDate(earliest)} al ${formatDate(latest)}`;
    }
    return "";
  }, [fullSearch, remoteDays, earliest, latest]);

  /**
   * Toda la ficha lleva al resumen, no solo el titular.
   *
   * El enlace de verdad sigue viviendo en el `<h3>`: esto es una comodidad
   * para el ratón por encima, no el único camino. Sin JavaScript, con
   * teclado o con "abrir en pestaña nueva" quien manda es el `<a>`, así que
   * la ficha no necesita `role` ni `tabIndex` — duplicaría en el lector de
   * pantalla un enlace que ya está anunciado.
   *
   * No se usa el truco del `::after` estirado sobre la tarjeta porque taparía
   * la ficha entera, y con ella dos cosas que ya funcionan: los tooltips del
   * medidor de impacto y del gobierno, y poder seleccionar el texto.
   */
  function abrirFicha(e: ReactMouseEvent<HTMLElement>, id: string) {
    // Lo que ya hace algo por su cuenta (el titular) se queda su clic.
    // Si algún día la ficha gana un botón, va también en esta lista.
    if ((e.target as HTMLElement).closest("a, button")) return;

    // Arrastrar para seleccionar texto acaba en un clic, y seleccionar no
    // es navegar: sin esto, copiar un titular te echaba de la portada.
    if (window.getSelection()?.toString()) return;

    const href = `/d/${id}`;
    track("boe_open");

    // Cmd/Ctrl/Mayús + clic abre aparte, como haría cualquier enlace.
    if (e.metaKey || e.ctrlKey || e.shiftKey) {
      window.open(href, "_blank", "noopener");
      return;
    }

    router.push(href);
  }

  function reset() {
    setQuery("");
    setFrom("");
    setTo("");
    setMinImpact(1);
    setVisibleDays(2);
    searchRef.current?.focus({ preventScroll: true });
  }

  function lockFullSearch() {
    setFullSearch(false);
    setPassword("");
    setRemoteDays(null);
    setSearchError(null);
    try {
      window.sessionStorage.removeItem(FULL_SEARCH_KEY);
    } catch {
      /* ignore */
    }
  }

  async function unlock(e: FormEvent) {
    e.preventDefault();
    setUnlocking(true);
    setUnlockError(null);
    try {
      const response = await fetch("/api/full-search/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordDraft }),
      });

      if (response.status === 204) {
        try {
          window.sessionStorage.setItem(FULL_SEARCH_KEY, passwordDraft);
        } catch {
          /* sin almacenamiento: el desbloqueo vive solo en memoria */
        }
        setPassword(passwordDraft);
        setFullSearch(true);
        setPasswordDraft("");
        setModalOpen(false);
        return;
      }

      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setUnlockError(payload.error ?? "Contraseña incorrecta");
    } catch {
      setUnlockError("No se pudo contactar con el servidor");
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <>
      {/* Aviso de que el archivo entero está disponible. Va fuera del panel
          de filtros y no dentro del resumen para que se vea también con el
          panel plegado: quien ha desbloqueado necesita saberlo antes de
          buscar, no después de abrir.

          `role="status"` y no un botón: informa, no se pulsa. Con aspecto de
          botón porque es lo que el ojo reconoce como "esto está activo", pero
          sin `onClick`, sin `tabIndex` y sin cursor de mano, para no prometer
          una interacción que no existe. */}
      {fullSearch && (
        <p className="full-search-banner" role="status">
          <span className="full-search-tick" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
          </span>
          <span className="full-search-banner-text">
            <strong>Búsqueda completa activada</strong>
            <span>Puedes consultar todo el archivo, no solo los últimos 15 días</span>
          </span>
        </p>
      )}

      <label className="field field-search editorial-search">
        <span>¿Qué tema te interesa?</span>
        <input ref={searchRef} id="boe-search" type="search" value={query}
          aria-describedby="boe-search-status" onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por tema, ministerio o expediente…" />
      </label>
      <div className="quick-searches" role="group" aria-label="Búsquedas rápidas">
        {QUICK_TOPICS.map((topic) => (
          <button key={topic} type="button" className="quick-search-chip"
            aria-pressed={normalize(query.trim()) === normalize(topic)}
            onClick={() => setQuery(normalize(query.trim()) === normalize(topic) ? "" : topic)}>
            {topic}
          </button>
        ))}
        <button type="button" className="quick-search-chip" aria-pressed={minImpact >= 3}
          aria-label="Mayor impacto: niveles 3, 4 y 5"
          onClick={() => setMinImpact(minImpact >= 3 ? 1 : 3)}>
          Mayor impacto
        </button>
      </div>
      <div className="search-status">
        <p id="boe-search-status" role="status" aria-atomic="true">
          {searching ? "Buscando en el archivo…" : fullSearch && searchError ? "Búsqueda no completada." : (
            filtering || fullSearch
              ? `${shown} ${shown === 1 ? "disposición encontrada" : "disposiciones encontradas"}${fullSearch ? " en el archivo" : " en los últimos boletines"}.`
              : `${totalLocal} disposiciones disponibles. Mostrando ${displayedDays.length} de ${filtered.length} boletines.`
          )}
        </p>
        {filtering && <button type="button" className="link-reset" onClick={reset}>Quitar filtros</button>}
      </div>
      <details className="filters" aria-label="Filtros de búsqueda">
        <summary className="filter-summary">
          <span>{fullSearch ? "Archivo completo" : "Últimos boletines"}{rangeLabel && ` · ${rangeLabel}`}</span>
          <span className="filter-toggle" aria-hidden="true">
            Afinar búsqueda
          </span>
        </summary>

        <div className="filter-body">
          <div className="filter-row">
            <label className="field field-date">
              <span>Desde</span>
              <input
                type="date"
                value={from}
                min={fullSearch ? undefined : earliest || undefined}
                max={fullSearch ? undefined : latest || undefined}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>

            <label className="field field-date">
              <span>Hasta</span>
              <input
                type="date"
                value={to}
                min={fullSearch ? undefined : earliest || undefined}
                max={fullSearch ? undefined : latest || undefined}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>

            <fieldset className="field field-impact">
              <legend>Impacto mínimo</legend>
              <div className="impact-filter">
                {IMPACT_FILTERS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`chip chip-${option.value}${
                      minImpact === option.value ? " on" : ""
                    }`}
                    aria-pressed={minImpact === option.value}
                    onClick={() => setMinImpact(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="filter-row filter-row-actions">
            {fullSearch ? (
              <button type="button" className="full-search-btn on" onClick={lockFullSearch}>
                Desactivar búsqueda completa
              </button>
            ) : (
              <button
                type="button"
                className="full-search-btn"
                onClick={() => {
                  setUnlockError(null);
                  setPasswordDraft("");
                  setModalOpen(true);
                }}
              >
                Búsqueda completa
              </button>
            )}
          </div>
        </div>
      </details>

      {searchError && <p className="search-error" role="alert">{searchError}</p>}

      {shown === 0 && !searching && !(fullSearch && searchError) ? (
        <p className="empty-state">
          {fullSearch
            ? "Ninguna disposición del archivo coincide con la búsqueda."
            : "Ninguna disposición coincide con la búsqueda. Recuerda que la portada solo cubre los últimos días publicados."}
        </p>
      ) : (
        displayedDays.map((day, dayIndex) => (
          <section key={day.date}>
            <h2 className="day-heading">BOE del {formatDate(day.date)}</h2>
            {day.entries.map((entry) => (
              <article
                key={entry.id}
                className="entry-card"
                data-impact={entry.impact ?? undefined}
                onClick={(e) => abrirFicha(e, entry.id)}
              >
                <div className="entry-head">
                  <p className="case-label"><span className="case-prefix">Expediente </span>{entry.id}</p>
                  {entry.impact !== null && <ImpactMeter impact={entry.impact} />}
                </div>
                {/* El titular es el título llano de la IA; si aún no existe,
                    se cae al oficial para no dejar la ficha sin encabezado. */}
                <h3 className="entry-title">
                  <a href={`/d/${entry.id}`} data-engagement="boe_open">{entry.plainTitle ?? entry.title}</a>
                </h3>
                <p className="entry-department">{entry.department}</p>
                <GobiernoBadge gobierno={entry.gobierno} />
                <a className="entry-source" href={entry.officialHtmlUrl} target="_blank" rel="noopener noreferrer">Fuente oficial · BOE ↗</a>
                {entry.shortPhrase ? (
                  <p className="entry-phrase">{entry.shortPhrase}</p>
                ) : (
                  <p className="entry-phrase">
                    <span className="badge-pending">Resumen en curso</span>
                  </p>
                )}
                <div className="entry-footer"><span>Resumen IA · No oficial</span><span aria-hidden="true">Leer resumen →</span></div>
              </article>
            ))}
            {dayIndex === 0 && !filtering && !fullSearch && (
              <div className="reading-invite"><p>Lo relevante del BOE, también en tu móvil.</p><a href="#seguir-boe" className="text-link">Recibir los avisos gratis →</a></div>
            )}
          </section>
        ))
      )}

      {!filtering && !fullSearch && displayedDays.length < filtered.length && (
        <div className="load-more">
          <p>{displayedDays.length} de {filtered.length} boletines disponibles</p>
          <button className="editorial-button secondary" type="button" onClick={() => setVisibleDays((n) => n + 2)}>Ver boletines anteriores <span aria-hidden="true">↓</span></button>
        </div>
      )}

          <dialog
            ref={dialogRef}
            className="notify-dialog full-search-dialog"
            aria-modal="true"
            aria-labelledby="full-search-title"
            aria-describedby="full-search-description"
            onClose={() => setModalOpen(false)}
            onClick={(event) => {
              if (event.target !== event.currentTarget) return;
              const rect = event.currentTarget.getBoundingClientRect();
              if (event.clientX < rect.left || event.clientX > rect.right
                || event.clientY < rect.top || event.clientY > rect.bottom) setModalOpen(false);
            }}
          >
            <button
              type="button"
              className="notify-close"
              aria-label="Cerrar"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
            <h2 id="full-search-title" className="notify-title">
              Búsqueda completa
            </h2>
            <p id="full-search-description" className="notify-subtitle">
              Contacta con el desarrollador para acceso completo a la búsqueda. Por ahora solo los
              15 últimos boletines están disponibles.
            </p>

            <form className="full-search-form" onSubmit={unlock}>
              <label className="field">
                <span>Contraseña</span>
                <input
                  ref={passwordRef}
                  type="password"
                  autoComplete="current-password"
                  value={passwordDraft}
                  onChange={(e) => setPasswordDraft(e.target.value)}
                  placeholder="Clave de acceso"
                  required
                />
              </label>
              {unlockError && <p className="full-search-error" role="alert">{unlockError}</p>}
              <button type="submit" className="full-search-submit" disabled={unlocking}>
                {unlocking ? "Comprobando…" : "Desbloquear"}
              </button>
            </form>

            <div className="notify-actions full-search-contacts">
              <a
                className="notify-channel full-search-mail"
                href={`mailto:${EMAIL_CONTACTO}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                Correo
              </a>
              <a
                className="notify-channel full-search-linkedin"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
                  />
                </svg>
                LinkedIn
              </a>
            </div>
          </dialog>
    </>
  );
}
