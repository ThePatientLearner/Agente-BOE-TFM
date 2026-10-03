# Baseline de valores (snapshot)

**Fecha de este snapshot:** 2026-08-13
**Corte de datos en código:** fiesta AEAT **2025**; pensiones nómina **jul. 2026** + cierre contributivo **2025** (189.598 M€); AIReF pico **16,4 %** PIB en 2050.
**Actualización editorial:** agosto de 2026 (pasada de refresco + auditoría de coherencia).

> **Cómo comprobar que sigue cuadrando:** las invariantes numéricas de las dos
> páginas están descritas en «Invariantes» (abajo). Si se toca cualquier cifra,
> hay que repasarlas antes de dar la pasada por buena.

---

## Fiesta fiscal

### RECAUDACION_2025 (alias RECAUDACION_2024)
| Campo | Valor | Fuente |
|-------|------:|--------|
| periodo | 2025 | AEAT Informe anual 2025 |
| totalMillones | 325_356 | AEAT resumen (+10,4 % vs 2024) |
| irpfMillones | 142_466 | IMR/notas cierre (+10,1 %) |
| ivaMillones | 99_460 | +9,9 % sobre 2024 |
| sociedadesMillones | 42_263 | +8,1 % sobre 2024 |
| especialesMillones | 24_511 | +4,3 % sobre 2024 |
| otrosMillones | 16_656 | residual al total |
| irpfPctTotal | 43.8 | derivado |
| declarantesAprox | 23_500_000 | orden de magnitud |

### HUECO_FISCAL (sin cambio de pasada)
evasion 55_000 · elusion 8_000 · grandes 30_000 (escenarios; no acta AEAT)

### CARGA_AMPLIADA
IRPF de la cesta **derivado** de `RECAUDACION_2025.irpfMillones` (85 % trabajo /
15 % ahorro) → 121.096 + 21.370. Antes estaba a mano sobre un total viejo de
129.408 y se quedaba 13.058 M€ por debajo del IRPF del propio donut de la página.
periodo: **2025** (antes decía 2024 usando IS e IVA de 2025).

### CONCENTRACION_IRPF / GRUPOS / IVA deciles
Sin recálculo de fuente en esta pasada (FEDEA/AEAT declarantes: pendiente de
microdatos 2025), pero **sí de coherencia**: son dos universos distintos y ahora
se dice en cada bloque.

| Bloque | Universo | Top 20 % del IRPF |
|---|---|---|
| CONCENTRACION_IRPF · TRAMOS_FINOS | deciles de **declarantes** (~23,5 M) | 66 % |
| GRUPOS_RENTA · CARGA_AMPLIADA · IVA_POR_DECIL | deciles de **población** (48,6 M) | 55 % |

`GRUPOS_RENTA.cuotaIrpfPct` pasa de 6/34/60 a **7/38/55**, que es lo que da el
modelo de CARGA_AMPLIADA. Antes había tres respuestas a la misma pregunta (66,
60 y 54,5) conviviendo en la misma página.

---

## Invariantes (repasar tras cualquier cambio de cifras)

1. `nominaMensualMillones × 1e6 / pensiones = pensionMedia`.
2. `POR_CLASE`: importes suman `nominaDiciembreMillones`; recuentos suman
   `pensionesDiciembre` (±500 por redondeo de medias); `importe/recuento = media`.
3. Último punto de `GASTO_ANUAL` = `ANUAL_2025.gastoContributivoMillones`.
4. El cierre anual cae entre ~95,5 % y 100 % de `nominaDiciembre × 14`, y crece
   al menos lo que la revalorización.
5. Peso fiscal: `gastoPensionesMillones / esfuerzoFiscalMillones` ≡
   `gastoPctPib / presionFiscalPctPib`. Y contributivas < total pensiones.
6. `irpfTrabajoMillones + irpfCapitalMillones = RECAUDACION_2025.irpfMillones`
   = el IRPF de `MIX_IMPUESTOS`.
7. Cada fila de `CARGA_AMPLIADA.atribucion` suma 100; la de `iva` coincide con
   la suma de `cuotaIvaPct` de sus deciles (26,5 / 36,5 / 37).
8. Los tres `cuota*Pct` de `GRUPOS_RENTA` suman 100 y coinciden con
   `CARGA_POR_GRUPO` redondeado. `CESTA_TOP20_PCT` = el grupo «altas».
9. `TRAMOS_FINOS` suma 100 en cuota y población, y cuadra con
   `CONCENTRACION_IRPF` (top10 50, top20 66).
10. `POBLACION_ROLES` suma `POBLACION_ESPANA_MILLONES`.
11. `PERFILES`: `tipoEfectivo = irpfAnual/rentaAnual`; `ivaAnual/rentaAnual`
    coincide con el `ivaSobreRenta` del decil más cercano.
