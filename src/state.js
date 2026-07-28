import { createMealPlanEntry, mergeGroceryItems } from './domain.js';

export const DEFAULT_STATE = {
  version: 1,
  pantry: [],
  mealPlan: [],
  grocery: [],
  preferences: { dietaryTags: [] },
};

let pantrySequence = 0;

function createPantryId() {
  pantrySequence += 1;
  return `pantry-${Date.now()}-${pantrySequence}`;
}

function assertState(state) {
  if (state === null || typeof state !== 'object'
    || !Array.isArray(state.pantry)
    || !Array.isArray(state.mealPlan)
    || !Array.isArray(state.grocery)) {
    throw new Error('state must have pantry, mealPlan and grocery arrays');
  }
}

function requireRecord(value, message) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error(message);
}

export function addPantryItem(state, item) {
  assertState(state);
  requireRecord(item, 'pantry item must be an object');
  if (item.id !== undefined && (typeof item.id !== 'string' || item.id.trim() === '')) {
    throw new Error('pantry item id must be a non-blank string');
  }
  const pantryItem = { ...item, id: item.id === undefined ? createPantryId() : item.id.trim() };
  return { ...state, pantry: [...state.pantry, pantryItem] };
}

export function toggleGroceryItem(state, groceryId) {
  assertState(state);
  if (typeof groceryId !== 'string' || groceryId.trim() === '') throw new Error('groceryId must be a non-blank string');
  let changed = false;
  const grocery = state.grocery.map(item => {
    if (item.id !== groceryId) return item;
    changed = true;
    return { ...item, checked: !item.checked };
  });
  return changed ? { ...state, grocery } : state;
}

export function addRecipeToPlan(state, entry) {
  assertState(state);
  requireRecord(entry, 'meal plan entry must be an object');
  const normalized = createMealPlanEntry(entry);
  const mealPlan = state.mealPlan.filter(item => {
    try {
      const existing = createMealPlanEntry(item);
      return !(existing.date === normalized.date && existing.mealType === normalized.mealType);
    } catch {
      return true;
    }
  });
  return { ...state, mealPlan: [...mealPlan, { ...entry, ...normalized, id: entry.id ?? normalized.id }] };
}

export function addMissingIngredients(state, missing) {
  assertState(state);
  if (!Array.isArray(missing)) throw new Error('missing ingredients must be an array');
  const additions = missing.map(item => {
    requireRecord(item, 'missing ingredient must be an object');
    return { ...item, source: item.source ?? 'recipe' };
  });
  return { ...state, grocery: mergeGroceryItems([...state.grocery, ...additions]) };
}
