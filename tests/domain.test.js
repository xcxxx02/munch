import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAvailability,
  getExpiryRecommendations,
  createMealPlanEntry,
  mergeGroceryItems,
} from '../src/domain.js';

test('getAvailability marks a recipe complete when every ingredient is fully stocked', () => {
  const recipe = {
    ingredients: [
      { ingredientId: 'egg', name: 'Eggs', quantity: 2, unit: 'pieces', category: 'Dairy' },
      { ingredientId: 'tomato', name: 'Tomatoes', quantity: 3, unit: 'pieces', category: 'Produce' },
    ],
  };
  const pantry = [
    { ingredientId: 'egg', name: 'Eggs', quantity: 2, unit: 'pieces', category: 'Dairy' },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 4, unit: 'pieces', category: 'Produce' },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    availableCount: 2,
    totalCount: 2,
    missing: [],
  });
});

test('getAvailability reports zero and partial stock with the remaining quantities', () => {
  const recipe = {
    ingredients: [
      { ingredientId: 'egg', name: 'Eggs', quantity: 2, unit: 'pieces', category: 'Dairy' },
      { ingredientId: 'tomato', name: 'Tomatoes', quantity: 3, unit: 'pieces', category: 'Produce' },
    ],
  };
  const pantry = [
    { ingredientId: 'egg', name: 'Eggs', quantity: 0, unit: 'pieces', category: 'Dairy' },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 1, unit: 'pieces', category: 'Produce' },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    availableCount: 0,
    totalCount: 2,
    missing: [
      { ingredientId: 'egg', quantity: 2, unit: 'pieces' },
      { ingredientId: 'tomato', quantity: 2, unit: 'pieces' },
    ],
  });
});

test('getAvailability counts fully stocked ingredients separately from partial stock', () => {
  const recipe = {
    ingredients: [
      { ingredientId: 'egg', name: 'Eggs', quantity: 2, unit: 'pieces', category: 'Dairy' },
      { ingredientId: 'tomato', name: 'Tomatoes', quantity: 3, unit: 'pieces', category: 'Produce' },
    ],
  };
  const pantry = [
    { ingredientId: 'egg', name: 'Eggs', quantity: 2, unit: 'pieces', category: 'Dairy' },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 1, unit: 'pieces', category: 'Produce' },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    availableCount: 1,
    totalCount: 2,
    missing: [
      { ingredientId: 'tomato', quantity: 2, unit: 'pieces' },
    ],
  });
});

test('getExpiryRecommendations ignores items without expiry and sorts soonest first', () => {
  const today = new Date('2026-07-28T00:00:00.000Z');
  const pantry = [
    { ingredientId: 'rice', name: 'Rice', quantity: 1, unit: 'kg', category: 'Grains' },
    { ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'Dairy', expiryDate: '2026-07-30' },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 2, unit: 'pieces', category: 'Produce', expiryDate: '2026-07-29' },
  ];

  assert.deepEqual(
    getExpiryRecommendations(pantry, today, 3).map(item => item.ingredientId),
    ['tomato', 'egg'],
  );
});

test('getExpiryRecommendations includes the exact three-day boundary but excludes later dates', () => {
  const today = new Date('2026-07-28T00:00:00.000Z');
  const pantry = [
    { ingredientId: 'milk', name: 'Milk', quantity: 1, unit: 'litre', category: 'Dairy', expiryDate: '2026-07-31' },
    { ingredientId: 'rice', name: 'Rice', quantity: 1, unit: 'kg', category: 'Grains', expiryDate: '2026-08-01' },
  ];

  assert.deepEqual(
    getExpiryRecommendations(pantry, today, 3).map(item => item.ingredientId),
    ['milk'],
  );
});

test('getExpiryRecommendations includes items expiring later on today\'s calendar date', () => {
  const today = new Date('2026-07-28T15:00:00.000Z');
  const pantry = [
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 2, unit: 'pieces', category: 'Produce', expiryDate: '2026-07-28' },
  ];

  assert.deepEqual(
    getExpiryRecommendations(pantry, today, 0).map(item => item.ingredientId),
    ['tomato'],
  );
});