12. Los remates de `COMPARATIVA_PENSIONES` llevan el múltiplo a mano: contrastar
    con `COMPARATIVA_VECES` si cambia `anualMillones`.

---

## Pensiones

### INSTANTANEA (jul. 2026)
| Campo | Valor | Fuente |
|-------|------:|--------|
| pensiones | 10_517_634 | Nota Inclusión 28/07/2026 |
| pensionistas | 9_510_000 | ídem (~9,5 M) |
| nominaMensualMillones | 14_431.9 | ídem |
| pensionMedia | 1_372.2 | ídem |
| jubilacionMedia | 1_573.7 | ídem |
| afiliadosAprox | 22_400_000 | orden magnitud 2026 |
| ratioCotizantes | 2.4 | bruto afiliados/pensionistas |

### ANUAL_2025
gastoContributivoMillones **189_598** · revalorización IPC 2,8 %

Récord de la serie, +6,2 % sobre los 178.500 M€ de 2024. Se descompone en
162.985 M€ de nóminas mensuales + 26.413 M€ de las dos pagas extra.
El valor anterior (182.526) era incompatible con la propia nómina de diciembre
(13.750,1 × 14 = 192.501) e implicaba un crecimiento anual de solo +2,3 % con
una revalorización del 2,8 %: era la cifra de 2024 etiquetada como 2025.

### POR_CLASE
Recuentos de jubilación (6.646.658) y viudedad (2.349.616) **derivados de
importe/media**, no redondeados a la centena de mil: así el desglose reproduce
`nominaDiciembreMillones` y `pensionesDiciembre`.

### REGLAS_JUBILACION
edadOrdinaria **66 a. 10 m.** (2026) · aniosCotizacionPlena **38,25** (38 a. 3 m.)
edadPlena 67 y 38,5 años llegan en **2027**. Los dos valores van del brazo:
antes la edad iba con el calendario de 2025 y los años con el de 2027.

### PROYECCION_PIB
| Serie | 2050 | Fuente |
|-------|------:|--------|
| AIReF | **16,4 %** | Estudio evaluación regla de gasto mayo 2026 |
| Ministerio INTegraSS | 15,3 % | sin cambio |

### PESO_FISCAL
presion 38 % · recaudacionAeat **325_356** · cotiz SS ~170_000 · gastoPctPib ancla 13,0
PIB nominal 2025 **1_687_152** (INE, CNTR 4T2025).

Universos, que es donde estaba el lío:
- `gastoContributivoMillones` = solo contributivas SS (189.598 = 11,2 % del PIB).
- `gastoPctPib` 13 % = agregado AIReF (contributivas + clases pasivas + no
  contributivas). Es el que continúa en PROYECCION_PIB y el que manda en el %.
- `gastoPensionesMillones` y `esfuerzoFiscalMillones` se **derivan del PIB**, así
  que el % en euros y el % del modelo coinciden por construcción: 13/38 = 34,2 %.
- AEAT + cotizaciones (495.356) **no** son el esfuerzo fiscal total: falta
  forales, CCAA y locales. No presentarlos como si sumaran.

### RATIO
Histórico 2026: **2,4** · Proyección 2050: 1,7

### ANIO_REF_PENSIONES
2026 (sin cambio)

### GASTO_COMPARADO (barras del segundo bloque)
Pensiones y prestaciones **243.730 M€** (219.330 del agregado AIReF + 24.400 de
desempleo, 2025) · sanidad **101.739** (2024) · educación **71.349** (2024) ·
intereses **40.314** (2025) · defensa **33.743** (2025) · gasto político y Casa
Real **4.500** (estimación amplia).

Sanidad, educación y defensa **no viven aquí**: se leen de
`HUECO_FISCAL.referencias` (`fiesta-data.ts`). Si cambian allí, cambian solas —y
también cambia `COMPARATIVA_PENSIONES`, que desde 2026-08-16 lee de la misma
fuente en vez de tener su propia copia.

Cada barra lleva `anio` y se pinta en la web: sanidad y educación cierran con
año y medio de retraso y no se extrapolan.

Defensa va por **criterio OTAN** (2,0 % del PIB), no por presupuesto del
Ministerio, que es menos de la mitad. Incluye clases pasivas militares, así que
solapa un poco con la barra de pensiones: está declarado en el pie del gráfico.

Intereses **no se copian de ninguna nota**: se derivan de
`DEFICIT_2025.millones + SUPERAVIT_PRIMARIO_2025_MILLONES` (36.780 + 3.534), que
es la definición de saldo primario. Si se actualiza el déficit, se mueven solos.

