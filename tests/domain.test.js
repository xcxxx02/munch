import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getAvailability,
  getExpiryRecommendations,
  mergeGroceryItems,
} from '../src/domain.js';

test('getAvailability reports partial availability for egg and tomato', () => {
  const recipe = {
    ingredients: [
      { name: 'Egg', quantity: 2 },
      { name: 'Tomato', quantity: 3 },
    ],
  };
  const pantry = [
    { name: 'Egg', quantity: 1 },
    { name: 'Tomato', quantity: 1 },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    available: [
      { name: 'Egg', required: 2, stocked: 1, remaining: 1 },
      { name: 'Tomato', required: 3, stocked: 1, remaining: 2 },
    ],
    missing: [
      { name: 'Egg', quantity: 1 },
      { name: 'Tomato', quantity: 2 },
    ],
    complete: false,
  });
});

test('getExpiryRecommendations returns pantry items expiring within 3 days', () => {
  const pantry = [
    { name: 'Tomato', expiryDate: '2026-07-29' },
    { name: 'Egg', expiryDate: '2026-07-31' },
    { name: 'Rice', expiryDate: '2026-08-01' },
  ];

  assert.deepEqual(
    getExpiryRecommendations(pantry, new Date('2026-07-28T00:00:00Z'), 3),
    [pantry[0], pantry[1]],
  );
});

test('mergeGroceryItems combines duplicates and preserves checked state', () => {
  const items = [
    { name: 'Tomato', quantity: 2, category: 'Produce', checked: true },
    { name: 'tomato', quantity: 1, category: 'Produce', checked: false },
    { name: 'Egg', quantity: 6, category: 'Dairy', checked: false },
  ];

  assert.deepEqual(mergeGroceryItems(items), [
    { name: 'Tomato', quantity: 3, category: 'Produce', checked: true },
    { name: 'Egg', quantity: 6, category: 'Dairy', checked: false },
  ]);
});