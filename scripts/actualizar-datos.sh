#!/usr/bin/env bash
#
# Revisión mensual de los datos curados: «¿Quién paga la fiesta?», «Pensiones
# en España» y la tabla de quién gobierna cada comunidad autónoma. La lanza el
# cron del VPS el día 5.
#
#   crontab -e
#   0 6 5 * * cd /opt/boe-inspector && ./scripts/actualizar-datos.sh >> /var/log/boe-datos.log 2>&1
#
# Qué hace: pone a Claude Code a seguir el skill `actualizar-datos-radiografias`
# contra las fuentes oficiales; si algo ha cambiado, pasa las puertas y deja un
# pull request listo para revisar. **Nunca toca `main`.**
#
# Por qué un PR y no un commit directo: son cifras que la web presenta como
# ciertas y que se citan en un canal con miles de suscriptores. Una IA leyendo
# una nota de prensa se puede equivocar de universo (presupuesto del Ministerio
# de Defensa en vez de criterio OTAN, por ejemplo) sin que nada compile mal. La
# última comprobación la hace una persona, y el PR está montado para que revisar
# cueste dos minutos: diff pequeño, fuente por cifra y puertas ya pasadas.
#
# Variables:
#   DRY_RUN=1     hace todo menos push, PR y aviso
#   MAX_LINEAS=n  tope de líneas cambiadas (por defecto 150)
set -uo pipefail

# El cron trae un PATH mínimo y sin HOME no se encuentran las credenciales de
# Claude Code (~/.claude/.credentials.json).
export PATH="/usr/local/bin:/usr/bin:/bin:${PATH:-}"
export HOME="${HOME:-/root}"

cd "$(dirname "$0")/.."
RAIZ="$(pwd)"

DRY_RUN="${DRY_RUN:-0}"
MAX_LINEAS="${MAX_LINEAS:-150}"
MES="$(date +%Y-%m)"
RAMA="datos/$MES"
TRABAJO="$(mktemp -d)"
INFORME="$RAIZ/INFORME.md"

log() { echo "=== $(date -Is) · $*"; }
avisar() { "$RAIZ/scripts/avisar.sh" "$1" >/dev/null 2>&1 || true; }

limpiar() { rm -rf "$TRABAJO" "$INFORME"; }
trap limpiar EXIT

# Dos pasadas a la vez editando los mismos ficheros sería un destrozo silencioso.
exec 9>/var/lock/boe-datos.lock
if ! flock -n 9; then
  log "ya hay una pasada en marcha, salgo"
  exit 0
fi

log "revisión de datos · $MES · dry-run=$DRY_RUN"

# ── 0. Guardas ──────────────────────────────────────────────────────
# Arrancar sobre cambios ajenos sería mezclar el trabajo de la IA con el de
# alguien y no poder distinguirlos en el diff.
#
# La causa más probable no es que haya nadie trabajando: es `package-lock.json`.
# La npm del VPS (10.x) reescribe marcadores `peer` que la del Mac (11.x) no
# pone, así que basta un `npm install` aquí para ensuciar el árbol. Si es eso,
# `git checkout -- package-lock.json` y listo; node_modules no se toca.
if [[ -n "$(git status --porcelain)" ]]; then
  SUCIO="$(git status --porcelain | head -5)"
  log "ABORTO: el árbol de trabajo está sucio"
  log "$SUCIO"
  avisar "⚠️ Datos $MES: no arranco, el árbol del VPS tiene cambios sin commitear:"$'\n'"$SUCIO"
  exit 1
fi

git checkout -q main
if ! git pull -q --ff-only; then
  log "ABORTO: no puedo actualizar main"
  avisar "⚠️ Datos $MES: fallo al hacer pull de main en el VPS."
  exit 1
fi

if [[ "$DRY_RUN" != "1" ]] && gh pr list --head "$RAMA" --state open --json number \
  | grep -q '"number"'; then
  log "ya hay un PR abierto para $RAMA, no hago nada"
  exit 0
fi

git branch -D "$RAMA" >/dev/null 2>&1 || true
git checkout -q -b "$RAMA"

# ── 1. La pasada de la IA ───────────────────────────────────────────
# El prompt es corto a propósito: el procedimiento vive en el skill, que es la
# fuente de verdad y se mantiene solo. Duplicarlo aquí garantizaría que un día
# digan cosas distintas.
PROMPT=$(cat <<'FIN'
Lee .grok/skills/actualizar-datos-radiografias/SKILL.md y síguelo al pie de la
letra, incluidas sus referencias (references/mapa-y-fuentes.md y
references/baseline.md). Corte temporal: hoy.

Toca únicamente los ficheros de datos y la prosa que cite esas cifras. No
rediseñes componentes, CSS ni estructura.

Reglas que no puedes saltarte:
- Si una fuente no ha publicado dato nuevo, NO inventes ni extrapoles: deja el
  valor anterior y anótalo como pendiente.
- Cada cifra que cambies lleva en el comentario del código su fuente y su año.
- Respeta los universos: no mezcles agregados distintos bajo el mismo rótulo, y
  no cuentes dos veces lo que ya está en otro bloque.

Al terminar escribe INFORME.md en la raíz con una tabla
campo → valor anterior → valor nuevo → URL de la fuente, y debajo lo que hayas
dejado pendiente. Si no hay nada que actualizar, escribe exactamente
"sin cambios" en INFORME.md y no toques ningún otro fichero.
FIN
)

