# Verificación técnica de Agente BOE

Fecha: **4 de octubre de 2026**, zona horaria Europe/Madrid. Comprobaciones iniciales ejecutadas entre las 00:04 y las 00:07 CEST; revisión de dependencias y nueva pasada de pruebas entre las 00:16 y las 00:20 CEST.

Directorio verificado: `/Users/robertocasaban/dev/pluginSafari/claudeSafari/Agente BOE`.

Revisión de código al iniciar las comprobaciones: `3f8a2549705df71b11b758c38dc5ad47438bdf3f` ("Identificar las radiografías con logos animados"). Las comprobaciones se ejecutaron antes de incorporar los nuevos documentos de entrega del TFM. No se modificó el código de la aplicación durante esta validación.

**Validación final posterior:** tras las correcciones del asistente y las actualizaciones de dependencias se registraron **316 pruebas correctas** (237 del monolito y 79 de la web), tipos correctos en ambos workspaces, fronteras correctas (127 módulos, 409 dependencias) y compilación del monolito correcta. Se conservan abajo los resultados de las pasadas anteriores para distinguirlas. La compilación web final con API también pasó y generó 156 páginas. Los archivos publicados se comprueban por separado.

## Entorno

| Elemento | Valor observado |
| --- | --- |
| Sistema | macOS local |
| Node.js | `v26.8.1` |
| npm | `11.19.0` |
| Next.js utilizado por la compilación | `15.5.26` |
| Vitest utilizado por las pruebas | `3.2.7` |
| Docker local | No disponible en el PATH; no se ejecutó una compilación local de las imágenes |

El proyecto declara Node.js `>=22`. La compilación local documentada se ha ejecutado con Node.js 26; la imagen del monolito emplea `node:22-alpine`. Estos entornos no deben considerarse una misma prueba.

## Comandos y resultados

Todos los comandos siguientes se ejecutaron desde la raíz del proyecto y finalizaron con código de salida `0`.

| Comando | Resultado observado |
| --- | --- |
| `npm test` | **308 pruebas correctas**: monolito 229 pruebas en 25 archivos; web 79 pruebas en 8 archivos |
| `npm run typecheck` | TypeScript sin errores en ambos workspaces |
| `npm run check:boundaries` | `no dependency violations found (126 modules, 408 dependencies cruised)` |
| `API_URL=https://api.agenteboe.com npm run build --workspace @boe-inspector/web` | Compilación de producción correcta; **156 páginas estáticas generadas** |
| `npm run build --workspace @boe-inspector/monolith` | Compilación del monolito con `tsc -p tsconfig.json` correcta |

Resumen literal de las pruebas:

```text
Monolito:
Test Files  25 passed (25)
     Tests  229 passed (229)
  Duration  6.67s

Web:
Test Files  8 passed (8)
     Tests  79 passed (79)
  Duration  323ms
```

La tabla del build web informó para `/`: tamaño de ruta `8.57 kB` y `First Load JS` de `115 kB`. Son medidas del informe de Next.js; no equivalen a velocidad de carga, puntuación de Lighthouse, consumo real de red ni número de usuarios.

## Comprobaciones públicas de funcionamiento

Estas consultas fueron de lectura. No se enviaron notificaciones, preguntas de pago a modelos ni escrituras en la base de datos.

| Recurso | Resultado |
| --- | --- |
| `https://agenteboe.com/` | HTTP 200, HTML |
| `https://agenteboe.com/subvenciones` | HTTP 200, HTML |
| `https://agenteboe.com/pensiones` | HTTP 200, HTML |
| `https://agenteboe.com/quien-paga` | HTTP 200, HTML |
| `https://api.agenteboe.com/health` | HTTP 200 mediante `curl`; cuerpo `{"status":"ok"}` |
| `https://api.agenteboe.com/api/days` | HTTP 200 mediante `curl`; 15 días y 73 entradas; última fecha devuelta `2026-10-03` |

Comandos para repetir las consultas de API:

```bash
curl -sS --max-time 20 -D - https://api.agenteboe.com/health
curl -sS --max-time 20 https://api.agenteboe.com/api/days
```

