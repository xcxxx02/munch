import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAvailability,
  getExpiryRecommendations,
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

test('mergeGroceryItems merges only matching ingredientId and unit pairs', () => {
  const items = [
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 2, unit: 'pieces', category: 'Produce', checked: true },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 1, unit: 'pieces', category: 'Produce', checked: false },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 0.5, unit: 'kg', category: 'Produce', checked: false },
    { ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'Dairy', checked: false },
  ];

  assert.deepEqual(mergeGroceryItems(items), [
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 3, unit: 'pieces', category: 'Produce', checked: true },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 0.5, unit: 'kg', category: 'Produce', checked: false },
    { ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'Dairy', checked: false },
  ]);
});
