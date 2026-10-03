# Instrucciones para agentes

Lo que hay que saber antes de tocar este repositorio, y que no se deduce
leyendo el código. Si eres una IA trabajando aquí, lee esto entero primero:
casi todo lo de abajo son cosas que ya han roto algo alguna vez.

`README.md` cuenta **qué** hace el proyecto. Este fichero cuenta **cómo** se
trabaja en él.

---

## 1. Dónde está todo

- El repo vive en **`/opt/boe-inspector`**. Las sesiones suelen abrirse con el
  directorio de trabajo en `/root`, que no es un repositorio. Si alguien dice
  «haz el merge» o «arregla X» sin dar una ruta, se refiere a este repo.
- Monorepo de npm workspaces con dos paquetes:
  - `@boe-inspector/monolith` (`apps/monolith`) — ingesta del BOE, resúmenes
    con IA, notificaciones y la API que sirve el catálogo.
  - `@boe-inspector/web` (`apps/web`) — Next.js. Consume la API, no la base.

```bash
npm test                 # los dos workspaces
npm run typecheck        # los dos workspaces
npm run check:boundaries # fronteras entre módulos (depcruise)
npm run build --workspace @boe-inspector/web
```

**No hay prettier ni eslint en el repo.** No los introduzcas de rebote: un
`npx prettier --write` reformatea ficheros enteros y convierte un cambio de
tres líneas en un diff ilegible.

---

## 2. Arquitectura en un minuto

Monolito modular con event bus en proceso. Cuatro módulos —`ingestion`,
`summarization`, `notifications`, `catalog`— más `spending` (subvenciones) y
`juego` (el marcador del juego de la web).

Los dos últimos viven fuera del bus: no emiten eventos ni se suscriben a
ninguno, porque nada del BOE depende de que se ingieran subvenciones o de que
alguien juegue una partida.

```
BOE → ingestion ──EntryIngested──→ summarization ──SummaryGenerated──→ notifications
                        │                                    │
                        └────────────→ catalog ←─────────────┘
                                    (proyección de lectura)
```

Dos reglas que `check:boundaries` vigila y que conviene entender antes de
pelearse con ellas:

1. **Ningún módulo lee las tablas de otro.** Todo lo que un consumidor
   necesita viaja en el payload del evento, aunque eso signifique duplicar
   campos. Por eso `SummaryGenerated` lleva `department` y `title`: sin ellos,
   `notifications` no podría resolver la comunidad autónoma sin cruzar la
   frontera.
2. **`catalog` es una proyección desnormalizada y reconstruible.** Duplica
   datos a propósito para que la API responda con una sola consulta. La
   fuente de verdad sigue siendo cada módulo.
3. **La API HTTP escribe en `juego` y `electricidad`.** `electricidad` gestiona
   cuentas y sesiones del área de estudio en su propio esquema, sin acceso
   a otros módulos. Los HTML de estudio viven en `apps/web/private/` y se
   sirven solo tras comprobar la sesión; nunca deben volver a `public/`.
   Para `juego`: No es un descuido
   de la regla `api-solo-lectura`: la partida termina en el navegador del
   jugador y no hay otra puerta por la que pueda entrar. Los módulos del BOE
   se escriben desde el cron y la CLI, y siguen prohibidos ahí a propósito.

Trampa de orden: `catalog` DEBE suscribirse antes que `summarization`, porque
`SummarizeEntry` emite `summary-generated` desde dentro de su handler de
`entry-ingested`. Si se invierte, el resumen llega antes de que exista la fila
que hay que actualizar y se pierde en silencio. La composición lo garantiza;
no la reordenes.

---

## 3. Datos curados (lo más fácil de estropear)

Hay cifras y hechos elegidos a mano que **caducan en silencio**: nada falla,
simplemente pasan a ser mentira.

| Fichero | Qué contiene | Caduca cuando |
|---------|--------------|---------------|
| `apps/web/src/lib/fiesta-data.ts` | Radiografía fiscal | Publica AEAT / FEDEA / TJN |
| `apps/web/src/lib/pensiones-data.ts` | Radiografía de pensiones | Publica Seguridad Social / AIReF |
| `apps/web/src/lib/paises-fiscal.ts` | Comparativa internacional | Cambia la fiscalidad de un país |
| `apps/monolith/src/shared/domain/comunidad.ts` | Quién gobierna cada CCAA y España | **Hay elecciones o se rompe una coalición** |

