#!/usr/bin/env bash
# Ingesta semanal de la BDNS. La lanza el cron del VPS los lunes a las 08:00.
#
#   crontab -e
#   0 8 * * 1 cd /opt/boe-inspector && ./scripts/subvenciones-semanal.sh >> /var/log/boe-subvenciones.log 2>&1
#
# Se piden 14 días y no 7 a propósito: la BDNS corrige fichas después de
# publicarlas, así que la segunda semana no trae convocatorias nuevas pero sí
# arrastra las correcciones de la anterior. Sale casi gratis, porque `save` es
# un UPSERT por código BDNS y el gateway no vuelve a descargar el detalle de
# lo que ya está guardado.
#
# La web anuncia "se actualiza cada lunes", así que si se cambia el día hay que
# cambiarlo también en `apps/web/src/app/subvenciones/`.
set -euo pipefail
cd "$(dirname "$0")/.."

DESDE=$(date -d "14 days ago" +%F)
HASTA=$(date +%F)

echo "=== $(date -Is) · ingesta BDNS $DESDE → $HASTA ==="
./scripts/subvenciones.sh ingest "$DESDE" "$HASTA"
echo "=== $(date -Is) · notificando a Telegram y Discord ==="
# Si el anuncio falla (red, webhook…), la ingesta ya está hecha: no se
# tira el trabajo. El aviso queda en el log del cron.
if ! ./scripts/subvenciones.sh notify; then
  echo "AVISO: la ingesta terminó bien pero el anuncio falló" >&2
fi
echo "=== $(date -Is) · terminada ==="
