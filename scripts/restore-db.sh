#!/usr/bin/env bash
# Restaura una copia de seguridad en la base de datos actual.
#
#   ./scripts/restore-db.sh backups/boe-2026-08-06-1900.sql.gz
#
# Este es el paso de la mudanza: levantas el compose en el servidor
# nuevo, copias el fichero .sql.gz y lo restauras aquí.
#
# En el VPS hay dos compose y hay que decir cuál (ver backup-db.sh):
#
#   COMPOSE=docker-compose.prod.yml ./scripts/restore-db.sh backups/….sql.gz
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Uso: $0 <fichero.sql.gz>" >&2
  exit 1
fi

DUMP="$1"
if [ ! -f "$DUMP" ]; then
  echo "No existe el fichero: $DUMP" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

COMPOSE="${COMPOSE:-docker-compose.yml}"

echo "Compose: $COMPOSE"
echo "ATENCIÓN: esto sobrescribe los datos actuales de boe_inspector."
if [ "${ASSUME_YES:-}" = "1" ]; then
  echo "ASSUME_YES=1: se continúa sin preguntar."
else
  read -r -p "¿Continuar? (escribe SI): " CONFIRM
  [ "$CONFIRM" = "SI" ] || { echo "Cancelado."; exit 1; }
fi

# ON_ERROR_STOP: sin esto psql escupe los errores y termina con éxito, así
# que una restauración a medias se anuncia como "completada". Con esto, el
# primer error aborta y el script falla por `set -e`.
gunzip -c "$DUMP" | docker compose -f "$COMPOSE" exec -T db \
  psql -v ON_ERROR_STOP=1 -U boe -d boe_inspector

echo "Restauración completada desde $DUMP"
