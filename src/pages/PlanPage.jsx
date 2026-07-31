import { useState } from 'react';
import { CalendarDays, ChevronRight, Plus, Sparkles, Trash2 } from 'lucide-react';
import { recipes, mealTypes } from '../data.js';
import { getExpiryRecommendations, rankRecipesForPantry } from '../domain.js';
import { useMunchStore } from '../store.js';
import { daysFromToday, formatDate, label, todayISO } from '../utils.js';
import { Modal } from '../components/Modal.jsx';
import { RecipeCover } from '../components/RecipeCover.jsx';

const mealAccent = {
  breakfast: 'bg-custard/55',
  lunch: 'bg-mint/70',
  dinner: 'bg-aubergine text-white',
};

const dayName = (date, index) => index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : formatDate(date).split(',')[0];
const dayNumber = date => new Date(`${date}T12:00:00`).getDate();

export function PlanPage() {
  const pantry = useMunchStore(state => state.pantry);
  const mealPlan = useMunchStore(state => state.mealPlan);
  const customRecipes = useMunchStore(state => state.customRecipes);
  const allRecipes = [...recipes, ...customRecipes];
  const planRecipe = useMunchStore(state => state.planRecipe);
  const fillPlanDay = useMunchStore(state => state.fillPlanDay);
  const removePlan = useMunchStore(state => state.removePlan);
  const [slot, setSlot] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const days = daysFromToday(7);
  const date = days[selectedDay];
  const expiryIds = getExpiryRecommendations(pantry, todayISO(), 4).map(item => item.ingredientId);
  const entries = mealTypes.map(mealType => {
    const entry = mealPlan.find(item => item.date === date && item.mealType === mealType);
    return { mealType, entry, recipe: allRecipes.find(item => item.id === entry?.recipeId) };
  });
  const plannedCount = entries.filter(item => item.recipe).length;
  const suggestions = entries
    .filter(item => !item.recipe)
    .map(item => ({
      mealType: item.mealType,
      recipeId: rankRecipesForPantry(allRecipes.filter(recipe => recipe.mealType === item.mealType), pantry, expiryIds)[0]?.recipe.id,
    }))
    .filter(item => item.recipeId);
  const pickerRecipes = slot ? [...allRecipes].sort((left, right) => Number(right.mealType === slot.mealType) - Number(left.mealType === slot.mealType) || left.timeMinutes - right.timeMinutes) : [];

  return <div className="page">
    <header className="mb-6"><p className="eyebrow">Seven-day rhythm</p><h1 className="mt-1 font-display text-4xl font-black tracking-[-.055em] sm:text-5xl">Pick a day.<br /><span className="text-aubergine">Keep it delicious.</span></h1><p className="mt-3 max-w-xl font-semibold text-ink/55">See one day at a time, fill only what you need, and let Grocery handle the missing bits.</p></header>

    <div className="-mx-4 mb-5 flex snap-x gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0" aria-label="Choose a day">
      {days.map((itemDate, index) => {
        const planned = mealTypes.filter(mealType => mealPlan.some(item => item.date === itemDate && item.mealType === mealType)).length;
        const active = index === selectedDay;
        return <button key={itemDate} type="button" aria-pressed={active} aria-label={`${dayName(itemDate, index)}, ${planned} of 3 meals planned`} onClick={() => setSelectedDay(index)} className={`min-w-[4.65rem] snap-start rounded-[1.35rem] border-2 px-2 py-3 text-center transition ${active ? 'border-ink bg-aubergine text-white shadow-[0_5px_0_#173B34]' : 'border-ink/10 bg-white/70 text-ink hover:border-ink/30'}`}>
          <small className={`block text-[10px] font-black uppercase tracking-wide ${active ? 'text-custard' : 'text-ink/45'}`}>{dayName(itemDate, index)}</small>
          <strong className="mt-1 block font-display text-2xl font-black">{dayNumber(itemDate)}</strong>
          <span className="mt-2 flex justify-center gap-1" aria-hidden="true">{mealTypes.map((mealType, dot) => <i key={mealType} className={`h-1.5 w-1.5 rounded-full ${dot < planned ? active ? 'bg-mint' : 'bg-tomato' : active ? 'bg-white/25' : 'bg-ink/15'}`} />)}</span>
        </button>;
      })}
    </div>

    <section className="soft-card overflow-hidden">
      <div className="flex flex-col gap-4 border-b-2 border-ink/10 bg-white/50 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div><p className="eyebrow">{dayName(date, selectedDay)}</p><h2 className="mt-1 font-display text-2xl font-black">{formatDate(date)}</h2><p className="mt-1 text-sm font-bold text-ink/45">{plannedCount}/3 little meals planned</p></div>
        <button type="button" className="primary-btn w-full sm:w-auto" disabled={!suggestions.length} onClick={() => fillPlanDay(date, suggestions)}><Sparkles size={18} />{suggestions.length ? `Fill ${suggestions.length} empty slot${suggestions.length === 1 ? '' : 's'}` : 'Day is ready'}</button>
      </div>

      <div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-5">
        {entries.map(({ mealType, recipe }) => <article key={mealType} className={`relative rounded-[1.45rem] border-2 border-ink/10 p-4 ${recipe ? mealAccent[mealType] : 'border-dashed bg-butter/70'}`}>
          <p className={`text-[10px] font-black uppercase tracking-[.16em] ${mealType === 'dinner' && recipe ? 'text-custard' : 'text-tomato'}`}>{label(mealType)}</p>
          {recipe ? <div className="mt-3 flex items-center gap-3 sm:block"><button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left sm:block sm:w-full" onClick={() => setSlot({ date, mealType })}><span className="block h-20 w-20 shrink-0 overflow-hidden rounded-2xl sm:mb-3 sm:h-28 sm:w-full"><RecipeCover recipe={recipe} /></span><span className="min-w-0"><strong className="block font-display text-lg font-black leading-tight">{recipe.name}</strong><small className={`mt-1 block font-bold ${mealType === 'dinner' ? 'text-white/60' : 'text-ink/50'}`}>{recipe.timeMinutes} min · tap to replace</small></span></button><button type="button" aria-label={`Remove ${recipe.name}`} className={`grid h-11 w-11 shrink-0 place-items-center rounded-full sm:absolute sm:bottom-3 sm:right-3 ${mealType === 'dinner' ? 'bg-white/10 text-white' : 'bg-white/70 text-ink'}`} onClick={() => removePlan(date, mealType)}><Trash2 size={16} /></button></div> : <button type="button" aria-label={`Add ${mealType} for ${formatDate(date)}`} onClick={() => setSlot({ date, mealType })} className="mt-3 flex min-h-20 w-full items-center gap-3 text-left"><span className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink bg-white"><Plus size={18} /></span><span><strong className="block font-display text-lg font-black">Add {mealType}</strong><small className="font-bold text-ink/40">Pick any favourite</small></span></button>}
        </article>)}
      </div>
    </section>

    <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-bold text-ink/45"><CalendarDays size={16} />Missing ingredients join Grocery automatically.</p>

    <Modal open={Boolean(slot)} onClose={() => setSlot(null)} title={slot ? `${label(slot.mealType)} / ${formatDate(slot.date)}` : 'Pick a recipe'} size="large">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-mint p-4"><CalendarDays /><p className="font-bold">Matching mealtime first. You can still pick anything you like.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">{pickerRecipes.map(recipe => <button key={recipe.id} type="button" onClick={() => { planRecipe(slot.date, slot.mealType, recipe.id); setSlot(null); }} className="flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-white p-3 text-left transition hover:scale-[1.02] hover:border-ink"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"><RecipeCover recipe={recipe} /></div><span className="min-w-0 flex-1"><strong className="block truncate font-display text-lg font-black">{recipe.name}</strong><small className="font-bold text-ink/45">{label(recipe.mealType)} · {recipe.timeMinutes} min</small></span><ChevronRight size={18} /></button>)}</div>
    </Modal>
  </div>;
}
