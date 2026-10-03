# Agente BOE

## Memoria técnica del trabajo final de máster

**Autor:** Roberto Casabán
**Programa:** Máster de Desarrollo con IA · BIG school
**Fecha:** 4 de octubre de 2026
**Aplicación:** https://agenteboe.com/
**Código:** https://github.com/ThePatientLearner/Agente-BOE-TFM

Documento preparado a partir del código y de las comprobaciones de esta entrega. El autor debe revisar el contenido y explicar personalmente sus decisiones en la defensa. La documentación complementaria facilitada por el alumno pide README, acceso al código, despliegue, slides y vídeo; esta memoria amplía esa documentación y no presupone una plantilla académica adicional.

## 1. Resumen y objetivos

Agente BOE es un servicio gratuito e independiente que consulta las disposiciones generales de la Sección I del Boletín Oficial del Estado, conserva sus textos y genera una primera explicación en lenguaje claro mediante IA. Las disposiciones se organizan en un catálogo web y se distribuyen por Telegram y Discord según su impacto orientativo. BoeBot permite preguntar sobre el archivo o una ficha concreta, recuperando el contexto antes de llamar al proveedor de IA.

El problema que aborda es el tiempo y esfuerzo necesarios para una primera lectura del boletín. La propuesta combina automatización, consulta y trazabilidad: el resumen ayuda a orientarse y el enlace al documento oficial permite comprobarlo. El servicio identifica los resúmenes como contenido de IA y no sustituye el BOE ni una interpretación jurídica especializada.

Los objetivos técnicos son integrar una fuente oficial, separar responsabilidades en un backend modular, persistir el estado para recuperar procesos interrumpidos, publicar una interfaz de lectura, limitar el uso del asistente y verificar el funcionamiento del código y los despliegues. La aplicación operativa y las pruebas aportan evidencia sobre estos objetivos. No se afirma haber demostrado retención de usuarios, precisión jurídica estadística o cobertura de todas las secciones del BOE.

## 2. Producto y alcance

La lectura del catálogo, las fichas y las radiografías es pública. La portada ofrece un acceso destacado al último boletín, la fecha disponible, una disposición relevante y accesos a subvenciones, pensiones y fiscalidad. El archivo reciente consulta quince boletines y muestra dos inicialmente. Hay búsquedas temáticas y filtros; el archivo completo utiliza un acceso separado.

Cada ficha mantiene el identificador BOE, el título, la procedencia, el enlace al texto oficial, la fecha de actualización y el resumen. El impacto en una escala de uno a cinco sirve para priorizar lecturas y notificaciones; es una clasificación generada por IA y no una prioridad atribuida por el organismo oficial.

Las radiografías amplían el contexto del proyecto. Subvenciones consulta convocatorias de la BDNS. Pensiones y Quién paga presentan datos curados con año y fuente, incluyendo gráficos y cálculos explicativos. La portada consume titulares RSS con validación y caché. El juego y el área privada de estudio son extensiones; la defensa puede centrarse en el flujo del BOE y el asistente sin mostrar información personal.

BoeBot exige sesión para realizar consultas. Su cuenta de evaluación permite probar la conversación, con las cuotas de un usuario normal y sin permisos de administración ni acceso a los cuadernos personales. Los datos de demostración cambian conforme se publican boletines; las capturas son una instantánea de esta revisión.

## 3. Stack y arquitectura

El proyecto utiliza TypeScript y npm workspaces. La web está construida con Next.js 15 y React 19. El backend ejecuta Fastify 5 sobre Node.js 22 o superior, con node-cron para la planificación. PostgreSQL 16 almacena el estado; Drizzle ORM y las migraciones SQL versionadas delimitan su evolución. Los adaptadores de IA utilizan HTTP y permiten configurar proveedor y modelo.

Es un monolito modular: API, cron y composición comparten un proceso. Los módulos de negocio separan dominio, aplicación e infraestructura cuando corresponde. Cada módulo exporta su contrato por index.ts y la composición decide qué adaptadores cumplen los puertos. Las consultas atraviesan interfaces explícitas; los consumidores de eventos no acceden directamente a tablas ajenas.

