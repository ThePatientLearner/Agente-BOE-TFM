"use client";

import { useEffect, useState } from "react";
import type { RepartoPeriodo, RepartoTramo } from "@/lib/api";
import { formatEuros, formatPorcentaje } from "@/lib/format";
import { ShareDato } from "./ShareDato";

/**
 * Barra apilada del reparto por régimen, bajo el dato principal.
 *
 * Es un componente de cliente y el resto de la sección no lo es. Lo justifica
 * lo que hace: anima al montar y responde al puntero. Los datos siguen
 * llegando del servidor —los recibe ya resueltos por props— así que el HTML de
 * la página se sirve renderizado igual que antes y esto solo hidrata la barra.
 *
 * Los tres colores no están elegidos a ojo. Salen de la paleta del sitio —el
 * dorado de la marca, un azul de la familia del azul marino del fondo y un
 * granate apagado emparentado con el rojo de la bandera— y están medidos:
 * los tres caen en la banda de luminosidad para fondo oscuro (OKLCH L
 * 0.48–0.67), superan el suelo de croma 0.10, pasan de 3:1 de contraste sobre
 * el panel y su peor par bajo daltonismo (protanopia y deuteranopia simuladas)
 * queda en ΔE 12.9, holgadamente por encima del objetivo de 8.
 */
const SERIES = [
  {
    id: "directas",
    nombre: "Concesión directa",
    color: "#b28f3a",
    /** Contraste 5.93:1 sobre el dorado; el blanco solo daría 3.05:1. */
    tinta: "#0d1626",
  },
  {
    id: "competitivas",
    nombre: "Concurrencia competitiva",
    color: "#3f80bd",
    tinta: "#0d1626",
  },
  {
    id: "sinClasificar",
    nombre: "Sin clasificar",
    color: "#a9576f",
    tinta: "#ffffff",
  },
] as const;

type SerieId = (typeof SERIES)[number]["id"];
type Medida = "dinero" | "convocatorias";