### AYUDAS_SUBSISTENCIA
Total **16.918 M€** (2,6 % del esfuerzo fiscal, ~3 € de cada 100): subsidios
asistenciales de desempleo 7.588 (31,1 % del gasto del SEPE) · IMV 4.550 (4.170
ene–nov 2025 elevados al año) · otros subsidios no contributivos SS 2.150 ·
rentas mínimas autonómicas 1.650 (informe 2023) · acogida de protección
internacional 980.

Contrastes que publica la página: las pensiones son **×13** todo el bloque, y
la acogida de asilo son **15 céntimos de cada 100 €**.

El total es además la base de la **tercera palanca del simulador**, que va de
−100 % (quitarlas enteras) a +100 % (doblarlas). Ojo al actualizarlo: esa
palanca NO multiplica por las 14 pagas, porque el importe ya es anual.

Referencia con las cifras de hoy: quitarlas del todo ahorra 16,9 mil M€ y deja
el IRPF en el 88,1 % de lo que se recauda (80,2 % si solo se devolviera a los
sueldos de menos de 50.000 €, 19,8 % si solo a los de menos de 25.000 €).

### GASTO_POLITICO
Desglose estrecho **758 M€**: parlamentos autonómicos 430 (última recopilación
completa: 388 en 2021) · Congreso 109 + Senado 68 + gastos comunes 83 = 260
(2025) · financiación estatal de partidos 60 (13,17 M€/trimestre en el BOE ≈ 53
al año, más seguridad) · Casa del Rey 8,4 (asignación PGE congelada desde 2022;
con las partidas de otros ministerios se estima ~105).
Horquilla publicada: 758 M€ (estrecha) – 4.500 M€ (amplia).

**No sumar los grupos parlamentarios** a la línea de partidos: ya van dentro del
presupuesto de las cámaras y se contarían dos veces.

---

## Historial de pasadas

| Fecha | Qué se hizo |
|-------|-------------|
| 2026-08-12 | Baseline inicial del skill |
| 2026-08-12 | Refresco: AEAT 2025 total/IRPF/IS/IVA; gasto pensiones 182.526; AIReF 16,4 %; ratio 2,4; nómina jul. 2026 afinada |
| 2026-08-13 | Auditoría de coherencia: cierre 2025 corregido a 189.598; cesta IRPF derivada de AEAT; universos declarantes/población separados; peso fiscal anclado al PIB; calendario de jubilación 2026; recuentos de POR_CLASE derivados. Añadidas las invariantes de arriba |
| 2026-08-16 | Alta de bloque: `GASTO_COMPARADO` / `GASTO_POLITICO` (barras verticales del gasto público, segundo bloque de /pensiones). Datos nuevos: desempleo 21.000, intereses 40.000, gasto político 779–4.500 |
| 2026-08-16 | Revisión de las barras de gasto: defensa 20.000 → 33.743 (criterio OTAN), educación 58.000 → 71.349 (EGPE 2024), sanidad 95.000 → 101.739 (EGSP 2024), desempleo 21.000 → 24.400 (cierre SEPE 2025), intereses derivados del saldo primario (40.314). Fin de la copia doble de defensa/educación entre `HUECO_FISCAL` y `COMPARATIVA_PENSIONES` |
| 2026-08-16 | Alta de `AYUDAS_SUBSISTENCIA`: barra de ayudas (2,6 %) junto a la de pensiones (34,2 %) en el bloque de esfuerzo fiscal, con desglose de cinco partidas y las reglas de no duplicar, más tercera palanca en el simulador (−100 % a +100 %) |

### HUECO_FISCAL (revisado 2026-08-16)
Todo **anual**. Evasión **36.000** (horquilla 21.000–51.000) · elusión **9.400**
(7.000–13.000) · grandes patrimonios y empresas **11.000** (8.000–15.000, el
24 % del hueco) · total **45.400**.

Antes: 55.000 / 8.000 / 30.000 = 63.000, con el 48 % atribuido a grandes
patrimonios. La rebaja no es de criterio: las cifras nuevas tienen estudio
detrás (FEDEA para IRPF e IVA, TJN para elusión).

La elusión se corrigió dos veces el mismo día: 8.000 (acumulado tomado como
anual) → 5.500 (acumulado dividido entre seis) → **9.400**, que es la suma de
las dos cifras anuales que publica TJN, 8.455 de multinacionales y 935 de
grandes fortunas. Moraleja anotada en el mapa de fuentes: buscar la anual, no
prorratear.

| 2026-08-16 | Revisión del hueco fiscal: evasión a la horquilla de FEDEA (36.000), elusión a la cifra ANUAL de TJN (9.400), grandes patrimonios de 30.000 a 11.000, y alta de `composicion` con el reparto por tipo de renta |

