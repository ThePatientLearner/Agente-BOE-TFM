#!/usr/bin/env bash
# CLI de subvenciones (BDNS) sin Node instalado en la máquina.
#
#   ./scripts/subvenciones.sh ingest                        → últimos 7 días
#   ./scripts/subvenciones.sh ingest 2026-08-01 2026-08-08
#   ./scripts/subvenciones.sh ingest 2026-08-01 2026-08-08 --refrescar
#   ./scripts/subvenciones.sh directas                      → últimos 30 días
#   ./scripts/subvenciones.sh directas 2026-08-01 2026-08-08
#   ./scripts/subvenciones.sh notify                        → anuncio Telegram/Discord
#
# En el VPS no hay Node: la app vive en Docker. Este script reutiliza la
# imagen ya construida y ejecuta sus CLI compiladas. No necesita tsx,
# dependencias de desarrollo ni node_modules copiados al host.
#
# Comparte el namespace de red del contenedor de Postgres para que el
# `localhost:5432` del DATABASE_URL resuelva sin publicar el puerto al
# exterior. Salida a internet la mantiene igual, que hace falta para la
# API de la BDNS y para publicar en Telegram/Discord.
set -euo pipefail

cd "$(dirname "$0")/.."
REPO="$(pwd)"

DB_CONTAINER="${DB_CONTAINER:-boe-inspector-db-1}"
IMAGE="${IMAGE:-boe-inspector-app:latest}"

if [ ! -f "$REPO/.env" ]; then
  echo "Falta .env en la raíz del proyecto." >&2
  exit 1
fi

case "${1:-}" in
  ingest)   SCRIPT="/app/dist/cli/ingest-subvenciones.js" ;;
  directas) SCRIPT="/app/dist/cli/report-directas.js" ;;
  notify)   SCRIPT="/app/dist/cli/notify-subvenciones.js" ;;
  *) echo "Uso: $0 {ingest|directas|notify} [desde hasta] [--refrescar]" >&2; exit 1 ;;
esac
shift

exec docker run --rm \
  -v "$REPO/.env:/config/.env:ro" \
  --network "container:$DB_CONTAINER" \
  "$IMAGE" \
  node --env-file=/config/.env "$SCRIPT" "$@"
