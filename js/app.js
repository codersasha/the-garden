// The Garden — bootstrap, router, screen orchestration (plan §5, §9, §12).
// Classic script; uses window.Garden namespace + event-free direct calls.

(function () {
  "use strict";
  window.Garden = window.Garden || {};

  let settings = {
    pinHash: null, pinSalt: null, pinWeak: false, stealth: true,
    palette: "dusk-plum", wallpaper: "wallpaper-plain", companion: null, companionMode: "on",
    themeMode: "dark", childName: "", soundscape: { enabled: false, volume: 0.5 },
    notifications: { morning: "07:30", morningOn: false, evening: "20:30", eveningOn: false,
      weekly: "09:00", weeklyDay: 0, weeklyOn: false, on: false },
    onboarded: false
  };
  let unlocked = false;
  let audioCtx = null;
  let soundscapeNodes = null;
  let breathSoftActive = false;

  // ---------- helpers ----------
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function show(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const s = $(screenId); if (s) s.classList.add("active");
    window.scrollTo(0, 0);
  }

  function toast(msg) {
    let t = $("toast");
    if (!t) { t = el("div", "toast"); t.id = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(t._timer); t._timer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function banner(msg) {
    let b = $("notify-banner");
    if (!b) { b = el("div", "notify-banner"); b.id = "notify-banner"; document.body.appendChild(b); }
    b.innerHTML = '<span>' + esc(msg) + '</span> <button class="ghost" type="button">Close</button>';
    b.classList.add("show");
    b.querySelector("button").onclick = () => b.classList.remove("show");
    setTimeout(() => b.classList.remove("show"), 12000);
  }
  function esc(s) { return (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

  function petalBloom() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const b = el("div", "petal-bloom", "🌸");
    const x = window.innerWidth / 2 + (Math.random() * 60 - 30);
    const y = window.innerHeight - 120;
    b.style.left = x + "px"; b.style.top = y + "px";
    document.body.appendChild(b);
    setTimeout(() => b.remove(), 950);
  }

  // ---------- settings ----------
  function getSettings() { return settings; }
  function childName() { return settings.childName || ""; }
  function isOnCover() { return $("diary-cover").classList.contains("active"); }

  async function saveSettings(next) {
    settings = { ...settings, ...next };
    await Garden.db.setSingleton("settings", settings);
    Garden.theme.apply(settings);
    applyWallpaper();
    Garden.companions.refresh();
    Garden.notify.scheduleAll(settings);
  }

  // ---------- petals ----------
  async function addPetals(n) {
    if (n <= 0) return;
    await Garden.shop.addPetals(n);
    petalBloom();
    updatePetals();
  }
  function updatePetals() {
    const p = $("petals");
    if (p) p.textContent = "🌸 " + Garden.shop.petals();
  }

  // ---------- deck actions ----------
  function snooze() { Garden.deck.snoozeCurrent(Garden.db); }
  function markDone() { Garden.deck.markDone(Garden.db); }
  function restoreAll() { Garden.deck.restoreAll(Garden.db); renderCurrentCard(); }
  function openToFirstCard() { unlockAndGo(); }

  function renderCurrentCard() {
    const holder = $("cardHolder");
    if (!holder) return;
    holder.innerHTML = "";
    const card = Garden.deck.current();
    if (!card) { Garden.deck.next(); return renderCurrentCard(); }
    const node = Garden.cards.render(card);
    holder.appendChild(node);
    updateDeckControls();
  }
  function updateDeckControls() {
    const c = $("deckControls");
    if (c) c.innerHTML = "";
  }

  // ---------- PIN / diary ----------
  let pinEntry = "";

  async function bootstrap() {
    await Garden.db.open();
    await Garden.migrations.runAll(Garden.db);
    settings = { ...settings, ...(await Garden.db.getSingleton("settings", settings)) };
    await Garden.shop.load();
    Garden.theme.apply(settings);
    applyWallpaper();
    Garden.swRegister.register();

    // If migrations self-test fails in dev, warn (non-blocking).
    if (!Garden.migrations.selfTest()) console.warn("[The Garden] migration self-test failed.");

    if (!settings.pinHash) {
      showSetupPin();
    } else {
      showSplashThenCover();
    }
  }

  function showSplashThenCover() {
    show("splash"); // splash is full-screen overlay, not a .screen
    const sp = $("splash"); sp.classList.add("active");
    setTimeout(() => {
      sp.classList.remove("active");
      const cover = $("diary-cover"); cover.classList.add("active");
      // render cover
      renderCover();
      // show pin pad
      setTimeout(() => { $("pin-pad").classList.add("active"); setupPinPad("unlock"); }, 600);
    }, 1100);
  }

  function renderCover() {
    const cover = $("diaryCoverInner");
    cover.innerHTML = "";
    cover.appendChild(el("div", "cover-title", "The Garden"));
    cover.appendChild(el("div", "cover-sub", "A quiet companion"));
    cover.appendChild(el("div", "cover-keyhole", "✦"));
    if (settings.childName) cover.appendChild(el("div", "cover-watermark", "for " + settings.childName));
  }

  function showSetupPin() {
    $("splash").classList.remove("active");
    const cover = $("diary-cover"); cover.classList.add("active");
    renderCover();
    cover.querySelector(".cover-sub").textContent = "First, set a PIN to lock your diary.";
    $("pin-pad").classList.add("active");
    setupPinPad("setup");
  }

  function setupPinPad(mode) {
    pinEntry = "";
    renderPinDots();
    const grid = $("pinGrid");
    grid.innerHTML = "";
    ["1","2","3","4","5","6","7","8","9"].forEach(d => {
      const b = el("button", "", d); b.type = "button";
      b.onclick = () => pressDigit(d, mode);
      grid.appendChild(b);
    });
    const zero = el("button", "", "0"); zero.type = "button"; zero.onclick = () => pressDigit("0", mode);
    const del = el("button", "fn", "⌫"); del.type = "button"; del.onclick = () => { pinEntry = pinEntry.slice(0, -1); renderPinDots(); };
    const fin = mode === "setup" ? el("button", "fn", "OK") : el("button", "fn", "");
    fin.type = "button";
    if (mode === "setup") fin.onclick = () => confirmSetup(mode);
    grid.appendChild(del); grid.appendChild(zero); grid.appendChild(fin);
    $("pinMsg").textContent = mode === "setup" ? "Choose a 4-digit PIN" : "Enter your PIN";
  }

  function renderPinDots() {
    const dots = $("pinDots");
    dots.innerHTML = "";
    for (let i = 0; i < 4; i++) { const d = el("span", "dot" + (i < pinEntry.length ? " filled" : "")); dots.appendChild(d); }
  }

  async function pressDigit(d, mode) {
    if (pinEntry.length >= 4) return;
    pinEntry += d;
    renderPinDots();
    Garden.app.softTone(520, 0.05);
    if (pinEntry.length === 4) {
      setTimeout(() => mode === "setup" ? confirmSetup(mode) : tryUnlock(), 150);
    }
  }

  let setupFirstPin = null;
  async function confirmSetup(mode) {
    if (setupFirstPin == null) {
      setupFirstPin = pinEntry;
      pinEntry = ""; renderPinDots();
      $("pinMsg").textContent = "Enter it again to confirm";
      return;
    }
    if (setupFirstPin !== pinEntry) {
      $("pinDots").classList.add("shake");
      setTimeout(() => $("pinDots").classList.remove("shake"), 500);
      pinEntry = ""; setupFirstPin = null; renderPinDots();
      $("pinMsg").textContent = "Didn't match. Try again.";
      return;
    }
    const hash = await Garden.crypto.makeHash(pinEntry);
    await saveSettings({ pinHash: hash.hash, pinSalt: hash.salt, pinWeak: !!hash.weak });
    setupFirstPin = null; pinEntry = "";
    $("pin-pad").classList.remove("active");
    $("diary-cover").classList.remove("active");
    $("splash").classList.remove("active");
    await unlockAndGo();
  }

  async function tryUnlock() {
    const ok = await Garden.crypto.verify(pinEntry, { hash: settings.pinHash, salt: settings.pinSalt });
    if (ok) {
      pinEntry = "";
      $("pin-pad").classList.remove("active");
      // diary open animation
      document.body.classList.add("diary-opening");
      setTimeout(() => {
        document.body.classList.remove("diary-opening");
        $("diary-cover").classList.remove("active");
        unlockAndGo();
      }, 700);
    } else {
      $("pinDots").classList.add("shake");
      setTimeout(() => $("pinDots").classList.remove("shake"), 500);
      pinEntry = ""; renderPinDots();
      $("pinMsg").textContent = "Try again";
    }
  }

  async function unlockAndGo() {
    unlocked = true;
    await Garden.deck.loadState(Garden.db);
    Garden.deck.reshuffle();
    Garden.deck.next();
    buildAppChrome();
    show("deck-screen");
    renderCurrentCard();
    updatePetals();
    Garden.companions.refresh();
    Garden.notify.scheduleAll(settings);
    maybeBackupReminder();
    if (!settings.onboarded) {
      await saveSettings({ onboarded: true });
      setTimeout(() => openAbout(true), 400);
    }
  }

  // Gentle, dismissible monthly backup reminder (plan §9 / Wave 6).
  async function maybeBackupReminder() {
    const now = Date.now();
    const last = settings.lastBackupReminder ? new Date(settings.lastBackupReminder).getTime() : 0;
    if (!last || (now - last) > 30 * 86400000) {
      await saveSettings({ lastBackupReminder: new Date().toISOString() });
      banner("It's been a little while. A fresh backup keeps your garden safe — Settings → Export my garden.");
    }
  }

  // ---------- app chrome ----------
  function buildAppChrome() {
    const header = $("appHeader");
    header.innerHTML = "";
    header.appendChild(el("button", "icon-btn", "☰"));
    header.querySelector(".icon-btn").onclick = openMenu;
    header.appendChild(el("div", "brand", "The Garden"));
    const sc = el("button", "icon-btn soundscape-toggle", settings.soundscape && settings.soundscape.enabled ? "🔊" : "♪");
    sc.onclick = toggleSoundscape;
    sc.id = "scToggle";
    header.appendChild(sc);
    const p = el("div", "petals"); p.id = "petals"; p.textContent = "🌸 " + Garden.shop.petals();
    header.appendChild(p);

    const footer = $("crisisFooter");
    footer.innerHTML = "";
    const fb = el("button", "", "If you need help right now — tap here");
    fb.onclick = openCrisis;
    footer.appendChild(fb);
  }

  // ---------- menu ----------
  function openMenu() {
    const m = $("modal");
    const sheet = $("modalSheet");
    sheet.innerHTML = "";
    sheet.appendChild(el("button", "close icon-btn", "✕"));
    sheet.querySelector(".close").onclick = closeModal;
    sheet.appendChild(el("h2", "serif", "The Garden"));
    const list = el("ul", "menu-list");
    const items = [
      ["The deck", () => { closeModal(); show("deck-screen"); renderCurrentCard(); }],
      ["The love ledger", () => { closeModal(); openLedger(); }],
      ["Read on hard days", () => { closeModal(); openSaved(); }],
      ["Browse by mode", () => { closeModal(); openBrowse(); }],
      ["Shop", () => { closeModal(); openShop(); }],
      ["About this app", () => { closeModal(); openAbout(false); }],
      ["Settings", () => { closeModal(); openSettings(null); }],
      ["Export / backup", () => { closeModal(); doExport(); }],
      ["Restore from backup", () => { closeModal(); doImport(); }]
    ];
    items.forEach(([label, fn]) => { const b = el("button", "", label); b.type = "button"; b.onclick = fn; const li = el("li"); li.appendChild(b); list.appendChild(li); });
    sheet.appendChild(list);
    m.classList.add("open");
  }
  function closeModal() { $("modal").classList.remove("open"); }

  // ---------- ledger ----------
  async function openLedger() {
    show("ledger-screen");
    const wrap = $("ledgerList"); wrap.innerHTML = "";
    wrap.appendChild(el("h2", "serif section-title", "The love ledger"));
    wrap.appendChild(el("p", "muted", "On hard days, read it back."));
    const rows = await Garden.ledger.listLedger();
    const acts = await Garden.ledger.listRealLifeActs();
    const all = [...rows, ...acts].sort((a, b) => b.date.localeCompare(a.date));
    if (!all.length) { wrap.appendChild(el("p", "empty", "Nothing here yet — that's okay. Your first entry will show up here.")); return; }
    const list = el("div", "list");
    all.forEach(r => {
      const it = el("div", "item");
      const label = r.preset || r.note || r.label || "an entry";
      it.appendChild(el("div", "", esc(label)));
      it.appendChild(el("div", "meta", new Date(r.date).toLocaleString("en-AU") + (r.tag ? " · " + r.tag : "")));
      list.appendChild(it);
    });
    wrap.appendChild(list);
  }
  function refreshLedgerIfOpen() { if ($("ledger-screen").classList.contains("active")) openLedger(); }

  async function openSaved() {
    show("saved-screen");
    const wrap = $("savedList"); wrap.innerHTML = "";
    wrap.appendChild(el("h2", "serif section-title", "Read on hard days"));
    wrap.appendChild(el("p", "muted", "Affirmations and wisdom you've kept."));
    const aff = await Garden.ledger.listSavedAffirmations();
    if (!aff.length) { wrap.appendChild(el("p", "empty", "Nothing saved yet. When a line lands, tap 'Save'.")); return; }
    const list = el("div", "list");
    aff.forEach(r => { const it = el("div", "item"); it.appendChild(el("div", "", esc(r.text))); it.appendChild(el("div", "meta", new Date(r.date).toLocaleDateString("en-AU"))); list.appendChild(it); });
    wrap.appendChild(list);
  }

  // ---------- browse ----------
  function openBrowse() {
    show("browse-screen");
    const wrap = $("browseList"); wrap.innerHTML = "";
    wrap.appendChild(el("h2", "serif section-title", "Browse by mode"));
    const modes = Garden.deck.allModes();
    const row = el("div", "tag-row");
    modes.forEach(m => { const b = el("button", "", m); b.type = "button"; b.onclick = () => renderBrowseMode(m); row.appendChild(b); });
    wrap.appendChild(row);
    const holder = el("div", "list"); holder.id = "browseItems"; wrap.appendChild(holder);
  }
  function renderBrowseMode(mode) {
    const holder = $("browseItems"); holder.innerHTML = "";
    const cards = Garden.deck.browseByMode(mode);
    cards.forEach(c => {
      const it = el("div", "item");
      const label = c.data ? (c.data.text || c.data.title || c.data.why || "") : (c.type);
      it.appendChild(el("div", "", esc(label)));
      const open = el("button", "ghost", "Show as card"); open.type = "button";
      open.onclick = () => { Garden.deck.reshuffle(); show("deck-screen"); const node = Garden.cards.render(c); const h = $("cardHolder"); h.innerHTML = ""; h.appendChild(node); };
      it.appendChild(open);
      holder.appendChild(it);
    });
  }

  // ---------- shop ----------
  function openShop() {
    show("shop-screen");
    const wrap = $("shopList"); wrap.innerHTML = "";
    wrap.appendChild(el("h2", "serif section-title", "The garden shop"));
    wrap.appendChild(el("p", "muted", "Spend petals on calm palettes, wallpapers, and companions. Your inventory survives updates."));
    const inv = Garden.shop.get();
    const cats = ["palette", "wallpaper", "companion"];
    cats.forEach(cat => {
      wrap.appendChild(el("h3", "serif", cat[0].toUpperCase() + cat.slice(1) + "s"));
      const grid = el("div", "shop-grid");
      Garden.shop.catalogue().items.filter(i => i.type === cat).forEach(item => {
        const c = el("div", "shop-card");
        if (Garden.shop.isNew(item)) c.appendChild(el("div", "new-ribbon", "NEW"));
        if (inv.ownedItemIds.includes(item.id)) c.classList.add("owned");
        if (inv.equipped[cat] === item.id) c.classList.add("equipped");
        if (item.artRef) { const im = el("img"); im.src = item.artRef; im.alt = item.name; im.style.width = "64px"; im.style.height = "64px"; c.appendChild(im); }
        c.appendChild(el("div", "name", item.name));
        c.appendChild(el("div", "cost", inv.ownedItemIds.includes(item.id) ? "Owned" : "🌸 " + item.cost));
        const b = el("button", inv.equipped[cat] === item.id ? "ghost" : "primary",
          inv.equipped[cat] === item.id ? "Equipped" : inv.ownedItemIds.includes(item.id) ? "Equip" : "Buy");
        b.type = "button";
        b.onclick = async () => {
          if (inv.ownedItemIds.includes(item.id)) { await Garden.shop.equip(item.id); openShop(); }
          else { const r = await Garden.shop.buy(item.id); if (r.ok) { toast("Purchased."); openShop(); } else toast(r.reason); }
          updatePetals();
        };
        c.appendChild(b);
        grid.appendChild(c);
      });
      wrap.appendChild(grid);
    });
  }

  // ---------- about ----------
  // About / onboarding — one soft card at a time (calm, intentional; plan §20.1).
  let aboutIdx = 0;
  function openAbout(onboard) {
    show("about-screen");
    aboutIdx = 0;
    renderAboutCard(onboard);
  }
  function renderAboutCard(onboard) {
    const wrap = $("aboutList"); wrap.innerHTML = "";
    const a = window.GardenContent.about;
    const sections = a.sections;
    const i = aboutIdx;
    const s = sections[i];
    const isLast = i === sections.length - 1;

    const card = el("div", "about-card");
    card.appendChild(el("span", "about-pill", "About &middot; " + (i + 1) + " / " + sections.length));
    card.appendChild(el("h3", "serif", esc(s.title)));
    if (s.body) card.appendChild(el("p", "about-body", esc(s.body)));
    if (s.list) { const ul = el("ul", "about-list"); s.list.forEach(li => { const l = el("li"); l.textContent = li; ul.appendChild(l); }); card.appendChild(ul); }
    if (s.after) card.appendChild(el("p", "about-after", esc(s.after)));
    if (isLast) card.appendChild(el("p", "about-close", esc(a.close)));
    wrap.appendChild(card);

    const nav = el("div", "about-nav");
    const back = el("button", "ghost", "\u2190 Back");
    back.type = "button";
    if (i === 0) back.style.visibility = "hidden";
    else back.onclick = () => { aboutIdx--; renderAboutCard(onboard); };
    const dots = el("div", "dots");
    sections.forEach((_, di) => dots.appendChild(el("span", "dot" + (di === i ? " on" : ""))));
    const next = el("button", isLast ? "primary" : "", isLast ? (onboard ? "Begin" : "Done") : "Next \u2192");
    next.type = "button";
    next.onclick = () => {
      if (isLast) { show("deck-screen"); renderCurrentCard(); }
      else { aboutIdx++; renderAboutCard(onboard); }
    };
    nav.appendChild(back); nav.appendChild(dots); nav.appendChild(next);
    wrap.appendChild(nav);

    if (isLast) wrap.appendChild(el("p", "muted small", window.GardenContent.nonAffiliation));
    window.scrollTo(0, 0);
  }

  // ---------- settings ----------
  function openSettings(tab) {
    show("settings-screen");
    const wrap = $("settingsList"); wrap.innerHTML = "";
    wrap.appendChild(el("h2", "serif section-title", "Settings"));

    // Child name
    wrap.appendChild(el("h3", "serif", "Your child"));
    const cn = el("input"); cn.type = "text"; cn.value = settings.childName || ""; cn.placeholder = "Your child's name (optional)";
    const cnSave = el("button", "primary", "Save"); cnSave.type = "button";
    cnSave.onclick = async () => { await saveSettings({ childName: cn.value.trim() }); toast("Saved."); renderCover(); };
    const cnRow = el("div", "row"); cnRow.appendChild(cn); cnRow.appendChild(cnSave);
    wrap.appendChild(cnRow);

    // Theme
    wrap.appendChild(el("h3", "serif", "Theme"));
    const palRow = el("div", "tag-row");
    Garden.theme.list().forEach(p => {
      const b = el("button", settings.palette === p ? "selected" : "", p.replace("-", " "));
      b.type = "button"; b.onclick = async () => { await saveSettings({ palette: p }); openSettings(tab); };
      palRow.appendChild(b);
    });
    wrap.appendChild(palRow);
    const modeRow = el("div", "tag-row");
    ["dark", "light", "system"].forEach(m => {
      const b = el("button", settings.themeMode === m ? "selected" : "", m);
      b.type = "button"; b.onclick = async () => { await saveSettings({ themeMode: m }); openSettings(tab); };
      modeRow.appendChild(b);
    });
    wrap.appendChild(modeRow);

    // Companions
    wrap.appendChild(el("h3", "serif", "Companions"));
    const cmRow = el("div", "tag-row");
    [["on", "On"], ["cover-only", "Only on cover"], ["off", "Off"]].forEach(([v, l]) => {
      const b = el("button", (settings.companionMode || "on") === v ? "selected" : "", l);
      b.type = "button"; b.onclick = async () => { await saveSettings({ companionMode: v }); openSettings(tab); };
      cmRow.appendChild(b);
    });
    wrap.appendChild(cmRow);

    // Soundscape
    wrap.appendChild(el("h3", "serif", "Soundscape"));
    const scBtn = el("button", "primary", settings.soundscape && settings.soundscape.enabled ? "Turn off" : "Turn on");
    scBtn.type = "button"; scBtn.onclick = async () => {
      const next = { ...settings.soundscape, enabled: !settings.soundscape.enabled };
      await saveSettings({ soundscape: next });
      if (next.enabled) startSoundscape(); else stopSoundscape();
      buildAppChrome(); openSettings(tab);
    };
    wrap.appendChild(scBtn);

    // Notifications
    wrap.appendChild(el("h3", "serif", "Daily anchors"));
    const notNote = el("p", "muted", "Off by default. Calm, local, never naggy. Respect Do Not Disturb.");
    wrap.appendChild(notNote);
    ["morning", "evening", "weekly"].forEach(kind => {
      const row = el("div", "row");
      const cb = el("input"); cb.type = "checkbox"; cb.checked = !!settings.notifications[kind + "On"];
      const lab = el("label");
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(" " + (kind === "weekly" ? "Weekly letter" : kind + " reminder")));
      const time = el("input"); time.type = "time"; time.value = settings.notifications[kind] || "07:30";
      row.appendChild(lab); row.appendChild(time);
      if (kind === "weekly") {
        const sel = el("select");
        ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].forEach((d, i) => {
          const o = el("option"); o.value = i; o.textContent = d; if ((settings.notifications.weeklyDay || 0) == i) o.selected = true; sel.appendChild(o);
        });
        row.appendChild(sel);
        sel.onchange = async () => { await saveSettings({ notifications: { ...settings.notifications, weeklyDay: Number(sel.value) } }); };
      }
      const apply = el("button", "ghost", "Set"); apply.type = "button";
      apply.onclick = async () => {
        const next = { ...settings.notifications, on: true, [kind]: time.value, [kind + "On"]: cb.checked };
        await saveSettings({ notifications: next });
        if (cb.checked) await Garden.notify.permission();
        toast("Saved.");
      };
      row.appendChild(apply);
      wrap.appendChild(row);
    });

    // AI
    wrap.appendChild(el("h3", "serif", "AI-assisted writing"));
    const aiNote = el("p", "muted", "Opt-in. Off by default. The only feature that touches the network. Your ex's email leaves your device only if you turn this on.");
    wrap.appendChild(aiNote);
    Garden.db.getSingleton("ai_settings", { aiEnabled: false, consentSeen: false, provider: "puter", byokProvider: "gemini", byokKey: "", model: "google/gemini-flash-2.0", childFactsOptIn: false }).then(ai => {
      const consent = el("label"); const ccb = el("input"); ccb.type = "checkbox"; ccb.checked = !!ai.consentSeen;
      consent.appendChild(ccb); consent.appendChild(document.createTextNode(" I understand the AI feature sends text off my device."));
      wrap.appendChild(consent);
      const enable = el("label"); const ecb = el("input"); ecb.type = "checkbox"; ecb.checked = !!ai.aiEnabled;
      enable.appendChild(ecb); enable.appendChild(document.createTextNode(" Enable AI-assisted writing"));
      wrap.appendChild(enable);
      const provRow = el("div", "row");
      const prov = el("select");
      [["puter", "Default (keyless)"], ["byok", "Bring your own key"]].forEach(([v, l]) => { const o = el("option"); o.value = v; o.textContent = l; if (ai.provider === v) o.selected = true; prov.appendChild(o); });
      provRow.appendChild(prov);
      const saveAi = el("button", "primary", "Save AI settings"); saveAi.type = "button";
      saveAi.onclick = async () => {
        const next = { ...ai, consentSeen: ccb.checked, aiEnabled: ecb.checked && ccb.checked, provider: prov.value };
        await Garden.db.setSingleton("ai_settings", next);
        Garden.ai.refresh(next);
        toast(ecb.checked && !ccb.checked ? "Tick the consent box first." : "AI settings saved.");
        openSettings(tab);
      };
      provRow.appendChild(saveAi);
      wrap.appendChild(provRow);
      // BYOK fields
      if (ai.provider === "byok") {
        const kp = el("input"); kp.type = "password"; kp.placeholder = "API key"; kp.value = ai.byokKey || "";
        const ks = el("input"); ks.type = "text"; ks.placeholder = "model"; ks.value = ai.model || "";
        wrap.appendChild(kp); wrap.appendChild(ks);
        const ksBtn = el("button", "ghost", "Save key/model"); ksBtn.type = "button";
        ksBtn.onclick = async () => { const next = { ...ai, byokKey: kp.value, model: ks.value }; await Garden.db.setSingleton("ai_settings", next); Garden.ai.refresh(next); toast("Saved."); };
        wrap.appendChild(ksBtn);
      }
    });

    // Danger
    wrap.appendChild(el("h3", "serif", "Data"));
    const exp = el("button", "primary", "Export my garden"); exp.type = "button"; exp.onclick = doExport; wrap.appendChild(exp);
    const imp = el("button", "ghost", "Restore from backup"); imp.type = "button"; imp.onclick = doImport; wrap.appendChild(imp);
    const wipe = el("button", "ghost", "Wipe all data"); wipe.type = "button";
    wipe.onclick = async () => {
      if (!confirm("This will erase everything on this device. Are you sure? This can't be undone.")) return;
      if (!confirm("Really wipe all your garden data? Consider exporting a backup first.")) return;
      for (const s of Garden.db.STORES) await Garden.db.clear(s);
      toast("Wiped. Reloading…"); setTimeout(() => location.reload(), 800);
    };
    wrap.appendChild(wipe);
  }

  // ---------- letter writer ----------
  function openLetter(part) {
    show("letter-screen");
    const wrap = $("letterList"); wrap.innerHTML = "";
    const LS = window.GardenContent.letterStructure;
    wrap.appendChild(el("h2", "serif section-title", "A few lines to " + (settings.childName || "your child")));
    wrap.appendChild(el("p", "muted", LS.cadence));
    LS.parts.forEach(p => {
      const block = el("div", "item");
      block.appendChild(el("h3", "serif", p.title));
      block.appendChild(el("p", "muted", p.prompt));
      wrap.appendChild(block);
    });
    const ta = el("textarea"); ta.rows = 10; ta.placeholder = "Write here…"; ta.value = LS.example.replace(/\[Child\]/g, settings.childName || "[child]");
    wrap.appendChild(ta);
    const a = el("div", "card-actions");
    const ai = el("button", "ghost", "Help me start (AI)"); ai.type = "button";
    ai.onclick = async () => {
      ai.disabled = true; ai.textContent = "Thinking…";
      try {
        const memories = await Garden.ledger.listMemories();
        const memText = settings.childName ? memories.slice(-5).map(m => m.body).join("\n") : "";
        const draft = await Garden.ai.helpStartLetter({ childName: settings.childName, memories: memText });
        ta.value = draft;
      } catch (e) { toast("AI unavailable. Use the scaffold above."); }
      ai.disabled = false; ai.textContent = "Help me start (AI)";
    };
    const save = el("button", "primary", "Save to the love ledger"); save.type = "button";
    save.onclick = async () => { if (ta.value.trim()) { await Garden.ledger.saveLetter(ta.value.trim()); const r = el("p", "muted", LS.expectAndIgnore); wrap.appendChild(r); } else toast("Write a few lines first."); };
    a.appendChild(ai); a.appendChild(save);
    wrap.appendChild(a);
    wrap.appendChild(el("p", "muted", "Never send a template as-is. Adapt to your child."));
  }

  // ---------- biff flow ----------
  function openBiff(opts) {
    show("biff-screen");
    const wrap = $("biffList");
    if (opts && opts.mode === "ai") Garden.biff.aiFlow(wrap);
    else Garden.biff.manualTemplate(wrap);
  }

  // ---------- crisis ----------
  function openCrisis() {
    const m = $("modal"); const sheet = $("modalSheet"); sheet.innerHTML = "";
    sheet.appendChild(el("button", "close icon-btn", "✕")); sheet.querySelector(".close").onclick = closeModal;
    sheet.appendChild(el("h2", "serif", "If you need help right now"));
    sheet.appendChild(el("p", "muted", "You don't have to be in immediate danger to reach out. These are free and confidential."));
    const list = el("div", "list");
    window.GardenContent.resources.forEach(r => {
      const it = el("div", "item");
      const a = el("a", ""); a.href = r.href; if (r.external) { a.target = "_blank"; a.rel = "noopener"; }
      a.textContent = (r.name + (r.number ? " — " + r.number : ""));
      it.appendChild(a);
      it.appendChild(el("div", "meta", r.note + (r.always24 ? " · 24/7" : "")));
      if (r.top) it.style.borderColor = "var(--rose)";
      list.appendChild(it);
    });
    sheet.appendChild(list);
    sheet.appendChild(el("p", "muted small", window.GardenContent.nonAffiliation));
    m.classList.add("open");
  }

  // ---------- export / import ----------
  async function doExport() {
    const bundle = await Garden.db.exportAll(false);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = el("a"); a.href = a.download = "garden-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    a.href = url; a.download = "garden-backup-" + new Date().toISOString().slice(0, 10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    await saveSettings({ lastExport: new Date().toISOString() });
    toast("Backup downloaded. Save it somewhere safe.");
  }
  function doImport() {
    const input = el("input"); input.type = "file"; input.accept = "application/json,.json";
    input.onchange = async () => {
      const f = input.files[0]; if (!f) return;
      try {
        const text = await f.text();
        const bundle = JSON.parse(text);
        const mode = confirm("Merge with existing data? Cancel to replace everything.") ? "merge" : "replace";
        await Garden.db.importAll(bundle, mode);
        toast("Restored. Reloading…"); setTimeout(() => location.reload(), 800);
      } catch (e) { toast("That doesn't look like a garden backup."); }
    };
    input.click();
  }

  // ---------- soundscape (Web Audio lo-fi ambient — plan §12.1) ----------
  function ensureAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }
  function toggleSoundscape() {
    const next = { ...settings.soundscape, enabled: !settings.soundscape.enabled };
    saveSettings({ soundscape: next });
    if (next.enabled) startSoundscape(); else stopSoundscape();
    buildAppChrome();
  }
  function startSoundscape() {
    try {
      const ctx = ensureAudio(); if (ctx.state === "suspended") ctx.resume();
      stopSoundscape();
      const master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      master.gain.linearRampToValueAtTime((settings.soundscape.volume || 0.5) * 0.18, ctx.currentTime + 2);
      // soft pad — slow chord cycle on minor 7th
      const pad = ctx.createGain(); pad.gain.value = 0.5; pad.connect(master);
      const chords = [[220, 261.6, 329.6], [196, 246.9, 311.1], [174.6, 220, 261.6]];
      let ci = 0;
      const oscs = [];
      function playChord() {
        oscs.forEach(o => o.stop()); oscs.length = 0;
        chords[ci].forEach(freq => {
          const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq;
          const g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(pad);
          g.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 2);
          o.start(); oscs.push(o); oscs.push({ stop: () => { try { g.gain.linearRampToValueAtTime(0, ctx.currentTime + 2); o.stop(ctx.currentTime + 2.2); } catch (e) {} } });
        });
        ci = (ci + 1) % chords.length;
      }
      playChord();
      const chordTimer = setInterval(playChord, 8000);
      // gentle vinyl crackle (filtered noise bursts)
      const crackleTimer = setInterval(() => {
        if (document.hidden) return;
        const buf = ctx.createBuffer(1, 800, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 0.3 : 0);
        const src = ctx.createBufferSource(); src.buffer = buf;
        const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = 2000;
        const g = ctx.createGain(); g.gain.value = 0.04; src.connect(f); f.connect(g); g.connect(master);
        src.start();
      }, 1200);
      soundscapeNodes = { master, chordTimer, crackleTimer };
      document.addEventListener("visibilitychange", visHandler);
    } catch (e) { console.warn("soundscape failed", e); }
  }
  function visHandler() {
    if (!soundscapeNodes) return;
    const ctx = audioCtx;
    if (document.hidden) soundscapeNodes.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
    else soundscapeNodes.master.gain.linearRampToValueAtTime((settings.soundscape.volume || 0.5) * 0.18, ctx.currentTime + 1);
  }
  function stopSoundscape() {
    if (!soundscapeNodes) return;
    clearInterval(soundscapeNodes.chordTimer); clearInterval(soundscapeNodes.crackleTimer);
    try { const ctx = audioCtx; soundscapeNodes.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1); } catch (e) {}
    document.removeEventListener("visibilitychange", visHandler);
    soundscapeNodes = null;
  }
  function softTone(freq, dur) {
    try {
      const ctx = ensureAudio(); if (ctx.state === "suspended") ctx.resume();
      // softens under soundscape? keep simple: gentle sine ping
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq || 440;
      const g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime;
      g.gain.linearRampToValueAtTime(0.06, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.4));
      o.start(t); o.stop(t + (dur || 0.4) + 0.05);
    } catch (e) {}
  }

  // ---------- wallpaper ----------
  function applyWallpaper() {
    const w = settings.wallpaper;
    // Visual wallpaper is subtle; applied as a body background image if artRef exists.
    const item = Garden.shop.itemById(w);
    if (item && item.artRef) {
      document.body.style.backgroundImage = "url(" + item.artRef + ")";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundBlendMode = "overlay";
    } else {
      document.body.style.backgroundImage = "";
    }
  }

  // ---------- public API ----------
  window.Garden.app = {
    bootstrap, show, toast, banner, softTone,
    settings: getSettings, saveSettings, childName, isOnCover,
    addPetals, markDone, snooze, restoreAll, openToFirstCard,
    openLetter, openBiff, openSettings, openAbout,
    refreshLedgerIfOpen, applyWallpaper,
    isUnlocked: () => unlocked
  };

  // Boot on DOM ready.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootstrap);
  else bootstrap();
})();
