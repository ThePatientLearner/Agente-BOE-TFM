import type { Gobierno } from "@/lib/api";
import { formatDate } from "@/lib/format";

/**
 * Quién gobierna lo que la disposición toca: la comunidad afectada si es
 * autonómica, el Gobierno de España en todo lo demás. Nunca falta — toda
 * disposición del BOE la firma alguien.
 *
 * Deliberadamente en gris y oro, como el resto de metadatos: colorear cada
 * partido con su color convertiría una ficha del BOE en un mapa electoral,
 * y aquí el dato es contexto ("esto lo firma un gobierno de PP+VOX"), no
 * la noticia. Por el mismo motivo no se juzga la coalición: se enumera.
 *
 * El dato NO sale del resumen: llega calculado de la API contra una tabla
 * que se actualiza tras cada elección, así que una ficha de hace dos años
 * enseña quién gobierna hoy, no quién gobernaba cuando se publicó.
 */
export function GobiernoBadge({
  gobierno,
  variante = "compacto",
}: {
  gobierno: Gobierno | null;
  variante?: "compacto" | "detalle";
}) {
  // Solo ocurre contra una API anterior a esta función (ver `api.ts`): la web
  // y la API se despliegan por separado. Mejor una ficha sin la línea que un
  // prerender roto.
  if (!gobierno) return null;

  const detalle = `${gobierno.presidente} — en el cargo desde ${gobierno.desde}. Dato verificado el ${formatDate(gobierno.verificadoEl)}.`;

  // "Afecta a" solo se sostiene en lo autonómico: una orden ministerial no
  // "afecta al Gobierno de España", sale de él.
  const texto = (
    <>
      🏛️ {gobierno.ambito === "autonomico" ? "Afecta a " : ""}
      {gobierno.nombre} <strong>({gobierno.etiqueta})</strong>
    </>
  );

  if (variante === "detalle") {
    return (
      <p className="gobierno-linea">
        <span className="gobierno-badge">{texto}</span>
        <span className="gobierno-detalle">{detalle}</span>
      </p>
    );
  }

  return (
    <p className="gobierno-linea">
      <span className="gobierno-badge" title={detalle}>
        {texto}
      </span>
    </p>
  );
}
