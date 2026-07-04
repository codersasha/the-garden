// The Garden — service worker. Precaches the app shell. Does NOT precache Puter.js (plan §11).
const CACHE = "garden-v5";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/tokens.css",
  "./css/base.css",
  "./css/deck.css",
  "./css/diary.css",
  "./css/shop.css",
  "./css/print.css",
  "./js/app.js",
  "./js/db.js",
  "./js/migrations.js",
  "./js/crypto.js",
  "./js/theme.js",
  "./js/deck.js",
  "./js/cards.js",
  "./js/ledger.js",
  "./js/breathe.js",
  "./js/biff.js",
  "./js/ai.js",
  "./js/shop.js",
  "./js/companions.js",
  "./js/notify.js",
  "./js/sw-register.js",
  "./js/content/affirmations.js",
  "./js/content/wisdom.js",
  "./js/content/victory-presets.js",
  "./js/content/bingo-squares.js",
  "./js/content/biff-styles.js",
  "./js/content/letter-structure.js",
  "./js/content/resources.js",
  "./js/content/about.js",
  "./js/content/small-pleasures.js",
  "./js/content/grounding-links.js",
  "./js/content/catalogue.js",
  "./assets/icons/favicon.svg",
  "./assets/icons/192.svg",
  "./assets/icons/512.svg",
  "./assets/icons/maskable.svg",
  "./assets/icons/apple-touch-icon.svg",
  "./assets/companion/marlowe.svg",
  "./assets/companion/pip.svg",
  "./assets/companion/steady.svg",
  "./assets/wallpapers/plain.svg",
  "./assets/wallpapers/lighthouse-dusk.svg",
  "./assets/wallpapers/botanical-line.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Never cache the lazy-loaded AI script (off by default; loaded on demand).
  if (url.hostname === "js.puter.com") { e.respondWith(fetch(req)); return; }
  // Same-origin: cache-first, then network (offline-first).
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match("./index.html"))));
    return;
  }
  // Cross-origin (e.g. grounding links, BYOK AI): just fetch.
  e.respondWith(fetch(req).catch(() => Response.error()));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type: "window" }).then(cs => {
    for (const c of cs) { if ("focus" in c) return c.focus(); }
    if (clients.openWindow) return clients.openWindow("./");
  }));
});
