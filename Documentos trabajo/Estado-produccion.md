# Estado de producción y verificación del TFM

Comprobación: **04/10/2026 00:38 CEST**. Este documento registra hechos observados; las evidencias evitan IP del servidor, claves de proveedores, sesiones y credenciales de administración.

## Código y servicios

| Elemento | Resultado observado |
|---|---|
| Repositorio local | `Agente BOE`, en la carpeta del proyecto autorizada por Roberto |
| Código API comprobado en el VPS | `/opt/boe-inspector`, actualización operativa mediante `git pull --ff-only` a `d36c7ac3f2f6f4ddd2233750716f4da135a5e191`; las revisiones documentales posteriores no cambian ese runtime |
| Árbol del VPS | Limpio después de la sincronización; se conservaron configuración y datos |
| API | Servicio `app` sano; `/health` devuelve HTTP 200 y `{"status":"ok"}` |
| Base de datos | Servicio `db` sano |
| Entrada pública | Túnel existente activo; no se recreó ni se cambió |
| Integridad del runtime publicado | Los 113 ficheros JavaScript de la imagen de API coinciden por SHA-256 con el monolito compilado del commit indicado |
| Web | La web continúa en Vercel; la prueba Docker no sustituye ese despliegue |

El despliegue final incorporó la corrección del plazo del chatbot y la poda de dependencias de desarrollo. Se reconstruyó exclusivamente `app` mediante `docker compose -f docker-compose.prod.yml up -d --build --no-deps app`. La API local y pública devolvieron HTTP 200, el servicio quedó `healthy` y los logs confirmaron migraciones al día y scheduler iniciado sin errores de arranque. Base de datos y túnel conservaron su continuidad. El árbol del VPS quedó limpio.

Este registro corresponde a la comprobación operativa de las 00:38. El cierre documental se sincroniza después en `main`, sin otra reconstrucción de la API. El recibo de cierre local en `Privado/Comprobacion-final.json` recoge los commits finales y la verificación posterior de los archivos públicos.

## Datos y tareas activas

- El catálogo público contiene el boletín del **3 de octubre de 2026**.
- La API de estado informa de la siguiente revisión el **4 de octubre de 2026 a las 08:30**, hora de Madrid.
- Los periodos de BDNS incluyen septiembre, con registros hasta el **27 de septiembre de 2026**; la ingesta de subvenciones instalada es semanal, los lunes a las 08:00.
- El crontab instalado conserva copia diaria a las 10:00, purga de copias antiguas a las 10:30 e ingesta semanal de BDNS.
- `scripts/crontab.txt` también contiene una revisión de datos curados el día 5 de cada mes. **Esa línea no figura en el crontab observado del VPS.** No se activó una automatización nueva durante este trabajo. El cron interno de la ingesta BOE es distinto de esta tarea mensual.

## Cuenta de evaluación

**Usuario:** `tfm_demo`
**Contraseña de prueba:** `Lectura del boletin TFM 2026!`

Es una cuenta de demostración creada mediante el alta pública del servicio, con rol `student`, estado `active` y `studyAccess=false`. La contraseña pertenece únicamente a esta cuenta limitada. No habilita administración, selección del modelo ni los HTML privados del cuaderno. Está sometida a las cuotas normales: cinco consultas al día por cuenta, separadas al menos diez segundos, y presupuesto global. Las pruebas de esta sesión consumieron cuatro consultas: el 4 de octubre de 2026 queda una disponible para esta cuenta compartida. El límite se renueva según el día de Madrid.

| Comprobación | Resultado |
|---|---|
| Alta pública | HTTP 200 |
| Inicio de sesión y consulta de la cuenta | HTTP 200; rol y permisos limitados confirmados |
| `/electricidad` y `/electricidadTest` | HTTP 403 |
| Lista de usuarios del administrador | HTTP 403 |
| Selector de modelos reservado al administrador | HTTP 403 |
| Cierre de sesión | HTTP 200 |
| Sesión después del cierre | HTTP 401 |
| Pregunta por una disposición desde la web | HTTP 200, respuesta con una fuente y el contexto de la disposición |

En la comprobación final tras el despliegue, la consulta desde la interfaz respondió HTTP 200 con la fuente **`BOE-A-2026-20528`**. El log de la API registra **25,3 segundos** de procesamiento del handler; esa medida no incluye la interacción previa ni todo el transporte navegador–Vercel–API. La [captura de la respuesta real](Capturas/08-bot-respuesta.jpg) y su [medición sanitizada](Evidencias/bot-respuesta-produccion.json) forman parte de la entrega. No se lanzó otra consulta para medirla.

Antes del despliegue también se reprodujo la pregunta **«¿Qué se aprueba en esta disposición?»** sobre `BOE-A-2026-19629`: HTTP 200 por el proxy web, una fuente y 36,6 segundos. Esa evidencia de diagnóstico se conserva por separado. Las pruebas respetaron los permisos de la cuenta y no alteraron otras cuentas.

## Plazo del chatbot

