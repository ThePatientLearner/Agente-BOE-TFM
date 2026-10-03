import { describe, expect, it } from "vitest";
import { estimarCargaFiscal } from "./fiesta-calc";
import {
  HUECO_FISCAL,
  HUECO_FISCAL_TOTAL_MILLONES,
  RECAUDACION_2025,
} from "./fiesta-data";
import {
  ANUAL_2025,
  AYUDAS_SUBSISTENCIA,
  COMPARATIVA_PENSIONES,
  DEFICIT_2025,
  GASTO_COMPARADO,
  GASTO_POLITICO,
  INSTANTANEA,
  INTERESES_DEUDA_MILLONES,
  PESO_FISCAL_PENSIONES,
  POR_CLASE,
  PROYECCION_PIB,
  RATIO_HISTORICO,
  RATIO_PROYECCION,
  SUPERAVIT_PRIMARIO_2025_MILLONES,
} from "./pensiones-data";

/**
 * Red de seguridad de los datos curados de las dos radiografías.
 *
 * Existe porque estas cifras se actualizan de vez en cuando —a mano o, desde
 * ahora, por el cron mensual que corre en el VPS— y hasta hoy no había nada que
 * las mirase: `npm test` solo cubría el monolito y TypeScript no distingue
 * 101.739 de 1.017.390.
 *
 * Dos familias de comprobación, y ninguna congela un valor:
 *
 *  · **Relaciones derivadas**: lo que tiene que seguir cuadrando por
 *    construcción. Si alguien rompe una, el dato ya no dice lo que dice creer.
 *  · **Bandas de plausibilidad**: rangos anchos que cazan el error de bulto —el
 *    factor diez, el cambio de unidad, el universo confundido— sin estorbar a
 *    una actualización de verdad.
 *
 * Si una banda salta, la pregunta no es «¿subo el límite?» sino «¿de dónde
 * salió este número?». Solo después de contestarla se toca el rango, y con el
 * comentario puesto al día.
 */

/** Margen para comparar cifras que vienen redondeadas de la fuente. */
function cerca(a: number, b: number, toleranciaPct: number): boolean {
  return Math.abs(a - b) <= (Math.abs(b) * toleranciaPct) / 100;
}

const ANIO_ACTUAL = new Date().getFullYear();

describe("relaciones derivadas · pensiones", () => {
  it("el gasto agregado en pensiones sigue saliendo del PIB", () => {
    const { pibMillones, gastoPctPib, gastoPensionesMillones } =
      PESO_FISCAL_PENSIONES.actual;
    // Si dejara de derivarse, el % del modelo y los euros de la tarjeta
    // volverían a contar cosas distintas bajo el mismo rótulo, que es
    // exactamente el descuadre que se arregló en agosto de 2026.
    expect(gastoPensionesMillones).toBe(
      Math.round((pibMillones * gastoPctPib) / 100),
    );
  });

  it("el esfuerzo fiscal sigue saliendo del PIB", () => {
    const { pibMillones, esfuerzoFiscalMillones } = PESO_FISCAL_PENSIONES.actual;
    expect(esfuerzoFiscalMillones).toBe(
      Math.round((pibMillones * PESO_FISCAL_PENSIONES.presionFiscalPctPib) / 100),
    );
  });

  it("las contributivas son un subconjunto del agregado, no el agregado", () => {
    const { gastoContributivoMillones, gastoPensionesMillones } =
      PESO_FISCAL_PENSIONES.actual;
    expect(gastoContributivoMillones).toBeLessThan(gastoPensionesMillones);
    // Y no una miga: las contributivas son la mayor parte del sistema.
    expect(gastoContributivoMillones / gastoPensionesMillones).toBeGreaterThan(0.7);
  });

  it("el desglose por clase reproduce la nómina y el recuento del mes", () => {
    const importe = POR_CLASE.reduce((s, c) => s + c.importeMillones, 0);
    const pensiones = POR_CLASE.reduce((s, c) => s + c.pensiones, 0);
    expect(cerca(importe, ANUAL_2025.nominaDiciembreMillones, 0.5)).toBe(true);
    // ±2.000 pensiones: los recuentos se derivan de importe/media y las medias
    // vienen redondeadas a un decimal.
    expect(Math.abs(pensiones - ANUAL_2025.pensionesDiciembre)).toBeLessThan(2_000);
  });

  it("cada media por clase cuadra con su importe y su recuento", () => {
    for (const clase of POR_CLASE) {
      const media = (clase.importeMillones * 1e6) / clase.pensiones;
      expect(cerca(media, clase.media, 1), `media de ${clase.id}`).toBe(true);
    }
  });

  it("la proyección del ratio empalma con el histórico", () => {
    const finHistorico = RATIO_HISTORICO[RATIO_HISTORICO.length - 1]!;
    const inicioProyeccion = RATIO_PROYECCION[0]!;
    expect(inicioProyeccion.anio).toBeGreaterThanOrEqual(finHistorico.anio);
    expect(cerca(inicioProyeccion.ratio, finHistorico.ratio, 6)).toBe(true);
    // Y con la instantánea, que es de donde sale el «2,4 cotizantes» del KPI.
    expect(cerca(finHistorico.ratio, INSTANTANEA.ratioCotizantes, 6)).toBe(true);
  });

  it("las series de proyección van ordenadas por año", () => {
    for (const serie of [PROYECCION_PIB.airef, PROYECCION_PIB.ministerio]) {
      const anios = serie.map((p) => p.anio);
      expect(anios).toEqual([...anios].sort((a, b) => a - b));
    }
  });
});

