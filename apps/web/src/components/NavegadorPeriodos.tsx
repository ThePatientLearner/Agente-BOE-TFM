import Link from "next/link";
import type { PeriodoDisponible } from "@/lib/api";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** "2026-08" → "agosto de 2026". */
export function nombreDelMes(mes: string): string {
  const [anio, numero] = mes.split("-");
  const indice = Number(numero) - 1;
  if (!anio || Number.isNaN(indice) || !MESES[indice]) return mes;
  return `${MESES[indice]} de ${anio}`;
}

/** "2026-08" → "agosto". Dentro de un grupo por año el año sobra. */
function nombreMesCorto(mes: string): string {
  const [, numero] = mes.split("-");
  const indice = Number(numero) - 1;
  if (Number.isNaN(indice) || !MESES[indice]) return mes;
  return MESES[indice];
}

/**
 * Agrupa por año respetando el orden que trae la API (más reciente primero).
 * Así 2027 queda encima de 2026 cuando haya más de un año.
 */
function agruparPorAnio(
  periodos: readonly PeriodoDisponible[],
): readonly { anio: string; meses: readonly PeriodoDisponible[] }[] {
  const grupos: { anio: string; meses: PeriodoDisponible[] }[] = [];
  const indice = new Map<string, number>();

  for (const periodo of periodos) {
    const anio = periodo.mes.slice(0, 4);
    const i = indice.get(anio);
    if (i === undefined) {
      indice.set(anio, grupos.length);
      grupos.push({ anio, meses: [periodo] });
    } else {
      grupos[i]!.meses.push(periodo);
    }
  }

  return grupos;
}

/**
 * Navegación entre periodos, agrupada por año.
 *
 * Son enlaces a páginas distintas y no un filtro: cada mes es una página
 * generada de antemano y servida desde el CDN. Agrupar por año evita que,
 * con un histórico largo, la barra se convierta en un muro de pastillas.
 */
export function NavegadorPeriodos({
  periodos,
  actual,
}: {
  periodos: readonly PeriodoDisponible[];
  /** `"todo"` en la vista general, o el mes en formato `"2026-08"`. */
  actual: string;
}) {
  if (periodos.length === 0) return null;

  const porAnio = agruparPorAnio(periodos);

  return (
    <nav className="periodos" aria-label="Periodos disponibles">
      <div className="periodos-fila">
        <Link
          className="periodo"
          href="/subvenciones"
          aria-current={actual === "todo" ? "page" : undefined}
        >
          Todo
        </Link>
      </div>

      {porAnio.map(({ anio, meses }) => (
        <div key={anio} className="periodos-fila">
          <span className="periodos-anio" aria-hidden={meses.length === 1 ? true : undefined}>
            {anio}
          </span>
          {meses.map((periodo) => (
            <Link
              key={periodo.mes}
              className="periodo"
              href={`/subvenciones/${periodo.mes}`}
              aria-current={actual === periodo.mes ? "page" : undefined}
              // Nombre completo en aria; el chip solo dice "agosto" porque el
              // año ya está en la etiqueta de la fila.
              aria-label={nombreDelMes(periodo.mes)}
            >
              {nombreMesCorto(periodo.mes)}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}