Una pregunta general al asistente devolvió HTTP 503 por la web; una repetición directa contra la API respondió en 49,3 segundos. El código permitía empezar un repaso cuando quedaban ocho segundos, pero no cortaba ese repaso al agotarse el plazo. Además, cada reintento de MiniMax podía iniciar otra espera de cuarenta segundos.

Se publicó y desplegó una corrección acotada:

1. El conjunto de redacción y repasos dispone de un plazo real de 42 segundos, también con cero repasos.
2. Si vence un repaso, se entrega el borrador o la última versión útil; se cancela la petición al proveedor.
3. MiniMax comparte sus cuarenta segundos entre todos los reintentos y cancela también la espera entre ellos.
4. Cuando el coste de una llamada cortada es desconocido, se mantiene la reserva de tokens de la consulta; un reintento exitoso después de un corte de red tampoco devuelve la cuota incierta.

**Validación local:** 51 pruebas del asistente aprobadas, comprobación de tipos del monolito aprobada y fronteras entre módulos aprobadas. Las pruebas incluyen un proveedor que ignora la cancelación, un repaso pendiente, una redacción pendiente, cancelación durante un reintento y conservación de cuota. La corrección está incluida en el commit desplegado y la integridad del runtime se verificó después de reconstruir la API. La prueba visual final del bot usa la cuenta de evaluación y se documenta en las capturas coordinadas de la entrega.

## Reproducción Docker de la web

Se construyó la imagen `boe-tfm-web-check` en un contexto temporal del VPS, copiando solo el Dockerfile web revisado y `.dockerignore` sobre una exportación del repositorio. **Build correcto, exit 0.** No se desplegó un servicio web ni se modificó el árbol principal para esta prueba.

La imagen contiene el servidor Next, el vídeo del emblema, el juego y los HTML privados trazados. `.env` y `.git` están ausentes. El build sin API durante la compilación generó 19 páginas; el catálogo de producción depende de la API y de la regeneración posterior. El log de instalación señaló vulnerabilidades de dependencias, sujetas a la auditoría y actualización coordinadas del proyecto.

## Imagen de la API y tareas de BDNS

El Dockerfile del monolito compila con las herramientas de desarrollo y después ejecuta `npm prune --omit=dev` para dejar solo dependencias de producción en la imagen. El build de prueba terminó correctamente: la poda auditó 56 paquetes sin vulnerabilidades conocidas. La comprobación del runtime importó servidor, composición y migraciones, y devolvió `/health` HTTP 200 sin una base de datos para esa ruta. Vitest, su mocker, TypeScript, tsx, pino-pretty y drizzle-kit estaban ausentes; los SQL de migración seguían presentes.

Para conservar la tarea semanal de subvenciones, `scripts/subvenciones.sh` ejecuta ahora las CLI compiladas de la imagen con Node. Monta únicamente `.env` de solo lectura, comparte la red del contenedor de Postgres y transmite los argumentos sin interpolarlos en un shell. Ya no necesita copiar `node_modules` al host ni ejecutar TypeScript en producción. La acción de lectura `directas 2026-09-01 2026-09-01` terminó correctamente contra los datos existentes; no se lanzó ingesta ni aviso. No se borraron las herramientas del host que una revisión manual de datos pueda necesitar.

## Copia de seguridad

Se creó una copia lógica reciente mediante el script existente:

`backups/boe-2026-10-04-0015.sql.gz` — aproximadamente **5,8 MB**.

La comprobación `gzip -t` terminó correctamente. La copia permanece en el VPS, fuera del repositorio y de los documentos entregables, porque contiene datos operativos. No se ejecutó una restauración sobre producción.

## Evidencias

- [Integridad del runtime API](Evidencias/runtime-api-integridad.json)
- [Respuesta real del asistente por la web](Evidencias/consulta-demo-bot-web.json)
- [Diagnóstico de respuesta directa](Evidencias/consulta-demo-bot-directa.json)
- [Build Docker web](Evidencias/docker-web-build.log)
- [Archivos presentes en la imagen web](Evidencias/docker-web-runtime.txt)
- [Build Docker de la API](Evidencias/docker-app-build.log)
- [Comprobación de la imagen API podada](Evidencias/docker-app-runtime.txt)
- [CLI de subvenciones en modo lectura](Evidencias/docker-cli-bdns.txt)
- [Despliegue final de la API](Evidencias/despliegue-api-final.txt)
- [Salud y logs de arranque](Evidencias/salud-api-final.txt)
- [API pública y cobertura del catálogo](Evidencias/api-publica-final.json)
- [Duración API de la respuesta final capturada](Evidencias/bot-respuesta-produccion.json)

## Revisión humana de la entrega

Los documentos y el guion pueden quedar preparados para revisar. El vídeo final con la exposición y la voz de Roberto, su revisión académica y la entrega en la plataforma correspondiente siguen siendo acciones de autoría y presentación de la persona. No se ha inventado una grabación ni un enlace a un vídeo inexistente.
