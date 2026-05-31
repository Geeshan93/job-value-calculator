# Job Value Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an installable PWA that calculates a final job value from a base value plus a fixed 10% GST and an editable Tax percentage.

**Architecture:** Pure calculation logic lives in a small ES module (`calc.js`) so it can be unit-tested with Node's built-in test runner — no npm dependencies, no build step. `index.html` imports that module and wires it to two inputs with live updates. A manifest, icon, and minimal service worker make it installable and offline-capable on iPhone.

**Tech Stack:** Vanilla HTML/CSS/JS, ES modules, `Intl.NumberFormat`, Node `node:test` (built-in) for unit tests, PWA (manifest + service worker).

---

## File Structure

```
job-value-calculator/
  calc.js              # pure calculation function (testable, browser + node)
  calc.test.js         # node:test unit tests for calc.js
  index.html           # UI markup + inline styles + wiring script
  manifest.json        # PWA manifest
  service-worker.js    # offline cache
  icon-512.png         # app icon (generated)
```

**Note on the spec:** the spec said "logic inline." We extract only the *pure
calculation* into `calc.js` so it is unit-testable from Node. Styles and the
DOM-wiring script stay inline in `index.html`. This is the one intentional
deviation and it costs nothing (ES modules load natively in both browser and
Node).

---

### Task 1: Pure calculation module (TDD)

**Files:**
- Create: `calc.js`
- Test: `calc.test.js`

- [ ] **Step 1: Write the failing tests**

Create `calc.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeJobValue } from './calc.js';

test('worked example: 1000 base, 25% tax', () => {
  const r = computeJobValue(1000, 25);
  assert.equal(r.gst, 100);
  assert.equal(r.tax, 250);
  assert.equal(r.final, 1350);
});

test('GST is always 10% of base', () => {
  assert.equal(computeJobValue(2000, 0).gst, 200);
});

test('zero tax means final = base + gst', () => {
  const r = computeJobValue(500, 0);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 550);
});

test('empty / NaN base is treated as 0', () => {
  const r = computeJobValue(NaN, 25);
  assert.equal(r.gst, 0);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 0);
});

test('NaN tax is treated as 0', () => {
  const r = computeJobValue(1000, NaN);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 1100);
});

test('negative base clamps to 0', () => {
  const r = computeJobValue(-500, 25);
  assert.equal(r.final, 0);
});

test('negative tax clamps to 0', () => {
  const r = computeJobValue(1000, -10);
  assert.equal(r.tax, 0);
  assert.equal(r.final, 1100);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL — `Cannot find module './calc.js'` / `computeJobValue is not a function`.

- [ ] **Step 3: Write the minimal implementation**

Create `calc.js`:

```js
// Pure job-value calculation. No DOM, no side effects.
// GST is fixed at 10% of base. Tax is taxPercent% of base. Both additive.
export const GST_RATE = 0.10;

