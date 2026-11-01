---
marp: true
theme: mision
paginate: true
size: 16:9
footer: "Misión SQL · Cooperativa Huerta de Murcia"
---

<!-- _class: portada -->
<!-- _paginate: false -->
<!-- _footer: "" -->

<p class="kicker">Cooperativa Huerta de Murcia · Bases de datos</p>

# Misión <em>SQL</em>

## El enigma de la Cooperativa Huerta de Murcia

<p class="meta">Programación y Bases de Datos · Bloque 3: Bases de datos<br>
Módulo 0484 <em>Bases de datos</em> · 1.º de los CFGS de DAM y DAW</p>

<!--
EN GENIALLY: esta es la portada. Añade un botón «Comenzar la misión» que lleve a la diapositiva siguiente.
-->

---

# La tormenta

Una tormenta de granizo ha dañado el servidor de la **Cooperativa Huerta de Murcia**, justo antes de la campaña de exportación.

La gerencia te ha contratado como **técnico o técnica junior de bases de datos** para recuperar la información de **socios, productos y entregas**.

<div class="nota">

Pero el acceso a la copia de seguridad está protegido por una **caja fuerte digital con un código de cuatro dígitos**.

</div>

---

# Tu misión

<div class="cols3">
<div class="card">

### 1 · Supera los juegos

Son tres juegos. Cada uno que superes revela uno o dos dígitos: la **llave** del juego.

</div>
<div class="card">

### 2 · Reúne los dígitos

Anota cada dígito en su casilla. Necesitas los **cuatro** para abrir la caja fuerte.

</div>
<div class="card">

### 3 · Abre la caja fuerte

En la última diapositiva introduce el código y **salva la campaña**.

</div>
</div>

<!--
EN GENIALLY: cada tarjeta puede ser un elemento que aparece con animación (entrada secuencial).
-->

---

# Equipos y normas del juego

<div class="cols">
<div>

- Formad **equipos**; cada uno tiene su perfil.
- Marcador, insignias y dígitos **se guardan en tu navegador**.
- Los juegos se desbloquean **en orden**.
- Puedes **repetirlos** cuando quieras.

</div>
<div class="card">

### Sin registro

- No hay cuentas.
- No se recogen datos personales.
- El juego 3 ejecuta **SQL real** en tu navegador: no se instala nada.

</div>
</div>

<!--
EN GENIALLY: aquí se forman los equipos. El docente puede proyectar el marcador del portal de juegos.
-->

---

# Puntos e insignias

<div class="sm">

| Juego | Cómo se puntúa |
|---|---|
| **1** · Clasifica y ordena | **+10** por acierto, **−2** por fallo (con una explicación breve) |
| **2** · ¿Qué devuelve la consulta? | **500–1000** por acierto, según la rapidez (30 s por pregunta). **+100** de bonificación por racha a partir del 3.er acierto seguido |
| **3** · Terminal de la Cooperativa | **500** por incidencia. Cada pista (máximo 2) resta **100** y cada comprobación fallida, **25**. Mínimo **150** |

</div>

Insignias que puedes ganar: <span class="pill">Clasificador</span> <span class="pill v">Detective de consultas</span> <span class="pill n">Maestro del DML</span>

---

# El itinerario de la misión

<div class="ruta">
<div>Presentación<br><b>Misión, base de datos y SQL</b></div>
<div class="f">›</div>
<div class="j">Juego 1<br><b>Clasifica y ordena</b><br>dígito 1</div>
<div class="f">›</div>
<div>Presentación<br><b>Consultas, resumen, varias tablas y subconsultas</b></div>
<div class="f">›</div>
<div class="j">Juego 2<br><b>¿Qué devuelve la consulta?</b><br>dígito 2</div>
<div class="f">›</div>
<div>Presentación<br><b>Manipulación de datos y transacciones</b></div>
<div class="f">›</div>
<div class="j">Juego 3<br><b>Terminal de la Cooperativa</b><br>dígitos 3 y 4</div>
</div>

<div class="nota" style="margin-top: 28px">

La presentación es el **tablero**: desde aquí se accede a cada juego y aquí se vuelve con el dígito de la llave. Al final, la **caja fuerte**.

</div>

---

# Las tres sesiones (55 minutos cada una)

<div class="cols3">
<div class="card">

### Sesión 1

- Misión y base de datos
- Introducción a SQL
- **Juego 1**
- Consultas simples y de resumen

</div>
<div class="card">

### Sesión 2

- Varias tablas: composiciones
- Subconsultas
- **Juego 2**, por equipos y con clasificación proyectada

</div>
<div class="card">

### Sesión 3

- Manipulación de datos
- Transacciones
- **Juego 3**, por parejas
- Apertura de la **caja fuerte**
- Puesta en común y autoevaluación

</div>
</div>

---

