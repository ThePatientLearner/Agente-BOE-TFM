---
name: actualizar-datos-radiografias
description: >
  Actualiza los datos curados de «¿Quién paga la fiesta?» y «Pensiones en
  España» —y la tabla de quién gobierna cada comunidad autónoma— con las
  cifras y fuentes oficiales más recientes, sin cambiar la UI ni la
  estructura narrativa. Use when: actualizar datos, refrescar pensiones,
  actualizar fiesta fiscal, "datos más recientes", AEAT, AIReF, nómina SS,
  gobiernos autonómicos, elecciones autonómicas,
  /actualizar-datos-radiografias.
---

# Actualizar datos · fiesta fiscal + pensiones

**Objetivo:** cambiar solo **números, periodos y redondeos** en los ficheros
de datos (y la prosa que los repite). **No** rediseñar componentes, CSS ni
layout.

**Antes de tocar nada:** lee `references/mapa-y-fuentes.md` y
`references/baseline.md`. Ahí está de dónde salió cada bloque y el valor
actual. No reanalices el repo desde cero.

## Alcance

| Zona | Fichero de verdad | Prosa a revisar si cambian cifras |
|------|-------------------|-----------------------------------|
| Quién paga la fiesta | `apps/web/src/lib/fiesta-data.ts` | `PanelFiesta.tsx`, textos ShareDato en `FiestaGraficos.tsx`, nodos de `fiesta-calc.ts` solo si cambian tramos/IVA por decil |
| Pensiones | `apps/web/src/lib/pensiones-data.ts` | `PanelPensiones.tsx`, ShareDato en `PensionesGraficos.tsx`, `EdadPensiones.tsx` (`ANIO_REF_PENSIONES` si cambia el año de la instantánea) |
| Calculadora fiscal | `apps/web/src/lib/fiesta-calc.ts` | Solo si se actualiza `IVA_POR_DECIL` o umbrales de renta (importa desde `fiesta-data`) |
| Gobiernos (Estado + CCAA) | `apps/monolith/src/shared/domain/comunidad.ts` | Ninguna: el dato se pinta solo, no hay prosa que lo repita |

Colores, ids de tramo, estructura de arrays y componentes: **no tocar** salvo
que un tramo oficial nuevo lo exija (entonces documentarlo en baseline).

## Flujo (obligatorio)

1. **Leer referencias del skill** (`mapa-y-fuentes.md`, `baseline.md`).
2. **Elegir corte temporal** (ej. «cierre 2025 + nómina más reciente SS +
   última AIReF»). Anótalo.
3. **Recabar fuentes** con las URLs del mapa (web_search / open_page). Preferir:
   - documentos oficiales (AEAT, SS, AIReF, INE, OCDE)
   - no blogs ni capturas sin enlace
4. **Actualizar solo campos** en `fiesta-data.ts` / `pensiones-data.ts`
   (y `fiesta-calc.ts` si aplica). Mantener redondeos de lectura (enteros o
   1 decimal donde ya había).
5. **Sincronizar derivados:**
   - `HUECO_FISCAL_TOTAL_MILLONES` (suma)
   - `CESTA_*`, `CARGA_POR_GRUPO`, `PESO_FISCAL_PROYECCION` (se calculan al
     importar; si cambias inputs, recompila mentalmente coherencia)
   - `RATIO_PROYECCION[0]` debe empalmar con el último punto de
     `RATIO_HISTORICO` / `INSTANTANEA.ratioCotizantes`
   - `PESO_FISCAL_PENSIONES.actual.recaudacionAeatMillones` alineado con
     `RECAUDACION_*` de fiesta si se reutiliza el mismo ejercicio
   - `ANIO_REF_PENSIONES` en `EdadPensiones.tsx` = año de `INSTANTANEA`
6. **Prosa hardcodeada:** buscar en paneles/ShareDato cifras que no lean del
   data file (`190.000`, `16,1 %`, `agosto de 2026`, etc.) y alinearlas.
   Script: `bash .grok/skills/actualizar-datos-radiografias/scripts/check-prose.sh`
7. **Comprobar antes de darte por terminado:**
   - `npm run typecheck` (los dos workspaces)
   - `npm test` — incluye `apps/web/src/lib/datos.test.ts`, los invariantes de
     los datos curados. Si salta una banda de plausibilidad, la pregunta no es
     «¿subo el límite?» sino «¿de dónde salió este número?». Solo se toca el
     rango cuando el dato nuevo está confirmado, y con su comentario al día.
8. **Actualizar `references/baseline.md`** con los nuevos valores y la fecha
   de la pasada (ahí se ahorran tokens la próxima vez).
9. **Commit** solo si el usuario pide push/commit. Mensaje tipo:
   `Actualizar datos de pensiones y quién paga la fiesta (corte YYYY-MM).`
   Si esta pasada la ha lanzado el cron (`scripts/actualizar-datos.sh`), NO
   commitees: de eso se encarga el script, que además abre el PR.

## Gobiernos: Estado y comunidades (`comunidad.ts`)

Es la única zona fuera de `apps/web/src/lib`, y la única que caduca por un
suceso con fecha —una elección o una ruptura de coalición— en lugar de por la
publicación de una estadística anual. **Se revisan TODAS las pasadas: las 19
autonomías y el Gobierno de España** (`GOBIERNO_DE_ESPANA`), que es el que se
atribuye a toda disposición que no señala a una comunidad concreta, o sea a
media portada.
No es opcional: el dato sale al lado de resúmenes que son literales del BOE, y
si miente, mancha lo demás.

