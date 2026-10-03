import {
  CARGA_AMPLIADA,
  CESTA_AMPLIADA_MILLONES,
  CESTA_TOP20_PCT,
  DATOS_CLAVE,
  IVA_META,
  IVA_RESUMEN,
  RECAUDACION_2024,
} from "@/lib/fiesta-data";
import { FiestaCalculadora } from "./FiestaCalculadora";
import {
  FiestaAsalariados,
  FiestaCargaAmpliada,
  FiestaComparador,
  FiestaGrupos,
  FiestaHero,
  FiestaHuecoFiscal,
  FiestaIva,
  FiestaMixDonut,
  FiestaPerfiles,
  FiestaPoblacionRoles,
  FiestaPoblacionVsCuota,
  FiestaSaldoQuintiles,
} from "./FiestaGraficos";
import { FiestaBarraSinIva, FiestaModoProvider } from "./FiestaModoCalculo";
import { IndiceInforme } from "./IndiceInforme";
import { VerRestoInforme } from "./VerRestoInforme";

const INDICE_FIESTA = [
  { id: "fiesta-calc-title", label: "¿Dónde estás tú en la fiesta?" },
  { id: "fiesta-hero", label: "¿Quién paga la fiesta?" },
  { id: "fiesta-irpf-cuota", label: "Quién paga el IRPF (y capital + IVA)" },
  { id: "fiesta-poblacion", label: "Quién trabaja y quién recibe" },
  { id: "fiesta-hueco", label: "Lo que se escapa de la fiesta" },
  { id: "fiesta-pregunta", label: "La pregunta, sin rodeos" },
  { id: "fiesta-truco-irpf", label: "El truco de mirar solo el IRPF" },
  { id: "fiesta-carga", label: "Carga ampliada por tramos" },
  { id: "fiesta-caja", label: "De dónde sale el dinero" },
  { id: "fiesta-tres", label: "Pobres, medios y ricos" },
  { id: "fiesta-saldo", label: "Quién recibe más" },
  { id: "fiesta-perfiles", label: "Cuánto pone cada perfil" },
  { id: "fiesta-datos", label: "Seis datos que pegan" },
  { id: "fiesta-iva", label: "El contrapeso: el IVA" },
  { id: "fiesta-lectura", label: "Cómo leerlo sin trampa" },
] as const;

/**
 * Cuerpo de «¿Quién paga la fiesta?».
 *
 * Cesta de referencia en toda la página: IRPF trabajo + capital + Sociedades
 * (incidencia) + IVA por tramo. Los números viven en `fiesta-data.ts`.
 */
