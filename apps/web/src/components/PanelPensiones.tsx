import {
  ANUAL_2025,
  FLUJO_SISTEMA,
  GASTO_ANUAL,
  INSTANTANEA,
  PROYECCION_PIB,
  REGLAS_JUBILACION,
  formatEdadAniosMeses,
} from "@/lib/pensiones-data";
import {
  EdadPensionesInput,
  EdadPensionesProvider,
  HitosDemograficosConEdad,
} from "./EdadPensiones";
import { IndiceInforme } from "./IndiceInforme";
import {
  PensionesBalance,
  PensionesBrecha,
  PensionesContadorCierre,
  PensionesDatosGraficos,
  PensionesDonut,
  PensionesGastoBarras,
  PensionesGastoComparado,
  PensionesHero,
  PensionesKpis,
  PensionesMediasBarras,
  PensionesPesoFiscal,
  PensionesProyeccion,
  PensionesRatio,
} from "./PensionesGraficos";
import { VerRestoInforme } from "./VerRestoInforme";

const INDICE_PENSIONES = [
  { id: "pen-edad-title", label: "¿Qué edad tienes?" },
  { id: "pen-hero", label: "El tamaño real del sistema" },
  { id: "pen-escala", label: "Al lado del resto del gasto" },
  { id: "pen-peso", label: "Qué parte de los impuestos va a pensiones" },
  { id: "pen-como", label: "Cómo funciona" },
  { id: "pen-tamano", label: "El tamaño del sistema hoy" },
  { id: "pen-nomina", label: "De qué se compone la nómina" },
  { id: "pen-factura", label: "Cómo ha crecido la factura" },
  { id: "pen-sostenibilidad", label: "Sostenibilidad" },
  { id: "pen-proyeccion", label: "Proyección hasta 2050" },
  { id: "pen-seis", label: "Seis datos que merecen un vistazo" },
  { id: "pen-lectura", label: "Cómo leer todo esto sin marearse" },
] as const;

/**
 * Cuerpo de la sección de pensiones.
 *
 * Está pensada como una pieza de lectura con gráficos intercalados: primero
 * el mapa del sistema, luego el tamaño actual, el reparto, la sostenibilidad
 * y la proyección. Los componentes de cliente solo animan; los números viven
 * en `pensiones-data.ts` para que se puedan actualizar sin reescribir el
 * relato.
 */