# Cuando algo sale mal, lo que hizo la IA se commitea en su rama y el VPS vuelve
# a main. Así queda la evidencia para mirarla con calma, el árbol queda limpio
# —si no, la guarda de «árbol sucio» bloquearía la pasada del mes siguiente sin
# que nadie se entere— y se respeta que el VPS viva en main.
#
# `add -A` y no `commit -a`: si la IA CREÓ un fichero, `-a` no lo coge y el
# árbol se quedaría sucio igual.
fallo() {
  log "PUERTA FALLIDA: $1"
  git add -A >/dev/null 2>&1 || true
  git -c user.name="Agente BOE (cron)" \
      -c user.email="cron@agenteboe.com" \
      commit -q -m "PUERTA FALLIDA · corte $MES

No se abrió PR. Motivo: $1

Este commit existe solo para dejar el trabajo a la vista sin bloquear la
pasada del mes siguiente. No mergear sin revisarlo entero." >/dev/null 2>&1 || true
  if ! git checkout -q main 2>/dev/null; then
    log "AVISO: no he podido volver a main; el VPS se queda en $RAMA"
  fi
  avisar "❌ Datos $MES: $1"$'\n\n'"Lo que hizo queda commiteado en la rama $RAMA del VPS."
  exit 1
}

log "lanzando Claude Code"
# Sin Bash en las herramientas: el agente investiga y edita; compilar,
# commitear y publicar es cosa de este script, que sí sabe cuándo parar.
if ! timeout 45m claude -p "$PROMPT" \
  --permission-mode acceptEdits \
  --allowedTools Read Edit Write WebSearch WebFetch Grep Glob \
  > "$TRABAJO/claude.log" 2>&1; then
  tail -20 "$TRABAJO/claude.log" || true
  fallo "la pasada de Claude falló o se agotó el tiempo (45 min)"
fi
log "Claude terminó"

# ── 2. Puertas ──────────────────────────────────────────────────────
# El INFORME.md no se commitea: es material para el cuerpo del PR.
CUERPO_INFORME="sin informe"
[[ -f "$INFORME" ]] && CUERPO_INFORME="$(cat "$INFORME")"
rm -f "$INFORME"

# 2.1 ¿Hubo cambios? Con las radiografías solas, el caso frecuente era que no:
# esas estadísticas son anuales. Desde que entra la tabla de gobiernos hay un
# cambio casi seguro cada mes —`VERIFICADO_EL` sube aunque no se mueva ningún
# gobierno—, y eso es deliberado: la web enseña esa fecha, y un PR de una línea
# al mes es también la prueba de que este cron sigue vivo.
#
# Este camino queda para cuando la IA no encuentra nada que tocar en absoluto,
# que ahora significa que ni siquiera llegó a la tabla de gobiernos. Sigue
# siendo silencioso.
if [[ -z "$(git status --porcelain)" ]]; then
  log "sin cambios: ninguna fuente ha publicado nada nuevo"
  git checkout -q main
  git branch -D "$RAMA" >/dev/null 2>&1 || true
  exit 0
fi

# 2.2 Alcance: solo datos y la prosa que los cita.
# `comunidad.ts` es la única entrada fuera de apps/web/src/lib: vive en el
# monolito por dónde se usa, pero es un dato curado igual que los demás.
PERMITIDOS='^(apps/web/src/lib/(fiesta-data|pensiones-data|fiesta-calc)\.ts|apps/web/src/components/(Panel|Fiesta|Pensiones|EdadPensiones)[A-Za-z]*\.tsx|apps/monolith/src/shared/domain/comunidad\.ts|\.grok/skills/actualizar-datos-radiografias/references/baseline\.md)$'
INTRUSOS="$(git status --porcelain | awk '{print $2}' | grep -vE "$PERMITIDOS" || true)"
if [[ -n "$INTRUSOS" ]]; then
  fallo "tocó ficheros fuera de su sitio:"$'\n'"$INTRUSOS"
fi

# 2.3 Tamaño: una actualización de datos es quirúrgica. Un diff enorme
# significa que el agente se puso creativo, y eso se revisa a mano.
LINEAS="$(git diff --numstat | awk '{s+=$1+$2} END {print s+0}')"
log "diff de $LINEAS líneas"
(( LINEAS > MAX_LINEAS )) && fallo "el diff son $LINEAS líneas (tope $MAX_LINEAS)"