# ¿Qué vamos a aprender?

<div class="cols">
<div>

1. Distinguir los **sublenguajes** de SQL (DDL, DML, DCL y TCL) y clasificar sus sentencias.
2. Hacer **consultas simples** con `WHERE`, `ORDER BY` y `DISTINCT`, usando operadores, `BETWEEN`, `IN`, `LIKE` e `IS NULL`.
3. Obtener **resúmenes** con funciones de agregado, `GROUP BY` y `HAVING`.
4. Combinar **varias tablas** con `INNER JOIN` y `LEFT`/`RIGHT JOIN`.

</div>
<div>

5. Resolver consultas con **subconsultas** y compararlas con una solución equivalente con `JOIN`.
6. **Insertar, actualizar y borrar** datos respetando la integridad referencial.
7. Entender las **transacciones**: `COMMIT`, `ROLLBACK` y `SAVEPOINT`.
8. Tener **autonomía y constancia** ante los errores, y colaborar con tu equipo.

</div>
</div>

<!--
Objetivos O1–O8 de la memoria, en lenguaje cercano al alumnado.
-->

---

<!-- _class: bloque -->

## Primera parte

# La base de datos

<p>Conoce la base de datos <strong>cooperativa</strong> y el lenguaje <strong>SQL</strong>.</p>

---

# La base de datos <code>cooperativa</code>

Todos los retos se resuelven sobre la misma base de datos, con **tres tablas**:

<div class="cols3">
<div class="card">

### socio

<u>id_socio</u><br>nombre<br>municipio<br>fecha_alta

</div>
<div class="card">

### producto

<u>id_producto</u><br>nombre<br>categoria<br>precio_kg

</div>
<div class="card">

### entrega

<u>id_entrega</u><br>id_socio <span class="pill a">FK</span><br>id_producto <span class="pill a">FK</span><br>fecha<br>kilos

</div>
</div>

<p class="s" style="margin-top: 18px">Un <b>socio</b> hace muchas <b>entregas</b> y un <b>producto</b> aparece en muchas <b>entregas</b>. Las claves primarias van <u>subrayadas</u>; <span class="pill a">FK</span> = clave ajena.</p>

---

# Tabla <code>socio</code> y tabla <code>producto</code>

<div class="cols">
<div class="res">

| id | nombre | municipio | fecha_alta |
|---|---|---|---|
| 1 | Ana Martínez | Murcia | 2019-02-11 |
| 2 | José López | Lorca | 2020-05-03 |
| 3 | Carmen Sánchez | Cartagena | 2021-09-20 |
| 4 | Pedro Ruiz | Murcia | 2022-01-15 |
| 5 | Lucía Gómez | Cieza | 2025-11-30 |

</div>
<div class="res">

| id | nombre | categoria | precio_kg |
|---|---|---|---|
| 1 | Limón | Cítrico | 0,60 |
| 2 | Naranja | Cítrico | 0,45 |
| 3 | Pimiento | Hortaliza | 1,20 |
| 4 | Alcachofa | Hortaliza | 1,80 |
| 5 | Melocotón | Fruta de hueso | 1,50 |
| 6 | Albaricoque | Fruta de hueso | 2,10 |

</div>
</div>

<!--
EN GENIALLY: en la presentación original estas tablas son ventanas emergentes: un botón por tabla (socio, producto, entrega).
-->

---

# Tabla <code>entrega</code>

<div class="res">

| id_entrega | id_socio | id_producto | fecha | kilos |
|---|---|---|---|---|
| 1 | 1 | 1 | 2026-03-02 | 500 |
| 2 | 1 | 3 | 2026-03-05 | 200 |
| 3 | 2 | 2 | 2026-03-05 | 800 |
| 4 | 2 | 4 | 2026-03-10 | 150 |
| 5 | 3 | 1 | 2026-03-12 | 300 |
| 6 | 3 | 5 | 2026-06-20 | 400 |
| 7 | 4 | 3 | 2026-03-15 | 250 |
| 8 | 4 | 4 | 2026-03-18 | 100 |
| 9 | 1 | 5 | 2026-06-25 | 350 |

</div>

---

# ¿Qué es SQL?

<div class="cols">
<div>

**SQL** (*Structured Query Language*) es el lenguaje estándar para **definir, consultar y manipular** la información de una base de datos relacional.

- Basado en el **modelo relacional** de Codd (1970).
- Nació en IBM como **SEQUEL** (1974).
- Normalizado en **ISO/IEC 9075**.
- **Declarativo**: dices *qué* quieres, no *cómo*.

</div>
<div class="card">

### SGBD habituales

- **MySQL** / **MariaDB**
- **PostgreSQL**
- **Oracle**
- **SQLite**: el que usa el juego 3, dentro de tu navegador

</div>
</div>

---

# Los cuatro sublenguajes de SQL

