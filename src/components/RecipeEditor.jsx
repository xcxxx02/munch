import { useEffect, useMemo, useState } from 'react';
import { Check, ImagePlus, LoaderCircle, Plus, Sparkles, Trash2, X } from 'lucide-react';
import { dietaryTags, ingredients, mealTypes } from '../data.js';
import { useMunchStore } from '../store.js';
import { compressRecipeImage } from '../image.js';
import { ingredientById, label } from '../utils.js';
import { IngredientThumb } from './IngredientThumb.jsx';
import { Modal } from './Modal.jsx';

const blank = { name: '', localName: '', timeMinutes: 25, difficulty: 'easy', mealType: 'dinner', dietaryTags: ['halal'], ingredients: [], steps: [''] };

export function RecipeEditor({ open, recipe, onClose, onSaved }) {
  const customIngredients = useMunchStore(state => state.customIngredients);
  const saveRecipe = useMunchStore(state => state.saveRecipe);
  const deleteRecipe = useMunchStore(state => state.deleteRecipe);
  const allIngredients = useMemo(() => [...ingredients, ...customIngredients], [customIngredients]);
  const [draft, setDraft] = useState(blank);
  const [ingredientId, setIngredientId] = useState('egg');
  const [quantity, setQuantity] = useState('1');
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState('');
  useEffect(() => {
    if (!open) return;
    setImageError('');
    setImageBusy(false);
    setDraft(recipe ? { ...recipe, ingredients: recipe.ingredients.map(item => ({ ...item })), steps: [...recipe.steps] } : { ...blank, ingredients: [], steps: [''] });
  }, [open, recipe]);
  const selectedIngredient = ingredientById(allIngredients, ingredientId);

  const addIngredient = () => {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount <= 0) return;
    setDraft(value => ({ ...value, ingredients: [...value.ingredients.filter(item => item.ingredientId !== ingredientId), { ingredientId, quantity: amount, unit: selectedIngredient.defaultUnit }] }));
    setQuantity('1');
  };
  const toggleTag = tag => setDraft(value => ({ ...value, dietaryTags: value.dietaryTags.includes(tag) ? value.dietaryTags.filter(item => item !== tag) : [...value.dietaryTags, tag] }));
const chooseImage = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageBusy(true);
    setImageError('');
    try {
      const imageData = await compressRecipeImage(file);
      setDraft(value => ({ ...value, imageData }));
    } catch (error) {
      setImageError(error.message);
    } finally {
      setImageBusy(false);
      event.target.value = '';
    }
  };
  const submit = () => {
    const normalized = { ...draft, steps: draft.steps.map(step => step.trim()).filter(Boolean) };
    if (saveRecipe(normalized)) { onSaved?.(); onClose(); }
  };

  return <Modal open={open} onClose={onClose} title={recipe ? 'Edit your recipe' : 'Make your own recipe'} size="large">
    <div className="space-y-6">
      <div className="flex items-center gap-3 rounded-2xl bg-custard/45 p-4"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-aubergine shadow-card"><Sparkles size={20} /></span><p className="text-sm font-bold text-ink/60">Pick ingredients and write the cooking steps. Munch makes the cover for you.</p></div>
