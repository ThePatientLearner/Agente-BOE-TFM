"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FiestaModoCtx = {
  /**
   * Si true: el hero usa la cesta sin IVA. La calculadora ya no depende de
   * esto: enseña siempre las dos lecturas (sin IVA y con IVA) a la vez.
   * Es el estado por defecto: al bajar la página se ve primero la cifra
   * sin IVA (~60 %) y hay que pulsar el botón para meter el IVA (~52 %).
   */
  sinIva: boolean;
  setSinIva: (v: boolean) => void;
  toggleSinIva: () => void;
};

const FiestaModoContext = createContext<FiestaModoCtx | null>(null);

export function FiestaModoProvider({ children }: { children: ReactNode }) {
  const [sinIva, setSinIva] = useState(true);
  const toggleSinIva = useCallback(() => setSinIva((v) => !v), []);
  const value = useMemo(
    () => ({ sinIva, setSinIva, toggleSinIva }),
    [sinIva, toggleSinIva],
  );
  return (
    <FiestaModoContext.Provider value={value}>{children}</FiestaModoContext.Provider>
  );
}

export function useFiestaSinIva(): boolean {
  return useContext(FiestaModoContext)?.sinIva ?? true;
}

/**
 * Barra a ancho completo: alterna el hero entre cesta con y sin IVA.
 */
export function FiestaBarraSinIva() {
  const ctx = useContext(FiestaModoContext);
  if (!ctx) return null;

  const { sinIva, toggleSinIva } = ctx;
  // Meter el IVA es lo que se activa a mano: el resaltado marca ese modo,
  // no el de partida.
  const activo = !sinIva;

  return (
    <button
      type="button"
      className={`fiesta-barra-modo${activo ? " es-activo" : ""}`}
      onClick={toggleSinIva}
      aria-pressed={activo}
      aria-controls="fiesta-hero"
    >
      <span className="fiesta-barra-modo-text">
        {sinIva
          ? "Cambiar a cálculo teniendo en cuenta el IVA"
          : "Cambiar a cálculo sin tener en cuenta el IVA"}
      </span>
      <span className="fiesta-barra-modo-estado" aria-hidden="true">
        {sinIva ? "Sin IVA" : "Con IVA"}
      </span>
    </button>
  );
}
