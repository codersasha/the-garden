// Sources drawn on for this structure (transparency, not user-facing):
//   Karen Woodall — Letters Home to Your Children's Heart:
//     https://karenwoodall.blog/2018/12/13/letters-home-to-your-childrens-heart/
//   Karen Woodall — Write me a river: communicating with your alienated child:
//     https://karenwoodall.blog/2015/01/11/write-me-a-river-communicating-with-your-alienated-child/
//   AFCC & NCJFCJ — Joint Statement on Parent-Child Contact Problems:
//     https://www.afccnet.org/Resource-Center/Center-for-Excellence-in-Family-Court-Practice/afcc-and-ncjfcj-joint-statement-on-parent-child-contact-problems
//   Parents Beyond Breakup — https://www.parentsbeyondbreakup.com/
window.GardenContent = window.GardenContent || {};

// Letter-to-child structure + tone guardrails (plan §13.9).
// Format adapted from Karen Woodall's letter-to-alienated-child guidance:
// write to the split-off / authentic child, bypass the defensive part, expect
// a negative reaction and keep writing anyway.
window.GardenContent.letterStructure = {
  cadence: "Weekly, same day and time if you can. Don't fall silent — the very fact that you write keeps the thread alive in your child's inner world, even when the letter is read through disdain. Consistency matters more than content.",
  parts: [
    { id: "part-1", title: "Unconditional love + acknowledge distance",
      prompt: "Address the real child underneath. Tell them you love them and hope they're well. Acknowledge the distance gently, without blame on anyone — not even in passing." },
    { id: "part-2", title: "Brief, neutral life updates",
      prompt: "A sentence or two of reassurance that you're okay and stable. Not a performance — just 'I'm still here, and okay.' Keep it light and true." },
    { id: "part-3", title: "One specific memory or a future hope",
      prompt: "A small, specific shared memory, or a gentle hope for the future. Signals that life isn't permanently fixed and keeps the door open without any pressure to walk through it." },
    { id: "part-4", title: "Firm, loving reminder of permanence",
      prompt: "Close with a reminder that your love and the relationship are permanent, regardless of the current rejection. No asking for a reply." }
  ],
  example: "[Child], I think of you every day and hope you're well. Things are quiet here — the garden's come back to life and I've been walking in the mornings. I still smile every time I pass the ice-cream shop near the old place; you'd laugh, they still have that ridiculous mint-choc-chip sign. None of that changes, and neither does how I feel about you. Whenever you're ready, I'm here. All my love, always.",
  toneGuardrails: [
    "Keep it short. Not very much is said in words; much is said symbolically.",
    "Write from the parent in you — not for a response, and not to defend yourself. Seeking a reply keeps you hooked into the defensive part.",
    "No blame toward the other parent. No interrogating the child. No asking them to reply.",
    "Combine with a photo or small token where you can — the visual and visceral impact matters.",
    "Never send a template as-is. Adapt it to your own child and your own voice."
  ],
  expectAndIgnore: "A big negative reaction often means the letter reached the real, split-off part of your child — it's the defensive part reacting. Ignore the reaction, wait a while, then write again. Over time the defence softens and the letters get through."
};