export function PanelFiesta() {
  return (
    <FiestaModoProvider>
    <div className="fiesta-page">
      <div className="legal-warning">
        <p>
          <strong>Radiografía divulgativa del reparto fiscal, no un asesor
          personal.</strong> Las cifras y la calculadora resumen órdenes de
          magnitud a partir de la Agencia Tributaria, FEDEA y notas oficiales.{" "}
          <strong>No predicen tu declaración</strong> ni el saldo de tu hogar:
          haz siempre tus propios cálculos (o consulta a un profesional) para
          cualquier decisión fiscal. La «cesta justa» (IRPF + capital +
          Sociedades + IVA) es un escenario orientativo de incidencia: el IS no
          sale en el D-100 de cada accionista, pero alguien lo soporta. En la
          calculadora personal, la <strong>cotización de la empresa</strong> se
          suma a la carga del puesto (cuña laboral), aunque no figure en tu
          neto de nómina.
        </p>
      </div>

      <IndiceInforme items={INDICE_FIESTA} />

      <FiestaCalculadora />

      {/* Hero: cesta justa del 20 % de arriba (60 % sin IVA ↔ 52 % con él). */}
      <div id="fiesta-hero" className="informe-ancla">
        <FiestaHero />
      </div>

      {/**
       * Interruptor del modo de cálculo. Va pegado al hero porque lo que
       * recalcula es la cifra de arriba (y, de paso, la calculadora): se
       * entra sin IVA (~60 %) y al meterlo el tramo alto baja a ~52 %.
       */}
      <FiestaBarraSinIva />

      {/* El gráfico del IVA por decil, pegado al toggle que lo activa. */}
      <FiestaIva />

      {/* ── Quién paga el IRPF (justo bajo el toggle IVA) ─────────── */}
      <div id="fiesta-irpf-cuota" className="informe-ancla">
        <h2>Quién paga el IRPF (y quién más si sumamos capital e IVA)</h2>
        <p>
          El dato que más se repite: el{" "}
          <strong className="disclaimer-highlight">
            10 % con más renta paga ~50 % de todo el IRPF
          </strong>
          ; el 1 % ronda el 18 %; la mitad de abajo, apenas un 8 %. Ojo al
          denominador: esos porcentajes son{" "}
          <strong>por declarantes</strong>, no por población —sobre los 48,6 M
          de habitantes, niños incluidos, el mismo tramo alto pone algo menos—.
          A la derecha del gráfico lo <strong>acotamos</strong> con capital,
          Sociedades y el contraste del IVA. En la cesta justa (con IVA), las{" "}
          <strong>rentas altas</strong> (deciles 9–10, desde ~50.000 €, ~20 % de
          la población) aportan ~{CESTA_TOP20_PCT.conIva} %; sin IVA serían ~
          {CESTA_TOP20_PCT.sinIva} %. Las rentas medias siguen siendo la columna
          del IRPF del trabajo y una buena parte del IVA; las bajas casi no
          entran en capital ni en sociedades, pero sí en el consumo.
        </p>

        <FiestaPoblacionVsCuota />
      </div>

      {/* Tras calculadora + hero + IRPF: el resto del informe a demanda. */}
      <VerRestoInforme>
      <div id="fiesta-poblacion" className="informe-ancla">
        <FiestaPoblacionRoles />
      </div>

      <div id="fiesta-hueco" className="informe-ancla">
        <FiestaHuecoFiscal />
      </div>

      {/* ── La pregunta ──────────────────────────────────────────── */}
      <h2 id="fiesta-pregunta">La pregunta, sin rodeos</h2>
      <p>
        Cada año la Agencia Tributaria recauda del orden de{" "}
        <strong className="disclaimer-highlight">
          {(RECAUDACION_2024.totalMillones / 1000).toLocaleString("es-ES", {
            maximumFractionDigits: 0,
          })}{" "}
          mil millones de euros
        </strong>
        . Esa es «la fiesta»: sanidad, pensiones, educación, defensa, deuda,
        funcionarios. La pregunta no es si hay que financiarlo, sino{" "}
        <strong>quién pone el dinero y por qué vías</strong>.
      </p>
      <p>
        Si solo miras el <strong>IRPF de las nóminas</strong>, la foto se
        tuerce: muchas rentas altas no se materializan como sueldo, sino como
        beneficio de sociedad, dividendos o ganancias de capital. Y si olvidas
        el <strong>IVA</strong>, infravaloras lo que pesan las rentas bajas y
        medias en el consumo. Para comparar hay que sumar trabajo, capital e
        IVA.
      </p>

      <FiestaComparador />

      {/* ── El truco de mirar solo el IRPF (plegado) ──────────────── */}
      <details id="fiesta-truco-irpf" className="fiesta-fold informe-ancla">
        <summary className="fiesta-fold-summary">
          <span className="fiesta-fold-summary-text">
            El truco de mirar solo el IRPF de la nómina
          </span>
          <span className="fiesta-fold-hint">Clic para leer</span>
        </summary>
        <div className="fiesta-fold-body">
          <p>
            Un asalariado ve el IRPF cada mes en el recibo. Un socio de una SL o
            un accionista ve otra secuencia: primero la empresa paga el{" "}
            <strong>Impuesto sobre Sociedades</strong> sobre el beneficio;
            después, si reparte, el socio paga IRPF por{" "}
            <strong>dividendos</strong> (base del ahorro); si vende con
            plusvalía, paga por <strong>ganancias patrimoniales</strong>. Puede
            parecer que «casi no tiene IRPF de trabajo» y, aun así, estar
            contribuyendo por capital. Además, todos pagan <strong>IVA</strong>{" "}
            en el carrito —más como % de renta abajo, más en euros arriba—.
          </p>
          <ul>
            <li>
              <strong>IRPF trabajo</strong> (~
              {CARGA_AMPLIADA.irpfTrabajoMillones.toLocaleString("es-ES")} M€):
              sueldos y actividades. Aquí la clase media pesa mucho.
            </li>
            <li>
              <strong>IRPF capital / ahorro</strong> (~
              {CARGA_AMPLIADA.irpfCapitalMillones.toLocaleString("es-ES")} M€):
              dividendos, intereses, ganancias. Muy concentrado arriba.
            </li>
            <li>
              <strong>Sociedades</strong> (~
              {RECAUDACION_2024.sociedadesMillones.toLocaleString("es-ES")} M€):
              beneficio empresarial. La incidencia económica cae sobre todo en
              dueños del capital (también muy concentrados).
            </li>
            <li>
              <strong>IVA</strong> (~
              {RECAUDACION_2024.ivaMillones.toLocaleString("es-ES")} M€):
              consumo. Más plano entre tramos en % de la caja; regresivo en % de
              la renta.
            </li>
          </ul>
          <p>
            Sumadas, esa cesta ronda los{" "}
            <strong className="disclaimer-highlight">
              {CESTA_AMPLIADA_MILLONES.toLocaleString("es-ES")} millones
            </strong>
            . No incluye cotizaciones de la Seguridad Social. Con IVA, el 20 % de
            arriba (desde ~50.000 €) aporta ~{CESTA_TOP20_PCT.conIva} %; sin IVA
            serían ~{CESTA_TOP20_PCT.sinIva} %. El consumo diluye un poco el peso
            del tramo alto, no lo invierte.
          </p>
        </div>
      </details>

      <div id="fiesta-carga" className="informe-ancla">
        <FiestaCargaAmpliada />
      </div>

      {/* ── De dónde sale ────────────────────────────────────────── */}
      <h2 id="fiesta-caja">De dónde sale el dinero (caja completa)</h2>
      <p>
        En {RECAUDACION_2024.periodo} el IRPF aportó cerca de{" "}
        <strong>
          {RECAUDACION_2024.irpfMillones.toLocaleString("es-ES")} millones
        </strong>{" "}
        (~
        {RECAUDACION_2024.irpfPctTotal.toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })}{" "}
        % de los ingresos). El IVA le sigue. El Impuesto sobre Sociedades (~
        {RECAUDACION_2024.sociedadesMillones.toLocaleString("es-ES")} M€) es
        menor en volumen que el IRPF, pero{" "}
        <strong>no es irrelevante ni «de las empresas en abstracto»</strong>:
        es la vía principal por la que tributa el beneficio del capital antes
        de llegar al bolsillo del socio.
      </p>

      <div className="pen-grid-2">
        <FiestaMixDonut />
        <FiestaAsalariados />
      </div>

      {/* ── Tres bloques ─────────────────────────────────────────── */}
      <h2 id="fiesta-tres">Pobres, medios y ricos: tres historias distintas</h2>
      <p>
        Abajo: poco IRPF, casi nada de capital, más IVA como % de la renta,
        saldo neto positivo con prestaciones. En el medio: la columna del IRPF
        del trabajo y del consumo. Arriba: IRPF alto,{" "}
        <strong>capital + sociedades</strong> y mucho IVA en euros (poco como %
        de renta). Comparar solo la casilla del sueldo es jugar con sesgo.
      </p>

      <FiestaGrupos />

      {/* ── Quién recibe ─────────────────────────────────────────── */}
      <h2 id="fiesta-saldo">Quién recibe más (el otro lado de la fiesta)</h2>
      <p>
        Pagar no es el final: el Estado devuelve pensiones, paro, sanidad,
        educación. El <strong>Observatorio de FEDEA</strong> calcula el saldo
        conjunto (prestaciones − impuestos) por quintiles. El 60 % de abajo es,
        de media, beneficiario neto; el 40 % de arriba financia el saldo.
      </p>
      <ul>
        <li>
          El <strong>60 % de hogares con menos renta</strong> recibe de media
          más de lo que paga.
        </li>
        <li>
          El <strong>40 % de arriba</strong> es contribuyente neto.
        </li>
        <li>
          En el quintil más pobre el subsidio neto puede superar el{" "}
          <strong>80 % de su renta bruta</strong>; en el más rico el impuesto
          neto ronda el 20 %.
        </li>
      </ul>

      <FiestaSaldoQuintiles />

      <div className="pen-callout">
        <p>
          <strong>Ojo con el matiz.</strong> «Beneficiario neto» incluye
          pensiones contributivas, sanidad y educación. «Contribuyente neto» no
          implica que no use lo público. Es contabilidad de flujos, no un juicio
          moral.
        </p>
      </div>

      {/* ── Perfiles ─────────────────────────────────────────────── */}
      <h2 id="fiesta-perfiles">Cuánto pone cada perfil (cesta completa)</h2>
      <p>
        Cuatro fotos fijas con la misma lógica de la cesta justa: IRPF,
        capital e IS si aplica, e <strong>IVA estimado</strong> del tramo. En
        rentas bajas el IVA es gran parte del total; en el perfil alto el total
        lo empujan capital y Sociedades, aunque el IVA en euros también sea
        mayor.
      </p>

      <FiestaPerfiles />

      {/* ── Datos que pegan ──────────────────────────────────────── */}
      <h2 id="fiesta-datos">Seis datos que pegan</h2>
      <ul className="pen-datos">
        {DATOS_CLAVE.map((d) => (
          <li key={d.id} className="pen-dato">
            <h3>{d.titulo}</h3>
            <p>{d.texto}</p>
          </li>
        ))}
      </ul>

      {/* ── IVA ──────────────────────────────────────────────────── */}
      <h2 id="fiesta-iva">El contrapeso: el IVA es otra fiesta</h2>
      <p>
        IRPF + capital + IS es la foto progresiva del lado renta/capital. El{" "}
        <strong>IVA</strong> (~
        {(RECAUDACION_2024.ivaMillones / 1000).toLocaleString("es-ES", {
          maximumFractionDigits: 0,
        })}{" "}
        mil M€) es otra: grava el <strong>consumo</strong>. El tipo legal es el
        mismo para todos (4 / 10 / 21 %), pero el{" "}
        <strong>peso sobre la renta no</strong>: quien menos gana gasta casi
        todo lo que entra y, por tanto, destina una fracción mayor de sus
        ingresos al IVA. Arriba se ahorra más —y el ahorro no paga IVA—. Por
        eso, al meterlo en la cesta justa, el top 20 % pasa de ~
        {CESTA_TOP20_PCT.sinIva} % a ~{CESTA_TOP20_PCT.conIva} %.
      </p>
      <p>
        Por eso hay que mirar dos métricas a la vez. En la pestaña{" "}
        <strong>% sobre la renta</strong> el impuesto es regresivo (decil 1 ≈{" "}
        {IVA_RESUMEN.decilMasPobre.ivaSobreRenta.toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })}{" "}
        % frente a ≈{" "}
        {IVA_RESUMEN.decilMasRico.ivaSobreRenta.toLocaleString("es-ES", {
          maximumFractionDigits: 1,
        })}{" "}
        % en el decil 10, del orden de ×{IVA_META.ratioRegresividad}). En{" "}
        <strong>parte del IVA total</strong> y <strong>euros al año</strong> el
        tramo alto pone más caja, porque consume más en absoluto. Las
        cotizaciones sociales son el tercer gran flujo (nómina): no entran en
        la caja AEAT de estos gráficos, pero en la calculadora de arriba sí se
        suman las del <strong>trabajador y las de la empresa</strong> a la
        carga del puesto. Un debate serio mira el{" "}
        <strong>sistema en conjunto</strong>.
      </p>

      <div className="pen-callout">
        <p>
          <strong>Cómo leer las pestañas.</strong> «% sobre la renta» responde
          a «¿cuánto me duele el IVA respecto a lo que gano?». «Parte del IVA
          total» responde a «¿quién llena la caja del IVA?». «Euros al año» es
          la factura embebida en precios. «Consumo vs ahorro» explica el
          mecanismo: si no gastas, no hay base de IVA.
        </p>
      </div>

      {/* ── Lectura final ────────────────────────────────────────── */}
      <h2 id="fiesta-lectura">Cómo leerlo sin trampa</h2>
      <ul className="pen-lectura">
        <li>
          <strong>No midas al tramo alto solo por el IRPF del trabajo.</strong>{" "}
          Dividendos, plusvalías, Sociedades e IVA forman parte de la factura
          real del sistema.
        </li>
        <li>
          <strong>La clase media sostiene el IRPF de las nóminas</strong> (franja
          ~20–50 mil en retenciones) y una buena parte del IVA. Eso es verdad y
          compatible con que el capital esté arriba.
        </li>
        <li>
          <strong>
            El 20 % de arriba carga ~{CESTA_TOP20_PCT.conIva} % del total
            (con IVA)
          </strong>
          ; sin IVA serían ~{CESTA_TOP20_PCT.sinIva} %. El 40 % de abajo casi
          no entra en capital y poco en IRPF, pero sí en consumo.
        </li>
        <li>
          <strong>El IVA invierte el relato del esfuerzo:</strong> pesa más
          sobre la renta abajo (~×{IVA_META.ratioRegresividad} D1 vs D10),
          aunque en euros el tramo alto ponga más del total.
        </li>
        <li>
          <strong>Quien menos tiene recibe más en saldo neto</strong> cuando se
          suman prestaciones. Es el Estado del bienestar, no un fallo contable.
        </li>
        <li>
          <strong>Tu caso no es el decil.</strong> Autónomo, rentista,
          pensionista o familia numerosa pueden estar en el mismo tramo con
          saldos muy distintos.
        </li>
      </ul>

      <p className="legal-note">
        Fuentes principales: Agencia Tributaria (recaudación 2024; Estadística
        de declarantes del IRPF; retenciones del trabajo), FEDEA — Observatorio
        impuestos y prestaciones (2022/2025), patrones de incidencia del IVA
        tipo INE (presupuesto familiar) / IEF. La partición IRPF trabajo vs
        capital (~85/15), la atribución del Impuesto sobre Sociedades a tramos
        de población, el reparto del IVA por decil, los perfiles individuales y
        la calculadora son <em>escenarios orientativos</em> para la lectura
        gráfica, no extractos de un único cuadro oficial de incidencia ni
        asesoramiento fiscal. Actualización editorial: agosto de 2026 (AEAT 2025).
      </p>
      </VerRestoInforme>
    </div>
    </FiestaModoProvider>
  );
}
