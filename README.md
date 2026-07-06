# The Garden

A calm, installable, offline-first companion app for Australian parents — especially mums — navigating coercive control, parental alienation, and the family law system. A quiet daily space that holds the small, consistent acts of love that are easy to forget you're still giving.

> Open the diary. One warm card. A small act of love, logged. The garden grows. On hard days, read it back.

## Why this exists

It began as a solidarity bingo card shared between mums who understood each other with a single nod. It grew into a garden: a private place that notices and keeps the quiet love that holds a child's felt sense of safety — the love the court may never see, but the child feels underneath.

The app is built on a few beliefs:

- **Being good all the way through matters.** Consistent, loving presence gives a child a felt sense of safety they can't yet name. That's the whole point.
- **The love ledger is evidence.** Every small act, logged quietly, is proof you never stopped being their mum. On hard days, read it back.
- **Healing is part of staying in the fight.** Rest isn't retreat. You can't pour from an empty cup.
- **Solidarity is survival.** You're part of something bigger than your case file.
- **Technology should not exploit pain.** No engagement loops, no streaks that shame, no tracking, no ads.

## What it does

- **A calm card deck** — one warm card at a time: log a quiet victory, write a few lines to your child, breathe, draft a BIFF reply, read an affirmation or a piece of group wisdom, recognise a moment from your own week, notice a small pleasure, open a grounding link.
- **The Love Ledger** — a dated timeline of everything you've logged. "On hard days, read it back."
- **Letters to your child** — a weekly nudge and an established 4-part structure for writing to an alienated child (adapt freely; never send as-is).
- **BIFF helper** — turn a hostile email into a calm, defensible reply. Optional AI assist (off by default) digests the email and drafts a reply in your chosen style; manual templates always available.
- **Gentle gamification** — earn Petals for real-life and in-app acts; spend them in a versioned shop on calm palettes, wallpapers, and encouraging companion creatures that drift across your screen. Everything is optional and toggleable.
- **Crisis resources** — one tap, always present, never dismissible (Parents Beyond Breakup helpline 1300 853 437, 1800RESPECT, Lifeline, Legal Aid, FCFCOA, DV Connect).

## Privacy & safety

This audience includes people whose ex-partners have called police and child safety on them. Privacy here is a **safety** feature, not a preference.

- **No account required.** Works fully offline.
- **Local-only storage** (IndexedDB, with a localStorage fallback). Nothing leaves your device unless you explicitly export a backup.
- **No analytics, no telemetry, no tracking.** Ever.
- **Stealth mode** — installs under a discreet name ("Notes") and opens only with a PIN, like a locked diary.
- **Manual export/import** — download a JSON backup to your own cloud drive or email; restore on any device.
- **The only intentional network call** is the opt-in AI feature (BIFF / letter drafting), which is off by default, lazy-loaded, and gated by a clear consent screen. With AI off, the app makes zero external calls.

## Tech stack

- Vanilla HTML, CSS, JavaScript — no build step, no framework.
- PWA: `manifest.webmanifest` + service worker; installable on iOS and Android; works offline.
- IndexedDB for local storage; Web Crypto (PBKDF2) for PIN hashing.
- Optional AI via [Puter.js](https://docs.puter.com/) (keyless, serverless, user-pays) or bring-your-own-key (Google Gemini / Groq free tiers).
- Self-hosted fonts (Cormorant Garamond + Outfit) — see `assets/fonts/` and the note below.

## Project structure

```text
/                 # app shell, manifest, service worker, README, AGENTS.md
/assets           # icons, fonts, companion SVGs, wallpapers, pleasures, audio
/css              # tokens, base, deck, diary, shop, print
/js               # app, db, migrations, crypto, deck, cards, ledger, breathe, biff, ai, shop, companions, theme, notify, sw-register
/js/content       # affirmations, wisdom, victory-presets, recognise-moments, biff-styles, letter-structure, resources, about, small-pleasures, grounding-links, catalogue
/bingo            # original HTML files — kept for memory, unused by the app
/.cursor/plans    # frozen design artefact (the original implementation plan)
/docs             # plain-language web pages (privacy, export guide, values)
```

## Running locally

It's a static site — no build step. You can even double-click `index.html` (open via `file://`) and the shell, deck, logging, theming, shop and companions will work. Service worker, IndexedDB persistence, notifications and AI features need a real origin, so for full testing:

1. Clone the repo.
2. Serve the root with any static server, e.g. `python3 -m http.server` or `npx serve`.
3. Open the local URL. Use dev tools → Application → Service Workers to test offline.

## Deploying

Hosted free on GitHub Pages.

1. Push to `main`.
2. Repo Settings → Pages → Source: Deploy from a branch → `main` / `(root)`.
3. Live at `https://<account>.github.io/<repo>/`.

To publish new shop items (palettes, wallpapers, companions): bump the catalogue version in `/js/content/catalogue.js`, add items with stable `id`s, and push to `main`. Users' existing inventory persists.

## Fonts note

The app uses Cormorant Garamond + Outfit via CSS `@font-face` with safe system fallbacks (Georgia / system-ui). To fully self-host (recommended before going live, to eliminate any external call), drop `woff2` files into `assets/fonts/` and uncomment the `@font-face` blocks in `css/tokens.css`. Until then the app degrades gracefully to system serifs/sans — fully offline either way.

## Contributing

Contributions that align with the values above are welcome. Please keep the app calm, private, offline-first, and free of engagement-extraction: no analytics, no trackers, no accounts. Keep copy warm and plain; Australian English; no legal advice. Read `AGENTS.md` before changing anything that touches user data.

## Further reading & allied organisations

- [Parents Beyond Breakup](https://www.parentsbeyondbreakup.com/) — an Australian suicide-prevention charity for separating mums, dads, and grandparents. Helpline **1300 853 437** (365 days/yr). Their [Mums in Distress](https://www.parentsbeyondbreakup.com/mids) program, [separation checklist](https://www.parentsbeyondbreakup.com/get-support/separation-checklist), [vision / mission / values](https://www.parentsbeyondbreakup.com/about/vision-mission-values), and [research](https://www.parentsbeyondbreakup.com/about/research) shaped this app's heart. The Garden is independent and not affiliated with PBB; we link them because their free peer support is the most on-target Australian resource for this audience.

## Disclaimer

This app is not legal advice and is not a substitute for crisis or therapeutic services. If you are in danger or in crisis, please contact the services listed in the app's Help section. AI-assisted drafts are aids, not authorities — adapt everything to your own voice and situation. The Garden is independent and not affiliated with Parents Beyond Breakup or any listed service; links are provided because they're the right people to contact.

## License

MIT — free to use, fork, and adapt, especially for organisations supporting survivor parents.
