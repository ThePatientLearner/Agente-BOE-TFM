# Checklist de entrega del TFM

Fecha de revisión: **4 de octubre de 2026**. Fuente: las dos páginas de `Documentacion-TFM.pdf` facilitadas por el alumno, leídas completas y revisadas visualmente. El texto extraído está en `Requisitos-TFM.txt`.

Este documento distingue los materiales preparados de los requisitos que necesitan una acción personal del alumno o acceso a servicios externos. No equivale a una confirmación de envío del TFM.

## Matriz de requisitos

| Requisito del documento | Evidencia o ubicación | Estado en esta revisión |
| --- | --- | --- |
| Aplicación real, original y con valor personal | Agente BOE, aplicación operativa en `https://agenteboe.com/`; alcance explicado en README y memoria | Aplicación disponible; justificación académica en documentación |
| README con descripción general | `README.md` de la raíz | Preparado |
| Stack tecnológico | `README.md`, manifiestos `package.json` y `Arquitectura-y-decisiones.md` | Preparado |
| Instalación y ejecución | `README.md`, `.env.example`, scripts npm y Compose | Comandos principales verificados; Docker web corregido y probado en imagen temporal en VPS |
| Estructura del proyecto | `README.md` y `Arquitectura-y-decisiones.md` | Preparado |
| Funcionalidades principales | `README.md`, `Guia-evaluador.md`, memoria y presentación | Preparadas: memoria de 14 páginas y presentación de 15 diapositivas |
| Usuario y contraseña de prueba si hay login | Cuenta `tfm_demo`; credenciales y límites en README y `Guia-evaluador.md` | Preparada en producción y comprobada; usuario sin administración ni acceso al estudio personal |
| Código fuente en repositorio público de GitHub | Copia independiente: `https://github.com/ThePatientLearner/Agente-BOE-TFM` | Copia limpia validada con instalación, 316 pruebas, tipos, fronteras y builds; publicación y acceso anónimo pendientes de confirmación final |
| Excepción de repositorio privado | El original `ThePatientLearner/BoeInspector` permanece privado | Se prepara una entrega pública independiente; no se solicita la excepción privada ni se conceden permisos desde esta verificación |
| Despliegue funcional recomendado | `https://agenteboe.com/`, API `https://api.agenteboe.com/health` | HTTP 200 y API saludable; revisión de VPS en `Estado-produccion.md` |
| URL real en documentación | `README.md` | Incorporada |
| Slides accesibles por URL pública o adjunto junto al código | `Presentacion-Agente-BOE.pptx` y `Presentacion-Agente-BOE.pdf` en `Documentos trabajo/` | Archivos finales adjuntos, 15 diapositivas/páginas; URL pública y acceso al repositorio pendientes de comprobación final |
| Referencia a slides en documentación | `README.md` | Enlaces a los archivos existentes incorporados y comprobados |
| Vídeo de la propia explicación del alumno | Grabación de Roberto explicando el proyecto | **Pendiente personal obligatorio**; se prepara guion y recorrido de demostración |
| Captura de pantalla durante la explicación en vídeo | Grabación de pantalla con la aplicación y presentación | **Pendiente personal obligatorio**; mostrar la cara es opcional |
| URL pública del vídeo | Enlace YouTube, Drive u otro servicio accesible | **Pendiente** hasta grabar y publicar el vídeo; comprobar acceso sin iniciar sesión |
| URL del vídeo añadida a documentación | `README.md` y ficha de entrega | **Pendiente** hasta disponer del enlace real |
| Documentación, información de despliegue y slides dentro del directorio del código | README y `Documentos trabajo/` | Documentos incorporados; 46 enlaces locales revisados sin destinos ausentes; ZIP sanitizado en preparación |
| Envío mediante formulario de la lección Proyecto Final | Formulario del campus del máster | **Pendiente personal**; no hay prueba de envío |

## Campos que exige el formulario

Copiar los valores finales desde la ficha de entrega, y revisar antes de enviar:

- Nombre completo del alumno.
- Email utilizado en la inscripción del máster.
- URL del repositorio de GitHub accesible para el evaluador.
- URL de despliegue o publicación: `https://agenteboe.com/`.
- URL de las slides o enlace al archivo adjunto en el repositorio.
- URL pública del vídeo de explicación y pantalla.
- Usuario y contraseña de prueba, si el evaluador debe probar las funciones con login.

El PDF sitúa el formulario en la descripción de la lección correspondiente al Proyecto Final. No incluye la URL concreta del formulario ni la fecha de cierre de la edición. Deben obtenerse del campus; no se ha supuesto una fecha de entrega.

## Comprobación final antes del envío

1. Abrir el repositorio sin depender de la sesión personal del alumno, o verificar el acceso del evaluador si la excepción privada está justificada.
2. Abrir la web y ejecutar el recorrido de demostración con un navegador limpio.
3. Descargar y abrir la presentación; confirmar que la documentación enlaza su archivo final.
4. Grabar la explicación personal con captura de pantalla. El vídeo no puede sustituirse por una narración de una IA presentada como si fuera la del alumno.
5. Abrir la URL del vídeo sin iniciar sesión y añadirla al README y a la ficha de entrega.
6. Probar las credenciales dedicadas, si se facilitan, sin incluir claves API, accesos al VPS ni contraseñas personales.
7. Completar los campos del formulario, enviar y conservar el justificante.

## Evidencia técnica disponible

`Verificacion-tecnica.md` registra las **316 pruebas finales correctas** (237 del monolito y 79 de la web), TypeScript, fronteras entre módulos, compilaciones y consultas públicas realizadas. También incluye la instalación limpia del lock y el audit: 0 avisos de dependencias de producción y 2 moderados residuales de herramientas de desarrollo. No se afirma que el TFM esté entregado ni que los requisitos personales pendientes estén completados.

La copia independiente del TFM también pasó esa validación completa, generó 156 páginas con la API disponible y completó el login/logout del asistente con una cuenta de usuario sin permisos de administración. La evidencia está en `Evidencias/copia-tfm-validacion.json` y no contiene rutas locales absolutas ni tokens. Se verificó que los ocho archivos personales excluidos y `.env` no están en esa copia.
