# Job Value Calculator — Design

**Date:** 2026-06-01
**Status:** Approved

## Purpose

A tiny single-screen calculator that takes a base job value and adds a fixed
GST plus an editable Tax percentage to produce a final job value. Delivered as
an installable PWA so it runs like a native app on iPhone (the user is on
Windows, so native iOS/Swift is out of scope).

## Platform & Tech

- **Form factor:** Progressive Web App (PWA), installable on iOS via Safari
  "Add to Home Screen".
- **Stack:** Single self-contained `index.html` (HTML + CSS + JS inline). No
  build step, no framework, no npm.
- **PWA files:** `manifest.json`, one app icon, and a minimal `service-worker.js`
  for offline support and installability.
- **Why no framework:** one screen, two inputs, pure arithmetic. A framework
  would be overhead with no payoff.

## Calculation Logic

Both percentages are applied to the **base value** (additive, not compounding):

- `gst = base * 0.10`  (GST fixed at 10%)
- `tax = base * (taxPercent / 100)`  (Tax % is user-editable)
- `final = base + gst + tax`

Worked example: base `$1000`, tax `25%` →
GST `$100.00`, Tax `$250.00`, Final `$1,350.00`.

## UI

One screen, live calculation — updates as the user types, no submit button.

```
┌─────────────────────────┐
│     Job Value           │
│                         │
│  Base Value             │
│  [ $ 1000          ]    │
│                         │
│  GST (10%, fixed)       │
│  + $100.00              │
│                         │
│  Tax %                  │
│  [ 25 ] %               │
│  + $250.00              │
│                         │
│  ─────────────────      │
│  Final Job Value        │
│  $1,350.00              │
└─────────────────────────┘
```

### Components / fields

- **Base Value** — numeric input. The only required entry.
- **GST line** — read-only display, labelled "GST (10%, fixed)", shows the
  computed GST dollar amount.
- **Tax %** — numeric input, defaults to `25`, editable.
- **Tax line** — read-only display of the computed Tax dollar amount.
- **Final Job Value** — emphasised total at the bottom.

## Formatting & Edge Cases

- Money displayed with `$` and 2 decimals, thousands separators
  (e.g. `$1,350.00`) via `Intl.NumberFormat`.
- Empty or invalid input is treated as `0` — never show `NaN`, never crash.
- Negative numbers: clamp to `0` (a job value can't be negative).
- Inputs use `inputmode="decimal"` so iOS shows the numeric keypad.

## Mobile / iOS polish

- Viewport meta + safe-area handling so it sits well on a notched iPhone.
- `apple-mobile-web-app-capable` and theme-color meta tags for full-screen,
  chrome-less feel once added to the home screen.
- Large tap targets, generous spacing, readable default font sizes.

## Out of Scope (YAGNI)

- Editable GST (fixed at 10% by request).
- Saved history / persistence of past calculations.
- Multiple currencies.
- Compounding tax logic.

## Testing

- Manual verification against the worked example (`$1000` / `25%` → `$1,350.00`).
- Spot-check edge cases: empty base, `0` tax, large numbers, non-numeric input.
- Confirm "Add to Home Screen" produces a full-screen installed app on iPhone.

## File Layout

```
job-value-calculator/
  index.html          # app: markup, styles, logic
  manifest.json       # PWA manifest
  service-worker.js   # offline cache
  icon-512.png        # app icon
  docs/superpowers/specs/2026-06-01-job-value-calculator-design.md
```
