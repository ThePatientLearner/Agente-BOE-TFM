/**
 * Reglas de frontera del monolito modular. Se ejecutan en CI
 * (`npm run check:boundaries`); si fallan, la build falla.
 */
module.exports = {
  forbidden: [
    {
      name: "solo-via-index",
      severity: "error",
      comment:
        "Un módulo solo puede importar de otro módulo a través de su index.ts (API pública)",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/([^/]+)/.+",
        pathNot: ["^src/modules/$1/", "^src/modules/[^/]+/index\\.ts$"],
      },
    },
    {
      name: "shared-sin-negocio",
      severity: "error",
      comment: "El kernel compartido no conoce los módulos de negocio",
      from: { path: "^src/shared/" },
      to: { path: "^src/modules/" },
    },
    {
      name: "dominio-puro",
      severity: "error",
      comment: "El dominio no depende de application ni de infrastructure",
      from: { path: "^src/modules/[^/]+/domain/" },
      to: { path: "^src/modules/[^/]+/(application|infrastructure)/" },
    },
    {
      name: "application-sin-infra",
      severity: "error",
      comment: "Los casos de uso dependen de puertos, nunca de adapters concretos",
      from: { path: "^src/modules/[^/]+/application/" },
      to: { path: "^src/modules/[^/]+/infrastructure/" },
    },
    {
      // `juego` NO está en la lista de prohibidos, y es el único módulo que la
      // API puede escribir. No es un olvido: la partida la termina el jugador
      // en su navegador, así que su caso de uso de escritura no tiene otra
      // puerta de entrada que esta API. Los módulos del BOE sí la tienen —el
      // cron y la CLI— y por eso siguen fuera: que la web pudiera disparar una
      // ingesta o una notificación sería una vía de abuso, no una comodidad.
      name: "api-solo-lectura",
      severity: "error",
      comment:
        "La API HTTP solo consulta puertos de lectura (catalog, spending); nunca los módulos del BOE, que se escriben desde el cron y la CLI. `juego` es la excepción declarada: se escribe desde el navegador del jugador.",
      from: { path: "^src/api/" },
      to: { path: "^src/modules/(ingestion|summarization|notifications)/" },
    },
    {
      // El comentario de `api-solo-lectura` decía "solo catalog", pero su lista
      // de prohibidos nunca incluyó `spending`: el día que la API lo importara
      // pasaría CI por omisión, no por diseño. En vez de dejarlo al azar, la
      // intención se hace explícita en dos reglas: qué módulos puede tocar
      // (arriba) y por dónde (aquí).
      //
      // Sin esta segunda, `src/api` podría importar
      // `spending/infrastructure/postgres-…` y saltarse el puerto de lectura,
      // que es precisamente lo que la frontera pretende impedir.
      name: "api-solo-por-el-indice",
      severity: "error",
      comment: "La API entra a un módulo por su index.ts, nunca por sus carpetas internas",
      from: { path: "^src/api/" },
      to: {
        path: "^src/modules/[^/]+/.+",
        pathNot: ["^src/modules/[^/]+/index\\.ts$"],
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    // Los tests pueden usar adapters en memoria; las reglas aplican al código de producción
    exclude: { path: "\\.test\\.ts$" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
  },
};