<div class="sm">

| Sublenguaje | Para qué sirve | Sentencias |
|---|---|---|
| **DDL** · definición | Crear y modificar la estructura | `CREATE` `ALTER` `DROP` `TRUNCATE` |
| **DML** · manipulación | Consultar y modificar los datos | `SELECT` `INSERT` `UPDATE` `DELETE` |
| **DCL** · control | Dar y quitar permisos | `GRANT` `REVOKE` |
| **TCL** · transacciones | Confirmar o deshacer cambios | `COMMIT` `ROLLBACK` `SAVEPOINT` |

</div>

<p class="s muted"><code>TRUNCATE</code> se clasifica como DDL porque vacía la tabla redefiniéndola, sin borrar fila a fila.</p>

---

# Un ejemplo de cada sublenguaje

```sql
CREATE TABLE socio (id_socio INTEGER PRIMARY KEY, nombre VARCHAR(50));  -- DDL
SELECT nombre FROM socio WHERE municipio = 'Murcia';                    -- DML
GRANT SELECT ON socio TO tecnico_junior;                                -- DCL
COMMIT;                                                                 -- TCL
```

<div class="nota">

**Reto:** ¿en qué sublenguaje clasificarías `ALTER`, `REVOKE`, `UPDATE` y `SAVEPOINT`? Lo vas a necesitar en el juego 1.

</div>

<!--
Soluciones: ALTER = DDL, REVOKE = DCL, UPDATE = DML, SAVEPOINT = TCL.
-->

---

<!-- _class: juego -->

# <span class="n">Juego 1 ·</span> Clasifica y ordena

<div class="cols">
<div>

Puzle de **arrastrar y soltar** en tres niveles. Hay que superar uno para desbloquear el siguiente.

1. **Clasificación** de sentencias en DDL, DML, DCL o TCL.
2. **Ordena las cláusulas** de una consulta.
3. **Relaciona** cada expresión con su significado.

<span class="pill">+10 por acierto</span> <span class="pill n">−2 por fallo</span> <span class="pill v">10–15 min</span>

</div>
<div class="centro">

<a class="btn" href="https://antolin1.github.io/programacion-bbdd-uned/juego1/">▶ Jugar</a>

<p class="s" style="margin-top: 34px">Al terminar, anota aquí tu llave:</p>

<span class="llave">1</span>

<p class="t muted">Dígito 1</p>

</div>
</div>

<!--
EN GENIALLY: el botón «Jugar» enlaza con https://antolin1.github.io/programacion-bbdd-uned/juego1/ (abrir en pestaña nueva). La casilla del dígito 1 puede ser un cuadro de texto.
-->

---

<!-- _class: bloque -->

## Segunda parte

# Consultas con SELECT

<p>Leer datos: <strong>selección, proyección, orden y resumen</strong>.</p>

---

# Estructura de <code>SELECT</code>

```sql
SELECT nombre, municipio    -- qué columnas quiero (proyección)
FROM socio;                 -- de qué tabla
```

<div class="res">

| nombre | municipio |
|---|---|
| Ana Martínez | Murcia |
| José López | Lorca |
| Carmen Sánchez | Cartagena |
| Pedro Ruiz | Murcia |
| Lucía Gómez | Cieza |

</div>

<!--
EN GENIALLY: la tabla de resultado puede ser una ventana emergente: «Ver resultado».
-->

---

# Proyección, alias y <code>DISTINCT</code>

<div class="cols">
<div>

```sql
SELECT nombre,
       precio_kg AS euros_kg
FROM producto;
```

<p class="s"><code>AS</code> pone un <b>alias</b>: un nombre nuevo a la columna del resultado.</p>

</div>
<div>

```sql
SELECT DISTINCT municipio
FROM socio;
```

<div class="res">

| municipio |
|---|
| Murcia |
| Lorca |
| Cartagena |
| Cieza |

</div>
<p class="s"><code>DISTINCT</code> elimina los repetidos: Murcia sale <b>una</b> vez, aunque haya dos socios.</p>

</div>
</div>

---

# <code>WHERE</code>: filtrar filas

<div class="cols">
<div>

```sql
SELECT nombre, precio_kg
FROM producto
WHERE categoria = 'Hortaliza'
  AND precio_kg < 1.5;
```

<div class="res">

| nombre | precio_kg |
|---|---|
| Pimiento | 1,20 |

</div>

</div>
<div class="card">

### Operadores

**Comparación:** `=` `<>` `<` `>` `<=` `>=`

**Lógicos:** `AND` `OR` `NOT`

<p class="s">Las comparaciones de texto van entre comillas simples: <code>'Hortaliza'</code>.</p>

</div>
</div>

---

# <code>BETWEEN</code>, <code>IN</code>, <code>LIKE</code> e <code>IS NULL</code>

