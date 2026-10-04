# Ajuste del asistente MiniMax

Revisión técnica: 4 de octubre de 2026.

## Modelo comprobado

La configuración del servidor y la selección administrativa persistida indican
MiniMax. Las llamadas reales al proveedor devuelven `MiniMax-M3` en el campo
`model`; no se deduce el modelo únicamente del nombre del selector.

## Cambios

- Chat Completions, temperatura 0,3 y modo directo de M3, con hasta 1.600
  tokens de salida. Se comparó con razonamiento adaptativo: en esta muestra
  no mejoró de forma consistente la pertinencia y aumentó la espera.
- Contestar primero la pregunta, priorizar hasta tres puntos y buscar una
  extensión habitual de 60–120 palabras. Es un objetivo de redacción, no
  un recorte automático que pueda eliminar matices o referencias.
- Conservar las reglas de fuentes y claridad durante los repasos. Su contexto
  se transmite como objeto JSON, sin volver a codificarlo como cadena.
- Pedir la convocatoria concreta cuando no aparece un plazo de solicitud;
  diferenciar los fragmentos disponibles del documento completo.
- Rechazar un modelo devuelto distinto, errores del proveedor y respuestas
  cortadas por el límite. Separar el razonamiento del texto del ciudadano.
- Diagnóstico con modelo solicitado/devuelto, modo, tokens y duración; no
  registra preguntas, historial, credenciales ni razonamiento interno.

El resumidor de la ingesta mantiene su configuración independiente. Se
conservan el plazo total de generación de 42 segundos, los dos repasos por
defecto, la autenticación y los límites de consumo.

## Evaluación real acotada

Se usaron preguntas sintéticas sobre el documento público
`BOE-A-2026-20528`, con los fragmentos que recupera la aplicación. No se
usaron conversaciones de usuarios. La prueba inicial tendía a enumerar
nombres normativos completos y estructura del documento.

| Pregunta | Palabras de la última serie | Tiempo total, incluidos dos repasos |
|---|---:|---:|
| ¿Qué se aprueba en esta disposición? | 159 | 14,7 s |
| ¿A quién afecta? Dímelo claro. | 29 | 4,7 s |
| ¿Qué plazo tengo para solicitar esta ayuda? | 86 | 4,6 s |

Una repetición del tercer caso produjo 88 palabras y 7,1 segundos. Reconoció
que faltaba la convocatoria concreta. La primera serie todavía añadió un
plazo de desarrollo autonómico, pese a la instrucción de evitar asuntos
secundarios; la repetición lo eliminó. Esto ilustra el límite del ajuste:
mejora la claridad, pero no garantiza que cada respuesta cumpla todas las
instrucciones o esté libre de errores. Son pocos casos, no un benchmark de
precisión jurídica ni una garantía de latencia.

La aplicación sigue trabajando con fragmentos limitados. Para preguntas
sobre requisitos, excepciones o plazos que no aparezcan en ellos, hay que
contrastar el texto oficial completo y la convocatoria correspondiente.

## Verificación automatizada

329 tests aprobados: 250 del monolito y 79 de la web. Comprobación de tipos,
límites de módulos y compilaciones de monolito y web aprobadas. Las nuevas
pruebas cubren el contrato de M3 y otros modelos, el modelo devuelto, errores
HTTP 200, salida incompleta, separación del razonamiento, incertidumbre de
consumo y conservación del contexto y las reglas durante los repasos.

## Fuente técnica

[API oficial de MiniMax](https://platform.minimax.io/docs/api-reference/text-openai-api):
M3 admite `thinking: disabled`; ese parámetro no debe generalizarse a todos
los modelos. El modelo realmente devuelto se comprueba en cada respuesta.
