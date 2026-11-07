<!-- .slide: class="portada" -->

<p class="kicker">Cooperativa Huerta de Murcia · Bases de datos</p>

# Misión <em>SQL</em>

## El enigma de la Cooperativa Huerta de Murcia

<p class="meta">Programación y Bases de Datos · Bloque 3: Bases de datos<br>
Módulo 0484 <em>Bases de datos</em> · 1.º de los CFGS de DAM y DAW</p>

<p class="empezar"><a class="btn orange big" href="#/1">▶ Comenzar la misión</a></p>

Note:
Navega con las flechas del teclado. Pulsa Esc para ver todas las diapositivas.

---

# La tormenta

Una tormenta de granizo ha dañado el servidor de la **Cooperativa Huerta de Murcia**, justo antes de la campaña de exportación.

La gerencia te ha contratado como **técnico o técnica junior de bases de datos** para recuperar la información de **socios, productos y entregas**.

<div class="nota">

Pero el acceso a la copia de seguridad está protegido por una **caja fuerte digital con un código de cuatro dígitos**.

</div>

---

# Tu misión

<div class="cols3 pasos-fr">
<div class="card">

### 1 · Supera los juegos

Son tres juegos. Cada uno que superes revela uno o dos dígitos: la **llave** del juego.

</div>
<div class="card">

### 2 · Reúne los dígitos

Se anotan solos en la presentación cuando superas cada juego. Necesitas los **cuatro** para abrir la caja fuerte.

</div>
<div class="card">

### 3 · Abre la caja fuerte

En la última parte introduce el código y **salva la campaña**.

</div>
</div>

---

# Equipos y normas del juego

<div class="cols">
<div>

- Se juega **por parejas**; cada pareja es un equipo con su perfil.
- Ganaréis **puntos**, **insignias** y los **dígitos** de la llave.
- Los juegos se desbloquean **en orden**.
- Puedes **repetirlos** cuando quieras.

</div>
<div class="card" id="panel-equipo">

### Tu equipo

<form id="form-equipo">
<input id="nombre-equipo" type="text" maxlength="40" placeholder="Ej.: Los Limoneros" autocomplete="off">
<button class="btn lemon small" type="submit">Guardar</button>
</form>

<div id="resumen-equipo"></div>

</div>
</div>

---

# Puntos e insignias

<div class="sm">

| Juego | Cómo se puntúa |
|---|---|
| **1** · Clasifica y ordena | **+10** por acierto, **+30** por cada consulta bien ordenada y **+50** por la llave. **−2** por fallo (con una explicación breve) |
| **2** · ¿Qué devuelve la consulta? | **500–1000** por acierto, según la rapidez (2 minutos por pregunta). **+100** de bonificación por racha a partir del 3.er acierto seguido |
| **3** · Terminal de la Cooperativa | **500** por incidencia. Cada pista (máximo 2) resta **100** y cada comprobación fallida, **25**. Mínimo **150** |

</div>

Insignias que puedes ganar: <span class="pill">Clasificador</span> <span class="pill v">Detective de consultas</span> <span class="pill n">Maestro del DML</span>

---

# El itinerario de la misión

<div class="ruta">
<div>Presentación<br><b>Misión, base de datos y consultas</b></div>
<div class="f">›</div>
<div class="j">Juego 1<br><b>Clasifica y ordena</b><br>dígito 1</div>
<div class="f">›</div>
<div>Presentación<br><b>Varias tablas, subconsultas y modificar datos</b></div>
<div class="f">›</div>
<div class="j">Juego 2<br><b>¿Qué devuelve la consulta?</b><br>dígito 2</div>
<div class="f">›</div>
<div class="j">Juego 3<br><b>Terminal de la Cooperativa</b><br>dígitos 3 y 4</div>
<div class="f">›</div>
<div>Presentación<br><b>Caja fuerte</b></div>
</div>

<div class="nota" style="margin-top: 28px">

