window.GardenContent = window.GardenContent || {};

// BIFF reply styles — UI selections + few-shot examples for the AI (plan §13.8).
window.GardenContent.biffStyles = [
  {
    id: "conditional-agreement",
    name: "Conditional agreement",
    blurb: "Cooperative but firm; creates a condition; slows it down; asks for their proposal.",
    example: "Dear X, thank you for letting me know you'd like to take the children away during the second week of July. I've checked the calendar and those days overlap with time they're due to be with me. I'm open to considering it, for the children's sake, if we can arrange replacement days so they don't lose that time with me. Please let me know what dates you'd propose as alternatives and I'll be in a position to consider it fully. Kind regards."
  },
  {
    id: "therapeutic-parent",
    name: "Therapeutic-parent positioning",
    blurb: "Models the engaged, reflective, child-focused parent; reads well as evidence.",
    example: "Hi X, I've been thinking about how we can best support the children through this period, which I don't think is easy for them. I've been reading widely on therapeutic parenting and working with a counsellor to understand what they might be feeling underneath. I've attached a short piece I found genuinely helpful; I'd welcome your thoughts on whether any of it might be useful in how we support them. I'm always looking for the best way to help them feel settled. Kind regards."
  },
  {
    id: "strategic-slowness",
    name: "Strategic slowness",
    blurb: "Slow it down; make them wait; one clarifying question rather than committing.",
    example: "Hi X, received your message — I need a little time to consider it properly and will come back to you by the end of the week. Could you confirm the dates you have in mind so I can check the calendar? Kind regards."
  },
  {
    id: "two-audience",
    name: "Two-audience",
    blurb: "Same event, two versions: a factual note to the other parent, and a warm note to the child.",
    exampleToParent: "Hi X, noting your message about the holiday dates. I'll be away later this week and will respond fully when I'm back. Kind regards.",
    exampleToChild: "Hi [child], just thinking of you and hoping you're okay. I saw a sunset the other night that looked just like the ones we used to watch from the kitchen window. Miss you. You know where I am whenever you want to chat. Love you always."
  }
];

window.GardenContent.biffChecklist = [
  "Is it brief?",
  "Is it firm without being hostile?",
  "Could this be used as evidence — does it show you as the reasonable one?",
  "Are you over-explaining?",
  "Are you taking the bait?"
];

window.GardenContent.biffExplainer = "BIFF = Brief, Informative, Friendly, Firm. Keep it short, factual, calm, and clear. Never match their tone. Every email you send may be read by a court one day — leave yourself as the reasonable, child-focused parent on the record.";
