// The Garden — lazy-loaded AI: Puter.js default + BYOK (plan §7). Loaded only on first invoke.

(function () {
  "use strict";
  window.Garden = window.Garden || {};
  let puterLoading = null;
  let aiSettings = null;

  async function settings() {
    if (!aiSettings) aiSettings = await Garden.db.getSingleton("ai_settings", { aiEnabled: false, provider: "puter", model: "google/gemini-flash-2.0", consentSeen: false, childFactsOptIn: false });
    return aiSettings;
  }
  function refresh(s) { aiSettings = s; }

  function loadPuter() {
    if (window.puter) return Promise.resolve();
    if (puterLoading) return puterLoading;
    puterLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://js.puter.com/v2/";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Could not load AI service."));
      document.head.appendChild(s);
    });
    return puterLoading;
  }

  async function complete(systemPrompt, userPrompt) {
    const s = await settings();
    if (!s.aiEnabled) throw new Error("AI is off.");
    if (s.provider === "byok") return byokComplete(s, systemPrompt, userPrompt);
    await loadPuter();
    if (!window.puter || !window.puter.ai) throw new Error("AI service unavailable.");
    const model = s.model || "google/gemini-flash-2.0";
    const opts = {};
    if (model.startsWith("gpt") || model.startsWith("openai")) opts.model = model;
    const resp = await window.puter.ai.chat([{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], opts);
    return unwrap(resp);
  }

  async function byokComplete(s, systemPrompt, userPrompt) {
    const key = s.byokKey || "";
    if (!key) throw new Error("No API key set. Add one in Settings or switch to the default provider.");
    if (s.byokProvider === "gemini") return geminiComplete(key, s.model || "gemini-2.0-flash", systemPrompt, userPrompt);
    if (s.byokProvider === "groq") return groqComplete(key, s.model || "llama-3.3-70b-versatile", systemPrompt, userPrompt);
    throw new Error("Unknown BYOK provider.");
  }

  async function geminiComplete(key, model, sys, usr) {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: usr }] }] })
    });
    if (!r.ok) throw new Error("Gemini error " + r.status);
    const j = await r.json();
    return j.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }
  async function groqComplete(key, model, sys, usr) {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST", headers: { "Content-Type": "application/json", "Authorization": "Bearer " + key },
      body: JSON.stringify({ model, messages: [{ role: "system", content: sys }, { role: "user", content: usr }] })
    });
    if (!r.ok) throw new Error("Groq error " + r.status);
    const j = await r.json();
    return j.choices?.[0]?.message?.content || "";
  }

  function unwrap(resp) {
    if (typeof resp === "string") return resp;
    if (resp && resp.message && resp.message.content) return resp.message.content;
    if (resp && resp.text) return resp.text;
    if (resp && resp.choices) return resp.choices[0]?.message?.content || "";
    try { return JSON.stringify(resp); } catch (e) { return ""; }
  }

  const BIFF_SYSTEM =
    "You help an Australian parent write a BIFF reply (Brief, Informative, Friendly, Firm) to a hostile email from their ex. " +
    "Rules: Australian English. Always BIFF. Never match the ex's tone. Never diagnose. Never give legal advice. " +
    "Always leave the user as the calm, child-focused, reasonable party on the record. No escalation. Keep it short.";

  async function digestEmail(emailText) {
    const user = "Summarise this email in calm, plain language: what's being said and what's actually being asked or proposed. Remove hostility, blame, and bait. Keep it short.\n\nEMAIL:\n" + emailText;
    return complete(BIFF_SYSTEM, user);
  }

  async function draftBiff({ emailText, digest, feelings, style }) {
    const few = style.example ? "Example of this style:\n" + style.example +
      (style.exampleToParent ? "\nTo the other parent: " + style.exampleToParent : "") +
      (style.exampleToChild ? "\nTo the child: " + style.exampleToChild : "") : "";
    const user = "Write a BIFF reply in the '" + style.name + "' style.\n" + few +
      "\n\nDigest of the ex's email:\n" + (digest || "") +
      "\n\nThe user's feelings and aims:\n" + (feelings || "") +
      "\n\nThe ex's original email (for context only — do not match its tone):\n" + (emailText || "") +
      "\n\nReturn only the reply, ready to send, signed 'Kind regards.'";
    return complete(BIFF_SYSTEM, user);
  }

  async function helpStartLetter({ memories }) {
    const LS = window.GardenContent.letterStructure;
    const sys = "You help an Australian parent write a weekly letter to their alienated child, using an established 4-part structure for alienated children. " +
      "Tone guardrails: short, warm, not seeking a reply, neutral life updates, no blame toward the other parent, no interrogating the child, no asking them to reply. " +
      "Never send as-is — always tell the parent to adapt it. Australian English.";
    const parts = LS.parts.map((p, i) => (i + 1) + ". " + p.title + ": " + p.prompt).join("\n");
    const user = "Write a short, warm letter to your child following this 4-part structure:\n" + parts +
      "\n\nUse these memories/facts if provided (only with consent):\n" + (memories || "(none provided — keep it general)") +
      "\n\nReturn only the letter, signed 'All my love, always.'";
    return complete(sys, user);
  }

  window.Garden.ai = { settings, refresh, complete, digestEmail, draftBiff, helpStartLetter, loadPuter };
})();