<section>
        <p className="eyebrow mb-3">Recipe photo</p>
        <div className="relative overflow-hidden rounded-[1.5rem] border-2 border-dashed border-aubergine/25 bg-mint/35">
          {draft.imageData ? <div className="aspect-[16/7]"><img src={draft.imageData} alt="Your recipe preview" className="h-full w-full object-cover" /></div> : <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 p-6 text-center"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-aubergine shadow-card">{imageBusy ? <LoaderCircle className="animate-spin" size={21} /> : <ImagePlus size={21} />}</span><strong className="font-display text-lg font-black">Add a food photo</strong><small className="max-w-xs font-bold text-ink/45">Choose one from your phone. It will be resized before saving.</small><input className="sr-only" type="file" accept="image/*" onChange={chooseImage} disabled={imageBusy} /></label>}
          {draft.imageData && <div className="absolute bottom-3 right-3 flex gap-2"><label className="secondary-btn min-h-10 cursor-pointer bg-white/95 px-3 text-sm"><ImagePlus size={16} /> Replace<input className="sr-only" type="file" accept="image/*" onChange={chooseImage} disabled={imageBusy} /></label><button type="button" className="secondary-btn min-h-10 bg-white/95 px-3 text-sm text-tomato" onClick={() => setDraft(value => ({ ...value, imageData: '' }))}><Trash2 size={16} /> Remove</button></div>}
        </div>
        {imageError && <p className="mt-2 text-sm font-bold text-tomato">{imageError}</p>}
      </section>

      <section>
        <p className="eyebrow mb-3">The dish</p>
        <div className="grid gap-3 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-extrabold">Recipe name</span><input autoFocus className="field" value={draft.name} onChange={event => setDraft(value => ({ ...value, name: event.target.value }))} placeholder="e.g. Mum's fried rice" /></label><label><span className="mb-2 block text-sm font-extrabold">Another name <small className="text-ink/40">optional</small></span><input className="field" value={draft.localName} onChange={event => setDraft(value => ({ ...value, localName: event.target.value }))} placeholder="Local or family nickname" /></label></div>
        <div className="mt-3 grid grid-cols-3 gap-3"><label><span className="mb-2 block text-sm font-extrabold">Meal</span><select className="field px-3" value={draft.mealType} onChange={event => setDraft(value => ({ ...value, mealType: event.target.value }))}>{mealTypes.map(item => <option key={item} value={item}>{label(item)}</option>)}</select></label><label><span className="mb-2 block text-sm font-extrabold">Minutes</span><input className="field px-3" type="number" min="1" value={draft.timeMinutes} onChange={event => setDraft(value => ({ ...value, timeMinutes: event.target.value }))} /></label><label><span className="mb-2 block text-sm font-extrabold">Level</span><select className="field px-3" value={draft.difficulty} onChange={event => setDraft(value => ({ ...value, difficulty: event.target.value }))}><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label></div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">{dietaryTags.map(tag => <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`chip shrink-0 ${draft.dietaryTags.includes(tag) ? 'chip-active' : ''}`}>{draft.dietaryTags.includes(tag) && <Check size={15} />}{label(tag)}</button>)}</div>
      </section>

      <section className="border-t-2 border-ink/10 pt-5">
        <div className="mb-3 flex items-end justify-between"><div><p className="eyebrow">Ingredients</p><h3 className="font-display text-2xl font-black">What goes in?</h3></div><small className="font-extrabold text-ink/40">{draft.ingredients.length} added</small></div>
        <div className="grid grid-cols-[1fr_5.5rem_auto] gap-2"><select className="field min-w-0 px-3" value={ingredientId} onChange={event => setIngredientId(event.target.value)}>{allIngredients.map(item => <option key={item.id} value={item.id}>{item.icon} {item.name}</option>)}</select><input aria-label="Ingredient quantity" className="field px-3" type="number" min="0.1" step="0.5" value={quantity} onChange={event => setQuantity(event.target.value)} /><button type="button" className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white" onClick={addIngredient} aria-label="Add ingredient"><Plus size={20} /></button></div>
        <p className="mt-1 text-xs font-bold text-ink/40">Quantity is measured in {selectedIngredient.defaultUnit}.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{draft.ingredients.map(ref => { const ingredient = ingredientById(allIngredients, ref.ingredientId); return <div key={ref.ingredientId} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white/70 p-2.5"><IngredientThumb ingredient={ingredient} size="small" /><span className="min-w-0 flex-1"><strong className="block truncate text-sm">{ingredient.name}</strong><small className="font-bold text-ink/45">{ref.quantity} {ref.unit}</small></span><button type="button" className="grid h-9 w-9 place-items-center rounded-xl text-tomato hover:bg-tomato/10" onClick={() => setDraft(value => ({ ...value, ingredients: value.ingredients.filter(item => item.ingredientId !== ref.ingredientId) }))} aria-label={`Remove ${ingredient.name}`}><X size={17} /></button></div>; })}</div>
      </section>

      <section className="border-t-2 border-ink/10 pt-5">
        <p className="eyebrow">Method</p><h3 className="mb-3 font-display text-2xl font-black">How do you make it?</h3>
        <div className="space-y-3">{draft.steps.map((step, index) => <div className="flex items-start gap-2" key={index}><span className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aubergine font-display font-black text-white">{index + 1}</span><textarea className="field min-h-20 resize-y py-3" value={step} onChange={event => setDraft(value => ({ ...value, steps: value.steps.map((item, itemIndex) => itemIndex === index ? event.target.value : item) }))} placeholder={index === 0 ? 'Heat the pan and add a little oil...' : 'Write the next step...'} /><button type="button" className="mt-2 grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink/35 hover:bg-tomato/10 hover:text-tomato" onClick={() => setDraft(value => ({ ...value, steps: value.steps.filter((_, itemIndex) => itemIndex !== index) }))}><X size={16} /></button></div>)}</div>
        <button type="button" className="secondary-btn mt-3 w-full border-dashed" onClick={() => setDraft(value => ({ ...value, steps: [...value.steps, ''] }))}><Plus size={17} /> Add another step</button>
      </section>

      <div className="sticky bottom-0 -mx-1 flex gap-3 border-t-2 border-ink/10 bg-[#fffaf0]/95 px-1 pt-4 backdrop-blur">{recipe && <button type="button" className="secondary-btn px-3 text-tomato" onClick={() => { deleteRecipe(recipe.id); onClose(); }} aria-label="Delete recipe"><Trash2 size={18} /></button>}<button type="button" className="primary-btn flex-1" onClick={submit}><Sparkles size={18} /> Save my recipe</button></div>
    </div>
  </Modal>;
}
