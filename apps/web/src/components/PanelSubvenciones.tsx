import type { PanelSubvenciones as Panel, RepartoTramo } from "@/lib/api";
import { formatDate, formatEuros, formatPorcentaje } from "@/lib/format";
import { IndiceInforme } from "./IndiceInforme";
import { MayoresDirectas } from "./MayoresDirectas";
import { RepartoBarra } from "./RepartoBarra";
import { ShareDato } from "./ShareDato";
import { VerRestoInforme } from "./VerRestoInforme";

const INDICE_SUBVENCIONES = [
  { id: "subv-dato", label: "El dato principal" },
  { id: "subv-reparto", label: "Reparto directa vs competitiva" },
  { id: "subv-concentra", label: "Dónde se concentra" },
  { id: "subv-mayores", label: "Las mayores convocatorias" },
  { id: "subv-fuentes", label: "De dónde salen estos datos" },
] as const;

const NIVELES: Record<string, string> = {
  ESTADO: "Administración General del Estado",
  AUTONOMICA: "Comunidades autónomas",
  LOCAL: "Entidades locales",
  OTROS: "Otros organismos",
};

/**
 * Cuántos organismos se listan. Con la semana ya ingerida salen 188 filas, y
 * una tabla así es un muro: nadie la lee y esconde lo importante, que está
 * arriba. El resto no desaparece — se resume debajo con su importe y su peso.
 */
const ORGANISMOS_VISIBLES = 25;

function euros(tramo: RepartoTramo): number {
  const n = Number(tramo.importe);
  return Number.isFinite(n) ? n : 0;
}

/**
 * El cuerpo de la sección de subvenciones. Lo comparten la vista de todo el
 * periodo cargado y la de cada mes: el contenido es el mismo y solo cambia el
 * rango, así que duplicarlo habría garantizado que las dos se desincronizaran
 * en cuanto alguien corrigiera un texto en una sola.
 */