La presentación es el **tablero**: antes de cada juego se explica todo lo que vas a necesitar en él, y aquí se vuelve con el dígito de la llave. Al final, la **caja fuerte**.

</div>

---

# Las cinco sesiones (una semana)

<div class="sm">

| Sesión | Qué hacemos |
|---|---|
| **1** | Misión, base de datos, introducción a SQL y consultas simples |
| **2** | Orden lógico, consultas de resumen y **juego 1** |
| **3** | Varias tablas y subconsultas |
| **4** | Modificar datos, transacciones y **juego 2** |
| **5** | **Juego 3**, caja fuerte, puesta en común y autoevaluación |

</div>

<p class="s muted">Cada sesión dura 55 minutos. Todos los juegos se juegan <b>por parejas</b>.</p>

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
8. Tener **autonomía y constancia** ante los errores y colaborar con tu pareja.

</div>
</div>

---

<!-- .slide: class="bloque" -->

## Primera parte

# La base de datos

<p>Conoce la base de datos <strong>cooperativa</strong> y el lenguaje <strong>SQL</strong>.</p>

---

# La base de datos <code>cooperativa</code>

Todos los retos se resuelven sobre la misma base de datos, con **tres tablas**:

<div class="cols3 pasos-fr">
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
- **SQLite**

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

<p class="s"><button class="btn ghost small solucion" type="button" data-sol="ALTER = DDL · REVOKE = DCL · UPDATE = DML · SAVEPOINT = TCL">Ver la solución</button> <span class="sol-out"></span></p>

</div>

---

<!-- .slide: class="bloque" -->

## Segunda parte

# Consultas con SELECT

<p>Leer datos: <strong>selección, proyección, orden y resumen</strong>.</p>

---

# Estructura de <code>SELECT</code>

```sql
--run
SELECT nombre, municipio    -- qué columnas quiero (proyección)
FROM socio;                 -- de qué tabla
```

<p class="s muted">Puedes cambiar las consultas de la presentación y volver a ejecutarlas.</p>

---

# Proyección, alias y <code>DISTINCT</code>

<div class="cols">
<div>

```sql
--run
SELECT nombre,
       precio_kg AS euros_kg
FROM producto;
```

<p class="s"><code>AS</code> pone un <b>alias</b>: un nombre nuevo a la columna del resultado.</p>

</div>
<div>

```sql
--run
SELECT DISTINCT municipio
FROM socio;
```

<p class="s"><code>DISTINCT</code> elimina los repetidos: Murcia sale <b>una</b> vez, aunque haya dos socios.</p>

</div>
</div>

---

# <code>WHERE</code>: filtrar filas

<div class="cols">
<div>

```sql
--run
SELECT nombre, precio_kg
FROM producto
WHERE categoria = 'Hortaliza'
  AND precio_kg < 1.5;
```

</div>
<div class="card">

### Operadores

**Comparación:** `=` `<>` `<` `>` `<=` `>=`

**Lógicos:** `AND` `OR` `NOT`

<p class="s">Las comparaciones de texto van entre comillas simples: <code>'Hortaliza'</code>.</p>

</div>
</div>

---

# Comparar fechas

Las fechas se escriben y se comparan como texto en formato **`'AAAA-MM-DD'`**, así que el orden alfabético coincide con el orden de las fechas:

```sql
--run
SELECT id_entrega, fecha, kilos
FROM entrega
WHERE fecha >= '2026-06-01';
```

<p class="s muted">Entregas de junio de 2026 en adelante. Prueba con <code>fecha &lt; '2026-03-06'</code>.</p>

---

# <code>BETWEEN</code> e <code>IN</code>

<div class="cols">
<div>

```sql
--run
-- BETWEEN: rango (con extremos)
SELECT id_entrega, kilos FROM entrega
WHERE kilos BETWEEN 200 AND 500;
```

</div>
<div>

```sql
--run
-- IN: una lista de valores
SELECT nombre FROM socio
WHERE municipio IN ('Murcia', 'Lorca');
```

</div>
</div>

---

# <code>LIKE</code> e <code>IS NULL</code>