<div class="cols">
<div>

```sql
-- BETWEEN: rango (con extremos)
WHERE kilos BETWEEN 200 AND 500

-- IN: una lista de valores
WHERE municipio IN ('Murcia', 'Lorca')
```

</div>
<div>

```sql
-- LIKE: patrón (% varios, _ uno)
WHERE nombre LIKE '%ez'

-- IS NULL: valor desconocido
WHERE fecha_alta IS NULL
```

</div>
</div>

<div class="nota">

`nombre LIKE '%ez'` devuelve los apellidos que acaban en *ez*: Martínez, López, Sánchez y Gómez, pero no Ruiz. Para comprobar si un valor falta usa **`IS NULL`**, nunca `= NULL`.

</div>

---

# <code>ORDER BY</code>: ordenar el resultado

```sql
SELECT nombre, precio_kg
FROM producto
ORDER BY precio_kg DESC;
```

<div class="cols">
<div class="res">

| nombre | precio_kg |
|---|---|
| Albaricoque | 2,10 |
| Alcachofa | 1,80 |
| Melocotón | 1,50 |
| Pimiento | 1,20 |
| Limón | 0,60 |
| Naranja | 0,45 |

</div>
<div class="card">

`ASC` ordena de menor a mayor (es lo que se hace si no dices nada). `DESC`, de mayor a menor.

Se puede ordenar por **varias columnas**: `ORDER BY categoria, precio_kg DESC`.

</div>
</div>

---

# Orden de escritura y orden lógico

<div class="cols">
<div class="card">

### Lo que escribes

1. `SELECT`
2. `FROM`
3. `WHERE`
4. `GROUP BY`
5. `HAVING`
6. `ORDER BY`

</div>
<div class="card">

### Lo que hace el SGBD

1. `FROM`
2. `WHERE`
3. `GROUP BY`
4. `HAVING`
5. `SELECT` (y `DISTINCT`)
6. `ORDER BY`

</div>
</div>

<div class="nota">

Por eso un **alias** definido en el `SELECT` se puede usar en el `ORDER BY` pero **no en el `WHERE`**: cuando se filtra, todavía no existe.

</div>

---

# Consultas de resumen

Las **funciones de agregado** resumen muchas filas en un solo valor.

```sql
SELECT COUNT(*), SUM(kilos), AVG(kilos), MIN(kilos), MAX(kilos)
FROM entrega;
```

<div class="res">

| COUNT(\*) | SUM(kilos) | AVG(kilos) | MIN(kilos) | MAX(kilos) |
|---|---|---|---|---|
| 9 | 3050 | 338,9 | 100 | 800 |

</div>

<p class="s">Hay 9 entregas, que suman 3050 kg: una media de 338,9 kg por entrega.</p>

---

# <code>GROUP BY</code>: un resumen por grupo

```sql
SELECT id_socio, SUM(kilos) AS total
FROM entrega
GROUP BY id_socio;
```

<div class="cols">
<div class="res">

| id_socio | total |
|---|---|
| 1 | 1050 |
| 2 | 950 |
| 3 | 700 |
| 4 | 350 |

</div>
<div class="nota">

Se forma **un grupo por cada valor** de `id_socio` y la función de agregado se calcula dentro de cada grupo.

</div>
</div>

<!--
EN GENIALLY: en la versión original hay una animación de cómo se forman los grupos. Se puede hacer con cuatro tarjetas (una por socio) que se juntan.
-->

---

# <code>WHERE</code> frente a <code>HAVING</code>

<div class="cols">
<div class="card">

### `WHERE`

Filtra **filas**, *antes* de agrupar.

<p class="s"><code>WHERE kilos &gt; 200</code> descarta las entregas pequeñas y después se agrupa: socio 1 pasa a sumar 850.</p>

</div>
<div class="card">

### `HAVING`

Filtra **grupos**, *después* de agrupar.

<p class="s"><code>HAVING SUM(kilos) &gt; 700</code> se queda con los socios que suman más de 700 kg.</p>

</div>
</div>

```sql
SELECT id_socio, SUM(kilos) AS total
FROM entrega
GROUP BY id_socio
HAVING SUM(kilos) > 700;     -- resultado: socio 1 (1050) y socio 2 (950)
```

---

# Los pasos de una consulta con grupos

<div class="pasos">
<div><b>1 · FROM</b>9 entregas</div>
<div class="f">›</div>
<div><b>2 · WHERE</b>sin filtro: siguen las 9</div>
<div class="f">›</div>
<div><b>3 · GROUP BY</b>4 grupos: socios 1, 2, 3 y 4</div>
<div class="f">›</div>
<div><b>4 · HAVING</b>SUM &gt; 700: quedan 2 grupos</div>
<div class="f">›</div>
<div><b>5 · SELECT</b>id_socio y total</div>
</div>

