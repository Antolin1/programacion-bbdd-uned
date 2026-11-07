# Presentación de Misión SQL (Marp)

`mision-sql.md` es el guion completo de la presentación de Genially (53 diapositivas) con el
tema `mision.css`, que reutiliza la paleta de la huerta murciana, la tipografía (Fredoka y
JetBrains Mono) y el paisaje de limoneros de la web de los juegos y de la memoria.

Los comentarios `<!-- ... -->` de cada diapositiva son **notas del presentador**. Las que empiezan
por «EN GENIALLY» indican qué interacción hay que añadir tras importar el PowerPoint (ventanas
emergentes, botones de los juegos, teclado de la caja fuerte). El código de la caja fuerte solo
aparece en las notas de la diapositiva «Abre la caja fuerte».

## Exportar a PowerPoint

Con Docker en marcha, desde esta carpeta:

```bash
./exportar.sh              # mision-sql.pptx: igual que el PDF (para importar en Genially)
./exportar.sh --editable   # mision-sql-editable.pptx: textos editables, pero pierde el diseño
```

- **Versión normal** (la recomendada): cada diapositiva es una imagen a 2560 × 1440, idéntica al
  PDF, e incluye las notas del presentador. En Genially no se puede editar el texto, pero sí
  poner encima botones, enlaces, ventanas emergentes y el teclado de la caja fuerte.
- **Versión editable**: LibreOffice reconstruye cada elemento y se pierde buena parte del diseño
  (sombras, degradados, alineaciones). No incluye las notas. La primera vez construye una imagen
  de Docker con LibreOffice (tarda unos minutos).

Las fuentes se cargan de Google Fonts, así que hace falta conexión al exportar.

Para ver el resultado en HTML o PDF: `npx @marp-team/marp-cli@latest mision-sql.md --pdf`.
