/* Juego 2: ¿Qué devuelve la consulta? */
(function () {
  "use strict";
  const { icon } = MS;
  const $ = (s) => document.querySelector(s);
  const QUESTIONS = window.PREGUNTAS;
  const TIME = 120; // segundos por pregunta
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const SHAPES = ["▲", "◆", "●", "■"];

  let idx = 0;
  let score = 0;
  let hits = 0;
  let streak = 0;
  let startedAt = 0;
  let timerTween = null;
  let ticker = null;
  let answered = false;

  function show(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const el = document.getElementById(id);
    el.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    return el;
  }

  function setScore(v) {
    score = v;
    $("#score").textContent = score;
    if (window.gsap) gsap.fromTo($("#score").parentElement, { scale: 1.3 }, { scale: 1, duration: 0.45, ease: "back.out(2)" });
  }

  function renderQuestion() {
    const q = QUESTIONS[idx];
    answered = false;
    $("#q-count").textContent = `Pregunta ${idx + 1} / ${QUESTIONS.length}`;
    $("#q-topic").textContent = q.topic;
    $("#q-text").textContent = q.text;
    const code = $("#q-code");
    code.textContent = q.code;
    code.removeAttribute("data-highlighted");
    if (window.hljs) hljs.highlightElement(code);
    $("#feedback").hidden = true;

    const answers = $("#answers");
    answers.classList.remove("revealed");
    answers.innerHTML = q.options
      .map((o, i) => `<button class="answer" data-i="${i}" type="button"><span class="shape">${SHAPES[i]}</span><span>${MS.escapeHtml(o)}</span></button>`)
      .join("");
    answers.querySelectorAll(".answer").forEach((b) => b.addEventListener("click", () => answer(Number(b.dataset.i))));

    const st = $("#streak");
    st.hidden = streak < 2;
    st.querySelector("span").textContent = `Racha ×${streak}`;

    if (window.gsap && !MS.reducedMotion()) {
      gsap.from(".q-panel", { y: 20, opacity: 0, duration: 0.4, ease: "power3.out" });
      gsap.from(".answer", { y: 30, opacity: 0, stagger: 0.07, duration: 0.4, ease: "back.out(1.7)" });
    }
    startTimer();
  }

  function startTimer() {
    stopTimer();
    startedAt = performance.now();
    const fill = $("#timer-fill");
    const label = $("#time");
    label.textContent = mmss(TIME);
    if (window.gsap) {
      gsap.set(fill, { scaleX: 1, backgroundPosition: "0% 0" });
      timerTween = gsap.to(fill, { scaleX: 0, backgroundPosition: "100% 0", duration: TIME, ease: "none" });
    }
    ticker = setInterval(() => {
      const left = Math.max(0, TIME - (performance.now() - startedAt) / 1000);
      const shown = Math.ceil(left);
      if (label.textContent !== mmss(shown)) {
        label.textContent = mmss(shown);
        if (shown <= 5 && shown > 0) MS.sound("tick");
      }
      if (left <= 0) answer(null);
    }, 100);
  }

  function stopTimer() {
    if (ticker) clearInterval(ticker);
    ticker = null;
    if (timerTween) timerTween.kill();
    timerTween = null;
  }

  async function answer(choice) {
    if (answered) return;
    answered = true;
    stopTimer();
    const q = QUESTIONS[idx];
    const elapsed = Math.min(TIME, (performance.now() - startedAt) / 1000);
    const ok = choice === q.correct;
    let pts = 0;
    if (ok) {
      hits++;
      streak++;
      pts = Math.round(1000 * (1 - elapsed / TIME / 2));
      if (streak >= 3) pts += 100;
      setScore(score + pts);
      MS.sound("ok");
      MS.confetti({ small: true, origin: MS.originOf(document.querySelector(`.answer[data-i="${choice}"]`)) });
    } else {
      streak = 0;
      MS.sound("bad");
    }

    const answers = $("#answers");
    answers.classList.add("revealed");
    answers.querySelectorAll(".answer").forEach((b) => {
      const i = Number(b.dataset.i);
      b.disabled = true;
      if (i === q.correct) {
        b.classList.add("correct");
        b.insertAdjacentHTML("beforeend", icon("check-circle-2", "mark"));
      }
      if (i === choice) {
        b.classList.add("chosen");
        if (!ok) b.insertAdjacentHTML("beforeend", icon("x-circle", "mark"));
      }
    });

    const head = $("#fb-head");
    head.className = `fb-head ${ok ? "ok" : "bad"}`;
    head.innerHTML = ok
      ? `${icon("party-popper")} ¡Correcto!<span class="pts">+${pts}</span>`
      : choice === null ? `${icon("alarm-clock-off")} ¡Se acabó el tiempo!` : `${icon("x-circle")} Incorrecto`;
    $("#fb-why").textContent = q.why;
    $("#fb-result").innerHTML = `<p class="muted">${icon("loader-2")} Ejecutando la consulta en SQLite…</p>`;
    $("#feedback").hidden = false;
    $("#next").innerHTML = idx === QUESTIONS.length - 1
      ? `${icon("key-round")} Ir a la pregunta llave`
      : `${icon("arrow-right")} Siguiente`;
    MS.refreshIcons();
    if (window.gsap && !MS.reducedMotion()) gsap.from("#feedback", { y: 20, opacity: 0, duration: 0.4 });
    if (!ok) MS.shake(answers);

    $("#fb-result").innerHTML = await realResult(q);
    MS.refreshIcons();
  }

  // Ejecuta la sentencia en una base de datos nueva y devuelve el resultado en HTML
  async function realResult(q) {
    let db;
    try {
      db = await MS.freshDB();
      const sql = q.run || q.code;
      let html = "";
      const results = db.exec(sql);
      const modified = db.getRowsModified();
      if (/^\s*(UPDATE|DELETE|INSERT)/i.test(sql)) {
        html += `<p>${icon("pencil")} Filas modificadas: <strong>${modified}</strong></p>`;
      }
      if (q.show) {
        const r = db.exec(q.show)[0];
        html += MS.resultTable(r.columns, r.values);
      } else if (results.length) {
        const r = results[results.length - 1];
        html += MS.resultTable(r.columns, r.values);
      }
      return `<p class="muted">Resultado real en SQLite:</p>${html}`;
    } catch (e) {
      return `<p class="muted">Resultado real en SQLite:</p><div class="sql-error">${icon("octagon-alert")} ${MS.escapeHtml(e.message)}</div>`;
    } finally {
      if (db) db.close();
    }
  }

  function next() {
    idx++;
    if (idx < QUESTIONS.length) renderQuestion();
    else {
      show("s-key");
      if (window.hljs) document.querySelectorAll("#s-key code").forEach((c) => hljs.highlightElement(c));
      $("#key-input").focus();
    }
  }

  function finish() {
    MS.setDigit(2, 9);
    MS.finishGame(2, score);
    show("s-end");
    MS.sound("win");
    MS.confetti();
    MS.countUp($("#final-score"), score);
    $("#final-hits").textContent = `${hits} / ${QUESTIONS.length}`;
    if (window.gsap && !MS.reducedMotion()) {
      gsap.from("#digit", { rotateY: 180, scale: 0.3, opacity: 0, duration: 1, ease: "elastic.out(1, 0.5)" });
    }
  }

  $("#start").addEventListener("click", () => {
    show("s-q");
    renderQuestion();
  });
  $("#next").addEventListener("click", next);
  $("#tables-btn").addEventListener("click", MS.showTables);
  $("#again").addEventListener("click", () => location.reload());
  $("#key-form").addEventListener("submit", (e) => {
    e.preventDefault();
    if ($("#key-input").value.trim() === "9") {
      finish();
    } else {
      MS.sound("bad");
      MS.shake($("#key-input"));
      MS.toast("No es correcto. COUNT(*) cuenta las filas de la tabla entrega. Puedes mirar las tablas.", "bad");
    }
  });

  MS.renderHeader(2);
  MS.initParticles();
  MS.refreshIcons();
})();