<div class="cols">
<div>

```sql
--run
-- LIKE: patrón (% varios, _ uno)
SELECT nombre FROM socio
WHERE nombre LIKE '%ez';
```

</div>
<div>

```sql
--run
-- IS NULL: valor desconocido
SELECT nombre FROM socio
WHERE fecha_alta IS NULL;
```

</div>
</div>

<div class="nota">

`%` sustituye a cualquier número de caracteres y `_` a **exactamente uno**: `'%ez'` son los nombres que acaban en *ez* (Ruiz no) y `'_o%'`, los que tienen una «o» en segunda posición. Para comprobar si un valor falta usa **`IS NULL`**, nunca `= NULL`.

</div>

---

# <code>ORDER BY</code>: ordenar el resultado

<div class="cols">
<div>

```sql
--run
SELECT nombre, precio_kg
FROM producto
ORDER BY precio_kg DESC;
```

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
--run
SELECT COUNT(*), SUM(kilos), AVG(kilos), MIN(kilos), MAX(kilos)
FROM entrega;
```

<p class="s">Hay 9 entregas, que suman 3050 kg: una media de 338,9 kg por entrega.</p>

---

# <code>GROUP BY</code>: un resumen por grupo

```sql
--run
SELECT id_socio, SUM(kilos) AS total
FROM entrega
GROUP BY id_socio;
```

<div class="nota">

Se forma **un grupo por cada valor** de `id_socio` y la función de agregado se calcula dentro de cada grupo.

</div>

---

# <code>WHERE</code> frente a <code>HAVING</code>

<div class="cols">
<div class="card">

### `WHERE`

Filtra **filas**, *antes* de agrupar.

<p class="s"><code>WHERE kilos &gt; 200</code>: el socio 1 pasa a sumar 850.</p>

</div>
<div class="card">

### `HAVING`

Filtra **grupos**, *después* de agrupar.

<p class="s"><code>HAVING SUM(kilos) &gt; 700</code>: socios con más de 700 kg.</p>

</div>
</div>

```sql
--run
SELECT id_socio, SUM(kilos) AS total
FROM entrega
GROUP BY id_socio
HAVING SUM(kilos) > 700;
```

---

# Los pasos de una consulta con grupos

<div class="pasos pasos-fr">
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

<!-- .slide: class="juego" -->

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

<a class="btn orange big" href="../juego1/" target="_blank" rel="noopener">▶ Jugar</a>

<p class="s" style="margin-top: 34px">Al terminar, tu llave aparece aquí:</p>

<span class="llave" data-digit="1">?</span>

<p class="t muted">Dígito 1</p>

<p class="necesitas"><b>Necesitarás:</b> los sublenguajes, las cláusulas de <code>SELECT</code> y su orden, <code>LIKE</code>, <code>IN</code>, <code>BETWEEN</code>, <code>IS NULL</code>, <code>DISTINCT</code> y los alias.</p>

</div>
</div>

---

<!-- .slide: class="bloque" -->

## Tercera parte

# Varias tablas

<p>Las <strong>composiciones</strong> (<em>joins</em>) y las <strong>subconsultas</strong>.</p>

---

# Producto cartesiano

Si pides dos tablas sin condición, SQL combina **cada fila con cada fila**:

```sql
--run
SELECT * FROM socio, entrega;     -- 5 socios × 9 entregas
```

<div class="aviso">

**45 filas**, casi todas sin sentido (la entrega de Ana sale emparejada con Pedro, con Lucía…). Falta la condición que une cada fila con la suya: la añade el `JOIN`.

</div>

---

# <code>INNER JOIN</code>: solo las que coinciden

<div class="cols">
<div>

```sql
--run
SELECT s.nombre, e.fecha, e.kilos
FROM socio s
INNER JOIN entrega e
  ON s.id_socio = e.id_socio
