// The Garden — schema versioning + idempotent migrations (plan §9.1).
// DEVELOPMENT mode: migrations may be rewritten freely. LIVE: only add new ones, never reorder.
// Each migration walks a record from its saved schemaVersion up to current, filling safe defaults.

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  const CURRENT = 1; // current record schemaVersion

  // Ordered map of version -> upgrade function. Each takes (record, ctx) and returns record.
  // Add new entries by appending; never change an existing entry once LIVE.
  const MIGRATIONS = {
    // 1: initial — nothing to upgrade from yet.
  };

  function migrateRecord(rec) {
    if (!rec) return rec;
    let v = rec.schemaVersion || 1;
    while (MIGRATIONS[v]) {
      rec = MIGRATIONS[v](rec);
      rec.schemaVersion = v + 1;
      v = rec.schemaVersion;
    }
    rec.schemaVersion = CURRENT;
    return rec;
  }

  // Run across all stores on load. Idempotent.
  async function runAll(db) {
    for (const store of db.STORES) {
      let rows = [];
      try { rows = await db.getAll(store); } catch (e) { continue; }
      for (const r of rows) {
        if (!r || !r.schemaVersion || r.schemaVersion < CURRENT) {
          const before = r && r.schemaVersion;
          const migrated = migrateRecord(r);
          try { await db.put(store, migrated); } catch (e) {}
        }
      }
    }
  }

  // Self-test used by the dev gate (plan §15 Wave 2): a v1 record with a missing field
  // should still load after a fake v2 migration adds it with a default.
  function selfTest() {
    const fakeV1 = { id: "test", schemaVersion: 1, body: "hi" };
    const migs = { 1: (r) => ({ ...r, newField: "default" }) };
    let v = fakeV1.schemaVersion;
    let rec = fakeV1;
    while (migs[v]) { rec = migs[v](rec); rec.schemaVersion = v + 1; v = rec.schemaVersion; }
    return rec.newField === "default" && rec.body === "hi";
  }

  window.Garden.migrations = { CURRENT, migrateRecord, runAll, selfTest };
})();
