import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { recipes } from '../data.js';
import { RecipeCard } from '../components/RecipeCard.jsx';
import { RecipeDialog } from '../components/RecipeDialog.jsx';

const tags = [['', 'All'], ['halal', 'Halal'], ['vegetarian', 'Vegetarian'], ['no-pork', 'No pork'], ['no-seafood', 'No seafood']];
const times = [['', 'Any time'], ['20', 'Under 20'], ['30', 'Under 30']];

export function RecipesPage() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState('');
  const [time, setTime] = useState('');
  const [selected, setSelected] = useState(null);
  const visible = useMemo(() => recipes.filter(recipe => {
    const matchesText = `${recipe.name} ${recipe.localName}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (!tag || recipe.dietaryTags.includes(tag)) && (!time || recipe.timeMinutes <= Number(time));
  }), [query, tag, time]);

  return <div className="page">
    <header className="mb-6 sm:flex sm:items-end sm:justify-between"><div><p className="eyebrow">Cookbook</p><h1 className="mt-1 font-display text-4xl font-black tracking-[-.055em] sm:text-5xl">Find your next<br /><span className="text-tomato">little favourite.</span></h1></div><p className="mt-3 max-w-sm text-sm font-semibold text-ink/55 sm:text-right">Malaysian comfort food and easy everyday meals, all in one pocket.</p></header>
    <div className="soft-card mb-6 p-4 sm:p-5">
      <label className="relative block"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/45" size={20} /><input className="field pl-12" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search nasi, noodles, eggs..." /></label>
      <div className="mt-4 flex items-start gap-3"><SlidersHorizontal className="mt-3 shrink-0 text-ink/45" size={18} /><div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-2">{tags.map(([value, text]) => <button className={`chip shrink-0 ${tag === value ? 'chip-active' : ''}`} key={value} onClick={() => setTag(value)}>{text}</button>)}</div></div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 pl-8">{times.map(([value, text]) => <button className={`chip shrink-0 ${time === value ? 'chip-active' : ''}`} key={value} onClick={() => setTime(value)}>{text}</button>)}</div>
    </div>
    <div className="mb-4 flex items-center justify-between"><h2 className="section-title">{visible.length} recipes</h2><span className="text-xs font-extrabold text-ink/45">Tap a card to cook</span></div>
    {visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visible.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onOpen={setSelected} />)}</div> : <div className="soft-card p-10 text-center"><p className="font-display text-2xl font-black">No recipe in this bento box.</p><button className="secondary-btn mt-4" onClick={() => { setQuery(''); setTag(''); setTime(''); }}>Clear filters</button></div>}
    <RecipeDialog recipe={selected} onClose={() => setSelected(null)} />
  </div>;
}
