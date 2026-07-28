import test from 'node:test';
import assert from 'node:assert/strict';

import { clearState, loadState, saveState } from '../src/storage.js';
import {
  DEFAULT_STATE,
  addMissingIngredients,
  reconcilePlannedGroceries,
  addManualGroceryItem,
  addPantryItem,
  updatePantryItem,
  removePantryItem,
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
  const state = { ...DEFAULT_STATE, pantry: [{ id: 'p1', ingredientId: 'egg', name: 'Eggs' }] };

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
  const next = addPantryItem(state, { ingredientId: ' egg ', name: 'Eggs', quantity: 6, unit: 'pieces' });

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
  const item = { id: ' g1 ', ingredientId: 'egg', quantity: 6, unit: 'pieces', checked: false };
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
    checked: false, id: 'g1', source: 'mixed', recipeQuantity: 2, manualQuantity: 1, recipeChecked: false, manualChecked: false,
  }]);
  assert.equal(state.grocery[0].quantity, 1);
});

test('loadState discards malformed records and normalizes persisted state', () => {
  const persisted = {
    version: 1,
    pantry: [{ id: ' p1 ', ingredientId: ' egg ', name: 'Eggs' }, { id: 'p2', name: 'Missing ingredient' }, { id: 'p3', ingredientId: 42 }, null, { id: '   ', ingredientId: 'bad', name: 'Bad' }, 'bad'],
    mealPlan: [
      { id: 'old', date: '2026-07-29', mealType: 'dinner', recipeId: 'r1' },
      { id: 'new', date: '2026-07-29T12:00:00Z', mealType: 'dinner', recipeId: 'r2' },
      { date: 'not-a-date', mealType: 'lunch', recipeId: 'r3' },
    ],
    grocery: [
      { id: ' g1 ', ingredientId: ' egg ', unit: ' pieces ', quantity: 1 },
      { id: ' ', ingredientId: 'bad', unit: 'pieces', quantity: 2 },
      { id: 7, ingredientId: 'bad-id', unit: 'pieces', quantity: 2 },
      { ingredientId: 'broken', quantity: 2 },
      null,
    ],
    preferences: { dietaryTags: [' halal ', null, 'halal'] },
  };
  const loaded = loadState(memoryStorage({ 'munch:v1': JSON.stringify(persisted) }), DEFAULT_STATE);
  assert.deepEqual(loaded.pantry, [{ id: 'p1', ingredientId: 'egg', name: 'Eggs' }]);
  assert.deepEqual(loaded.mealPlan.map(item => [item.date, item.mealType, item.recipeId]), [['2026-07-29', 'dinner', 'r2']]);
  assert.deepEqual(loaded.grocery, [{ ingredientId: 'egg', name: undefined, quantity: 1, unit: 'pieces', category: undefined, checked: false, id: 'g1' }]);
  assert.deepEqual(loaded.preferences.dietaryTags, ['halal']);
});

test('storage methods safely handle throwing storage implementations', () => {
  const storage = {
    getItem() { throw new Error('read failed'); },
    setItem() { throw new Error('write failed'); },
    removeItem() { throw new Error('delete failed'); },
  };
  assert.strictEqual(loadState(storage, DEFAULT_STATE), DEFAULT_STATE);
  assert.equal(saveState(storage, DEFAULT_STATE), false);
  assert.equal(clearState(storage), false);
});

test('clearState removes the persisted state', () => {
  const storage = memoryStorage({ 'munch:v1': JSON.stringify(DEFAULT_STATE) });
  assert.equal(clearState(storage), true);
  assert.equal(storage.getItem('munch:v1'), null);
});