describe("relaciones derivadas · comparativa de gasto", () => {
  it("los intereses son la resta entre saldo primario y déficit", () => {
    // No es una cifra copiada de ninguna nota: es la definición de «primario».
    expect(INTERESES_DEUDA_MILLONES).toBe(
      DEFICIT_2025.millones + SUPERAVIT_PRIMARIO_2025_MILLONES,
    );
  });

  it("sanidad, educación y defensa se leen de una sola fuente", () => {
    // Tuvieron copia doble entre `HUECO_FISCAL` y `COMPARATIVA_PENSIONES` y
    // llegaron a decir cosas distintas. Que no vuelva a pasar sin avisar.
    for (const id of ["sanidad", "educacion", "defensa"]) {
      const ref = HUECO_FISCAL.referencias.find((r) => r.id === id);
      expect(ref, `falta la referencia de gasto «${id}»`).toBeDefined();

      const enComparado = GASTO_COMPARADO.items.find((i) => i.id === id);
      if (enComparado) expect(enComparado.millones).toBe(ref!.millones);

      const enComparativa = COMPARATIVA_PENSIONES.items.find((i) => i.id === id);
      if (enComparativa) expect(enComparativa.millones).toBe(ref!.millones);
    }
  });

  it("la barra de pensiones es la mayor y ninguna partida viene del futuro", () => {
    const referencia = GASTO_COMPARADO.items.find((i) => i.referencia);
    expect(referencia).toBeDefined();
    for (const item of GASTO_COMPARADO.items) {
      expect(item.millones, `importe de ${item.id}`).toBeGreaterThan(0);
      expect(item.millones).toBeLessThanOrEqual(referencia!.millones);
      expect(item.anio).toBeGreaterThanOrEqual(2020);
      expect(item.anio, `año de ${item.id}`).toBeLessThanOrEqual(ANIO_ACTUAL);
    }
  });

  it("la barra de pensiones y prestaciones incluye el desempleo", () => {
    const referencia = GASTO_COMPARADO.items.find((i) => i.referencia)!;
    const soloPensiones = PESO_FISCAL_PENSIONES.actual.gastoPensionesMillones;
    expect(referencia.millones).toBeGreaterThan(soloPensiones);
    // El desempleo no puede pasar de un quinto del bloque: si lo hiciera,
    // seguramente se habría colado ahí algo que no es una prestación.
    expect((referencia.millones - soloPensiones) / referencia.millones).toBeLessThan(0.2);
  });

  it("el gasto político estrecho es la suma del desglose y cabe en el amplio", () => {
    const suma = GASTO_POLITICO.partidas.reduce((s, p) => s + p.millones, 0);
    expect(GASTO_POLITICO.estrechoMillones).toBeCloseTo(suma, 5);
    expect(GASTO_POLITICO.estrechoMillones).toBeLessThan(GASTO_POLITICO.amplioMillones);
  });
});

