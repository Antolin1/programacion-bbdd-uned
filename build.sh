#!/usr/bin/env bash
# Compila main.tex dentro de la imagen Docker de TeX Live y deja main.pdf en esta carpeta.
# El proyecto se envía al contenedor por tar (stdin/stdout), así que funciona igual con
# Docker nativo, con Docker Desktop desde WSL (docker.exe) o con Podman.
set -euo pipefail
cd "$(dirname "$0")"

IMAGE="${IMAGE:-texlive/texlive:latest}"
if [ -z "${DOCKER:-}" ]; then
  if command -v docker >/dev/null 2>&1; then DOCKER=docker
  elif command -v docker.exe >/dev/null 2>&1; then DOCKER=docker.exe
  else DOCKER="/mnt/c/Program Files/Docker/Docker/resources/bin/docker.exe"
  fi
fi

tar -cf - main.tex datos.tex bibliografia.bib sql \
  | "$DOCKER" run --rm -i "$IMAGE" sh -c '
      mkdir -p /work && cd /work && tar -xf - &&
      latexmk -pdf -interaction=nonstopmode -halt-on-error main.tex >&2 &&
      cat main.pdf' > main.pdf.tmp
mv main.pdf.tmp main.pdf
echo "PDF generado: $(pwd)/main.pdf"
