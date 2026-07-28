import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

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

test('getAvailability treats stock with an incompatible unit as unavailable', () => {
  const recipe = {
    ingredients: [
      { ingredientId: 'flour', quantity: 2, unit: 'pieces' },
    ],
  };
  const pantry = [
    { ingredientId: 'flour', quantity: 5, unit: 'kg' },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    availableCount: 0,
    totalCount: 1,
    missing: [
      { ingredientId: 'flour', quantity: 2, unit: 'pieces' },
    ],
  });
});

test('getAvailability treats missing recipe and pantry units as incompatible', () => {
  const recipe = {
    ingredients: [
      { ingredientId: 'flour', quantity: 2 },
      { ingredientId: 'sugar', quantity: 1, unit: 'kg' },
    ],
  };
  const pantry = [
    { ingredientId: 'flour', quantity: 5 },
    { ingredientId: 'sugar', quantity: 3 },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    availableCount: 0,
    totalCount: 2,
    missing: [
      { ingredientId: 'flour', quantity: 2, unit: undefined },
      { ingredientId: 'sugar', quantity: 1, unit: 'kg' },
    ],
  });
});

test('getAvailability treats a missing unit on either side as incompatible', () => {
  const recipe = {
    ingredients: [
      { ingredientId: 'egg', quantity: 2, unit: 'pieces' },
    ],
  };
  const pantry = [
    { ingredientId: 'egg', quantity: 2 },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    availableCount: 0,
    totalCount: 1,
    missing: [
      { ingredientId: 'egg', quantity: 2, unit: 'pieces' },
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
    { ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'Dairy', checked: false },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 0.5, unit: 'kg', category: 'Produce', checked: false },
    { ingredientId: 'tomato', name: 'Tomatoes', quantity: 3, unit: 'pieces', category: 'Produce', checked: true },
  ]);
});


