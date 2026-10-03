"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { estimarCargaFiscal, type ResultadoCalculadora } from "@/lib/fiesta-calc";
import {
  PAISES_FISCALES,
  PAIS_POR_DEFECTO,
  type MonedaPais,
  type OpcionesActivas,
  type PaisFiscal,
  convertirMoneda,
  ejemplosDePais,
  fmtMoneda,
  getPais,
} from "@/lib/paises-fiscal";
import { ShareDato } from "./ShareDato";

function fmtPct(n: number, digitos = 1): string {
  return `${n.toLocaleString("es-ES", {
    minimumFractionDigits: digitos,
    maximumFractionDigits: digitos,
  })} %`;
}

function parseRenta(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

const ID_SS_EMPRESA = "ss-empresa";
const ID_IVA = "iva";

function esSsEmpresa(id: string): boolean {
  return id === ID_SS_EMPRESA;
}

function esIva(id: string): boolean {
  return id === ID_IVA;
}

/** Recaudación del país en «mil M» de su moneda, para el KPI del decil. */
function fmtRecaudacion(millones: number, moneda: MonedaPais): string {
  return `${(millones / 1000).toLocaleString("es-ES", {
    maximumFractionDigits: 0,
  })} mil M${moneda.simbolo}`;
}

/**
 * Percentil redondeado y recortado a 1–99: con rentas muy altas la
 * interpolación llega a 100 y «cobras más que el 100 % del país» es
 * imposible (nadie se supera a sí mismo); con las más bajas caería a 0.
 */
function percentilLegible(percentil: number): number {
  return Math.min(99, Math.max(1, Math.round(percentil)));
}

/**
 * Desplegable de país. Es un listbox de verdad (no un `select` nativo)
 * porque la bandera y el nombre tienen que verse a la vez en el botón,
 * pero conserva el teclado: flechas para moverse, Enter para elegir,
 * Escape para cerrar.
 */
function SelectorPais({
  valor,
  onCambio,
  etiqueta,
  compacto = false,
}: {
  valor: string;
  onCambio: (id: string) => void;
  etiqueta: string;
  compacto?: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(() =>
    Math.max(0, PAISES_FISCALES.findIndex((p) => p.id === valor)),
  );
  const cajaRef = useRef<HTMLDivElement>(null);
  const listaId = useId();
  const pais = getPais(valor);

  useEffect(() => {
    if (!abierto) return;

    const fuera = (e: MouseEvent) => {
      if (cajaRef.current && !cajaRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  const abrir = () => {
    setActivo(Math.max(0, PAISES_FISCALES.findIndex((p) => p.id === valor)));
    setAbierto(true);
  };

  const elegir = (id: string) => {
    onCambio(id);
    setAbierto(false);
  };

  const teclado = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setAbierto(false);
      return;
    }
    if (!abierto && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      abrir();
      return;
    }
    if (!abierto) return;

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const paso = e.key === "ArrowDown" ? 1 : -1;
      setActivo(
        (i) => (i + paso + PAISES_FISCALES.length) % PAISES_FISCALES.length,
      );
    } else if (e.key === "Home") {
      e.preventDefault();
      setActivo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActivo(PAISES_FISCALES.length - 1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      elegir(PAISES_FISCALES[activo]!.id);
    }
  };

  return (
    <div
      className={`fiesta-pais${compacto ? " es-compacto" : ""}`}
      ref={cajaRef}
      onKeyDown={teclado}
    >
      <button
        type="button"
        className="fiesta-pais-boton"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={abierto ? listaId : undefined}
        aria-label={`${etiqueta}: ${pais.nombre}`}
        onClick={() => (abierto ? setAbierto(false) : abrir())}
      >
        <span className="fiesta-pais-bandera" aria-hidden="true">
          {pais.bandera}
        </span>
        <span className="fiesta-pais-nombre">
          {compacto ? pais.nombreCorto : pais.nombre}
        </span>
        <span className="fiesta-pais-flecha" aria-hidden="true">
          ▾
        </span>
      </button>

      {abierto && (
        <ul className="fiesta-pais-lista" role="listbox" id={listaId} aria-label={etiqueta}>
          {PAISES_FISCALES.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                role="option"
                aria-selected={p.id === valor}
                className={`fiesta-pais-opcion${p.id === valor ? " es-activa" : ""}${
                  i === activo ? " es-marcada" : ""
                }`}
                onMouseEnter={() => setActivo(i)}
                onClick={() => elegir(p.id)}
              >
                <span className="fiesta-pais-bandera" aria-hidden="true">
                  {p.bandera}
                </span>
                <span className="fiesta-pais-nombre">{p.nombre}</span>
                <span className="fiesta-pais-moneda">{p.moneda.codigo}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Ticks de las ventajas fiscales del país. Solo aparecen si el país declara
 * alguna: no todos los sistemas tienen una figura de este tipo modelada, y un
 * tick que no hace nada es peor que ningún tick.
 *
 * Van con la nota debajo porque la mitad del valor está en entender POR QUÉ
 * baja la factura. Sin eso, el usuario ve saltar un número y no aprende nada.
 */
function TicksPais({
  pais,
  opciones,
  onCambio,
  compacto = false,
}: {
  pais: PaisFiscal;
  opciones: OpcionesActivas;
  onCambio: (o: OpcionesActivas) => void;
  compacto?: boolean;
}) {
  const id = useId();
  if (!pais.opciones?.length) return null;

  return (
    <fieldset className={`fiesta-ticks${compacto ? " es-compacto" : ""}`}>
      <legend className="fiesta-ticks-legend">
        <span aria-hidden="true">{pais.bandera}</span> Situación personal ·{" "}
        {pais.nombreCorto}
      </legend>
      {pais.opciones.map((o) => (
        <label key={o.id} className="fiesta-tick" htmlFor={`${id}-${o.id}`}>
          <input
            id={`${id}-${o.id}`}
            type="checkbox"
            checked={opciones[o.id] === true}
            onChange={(e) => onCambio({ ...opciones, [o.id]: e.target.checked })}
          />
          <span className="fiesta-tick-texto">
            <span className="fiesta-tick-k">{o.etiqueta}</span>
            <span className="fiesta-tick-n">{o.nota}</span>
          </span>
        </label>
      ))}
    </fieldset>
  );
}

/** Lo que se compara de cada país, ya reducido a cifras sueltas. */
type FilaComparada = {
  r: ResultadoCalculadora;
  pctSinIva: number;
  pctConIva: number;
  /** Lo que se va en consumo desde el neto: IVA, especiales y otros. */
  consumo: number;
  /** Lo que queda después de TODO, en dinero y en % del coste del puesto. */
  restoFinal: number;
  restoPctCoste: number;
};

function comparar(
  renta: number,
  paisId: string,
  opciones?: OpcionesActivas,
): FilaComparada | null {
  const r = estimarCargaFiscal(renta, paisId, opciones);
  if (!r) return null;

  const totalSinIva = r.conceptos
    .filter((c) => !esIva(c.id))
    .reduce((s, c) => s + c.euros, 0);

  // Lo que sale del neto al gastarlo: IVA, especiales y tasas. El neto de
  // nómina no es lo que te queda —solo lo que te ingresan— y comparar países
  // por el neto premia a los que cargan el peso en el consumo.
  const consumo = r.conceptos
    .filter((c) => c.id === "iva" || c.id === "especiales" || c.id === "otros")
    .reduce((s, c) => s + c.euros, 0);
  const restoFinal = Math.max(0, r.costeLaboralTotal - r.totalImpuestos);

  return {
    r,
    // Misma base que en la ficha de un solo país: el coste laboral entero,
    // que es la única lectura comparable entre sistemas distintos.
    pctSinIva: (totalSinIva / r.costeLaboralTotal) * 100,
    pctConIva: (r.totalImpuestos / r.costeLaboralTotal) * 100,
    consumo,
    restoFinal,
    restoPctCoste: (restoFinal / r.costeLaboralTotal) * 100,
  };
}

/**
 * Ventana de comparación entre dos países. El importe se teclea en la
 * moneda del país de la izquierda y se pasa al de la derecha al cambio
 * nominal: no es paridad de poder adquisitivo, y así se dice en pantalla.
 */
function ComparadorPaises({
  paisInicial,
  rentaInicial,
  onCerrar,
}: {
  paisInicial: string;
  rentaInicial: number | null;
  onCerrar: () => void;
}) {
  const [idA, setIdA] = useState(paisInicial);
  const [idB, setIdB] = useState(paisInicial === "es" ? "de" : "es");
  // Un juego de ticks por país: la situación personal es la misma persona, pero
  // cada sistema tiene sus propias figuras y no se pueden compartir.
  const [opcA, setOpcA] = useState<OpcionesActivas>({});
  const [opcB, setOpcB] = useState<OpcionesActivas>({});
  const paisA = getPais(idA);
  const paisB = getPais(idB);

  const [raw, setRaw] = useState(() =>
    String(rentaInicial ?? ejemplosDePais(getPais(paisInicial))[2]!.valor),
  );
  const rentaA = useMemo(() => parseRenta(raw), [raw]);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cerrarRef.current?.focus();
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  /** Al cambiar de país se conserva el sueldo real: se convierte la cifra. */
  const cambiarA = (id: string) => {
    const nuevo = getPais(id);
    if (rentaA != null && nuevo.moneda.codigo !== paisA.moneda.codigo) {
      const convertido = convertirMoneda(rentaA, paisA.moneda, nuevo.moneda);
      setRaw(String(Math.round(convertido / 100) * 100));
    }
    setOpcA({});
    setIdA(id);
  };

  const cambiarB = (id: string) => {
    setOpcB({});
    setIdB(id);
  };

  const rentaB =
    rentaA == null ? null : convertirMoneda(rentaA, paisA.moneda, paisB.moneda);

  const a = rentaA == null ? null : comparar(rentaA, idA, opcA);
  const b = rentaB == null ? null : comparar(rentaB, idB, opcB);

  const conceptos = a?.r.conceptos ?? [];

  return (
    <div
      className="notify-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar();
      }}
    >
      <div
        className="notify-dialog fiesta-comp-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fiesta-comp-title"
      >
        <button
          type="button"
          className="notify-close"
          aria-label="Cerrar la comparación"
          ref={cerrarRef}
          onClick={onCerrar}
        >
          ×
        </button>
        <h2 id="fiesta-comp-title" className="notify-title">
          Comparar dos países
        </h2>
        <p className="notify-subtitle">
          El mismo sueldo, los dos sistemas al lado. Se teclea en la moneda del
          país de la izquierda y se convierte al cambio nominal.
        </p>

        <div className="fiesta-comp-form">
          <div className="fiesta-comp-form-campo">
            <span className="fiesta-calc-label">Bruto anual</span>
            <div className="fiesta-calc-input-row">
              <input
                className="fiesta-calc-input"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                aria-label={`Renta bruta anual en ${paisA.moneda.codigo}`}
              />
              <span className="fiesta-calc-suffix" aria-hidden="true">
                {paisA.moneda.simbolo} / año
              </span>
            </div>
          </div>
          <div className="fiesta-comp-form-paises">
            <div className="fiesta-comp-form-campo">
              <span className="fiesta-calc-label">País A</span>
              <SelectorPais valor={idA} onCambio={cambiarA} etiqueta="País A" compacto />
            </div>
            <span className="fiesta-comp-vs" aria-hidden="true">
              vs
            </span>
            <div className="fiesta-comp-form-campo">
              <span className="fiesta-calc-label">País B</span>
              <SelectorPais valor={idB} onCambio={cambiarB} etiqueta="País B" compacto />
            </div>
          </div>
        </div>

        {(paisA.opciones?.length || paisB.opciones?.length) && (
          <div className="fiesta-comp-ticks">
            <TicksPais pais={paisA} opciones={opcA} onCambio={setOpcA} compacto />
            <TicksPais pais={paisB} opciones={opcB} onCambio={setOpcB} compacto />
          </div>
        )}

        {a == null || b == null ? (
          <p className="fiesta-calc-error">
            Introduce un importe válido mayor que cero.
          </p>
        ) : (
          <>
            <div className="fiesta-comp-cabecera">
              {[a, b].map((f, i) => (
                <div key={f.r.pais.id + i} className="fiesta-comp-col">
                  <span className="fiesta-comp-col-pais">
                    <span aria-hidden="true">{f.r.pais.bandera}</span>{" "}
                    {f.r.pais.nombre}
                  </span>
                  <strong className="fiesta-comp-col-bruto">
                    {fmtMoneda(f.r.renta, f.r.pais.moneda)}
                  </strong>
                  <span className="fiesta-comp-col-eq">
                    {f.r.pais.moneda.codigo === "EUR"
                      ? "bruto anual"
                      : `≈ ${fmtMoneda(f.r.renta / f.r.pais.moneda.porEuro, { codigo: "EUR", simbolo: "€", porEuro: 1 })} al cambio`}
                  </span>
                </div>
              ))}
            </div>

            {/* Titular: de cada 100 del coste del puesto, cuánto queda al
                final de TODO el recorrido.
                
                Antes ponía el neto de nómina, y era una comparación tramposa
                sin querer: el neto solo mide lo que te ingresan, y un país que
                cobra poco en la nómina y mucho en el consumo salía ganando.
                Restando también IVA, especiales y tasas, los dos sistemas se
                miden por lo mismo. El neto sigue debajo, que también interesa.
                
                La bandera va dentro de cada caja porque estas dos cifras son
                lo primero que se mira, y a esa altura la cabecera con los
                países ya se ha perdido de vista. */}
            <div className="fiesta-comp-titular">
              {[a, b].map((f, i) => {
                const gana = f.restoPctCoste >= (i === 0 ? b : a).restoPctCoste;
                return (
                  <div
                    key={f.r.pais.id + i}
                    className={`fiesta-comp-titular-caja${gana ? " es-mejor" : ""}`}
                  >
                    <span className="fiesta-comp-titular-pais">
                      <span className="fiesta-comp-titular-bandera" aria-hidden="true">
                        {f.r.pais.bandera}
                      </span>
                      {f.r.pais.nombreCorto}
                    </span>
                    <span className="fiesta-comp-titular-v">
                      {fmtPct(f.restoPctCoste)}
                    </span>
                    <span className="fiesta-comp-titular-n">
                      del coste del puesto te queda al final
                    </span>
                    <span className="fiesta-comp-titular-eur">
                      {fmtMoneda(f.restoFinal, f.r.pais.moneda)} de{" "}
                      {fmtMoneda(f.r.costeLaboralTotal, f.r.pais.moneda)}
                    </span>
                    <span className="fiesta-comp-titular-desglose">
                      {fmtMoneda(f.r.rentaNetaAprox, f.r.pais.moneda)} netos de
                      nómina menos {fmtMoneda(f.consumo, f.r.pais.moneda)} de
                      IVA, especiales y tasas
                    </span>
                  </div>
                );
              })}
            </div>

            <table className="fiesta-comp-tabla">
              <caption className="fiesta-comp-caption">
                Todo en % sobre la misma base de cada país; el coste laboral es
                bruto + cotización de la empresa.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Concepto</th>
                  <th scope="col">
                    <span aria-hidden="true">{paisA.bandera}</span>{" "}
                    {paisA.nombreCorto}
                  </th>
                  <th scope="col">
                    <span aria-hidden="true">{paisB.bandera}</span>{" "}
                    {paisB.nombreCorto}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="fiesta-comp-fila-fuerte">
                  <th scope="row">Carga sobre el coste laboral · sin consumo</th>
                  <td>{fmtPct(a.pctSinIva)}</td>
                  <td>{fmtPct(b.pctSinIva)}</td>
                </tr>
                <tr className="fiesta-comp-fila-fuerte">
                  <th scope="row">Carga con el impuesto sobre el consumo</th>
                  <td>{fmtPct(a.pctConIva)}</td>
                  <td>{fmtPct(b.pctConIva)}</td>
                </tr>
                <tr>
                  <th scope="row">Coste del puesto para la empresa</th>
                  <td>{fmtMoneda(a.r.costeLaboralTotal, paisA.moneda)}</td>
                  <td>{fmtMoneda(b.r.costeLaboralTotal, paisB.moneda)}</td>
                </tr>
                <tr>
                  <th scope="row">Neto de nómina</th>
                  <td>{fmtMoneda(a.r.rentaNetaAprox, paisA.moneda)}</td>
                  <td>{fmtMoneda(b.r.rentaNetaAprox, paisB.moneda)}</td>
                </tr>
                <tr>
                  <th scope="row">Menos consumo (IVA, especiales, tasas)</th>
                  <td>−{fmtMoneda(a.consumo, paisA.moneda)}</td>
                  <td>−{fmtMoneda(b.consumo, paisB.moneda)}</td>
                </tr>
                <tr className="fiesta-comp-fila-fuerte">
                  <th scope="row">Te queda al final</th>
                  <td>{fmtMoneda(a.restoFinal, paisA.moneda)}</td>
                  <td>{fmtMoneda(b.restoFinal, paisB.moneda)}</td>
                </tr>
                {conceptos.map((c, i) => (
                  <tr key={c.id}>
                    <th scope="row">
                      {c.id === "irpf"
                        ? "Impuesto sobre la renta"
                        : c.id === ID_IVA
                          ? "Impuesto sobre el consumo"
                          : c.nombre}
                    </th>
                    <td>
                      {fmtPct(a.r.conceptos[i]!.pctRenta)}
                      <em>{fmtMoneda(a.r.conceptos[i]!.euros, paisA.moneda)}</em>
                    </td>
                    <td>
                      {fmtPct(b.r.conceptos[i]!.pctRenta)}
                      <em>{fmtMoneda(b.r.conceptos[i]!.euros, paisB.moneda)}</em>
                    </td>
                  </tr>
                ))}
                <tr className="fiesta-comp-fila-ipc">
                  <th scope="row">
                    Inflación {a.r.pais.inflacion.anio} (aparte, no es impuesto)
                  </th>
                  <td>+{fmtPct(a.r.pais.inflacion.pct)}</td>
                  <td>+{fmtPct(b.r.pais.inflacion.pct)}</td>
                </tr>
              </tbody>
            </table>

            <div className="fiesta-comp-avisos">
              <p>
                <strong>Conversión al cambio, no por poder adquisitivo.</strong>{" "}
                {fmtMoneda(a.r.renta, paisA.moneda)} y{" "}
                {fmtMoneda(b.r.renta, paisB.moneda)} son la misma cantidad de
                dinero, no la misma vida: el alquiler, la sanidad y la guardería
                no cuestan lo mismo en los dos sitios, y eso aquí no sale.
              </p>
              {[a.r.pais, b.r.pais].map((p) => (
                <p key={p.id} className="fiesta-comp-aviso-pais">
                  <strong>
                    <span aria-hidden="true">{p.bandera}</span> {p.nombreCorto}:
                  </strong>{" "}
                  {p.notas[0]}
                </p>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Resultado({ r }: { r: ResultadoCalculadora }) {
  /**
   * Solo la cotización de la empresa es opcional vía tick. El IVA no depende
   * aquí de la barra global «sin tener en cuenta el IVA»: esta sección enseña
   * a la vez la carga sin IVA y con IVA, para leerla de una sola pasada.
   */
  const [incluirSsEmpresa, setIncluirSsEmpresa] = useState(true);

  /** Todo el bloque se pinta en la moneda del país elegido. */
  const dinero = (n: number) => fmtMoneda(n, r.pais.moneda);
  const inflacion = r.pais.inflacion;
  /** «+2,7 %» del IPC: se lee pegado al %, pero nunca suma dentro del total. */
  const ipcSumando = `+${fmtPct(inflacion.pct)}`;

  const vista = useMemo(() => {
    const conceptosActivos = r.conceptos.filter(
      (c) => incluirSsEmpresa || !esSsEmpresa(c.id),
    );
    const totalConIva = conceptosActivos.reduce((s, c) => s + c.euros, 0);
    const totalSinIva = conceptosActivos
      .filter((c) => !esIva(c.id))
      .reduce((s, c) => s + c.euros, 0);
    const ivaEuros = totalConIva - totalSinIva;

    /**
     * Base del % de carga del puesto:
     * · Tick ON (incluye SS empresa en el total) → coste salarial real =
     *   bruto + cuota patronal. Dividir por el bruto infla el % porque la
     *   cuota de la empresa no sale del sueldo, sino del coste del empleo.
     * · Tick OFF → el total ya no lleva la patronal; la base es el bruto
     *   (contrato / base de cotización). La cotiz. del trabajador sí sale
     *   del bruto, no hay que sumarla otra vez al denominador.
     */
    const baseCarga = incluirSsEmpresa ? r.costeLaboralTotal : r.renta;
    // Misma base para los dos: lo único que cambia es si el IVA entra o no.
    const pctSinIva = baseCarga > 0 ? (totalSinIva / baseCarga) * 100 : 0;
    const pctConIva = baseCarga > 0 ? (totalConIva / baseCarga) * 100 : 0;
    const maxConcepto = Math.max(...conceptosActivos.map((c) => c.euros), 1);

    /**
     * Lo que queda de verdad en el bolsillo: el neto de nómina (bruto menos
     * IRPF y cotización del trabajador) menos el IVA que se paga al gastarlo.
     * No depende del tick: la cuota patronal nunca salió de este bolsillo.
     */
    const netoDespuesIva = Math.max(0, r.rentaNetaAprox - ivaEuros);
    const netoMensual = netoDespuesIva / 12;

    return {
      conceptosActivos,
      totalConIva,
      totalSinIva,
      ivaEuros,
      baseCarga,
      pctSinIva,
      pctConIva,
      maxConcepto,
      netoDespuesIva,
      netoMensual,
    };
  }, [r, incluirSsEmpresa]);

  return (
    <div className="fiesta-calc-resultado">
      <div className="fiesta-calc-posicion">
        <div className="fiesta-calc-posicion-meta">
          <span className="fiesta-calc-kicker">
            Tu sitio en la distribución de {r.pais.nombre}
          </span>
          {/* En cristiano: el percentil dicho como lo diría alguien normal. */}
          <p className="fiesta-calc-tramo" style={{ color: r.color }}>
            Cobras más que el {percentilLegible(r.percentilAprox)} % del país
            {/* El «·» lo pone el CSS: en móvil el pie baja de línea y ahí
                sobra el separador. */}
            <span>estimado por renta bruta</span>
          </p>
          <p className="fiesta-calc-tramo-detalle">{r.detalleTramo}</p>
        </div>

        <div
          className="fiesta-calc-barra"
          role="img"
          aria-label={`Estás aproximadamente en el percentil ${percentilLegible(r.percentilAprox)} de renta`}
        >
          <div className="fiesta-calc-barra-pista">
            <span
              className="fiesta-calc-barra-fill"
              style={{
                width: `${Math.min(100, Math.max(2, r.posicionBarra))}%`,
                background: `linear-gradient(90deg, #3d8f6a, ${r.color})`,
              }}
            />
            <span
              className="fiesta-calc-barra-marker"
              style={{ left: `${Math.min(98, Math.max(2, r.posicionBarra))}%` }}
              title={`Percentil ~${percentilLegible(r.percentilAprox)}`}
            />
          </div>
          <div className="fiesta-calc-barra-labels">
            <span>Menos renta</span>
            <span>Tú ~P{percentilLegible(r.percentilAprox)}</span>
            <span>Más renta</span>
          </div>
        </div>
      </div>

      <div className="fiesta-calc-kpis">
        {/* Total + % sobre la base correcta (coste laboral si hay SS empresa). */}
        <div className="fiesta-calc-kpi fiesta-calc-kpi-impuestos">
          <span className="fiesta-calc-kpi-k">
            Impuestos estimados
            {!incluirSsEmpresa && (
              <span className="fiesta-calc-kpi-sin-ss"> · sin SS empresa</span>
            )}
          </span>

          {/* Primero: qué es el bruto frente al coste real del puesto. */}
          <div className="fiesta-calc-coste">
            <div className="fiesta-calc-coste-cab">
              <div>
                <span className="fiesta-calc-coste-kicker">
                  Coste de empresa estimado
                </span>
                <p className="fiesta-calc-coste-titulo">Salario total real</p>
              </div>
              <div className="fiesta-calc-coste-total">
                <span className="fiesta-calc-coste-total-v">
                  {dinero(r.costeLaboralTotal)}
                </span>
                <span className="fiesta-calc-coste-total-n">/ año</span>
              </div>
            </div>
            <p className="fiesta-calc-coste-nota">
              Lo que cuesta el puesto de verdad: tu bruto más la cotización
              patronal. El sueldo del contrato es solo una parte.
            </p>
            <div
              className="fiesta-calc-coste-barra"
              role="img"
              aria-label={`De ${dinero(r.costeLaboralTotal)} de coste laboral: ${dinero(r.renta)} bruto y ${dinero(r.ssEmpresa)} cotización de la empresa`}
            >
              <div className="fiesta-calc-coste-pista">
                <span
                  className="fiesta-calc-coste-seg fiesta-calc-coste-seg-bruto"
                  style={{
                    width: `${(r.renta / r.costeLaboralTotal) * 100}%`,
                  }}
                />
                <span
                  className="fiesta-calc-coste-seg fiesta-calc-coste-seg-ss"
                  style={{
                    width: `${(r.ssEmpresa / r.costeLaboralTotal) * 100}%`,
                  }}
                />
              </div>
            </div>
            <div className="fiesta-calc-coste-leyenda">
              <span className="fiesta-calc-coste-item">
                <i className="fiesta-calc-coste-dot fiesta-calc-coste-dot-bruto" />
                <span>
                  <strong>Bruto</strong> {dinero(r.renta)}
                  <em>
                    {" "}
                    ·{" "}
                    {fmtPct((r.renta / r.costeLaboralTotal) * 100, 0)} del
                    coste
                  </em>
                </span>
              </span>
              <span className="fiesta-calc-coste-item">
                <i className="fiesta-calc-coste-dot fiesta-calc-coste-dot-ss" />
                <span>
                  <strong>SS empresa</strong> {dinero(r.ssEmpresa)}
                  <em>
                    {" "}
                    ·{" "}
                    {fmtPct((r.ssEmpresa / r.costeLaboralTotal) * 100, 0)} del
                    coste
                  </em>
                </span>
              </span>
            </div>
          </div>

          {/* Cifras de carga: en pantallas anchas van a la derecha del coste. */}
          <div className="fiesta-calc-kpi-cifras">
            <div className="fiesta-calc-kpi-triple">
              <div className="fiesta-calc-kpi-part fiesta-calc-kpi-part-total">
                <span className="fiesta-calc-kpi-v fiesta-calc-kpi-v-amarillo">
                  {dinero(vista.totalConIva)}
                </span>
                <span className="fiesta-calc-kpi-n">
                  total estimado / año · {r.pais.iva.nombre} incluido
                </span>
              </div>
              <div className="fiesta-calc-kpi-part fiesta-calc-kpi-part-destacada">
                {/* Sin aria-label: un span genérico no lo expone de forma
                    fiable y el lector se quedaría sin el sumando. El texto
                    visible ya se lee entero. */}
                <span className="fiesta-calc-kpi-v fiesta-calc-pct fiesta-calc-pct-naranja fiesta-calc-pct-suma">
                  ~{fmtPct(vista.pctSinIva)}
                  <span className="fiesta-calc-pct-ipc">{ipcSumando}</span>
                </span>
                <span className="fiesta-calc-kpi-n">
                  {incluirSsEmpresa
                    ? "del coste laboral (bruto + SS empresa), sin consumo"
                    : "de tu renta bruta, sin consumo"}
                  <span className="fiesta-calc-kpi-n-ipc">
                    {" "}
                    + IPC {inflacion.anio}
                  </span>
                </span>
              </div>
              <div className="fiesta-calc-kpi-part">
                <span className="fiesta-calc-kpi-v fiesta-calc-pct fiesta-calc-pct-rojo">
                  ~{fmtPct(vista.pctConIva)}
                </span>
                <span className="fiesta-calc-kpi-n">
                  Con {r.pais.iva.nombre} incluido
                </span>
              </div>
            </div>

            {/* Justo debajo del total: la otra cara, lo que queda de verdad
                en el bolsillo una vez pagado también el IVA del consumo. */}
            <div className="fiesta-calc-neto">
              <div className="fiesta-calc-neto-cab">
                <div>
                  <span className="fiesta-calc-neto-kicker">
                    Después del {r.pais.iva.nombre}
                  </span>
                  <p className="fiesta-calc-neto-titulo">
                    Sueldo neto estimado
                  </p>
                </div>
                <div className="fiesta-calc-neto-total">
                  <span className="fiesta-calc-neto-total-v">
                    {dinero(vista.netoDespuesIva)}
                  </span>
                  <span className="fiesta-calc-neto-total-n">
                    / año · {dinero(vista.netoMensual)} al mes en 12 pagas
                  </span>
                </div>
              </div>
              <p className="fiesta-calc-neto-nota">
                Tu bruto de {dinero(r.renta)} menos {r.pais.irpf.nombre} y la
                cotización del trabajador deja{" "}
                <strong>{dinero(r.rentaNetaAprox)}</strong> netos en nómina; al
                gastarlos, el {r.pais.iva.nombre} se lleva otros{" "}
                <strong>{dinero(vista.ivaEuros)}</strong>.
              </p>
            </div>

            <p className="fiesta-calc-kpi-base">
              Base del %:{" "}
              <strong>{dinero(vista.baseCarga)}</strong>
              {incluirSsEmpresa
                ? ` · bruto ${dinero(r.renta)} + SS empresa ${dinero(r.ssEmpresa)}`
                : " · renta bruta (la cotiz. del trabajador ya sale de aquí)"}
              {` · el ${r.pais.iva.nombre} suma `}
              <strong>{dinero(vista.ivaEuros)}</strong>
            </p>
            {/* Barra del % principal sobre la base correcta. */}
            <div
              className="fiesta-calc-kpi-chart"
              role="img"
              aria-label={`Carga ~${fmtPct(vista.pctSinIva)} ${
                incluirSsEmpresa ? "del coste laboral" : "de la renta bruta"
              } sin ${r.pais.iva.nombre}; ~${fmtPct(vista.pctConIva)} con el ${r.pais.iva.nombre} incluido; y aparte ${fmtPct(
                inflacion.pct,
              )} de inflación oficial de ${inflacion.anio}`}
            >
              <div className="fiesta-calc-kpi-chart-row">
                <span className="fiesta-calc-kpi-chart-label">
                  {incluirSsEmpresa ? "Coste laboral" : "Renta bruta"}
                </span>
                <div className="fiesta-calc-kpi-chart-pista">
                  <span
                    className="fiesta-calc-kpi-chart-fill fiesta-calc-kpi-chart-fill-naranja"
                    style={{
                      width: `${Math.min(100, Math.max(1.5, vista.pctSinIva))}%`,
                    }}
                  />
                </div>
                <span className="fiesta-calc-kpi-chart-num fiesta-calc-pct-naranja">
                  ~{fmtPct(vista.pctSinIva)}
                </span>
              </div>
              <div className="fiesta-calc-kpi-chart-row">
                <span className="fiesta-calc-kpi-chart-label">
                  Con {r.pais.iva.nombre}
                </span>
                <div className="fiesta-calc-kpi-chart-pista">
                  <span
                    className="fiesta-calc-kpi-chart-fill fiesta-calc-kpi-chart-fill-rojo"
                    style={{
                      width: `${Math.min(100, Math.max(1.5, vista.pctConIva))}%`,
                    }}
                  />
                </div>
                <span className="fiesta-calc-kpi-chart-num fiesta-calc-pct-rojo">
                  ~{fmtPct(vista.pctConIva)}
                </span>
              </div>
              {/* Fila aparte: la inflación no es cuña fiscal, va sumada al lado. */}
              <div className="fiesta-calc-kpi-chart-row">
                <span className="fiesta-calc-kpi-chart-label fiesta-calc-kpi-chart-label-ipc">
                  Inflación {inflacion.anio}
                </span>
                <div className="fiesta-calc-kpi-chart-pista">
                  <span
                    className="fiesta-calc-kpi-chart-fill fiesta-calc-kpi-chart-fill-ipc"
                    style={{ width: `${inflacion.pct}%` }}
                  />
                </div>
                <span className="fiesta-calc-kpi-chart-num fiesta-calc-pct-ipc-color">
                  {ipcSumando}
                </span>
              </div>
            </div>
          </div>

          {/* Aviso del impuesto oculto, en el mismo naranja que el «+ x %». */}
          <p className="fiesta-calc-inflacion-nota">
            <span className="fiesta-calc-inflacion-frase">
              La inflación es un impuesto oculto por degradación monetaria
            </span>
            <span className="fiesta-calc-inflacion-detalle">
              IPC medio de {inflacion.anio}:{" "}
              <strong>{fmtPct(inflacion.pct)}</strong> ({inflacion.fuente}) · no
              lo recauda ninguna agencia tributaria ni sale en la nómina, por eso
              se suma aparte y no entra en el total de impuestos.
            </span>
          </p>
        </div>
        <div className="fiesta-calc-kpi">
          <span className="fiesta-calc-kpi-k">
            Tras impuesto sobre la renta + cotiz. trabajador
          </span>
          <span className="fiesta-calc-kpi-v">{dinero(r.rentaNetaAprox)}</span>
          <span className="fiesta-calc-kpi-n">
            neto de nómina orientativo (antes del {r.pais.iva.nombre}; la SS
            empresa no sale de aquí)
          </span>
        </div>
        <div className="fiesta-calc-kpi fiesta-calc-kpi-gold">
          <span className="fiesta-calc-kpi-k">Tu decil en la caja del Estado</span>
          <span className="fiesta-calc-kpi-v">
            ~{fmtPct(r.cuotaDecilImpuestosPct, 0)}
          </span>
          <span className="fiesta-calc-kpi-n">
            de {r.pais.recaudacion.etiqueta.toLowerCase()} (~
            {fmtRecaudacion(r.recaudacionNacionalMillones, r.pais.moneda)}) ·
            tramo completo, no solo tú · sin cotizaciones
          </span>
        </div>
      </div>

      <div className="fiesta-calc-aporte">
        <p>
          Si la recaudación tributaria de {r.pais.nombre} fueran{" "}
          <strong>100 {r.pais.moneda.simbolo}</strong>, el conjunto de personas
          de tu tramo ({r.nombreTramo.toLowerCase()}) pondría del orden de{" "}
          <strong className="disclaimer-highlight">
            {dinero(r.deCada100DelDecil)}
          </strong>
          . Tú eres una persona de ese tramo: la barra de arriba sitúa tu renta;
          la cifra es el peso colectivo del decil en renta + consumo +
          especiales + resto.{" "}
          {incluirSsEmpresa ? (
            <>
              <strong>Las cotizaciones (trabajador y empresa) van aparte</strong>{" "}
              y sí entran en el total y el desglose de arriba: suman del orden de{" "}
              <strong>{dinero(r.ssTotal)}</strong>/año en tu puesto (
              {dinero(r.ssTrabajador)} trabajador + {dinero(r.ssEmpresa)}{" "}
              empresa).
            </>
          ) : (
            <>
              <strong>Has quitado la cotización de la empresa del total</strong>{" "}
              (~{dinero(r.ssEmpresa)}/año). La del trabajador (~
              {dinero(r.ssTrabajador)}) sigue contando. Puedes volver a marcar
              el tick junto a «Cotizaciones (empresa)».
            </>
          )}
        </p>
      </div>

      <h3 className="fiesta-calc-subtitulo">
        Desglose orientativo de la carga del puesto
      </h3>
      <ul className="fiesta-calc-conceptos">
        {r.conceptos.map((c) => {
          const esEmpresa = esSsEmpresa(c.id);
          // El IVA siempre cuenta aquí; solo la SS de empresa se puede quitar.
          const activo = !esEmpresa || incluirSsEmpresa;
          const anchoBarra = activo
            ? (c.euros / vista.maxConcepto) * 100
            : 0;

          return (
            <li
              key={c.id}
              className={
                esEmpresa
                  ? `fiesta-calc-concepto-ss${activo ? "" : " es-excluido"}`
                  : undefined
              }
            >
              <div className="fiesta-calc-concepto-meta">
                <strong style={{ color: activo ? c.color : undefined }}>
                  {esEmpresa && (
                    <label className="fiesta-calc-ss-tick">
                      <input
                        type="checkbox"
                        checked={incluirSsEmpresa}
                        onChange={(e) => setIncluirSsEmpresa(e.target.checked)}
                        aria-label={
                          incluirSsEmpresa
                            ? "Quitar cotizaciones de la empresa del total"
                            : "Incluir cotizaciones de la empresa en el total"
                        }
                      />
                      <span className="fiesta-calc-ss-box" aria-hidden="true" />
                    </label>
                  )}
                  {c.nombre}
                </strong>
                <span>{c.nota}</span>
              </div>
              <div className="fiesta-calc-concepto-pista" aria-hidden="true">
                <span
                  style={{
                    width: `${anchoBarra}%`,
                    background: activo ? c.color : "transparent",
                  }}
                />
              </div>
              <div className="fiesta-calc-concepto-nums">
                <strong>{activo ? dinero(c.euros) : "—"}</strong>
                <span>
                  {activo ? `${fmtPct(c.pctRenta)} renta` : "fuera del total"}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="fiesta-calc-extra">
        <details className="fiesta-calc-extra-details">
          <summary className="fiesta-calc-extra-summary">
            <span className="fiesta-calc-extra-summary-text">
              ¿Por qué contamos las cotizaciones de la empresa?
            </span>
            <span className="fiesta-calc-extra-hint">Clic para leer</span>
          </summary>
          <div className="fiesta-calc-extra-body">
            <p>
              No se descuenta de tu neto, pero es un coste ligado a tu empleo (~
              {dinero(r.ssEmpresa)}/año). El «precio» total del puesto ronda{" "}
              <strong>{dinero(r.costeLaboralTotal)}</strong> (bruto + cotización
              de empresa).
            </p>
            <p>
              La cuota patronal la soporta económicamente el trabajador: es un
              coste del puesto que, de no existir esa cotización, tendería a
              trasladarse al salario —por convenio, un salario mínimo más alto o
              negociación colectiva— sin alterar el coste total que la empresa ya
              asume por el empleo.
            </p>
            <p>
              Además, ese pago no depende de los beneficios: la empresa debe
              abonarlo aunque pierda dinero. No es un gravamen sobre el
              resultado, sino un coste fijo por tener el puesto ocupado.
            </p>
            <p className="fiesta-calc-extra-aviso-naranja">
              Aun así, si no te convence, puedes quitarlo pulsando el tick al
              lado de «Cotizaciones (empresa)».
            </p>
          </div>
        </details>
        <p>
          <strong>No está aquí:</strong> el impuesto de sociedades ni la
          tributación del ahorro si eres socio o rentista de capital —en ese caso
          tu factura real puede ser muy distinta—. Tampoco deducciones por
          vivienda, hijos o discapacidad, ni los regímenes de autónomos.
        </p>
        {/* Cada país tiene su propia letra pequeña: qué se ha aproximado y
            qué se ha dejado fuera de su sistema. */}
        <p className="fiesta-calc-pais-notas-k">
          Letra pequeña de {r.pais.nombre}:
        </p>
        <ul className="fiesta-calc-pais-notas">
          {r.pais.notas.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Calculadora de la parte alta de «¿Quién paga la fiesta?».
 * Entrada: renta bruta anual y país (España por defecto). Salida: tramo,
 * barra de percentil y desglose de la carga típica de un asalariado
 * (impuesto sobre la renta, cotizaciones del trabajador y de la empresa,
 * impuesto sobre el consumo, especiales). Siempre con el aviso de
 * aproximación.
 */
export function FiestaCalculadora() {
  const [paisId, setPaisId] = useState<string>(PAIS_POR_DEFECTO);
  const [raw, setRaw] = useState("");
  const [comparando, setComparando] = useState(false);

  const [opciones, setOpciones] = useState<OpcionesActivas>({});

  const pais = getPais(paisId);
  const renta = useMemo(() => parseRenta(raw), [raw]);
  const resultado = useMemo(
    () => (renta == null ? null : estimarCargaFiscal(renta, paisId, opciones)),
    [renta, paisId, opciones],
  );
  const ejemplos = useMemo(() => ejemplosDePais(pais), [pais]);

  /**
   * Al cambiar de país se conserva el sueldo, no el número: 50.000 € no son
   * 50.000 coronas. Se convierte al cambio y se redondea a la centena para
   * que la cifra siga siendo legible.
   */
  const cambiarPais = (id: string) => {
    const nuevo = getPais(id);
    if (renta != null && nuevo.moneda.codigo !== pais.moneda.codigo) {
      const convertido = convertirMoneda(renta, pais.moneda, nuevo.moneda);
      setRaw(String(Math.round(convertido / 100) * 100));
    }
    // Los ticks son figuras de un sistema concreto: arrastrar «casado» de
    // Alemania a otro país dejaría marcada una casilla que no hace nada.
    setOpciones({});
    setPaisId(id);
  };

  return (
    <section className="fiesta-calc share-host" aria-labelledby="fiesta-calc-title">
      <ShareDato text="Calcula la carga real de tu puesto: impuesto sobre la renta, cotizaciones del trabajador y de la empresa, consumo y el peso de tu tramo en la caja del Estado. Ahora en once países." />

      <div className="fiesta-calc-topbar">
        <SelectorPais
          valor={paisId}
          onCambio={cambiarPais}
          etiqueta="País de la simulación"
        />
        <button
          type="button"
          className="fiesta-calc-comparar"
          onClick={() => setComparando(true)}
        >
          <span aria-hidden="true">⇄</span> Comparar
        </button>
      </div>

      <header className="fiesta-calc-header">
        <p className="fiesta-calc-kicker">Pon tu sueldo · mira el mapa</p>
        <h2 id="fiesta-calc-title">¿Dónde estás tú en la fiesta?</h2>
      </header>

      <div className="fiesta-calc-aviso" role="note">
        <p>
          <strong>Aproximación divulgativa, no asesoramiento fiscal.</strong>{" "}
          Esta herramienta <strong>no calcula tu declaración</strong>, no
          sustituye a la administración tributaria de ningún país ni a un
          profesional, y puede desviarse mucho según región, familia,
          deducciones, patrimonio o si eres autónomo.{" "}
          <strong>
            Haz siempre tus propios cálculos con la normativa vigente
          </strong>{" "}
          (o con un asesor) antes de tomar decisiones; no uses estas cifras
          como prueba, reclamación ni planificación formal. El autor no asume
          responsabilidad por el uso de esta estimación.
        </p>
      </div>

      <div className="fiesta-calc-form">
        <label className="fiesta-calc-label" htmlFor="fiesta-renta">
          Renta bruta anual ({pais.moneda.simbolo}) · {pais.nombre}
        </label>
        <div className="fiesta-calc-input-row">
          <input
            id="fiesta-renta"
            className="fiesta-calc-input"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder={`Ej. ${ejemplos[2]!.valor}`}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            aria-describedby="fiesta-calc-hint"
          />
          <span className="fiesta-calc-suffix" aria-hidden="true">
            {pais.moneda.simbolo} / año
          </span>
        </div>
        <p id="fiesta-calc-hint" className="fiesta-calc-hint">
          Solo cifras (puedes usar punto o coma). Ejemplos rápidos:
        </p>
        <div className="fiesta-calc-ejemplos" role="group" aria-label="Ejemplos de renta">
          {ejemplos.map((ej) => (
            <button
              key={ej.valor}
              type="button"
              className="pen-medida"
              aria-pressed={renta === ej.valor}
              onClick={() => setRaw(String(ej.valor))}
            >
              {ej.label}
            </button>
          ))}
        </div>

        <TicksPais pais={pais} opciones={opciones} onCambio={setOpciones} />
      </div>

      {raw.trim() !== "" && resultado == null && (
        <p className="fiesta-calc-error">
          Introduce un importe válido mayor que cero.
        </p>
      )}

      {resultado && <Resultado r={resultado} />}

      {comparando && (
        <ComparadorPaises
          paisInicial={paisId}
          rentaInicial={renta}
          onCerrar={() => setComparando(false)}
        />
      )}
    </section>
  );
}
