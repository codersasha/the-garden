// The Garden — ambient companion engine (plan §6.3). Drift, settle, occasional validating line.

(function () {
  "use strict";
  window.Garden = window.Garden || {};
  let stage = null;
  let active = [];
  let mode = "on"; // on | off | cover-only

  function ensureStage() {
    if (stage) return stage;
    stage = document.createElement("div");
    stage.className = "companion-stage no-print";
    stage.setAttribute("aria-hidden", "true");
    document.body.appendChild(stage);
    return stage;
  }

  function clear() { if (stage) stage.innerHTML = ""; active = []; }

  async function refresh() {
    const s = Garden.app.settings();
    mode = s.companionMode || "on";
    clear();
    if (mode === "off") return;
    if (mode === "cover-only" && !Garden.app.isOnCover()) return;
    const inv = Garden.shop.get();
    const equipped = inv.equipped && inv.equipped.companion;
    if (!equipped) return;
    const item = Garden.shop.itemById(equipped);
    if (!item) return;
    spawn(item);
  }

  function spawn(item) {
    const st = ensureStage();
    const c = document.createElement("div");
    c.className = "companion";
    c.innerHTML = '<img src="' + item.artRef + '" alt="" style="width:100%;height:100%">' +
      '<div class="bubble"></div>';
    c.addEventListener("click", () => {
      const lines = (item.lines && item.lines.length) ? item.lines : window.GardenContent.companionLines;
      const line = lines[Math.floor(Math.random() * lines.length)];
      const bubble = c.querySelector(".bubble");
      bubble.textContent = line;
      bubble.classList.add("show");
      setTimeout(() => bubble.classList.remove("show"), 4000);
      Garden.app.softTone(440);
    });
    st.appendChild(c);
    active.push(c);
    // occasional spontaneous line
    setInterval(() => {
      if (document.hidden) return;
      if (Math.random() < 0.25) {
        const bubble = c.querySelector(".bubble");
        const lines = (item.lines && item.lines.length) ? item.lines : window.GardenContent.companionLines;
        bubble.textContent = lines[Math.floor(Math.random() * lines.length)];
        bubble.classList.add("show");
        setTimeout(() => bubble.classList.remove("show"), 4000);
      }
    }, 45000);
  }

  window.Garden.companions = { refresh, clear };
})();