describe("relaciones derivadas · ayudas de subsistencia", () => {
  it("el total es la suma de sus partidas", () => {
    const suma = AYUDAS_SUBSISTENCIA.partidas.reduce((s, p) => s + p.millones, 0);
    expect(AYUDAS_SUBSISTENCIA.totalMillones).toBe(suma);
  });

  it("no se cuela dentro lo que ya está contado como pensiones", () => {
    // La regla que sostiene todo el bloque: sin pensiones no contributivas ni
    // complementos a mínimos, que ya van en el agregado del 13 % del PIB.
    //
    // La comprobación va partida a partida y no sobre el total, y eso no es un
    // detalle: metiendo las no contributivas (~11.800 M€) en una línea, el
    // bloque solo pasa del 2,6 % al 4,5 % del esfuerzo fiscal. Un techo sobre
    // el total lo dejaría pasar. La banda de cada partida, no.
    const bandas: Record<string, [number, number]> = {
      "desempleo-asistencial": [4_000, 15_000],
      imv: [2_500, 9_000],
      "otros-ss": [800, 5_000],
      "rentas-minimas": [700, 4_000],
      acogida: [200, 3_000],
    };
    for (const partida of AYUDAS_SUBSISTENCIA.partidas) {
      const banda = bandas[partida.id];
      expect(banda, `partida sin banda declarada: ${partida.id}`).toBeDefined();
      expect(partida.millones, `${partida.id} fuera de banda`).toBeGreaterThan(banda![0]);
      expect(partida.millones, `${partida.id} fuera de banda`).toBeLessThan(banda![1]);
    }

    const pctEsfuerzo =
      (AYUDAS_SUBSISTENCIA.totalMillones /
        PESO_FISCAL_PENSIONES.actual.esfuerzoFiscalMillones) *
      100;
    expect(pctEsfuerzo).toBeGreaterThan(1);
    expect(pctEsfuerzo).toBeLessThan(6);
  });

  it("la acogida de asilo sigue siendo una de las partidas del bloque", () => {
    // Es la cifra que más se cita fuera de contexto: si desapareciera del
    // desglose, la página dejaría de poder defender su propio número.
    expect(AYUDAS_SUBSISTENCIA.acogidaMillones).toBeGreaterThan(0);
    expect(AYUDAS_SUBSISTENCIA.acogidaMillones).toBeLessThan(
      AYUDAS_SUBSISTENCIA.totalMillones,
    );
  });
});

