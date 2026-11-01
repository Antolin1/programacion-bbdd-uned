/* Misión SQL — presentación interactiva (Reveal.js)
   Lee el progreso que guardan los juegos (localStorage, misma clave que common.js), ejecuta las
   consultas de las diapositivas sobre la base de datos cooperativa (sql.js) y valida la caja fuerte. */
(function () {
  "use strict";

  const STORE_JUEGOS = "misionSQL.v1";      // la escriben los juegos
  const STORE_PRES = "misionSQL.pres.v1";   // solo esta presentación: caja abierta y autoevaluación
  const CODIGO = atob("MjkzMQ==");          // código de la caja fuerte (dígitos 1 a 4)

  /* ---------- Almacenamiento (siempre se lee del disco: los juegos se abren en otra pestaña) ---------- */
  function leer(clave, vacio) {
    try { return Object.assign(vacio, JSON.parse(localStorage.getItem(clave) || "{}")); } catch (e) { return vacio; }
  }
  const progreso = () => leer(STORE_JUEGOS, { team: "", games: {}, digits: {}, badges: [] });
  const local = () => leer(STORE_PRES, { abierta: false, auto: {} });
  function guardarLocal(o) { try { localStorage.setItem(STORE_PRES, JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ } }

  function guardarEquipo(nombre) {
    // Se lee y escribe el estado completo para no pisar los dígitos o puntos que hayan guardado los juegos.
    let o = {};
    try { o = JSON.parse(localStorage.getItem(STORE_JUEGOS) || "{}"); } catch (e) { o = {}; }
    o.team = nombre.trim().slice(0, 40);
    try { localStorage.setItem(STORE_JUEGOS, JSON.stringify(o)); } catch (e) { /* sin almacenamiento */ }
  }

  const puntos = (p) => Object.values(p.games || {}).reduce((a, g) => a + (g && g.best ? g.best : 0), 0);
  const esc = (s) => MS.escapeHtml(s);

  /* ---------- Progreso visible: llaves, resumen del equipo e insignias ---------- */
  function pintarProgreso() {
    const p = progreso();
    document.querySelectorAll(".llave[data-digit]").forEach((el) => {
      const v = p.digits ? p.digits[el.dataset.digit] : null;
      const tiene = v !== null && v !== undefined;
      el.textContent = tiene ? v : "?";
      el.classList.toggle("ok", tiene);
    });
    const mini = document.getElementById("mini-digitos");
    if (mini) {
      mini.innerHTML = [1, 2, 3, 4].map((i) => {
        const v = p.digits ? p.digits[i] : null;
        const tiene = v !== null && v !== undefined;
        return `<span class="${tiene ? "on" : ""}">${tiene ? v : "·"}</span>`;
      }).join("");
    }
    const nombre = document.getElementById("nombre-equipo");
    if (nombre && document.activeElement !== nombre) nombre.value = p.team || "";
    const res = document.getElementById("resumen-equipo");
    if (res) {
      const ins = (p.badges || []).map((b) => `<span class="pill v">${esc(b)}</span>`).join("") || '<span class="muted">Aún sin insignias</span>';
      res.innerHTML = `<div><b>${esc(p.team || "Equipo sin nombre")}</b> · <b>${puntos(p)}</b> puntos</div><div>${ins}</div>`;
    }
    const insignias = document.getElementById("insignias");
    if (insignias) {
      insignias.innerHTML = (p.badges || []).map((b) => `<span class="pill v" style="font-size:28px;padding:4px 20px;margin:4px">${esc(b)}</span>`).join("")
        || '<span class="muted">Juega para ganar insignias</span>';
      const pf = document.getElementById("puntos-finales");
      if (pf) pf.innerHTML = `<b>${esc(p.team || "Tu equipo")}</b> · <b>${puntos(p)}</b> puntos`;
    }
  }

  /* ---------- Consultas ejecutables ---------- */
  function crearRunners(raiz) {
    raiz.querySelectorAll("pre > code.language-sql, pre > code.sql").forEach((code) => {
      const lineas = code.textContent.replace(/\s+$/, "").split("\n");
      const marca = /^--run(?:\s+after:\s*(.+))?\s*$/i.exec(lineas[0]);
      if (!marca) return;
      const sql = lineas.slice(1).join("\n");
      const r = document.createElement("div");
      r.className = "runner";
      r.dataset.after = marca[1] || "";
      r.innerHTML = `<textarea spellcheck="false" wrap="off" aria-label="Consulta SQL editable"></textarea>
        <div class="runner-bar"><button class="btn orange small" type="button">▶ Ejecutar</button>
        <button class="btn ghost small" type="button">↺ Original</button><span class="hint">Edítala y pulsa Ctrl+Intro</span></div>
        <div class="runner-out"></div>`;
      const ta = r.querySelector("textarea");
      ta.value = sql;
      ta.dataset.original = sql;
      const ajustar = () => { ta.style.height = "auto"; ta.style.height = ta.scrollHeight + 4 + "px"; };
      ta.addEventListener("input", ajustar);
      ta.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); ejecutar(r); }
      });
      const [bRun, bReset] = r.querySelectorAll(".runner-bar .btn");
      bRun.addEventListener("click", () => ejecutar(r));
      bReset.addEventListener("click", () => { ta.value = ta.dataset.original; ajustar(); ejecutar(r); });
      code.parentElement.replaceWith(r);
      r.ajustar = ajustar;
    });
  }

  async function ejecutar(r) {
    const ta = r.querySelector("textarea");
    const out = r.querySelector(".runner-out");
    out.innerHTML = '<p class="muted">Ejecutando…</p>';
    let db;
    try {
      db = await MS.freshDB();
      // SQLite escribe BEGIN donde MySQL escribe START TRANSACTION
      const res = db.exec(ta.value.replace(/\bSTART\s+TRANSACTION\b/gi, "BEGIN"));
      let html = "";
      if (res.length) {
        const ult = res[res.length - 1];
        html += MS.resultTable(ult.columns, ult.values);
        html += `<p class="muted">${ult.values.length} fila${ult.values.length === 1 ? "" : "s"}</p>`;
      } else {
        const n = db.getRowsModified();
        html += `<p class="ok-msg">✓ Sentencia ejecutada${n ? ` · ${n} fila${n === 1 ? "" : "s"} modificada${n === 1 ? "" : "s"}` : ""}.</p>`;
      }
      if (r.dataset.after) {
        const a = db.exec(r.dataset.after);
        if (a.length) html += `<p class="muted">Así queda después:</p>` + MS.resultTable(a[0].columns, a[0].values);
      }
      out.innerHTML = html;
    } catch (e) {
      out.innerHTML = `<p class="err-msg">✗ ${esc(e.message)}</p>`;
    } finally {
      if (db) db.close();
    }
  }

  // La primera vez que se muestra una diapositiva se ejecutan sus consultas, para ver el resultado ya
  function autoejecutar(slide) {
    if (!slide || slide.dataset.ejecutada) return;
    slide.dataset.ejecutada = "1";
    slide.querySelectorAll(".runner").forEach((r) => { if (r.ajustar) r.ajustar(); ejecutar(r); });
  }

  /* ---------- Caja fuerte ---------- */
  function iniciarCaja() {
    const teclado = document.getElementById("teclado");
    if (!teclado) return;
    const visor = document.getElementById("visor");
    const msg = document.getElementById("caja-msg");
    const mensajeInicial = msg.innerHTML;
    let entrada = [];

    const pintar = () => visor.querySelectorAll("span").forEach((s, i) => { s.textContent = entrada[i] || ""; });
    const aviso = (txt, tipo) => { msg.innerHTML = txt; msg.className = "s " + (tipo || ""); };

    ["1", "2", "3", "4", "5", "⌫", "6", "7", "8", "9", "0", "✓"].forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = k;
      if (k === "✓") b.className = "ok";
      b.addEventListener("click", () => pulsar(k));
      teclado.appendChild(b);
    });

    function pulsar(k) {
      if (document.body.classList.contains("caja-abierta")) return;
      if (/^\d$/.test(k)) { if (entrada.length < 4) entrada.push(k); aviso(mensajeInicial); }
      else if (k === "⌫") entrada.pop();
      else if (k === "✓") return validar();
      pintar();
    }

    function validar() {
      if (entrada.length < 4) { aviso("Faltan dígitos: el código tiene <b>cuatro</b>.", "bad"); return; }
      const bien = entrada.every((d, i) => d === CODIGO[i]);
      if (bien) return abrir();
      MS.sound("bad");
      visor.classList.remove("shake"); void visor.offsetWidth; visor.classList.add("shake");
      const i = entrada.findIndex((d, j) => d !== CODIGO[j]);
      const juego = i === 0 ? 1 : i === 1 ? 2 : 3;
      aviso(`La caja no se abre. Pista: revisa la llave del <b>juego ${juego}</b>.`, "bad");
    }

    function abrir() {
      const l = local(); l.abierta = true; guardarLocal(l);
      document.body.classList.add("caja-abierta");
      aviso("🔓 ¡La caja fuerte se abre!", "good");
      MS.sound("win");
      MS.confetti();
      setTimeout(() => Reveal.next(), 1600);
    }

    document.getElementById("usar-digitos").addEventListener("click", () => {
      const d = progreso().digits || {};
      const faltan = [1, 2, 3, 4].filter((i) => d[i] === null || d[i] === undefined);
      if (faltan.length) { aviso(`Aún te faltan los dígitos ${faltan.join(", ")}: supera los juegos para conseguirlos.`, "bad"); return; }
      entrada = [1, 2, 3, 4].map((i) => String(d[i]));
      pintar();
      aviso("Dígitos cargados. Pulsa ✓ para abrir.");
    });

    // Teclado físico mientras la caja fuerte es la diapositiva actual
    document.addEventListener("keydown", (e) => {
      const actual = Reveal.getCurrentSlide();
      if (!actual || !actual.classList.contains("caja-fuerte")) return;
      if (/^\d$/.test(e.key)) pulsar(e.key);
      else if (e.key === "Backspace") pulsar("⌫");
      else if (e.key === "Enter") pulsar("✓");
    });

    if (document.body.classList.contains("caja-abierta")) aviso("🔓 La caja fuerte ya está abierta.", "good");
  }

  /* ---------- Autoevaluación (se recuerda en el navegador) ---------- */
  function iniciarAutoevaluacion() {
    const cajas = document.querySelectorAll(".autoeval input[type=checkbox]");
    if (!cajas.length) return;
    const l = local();
    const barra = document.getElementById("barra-auto");
    const pintar = () => {
      const n = [...cajas].filter((c) => c.checked).length;
      barra.style.width = (100 * n / cajas.length) + "%";
    };
    cajas.forEach((c) => {
      c.checked = Boolean(l.auto[c.dataset.k]);
      c.addEventListener("change", () => {
        const o = local(); o.auto[c.dataset.k] = c.checked; guardarLocal(o);
        pintar();
        if ([...cajas].every((x) => x.checked)) { MS.confetti({ small: true }); MS.sound("ok"); }
      });
    });
    pintar();
  }

  /* ---------- Botones sueltos ---------- */
  function iniciarBotones() {
    document.querySelectorAll(".ver-tablas").forEach((b) => b.addEventListener("click", () => MS.showTables()));
    document.querySelectorAll(".solucion").forEach((b) => b.addEventListener("click", () => {
      b.parentElement.querySelector(".sol-out").textContent = b.dataset.sol;
    }));
    const form = document.getElementById("form-equipo");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      guardarEquipo(document.getElementById("nombre-equipo").value);
      pintarProgreso();
      MS.toast("Equipo guardado", "ok", 1800);
    });
    // Las llaves y el progreso se actualizan al volver de un juego
    window.addEventListener("focus", pintarProgreso);
    window.addEventListener("storage", pintarProgreso);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) pintarProgreso(); });
  }

  /* ---------- Reveal ---------- */
  function marcarFragmentos() {
    document.querySelectorAll(".pasos-fr").forEach((cont) => {
      [...cont.children].filter((c) => !c.classList.contains("f")).forEach((c) => c.classList.add("fragment"));
    });
  }

  function alCambiar(e) {
    const s = e.currentSlide;
    const cl = s.classList;
    document.body.classList.toggle("fondo-verde", cl.contains("bloque"));
    document.body.classList.toggle("es-portada", cl.contains("portada"));
    autoejecutar(s);
    pintarProgreso();
    if (cl.contains("victoria") && document.body.classList.contains("caja-abierta")) { MS.confetti(); MS.sound("win"); }
  }

  Reveal.initialize({
    width: 1280, height: 720, margin: 0, minScale: 0.2, maxScale: 2,
    center: false, hash: true, slideNumber: "c/t", controls: true, progress: true,
    transition: "slide", transitionSpeed: "default", fragments: true,
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes],
  }).then(() => {
    if (local().abierta) document.body.classList.add("caja-abierta");
    crearRunners(document.querySelector(".reveal .slides"));
    marcarFragmentos();
    Reveal.sync();
    iniciarBotones();
    iniciarCaja();
    iniciarAutoevaluacion();
    if (window.lucide) lucide.createIcons();
    MS.initParticles();
    pintarProgreso();
    Reveal.on("slidechanged", alCambiar);
    alCambiar({ currentSlide: Reveal.getCurrentSlide() });
  });
})();