test('mergeGroceryItems sorts all groups by the collision-safe structured key', () => {
  const items = [
    { ingredientId: 'zucchini', unit: 'pieces', quantity: 1 },
    { ingredientId: 'a\u0000b', unit: 'c', quantity: 2 },
    { ingredientId: 'a', unit: 'b\u0000c', quantity: 3 },
    { ingredientId: 'apple', unit: 'kg', quantity: 4 },
  ];
  const expected = mergeGroceryItems(items);

  assert.deepEqual(mergeGroceryItems([...items].reverse()), expected);
  assert.deepEqual(expected.map(item => [item.ingredientId, item.unit]), [
    ['a', 'b\u0000c'],
    ['a\u0000b', 'c'],
    ['apple', 'kg'],
    ['zucchini', 'pieces'],
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

test('createMealPlanEntry accepts valid ISO datetimes without seconds', () => {
  assert.equal(
    createMealPlanEntry({ date: '2026-07-28T12:34Z', mealType: 'dinner', recipeId: 'r5' }).date,
    '2026-07-28',
  );
  assert.equal(
    createMealPlanEntry({ date: '2026-07-28T12:34+05:30', mealType: 'dinner', recipeId: 'r6' }).date,
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
  const expected = [{ ingredientId: 'tomato', name: 'Cherry tomatoes', quantity: 3, unit: 'pieces', category: 'Fruit', checked: true, id: 'first', source: 'mixed' }];
  assert.deepEqual(mergeGroceryItems(items), expected);
  assert.deepEqual(mergeGroceryItems([...items].reverse()), expected);
});

test('createMealPlanEntry rejects invalid calendar components in timezone-bearing datetimes', () => {
  for (const date of [
    '2026-02-30T12:00:00Z',
    '2026-02-30T12:00:00+05:30',
    '2026-02-30T12:00:00-0500',
  ]) {
    assert.throws(
      () => createMealPlanEntry({ date, mealType: 'dinner', recipeId: 'r6' }),
      { message: 'date must be a valid date' },
    );
  }
});

test('mergeGroceryItems uses a collision-safe structured key and validates key fields', () => {
  const items = [
    { ingredientId: 'a\u0000b', unit: 'c', name: 'First', quantity: 1 },
    { ingredientId: 'a', unit: 'b\u0000c', name: 'Second', quantity: 2 },
  ];
  assert.deepEqual(mergeGroceryItems(items).map(item => item.quantity), [2, 1]);
  assert.throws(() => mergeGroceryItems([{ unit: 'pieces' }]), {
    message: 'ingredientId and unit are required for grocery items',
  });
  assert.throws(() => mergeGroceryItems([{ ingredientId: 'egg' }]), {
    message: 'ingredientId and unit are required for grocery items',
  });
});

test('mergeGroceryItems preserves a shared source and marks conflicting sources mixed', () => {
  const shared = mergeGroceryItems([
    { id: 'grocery-1', source: 'manual', ingredientId: 'egg', unit: 'pieces', quantity: 1 },
    { id: 'grocery-1', source: 'manual', ingredientId: 'egg', unit: 'pieces', quantity: 2 },
  ]);
  assert.equal(shared[0].id, 'grocery-1');
  assert.equal(shared[0].source, 'manual');

  const mixed = mergeGroceryItems([
    { id: 'recipe-1', source: 'recipe', ingredientId: 'egg', unit: 'pieces', quantity: 1 },
    { id: 'manual-1', source: 'manual', ingredientId: 'egg', unit: 'pieces', quantity: 2 },
  ]);
  assert.equal(mixed[0].id, 'manual-1');
  assert.equal(mixed[0].source, 'mixed');
});

test('mergeGroceryItems ignores missing sources when preserving known sources', () => {
  const manualAndMissing = [
    { source: 'manual', ingredientId: 'egg', unit: 'pieces', quantity: 1 },
    { ingredientId: 'egg', unit: 'pieces', quantity: 2 },
  ];
  const expected = [{ ingredientId: 'egg', name: undefined, quantity: 3, unit: 'pieces', category: undefined, checked: false, source: 'manual' }];
  assert.deepEqual(mergeGroceryItems(manualAndMissing), expected);
  assert.deepEqual(mergeGroceryItems([...manualAndMissing].reverse()), expected);

  const recipeAndManual = [
    { source: 'recipe', ingredientId: 'egg', unit: 'pieces', quantity: 1 },
    { source: 'manual', ingredientId: 'egg', unit: 'pieces', quantity: 2 },
  ];
  assert.equal(mergeGroceryItems(recipeAndManual)[0].source, 'mixed');
  assert.equal(mergeGroceryItems([...recipeAndManual].reverse())[0].source, 'mixed');
});

test('mergeGroceryItems treats null and unknown sources as unknown', () => {
  const nullAndManual = mergeGroceryItems([
    { source: null, ingredientId: 'egg', unit: 'pieces', quantity: 1 },
    { source: 'manual', ingredientId: 'egg', unit: 'pieces', quantity: 2 },
  ]);
  assert.equal(nullAndManual[0].source, 'manual');

  const unknownAndRecipe = mergeGroceryItems([
    { source: 'imported', ingredientId: 'flour', unit: 'kg', quantity: 1 },
    { source: 'recipe', ingredientId: 'flour', unit: 'kg', quantity: 2 },
  ]);
  assert.equal(unknownAndRecipe[0].source, 'recipe');

  const onlyUnknown = mergeGroceryItems([
    { source: 'imported', ingredientId: 'rice', unit: 'kg', quantity: 1 },
    { source: '', ingredientId: 'rice', unit: 'kg', quantity: 2 },
  ]);
  assert.equal(Object.hasOwn(onlyUnknown[0], 'source'), false);
});

import { dietaryTags, defaultPantry, ingredients, mealTypes, recipes } from '../src/data.js';

test('curated recipe data exports the required collections and exact filters', () => {
  assert.deepEqual(dietaryTags, ['halal', 'vegetarian', 'no-pork', 'no-seafood']);
  assert.deepEqual(mealTypes, ['breakfast', 'lunch', 'dinner']);
  assert.ok(Array.isArray(ingredients));
  assert.ok(Array.isArray(recipes));
  assert.ok(Array.isArray(defaultPantry));
});

test('every curated recipe satisfies the data contract', () => {
  const ingredientIds = new Set(ingredients.map(ingredient => ingredient.id));
  const recipeIds = new Set();

  assert.ok(recipes.length >= 8);
  for (const recipe of recipes) {
    for (const field of ['id', 'name', 'localName', 'timeMinutes', 'difficulty', 'dietaryTags', 'image', 'fallbackImage', 'ingredients', 'steps']) {
      assert.ok(recipe[field] !== undefined && recipe[field] !== null, `${recipe.id} is missing ${field}`);
    }
    assert.equal(recipeIds.has(recipe.id), false, `duplicate recipe id: ${recipe.id}`);
    recipeIds.add(recipe.id);
    assert.equal(mealTypes.includes(recipe.mealType), true, `${recipe.id} has an invalid meal type`);
    assert.ok(recipe.dietaryTags.every(tag => dietaryTags.includes(tag)), `${recipe.id} has an invalid dietary tag`);
    assert.match(recipe.image, new RegExp(`^/recipes/${recipe.id}\\.jpg$`));
    assert.ok(recipe.steps.length >= 1, `${recipe.id} has no cooking steps`);
    for (const reference of recipe.ingredients) {
      assert.equal(ingredientIds.has(reference.ingredientId), true, `${recipe.id} references ${reference.ingredientId}`);
      assert.equal(typeof reference.quantity, 'number');
      assert.ok(reference.quantity > 0);
      assert.equal(typeof reference.unit, 'string');
    }
  }
});

test('recipe images have an exact JPG contract and a local fallback asset', () => {
  for (const recipe of recipes) {
    assert.equal(recipe.image, `/recipes/${recipe.id}.jpg`);
    assert.equal(recipe.fallbackImage, '/recipes/placeholder.svg');
  }
  assert.equal(existsSync(resolve('public/recipes/placeholder.svg')), true);
});
test('ingredient and default pantry records satisfy their shapes', () => {
  const ingredientIds = new Set(ingredients.map(ingredient => ingredient.id));
  assert.equal(ingredientIds.size, ingredients.length);
  for (const ingredient of ingredients) {
    for (const field of ['id', 'name', 'localName', 'icon', 'category', 'defaultUnit']) {
      assert.equal(typeof ingredient[field], 'string', `${ingredient.id} is missing ${field}`);
    }
  }
  for (const item of defaultPantry) {
    for (const field of ['id', 'ingredientId', 'name', 'icon', 'unit']) {
      assert.equal(typeof item[field], 'string', `${item.id} is missing ${field}`);
    }
    assert.equal(typeof item.quantity, 'number');
    assert.equal(ingredientIds.has(item.ingredientId), true, `${item.id} references an unknown ingredient`);
    const ingredient = ingredients.find(candidate => candidate.id === item.ingredientId);
    assert.equal(item.unit, ingredient.defaultUnit, `${item.id} must use the catalog unit`);
    if (item.expiryDate !== undefined) assert.match(item.expiryDate, /^\d{4}-\d{2}-\d{2}$/);
  }
});