WHERE e.kilos >= 500;
```

</div>
<div class="venn card centro">

<svg viewBox="0 0 232 132" width="232" height="132" xmlns="http://www.w3.org/2000/svg"><clipPath id="va1"><circle cx="86" cy="66" r="54"/></clipPath><circle cx="146" cy="66" r="54" fill="#3f8a32" fill-opacity=".75" clip-path="url(#va1)"/><circle cx="86" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><circle cx="146" cy="66" r="54" fill="none" stroke="#3a2a17" stroke-width="3"/><text x="62" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">socio</text><text x="170" y="71" font-family="Fredoka" font-size="14" font-weight="600" fill="#3a2a17" text-anchor="middle">entrega</text></svg>

<p class="s">Solo las filas con pareja en <b>las dos</b> tablas. Si un socio no tiene entregas, no aparece.</p>

</div>
</div>

---

# <code>LEFT</code> y <code>RIGHT JOIN</code>: las que no tienen pareja

<div class="cols3 pasos-fr">
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
--run
SELECT s.nombre, COUNT(e.id_entrega) AS entregas
FROM socio s
LEFT JOIN entrega e ON s.id_socio = e.id_socio
GROUP BY s.id_socio, s.nombre;
```

<div class="nota">

**Lucía Gómez** no ha hecho ninguna entrega, y con `INNER JOIN` habría desaparecido del resultado. Con `LEFT JOIN` sale con **0**. Cambia `LEFT` por `INNER` y compruébalo.

</div>

---

# Tres tablas y columnas calculadas

```sql
--run
SELECT s.nombre, p.nombre AS producto, e.kilos,
       e.kilos * p.precio_kg AS importe
FROM socio s
  INNER JOIN entrega e  ON s.id_socio = e.id_socio
  INNER JOIN producto p ON e.id_producto = p.id_producto
WHERE p.categoria = 'Cítrico';
```

<p class="s">Se pueden <b>encadenar</b> varios <code>JOIN</code>, cada uno con su condición. <code>importe</code> no está en ninguna tabla: se <b>calcula</b> fila a fila.</p>

---

# Subconsultas escalares

Una subconsulta es una consulta **dentro de otra**. Si devuelve un solo valor, se puede usar en una comparación:

```sql
--run
SELECT nombre
FROM producto
WHERE precio_kg > (SELECT AVG(precio_kg) FROM producto);
```

<div class="nota">

Primero se calcula el **precio medio** (1,275 €/kg); después, los productos que lo superan.

</div>

---

# Subconsultas con <code>IN</code>, <code>NOT IN</code> y <code>EXISTS</code>

<div class="cols">
<div>

```sql
--run
-- IN: alguna entrega > 400 kg
SELECT nombre FROM socio
WHERE id_socio IN
  (SELECT id_socio FROM entrega
   WHERE kilos > 400);
```

</div>
<div>

```sql
--run
-- NOT IN: sin ninguna entrega
SELECT nombre FROM producto
WHERE id_producto NOT IN
  (SELECT id_producto
   FROM entrega);
```

</div>
</div>

<p class="s"><code>EXISTS</code> / <code>NOT EXISTS</code> comprueban si la subconsulta devuelve <b>alguna fila</b>. Con <code>NOT EXISTS</code> sobre las entregas de cada socio sale <b>Lucía Gómez</b>.</p>

---

# Subconsulta o <code>JOIN</code>: ¿cuál es mejor?

<div class="cols">
<div>

```sql
--run
-- Con subconsulta
SELECT nombre FROM socio s
WHERE NOT EXISTS
  (SELECT 1 FROM entrega e
   WHERE e.id_socio = s.id_socio);
```

</div>
<div>

```sql
--run
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

---

<!-- .slide: class="bloque" -->

## Cuarta parte

# Modificar datos

<p><strong>Insertar, actualizar y borrar</strong>, la integridad referencial y las <strong>transacciones</strong>.</p>

---

# <code>INSERT</code>: añadir filas

```sql
--run after: SELECT * FROM socio
INSERT INTO socio (id_socio, nombre, municipio, fecha_alta)
VALUES (6, 'Luis Pérez', 'Totana', '2026-09-01');
```

<p class="s muted">La base de datos se restaura cada vez que pulsas ▶, así que puedes probar sin miedo.</p>

---

# <code>INSERT … SELECT</code>

Se puede insertar el **resultado de una consulta** en otra tabla:

```sql
--run after: SELECT * FROM resumen_categoria
CREATE TABLE resumen_categoria (
  categoria VARCHAR(30), precio_medio DECIMAL(5,2));