<div class="nota" style="margin-top: 30px">

La consulta anterior, paso a paso. Si no te sale un resultado, **recorre las fases en este orden** y mira qué ocurre en cada una.

</div>

---

<!-- _class: bloque -->

## Tercera parte

# Varias tablas

<p>Las <strong>composiciones</strong> (<em>joins</em>) y las <strong>subconsultas</strong>.</p>

---

# Producto cartesiano

Si pides dos tablas sin condición, SQL combina **cada fila con cada fila**:

```sql
SELECT * FROM socio, entrega;     -- 5 socios × 9 entregas
```

<div class="aviso">

**45 filas**, casi todas sin sentido: la entrega 1 de Ana aparece emparejada con Pedro, con Lucía… Falta decir **qué fila de una tabla corresponde con qué fila de la otra**.

</div>

Esa condición es la que añade el `JOIN`.

---

# <code>INNER JOIN</code>: solo las que coinciden

<div class="cols">
<div>

```sql
SELECT s.nombre, e.fecha, e.kilos
FROM socio s
INNER JOIN entrega e
  ON s.id_socio = e.id_socio
WHERE e.kilos >= 500;
```

<div class="res">

| nombre | fecha | kilos |
|---|---|---|
| Ana Martínez | 2026-03-02 | 500 |
| José López | 2026-03-05 | 800 |

</div>

</div>
<div class="venn card centro">

<svg viewBox="0 0 232 132" width="232" height="132" xmlns="http://www.w3.org/2000/svg"><clipPath id="va1"><circle cx="86" cy="66" r="54"/></clipPath><circle cx="146" cy="66" r="54" fill="#3f8a32" fill-opacity=".75" clip-path="url(#va1)"/><circle cx="86" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><circle cx="146" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><text x="62" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">socio</text><text x="170" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">entrega</text></svg>

<p class="s">Solo las filas con pareja en <b>las dos</b> tablas. Si un socio no tiene entregas, no aparece.</p>

</div>
</div>

---

# <code>LEFT</code> y <code>RIGHT JOIN</code>: las que no tienen pareja

<div class="cols3">
<div class="venn card centro">

<svg viewBox="0 0 232 132" width="232" height="132" xmlns="http://www.w3.org/2000/svg"><clipPath id="va2"><circle cx="86" cy="66" r="54"/></clipPath><circle cx="86" cy="66" r="54" fill="#3f8a32" fill-opacity=".75"/><circle cx="86" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><circle cx="146" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><text x="62" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">socio</text><text x="170" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">entrega</text></svg>

<p class="s"><b>LEFT JOIN</b>: todas las de la tabla de la izquierda.</p>

</div>
<div class="venn card centro">

<svg viewBox="0 0 232 132" width="232" height="132" xmlns="http://www.w3.org/2000/svg"><clipPath id="va3"><circle cx="86" cy="66" r="54"/></clipPath><circle cx="146" cy="66" r="54" fill="#3f8a32" fill-opacity=".75"/><circle cx="86" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><circle cx="146" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><text x="62" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">socio</text><text x="170" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">entrega</text></svg>

<p class="s"><b>RIGHT JOIN</b>: todas las de la tabla de la derecha.</p>

</div>
<div class="venn card centro">

<svg viewBox="0 0 232 132" width="232" height="132" xmlns="http://www.w3.org/2000/svg"><clipPath id="va4"><circle cx="86" cy="66" r="54"/></clipPath><circle cx="146" cy="66" r="54" fill="#3f8a32" fill-opacity=".75" clip-path="url(#va4)"/><circle cx="86" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><circle cx="146" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><text x="62" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">socio</text><text x="170" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">entrega</text></svg>

<p class="s"><b>INNER JOIN</b>: solo las que coinciden.</p>

</div>
</div>

<p class="s" style="margin-top: 18px">Con un <b>outer join</b> las filas sin pareja salen igualmente, con <code>NULL</code> en las columnas de la otra tabla.</p>

---

# Ejemplo: la socia sin entregas

```sql
SELECT s.nombre, COUNT(e.id_entrega) AS entregas
FROM socio s
LEFT JOIN entrega e ON s.id_socio = e.id_socio
GROUP BY s.id_socio, s.nombre;
```

<div class="cols">
<div class="res">

| nombre | entregas |
|---|---|
| Ana Martínez | 3 |
| José López | 2 |
| Carmen Sánchez | 2 |
| Pedro Ruiz | 2 |
| Lucía Gómez | **0** |

</div>
<div class="nota">

**Lucía Gómez** no ha hecho ninguna entrega, y con `INNER JOIN` habría desaparecido del resultado. Con `LEFT JOIN` sale con **0**.

</div>
</div>

---

# Subconsultas escalares

Una subconsulta es una consulta **dentro de otra**. Si devuelve un solo valor, se puede usar en una comparación:

