window.GardenContent = window.GardenContent || {};

// Small pleasures (plan §13.10). Each pairs with a shipped SVG (assets/pleasures/<id>.svg).
window.GardenContent.smallPleasures = [
  { id: "sky-at-sunset", title: "the sky at sunset" },
  { id: "small-baby", title: "seeing a small baby" },
  { id: "empty-train-carriage", title: "a long journey in an empty train carriage" },
  { id: "eating-a-fig", title: "eating a fig" },
  { id: "first-sip-coffee", title: "the first sip of coffee in a quiet house" },
  { id: "rain-on-window", title: "rain on the window when you're already inside" },
  { id: "old-dog-sighing", title: "an old dog sighing as it lies down" },
  { id: "smell-of-rain", title: "the smell of rain on hot pavement" },
  { id: "forgotten-note", title: "finding a forgotten note in a coat pocket" },
  { id: "stranger-baby-smile", title: "a stranger's baby smiling at you in a queue" },
  { id: "warm-socks", title: "warm socks from the dryer" },
  { id: "first-cool-evening", title: "the first cool evening after a heatwave" },
  { id: "cat-purr", title: "a cat's purr against your chest" },
  { id: "empty-beach-winter", title: "an empty beach in winter" },
  { id: "peeling-tangerine", title: "peeling a tangerine in one piece" },
  { id: "hot-water-cold-hands", title: "hot water on cold hands" },
  { id: "streetlights-on", title: "streetlights coming on one by one" },
  { id: "headache-lifting", title: "the moment a headache lifts" },
  { id: "bookshop-smell", title: "the smell of a bookshop" },
  { id: "childs-drawing", title: "a child's drawing pinned to a fridge" }
].map(p => ({ ...p, imageRef: "assets/pleasures/" + p.id + ".svg" }));
