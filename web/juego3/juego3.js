/* Juego 3: Terminal de la Cooperativa */
(function () {
  "use strict";
  const { icon } = MS;
  const $ = (s) => document.querySelector(s);
  const INCS = window.INCIDENCIAS;
  const STORE_KEY = "misionSQL.juego3";
  const BASE = 500;
  const HINT_COST = 100;
  const FAIL_COST = 25;
  const MIN_POINTS = 150;

  const SCHEMA = {
    socio: [["id_socio", "pk"], ["nombre"], ["municipio"], ["fecha_alta"]],
    producto: [["id_producto", "pk"], ["nombre"], ["categoria"], ["precio_kg"]],
    entrega: [["id_entrega", "pk"], ["id_socio", "fk"], ["id_producto", "fk"], ["fecha"], ["kilos"]],
  };

  /* ---------- Progreso propio del juego ---------- */
  function emptyProgress() {
    return { current: 0, incs: {} };
  }
  function loadProgress() {
    try { return Object.assign(emptyProgress(), JSON.parse(localStorage.getItem(STORE_KEY)) || {}); } catch (e) { return emptyProgress(); }
  }
  let progress = loadProgress();
  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* sin almacenamiento */ }
  }
  function incState(id) {
    if (!progress.incs[id]) progress.incs[id] = { solved: false, hints: 0, fails: 0, points: 0, code: null };
    return progress.incs[id];
  }
  function totalPoints() {
    return INCS.reduce((acc, inc) => acc + (incState(inc.id).solved ? incState(inc.id).points : 0), 0);
  }
  function solvedCount() {
    return INCS.filter((inc) => incState(inc.id).solved).length;
  }
  function isOpen(i) {
    return i === 0 || incState(INCS[i - 1].id).solved || incState(INCS[i].id).solved;
  }

  /* ---------- Ejecución de SQL ---------- */
  // SQLite no entiende START TRANSACTION (MySQL): se traduce a BEGIN TRANSACTION
  function adapt(code) {
    return code.replace(/\bSTART\s+TRANSACTION\b/gi, "BEGIN TRANSACTION");
  }

  function runScript(db, code) {
    const results = [];
    let error = null;
    try {
      for (const stmt of db.iterateStatements(adapt(code))) {
        const sql = stmt.getSQL().trim();
        const columns = stmt.getColumnNames();
        if (columns.length) {
          const rows = [];
          while (stmt.step()) rows.push(stmt.get());
          results.push({ sql, columns, rows });
        } else {
          stmt.step();
          const dml = /^\s*(INSERT|UPDATE|DELETE|REPLACE)\b/i.test(sql);
          results.push({ sql, modified: dml ? db.getRowsModified() : null });
        }
      }
    } catch (e) {
      error = e.message;
    }
    return { results, error };
  }

  function transactionOpen(db) {
    try {
      db.exec("BEGIN");
      db.exec("ROLLBACK");
      return false;
    } catch (e) {
      return true;
    }
  }

  /* ---------- Interfaz ---------- */
  let editor = null;
  let workDB = null;
  let current = 0;
  let loaded = null; // incidencia cuyo código está ahora en el editor

  function setScore() {
    $("#score").textContent = totalPoints();
    $("#solved").textContent = solvedCount();
  }

  function renderList() {
    $("#inc-list").innerHTML = INCS.map((inc, i) => {
      const st = incState(inc.id);
      const open = isOpen(i);
      const cls = [i === current ? "current" : "", st.solved ? "solved" : ""].join(" ");
      const stIcon = st.solved ? icon("check-circle-2") : open ? icon("circle-dot") : icon("lock");
      return `<li><button class="${cls}" data-i="${i}" ${open ? "" : "disabled"}>
          <span class="n">${i + 1}</span><span>${inc.title}</span><span class="st">${stIcon}</span></button></li>`;
    }).join("");
    $("#inc-list").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => selectInc(Number(b.dataset.i))));
    MS.refreshIcons();
  }

  function renderSchema() {
    $("#schema").innerHTML = Object.entries(SCHEMA).map(([t, cols]) => `
      <div class="schema-table">
        <button class="t" data-ins="${t}">${icon("table-2")} ${t}</button>
        <div class="cols">${cols.map(([c, k]) => `<button class="${k || ""}" data-ins="${c}" title="${k === "pk" ? "Clave primaria" : k === "fk" ? "Clave ajena" : ""}">${c}</button>`).join("")}</div>
      </div>`).join("");
    $("#schema").addEventListener("click", (e) => {
      const b = e.target.closest("[data-ins]");
      if (!b || !editor) return;
      editor.replaceSelection(b.dataset.ins);
      editor.focus();
    });
    MS.refreshIcons();
  }

  function renderCard() {
    const inc = INCS[current];
    const st = incState(inc.id);
    const shownHints = inc.hints.slice(0, st.hints)
      .map((h) => `<div class="h">${icon("lightbulb")}<div>${h}</div></div>`).join("");
    const digit = inc.digit ? `<p class="digit-tag">${icon("key-round")} Esta incidencia revela el dígito ${inc.digit.pos} de la caja fuerte.</p>` : "";
    const solved = st.solved ? `<p class="digit-tag" style="color:var(--green)">${icon("check-circle-2")} Resuelta · ${st.points} puntos</p>` : "";
    $("#inc-card").innerHTML = `
      <div class="title"><div class="ic">${icon(inc.icon)}</div>
        <div><div class="kicker">Incidencia ${current + 1} de ${INCS.length}</div><h2>${inc.title}</h2></div></div>
      <div class="story">${inc.story}</div>
      <p class="task">${inc.task}</p>
      ${digit}${solved}
      <div class="hints-box">${shownHints}</div>`;
    const badge = $("#mode-badge");
    badge.className = `mode-badge ${inc.mode}`;
    badge.textContent = inc.mode === "guiado" ? "Modo guiado · completa los huecos" : "Modo libre";
    const left = inc.hints.length - st.hints;
    $("#hint-left").textContent = `(${left})`;
    $("#hint").disabled = left === 0 || st.solved;
    MS.refreshIcons();
    if (window.gsap && !MS.reducedMotion()) gsap.from("#inc-card", { y: 16, opacity: 0, duration: 0.4, ease: "power3.out" });
  }

  function selectInc(i) {
    if (!isOpen(i)) return;
    saveCode();
    current = i;
    progress.current = i;
    saveProgress();
    const st = incState(INCS[i].id);
    editor.setValue(st.code !== null ? st.code : INCS[i].template);
    editor.clearHistory();
    loaded = i;
    renderList();
    renderCard();
    $("#output").innerHTML = '<p class="muted">Aquí aparecerán los resultados de tus sentencias.</p>';
    setTimeout(() => editor.refresh(), 0);
  }

  function saveCode() {
    if (!editor || loaded === null) return;
    incState(INCS[loaded].id).code = editor.getValue();
    saveProgress();
  }

  function renderOutput(run, verdict) {
    let html = "";
    if (verdict) {
      const cls = verdict.ok ? "ok" : verdict.partial ? "partial" : "bad";
      const ic = verdict.ok ? "badge-check" : verdict.partial ? "circle-alert" : "x-circle";
      html += `<div class="verdict ${cls}">${icon(ic)}<div>${verdict.msg}</div></div>`;
    }
    run.results.forEach((r) => {
      html += `<div class="out-block"><div class="out-sql">${MS.escapeHtml(r.sql)}</div>`;
      if (r.columns) html += MS.resultTable(r.columns, r.rows);
      else if (r.modified !== null) html += `<div class="out-msg ok">${icon("pencil")} ${r.modified} fila${r.modified === 1 ? "" : "s"} afectada${r.modified === 1 ? "" : "s"}</div>`;
      else html += `<div class="out-msg ok">${icon("check")} OK</div>`;
      html += "</div>";
    });
    if (run.error) html += `<div class="out-error">${icon("octagon-alert")}<div>Error: ${MS.escapeHtml(run.error)}</div></div>`;
    if (!run.results.length && !run.error && !verdict) html += '<p class="muted">No hay sentencias que ejecutar.</p>';
    $("#output").innerHTML = html;
    MS.refreshIcons();
    if (window.gsap && !MS.reducedMotion()) gsap.from("#output > *", { y: 10, opacity: 0, stagger: 0.05, duration: 0.3 });
  }

  async function runWork() {
    saveCode();
    if (!workDB) workDB = await MS.freshDB();
    const run = runScript(workDB, editor.getValue());
    renderOutput(run);
    if (run.error) MS.sound("bad");
  }

  async function check() {
    saveCode();
    const inc = INCS[current];
    const st = incState(inc.id);
    const code = editor.getValue();
    const db = await MS.freshDB();
    const run = runScript(db, code);
    let verdict;
    if (/_{3,}/.test(code)) {
      verdict = { ok: false, msg: "Todavía quedan huecos <code>______</code> por completar." };
    } else if (run.error) {
      verdict = { ok: false, msg: `Tu SQL ha dado un error. Revísalo antes de comprobar.` };
    } else {
      try {
        verdict = inc.check({ db, results: run.results, code, txOpen: transactionOpen(db) });
      } catch (e) {
        verdict = { ok: false, msg: `No se ha podido comprobar: ${MS.escapeHtml(e.message)}` };
      }
    }
    db.close();

    if (verdict.ok && !st.solved) {
      st.solved = true;
      st.points = Math.max(MIN_POINTS, BASE - st.hints * HINT_COST - st.fails * FAIL_COST);
      saveProgress();
      renderOutput(run, { ok: true, msg: `${verdict.msg} <strong>+${st.points} puntos</strong>` });
      MS.sound("ok");
      MS.confetti({ small: true, origin: MS.originOf($("#check")) });
      if (inc.digit) revealDigit(inc.digit);
      afterSolve();
    } else if (verdict.ok) {
      renderOutput(run, verdict);
    } else {
      if (!st.solved) {
        st.fails++;
        saveProgress();
      }
      renderOutput(run, verdict);
      MS.sound("bad");
      MS.shake($("#output"));
    }
    setScore();
    renderList();
    renderCard();
  }

  function revealDigit(d) {
    MS.setDigit(d.pos, d.value);
    MS.sound("win");
    MS.confetti();
    const m = MS.modal(`<div class="center-card" style="margin:10px auto">
        <h2>${icon("key-round")} ¡Dígito ${d.pos} desbloqueado!</h2>
        <div class="digit-reveal" id="modal-digit">${d.value}</div>
        <p class="muted">Ya aparece en la caja fuerte del mapa.</p></div>`);
    if (window.gsap && !MS.reducedMotion()) {
      gsap.from(m.el.querySelector("#modal-digit"), { rotateY: 180, scale: 0.3, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
    }
  }

  function afterSolve() {
    if (solvedCount() === INCS.length) {
      setTimeout(finish, 1600);
      return;
    }
    const next = INCS.findIndex((inc) => !incState(inc.id).solved);
    if (next >= 0) {
      setTimeout(() => MS.toast(`Siguiente incidencia desbloqueada: <strong>${INCS[next].title}</strong>`, "ok"), 600);
    }
  }

  function finish() {
    const total = totalPoints();
    MS.finishGame(3, total);
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $("#s-end").classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    MS.sound("win");
    MS.confetti();
    MS.countUp($("#final-score"), total);
    const d = MS.state.digits;
    const code = [1, 2, 3, 4].map((i) => (d[i] !== null ? d[i] : "?")).join(" ");
    $("#final-code").innerHTML = `${icon("vault")} Código reunido hasta ahora: <strong class="mono">${code}</strong>. Introducidlo en la caja fuerte de la presentación.`;
    MS.refreshIcons();
    if (window.gsap && !MS.reducedMotion()) {
      gsap.from("#s-end .digit-reveal", { rotateY: 180, scale: 0.3, opacity: 0, stagger: 0.2, duration: 1, ease: "elastic.out(1, 0.5)" });
    }
  }

  function useHint() {
    const inc = INCS[current];
    const st = incState(inc.id);
    if (st.solved || st.hints >= inc.hints.length) return;
    st.hints++;
    saveProgress();
    renderCard();
    MS.toast(`Pista desbloqueada (−${HINT_COST} puntos si resuelves esta incidencia).`, "info");
  }

  function exportSolutions() {
    saveCode();
    const team = MS.state.team || "equipo";
    const parts = INCS.map((inc, i) => {
      const st = incState(inc.id);
      const code = st.code !== null ? st.code : "-- (sin empezar)";
      return `-- ===============================================\n-- Incidencia ${i + 1}: ${inc.title} ${st.solved ? "(resuelta)" : "(pendiente)"}\n-- ===============================================\n${code.trim()}\n`;
    });
    const text = `-- Misión SQL · Juego 3 · Soluciones de ${team}\n-- ${new Date().toLocaleString("es-ES")}\n\n${parts.join("\n")}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `mision-sql-soluciones-${MS.normalize(team).replace(/[^a-z0-9]+/g, "-")}.sql`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  function setupEditor() {
    const hintTables = {};
    Object.entries(SCHEMA).forEach(([t, cols]) => { hintTables[t] = cols.map(([c]) => c); });
    editor = CodeMirror.fromTextArea($("#editor"), {
      mode: "text/x-sql",
      theme: "dracula",
      lineNumbers: true,
      matchBrackets: true,
      indentUnit: 2,
      lineWrapping: true,
      extraKeys: {
        "Ctrl-Enter": runWork,
        "Cmd-Enter": runWork,
        "Ctrl-Space": "autocomplete",
      },
      hintOptions: { tables: hintTables, completeSingle: false },
    });
    editor.on("inputRead", (cm, change) => {
      if (/^[a-zA-Z_.]$/.test(change.text[0])) cm.showHint({ completeSingle: false });
    });
    let t = null;
    editor.on("change", () => { clearTimeout(t); t = setTimeout(saveCode, 600); });
  }

  async function enter() {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $("#s-term").classList.add("active");
    if (!editor) setupEditor();
    current = Math.min(progress.current || 0, INCS.length - 1);
    if (!isOpen(current)) current = 0;
    selectInc(current);
    setScore();
    try {
      workDB = await MS.freshDB();
    } catch (e) {
      MS.toast(`No se ha podido cargar la base de datos: ${MS.escapeHtml(e.message)}`, "bad", 8000);
    }
  }

  $("#start").addEventListener("click", enter);
  $("#run").addEventListener("click", runWork);
  $("#check").addEventListener("click", check);
  $("#hint").addEventListener("click", useHint);
  $("#tables-btn").addEventListener("click", MS.showTables);
  $("#reset-db").addEventListener("click", async () => {
    if (workDB) workDB.close();
    workDB = await MS.freshDB();
    MS.toast("Base de datos de trabajo restaurada con los datos originales.", "info");
    $("#output").innerHTML = '<p class="muted">Base de datos reiniciada.</p>';
  });
  $("#reset-code").addEventListener("click", () => {
    if (confirm("¿Volver a la plantilla inicial? Se perderá el código de esta incidencia.")) {
      editor.setValue(INCS[current].template);
      saveCode();
    }
  });
  $("#export").addEventListener("click", exportSolutions);
  $("#export-end").addEventListener("click", exportSolutions);
  $("#again").addEventListener("click", () => {
    if (confirm("¿Empezar de nuevo el juego 3? Se borrará el progreso de las incidencias.")) {
      progress = emptyProgress();
      saveProgress();
      location.reload();
    }
  });

  MS.renderHeader(3);
  MS.initParticles();
  renderSchema();
  setScore();
  MS.refreshIcons();
})();
