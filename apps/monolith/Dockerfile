# Contexto de build: la raíz del monorepo (ver docker-compose.yml)
FROM node:22-alpine AS build
WORKDIR /repo
COPY package.json package-lock.json* ./
COPY apps/monolith/package.json apps/monolith/
RUN npm ci --workspace @boe-inspector/monolith --include-workspace-root=false || npm install --workspace @boe-inspector/monolith
COPY tsconfig.base.json ./
COPY apps/monolith apps/monolith
RUN npm run build --workspace @boe-inspector/monolith
# La compilación necesita TypeScript y herramientas de desarrollo. El runtime
# no: evita incluir Vitest, drizzle-kit y sus dependencias en producción.
RUN npm prune --omit=dev --workspace @boe-inspector/monolith --include-workspace-root=false

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
# Sin dependencias externas de IA: el resumidor habla HTTP con la API
# configurada en AI_BASE_URL. Imagen más pequeña y arranque inmediato.
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/monolith/dist ./dist
COPY --from=build /repo/apps/monolith/package.json ./
# Las migraciones son ficheros .sql que se leen EN EJECUCIÓN, no se compilan
# dentro de dist/. `migrate.ts` las busca en ../../../drizzle desde
# dist/shared/db/, o sea /app/drizzle. Sin esta línea el contenedor arranca,
# intenta migrar y muere con "Can't find meta/_journal.json file".
COPY --from=build /repo/apps/monolith/drizzle ./drizzle
EXPOSE 3001
# 127.0.0.1 y no "localhost", por lo mismo que en ~/.cloudflared/config.yml:
# localhost resuelve antes a ::1 (IPv6) y Fastify escucha en 0.0.0.0, que es
# solo IPv4. Con el nombre, el chequeo daba "connection refused" y el
# contenedor se quedaba eternamente en `health: starting` con la API sana.
# start-period: margen para migraciones y arranque antes de contar fallos.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget -qO- http://127.0.0.1:3001/health || exit 1
CMD ["node", "dist/main.js"]
