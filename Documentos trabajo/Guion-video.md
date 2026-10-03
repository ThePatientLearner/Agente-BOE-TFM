# Guion de vídeo · Agente BOE

Duración orientativa: **8–10 minutos**. El documento del máster no fija un tiempo: este es un recorrido sugerido. Debe grabarlo Roberto **con su propia voz y captura de pantalla**. Mostrar la cara es opcional. Las frases siguientes son un apoyo editable; revisar las explicaciones y contar las decisiones personales con naturalidad.

## Preparar la grabación

1. Abrir la presentación y https://agenteboe.com/ en dos ventanas limpias. Ocultar pestañas personales, notificaciones y gestores de contraseñas.
2. Elegir una ficha con texto oficial y una pregunta concreta. Reservar una consulta de la cuenta tfm_demo; sus cinco consultas son compartidas por día.
3. En macOS, pulsar **Mayúsculas + Comando + 5**, elegir grabación de una parte de la pantalla y seleccionar el micrófono en Opciones. También puede usarse QuickTime Player → Archivo → Nueva grabación de pantalla.
4. Seleccionar una ventana o área suficientemente grande para leer el texto. Hacer una prueba de veinte segundos para comprobar voz y legibilidad.
5. Guardar el vídeo final en esta carpeta como `Video-Agente-BOE.mp4` o `.mov`. Está excluido de Git: publicarlo después en un servicio de vídeo con acceso mediante enlace.

## Recorrido y explicación

| Tiempo | Qué mostrar | Qué explicar |
| --- | --- | --- |
| 0:00–0:45 | Diapositivas 1–2 | Presentación personal, problema y alcance de la Sección I |
| 0:45–2:00 | Portada y catálogo | Lectura sin registro, búsqueda, impacto, último boletín |
| 2:00–3:00 | Una ficha y el BOE | Resumen, fecha, fuente original y límites de la IA |
| 3:00–3:45 | Radiografías | BDNS frente a datos curados; fuentes y periodos |
| 3:45–5:15 | Diapositivas 6–9 y árbol de módulos | Stack, puertos, eventos, persistencia y dos pasadas |
| 5:15–6:45 | BoeBot en esa ficha | Recuperación, sesión, pregunta concreta, fuentes y cuota |
| 6:45–7:45 | Diapositivas 12–13 e informe | Pruebas, Docker, Vercel y VPS verificados por separado |
| 7:45–9:00 | Diapositiva 15 y README | Decisiones personales, limitaciones, mejoras y cierre |

### 1. Presentación

«Soy Roberto Casabán y este es Agente BOE, mi proyecto personal y trabajo final del Máster de Desarrollo con IA. Su objetivo es facilitar una primera lectura del boletín y mantener a mano la fuente oficial. El núcleo trabaja con las disposiciones generales de la Sección I.»

Añadir por qué te interesó el proyecto. Ese motivo debe salir de tu experiencia, no de una historia inventada por el guion.

### 2. Producto

«Se puede leer sin registro. La portada muestra el último boletín disponible y una disposición destacada. Desde aquí puedo buscar un tema y filtrar por impacto. Este nivel lo calcula la IA para orientar la lectura y los avisos; no es una categoría oficial del BOE.»

Mostrar el botón de novedades, una búsqueda basada en un título visible y una ficha. Abrir el enlace oficial antes de continuar.

### 3. Trazabilidad

«El resumen no sustituye a la norma. Esta ficha identifica el documento, enlaza al BOE y muestra la fecha de actualización. La generación tiene una redacción y una revisión. Aunque la revisión ayude, un modelo puede equivocarse: por eso la comprobación contra el original forma parte del recorrido.»

No afirmar vigencia jurídica actual ni precisión del 100 %. Evitar leer una respuesta como si fuera asesoramiento legal.

### 4. Arquitectura

«Utilizo TypeScript, Next.js y React para la web, Fastify para la API y PostgreSQL para el estado. El backend es un monolito modular. Ingesta, resumen, catálogo y notificaciones se comunican con eventos; cada módulo separa sus contratos de la infraestructura. El catálogo se suscribe antes del resumidor para que su fila exista cuando llegue el segundo evento.»

«La ingesta comprueba el identificador BOE y los procesos revisan el trabajo persistido. Esto permite recuperar documentos pendientes. El bus es en memoria; no prometo entrega exactamente una vez frente a una caída entre el envío a un canal y el registro.»

Mostrar solo los módulos y ficheros necesarios; no abrir `.env`, paneles de administración, tokens, IP ni material personal.

### 5. Asistente

«BoeBot exige sesión para consultar y utiliza cuotas persistentes. En una ficha responde sobre ese documento. En el archivo busca hasta seis resultados en PostgreSQL y recupera fragmentos de textos oficiales persistidos. Las fuentes se muestran antes de la respuesta. Es recuperación lexical; no hay una base vectorial ni navegación web del modelo.»

Iniciar sesión con la cuenta de prueba. Pregunta sugerida: **«¿Qué se aprueba en esta disposición?»**. Esperar la respuesta y mostrar su fuente. Si una consulta tarda, explicar que depende del proveedor y enseñar el estado real; no editar el vídeo para simular una respuesta instantánea. Si se utiliza un corte para ahorrar tiempo, indicarlo.

### 6. Verificación y despliegue

«Las comprobaciones están en el informe técnico: pruebas automatizadas, tipos, fronteras y compilación. También se verificó el Docker web y se corrigió la inclusión de recursos estáticos. La web se publica en Vercel y la API y la base están en el VPS. Compruebo ambos despliegues por separado.»

Usar los **resultados finales** de Verificacion-tecnica.md; no memorizar un recuento previo si cambió tras una corrección. No describir estas pruebas como una auditoría de seguridad o una medición de fidelidad de todos los resúmenes.

### 7. Decisiones y cierre

Explicar con tus palabras qué parte hiciste con apoyo de IA, qué verificaste tú y qué decisiones técnicas puedes defender. Añadir una dificultad real que recuerdes; no atribuirte una experiencia sugerida que no ocurrió.

«Las siguientes mejoras que valoraría son una evaluación factual con un corpus anotado, métricas por etapa y una cola durable. El README contiene los pasos para ejecutar el proyecto, las credenciales de prueba y los enlaces de la entrega.»

## Publicación y comprobación

1. Reproducir el vídeo completo: voz audible, pantalla legible y ausencia de datos privados.
2. Publicarlo en YouTube con acceso por enlace, Drive con lectura mediante enlace u otro servicio que acepte el máster. No es necesario hacerlo indexable por buscadores.
3. Probar el enlace desde una ventana sin sesión: debe reproducirse sin pedir acceso.
4. Copiar su URL real en README.md y en la ficha del formulario. No usar una URL de ejemplo como si estuviera publicada.
5. Conservar la grabación local y el justificante del envío.
