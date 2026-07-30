import { createMealPlanEntry, mergeGroceryItems } from './domain.js';

export const STORAGE_KEY = 'munch:v1';

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isState(value) {
  return isRecord(value)
    && value.version === 1
    && Array.isArray(value.pantry)
    && Array.isArray(value.mealPlan)
    && Array.isArray(value.grocery)
    && isRecord(value.preferences)
    && Array.isArray(value.preferences.dietaryTags);
}

function normalizePantry(pantry) {
  return pantry.filter(isRecord)
    .filter(item => typeof item.id === 'string' && item.id.trim() !== '')
    .filter(item => typeof item.ingredientId === 'string' && item.ingredientId.trim() !== '')
    .map(item => ({ ...item, id: item.id.trim(), ingredientId: item.ingredientId.trim() }));
}

function normalizeMealPlan(mealPlan) {
  const slots = new Map();
  for (const item of mealPlan.filter(isRecord)) {
    try {
      if (item.recipeId === undefined || typeof item.recipeId !== 'string' || item.recipeId.trim() === '') continue;
      if (item.id !== undefined && (typeof item.id !== 'string' || item.id.trim() === '')) continue;
      const normalized = createMealPlanEntry({ ...item, recipeId: item.recipeId.trim() });
      slots.set(`${normalized.date}:${normalized.mealType}`, {
        ...item,
        ...normalized,
        id: typeof item.id === 'string' ? item.id.trim() : normalized.id,
        recipeId: normalized.recipeId,
      });
    } catch {
      // Ignore malformed persisted records while retaining the rest of the state.
    }
  }
  return [...slots.values()];
}

export function normalizeState(value) {
  if (!isState(value)) return null;
  let grocery;
  try {
    grocery = mergeGroceryItems(value.grocery
      .filter(item => isRecord(item)
        && typeof item.ingredientId === 'string'
        && item.ingredientId.trim() !== ''
        && typeof item.unit === 'string'
        && item.unit.trim() !== ''
        && (item.id === undefined || (typeof item.id === 'string' && item.id.trim() !== '')))
      .map(item => ({
        ...item,
        ingredientId: item.ingredientId.trim(),
        unit: item.unit.trim(),
        ...(item.id === undefined ? {} : { id: item.id.trim() }),
      })));
  } catch {
    grocery = [];
  }
  return {
    ...value,
    pantry: normalizePantry(value.pantry),
    mealPlan: normalizeMealPlan(value.mealPlan),
    grocery,
    customIngredients: Array.isArray(value.customIngredients)
      ? value.customIngredients.filter(isRecord).filter(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.defaultUnit === 'string') : [],
    customRecipes: Array.isArray(value.customRecipes)
      ? value.customRecipes.filter(isRecord).filter(item => typeof item.id === 'string' && typeof item.name === 'string' && Array.isArray(item.ingredients) && Array.isArray(item.steps)) : [],
    preferences: {
      ...value.preferences,
      dietaryTags: [...new Set(value.preferences.dietaryTags
        .filter(tag => typeof tag === 'string' && tag.trim() !== '')
        .map(tag => tag.trim()))],
    },
  };
}

export function loadState(storage, fallbackState) {
  try {
    if (!storage || typeof storage.getItem !== 'function') return fallbackState;
    const raw = storage.getItem(STORAGE_KEY);
    if (typeof raw !== 'string') return fallbackState;
    const parsed = JSON.parse(raw);
    return normalizeState(parsed) ?? fallbackState;
  } catch {
    return fallbackState;
  }
}

export function saveState(storage, state) {
  try {
    if (!storage || typeof storage.setItem !== 'function') return false;
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(storage) {
  try {
    if (!storage || typeof storage.removeItem !== 'function') return false;
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
