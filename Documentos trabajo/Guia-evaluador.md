# Guía de evaluación de Agente BOE

**Autor:** Roberto Casabán
**Aplicación:** https://agenteboe.com/
**Código:** https://github.com/ThePatientLearner/Agente-BOE-TFM
**Revisión:** 4 de octubre de 2026

Esta guía ofrece una ruta breve por la aplicación y otra para ejecutar el código.
El README contiene la configuración completa y la presentación está adjunta al
repositorio en PowerPoint y PDF. La entrega utiliza una copia pública depurada del código y de los adjuntos.
El repositorio de desarrollo original conserva sus complementos personales
y permanece privado. El material HTML de estudio y el CV se excluyen de la
copia del TFM; no son necesarios para probar el núcleo y el asistente.

## 1. Prueba funcional en la web publicada

| Paso | Acción | Resultado que se puede comprobar |
|---|---|---|
| 1 | Abrir https://agenteboe.com/ | Portada, fecha del boletín disponible, botón de novedades, accesos e identidad del proyecto |
| 2 | Pulsar «Ver las novedades del último boletín» | Llegada al catálogo; disposición, resumen y nivel de impacto visibles |
| 3 | Buscar una palabra del título de una ficha visible | Filtrado de los boletines recientes; recuento y opción de limpiar |
| 4 | Activar impacto mínimo o ajustar fechas | Resultados que respetan el filtro; estado vacío cuando no hay coincidencias |
| 5 | Abrir una disposición | Título y enlace oficial antes del resumen, identificación de IA y fechas |
| 6 | Abrir el enlace oficial del BOE | Texto original para contrastar explicación y datos |
| 7 | Abrir «Subvenciones», «Pensiones» y «Quién paga» | Informes, periodos/cálculos y fuentes según el apartado |
| 8 | Cambiar España/Internacional en prensa | Titulares con fecha, medio y enlaces originales; degradación si falla una fuente |
| 9 | Abrir el BoeBot sin sesión | Robot animado, bienvenida y acceso/registro; consultar requiere sesión |
| 10 | Iniciar sesión con la cuenta de prueba | Panel de consulta, fuentes y respuesta cuando exista contexto suficiente |

Los datos cambian con los boletines y las fuentes externas. No hace falta que el
número de novedades o los titulares coincidan exactamente con las capturas de
la presentación. En días sin publicación se conserva el último boletín disponible.

### Cuenta de prueba

- **Usuario:** `tfm_demo`
- **Contraseña:** `Lectura del boletin TFM 2026!`
- **Entrada:** botón flotante BoeBot en https://agenteboe.com/ → Entrar.

La cuenta está preparada en producción, con rol `student`. El acceso, el cierre
de sesión y las restricciones se han validado. Permite consultar el bot y no
autoriza la administración ni el área personal de electricidad. No son
credenciales del VPS ni claves de proveedores. No se copian a una instalación
local, donde se puede crear una cuenta propia desde el panel del bot.

Para preguntar al bot con contexto fácil de comprobar, abrir primero una ficha
y escribir «¿Qué cambia y a quién afecta?». En modo archivo puede indicarse el
identificador de esa misma disposición (`BOE-A-…`) o una fecha `AAAA-MM-DD` con
un tema concreto. Una búsqueda sin resultados no prueba que no exista una norma:
solo informa de la ausencia de coincidencias en el archivo del proyecto.

Las cuentas normales tienen cinco consultas al día y una espera mínima de
10 segundos entre consultas. La cuenta de prueba comparte ese límite. Comprobar el catálogo,
las fichas y los informes no consume consultas de IA. No hace falta probar la
administración ni modificar cuentas reales para evaluar el núcleo del proyecto.

## 2. Instalación desde una copia nueva

Requisitos: Node.js 22 o superior, npm, Git y Docker Compose v2. Puertos disponibles:
3000, 3001 y 5432. Una clave propia de IA es necesaria para generar datos nuevos;
las pruebas unitarias no la necesitan.

```bash
git clone https://github.com/ThePatientLearner/Agente-BOE-TFM.git
cd Agente-BOE-TFM
npm ci
cp .env.example .env
docker compose up -d db
```

Editar `.env` y rellenar `AI_API_KEY`. Mantener `DATABASE_URL` de la plantilla para
los procesos del host. Si se cambia el proveedor, ajustar `AI_BASE_URL` y `AI_MODEL`.
Para enlaces de la prueba local, usar `PUBLIC_WEB_URL=http://localhost:3000`.
Mantener sin rellenar `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ALERT_CHAT_ID` y
`DISCORD_WEBHOOK_URL` evita avisos reales; sin canales, el notificador usa consola.
No reutilizar el `.env` de producción ni publicarlo en la entrega.

Desde la raíz, en una terminal:

```bash
npm run dev
```

Desde la raíz, en otra terminal:

