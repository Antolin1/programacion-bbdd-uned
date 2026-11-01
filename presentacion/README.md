# Presentación de Misión SQL (Marp)

`mision-sql.md` es el guion completo de la presentación de Genially (51 diapositivas) con el
tema `mision.css`, que reutiliza la paleta de la huerta murciana, la tipografía (Fredoka y
JetBrains Mono) y el paisaje de limoneros de la web de los juegos y de la memoria.

Los comentarios `<!-- ... -->` de cada diapositiva son **notas del presentador**. Las que empiezan
por «EN GENIALLY» indican qué interacción hay que añadir tras importar el PowerPoint (ventanas
emergentes, botones de los juegos, teclado de la caja fuerte). El código de la caja fuerte solo
aparece en las notas de la diapositiva «Abre la caja fuerte».

## Exportar a PowerPoint

La forma más sencilla, sin instalar navegador ni LibreOffice en WSL, es el script que usa Docker:

```bash
./exportar.sh        # genera mision-sql.pptx con los textos editables
```

La primera vez construye una imagen con Marp, Chromium y LibreOffice (tarda unos minutos).

Alternativas: la extensión **Marp for VS Code** (*Export Slide Deck…* → PPTX) o, con Chrome o
Edge instalados, `npx @marp-team/marp-cli@latest mision-sql.md --pptx --pptx-editable`
(la opción `--pptx-editable` además exige LibreOffice). Sin `--pptx-editable` cada diapositiva
queda como una imagen, y en Genially no podrías editar el texto ni añadir interactividad encima.
En la versión editable **no se exportan las notas del presentador**: están en `mision-sql.md`.
Las fuentes se cargan de Google Fonts, así que hace falta conexión al exportar.

Para ver el resultado en HTML o PDF: `npx @marp-team/marp-cli@latest mision-sql.md --pdf`.