La primera consulta de API con `urllib.request` de Python obtuvo HTTP 403; se repitió con `curl` y respondió HTTP 200. Se conserva esta diferencia como limitación del cliente empleado, sin interpretar el primer 403 como una caída del servicio.

La salud y la respuesta del catálogo prueban disponibilidad en el momento de la consulta. No prueban por sí solas el estado de todos los cron, proveedores de IA, notificaciones o funciones con autenticación. La revisión del VPS y la sincronización de producción se documentan por separado en `Estado-produccion.md`.

## Acceso al código fuente

Consulta ejecutada:

```bash
gh api repos/ThePatientLearner/BoeInspector \
  --jq '{full_name,private,html_url,default_branch,updated_at}'
```

Resultado observado a las 00:06 CEST:

```json
{
  "default_branch": "main",
  "full_name": "ThePatientLearner/BoeInspector",
  "html_url": "https://github.com/ThePatientLearner/BoeInspector",
  "private": true,
  "updated_at": "2026-10-03T21:52:33Z"
}
```

El repositorio original era **privado** en esta comprobación, aunque `AGENTS.md` describía un repositorio público. El PDF del TFM pide un repositorio público o una excepción privada justificada con acceso al evaluador. Este informe no acredita que dicha excepción esté concedida ni que se haya cambiado la visibilidad. Véase el estado final de ese requisito en `Checklist-TFM.md`.

Para cumplir el requisito sin abrir el historial y los documentos personales del repositorio original, se preparó una copia independiente de entrega: `https://github.com/ThePatientLearner/Agente-BOE-TFM`. La copia limpia ha pasado la validación descrita a continuación; la publicación y el acceso anónimo deben confirmarse tras crear el repositorio. El original conserva su visibilidad privada.

## Reproducibilidad de los contenedores

Docker no estaba disponible localmente. La prueba de imagen web se realizó en el VPS con una imagen temporal, sin sustituir el despliegue web de Vercel:

- El monolito copia `tsconfig.base.json`, compila TypeScript y conserva las migraciones SQL en la imagen de ejecución.
- El `tsconfig.json` web contiene su configuración y no hereda del fichero raíz; no se identificó un error por ausencia de `tsconfig.base.json` en esa imagen.
- Se corrigió `apps/web/Dockerfile` para copiar `public/` a la imagen final y se añadió `.dockerignore` para excluir secretos, Git, dependencias locales y artefactos de trabajo del contexto.
- La evidencia `Evidencias/docker-web-runtime.txt` confirma la presencia de `server.js`, el emblema animado, el juego y los HTML privados del área de estudio en la imagen temporal. También confirma la ausencia de `.env` y de `.git`.
- `Evidencias/runtime-api-integridad.json` registra 113 archivos JavaScript compilados locales y 113 en el contenedor de API, sin ausentes, extras ni diferencias en el cotejo realizado. La reconstrucción posterior con las dependencias actualizadas requiere su propia comprobación de producción.

## Revisión de dependencias

El audit inicial del monorepo devolvió **15 avisos**: 9 moderados y 6 altos. El subconjunto de dependencias de producción del monolito devolvió 6 avisos (2 moderados y 4 altos). Son recuentos de paquetes señalados por el registro de npm, no seis o quince ataques observados en la aplicación.

Se actualizaron los paquetes y se fijaron sustituciones acotadas para dependencias transitivas, conservando Next.js 15 y node-cron 3:

| Paquete | Versión final verificada | Motivo |
| --- | --- | --- |
| Fastify | `5.12.5` | Correcciones de seguridad en la misma rama 5.x |
| Drizzle ORM | `0.45.3` | Corrección del escape de identificadores SQL de versiones anteriores a 0.45.2 |
| fast-uri | `3.1.8` y `4.2.1` | Correcciones de normalización de URI en las ramas usadas por AJV y Fastify |
| nanoid | `3.3.19` | Corrección del generador personalizado con tamaño cero |
| PostCSS de Next.js | `8.5.28` | Sustitución acotada dentro de la rama 8.x para corregir avisos del parser y los mapas de origen |
| sharp de Next.js | `0.35.5` | Bibliotecas nativas corregidas; se comprobó la importación y la conversión SVG a PNG |
| uuid de node-cron | `11.1.1` | Versión con CommonJS y corrección de límites de buffers; node-cron usa la API `v4()`, que se comprobó |
| esbuild de core-utils | `0.25.12` | Corrección del servidor de desarrollo en la dependencia de drizzle-kit |
| drizzle-kit | `0.31.11` | Actualización de parche de la herramienta de migraciones |

