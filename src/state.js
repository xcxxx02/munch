import { mergeGroceryItems } from './domain.js';

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

export function addPantryItem(state, item) {
  const pantryItem = { ...item, id: item?.id ?? createPantryId() };
  return { ...state, pantry: [...state.pantry, pantryItem] };
}

export function toggleGroceryItem(state, groceryId) {
  let changed = false;
  const grocery = state.grocery.map(item => {
    if (item.id !== groceryId) return item;
    changed = true;
    return { ...item, checked: !item.checked };
  });
  return changed ? { ...state, grocery } : state;
}

export function addRecipeToPlan(state, entry) {
  const mealPlan = state.mealPlan.filter(item => !(item.date === entry.date && item.mealType === entry.mealType));
  return { ...state, mealPlan: [...mealPlan, { ...entry }] };
}

export function addMissingIngredients(state, missing) {
  const additions = Array.isArray(missing)
    ? missing.map(item => ({ ...item, source: item.source ?? 'recipe' }))
    : [];
  return { ...state, grocery: mergeGroceryItems([...state.grocery, ...additions]) };
}
