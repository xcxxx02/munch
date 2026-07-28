const MEAL_TYPES = new Set(['breakfast', 'lunch', 'dinner']);
const GROCERY_SOURCES = new Set(['recipe', 'manual']);

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

function compareStableNumber(left, right) {
  const leftValue = typeof left === 'number' && Number.isFinite(left) ? left : 0;
  const rightValue = typeof right === 'number' && Number.isFinite(right) ? right : 0;
  return leftValue - rightValue;
}

function asQuantity(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function hasRequiredKeyValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function normalizeGroceryKey(value) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function asGrocerySource(value) {
  return GROCERY_SOURCES.has(value) ? value : undefined;
}

function contribution(item, source) {
  const quantityKey = source + 'Quantity';
  if (typeof item?.[quantityKey] === 'number' && Number.isFinite(item[quantityKey])) return item[quantityKey];
  return item?.source === source ? asQuantity(item?.quantity) : 0;
}

function contributionChecked(item, source) {
  const checkedKey = source + 'Checked';
  return item?.[checkedKey] === undefined ? (item?.source === source && Boolean(item?.checked)) : Boolean(item[checkedKey]);
}

function parseDate(value) {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : new Date(value.getTime());
  }
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  if (typeof value === 'string') {
    const isoDate = /^(\d{4})-(\d{2})-(\d{2})(?:$|([T ])(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}(?::?\d{2})?)?$)/.exec(value);
    if (!isoDate) return null;

    const [, yearText, monthText, dayText, separator, hoursText, minutesText, secondsText = '00', fraction, timezone] = isoDate;
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);
    const hours = Number(hoursText || 0);
    const minutes = Number(minutesText || 0);
    const seconds = Number(secondsText);
    const calendarDate = new Date(0);
    calendarDate.setUTCFullYear(year, month - 1, day);
    calendarDate.setUTCHours(0, 0, 0, 0);
    if (calendarDate.getUTCFullYear() !== year
      || calendarDate.getUTCMonth() !== month - 1
      || calendarDate.getUTCDate() !== day
      || hours > 23 || minutes > 59 || seconds > 59) return null;

    if (!separator) return calendarDate;
    if (timezone && timezone !== 'Z') {
      const offset = timezone.slice(1).replace(':', '');
      if (Number(offset.slice(0, 2)) > 23 || Number(offset.slice(2)) > 59) return null;
    }

    const normalized = `${yearText}-${monthText}-${dayText}T${hoursText}:${minutesText}:${secondsText}${fraction ? `.${fraction}` : ''}${timezone || 'Z'}`;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
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
    const availability = getIngredientAvailability(ingredient, pantryItems);
    if (availability.available) availableCount += 1;
    else missing.push({ ingredientId: ingredient?.ingredientId, quantity: availability.missingQuantity, unit: ingredient?.unit });
  }
  return { availableCount, totalCount: ingredients.length, missing };
}

export function getIngredientAvailability(ingredient, pantry) {
  const pantryItems = Array.isArray(pantry) ? pantry : [];
  const stock = pantryItems
    .filter(item => item?.ingredientId === ingredient?.ingredientId
      && hasRequiredKeyValue(item?.unit)
      && hasRequiredKeyValue(ingredient?.unit)
      && item.unit === ingredient.unit)
    .reduce((total, item) => total + asQuantity(item?.quantity), 0);
  const requiredQuantity = asQuantity(ingredient?.quantity);
  return {
    available: stock >= requiredQuantity,
    stock,
    requiredQuantity,
    missingQuantity: Math.max(0, requiredQuantity - stock),
  };
}

