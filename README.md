# Agente BOE · BOE Inspector

Proyecto personal y trabajo de fin de máster de **Roberto Casabán**. El nombre
público es **Agente BOE**; `boe-inspector` es el nombre técnico del repositorio
y de los paquetes.

- **Aplicación en funcionamiento:** [agenteboe.com](https://agenteboe.com/).
- **Código fuente del TFM:** [ThePatientLearner/Agente-BOE-TFM](https://github.com/ThePatientLearner/Agente-BOE-TFM).
- **API:** [api.agenteboe.com/health](https://api.agenteboe.com/health).
- **Presentación:** [PDF público](https://agenteboe.com/tfm/Presentacion-Agente-BOE.pdf) · [PowerPoint público](https://agenteboe.com/tfm/Presentacion-Agente-BOE.pptx). También adjunta: [PowerPoint](Documentos%20trabajo/Presentacion-Agente-BOE.pptx) · [PDF](Documentos%20trabajo/Presentacion-Agente-BOE.pdf).
- **Memoria técnica:** [PDF](Documentos%20trabajo/Memoria-Agente-BOE.pdf).
- **Guía del evaluador:** [prueba funcional e instalación](Documentos%20trabajo/Guia-evaluador.md).
- **Arquitectura y decisiones:** [documento técnico](Documentos%20trabajo/Arquitectura-y-decisiones.md).
- **Comprobaciones de la entrega:** [verificación técnica](Documentos%20trabajo/Verificacion-tecnica.md) · [checklist del TFM](Documentos%20trabajo/Checklist-TFM.md).
- **Vídeo explicativo:** pendiente de grabación personal y publicación por el autor. Debe incluir su explicación y la captura de pantalla; todavía no existe una URL pública.

**El BOE, resumido cada día.** Servicio gratuito que ingiere las disposiciones
generales del Boletín Oficial del Estado (Sección I), las resume con IA en
lenguaje claro y las publica en una web y en canales de Telegram y Discord —
siempre con el enlace al texto oficial primero.

> ⚠️ Proyecto independiente. No vinculado a la Agencia Estatal Boletín Oficial
> del Estado. Los resúmenes los genera una IA y el único texto con valor
> oficial es el publicado en [boe.es](https://www.boe.es).

## Funcionalidades principales

| Funcionalidad | Qué ofrece | Acceso |
|---|---|---|
| Boletines y fichas | Resúmenes de la Sección I, título oficial, fuente, fecha de actualización, nivel de impacto y lecturas relacionadas | Público |
| Búsqueda y filtros | Buscar en los últimos 15 boletines; filtrar por fechas, tema e impacto; abrir el archivo completo con una clave separada | Público; clave para archivo completo |
| Notificaciones | Resúmenes relevantes y parte diario por Telegram y Discord | Suscripción al canal |
| BoeBot | Preguntar sobre el archivo o sobre una disposición abierta, con fuentes visibles y límites de uso | Cuenta de usuario |
| Subvenciones | Consulta de convocatorias y concesiones de la BDNS por periodos | Público |
| Pensiones y Quién paga | Informes visuales y calculadoras basados en datos curados con fuentes | Público |
| Prensa | Titulares de cuatro medios desde sus RSS, en pestañas España e Internacional | Público |
| Juego | Juego web con marcador, validación básica y ranking | Público |
| Electricidad | Cuaderno y pruebas de estudio, con aprobación específica y progreso local por cuenta | Complemento del despliegue original; HTML excluidos del TFM |

El núcleo del TFM es el ciclo **datos oficiales → resumen con IA → catálogo →
lectura y avisos**, junto con el asistente que consulta ese catálogo. Los informes,
la prensa, el juego y el área de estudio son ampliaciones del mismo proyecto.

### Cuenta de prueba del TFM

- **URL:** [agenteboe.com](https://agenteboe.com/), botón flotante BoeBot → Entrar.
- **Usuario:** `tfm_demo`
- **Contraseña:** `Lectura del boletin TFM 2026!`

Es una cuenta dedicada de demostración con rol de usuario (`student`), válida
para consultar el asistente. No tiene acceso de administración ni al área
personal de electricidad. El acceso, el cierre de sesión y esas restricciones
se han comprobado en producción. Dispone de las cinco consultas diarias de
un usuario normal; las comprobaciones de lectura sin sesión no consumen cuota.
El catálogo, las fichas, los informes y el juego se pueden evaluar sin iniciar
sesión. Estas credenciales de prueba no son claves de proveedores ni de
infraestructura.

### Acceso al código fuente

La entrega del TFM utiliza una **copia pública depurada** en
[ThePatientLearner/Agente-BOE-TFM](https://github.com/ThePatientLearner/Agente-BOE-TFM).
Incluye el núcleo, el backend, la web, las pruebas y los documentos. Excluye
el CV, los HTML de los cuadernos personales, los datos operativos, las
credenciales y el historial Git original. El sistema de cuentas y permisos
utilizado por BoeBot permanece incluido; no se necesita el material privado
para ejecutar su demostración.

El repositorio de desarrollo original, ThePatientLearner/BoeInspector,
permanece privado. La entrega pública evita depender de una excepción privada
para el evaluador. Su accesibilidad y el alcance de la copia se registran en
el [checklist de entrega](Documentos%20trabajo/Checklist-TFM.md).

## Stack tecnológico

| Capa | Tecnología y uso |
|---|---|
| Lenguaje y ejecución | TypeScript; Node.js **22 o superior**; npm workspaces |
| Web | Next.js 15 (App Router), React 19, CSS propio; renderizado en servidor y componentes interactivos |
| API | Fastify 5; validación con Zod; registros estructurados con Pino |
| Persistencia | PostgreSQL 16, Drizzle ORM y migraciones SQL versionadas |
| IA de resúmenes | Adaptador HTTP compatible con la configuración del proveedor; MiniMax-M3 por defecto |
| IA conversacional | MiniMax-M3 o GPT (`gpt-6-luna`); selección administrativa persistida y repasos configurables |
| Automatización | node-cron; reintentos y recuperación del día anterior |
| Pruebas y arquitectura | Vitest, TypeScript y dependency-cruiser |
| Infraestructura | Docker Compose; VPS para API/PostgreSQL; Cloudflare Tunnel; Vercel para la web |
| Datos externos | API oficial del BOE, BDNS y RSS de medios; cifras fiscales y de pensiones con fuentes anotadas |

Las versiones exactas resueltas están en `package-lock.json`; las dependencias
declaradas están en los `package.json` de los dos workspaces.

## Arquitectura

Monolito modular en TypeScript con separación de dominio, casos de uso y
adaptadores. Los cuatro módulos del flujo BOE (`ingestion`, `summarization`,
`notifications`, `catalog`) intercambian eventos de dominio mediante un bus en
memoria. `spending`, `juego`, `electricidad` y `assistant` aportan capacidades
independientes; sus consultas usan puertos explícitos. El comando
`npm run check:boundaries` verifica las fronteras con `dependency-cruiser`.

```
cron 08:30 ─▶ ingestion ──EntryIngested──▶ summarization ──SummaryGenerated──▶ notifications ─▶ Telegram/Discord
                   │                              │
                   └──────────▶ catalog ◀─────────┘        (proyección de lectura)
                                   ▲
                       API Fastify │  ◀── web (Next.js)
```

- **Dominio y casos de uso** sin dependencias de framework; puertos + adapters.
- **IA intercambiable**: el resumidor habla HTTP con cualquier API compatible
  con el formato de OpenAI (MiniMax por defecto). Cambiar de proveedor son tres
  variables de entorno.
- **Resúmenes en dos pasadas**: redacción y una segunda pasada de revisión que
  contrasta el borrador con el texto oficial y corrige idioma, fidelidad y
  precisión.
- **Idempotente por diseño**: la clave natural del BOE (`BOE-A-…`) y las
  transiciones de estado (`pendiente → resumida → notificada`) hacen que
  repetir un día ya procesado reutilice lo persistido y no vuelva a generar
  resúmenes ni a enviar notificaciones ya registradas. No hay una garantía
  transaccional de entrega exactamente una vez ante cualquier fallo externo.
- **Persistencia en Postgres**, con un schema por módulo y migraciones que se
  aplican solas en el arranque.

Documentación actual: [Arquitectura y decisiones](Documentos%20trabajo/Arquitectura-y-decisiones.md) ·
[Guía del evaluador](Documentos%20trabajo/Guia-evaluador.md).
[PLAN.md](PLAN.md) y [PORTFOLIO.md](PORTFOLIO.md) recogen el planteamiento inicial;
pueden contener fases o decisiones que han evolucionado. Las reglas de
reutilización y privacidad están en [LEGAL.md](LEGAL.md) y en las páginas
publicadas [Legal](https://agenteboe.com/legal) y
[Privacidad](https://agenteboe.com/privacidad).

### Estructura del proyecto

```text
.
├── apps/
│   ├── monolith/
│   │   ├── src/
│   │   │   ├── modules/        # ingestion, summarization, notifications,
│   │   │   │                  # catalog, spending, juego, electricidad, assistant
│   │   │   ├── shared/        # tipos, eventos, configuración, logs y base de datos
│   │   │   ├── api/           # endpoints Fastify y validación de acceso
│   │   │   ├── scheduler/     # cron, recuperación y partes diarios
│   │   │   ├── cli/           # ingesta, diagnóstico y operación
│   │   │   ├── composition.ts # composición de puertos y adaptadores
│   │   │   └── main.ts        # migraciones, API, cron y apagado
│   │   └── drizzle/           # migraciones SQL y metadatos versionados
│   └── web/
│       ├── src/app/           # páginas App Router y proxies del servidor
│       ├── src/components/    # catálogo, informes, animaciones y BoeBot
│       ├── src/lib/           # cliente API, datos curados y funciones de cálculo
│       ├── public/            # vídeo, imágenes y juego estático
│       └── private/           # HTML de estudio protegido por sesión
├── scripts/                   # sincronización VPS, copias y tareas operativas
├── deploy/                    # configuración del túnel sin credenciales públicas
├── Documentos trabajo/        # memoria, presentación y guías del TFM
├── docker-compose.yml         # desarrollo local: db + app + web
├── docker-compose.prod.yml    # producción VPS: db + app + tunnel
├── .env.example               # plantilla sin secretos
├── package.json               # workspaces y comandos de raíz
└── package-lock.json          # dependencias resueltas
```

## Instalación y ejecución local

### Requisitos

- Git, **Node.js 22 o superior** y npm.
- Docker con Compose v2 para PostgreSQL 16 (Docker Desktop en macOS/Windows).
- Puertos locales 3000 (web), 3001 (API) y 5432 (base de datos) disponibles.
- Una clave propia de IA para generar resúmenes reales. El chatbot necesita su
  propia clave; Telegram y Discord son opcionales.

Con acceso al repositorio (la copia privada requiere permisos), desde una
copia nueva:

```bash
git clone https://github.com/ThePatientLearner/Agente-BOE-TFM.git
cd Agente-BOE-TFM
npm ci
cp .env.example .env
docker compose up -d db
```

Editar `.env` antes de arrancar: `DATABASE_URL` viene preparado para el Postgres
local, y `AI_API_KEY` **no puede quedar vacío**, porque el arranque valida la
configuración. Si se cambia de proveedor, ajustar también `AI_BASE_URL` y
`AI_MODEL`. Las claves son privadas y no se añaden a Git. Para uso local,
`PUBLIC_WEB_URL=http://localhost:3000` evita que los enlaces del diagnóstico
apunten a la web pública. Mantener vacíos los tokens de notificación evita
publicar pruebas en canales reales; en ese caso los avisos se escriben en consola.

En una primera terminal, desde la raíz:

```bash
npm run dev
```

En una segunda terminal, desde la misma raíz:

```bash
npm run dev:web
```

Abrir [localhost:3000](http://localhost:3000/) y comprobar la API:

```bash
curl --fail http://localhost:3001/health
```

El resultado esperado es `{"status":"ok"}`. Las migraciones se ejecutan al
arrancar la API. Una base nueva está vacía: eso es normal y la portada lo
indica. Para traer el último boletín y generar sus resúmenes, con una clave de
IA válida y sabiendo que puede producir llamadas facturables:

```bash
npm run ingest --workspace @boe-inspector/monolith
```

`npm run dev:web` usa `http://localhost:3001` por defecto. Para consultar otra
API se configura `API_URL` en `apps/web/.env.local`, solo en el servidor;
Next.js no carga automáticamente el `.env` de la raíz. No se necesitan
credenciales de la base de datos en el frontend.

Para evaluar la aplicación desplegada no hace falta instalar ni aportar una
clave: seguir la [guía del evaluador](Documentos%20trabajo/Guia-evaluador.md).

### Comprobaciones y compilación

El [informe de verificación técnica](Documentos%20trabajo/Verificacion-tecnica.md)
es la fuente del recuento vigente de pruebas, revisiones, entorno y resultados
de tipos, fronteras y compilaciones. Los cambios de dependencias y del control
de plazos del asistente requieren una nueva pasada; los recuentos anteriores
se conservan allí como evidencia histórica, sin presentarlos como el resultado
final del código modificado.

Se han actualizado Fastify y Drizzle ORM y se han aplicado overrides acotados
para dependencias transitivas. El audit del grafo de producción no informa de
avisos en la comprobación registrada; el audit completo conserva dos avisos
moderados de Vitest y su mocker, usados en desarrollo. Esto no equivale a una
auditoría de seguridad completa ni demuestra por sí solo qué herramientas
contiene físicamente una imagen Docker. Los informes npm y la validación
posterior están enlazados desde el documento de verificación.

```bash
npm test
npm run typecheck
npm run check:boundaries
npm run build --workspace @boe-inspector/monolith
API_URL=http://localhost:3001 npm run build --workspace @boe-inspector/web
```

La última línea corresponde a macOS/Linux; en Windows PowerShell, definir
antes `$env:API_URL = "http://localhost:3001"`. Compilar la web con la API local
arrancada permite incluir su catálogo en el prerenderizado. Si no hay API,
las funciones de lectura devuelven colecciones vacías; un build correcto por
sí solo no demuestra que haya datos ni que el despliegue esté operativo.

Para ejecutar la versión compilada, en dos terminales:

```bash
node --env-file=.env apps/monolith/dist/main.js
```

```bash
API_URL=http://localhost:3001 npm run start --workspace @boe-inspector/web
```

Los tests unitarios no necesitan red, claves ni PostgreSQL. Los tests de
integración sí usan una base local y se ejecutan con el comando del workspace:

```bash
DATABASE_URL=postgres://boe:boe@localhost:5432/boe_inspector npm run test:integration --workspace @boe-inspector/monolith
```

Crean y utilizan `boe_inspector_test`, separada de la base de la aplicación;
requieren un usuario local con permiso para crear esa base. No apuntar este
comando a infraestructura de producción.

### Ejecución con Docker

Compose de desarrollo levanta `db`, `app` y `web`. Tras configurar `.env`:

```bash
docker compose up -d --build
```

La aplicación fuerza `DATABASE_URL` a `db:5432` dentro de la red de Compose;
`localhost:5432` es la dirección para los procesos lanzados en el host.
Consultar los logs con `docker compose logs -f app web`. Para detener los
contenedores conservando los datos: `docker compose down`. El volumen tiene
nombre y persiste; `down -v` sí elimina sus datos.

El Dockerfile web copia también `public/`, necesario para que el servidor
standalone incluya el vídeo, el juego y los demás recursos estáticos. El
`.dockerignore` limita el contexto de build. Se ha comprobado el build y la
ejecución de una imagen web temporal en el VPS; esa prueba no sustituye la
comprobación separada del despliegue Vercel ni implica que la web de producción
se sirva desde ese contenedor. Véase el
[registro de verificación](Documentos%20trabajo/Verificacion-tecnica.md).

### Base de datos

Los módulos persistentes tienen su propio esquema de Postgres (`ingestion`,
`summarization`, `notifications`, `catalog`, `spending`, `juego`, `electricidad`
y `assistant`). El acceso se realiza por los puertos de cada módulo: la web
consulta la API y no se conecta directamente a la base de datos.

```bash
npm run db:generate -w @boe-inspector/monolith   # SQL nuevo tras tocar un schema.ts
npm run db:apply    -w @boe-inspector/monolith   # aplicar migraciones a mano
```

El arranque aplica las migraciones pendientes por su cuenta, así que en una
máquina nueva basta con `docker compose up`.

### Probar contra el BOE real, sin esperar al cron

```bash
npm run probe                # una disposición de punta a punta, paso a paso
npm run ingest               # ingesta completa del último día disponible
npm run ingest --workspace @boe-inspector/monolith -- 2026-07-23 # fecha concreta
```

`probe` recorre la cadena entera con la disposición más reciente —API del BOE,
extracción del texto, redacción, revisión— e imprime cada paso y qué corrigió
la revisión. Es el comando para responder a "¿esto funciona?".

`ingest` ejecuta el mismo código que corre a las 8:30, con eventos y
notificaciones. Es seguro repetirlo: la ingesta es idempotente, así que también
sirve para recuperar un día perdido.

```bash
npm run resummarize -- 2026-08-01        # regenera un día SIN notificar
npm run resummarize -- BOE-A-2026-16758  # una disposición concreta
```

`resummarize` es la herramienta para cuando cambias el prompt: vuelve a pedir
el resumen, actualiza la web y **no toca los canales**. Lo consigue publicando
el evento en un bus donde el único suscriptor es el catálogo, así que
`notifications` ni siquiera existe en ese proceso.

```bash
npm run notify:test          # mensaje de prueba por cada canal configurado
```

`notify:test` envía a Telegram y Discord un mensaje con el formato definitivo,
sin tocar la base de datos ni el BOE. Es la forma de comprobar tokens y
permisos antes de que llegue el cron.

Para trastear con prompts o comprobar la clave sin arrancar nada, hay un atajo
sobre la misma API:

```bash
./scripts/ask-ai.sh "resume la Ley 40/2015 en tres líneas"
cat texto.txt | ./scripts/ask-ai.sh "resume esto"
AI_MODEL=MiniMax-M3 npm run probe        # comparar modelos sin tocar .env
```

### Trabajar en este repo (personas y agentes)

Las convenciones que no se deducen del código —arquitectura y fronteras entre
módulos, datos curados y su revisión mensual, despliegue, git en fast-forward y
las reglas de `LEGAL.md`— están en [AGENTS.md](AGENTS.md).

### Copias de seguridad

```bash
./scripts/backup-db.sh                          # → backups/boe-FECHA.sql.gz
./scripts/restore-db.sh backups/boe-FECHA.sql.gz
```

La copia es un volcado lógico, no una copia del volumen: se restaura en
cualquier Postgres 16, en cualquier máquina y arquitectura.

### Revisión mensual de los datos curados

Las radiografías (`/quien-paga`, `/pensiones`) no salen de una API: son cifras
elegidas a mano en `apps/web/src/lib/*-data.ts`. El script de revisión contrasta
las fuentes oficiales y, si algo ha cambiado, deja un pull request para aprobar.
Nunca escribe en `main`. `scripts/crontab.txt` propone ejecutarlo el día 5 de
cada mes; esa línea no estaba instalada en la revisión del VPS de esta entrega,
según [Estado-produccion.md](Documentos%20trabajo/Estado-produccion.md). La
disponibilidad del script no demuestra que exista una revisión mensual activa.

La misma pasada revisa **quién gobierna cada comunidad autónoma y España**
(`apps/monolith/src/shared/domain/comunidad.ts`), que es lo que se muestra junto
a cada resumen: la comunidad afectada si la disposición es autonómica, y el
Gobierno de España en todo lo demás. Ese bloque no caduca por una estadística
anual sino por una elección o una ruptura de coalición. En cada ejecución de
la revisión se comprueban los veinte y se actualiza `VERIFICADO_EL` aunque no
haya cambios; esa fecha aparece en la web. El resultado y los logs de cada
ejecución permiten comprobar si la revisión se ha realizado.

```bash
DRY_RUN=1 ./scripts/actualizar-datos.sh   # ensayo: ni push, ni PR, ni aviso
./scripts/avisar.sh "texto"               # aviso suelto al chat privado
```

La red que lo sostiene son los invariantes de `apps/web/src/lib/datos.test.ts`:
comprueban las relaciones que deben cuadrar por construcción y unas bandas de
plausibilidad anchas, porque TypeScript compila igual de contento con 101.739
que con 1.017.390. Si una banda salta al actualizar un dato, la pregunta es de
dónde sale el número, no cuánto hay que subir el límite.

### Portada, prensa y siguientes lecturas

La portada combina el catálogo del BOE con dos pestañas de prensa. **España**
muestra un titular de las secciones nacionales de EL PAÍS y ABC;
**Internacional**, uno de BBC Mundo y France 24, en sus ediciones en español.
Cada medio tiene el mismo componente y espacio. Se toma el primer titular
válido del RSS correspondiente, que no necesariamente es la noticia principal
de su web. No hay selección manual ni clasificación política, ni se reproducen
artículos o fotografías: solo un extracto del titular (máximo 24 palabras),
fecha, medio y enlace original. No se traduce con IA: los medios extranjeros
ya publican esos titulares en español.

Los dos paneles tienen contenido inicial renderizado en servidor. Las pestañas cambian de contenido
sin peticiones nuevas y permiten teclado (flechas, Inicio y Fin), además de
ratón y tacto. España es la selección inicial; no se guarda ninguna preferencia.

Las fuentes viven en `apps/web/src/lib/press-feed.ts`:

- EL PAÍS España: `https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada`
- ABC España: `https://www.abc.es/rss/2.0/espana/`
- BBC Mundo: `https://feeds.bbci.co.uk/mundo/rss.xml`
- France 24 en español: `https://www.france24.com/es/rss`

No usar el antiguo `abcPortada.xml`: devuelve noticias desfasadas. El lector
descarta noticias de más de 72 horas, fechas futuras, XML inválido y enlaces
fuera del dominio del medio. Cada petición tiene un límite de 5 segundos y
1 MB. La caché de Next se renueva con las visitas cada 10 minutos; la portada
se regenera como máximo cada 5 minutos cuando recibe tráfico. El contador
encima de las pestañas consulta `/api/press` al abrir la página y al vencer la
caché, actualizando los titulares en pantalla sin recargar ni cambiar de
pestaña. Espera una segunda lectura si Next está renovando los datos en segundo
plano; si no logra actualizarlos, muestra un reintento en 60 segundos. Usa el
tiempo restante calculado por el servidor y suspende consultas en pestañas
ocultas. No necesita cron, contraseñas ni cambios en la API del VPS.
Si falla un medio, se conserva su
último resultado válido mientras siga reciente; si no lo hay, su tarjeta
ofrece un enlace directo a la portada sin afectar al BOE ni al otro medio.

El catálogo muestra inicialmente dos boletines y permite cargar más; la
búsqueda siempre abarca todos los disponibles. Las lecturas relacionadas
se calculan por coincidencia temática en el catálogo reciente, excluyendo la
ficha actual, duplicados y coincidencias solo por ministerio. Las miniaturas
de los informes reutilizan sus datos curados.

Las suscripciones conservan el bloque al pie de la página y el acceso
«Notifícame» en la cabecera, con los logos de Telegram y Discord y un contorno
que pulsa lentamente (fijo si se solicita reducir el movimiento). Además, `SubscribePrompt` invita a los
visitantes nuevos a Telegram o Discord a los 9 segundos. Reutiliza la marca
local `agenteboe:notify-offered`, guardada al abrir, para no repetir la ventana
en visitas posteriores ni a quienes ya la vieron en la versión anterior.
Espera si la pestaña está oculta, hay otra ventana abierta o un campo tiene
el foco; no se muestra en el juego ni en las páginas legales. Si el navegador
bloquea el almacenamiento, quedan los accesos permanentes de la página.
El diálogo nativo confina el foco y se cierra con Escape, la cruz, el fondo o
«Ahora no»; devuelve el foco y permite volver a desplazar la página al cerrar.
El juego mantiene su invitación dentro del flujo de lectura.
Sobre el vídeo móvil, la cuenta atrás consulta `/api/review-status`: usa el
reloj y los horarios diarios del agente (incluidos los reintentos) y muestra
«Revisando» solo mientras una pasada está en curso. No activa ingestas.
Consulta cada 30 segundos, más a menudo cerca del inicio y durante la pasada;
se suspende al ocultar la pestaña o pasar a escritorio. Si no hay conexión,
indica que el estado no está disponible. Un cron no diario conserva su
ejecución normal, pero omite la cuenta atrás porque no se calcula su fecha.
`editorial.css` contiene los estilos de navegación y lectura; `globals.css`
conserva los estilos de los gráficos. Vercel Analytics registra únicamente
eventos predefinidos: aperturas de contenido, llegada al final del resumen y
clics en canales y juego. No se envían claves, búsquedas ni texto libre; llegar
al final visible no se interpreta como prueba de que se haya leído todo.

## Despliegue

En producción, la web se publica en **Vercel** al actualizar `main` en GitHub.
El VPS aloja la API, Postgres y el túnel. Tras sincronizar el repositorio en
el VPS, actualizar solo la aplicación:

```bash
docker compose -f docker-compose.prod.yml up -d --build --no-deps app
curl --fail http://127.0.0.1:3001/health
```

El siguiente compose completo corresponde al entorno local de desarrollo:

```bash
docker compose up -d --build
```

En desarrollo son tres contenedores: `app` (monolito), `web` (Next.js
standalone) y `db` (Postgres 16 con volumen). En producción la web se mantiene
en Vercel y el túnel de Cloudflare pertenece a su perfil específico del VPS.

## Estado y alcance de la entrega

El catálogo web, las fichas, la ingesta, los resúmenes, los avisos, el
asistente, los informes y el despliegue están implementados. Las comprobaciones
de esta entrega se documentan junto a la memoria y la guía de evaluación.
No se presenta como implementado un feed RSS propio del BOE ni un canal de
WhatsApp: los RSS actuales se consumen para el bloque de prensa.

El backend de producción está en el VPS; los antiguos scripts y LaunchAgents
para arrancarlo en macOS permanecen como herramientas de desarrollo e
historial operativo. No describen la topología actual de producción.

### Cron y recuperación

> **Reintentos del mismo día.** Además de la pasada de las 08:30 hay dos más,
> a las 10:00 y a las 12:00 (`CRON_RETRY_SCHEDULES`). Cada una reejecuta la
> ingesta y además *reanuda* lo que quedó a medias: una disposición guardada
> pero sin resumen porque la IA estaba caída, o resumida pero sin notificar
> porque falló un canal. Cada módulo comprueba su estado y evita repetir el
> trabajo ya registrado; el aviso de fallo solo se manda tras el último intento.
>
> **Lookback del día anterior.** Cada pasada reintenta también el día
> anterior (`CRON_LOOKBACK_DAYS=1` por defecto): cubre el boletín de ayer que
> salió después de las 12:00 o un día entero en el que el proceso estuvo
> caído. Es idempotente —si ayer ya está bien, solo cuesta una petición al
> BOE— y el parte de ops solo menciona el lookback si recuperó algo o quedó
> algo mal. Días más antiguos siguen yendo a mano con
> `npm run ingest --workspace @boe-inspector/monolith -- 2026-08-10` (ojo: notifica a los canales).

> **Umbral de notificación.** Solo se publica en los canales lo que alcanza
> `NOTIFY_MIN_IMPACT` (3 por defecto, escala 1-5). Por debajo, la disposición
> se ingiere y aparece en la web, pero no notifica: un trámite interno no
> merece un aviso en el móvil de mil personas. Con 1 se notifica todo.

> **Parte del día.** Además de los resúmenes sueltos, los canales reciben un
> mensaje con cuántas disposiciones trae el boletín y cuántas hay de cada
> nivel de impacto, con el enlace a la web. Sale en la pasada del parte (las
> 10:00), o en la última si a esa hora todavía queda algo sin resumir; en los
> días sin disposiciones no sale nada. Es el contexto que a los resúmenes les
> falta: saber que las tres que has recibido son tres de veintitrés, y que el
> resto está en la web.

### Área privada de electricidad

`/electricidad` y `/electricidadTest` requieren una sesión. Los HTML se guardan en
`apps/web/private/`; las rutas del servidor comprueban la sesión antes de enviarlos,
incluidas las antiguas direcciones `index.html`. No se anuncian en el sitemap.

El registro exige un código de invitación, validado en el servidor contra
`ELECTRICIDAD_REGISTRATION_CODE_HASH` (scrypt). Sin configurarlo se rechazan
las altas. El código nunca se incluye en el HTML. Las cuentas nuevas quedan pendientes. El administrador aprueba o bloquea desde
`/electricidad/cuenta`. Las contraseñas usan scrypt con sal, los tokens se guardan
como hashes en Postgres y la cookie es HttpOnly, Secure en producción y SameSite
Strict. Las sesiones duran siete días; el bloqueo y el cambio de contraseña las
revocan. La API limita intentos de acceso y registro en la base de datos.

El progreso continúa siendo local al navegador, separado por cuenta; el
administrador conserva sus claves de progreso anteriores. El registro no
sincroniza el estudio entre dispositivos. Se pueden exportar copias desde los
cuadernos. Los HTML locales autónomos siguen funcionando sin conexión.

El alta inicial de un administrador se realiza una sola vez con
`dist/cli/create-electricidad-admin.js <usuario>` dentro del contenedor de la API,
recibiendo la contraseña por stdin. El comando no modifica cuentas existentes.
No se guardan credenciales de administración ni claves privadas en el repositorio.

## Asistente BOE de la web

Un botón flotante animado con partículas en la portada y en `/d/:id` abre el
chat y el registro. Solo una sesión válida, iniciada con usuario y contraseña,
permite consultar el bot. Los contactos de Telegram y LinkedIn aparecen antes
del formulario de acceso, destacados con partículas. Se ocultan al iniciar sesión.
Telegram abre por defecto [@FinanFocus](https://t.me/FinanFocus);
`BOT_TELEGRAM_CONTACT_URL` en Vercel permite cambiar ese enlace opcionalmente.
El acceso no aparece en el menú ni se abre automáticamente. Las cuentas y
cookies de sesión se comparten con electricidad, pero el alta pública solo
autoriza el bot; el cuaderno conserva su aprobación específica (`study_access`).
La migración `0006_boe_assistant` conserva el acceso de los alumnos activos.

La búsqueda se hace en PostgreSQL con un índice GIN en español y devuelve
hasta seis disposiciones por relevancia. Se recuperan hasta dos textos
oficiales persistidos a través de un puerto de lectura compuesto con ingesta;
se seleccionan fragmentos localmente.
El modelo se elige entre los proveedores configurados: MiniMax-M3 por
defecto (`BOT_MODEL=minimax`) y OpenAI como alternativa. El administrador
puede cambiar esa elección para toda la aplicación; se guarda en
`assistant.settings`. Solo se habilitan modelos con clave propia. Si el
elegido carece de clave, se usa el primer proveedor habilitado.

El adaptador OpenAI llama a Responses con `gpt-6-luna`,
`reasoning.effort=high`, `max_output_tokens=2048` (incluye razonamiento) y
`store=false`, sin herramientas ni búsqueda web. MiniMax utiliza Chat
Completions (`/v1/chat/completions`): M3 responde en modo directo
(`thinking: disabled`), con temperatura 0,3 y hasta 1.600 tokens de salida;
otros modelos mantienen razonamiento adaptativo y 4.000 tokens. Hay hasta dos
reintentos ante errores transitorios. Se comprueban el modelo devuelto, los
errores del proveedor y las respuestas incompletas. El razonamiento interno
se separa y se elimina si aparece en el texto final. El diagnóstico registra
modelo, modo, latencia y tokens, sin preguntas ni contexto.
[Contrato oficial de MiniMax](https://platform.minimax.io/docs/api-reference/text-openai-api).
Las instrucciones piden contestar primero lo esencial y normalmente usar
60–120 palabras, con un objetivo máximo de 160. Si falta un dato concreto,
se explica qué documento permitiría comprobarlo, sin añadir asuntos ajenos.
Ambos pueden pasar por `ReviewedAssistant`: redacción más hasta
`BOT_REVIEW_PASSES` repasos (2 por defecto, rango 0–3). Se suman los tokens de
las pasadas. Incluso con cero repasos, la generación tiene un plazo total
firme de **42 segundos**, compartido por la redacción y las revisiones: se
propaga una señal de cancelación y se corta la espera aunque el adaptador no
atienda esa señal a tiempo. Si ya hay una respuesta válida, se entrega la mejor
versión disponible; si aún no terminó la redacción, no se inventa una respuesta.
La recuperación del catálogo y las operaciones de base de datos quedan fuera
de ese plazo de generación. El proxy web tiene su propio límite de 55 segundos.
Si un repaso se corta y su consumo es incierto, se conserva la reserva de tokens
para no devolver presupuesto potencialmente facturado. Sin documentos
encontrados no hay llamada a IA.
En una ficha, el servidor toma su identificador y consulta exclusivamente
esa disposición. El navegador nunca aporta el texto oficial como contexto.

Las fuentes verificadas, sus fechas y los enlaces oficiales van antes de la
respuesta de IA. El bot explica lo disponible en el archivo; no asegura
vigencia actual ni recuentos exhaustivos a partir de seis resultados.
No se conservan conversaciones: se mantienen en memoria mientras el chat
está abierto; al cerrar, cambiar de ficha o salir se descartan. Al modelo
viajan como máximo cuatro mensajes anteriores, de 1000 caracteres cada uno.
Las preguntas están limitadas a 800 caracteres y el contexto a 32 KB.

Configurar `BOT_MINIMAX_API_KEY` y/o `BOT_OPENAI_API_KEY` en el `.env` del VPS
y desplegar primero el servicio `app`: su arranque aplica la migración y habilita el permiso de estudio
en las cuentas existentes. Después desplegar la web. Las claves nunca se entregan
al navegador ni a Vercel. El script de despliegue excluye los archivos `.env`
para conservar la configuración privada del VPS. Si la API antigua no informa
del permiso, la web deniega el cuaderno hasta actualizarla.
Cada cuenta dispone de cinco consultas al día, incluido preguntar sin encontrar
resultados. El día se renueva a medianoche en Europe/Madrid. El administrador
puede consultar sin cuota diaria: su rol se comprueba en el servidor desde
la sesión, nunca a partir del cuerpo de la petición. Está exento también de
los topes globales de consultas y tokens y del intervalo entre llamadas.
`BOT_DAILY_TOKENS` fija el techo global diario de usuarios normales (200000 por
defecto), con hasta 200 consultas en conjunto y 10 segundos entre consultas
de la misma cuenta. Se mantiene una consulta por usuario y tres simultáneas
por proceso, también para el administrador.
Los presupuestos se reservan bajo un bloqueo transaccional en PostgreSQL;
se descuentan con el uso real después de responder. Ante timeout se conserva
la reserva porque el proveedor pudo procesar la petición. Los límites
sobreviven a reinicios y sus contadores se purgan a los 30 días. El alta
pública está limitada globalmente a 20 cuentas por hora.

La privacidad distingue la generación de resúmenes de las preguntas del
asistente, que se envían al proveedor seleccionado (MiniMax u OpenAI).
`store=false` de OpenAI no es una garantía de retención cero; MiniMax no usa
ese parámetro.
