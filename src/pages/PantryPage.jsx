import { useState } from 'react';
import { CalendarClock, Edit3, PackageOpen, Plus, Trash2 } from 'lucide-react';
import { ingredients } from '../data.js';
import { useMunchStore } from '../store.js';
import { formatDate, ingredientById, todayISO } from '../utils.js';
import { Modal } from '../components/Modal.jsx';

const quickIds = ['egg', 'tomato', 'cooked-rice', 'chicken-thigh', 'yellow-noodles', 'onion', 'garlic', 'cucumber'];

export function PantryPage() {
  const pantry = useMunchStore(state => state.pantry);
  const addPantry = useMunchStore(state => state.addPantry);
  const updatePantry = useMunchStore(state => state.updatePantry);
  const removePantry = useMunchStore(state => state.removePantry);
  const [quickOpen, setQuickOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ quantity: '', expiryDate: '' });
  const openEdit = item => { setEditing(item); setForm({ quantity: item.quantity ?? '', expiryDate: item.expiryDate ?? '' }); };

  return <div className="page">
    <header className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Your ingredients</p><h1 className="mt-1 font-display text-4xl font-black tracking-[-.055em] sm:text-5xl">A calmer little<br /><span className="text-leaf">kitchen shelf.</span></h1></div><button className="primary-btn shrink-0" onClick={() => setQuickOpen(true)}><Plus size={19} /><span className="hidden sm:inline">Quick add</span></button></header>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-munch bg-mint p-4"><strong className="font-display text-3xl font-black">{pantry.length}</strong><small className="block font-extrabold text-ink/50">items stocked</small></div><div className="rounded-munch bg-custard p-4"><strong className="font-display text-3xl font-black">{pantry.filter(item => item.expiryDate && item.expiryDate <= todayISO()).length}</strong><small className="block font-extrabold text-ink/50">need attention</small></div><div className="col-span-2 rounded-munch bg-aubergine p-4 text-white sm:col-span-1"><strong className="font-display text-xl font-black">Tiny shelf, big help.</strong><small className="mt-1 block font-bold text-white/60">Add what you actually use.</small></div></div>
    {pantry.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{pantry.map(item => { const ingredient = ingredientById(ingredients, item.ingredientId); const expired = item.expiryDate && item.expiryDate < todayISO(); return <article key={item.id} className={`soft-card p-4 ${expired ? 'border-tomato/50' : ''}`}><div className="flex items-start gap-3"><span className={`grid h-12 w-12 place-items-center rounded-2xl font-display text-xl font-black ${expired ? 'bg-tomato/15 text-tomato' : 'bg-mint text-leaf'}`}>{ingredient.name.slice(0, 1)}</span><span className="min-w-0 flex-1"><strong className="block truncate font-display text-lg font-black">{ingredient.name}</strong><small className="font-bold text-ink/45">{ingredient.localName}</small></span><button className="grid h-11 w-11 place-items-center rounded-xl bg-butter" onClick={() => openEdit(item)} aria-label={`Edit ${ingredient.name}`}><Edit3 size={17} /></button></div><div className="mt-4 flex items-center justify-between border-t border-ink/10 pt-3"><span className="font-extrabold">{item.quantity} <small className="text-ink/45">{item.unit}</small></span>{item.expiryDate ? <span className={`flex items-center gap-1 text-xs font-extrabold ${expired ? 'text-tomato' : 'text-ink/45'}`}><CalendarClock size={14} />{expired ? 'Past its best' : formatDate(item.expiryDate)}</span> : <span className="text-xs font-bold text-ink/35">No expiry</span>}</div></article>; })}</div> : <div className="soft-card p-10 text-center"><PackageOpen className="mx-auto text-tomato" size={42} /><p className="mt-3 font-display text-2xl font-black">Your shelf is waiting.</p><button className="primary-btn mt-4" onClick={() => setQuickOpen(true)}>Add your first item</button></div>}

    <Modal open={quickOpen} onClose={() => setQuickOpen(false)} title="What is on your shelf?">
      <p className="mb-4 font-semibold text-ink/55">One tap adds a sensible starter amount. You can edit it later.</p>
      <div className="grid grid-cols-2 gap-3">{ingredients.filter(item => quickIds.includes(item.id)).map(ingredient => <button key={ingredient.id} className="rounded-2xl border-2 border-ink/10 bg-white p-4 text-left transition hover:scale-[1.02] hover:border-ink" onClick={() => { addPantry(ingredient); setQuickOpen(false); }}><span className="grid h-10 w-10 place-items-center rounded-xl bg-mint font-display font-black">{ingredient.name.slice(0, 1)}</span><strong className="mt-3 block font-display text-lg font-black">{ingredient.name}</strong><small className="font-bold text-ink/45">{ingredient.localName}</small></button>)}</div>
    </Modal>
    <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing ? ingredientById(ingredients, editing.ingredientId).name : 'Pantry item'}>
      <div className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-extrabold">Quantity</span><input className="field" type="number" min="0" step="0.5" value={form.quantity} onChange={event => setForm(value => ({ ...value, quantity: event.target.value }))} /></label><label className="block"><span className="mb-2 block text-sm font-extrabold">Expiry date</span><input className="field" type="date" value={form.expiryDate} onChange={event => setForm(value => ({ ...value, expiryDate: event.target.value }))} /></label><button className="primary-btn w-full" onClick={() => { if (updatePantry(editing.id, form)) setEditing(null); }}>Save changes</button><button className="secondary-btn w-full text-tomato" onClick={() => { removePantry(editing.id); setEditing(null); }}><Trash2 size={18} /> Remove from pantry</button></div>
    </Modal>
  </div>;
}