| Módulo | Responsabilidad |
| --- | --- |
| ingestion | Sumario del BOE, texto oficial y estado de las disposiciones |
| summarization | Resumen estructurado, revisión y clasificación de impacto |
| catalog | Proyección de lectura y búsqueda |
| notifications | Avisos por canal y registro de envíos |
| spending | Integración y consulta de convocatorias BDNS |
| assistant | Recuperación, generación, selección de modelo y presupuesto |
| electricidad | Cuentas, sesiones y permisos para el material de estudio |
| juego | Registro de partidas y ranking |

Un bus de eventos en memoria conecta los cuatro módulos del flujo del BOE. Esta elección reduce infraestructura y hace explícitas sus interacciones. Su coste es la falta de durabilidad de la cola y el procesamiento secuencial. Las fronteras se comprueban mediante dependency-cruiser. No se describe esta solución como microservicios ni como una cola distribuida.

## 4. Ingesta, persistencia y recuperación

El caso de uso de ingesta consulta el sumario, filtra la sección prevista y utiliza el identificador oficial como clave natural. Descarga y persiste el texto con su fecha de actualización. Al publicar EntryIngested, el catálogo crea la proyección de lectura y el resumidor procesa el documento.

El orden de suscripción importa: catalog se registra antes que summarization. La generación puede publicar SummaryGenerated dentro del primer manejador, por lo que la fila del catálogo debe existir antes de recibir la actualización del resumen. El payload lleva los campos que necesita cada consumidor para evitar lecturas de las tablas de otro módulo.

Después de generar y guardar el resumen, los consumidores actualizan el catálogo, el progreso y los avisos. Cada módulo comprueba registros previos. ResumePendingEntries recupera documentos sin resumen y resúmenes sin notificación. El cron tiene reintentos del mismo día y un lookback del día anterior, además de herramientas manuales para fechas anteriores.

La persistencia permite recuperar trabajo que quedó incompleto. No existe una transacción distribuida entre el envío a Telegram o Discord y su registro: una caída entre ambas operaciones impide prometer entrega exactamente una vez. El bus tampoco conserva eventos tras reiniciar. Una posible evolución sería un patrón outbox o una cola durable; no se presenta como implementada.

## 5. IA y asistente con fuentes

El resumidor redacta una salida estructurada con título llano, frase, puntos e impacto. Una segunda pasada contrasta el borrador con el documento. Si falla la revisión, se conserva la versión disponible. La validación estructural comprueba el formato, pero una segunda llamada a un LLM no demuestra ausencia de errores factuales.

HttpSummarizer limita el texto de redacción a 400000 caracteres y el de revisión a 120000. Una disposición excepcionalmente extensa puede quedar truncada. No hay todavía resumen por partes. El proveedor está detrás de un puerto HTTP, de modo que puede sustituirse sin reescribir el caso de uso, aunque sus contratos, tiempos y costes varían.

BoeBot recupera hasta seis resultados del catálogo mediante búsqueda lexical de PostgreSQL en español, con índice GIN. Recupera el texto oficial persistido de los dos primeros documentos, selecciona fragmentos localmente y combina esos fragmentos con los resúmenes. El contexto está limitado a 32 KB; la pregunta a 800 caracteres y el historial a cuatro mensajes. No utiliza embeddings ni herramientas de búsqueda web del modelo.

En una ficha, el servidor limita el contexto a esa disposición. Las fuentes y fechas proceden de registros del servidor y se muestran antes de la respuesta. El proveedor predeterminado es MiniMax; OpenAI es una alternativa si está configurada. Los repasos son configurables entre cero y tres. El sistema procura conservar una respuesta útil si un repaso falla o agota el tiempo disponible. Las consultas normales tienen límites diarios y reservas persistentes de presupuesto.

## 6. Lectura y experiencia de usuario

