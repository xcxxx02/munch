const MEAL_TYPES = new Set(['breakfast', 'lunch', 'dinner']);

// Duplicate metadata uses the lexicographically smallest non-null value.
function compareMetadata(left, right) {
  if (left === right) return left;
  if (left === undefined || left === null) return right;
  if (right === undefined || right === null) return left;
  return String(left) < String(right) ? left : right;
}

function compareStableValue(left, right) {
  const leftValue = left === undefined || left === null ? '' : String(left);
  const rightValue = right === undefined || right === null ? '' : String(right);
  return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
}

function asQuantity(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }

  if (typeof value !== 'string' && typeof value !== 'number') return null;

  if (typeof value === 'string') {
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (dateOnly) {
      const [, year, month, day] = dateOnly;
      const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      return date.getUTCFullYear() === Number(year)
        && date.getUTCMonth() === Number(month) - 1
        && date.getUTCDate() === Number(day)
        ? date
        : null;
    }

    const timezoneLessDateTime = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;
    if (timezoneLessDateTime.test(value)) value = `${value}Z`;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getAvailability(recipe, pantry) {
  const ingredients = Array.isArray(recipe?.ingredients) ? recipe.ingredients : [];
  const pantryItems = Array.isArray(pantry) ? pantry : [];
  const missing = [];
  let availableCount = 0;

  for (const ingredient of ingredients) {
    const stock = pantryItems
      .filter(item => item?.ingredientId === ingredient?.ingredientId)
      .reduce((total, item) => total + asQuantity(item?.quantity), 0);
    const required = asQuantity(ingredient?.quantity);

    if (stock >= required) {
      availableCount += 1;
    } else {
      missing.push({
        ingredientId: ingredient?.ingredientId,
        quantity: required - stock,
        unit: ingredient?.unit,
      });
    }
  }

  return { availableCount, totalCount: ingredients.length, missing };
}

export function getExpiryRecommendations(pantry, today = new Date(), windowDays = 3) {
  const start = parseDate(today);
  if (!start || !Array.isArray(pantry) || !Number.isFinite(windowDays)) return [];

  const startDate = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const startTime = startDate.getTime();
  const endTime = startTime + windowDays * 24 * 60 * 60 * 1000;

  return pantry
    .map(item => ({ item, date: parseDate(item?.expiryDate) }))
    .map(({ item, date }) => ({
      item,
      date,
      dateTime: date && Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    }))
    .filter(({ date, dateTime }) => date && dateTime >= startTime && dateTime <= endTime)
    .sort((a, b) => a.dateTime - b.dateTime
      || compareStableValue(a.item?.id, b.item?.id)
      || compareStableValue(a.item?.name, b.item?.name)
      || compareStableValue(a.item?.ingredientId, b.item?.ingredientId)
      || compareStableValue(a.item?.unit, b.item?.unit))
    .map(({ item }) => item);
}

export function mergeGroceryItems(items) {
  if (!Array.isArray(items)) return [];
  const merged = new Map();

  for (const item of items) {
    const key = `${item?.ingredientId}\u0000${item?.unit}`;
    const existing = merged.get(key);
    if (existing) {
      existing.quantity += asQuantity(item?.quantity);
      existing.checked = Boolean(existing.checked || item?.checked);
      existing.name = compareMetadata(existing.name, item?.name);
      existing.category = compareMetadata(existing.category, item?.category);
    } else {
      merged.set(key, { ...item, quantity: asQuantity(item?.quantity), checked: Boolean(item?.checked) });
    }
  }

  return [...merged.values()];
}

export function createMealPlanEntry({ date, mealType, recipeId } = {}) {
  if (date === undefined || date === null || date === '') {
    throw new Error('date is required');
  }
  if (!MEAL_TYPES.has(mealType)) {
    throw new Error('mealType must be breakfast, lunch or dinner');
  }
  if (recipeId === undefined || recipeId === null || recipeId === '') {
    throw new Error('recipeId is required');
  }

  const parsedDate = parseDate(date);
  if (!parsedDate) throw new Error('date must be a valid date');
  const normalizedDate = parsedDate.toISOString().slice(0, 10);

  return {
    id: `${normalizedDate}-${mealType}`,
    date: normalizedDate,
    mealType,
    recipeId,
  };
}
