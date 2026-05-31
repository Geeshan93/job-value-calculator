# Job Value Calculator

A tiny installable PWA: enter a base value, set a tax %, and see the final job
value. The formula is **base + 10% GST + Tax%** (both percentages are calculated
on the base value and added). GST is fixed at 10%; the Tax % is editable.

Example: base `$1000`, tax `25%` → GST `$100`, Tax `$250`, **Final `$1,350.00`**.

## Run locally

```
python -m http.server 8000
```

Then open http://localhost:8000 (a local server is needed because the app loads
`calc.js` as an ES module).

## Install on iPhone

1. Host the folder somewhere (or run the local server and reach it from your phone).
2. Open the URL in **Safari**.
3. Tap **Share → Add to Home Screen**.

It then launches full-screen with its own icon and works offline.

## Tests

```
node --test
```

Runs the unit tests for the calculation logic in `calc.js`.

## Files

| File | Responsibility |
| --- | --- |
| `calc.js` | Pure calculation (`computeJobValue`) — no DOM, fully unit-tested |
| `calc.test.js` | Unit tests for the calculation |
| `index.html` | UI markup, styles, and live-update wiring |
| `manifest.json` | PWA manifest (name, icon, standalone display) |
| `service-worker.js` | Offline asset cache |
| `icon-512.png` | App icon |