describe("hueco fiscal · el bloque más fácil de inflar", () => {
  it("cada cifra cae dentro de la horquilla que ella misma declara", () => {
    // Autocoherencia: el número que se pinta y el rango que se cita en la
    // página tienen que contarse lo mismo. Si alguien sube la cifra sin tocar
    // el rango —o al revés— esto salta.
    const casos: [number, readonly [number, number], string][] = [
      [HUECO_FISCAL.evasionMillones, HUECO_FISCAL.rangoEvasion, "evasión"],
      [HUECO_FISCAL.elusionMillones, HUECO_FISCAL.rangoElusion, "elusión"],
      [HUECO_FISCAL.grandesMillones, HUECO_FISCAL.rangoGrandes, "grandes"],
    ];
    for (const [valor, [min, max], nombre] of casos) {
      expect(valor, `${nombre} fuera de su horquilla`).toBeGreaterThanOrEqual(min);
      expect(valor, `${nombre} fuera de su horquilla`).toBeLessThanOrEqual(max);
    }
  });

  it("lo atribuido a grandes patrimonios no vuelve a comerse medio hueco", () => {
    // Aquí estaba el error que se corrigió en agosto de 2026: se les asignaba
    // el 48 % del hueco apoyándose en estimaciones que se citan mucho y se
    // comprueban poco. FEDEA reparte la brecha del IRPF por tipo de renta y el
    // capital mobiliario —la renta típica de una gran fortuna— sale el último
    // «a considerable distancia». Con la elusión corporativa incluida, la
    // parte defendible ronda el 20 %.
    //
    // El techo del 35 % no es un gusto estético: por encima de ahí la cifra ya
    // no la sostiene ningún estudio publicado, y esta página no puede afirmar
    // lo que no puede citar.
    const pct = (HUECO_FISCAL.grandesMillones / HUECO_FISCAL_TOTAL_MILLONES) * 100;
    expect(pct).toBeGreaterThan(5);
    expect(pct, "atribuido a grandes patrimonios sin fuente que lo aguante").toBeLessThan(35);
  });

  it("el reparto por tipo de renta sigue publicado y con su matiz", () => {
    // Sin esta lista, el gráfico insinúa que el agujero son las grandes
    // fortunas y el estudio dice otra cosa. Es la parte que contesta la
    // pregunta, así que no puede desaparecer en una actualización.
    expect(HUECO_FISCAL.composicion.length).toBeGreaterThanOrEqual(3);
    for (const c of HUECO_FISCAL.composicion) {
      expect(c.etiqueta.length, `etiqueta de ${c.id}`).toBeGreaterThan(0);
      expect(c.nota.length, `nota de ${c.id}`).toBeGreaterThan(20);
    }
    // El capital mobiliario tiene que seguir figurando: es el dato que
    // contradice la intuición y el primero que se caería sin querer.
    expect(HUECO_FISCAL.composicion.some((c) => c.id === "mobiliario")).toBe(true);
  });

  it("todo el bloque sigue estando en términos anuales", () => {
    // El error clásico al citar informes de elusión: titulan con acumulados de
    // varios años, que impresionan más, y la cifra anual va enterrada dentro.
    // Este bloque se ha equivocado ya en las dos direcciones —metiendo un
    // acumulado como anual, y luego prorrateándolo cuando la anual estaba
    // publicada— así que el marco temporal queda escrito y comprobado.
    expect(HUECO_FISCAL.periodo.toLowerCase()).toContain("anual");

    // Y la horquilla de elusión no puede admitir un acumulado plurianual:
    // los 31.000 M€ de TJN para 2016-2021 quedan muy fuera.
    expect(HUECO_FISCAL.rangoElusion[1]).toBeLessThan(20_000);
  });

  it("el hueco total mantiene un tamaño defendible frente a la recaudación", () => {
    const pct = (HUECO_FISCAL_TOTAL_MILLONES / RECAUDACION_2025.totalMillones) * 100;
    expect(pct).toBeGreaterThan(5);
    expect(pct).toBeLessThan(25);
  });
});