test('actions reject invalid inputs without changing state', () => {
  const state = { ...DEFAULT_STATE, pantry: [], grocery: [], mealPlan: [] };
  assert.throws(() => addPantryItem(state, { id: '   ', ingredientId: 'egg' }), { message: 'pantry item id must be a non-blank string' });
  assert.throws(() => addPantryItem(state, { ingredientId: '   ' }), { message: 'ingredientId must be a non-blank string' });
  assert.throws(() => addPantryItem(state, { ingredientId: 42 }), { message: 'ingredientId must be a non-blank string' });
  assert.throws(() => addRecipeToPlan(state, { date: 'bad', mealType: 'dinner', recipeId: 'r1' }), { message: 'date must be a valid date' });
  assert.throws(() => toggleGroceryItem(state, '  '), { message: 'groceryId must be a non-blank string' });
  assert.throws(() => addMissingIngredients(state, [{ ingredientId: 'egg' }]), { message: 'ingredientId and unit are required for grocery items' });
  assert.throws(() => addMissingIngredients(state, [{ ingredientId: 'egg', unit: '   ' }]), { message: 'ingredientId and unit are required for grocery items' });
  assert.deepEqual(addMissingIngredients(state, [{ ingredientId: ' egg ', unit: ' pieces ', quantity: 1 }]).grocery[0], { ingredientId: 'egg', name: undefined, quantity: 1, unit: 'pieces', category: undefined, checked: false, id: 'grocery-egg-pieces', source: 'recipe' });
  assert.deepEqual(state, { ...DEFAULT_STATE, pantry: [], grocery: [], mealPlan: [] });
});

test('meal actions normalize dates and replace equivalent meal slots immutably', () => {
  const oldEntry = { id: 'old', date: '2026-07-29', mealType: 'dinner', recipeId: 'r1' };
  const state = { ...DEFAULT_STATE, mealPlan: [oldEntry] };
  const next = addRecipeToPlan(state, { id: 'new', date: '2026-07-29T12:00:00Z', mealType: 'dinner', recipeId: 'r2' });
  assert.equal(next.mealPlan.length, 1);
  assert.deepEqual(next.mealPlan[0], { id: 'new', date: '2026-07-29', mealType: 'dinner', recipeId: 'r2' });
  assert.strictEqual(state.mealPlan[0], oldEntry);
});


test('meal and grocery actions normalize valid IDs and reject malformed IDs', () => {
  const state = { ...DEFAULT_STATE, grocery: [], mealPlan: [] };
  const meal = addRecipeToPlan(state, { id: ' plan-1 ', date: '2026-07-29', mealType: 'dinner', recipeId: ' recipe-1 ' });
  assert.deepEqual(meal.mealPlan[0], { id: 'plan-1', date: '2026-07-29', mealType: 'dinner', recipeId: 'recipe-1' });
  assert.throws(() => addRecipeToPlan(state, { id: ' ', date: '2026-07-29', mealType: 'dinner', recipeId: 'r1' }), /meal plan entry id/);
  assert.throws(() => addRecipeToPlan(state, { date: '2026-07-29', mealType: 'dinner', recipeId: 42 }), /recipeId/);
  assert.throws(() => addMissingIngredients(state, [{ id: 42, ingredientId: ' egg ', unit: 'pieces' }]), /grocery item id/);
  assert.deepEqual(addMissingIngredients(state, [{ id: ' g1 ', ingredientId: ' egg ', unit: 'pieces' }]).grocery[0].id, 'g1');
});

test('loadState discards meal-plan records with malformed IDs and trims valid IDs', () => {
  const persisted = { ...DEFAULT_STATE, mealPlan: [
    { id: ' plan-1 ', date: '2026-07-29', mealType: 'dinner', recipeId: ' r1 ' },
    { id: ' ', date: '2026-07-29', mealType: 'lunch', recipeId: 'r2' },
    { id: 7, date: '2026-07-29', mealType: 'breakfast', recipeId: 'r3' },
  ] };
  const loaded = loadState(memoryStorage({ 'munch:v1': JSON.stringify(persisted) }), DEFAULT_STATE);
  assert.deepEqual(loaded.mealPlan, [{ id: 'plan-1', date: '2026-07-29', mealType: 'dinner', recipeId: 'r1' }]);
});

test('recipe grocery additions receive stable ids and pantry details can be edited or removed', () => {
  const state = { ...DEFAULT_STATE, pantry: [{ id: 'p1', ingredientId: 'egg', quantity: 2, unit: 'pieces' }] };
  const grocery = addMissingIngredients(state, [{ ingredientId: 'tomato', unit: 'pieces', quantity: 1, source: 'recipe' }]);
  assert.equal(grocery.grocery[0].id, 'grocery-tomato-pieces');
  const edited = updatePantryItem(state, 'p1', { quantity: 4, expiryDate: '2026-08-01' });
  assert.deepEqual(edited.pantry[0], { id: 'p1', ingredientId: 'egg', quantity: 4, unit: 'pieces', expiryDate: '2026-08-01' });
  assert.deepEqual(removePantryItem(edited, 'p1').pantry, []);
});