function euros(tramo: RepartoTramo): number {
  const n = Number(tramo.importe);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Por debajo de este porcentaje no cabe "48,8 %" dentro del tramo con aire a
 * los lados. Un rótulo que no cabe no se recorta: se cae y lo recogen la
 * leyenda y el emergente, que llevan el mismo dato.
 */
const ANCHO_MINIMO_PARA_ROTULO = 12;

export function RepartoBarra({ reparto }: { reparto: RepartoPeriodo }) {
  const [medida, setMedida] = useState<Medida>("dinero");
  const [activa, setActiva] = useState<SerieId | null>(null);

  // Las barras arrancan a cero y crecen en cuanto el componente hidrata. El
  // estado inicial `false` es el que se renderiza en el servidor, así que la
  // animación ocurre siempre, también al navegar de un mes a otro.
  const [crecida, setCrecida] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setCrecida(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const valores: Record<SerieId, { valor: number; convocatorias: number; importe: number }> = {
    directas: {
      valor: medida === "dinero" ? euros(reparto.directas) : reparto.directas.convocatorias,
      convocatorias: reparto.directas.convocatorias,
      importe: euros(reparto.directas),
    },
    competitivas: {
      valor: medida === "dinero" ? euros(reparto.competitivas) : reparto.competitivas.convocatorias,
      convocatorias: reparto.competitivas.convocatorias,
      importe: euros(reparto.competitivas),
    },
    sinClasificar: {
      valor:
        medida === "dinero" ? euros(reparto.sinClasificar) : reparto.sinClasificar.convocatorias,
      convocatorias: reparto.sinClasificar.convocatorias,
      importe: euros(reparto.sinClasificar),
    },
  };

  const total = SERIES.reduce((suma, s) => suma + valores[s.id].valor, 0);
  if (total <= 0) return null;

  const tramos = SERIES.map((serie) => {
    const { valor, convocatorias, importe } = valores[serie.id];
    return { ...serie, valor, convocatorias, importe, porcentaje: (valor / total) * 100 };
  });

  // Un tramo a cero no se pinta: una franja de ancho nulo con su hueco de 2px
  // dejaría una costura sin dato detrás.
  const visibles = tramos.filter((t) => t.valor > 0);
  const pctDirectas = formatPorcentaje(
    valores.directas.importe,
    SERIES.reduce((s, x) => s + valores[x.id].importe, 0),
  );
  const shareText =
    medida === "dinero"
      ? `Subvenciones sin concurso: la concesión directa se lleva ${pctDirectas} del dinero convocado en el periodo. Datos BDNS.`
      : `Subvenciones: en número de convocatorias la concesión directa pesa distinto que en dinero. Mide el reparto en Agente BOE.`;

  return (
    <figure className="reparto share-host">
      <ShareDato text={shareText} />
      <figcaption className="reparto-cabecera">
        <span className="reparto-titulo">
          Reparto {medida === "dinero" ? "del dinero convocado" : "de las convocatorias"}
        </span>

        {/* Las dos medidas cuentan historias distintas y la página lo dice en
            el párrafo de arriba. El conmutador deja comprobarlo en la misma
            barra en vez de obligar a comparar dos cifras de un texto. */}
        <span className="reparto-medidas" role="group" aria-label="Medir el reparto por">
          <button
            type="button"
            className="reparto-medida"
            aria-pressed={medida === "dinero"}
            onClick={() => setMedida("dinero")}
          >
            Dinero
          </button>
          <button
            type="button"
            className="reparto-medida"
            aria-pressed={medida === "convocatorias"}
            onClick={() => setMedida("convocatorias")}
          >
            Convocatorias
          </button>
        </span>
      </figcaption>

      <div className="reparto-barra">
        {visibles.map((tramo) => (
          <button
            key={tramo.id}
            type="button"
            className="reparto-tramo"
            style={{
              flexBasis: crecida ? `${tramo.porcentaje}%` : "0%",
              background: tramo.color,
              color: tramo.tinta,
            }}
            onMouseEnter={() => setActiva(tramo.id)}
            onMouseLeave={() => setActiva(null)}
            onFocus={() => setActiva(tramo.id)}
            onBlur={() => setActiva(null)}
            aria-label={`${tramo.nombre}: ${formatPorcentaje(tramo.valor, total)}, ${formatEuros(
              String(tramo.importe),
            )}, ${tramo.convocatorias} convocatorias`}
          >
            {/* Solo se rotula dentro el tramo de concesión directa, que es del
                que va la página. Un número en cada franja es ruido: los otros
                dos los llevan la leyenda y el emergente. */}
            {tramo.id === "directas" && tramo.porcentaje >= ANCHO_MINIMO_PARA_ROTULO && (
              <span className="reparto-tramo-valor">{formatPorcentaje(tramo.valor, total)}</span>
            )}
          </button>
        ))}

        {activa && (
          <span className="reparto-emergente" role="status">
            {(() => {
              const t = tramos.find((x) => x.id === activa);
              if (!t) return null;
              return (
                <>
                  <span className="reparto-emergente-valor">
                    {formatPorcentaje(t.valor, total)}
                  </span>
                  <span className="reparto-emergente-serie">
                    <i style={{ background: t.color }} aria-hidden="true" />
                    {t.nombre}
                  </span>
                  <span className="reparto-emergente-detalle">
                    {formatEuros(String(t.importe))} · {t.convocatorias} convocatorias
                  </span>
                </>
              );
            })()}
          </span>
        )}
      </div>

      {/* La leyenda va siempre: con tres series, fiarlo todo al color deja
          fuera a quien no distingue dos de ellas. Aquí además lleva el valor,
          así que ningún dato depende de pasar el puntero por encima. */}
      <ul className="reparto-leyenda">
        {tramos.map((tramo) => (
          <li key={tramo.id} className={activa === tramo.id ? "es-activa" : undefined}>
            <i className="reparto-clave" style={{ background: tramo.color }} aria-hidden="true" />
            <span className="reparto-leyenda-nombre">{tramo.nombre}</span>
            <span className="reparto-leyenda-valor">
              {formatPorcentaje(tramo.valor, total)}
              <span className="reparto-leyenda-bruto">
                {medida === "dinero"
                  ? formatEuros(String(tramo.importe))
                  : `${tramo.convocatorias} convocatorias`}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
