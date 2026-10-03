#!/usr/bin/env bash
# Despliega el código del Mac al VPS y reconstruye la aplicación.
#
#   ./scripts/deploy-vps.sh
#
# Existe porque hacer el rsync a mano tiene dos trampas que ya tumbaron el
# servicio una vez:
#
#   1. `rsync -a` como root PRESERVA el propietario del Mac (UID 501). Las
#      credenciales del túnel deben pertenecer al UID 65532, que es con el
#      que corre la imagen de cloudflared; si se pisan, el túnel arranca,
#      no puede leerlas y api.agenteboe.com devuelve 530. Por eso van
#      excluidas y el resto se sube sin propietario.
#   2. `docker-compose.yml` es el de DESARROLLO y publica Postgres en el
#      5432 del host. En el VPS no debe existir siquiera.
set -euo pipefail

cd "$(dirname "$0")/.."

# El destino NO se escribe aquí: este código puede publicarse y una de las
# razones de usar el túnel Cloudflare es que la IP del servidor no se
# conozca. Vive en deploy/.vps-target, que está en .gitignore.
VPS="${VPS:-$(cat deploy/.vps-target 2>/dev/null || true)}"
DEST="${DEST:-/opt/boe-inspector}"

if [ -z "$VPS" ]; then
  echo "No sé a qué servidor desplegar." >&2
  echo "Crea deploy/.vps-target con una línea tipo  root@1.2.3.4" >&2
  echo "o lanza:  VPS=root@1.2.3.4 $0" >&2
  exit 1
fi

echo "→ Subiendo código a $VPS:$DEST"
rsync -rlptz --delete \
  --no-owner --no-group \
  --exclude node_modules --exclude .next --exclude .git --exclude backups \
  --exclude 'Documentos trabajo' --exclude 'deploy/.vps-target' \
  --exclude '.env' --exclude '.env.*' \
  --exclude docker-compose.yml \
  --exclude 'deploy/cloudflared/*.json' \
  --exclude MIGRACION-NUBE.md --exclude '*.html' --exclude img_capitanBoe.png \
  --exclude .DS_Store \
  ./ "$VPS:$DEST/"

echo "→ Reconstruyendo la aplicación"
ssh "$VPS" "cd $DEST && docker compose -f docker-compose.prod.yml up -d --build --no-deps app"

echo "→ Esperando a que esté sana"
ssh "$VPS" "cd $DEST && for i in \$(seq 1 20); do
  s=\$(docker compose -f docker-compose.prod.yml ps --format '{{.Service}} {{.Status}}' | grep '^app ')
  case \"\$s\" in *healthy*) echo \"\$s\"; exit 0;; esac
  sleep 3
done; echo 'AVISO: la app no llegó a healthy'; docker compose -f docker-compose.prod.yml logs app --tail 30; exit 1"

echo "→ Comprobando el servicio público"
curl --fail -sS -o /dev/null -w "https://api.agenteboe.com/health -> %{http_code}\n" https://api.agenteboe.com/health