La web obtiene el catálogo en servidor y utiliza componentes interactivos para búsquedas, filtros, pestañas y gráficos. Las fichas anteponen el enlace oficial al contenido generado. La identidad visual, el emblema animado y los accesos destacados ayudan a reconocer el servicio y a encontrar la primera acción.

El chatbot ofrece una bienvenida visible sin registro y exige acceso para preguntar. La revisión de lectura amplió el tamaño del texto, el espacio entre líneas y la superficie disponible. Los diálogos admiten Escape y gestionan el foco. Las animaciones suaves respetan la preferencia de reducir movimiento. La revisión visual incluye escritorio y una vista de 375 píxeles sin desbordamiento horizontal en la portada.

Los RSS de prensa tienen validación de dominio, fecha, tamaño y tiempo de respuesta, así como caché y degradación independiente por medio. Esta función vive en la web y no depende de la ingesta del BOE. El contador del agente consulta su estado sin activar una ingesta nueva.

Estas decisiones se describen a partir de la implementación y las capturas. No se afirma una certificación de accesibilidad ni una investigación formal con usuarios. Las métricas de lectura disponibles deben interpretarse como eventos de interfaz, no como prueba de comprensión. La retención y la facilidad de uso pueden evaluarse después con tareas y medidas definidas.

## 7. Seguridad, privacidad y uso responsable

Las contraseñas usan scrypt con sal y los tokens de sesión se almacenan como hashes. En producción la cookie de sesión es HttpOnly, Secure y SameSite Strict. La autorización se comprueba en servidor: el registro público del asistente no concede acceso al área de estudio. Bloquear una cuenta o cambiar su contraseña revoca las sesiones.

Las cuotas del asistente se reservan en PostgreSQL bajo bloqueo transaccional y sobreviven a los reinicios. Las cuentas normales disponen de cinco consultas al día, un intervalo mínimo y topes globales configurables. La concurrencia se limita por usuario y por proceso; ese límite en memoria no es un semáforo global de varias réplicas.

Las conversaciones se mantienen en memoria mientras está abierto el panel. Las preguntas y el contexto se envían al proveedor seleccionado. El parámetro store=false de OpenAI no constituye una garantía de retención cero; el otro proveedor tiene su propio contrato. La documentación evita promesas que no puede demostrar sobre estos servicios externos.

Las claves de IA, tokens de canales, .env, credenciales del túnel y dirección privada del servidor permanecen fuera de los materiales públicos. La cuenta de prueba tiene privilegios limitados. El repositorio original contiene también material personal: la entrega utiliza una copia pública depurada que excluye esos complementos y el historial. El sistema de cuentas, los permisos y el núcleo se conservan para la evaluación.

## 8. Método de trabajo y verificación

La preparación de la entrega partió de leer las dos páginas del documento del máster, contrastar los requisitos con el repositorio, comprobar la topología real y producir documentación con evidencia. Se conservaron las decisiones visuales aceptadas y se atendieron problemas de reproducibilidad y funcionamiento detectados durante la revisión.

La comprobación inicial ejecutó 308 pruebas unitarias: 229 del monolito y 79 de la web. TypeScript no registró errores en ambos workspaces. La comprobación inicial de fronteras analizó 126 módulos y 408 dependencias sin violaciones. Las compilaciones del monolito y de la web pasaron; con el catálogo disponible, la web prerenderizó 156 páginas. Tras las correcciones, la validación final pasó 316 pruebas (237 del monolito y 79 de la web), tipos y fronteras (127 módulos, 409 dependencias). El registro de verificación documenta estos resultados finales.

La imagen Docker web se construyó y ejecutó de forma temporal en el VPS. Se corrigió la copia de public/ en el servidor standalone y se añadió .dockerignore. La prueba confirmó los recursos necesarios y la ausencia de .env y .git en esa imagen. Este ensayo no sustituye el despliegue de la web en Vercel.

