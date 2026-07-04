// The Garden — service worker registration + update flow (plan §11). Skipped on file://.

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  function isLocal() {
    return location.protocol === "file:" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
  }

  function register() {
    if (location.protocol === "file:") {
      console.info("[The Garden] file:// — skipping service worker (open via a local server for PWA testing).");
      return;
    }
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("service-worker.js").then(reg => {
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          if (!nw) return;
          nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              Garden.app.toast("A new version of the garden is ready. Reload to pick it up.");
            }
          });
        });
      }).catch(err => console.warn("[The Garden] SW registration failed:", err));
    });
  }

  window.Garden.swRegister = { register, isLocal };
})();
