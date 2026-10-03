# Agente BOE: arquitectura y decisiones técnicas

**Autor:** Roberto Casabán
**Proyecto:** trabajo de fin de máster y servicio personal en funcionamiento
**Fecha de revisión documental:** 4 de octubre de 2026
**Aplicación:** https://agenteboe.com/
**Repositorio:** https://github.com/ThePatientLearner/Agente-BOE-TFM
**Acceso al código:** copia pública depurada para el TFM. El repositorio de desarrollo original conserva su material personal y permanece privado.

Este documento describe la implementación que existe en el repositorio. Los
nombres de ficheros permiten contrastar cada decisión con el código; no implica
que se hayan implementado las posibles mejoras enumeradas al final.

## 1. Problema y alcance

El BOE es la fuente oficial de las disposiciones, pero su lenguaje y extensión
pueden dificultar una primera lectura. Agente BOE automatiza la consulta de su
Sección I, produce una explicación breve con IA, organiza el archivo y distribuye
avisos. La norma oficial conserva siempre su prioridad: el servicio se identifica
como independiente y el resumen como generado por IA y no oficial.

El núcleo cubre ingesta, resumen, notificación, catálogo y consulta conversacional.
Los informes fiscales y de pensiones, las subvenciones, la prensa, el juego y el
área privada de estudio son funcionalidades complementarias. No se afirma que el
archivo contenga todas las secciones del BOE, ni que una respuesta compruebe la
vigencia actual de una norma.

## 2. Topología

```text
                                Web Next.js / Vercel
Navegador ── HTTPS ─────────────▶ agenteboe.com
                                       │
                                       │ lectura y proxies en servidor
                                       ▼
                              api.agenteboe.com
                                       │ Cloudflare Tunnel
                                       ▼
                            VPS: proceso Node / Fastify
                              cron + módulos + API
                                       │
                                       ▼
                              PostgreSQL 16 / Docker

Servicios externos: API del BOE · BDNS · MiniMax/OpenAI · Telegram/Discord
RSS de prensa: consultados desde la web, independientes del cron del BOE
```

La web y el backend se despliegan por separado. Vercel construye la web desde
`main`; actualizar Git no reconstruye automáticamente la API del VPS. En el VPS,
Compose de producción contiene `app`, `db` y el túnel con perfil explícito. La
base no publica su puerto y el puerto de diagnóstico de la API se vincula a
localhost del servidor. Las claves privadas viven fuera del repositorio.

Referencias: `docker-compose.prod.yml`, `scripts/deploy-vps.sh`,
`apps/web/src/lib/api.ts`, `apps/web/src/lib/account-proxy.ts`.

## 3. Organización del backend

Es un monolito modular, no un conjunto de microservicios. Cron y API comparten
proceso y composición. Cada módulo exporta su interfaz pública en `index.ts` y,
cuando corresponde, separa `domain`, `application` e `infrastructure`.

| Módulo | Responsabilidad y fuente de datos |
|---|---|
| `ingestion` | Sumario oficial, descarga del texto, identificación y estado de las disposiciones |
| `summarization` | Resumen estructurado, impacto, proveedor/modelo y fecha de generación |
| `notifications` | Formato de avisos y registro por canal, disposición y parte diario |
| `catalog` | Proyección de lectura y búsquedas para la web y el asistente |
| `spending` | Convocatorias y concesiones BDNS; consultas por periodos |
| `juego` | Validación básica de partidas y ranking |
| `electricidad` | Cuentas, permisos, sesiones y acceso al área de estudio |
| `assistant` | Consulta con recuperación, selección de proveedor y presupuesto de uso |

`shared` contiene tipos básicos, configuración, registros, conexión a la base y
contrato del bus. `composition.ts` decide qué adaptadores cumplen los puertos.
`main.ts` valida configuración, aplica migraciones, compone la aplicación, inicia
el cron y la API, y cierra servidor y pool ante SIGINT/SIGTERM.

## 4. Flujo de una disposición

