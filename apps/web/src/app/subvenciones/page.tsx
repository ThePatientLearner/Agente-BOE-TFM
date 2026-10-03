import type { Metadata } from "next";
import { NavegadorPeriodos } from "@/components/NavegadorPeriodos";
import { PanelSubvenciones } from "@/components/PanelSubvenciones";
import { fetchPeriodosSubvenciones, fetchSubvenciones } from "@/lib/api";

export const metadata: Metadata = {
  title: "Subvenciones sin concurso — Agente BOE",
  description:
    "Cuánto dinero público se reparte por concesión directa, sin concurrencia competitiva, y en qué administraciones se concentra. Datos de la Base de Datos Nacional de Subvenciones.",
  alternates: { canonical: "https://agenteboe.com/subvenciones" },
};

export default async function SubvencionesPage() {
  const [panel, periodos] = await Promise.all([
    fetchSubvenciones(),
    fetchPeriodosSubvenciones(),
  ]);

  if (!panel) {
    return (
      <article className="legal-page">
        <h1>Subvenciones sin concurso</h1>
        <p className="empty-state">
          Todavía no hay datos de subvenciones cargados. Vuelve en unos días.
        </p>
      </article>
    );
  }

  return (
    <article className="legal-page">
      <h1>Subvenciones sin concurso</h1>
      <p className="legal-updated">
        Todo el periodo cargado. <strong>Se actualiza cada lunes.</strong>
      </p>
      <PanelSubvenciones
        panel={panel}
        navegacion={<NavegadorPeriodos periodos={periodos} actual="todo" />}
      />
      <p className="legal-updated">
        <a className="volver-boe" href="/">Volver al resumen del BOE</a>
      </p>
    </article>
  );
}