```sql
SELECT nombre
FROM producto
WHERE precio_kg > (SELECT AVG(precio_kg) FROM producto);
```

<div class="cols">
<div class="res">

| nombre |
|---|
| Alcachofa |
| Melocotón |
| Albaricoque |

</div>
<div class="nota">

Primero se calcula el **precio medio** (1,275 €/kg) y después se buscan los productos que lo superan.

</div>
</div>

---

# Subconsultas con <code>IN</code>, <code>NOT IN</code> y <code>EXISTS</code>

<div class="cols">
<div>

```sql
-- IN: alguna entrega > 400 kg
SELECT nombre FROM socio
WHERE id_socio IN
  (SELECT id_socio FROM entrega
   WHERE kilos > 400);
```

<p class="s">Resultado: <b>Ana Martínez</b> y <b>José López</b>.</p>

</div>
<div>

```sql
-- NOT IN: sin ninguna entrega
SELECT nombre FROM producto
WHERE id_producto NOT IN
  (SELECT id_producto
   FROM entrega);
```

<p class="s">Resultado: <b>Albaricoque</b>.</p>

</div>
</div>

<p class="s"><code>EXISTS</code> / <code>NOT EXISTS</code> comprueban si la subconsulta devuelve <b>alguna fila</b>. Con <code>NOT EXISTS</code> sobre las entregas de cada socio sale <b>Lucía Gómez</b>.</p>

---

# Subconsulta o <code>JOIN</code>: ¿cuál es mejor?

<div class="cols">
<div>

```sql
-- Con subconsulta
SELECT nombre FROM socio s
WHERE NOT EXISTS
  (SELECT 1 FROM entrega e
   WHERE e.id_socio = s.id_socio);
```

</div>
<div>

```sql
-- Con LEFT JOIN
SELECT s.nombre FROM socio s
LEFT JOIN entrega e
  ON s.id_socio = e.id_socio
WHERE e.id_entrega IS NULL;
```

</div>
</div>

<div class="nota">

Las dos devuelven **Lucía Gómez**. Un mismo problema se puede resolver de **varias formas**: valora la **legibilidad**, el **rendimiento** y los casos especiales (`NOT IN` falla si la subconsulta devuelve algún `NULL`).

</div>

<!--
Criterio de evaluación 3.h: aplicar criterios de optimización de consultas.
-->

---

<!-- _class: juego -->

# <span class="n">Juego 2 ·</span> ¿Qué devuelve la consulta?

<div class="cols">
<div>

**Concurso de preguntas** contrarreloj. Cada pregunta muestra una consulta SQL: elige qué devuelve.

- **30 segundos** por pregunta.
- Botón **«Ver tablas»** para consultar los datos.
- Explicación y resultado real tras cada respuesta.

<span class="pill">500–1000 puntos</span> <span class="pill n">+100 de racha</span> <span class="pill v">15–20 min</span>

</div>
<div class="centro">

<a class="btn" href="https://antolin1.github.io/programacion-bbdd-uned/juego2/">▶ Jugar</a>

<p class="s" style="margin-top: 34px">Anota aquí tu llave:</p>

<span class="llave">2</span>

<p class="t muted">Dígito 2</p>

</div>
</div>

<!--
EN GENIALLY: el botón «Jugar» enlaza con https://antolin1.github.io/programacion-bbdd-uned/juego2/ (pestaña nueva). Casilla del dígito 2.
El docente puede proyectarlo y jugar por equipos.
-->

---

<!-- _class: bloque -->

## Cuarta parte

# Modificar datos

<p><strong>Insertar, actualizar y borrar</strong>, la integridad referencial y las <strong>transacciones</strong>.</p>

---

# <code>INSERT</code>: añadir filas

```sql
INSERT INTO socio (id_socio, nombre, municipio, fecha_alta)
VALUES (6, 'Luis Pérez', 'Totana', '2026-09-01');
```

También se puede insertar el **resultado de una consulta** con `INSERT … SELECT`:

```sql
CREATE TABLE resumen_categoria (
  categoria VARCHAR(30), precio_medio DECIMAL(5,2));

INSERT INTO resumen_categoria
SELECT categoria, ROUND(AVG(precio_kg), 2)
FROM producto GROUP BY categoria;
```

<p class="s">Resultado en la tabla nueva: Cítrico 0,53 · Fruta de hueso 1,80 · Hortaliza 1,50.</p>

---

# <code>UPDATE</code> y <code>DELETE</code>

<div class="cols">
<div>

```sql
UPDATE producto
SET precio_kg = precio_kg * 1.10
WHERE categoria = 'Cítrico';
```

<p class="s">Cambia el valor de las filas que cumplen la condición.</p>

</div>
<div>

```sql
DELETE FROM entrega
WHERE id_entrega = 9;
```

