import { useMemo, useState } from 'react';
import { CalendarClock, ChevronLeft, Edit3, PackageOpen, Plus, Search, Sparkles, Trash2 } from 'lucide-react';
import { ingredients } from '../data.js';
import { useMunchStore } from '../store.js';
import { dateFromToday, daysLeftLabel, daysUntil, ingredientById, todayISO } from '../utils.js';
import { IngredientThumb } from '../components/IngredientThumb.jsx';
import { Modal } from '../components/Modal.jsx';

const icons = ['\u{1F9FA}', '\u{1F966}', '\u{1F34E}', '\u{1F95B}', '\u{1F9C0}', '\u{1F969}', '\u{1F41F}', '\u{1F33E}', '\u{1FAD8}', '\u{1FAD9}', '\u{1F33F}', '\u{1F36B}'];
const units = ['pieces', 'grams', 'millilitres', 'stalks', 'cloves', 'packs', 'cans'];
const emptyDetails = { quantity: '1', shelfLifeDays: '' };

export function PantryPage() {
  const pantry = useMunchStore(state => state.pantry);
  const customIngredients = useMunchStore(state => state.customIngredients);
  const addPantryWithDetails = useMunchStore(state => state.addPantryWithDetails);
  const addCustomIngredient = useMunchStore(state => state.addCustomIngredient);
  const updatePantry = useMunchStore(state => state.updatePantry);
  const removePantry = useMunchStore(state => state.removePantry);
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [details, setDetails] = useState(emptyDetails);
  const [custom, setCustom] = useState({ name: '', localName: '', icon: '\u{1F9FA}', category: 'Other', defaultUnit: 'pieces' });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantity: '', shelfLifeDays: '' });
  const allIngredients = useMemo(() => [...ingredients, ...customIngredients], [customIngredients]);
  const matches = useMemo(() => allIngredients.filter(item => `${item.name} ${item.localName} ${item.category}`.toLowerCase().includes(query.toLowerCase())).slice(0, 30), [allIngredients, query]);
  const resetAdd = () => { setAddOpen(false); setQuery(''); setSelected(null); setCreating(false); setDetails(emptyDetails); };
  const openEdit = item => { setEditing(item); setForm({ quantity: item.quantity ?? '', shelfLifeDays: daysUntil(item.expiryDate) }); };
  const choose = ingredient => { setSelected(ingredient); setDetails({ quantity: ingredient.id === 'egg' ? '6' : '1', shelfLifeDays: '' }); };

  const saveSelected = () => {
    const payload = { ...details, expiryDate: details.shelfLifeDays === '' ? '' : dateFromToday(details.shelfLifeDays) };
    if (addPantryWithDetails(selected, payload)) resetAdd();
  };
  const saveCustom = () => {
    const payload = { ...details, expiryDate: details.shelfLifeDays === '' ? '' : dateFromToday(details.shelfLifeDays) };
    if (addCustomIngredient({ ...custom, name: custom.name || query }, payload)) resetAdd();
  };

  return <div className="page">
    <header className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Your ingredients</p><h1 className="mt-1 font-display text-4xl font-black tracking-[-.055em] sm:text-5xl">A calmer little<br /><span className="text-leaf">kitchen shelf.</span></h1></div><button className="primary-btn shrink-0" onClick={() => setAddOpen(true)}><Plus size={19} /><span className="hidden sm:inline">Add ingredient</span></button></header>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-munch bg-mint p-4"><strong className="font-display text-3xl font-black">{pantry.length}</strong><small className="block font-extrabold text-ink/50">items stocked</small></div><div className="rounded-munch bg-custard p-4"><strong className="font-display text-3xl font-black">{pantry.filter(item => item.expiryDate && item.expiryDate <= todayISO()).length}</strong><small className="block font-extrabold text-ink/50">need attention</small></div><div className="col-span-2 rounded-munch bg-aubergine p-4 text-white sm:col-span-1"><strong className="font-display text-xl font-black">Tiny shelf, big help.</strong><small className="mt-1 block font-bold text-white/60">Add what you actually use.</small></div></div>
    {pantry.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{pantry.map(item => { const ingredient = ingredientById(allIngredients, item.ingredientId); const expired = item.expiryDate && item.expiryDate < todayISO(); return <article key={item.id} className={`soft-card p-4 ${expired ? 'border-tomato/50' : ''}`}><div className="flex items-start gap-3"><IngredientThumb ingredient={ingredient} /><span className="min-w-0 flex-1"><strong className="block truncate font-display text-lg font-black">{ingredient.name}</strong><small className="font-bold text-ink/45">{ingredient.localName || ingredient.category}</small></span><button className="grid h-11 w-11 place-items-center rounded-xl bg-butter" onClick={() => openEdit(item)} aria-label={`Edit ${ingredient.name}`}><Edit3 size={17} /></button></div><div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3"><span className="font-extrabold">{item.quantity} <small className="text-ink/45">{item.unit}</small></span>{item.expiryDate ? <span className={`flex items-center gap-1 text-xs font-extrabold ${expired ? 'text-tomato' : 'text-ink/45'}`}><CalendarClock size={14} />{expired ? 'Past its best' : daysLeftLabel(item.expiryDate)}</span> : <span className="text-xs font-bold text-ink/35">No expiry</span>}</div></article>; })}</div> : <div className="soft-card p-10 text-center"><PackageOpen className="mx-auto text-tomato" size={42} /><p className="mt-3 font-display text-2xl font-black">Your shelf is waiting.</p><button className="primary-btn mt-4" onClick={() => setAddOpen(true)}>Add your first item</button></div>}

    <Modal open={addOpen} onClose={resetAdd} title={creating ? 'Create an ingredient' : selected ? `Add ${selected.name}` : 'Add an ingredient'}>
      {!selected && !creating ? <div>
        <label className="relative block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={19} /><input autoFocus className="field pl-11" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search eggs, tomato, milk..." /></label>
        <p className="mb-3 mt-4 text-xs font-black uppercase tracking-[.14em] text-ink/40">{query ? `${matches.length} matches` : 'All ingredients'}</p>
        <div className="grid max-h-[52vh] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">{matches.map(ingredient => <button key={ingredient.id} className="flex items-center gap-3 rounded-2xl border-2 border-ink/10 bg-white p-3 text-left transition hover:border-ink/30" onClick={() => choose(ingredient)}><IngredientThumb ingredient={ingredient} size="small" /><span className="min-w-0"><strong className="block truncate font-extrabold">{ingredient.name}</strong><small className="block truncate font-bold text-ink/40">{ingredient.localName || ingredient.category}</small></span></button>)}</div>
        <button className="mt-3 flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-aubergine/30 bg-aubergine/5 p-3 text-left" onClick={() => { setCreating(true); setCustom(value => ({ ...value, name: query })); }}><span className="grid h-10 w-10 place-items-center rounded-xl bg-aubergine text-white"><Sparkles size={18} /></span><span><strong className="block font-extrabold">{query ? `Create ?${query}?` : 'Create your own ingredient'}</strong><small className="font-bold text-ink/45">Give it a little sticker and unit</small></span></button>
      </div> : creating ? <div className="space-y-4">
        <button className="flex items-center gap-1 text-sm font-extrabold text-ink/55" onClick={() => setCreating(false)}><ChevronLeft size={17} /> Back to search</button>
        <label className="block"><span className="mb-2 block text-sm font-extrabold">Ingredient name</span><input className="field" value={custom.name} onChange={event => setCustom(value => ({ ...value, name: event.target.value }))} placeholder="e.g. Tofu" /></label>
        <div><span className="mb-2 block text-sm font-extrabold">Choose its little picture</span><div className="grid grid-cols-6 gap-2">{icons.map(icon => <button type="button" key={icon} onClick={() => setCustom(value => ({ ...value, icon }))} className={`grid aspect-square place-items-center rounded-xl border-2 text-2xl ${custom.icon === icon ? 'border-ink bg-custard' : 'border-ink/10 bg-white'}`}>{icon}</button>)}</div></div>
        <div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-sm font-extrabold">Category</span><input className="field" value={custom.category} onChange={event => setCustom(value => ({ ...value, category: event.target.value }))} /></label><label><span className="mb-2 block text-sm font-extrabold">Unit</span><select className="field" value={custom.defaultUnit} onChange={event => setCustom(value => ({ ...value, defaultUnit: event.target.value }))}>{units.map(unit => <option key={unit}>{unit}</option>)}</select></label></div>
        <QuantityFields details={details} setDetails={setDetails} />
        <button className="primary-btn w-full" onClick={saveCustom}>Create & add</button>
      </div> : <div className="space-y-5">
        <button className="flex items-center gap-1 text-sm font-extrabold text-ink/55" onClick={() => setSelected(null)}><ChevronLeft size={17} /> Pick something else</button>
        <div className="flex items-center gap-4 rounded-2xl bg-mint/60 p-4"><IngredientThumb ingredient={selected} size="large" /><span><strong className="font-display text-2xl font-black">{selected.name}</strong><small className="block font-bold text-ink/45">{selected.localName || selected.category}</small></span></div>
        <QuantityFields details={details} setDetails={setDetails} unit={selected.defaultUnit} />
        <button className="primary-btn w-full" onClick={saveSelected}>Add to pantry</button>
      </div>}
    </Modal>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? ingredientById(allIngredients, editing.ingredientId).name : 'Pantry item'}>
      <div className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-extrabold">Quantity</span><input className="field" type="number" min="0" step="0.5" value={form.quantity} onChange={event => setForm(value => ({ ...value, quantity: event.target.value }))} /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">How many days left?</span><input className="field" type="number" min="0" inputMode="numeric" placeholder="e.g. 5" value={form.shelfLifeDays} onChange={event => setForm(value => ({ ...value, shelfLifeDays: event.target.value }))} /></label><button className="primary-btn w-full" onClick={() => { if (updatePantry(editing.id, { quantity: form.quantity, expiryDate: form.shelfLifeDays === '' ? '' : dateFromToday(form.shelfLifeDays) })) setEditing(null); }}>Save changes</button><button className="secondary-btn w-full text-tomato" onClick={() => { removePantry(editing.id); setEditing(null); }}><Trash2 size={18} /> Remove from pantry</button></div>
    </Modal>
  </div>;
}

function QuantityFields({ details, setDetails, unit }) {
  return <div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-sm font-extrabold">Quantity {unit && <small className="text-ink/40">({unit})</small>}</span><input className="field" type="number" min="0.1" step="0.5" value={details.quantity} onChange={event => setDetails(value => ({ ...value, quantity: event.target.value }))} /></label><label><span className="mb-2 block text-sm font-extrabold">Days left <small className="text-ink/40">optional</small></span><input className="field" type="number" min="0" inputMode="numeric" placeholder="e.g. 5" value={details.shelfLifeDays} onChange={event => setDetails(value => ({ ...value, shelfLifeDays: event.target.value }))} /></label></div>;
}
