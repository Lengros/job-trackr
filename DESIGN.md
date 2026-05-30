# JobTrackr — Design System ("Worksite")

- **Version:** 2.0 — "Worksite" visual direction
- **Date:** 2026-05-30
- **Status:** Canonical. Supersedes the *visual* direction (blue SaaS palette) of `docs/04_MOBILE_APP_DESIGN_GUIDE.md`. **Inherits its philosophy and persona unchanged** — that guide was right about *who* and *why*; this doc fixes *how it looks*.
- **Implemented in:** `src/styles/index.css` (tokens — the single source of truth), plus per-screen `*.module.css`.

---

## 1. Who & why (carried over from the original guide)

A work tool, not a lifestyle product. Designed for **Tomasz**, a ~35-year-old tradesperson:
one-thumb use, dirty/wet/gloved hands, basements with no signal, rooftops in direct sun,
10 seconds of patience per screen. Measures success in jobs closed and money earned.

**PMF segment (decided 2026-05-30):** solo masters & micro-crews (1–5) in **Poland**.
The three jobs — *know what to do → prove it's done → calculate my own cost* — are solo /
small-crew pains, not enterprise field-service (Jobber/ServiceTitan own that tier). Today this
segment lives in notebook + WhatsApp + paper receipts. Tone: **"my tool, my numbers."**

## 2. Direction in one line

> **Rugged industrial tool, not a SaaS dashboard.**
> Structure on near-black graphite ink + warm paper. **One** hi-vis safety-orange accent, reserved
> for *action*. High contrast for sunlight; bold weights; glanceable solid status blocks; money is the hero.

What this explicitly rejects: pastel-blue brand, thin 1px borders, light-gray secondary text,
delicate line icons, floaty soft-shadow cards, money styled like a hyperlink.

---

## 3. Color tokens

All colors are CSS custom properties in `:root` (`src/styles/index.css`). **Change values there; names cascade app-wide.**

### Brand → Graphite / Ink scale
Structure, not a colored brand. Logo, headings, avatars, "new" status, dark surfaces.

| Token | Value | Use |
|---|---|---|
| `--brand-900` | `#0E1013` | deepest ink |
| `--brand-800` | `#171A1F` | dark surfaces / dark avatar |
| `--brand-700` | `#232830` | **primary structural ink** — logo, strong headings, money |
| `--brand-600` | `#333A45` | |
| `--brand-500` | `#4A525E` | |
| `--brand-400` | `#6B7480` | |
| `--brand-300` | `#A8AEB8` | |
| `--brand-200` | `#D8DBE0` | |
| `--brand-100` | `#ECEEF0` | neutral tint bg (e.g. phone-link container) |

### Surfaces — warm worksite paper
| Token | Value | Use |
|---|---|---|
| `--surface-50` | `#F4F2EC` | app background (warm paper, not cold tech-gray) |
| `--surface-0` | `#FFFFFF` | cards / sheets |

### Accent — hi-vis safety orange (the ONE accent)
Means "tap / act". Never used for decoration or as a second brand color.

| Token | Value | Use |
|---|---|---|
| `--cta` | `#F25C05` | primary CTAs, focus ring, avatar initial, active links |
| `--cta-pressed` | `#C8470A` | pressed state |

### Semantic (deep, high-contrast)
| Token | Value | | Token | Value |
|---|---|---|---|---|
| `--success` | `#15803D` | | `--success-bg` | `#D8F2E0` |
| `--warning` | `#D97706` | | `--warning-bg` | `#FCEBCF` |
| `--warning-text` | `#8A4A06` | | `--error` | `#C81E1E` |
| `--error-bg` | `rgba(200,30,30,.10)` | | `--conflict` | `#7C3AED` |

### Text & border (raised contrast for sunlight)
| Token | Value | Use |
|---|---|---|
| `--text-900` | `#14171C` | primary text & money |
| `--text-500` | `#555B64` | secondary text (darkened from old `#64748B` — must survive bright light) |
| `--border` | `#D9D5CC` | warm hairline; structural borders are **2px** |
| `--border-focus` | `#F25C05` | focus = hi-vis |
| `--border-error` | `#C81E1E` | |

### Status — solid, glanceable
| Token | Value |
|---|---|
| `--status-new` | `#3F4A5A` (steel slate) |
| `--status-in-progress` | `#D97706` (amber) |
| `--status-done` | `#15803D` (green) |
| `--sync-synced / pending / error` | green / amber / red |
| `--offline-banner` | `#C81E1E` |

---

## 4. Typography

Two faces: **Archivo** (industrial display) for headings + money, **Inter** for body/labels.
Both loaded via Google Fonts in `index.css`.

| Token | Value |
|---|---|
| `--font-family` | `'Inter', -apple-system, …` |
| `--font-display` | `'Archivo', 'Inter', …` |

Applied globally: `h1–h4` and `.money` use `--font-display`. Headings carry `letter-spacing: -0.01em`.