describe("calculadora · lo que queda al final del recorrido", () => {
  // El comparador de países titula con «lo que te queda al final»: el coste del
  // puesto menos TODOS los impuestos, consumo incluido. Antes titulaba con el
  // neto de nómina, que premiaba sin querer a los países que trasladan el peso
  // al consumo.
  //
  // Esa cifra se sostiene sobre una identidad contable que un refactor de la
  // calculadora puede romper sin que nada compile mal, así que se comprueba
  // aquí y no a ojo en la pantalla.
  const casos = [18_000, 30_000, 60_000, 120_000];

  it("coste del puesto menos impuestos = neto menos consumo", () => {
    for (const bruto of casos) {
      const r = estimarCargaFiscal(bruto, "es")!;
      expect(r, `sin resultado para ${bruto}`).toBeTruthy();

      const consumo = r.conceptos
        .filter((c) => ["iva", "especiales", "otros"].includes(c.id))
        .reduce((s, c) => s + c.euros, 0);

      const porArriba = r.costeLaboralTotal - r.totalImpuestos;
      const porAbajo = r.rentaNetaAprox - consumo;
      expect(Math.abs(porArriba - porAbajo), `descuadre con ${bruto} €`).toBeLessThan(1);
    }
  });

  it("lo que queda es menos que el neto y más que cero", () => {
    for (const bruto of casos) {
      const r = estimarCargaFiscal(bruto, "es")!;
      const resto = r.costeLaboralTotal - r.totalImpuestos;
      // Si el resto igualara el neto, el consumo se habría quedado fuera del
      // cálculo y el titular volvería a medir solo la nómina.
      expect(resto, `${bruto} €`).toBeLessThan(r.rentaNetaAprox);
      expect(resto, `${bruto} €`).toBeGreaterThan(0);
    }
  });

  it("el mismo bruto en otro país sigue cuadrando", () => {
    // La comparación pone dos países al lado; si la identidad solo se cumple en
    // España, la caja de la derecha estaría mintiendo.
    for (const pais of ["de", "es"]) {
      const r = estimarCargaFiscal(30_000, pais);
      if (!r) continue;
      const consumo = r.conceptos
        .filter((c) => ["iva", "especiales", "otros"].includes(c.id))
        .reduce((s, c) => s + c.euros, 0);
      expect(
        Math.abs((r.costeLaboralTotal - r.totalImpuestos) - (r.rentaNetaAprox - consumo)),
        `descuadre en ${pais}`,
      ).toBeLessThan(1);
    }
  });
});

