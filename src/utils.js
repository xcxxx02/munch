const localISO = value => { const date = new Date(value); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };

export const label = value => String(value ?? '').replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
export const todayISO = () => localISO(new Date());
export const dateFromToday = days => {
  if (days === '' || days === null || days === undefined) return '';
  const amount = Number(days);
  if (!Number.isFinite(amount) || amount < 0) return '';
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + Math.round(amount));
  return localISO(date);
};
export const daysUntil = value => {
  if (!value) return '';
  const start = new Date(`${todayISO()}T12:00:00`);
  const end = new Date(`${value}T12:00:00`);
  if (Number.isNaN(end.getTime())) return '';
  return Math.max(0, Math.round((end - start) / 86400000));
};
export const daysLeftLabel = value => {
  const days = daysUntil(value);
  if (days === '') return 'No expiry';
  if (days === 0) return 'Use today';
  return `${days} day${days === 1 ? '' : 's'} left`;
};
export const formatDate = value => new Intl.DateTimeFormat('en-MY', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(`${value}T12:00:00`));
export const ingredientById = (ingredients, id) => ingredients.find(item => item.id === id) ?? { id, name: id, category: 'Other', defaultUnit: 'pieces' };
export const daysFromToday = (count = 7) => Array.from({ length: count }, (_, index) => { const date = new Date(); date.setDate(date.getDate() + index); return localISO(date); });
export const recipeImage = recipe => recipe.image;