test('reconcilePlannedGroceries removes stale recipe rows and preserves manual checked state', () => {
  const recipes = [
    { id: 'old', ingredients: [{ ingredientId: 'tomato', quantity: 2, unit: 'pieces' }] },
    { id: 'new', ingredients: [{ ingredientId: 'egg', quantity: 2, unit: 'pieces' }] },
  ];
  const state = {
    ...DEFAULT_STATE,
    pantry: [],
    mealPlan: [{ id: 'meal', date: '2026-07-29', mealType: 'dinner', recipeId: 'new' }],
    grocery: [
      { id: 'grocery-tomato-pieces', ingredientId: 'tomato', quantity: 2, unit: 'pieces', checked: true, source: 'recipe' },
      { id: 'manual-egg-pieces', ingredientId: 'egg', name: 'Eggs', quantity: 1, unit: 'pieces', checked: true, source: 'manual' },
    ],
  };
  const next = reconcilePlannedGroceries(state, recipes);
  assert.deepEqual(next.grocery.map(item => [item.ingredientId, item.source, item.quantity, item.checked]), [
    ['egg', 'mixed', 3, true],
  ]);
});

test('addManualGroceryItem creates a stable manual grocery row', () => {
  const next = addManualGroceryItem({ ...DEFAULT_STATE }, { name: 'Limes', quantity: '2', unit: 'pieces', category: 'Produce' });
  assert.deepEqual(next.grocery[0], {
    id: 'manual-limes-pieces', ingredientId: 'limes', name: 'Limes', quantity: 2,
    unit: 'pieces', category: 'Produce', checked: false, source: 'manual',
  });
});
test('reconcilePlannedGroceries removes only the recipe contribution from a collision', () => {
  const recipes = [{ id: 'recipe', ingredients: [{ ingredientId: 'egg', quantity: 2, unit: 'pieces' }] }];
  let state = { ...DEFAULT_STATE, pantry: [], mealPlan: [{ id: 'meal', date: '2026-07-29', mealType: 'dinner', recipeId: 'recipe' }] };
  state = reconcilePlannedGroceries(state, recipes);
  state = addManualGroceryItem(state, { name: 'Egg', quantity: 4, unit: 'pieces' });
  state = { ...state, mealPlan: [] };
  const next = reconcilePlannedGroceries(state, recipes);

  assert.deepEqual(next.grocery, [{
    id: 'grocery-egg-pieces', ingredientId: 'egg', name: 'Egg', quantity: 4,
    unit: 'pieces', category: 'Kitchen', checked: false, source: 'manual',
  }]);
});

test('reconcilePlannedGroceries replaces only the recipe contribution in a collision', () => {
  const recipes = [
    { id: 'old', ingredients: [{ ingredientId: 'egg', quantity: 2, unit: 'pieces' }] },
    { id: 'new', ingredients: [{ ingredientId: 'egg', quantity: 5, unit: 'pieces' }] },
  ];
  let state = { ...DEFAULT_STATE, pantry: [], mealPlan: [{ id: 'meal', date: '2026-07-29', mealType: 'dinner', recipeId: 'old' }] };
  state = reconcilePlannedGroceries(state, recipes);
  state = addManualGroceryItem(state, { name: 'Egg', quantity: 4, unit: 'pieces' });
  state = { ...state, mealPlan: [{ id: 'meal', date: '2026-07-29', mealType: 'dinner', recipeId: 'new' }] };
  state.grocery[0].checked = true;
  state.grocery[0].manualChecked = true;
  const next = reconcilePlannedGroceries(state, recipes);

  assert.deepEqual(next.grocery.map(item => ({
    ingredientId: item.ingredientId, quantity: item.quantity, source: item.source, checked: item.checked,
  })), [{ ingredientId: 'egg', quantity: 9, source: 'mixed', checked: true }]);
  assert.equal(next.grocery[0].recipeQuantity, 5);
  assert.equal(next.grocery[0].manualQuantity, 4);
});
