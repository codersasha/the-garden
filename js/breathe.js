// The Garden — guided breath engine (plan §4 Breath). 60–120s, animated orb, optional soft tone.

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  let running = false;
  let timer = null;

  async function start(orbEl) {
    if (running) return;
    running = true;
    const label = orbEl.parentElement.querySelector(".breath-label");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cycles = reduced ? 2 : 4;
    let c = 0;
    function step() {
      if (c >= cycles) {
        if (label) label.textContent = "Nice. That's enough.";
        running = false;
        Garden.app.softTone(); // gentle chime
        return;
      }
      if (label) label.textContent = "Breathe in…";
      Garden.app.softTone(330);
      setTimeout(() => {
        if (label) label.textContent = "And out…";
        Garden.app.softTone(220);
        c++;
        timer = setTimeout(step, 4000);
      }, 4000);
    }
    step();
  }

  function stop() { running = false; if (timer) clearTimeout(timer); }

  window.Garden.breathe = { start, stop };
})();