Fuentes primarias consultadas: [aviso de Drizzle ORM](https://github.com/advisories/GHSA-gpj5-g38j-94v9), [release de Fastify 5.12.5](https://github.com/fastify/fastify/releases/tag/v5.12.5), [aviso de sharp/libvips](https://github.com/advisories/GHSA-f88m-g3jw-g9cj), [historial de uuid](https://github.com/uuidjs/uuid/blob/main/CHANGELOG.md), [PostCSS 8.5.28](https://github.com/postcss/postcss/releases/tag/8.5.28) y [aviso de esbuild](https://github.com/advisories/GHSA-67mh-4wv8-2f99).

La inspección del código no encontró identificadores SQL construidos a partir de entrada libre del usuario, pero se actualizó igualmente Drizzle. Esta observación limita el camino de explotación descrito en el aviso; no demuestra por sí sola la seguridad general de todas las consultas.

Resultados posteriores a las actualizaciones:

| Comando o prueba | Resultado |
| --- | --- |
| `npm audit --omit=dev --json` | Código 0, **0 avisos** en el grafo de dependencias de producción del monorepo |
| `npm audit --json` | Código 1 por **2 avisos moderados**, ambos de herramientas de desarrollo: `vitest` y `@vitest/mocker` |
| `npm test` | 308 pruebas correctas de nuevo: 229 monolito y 79 web |
| `npm run typecheck` | Ambos workspaces sin errores |
| `npm run check:boundaries` | Sin violaciones, **127 módulos y 409 dependencias** tras añadir la CLI de demostración |
| `npm ls postcss sharp uuid esbuild fastify drizzle-orm fast-uri nanoid` | Árbol coherente con los overrides; no hay paquetes inválidos en esa comprobación |
| `npm ci --ignore-scripts --no-fund` en una carpeta temporal con los cuatro manifiestos/lock | Código 0; instalación limpia de 210 paquetes. El mismo `npm ls` en esa instalación limpia terminó con código 0 |
| `npm exec --workspace @boe-inspector/monolith -- drizzle-kit --version` | `drizzle-kit: v0.31.11`, `drizzle-orm: v0.45.3` |
| Prueba mínima de node-cron/uuid | Tarea no iniciada, nombre generado válido de UUID v4 |
| Prueba mínima de sharp | `sharp: 0.35.5`, PNG de 95 bytes generado desde SVG de prueba |

Los informes completos están en `Evidencias/npm-audit-completo.json` y `Evidencias/npm-audit-produccion.json`.

El aviso residual de Vitest afecta al servidor de mocks en versiones anteriores a 4.1.11. El proyecto usa `vitest run` y no expone ese servidor como parte del servicio web. Se mantiene como deuda de herramientas de desarrollo; eliminarlo exige evaluar una actualización mayor de Vitest. El resultado de `--omit=dev` describe dependencias declaradas de producción, no demuestra por sí solo que una imagen Docker haya excluido físicamente todas las herramientas de desarrollo.

Esta revisión no ejecutó nuevos builds grandes simultáneos a la generación de la presentación. La validación final de la coordinación, después de las correcciones del asistente, obtuvo:

| Comando | Resultado final |
| --- | --- |
| `npm test` | **316 pruebas correctas**: 237 del monolito y 79 de la web |
| `npm run typecheck` | Ambos workspaces sin errores |
| `npm run check:boundaries` | Sin violaciones: 127 módulos y 409 dependencias |
| `npm run build --workspace @boe-inspector/monolith` | Correcto |

Un build web posterior a las actualizaciones terminó correctamente sin definir `API_URL` y generó 19 páginas. Esa pasada comprueba la compilación en ausencia de catálogo, pero no sustituye al build final con `API_URL=https://api.agenteboe.com`, necesario para verificar las rutas de disposiciones precargadas. Las compilaciones iniciales están registradas arriba; el build final se ejecutó con la API pública y generó 156 páginas sin errores. El despliegue se documenta en `Estado-produccion.md`.

## Revisión del paquete documental

Comprobaciones programáticas realizadas sobre los archivos existentes:

- [Memoria PDF](Memoria-Agente-BOE.pdf): 14 páginas, 488676 bytes.
- [Presentación PDF](Presentacion-Agente-BOE.pdf): 15 páginas, 766156 bytes.
- [Presentación PowerPoint](Presentacion-Agente-BOE.pptx): 15 diapositivas, 569612 bytes; contenedor ZIP de PowerPoint válido.
- 46 enlaces locales de Markdown revisados en el README y los documentos de la raíz de `Documentos trabajo/`, sin destinos ausentes.
- Extracción de texto de los dos PDF finales sin caracteres de sustitución (`U+FFFD`) ni marcadores `TODO`, `FIXME`, `INSERTAR` o `Lorem ipsum`.
- No se encontraron enlaces HTTP mal formados en las anotaciones de los PDF. El PDF de la presentación y el PPTX no contienen hipervínculos incrustados; sus URL se muestran como texto y el README enlaza los archivos.

Estas comprobaciones estructurales complementan la revisión visual de los documentos, no la sustituyen. La presencia del archivo local no acredita que su futura URL pública ya esté desplegada. La copia ZIP sanitizada se revisará cuando exista.

## Validación de la copia independiente del TFM

Se validó la copia preparada para el repositorio público del TFM, con instalación propia de dependencias y sin los ocho archivos de CV y HTML de estudio personal del original. No contiene `.env`. La comprobación no modificó el código de la aplicación ni publicó el repositorio.

| Comando ejecutado en la copia | Resultado |
| --- | --- |
| `npm ci` | Código 0; 210 paquetes instalados, 213 auditados; 2 avisos moderados de desarrollo |
| `npm test` | Código 0; 316 pruebas: 237 del monolito en 25 archivos y 79 de la web en 8 archivos |
| `npm run typecheck` | Código 0; ambos workspaces correctos |
| `npm run check:boundaries` | Código 0; 127 módulos, 409 dependencias, sin violaciones |
| `API_URL=https://api.agenteboe.com npm run build --workspace @boe-inspector/web` | Código 0; 156 páginas estáticas; portada de 8.56 kB y First Load JS de 115 kB |
| `npm run build --workspace @boe-inspector/monolith` | Código 0 |

El servidor de producción temporal de la copia se inició y se detuvo tras las comprobaciones. Respondieron HTTP 200 la portada, las tres radiografías, una ficha del BOE, el vídeo del emblema y el juego. La prueba de autenticación con la cuenta de demostración produjo:

- Sesión consultada sin login: HTTP 401.
- Login: HTTP 200 y cookie de sesión entregada.
- Sesión consultada tras login: HTTP 200, rol `student`, `studyAccess: false`.
- Acceso a modelos de administración: HTTP 403, según lo esperado.
- Logout: HTTP 200; consulta posterior de sesión: HTTP 401.

Las peticiones de autenticación utilizaron la API pública. No se enviaron preguntas a modelos ni se consumió cuota de IA. Los tokens no se incluyen en la evidencia.

En la primera prueba de login, usar `127.0.0.1` frente al origen anunciado por Next (`localhost`) produjo el rechazo de origen HTTP 403. La repetición con el mismo origen del servidor completó el recorrido. Next también avisó de múltiples lockfiles porque la copia estaba anidada en el repositorio original durante la comprobación, y recomendó el comando de salida standalone al arrancar mediante `next start`. Estos avisos no impidieron las compilaciones y peticiones registradas.

La evidencia detallada, sin rutas locales absolutas ni tokens, está en `Evidencias/copia-tfm-validacion.json`. Estos resultados demuestran que excluir los documentos personales no impide instalar, probar, compilar ni servir el núcleo público y la autenticación del asistente BOE. Las rutas de estudio personal no forman parte del alcance de esa copia.

No se han realizado una auditoría de penetración, una evaluación estadística de fidelidad de todos los resúmenes ni un benchmark de carga. Las 316 pruebas finales y las comprobaciones de tipos, fronteras y compilación tienen el alcance descrito arriba.