describe("Alemania · las ventajas fiscales que se activan con un tick", () => {
  const irpfDe = (bruto: number, o?: Parameters<typeof estimarCargaFiscal>[2]) =>
    estimarCargaFiscal(bruto, "de", o)!.conceptos.find((c) => c.id === "irpf")!.euros;

  it("el splitting de casados baja la factura, y más cuanto más se gana", () => {
    // Ehegattensplitting: se parte la base en dos, se aplica la tarifa a cada
    // mitad y se dobla. Con un solo sueldo en casa el ahorro es real y crece
    // con la renta, porque la progresividad muerde menos en dos mitades.
    let ahorroAnterior = 0;
    for (const bruto of [30_000, 60_000, 120_000]) {
      const soltero = irpfDe(bruto);
      const casado = irpfDe(bruto, { splitting: true });
      const ahorro = soltero - casado;
      expect(ahorro, `${bruto} € debería ahorrar algo`).toBeGreaterThan(0);
      expect(ahorro, `${bruto} € debería ahorrar más que el tramo anterior`).toBeGreaterThan(
        ahorroAnterior,
      );
      ahorroAnterior = ahorro;
    }
  });

  it("con 30.000 € y un solo sueldo la cuota se va a cero", () => {
    // No es un fallo del modelo: la base tras deducciones (~22.800) partida en
    // dos queda por debajo del mínimo exento de 12.348 €, que es exactamente
    // lo que hace la clase fiscal III alemana a ese nivel de sueldo.
    expect(irpfDe(30_000, { splitting: true })).toBe(0);
    expect(irpfDe(30_000)).toBeGreaterThan(0);
  });

  it("el impuesto religioso añade en torno al 9 % de la cuota", () => {
    const r = estimarCargaFiscal(60_000, "de", { iglesia: true })!;
    const iglesia = r.conceptos.find((c) => c.id === "iglesia")!;
    const irpf = r.conceptos.find((c) => c.id === "irpf")!;
    // Sobre la cuota sin el recargo de solidaridad, así que la proporción
    // frente al IRPF total queda un pelo por debajo del 9 %.
    expect(iglesia.euros / irpf.euros).toBeGreaterThan(0.08);
    expect(iglesia.euros / irpf.euros).toBeLessThanOrEqual(0.09);
    // Y sale del bolsillo: el neto tiene que bajar.
    expect(r.rentaNetaAprox).toBeLessThan(estimarCargaFiscal(60_000, "de")!.rentaNetaAprox);
  });

  it("el recargo por no tener hijos sube solo la cotización del trabajador", () => {
    const con = estimarCargaFiscal(40_000, "de")!;
    const sin = estimarCargaFiscal(40_000, "de", { sinHijos: true })!;
    // 0,6 puntos sobre 40.000 € = 240 €, y por debajo del tope de dependencia.
    expect(sin.ssTrabajador - con.ssTrabajador).toBeCloseTo(240, 0);
    // La empresa no paga ese recargo: su parte no se mueve.
    expect(sin.ssEmpresa).toBe(con.ssEmpresa);
  });

  it("respeta los topes de cotización de 2026", () => {
    // Por encima del tope, la cotización deja de crecer. Es lo que hace que en
    // Alemania las rentas altas tengan una cuña laboral proporcionalmente menor.
    const medio = estimarCargaFiscal(69_750, "de")!;
    const alto = estimarCargaFiscal(200_000, "de")!;
    const topeKvPv = 69_750;
    const topeRvAv = 101_400;
    // El trabajador cotiza como mucho por los dos topes con sus tipos.
    const maximo = topeRvAv * (0.093 + 0.013) + topeKvPv * (0.0875 + 0.018);
    expect(alto.ssTrabajador).toBeCloseTo(maximo, 0);
    expect(alto.ssTrabajador).toBeGreaterThan(medio.ssTrabajador);
  });

  it("un tick que el país no declara no cambia nada", () => {
    // España no tiene splitting, ni iglesia, ni recargo por no tener hijos. Si
    // marcarlos moviera la cifra, la comparación mentiría en silencio.
    const base = estimarCargaFiscal(40_000, "es")!;
    const conTicks = estimarCargaFiscal(40_000, "es", {
      splitting: true,
      iglesia: true,
      sinHijos: true,
    })!;
    expect(conTicks.totalImpuestos).toBe(base.totalImpuestos);
    expect(conTicks.rentaNetaAprox).toBe(base.rentaNetaAprox);
  });

  it("la conjunta española ahorra, pero mucho menos que el splitting alemán", () => {
    // Las dos figuras se llaman igual de cara al usuario —«casado y único
    // sueldo en casa»— y hacen cosas de tamaño muy distinto. Que se pueda ver
    // la diferencia es el motivo de modelar las dos: con solo la alemana,
    // marcar el tick haría que Alemania adelantara a España por un efecto que
    // en realidad existe en los dos sitios.
    const bruto = 60_000;
    const ahorroEs =
      estimarCargaFiscal(bruto, "es")!.rentaNetaAprox -
      estimarCargaFiscal(bruto, "es", { conjunta: true })!.rentaNetaAprox;
    const ahorroDe =
      estimarCargaFiscal(bruto, "de")!.rentaNetaAprox -
      estimarCargaFiscal(bruto, "de", { splitting: true })!.rentaNetaAprox;

    // Los dos ahorran (el neto sube, así que la resta sale negativa).
    expect(ahorroEs).toBeLessThan(0);
    expect(ahorroDe).toBeLessThan(0);
    // Y el alemán ahorra al menos el triple.
    expect(Math.abs(ahorroDe)).toBeGreaterThan(Math.abs(ahorroEs) * 3);
  });

  it("la conjunta española no se aplica en Alemania ni al revés", () => {
    // Cada país solo responde a sus propias figuras.
    const de = estimarCargaFiscal(60_000, "de")!;
    expect(estimarCargaFiscal(60_000, "de", { conjunta: true })!.totalImpuestos).toBe(
      de.totalImpuestos,
    );
    const es = estimarCargaFiscal(60_000, "es")!;
    expect(estimarCargaFiscal(60_000, "es", { splitting: true })!.totalImpuestos).toBe(
      es.totalImpuestos,
    );
  });
});

