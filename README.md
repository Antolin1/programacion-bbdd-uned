# Misión SQL

Recurso educativo gamificado para el módulo **0484 Bases de datos** (CFGS DAM y DAW, Región de
Murcia). El repositorio contiene la aplicación web con los tres juegos y la memoria de la
actividad en LaTeX.

## Estructura

```
.github/workflows/pages.yml   Publicación automática de web/ en GitHub Pages
web/                          Aplicación web (se publica tal cual)
  index.html                  Portal: mapa de la misión, caja fuerte, insignias
  assets/                     Estilos, lógica común e imágenes (paisaje de la huerta, favicon)
  data/cooperativa.sql        Base de datos de ejemplo (la usan los juegos y el apéndice de la memoria)
  juego1/ juego2/ juego3/     Los tres juegos
presentacion/                 Presentación de Genially en Marp (se exporta a PowerPoint)
  mision-sql.md               Guion de las 51 diapositivas
  mision.css                  Tema (misma paleta y tipografía que la web y la memoria)
memoria/                      Memoria de la actividad en LaTeX
  main.tex                    Documento principal
  datos.tex                   Datos personales, URL y n.º de diapositivas (rellenar)
  bibliografia.bib            Bibliografía (estilo IEEE con biblatex)
  build.sh                    Compila con TeX Live en Docker y genera main.pdf
  fuentes/                    Fredoka (licencia OFL), la misma tipografía que la web
  img/huerta.pdf              Paisaje de la portada (versión PDF de web/assets/huerta.svg)
```

## La aplicación web

Es una aplicación estática con un portal común y tres juegos diferenciados, que comparten la
narrativa de la *Cooperativa Huerta de Murcia*:

| Juego | Tipo | Ruta |
|---|---|---|
| 1. Clasifica y ordena | Puzle de clasificación y ordenación (arrastrar y soltar) | `web/juego1/` |
| 2. ¿Qué devuelve la consulta? | Concurso de preguntas contrarreloj | `web/juego2/` |
| 3. Terminal de la Cooperativa | Escape room con una consola SQL real (SQLite en el navegador) | `web/juego3/` |

El portal guarda el nombre del equipo, el marcador, las insignias y los dígitos de la caja fuerte
(código final: **2931**). Todo se guarda en el `localStorage` del navegador; no se recogen datos
personales.

Librerías (por CDN, sin compilación): [sql.js](https://github.com/sql-js/sql.js) (SQLite en
WebAssembly), [CodeMirror 5](https://codemirror.net/5/),
[SortableJS](https://sortablejs.github.io/Sortable/), [GSAP](https://gsap.com/),
[canvas-confetti](https://github.com/catdad/canvas-confetti), [tsParticles](https://particles.js.org/),
[Lucide](https://lucide.dev/) y [highlight.js](https://highlightjs.org/).

### Probar en local

La aplicación carga `data/cooperativa.sql` con `fetch`, así que hay que servirla por HTTP (no
basta con abrir el fichero):

```bash
cd web
python3 -m http.server 8000
# y abrir http://localhost:8000/
```

### Publicar en GitHub Pages

1. Subir este repositorio a la rama `main` de [Antolin1/programacion-bbdd-uned](https://github.com/Antolin1/programacion-bbdd-uned).
2. En **Settings → Pages**, elegir **Source: GitHub Actions**.
3. Cada `push` a `main` que cambie algo en `web/` ejecuta `.github/workflows/pages.yml` y publica
   la carpeta `web/` en `https://antolin1.github.io/programacion-bbdd-uned/` (también se puede lanzar a mano
   desde la pestaña *Actions*).

## La memoria

```bash
./memoria/build.sh
```

Compila `memoria/main.tex` con LuaLaTeX dentro de la imagen Docker `texlive/texlive:latest`
(Docker tiene que estar en marcha) y deja el resultado en `memoria/main.pdf`, que no se sube al
repositorio (está en `.gitignore`). La memoria usa la misma paleta y tipografías que la web. En VS Code, con la extensión LaTeX
Workshop, la configuración de `.vscode/settings.json` compila al guardar y muestra el PDF al lado.

Antes de entregar, rellenar `memoria/datos.tex` (datos personales, URL de Genially y de GitHub
Pages con el usuario real, y número de diapositivas).
