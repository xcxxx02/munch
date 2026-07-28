import test from 'node:test';
import assert from 'node:assert/strict';

import { clearState, loadState, saveState } from '../src/storage.js';
import {
  DEFAULT_STATE,
  addMissingIngredients,
  addPantryItem,
  addRecipeToPlan,
  toggleGroceryItem,
} from '../src/state.js';

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
  };
}

test('saves and loads the versioned state shape', () => {
  const storage = memoryStorage();
  const state = { ...DEFAULT_STATE, pantry: [{ id: 'p1', name: 'Eggs' }] };

  assert.equal(saveState(storage, state), true);
  assert.deepEqual(loadState(storage, DEFAULT_STATE), state);
  assert.ok(storage.getItem('munch:v1'));
});

test('falls back for malformed, incompatible and unavailable storage', () => {
  const fallback = { ...DEFAULT_STATE };
  assert.strictEqual(loadState(memoryStorage({ 'munch:v1': '{not-json' }), fallback), fallback);
  assert.strictEqual(loadState(memoryStorage({ 'munch:v1': JSON.stringify({ version: 2 }) }), fallback), fallback);
  assert.strictEqual(loadState(null, fallback), fallback);
  assert.equal(saveState(null, fallback), false);
  assert.equal(clearState(null), false);
});

test('adds a pantry item without mutating the original state', () => {
  const state = { ...DEFAULT_STATE };
  const next = addPantryItem(state, { ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces' });

  assert.equal(state.pantry.length, 0);
  assert.equal(next.pantry.length, 1);
  assert.match(next.pantry[0].id, /^pantry-/);
  assert.equal(next.pantry[0].ingredientId, 'egg');
});

test('replaces a recipe in the same meal slot', () => {
  const state = { ...DEFAULT_STATE, mealPlan: [{ id: 'old', date: '2026-07-29', mealType: 'dinner', recipeId: 'r1' }] };
  const next = addRecipeToPlan(state, { id: 'new', date: '2026-07-29', mealType: 'dinner', recipeId: 'r2' });

  assert.deepEqual(next.mealPlan, [{ id: 'new', date: '2026-07-29', mealType: 'dinner', recipeId: 'r2' }]);
  assert.deepEqual(state.mealPlan[0].recipeId, 'r1');
});

test('toggles a grocery item immutably', () => {
  const item = { id: 'g1', ingredientId: 'egg', quantity: 6, unit: 'pieces', checked: false };
  const state = { ...DEFAULT_STATE, grocery: [item] };
  const next = toggleGroceryItem(state, 'g1');

  assert.equal(next.grocery[0].checked, true);
  assert.equal(state.grocery[0].checked, false);
});

test('merges missing ingredients into grocery state', () => {
  const state = {
    ...DEFAULT_STATE,
    grocery: [{ id: 'g1', ingredientId: 'tomato', name: 'Tomatoes', quantity: 1, unit: 'pieces', checked: false, source: 'manual' }],
  };
  const next = addMissingIngredients(state, [{ ingredientId: 'tomato', name: 'Tomatoes', quantity: 2, unit: 'pieces' }]);

  assert.deepEqual(next.grocery, [{
    ingredientId: 'tomato', name: 'Tomatoes', quantity: 3, unit: 'pieces', category: undefined,
    checked: false, id: 'g1', source: 'mixed',
  }]);
  assert.equal(state.grocery[0].quantity, 1);
});
