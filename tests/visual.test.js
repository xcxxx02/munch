import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const [html, css, ui] = await Promise.all([
  readFile(new URL('../index.html', import.meta.url), 'utf8'),
  readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  readFile(new URL('../src/ui.js', import.meta.url), 'utf8'),
]);

test('visual shell keeps the local-first contract', () => {
  assert.doesNotMatch(html, /fonts\.googleapis|https?:\/\//);
  assert.match(html, /viewport-fit=cover/);
  assert.match(html, /script type="module" src="src\/app\.js"/);
  assert.match(ui, /recipe\.image/);
  assert.match(ui, /onerror="this\.remove\(\)"/);
});

test('visual system includes accessible interaction guardrails', () => {
  for (const token of ['#fff9ef', '#25483c', '#dcefe2', '#ffd978', '#f47b61']) assert.match(css, new RegExp(token, 'i'));
  assert.match(css, /min-height:\s*44px/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /env\(safe-area-inset-bottom\)/);
  assert.match(css, /grid-template-columns:\s*repeat\(5/);
});
