/* Juego 1: Clasifica y ordena */
(function () {
  "use strict";
  const { icon } = MS;
  const $ = (s) => document.querySelector(s);

  const CATEGORIES = [
    { id: "DDL", name: "DDL", desc: "Definición de datos", color: "var(--blue)" },
    { id: "DML", name: "DML", desc: "Manipulación de datos", color: "var(--green)" },
    { id: "DCL", name: "DCL", desc: "Control de acceso", color: "var(--orange)" },
    { id: "TCL", name: "TCL", desc: "Control de transacciones", color: "var(--violet)" },
  ];

  const STATEMENTS = [
    { s: "CREATE", c: "DDL", why: "CREATE crea objetos de la base de datos (tablas, vistas…): es DDL." },
    { s: "SELECT", c: "DML", why: "SELECT consulta datos: forma parte del DML." },
    { s: "GRANT", c: "DCL", why: "GRANT concede privilegios a usuarios: es DCL." },
    { s: "COMMIT", c: "TCL", why: "COMMIT confirma una transacción: es TCL." },
    { s: "ALTER", c: "DDL", why: "ALTER modifica la estructura de un objeto: es DDL." },
    { s: "INSERT", c: "DML", why: "INSERT añade filas: es DML." },
    { s: "REVOKE", c: "DCL", why: "REVOKE retira privilegios: es DCL." },
    { s: "ROLLBACK", c: "TCL", why: "ROLLBACK deshace una transacción: es TCL." },
    { s: "DROP", c: "DDL", why: "DROP elimina un objeto de la base de datos: es DDL." },
    { s: "UPDATE", c: "DML", why: "UPDATE modifica filas existentes: es DML." },
    { s: "TRUNCATE", c: "DDL", why: "TRUNCATE vacía la tabla redefiniéndola, sin borrar fila a fila: se considera DDL." },
    { s: "DELETE", c: "DML", why: "DELETE borra filas concretas: es DML." },
    { s: "SAVEPOINT", c: "TCL", why: "SAVEPOINT marca un punto de guardado dentro de una transacción: es TCL." },
  ];

  const CLAUSES = [
    "SELECT id_socio, SUM(kilos) AS total",
    "FROM entrega",
    "WHERE fecha >= '2026-01-01'",
    "GROUP BY id_socio",
    "HAVING SUM(kilos) > 400",
    "ORDER BY total DESC",
  ];
  const LOGICAL = ["FROM", "WHERE", "GROUP BY", "HAVING", "SELECT", "ORDER BY"];

  const PAIRS = [
    { e: "nombre LIKE 'Car%'", m: "El nombre empieza por «Car»" },
    { e: "nombre LIKE '_o%'", m: "La segunda letra del nombre es una «o»" },
    { e: "municipio IN ('Lorca','Cieza')", m: "El municipio es Lorca o Cieza" },
    { e: "precio_kg BETWEEN 1 AND 2", m: "Precio entre 1 y 2 €, ambos incluidos" },
    { e: "fecha_alta IS NULL", m: "No se conoce la fecha de alta" },
    { e: "SELECT DISTINCT municipio", m: "Muestra cada municipio una sola vez" },
    { e: "SUM(kilos) AS total", m: "Pone el alias «total» a la columna calculada" },
    { e: "precio_kg <> 0.60", m: "Precio distinto de 0,60 €" },
  ];
  const PAIR_COLORS = ["#ffd23f", "#4cc9f0", "#3ddc97", "#ff8c42", "#9b5de5", "#ff5d73", "#f15bb5", "#00f5d4"];

  let score = 0;

  function addScore(n, el) {
    score = Math.max(0, score + n);
    const s = $("#score");
    s.textContent = score;
    if (window.gsap) gsap.fromTo(s.parentElement, { scale: 1.25 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
    if (n > 0) {
      MS.sound("ok");
      if (el) MS.confetti({ small: true, origin: MS.originOf(el) });
    } else {
      MS.sound("bad");
    }
  }

  function show(id, step) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const el = document.getElementById(id);
    el.classList.add("active");
    document.querySelectorAll("#steps .step").forEach((s) => {
      const n = Number(s.dataset.step);
      s.classList.toggle("active", n === step);
      s.classList.toggle("done", step && n < step);
    });
    if (window.gsap && !MS.reducedMotion()) gsap.from(el.firstElementChild, { y: 30, opacity: 0, duration: 0.5, ease: "power3.out" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Nivel 1: clasificación ---------- */
  let selectedCard = null;

  function setupLevel1() {
    const pool = $("#pool1");
    pool.innerHTML = MS.shuffle(STATEMENTS)
      .map((st) => `<button class="card" type="button" data-c="${st.c}" data-s="${st.s}">${st.s}</button>`)
      .join("");
    $("#buckets1").innerHTML = CATEGORIES.map(
      (c) => `<div class="bucket" style="--c:${c.color}" data-c="${c.id}" tabindex="0" role="button" aria-label="${c.name}: ${c.desc}">
          <h3>${c.name}</h3><p>${c.desc}</p><div class="drop" data-c="${c.id}"></div></div>`
    ).join("");

    const common = { group: "l1", animation: 180, filter: ".locked", preventOnFilter: false };
    new Sortable(pool, { ...common, sort: false });
    document.querySelectorAll("#buckets1 .drop").forEach((drop) => {
      new Sortable(drop, {
        ...common,
        onAdd: (evt) => placeCard(evt.item, drop),
      });
    });

    // Alternativa sin arrastrar: tocar la tarjeta y después el destino
    pool.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card || card.classList.contains("locked")) return;
      if (selectedCard) selectedCard.classList.remove("selected");
      selectedCard = card === selectedCard ? null : card;
      if (selectedCard) selectedCard.classList.add("selected");
    });
    document.querySelectorAll("#buckets1 .bucket").forEach((b) => {
      const act = () => {
        if (!selectedCard) return;
        const card = selectedCard;
        card.classList.remove("selected");
        selectedCard = null;
        const drop = b.querySelector(".drop");
        drop.appendChild(card);
        placeCard(card, drop);
      };
      b.addEventListener("click", (e) => { if (!e.target.closest(".card")) act(); });
      b.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); act(); } });
    });
  }

  function placeCard(card, drop) {
    const st = STATEMENTS.find((x) => x.s === card.dataset.s);
    if (card.dataset.c === drop.dataset.c) {
      card.classList.add("locked");
      card.innerHTML = `${icon("check")} ${st.s}`;
      MS.refreshIcons();
      addScore(10, card);
      if (window.gsap) gsap.from(card, { scale: 0.6, duration: 0.35, ease: "back.out(2.5)" });
    } else {
      addScore(-2);
      MS.shake(drop.parentElement);
      MS.toast(`<strong>${st.s}</strong> no es ${drop.dataset.c}. ${st.why}`, "bad", 5200);
      const pool = $("#pool1");
      setTimeout(() => {
        pool.appendChild(card);
        if (window.gsap) gsap.from(card, { y: -20, opacity: 0, duration: 0.3 });
      }, 250);
    }
    const remaining = $("#pool1").querySelectorAll(".card:not(.locked)").length;
    // la tarjeta fallida vuelve al montón tras la animación
    const pending = card.classList.contains("locked") ? remaining : remaining + 1;
    if (pending === 0) {
      $("#next1").disabled = false;
      MS.toast("¡Nivel 1 completado! Todas las sentencias están en su sitio.", "ok");
      MS.confetti();
    }
  }

  /* ---------- Nivel 2: ordenar cláusulas ---------- */
  let doneA = false;
  let doneB = false;

  function fillOrderList(el, items) {
    let order = MS.shuffle(items);
    // evita empezar ya ordenado
    while (order.join("|") === items.join("|")) order = MS.shuffle(items);
    el.innerHTML = order.map((t) => `<li data-t="${MS.escapeHtml(t)}">${MS.escapeHtml(t)}<span class="grip">${icon("grip-vertical")}</span></li>`).join("");
    MS.refreshIcons();
    return new Sortable(el, { animation: 180 });
  }

  function checkOrder(listEl, expected) {
    const items = [...listEl.children];
    let ok = 0;
    items.forEach((li, i) => {
      const good = li.dataset.t === expected[i];
      li.classList.toggle("ok", good);
      li.classList.toggle("ko", !good);
      if (good) ok++;
    });
    return ok === expected.length;
  }

  async function showQueryResult() {
    const box = $("#result-a");
    try {
      const db = await MS.freshDB();
      const res = db.exec(CLAUSES.join("\n"))[0];
      db.close();
      box.innerHTML = `<p class="muted">Resultado de la consulta:</p>${MS.resultTable(res.columns, res.values)}`;
      if (window.gsap) gsap.from(box, { opacity: 0, y: 10, duration: 0.4 });
    } catch (e) {
      box.textContent = "";
    }
  }

  function setupLevel2() {
    const sa = fillOrderList($("#order-a"), CLAUSES);
    $("#check-a").addEventListener("click", () => {
      if (doneA) return;
      if (checkOrder($("#order-a"), CLAUSES)) {
        doneA = true;
        sa.option("disabled", true);
        $("#order-a").classList.add("done");
        $("#check-a").disabled = true;
        addScore(30, $("#check-a"));
        MS.toast("¡Consulta correcta! Así se escriben las cláusulas.", "ok");
        showQueryResult();
        $("#part-b").hidden = false;
        if (window.gsap) gsap.from("#part-b", { opacity: 0, y: 20, duration: 0.5 });
      } else {
        addScore(-2);
        MS.shake($("#order-a"));
        MS.toast("Aún no. Recuerda: SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY.", "bad");
      }
    });

    const sb = fillOrderList($("#order-b"), LOGICAL);
    $("#check-b").addEventListener("click", () => {
      if (doneB) return;
      if (checkOrder($("#order-b"), LOGICAL)) {
        doneB = true;
        sb.option("disabled", true);
        $("#order-b").classList.add("done");
        $("#check-b").disabled = true;
        addScore(30, $("#check-b"));
        MS.toast("¡Exacto! Primero se eligen las filas (FROM, WHERE), luego se agrupan y al final se proyecta y ordena.", "ok", 6000);
        $("#next2").disabled = false;
      } else {
        addScore(-2);
        MS.shake($("#order-b"));
        MS.toast("Pista: el SGBD necesita saber de qué tabla lee antes de filtrar, y no puede ordenar por un alias antes de calcularlo.", "bad", 6000);
      }
    });
  }

  /* ---------- Nivel 3: relacionar ---------- */
  let selExpr = null;
  let paired = 0;

  function setupLevel3() {
    $("#col-expr").innerHTML = MS.shuffle(PAIRS.map((p, i) => ({ ...p, i })))
      .map((p) => `<button class="m-item expr" type="button" data-i="${p.i}">${MS.escapeHtml(p.e)}</button>`).join("");
    $("#col-mean").innerHTML = MS.shuffle(PAIRS.map((p, i) => ({ ...p, i })))
      .map((p) => `<button class="m-item mean" type="button" data-i="${p.i}">${MS.escapeHtml(p.m)}</button>`).join("");

    $("#col-expr").addEventListener("click", (e) => {
      const b = e.target.closest(".m-item");
      if (!b || b.classList.contains("paired")) return;
      if (selExpr) selExpr.classList.remove("selected");
      selExpr = b === selExpr ? null : b;
      if (selExpr) selExpr.classList.add("selected");
    });
    $("#col-mean").addEventListener("click", (e) => {
      const b = e.target.closest(".m-item");
      if (!b || b.classList.contains("paired")) return;
      if (!selExpr) {
        MS.toast("Primero toca una expresión de la columna izquierda.", "info");
        return;
      }
      if (b.dataset.i === selExpr.dataset.i) {
        const color = PAIR_COLORS[paired % PAIR_COLORS.length];
        paired++;
        [selExpr, b].forEach((el) => {
          el.classList.remove("selected");
          el.classList.add("paired");
          el.style.setProperty("--pc", color);
          el.insertAdjacentHTML("beforeend", `<span class="tag">${paired}</span>`);
          if (window.gsap) gsap.fromTo(el, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: "back.out(2.5)" });
        });
        addScore(10, b);
        selExpr = null;
        if (paired === PAIRS.length) {
          $("#next3").disabled = false;
          MS.toast("¡Nivel 3 completado!", "ok");
          MS.confetti();
        }
      } else {
        addScore(-2);
        MS.shake(b);
        MS.shake(selExpr);
        MS.toast("Esa pareja no encaja. Fíjate en el operador.", "bad");
      }
    });
  }

  /* ---------- Llave y final ---------- */
  function setupKey() {
    $("#key-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const v = $("#key-input").value.trim();
      if (v === "2") {
        addScore(50, $("#key-input"));
        MS.setDigit(1, 2);
        MS.finishGame(1, score);
        finish();
      } else {
        addScore(-2);
        MS.shake($("#key-input"));
        MS.toast("No es correcto. Pista: el DCL sirve para conceder y retirar privilegios.", "bad");
      }
    });
  }

  function finish() {
    show("s-end", 5);
    MS.sound("win");
    MS.confetti();
    MS.countUp($("#final-score"), score);
    if (window.gsap && !MS.reducedMotion()) {
      gsap.from("#digit", { rotateY: 180, scale: 0.3, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
    }
  }

  $("#start").addEventListener("click", () => show("s-l1", 1));
  $("#next1").addEventListener("click", () => show("s-l2", 2));
  $("#next2").addEventListener("click", () => show("s-l3", 3));
  $("#next3").addEventListener("click", () => { show("s-key", 4); $("#key-input").focus(); });
  $("#again").addEventListener("click", () => location.reload());

  MS.renderHeader(1);
  MS.initParticles();
  setupLevel1();
  setupLevel2();
  setupLevel3();
  setupKey();
  MS.refreshIcons();
})();
