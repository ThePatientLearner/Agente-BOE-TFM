# AgenteBOE · Trabajo final de máster

**Roberto Casabán · Máster de desarrollo con IA · BIG school**

AgenteBOE obtiene disposiciones del BOE, las resume con IA y ofrece un catálogo,
un asistente con fuentes y avisos configurables. **Electricidad es una ampliación
integrada**: comparte cuentas y autorización, e incorpora un cuaderno de estudio,
tests, simulacros y un tutor contextual. El proyecto principal es AgenteBOE.

Servicio independiente de la Agencia Estatal Boletín Oficial del Estado. Los
resúmenes y las respuestas pueden contener errores; el texto oficial enlazado
es la referencia. El complemento Electricidad es material de aprendizaje.

## Entrega y enlaces

- [Aplicación pública: agenteboe.com](https://agenteboe.com/).
- [Código público del TFM](https://github.com/ThePatientLearner/Agente-BOE-TFM).
- [Memoria técnica en PDF](output/pdf/Memoria-Agente-BOE.pdf): alcance, arquitectura, manual, decisiones, evidencia y límites.
- [Presentación en PDF](output/pdf/Presentacion-Agente-BOE.pdf).
- [Guía de evaluación, grabación y entrega en PDF](output/pdf/Guia-Evaluacion-Grabacion-Entrega.pdf): cuentas, recorrido reproducible, guion y ficha para el formulario.
- [Salud de la API pública](https://api.agenteboe.com/health).
- **Vídeo personal:** pendiente de grabación y publicación por el autor; debe incluir su explicación y captura de pantalla. Añadir aquí la URL real cuando esté disponible.

Esta edición del **6 de octubre de 2026** incluye Electricidad. Los PDF de
`output/pdf` son la documentación de referencia de esta entrega y sustituyen los
materiales académicos anteriores. El despliegue público y la copia de evaluación
son entornos distintos: un cambio en este repositorio no despliega el backend de
producción.

## Probar en local sin claves ni base de datos

Requisitos: Git y **Node.js >=22** con npm. Desde una carpeta de trabajo:

```bash
git clone https://github.com/ThePatientLearner/Agente-BOE-TFM.git
cd Agente-BOE-TFM
npm ci
npm run demo:tfm
```

Abrir **http://127.0.0.1:3100** cuando Next.js indique que está listo. La API
escucha en `127.0.0.1:3101`. Detener con Ctrl+C.

| Cuenta de la demo local | Valor |
|---|---|
| Usuario | `alumno_demo` |
| Contraseña | `AulaLocal!2026-TFM` |
| Permisos | Asistente y Electricidad; sin administración |
| Datos | Catálogo de ejemplo y cuentas en memoria |
| Generación | Respuestas simuladas, identificadas en pantalla |

El lanzador usa una copia temporal del frontend sin archivos `.env` y una
composición separada del backend. No necesita PostgreSQL, claves de IA ni tokens
de canales; no arranca la ingesta programada ni envía notificaciones. El arranque
reinicia los datos de la API. El progreso del cuaderno permanece en el navegador;
una ventana privada permite ensayar con un estado limpio.

Recorrido recomendado: **portada → ficha y fuente → BoeBot → /electricidad →
test y tutor → /electricidadTest → cierre de sesión**. Las fuentes del catálogo
local remiten a documentos reales publicados en 2015; sus respuestas son ejemplos
y no acreditan la vigencia actual de esas normas.

## Funciones y acceso

| Función | Comportamiento | Acceso |
|---|---|---|
| Boletines y fichas | Ingesta de la Sección I por defecto; resumen estructurado, fuente, fecha e impacto | Público |
| Búsqueda y filtros | Búsqueda en el catálogo y filtros de consulta | Público; archivo completo con clave separada |
| BoeBot | Archivo mediante resúmenes; ficha mediante texto oficial; fuentes visibles | Cuenta activa |
| Avisos | Telegram y Discord configurables; fuente y fecha antes del contenido generado | Canales configurados |
| Electricidad | 57 secciones, 224 fichas, 1.271 preguntas y 39 fórmulas | Cuenta con permiso de estudio |
| Simulacros | Ocho simulacros con 200 preguntas en total y modalidades de práctica | Permiso de estudio |
| Tutor de Electricidad | Explicación contextual del material del curso y diálogo | Permiso de estudio |
| Complementos públicos | Subvenciones, pensiones, radiografía fiscal, prensa y juego | Público |

El permiso de estudio se verifica en el servidor. Los HTML permanecen en
`apps/web/private`, fuera de los recursos estáticos públicos. Incluir su código
en la entrega no elimina esa comprobación. El progreso de estudio se guarda por
cuenta en `localStorage`, sin sincronización entre dispositivos ni garantía
antifraude.

### Cuenta de demostración del servicio público

En [agenteboe.com](https://agenteboe.com/), abrir BoeBot → Entrar:

- Usuario: `tfm_demo`
- Contraseña: `Lectura del boletin TFM 2026!`

Es una cuenta dedicada ya documentada para evaluación, con cinco consultas
ordinarias diarias compartidas entre sus usuarios. **No tiene administración ni
permiso de Electricidad**. Para demostrar el complemento y repetir ensayos sin
consumir cuota, usar la cuenta de la demo local. Las credenciales de un entorno
no son válidas necesariamente en el otro.

## Stack y arquitectura

Monorepo npm con TypeScript, **Fastify 5**, **Next.js 15 / React 19**,
**PostgreSQL 16**, Drizzle ORM, Zod, Pino, node-cron y Vitest. Las versiones
instalables exactas están fijadas en `package-lock.json`. Los adaptadores HTTP integran MiniMax y OpenAI; proveedor, modelo y revisiones
dependen de la configuración. La producción documentada separa web en Vercel y API/base de
datos en un servidor con contenedores y túnel Cloudflare.

```text
BOE → ingestion ──EntryIngested──→ summarization ──SummaryGenerated──→ notifications
                       └──────────→ catalog ←─────────────┘
Next.js → API Fastify → catálogo / assistant / cuentas
                     └─ permiso de estudio → Electricidad y tutor
```

Cada módulo persistente posee su esquema. El bus en memoria transporta contratos;
el catálogo es una proyección de lectura. La suscripción del catálogo precede a
la del resumen para que los eventos anidados encuentren la entrada. No se afirma
procesamiento transaccional «exactamente una vez»; la memoria describe recuperación
y ventanas de fallo.

```text
apps/monolith/src/
  api/                 API HTTP
  modules/             ocho módulos del dominio
  scheduler/           tareas y recuperación de pendientes
  demo/                adaptadores aislados de evaluación
  composition.ts       composición del servicio real
apps/monolith/drizzle/  migraciones SQL
apps/web/src/          páginas, componentes y proxies Next.js
apps/web/private/      cuaderno, simulacros y cliente del tutor
apps/web/public/       recursos públicos
scripts/               herramientas de desarrollo y documentación
docs/tfm/source/       fuentes editables y evidencia de la entrega
docs/tfm/capturas/      capturas con procedencia documentada
output/pdf/            los tres documentos finales
```

## Ejecutar la integración real en desarrollo

La demo anterior basta para evaluar el recorrido. Para trabajar con proveedores
reales se necesita PostgreSQL, una clave del proveedor y la configuración
correspondiente. En una instalación de desarrollo:

```bash
cp .env.example .env
docker compose up -d db
```

Editar `.env`: `DATABASE_URL` debe apuntar a la base local, `AI_API_KEY` debe ser
válida, y `AI_BASE_URL` / `AI_MODEL` deben corresponder al proveedor. Mantener
vacíos los tokens de canales si no se quieren enviar avisos. La configuración
real se guarda fuera de Git. Arrancar en dos terminales:

```bash
npm run dev
```

```bash
npm run dev:web
```

La web usa `http://localhost:3001` como API por defecto. Abrir
`http://localhost:3000`; `/health` de la API responde `{"status":"ok"}`. La API
aplica las migraciones al arrancar. Una base recién creada tiene el catálogo
vacío. Para obtener un boletín existe `npm run ingest`, que **puede consumir
llamadas de IA y enviar avisos si hay canales configurados**. El servicio normal
también incorpora planificación; no se usa para la demo aislada del TFM.

Compose completo (`docker compose up -d --build`) construye `db`, `app` y `web`
con una configuración válida. Los Dockerfiles se incluyen; la verificación de
esta edición no equivale a un nuevo despliegue de producción.

## Pruebas y evidencia

```bash
npm test
npm run typecheck
npm run check:boundaries
npm run build --workspace @boe-inspector/monolith
```

La web se compila con `npm run build --workspace @boe-inspector/web`; la API
configurada determina los datos disponibles durante el prerenderizado. Las
pruebas unitarias usan dobles y no necesitan credenciales. La integración con
PostgreSQL tiene un comando separado y requiere una base local aislada:

```bash
DATABASE_URL=postgres://boe:boe@localhost:5432/boe_inspector npm run test:integration --workspace @boe-inspector/monolith
```

Ese comando crea `boe_inspector_test` y requiere permisos locales para crearla.
La copia pública pasó una instalación limpia, **414 pruebas** y 15 comprobaciones
HTTP del recorrido de demostración. Los resultados y sus límites están en el anexo de la
memoria y en [verificacion.json](docs/tfm/source/verificacion.json). La edición
corrige el orden de fuente y fecha en avisos y añade una demostración aislada;
no atribuye esas modificaciones al despliegue público sin evidencia.

## Regenerar la documentación

Con Python, `reportlab` y una fuente Arial o DejaVu Sans disponible:

```bash
python3 scripts/build_tfm_docs.py
```

Se generan los tres PDF desde JSON y capturas versionados. `PDF_FONT_DIR` permite
usar una carpeta con `DejaVuSans.ttf` y `DejaVuSans-Bold.ttf`. El contenido técnico
se contrasta con el código, los tests y las fuentes oficiales. La IA asistió en
la revisión y preparación de esta edición; la explicación y grabación personal
corresponden al autor.

## Alcance de la copia pública y entrega final

Esta copia incluye el núcleo de AgenteBOE, Electricidad, pruebas, demo y PDF.
Excluye CV, credenciales, datos operativos, destino privado de despliegue y el
historial del repositorio original. `LEGAL.md` es un borrador de trabajo, no un
dictamen de cumplimiento. Las convenciones técnicas están en `AGENTS.md`.

Queda por incorporar la URL del vídeo personal. Después, el alumno confirma sus
datos de matrícula y envía el formulario de la lección Proyecto Final. Esta
preparación no acredita un envío al campus.
