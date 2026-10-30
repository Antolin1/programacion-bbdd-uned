/* Portal de Misión SQL */
(function () {
  "use strict";
  const { icon } = MS;

  const DESCRIPTIONS = {
    1: "Puzle de clasificación y ordenación: arrastra sentencias, cláusulas y operadores a su sitio.",
    2: "Concurso contrarreloj: lee cada consulta y adivina qué devuelve antes de que se acabe el tiempo.",
    3: "Escape room en una consola SQL real: resuelve las incidencias de la cooperativa escribiendo SQL.",
  };

  function renderSafe() {
    const d = MS.state.digits;
    const box = document.getElementById("safe-digits");
    box.innerHTML = [1, 2, 3, 4]
      .map((i) => `<div class="safe-digit ${d[i] !== null ? "on" : ""}">${d[i] !== null ? d[i] : "?"}</div>`)
      .join("");
    const complete = [1, 2, 3, 4].every((i) => d[i] !== null);
    document.getElementById("safe-msg").innerHTML = complete
      ? "<strong>¡Código completo!</strong> Introducidlo en la caja fuerte de la presentación."
      : "Cada juego superado revela dígitos de la llave.";
    if (window.gsap && !MS.reducedMotion()) {
      gsap.from(box.querySelectorAll(".safe-digit.on"), { rotateX: -90, opacity: 0, stagger: 0.12, duration: 0.6, ease: "back.out(1.6)" });
    }
  }

  function renderMap() {
    const nodes = document.getElementById("map-nodes");
    nodes.innerHTML = [1, 2, 3]
      .map((n) => {
        const g = MS.GAMES[n];
        const res = MS.state.games[n];
        const unlocked = MS.isUnlocked(n);
        const cls = res ? "done" : unlocked ? "open" : "locked";
        const status = res
          ? `${icon("check-circle-2")} Completado · ${res.best} puntos`
          : unlocked ? `${icon("play-circle")} Disponible` : `${icon("lock")} Supera el juego ${n - 1} para desbloquearlo`;
        const action = unlocked
          ? `<a class="btn ${res ? "ghost" : "lemon"}" href="${g.path}">${icon(res ? "rotate-ccw" : "play")} ${res ? "Volver a jugar" : "Jugar"}</a>`
          : `<button class="btn ghost" disabled>${icon("lock")} Bloqueado</button>`;
        return `<article class="node ${cls}" data-n="${n}">
            <span class="num">${n}</span>
            <div class="ic">${icon(g.icon)}</div>
            <h3>${g.title}</h3>
            <p class="type">${DESCRIPTIONS[n]}</p>
            <div class="status">${status}</div>
            ${action}
          </article>`;
      })
      .join("");
    MS.refreshIcons();
    if (window.gsap && !MS.reducedMotion()) {
      gsap.from(".node", { y: 40, opacity: 0, stagger: 0.15, duration: 0.7, ease: "power3.out" });
    }
  }

  function renderBadges() {
    const have = MS.state.badges;
    document.getElementById("badges").innerHTML = [1, 2, 3]
      .map((n) => {
        const b = MS.GAMES[n].badge;
        return `<span class="badge ${have.includes(b) ? "" : "off"}" title="Juego ${n}">${icon(have.includes(b) ? "medal" : "lock")} ${b}</span>`;
      })
      .join("");
    MS.refreshIcons();
  }

  function renderAll() {
    MS.renderHeader();
    renderSafe();
    renderMap();
    renderBadges();
    document.getElementById("team").value = MS.state.team;
    document.getElementById("unlock").checked = MS.state.unlockAll;
  }

  document.getElementById("team-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("team").value;
    if (!name.trim()) {
      MS.toast("Escribe un nombre para el equipo.", "bad");
      return;
    }
    MS.setTeam(name);
    MS.toast(`¡Bienvenido, equipo <strong>${MS.escapeHtml(MS.state.team)}</strong>!`, "ok");
    MS.sound("ok");
  });

  document.getElementById("unlock").addEventListener("change", (e) => {
    MS.setUnlockAll(e.target.checked);
    renderMap();
  });

  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("¿Seguro que quieres borrar el progreso, los dígitos y las insignias?")) {
      MS.resetAll();
      renderAll();
      MS.toast("Progreso reiniciado.", "info");
    }
  });

  document.getElementById("see-tables").addEventListener("click", MS.showTables);

  MS.initParticles();
  renderAll();
  if (window.gsap && !MS.reducedMotion()) {
    gsap.from(".hero-text > *", { y: 24, opacity: 0, stagger: 0.1, duration: 0.7, ease: "power3.out" });
    gsap.from(".safe", { scale: 0.9, opacity: 0, duration: 0.8, delay: 0.3, ease: "back.out(1.6)" });
  }
})();
