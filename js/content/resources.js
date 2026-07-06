window.GardenContent = window.GardenContent || {};

// Crisis & support resources (plan §13.5). Top-listed: 24/7 crisis lines.
window.GardenContent.resources = [
  { id: "lifeline", name: "Lifeline", number: "13 11 14", href: "tel:131114",
    note: "Crisis support & suicide prevention.", always24: true, top: true },
  { id: "1800respect", name: "1800RESPECT", number: "1800 737 732", href: "tel:1800737732",
    note: "National sexual assault, domestic & family violence counselling.", always24: true, top: true },
  { id: "pbb-helpline", name: "Parents Beyond Breakup helpline", number: "1300 853 437",
    href: "tel:1300853437", note: "365 days a year. Free, confidential, peer-based. For separating mums, dads & grandparents.", always24: false },
  { id: "pbb-mids", name: "Mums in Distress (MIDs)", href: "https://www.parentsbeyondbreakup.com/mids",
    note: "Mum-specific peer support (remote + in-person).", external: true },
  { id: "pbb-suicide-awareness", name: "Free suicide-awareness training", href: "https://www.parentsbeyondbreakup.com/",
    note: "Free, ~30-min, self-paced, trauma-informed. For you and the people supporting you.", external: true },
  { id: "legalaid", name: "Legal Aid", href: "https://www.legalaid.vic.gov.au/",
    note: "Legal Aid in your state/territory — family law advice & representation.", external: true },
  { id: "fcfcoa", name: "FCFCOA", href: "https://www.fcfcoa.gov.au/",
    note: "Federal Circuit and Family Court of Australia — forms, resources & safety info.", external: true },
  { id: "dvconnect", name: "DV Connect", href: "https://www.dvconnect.org/",
    note: "Queensland DV helpline & refuge support (other states have equivalent services).", external: true }
];

window.GardenContent.nonAffiliation = "The Garden is independent and not affiliated with Parents Beyond Breakup or any listed service";
