/* Incidencias del juego 3. Las soluciones coinciden con las de la memoria de la actividad.
   Cada comprobación recibe el resultado de ejecutar el código del alumnado sobre una base de
   datos nueva y devuelve { ok, msg } (o { ok: false, partial: true, msg } si va bien encaminado). */
(function () {
  "use strict";

  const TOL = 0.011;

  function same(a, b) {
    if (typeof b === "number") return typeof a === "number" && Math.abs(a - b) < TOL;
    return MS.normalize(a) === MS.normalize(b);
  }

  function rowsEqual(actual, expected, ordered = true) {
    if (!actual || actual.length !== expected.length) return false;
    const eqRow = (r, e) => r.length === e.length && r.every((v, i) => same(v, e[i]));
    if (ordered) return actual.every((r, i) => eqRow(r, expected[i]));
    const left = expected.slice();
    return actual.every((r) => {
      const k = left.findIndex((e) => eqRow(r, e));
      if (k < 0) return false;
      left.splice(k, 1);
      return true;
    });
  }

  function selects(ctx) {
    return ctx.results.filter((r) => r.columns);
  }

  function query(db, sql) {
    const r = db.exec(sql)[0];
    return r ? r.values : [];
  }

  function hasBlanks(code) {
    return /_{3,}/.test(code);
  }

  window.INCIDENCIAS = [
    {
      id: "liquidacion",
      title: "Liquidación por socio",
      mode: "guiado",
      icon: "receipt-euro",
      story: "La gerencia necesita saber cuánto hay que pagar a cada socio por sus entregas (kilos × precio por kilo), ordenado de mayor a menor importe.",
      task: "Completa los huecos <code>______</code> de la consulta.",
      template:
        "SELECT s.nombre, SUM(e.kilos * p.precio_kg) AS importe\n" +
        "FROM socio s\n" +
        "  ______ JOIN entrega e  ON s.id_socio = e.______\n" +
        "  INNER JOIN producto p ON e.id_producto = p.id_producto\n" +
        "______ s.nombre\n" +
        "ORDER BY importe ______;",
      hints: [
        "El primer hueco es el tipo de composición: solo queremos las filas que coinciden en las dos tablas.",
        "La entrega se relaciona con el socio por su clave ajena <code>id_socio</code>. Después agrupa por nombre (<code>GROUP BY</code>) y ordena de mayor a menor (<code>DESC</code>).",
      ],
      check(ctx) {
        if (hasBlanks(ctx.code)) return { ok: false, msg: "Todavía quedan huecos <code>______</code> por completar." };
        const expected = [["Ana Martínez", 1065], ["Carmen Sánchez", 780], ["José López", 630], ["Pedro Ruiz", 480]];
        const ok = selects(ctx).some((r) => rowsEqual(r.rows, expected, true));
        return ok
          ? { ok: true, msg: "¡Liquidación correcta! Ana Martínez es quien más cobra: 1065 €." }
          : { ok: false, msg: "La consulta no devuelve los cuatro socios con su importe, ordenados de mayor a menor." };
      },
    },
    {
      id: "categorias",
      title: "Categorías estrella",
      mode: "guiado",
      icon: "chart-column",
      digit: { pos: 4, value: 1 },
      story: "Para la campaña de exportación hay que saber qué categorías de producto superan los 1000 kg entregados.",
      task: "Completa los huecos para obtener las categorías con más de 1000 kg. El número de categorías que obtengas es el <strong>dígito 4</strong> de la caja fuerte.",
      template:
        "SELECT p.categoria, SUM(e.kilos) AS total_kg\n" +
        "FROM producto p INNER JOIN entrega e ON p.id_producto = e.id_producto\n" +
        "GROUP BY ______\n" +
        "______ SUM(e.kilos) > 1000;",
      hints: [
        "Agrupa por la columna que quieres resumir: la categoría del producto.",
        "Para filtrar grupos (no filas) se usa <code>HAVING</code>, no <code>WHERE</code>.",
      ],
      check(ctx) {
        if (hasBlanks(ctx.code)) return { ok: false, msg: "Todavía quedan huecos <code>______</code> por completar." };
        const ok = selects(ctx).some((r) => rowsEqual(r.rows, [["Cítrico", 1600]], false));
        return ok
          ? { ok: true, msg: "¡Correcto! Solo los cítricos superan los 1000 kg (1600 kg). Hortaliza suma 700 y Fruta de hueso, 750." }
          : { ok: false, msg: "El resultado debería tener las categorías que superan los 1000 kg, con su total." };
      },
    },
    {
      id: "sin-movimiento",
      title: "Producto sin movimiento",
      mode: "libre",
      icon: "package-search",
      story: "En el almacén hay un producto del catálogo del que nadie ha entregado ni un kilo. Hay que localizarlo.",
      task: "Escribe una consulta que muestre los productos sin ninguna entrega. Después, escribe <strong>una segunda versión con otra técnica</strong> (una con subconsulta y otra con composición externa).",
      template: "-- Versión 1 (subconsulta):\n\n\n-- Versión 2 (composición externa):\n\n",
      hints: [
        "Con subconsulta: busca los productos cuyo <code>id_producto</code> no está (<code>NOT IN</code>) entre los de la tabla entrega.",
        "Con composición externa: <code>producto LEFT JOIN entrega</code> y quédate con las filas en las que la entrega es <code>NULL</code>.",
      ],
      check(ctx) {
        const good = selects(ctx).filter((r) => rowsEqual(r.rows, [["Albaricoque"]], false));
        const sub = /NOT\s+(IN|EXISTS)/i.test(ctx.code);
        const outer = /(LEFT|RIGHT)\s+(OUTER\s+)?JOIN/i.test(ctx.code);
        if (good.length >= 2 && sub && outer) {
          return {
            ok: true,
            msg: "¡Encontrado: el Albaricoque! Las dos versiones son válidas. Ojo: <code>NOT IN</code> devuelve un conjunto vacío si la subconsulta contiene algún NULL; el <code>LEFT JOIN</code> o <code>NOT EXISTS</code> evitan ese problema.",
          };
        }
        if (good.length >= 1) {
          return { ok: false, partial: true, msg: "¡Bien, la consulta encuentra el producto! Ahora añade la segunda versión con la otra técnica (subconsulta y composición externa)." };
        }
        return { ok: false, msg: "Ninguna consulta devuelve el producto sin entregas." };
      },
    },
    {
      id: "nuevo-socio",
      title: "Nuevo socio",
      mode: "libre",
      icon: "user-plus",
      story: "Se incorpora a la cooperativa <strong>Antonio Pérez</strong>, de <strong>Yecla</strong>, con fecha de alta 1 de octubre de 2026 e identificador 6. Hoy (2026-10-29) ha entregado 600 kg de limones.",
      task: "Registra al socio y, a continuación, su entrega (número de entrega 10).",
      template: "-- Registra primero al socio y después su entrega\n\n",
      hints: [
        "Usa <code>INSERT INTO socio (id_socio, nombre, municipio, fecha_alta) VALUES (...)</code>.",
        "El limón es el producto 1. El orden importa: la entrega referencia al socio, así que el socio debe existir antes.",
      ],
      check(ctx) {
        const socio = query(ctx.db, "SELECT id_socio, nombre, municipio, fecha_alta FROM socio WHERE id_socio = 6");
        if (!rowsEqual(socio, [[6, "Antonio Pérez", "Yecla", "2026-10-01"]])) {
          return { ok: false, msg: "No encuentro al socio 6 (Antonio Pérez, Yecla, 2026-10-01)." };
        }
        const ent = query(ctx.db, "SELECT id_entrega, id_socio, id_producto, fecha, kilos FROM entrega WHERE id_entrega = 10");
        if (!rowsEqual(ent, [[10, 6, 1, "2026-10-29", 600]])) {
          return { ok: false, msg: "El socio está bien, pero falta la entrega 10 (socio 6, limón, 2026-10-29, 600 kg)." };
        }
        return { ok: true, msg: "¡Antonio ya es socio y su entrega está registrada! Si hubieras insertado antes la entrega, el SGBD la habría rechazado por integridad referencial." };
      },
    },
    {
      id: "limpieza",
      title: "Limpieza de entregas antiguas",
      mode: "libre",
      icon: "trash-2",
      digit: { pos: 3, value: 3 },
      story: "Las entregas anteriores al 6 de marzo de 2026 ya se han liquidado y hay que retirarlas, pero con cuidado: dentro de una transacción.",
      task: "Inicia una transacción, borra las entregas anteriores al 6 de marzo de 2026, comprueba cuántas quedan y confirma los cambios. El número de filas borradas es el <strong>dígito 3</strong> de la caja fuerte.",
      template: "-- Puedes usar START TRANSACTION (MySQL) o BEGIN TRANSACTION (SQLite)\n\n",
      hints: [
        "La estructura es: <code>START TRANSACTION;</code> … <code>DELETE FROM entrega WHERE …;</code> … <code>COMMIT;</code>",
        "Las fechas se comparan como texto en formato AAAA-MM-DD: <code>fecha &lt; '2026-03-06'</code>.",
      ],
      check(ctx) {
        if (!/\b(BEGIN|START\s+TRANSACTION)\b/i.test(ctx.code)) {
          return { ok: false, msg: "El borrado debe hacerse dentro de una transacción (<code>START TRANSACTION</code>)." };
        }
        if (ctx.txOpen) return { ok: false, msg: "La transacción sigue abierta: falta confirmarla con <code>COMMIT</code>." };
        const left = query(ctx.db, "SELECT COUNT(*), MIN(fecha) FROM entrega")[0];
        if (left[0] !== 6 || left[1] < "2026-03-06") {
          return { ok: false, msg: `Quedan ${left[0]} entregas. Deberían quedar 6, todas desde el 6 de marzo.` };
        }
        return { ok: true, msg: "¡Limpieza hecha! Se han borrado 3 entregas (la 1, la 2 y la 3) y la transacción está confirmada." };
      },
    },
    {
      id: "precios",
      title: "Subida de precios con marcha atrás",
      mode: "libre",
      icon: "undo-2",
      story: "La gerencia quiere subir precios, pero duda con la fruta de hueso. Toca trabajar con puntos de guardado.",
      task: "En una transacción: sube un 10 % las hortalizas, crea un <code>SAVEPOINT</code>, sube un 5 % la fruta de hueso, deshaz solo esta segunda subida y confirma. Después guarda en una tabla nueva <code>resumen_categoria(categoria, precio_medio)</code> el precio medio de cada categoría, redondeado a 2 decimales.",
      template: "-- 1) Transacción con punto de guardado\n\n\n-- 2) Tabla resumen_categoria\n\n",
      hints: [
        "<code>SAVEPOINT tras_hortalizas;</code> marca el punto, y <code>ROLLBACK TO SAVEPOINT tras_hortalizas;</code> vuelve a él sin deshacer lo anterior.",
        "Crea la tabla con <code>CREATE TABLE</code> y rellénala con <code>INSERT INTO resumen_categoria SELECT categoria, ROUND(AVG(precio_kg), 2) FROM producto GROUP BY categoria;</code>",
      ],
      check(ctx) {
        if (!/SAVEPOINT/i.test(ctx.code) || !/ROLLBACK\s+TO/i.test(ctx.code)) {
          return { ok: false, msg: "Debes usar un <code>SAVEPOINT</code> y volver a él con <code>ROLLBACK TO SAVEPOINT</code>." };
        }
        if (ctx.txOpen) return { ok: false, msg: "La transacción sigue abierta: falta el <code>COMMIT</code>." };
        const precios = query(ctx.db, "SELECT nombre, precio_kg FROM producto ORDER BY id_producto");
        const esperado = [["Limón", 0.6], ["Naranja", 0.45], ["Pimiento", 1.32], ["Alcachofa", 1.98], ["Melocotón", 1.5], ["Albaricoque", 2.1]];
        if (!rowsEqual(precios, esperado)) {
          return { ok: false, msg: "Los precios no son los esperados: solo deben subir las hortalizas (Pimiento 1,32 € y Alcachofa 1,98 €)." };
        }
        let resumen;
        try {
          resumen = query(ctx.db, "SELECT categoria, precio_medio FROM resumen_categoria");
        } catch (e) {
          return { ok: false, partial: true, msg: "Los precios están bien. Ahora crea y rellena la tabla <code>resumen_categoria</code>." };
        }
        const resEsperado = [["Cítrico", 0.53], ["Fruta de hueso", 1.8], ["Hortaliza", 1.65]];
        if (!rowsEqual(resumen, resEsperado, false)) {
          return { ok: false, partial: true, msg: "La tabla <code>resumen_categoria</code> no tiene los precios medios esperados (redondeados a 2 decimales)." };
        }
        return { ok: true, msg: "¡Perfecto! Pimiento 1,32 €, Alcachofa 1,98 €, la fruta de hueso sin cambios y el resumen guardado." };
      },
    },
  ];
})();
