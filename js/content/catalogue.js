window.GardenContent = window.GardenContent || {};

// Versioned shop catalogue (plan §6.2). Stable ids; additive only.
// Palettes here are equippable themes beyond the 4 defaults (which are free/owned).
window.GardenContent.catalogue = {
  version: 1,
  items: [
    // Palettes (cosmetic only — additional calm themes)
    { id: "dusk-plum", version: 1, type: "palette", name: "Dusk Plum", cost: 0, isNew: false, addedAt: "2026-07-04" },
    { id: "forest-teal", version: 1, type: "palette", name: "Forest Teal", cost: 0, isNew: false, addedAt: "2026-07-04" },
    { id: "morning-mist", version: 1, type: "palette", name: "Morning Mist", cost: 0, isNew: false, addedAt: "2026-07-04" },
    { id: "lantern-gold", version: 1, type: "palette", name: "Lantern Gold", cost: 0, isNew: false, addedAt: "2026-07-04" },
    { id: "eucalyptus", version: 1, type: "palette", name: "Eucalyptus", cost: 30, isNew: true, addedAt: "2026-07-04" },
    // Wallpapers
    { id: "wallpaper-plain", version: 1, type: "wallpaper", name: "Quiet", cost: 0, isNew: false, addedAt: "2026-07-04", artRef: "assets/wallpapers/plain.svg" },
    { id: "lighthouse-dusk", version: 1, type: "wallpaper", name: "Lighthouse at Dusk", cost: 25, isNew: true, addedAt: "2026-07-04", artRef: "assets/wallpapers/lighthouse-dusk.svg" },
    { id: "botanical-line", version: 1, type: "wallpaper", name: "Botanical Line", cost: 20, isNew: false, addedAt: "2026-07-04", artRef: "assets/wallpapers/botanical-line.svg" },
    // Companions
    { id: "marlowe", version: 1, type: "companion", name: "Marlowe", species: "cat", cost: 40, isNew: true, addedAt: "2026-07-04",
      artRef: "assets/companion/marlowe.svg", personality: "quiet",
      lines: ["you showed up today, that's the whole thing", "rest is also work", "i'm glad you're here"] },
    { id: "pip", version: 1, type: "companion", name: "Pip", species: "sparrow", cost: 35, isNew: false, addedAt: "2026-07-04",
      artRef: "assets/companion/pip.svg", personality: "hopeful",
      lines: ["one strong wind and the whole act is gone — but not you", "small wings, long flights", "you're not crazy. i see it too"] },
    { id: "tortoise-steady", version: 1, type: "companion", name: "Steady", species: "tortoise", cost: 30, isNew: false, addedAt: "2026-07-04",
      artRef: "assets/companion/steady.svg", personality: "steady",
      lines: ["the love never stopped", "slow is still going", "you don't have to rush"] }
  ]
};

// Companion validating lines (also used by generic companions) — plan §13.7
window.GardenContent.companionLines = [
  "you showed up today. that's the whole thing.",
  "rest is also work.",
  "you're not crazy. I see it too.",
  "one strong wind and the whole act is gone — but not you.",
  "the love never stopped."
];
