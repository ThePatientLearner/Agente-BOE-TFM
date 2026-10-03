# Mapa de datos y fuentes

Última pasada documentada: ver `baseline.md`.

## Ficheros

| Path | Rol |
|------|-----|
| `apps/web/src/lib/fiesta-data.ts` | Toda la radiografía fiscal |
| `apps/web/src/lib/fiesta-calc.ts` | Calculadora personal (IRPF nodos, SS tipos, usa `IVA_POR_DECIL` / `RECAUDACION`) |
| `apps/web/src/lib/pensiones-data.ts` | Toda la radiografía de pensiones |
| `apps/web/src/components/EdadPensiones.tsx` | `ANIO_REF_PENSIONES` (año “hoy” de la edad) |
| `apps/web/src/components/PanelFiesta.tsx` | Prosa; importar de data cuando se pueda |
| `apps/web/src/components/PanelPensiones.tsx` | Prosa; ídem |
| `apps/web/src/components/FiestaGraficos.tsx` | ShareDato con números a veces fijos |
| `apps/web/src/components/PensionesGraficos.tsx` | ShareDato / leyendas con números fijos |
| `apps/monolith/src/shared/domain/comunidad.ts` | Quién gobierna cada CCAA y España (se pinta junto a los resúmenes del BOE) |

---

## Quién paga la fiesta (`fiesta-data.ts`)

### RECAUDACION_2024 (renombrar al año si cambia)

| Campo | Significado | Fuente prioritaria |
|-------|-------------|-------------------|
| `totalMillones` | Ingresos tributarios AEAT régimen común | AEAT — Informe anual de recaudación tributaria |
| `irpfMillones` | Recaudación IRPF | ídem |
| `ivaMillones` | IVA | ídem |
| `sociedadesMillones` | IS | ídem |
| `especialesMillones` | IIEE | ídem |
| `otrosMillones` | Resto (cuadre) | ídem / residual |
| `irpfPctTotal` | IRPF / total × 100 | derivado |
| `declarantesAprox` | Campaña Renta | AEAT / notas campaña |

**URLs de partida:**
- https://sede.agenciatributaria.gob.es (buscar «Informe anual de recaudación tributaria»)
- https://www.hacienda.gob.es

### HUECO_FISCAL

**El bloque más delicado de las dos páginas.** Se revisó en agosto de 2026
porque llevaba cifras que se citan mucho y se comprueban poco: 55.000 M€ de
evasión y 30.000 atribuidos a grandes patrimonios, casi la mitad del hueco.
Ninguna de las dos la sostenía un estudio publicado.

| Campo | Notas | Fuente |
|-------|-------|--------|
| `evasionMillones` | Centro de la horquilla, nunca el techo | FEDEA, brecha del IRPF (21.000–51.000 brutos; 11.300–41.300 netos tras el control de la AEAT) + brecha del IVA de hogares (9.428 M€ en 2022) |
| `elusionMillones` | **Coger la cifra ANUAL del informe, no prorratear ni usar acumulados.** TJN publica las dos: 8.455 M€/año de multinacionales + 935 M€/año de grandes fortunas = 9.385, y aparte un acumulado de 31.000 M€ para 2016-2021 | Tax Justice Network, State of Tax Justice |
| `grandesMillones` | Elusión corporativa + la parte del IRPF que cae en capital mobiliario | Derivado de los dos anteriores |
| `composicion[]` | Reparto de la brecha del IRPF por tipo de renta | FEDEA 2003-2022 |
| `referencias[]` | Educación, sanidad, defensa… | PGE / IGAE / notas presupuesto |

**TODO ESTE BLOQUE ES ANUAL.** Es el error más fácil de cometer y ya se ha
cometido dos veces en direcciones opuestas: primero metiendo el acumulado de
seis años de TJN como si fuera anual, y luego, al corregirlo, dividiéndolo entre
seis cuando la cifra anual ya estaba publicada en el mismo informe. Los
informes de elusión titulan con acumulados porque impresionan más; la cifra
anual está dentro. Comprobar siempre el periodo antes de copiar un número.

**Lo que hay que tener claro antes de tocar una de estas cifras:**

- La AEAT calcula su brecha fiscal por dentro y **no la publica** (lo dice la
  OCDE). Cualquier número «oficial» que aparezca por ahí, no lo es.