export function PanelPensiones() {
  return (
    <EdadPensionesProvider>
    <div className="pensiones-page">
      <div className="legal-warning">
        <p>
          <strong>Radiografía divulgativa, no un simulador personal.</strong> Las
          cifras resumen el sistema público de pensiones contributivas de la
          Seguridad Social a partir de fuentes oficiales (nóminas mensuales,
          AIReF, proyecciones del Ministerio).{" "}
          <strong>No predicen la pensión de nadie</strong> ni sustituyen al
          informe de vida laboral o a un asesoramiento individual. Los
          redondeos son a propósito: lo que importa es el orden de magnitud y la
          tendencia.
        </p>
      </div>

      <IndiceInforme items={INDICE_PENSIONES} />

      {/* Edad al principio: alimenta las etiquetas «tú tendrás X» en
          gráficas e hitos con años de calendario. */}
      <EdadPensionesInput />

      {/* ── Portada: el dato más impactante ───────────────────────── */}
      <div id="pen-hero" className="informe-ancla">
        <PensionesHero />
      </div>

      {/* ── Segundo: el tamaño puesto al lado de otras partidas ───── */}
      <div id="pen-escala" className="informe-ancla">
        <PensionesGastoComparado />
      </div>

      {/* ── % del esfuerzo fiscal + comparación ─────────────────────── */}
      <div id="pen-peso" className="informe-ancla">
        <PensionesPesoFiscal />
      </div>

      {/* Tras hero + peso fiscal: el resto del informe a demanda. */}
      <VerRestoInforme>
      {/* ── Cómo funciona (compacto, mismo formato que las reglas) ── */}
      <h2 id="pen-como">Cómo funciona</h2>
      <p>
        España usa un sistema de <strong>reparto</strong> (
        <em>pay-as-you-go</em>): las cotizaciones de quien trabaja pagan las
        pensiones de quien ya tiene derecho. No hay hucha individual; hay caja
        común y reglas de acceso.
      </p>

      <div className="pen-reglas pen-reglas-2" aria-label="Flujo del sistema de reparto">
        {FLUJO_SISTEMA.map((paso) => (
          <div key={paso.id}>
            <span className="pen-reglas-k">{paso.titulo}</span>
            <span className="pen-reglas-v" style={{ color: paso.color }}>
              {paso.detalle}
            </span>
          </div>
        ))}
      </div>

      <div className="pen-reglas" aria-label="Reglas básicas de jubilación">
        <div>
          <span className="pen-reglas-k">Edad ordinaria</span>
          <span className="pen-reglas-v">
            {formatEdadAniosMeses(REGLAS_JUBILACION.edadOrdinaria)}
            <small> ({REGLAS_JUBILACION.edadPlena} años en 2027)</small>
          </span>
        </div>
        <div>
          <span className="pen-reglas-k">Carrera para librarse de la espera</span>
          <span className="pen-reglas-v">
            {formatEdadAniosMeses(REGLAS_JUBILACION.aniosCotizacionPlena)}
            <small> cotizados · jubilación a los 65</small>
          </span>
        </div>
        <div>
          <span className="pen-reglas-k">Base de cálculo</span>
          <span className="pen-reglas-v">
            Últimos {REGLAS_JUBILACION.periodoCalculoAnios} años
          </span>
        </div>
        <div>
          <span className="pen-reglas-k">Pagas al año</span>
          <span className="pen-reglas-v">{REGLAS_JUBILACION.pagasAnuales}</span>
        </div>
      </div>

      {/* ── Tamaño actual ─────────────────────────────────────────── */}
      <h2 id="pen-tamano">El tamaño del sistema hoy</h2>
      <p>
        En {INSTANTANEA.periodo.toLowerCase()} la Seguridad Social pagaba del
        orden de{" "}
        <strong className="disclaimer-highlight">
          {(INSTANTANEA.pensiones / 1_000_000).toLocaleString("es-ES", {
            maximumFractionDigits: 1,
          })}{" "}
          millones de pensiones
        </strong>{" "}
        a unos{" "}
        {(INSTANTANEA.pensionistas / 1_000_000).toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })}{" "}
        millones de personas. La nómina de un solo mes superó los{" "}
        <strong>
          {INSTANTANEA.nominaMensualMillones.toLocaleString("es-ES", {
            maximumFractionDigits: 0,
          })}{" "}
          millones de euros
        </strong>
        . En 2025 el gasto contributivo del año completo rozó los{" "}
        {(ANUAL_2025.gastoContributivoMillones / 1000).toLocaleString("es-ES", {
          maximumFractionDigits: 0,
        })}{" "}
        mil millones.
      </p>

      <PensionesKpis />

      <PensionesBalance />

      {/* ── De qué se compone ─────────────────────────────────────── */}
      <h2 id="pen-nomina">De qué se compone la nómina</h2>
      <p>
        No todo es jubilación. El sistema también cubre viudedad, incapacidad
        permanente, orfandad y prestaciones en favor de familiares. Cambiar de
        “dinero” a “número” en el gráfico muestra dos historias distintas: la
        jubilación domina el gasto; otras clases son muchas en recuento pero
        más pequeñas en importe.
      </p>

      <div className="pen-grid-2">
        <PensionesDonut />
        <PensionesMediasBarras />
      </div>

      <PensionesBrecha />

      {/* ── Evolución reciente ────────────────────────────────────── */}
      <h2 id="pen-factura">Cómo ha crecido la factura</h2>
      <p>
        Tres fuerzas empujan el gasto al alza cada año:{" "}
        <strong>más pensionistas</strong> (demografía),{" "}
        <strong>pensiones nuevas más altas</strong> que las que salen del
        sistema (efecto sustitución) y la{" "}
        <strong>revalorización con el IPC</strong>. El resultado es una curva
        que en {GASTO_ANUAL[GASTO_ANUAL.length - 1]!.anio - GASTO_ANUAL[0]!.anio}{" "}
        años ha pasado de ~
        {(GASTO_ANUAL[0]!.millones / 1000).toLocaleString("es-ES", {
          maximumFractionDigits: 0,
        })}{" "}
        a ~
        {(
          GASTO_ANUAL[GASTO_ANUAL.length - 1]!.millones / 1000
        ).toLocaleString("es-ES", { maximumFractionDigits: 1 })}{" "}
        mil millones de euros en pensiones contributivas.
      </p>

      <PensionesGastoBarras />

      {/* ── Sostenibilidad ────────────────────────────────────────── */}
      <h2 id="pen-sostenibilidad">Sostenibilidad: la pregunta de fondo</h2>
      <p>
        Un sistema de reparto es sostenible mientras la economía y el empleo
        generen cotizaciones (y, si hace falta, transferencias del Estado)
        suficientes para pagar las reglas prometidas. La tensión no es un fallo
        contable de un mes: es demográfica. España envejece, el baby boom se
        jubila y el ratio cotizantes/pensionistas ya no es el de hace cuarenta
        años.
      </p>

      <PensionesRatio />

      <HitosDemograficosConEdad />

      {/* ── Proyección ────────────────────────────────────────────── */}
      <h2 id="pen-proyeccion">Proyección hasta 2050 (y más allá)</h2>
      <p>
        Nadie conoce el PIB de 2050. Lo que sí hay son modelos con hipótesis
        explícitas. La <strong>AIReF</strong> situó el gasto en pensiones en el{" "}
        <strong className="disclaimer-highlight">
          {PROYECCION_PIB.airef.find((p) => p.anio === 2050)?.pct.toLocaleString("es-ES", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          })}{" "}
          % del PIB en 2050
        </strong>{" "}
        (desde ~12,9 % en 2023). El <strong>Ministerio</strong>, con su
        herramienta INTegraSS, proyecta un pico algo menor:{" "}
        <strong>
          {PROYECCION_PIB.ministerio
            .find((p) => p.anio === 2050)
            ?.pct.toLocaleString("es-ES", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
          %
        </strong>
        . La diferencia es enorme en euros, pero ambas curvas cuentan lo mismo:
        la cresta llega hacia mitad de siglo y después la presión demográfica
        afloja.
      </p>

      <PensionesProyeccion />

      <div className="pen-callout">
        <p>
          <strong>¿Y eso es mucho?</strong> Un punto de PIB son del orden de
          15–18 mil millones de euros al año (según el PIB nominal). Pasar del
          13 % al 16 % no es un detalle: es el debate de si se cubre con más
          cotizaciones, más impuestos, menos revalorización, más edad
          efectiva de jubilación, más empleo… o una mezcla. Las reformas
          recientes (revalorización con IPC, MEI, incentivos a demorar la
          jubilación, ampliación de bases) mueven esas palancas; no las
          eliminan.
        </p>
      </div>

      {/* ── Datos que importan (ahora en gráficos) ───────────────── */}
      <h2 id="pen-seis">Seis datos que merecen un vistazo</h2>
      <p>
        Los mismos golpes de efecto de siempre, pero en forma de gráfico. Varios
        son interactivos: cambia la medida, pasa el cursor o pulsa un año.
      </p>
      <PensionesDatosGraficos />

      {/* ── Lectura final ─────────────────────────────────────────── */}
      <h2 id="pen-lectura">Cómo leer todo esto sin marearse</h2>
      <ul className="pen-lectura">
        <li>
          <strong>El sistema es grande y crece en euros</strong> porque hay más
          personas con derecho y pensiones medias más altas. Eso no es, por sí
          solo, una quiebra: es el diseño de un seguro social maduro.
        </li>
        <li>
          <strong>La sostenibilidad se mide en % del PIB y en empleo</strong>,
          no solo en el saldo de un mes. Un país que crece y ocupa puede
          absorber más gasto; uno que envejece sin productividad lo sufre.
        </li>
        <li>
          <strong>Las proyecciones no son destino.</strong> Cambian con la
          inmigración, la tasa de empleo, la productividad y las reglas
          legales. Por eso AIReF y el Ministerio no coinciden al céntimo y
          ambos publican escenarios.
        </li>
        <li>
          <strong>Tu pensión futura no es la media.</strong> Depende de tu base
          de cotización, los años cotizados y la edad de acceso. Esta página
          mira el bosque; el árbol es tu vida laboral.
        </li>
      </ul>

      <p className="legal-note">
        Fuentes principales: notas de la Seguridad Social y del Ministerio de
        Inclusión (nómina y cierre 2025), AIReF (informe sobre la regla de gasto
        en pensiones y opinión de sostenibilidad, 2025), proyecciones
        INTegraSS del Ministerio, agregaciones de EpData. Las series largas de
        ratio y algunos tramos de la curva de proyección son
        <em> orientativos</em> para la lectura gráfica. Actualización editorial
        de los datos: agosto de 2026.
      </p>
      </VerRestoInforme>

      {/* Cierre: el contador del hero otra vez, sincronizado y en grande.
          Fuera del desplegable para que sea lo último se lea o no el resto. */}
      <PensionesContadorCierre />
    </div>
    </EdadPensionesProvider>
  );
}
