import { create } from 'zustand';
import { recipes, ingredients, defaultPantry } from './data.js';
import { loadState, saveState } from './storage.js';
import {
  DEFAULT_STATE, addPantryItem, updatePantryItem, removePantryItem, addRecipeToPlan,
  reconcilePlannedGroceries, addManualGroceryItem, toggleGroceryItem,
} from './state.js';

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
      const domain = { version: current.version, pantry: current.pantry, mealPlan: current.mealPlan, grocery: current.grocery, preferences: current.preferences };
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
  updatePantry(id, changes) { return get().commit(state => updatePantryItem(state, id, changes), 'Pantry updated'); },
  removePantry(id) { return get().commit(state => removePantryItem(state, id), 'Removed from pantry', 'wink'); },
  planRecipe(date, mealType, recipeId) {
    const recipe = recipes.find(item => item.id === recipeId);
    return get().commit(state => reconcilePlannedGroceries(addRecipeToPlan(state, { date, mealType, recipeId }), recipes, ingredients), `${recipe?.name ?? 'Meal'} added to your plan`);
  },
  removePlan(date, mealType) {
    return get().commit(state => reconcilePlannedGroceries({ ...state, mealPlan: state.mealPlan.filter(item => !(item.date === date && item.mealType === mealType)) }, recipes, ingredients), 'Meal removed', 'wink');
  },
  toggleGrocery(id) { return get().commit(state => toggleGroceryItem(state, id), 'List updated'); },
  clearChecked() { return get().commit(state => ({ ...state, grocery: state.grocery.filter(item => !item.checked) }), 'Checked items cleared'); },
  addManualGrocery(item) { return get().commit(state => addManualGroceryItem(state, item), `${item.name} added to grocery`); },
}));
