import type { Metadata } from "next";
import { PanelFiesta } from "@/components/PanelFiesta";

export const metadata: Metadata = {
  title: "¿Quién paga la fiesta? — impuestos y reparto · Agente BOE",
  description:
    "Radiografía de quién paga los impuestos en España: calculadora por renta con IRPF, cotizaciones del trabajador y de la empresa, IVA por percentil, saldo neto y datos de la AEAT y FEDEA. Aproximación divulgativa, no asesoramiento fiscal.",
  alternates: { canonical: "https://agenteboe.com/quien-paga" },
};

export default function QuienPagaPage() {
  return (
    <article className="legal-page fiesta-article">
      <h1>¿Quién paga la fiesta?</h1>
      <p className="legal-updated pen-intro-meta">
        Impuestos, rentas y saldo neto · Datos oficiales simplificados
      </p>
      <PanelFiesta />
      <p className="legal-updated">
        <a className="volver-boe" href="/">Volver al resumen del BOE</a>
      </p>
    </article>
  );
}
