import { Check, Clock3, Edit3, Plus } from 'lucide-react';
import { getAvailability } from '../domain.js';
import { useMunchStore } from '../store.js';
import { label } from '../utils.js';
import { RecipeCover } from './RecipeCover.jsx';

export function RecipeCard({ recipe, onOpen, onEdit, compact = false, showAdd = false }) {
  const pantry = useMunchStore(state => state.pantry);
  const availability = getAvailability(recipe, pantry);

  return (
    <article className={`recipe-card soft-card group relative overflow-hidden ${compact ? 'flex min-h-28' : ''}`}>
      <button type="button" onClick={() => onOpen(recipe)} className={`block w-full text-left ${compact ? 'flex' : ''}`}>
        <div className={`relative overflow-hidden bg-mint ${compact ? 'w-28 shrink-0 sm:w-36' : 'aspect-[4/3]'}`}>
          <RecipeCover recipe={recipe} className="recipe-photo" />
          <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-leaf">{label(recipe.mealType)}</span>
        </div>
        <div className="flex-1 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold text-ink/55"><Clock3 size={14} /> {recipe.timeMinutes} min <span className="h-1 w-1 rounded-full bg-tomato" /> {label(recipe.difficulty)}</div>
          <h3 className="font-display text-xl font-black leading-tight tracking-[-0.035em] text-ink sm:text-2xl">{recipe.name}</h3>
          {!compact && <p className="mt-1 text-sm font-semibold text-ink/55">{recipe.localName}</p>}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-extrabold text-leaf"><Check size={15} /> {availability.availableCount}/{availability.totalCount} in your pantry</div>
        </div>
      </button>
      {recipe.isCustom && onEdit && <button type="button" className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-full border-2 border-white bg-ink text-white shadow-card" onClick={() => onEdit(recipe)} aria-label={`Edit ${recipe.name}`}><Edit3 size={16} /></button>}
      {showAdd && <button type="button" className="m-4 mt-0 flex h-11 w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-2xl bg-ink font-extrabold text-white transition hover:bg-aubergine" onClick={() => onOpen(recipe, true)}><Plus size={18} /> Plan it</button>}
    </article>
  );
}