describe("bandas de plausibilidad", () => {
  it("el PIB nominal está en el orden de magnitud de España", () => {
    // España ronda 1,7 billones. La banda deja crecer una década sin tocarla y
    // caza el error de escribir el PIB en euros en vez de en millones.
    expect(PESO_FISCAL_PENSIONES.actual.pibMillones).toBeGreaterThan(1_400_000);
    expect(PESO_FISCAL_PENSIONES.actual.pibMillones).toBeLessThan(2_500_000);
  });

  it("ningún porcentaje del PIB se sale de lo posible", () => {
    const porcentajes = [
      PESO_FISCAL_PENSIONES.presionFiscalPctPib,
      PESO_FISCAL_PENSIONES.actual.gastoPctPib,
      DEFICIT_2025.pctPib,
      ...PROYECCION_PIB.airef.map((p) => p.pct),
      ...PROYECCION_PIB.ministerio.map((p) => p.pct),
    ];
    for (const pct of porcentajes) {
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThan(60);
    }
  });

  it("las grandes partidas de gasto están en su orden de magnitud", () => {
    // Bandas anchas a propósito: solo cazan el factor diez y el universo
    // equivocado (presupuesto del Ministerio de Defensa vs. criterio OTAN, por
    // ejemplo). Si una salta, hay que mirar la fuente, no subir el techo.
    const bandas: Record<string, [number, number]> = {
      sanidad: [80_000, 160_000],
      educacion: [55_000, 120_000],
      defensa: [15_000, 80_000],
    };
    for (const [id, [min, max]] of Object.entries(bandas)) {
      const ref = HUECO_FISCAL.referencias.find((r) => r.id === id)!;
      expect(ref.millones, `${id} fuera de banda`).toBeGreaterThan(min);
      expect(ref.millones, `${id} fuera de banda`).toBeLessThan(max);
    }

    expect(PESO_FISCAL_PENSIONES.actual.gastoPensionesMillones).toBeGreaterThan(150_000);
    expect(PESO_FISCAL_PENSIONES.actual.gastoPensionesMillones).toBeLessThan(350_000);
  });

  it("la instantánea de la nómina es coherente consigo misma", () => {
    const media = (INSTANTANEA.nominaMensualMillones * 1e6) / INSTANTANEA.pensiones;
    expect(cerca(media, INSTANTANEA.pensionMedia, 2)).toBe(true);
    // Más pensiones que pensionistas: hay quien cobra dos.
    expect(INSTANTANEA.pensiones).toBeGreaterThan(INSTANTANEA.pensionistas);
    expect(INSTANTANEA.jubilacionMedia).toBeGreaterThan(INSTANTANEA.pensionMedia);
    const ratio = INSTANTANEA.afiliadosAprox / INSTANTANEA.pensionistas;
    expect(cerca(ratio, INSTANTANEA.ratioCotizantes, 8)).toBe(true);
  });

  it("el cierre anual es coherente con la nómina mensual", () => {
    // 12 nóminas más dos pagas extra: el gasto del año no puede alejarse mucho
    // de nómina × 14 sin que algo esté mal contado.
    const estimado = ANUAL_2025.nominaDiciembreMillones * 14;
    expect(cerca(ANUAL_2025.gastoContributivoMillones, estimado, 10)).toBe(true);
  });

  it("la recaudación por IRPF mantiene su tamaño relativo", () => {
    const { irpfMillones } = RECAUDACION_2025;
    expect(irpfMillones).toBeGreaterThan(80_000);
    expect(irpfMillones).toBeLessThan(200_000);
    // Y sigue siendo la caja más grande de la AEAT.
    expect(irpfMillones).toBeGreaterThan(RECAUDACION_2025.sociedadesMillones);
    expect(irpfMillones).toBeGreaterThan(RECAUDACION_2025.ivaMillones);
  });
});
