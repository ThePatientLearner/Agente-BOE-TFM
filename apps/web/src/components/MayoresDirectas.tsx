import type { ConvocatoriaDirecta } from "@/lib/api";
import { formatDate, formatEuros } from "@/lib/format";
import { ShareDato } from "./ShareDato";

const NIVELES: Record<string, string> = {
  ESTADO: "Administración General del Estado",
  AUTONOMICA: "Comunidades autónomas",
  LOCAL: "Entidades locales",
  OTROS: "Otros organismos",
};

/**
 * Mayores convocatorias de concesión directa por presupuesto publicado.
 *
 * Solo listamos convocatorias (no adjudicaciones a beneficiarios). Un
 * desglose público/privado sobre pagos parciales del periodo induciría
 * conclusiones que los datos no sostienen: muchos programas grandes aún no
 * tienen (o no hemos cargado) las adjudicaciones individuales.
 */
export function MayoresDirectas({ mayores }: { mayores: ConvocatoriaDirecta[] }) {
  return (
    <section className="mayores-directas share-host">
      <ShareDato text="Las mayores convocatorias de concesión directa por presupuesto publicado, según la BDNS." />
      <h2>Las mayores por importe</h2>
      <p>
        Convocatorias de concesión directa ordenadas por{" "}
        <strong>presupuesto publicado</strong> en la BDNS. Cada una enlaza a su
        ficha oficial. Un importe grande es el techo de la convocatoria, no
        necesariamente un único pago a un beneficiario (puede repartirse en
        miles de adjudicaciones o publicarse antes de los pagos).
      </p>

      {mayores.length === 0 ? (
        <p className="mayores-vacio">No hay convocatorias directas en este periodo.</p>
      ) : (
        <ul className="mayores-lista">
          {mayores.map((c) => (
            <li key={c.codigoBdns}>
              <a href={c.urlOficial} rel="noopener noreferrer" target="_blank">
                {formatEuros(c.presupuestoTotal)}
              </a>{" "}
              — {c.descripcion}{" "}
              <span className="entry-department">
                {c.nivel2 ?? NIVELES[c.nivel1] ?? c.nivel1}
                {c.nivel3 ? ` · ${c.nivel3}` : ""} · {formatDate(c.fechaRecepcion)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
