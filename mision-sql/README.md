# Misión SQL

Recurso educativo gamificado para el módulo **0484 Bases de datos** (CFGS DAM y DAW, Región de
Murcia). Es una aplicación web estática con un portal común y tres juegos diferenciados, que
comparten la narrativa de la *Cooperativa Huerta de Murcia*:

| Juego | Tipo | Ruta |
|---|---|---|
| 1. Clasifica y ordena | Puzle de clasificación y ordenación (arrastrar y soltar) | `juego1/` |
| 2. ¿Qué devuelve la consulta? | Concurso de preguntas contrarreloj | `juego2/` |
| 3. Terminal de la Cooperativa | Escape room con una consola SQL real (SQLite en el navegador) | `juego3/` |

El portal (`index.html`) guarda el nombre del equipo, el marcador, las insignias y los dígitos de
la caja fuerte (código final: **2931**). Todo se guarda en el `localStorage` del navegador; no se
recogen datos personales.

## Estructura

```
index.html            Portal: mapa de la misión, caja fuerte, insignias
assets/               Estilos y lógica comunes (common.css, common.js, hub.*)
data/cooperativa.sql  Base de datos de ejemplo (la carga el navegador)
juego1/ juego2/ juego3/
.github/workflows/pages.yml   Publicación automática en GitHub Pages
```

## Librerías (por CDN, sin compilación)

[sql.js](https://github.com/sql-js/sql.js) (SQLite en WebAssembly),
[CodeMirror 5](https://codemirror.net/5/), [SortableJS](https://sortablejs.github.io/Sortable/),
[GSAP](https://gsap.com/), [canvas-confetti](https://github.com/catdad/canvas-confetti),
[tsParticles](https://particles.js.org/), [Lucide](https://lucide.dev/) y
[highlight.js](https://highlightjs.org/).

## Probar en local

La aplicación carga `data/cooperativa.sql` con `fetch`, así que hay que servirla por HTTP (no
basta con abrir el fichero):

```bash
python3 -m http.server 8000
# y abrir http://localhost:8000/
```

## Publicar en GitHub Pages

1. Crear un repositorio llamado `mision-sql` y subir el contenido de esta carpeta a la rama `main`.
2. En **Settings → Pages**, elegir **Source: GitHub Actions**.
3. Cada `push` a `main` ejecuta `.github/workflows/pages.yml` y publica la web en
   `https://USUARIO.github.io/mision-sql/`.
