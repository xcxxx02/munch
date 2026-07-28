export const STORAGE_KEY = 'munch:v1';

function isState(value) {
  return value !== null
    && typeof value === 'object'
    && value.version === 1
    && Array.isArray(value.pantry)
    && Array.isArray(value.mealPlan)
    && Array.isArray(value.grocery)
    && value.preferences !== null
    && typeof value.preferences === 'object'
    && Array.isArray(value.preferences.dietaryTags);
}

export function loadState(storage, fallbackState) {
  try {
    if (!storage || typeof storage.getItem !== 'function') return fallbackState;
    const raw = storage.getItem(STORAGE_KEY);
    if (typeof raw !== 'string') return fallbackState;
    const parsed = JSON.parse(raw);
    return isState(parsed) ? parsed : fallbackState;
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
