import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NavegadorPeriodos, nombreDelMes } from "@/components/NavegadorPeriodos";
import { PanelSubvenciones } from "@/components/PanelSubvenciones";
import { fetchPeriodosSubvenciones, fetchSubvenciones } from "@/lib/api";

/**
 * Una página estática por cada mes con datos.
 *
 * Es el motivo de que esta sección no crezca en coste con las visitas: cada
 * mes se genera una vez y se sirve desde el CDN, así que mil personas
 * consultando agosto son una sola consulta a la base de datos, no mil.
 */
export async function generateStaticParams() {
  const periodos = await fetchPeriodosSubvenciones();
  return periodos.map((periodo) => ({ mes: periodo.mes }));
}

/**
 * `false` y no `blocking`: solo existen los meses que devuelve
 * `generateStaticParams`. Un mes inventado en la URL da 404 en vez de
 * disparar una generación contra la base de datos, que es justo la puerta por
 * la que se colaría el coste variable que se quiere evitar.
 */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mes: string }>;
}): Promise<Metadata> {
  const { mes } = await params;
  const nombre = nombreDelMes(mes);
  return {
    title: `Subvenciones sin concurso en ${nombre} — Agente BOE`,
    description: `Reparto de subvenciones por concesión directa en ${nombre}, según la Base de Datos Nacional de Subvenciones.`,
    alternates: { canonical: `https://agenteboe.com/subvenciones/${mes}` },
  };
}

export default async function MesSubvencionesPage({
  params,
}: {
  params: Promise<{ mes: string }>;
}) {
  const { mes } = await params;
  const periodos = await fetchPeriodosSubvenciones();
  const periodo = periodos.find((p) => p.mes === mes);
  if (!periodo) notFound();

  const panel = await fetchSubvenciones({ desde: periodo.desde, hasta: periodo.hasta });
  if (!panel) notFound();

  return (
    <article className="legal-page">
      <h1>Subvenciones sin concurso</h1>
      <p className="legal-updated">
        {nombreDelMes(mes)} · {periodo.convocatorias} convocatorias.{" "}
        <strong>Se actualiza cada lunes.</strong>
      </p>
      <PanelSubvenciones
        panel={panel}
        navegacion={<NavegadorPeriodos periodos={periodos} actual={mes} />}
      />
      <p className="legal-updated">
        <a href="/subvenciones">Ver todo el periodo cargado</a>
        <a className="volver-boe" href="/">Volver al resumen del BOE</a>
      </p>
    </article>
  );
}