# 2.4 Secretos: el repositorio es público.
#
# El patrón genérico de IP se descartó a propósito: estos ficheros están llenos
# de números en formato español (1.687.152) y una cifra de miles de millones
# daría falso positivo cada vez. Lo que hay que proteger es la IP concreta del
# VPS, que vive en deploy/.vps-target (gitignorado), así que se busca esa.
if git diff | grep -nEi '(api[_-]?key|bot[_-]?token|password|secret|discord\.com/api/webhooks|hooks\.slack\.com|gh[pousr]_[A-Za-z0-9]{20})'; then
  fallo "el diff contiene algo que parece una credencial"
fi

if [[ -f deploy/.vps-target ]]; then
  IP_VPS="$(sed -E 's/.*@//' deploy/.vps-target | tr -d '[:space:]')"
  if [[ -n "$IP_VPS" ]] && git diff | grep -qF "$IP_VPS"; then
    fallo "el diff contiene la IP del VPS y el repositorio es público"
  fi
fi

# 2.5 Las comprobaciones del repo. Los invariantes de datos viven en
# apps/web/src/lib/datos.test.ts y son la puerta que de verdad distingue
# 101.739 de 1.017.390.
log "typecheck"
npm run typecheck >"$TRABAJO/typecheck.log" 2>&1 || {
  tail -20 "$TRABAJO/typecheck.log"; fallo "no pasa el typecheck"; }

log "tests"
npm test >"$TRABAJO/tests.log" 2>&1 || {
  tail -30 "$TRABAJO/tests.log"; fallo "no pasan los tests (mira los invariantes de datos)"; }

log "build de la web"
npm run build --workspace @boe-inspector/web >"$TRABAJO/build.log" 2>&1 || {
  tail -20 "$TRABAJO/build.log"; fallo "no compila la web"; }

# 2.6 No falla nunca: es una checklist para quien revise el PR.
PROSA="$(bash .grok/skills/actualizar-datos-radiografias/scripts/check-prose.sh 2>&1 | head -60 || true)"

# ── 3. Commit y PR ──────────────────────────────────────────────────
RESUMEN="$(git diff --stat | tail -1)"

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY-RUN: no publico. Diff:"
  git --no-pager diff --stat
  echo "--- INFORME ---"
  echo "$CUERPO_INFORME"
  echo "--- diff completo ---"
  git --no-pager diff
  # Deshacer y volver a main: un ensayo no puede dejar el repo del VPS fuera
  # de sitio, que es donde corre producción.
  git checkout -q -- .
  git clean -qfd
  git checkout -q main
  git branch -D "$RAMA" >/dev/null 2>&1 || true
  log "DRY-RUN: repo devuelto a main"
  exit 0
fi

# Que los commits del cron se distingan de los de una persona.
git -c user.name="Agente BOE (cron)" \
    -c user.email="cron@agenteboe.com" \
    commit -qam "Actualizar los datos curados (corte $MES)

Pasada automática del día 5. Cifras y gobiernos autonómicos revisados contra
las fuentes oficiales según el skill actualizar-datos-radiografias.

$RESUMEN

Revisar antes de mergear: cada cifra cambiada lleva su fuente en el comentario
del código, y la tabla del PR enlaza la publicación de la que sale."

git push -q -u origin "$RAMA" || {
  avisar "⚠️ Datos $MES: no pude subir la rama $RAMA."
  exit 1
}

CUERPO="$(cat <<FIN
Pasada automática del $(date +%d/%m/%Y). **Revisar antes de mergear.**

## Qué ha cambiado

$CUERPO_INFORME

## Puertas pasadas

- \`npm run typecheck\` ✔
- \`npm test\` ✔ (incluye los invariantes de \`apps/web/src/lib/datos.test.ts\`)
- \`npm run build\` ✔
- Alcance y tamaño del diff dentro de lo permitido ($LINEAS líneas)
- Sin credenciales ni IPs en el diff

## Checklist de prosa

Números sueltos en paneles y gráficos que conviene mirar por si citan una cifra
que ha cambiado:

\`\`\`
$PROSA
\`\`\`
FIN
)"

if URL="$(gh pr create --base main --head "$RAMA" \
  --title "Datos curados · corte $MES" \
  --body "$CUERPO" 2>&1)"; then
  log "PR abierto: $URL"
  avisar "📊 Datos $MES: hay cambios que revisar.

$RESUMEN

$URL"
else
  log "el PR no se pudo abrir: $URL"
  avisar "⚠️ Datos $MES: la rama $RAMA está subida pero el PR falló."
  exit 1
fi

log "terminada"