test('createMealPlanEntry normalizes valid breakfast, lunch and dinner entries', () => {
  assert.deepEqual(createMealPlanEntry({ date: '2026-07-28T15:00:00.000Z', mealType: 'breakfast', recipeId: 'r1' }), {
    id: '2026-07-28-breakfast', date: '2026-07-28', mealType: 'breakfast', recipeId: 'r1',
  });
  assert.deepEqual(createMealPlanEntry({ date: '2026-07-28', mealType: 'lunch', recipeId: 'r2' }), {
    id: '2026-07-28-lunch', date: '2026-07-28', mealType: 'lunch', recipeId: 'r2',
  });
  assert.deepEqual(createMealPlanEntry({ date: '2026-07-28', mealType: 'dinner', recipeId: 'r3' }), {
    id: '2026-07-28-dinner', date: '2026-07-28', mealType: 'dinner', recipeId: 'r3',
  });
});

test('createMealPlanEntry rejects invalid meal types with a clear error', () => {
  assert.throws(
    () => createMealPlanEntry({ date: '2026-07-28', mealType: 'snack', recipeId: 'r1' }),
    { message: 'mealType must be breakfast, lunch or dinner' },
  );
});
test('mergeGroceryItems merges only matching ingredientId and unit pairs', () => {
  const items = [
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 1, unit: 'pieces', category: 'Produce', checked: false },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 2, unit: 'pieces', category: 'Produce', checked: true },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 0.5, unit: 'kg', category: 'Produce', checked: false },
    { ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'Dairy', checked: false },
  ];

  assert.deepEqual(mergeGroceryItems(items), [
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 3, unit: 'pieces', category: 'Produce', checked: true },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 0.5, unit: 'kg', category: 'Produce', checked: false },
    { ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'Dairy', checked: false },
  ]);
});


test('mergeGroceryItems chooses duplicate metadata deterministically', () => {
  const items = [
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 1, unit: 'pieces', category: 'Produce' },
    { ingredientId: 'tomato', name: 'Cherry tomatoes', quantity: 2, unit: 'pieces', category: 'Fruit' },
  ];
  const expected = [{ ingredientId: 'tomato', name: 'Cherry tomatoes', quantity: 3, unit: 'pieces', category: 'Fruit', checked: false }];
  assert.deepEqual(mergeGroceryItems(items), expected);
  assert.deepEqual(mergeGroceryItems([...items].reverse()), expected);
});

test('createMealPlanEntry treats timezone-less datetimes as UTC', () => {
  assert.equal(
    createMealPlanEntry({ date: '2026-07-28T23:30:00', mealType: 'dinner', recipeId: 'r4' }).date,
    '2026-07-28',
  );
});

test('createMealPlanEntry rejects invalid calendar components in timezone-less datetimes', () => {
  assert.throws(
    () => createMealPlanEntry({ date: '2026-02-30T12:00:00', mealType: 'dinner', recipeId: 'r5' }),
    { message: 'date must be a valid date' },
  );
});

test('getExpiryRecommendations breaks same-date ties by id', () => {
  const pantry = [
    { id: 'b', name: 'Same', expiryDate: '2026-07-29' },
    { id: 'a', name: 'Same', expiryDate: '2026-07-29' },
  ];
  assert.deepEqual(
    getExpiryRecommendations(pantry, '2026-07-28', 3).map(item => item.id),
    ['a', 'b'],
  );
});

test('getExpiryRecommendations breaks same-id same-date ties by name', () => {
  const pantry = [
    { id: 'same', name: 'Zucchini', expiryDate: '2026-07-29' },
    { id: 'same', name: 'Apple', expiryDate: '2026-07-29' },
  ];
  assert.deepEqual(
    getExpiryRecommendations(pantry, '2026-07-28', 3).map(item => item.name),
    ['Apple', 'Zucchini'],
  );
});

test('getExpiryRecommendations treats exact duplicate records as semantically indistinguishable', () => {
  const duplicate = { id: 'same', name: 'Same', expiryDate: '2026-07-29' };
  const result = getExpiryRecommendations([duplicate, { ...duplicate }], '2026-07-28', 3);
  assert.deepEqual(result, [duplicate, duplicate]);
});

test('mergeGroceryItems applies the complete supported field policy in either input order', () => {
  const items = [
    { id: 'first', source: 'manual', ingredientId: 'tomato', name: 'Zucchini tomatoes', quantity: 1, unit: 'pieces', category: 'Vegetable', checked: false },
    { id: 'second', source: 'recipe', ingredientId: 'tomato', name: 'Cherry tomatoes', quantity: 2, unit: 'pieces', category: 'Fruit', checked: true },
  ];
  const expected = [{ ingredientId: 'tomato', name: 'Cherry tomatoes', quantity: 3, unit: 'pieces', category: 'Fruit', checked: true }];
  assert.deepEqual(mergeGroceryItems(items), expected);
  assert.deepEqual(mergeGroceryItems([...items].reverse()), expected);
});
