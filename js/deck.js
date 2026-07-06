// The Garden — deck engine: shuffle, time-of-day weighting, snooze, restore-all (plan §4, §5.3).

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  const C = window.GardenContent;
  let state = { snoozedIds: [], doneToday: [], date: "" };
  let deck = [];
  let cursor = 0;
  let currentCard = null;
  let onCardChange = null;

  function today() { return new Date().toISOString().slice(0, 10); }

  async function loadState(db) {
    const s = await db.getSingleton("deck_state", { snoozedIds: [], doneToday: [], date: today() });
    if (s.date !== today()) { s.doneToday = []; s.date = today(); }
    state = s;
  }
  async function saveState(db) { await db.setSingleton("deck_state", state); }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function partOfDay() {
    const h = new Date().getHours();
    if (h < 11) return "morning";
    if (h < 17) return "day";
    return "evening";
  }

  function buildRawDeck() {
    const cards = [];
    // Victory prompt — always available, weighted
    cards.push({ id: "vp", type: "victory-prompt", mode: "Log" });
    // Letter nudge
    cards.push({ id: "ln", type: "letter-nudge", mode: "Write" });
    // Memory keeper
    cards.push({ id: "mk", type: "memory", mode: "Memory" });
    // Breath
    cards.push({ id: "br", type: "breath", mode: "Breathe" });
    // BIFF
    cards.push({ id: "bf", type: "biff", mode: "BIFF" });
    // Affirmations — one per affirmation
    C.affirmations.forEach(a => cards.push({ id: "af-" + a.id, type: "affirmation", mode: "Affirm", data: a }));
    // Wisdom — one per wisdom
    C.wisdom.forEach(w => cards.push({ id: "ws-" + w.id, type: "wisdom", mode: "Wisdom", data: w }));
    // Recognise cards — moments a mum might recognise from her own week
    [...C.recogniseMoments.survivor, ...C.recogniseMoments.ledger].forEach((s, i) =>
      cards.push({ id: "rc-" + i, type: "recognise", mode: "Recognise", data: { text: s } }));
    // Small pleasures
    C.smallPleasures.forEach(p => cards.push({ id: "sp-" + p.id, type: "small-pleasure", mode: "Pleasures", data: p }));
    // Grounding links
    C.groundingLinks.forEach(g => cards.push({ id: "gl-" + g.id, type: "grounding-link", mode: "Grounding", data: g }));
    // Check-in (router) — occasionally
    cards.push({ id: "ci", type: "check-in", mode: "Check-in" });
    return cards;
  }

  function weightDeck(arr) {
    const pod = partOfDay();
    const weight = (c) => {
      let w = 1;
      if (c.type === "affirmation" || c.type === "breath") w += (pod === "morning" ? 2 : 1);
      if (c.type === "victory-prompt" || c.type === "letter-nudge" || c.type === "memory") w += (pod === "evening" ? 2 : 1);
      if (c.type === "small-pleasure" || c.type === "grounding-link") w += 1;
      if (c.type === "check-in") w = 0.3;
      return w;
    };
    const weighted = [];
    arr.forEach(c => { const w = weight(c); for (let i = 0; i < Math.max(1, Math.round(w)); i++) weighted.push(c); });
    return weighted;
  }

  function filterActive(arr) {
    return arr.filter(c => !state.snoozedIds.includes(c.id) && !state.doneToday.includes(c.id));
  }

  function reshuffle() {
    const raw = buildRawDeck();
    const weighted = shuffle(weightDeck(raw));
    // dedupe by id (from weighting) keeping first occurrence order
    const seen = new Set();
    const ordered = [];
    weighted.forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); ordered.push(c); } });
    deck = ordered;
    cursor = 0;
  }

  function current() { return currentCard; }

  function next() {
    if (!deck.length) reshuffle();
    // find next non-snoozed/non-done from cursor
    for (let i = 0; i < deck.length; i++) {
      const idx = (cursor + i) % deck.length;
      const c = deck[idx];
      if (!state.snoozedIds.includes(c.id) && !state.doneToday.includes(c.id)) {
        cursor = idx + 1;
        currentCard = c;
        if (onCardChange) onCardChange(c);
        return c;
      }
    }
    // everything snoozed/done — show a gentle "garden is resting" card
    currentCard = { id: "rest", type: "rest", mode: "Garden", data: { text: "The garden is resting for now. Bring the cards back when you're ready." } };
    if (onCardChange) onCardChange(currentCard);
    return currentCard;
  }

  async function snoozeCurrent(db) {
    if (!currentCard || currentCard.id === "rest") return;
    if (!state.snoozedIds.includes(currentCard.id)) state.snoozedIds.push(currentCard.id);
    await saveState(db);
    next();
  }

  async function markDone(db) {
    if (!currentCard || currentCard.id === "rest") return;
    if (!state.doneToday.includes(currentCard.id)) state.doneToday.push(currentCard.id);
    await saveState(db);
    next();
  }

  async function restoreAll(db) {
    state.snoozedIds = [];
    state.doneToday = [];
    state.date = today();
    await saveState(db);
    reshuffle();
    next();
  }

  function browseByMode(mode) {
    const raw = buildRawDeck();
    return raw.filter(c => c.mode === mode);
  }
  function allModes() {
    return ["Log", "Write", "Memory", "Breathe", "BIFF", "Affirm", "Wisdom", "Recognise", "Pleasures", "Grounding"];
  }

  function setOnCardChange(fn) { onCardChange = fn; }

  // Mood weighting from check-in (plan §4 deck mechanics).
  function applyMood(mood) {
    // low mood → more breath/affirmation, fewer task cards
    if (mood === "low") {
      deck.sort((a, b) => scoreLow(b) - scoreLow(a));
    }
    cursor = 0;
    next();
  }
  function scoreLow(c) {
    if (c.type === "breath" || c.type === "affirmation" || c.type === "small-pleasure") return 3;
    if (c.type === "grounding-link" || c.type === "wisdom") return 2;
    return 1;
  }

  window.Garden.deck = {
    loadState, saveState, reshuffle, next, current, snoozeCurrent, markDone, restoreAll,
    browseByMode, allModes, setOnCardChange, applyMood, partOfDay
  };
})();