```bash
npm run dev:web
```

Comprobar salud y abrir la web:

```bash
curl --fail http://localhost:3001/health
```

Respuesta esperada: `{"status":"ok"}`. La web está en
http://localhost:3000/. La API aplica migraciones antes de aceptar tráfico.
La base recién creada no contiene el archivo público: una portada vacía no es
un error de instalación.

Para cargar el último boletín con un proveedor configurado:

```bash
npm run ingest --workspace @boe-inspector/monolith
```

La ingesta consulta fuentes oficiales, solicita resúmenes y puede tener coste
de IA. No es necesaria para revisar el código ni ejecutar las pruebas unitarias.
Para que el bot responda, configurar `BOT_MINIMAX_API_KEY` y/o
`BOT_OPENAI_API_KEY` en el `.env` del backend y crear una cuenta local en el
panel del bot. Las cuentas de producción no se copian a la base local. El
cuaderno de electricidad requiere además invitación y aprobación, por diseño.

## 3. Verificación automatizada

```bash
npm test
npm run typecheck
npm run check:boundaries
npm run build --workspace @boe-inspector/monolith
API_URL=http://localhost:3001 npm run build --workspace @boe-inspector/web
```

En Windows PowerShell, sustituir el prefijo de variable de la última línea por
`$env:API_URL = "http://localhost:3001"` y ejecutar luego el comando npm.
Mantener la API local arrancada durante el build permite prerenderizar su catálogo.
Un build sin API puede salir correcto con contenido vacío: comprobar también la
respuesta HTTP y los datos.

Para los adaptadores de persistencia, con PostgreSQL local disponible:

```bash
DATABASE_URL=postgres://boe:boe@localhost:5432/boe_inspector npm run test:integration --workspace @boe-inspector/monolith
```

El test crea `boe_inspector_test` y utiliza esa base separada. El usuario debe
poder crearla. Este comando se ejecuta contra PostgreSQL local, nunca contra
la base de producción. Los resultados concretos de la entrega se conservan en
[Verificacion-tecnica.md](Verificacion-tecnica.md), fuente del recuento vigente
de pruebas y del resultado de tipos, fronteras, builds y actualizaciones. Los
recuentos históricos no equivalen a una validación posterior de código cambiado.

## 4. Qué revisar en el código

| Interés | Punto de entrada |
|---|---|
| Composición y arranque | `apps/monolith/src/composition.ts`, `main.ts` |
| Ingesta y resúmenes | `modules/ingestion/application`, `modules/summarization/application` |
| Eventos e independencia | `shared/event-bus`, `.dependency-cruiser.cjs` |
| Persistencia y migraciones | `modules/*/infrastructure/schema.ts`, `apps/monolith/drizzle` |
| Idempotencia y recuperación | `scheduler/resume-pending.ts`, tests de ingesta y notificaciones |
| Consulta con fuentes | `modules/assistant/application/ask-boe.ts`, `context.ts` |
| Cuotas | `modules/assistant/infrastructure/postgres-budget.ts` |
| Sesiones y permisos | `modules/electricidad`, `apps/web/src/lib/electricidad-auth.ts` |
| Lectura web | `apps/web/src/app/page.tsx`, `app/d/[id]/page.tsx`, `components/EntryBrowser.tsx` |
| Datos y límites | Tests de datos curados, fuentes en `apps/web/src/lib/*-data.ts` |

Los caminos de `modules` en esta tabla son relativos a
`apps/monolith/src/`, salvo que se indique otra ruta.

## 5. Material de la entrega

- [README](../README.md): descripción, stack, instalación, estructura y cuenta de prueba.
- [Arquitectura y decisiones](Arquitectura-y-decisiones.md): comportamiento y costes técnicos.
- [Memoria PDF](Memoria-Agente-BOE.pdf): exposición del proyecto.
- [Presentación PowerPoint](Presentacion-Agente-BOE.pptx) y [PDF](Presentacion-Agente-BOE.pdf).
- [Guía de entrega](Guia-entrega-TFM.md): datos y comprobaciones antes de enviar.
- [Verificación técnica](Verificacion-tecnica.md) y [checklist](Checklist-TFM.md):
  resultados y estado real de los requisitos.
- Vídeo: pendiente de grabación personal del autor con captura de pantalla y
  publicación. No hay URL ficticia ni se considera cumplido ese requisito.

## 6. Límites que conviene valorar

Los resúmenes son de IA y no oficiales; las fuentes deben consultarse para
contrastar. El asistente recupera una muestra limitada del archivo y no
certifica vigencia. El bus es en memoria y no asegura una entrega exactamente
una vez frente a todo fallo externo. La existencia de tests y fuentes no prueba
la exactitud de todas las respuestas generadas. Los datos curados requieren
revisión y los proveedores pueden fallar o limitar consultas.
