// The Garden — theming: palette + light/dark + wallpaper (plan §12).

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  const PALETTES = ["dusk-plum", "forest-teal", "morning-mist", "lantern-gold"];
  const THEMES = ["dark", "light", "system"];

  function resolveMode(mode) {
    if (mode === "system") {
      return matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }
    return mode === "light" ? "light" : "dark";
  }

  function apply(settings) {
    const pal = PALETTES.includes(settings.palette) ? settings.palette : "dusk-plum";
    const mode = resolveMode(settings.themeMode || "dark");
    document.documentElement.setAttribute("data-palette", pal);
    document.documentElement.setAttribute("data-theme", mode);
    if (settings.stealth) {
      // Stealth name/icon handled by manifest; in-app we show The Garden post-unlock.
    }
  }

  function list() { return PALETTES; }

  window.Garden.theme = { apply, list, PALETTES, THEMES, resolveMode };
})();
