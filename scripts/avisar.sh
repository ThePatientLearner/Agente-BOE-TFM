#!/usr/bin/env bash
#
# Manda un aviso al chat PRIVADO de Telegram. Para los crons y para cualquier
# cosa que quiera contar cómo le fue sin montar un notificador entero.
#
#   ./scripts/avisar.sh "la pasada de datos terminó bien"
#   echo "informe largo" | ./scripts/avisar.sh "Datos · resumen"
#
# Solo al chat privado (TELEGRAM_ALERT_CHAT_ID), nunca al canal público: ahí
# hay miles de suscriptores y esto es fontanería.
#
# Sale 0 aunque Telegram falle. Quien llama a este script ya ha hecho su
# trabajo; que el aviso no salga no puede tumbarle la tarea.
set -uo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env ]]; then
  echo "avisar: no existe .env" >&2
  exit 0
fi

# grep en vez de 'source .env': CRON_SCHEDULE lleva asteriscos que la shell
# expandiría como comodines. Mismo motivo y mismo apaño que en ask-ai.sh.
read_env() { grep -E "^$1=" .env | head -1 | cut -d= -f2- | tr -d '"'; }

TOKEN="$(read_env TELEGRAM_BOT_TOKEN)"
CHAT="$(read_env TELEGRAM_ALERT_CHAT_ID)"

if [[ -z "$TOKEN" || -z "$CHAT" ]]; then
  echo "avisar: falta TELEGRAM_BOT_TOKEN o TELEGRAM_ALERT_CHAT_ID en .env" >&2
  exit 0
fi

# Por si acaso: el chat de alertas es un id numérico. Un @canal aquí sería
# publicar por error lo que se quería mandar en privado.
if [[ "$CHAT" == @* ]]; then
  echo "avisar: TELEGRAM_ALERT_CHAT_ID parece un canal público ($CHAT), no envío" >&2
  exit 0
fi

TEXTO="${1:-}"
if [[ ! -t 0 ]]; then
  TEXTO="$TEXTO"$'\n'"$(cat)"
fi

if [[ -z "${TEXTO// }" ]]; then
  echo "Uso: $0 \"mensaje\"   (o pásale texto por una tubería)" >&2
  exit 0
fi

# Telegram corta en 4096 caracteres y responde 400 si te pasas: mejor recortar
# aquí y decirlo que perder el aviso entero.
if (( ${#TEXTO} > 3900 )); then
  TEXTO="${TEXTO:0:3900}"$'\n\n…(recortado)'
fi

# python3 arma el JSON para que comillas y saltos de línea viajen bien.
BODY=$(TEXTO="$TEXTO" CHAT="$CHAT" python3 -c '
import json, os
print(json.dumps({
    "chat_id": os.environ["CHAT"],
    "text": os.environ["TEXTO"],
    "disable_web_page_preview": True,
}))
')

if ! curl -sS --max-time 20 -X POST \
  "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H "Content-Type: application/json" \
  -d "$BODY" -o /dev/null; then
  echo "avisar: Telegram no respondió, sigo adelante" >&2
fi

exit 0
