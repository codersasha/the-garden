// The Garden — logging flows: victories, letters, memories, affirmations, real-life acts (plan §5.4, §8.2).

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  async function logVictory(entry) {
    const db = Garden.db;
    const rec = {
      id: db.uid(), date: new Date().toISOString(), schemaVersion: db.SCHEMA_VERSION,
      preset: entry.preset || null, note: entry.note || null, tag: entry.tag || null, petals: entry.petals || 5
    };
    await db.put("ledger", rec);
    Garden.app.addPetals(rec.petals);
    Garden.app.toast("Logged. The ledger grows.");
    Garden.app.markDone();
    Garden.app.refreshLedgerIfOpen();
  }

  async function logRealLifeAct(entry) {
    const db = Garden.db;
    const rec = { id: db.uid(), date: new Date().toISOString(), schemaVersion: db.SCHEMA_VERSION,
      label: entry.label, tag: entry.tag || null, petals: entry.petals || 5 };
    await db.put("real_life_acts", rec);
    Garden.app.addPetals(rec.petals);
    Garden.app.toast("Noted. That counts.");
    Garden.app.markDone();
  }

  async function logMemory(body) {
    const db = Garden.db;
    const rec = { id: db.uid(), date: new Date().toISOString(), schemaVersion: db.SCHEMA_VERSION, body };
    await db.put("memories", rec);
    Garden.app.addPetals(4);
    Garden.app.toast("Kept. A memory held.");
    Garden.app.markDone();
  }

  async function saveLetter(body) {
    const db = Garden.db;
    const rec = { id: db.uid(), date: new Date().toISOString(), schemaVersion: db.SCHEMA_VERSION,
      body, sealed: true };
    await db.put("letters", rec);
    Garden.app.addPetals(10);
    Garden.app.toast("Saved to the love ledger.");
    Garden.app.markDone();
  }

  async function saveAffirmation(text, isWisdom) {
    const db = Garden.db;
    const rec = { id: db.uid(), date: new Date().toISOString(), schemaVersion: db.SCHEMA_VERSION, text };
    await db.put("affirmations_saved", rec);
    Garden.app.addPetals(2);
    Garden.app.toast("Saved for hard days.");
    if (!isWisdom) Garden.app.markDone();
    else Garden.app.markDone();
  }

  async function saveBiffDraft(draft) {
    const db = Garden.db;
    const rec = { id: db.uid(), date: new Date().toISOString(), schemaVersion: db.SCHEMA_VERSION,
      style: draft.style, exEmailDigest: draft.exEmailDigest || null, draft: draft.draft, saved: true };
    await db.put("biff_drafts", rec);
    Garden.app.addPetals(8);
    Garden.app.toast("Draft saved.");
  }

  async function listLedger() {
    const rows = await Garden.db.getAll("ledger");
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
  async function listLetters() {
    const rows = await Garden.db.getAll("letters");
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
  async function listMemories() {
    const rows = await Garden.db.getAll("memories");
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
  async function listSavedAffirmations() {
    return Garden.db.getAll("affirmations_saved");
  }
  async function listRealLifeActs() {
    return Garden.db.getAll("real_life_acts");
  }

  window.Garden.ledger = {
    logVictory, logRealLifeAct, logMemory, saveLetter, saveAffirmation, saveBiffDraft,
    listLedger, listLetters, listMemories, listSavedAffirmations, listRealLifeActs
  };
})();