Qué comprobar en cada una:

1. **¿Ha habido elecciones desde `VERIFICADO_EL`?** Generales, autonómicas, o
   anticipadas por ruptura de presupuestos (así llegaron las de Aragón en
   febrero de 2026).
2. **¿Ha entrado o salido algún socio del gobierno?** Vox salió de Aragón y
   Extremadura en julio de 2024 y volvió a las dos en 2026. Un cambio de socios
   sin elecciones de por medio es el fallo más fácil de pasar por alto.
3. **¿Sigue el mismo presidente?** Dimisiones a media legislatura: Mazón dejó
   la Generalitat Valenciana en noviembre de 2025.
4. **En el Estado, cuidado con confundir remodelación y cambio de gobierno.**
   Que un ministro se vaya no cambia quién gobierna: en marzo de 2026 Montero
   dejó Hacienda para ir a las andaluzas y la coalición siguió siendo la
   misma. Solo se toca `gobierno` si entra o sale un PARTIDO.

Criterio para `gobierno` (el array que se pinta como `PP+VOX`):

- Entra **quien ocupa consejerías**, no quien apoya la investidura desde fuera.
  Baleares es `PP` aunque Vox la sostenga; Canarias es `CC+PP+AHI` porque AHI
  tiene una consejería, pero la ASG queda fuera porque apoya desde fuera.
- Orden por peso en el gobierno, empezando por el partido del presidente.
- Siglas como las usa la propia formación (`PSC`, `PSN`, `PSE-EE`, `CC`), no
  normalizadas a la marca estatal: en Cataluña gobierna el PSC.
- **No juzgar la coalición, enumerarla.** Ni adjetivos, ni bloques
  («izquierda», «derecha»), ni orden por ideología.

Y siempre:

- **Sube `VERIFICADO_EL` a la fecha de la pasada aunque no cambie ningún
  gobierno.** La web muestra esa fecha; si no se toca, el sello envejece y deja
  de significar nada. Es también la señal de que el cron sigue vivo, así que
  esta zona sí abre PR todos los meses (una línea) aunque el resto no tenga
  nada.
- **`GOBIERNO_DE_ESPANA` no tiene `alias` y no debe tenerlos.** No se detecta,
  se deduce: es el caso por defecto. Si se le pusieran, "España" aparecería en
  medio título del boletín ("Banco de España") y ensuciaría la detección
  autonómica, que sí es literal.
- **No toques `codigo` ni `alias`.** Son la clave de detección contra el campo
  `departamento` del BOE, no un dato de actualidad; cambiarlos deja
  disposiciones sin etiquetar sin que falle nada.
- Fuentes: la lista de presidencias autonómicas y, para cada cambio, la noticia
  del acuerdo de gobierno con el reparto de consejerías —que es lo que
  distingue «entra en el gobierno» de «apoya la investidura»—.

## Reglas de curación

- **Orden de magnitud > precisión falsa.** Esta web redondea a propósito.
- **Un solo ejercicio por bloque** cuando se pueda (no mezclar AEAT 2023 con
  IRPF de 2021 en el mismo KPI sin etiquetar).
- **`oficial: true`** en proyecciones solo para hitos que cite la fuente;
  intermedios = interpolación divulgativa (`oficial: false`).
- **Hueco fiscal / grandes patrimonios** son escenarios, no actas AEAT: si no
  hay cifra nueva fiable, deja horquilla y nota en baseline.
- Si una fuente no publica aún el año pedido, **no inventes**: conserva el
  dato anterior y anota «pendiente de [fuente]» en baseline.
- Tras cambiar % de cesta / top20, revisa que `CESTA_TOP20_PCT.conIva` y
  `.sinIva` sigan coherentes con `GRUPOS_RENTA` / `CARGA_AMPLIADA`.

## Si te lanza el cron

`scripts/actualizar-datos.sh` corre este skill el día 5 de cada mes sin nadie
delante. En ese caso:

- Escribe `INFORME.md` en la raíz con la tabla campo → antes → después → URL.
  Es lo que acaba en el cuerpo del pull request; sin él, quien revise no tiene
  de dónde agarrarse.
- Si no hay dato nuevo, escribe exactamente `sin cambios` y no toques nada más.
  Es el resultado más probable: casi todas estas estadísticas son anuales.
- No salgas de los ficheros de datos y su prosa. El script aborta si tocas
  cualquier otro sitio, y entonces el trabajo se queda sin publicar.
- Los gobiernos autonómicos NO entran en el «sin cambios»: aunque ninguno haya
  cambiado, `VERIFICADO_EL` sube y eso ya es un cambio. En ese caso el INFORME
  debe decir cuántas comunidades se revisaron y que ninguna se movió.

## Qué no hacer

- No reescribir gráficos ni CSS.
- No añadir APIs en vivo (el diseño es datos curados en TS).
- No re-leer todo `FiestaGraficos.tsx` / `PensionesGraficos.tsx` salvo diff de
  strings con números hardcodeados.
- No tocar BOE / subvenciones / monolito, **con una única excepción**:
  `apps/monolith/src/shared/domain/comunidad.ts`, que es un dato curado más
  aunque viva ahí. Nada de lógica, adapters ni esquemas.

## Salida al usuario

Lista breve:

1. Corte temporal usado
2. Tabla **campo → valor anterior → valor nuevo → fuente** (solo cambios)
3. Prosa tocada
4. Pendientes / horquillas sin fuente nueva
5. Si pidió push: commit hash