- El reparto por tipo de renta de FEDEA contradice la intuición: manda
  actividades económicas y capital inmobiliario (46-61 %), luego el trabajo, y
  el capital mobiliario —la renta típica de una gran fortuna— queda el último
  «a considerable distancia». **Es el dato que impide que el gráfico insinúe lo
  contrario de lo que dicen los estudios.** No lo quites.
- Las estimaciones sindicales (Gestha y similares) circulan mucho más que las
  académicas y salen sistemáticamente más altas porque parten de la economía
  sumergida. Si se usan, se dice de quién son y no se presentan como el dato.
- Hay un test que salta si `grandesMillones` pasa del 35 % del hueco o se sale
  de su horquilla: `apps/web/src/lib/datos.test.ts`. Si salta, la respuesta no
  es subir el techo.

### CONCENTRACION_IRPF

Cuota del IRPF por tramos. Fuente: **Estadística de declarantes del IRPF (AEAT)**.

### POBLACION_* / POBLACION_ROLES

| Bloque | Fuente |
|--------|--------|
| `POBLACION_ESPANA_MILLONES` | INE población residente |
| Ocupados / partes | EPA (INE) |
| Pensionistas / prestaciones | SS + simplificación didáctica |
| Niños &lt;16 | INE |

### GRUPOS_RENTA, TRAMOS_FINOS, ASALARIADOS_TRAMOS

Reparto de cuotas e incidencia. Fuentes: AEAT (declarantes, retenciones trabajo), **FEDEA Observatorio impuestos y prestaciones**, patrones IEF/INE para IVA.

### SALDO_QUINTILES

FEDEA (prestaciones − impuestos por quintil).

### MIX_IMPUESTOS / CARGA_AMPLIADA / CESTA_* / CESTA_TOP20_PCT

Cesta justa IRPF trabajo + capital + IS (incidencia) + IVA. Actualizar bases en `CARGA_AMPLIADA` y % por grupo; los agregados `CESTA_*` y `CARGA_POR_GRUPO` se derivan en el mismo fichero.

### IVA_POR_DECIL / IVA_META / IVA_TIPOS / IVA_RESUMEN

Incidencia del IVA por decil (tipo INE EPF / IEF). Tipos legales 4/10/21 en BOE / Hacienda.
**Ojo:** `fiesta-calc.ts` importa `IVA_POR_DECIL` para la calculadora.

### HERO

Copia de portada; alinear con `CESTA_TOP20_PCT` y umbral top 20 (~50k).

---

## Pensiones (`pensiones-data.ts`)

### INSTANTANEA

Nómina mensual más reciente SS.

| Campo | Fuente |
|-------|--------|
| `pensiones`, `pensionistas`, `nominaMensualMillones`, medias | Nota de prensa Seguridad Social (nómina del mes) |
| `afiliadosAprox`, `ratioCotizantes` | Afiliación media SS / ratio bruto |

**URL:** https://www.inclusion.gob.es · https://www.seg-social.es
EpData (agregador): https://www.epdata.es/datos/pensiones-graficos-datos/20/espana/106

### ANUAL_YYYY / POR_CLASE / GASTO_ANUAL

Cierre de ejercicio y desglose por clase (jubilación, viudedad…). Nota SS de diciembre / balance anual.

### PROYECCION_PIB

| Serie | Fuente |
|-------|--------|
| `airef` | AIReF — regla de gasto / sostenibilidad pensiones |
| `ministerio` | INTegraSS / Ministerio Inclusión |

Solo marcar `oficial: true` en hitos publicados.
https://www.airef.es

### PESO_FISCAL_PENSIONES

| Campo | Fuente |
|-------|--------|
| `presionFiscalPctPib` | OCDE Revenue Statistics / Eurostat (~38 % lectura) |
| `actual.gastoPensionesMillones` | = gasto contributivo anual |
| `actual.recaudacionAeatMillones` | AEAT (mismo ejercicio que fiesta si se puede) |
| `actual.cotizacionesSsMillones` | SS cuentas / orden de magnitud |
| `actual.gastoPctPib` | AIReF ancla |

`PESO_FISCAL_PROYECCION` se deriva de `PROYECCION_PIB.airef` + presión fiscal.

### RATIO_HISTORICO / RATIO_PROYECCION

Histórico divulgativo + proyección «&lt;2 cotizantes/pensionista ~2050» (AIReF/BdE orden de magnitud). Empalme en el año de `INSTANTANEA`.

### BRECHA_GENERO

