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
    .map(item => ({ ...item, id: item.id.trim() }));
}

function normalizeMealPlan(mealPlan) {
  const slots = new Map();
  for (const item of mealPlan.filter(isRecord)) {
    try {
      const normalized = createMealPlanEntry(item);
      slots.set(`${normalized.date}:${normalized.mealType}`, {
        ...item,
        ...normalized,
        id: typeof item.id === 'string' && item.id.trim() !== '' ? item.id : normalized.id,
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
    grocery = mergeGroceryItems(value.grocery.filter(item => isRecord(item) && typeof item.ingredientId === 'string' && item.ingredientId.trim() !== '' && typeof item.unit === 'string' && item.unit.trim() !== ''));
  } catch {
    grocery = [];
  }
  return {
    ...value,
    pantry: normalizePantry(value.pantry),
    mealPlan: normalizeMealPlan(value.mealPlan),
    grocery,
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
