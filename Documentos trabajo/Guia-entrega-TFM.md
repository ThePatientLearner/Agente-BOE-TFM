# Empieza aquí · entrega de Agente BOE

Revisión: **4 de octubre de 2026**. Esta carpeta reúne los materiales del TFM y la evidencia técnica. El formulario del campus **todavía no se ha enviado**.

## Materiales para revisar

| Material | Archivo | Uso |
| --- | --- | --- |
| Memoria técnica | [PDF](Memoria-Agente-BOE.pdf) · [texto editable](Memoria-Agente-BOE.md) | Leer alcance, decisiones, límites y evidencia |
| Presentación | [PowerPoint editable](Presentacion-Agente-BOE.pptx) · [PDF](Presentacion-Agente-BOE.pdf) | Explicar el proyecto en 15 diapositivas |
| Guía del evaluador | [Guia-evaluador.md](Guia-evaluador.md) | Probar web, cuenta de demostración e instalación |
| Arquitectura | [Arquitectura-y-decisiones.md](Arquitectura-y-decisiones.md) | Contrastar afirmaciones con los ficheros de código |
| Verificación | [Verificacion-tecnica.md](Verificacion-tecnica.md) | Consultar resultados finales y límites de las pruebas |
| Producción | [Estado-produccion.md](Estado-produccion.md) | Verificar Git, contenedores, cron y servicios públicos |
| Vídeo | [Guion-video.md](Guion-video.md) | Preparar tu propia explicación con captura de pantalla |
| Requisitos | [Checklist-TFM.md](Checklist-TFM.md) | Comprobar lo exigido por las dos páginas del PDF |

La presentación y la memoria se adjuntan también al código. Las copias para publicación se sirven en `https://agenteboe.com/tfm/`; el informe de producción registra cuándo se ha confirmado su disponibilidad. No se enlazan desde la portada ni se incluyen en el sitemap.

## Datos para el formulario

| Campo | Valor preparado |
| --- | --- |
| Nombre | Roberto Casabán; confirmar el nombre completo que figura en la matrícula |
| Email de inscripción | **Pendiente de facilitar por el alumno**; guardarlo en la ficha privada, no en Git |
| Repositorio | https://github.com/ThePatientLearner/Agente-BOE-TFM — copia pública depurada para el TFM |
| Despliegue | https://agenteboe.com/ |
| Slides PDF | https://agenteboe.com/tfm/Presentacion-Agente-BOE.pdf |
| Slides PowerPoint | https://agenteboe.com/tfm/Presentacion-Agente-BOE.pptx |
| Vídeo público | **Pendiente de grabar y publicar con tu propia explicación y pantalla** |
| Usuario de prueba | `tfm_demo` |
| Contraseña de prueba | `Lectura del boletin TFM 2026!` |

La cuenta es exclusiva para demostrar el bot. Tiene los límites de un usuario normal y no permite administración ni estudio privado. Las cinco consultas diarias se comparten entre quienes usen esa cuenta. Si se agotan, la lectura pública y las fichas siguen disponibles; reservar consultas para la evaluación.

## Lo que falta para cumplir todos los requisitos

1. **Revisar el código publicado.** Abrir la copia pública del TFM y confirmar que representa el trabajo que vas a defender. La copia excluye el CV, los HTML personales, los datos, las claves y el historial original; incluye las pruebas, el backend, la web y estos documentos. El ZIP local reúne el mismo alcance. La accesibilidad se acredita en el informe de verificación.
2. **Vídeo personal.** Grabar tu voz y la pantalla siguiendo el guion, publicarlo con acceso por enlace y comprobarlo sin sesión. Sustituir la línea de vídeo pendiente del README por su URL real.
3. **Datos y envío.** Confirmar nombre completo y email de inscripción, copiar los enlaces finales al formulario de la lección Proyecto Final, enviar y guardar el justificante.

El PDF no aporta URL del formulario ni fecha límite. No se ha inventado ninguna. La memoria y el guion no sustituyen el vídeo personal exigido.

## Ubicación del proyecto

La copia de trabajo está en la subcarpeta **Agente BOE** del proyecto accesible desde Codex. La ruta anterior `~/dev/BoeInspector` es un enlace de compatibilidad a esa misma copia. No son dos versiones independientes.

`Privado/` guarda la documentación académica original y la ficha de datos personales; está excluida de Git. `.build/` contiene los borradores y comprobaciones de documentos y también está excluida. El ZIP y las grabaciones de vídeo permanecen locales. Los documentos finales y capturas seleccionadas sí acompañan al código.