<p class="s">Borra las filas que cumplen la condición.</p>

</div>
</div>

<div class="aviso">

**Cuidado con el `WHERE`.** Si se te olvida, `UPDATE` cambia **todas** las filas y `DELETE` borra **todas** las filas de la tabla.

</div>

---

# Integridad referencial

Una **clave ajena** obliga a que cada entrega pertenezca a un socio que existe.

```sql
DELETE FROM socio WHERE id_socio = 1;
-- ERROR: FOREIGN KEY constraint failed  (Ana tiene entregas)
```

### Qué hacer al borrar o cambiar la fila «padre»

Se elige con `ON DELETE` y `ON UPDATE`:

<div class="cols3 s">
<div class="card">

**`RESTRICT` / `NO ACTION`**<br>Lo impide (por defecto).

</div>
<div class="card">

**`CASCADE`**<br>Lo propaga a las filas hijas.

</div>
<div class="card">

**`SET NULL`**<br>Pone `NULL` en la clave ajena.

</div>
</div>

---

# Transacciones y propiedades ACID

Una **transacción** agrupa varias sentencias que se ejecutan **como una sola operación**.

<div class="cols4">
<div class="card">

### A

**Atomicidad**<br><span class="s">Se hace todo o no se hace nada.</span>

</div>
<div class="card">

### C

**Consistencia**<br><span class="s">Los datos siguen cumpliendo las reglas.</span>

</div>
<div class="card">

### I

**Aislamiento**<br><span class="s">Cada transacción va a lo suyo.</span>

</div>
<div class="card">

### D

**Durabilidad**<br><span class="s">Lo confirmado no se pierde.</span>

</div>
</div>

---

# <code>COMMIT</code>, <code>ROLLBACK</code> y <code>SAVEPOINT</code>

```sql
START TRANSACTION;

UPDATE entrega SET kilos = kilos - 50 WHERE id_entrega = 3;
SAVEPOINT tras_restar;
UPDATE entrega SET kilos = kilos + 50 WHERE id_entrega = 1;

ROLLBACK TO tras_restar;   -- deshace lo posterior al SAVEPOINT
COMMIT;                    -- confirma lo que queda
```

<div class="cols">
<div class="nota">

**`COMMIT`** confirma los cambios.

</div>
<div class="nota">

**`ROLLBACK`** los anula, en parte (`TO`) o del todo.

</div>
</div>

---

# Bloqueos y concurrencia

¿Qué pasa si **dos personas** modifican la misma fila a la vez?

<div class="cols">
<div class="card">

### Bloqueos

- Un **bloqueo compartido** permite leer a varios a la vez.
- Un **bloqueo exclusivo** deja escribir solo a uno.
- El resto **espera** a que se libere.

</div>
<div class="card">

### Efectos

- Si dos transacciones se esperan entre sí, hay un **interbloqueo**.
- Los **niveles de aislamiento** dicen cuánto se ve de lo que hacen las demás.

</div>
</div>

<p class="s muted" style="margin-top: 14px">Son solo nociones: lo importante es saber que el SGBD gestiona la concurrencia por ti.</p>

---

<!-- _class: juego -->

# <span class="n">Juego 3 ·</span> Terminal de la Cooperativa

<div class="cols">
<div>

**Escape room** con una consola SQL **real**: editor con resaltado de sintaxis y SQLite funcionando en tu navegador.

- **Seis incidencias** de la cooperativa.
- Escribe la sentencia y pulsa **Comprobar**.
- Al principio con **plantillas**; después, editor vacío.

<span class="pill">500 por incidencia</span> <span class="pill n">pistas: −100</span> <span class="pill v">30–40 min</span>

</div>
<div class="centro">

<a class="btn" href="https://antolin1.github.io/programacion-bbdd-uned/juego3/">▶ Jugar</a>

<p class="s" style="margin-top: 28px">Anota aquí tus llaves:</p>

<span class="llave">3</span><span class="llave">4</span>

<p class="t muted">Dígitos 3 y 4</p>

</div>
</div>

<!--
EN GENIALLY: el botón «Jugar» enlaza con https://antolin1.github.io/programacion-bbdd-uned/juego3/ (pestaña nueva). Dos casillas: dígitos 3 y 4.
-->

---

<!-- _class: bloque -->

## Final

# La caja fuerte

<p>Reúne los <strong>cuatro dígitos</strong> y <strong>salva la campaña</strong>.</p>

---

# Abre la caja fuerte

<div class="caja">
<div class="visor"><span>?</span><span>?</span><span>?</span><span>?</span></div>
<div class="teclado"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span><span>9</span><span>0</span></div>
</div>

<p class="centro s" style="margin-top: 14px">Introduce los dígitos de las llaves, en orden: <b>juego 1, juego 2, juego 3 (dos dígitos)</b>.</p>