export function getExpiryRecommendations(pantry, today = new Date(), windowDays = 3) {
  const start = parseDate(today);
  if (!start || !Array.isArray(pantry) || !Number.isFinite(windowDays)) return [];
  const startDate = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const startTime = startDate.getTime();
  const endTime = startTime + windowDays * 24 * 60 * 60 * 1000;
  return pantry
    .map(item => ({ item, date: parseDate(item?.expiryDate) }))
    .map(({ item, date }) => ({ item, date, dateTime: date && Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) }))
    .filter(({ date, dateTime }) => date && dateTime >= startTime && dateTime <= endTime)
    // PantryItem's supported fields are the complete tie-break key. Exact duplicates are semantically indistinguishable.
    .sort((a, b) => a.dateTime - b.dateTime
      || compareStableValue(a.item?.id, b.item?.id)
      || compareStableValue(a.item?.name, b.item?.name)
      || compareStableValue(a.item?.ingredientId, b.item?.ingredientId)
      || compareStableValue(a.item?.icon, b.item?.icon)
      || compareStableNumber(a.item?.quantity, b.item?.quantity)
      || compareStableValue(a.item?.unit, b.item?.unit)
      || compareStableValue(a.item?.category, b.item?.category)
      || compareStableValue(a.item?.expiryDate, b.item?.expiryDate))
    .map(({ item }) => item);
}

// Merged ids use the smallest present id; source stays shared or becomes mixed when sources differ.
export function mergeGroceryItems(items) {
  if (!Array.isArray(items)) return [];
  const merged = new Map();
  for (const item of items) {
    const ingredientId = normalizeGroceryKey(item?.ingredientId);
    const unit = normalizeGroceryKey(item?.unit);
    if (ingredientId === null || unit === null) {
      throw new Error('ingredientId and unit are required for grocery items');
    }
    const key = JSON.stringify([ingredientId, unit]);
    const existing = merged.get(key);
    if (existing) {
      const existingRecipeQuantity = contribution(existing, 'recipe');
      const existingManualQuantity = contribution(existing, 'manual');
      const existingRecipeChecked = contributionChecked(existing, 'recipe');
      const existingManualChecked = contributionChecked(existing, 'manual');
      existing.quantity += asQuantity(item?.quantity);
      existing.checked = Boolean(existing.checked || item?.checked);
      existing.name = compareMetadata(existing.name, item?.name);
      existing.category = compareMetadata(existing.category, item?.category);
      if (hasRequiredKeyValue(existing.id) || hasRequiredKeyValue(item?.id)) {
        existing.id = compareMetadata(existing.id, item?.id);
      }
      const itemSource = asGrocerySource(item?.source);
      if (itemSource !== undefined && (existing.source === undefined || existing.source !== itemSource)) {
        existing.source = existing.source === undefined ? itemSource : 'mixed';
      }
      if (existing.source === 'mixed') {
        existing.recipeQuantity = existingRecipeQuantity + contribution(item, 'recipe');
        existing.manualQuantity = existingManualQuantity + contribution(item, 'manual');
        existing.recipeChecked = existingRecipeChecked || contributionChecked(item, 'recipe');
        existing.manualChecked = existingManualChecked || contributionChecked(item, 'manual');
      }
    } else {
      const mergedItem = {
        ingredientId,
        name: item?.name,
        quantity: asQuantity(item?.quantity),
        unit,
        category: item?.category,
        checked: Boolean(item?.checked),
      };
      if (hasRequiredKeyValue(item?.id)) mergedItem.id = item.id;
      const source = asGrocerySource(item?.source);
      if (source !== undefined) mergedItem.source = source;
      if (source === 'mixed') {
        mergedItem.recipeQuantity = contribution(item, 'recipe');
        mergedItem.manualQuantity = contribution(item, 'manual');
        mergedItem.recipeChecked = contributionChecked(item, 'recipe');
        mergedItem.manualChecked = contributionChecked(item, 'manual');
      }
      merged.set(key, mergedItem);
    }
  }
  return [...merged.entries()]
    .sort(([leftKey], [rightKey]) => compareStableValue(leftKey, rightKey))
    .map(([, item]) => item);
}

export function createMealPlanEntry({ date, mealType, recipeId } = {}) {
  if (date === undefined || date === null || date === '') throw new Error('date is required');
  if (!MEAL_TYPES.has(mealType)) throw new Error('mealType must be breakfast, lunch or dinner');
  if (recipeId === undefined || recipeId === null || recipeId === '') throw new Error('recipeId is required');
  const parsedDate = parseDate(date);
  if (!parsedDate) throw new Error('date must be a valid date');
  const normalizedDate = parsedDate.toISOString().slice(0, 10);
  return { id: `${normalizedDate}-${mealType}`, date: normalizedDate, mealType, recipeId };
}