```text
IngestDailyBulletin
  ├─ obtener sumario y filtrar sección
  ├─ comprobar BOE-A-… existente
  ├─ descargar y persistir texto oficial + fecha de actualización
  └─ EntryIngested
       ├─ catalog: crear proyección de lectura
       └─ SummarizeEntry
            ├─ comprobar resumen previo
            ├─ redactar y revisar con IA
            ├─ validar y guardar resumen
            └─ SummaryGenerated
                 ├─ catalog: actualizar proyección
                 ├─ TrackEntryProgress: actualizar estado
                 └─ NotifyEntry: publicar según impacto y registro por canal
```

El catálogo se suscribe antes que el resumidor. Como el bus entrega en orden y
la generación publica un segundo evento dentro del primer manejador, invertir
ese orden podría intentar actualizar un resumen antes de crear su fila.

El evento transporta los datos que necesita el consumidor; este no lee las tablas
del productor. Duplicar título, departamento o enlaces en el payload permite
mantener la independencia de los módulos.

Referencias: `composition.ts`, `modules/ingestion/application/ingest-daily-bulletin.ts`,
`modules/summarization/application/summarize-entry.ts`,
`modules/notifications/application/notify-entry.ts`.

## 5. Persistencia e idempotencia

PostgreSQL usa esquemas separados por módulo. Drizzle proporciona acceso tipado y
migraciones SQL versionadas. El catálogo es una proyección desnormalizada: duplica
campos para responder sin acoplar las consultas web a las tablas de negocio.

La idempotencia se apoya en la identidad oficial de la disposición, la búsqueda
de registros previos, el estado persistido y el registro de notificaciones por
canal. `ResumePendingEntries` reanuda disposiciones guardadas sin resumen y
resúmenes todavía pendientes de notificar. Los reintentos y el lookback del día
anterior se ejecutan con los mismos casos de uso.

El bus es **en memoria**, entrega secuencialmente y registra los fallos de cada
manejador sin impedir la entrega a los siguientes. No es una cola durable. No hay
una transacción distribuida que abarque el envío externo y su registro: un fallo
entre ambos no permite prometer entrega exactamente una vez. El sistema aporta
recuperación e idempotencia operativa, con esa limitación explícita.

Referencias: `shared/event-bus/in-memory-event-bus.ts`,
`scheduler/resume-pending.ts`, `modules/notifications/infrastructure/postgres-notification-log.ts`.

## 6. IA para los resúmenes

`HttpSummarizer` implementa el puerto del resumidor mediante HTTP. Proveedor,
modelo y clave se configuran con `AI_BASE_URL`, `AI_MODEL` y `AI_API_KEY`; no hace
falta cambiar el caso de uso para sustituir ese adaptador.

La salida contiene título llano, frase, puntos e impacto en una escala de 1 a 5.
La segunda pasada contrasta el borrador con el texto oficial. Si la revisión
falla se conserva el borrador disponible; una revisión por otro LLM no demuestra
por sí sola la exactitud jurídica. La validación estructural y los tests prueban
contratos y comportamientos, no la ausencia de alucinaciones de todas las salidas.

El adaptador limita la entrada de redacción a 400000 caracteres y el texto de
revisión a 120000. Las disposiciones excepcionalmente extensas pueden quedar
truncadas; el código no implementa todavía una estrategia de resumen por partes.
Es un límite de cobertura que debe considerarse al valorar fidelidad.

El nivel de impacto es una clasificación de IA y se usa para priorizar avisos;
no sustituye una evaluación jurídica ni implica urgencia oficial.

Referencia: `modules/summarization/infrastructure/http-summarizer.ts`.

## 7. BoeBot: recuperación antes de generación

1. La API valida la sesión y una pregunta de 2 a 800 caracteres.
2. Si se consulta desde una ficha, el contexto se limita a esa disposición.
3. En modo archivo se admite un identificador BOE explícito, una fecha concreta,
   «hoy/ayer» o una búsqueda temática en el catálogo.
4. La búsqueda de PostgreSQL usa un índice GIN con configuración española y
   devuelve hasta seis documentos. No utiliza una base vectorial de embeddings.
5. Se toman textos oficiales persistidos de los dos primeros resultados; se
   seleccionan fragmentos localmente junto con los resúmenes. El contexto final
   no supera 32 KB y el historial aportado se limita a cuatro mensajes.