INSERT INTO resumen_categoria
SELECT categoria, ROUND(AVG(precio_kg), 2)
FROM producto GROUP BY categoria;
```

---

# <code>UPDATE</code> y <code>DELETE</code>

<div class="cols">
<div>

```sql
--run after: SELECT nombre, precio_kg FROM producto
UPDATE producto
SET precio_kg = precio_kg * 1.10
WHERE categoria = 'Cítrico';
```

</div>
<div>

```sql
--run after: SELECT * FROM entrega
DELETE FROM entrega
WHERE id_entrega = 9;
```

</div>
</div>

<div class="aviso">

**Cuidado con el `WHERE`:** sin él, `UPDATE` y `DELETE` afectan a **todas** las filas. Quítalo y compruébalo: la base de datos se restaura cada vez.

</div>

---

# Integridad referencial

Una **clave ajena** obliga a que cada entrega pertenezca a un socio que existe.

```sql
--run
DELETE FROM socio WHERE id_socio = 1;
```

<p class="s">Ana tiene entregas, así que el SGBD <b>rechaza</b> el borrado. Qué hacer al borrar o cambiar la fila «padre» se elige con <code>ON DELETE</code> y <code>ON UPDATE</code>:</p>

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

<div class="cols4 pasos-fr">
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
--run after: SELECT id_entrega, kilos FROM entrega WHERE id_entrega IN (1, 3)
START TRANSACTION;
UPDATE entrega SET kilos = kilos - 50 WHERE id_entrega = 3;
SAVEPOINT tras_restar;
UPDATE entrega SET kilos = kilos + 50 WHERE id_entrega = 1;
ROLLBACK TO SAVEPOINT tras_restar;  -- deshace lo posterior
COMMIT;                             -- confirma lo que queda
```

<p class="s"><b><code>COMMIT</code></b> confirma; <b><code>ROLLBACK</code></b> anula, en parte (<code>TO SAVEPOINT</code>) o del todo.</p>

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

<!-- .slide: class="juego" -->

# <span class="n">Juego 2 ·</span> ¿Qué devuelve la consulta?

<div class="cols">
<div>

**Concurso de preguntas** contrarreloj. Cada pregunta muestra una consulta SQL: elige qué devuelve.

- **2 minutos** por pregunta.
- Botón **«Ver tablas»** para consultar los datos.
- Explicación y resultado real tras cada respuesta.

<span class="pill">500–1000 puntos</span> <span class="pill n">+100 de racha</span> <span class="pill v">15–20 min</span>

</div>
<div class="centro">

<a class="btn orange big" href="../juego2/" target="_blank" rel="noopener">▶ Jugar</a>

<p class="s" style="margin-top: 34px">Al terminar, tu llave aparece aquí:</p>

<span class="llave" data-digit="2">?</span>

<p class="t muted">Dígito 2</p>

<p class="necesitas"><b>Necesitarás:</b> consultas simples y de resumen, <code>JOIN</code> de dos y tres tablas, subconsultas, <code>UPDATE</code>, la integridad referencial y <code>ROLLBACK</code>.</p>

</div>
</div>

---

<!-- .slide: class="juego" -->

# <span class="n">Juego 3 ·</span> Terminal de la Cooperativa

<div class="cols">
<div>

**Escape room** con una consola SQL **real**: escribes las sentencias y ves su resultado.

- **Seis incidencias** de la cooperativa.
- Escribe la sentencia y pulsa **Comprobar**.
- Al principio con **plantillas**; después, editor vacío.

<span class="pill">500 por incidencia</span> <span class="pill n">pistas: −100</span> <span class="pill v">30–40 min</span>

