import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChefHat, Clock3, Plus, ShoppingBasket } from 'lucide-react';
import { getAvailability, getIngredientAvailability } from '../domain.js';
import { ingredients } from '../data.js';
import { useMunchStore } from '../store.js';
import { ingredientById, label, todayISO } from '../utils.js';
import { Modal } from './Modal.jsx';

export function RecipeDialog({ recipe, onClose }) {
  const pantry = useMunchStore(state => state.pantry);
  const planRecipe = useMunchStore(state => state.planRecipe);
  const [mode, setMode] = useState('details');
  const [step, setStep] = useState(0);
  useEffect(() => { setMode('details'); setStep(0); }, [recipe?.id]);
  if (!recipe) return null;
  const availability = getAvailability(recipe, pantry);

  return (
    <Modal open={Boolean(recipe)} onClose={onClose} title={recipe.name} size="large">
      <div className="grid gap-6 md:grid-cols-[.9fr_1.1fr]">
        <div>
          <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] border-2 border-ink/10 bg-mint">
            <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = recipe.fallbackImage; }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip min-h-9 py-1"><Clock3 size={15} /> {recipe.timeMinutes} min</span>
            {recipe.dietaryTags.map(tag => <span className="chip min-h-9 py-1" key={tag}>{label(tag)}</span>)}
          </div>
        </div>

        {mode === 'details' ? (
          <div className="page-enter">
            <p className="eyebrow">{label(recipe.mealType)} / {label(recipe.difficulty)}</p>
            <p className="mt-2 text-sm font-bold text-ink/55">{recipe.localName}</p>
            <div className="my-5 flex items-center justify-between rounded-2xl bg-mint/70 p-4">
              <span><strong className="block text-lg">Pantry match</strong><small className="font-bold text-ink/55">You have {availability.availableCount} of {availability.totalCount}</small></span>
              <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-white font-display text-lg font-black">{Math.round(availability.availableCount / availability.totalCount * 100)}%</span>
            </div>
            <div className="space-y-2">
              {recipe.ingredients.map(ref => {
                const ingredient = ingredientById(ingredients, ref.ingredientId);
                const status = getIngredientAvailability(ref, pantry);
                return <div key={ref.ingredientId} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/70 p-3"><span className={`grid h-8 w-8 place-items-center rounded-full ${status.available ? 'bg-mint text-leaf' : 'bg-tomato/15 text-tomato'}`}>{status.available ? <Check size={17} /> : <ShoppingBasket size={16} />}</span><span className="flex-1 font-bold">{ingredient.name}</span><small className="font-extrabold text-ink/50">{ref.quantity} {ref.unit}</small></div>;
              })}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="secondary-btn" onClick={() => setMode('cook')}><ChefHat size={19} /> Start cooking</button>
              <button className="primary-btn" onClick={() => { planRecipe(todayISO(), recipe.mealType, recipe.id); onClose(); }}><Plus size={19} /> Plan today</button>
            </div>
          </div>
        ) : (
          <div className="page-enter flex min-h-[24rem] flex-col rounded-[1.5rem] border-2 border-ink bg-aubergine p-6 text-white shadow-pop">
            <p className="text-xs font-black uppercase tracking-[.18em] text-custard">Cooking mode</p>
            <div className="my-5 flex gap-2">{recipe.steps.map((_, index) => <span key={index} className={`h-2 flex-1 rounded-full ${index <= step ? 'bg-custard' : 'bg-white/20'}`} />)}</div>
            <p className="text-sm font-bold text-white/60">Step {step + 1} of {recipe.steps.length}</p>
            <p className="my-auto py-8 font-display text-2xl font-black leading-snug sm:text-3xl">{recipe.steps[step]}</p>
            <div className="grid grid-cols-2 gap-3">
              <button className="secondary-btn border-white/20 bg-white/10 text-white hover:bg-white/20" disabled={step === 0} onClick={() => setStep(value => value - 1)}><ArrowLeft size={18} /> Back</button>
              {step < recipe.steps.length - 1 ? <button className="primary-btn" onClick={() => setStep(value => value + 1)}>Next <ArrowRight size={18} /></button> : <button className="primary-btn" onClick={onClose}><Check size={18} /> Done</button>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