Pensión media hombres/mujeres — nota SS o EpData del mismo mes que instantánea.

### REGLAS_JUBILACION

Edad ordinaria / cotización plena — normativa vigente LGSS (transición a 67).

### REVALORIZACION_ANUAL / MEI_ESCALA

IPC pensiones / tipo MEI — BOE y calendarios de reforma.

### GASTO_COMPARADO / GASTO_POLITICO

Barras verticales de «Pensiones y prestaciones frente al resto del gasto»
(segundo bloque de la página, `PensionesGastoComparado`).

| Campo | Fuente |
|-------|--------|
| `items[pensiones]` | `PESO_FISCAL_PENSIONES.actual.gastoPensionesMillones` + `DESEMPLEO_MILLONES` |
| `DESEMPLEO_MILLONES` | SEPE — gasto EJECUTADO del año, no el presupuesto inicial (se queda ~3.500 M€ corto) |
| `items[sanidad\|educacion\|defensa]` | Se LEEN de `HUECO_FISCAL.referencias` en `fiesta-data.ts`; no duplicar aquí. `COMPARATIVA_PENSIONES` lee de la misma función `referenciaGasto()` |
| Defensa | **Criterio OTAN** (% del PIB del informe anual), no presupuesto del Ministerio. Incluye clases pasivas militares → solapa con pensiones, declararlo |
| Sanidad | Estadística de Gasto Sanitario Público (Ministerio de Sanidad), sale en mayo con dos años de retraso |
| Educación | Estadística del Gasto Público en Educación, sale en marzo con año y medio de retraso |
| `INTERESES_DEUDA_MILLONES` | DERIVADO: `DEFICIT_2025.millones + SUPERAVIT_PRIMARIO_2025_MILLONES`. La nota de cierre de Hacienda da los dos; los intereses son su diferencia |
| `GASTO_POLITICO.partidas` | Presupuestos publicados: Cortes Generales, parlamentos autonómicos, subvenciones a partidos, Casa del Rey |
| `GASTO_POLITICO.amplioMillones` | Estimación amplia (añade altos cargos, eventuales y asesores). Horquilla, no liquidación |

Cautelas al actualizar:

- `estrechoMillones` se DERIVA de `partidas`: no fijarlo a mano.
- La barra del gráfico usa **la cifra amplia** a propósito (la que más abulta).
  Si se cambia ese criterio hay que reescribir el párrafo del desglose, que lo
  explica.
- «Gasto político» no es una partida presupuestaria. Circulan cifras de decenas
  de miles de millones que cuentan estructuras administrativas enteras: no
  usarlas.
- El remate en días (`~7 días`) se calcula solo desde la barra de referencia; no
  hay número escrito a mano que sincronizar.

### AYUDAS_SUBSISTENCIA

Bloque «¿Y las ayudas de subsistencia?», dentro de `PensionesPesoFiscal`.
Contesta con números al debate sobre ayudas a quien no trabaja o a inmigrantes,
así que es el bloque donde una cifra floja hace más daño.

| Campo | Fuente |
|-------|--------|
| `desempleo-asistencial` | DERIVADO: `DESEMPLEO_MILLONES` × `DESEMPLEO_ASISTENCIAL_PCT`. El % sale del reparto de la nómina mensual del SEPE (subsidio + agrario + RAI sobre el total) |
| `imv` | Ejecución presupuestaria de la Seguridad Social. Ojo: las notas suelen ser acumuladas a un mes, hay que elevarlas al año y decirlo |
| `otros-ss` | Subsidios no contributivos totales de la SS menos el IMV |
| `rentas-minimas` | Informe de Rentas Mínimas de Inserción (Ministerio de Derechos Sociales), sale con dos años de retraso |
| `acogida` | Presupuesto del sistema de acogida de protección internacional (Inclusión/Migraciones). Se amplía a mitad de año: usar la previsión actualizada, no la inicial |

**Las tres reglas de construcción están escritas en la web y no se pueden
romper al actualizar:**

1. Nada de lo que ya esté en el agregado de pensiones (PNC, complementos a
   mínimos) entra aquí.
2. La prestación contributiva por desempleo tampoco: solo el nivel asistencial.
3. La acogida de asilo se declara con su importe; el resto de prestaciones no
   se conceden por nacionalidad y eso se dice en la propia página.

Sanidad y educación quedan fuera a propósito: son servicios universales.

