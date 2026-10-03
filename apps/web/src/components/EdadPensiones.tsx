"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { HITOS_DEMOGRAFICOS, REGLAS_JUBILACION } from "@/lib/pensiones-data";

/** Año de referencia de los datos de la página (instantánea jul. 2026). */
export const ANIO_REF_PENSIONES = 2026;

type EdadCtx = {
  edad: number | null;
  setEdad: (n: number | null) => void;
};

const EdadPensionesContext = createContext<EdadCtx | null>(null);

export function EdadPensionesProvider({ children }: { children: ReactNode }) {
  const [edad, setEdad] = useState<number | null>(null);
  const value = useMemo(() => ({ edad, setEdad }), [edad]);
  return (
    <EdadPensionesContext.Provider value={value}>
      {children}
    </EdadPensionesContext.Provider>
  );
}

export function useEdadPensiones(): number | null {
  return useContext(EdadPensionesContext)?.edad ?? null;
}

/**
 * Edad del lector en un año calendario futuro (o pasado).
 * null si no ha puesto edad o el resultado no es razonable.
 */
export function edadEnAnio(
  edadActual: number | null,
  anio: number,
  anioRef: number = ANIO_REF_PENSIONES,
): number | null {
  if (edadActual == null || !Number.isFinite(edadActual)) return null;
  const e = Math.round(edadActual + (anio - anioRef));
  if (e < 0 || e > 120) return null;
  return e;
}

/** Texto corto para ejes y barras: «tú 49 a.» */
export function etiquetaEdadCorta(
  edadActual: number | null,
  anio: number,
): string | null {
  const e = edadEnAnio(edadActual, anio);
  if (e == null) return null;
  return `tú ${e} a.`;
}

/**
 * Año natural en que el lector alcanza la edad ordinaria de jubilación.
 *
 * Usa `edadPlena` (67) y no la edad de 2026 (66 a. 10 m.) porque cualquier
 * jubilación futura cae ya en 2027 o más tarde, con la transición terminada.
 * Si ya pasó de esa edad, devuelve el año de referencia.
 */
export function anioJubilacion(
  edadActual: number | null,
  anioRef: number = ANIO_REF_PENSIONES,
): number | null {
  if (edadActual == null || !Number.isFinite(edadActual)) return null;
  const restan = Math.max(
    0,
    Math.round(REGLAS_JUBILACION.edadPlena - edadActual),
  );
  return anioRef + restan;
}

/** Rango de edad en un intervalo de años (hitos demográficos). */
export function etiquetaEdadRango(
  edadActual: number | null,
  anioDesde: number,
  anioHasta: number,
): string | null {
  const a = edadEnAnio(edadActual, anioDesde);
  const b = edadEnAnio(edadActual, anioHasta);
  if (a == null || b == null) return null;
  if (a === b) return `tú ~${a} años`;
  return `tú ~${a}–${b} años`;
}

function parseEdad(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 14 || n > 100) return null;
  return Math.round(n);
}

/**
 * Input al inicio de la sección. Sin edad no se muestran las etiquetas
 * «tú tendrás X» en las gráficas de proyección.
 */
export function EdadPensionesInput() {
  const ctx = useContext(EdadPensionesContext);
  const [raw, setRaw] = useState("");
  const parsed = useMemo(() => parseEdad(raw), [raw]);

  const onChange = useCallback(
    (value: string) => {
      setRaw(value);
      const n = parseEdad(value);
      ctx?.setEdad(n);
    },
    [ctx],
  );

  if (!ctx) return null;

  const edadJubilacion = REGLAS_JUBILACION.edadPlena;
  const aniosHastaJub =
    parsed != null ? Math.max(0, Math.round(edadJubilacion - parsed)) : null;
  const anioJub = anioJubilacion(parsed);

  return (
    <section className="pen-edad" aria-labelledby="pen-edad-title">
      <div className="pen-edad-cab">
        <p className="pen-edad-kicker">Personaliza la lectura</p>
        <h2 id="pen-edad-title" className="pen-edad-titulo">
          ¿Qué edad tienes?
        </h2>
        <p className="pen-edad-intro">
          Si la pones, en las gráficas con años verás{" "}
          <strong>qué edad tendrás</strong> cuando llegue cada hito (2050, el
          pico del baby boom, etc.). No calcula tu pensión: solo traduce el
          calendario del sistema a tu reloj personal.
        </p>
      </div>

      <div className="pen-edad-form">
        <label className="pen-edad-label" htmlFor="pen-edad-input">
          Tu edad hoy ({ANIO_REF_PENSIONES})
        </label>
        <div className="pen-edad-input-row">
          <input
            id="pen-edad-input"
            className="pen-edad-input"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ej. 35"
            value={raw}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby="pen-edad-hint"
          />
          <span className="pen-edad-suffix" aria-hidden="true">
            años
          </span>
        </div>
        <p id="pen-edad-hint" className="pen-edad-hint">
          Entre 14 y 100. Puedes borrarla cuando quieras.
          {parsed != null && anioJub != null && (
            <>
              {" "}
              Con la edad ordinaria de referencia (
              {edadJubilacion} años), te jubilarías en torno a{" "}
              <strong>{anioJub}</strong>
              {aniosHastaJub === 0
                ? " (ya en esa franja o por encima)."
                : ` (dentro de ~${aniosHastaJub} años).`}
            </>
          )}
        </p>
        {raw.trim() !== "" && parsed == null && (
          <p className="pen-edad-error">Introduce una edad entre 14 y 100.</p>
        )}
      </div>
    </section>
  );
}

/** Badge compacto junto a un año de gráfico. */
export function EdadEnAnioBadge({ anio }: { anio: number }) {
  const edad = useEdadPensiones();
  const txt = etiquetaEdadCorta(edad, anio);
  if (!txt) return null;
  return <span className="pen-edad-badge">{txt}</span>;
}

/**
 * Timeline demográfico con edad del lector en cada tramo (si la ha puesto).
 */
export function HitosDemograficosConEdad() {
  const edad = useEdadPensiones();

  return (
    <div className="pen-timeline">
      {HITOS_DEMOGRAFICOS.map((h) => {
        const rango = etiquetaEdadRango(edad, h.anioDesde, h.anioHasta);
        return (
          <article key={h.anio} className="pen-timeline-item">
            <span className="pen-timeline-anio">
              {h.anio}
              {rango && <span className="pen-edad-badge pen-edad-badge-block">{rango}</span>}
            </span>
            <h3 className="pen-timeline-titulo">{h.titulo}</h3>
            <p>{h.texto}</p>
          </article>
        );
      })}
    </div>
  );
}
