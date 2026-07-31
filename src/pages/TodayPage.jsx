import { useState } from 'react';
import { ArrowRight, Clock3, Leaf, Plus, Sparkles } from 'lucide-react';
import { recipes, ingredients } from '../data.js';
import { getExpiryRecommendations, rankRecipesForPantry } from '../domain.js';
import { useMunchStore } from '../store.js';
import { daysLeftLabel, formatDate, ingredientById, todayISO } from '../utils.js';
import { Mascot } from '../components/Mascot.jsx';
import { RecipeCard } from '../components/RecipeCard.jsx';
import { RecipeDialog } from '../components/RecipeDialog.jsx';
import { IngredientThumb } from '../components/IngredientThumb.jsx';

const moods = [['quick', 'Quick'], ['cozy', 'Cozy'], ['stocked', 'Use mine']];

export function TodayPage() {
  const pantry = useMunchStore(state => state.pantry);
  const customRecipes = useMunchStore(state => state.customRecipes);
  const customIngredients = useMunchStore(state => state.customIngredients);
  const allRecipes = [...recipes, ...customRecipes];
  const allIngredients = [...ingredients, ...customIngredients];
  const [mood, setMood] = useState('quick');
  const [selected, setSelected] = useState(null);
  const expiry = getExpiryRecommendations(pantry, todayISO(), 4);
  let candidates = allRecipes;
  if (mood === 'quick') candidates = candidates.filter(recipe => recipe.timeMinutes <= 25);
  if (mood === 'cozy') candidates = candidates.filter(recipe => recipe.timeMinutes >= 30 || recipe.mealType === 'dinner');
  let ranked = rankRecipesForPantry(candidates, pantry, expiry.map(item => item.ingredientId));
  if (mood === 'stocked') ranked = ranked.filter(item => item.availability.availableCount > 0);
  const recommendation = ranked[0];
  const rescueItems = recommendation ? expiry.filter(item => recommendation.recipe.ingredients.some(ref => ref.ingredientId === item.ingredientId)) : [];
  const rescueNames = rescueItems.map(item => ingredientById(allIngredients, item.ingredientId).name).slice(0, 2);

  return <div className="page space-y-8">
    <section className="relative overflow-hidden rounded-[2.25rem] border-2 border-ink bg-mint px-5 py-7 shadow-pop sm:px-8 sm:py-10">
      <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full bg-custard/80" />
      <div className="relative grid items-center gap-4 sm:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow">{formatDate(todayISO())}</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-black leading-[.98] tracking-[-.06em] text-ink sm:text-6xl">What should we<br /><span className="text-aubergine">munch today?</span></h1>
          <p className="mt-4 max-w-lg font-semibold text-ink/65">A tiny food buddy that turns what you have into one easy next meal.</p>
        </div>
        <div className="justify-self-center sm:justify-self-end"><Mascot /></div>
      </div>
    </section>

    <section>
      <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Meal mood">
        {moods.map(([key, text]) => <button key={key} className={`chip shrink-0 ${mood === key ? 'chip-active' : ''}`} onClick={() => setMood(key)}>{key === 'stocked' ? <Leaf size={16} /> : key === 'cozy' ? <Sparkles size={16} /> : <Clock3 size={16} />}{text}</button>)}
      </div>
    </section>

    <section className="bento-grid">
      <div className="col-span-12 lg:col-span-8">
        <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Best match</p><h2 className="section-title">Your tiny plan</h2></div><span className="rounded-full bg-tomato px-3 py-1 text-xs font-black text-white">picked for you</span></div>
        {recommendation ? <><div className={`mb-3 flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${rescueItems.length ? 'border-tomato/30 bg-custard/55' : 'border-leaf/15 bg-mint/60'}`}><Sparkles className={rescueItems.length ? 'text-tomato' : 'text-leaf'} size={20} /><p className="text-sm font-bold">{rescueItems.length ? <>Uses <strong>{rescueNames.join(' + ')}</strong> before {rescueItems.length === 1 ? 'it goes' : 'they go'}.</> : <>Best match for what is already in your pantry.</>}</p></div><RecipeCard recipe={recommendation.recipe} onOpen={setSelected} showAdd /></> : <div className="soft-card p-8 text-center"><p className="font-display text-2xl font-black">Nothing fits this mood yet.</p><a className="primary-btn mt-4" href="#/pantry">Add an ingredient</a></div>}
      </div>
      <aside className="col-span-12 rounded-munch border-2 border-ink bg-aubergine p-5 text-white shadow-pop lg:col-span-4">
        <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-custard">Use these first</p><h2 className="mt-1 font-display text-2xl font-black">Pantry rescue</h2></div><Leaf className="text-mint" /></div>
        <div className="mt-5 space-y-3">
          {expiry.length ? expiry.slice(0, 3).map(item => { const ingredient = ingredientById(allIngredients, item.ingredientId); return <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"><IngredientThumb ingredient={ingredient} size="small" /><span className="flex-1"><strong className="block">{ingredient.name}</strong><small className="text-white/60">{item.quantity} {item.unit} left</small></span><b className="text-xs text-custard">{daysLeftLabel(item.expiryDate)}</b></div>; }) : <p className="rounded-2xl bg-white/10 p-4 text-sm font-semibold text-white/70">Nothing is in a hurry. Nice.</p>}
        </div>
        <a href="#/pantry" className="mt-5 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white font-extrabold text-aubergine">Open pantry <ArrowRight size={17} /></a>
      </aside>
    </section>

    <section className="soft-card flex items-center gap-4 p-5 sm:p-6"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-custard"><Plus /></span><p className="flex-1 font-semibold"><strong className="block font-display text-lg font-black">Small win of the day</strong>Cooking one meal at home counts. Munch is rooting for you.</p></section>
    <RecipeDialog recipe={selected} onClose={() => setSelected(null)} />
  </div>;
}
