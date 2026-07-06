// The Garden — card renderers per type (plan §4, §5.3, §13).
// Each renderer returns { front: HTMLElement, back: HTMLElement }.
// The container wires the flip (whole-card tap) + swipe-left to snooze.

(function () {
  "use strict";
  window.Garden = window.Garden || {};
  const C = window.GardenContent;

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function txt(s) { return document.createTextNode(s == null ? "" : s); }

  function frontWrap(title, sub) {
    const f = el("div", "card-face card-front");
    f.appendChild(el("div", "face-title", title));
    if (sub) f.appendChild(el("div", "face-sub", sub));
    return f;
  }
  function backWrap() { return el("div", "card-face card-back"); }
  function actions(cls) { return el("div", cls || "card-actions"); }
  function btn(label, cls) { const b = el("button", cls, label); b.type = "button"; return b; }

  const renderers = {
    "rest"(card) {
      const f = frontWrap("The garden is resting", card.data.text);
      const b = backWrap();
      const a = actions(); const restore = btn("Bring them all back", "primary");
      restore.onclick = () => Garden.app.restoreAll();
      a.appendChild(restore); b.appendChild(a);
      return { front: f, back: b };
    },

    "victory-prompt"(card) {
      const f = frontWrap("Did you do one of these today?", "Tap one to log it. The ledger only grows.");
      const b = backWrap();
      const presets = el("div", "presets");
      C.victoryPresets.forEach(p => {
        const pb = btn(p.text, "preset");
        pb.onclick = () => Garden.ledger.logVictory({ preset: p.text, tag: p.tag, petals: 5 });
        presets.appendChild(pb);
      });
      // Real-life act entry
      const rl = el("div", "muted", "Or log a real-life act (+5):");
      const rlPresets = el("div", "presets");
      C.realLifeActPresets.forEach(p => {
        const pb = btn(p.text, "preset");
        pb.onclick = () => Garden.ledger.logRealLifeAct({ label: p.text, tag: p.tag, petals: 5 });
        rlPresets.appendChild(pb);
      });
      const note = el("textarea"); note.placeholder = "Add a note (optional)…"; note.rows = 2;
      const a = actions();
      const save = btn("Save a note", "primary");
      save.onclick = () => {
        if (note.value.trim()) Garden.ledger.logVictory({ note: note.value.trim(), tag: "for-yourself", petals: 5 });
        else Garden.app.toast("Tap a preset above, or write a note.");
      };
      a.appendChild(save);
      b.appendChild(presets); b.appendChild(rl); b.appendChild(rlPresets); b.appendChild(note); b.appendChild(a);
      return { front: f, back: b };
    },

    "letter-nudge"(card) {
      const f = frontWrap("A few lines for your child", "Write a few lines for when they're ready. Weekly keeps the thread alive.");
      const b = backWrap();
      const LS = C.letterStructure;
      b.appendChild(el("div", "muted", LS.cadence));
      const parts = el("div", "presets");
      LS.parts.forEach(pt => {
        const pb = btn(pt.title + " — " + pt.prompt, "preset");
        pb.style.textAlign = "left";
        pb.onclick = () => { Garden.app.openLetter(pt); };
        parts.appendChild(pb);
      });
      const a = actions();
      const open = btn("Open the letter writer", "primary");
      open.onclick = () => Garden.app.openLetter();
      const ai = btn("Help me start (AI)", "ghost");
      ai.onclick = () => Garden.app.openLetter({ ai: true });
      a.appendChild(open); a.appendChild(ai);
      b.appendChild(parts); b.appendChild(a);
      b.appendChild(el("div", "muted", "Never send a template as-is. Adapt to your child."));
      return { front: f, back: b };
    },

    "memory"(card) {
      const f = frontWrap("Something only you would know about your child today", "A small memory, kept and dated.");
      const b = backWrap();
      const t = el("textarea"); t.placeholder = "A detail only a mum would know…"; t.rows = 4;
      const a = actions();
      const save = btn("Keep this memory", "primary");
      save.onclick = () => {
        if (t.value.trim()) Garden.ledger.logMemory(t.value.trim());
        else Garden.app.toast("Write a few words first.");
      };
      a.appendChild(save); b.appendChild(t); b.appendChild(a);
      return { front: f, back: b };
    },

    "breath"(card) {
      const f = frontWrap("Take a breath", "A slow minute, just for you.");
      const b = backWrap();
      b.appendChild(el("div", "breath-label", "Breathe in… and out…"));
      const orb = el("div", "breath-orb"); b.appendChild(orb);
      const a = actions();
      const start = btn("Start a breath", "primary");
      start.onclick = () => Garden.breathe.start(orb);
      const done = btn("Done", "ghost");
      done.onclick = () => { Garden.app.addPetals(3); Garden.app.markDone(); };
      a.appendChild(start); a.appendChild(done);
      b.appendChild(a);
      return { front: f, back: b };
    },

    "biff"(card) {
      const f = frontWrap("Got a hostile email?", "Here's a calm way to reply.");
      const b = backWrap();
      b.appendChild(el("p", "muted", C.biffExplainer));
      const a = actions();
      const manual = btn("Manual template", "primary");
      manual.onclick = () => Garden.app.openBiff({ mode: "manual" });
      const ai = btn("Use AI to draft", "ghost");
      ai.onclick = () => Garden.app.openBiff({ mode: "ai" });
      a.appendChild(manual); a.appendChild(ai);
      b.appendChild(a);
      return { front: f, back: b };
    },

    "affirmation"(card) {
      const f = frontWrap(card.data.text, "");
      const b = backWrap();
      b.appendChild(el("div", "face-body", card.data.text));
      const a = actions();
      const save = btn("Save to read on hard days", "primary");
      save.onclick = () => Garden.ledger.saveAffirmation(card.data.text);
      const done = btn("Just needed that", "ghost");
      done.onclick = () => Garden.app.markDone();
      a.appendChild(save); a.appendChild(done);
      b.appendChild(a);
      return { front: f, back: b };
    },

    "wisdom"(card) {
      const f = frontWrap(card.data.title, "");
      const b = backWrap();
      b.appendChild(el("div", "face-body", card.data.body));
      if (card.data.attribution) b.appendChild(el("div", "muted", card.data.attribution));
      const a = actions();
      const save = btn("Save", "ghost");
      save.onclick = () => Garden.ledger.saveAffirmation(card.data.title + " — " + card.data.body, true);
      const done = btn("Read", "primary");
      done.onclick = () => Garden.app.markDone();
      a.appendChild(save); a.appendChild(done);
      b.appendChild(a);
      return { front: f, back: b };
    },

    "bingo-pull"(card) {
      const f = frontWrap(card.data.text, "A square from the bingo decks.");
      const b = backWrap();
      b.appendChild(el("div", "face-body", card.data.text));
      const a = actions();
      const mark = btn("Mark this — log it", "primary");
      mark.onclick = () => Garden.ledger.logVictory({ preset: card.data.text, tag: "for-your-kids", petals: 5 });
      const skip = btn("Not today", "ghost");
      skip.onclick = () => Garden.app.markDone();
      a.appendChild(mark); a.appendChild(skip);
      b.appendChild(a);
      return { front: f, back: b };
    },

    "small-pleasure"(card) {
      const f = el("div", "card-face card-front");
      const img = el("img", "pleasure-img");
      img.src = card.data.imageRef; img.alt = card.data.title; img.loading = "lazy";
      f.appendChild(img);
      f.appendChild(el("div", "face-sub", "Tap to turn over."));
      const b = backWrap();
      b.appendChild(el("div", "face-title", "Small pleasures"));
      b.appendChild(el("div", "face-body", card.data.title));
      const a = actions();
      const notice = btn("I noticed this 🤍", "primary");
      notice.onclick = () => { Garden.app.addPetals(2); Garden.app.markDone(); };
      const save = btn("Save to ledger", "ghost");
      save.onclick = () => Garden.ledger.logVictory({ note: "Small pleasure: " + card.data.title, tag: "for-yourself", petals: 2 });
      a.appendChild(notice); a.appendChild(save);
      b.appendChild(a);
      return { front: f, back: b };
    },

    "grounding-link"(card) {
      const f = el("div", "card-face card-front");
      f.appendChild(el("div", "face-title", "Something to look at / listen to"));
      f.appendChild(el("div", "face-sub", "Tap to turn over."));
      const b = backWrap();
      b.appendChild(el("div", "face-title", card.data.title));
      b.appendChild(el("div", "face-body", card.data.why));
      const a = actions();
      const open = btn("Open (new tab)", "primary");
      open.onclick = () => {
        window.open(card.data.url, "_blank", "noopener");
        Garden.app.addPetals(2);
        Garden.app.markDone();
      };
      const skip = btn("Not now", "ghost");
      skip.onclick = () => Garden.app.snooze();
      a.appendChild(open); a.appendChild(skip);
      b.appendChild(a);
      return { front: f, back: b };
    },

    "check-in"(card) {
      const f = frontWrap("How's your heart today?", "A gentle check-in to shape the deck.");
      const b = backWrap();
      const row = el("div", "tag-row");
      const moods = [
        { id: "low", label: "Heavy" },
        { id: "mid", label: "Okay" },
        { id: "good", label: "Steady" }
      ];
      moods.forEach(m => {
        const mb = btn(m.label);
        mb.onclick = () => {
          row.querySelectorAll("button").forEach(x => x.classList.remove("selected"));
          mb.classList.add("selected");
          Garden.deck.applyMood(m.id);
          Garden.app.toast("Thank you for checking in.");
          setTimeout(() => Garden.app.markDone(), 600);
        };
        row.appendChild(mb);
      });
      b.appendChild(row);
      return { front: f, back: b };
    }
  };

  function render(card) {
    const r = renderers[card.type] || renderers["rest"];
    const { front, back } = r(card);
    const inner = el("div", "card-inner");
    inner.appendChild(front);
    inner.appendChild(back);
    const node = el("div", "card");
    node.appendChild(el("div", "mode-pill", card.mode || ""));
    node.appendChild(inner);
    node.appendChild(el("div", "swipe-hint", "Swipe left to skip · tap to flip"));

    // Flip on whole-card tap (but not on interactive elements).
    node.addEventListener("click", (e) => {
      if (e.target.closest("button, textarea, input, select, a")) return;
      node.classList.toggle("flipped");
    });
    // Swipe left to snooze (touch + mouse drag).
    let startX = null, dx = 0;
    function down(x) { startX = x; node.classList.add("swiping"); }
    function move(x) { if (startX == null) return; dx = x - startX; node.style.transform = "translateX(" + dx + "px) rotate(" + (dx * 0.05) + "deg)"; }
    function up() {
      if (startX == null) return;
      node.style.transform = "";
      node.classList.remove("swiping");
      if (dx < -90) { node.classList.add("gone"); setTimeout(() => Garden.app.snooze(), 200); }
      startX = null; dx = 0;
    }
    node.addEventListener("touchstart", e => down(e.touches[0].clientX), { passive: true });
    node.addEventListener("touchmove", e => move(e.touches[0].clientX), { passive: true });
    node.addEventListener("touchend", up);
    node.addEventListener("mousedown", e => { if (e.target.closest("button, textarea, input, select, a")) return; down(e.clientX); e.preventDefault(); });
    window.addEventListener("mousemove", e => { if (startX != null) move(e.clientX); });
    window.addEventListener("mouseup", () => { if (startX != null) up(); });
    // Keyboard: ← snooze, Enter flip
    node.tabIndex = 0;
    node.setAttribute("role", "button");
    node.setAttribute("aria-label", card.mode + " card");
    node.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); node.classList.toggle("flipped"); }
      else if (e.key === "ArrowLeft") { node.classList.add("gone"); setTimeout(() => Garden.app.snooze(), 200); }
    });
    return node;
  }

  window.Garden.cards = { render };
})();
