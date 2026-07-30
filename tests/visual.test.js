import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const files = {
  html: '../index.html',
  main: '../src/main.jsx',
  shell: '../src/components/Shell.jsx',
  modal: '../src/components/Modal.jsx',
  card: '../src/components/RecipeCard.jsx',
  css: '../src/index.css',
  tailwind: '../tailwind.config.js',
  data: '../src/data.js',
};
const source = Object.fromEntries(await Promise.all(Object.entries(files).map(async ([key, path]) => [key, await readFile(new URL(path, import.meta.url), 'utf8')])));

test('React, Vite and Tailwind shell is wired from the HTML entrypoint', () => {
  assert.match(source.html, /<div id="root"><\/div>/);
  assert.match(source.html, /src="\/src\/main\.jsx"/);
  assert.match(source.main, /ReactDOM\.createRoot/);
  assert.match(source.main, /addEventListener\('hashchange'/);
  assert.match(source.main, /import '\.\/index\.css'/);
  assert.match(source.css, /@tailwind base/);
});

test('five routed screens and Zustand-backed application shell remain present', () => {
  for (const path of ['plan', 'recipes', 'pantry', 'grocery']) assert.match(source.main, new RegExp(`'/${path}':`));
  assert.match(source.shell, /useMunchStore/);
  assert.match(source.shell, /grid-cols-5/);
  assert.match(source.shell, /safe-area-inset-bottom/);
});

test('generated recipe assets and declared fallback are present', () => {
  for (const asset of ['nasi-lemak.jpg', 'tomato-egg-rice.jpg', 'mee-goreng.jpg', 'chicken-porridge.jpg', 'placeholder.svg']) {
    assert.equal(existsSync(new URL(`../public/recipes/${asset}`, import.meta.url)), true, asset);
  }
  assert.match(source.data, /fallbackImage: resolveAssetPath\(FALLBACK_RECIPE_IMAGE\)/);
  assert.match(source.card, /event\.currentTarget\.src = fallback/);
});

test('React modal traps focus, supports Escape and restores the opener', () => {
  assert.match(source.modal, /role="dialog"/);
  assert.match(source.modal, /aria-modal="true"/);
  assert.match(source.modal, /event\.key === 'Escape'/);
  assert.match(source.modal, /event\.key !== 'Tab'/);
  assert.match(source.modal, /openerRef\.current\?\.focus/);
});

test('Pocket Bento visual system includes accessible motion and touch guardrails', () => {
  for (const token of ['#FFF8E8', '#FFD96A', '#F36F56', '#CFE9D8', '#56396F', '#173B34']) assert.match(source.tailwind, new RegExp(token, 'i'));
  assert.match(source.css, /min-h-11/);
  assert.match(source.css, /focus-visible/);
  assert.match(source.css, /prefers-reduced-motion:\s*reduce/);
  assert.match(source.tailwind, /munchBounce/);
});

test('active React source has no common mojibake markers', () => {
  assert.doesNotMatch(Object.values(source).join('\n'), /[\u00c3\u00c2\u00e2\u00f0\u00ef]/);
});
