# Misión SQL

Recurso educativo gamificado para el módulo **0484 Bases de datos** (CFGS DAM y DAW, Región de
Murcia). El repositorio contiene dos cosas:

- la **aplicación web**: un portal, los tres juegos y la presentación interactiva (`web/`);
- la **memoria** de la actividad en LaTeX (`memoria/`).

## Estructura

```
.github/workflows/pages.yml   Publicación automática de web/ en GitHub Pages
web/                          Aplicación web (se publica tal cual)
  index.html                  Portal: mapa de la misión, caja fuerte, insignias
  assets/                     Estilos, lógica común e imágenes (paisaje de la huerta, favicon)
  data/cooperativa.sql        Base de datos de ejemplo (la usan los juegos y el apéndice de la memoria)
  juego1/ juego2/ juego3/     Los tres juegos
  presentacion/               Presentación interactiva (Reveal.js)
    index.html                Página; carga Reveal.js, sql.js y los estilos
    slides.md                 Contenido de las 54 diapositivas (Markdown)
    presentacion.css          Diseño de las diapositivas
    presentacion.js           Consultas ejecutables, llaves, caja fuerte y autoevaluación
memoria/                      Memoria de la actividad en LaTeX
  main.tex                    Documento principal
  datos.tex                   Datos personales, URL y n.º de diapositivas (rellenar)
  bibliografia.bib            Bibliografía (estilo IEEE con biblatex)
  build.sh                    Compila con TeX Live en Docker y genera main.pdf
  fuentes/                    Fredoka (licencia OFL), la misma tipografía que la web
  img/                        Paisaje de la portada (versión PDF de web/assets/huerta.svg) y logo de Genially
```

## Requisitos

| Para… | Hace falta |
|---|---|
| Probar la web y la presentación | Python 3 (o cualquier servidor estático) y un navegador. **Conexión a Internet**: las librerías y las fuentes se cargan por CDN |
| Compilar la memoria | Docker en marcha |

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
[Lucide](https://lucide.dev/), [highlight.js](https://highlightjs.org/) y
[Reveal.js](https://revealjs.com/) (solo la presentación).

### Probar en local

La aplicación carga `data/cooperativa.sql` y `presentacion/slides.md` con `fetch`, así que hay que
servirla por HTTP (abrir el fichero con `file://` no funciona). Desde la raíz del repositorio:

```bash
cd web
python3 -m http.server 8000
```

Y abrir en el navegador:

- Portal y juegos: <http://localhost:8000/>
- Presentación interactiva: <http://localhost:8000/presentacion/>

Con el repositorio en WSL, el navegador de Windows abre `localhost` directamente. Para parar el
servidor, `Ctrl+C`.

#### Qué comprobar

1. **Los tres juegos**: jugarlos desde el portal. El **modo docente** («Opciones» del portal)
   desbloquea todos los juegos sin tener que superarlos en orden.
2. **La presentación**: navegar con las flechas del teclado (`Esc` muestra todas las diapositivas y
   `S`, las notas del presentador).
   - Las consultas SQL se ejecutan solas al entrar en la diapositiva. Se pueden editar y volver a
     lanzar con **▶ Ejecutar** o `Ctrl+Intro`. Cada ejecución parte de los datos originales.
   - Las casillas de las llaves de los juegos 1, 2 y 3 se rellenan con los dígitos que guardan los
     juegos. Se actualizan al volver a la pestaña de la presentación.
   - La caja fuerte acepta el teclado en pantalla o el físico; `Intro` o ✓ confirma.
3. **Probar la caja fuerte sin jugar**: en la consola del navegador (`F12`), con la presentación
   abierta:

   ```js
   localStorage.setItem("misionSQL.v1", JSON.stringify({ team: "Prueba",
     digits: { 1: 2, 2: 9, 3: 3, 4: 1 }, games: { 1: { best: 100 } }, badges: ["Clasificador"] }));
   location.reload();
   ```

   Después, en la diapositiva de la caja fuerte, pulsar «Usar los dígitos que he conseguido» y ✓.
4. **Empezar de cero**: en la consola, `localStorage.clear()` y recargar. Es lo mismo que «Reiniciar
   el progreso» del portal, pero también borra la caja abierta y la autoevaluación de la presentación.

### Publicar en GitHub Pages

1. Subir este repositorio a la rama `main` de [Antolin1/programacion-bbdd-uned](https://github.com/Antolin1/programacion-bbdd-uned).
2. En **Settings → Pages**, elegir **Source: GitHub Actions**.
3. Cada `push` a `main` que cambie algo en `web/` ejecuta `.github/workflows/pages.yml` y publica
   la carpeta `web/` en `https://antolin1.github.io/programacion-bbdd-uned/` (también se puede lanzar a mano
   desde la pestaña *Actions*). La presentación queda en `…/presentacion/`.
4. El mismo flujo compila antes la memoria y la publica en `…/memoria.pdf`, enlazada desde el
   portal. Esa versión se compila con `\def\versionweb{}` y **no incluye el DNI ni el correo**
   de la portada; el PDF que genera `build.sh` para entregar sí los incluye. Los cambios en
   `memoria/` también lanzan la publicación.

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

## Versión para Genially

```bash
pip install python-pptx pillow
python3 genially/generar_pptx.py
```

Genera `genially/mision-sql-presentacion.pptx` a partir de `web/presentacion/slides.md`: las 54
diapositivas con el mismo diseño, pero como objetos editables (cuadros de texto, formas y tablas)
para importarlas en Genially (*Crear → Importar PowerPoint*) y añadir allí las animaciones.
Las consultas ejecutables se muestran con su resultado real (se calculan con SQLite al generar el
fichero); lo interactivo de la web (caja fuerte, llaves, autoevaluación) queda descrito en las notas
del orador de cada diapositiva, junto con las URL de los enlaces. Las fuentes son Nunito y Roboto Mono
(las más parecidas a Fredoka y JetBrains Mono que tiene Genially); las copias de `genially/fuentes/`
solo sirven para medir el texto. Los tres fondos están en `web/presentacion/fondos/`.
