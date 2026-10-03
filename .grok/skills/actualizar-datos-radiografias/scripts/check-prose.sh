#!/usr/bin/env bash
# Lista números / años en prosa y ShareDato que suelen desincronizarse
# de fiesta-data.ts / pensiones-data.ts. No falla el build: es una checklist.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$ROOT"

echo "== Prosa paneles =="
grep -nE '[0-9]{2,3}([.,][0-9]+)?\s*%|[0-9]{1,3}([._][0-9]{3})+|20[0-9]{2}|mil M€|millones' \
  apps/web/src/components/PanelFiesta.tsx \
  apps/web/src/components/PanelPensiones.tsx \
  2>/dev/null || true

echo ""
echo "== ShareDato / textos fijos en gráficos =="
grep -nE 'ShareDato text=|[0-9]{2,3}([.,][0-9]+)?\s*%|20[0-9]{2}|mil M€|55\.000|16,1|2,3' \
  apps/web/src/components/FiestaGraficos.tsx \
  apps/web/src/components/PensionesGraficos.tsx \
  2>/dev/null | head -80 || true

echo ""
echo "== ANIO_REF_PENSIONES =="
grep -n 'ANIO_REF_PENSIONES' apps/web/src/components/EdadPensiones.tsx || true

echo ""
echo "== Exports data (recordatorio de ficheros) =="
grep -n '^export const ' apps/web/src/lib/fiesta-data.ts apps/web/src/lib/pensiones-data.ts | head -60

echo ""
echo "Revisa a mano lo que no se importe desde lib/*.ts"
