// The Garden — shop: versioned catalogue, purchase, equip, inventory persistence (plan §6).

(function () {
  "use strict";
  window.Garden = window.Garden || {};
  let inventory = { ownedItemIds: ["dusk-plum", "forest-teal", "morning-mist", "lantern-gold", "wallpaper-plain"], equipped: { palette: "dusk-plum", wallpaper: "wallpaper-plain", companion: null }, petals: 0 };

  async function load() {
    const s = await Garden.db.getSingleton("inventory", inventory);
    inventory = { ...inventory, ...s };
    // ensure defaults owned
    ["dusk-plum", "forest-teal", "morning-mist", "lantern-gold"].forEach(id => { if (!inventory.ownedItemIds.includes(id)) inventory.ownedItemIds.push(id); });
    return inventory;
  }
  async function save() { await Garden.db.setSingleton("inventory", inventory); }

  function get() { return inventory; }
  function petals() { return inventory.petals || 0; }

  async function addPetals(n) {
    inventory.petals = (inventory.petals || 0) + Math.max(0, n);
    await save();
    return inventory.petals;
  }
  async function spend(n) {
    if (inventory.petals < n) return false;
    inventory.petals -= n;
    await save();
    return true;
  }

  function catalogue() { return window.GardenContent.catalogue; }
  function itemById(id) { return catalogue().items.find(i => i.id === id) || null; }

  async function buy(id) {
    const it = itemById(id);
    if (!it) return { ok: false, reason: "Item not found." };
    if (inventory.ownedItemIds.includes(id)) return { ok: false, reason: "Already owned." };
    if (inventory.petals < it.cost) return { ok: false, reason: "Not enough petals." };
    if (it.cost > 0) { const ok = await spend(it.cost); if (!ok) return { ok: false, reason: "Not enough petals." }; }
    inventory.ownedItemIds.push(id);
    await save();
    return { ok: true };
  }

  async function equip(id) {
    const it = itemById(id);
    if (!it) return false;
    if (!inventory.ownedItemIds.includes(id)) return false;
    inventory.equipped[it.type] = id;
    if (it.type === "palette") { const s = Garden.app.settings(); s.palette = id; await Garden.app.saveSettings(s); Garden.theme.apply(s); }
    if (it.type === "wallpaper") { const s = Garden.app.settings(); s.wallpaper = id; await Garden.app.saveSettings(s); Garden.app.applyWallpaper(); }
    if (it.type === "companion") { const s = Garden.app.settings(); s.companion = id; await Garden.app.saveSettings(s); Garden.companions.refresh(); }
    await save();
    return true;
  }

  function isNew(item) {
    if (!item.isNew) return false;
    const added = new Date(item.addedAt).getTime();
    return Date.now() - added < 14 * 86400000;
  }

  window.Garden.shop = { load, save, get, petals, addPetals, spend, buy, equip, itemById, catalogue, isNew };
})();