export function computeJobValue(base, taxPercent) {
  const b = Math.max(0, Number.isFinite(base) ? base : 0);
  const t = Math.max(0, Number.isFinite(taxPercent) ? taxPercent : 0);
  const gst = b * GST_RATE;
  const tax = b * (t / 100);
  const final = b + gst + tax;
  return { base: b, gst, tax, final };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: PASS — all 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add calc.js calc.test.js
git commit -m "feat: add pure job-value calculation with tests"
```

---

### Task 2: UI screen with live calculation

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0b5fff" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <link rel="manifest" href="manifest.json" />
  <link rel="apple-touch-icon" href="icon-512.png" />
  <title>Job Value</title>
  <style>
    :root { --bg:#f4f6fb; --card:#fff; --ink:#0f172a; --muted:#64748b; --accent:#0b5fff; --line:#e2e8f0; }
    * { box-sizing: border-box; }
    body {
      margin: 0; background: var(--bg); color: var(--ink);
      font: 17px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh; display: flex; justify-content: center;
      padding: max(24px, env(safe-area-inset-top)) 16px env(safe-area-inset-bottom);
    }
    .card {
      background: var(--card); width: 100%; max-width: 420px; border-radius: 20px;
      padding: 24px; box-shadow: 0 10px 30px rgba(15,23,42,.08); align-self: flex-start;
    }
    h1 { font-size: 22px; margin: 0 0 20px; }
    label { display: block; font-size: 14px; color: var(--muted); margin: 0 0 6px; }
    .field { margin-bottom: 18px; }
    .input-wrap { display: flex; align-items: center; gap: 8px;
      border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }
    .input-wrap:focus-within { border-color: var(--accent); }
    .input-wrap span { color: var(--muted); font-weight: 600; }
    input {
      border: 0; outline: none; font-size: 20px; width: 100%; background: transparent;
      color: var(--ink); font-weight: 600;
    }
    .line { display: flex; justify-content: space-between; align-items: baseline;
      font-size: 15px; color: var(--muted); margin: 4px 0 0; }
    .line strong { color: var(--ink); font-weight: 600; }
    hr { border: 0; border-top: 1px solid var(--line); margin: 20px 0; }
    .total { display: flex; justify-content: space-between; align-items: baseline; }
    .total .label { font-size: 15px; color: var(--muted); }
    .total .value { font-size: 30px; font-weight: 800; color: var(--accent); }
  </style>
</head>
<body>
  <main class="card">
    <h1>Job Value</h1>

    <div class="field">
      <label for="base">Base Value</label>
      <div class="input-wrap">
        <span>$</span>
        <input id="base" inputmode="decimal" placeholder="0" value="1000" />
      </div>
    </div>

    <div class="field">
      <div class="line"><span>GST (10%, fixed)</span><strong id="gst">+ $0.00</strong></div>
    </div>

    <div class="field">
      <label for="tax">Tax %</label>
      <div class="input-wrap">
        <input id="tax" inputmode="decimal" placeholder="0" value="25" />
        <span>%</span>
      </div>
      <div class="line"><span>Tax amount</span><strong id="taxAmt">+ $0.00</strong></div>
    </div>

    <hr />

    <div class="total">
      <span class="label">Final Job Value</span>
      <span class="value" id="final">$0.00</span>
    </div>
  </main>

  <script type="module">
    import { computeJobValue } from './calc.js';

    const money = new Intl.NumberFormat('en-US', {
      style: 'currency', currency: 'USD',
      minimumFractionDigits: 2, maximumFractionDigits: 2,
    });

    const baseEl = document.getElementById('base');
    const taxEl  = document.getElementById('tax');
    const gstEl  = document.getElementById('gst');
    const taxAmtEl = document.getElementById('taxAmt');
    const finalEl  = document.getElementById('final');

    function render() {
      const r = computeJobValue(parseFloat(baseEl.value), parseFloat(taxEl.value));
      gstEl.textContent    = '+ ' + money.format(r.gst);
      taxAmtEl.textContent = '+ ' + money.format(r.tax);
      finalEl.textContent  = money.format(r.final);
    }

    baseEl.addEventListener('input', render);
    taxEl.addEventListener('input', render);
    render();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    }
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify it works in a browser**

Run a local server (avoids ES-module `file://` restrictions):
`python -m http.server 8000`
Open `http://localhost:8000` and confirm:
- Default shows Base `1000`, Tax `25`, GST `+ $100.00`, Tax amount `+ $250.00`, Final `$1,350.00`.
- Typing in Base or Tax updates everything live.
- Clearing Base shows `$0.00` everywhere (no `NaN`).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add calculator UI with live updates"
```

---

### Task 3: PWA installability (manifest, icon, service worker)

**Files:**
- Create: `manifest.json`
- Create: `icon-512.png`
- Create: `service-worker.js`

- [ ] **Step 1: Create `manifest.json`**

```json
{
  "name": "Job Value Calculator",
  "short_name": "Job Value",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#f4f6fb",
  "theme_color": "#0b5fff",
  "icons": [
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 2: Generate `icon-512.png`**

Generate a simple 512×512 PNG icon (blue background, white "$"). Run with Python (Pillow is commonly available; if not, `pip install pillow`):

```python
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (512, 512), '#0b5fff')
d = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype('arialbd.ttf', 320)
except OSError:
    font = ImageFont.load_default()
d.text((256, 246), '$', fill='white', anchor='mm', font=font)
img.save('icon-512.png')
print('icon written')
```

Run: `python <script>.py`
Expected: `icon written`, and `icon-512.png` exists at 512×512.

- [ ] **Step 3: Create `service-worker.js`**

```js
const CACHE = 'job-value-v1';
const ASSETS = ['./', 'index.html', 'calc.js', 'manifest.json', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
```

- [ ] **Step 4: Verify installability**

With `python -m http.server 8000` running, open `http://localhost:8000` in Chrome →
DevTools → Application tab. Confirm:
- Manifest loads with no errors and shows the icon.
- A service worker is registered and activated.
- Reload offline (DevTools → Network → Offline) and the page still loads.

- [ ] **Step 5: Commit**

```bash
git add manifest.json icon-512.png service-worker.js
git commit -m "feat: make app installable as a PWA"
```

---

### Task 4: Final verification & README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run the full test suite**

Run: `node --test`
Expected: PASS — all calc tests pass.

- [ ] **Step 2: Create `README.md`**

```markdown
# Job Value Calculator

A tiny installable PWA: enter a base value, set a tax %, and see the final job
value (base + 10% GST + Tax%). GST is fixed at 10%.

## Run locally
```
python -m http.server 8000
```
Then open http://localhost:8000

## Install on iPhone
Open the hosted URL in Safari → Share → **Add to Home Screen**.

## Tests
```
node --test
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Self-Review

- **Spec coverage:** Calculation logic (Task 1), additive formula + fixed GST + editable tax (Task 1 + Task 2), live single-screen UI (Task 2), `$`/2-decimal/thousands formatting via `Intl.NumberFormat` (Task 2), empty/invalid → 0 and negative clamp (Task 1 tests), iOS meta tags + safe-area (Task 2), PWA install/offline (Task 3). All spec sections map to a task.
- **Out of scope honored:** no editable GST, no history, single currency, additive-only — none introduced.
- **Type consistency:** `computeJobValue(base, taxPercent)` returns `{ base, gst, tax, final }`; the same shape is consumed in `index.html`. Element IDs (`base`, `tax`, `gst`, `taxAmt`, `final`) match between markup and script.
- **No placeholders:** every code step contains complete, runnable content.