| Role | Size | Weight | Notes |
|---|---|---|---|
| display | 30px | 900 | line-height 1.1 |
| h1 | 24px | 800 | |
| h2 | 21px | 800 | |
| h3 | 17px | 700 | |
| body | **16px** | 400 | raised from 15px for the field |
| body-medium | 16px | 500 | |
| label | 13px | 600 | uppercase for section labels |
| caption | 12px | 400 | |
| button | 16px | 600 | |
| tab | 12px | 500 | |

**Money is the hero.** Render in `--font-display`, weight 900, `tabular-nums`, color `--text-900`:
- Grand Total (Summary): 36px
- Total Expenses: 26px
- Job-detail grand total: 24px

---

## 5. Shape, elevation, spacing

| Token | Value | Note |
|---|---|---|
| `--radius-sm` | 5px | status blocks, avatars |
| `--radius-md` | 7px | inputs, buttons |
| `--radius-lg` | 9px | cards |
| `--shadow-card` | `0 1px 2px rgba(20,23,28,.05)` | near-flat; rely on the 2px border, not blur |
| `--shadow-elevated` | `0 8px 22px rgba(20,23,28,.18)` | sheets/modals |
| `--shadow-cta` | `0 5px 16px rgba(242,92,5,.38)` | hi-vis CTA glow |

Spacing: 4px grid (`--space-1`…`--space-10`). Touch targets ≥ 52px (inputs 54px); CTAs full-width.

---

## 6. Component patterns

- **CTA / primary button** — full-width, `--cta` fill, white bold label, `--shadow-cta`, `:active` scale 0.98. Exactly one primary action per screen.
- **Secondary button / "+ Add"** — ink outline (`--brand-700` text/border), transparent fill.
- **Status badge** — **solid color block** (`--status-*` fill, white text), `--font-display` 800, **UPPERCASE**, `letter-spacing .04–.05em`, `--radius-sm`. No dot. Readable at arm's length.
- **Card** — white, 2px `--border`, `--radius-lg`, `--shadow-card`. Defined edge over floaty shadow.
- **Input** — 54px tall, **2px** border, weight 500; focus → `--border-focus` + 3px hi-vis ring.
- **Avatar** — graphite squircle (`--radius-md`, graphite-scale fill) with **hi-vis initial** in `--font-display` 900. Reads like a crew tool-tag.

## 7. Iconography

Phosphor Icons, **default weight `bold`** set globally via `IconContext.Provider` in `src/main.jsx`.
Individual icons may override with `weight="fill"` (status/emphasis) or `weight="light"` (large decorative).
No thin/regular icons for interactive controls — they must read in a glance.

---

## 8. Implementation notes

- **Token-driven.** The app's styling is ~fully token-based, so the entire look is governed by `:root` in `src/styles/index.css`. To re-theme, change *values* there and keep *names*.
- **Files touched in the 2.0 restyle:** `src/styles/index.css` (tokens, type, inputs), `src/main.jsx` (IconContext), `src/components/Header.jsx` (back-arrow bold), `src/data/fixtures.js` (avatar colors → graphite), `JobList / JobDetail / Expenses / JobSummary / MasterSelection` module CSS (status blocks, money, avatars).
- **Architecture & flows were not changed** — 2.0 was a re-skin, not a rebuild. The information architecture from the original guide stands.

## 9. Role-based experiences & Master Home

Two experiences, **one design language** (Worksite tokens — not forked). What differs is *what's in
the center of the screen*, driven by `master.role` in `src/data/fixtures.js`:

| Role | Entry route | Home screen | Mental model |
|---|---|---|---|
| `foreman` (office) | `/jobs` | job list (overview) | dispatcher: who's where, what's closed |
| `master` (field worker) | `/home` | `MasterHome` — one active job | "where am I going, what's the job, how much is mine" |

Routing: `MasterSelection` sends foreman → `/jobs`, master → `/home`; `BottomTabBar`'s work tab is
role-aware. The master-selection screen is a **demo-only** role switcher (prod has one real user and
no step 0).

**Master Home anatomy** (`src/screens/MasterHome.jsx`):
- **Hero** = the single active job (in-progress; else earliest new). Solid status block, big tappable
  address (→ maps), one-line scope, call row, primary CTA (`Start` / `Report done`), and two-tap quick
  actions (Photo, Material) that deep-link into existing screens.
- **Money model** — `Your cut = workCost` (labor fee) is the hero number. Materials are pass-through:
  `Client pays = workCost + Σexpenses`, shown smaller as context (`materials … · reimbursed`). If the
  product later marks up materials, the cut formula changes — that's the one product assumption baked in.
- **Rest of today** = secondary thin rows of the worker's other open jobs.
- **Day strip** (dark) = `{open} open · {done} done` + `You earn today {Σ open workCost}` — the motivating number.
- Empty states: all-done vs nothing-assigned.

## 10. Open / future

- Display face could go harder-condensed (Saira/Oswald) for an even more "workwear" feel — current Archivo is the safe industrial default.
- Per-master avatar differentiation is currently subtle (graphite scale). Revisit if the master roster grows.
