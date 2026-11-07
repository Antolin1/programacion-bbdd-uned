/* Misión SQL — lógica común: progreso, cabecera, efectos y base de datos */
(function () {
  "use strict";

  const SCRIPT_URL = document.currentScript.src;
  const ROOT = new URL("..", SCRIPT_URL).href;
  const STORE_KEY = "misionSQL.v1";
  const SQLJS_VERSION = "1.10.3";

  const GAMES = {
    1: { title: "Clasifica y ordena", path: "juego1/", icon: "puzzle", badge: "Clasificador", digits: [1] },
    2: { title: "¿Qué devuelve la consulta?", path: "juego2/", icon: "timer", badge: "Detective de consultas", digits: [2] },
    3: { title: "Terminal de la Cooperativa", path: "juego3/", icon: "terminal-square", badge: "Maestro del DML", digits: [3, 4] },
  };

  /* ---------- Estado persistente (solo en el navegador) ---------- */
  function emptyState() {
    return {
      team: "",
      games: { 1: null, 2: null, 3: null },
      digits: { 1: null, 2: null, 3: null, 4: null },
      badges: [],
      unlockAll: false,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return emptyState();
      return Object.assign(emptyState(), JSON.parse(raw));
    } catch (e) {
      return emptyState();
    }
  }

  let state = load();

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* sin almacenamiento */ }
  }

  function totalScore() {
    return Object.values(state.games).reduce((acc, g) => acc + (g ? g.best : 0), 0);
  }

  function isUnlocked(n) {
    if (state.unlockAll || n === 1) return true;
    return Boolean(state.games[n - 1]);
  }

  function setDigit(pos, value) {
    state.digits[pos] = value;
    save();
    renderHeader();
  }

  function finishGame(n, score) {
    const prev = state.games[n];
    state.games[n] = {
      best: Math.max(score, prev ? prev.best : 0),
      last: score,
      date: new Date().toISOString(),
    };
    const badge = GAMES[n].badge;
    if (!state.badges.includes(badge)) state.badges.push(badge);
    save();
    renderHeader();
  }

  function setTeam(name) {
    state.team = name.trim().slice(0, 40);
    save();
    renderHeader();
  }

  function resetAll() {
    state = emptyState();
    save();
    renderHeader();
  }

  function setUnlockAll(v) {
    state.unlockAll = v;
    save();
  }

  /* ---------- Iconos (Lucide) ---------- */
  function icon(name, cls) {
    return `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ""}></i>`;
  }

  function refreshIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  /* ---------- Cabecera común ---------- */
  function renderHeader(currentGame) {
    let bar = document.querySelector(".topbar");
    if (!bar) {
      bar = document.createElement("header");
      bar.className = "topbar";
      document.body.prepend(bar);
    }
    if (currentGame !== undefined) bar.dataset.game = currentGame;
    const d = state.digits;
    const digits = [1, 2, 3, 4]
      .map((i) => `<span class="${d[i] !== null ? "on" : ""}">${d[i] !== null ? d[i] : "·"}</span>`)
      .join("");
    bar.innerHTML = `
      <div class="container">
        <a class="brand" href="${ROOT}">
          <span class="logo">${icon("citrus")}</span><span class="txt">Misión SQL</span>
        </a>
        <span class="spacer"></span>
        <span class="chip" title="Equipo">${icon("users")} ${escapeHtml(state.team || "Sin equipo")}</span>
        <span class="chip score" title="Puntos totales (mejor partida de cada juego)">${icon("star")} ${totalScore()}</span>
        <span class="chip" title="Dígitos de la caja fuerte">${icon("key-round")}<span class="mini-digits">${digits}</span></span>
        ${bar.dataset.game ? `<a class="btn ghost small" href="${ROOT}">${icon("map")} Mapa</a>` : ""}
      </div>`;
    refreshIcons();
  }

  /* ---------- Utilidades ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalize(s) {
    return String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- Tostadas y modales ---------- */
  function toast(html, type = "info", ms = 4200) {
    let box = document.getElementById("toasts");
    if (!box) {
      box = document.createElement("div");
      box.id = "toasts";
      box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    const ic = { ok: "check-circle-2", bad: "x-circle", info: "info" }[type] || "info";
    el.innerHTML = `${icon(ic)}<div>${html}</div>`;
    box.appendChild(el);
    refreshIcons();
    if (window.gsap) gsap.from(el, { x: 60, opacity: 0, duration: 0.35, ease: "back.out(1.7)" });
    setTimeout(() => {
      if (window.gsap) gsap.to(el, { x: 60, opacity: 0, duration: 0.3, onComplete: () => el.remove() });
      else el.remove();
    }, ms);
  }

  function modal(html) {
    const back = document.createElement("div");
    back.className = "modal-back";
    back.innerHTML = `<div class="modal" role="dialog" aria-modal="true">
      <button class="btn ghost small close" aria-label="Cerrar">${icon("x")}</button>${html}</div>`;
    const close = () => back.remove();
    back.addEventListener("click", (e) => { if (e.target === back) close(); });
    back.querySelector(".close").addEventListener("click", close);
    document.addEventListener("keydown", function esc(e) {
      if (e.key === "Escape") { close(); document.removeEventListener("keydown", esc); }
    });
    document.body.appendChild(back);
    refreshIcons();
    if (window.gsap) gsap.from(back.querySelector(".modal"), { y: 30, scale: 0.96, opacity: 0, duration: 0.3, ease: "power3.out" });
    return { el: back, close };
  }

  /* ---------- Efectos ---------- */
  function confettiBurst(opts = {}) {
    if (!window.confetti || reducedMotion()) return;
    const colors = ["#f4c430", "#d9691c", "#3f8a32", "#7fb24a", "#c4432c"];
    if (opts.small) {
      confetti({ particleCount: 40, spread: 55, startVelocity: 28, origin: opts.origin || { y: 0.7 }, colors, scalar: 0.8 });
      return;
    }
    const end = Date.now() + 1200;
    (function frame() {
      confetti({ particleCount: 6, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 6, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }

  function originOf(el) {
    const r = el.getBoundingClientRect();
    return { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight };
  }

  let audioCtx = null;
  function sound(kind) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = {
        ok: [[660, 0], [880, 0.08]],
        bad: [[220, 0], [160, 0.1]],
        tick: [[1200, 0]],
        win: [[523, 0], [659, 0.12], [784, 0.24], [1047, 0.36]],
      }[kind] || [[440, 0]];
      notes.forEach(([f, t]) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = kind === "bad" ? "sawtooth" : "triangle";
        o.frequency.value = f;
        const start = audioCtx.currentTime + t;
        g.gain.setValueAtTime(kind === "tick" ? 0.03 : 0.08, start);
        g.gain.exponentialRampToValueAtTime(0.0001, start + (kind === "tick" ? 0.05 : 0.22));
        o.connect(g).connect(audioCtx.destination);
        o.start(start);
        o.stop(start + 0.25);
      });
    } catch (e) { /* audio no disponible */ }
  }

  function shakeEl(el) {
    el.classList.remove("shake");
    void el.offsetWidth;
    el.classList.add("shake");
  }

  function countUp(el, to, duration = 1.2) {
    if (!window.gsap || reducedMotion()) { el.textContent = to; return; }
    const o = { v: 0 };
    gsap.to(o, { v: to, duration, ease: "power2.out", onUpdate: () => { el.textContent = Math.round(o.v); } });
  }

  function initParticles() {
    if (!window.tsParticles || reducedMotion()) return;
    let host = document.getElementById("particles");
    if (!host) {
      host = document.createElement("div");
      host.id = "particles";
      document.body.prepend(host);
    }
    tsParticles.load("particles", {
      fpsLimit: 60,
      particles: {
        // Pétalos de azahar y hojas que caen despacio, como en los huertos de limoneros
        number: { value: 28, density: { enable: true, area: 1000 } },
        color: { value: ["#ffffff", "#fff4c2", "#f4c430", "#7fb24a"] },
        shape: { type: "ellipse" },
        stroke: { width: 1, color: "#e6d3a8" },
        move: { enable: true, speed: 0.7, direction: "bottom-right", drift: 0.4, outModes: { default: "out" } },
        rotate: { value: { min: 0, max: 360 }, animation: { enable: true, speed: 6 } },
        wobble: { enable: true, distance: 6, speed: 4 },
        opacity: { value: { min: 0.5, max: 0.9 } },
        size: { value: { min: 3, max: 6 } },
      },
      detectRetina: true,
    });
  }

  /* ---------- Base de datos (sql.js / SQLite en WebAssembly) ---------- */
  let sqlModulePromise = null;
  let sqlScriptPromise = null;

  function loadSqlModule() {
    if (!sqlModulePromise) {
      if (typeof window.initSqlJs !== "function") {
        return Promise.reject(new Error("No se ha cargado sql.js"));
      }
      sqlModulePromise = window.initSqlJs({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/${f}`,
      });
    }
    return sqlModulePromise;
  }

  function loadSqlScript() {
    if (!sqlScriptPromise) {
      sqlScriptPromise = fetch(new URL("data/cooperativa.sql", ROOT)).then((r) => {
        if (!r.ok) throw new Error("No se ha podido cargar data/cooperativa.sql");
        return r.text();
      });
    }
    return sqlScriptPromise;
  }

  // Devuelve una base de datos nueva con los datos originales de la cooperativa
  async function freshDB() {
    const [SQL, script] = await Promise.all([loadSqlModule(), loadSqlScript()]);
    const db = new SQL.Database();
    db.exec(script);
    db.run("PRAGMA foreign_keys = ON;");
    return db;
  }

  function resultTable(columns, rows) {
    const head = columns.map((c) => `<th>${escapeHtml(c)}</th>`).join("");
    const body = rows.length
      ? rows.map((r) => `<tr>${r.map((v) => `<td>${v === null ? '<span class="muted">NULL</span>' : escapeHtml(formatValue(v))}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${columns.length}" class="muted">(ninguna fila)</td></tr>`;
    return `<div class="table-wrap"><table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function formatValue(v) {
    if (typeof v === "number" && !Number.isInteger(v)) return Math.round(v * 100) / 100;
    return v;
  }

  async function tablesHtml() {
    const db = await freshDB();
    const parts = ["socio", "producto", "entrega"].map((t) => {
      const res = db.exec(`SELECT * FROM ${t}`)[0];
      return `<div><h4>${t}</h4>${resultTable(res.columns, res.values)}</div>`;
    });
    db.close();
    return `<div class="tables-grid">${parts.join("")}</div>`;
  }

  async function showTables() {
    const m = modal(`<h2>${icon("table-2")} Base de datos <span class="mono">cooperativa</span></h2>
      <p class="muted">Socios, productos y entregas de la Cooperativa Huerta de Murcia.</p><div class="tables-slot">Cargando…</div>`);
    try {
      m.el.querySelector(".tables-slot").innerHTML = await tablesHtml();
    } catch (e) {
      m.el.querySelector(".tables-slot").textContent = e.message;
    }
  }

  window.MS = {
    ROOT, GAMES,
    get state() { return state; },
    save, totalScore, isUnlocked, setDigit, finishGame, setTeam, resetAll, setUnlockAll,
    icon, refreshIcons, renderHeader,
    escapeHtml, shuffle, normalize, reducedMotion,
    toast, modal, confetti: confettiBurst, originOf, sound, shake: shakeEl, countUp, initParticles,
    freshDB, resultTable, showTables, formatValue,
  };
})();