export function PanelSubvenciones({
  panel,
  navegacion,
}: {
  panel: Panel;
  /** Enlaces a los meses; los pinta la página, que es quien sabe cuál es el actual. */
  navegacion?: React.ReactNode;
}) {
  if (!panel.cobertura || !panel.reparto) {
    return (
      <p className="empty-state">
        Todavía no hay datos de subvenciones para este periodo.
      </p>
    );
  }

  const { cobertura, reparto, porAdministracion, mayores } = panel;

  const dineroDirectas = euros(reparto.directas);
  const dineroTotal =
    dineroDirectas + euros(reparto.competitivas) + euros(reparto.sinClasificar);

  const numeroDirectas = reparto.directas.convocatorias;
  const numeroTotal =
    numeroDirectas + reparto.competitivas.convocatorias + reparto.sinClasificar.convocatorias;

  // Lo que queda fuera de la tabla, sumado: la cola no se esconde, se resume.
  const resto = porAdministracion.slice(ORGANISMOS_VISIBLES).reduce(
    (acumulado, fila) => ({
      organismos: acumulado.organismos + 1,
      convocatorias: acumulado.convocatorias + fila.convocatorias,
      importe: acumulado.importe + Number(fila.importeTotal ?? 0),
    }),
    { organismos: 0, convocatorias: 0, importe: 0 },
  );

  return (
    <>
      {navegacion}

      {/* El encuadre va DELANTE de cualquier cifra, y no es un formalismo: sin
          él, un porcentaje alto se lee como una denuncia. La concesión directa
          es una vía legal y ordinaria; lo que esta página mide es dónde se
          concentra, no si alguien hizo algo indebido. */}
      <div className="legal-warning">
        <p>
          <strong>La concesión directa es legal.</strong> El artículo 22.2 de la Ley General de
          Subvenciones permite conceder ayudas sin concurrencia competitiva en los casos que
          prevé: subvenciones nominativas recogidas en los presupuestos, las impuestas por una
          norma con rango de ley y aquellas en que se acrediten razones de interés público,
          social, económico o humanitario. Esta página <strong>no denuncia irregularidades</strong>:
          mide cuánto dinero se reparte por esa vía y en qué administraciones se concentra.
        </p>
      </div>

      <IndiceInforme items={INDICE_SUBVENCIONES} />

      <div className="share-host subv-dato-principal">
        <ShareDato
          text={`Concesión directa: ${formatPorcentaje(dineroDirectas, dineroTotal)} del dinero convocado en subvenciones (${formatDate(reparto.desde)} – ${formatDate(reparto.hasta)}). Es legal, y aquí se mide cuánto pesa.`}
        />
      <h2 id="subv-dato">El dato principal</h2>
      <p>
        Entre el {formatDate(reparto.desde)} y el {formatDate(reparto.hasta)}, la concesión
        directa se llevó{" "}
        <strong className="disclaimer-highlight">
          {formatPorcentaje(dineroDirectas, dineroTotal)}
        </strong>{" "}
        del dinero convocado: {formatEuros(reparto.directas.importe)} de un total de{" "}
        {formatEuros(String(dineroTotal))}.
      </p>
      <p>
        Medido en <em>número de convocatorias</em> en vez de en dinero, la proporción es distinta:{" "}
        {formatPorcentaje(numeroDirectas, numeroTotal)} ({numeroDirectas} de {numeroTotal}). Las
        dos cifras son ciertas y cuentan cosas distintas: hay muchas convocatorias directas de
        importe pequeño, y pocas competitivas que mueven mucho dinero.
      </p>
      </div>

      {/* Va aquí, entre las dos cifras y la tabla: enseña de un vistazo lo que
          el texto acaba de decir y lo que la tabla desglosa fila a fila. */}
      <div id="subv-reparto" className="informe-ancla">
        <RepartoBarra reparto={reparto} />
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Régimen</th>
              <th>Convocatorias</th>
              <th>Importe</th>
              <th>% del dinero</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Concesión directa</td>
              <td>{reparto.directas.convocatorias}</td>
              <td>{formatEuros(reparto.directas.importe)}</td>
              <td>{formatPorcentaje(dineroDirectas, dineroTotal)}</td>
            </tr>
            <tr>
              <td>Concurrencia competitiva</td>
              <td>{reparto.competitivas.convocatorias}</td>
              <td>{formatEuros(reparto.competitivas.importe)}</td>
              <td>{formatPorcentaje(euros(reparto.competitivas), dineroTotal)}</td>
            </tr>
            <tr>
              <td>Sin clasificar</td>
              <td>{reparto.sinClasificar.convocatorias}</td>
              <td>{formatEuros(reparto.sinClasificar.importe)}</td>
              <td>{formatPorcentaje(euros(reparto.sinClasificar), dineroTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Las no clasificadas se anuncian en vez de esconderse. Meterlas en el
          saco de "hubo concurso" inflaría a la baja el dato que se mide. */}
      {reparto.sinClasificar.convocatorias > 0 && (
        <p className="legal-note">
          <strong>{reparto.sinClasificar.convocatorias} convocatorias sin clasificar.</strong> Su
          tipo, tal y como lo publica la BDNS, no encaja en ninguno de los dos regímenes
          conocidos. No se reparten entre los otros dos grupos: contarlas como si hubieran tenido
          concurso falsearía precisamente el dato que aquí se mide.
        </p>
      )}

      {/* Gancho: aviso legal + dato principal (texto, barra y tabla). El resto
          del informe se revela a petición para no empujar un muro de scroll. */}
      <VerRestoInforme>
        <h2 id="subv-concentra">Dónde se concentra</h2>
        <p>
          Concesiones directas del periodo agrupadas por administración, de mayor a menor
          importe.
          {porAdministracion.length > ORGANISMOS_VISIBLES && (
            <>
              {" "}
              Se muestran los {ORGANISMOS_VISIBLES} primeros de {porAdministracion.length}: a
              partir de ahí los importes son marginales y la lista deja de decir nada.
            </>
          )}
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Administración</th>
                <th>Organismo</th>
                <th>Convocatorias</th>
                <th>Importe</th>
              </tr>
            </thead>
            <tbody>
              {porAdministracion.slice(0, ORGANISMOS_VISIBLES).map((fila) => (
                <tr key={`${fila.nivel1}-${fila.nivel2 ?? "—"}`}>
                  <td>{NIVELES[fila.nivel1] ?? fila.nivel1}</td>
                  <td>{fila.nivel2 ?? "—"}</td>
                  <td>{fila.convocatorias}</td>
                  <td>{formatEuros(fila.importeTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {resto.organismos > 0 && (
          <p className="legal-note">
            Los otros {resto.organismos} organismos suman {formatEuros(String(resto.importe))} en{" "}
            {resto.convocatorias} convocatorias, un{" "}
            {formatPorcentaje(resto.importe, dineroDirectas)} del dinero concedido de forma
            directa. No se ocultan: se resumen aquí para que la tabla siga siendo legible.
          </p>
        )}

        <div id="subv-mayores" className="informe-ancla">
          <MayoresDirectas mayores={mayores} />
        </div>

        <h2 id="subv-fuentes">De dónde salen estos datos</h2>
        <p>
          De la <strong>Base de Datos Nacional de Subvenciones</strong> (BDNS), el registro
          público que centraliza las convocatorias de todas las administraciones españolas.
        </p>
        <p className="legal-note">
          <strong>Los datos de la BDNS se corrigen después de publicarse.</strong> Una
          convocatoria puede cambiar de importe o de tipo días más tarde, así que estas cifras
          reflejan lo publicado en el momento de la consulta, no una verdad definitiva. Periodo
          cargado: {formatDate(cobertura.desde)} a {formatDate(cobertura.hasta)},{" "}
          {cobertura.convocatorias} convocatorias. Ante cualquier duda, manda la ficha oficial
          enlazada en cada línea.
        </p>
        <p className="legal-note">
          <strong>Medimos presupuestos de convocatoria, no el destino final del euro.</strong> El
          dato principal, la tabla por administración y las mayores suman lo que publica cada
          convocatoria directa. No desglosamos público vs privado sobre adjudicaciones: con la
          cobertura actual de pagos individuales esa lectura empujaría conclusiones que los
          datos no sostienen (programas de miles de millones sin beneficiarios cargados en el
          periodo, o repartidos en miles de importes menores).
        </p>
      </VerRestoInforme>
    </>
  );
}
