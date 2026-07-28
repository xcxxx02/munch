import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const [html, css, ui, app, data] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/ui.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/app.js', import.meta.url), 'utf8'),
  readFile(new URL('../src/data.js', import.meta.url), 'utf8'),
]);

test('visual shell keeps the local-first asset and encoding contract', () => {
  assert.doesNotMatch(html, /fonts\.googleapis|https?:\/\//);
  assert.match(html, /meta charset="UTF-8"/i);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /script type="module" src="src\/app\.js"/);
  assert.match(ui, /src="\$\{esc\(recipe\.image\)\}"/);
  assert.match(ui, /this\.src='\$\{esc\(recipe\.fallbackImage\)\}'/);
  assert.doesNotMatch(ui, /onerror="this\.remove\(\)"/);
  assert.doesNotMatch(`${html}\n${ui}\n${app}\n${data}`, /[\u00c3\u00c2\u00e2\u00f0\u00ef]/);
});

test('generated recipe assets and declared fallback are present', () => {
  for (const asset of ['nasi-lemak.jpg', 'tomato-egg-rice.jpg', 'mee-goreng.jpg', 'chicken-porridge.jpg', 'placeholder.svg']) {
    assert.equal(existsSync(new URL(`../public/recipes/${asset}`, import.meta.url)), true, asset);
  }
  assert.match(data, /fallbackImage: FALLBACK_RECIPE_IMAGE/);
});

test('modal source contract provides useful focus and restores its opener', () => {
  assert.match(html, /role="dialog"[^>]*aria-modal="true"[^>]*tabindex="-1"/);
  assert.match(app, /modalTrigger = document\.activeElement/);
  assert.match(app, /querySelector\('input, button, \[tabindex/);
  assert.match(app, /if \(trigger\?\.isConnected\) trigger\.focus\(\)/);
});

test('visual system includes accessible interaction guardrails', () => {
  for (const token of ['#fff9ef', '#25483c', '#dcefe2', '#ffd978', '#f47b61']) assert.match(css, new RegExp(token, 'i'));
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(5/);
});
