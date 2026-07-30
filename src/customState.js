function requireState(state) {
  if (!state || !Array.isArray(state.customIngredients) || !Array.isArray(state.customRecipes)) throw new Error('custom collections are required');
}

function required(value, message) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(message);
  return value.trim();
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item';
}

export function createCustomIngredient(state, input) {
  requireState(state);
  const name = required(input?.name, 'ingredient name is required');
  const defaultUnit = required(input?.defaultUnit, 'ingredient unit is required');
  const duplicate = state.customIngredients.find(item => item.name.toLowerCase() === name.toLowerCase());
  if (duplicate) return { state, ingredient: duplicate };
  const ingredient = {
    id: `custom-${slug(name)}-${Date.now()}`,
    name,
    localName: input.localName?.trim() || '',
    icon: input.icon?.trim() || '\u{1F9FA}',
    category: input.category?.trim() || 'Other',
    defaultUnit,
    isCustom: true,
  };
  return { state: { ...state, customIngredients: [...state.customIngredients, ingredient] }, ingredient };
}

export function saveCustomRecipe(state, input) {
  requireState(state);
  const name = required(input?.name, 'recipe name is required');
  if (!Array.isArray(input.ingredients) || input.ingredients.length === 0) throw new Error('add at least one ingredient');
  const steps = Array.isArray(input.steps) ? input.steps.map(step => step.trim()).filter(Boolean) : [];
  if (steps.length === 0) throw new Error('add at least one cooking step');
  const timeMinutes = Number(input.timeMinutes);
  if (!Number.isFinite(timeMinutes) || timeMinutes <= 0) throw new Error('cooking time must be positive');
  const id = typeof input.id === 'string' && input.id.startsWith('custom-recipe-') ? input.id : `custom-recipe-${slug(name)}-${Date.now()}`;
  const recipe = {
    ...input,
    id,
    name,
    localName: input.localName?.trim() || name,
    timeMinutes,
    isCustom: true,
    ingredients: input.ingredients.map(item => ({ ...item, quantity: Number(item.quantity) })),
    steps,
    dietaryTags: Array.isArray(input.dietaryTags) ? input.dietaryTags : [],
  };
  const customRecipes = state.customRecipes.filter(item => item.id !== id);
  return { ...state, customRecipes: [...customRecipes, recipe] };
}

export function removeCustomRecipe(state, recipeId) {
  requireState(state);
  const id = required(recipeId, 'recipe id is required');
  return { ...state, customRecipes: state.customRecipes.filter(item => item.id !== id), mealPlan: state.mealPlan.filter(item => item.recipeId !== id) };
}