También se consultaron las páginas públicas, el catálogo y /health, y se verificó la cuenta dedicada. Una consulta real del bot obtuvo respuesta con fuente. Se detectó una consulta más lenta que el plazo del proxy; se corrigió el plazo global de generación y repasos, incluso con cero repasos, para no sobrepasar el proxy. La cuota conserva las reservas cuando el consumo de un intento cancelado es incierto. Los tests verifican contratos y comportamientos; no constituyen una auditoría de penetración, un ensayo de carga ni una evaluación estadística de fidelidad jurídica.

## 9. Despliegue y mantenimiento

La web se publica en Vercel al actualizar main en GitHub. El backend y PostgreSQL funcionan en el VPS con Docker Compose. Cloudflare Tunnel publica la API sin abrir PostgreSQL a Internet. La configuración privada permanece en el servidor. Actualizar el repositorio y actualizar el contenedor son comprobaciones distintas.

Una actualización de backend reconstruye solamente el servicio app con --no-deps, conservando la base, el volumen y el túnel. Los cambios exclusivos de web no requieren reconstruir la API. El proceso aplica migraciones al arrancar y proporciona registros estructurados, /health y estado del cron. Un healthcheck confirma que el proceso responde, pero no garantiza disponibilidad de todos los proveedores externos.

Las copias lógicas de PostgreSQL apoyan la recuperación. La ingesta diaria se planifica en el proceso y existen tareas de operación en el servidor. Estado-produccion.md identifica las tareas comprobadas y cualquier diferencia entre la configuración documentada y la instalada. Las fuentes curadas requieren revisión periódica; no deben extrapolarse cifras cuando la fuente aún no publica un dato nuevo.

El proyecto queda ubicado en la carpeta del proyecto Agente BOE accesible desde Codex. La ruta anterior se conserva como enlace de compatibilidad para herramientas existentes. Los documentos finales están juntos en Documentos trabajo, con los materiales privados y temporales excluidos de Git.

## 10. Conclusiones y evolución

La aplicación demuestra una integración completa de fuente oficial, persistencia, generación con IA, consulta web y distribución de avisos. La separación por módulos permite verificar fronteras y probar comportamientos sin depender de una clave de IA o de servicios remotos en las pruebas unitarias.

Las limitaciones principales son la falta de durabilidad del bus, la cobertura acotada del archivo, el truncamiento de documentos largos, la latencia externa y la ausencia de una evaluación factual sistemática. Las fuentes visibles y la revisión reducen fricción para comprobar una respuesta, pero no convierten el resumen en texto oficial.

Las mejoras propuestas son un corpus anotado para medir fidelidad, observabilidad por etapa de IA, una cola durable y un pipeline CI explícito. Deben valorarse por coste y utilidad para este proyecto individual. El autor deberá explicar en su vídeo qué decisiones tomó, qué dificultades encontró y cómo utilizó IA, con sus propias palabras y sin atribuirse resultados que no se hayan comprobado.

## 11. Referencias y materiales de evaluación

- Documento académico de referencia: Documentacion-TFM.pdf, dos páginas, facilitado por el alumno. Su copia se conserva en la carpeta privada local.
- Fuente oficial: Agencia Estatal Boletín Oficial del Estado, https://www.boe.es/. Los enlaces concretos a cada disposición aparecen en las fichas.
- Evidencia de arquitectura: apps/monolith/src/composition.ts, shared/event-bus y módulos de negocio. El documento Arquitectura-y-decisiones.md detalla rutas y contratos.
- Evidencia de interfaz: apps/web/src/app, components, lib y hojas de estilo.
- Evidencia de instalación: README.md, .env.example, package-lock.json, Dockerfiles y Compose.
- Evidencia de calidad y operación: Verificacion-tecnica.md y Estado-produccion.md.
- Recorrido de prueba: Guia-evaluador.md. Presentación: Presentacion-Agente-BOE.pptx y su PDF.
- Entrega personal: Guia-entrega-TFM.md, Checklist-TFM.md y Guion-video.md. Vídeo y formulario pendientes de la acción del alumno.

Las afirmaciones técnicas se refieren al código comprobado en esta revisión. Los enlaces de código y los permisos de evaluación deben verificarse con el estado final del repositorio antes de enviar el formulario.
