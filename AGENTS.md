# AGENTS.md — notes for anyone (human or AI) changing this app

## 🚧 STATUS: DEVELOPMENT MODE (no live users yet)

This app is still being built. **There are no real users right now**, so backwards-incompatible changes are allowed and expected — reshape stores, rename/retype fields, bump `schemaVersion`, reset the data shape as needed. This banner is the single source of truth for which mode you're in. **When development wraps and real people start using the app, the owner will flip this banner to `STATUS: LIVE` and the rules below change — see "When this flips to LIVE".**

### While we're in DEVELOPMENT (now)

- Breaking changes are fine. You don't need a migration for every schema tweak — but **keep `js/migrations.js` present and exercised** (a fake "old record → new migration" test) so the live-mode pipeline is proven before it's needed.
- Prefer additive changes where they're cheap (new field with a default, new `id`); it costs nothing and means less to clean up later.
- It's okay to wipe your own local test data. Don't worry about preserving dev saves.

### When this flips to LIVE (the owner changes this banner — not you)

**There will be real people using this app, in the hardest weeks of their lives, on data they cannot afford to lose** — letters to their child, quiet victories, memories. From that point: **every change must be additive and backwards-compatible. Never ship anything that could corrupt, wipe, or make unreadable a save from any previous version. If a change can't be made additively, don't make it — stop and ask first.**

## Data & content conventions (read §9.1 of the plan before touching data)

Good habits now, mandatory once LIVE:

- **Schema-versioned records + `js/migrations.js`.** Every stored record carries a `schemaVersion`; on load, `migrations.js` runs idempotent upgrade functions to bring old records up to current. In dev you can rewrite migrations freely; once LIVE, only ever *add* new migrations — never rewrite or reorder old ones.
- **Stable `id`s for content.** Content items (affirmations, wisdom, bingo squares, small pleasures, grounding links, shop catalogue, companions) are keyed by `id`. In dev you can still rename/replace freely; once LIVE, never rename, reuse, or delete an `id` — deprecate instead (and replace a dead grounding link with a new `id`, deprecating the old).
- **Forward-tolerant settings.** Preserve unknown keys; fill missing keys with defaults. Never assume a key exists.
- **Versioned exports.** `formatVersion` on export JSON; import must accept older formats and migrate them on the way in.

## How to ship

- `main` → GitHub Pages is the current **preview/develop build**. In DEVELOPMENT mode a push to `main` only affects you and early testers — no real users yet. **Once LIVE, a push reaches real users on their next open** — treat every push that way from then on.
- Prefer **small, reviewable, independently-shippable changes** (one wave/feature per PR where possible).
- Run the gates in §17 of the plan before you push. In particular: open `index.html` via `file://` and confirm shell + deck + logging + theming work; run a fake "old record → new migration" test and confirm the old record still loads; confirm no external network calls in the offline audit unless AI was explicitly invoked.
- Don't touch `bingo/` (archived original HTML, unused by the app) or `.cursor/plans/` (frozen design artefact) as part of normal feature work.

## What this app is (so your changes fit)

- A calm, offline-first PWA for Australian mums navigating coercive control, parental alienation, and the family law system. Vanilla HTML/CSS/JS, no build step, served from the repo root, hosted free on GitHub Pages.
- Values: calm technology, humane design, no extraction, no shame, no analytics. Match that tone in anything user-facing. Read §12.2 for the accessibility/usability bar, §20 for the in-app values copy.
- The only intentional external calls are: (a) the lazy-loaded AI script, only when the user explicitly invokes it, and (b) grounding-link cards opening an external tab. Everything else stays on-device and offline.

## Don't

- No accounts, no backend you operate, no cloud sync, no telemetry/analytics, no dark patterns, no streaks that shame, no monetisation.
- No general-purpose AI chat — AI is scoped to BIFF drafting and letter-to-child drafting only, opt-in, with an explicit consent screen (see §7).
- No new dependencies without a stated reason; vanilla was chosen deliberately (offline, free, easy to hand-edit, `file://`-friendly).
- Don't change the stealth name/icon or weaken the PIN lock / Web Crypto hashing.
- Don't add anything that demands a network call on the critical path of opening the diary.

## When in doubt

Re-read §1 (intent), §9.1 (extensibility & backwards compatibility), §12.2 (accessibility), §17 (acceptance). If a change risks any user's save data and you're not certain it's safe, **stop and ask before shipping.**
