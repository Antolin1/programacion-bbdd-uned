#!/usr/bin/env bash
# Exporta mision-sql.md a PowerPoint con textos editables (mision-sql.pptx) usando Docker:
# la imagen oficial de Marp trae Chromium; aquí se le añade LibreOffice, que necesita --pptx-editable.
set -euo pipefail
cd "$(dirname "$0")"

DOCKER="${DOCKER:-docker}"
command -v "$DOCKER" >/dev/null 2>&1 || DOCKER="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"

if ! "$DOCKER" image inspect marp-lo >/dev/null 2>&1; then
  printf 'FROM marpteam/marp-cli\nUSER root\nRUN apk add --no-cache libreoffice-impress font-noto\n' \
    | "$DOCKER" build -q -t marp-lo -
fi

# Se escribe en una carpeta temporal porque el contenedor no siempre puede escribir en esta.
OUT="$(mktemp -d)"; chmod 777 "$OUT"
"$DOCKER" run --rm --user root -v "$PWD":/home/marp/app -v "$OUT":/out \
  marp-lo mision-sql.md --pptx --pptx-editable -o /out/mision-sql.pptx
mv "$OUT/mision-sql.pptx" mision-sql.pptx
rmdir "$OUT"
echo "Generado: $PWD/mision-sql.pptx"
