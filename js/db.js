// The Garden — data layer. IndexedDB wrapper with localStorage fallback on file:// (plan §9.2).
// Classic script (no ES modules) so it runs from file://. Exposes window.Garden.db.

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  const DB_NAME = "the-garden";
  const DB_VERSION = 1;
  const STORES = ["ledger", "letters", "memories", "affirmations_saved", "real_life_acts",
    "settings", "ai_settings", "biff_drafts", "inventory", "deck_state"];
  const SCHEMA_VERSION = 1; // current record schema version (see migrations.js)

  let idb = null;
  let useFallback = false;
  const lsPrefix = "garden:";

  function isOpenDB() {
    try { return typeof indexedDB !== "undefined" && location.protocol !== "file:"; }
    catch (e) { return false; }
  }

  function open() {
    return new Promise((resolve) => {
      if (!isOpenDB()) { useFallback = true; resolve(); return; }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const d = e.target.result;
          STORES.forEach((s) => { if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: "id" }); });
        };
        req.onsuccess = (e) => { idb = e.target.result; resolve(); };
        req.onerror = () => { useFallback = true; resolve(); };
      } catch (e) { useFallback = true; resolve(); }
    });
  }

  function tx(store, mode) {
    return idb.transaction(store, mode).objectStore(store);
  }

  function reqProm(req) { return new Promise((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); }); }

  // LS fallback helpers
  function lsKey(store, id) { return lsPrefix + store + ":" + id; }
  function lsAll(store) {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(lsPrefix + store + ":")) {
        try { out.push(JSON.parse(localStorage.getItem(k))); } catch (e) {}
      }
    }
    return out;
  }
  function lsPut(store, val) { localStorage.setItem(lsKey(store, val.id), JSON.stringify(val)); return val; }
  function lsGet(store, id) { try { return JSON.parse(localStorage.getItem(lsKey(store, id))) || null; } catch (e) { return null; } }
  function lsDel(store, id) { localStorage.removeItem(lsKey(store, id)); }
  function lsClear(store) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith(lsPrefix + store + ":")) keys.push(k); }
    keys.forEach((k) => localStorage.removeItem(k));
  }

  async function put(store, val) {
    if (!val.id) val.id = uid();
    if (!val.schemaVersion) val.schemaVersion = SCHEMA_VERSION;
    if (useFallback) return lsPut(store, val);
    return reqProm(tx(store, "readwrite").put(val));
  }
  async function get(store, id) {
    if (useFallback) return lsGet(store, id);
    return reqProm(tx(store, "readonly").get(id));
  }
  async function getAll(store) {
    if (useFallback) return lsAll(store);
    return reqProm(tx(store, "readonly").getAll());
  }
  async function del(store, id) {
    if (useFallback) return lsDel(store, id);
    return reqProm(tx(store, "readwrite").delete(id));
  }
  async function clear(store) {
    if (useFallback) return lsClear(store);
    return reqProm(tx(store, "readwrite").clear());
  }

  // Settings: single record id "settings" / "ai_settings" / "inventory" / "deck_state"
  async function getSingleton(store, defaults) {
    const rec = await get(store, "singleton");
    if (!rec) return { ...defaults };
    return { ...defaults, ...rec.value };
  }
  async function setSingleton(store, value) {
    return put(store, { id: "singleton", value, schemaVersion: SCHEMA_VERSION });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function isFallback() { return useFallback; }

  // Export / import (plan §9). formatVersion on the bundle.
  async function exportAll(includePinHash) {
    const bundle = { formatVersion: 1, exportedAt: new Date().toISOString(), stores: {} };
    for (const s of STORES) {
      if (s === "settings" && !includePinHash) {
        const settings = await getSingleton("settings", {});
        const { pinHash, pinSalt, ...rest } = settings;
        bundle.stores[s] = [rest];
      } else {
        bundle.stores[s] = await getAll(s);
      }
    }
    return bundle;
  }

  async function importAll(bundle, mode) {
    // mode: "merge" | "replace"
    if (!bundle || !bundle.stores) throw new Error("Not a garden backup file.");
    for (const s of STORES) {
      const rows = bundle.stores[s] || [];
      if (mode === "replace" && s !== "settings") await clear(s);
      for (const r of rows) {
        if (s === "settings" || s === "ai_settings" || s === "inventory" || s === "deck_state") {
          if (r && r.value) await setSingleton(s, r.value);
          else if (r) await setSingleton(s, r);
        } else {
          await put(s, r);
        }
      }
    }
  }

  window.Garden.db = {
    open, STORES, SCHEMA_VERSION, isFallback, uid,
    put, get, getAll, del, clear, getSingleton, setSingleton,
    exportAll, importAll
  };
})();
