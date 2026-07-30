import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_STATE } from '../src/state.js';
import { createCustomIngredient, removeCustomRecipe, saveCustomRecipe } from '../src/customState.js';

const state = () => ({ ...DEFAULT_STATE, pantry: [], mealPlan: [], grocery: [], customIngredients: [], customRecipes: [] });

test('creates a reusable custom ingredient with a sticker', () => {
  const result = createCustomIngredient(state(), { name: 'Tofu', icon: '\u{1FAD8}', category: 'Protein', defaultUnit: 'grams' });
  assert.equal(result.ingredient.name, 'Tofu');
  assert.equal(result.ingredient.icon, '\u{1FAD8}');
  assert.equal(result.ingredient.isCustom, true);
  assert.equal(result.state.customIngredients.length, 1);
});

test('saves and updates a complete custom recipe', () => {
  const created = saveCustomRecipe(state(), {
    name: 'Crispy tofu bowl', timeMinutes: 20, difficulty: 'easy', mealType: 'lunch', dietaryTags: ['vegetarian'],
    ingredients: [{ ingredientId: 'tofu', quantity: 200, unit: 'grams' }], steps: ['Fry the tofu.', 'Serve warm.'],
  });
  const recipe = created.customRecipes[0];
  assert.equal(recipe.isCustom, true);
  assert.match(recipe.id, /^custom-recipe-/);
  const updated = saveCustomRecipe(created, { ...recipe, name: 'Golden tofu bowl' });
  assert.equal(updated.customRecipes.length, 1);
  assert.equal(updated.customRecipes[0].name, 'Golden tofu bowl');
});

test('custom recipes require ingredients and cooking steps', () => {
  assert.throws(() => saveCustomRecipe(state(), { name: 'Empty', timeMinutes: 10, ingredients: [], steps: ['Cook'] }), /ingredient/);
  assert.throws(() => saveCustomRecipe(state(), { name: 'Empty', timeMinutes: 10, ingredients: [{ ingredientId: 'egg', quantity: 1, unit: 'pieces' }], steps: [] }), /step/);
});

test('removing a custom recipe also clears its planned slots', () => {
  const current = { ...state(), customRecipes: [{ id: 'custom-recipe-one' }], mealPlan: [{ id: 'slot', recipeId: 'custom-recipe-one' }] };
  const next = removeCustomRecipe(current, 'custom-recipe-one');
  assert.deepEqual(next.customRecipes, []);
  assert.deepEqual(next.mealPlan, []);
});
