#!/usr/bin/env bash
# Exporta mision-sql.md a PowerPoint con Docker (la imagen oficial de Marp trae Chromium).
#   ./exportar.sh             -> mision-sql.pptx: cada diapositiva es una imagen, igual que el PDF,
#                                con las notas del presentador. Es la versión para importar en Genially.
#   ./exportar.sh --editable  -> mision-sql-editable.pptx: textos editables (usa LibreOffice, que
#                                se añade a la imagen), pero se pierde buena parte del diseño.
set -euo pipefail
cd "$(dirname "$0")"

DOCKER="${DOCKER:-docker}"
command -v "$DOCKER" >/dev/null 2>&1 || DOCKER="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"

IMAGE=marpteam/marp-cli
SALIDA=mision-sql.pptx
OPCIONES=(--pptx --image-scale 2)
if [ "${1:-}" = "--editable" ]; then
  IMAGE=marp-lo
  SALIDA=mision-sql-editable.pptx
  OPCIONES=(--pptx --pptx-editable)
  if ! "$DOCKER" image inspect marp-lo >/dev/null 2>&1; then
    printf 'FROM marpteam/marp-cli\nUSER root\nRUN apk add --no-cache libreoffice-impress font-noto\n' \
      | "$DOCKER" build -q -t marp-lo -
  fi
fi

# Se escribe en una carpeta temporal porque el contenedor no siempre puede escribir en esta.
OUT="$(mktemp -d)"; chmod 777 "$OUT"
"$DOCKER" run --rm --user root -v "$PWD":/home/marp/app -v "$OUT":/out \
  "$IMAGE" mision-sql.md "${OPCIONES[@]}" -o "/out/$SALIDA"
mv "$OUT/$SALIDA" "$SALIDA"
rmdir "$OUT"
echo "Generado: $PWD/$SALIDA"
