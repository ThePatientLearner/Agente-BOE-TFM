import type { Metadata } from "next";
import { PanelPensiones } from "@/components/PanelPensiones";

export const metadata: Metadata = {
  title: "Pensiones en España — sostenibilidad y proyección · Agente BOE",
  description:
    "Radiografía del sistema público de pensiones: tamaño de la nómina, reparto por tipo, ratio cotizantes/pensionistas, brecha de género y proyecciones de gasto sobre el PIB (AIReF y Ministerio).",
  alternates: { canonical: "https://agenteboe.com/pensiones" },
};

export default function PensionesPage() {
  return (
    <article className="legal-page pensiones-article">
      <h1>Pensiones en España</h1>
      <p className="legal-updated pen-intro-meta">
        Sostenibilidad, tamaño del sistema y proyección · Datos oficiales
        simplificados
      </p>
      <PanelPensiones />
      <p className="legal-updated">
        <a className="volver-boe" href="/">Volver al resumen del BOE</a>
      </p>
    </article>
  );
}
