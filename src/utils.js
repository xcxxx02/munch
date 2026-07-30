export const label = value => String(value ?? '').replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
export const todayISO = () => new Date().toISOString().slice(0, 10);
export const formatDate = value => new Intl.DateTimeFormat('en-MY', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
export const ingredientById = (ingredients, id) => ingredients.find(item => item.id === id) ?? { id, name: id, category: 'Other', defaultUnit: 'pieces' };
export const daysFromToday = (count = 7) => Array.from({ length: count }, (_, index) => { const date = new Date(); date.setDate(date.getDate() + index); return date.toISOString().slice(0, 10); });
export const recipeImage = recipe => recipe.image;
