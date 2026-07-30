import { useState } from 'react';
import { CalendarDays, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { recipes, mealTypes } from '../data.js';
import { useMunchStore } from '../store.js';
import { daysFromToday, formatDate, label } from '../utils.js';
import { Modal } from '../components/Modal.jsx';

const mealAccent = { breakfast: 'bg-custard', lunch: 'bg-mint', dinner: 'bg-aubergine text-white' };

export function PlanPage() {
  const mealPlan = useMunchStore(state => state.mealPlan);
  const planRecipe = useMunchStore(state => state.planRecipe);
  const removePlan = useMunchStore(state => state.removePlan);
  const [slot, setSlot] = useState(null);
  const days = daysFromToday(7);

  return <div className="page">
    <header className="mb-7"><p className="eyebrow">Seven-day view</p><h1 className="mt-1 font-display text-4xl font-black tracking-[-.055em] sm:text-5xl">A plan that leaves<br /><span className="text-aubergine">room for cravings.</span></h1><p className="mt-3 max-w-xl font-semibold text-ink/55">Pick just one meal or fill the week. Munch handles the grocery maths.</p></header>
    <div className="space-y-5">
      {days.map((date, dayIndex) => <section key={date} className="soft-card overflow-hidden">
        <div className="flex items-center justify-between border-b-2 border-ink/10 bg-white/50 px-4 py-4 sm:px-5"><span><strong className="font-display text-xl font-black">{dayIndex === 0 ? 'Today' : dayIndex === 1 ? 'Tomorrow' : formatDate(date).split(',')[0]}</strong><small className="ml-2 font-bold text-ink/45">{formatDate(date)}</small></span>{dayIndex === 0 && <span className="rounded-full bg-tomato px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">start small</span>}</div>
        <div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-4">
          {mealTypes.map(mealType => { const entry = mealPlan.find(item => item.date === date && item.mealType === mealType); const recipe = recipes.find(item => item.id === entry?.recipeId); return <div key={mealType} className={`relative min-h-32 rounded-[1.35rem] border-2 border-ink/10 p-4 ${recipe ? mealAccent[mealType] : 'border-dashed bg-butter/70'}`}>
            <p className={`text-[10px] font-black uppercase tracking-[.16em] ${mealType === 'dinner' && recipe ? 'text-custard' : 'text-tomato'}`}>{label(mealType)}</p>
            {recipe ? <><button type="button" className="mt-2 block w-full text-left" onClick={() => setSlot({ date, mealType })}><strong className="font-display text-lg font-black leading-tight">{recipe.name}</strong><small className={`mt-1 block font-bold ${mealType === 'dinner' ? 'text-white/60' : 'text-ink/50'}`}>{recipe.timeMinutes} min / tap to replace</small></button><button type="button" aria-label={`Remove ${recipe.name}`} className={`absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full ${mealType === 'dinner' ? 'bg-white/10 text-white' : 'bg-white/60 text-ink'}`} onClick={() => removePlan(date, mealType)}><Trash2 size={16} /></button></> : <button type="button" onClick={() => setSlot({ date, mealType })} className="mt-3 flex min-h-16 w-full items-center gap-3 text-left"><span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-white"><Plus size={18} /></span><span className="font-bold text-ink/45">Add a meal</span></button>}
          </div>; })}
        </div>
      </section>)}
    </div>
    <Modal open={Boolean(slot)} onClose={() => setSlot(null)} title={slot ? `${label(slot.mealType)} / ${formatDate(slot.date)}` : 'Pick a recipe'} size="large">
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-mint p-4"><CalendarDays /><p className="font-bold">Pick what sounds good. Missing ingredients will join Grocery automatically.</p></div>
      <div className="grid gap-3 sm:grid-cols-2">{recipes.filter(recipe => recipe.mealType === slot?.mealType || slot?.mealType === 'dinner').map(recipe => <button key={recipe.id} type="button" onClick={() => { planRecipe(slot.date, slot.mealType, recipe.id); setSlot(null); }} className="flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-ink"><img src={recipe.image} alt="" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = recipe.fallbackImage; }} className="h-16 w-16 rounded-xl object-cover" /><span className="flex-1"><strong className="block font-display text-lg font-black">{recipe.name}</strong><small className="font-bold text-ink/45">{recipe.timeMinutes} min</small></span><ChevronRight size={18} /></button>)}</div>
    </Modal>
  </div>;
}