### HERO_PENSIONES / COMPARATIVA_PENSIONES / DATOS_CLAVE

Derivados de instantánea y anuales; al actualizar nómina, recalcular `millonesDia` ≈ nómina/30.

---

## Calculadora (`fiesta-calc.ts`)

| Bloque | Cuándo tocar |
|--------|----------------|
| `IRPF_EFECTIVO_NODOS` | Solo si se recalibra el tipo efectivo por renta (no cada mes) |
| `TIPO_SS_*`, `BASE_MAX_SS_ANUAL` | Cambio de tipos/bases SS |
| `DECILES_CALC` / cuotas | Si cambian pesos de recaudación por decil en fiesta-data |
| Import `IVA_POR_DECIL`, `RECAUDACION_*` | Automático al cambiar data |

---

## Gobiernos: Estado y comunidades (`comunidad.ts`)

Único bloque que no caduca por una estadística anual sino por un suceso con
fecha. Caduca en silencio y hacia el lado peor: el dato se muestra al lado de
puntos literales del BOE, así que un gobierno viejo contamina lo demás.

| Campo | Qué es | Cuándo cambia |
|-------|--------|---------------|
| `gobierno` | Partidos CON consejerías, en orden de peso | Elecciones, entrada o salida de un socio |
| `presidente` | Titular actual | Elecciones, dimisión a media legislatura |
| `desde` | Cuándo tomó posesión ESTE gobierno | Con cualquiera de los dos anteriores |
| `VERIFICADO_EL` | Fecha de la última revisión | **Todas las pasadas**, cambie o no algo |
| `codigo`, `nombre`, `alias` | Detección contra el campo `departamento` del BOE | Nunca (no son datos de actualidad) |

**Cómo revisarlo sin gastar 19 búsquedas:** primero la lista de presidencias
autonómicas, que da presidente y partido de las 19 de un vistazo. Solo cuando
un nombre no coincide con el baseline se busca la noticia del acuerdo de
gobierno de esa comunidad, que es la que dice **quién tiene consejerías** —el
dato que distingue una coalición real de un apoyo de investidura, y que la
lista de presidencias no da—.

**URLs de partida:**
- https://es.wikipedia.org/wiki/Anexo:Presidencias_autonómicas_españolas
- https://es.wikipedia.org/wiki/Anexo:Gobiernos_autonómicos_de_España
- Para cada cambio, la nota del acuerdo de gobierno con el reparto de
  consejerías (prensa autonómica o la web del propio partido)

**El Gobierno de España (`GOBIERNO_DE_ESPANA`)** se revisa igual que las
diecinueve, y es el más visible: se atribuye a toda disposición que no señala
a una comunidad, que son la mayoría. Fuente: la composición del Gobierno en
La Moncloa. Ojo con la diferencia entre remodelación (cambia un ministro, el
gobierno es el mismo) y cambio de gobierno (entra o sale un partido).

- https://www.lamoncloa.gob.es/gobierno/gobiernoinformo/
- https://es.wikipedia.org/wiki/Gobierno_de_España

**Trampas conocidas:**
- Vox salió de Aragón y Extremadura en julio de 2024 y volvió a las dos en
  2026. Un cambio de socios sin elecciones no aparece en ninguna lista de
  resultados electorales.
- Baleares aparece en muchas fuentes como «PP-Vox». No lo es: Vox apoya desde
  fuera y no tiene consejerías.
- Canarias suele resumirse como «CC-PP» y son tres: AHI tiene una consejería.
- El PSC no es «PSOE», ni el PSN, ni el PSE-EE. Van con sus siglas.

---

## Checklist de coherencia post-update

- [ ] `HUECO_FISCAL.grandesMillones` ≤ total hueco
- [ ] Suma `POBLACION_ROLES.millones` ≈ `POBLACION_ESPANA_MILLONES`
- [ ] Suma `POBLACION_TRABAJAN_PARTES` = rol trabajan
- [ ] `CESTA_TOP20_PCT` coherente con `GRUPOS_RENTA` altas
- [ ] `RATIO_PROYECCION[0].ratio` = último histórico / instantánea
- [ ] `ANIO_REF_PENSIONES` = año de `INSTANTANEA.periodo`
- [ ] Prosa Panel* y ShareDato sin cifras huérfanas
- [ ] Las 19 comunidades y el Gobierno de España revisados, `VERIFICADO_EL` al día
- [ ] `tsc --noEmit` OK
