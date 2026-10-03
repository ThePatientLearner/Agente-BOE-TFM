"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

/**
 * Botón «Comparte»: copia al portapapeles un texto listo para publicar
 * (cuerpo corto + URL de la página). El primer botón de la página muestra
 * la etiqueta «Comparte»; el resto solo el icono de copiar.
 *
 * Un segundo después de copiar se abre una modal preguntando dónde
 * compartir (Instagram, X, LinkedIn) para que el usuario promocione el
 * dato y la web sin tener que montar el post a mano.
 */

const SITE = "https://agenteboe.com";

/** Retraso antes de mostrar la modal de redes, tras copiar. */
const SHARE_MODAL_DELAY_MS = 1000;

/**
 * `what` nombra lo que se ha copiado («Dato», «Enlace»…). `copied: false`
 * cuando el portapapeles falló: entonces el panel no puede decir que el texto
 * está listo para pegar, porque no lo está.
 */
export type ShareModalOptions = { what?: string; copied?: boolean };

type ShareCtx = {
  register: (id: string) => void;
  firstId: string | null;
  openShareModal: (payload: string, options?: ShareModalOptions) => void;
};

const ShareDatoContext = createContext<ShareCtx | null>(null);

/**
 * El panel de redes (X, LinkedIn, Instagram) para quien comparte algo que no
 * es un dato suelto, como el resumen entero. Nulo fuera del proveedor.
 */
export function useShareModal(): ((payload: string, options?: ShareModalOptions) => void) | null {
  return useContext(ShareDatoContext)?.openShareModal ?? null;
}

function buildPageUrl(pathname: string): string {
  const path = pathname === "/" ? "" : pathname;
  return `${SITE}${path}`;
}

export function buildSharePayload(text: string, pathname: string): string {
  return `${text.trim()}\n\n${buildPageUrl(pathname)}`;
}

function shareUrlX(payload: string): string {
  return `https://x.com/intent/tweet?text=${encodeURIComponent(payload)}`;
}

function shareUrlLinkedIn(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

/** Instagram no tiene intent web con texto: se abre la app/web y el usuario pega. */
const INSTAGRAM_URL = "https://www.instagram.com/";

function IconCopy({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="14"
      height="14"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93ZM17.61 20.64h2.04L6.49 3.24H4.3Z"
      />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0Z"
      />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.41-11.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z"
      />
    </svg>
  );
}

function ShareModal({
  open,
  payload,
  pageUrl,
  options,
  onClose,
}: {
  open: boolean;
  payload: string;
  pageUrl: string;
  options: ShareModalOptions;
  onClose: () => void;
}) {
  const copied = options.copied !== false;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="share-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="share-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-dialog-title"
        aria-describedby="share-dialog-desc"
      >
        <button
          type="button"
          className="share-dialog-close"
          aria-label="Cerrar"
          ref={closeRef}
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="share-dialog-title" className="share-dialog-title">
          {copied ? `${options.what ?? "Dato"} copiado al portapapeles` : "¿Dónde quieres compartirlo?"}
        </h2>
        <p id="share-dialog-desc" className="share-dialog-desc">
          {copied
            ? "¿Dónde quieres compartirlo? El texto ya está listo para pegar."
            : "No se ha podido copiar el texto: X y LinkedIn lo recogen solos; para Instagram, copia la dirección de esta página."}
        </p>
        <div className="share-dialog-actions">
          <a
            className="share-net share-net-ig"
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <IconInstagram />
            Instagram
          </a>
          <a
            className="share-net share-net-x"
            href={shareUrlX(payload)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <IconX />
            X.com
          </a>
          <a
            className="share-net share-net-li"
            href={shareUrlLinkedIn(pageUrl)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
          >
            <IconLinkedIn />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}

function ShareDatoProviderInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const [order, setOrder] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [payload, setPayload] = useState("");
  const [modalOptions, setModalOptions] = useState<ShareModalOptions>({});
  const delayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const register = useCallback((id: string) => {
    setOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const closeModal = useCallback(() => setModalOpen(false), []);

  const openShareModal = useCallback((nextPayload: string, options: ShareModalOptions = {}) => {
    if (delayRef.current) clearTimeout(delayRef.current);
    delayRef.current = setTimeout(() => {
      setPayload(nextPayload);
      setModalOptions(options);
      setModalOpen(true);
      delayRef.current = null;
    }, SHARE_MODAL_DELAY_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (delayRef.current) clearTimeout(delayRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({ register, firstId: order[0] ?? null, openShareModal }),
    [register, order, openShareModal],
  );

  return (
    <ShareDatoContext.Provider value={value}>
      {children}
      <ShareModal
        open={modalOpen}
        payload={payload}
        pageUrl={buildPageUrl(pathname)}
        options={modalOptions}
        onClose={closeModal}
      />
    </ShareDatoContext.Provider>
  );
}

/**
 * Envuelve el contenido de la página. Al cambiar de ruta se remonta y el
 * primer ShareDato vuelve a llevar la etiqueta completa.
 */
export function ShareDatoProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  return <ShareDatoProviderInner key={pathname}>{children}</ShareDatoProviderInner>;
}

function useShareSlot(id: string): boolean {
  const ctx = useContext(ShareDatoContext);
  useEffect(() => {
    ctx?.register(id);
  }, [ctx, id]);
  if (!ctx) return false;
  // Mientras no hay primero registrado, el que monta se considera candidato
  // a featured (evita un flash de solo-icono en el primero).
  return ctx.firstId === null || ctx.firstId === id;
}

export type ShareDatoProps = {
  /** Texto del dato, listo para tweet (sin URL; se añade sola). */
  text: string;
  className?: string;
};

/**
 * Colocar dentro de un bloque con posición relativa (`.share-host` o
 * `.pen-chart`). Copia el texto + URL de la página actual y, un segundo
 * después, ofrece compartir en redes.
 */
export function ShareDato({ text, className }: ShareDatoProps) {
  const id = useId();
  const pathname = usePathname() || "/";
  const ctx = useContext(ShareDatoContext);
  const showLabel = useShareSlot(id);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const payload = buildSharePayload(text, pathname);

  const onCopy = async () => {
    const done = () => {
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 1800);
      ctx?.openShareModal(payload);
    };
    try {
      await navigator.clipboard.writeText(payload);
      done();
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = payload;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch {
        /* sin clipboard: el title del botón sigue mostrando el texto */
      }
    }
  };

  return (
    <button
      type="button"
      className={`share-dato${showLabel ? " share-dato-featured" : ""}${copied ? " es-copiado" : ""}${className ? ` ${className}` : ""}`}
      onClick={() => void onCopy()}
      title={copied ? "Copiado" : `Copiar para compartir:\n\n${payload}`}
      aria-label={
        copied
          ? "Dato copiado al portapapeles"
          : showLabel
            ? "Comparte: copiar texto listo para publicar"
            : "Copiar dato para compartir"
      }
    >
      {copied ? <IconCheck /> : <IconCopy />}
      {showLabel && (
        <span className="share-dato-label">
          {copied ? "Copiado" : "Comparte"}
        </span>
      )}
    </button>
  );
}
