window.GardenContent = window.GardenContent || {};

// Letter-to-child structure + tone guardrails (plan §13.9).
window.GardenContent.letterStructure = {
  cadence: "Weekly, same day/time. Don't fall silent — the very fact that you write keeps the thread alive in your child's inner world, even when the letter is read through disdain.",
  parts: [
    { id: "part-1", title: "Unconditional love + acknowledge distance",
      prompt: "Address the authentic child. Tell them you love them and hope they're well. Acknowledge the distance without blame." },
    { id: "part-2", title: "Brief, neutral life updates",
      prompt: "A sentence or two of reassurance that you're okay and stable. Not a performance — just 'I'm still here, and okay.'" },
    { id: "part-3", title: "One specific memory or a future hope",
      prompt: "A small, specific shared memory, or a gentle hope for the future. Signals life isn't permanently fixed; keeps the door open without pressure." },
    { id: "part-4", title: "Firm, loving reminder of permanence",
      prompt: "Close with a reminder that your love and the relationship are permanent, regardless of current rejection." }
  ],
  example: "[Child], I think of you every day and hope you're well. Things are quiet here — the garden's come back to life and I've been walking in the mornings. I still smile every time I pass the ice-cream shop near the old place; you'd laugh, they still have that ridiculous mint-choc-chip sign. None of that changes, and neither does how I feel about you. Whenever you're ready, I'm here. All my love, always.",
  toneGuardrails: [
    "Keep it short. Not very much is said in words; much is said symbolically.",
    "Do not write for a response or validation — that keeps you seeking approval from the defensive part.",
    "No blame toward the other parent. No interrogating the child. No asking them to reply.",
    "Combine with a photo or small token where possible (visceral impact).",
    "Never send a template as-is — adapt to your child."
  ],
  expectAndIgnore: "A big negative reaction means the letter reached the real, split-off part — it's the defensive part reacting. Ignore the reaction, wait a while, then write again."
};