### Alemania (paises-fiscal.ts, revisado 2026-08-17)
Grundfreibetrag **12.348** · topes de cotización **101.400** (RV/AV) y **69.750**
(KV/PV) · KV **8,75 %** cada parte (14,6 % + 2,9 % de recargo medio de caja) ·
PV **1,8 %** cada parte, y el recargo de 0,6 puntos por no tener hijos va como
opción, no en el tipo base.

Tres ticks nuevos: `splitting` (Ehegattensplitting), `iglesia` (Kirchensteuer
9 %) y `sinHijos`. España lleva `conjunta` (reducción de 3.400 € en base) para
que la comparación no premie a Alemania por una figura que existe en los dos.

Referencia con 60.000 € brutos: soltero, España deja el 49,6 % del coste del
puesto y Alemania el 42,7 %; con los dos casados y un solo sueldo, 51,4 % y
49,8 %.

| 2026-08-17 | Alta de opciones fiscales por país: splitting alemán, Kirchensteuer, recargo sin hijos y conjunta española. Cifras alemanas de 2026 (mínimo exento, dos topes de cotización, KV al 17,5 %) |


### Gobiernos: Estado y CCAA (comunidad.ts, verificado 2026-08-20)

Los 20, para no volver a derivarlos. `VERIFICADO_EL = "2026-08-20"`.

| Ámbito | Gobierno | Presidente | Desde |
|--------|----------|------------|-------|
| **España** | **PSOE+Sumar** | **Pedro Sánchez** | **noviembre de 2023** |

Sin elecciones generales celebradas a esta fecha; la legislatura vence en
2027. En marzo de 2026 hubo remodelación (Montero deja Hacienda para ir a las
andaluzas, Cuerpo pasa a vicepresidente primero), pero NO cambio de gobierno:
la coalición es la misma.

| CCAA | Gobierno | Presidente | Desde |
|------|----------|------------|-------|
| Andalucía | PP+VOX | Juanma Moreno | julio de 2026 |
| Aragón | PP+VOX | Jorge Azcón | mayo de 2026 |
| Asturias | PSOE+IU | Adrián Barbón | julio de 2023 |
| Cantabria | PP | M.ª José Sáenz de Buruaga | julio de 2023 |
| Castilla-La Mancha | PSOE | Emiliano García-Page | julio de 2023 |
| Castilla y León | PP+VOX | Alfonso Fernández Mañueco | junio de 2026 |
| Canarias | CC+PP+AHI | Fernando Clavijo | julio de 2023 |
| Cataluña | PSC | Salvador Illa | agosto de 2024 |
| Ceuta | PP | Juan Jesús Vivas | junio de 2023 |
| Comunitat Valenciana | PP+VOX | Juanfran Pérez Llorca | diciembre de 2025 |
| Extremadura | PP+VOX | María Guardiola | abril de 2026 |
| Galicia | PP | Alfonso Rueda | abril de 2024 |
| Illes Balears | PP | Marga Prohens | julio de 2023 |
| La Rioja | PP | Gonzalo Capellán | julio de 2023 |
| Madrid | PP | Isabel Díaz Ayuso | junio de 2023 |
| Melilla | PP | Juan José Imbroda | julio de 2023 |
| Navarra | PSN+Geroa Bai+Contigo | María Chivite | agosto de 2023 |
| País Vasco | PNV+PSE-EE | Imanol Pradales | junio de 2024 |
| Región de Murcia | PP | Fernando López Miras | julio de 2023 |

**Lo que se movió en los doce meses anteriores a este snapshot** (cuatro de
diecinueve, todas a PP+VOX): C. Valenciana (dic. 2025, tras la dimisión de
Mazón), Extremadura (abr. 2026, elecciones anticipadas de dic. 2025), Aragón
(may. 2026, anticipadas de feb. 2026 por los presupuestos), Castilla y León
(jun. 2026, tras las de marzo) y Andalucía (jul. 2026, PP pierde la mayoría
absoluta el 17 de mayo). Ninguna la habría acertado un modelo de memoria.

**Legislaturas que vencen antes de la próxima ronda larga:** las de julio y
agosto de 2023 agotan mandato en 2027. A partir de la primavera de 2027 hay
que contar con que casi toda la tabla se mueva.

| 2026-08-19 | Alta de la tabla de gobiernos autonómicos: 19 comunidades con partidos, presidente y fecha de toma de posesión, verificadas una a una contra fuentes públicas |
| 2026-08-20 | Alta del Gobierno de España (PSOE+Sumar) como caso por defecto: lo que no señala a una comunidad se atribuye al Estado, así que la etiqueta deja de faltar en la mayoría de disposiciones |
