window.GardenContent = window.GardenContent || {};

// Victory presets — ported verbatim from the Love Ledger squares (plan §13.3).
window.GardenContent.victoryPresets = [
  { id: "vp-letter", text: "Wrote a letter to your kids — kept safe for when they're ready", tag: "for-your-kids" },
  { id: "vp-diary", text: "Logged an entry in your connection diary", tag: "for-your-kids" },
  { id: "vp-school", text: "Liaised with school about something that matters", tag: "for-your-kids" },
  { id: "vp-counsellor-child", text: "Spoke with a counsellor about your child's wellbeing", tag: "for-your-kids" },
  { id: "vp-social-media", text: "Created social media your kids might find you on someday", tag: "for-your-kids" },
  { id: "vp-research", text: "Researched something they're into — just to feel closer", tag: "for-your-kids" },
  { id: "vp-prayer", text: "Sent a prayer, thought, or wish to them before sleep", tag: "for-your-kids" },
  { id: "vp-biff", text: "Responded to a hostile email in BIFF style", tag: "for-your-kids" },
  { id: "vp-makeup-time", text: "Negotiated make-up time in good faith", tag: "for-your-kids" },
  { id: "vp-supervised", text: "Agreed to supervised visits to keep the door open", tag: "for-your-kids" },
  { id: "vp-showed-love", text: "Showed love when faced with difficult behaviour", tag: "for-your-kids" },
  { id: "vp-turned-up", text: "Turned up to an event even when you were shamed", tag: "for-your-kids" },
  { id: "vp-corrected", text: "Corrected a professional's false narrative — calmly, in writing", tag: "for-your-kids" },
  { id: "vp-no-bait", text: "Didn't rise to the bait this time", tag: "for-your-kids" },
  { id: "vp-birthday-msg", text: "Saved a birthday message they'll read one day", tag: "for-your-kids" },
  { id: "vp-handover", text: "Attended handover when every part of you wanted to hide", tag: "for-your-kids" },
  { id: "vp-icl", text: "Asked the ICL something constructive about your child", tag: "for-your-kids" },
  { id: "vp-left-trail", text: "Left a trail — updated contact details, hope intact", tag: "for-your-kids" },
  { id: "vp-mum-detail", text: "Remembered a detail only a mum would know", tag: "for-your-kids" },
  { id: "vp-birthday-quiet", text: "Celebrated their birthday quietly, but fully", tag: "for-your-kids" },
  { id: "vp-voice-msg", text: "Recorded a voice message for the future", tag: "for-your-kids" },
  { id: "vp-boundaries", text: "Maintained boundaries without abandoning connection", tag: "for-your-kids" },
  { id: "vp-checked-in", text: "Checked in with another mum who gets it", tag: "for-each-other" },
  { id: "vp-shared-tip", text: "Shared a tip or resource in the group", tag: "for-each-other" },
  { id: "vp-listened", text: "Listened to someone without trying to fix them", tag: "for-each-other" },
  { id: "vp-heart", text: "Sent a 🤍 to a mum having a hard day", tag: "for-each-other" },
  { id: "vp-course", text: "Showed up to a course session — even exhausted", tag: "for-yourself" },
  { id: "vp-counsellor", text: "Saw your counsellor this week", tag: "for-yourself" },
  { id: "vp-coffee", text: "Had coffee with a friend who sees you", tag: "for-yourself" },
  { id: "vp-walk", text: "Went for a walk when grief hit hard", tag: "for-yourself" },
  { id: "vp-hobby", text: "Started a hobby that's just for you", tag: "for-yourself" },
  { id: "vp-slept", text: "Slept when your body needed it — guilt-free", tag: "for-yourself" },
  { id: "vp-laugh", text: "Let yourself laugh today", tag: "for-yourself" },
  { id: "vp-journalled", text: "Journalled without editing yourself", tag: "for-yourself" },
  { id: "vp-said-no", text: "Said no to something that drained you", tag: "for-yourself" },
  { id: "vp-cried", text: "Cried, then got back up", tag: "for-yourself" },
  { id: "vp-read", text: "Read something that helped you breathe", tag: "for-yourself" },
  { id: "vp-moved", text: "Moved your body — gently counts", tag: "for-yourself" },
  { id: "vp-meal", text: "Made myself a proper meal", tag: "for-yourself" },
  { id: "vp-nature", text: "Sat in nature for ten minutes", tag: "for-yourself" },
  { id: "vp-proud", text: "Named one thing you're proud of today", tag: "for-yourself" },
  { id: "vp-forgave", text: "Forgave yourself for not being perfect", tag: "for-yourself" }
];

// Real-life act presets (the earning engine — plan §6.1).
window.GardenContent.realLifeActPresets = [
  { id: "rl-meal", text: "Made myself a proper meal", tag: "for-yourself" },
  { id: "rl-handover", text: "Attended handover when every part of me wanted to hide", tag: "for-your-kids" },
  { id: "rl-checked-mum", text: "Checked in on another mum", tag: "for-each-other" },
  { id: "rl-walked", text: "Went for a walk when grief hit hard", tag: "for-yourself" },
  { id: "rl-boundary", text: "Held a boundary I needed to hold", tag: "for-yourself" },
  { id: "rl-rest", text: "Let myself rest without guilt", tag: "for-yourself" }
];