6. Se reserva presupuesto antes de llamar al modelo, se genera la respuesta y
   se ajusta la reserva al consumo disponible.
7. Los enlaces oficiales y fechas proceden de registros del servidor y se
   muestran antes de la respuesta. El navegador no aporta el texto oficial.

El proveedor predeterminado es MiniMax, y un administrador puede seleccionar GPT
para toda la aplicación si está configurado. La elección se persiste. Las claves
del bot se separan de la clave del resumidor. `ReviewedAssistant` admite
0–3 repasos configurables, dos por defecto, a cualquiera de los proveedores.
Con repasos activados, un temporizador y una señal compartida limitan a
42 segundos toda la fase de generación: redacción y revisiones. Una carrera de
promesas corta la espera incluso si un adaptador no atiende la señal. Si hay
borrador o revisión válidos, se conserva la mejor versión disponible; si no
terminó la redacción, se propaga el fallo. Recuperación de documentos y consultas
SQL quedan fuera de ese límite. El proxy web corta su petición a los 55 segundos.

El adaptador MiniMax dispone además de un límite de 40 segundos compartido entre
sus intentos y la lectura del cuerpo; OpenAI limita cada llamada a 45 segundos.
En la composición actual, configurar cero repasos omite el decorador y conserva
esos límites propios del adaptador. Si un repaso se corta, se devuelve el texto
disponible con consumo incierto y se mantiene la reserva conservadora en SQL;
no se devuelve presupuesto potencialmente facturado.

Para usuarios normales hay cinco consultas diarias, 10 segundos entre consultas,
200 consultas globales y un límite configurable de tokens diarios. Las cuotas
se reservan en PostgreSQL bajo bloqueo transaccional y sobreviven a reinicios.
El administrador está exento de cuotas diarias; la concurrencia sigue limitada a
una consulta por usuario y tres por proceso. Estos últimos límites en memoria
no son un semáforo global entre varias réplicas.

Las conversaciones no se persisten en la base de la aplicación: duran mientras
el panel está abierto. El proveedor recibe preguntas y contexto. `store=false`
en OpenAI no equivale a una garantía de retención cero; MiniMax usa su contrato
propio. Una respuesta con fuentes sigue pudiendo cometer errores y no comprueba
vigencia ni exhaustividad del archivo.

Referencias: `modules/assistant/application/ask-boe.ts`, `context.ts`,
`reviewed-assistant.ts`, `infrastructure/postgres-budget.ts`,
`infrastructure/postgres-settings.ts`, `api/assistant.ts`.

## 8. Web, caché y lectura

Next.js App Router obtiene el catálogo desde la API en servidor y lo entrega a
los componentes de lectura. La consulta reciente abarca 15 boletines; el listado
muestra dos inicialmente y permite cargar más. El filtrado reciente se hace en
el navegador. La búsqueda del archivo completo usa un proxy del servidor y una
clave distinta de la cuenta del bot, con un máximo de 300 resultados.

Las fichas enlazan el texto oficial primero, identifican la IA y exponen fechas.
Las lecturas relacionadas se calculan a partir de temas del catálogo reciente.
Los datos fiscales y de pensiones son curados; sus fuentes y años se anotan en
código y se comprueban con invariantes. No se presentan como una API en tiempo real.

La portada consulta RSS de prensa mediante validación de fecha, tamaño y dominio,
con caché y degradación independiente por medio. El estado del cron que muestra
el contador viene de `/api/review-status`; consultar ese estado no dispara ingestas.
Las animaciones respetan la preferencia de reducir movimiento. El chat admite
navegación sin cuenta para ver su bienvenida, pero consultar requiere sesión.

Referencias: `apps/web/src/app/page.tsx`, `components/EntryBrowser.tsx`,
`components/BoeBotPanel.tsx`, `lib/press.ts`, `lib/press-feed.ts`.

## 9. Seguridad y operación

- Las contraseñas se derivan con scrypt y sal; los tokens de sesión se guardan
  como hashes. La cookie es HttpOnly y Secure en producción, con SameSite Strict.