Los revisa una pasada automática el día 5 de cada mes
(`scripts/actualizar-datos.sh`), que sigue el skill
`.grok/skills/actualizar-datos-radiografias/` y abre un PR. Nunca escribe en
`main`.

### Reglas al tocar esta zona

- **La red de seguridad son los invariantes**, no el compilador:
  `apps/web/src/lib/datos.test.ts` para las radiografías,
  `apps/monolith/src/shared/domain/comunidad.test.ts` para los gobiernos.
  TypeScript compila igual de contento con 101.739 que con 1.017.390.
- Si salta una banda de plausibilidad, la pregunta es **de dónde sale el
  número**, no cuánto hay que subir el límite.
- Cada cifra que cambies lleva su fuente y su año en el comentario del código.
- Si una fuente no ha publicado dato nuevo, **no extrapoles**: deja el valor
  anterior y anótalo como pendiente en `references/baseline.md`.

### Los gobiernos tienen reglas propias

`comunidad.ts` es la única zona de datos curados fuera de `apps/web/src/lib`.
Vive en el monolito porque la etiqueta («Afecta a Extremadura (gobierna
PP+VOX)», «Gobierno de España (PSOE+Sumar)») se resuelve al servir cada
respuesta y se muestra junto a resúmenes que son literales del BOE. Si miente,
mancha lo demás.

**Nunca es nula.** Si la disposición no señala a ninguna comunidad, la firma
el Estado: eso es lo que significa que el departamento sea un ministerio. El
Gobierno de España vive en `GOBIERNO_DE_ESPANA`, aparte de la lista y **sin
alias**, porque no se detecta sino que se deduce — con alias, «España» saltaría
en medio título del boletín («Banco de España») y ensuciaría la detección
autonómica, que sí es literal.

- **Nunca preguntes a un modelo quién gobierna.** Al montar la tabla en agosto
  de 2026, cuatro de las diecinueve autonomías habían cambiado de socios en
  doce meses. Un modelo con fecha de corte las habría dado todas mal.
- **En la etiqueta va quien tiene consejerías**, no quien apoya la investidura
  desde fuera. Baleares es `PP` aunque Vox la sostenga; Canarias es
  `CC+PP+AHI` porque AHI tiene una consejería.
- **`VERIFICADO_EL` sube en cada pasada**, cambie o no un gobierno: esa fecha
  sale a la web como «dato verificado el …».
- **Remodelación no es cambio de gobierno.** Que se vaya un ministro no toca
  `gobierno`; solo lo hace la entrada o salida de un PARTIDO.
- **`codigo` y `alias` no son datos de actualidad.** Son la clave de detección
  contra el campo `departamento` del BOE. Cambiarlos deja disposiciones sin
  etiquetar sin que falle nada.
- **Los tests NO deben afirmar sobre partidos concretos.** El cron puede
  editar `comunidad.ts` pero no su fichero de tests (ver el `PERMITIDOS` de
  `scripts/actualizar-datos.sh`). Un test que diga «Extremadura es PP+VOX» se
  rompe solo en las siguientes elecciones y tumba la pasada entera sin que
  nadie pueda arreglarlo desde dentro. Prueba el comportamiento con datos de
  mentira; de los reales, solo lo que ninguna elección cambia.
- Por el mismo motivo, **nada de tests que caduquen con el reloj**. Comprobar
  que `VERIFICADO_EL` es una fecha válida y no futura, sí; que sea reciente,
  no: rompería el build por el mero paso del tiempo.

---

### El juego y su premio

`apps/web/public/juego/suscriban.html` es el juego, un solo fichero con el
lienzo, los sprites en base64 y su propia lógica. Se sirve estático y la
página `/juego` lo mete en un iframe: se adueña del viewport entero
(`position: fixed`, teclado capturado) y embebido sin marco arrasaría con el
layout del sitio.

- **El marcador que llega del navegador es falsificable.** El juego corre
  entero en el cliente. `validarPartida` descarta lo imposible (un millón de
  euros en doce segundos) y hay un límite por IP, pero eso solo mantiene
  legible el ranking público. **Al ganador del premio hay que verificarlo a
  mano**; el código de partida es el hilo del que tirar.
