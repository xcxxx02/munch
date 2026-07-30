import { useMemo, useState } from 'react';
import { Check, Plus, ShoppingBasket, Sparkles, Trash2 } from 'lucide-react';
import { useMunchStore } from '../store.js';
import { Modal } from '../components/Modal.jsx';

export function GroceryPage() {
  const grocery = useMunchStore(state => state.grocery);
  const toggleGrocery = useMunchStore(state => state.toggleGrocery);
  const clearChecked = useMunchStore(state => state.clearChecked);
  const addManualGrocery = useMunchStore(state => state.addManualGrocery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'pieces', category: 'Kitchen' });
  const grouped = useMemo(() => grocery.reduce((groups, item) => { const category = item.category || 'Kitchen'; (groups[category] ||= []).push(item); return groups; }, {}), [grocery]);
  const checked = grocery.filter(item => item.checked).length;
  const progress = grocery.length ? Math.round(checked / grocery.length * 100) : 0;

  return <div className="page">
    <header className="mb-7 flex items-end justify-between gap-4"><div><p className="eyebrow">Shopping list</p><h1 className="mt-1 font-display text-4xl font-black tracking-[-.055em] sm:text-5xl">Grab it, tap it,<br /><span className="text-tomato">done.</span></h1></div><button className="primary-btn shrink-0" onClick={() => setOpen(true)}><Plus size={19} /><span className="hidden sm:inline">Add item</span></button></header>
    <section className="mb-6 overflow-hidden rounded-munch border-2 border-ink bg-ink p-5 text-white shadow-pop">
      <div className="flex items-center justify-between"><span><strong className="font-display text-2xl font-black">{grocery.length - checked} left to find</strong><small className="mt-1 block font-bold text-white/50">{checked} already in the basket</small></span><span className="grid h-16 w-16 place-items-center rounded-full border-2 border-custard font-display text-xl font-black text-custard">{progress}%</span></div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-custard transition-all duration-500" style={{ width: `${progress}%` }} /></div>
    </section>
    {grocery.length ? <div className="space-y-5">{Object.entries(grouped).map(([category, items]) => <section key={category}><div className="mb-2 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-tomato" /><h2 className="font-display text-lg font-black">{category}</h2></div><div className="soft-card divide-y divide-ink/10 overflow-hidden">{items.map(item => <button key={item.id} type="button" onClick={() => toggleGrocery(item.id)} className="group flex min-h-[4.5rem] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-mint/30"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition ${item.checked ? 'scale-105 border-leaf bg-mint text-leaf' : 'border-ink/25 bg-white text-transparent group-hover:border-leaf'}`}><Check size={18} strokeWidth={3} /></span><span className={`min-w-0 flex-1 ${item.checked ? 'text-ink/35 line-through' : ''}`}><strong className="block truncate font-display text-lg font-black">{item.name || item.ingredientId}</strong><small className="font-bold text-ink/40">{item.source === 'manual' ? 'Added by you' : item.source === 'mixed' ? 'Plan + you' : 'From your meal plan'}</small></span><b className={`text-sm ${item.checked ? 'text-ink/30' : 'text-ink/60'}`}>{item.quantity} {item.unit}</b></button>)}</div></section>)}{checked > 0 && <button className="secondary-btn w-full text-tomato" onClick={clearChecked}><Trash2 size={18} /> Clear checked</button>}</div> : <div className="soft-card p-10 text-center"><span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint"><ShoppingBasket size={36} /></span><p className="mt-4 font-display text-2xl font-black">Your basket is light.</p><p className="mt-2 font-semibold text-ink/50">Plan a recipe or add a little extra.</p><button className="primary-btn mt-5" onClick={() => setOpen(true)}><Plus size={18} /> Add an item</button></div>}
    {progress === 100 && grocery.length > 0 && <div className="mt-5 flex items-center gap-3 rounded-munch bg-custard p-5 font-extrabold"><Sparkles className="text-tomato" /> Basket complete. Tiny victory unlocked!</div>}
    <Modal open={open} onClose={() => setOpen(false)} title="Add a little extra">
      <div className="space-y-4"><label className="block"><span className="mb-2 block text-sm font-extrabold">Item</span><input autoFocus className="field" placeholder="e.g. Limes" value={form.name} onChange={event => setForm(value => ({ ...value, name: event.target.value }))} /></label><div className="grid grid-cols-2 gap-3"><label><span className="mb-2 block text-sm font-extrabold">Quantity</span><input className="field" type="number" min="0.1" step="0.1" value={form.quantity} onChange={event => setForm(value => ({ ...value, quantity: event.target.value }))} /></label><label><span className="mb-2 block text-sm font-extrabold">Unit</span><input className="field" value={form.unit} onChange={event => setForm(value => ({ ...value, unit: event.target.value }))} /></label></div><label className="block"><span className="mb-2 block text-sm font-extrabold">Aisle</span><select className="field" value={form.category} onChange={event => setForm(value => ({ ...value, category: event.target.value }))}><option>Kitchen</option><option>Produce</option><option>Pantry</option><option>Meat</option><option>Dairy & Eggs</option></select></label><button className="primary-btn w-full" onClick={() => { if (addManualGrocery(form)) { setOpen(false); setForm({ name: '', quantity: 1, unit: 'pieces', category: 'Kitchen' }); } }}>Add to grocery</button></div>
    </Modal>
  </div>;
}