- El rol y el permiso de estudio se comprueban en servidor. El alta pública del
  bot no autoriza por sí sola el cuaderno; la invitación y aprobación de estudio
  constituyen otro flujo.
- Los HTML protegidos están en `private/` y las rutas comprueban la sesión antes
  de servirlos. No se anuncian en el sitemap.
- Las claves de proveedores, tokens de canales, `.env` y credenciales del túnel
  se excluyen del repositorio. La web no recibe claves de IA ni acceso a Postgres.
- `/health`, logs estructurados y estado del cron facilitan diagnóstico. Un
  healthcheck correcto no certifica que todos los servicios externos respondan.
- Las copias de seguridad usan un volcado lógico de PostgreSQL; actualizar el
  contenedor de la API no debe borrar ni recrear el volumen de datos.
- Los avisos públicos se separan de las alertas privadas de operación. Las pruebas
  del TFM deben evitar publicar mensajes en los canales por accidente.

## 10. Decisiones y sus costes

| Decisión | Motivo | Coste o límite |
|---|---|---|
| Monolito modular | Un proceso operable y módulos comprobables para un proyecto individual | Escala y despliegue compartidos del backend |
| Bus en proceso | Menos infraestructura; eventos explícitos entre módulos | Eventos sin durabilidad y entrega secuencial |
| Proyección desnormalizada | Consultas simples, fuente y resumen listos para la web | Duplicación y orden de suscripción relevante |
| IA detrás de un puerto HTTP | Sustitución de proveedor y pruebas con dobles | Diferencias de contrato, latencia y coste externo |
| Revisión que no bloquea | Mantener una respuesta útil ante una caída del repaso | La revisión no garantiza exactitud |
| Recuperación lexical en PostgreSQL | Reutilizar la base y controlar fuentes sin vector DB | Coincidencia temática limitada y hasta seis documentos |
| Cuotas persistentes | Evitar que reinicios eludan los presupuestos | Más lógica transaccional; límites por proceso aparte |
| Web/API separadas | Vercel para frontend, VPS para cron y datos persistentes | Hay que comprobar dos despliegues |
| Informes con datos curados | Trazabilidad de cifra, año y fuente | Revisión periódica necesaria |

## 11. Verificación y mejoras posibles

Las comprobaciones reproducibles son `npm test`, `npm run typecheck`,
`npm run check:boundaries`, builds de ambos workspaces y tests de integración
contra una base local aparte. La comprobación pública de web y API se registra
por separado en [Verificacion-tecnica.md](Verificacion-tecnica.md). Ese informe
es la fuente vigente del recuento y alcance de las pruebas, tipos, fronteras y
compilaciones; los resultados anteriores a cambios de código se identifican
como históricos. La imagen web temporal también se ha construido
y ejecutado en el VPS tras incluir los recursos de `public/`; no es el
despliegue web de producción de Vercel. Las cifras y los resultados concretos de esta entrega pertenecen
al registro de validación, no se deducen del número de ficheros de test.

Las actualizaciones de Fastify, Drizzle ORM y las resoluciones transitivas se
verifican con npm audit y comprobaciones de compatibilidad. El audit registrado
del grafo de producción no presenta avisos; el completo conserva dos moderados
de Vitest/mocker de desarrollo. El análisis del lockfile no prueba la ausencia
física de esos paquetes en una imagen, ni sustituye a una auditoría de seguridad.

Mejoras que requieren trabajo adicional: outbox y cola durable, evaluaciones
sistemáticas de precisión con un corpus anotado, observabilidad de latencia y
coste por etapa, ampliación controlada del archivo y un pipeline CI explícito.
No se declaran implementadas ni necesarias para leer y probar esta entrega.

## 12. Qué demuestra el proyecto

Integración de datos oficiales; TypeScript; separación de dominio e infraestructura;
eventos y proyecciones; persistencia y migraciones; recuperación ante fallos;
pruebas de contratos e invariantes; API y frontend; uso de IA con contexto y
presupuesto; protección de sesiones; y operación de una aplicación publicada.
No presupone una institución concreta ni una relación de asignaturas del máster.
