#!/usr/bin/env bash
# Copia de seguridad de la base de datos.
#
#   ./scripts/backup-db.sh            → backups/boe-YYYY-MM-DD-HHMM.sql.gz
#
# Genera un volcado LÓGICO (SQL), no una copia binaria del volumen. Es lo
# que hace la base de datos portable: un fichero SQL se restaura en
# cualquier Postgres 16, en cualquier máquina y arquitectura. Copiar los
# ficheros del volumen a pelo solo funciona entre versiones idénticas.
#
# En el VPS hay DOS compose y `docker compose` a secas elegiría el de
# desarrollo (que además publica el 5432). Por eso el fichero se dice
# explícitamente:
#
#   COMPOSE=docker-compose.prod.yml ./scripts/backup-db.sh
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p backups

COMPOSE="${COMPOSE:-docker-compose.yml}"
STAMP=$(date +%Y-%m-%d-%H%M)
OUT="backups/boe-${STAMP}.sql.gz"

echo "Compose: $COMPOSE"

# --clean --if-exists: el volcado empieza borrando lo que va a recrear. Sin
# esto, restaurar sobre una base que ya arrancó una vez (la app aplica sus
# migraciones al iniciar) falla con "ya existe" en cada tabla.
docker compose -f "$COMPOSE" exec -T db \
  pg_dump --clean --if-exists -U boe -d boe_inspector | gzip > "$OUT"

echo "Copia creada: $OUT ($(du -h "$OUT" | cut -f1))"
echo "Restaurar en otra máquina:  ./scripts/restore-db.sh $OUT"