<!--
EN GENIALLY: crea un teclado numérico interactivo (diez botones y un visor). Código correcto: 2931 (dígito 1 = 2, dígito 2 = 9, dígito 3 = 3, dígito 4 = 1).
- Código correcto: va a la diapositiva de victoria («Campaña salvada») con la insignia final.
- Código erróneo: muestra una pista sobre el juego que hay que revisar.
-->

---

# ¡Campaña salvada!

<div class="cols">
<div>

La copia de seguridad se ha recuperado y la **Cooperativa Huerta de Murcia** puede exportar su cosecha.

Has trabajado como un técnico o una técnica de bases de datos de verdad:

- Has **clasificado** sentencias SQL.
- Has **leído y predicho** consultas.
- Has **escrito SQL real** para resolver incidencias.

</div>
<div class="card centro">

### Insignia final

<span class="pill" style="font-size: 36px; padding: 6px 28px">Maestro del DML</span>

<p class="s" style="margin-top: 18px">Y si has ganado las tres: <span class="pill v">Clasificador</span> <span class="pill b">Detective de consultas</span></p>

</div>
</div>

<!--
EN GENIALLY: es la pantalla de victoria que aparece al acertar el código.
-->

---

<!-- _class: cierre -->

# Lo que has aprendido

<div class="cols">
<div>

### Consultar
- `SELECT`, `WHERE`, `ORDER BY`, `DISTINCT`
- `COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING`
- `INNER`, `LEFT` y `RIGHT JOIN`
- Subconsultas con `IN`, `NOT IN` y `EXISTS`

</div>
<div>

### Modificar
- `INSERT`, `UPDATE` y `DELETE`
- Integridad referencial
- `COMMIT`, `ROLLBACK` y `SAVEPOINT`
- Los cuatro sublenguajes: DDL, DML, DCL y TCL

</div>
</div>

<div class="nota">

Un mismo problema tiene **varias soluciones**: elige la más clara y la más eficiente.

</div>

---

<!-- _class: cierre -->

# Autoevaluación

¿Qué has conseguido? Marca lo que **sabes hacer**:

<div class="cols s">
<div class="check">

- ☐ Clasificar sentencias en DDL, DML, DCL y TCL
- ☐ Filtrar y ordenar con `WHERE` y `ORDER BY`
- ☐ Resumir con agregados y `GROUP BY`
- ☐ Filtrar grupos con `HAVING`

</div>
<div class="check">

- ☐ Combinar tablas con `JOIN`
- ☐ Resolver con subconsultas y compararlas
- ☐ Insertar, actualizar y borrar con cuidado
- ☐ Usar transacciones (`COMMIT` y `ROLLBACK`)

</div>
</div>

<div class="nota">

Y también: ¿has perseverado ante los errores y has colaborado con tu equipo?

</div>

---

# Sigue practicando en casa

Los juegos son páginas web abiertas: puedes **repetirlos** tantas veces como quieras.

<div class="cols3">
<div class="card centro">

### Juego 1

<a href="https://antolin1.github.io/programacion-bbdd-uned/juego1/">Clasifica y ordena</a>

</div>
<div class="card centro">

### Juego 2

<a href="https://antolin1.github.io/programacion-bbdd-uned/juego2/">¿Qué devuelve la consulta?</a>

</div>
<div class="card centro">

### Juego 3

<a href="https://antolin1.github.io/programacion-bbdd-uned/juego3/">Terminal de la Cooperativa</a>

</div>
</div>

<p class="s" style="margin-top: 18px">Portal de la misión: <a href="https://antolin1.github.io/programacion-bbdd-uned/">antolin1.github.io/programacion-bbdd-uned</a></p>

<p class="s muted">En el juego 3 puedes probar las versiones alternativas de cada consulta.</p>

---

# Créditos y bibliografía

<div class="cols">
<div class="s">

### Créditos

Recurso educativo gamificado para el módulo 0484 *Bases de datos*.

Presentación en Genially y tres juegos web propios (HTML, CSS y JavaScript). Tipografías **Fredoka** y **JetBrains Mono**; **sql.js** (SQLite en WebAssembly).

</div>
<div class="t">

### Bibliografía

- Codd, E. F. (1970). *A Relational Model of Data for Large Shared Data Banks*.
- Chamberlin, D. D. y Boyce, R. F. (1974). *SEQUEL: A Structured English Query Language*.
- ISO/IEC 9075 (SQL).
- Silberschatz, Korth y Sudarshan. *Fundamentos de bases de datos*. McGraw-Hill.
- Elmasri y Navathe. *Fundamentos de sistemas de bases de datos*. Pearson.
- Werbach y Hunter (2012). *For the Win*. Wharton Digital Press.
- Real Decreto 405/2023, de 29 de mayo.

</div>
</div>
