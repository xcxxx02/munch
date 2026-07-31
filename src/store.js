import { create } from 'zustand';
import { recipes, ingredients, defaultPantry } from './data.js';
import { loadState, saveState } from './storage.js';
import {
  DEFAULT_STATE, addPantryItem, updatePantryItem, removePantryItem, addRecipeToPlan,
  reconcilePlannedGroceries, addManualGroceryItem, toggleGroceryItem,
} from './state.js';
import { createCustomIngredient, removeCustomRecipe, saveCustomRecipe } from './customState.js';

const fallbackState = { ...DEFAULT_STATE, pantry: defaultPantry.map(item => ({ ...item })) };
const storage = typeof window === 'undefined' ? null : window.localStorage;
const initial = loadState(storage, fallbackState);

let toastTimer;

export const useMunchStore = create((set, get) => ({
  ...initial,
  saveFailed: false,
  toast: '',
  burst: 0,
  mascotMood: 'happy',

  notify(message, mood = 'happy') {
    window.clearTimeout(toastTimer);
    set(state => ({ toast: message, mascotMood: mood, burst: state.burst + 1 }));
    toastTimer = window.setTimeout(() => set({ toast: '' }), 2200);
  },

  commit(producer, message, mood = 'happy') {
    try {
      const current = get();
      const domain = { version: current.version, pantry: current.pantry, mealPlan: current.mealPlan, grocery: current.grocery, customIngredients: current.customIngredients, customRecipes: current.customRecipes, preferences: current.preferences };
      const next = producer(domain);
      const saved = saveState(storage, next);
      set({ ...next, saveFailed: !saved });
      if (message) get().notify(message, mood);
      return true;
    } catch (error) {
      get().notify(error.message || 'That did not work', 'oops');
      return false;
    }
  },

  addPantry(ingredient) {
    return get().commit(state => addPantryItem(state, {
      ingredientId: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.id === 'egg' ? 6 : 1,
      unit: ingredient.defaultUnit,
    }), `${ingredient.name} tucked into your pantry`);
  },
  addCustomIngredient(input, pantryDetails = null) {
    return get().commit(state => {
      const result = createCustomIngredient(state, input);
      return pantryDetails ? addPantryItem(result.state, {
        ingredientId: result.ingredient.id, name: result.ingredient.name, icon: result.ingredient.icon,
        quantity: Number(pantryDetails.quantity) || 1, unit: result.ingredient.defaultUnit,
        expiryDate: pantryDetails.expiryDate || '',
      }) : result.state;
    }, `${input.name} added to your pantry`);
  },
  addPantryWithDetails(ingredient, details) {
    return get().commit(state => addPantryItem(state, {
      ingredientId: ingredient.id, name: ingredient.name, icon: ingredient.icon,
      quantity: Number(details.quantity) || 1, unit: ingredient.defaultUnit,
      expiryDate: details.expiryDate || '',
    }), `${ingredient.name} tucked into your pantry`);
  },
  updatePantry(id, changes) { return get().commit(state => updatePantryItem(state, id, changes), 'Pantry updated'); },
  removePantry(id) { return get().commit(state => removePantryItem(state, id), 'Removed from pantry', 'wink'); },
  planRecipe(date, mealType, recipeId) {
    const allRecipes = [...recipes, ...get().customRecipes];
    const allIngredients = [...ingredients, ...get().customIngredients];
    const recipe = allRecipes.find(item => item.id === recipeId);
    return get().commit(state => reconcilePlannedGroceries(addRecipeToPlan(state, { date, mealType, recipeId }), allRecipes, allIngredients), `${recipe?.name ?? 'Meal'} added to your plan`);
  },
  fillPlanDay(date, selections) {
    const picks = Array.isArray(selections) ? selections.filter(item => item?.mealType && item?.recipeId) : [];
    if (!picks.length) return false;
    const allRecipes = [...recipes, ...get().customRecipes];
    const allIngredients = [...ingredients, ...get().customIngredients];
    return get().commit(state => {
      const planned = picks.reduce((next, pick) => addRecipeToPlan(next, { date, mealType: pick.mealType, recipeId: pick.recipeId }), state);
      return reconcilePlannedGroceries(planned, allRecipes, allIngredients);
    }, `${picks.length} little meal${picks.length === 1 ? '' : 's'} added to your day`);
  },
  removePlan(date, mealType) {
    return get().commit(state => reconcilePlannedGroceries({ ...state, mealPlan: state.mealPlan.filter(item => !(item.date === date && item.mealType === mealType)) }, [...recipes, ...get().customRecipes], [...ingredients, ...get().customIngredients]), 'Meal removed', 'wink');
  },
  saveRecipe(recipe) {
    return get().commit(state => {
      const next = saveCustomRecipe(state, recipe);
      return reconcilePlannedGroceries(next, [...recipes, ...next.customRecipes], [...ingredients, ...next.customIngredients]);
    }, `${recipe.name} saved to your cookbook`);
  },
  deleteRecipe(id) {
    return get().commit(state => {
      const next = removeCustomRecipe(state, id);
      return reconcilePlannedGroceries(next, [...recipes, ...next.customRecipes], [...ingredients, ...next.customIngredients]);
    }, 'Recipe removed', 'wink');
  },
  toggleGrocery(id) { return get().commit(state => toggleGroceryItem(state, id), 'List updated'); },
  clearChecked() { return get().commit(state => ({ ...state, grocery: state.grocery.filter(item => !item.checked) }), 'Checked items cleared'); },
  addManualGrocery(item) { return get().commit(state => addManualGroceryItem(state, item), `${item.name} added to grocery`); },
}));