</div>
<div class="centro">

<a class="btn orange big" href="../juego3/" target="_blank" rel="noopener">▶ Jugar</a>

<p class="s" style="margin-top: 28px">Al terminar, tus llaves aparecen aquí:</p>

<span class="llave" data-digit="3">?</span><span class="llave" data-digit="4">?</span>

<p class="t muted">Dígitos 3 y 4</p>

<p class="necesitas"><b>Necesitarás:</b> <code>JOIN</code> y columnas calculadas, <code>GROUP BY</code> y <code>HAVING</code>, <code>NOT IN</code> o <code>LEFT JOIN</code>, <code>INSERT</code>, fechas, transacciones con <code>SAVEPOINT</code> e <code>INSERT … SELECT</code>.</p>

</div>
</div>

---

<!-- .slide: class="bloque" -->

## Final

# La caja fuerte

<p>Reúne los <strong>cuatro dígitos</strong> y <strong>salva la campaña</strong>.</p>

---

<!-- .slide: class="caja-fuerte" -->

# Abre la caja fuerte

<div class="caja" id="caja">
<div class="visor" id="visor"><span></span><span></span><span></span><span></span></div>
<div class="teclado" id="teclado"></div>
<p class="s" id="caja-msg">Introduce los dígitos de las llaves, en orden: <b>juego 1, juego 2, juego 3 (dos dígitos)</b>.</p>
<p class="s"><button class="btn ghost small" id="usar-digitos" type="button">Usar los dígitos que he conseguido</button></p>
</div>

---

<!-- .slide: class="victoria" -->

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

### Tus insignias

<div id="insignias"></div>

<p class="s" style="margin-top: 18px" id="puntos-finales"></p>

</div>
</div>

<p class="bloqueada s">🔒 Esta diapositiva se desbloquea al abrir la caja fuerte.</p>

---

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

# Autoevaluación

¿Qué has conseguido? Marca lo que **sabes hacer**:

<div class="cols s autoeval">
<div>

<label><input type="checkbox" data-k="1"> Clasificar sentencias en DDL, DML, DCL y TCL</label>
<label><input type="checkbox" data-k="2"> Filtrar y ordenar con <code>WHERE</code> y <code>ORDER BY</code></label>
<label><input type="checkbox" data-k="3"> Resumir con agregados y <code>GROUP BY</code></label>
<label><input type="checkbox" data-k="4"> Filtrar grupos con <code>HAVING</code></label>

</div>
<div>

<label><input type="checkbox" data-k="5"> Combinar tablas con <code>JOIN</code></label>
<label><input type="checkbox" data-k="6"> Resolver con subconsultas y compararlas</label>
<label><input type="checkbox" data-k="7"> Insertar, actualizar y borrar con cuidado</label>
<label><input type="checkbox" data-k="8"> Usar transacciones (<code>COMMIT</code> y <code>ROLLBACK</code>)</label>

</div>
</div>

<div class="barra"><div id="barra-auto"></div></div>

<div class="nota">

Y también: ¿has perseverado ante los errores y has colaborado con tu pareja?

</div>

---

# Sigue practicando en casa

Los juegos son páginas web abiertas: puedes **repetirlos** tantas veces como quieras.

<div class="cols3">
<div class="card centro">

### Juego 1

<a href="../juego1/">Clasifica y ordena</a>

</div>
<div class="card centro">

### Juego 2

<a href="../juego2/">¿Qué devuelve la consulta?</a>

</div>
<div class="card centro">

### Juego 3

<a href="../juego3/">Terminal de la Cooperativa</a>

</div>
</div>

<p class="s" style="margin-top: 18px">Portal de la misión: <a href="../">mapa, marcador y caja fuerte</a> · Base de datos para practicar: <a href="../data/cooperativa.sql" download>cooperativa.sql</a></p>

<p class="s muted">En el juego 3 puedes resolver las incidencias de más de una forma y comprobar que obtienes el mismo resultado.</p>
