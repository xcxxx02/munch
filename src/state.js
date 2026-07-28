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

function normalizeIdentifier(value, message) {
  if (typeof value !== 'string' || value.trim() === '') throw new Error(message);
  return value.trim();
}

function normalizeGroceryItem(item) {
  const normalized = { ...item,
    ingredientId: normalizeIdentifier(item.ingredientId, 'ingredientId must be a non-blank string'),
    unit: normalizeIdentifier(item.unit, 'ingredientId and unit are required for grocery items'),
  };
  if (item.id !== undefined) normalized.id = normalizeIdentifier(item.id, 'grocery item id must be a non-blank string');
  return normalized;
}


export function addPantryItem(state, item) {
  assertState(state);
  requireRecord(item, 'pantry item must be an object');
  const ingredientId = normalizeIdentifier(item.ingredientId, 'ingredientId must be a non-blank string');
  if (item.id !== undefined && (typeof item.id !== 'string' || item.id.trim() === '')) {
    throw new Error('pantry item id must be a non-blank string');
  }
  const pantryItem = { ...item, ingredientId, id: item.id === undefined ? createPantryId() : item.id.trim() };
  return { ...state, pantry: [...state.pantry, pantryItem] };
}

export function updatePantryItem(state, pantryId, changes) {
  assertState(state);
  const id = normalizeIdentifier(pantryId, 'pantryId must be a non-blank string');
  requireRecord(changes, 'pantry changes must be an object');
  let changed = false;
  const pantry = state.pantry.map(item => {
    if (item?.id !== id) return item;
    changed = true;
    if (changes.quantity !== undefined && (!Number.isFinite(Number(changes.quantity)) || Number(changes.quantity) < 0)) throw new Error('quantity must be a non-negative number');
    if (changes.expiryDate !== undefined && changes.expiryDate !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(changes.expiryDate)) throw new Error('expiryDate must be a valid date');
    return { ...item, ...changes, id, ingredientId: item.ingredientId, ...(changes.quantity === undefined ? {} : { quantity: Number(changes.quantity) }) };
  });
  return changed ? { ...state, pantry } : state;
}

export function removePantryItem(state, pantryId) {
  assertState(state);
  const id = normalizeIdentifier(pantryId, 'pantryId must be a non-blank string');
  return { ...state, pantry: state.pantry.filter(item => item?.id !== id) };
}
export function toggleGroceryItem(state, groceryId) {
  assertState(state);
  const normalizedId = normalizeIdentifier(groceryId, 'groceryId must be a non-blank string');
  let changed = false;
  const grocery = state.grocery.map(item => {
    if (typeof item?.id !== 'string' || item.id.trim() !== normalizedId) return item;
    changed = true;
    return { ...item, checked: !item.checked };
  });
  return changed ? { ...state, grocery } : state;
}

export function addRecipeToPlan(state, entry) {
  assertState(state);
  requireRecord(entry, 'meal plan entry must be an object');
  const normalizedEntry = { ...entry,
    recipeId: normalizeIdentifier(entry.recipeId, 'recipeId must be a non-blank string'),
  };
  if (entry.id !== undefined) normalizedEntry.id = normalizeIdentifier(entry.id, 'meal plan entry id must be a non-blank string');
  const normalized = createMealPlanEntry(normalizedEntry);
  const mealPlan = state.mealPlan.filter(item => {
    try {
      const existing = createMealPlanEntry(item);
      return !(existing.date === normalized.date && existing.mealType === normalized.mealType);
    } catch {
      return true;
    }
  });
  return { ...state, mealPlan: [...mealPlan, { ...normalizedEntry, ...normalized, id: normalizedEntry.id ?? normalized.id }] };
}

export function addMissingIngredients(state, missing) {
  assertState(state);
  if (!Array.isArray(missing)) throw new Error('missing ingredients must be an array');
  const additions = missing.map(item => {
    requireRecord(item, 'missing ingredient must be an object');
    const normalized = normalizeGroceryItem(item);
    const source = item.source ?? 'recipe';
    if (normalized.id === undefined && source === 'recipe') normalized.id = 'grocery-' + normalized.ingredientId + '-' + normalized.unit;
    return { ...normalized, source };
  });
  return { ...state, grocery: mergeGroceryItems([...state.grocery.map(normalizeGroceryItem), ...additions]) };
}
