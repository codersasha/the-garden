// The Garden — BIFF helper (plan §7.3, §13.6). Manual template + checklist; calls ai.js when AI enabled.

(function () {
  "use strict";
  window.Garden = window.Garden || {};
  const C = window.GardenContent;

  // Manual template flow — works offline.
  function manualTemplate(target) {
    const LS = C.letterStructure; // not used here; BIFF uses biff-styles
    const styles = C.biffStyles;
    const root = target;
    root.innerHTML = "";
    root.appendChild(el("h2", "serif section-title", "BIFF helper — manual"));
    root.appendChild(el("p", "muted", C.biffExplainer));
    const ta = el("textarea"); ta.rows = 8; ta.placeholder = "Observation → your position → what you'd like → close. Keep it brief, factual, calm, firm.";
    root.appendChild(ta);
    root.appendChild(el("div", "spacer"));
    root.appendChild(el("h3", "serif", "Before you send"));
    const cl = el("ul", "list");
    C.biffChecklist.forEach(item => {
      const li = el("li", "item"); const lab = el("label");
      const cb = el("input"); cb.type = "checkbox"; lab.appendChild(cb); lab.appendChild(txt(" " + item));
      li.appendChild(lab); cl.appendChild(li);
    });
    root.appendChild(cl);
    root.appendChild(el("div", "spacer"));
    const a = el("div", "card-actions");
    const copy = btn("Copy to clipboard", "primary");
    copy.onclick = async () => {
      try { await navigator.clipboard.writeText(ta.value); Garden.app.toast("Copied."); }
      catch (e) { Garden.app.toast("Select the text and copy manually."); }
      if (ta.value.trim()) Garden.ledger.saveBiffDraft({ style: "manual", draft: ta.value });
    };
    const save = btn("Save draft", "ghost");
    save.onclick = () => { if (ta.value.trim()) { Garden.ledger.saveBiffDraft({ style: "manual", draft: ta.value }); } };
    a.appendChild(copy); a.appendChild(save);
    root.appendChild(a);
  }

  // AI flow — paste → digest → feelings → style → draft → checklist.
  async function aiFlow(target) {
    const root = target;
    root.innerHTML = "";
    root.appendChild(el("h2", "serif section-title", "BIFF helper — AI assist"));
    const aiSettings = await Garden.db.getSingleton("ai_settings", { aiEnabled: false, consentSeen: false });
    if (!aiSettings.aiEnabled || !aiSettings.consentSeen) {
      root.appendChild(el("p", "muted", "AI is off. Turn it on in Settings, or use the manual helper."));
      const a = el("div", "card-actions");
      const m = btn("Use manual helper", "primary"); m.onclick = () => manualTemplate(root); a.appendChild(m);
      const s = btn("Open AI settings", "ghost"); s.onclick = () => Garden.app.openSettings("ai"); a.appendChild(s);
      root.appendChild(a);
      return;
    }
    root.appendChild(el("p", "muted", "Step 1 — paste the email. It leaves your device to be analysed. You can stop here and use the manual helper instead."));
    const paste = el("textarea"); paste.rows = 6; paste.placeholder = "Paste the email here…";
    root.appendChild(paste);
    const a1 = el("div", "card-actions");
    const digest = btn("Digest it for me", "primary");
    const back = btn("Back to manual", "ghost");
    a1.appendChild(digest); a1.appendChild(back);
    root.appendChild(a1);
    digest.onclick = () => runDigest(root, paste.value);
    back.onclick = () => manualTemplate(root);
  }

  async function runDigest(root, emailText) {
    if (!emailText.trim()) { Garden.app.toast("Paste the email first."); return; }
    root.appendChild(el("div", "spacer"));
    const status = el("p", "muted", "Digesting, gently…");
    root.appendChild(status);
    try {
      const digest = await Garden.ai.digestEmail(emailText);
      const dBox = el("div", "item", "<strong>Plain-language digest:</strong><br>" + esc(digest));
      root.appendChild(dBox);
      runFeelings(root, emailText, digest);
    } catch (e) {
      status.textContent = "The AI couldn't reach just now. Use the manual helper.";
      const m = btn("Manual helper", "primary"); m.onclick = () => manualTemplate(root); root.appendChild(m);
    }
  }

  function runFeelings(root, emailText, digest) {
    root.appendChild(el("div", "spacer"));
    root.appendChild(el("p", "muted", "Step 2 — how does this make you feel, and what do you actually want to happen?"));
    const feel = el("textarea"); feel.rows = 4; feel.placeholder = "In your own words…"; root.appendChild(feel);
    const a2 = el("div", "card-actions");
    const next = btn("Next: pick a style", "primary"); a2.appendChild(next);
    root.appendChild(a2);
    next.onclick = () => runStyle(root, emailText, digest, feel.value);
  }

  function runStyle(root, emailText, digest, feelings) {
    root.appendChild(el("div", "spacer"));
    root.appendChild(el("p", "muted", "Step 3 — pick a style."));
    const grid = el("div", "presets");
    C.biffStyles.forEach(st => {
      const b = btn(st.name + " — " + st.blurb, "preset");
      b.style.textAlign = "left";
      b.onclick = () => runDraft(root, emailText, digest, feelings, st);
      grid.appendChild(b);
    });
    root.appendChild(grid);
  }

  async function runDraft(root, emailText, digest, feelings, style) {
    root.appendChild(el("div", "spacer"));
    const status = el("p", "muted", "Drafting, calmly…"); root.appendChild(status);
    try {
      const draft = await Garden.ai.draftBiff({ emailText, digest, feelings, style });
      const box = el("div", "item");
      box.appendChild(el("h3", "serif", "Draft — " + style.name));
      const ta = el("textarea"); ta.rows = 8; ta.value = draft; box.appendChild(ta);
      root.appendChild(box);
      // Checklist
      const cl = el("ul", "list");
      C.biffChecklist.forEach(item => { const li = el("li", "item"); const lab = el("label");
        const cb = el("input"); cb.type = "checkbox"; lab.appendChild(cb); lab.appendChild(txt(" " + item));
        li.appendChild(lab); cl.appendChild(li); });
      root.appendChild(cl);
      const a = el("div", "card-actions");
      const copy = btn("Copy", "primary");
      copy.onclick = async () => { try { await navigator.clipboard.writeText(ta.value); Garden.app.toast("Copied."); } catch (e) {} };
      const save = btn("Save draft", "ghost");
      save.onclick = () => Garden.ledger.saveBiffDraft({ style: style.id, exEmailDigest: digest, draft: ta.value });
      a.appendChild(copy); a.appendChild(save); root.appendChild(a);
    } catch (e) {
      status.textContent = "The AI couldn't draft just now. Falling back to manual.";
      const m = btn("Manual helper", "primary"); m.onclick = () => manualTemplate(root); root.appendChild(m);
    }
  }

  // helpers
  function el(tag, cls, html) { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function txt(s) { return document.createTextNode(s == null ? "" : s); }
  function btn(label, cls) { const b = el("button", cls, label); b.type = "button"; return b; }
  function esc(s) { return (s || "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c])); }

  window.Garden.biff = { manualTemplate, aiFlow };
})();