- **El código se entrega una vez y no se puede volver a consultar.** No hay
  cuentas: es lo único que prueba que una partida fue de quien dice. Si
  alguna vez se añade un "recupera mi código", deja de probar nada.
- **`PARTIDAS_DE_SALIDA` (200) no son partidas reales.** Es un número de
  cortesía para que el contador de la portada no salga a cero, y se suma solo
  al mostrarlo. La tabla `juego.partidas` cuenta únicamente lo que ha pasado:
  cualquier informe que salga de ella no lleva ese sumando. Ponerlo a 0
  devuelve el contador a la realidad.

## 4. Despliegue

Lee esto antes de ejecutar nada: la topología no es la que parece.

- **Esta máquina ES el VPS de producción.** Los contenedores `app`, `db` y
  `tunnel` corren aquí.
- **`scripts/deploy-vps.sh` es Mac → VPS.** Desde el propio VPS no aplica.
- **La web va por Vercel**, que despliega solo al hacer push a `main`. El
  servicio `web` no se levanta aquí.
- **La API se despliega en sitio**, y solo el servicio `app`:

```bash
cd /opt/boe-inspector
docker compose -f docker-compose.prod.yml up -d --build app
curl -s http://127.0.0.1:3001/health
```

- **Nunca hagas `up -d --build` sin nombrar el servicio.** El `tunnel` está en
  el perfil `cutover` a propósito: un túnel con nombre admite varias réplicas
  y Cloudflare reparte el tráfico entre todas.
- El push a `main` NO redespliega la API. Son dos pasos.
- Hay unos segundos de corte en `api.agenteboe.com` al reiniciar `app`.
  Comprueba el `/health` después, no lo des por bueno.

---

## 5. Git

- **Los merges a `main` son fast-forward.** Rama de trabajo, commit,
  `git merge --ff-only`, borrar la rama. El historial de `main` es lineal y no
  lleva commits de merge.
- **Tratar el código como material publicable.** El repositorio original se
  comprobó privado el 4 de octubre de 2026; la visibilidad de una entrega debe
  verificarse antes de anunciarla. Nada de credenciales, ni la IP del VPS
  (vive en `deploy/.vps-target`, gitignorado).
- Mensajes de commit: asunto en infinitivo describiendo el efecto, no el
  fichero («Decir quién gobierna la comunidad que una disposición afecta», no
  «feat: add comunidad.ts»). El cuerpo explica **por qué**, con las cifras o
  el caso concreto que lo motivó. Mira `git log` antes de escribir el tuyo.
- Commitea o hagas push solo si te lo piden.

---

## 6. Lo legal no es opcional

`LEGAL.md` manda, y varias de sus reglas están incrustadas en el código con
comentarios que las citan. Las que más se tocan sin querer:

- **El enlace al texto oficial va SIEMPRE por encima del resumen**, en la web
  y en cada notificación.
- **La fecha de última actualización del documento oficial es obligatoria**
  (condiciones de reutilización del BOE). No es un extra: por eso viaja en el
  evento y se muestra en la ficha.
- Todo resumen se identifica como **generado por IA y no oficial**.
- El servicio es independiente y no está vinculado al BOE. No escribas nada
  que sugiera lo contrario.

---

## 7. Trampas que ya han mordido

- `.env` está en la raíz y NO se commitea. `DATABASE_URL` apunta a `@db`
  dentro de Docker; `localhost:5432` solo funciona desde el compose de
  desarrollo. Desde una sesión en el host, la base se consulta con
  `docker exec boe-inspector-db-1 psql -U boe -d boe_inspector`.
- `docker-compose.yml` es el de DESARROLLO y publica Postgres en el host. En
  el VPS no debe existir siquiera (el rsync lo excluye).
- `package-lock.json` se ensucia solo: la npm del VPS (10.x) reescribe
  marcadores `peer` que la del Mac (11.x) no pone. Si el árbol aparece sucio
  ahí, suele ser esto: `git checkout -- package-lock.json`.
- Los resúmenes se generan **una vez** y se quedan. Cualquier dato que cambie
  con el tiempo no puede vivir dentro del texto del resumen: se resuelve al
  leer, como hace `comunidad.ts`.
- El resumen se pide en dos pasadas (redacción + revisión) y la segunda
  **mejora pero no bloquea**: si falla, se usa el borrador.
