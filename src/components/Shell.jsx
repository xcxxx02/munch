import { BookOpen, CalendarDays, Download, Home, ShoppingBasket, Sprout } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Mascot } from './Mascot.jsx';
import { useMunchStore } from '../store.js';

const nav = [
  ['/', 'Today', Home], ['/plan', 'Plan', CalendarDays], ['/recipes', 'Recipes', BookOpen],
  ['/pantry', 'Pantry', Sprout], ['/grocery', 'Grocery', ShoppingBasket],
];

export function Shell({ currentPath, children }) {
  const grocery = useMunchStore(state => state.grocery);
  const toast = useMunchStore(state => state.toast);
  const saveFailed = useMunchStore(state => state.saveFailed);
  const notify = useMunchStore(state => state.notify);
  const [installPrompt, setInstallPrompt] = useState(null);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPath]);
  useEffect(() => {
    const rememberInstall = event => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('beforeinstallprompt', rememberInstall);
    return () => window.removeEventListener('beforeinstallprompt', rememberInstall);
  }, []);
  const count = grocery.filter(item => !item.checked).length;
  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') notify('Munch is moving onto your home screen');
    setInstallPrompt(null);
  };

  return <div className="min-h-screen bg-butter text-ink">
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-butter/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.5rem] max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <a href="#/" className="flex min-h-11 items-center gap-2 rounded-full pr-3 font-display text-2xl font-black tracking-[-.06em]"><Mascot compact interactive={false} /><span>munch</span><span className="ml-1 rounded-full bg-tomato px-2 py-1 text-[9px] font-black uppercase tracking-widest text-white">beta</span></a>
        {installPrompt ? <button type="button" className="flex min-h-11 items-center gap-2 rounded-full bg-white px-3 text-xs font-extrabold text-ink shadow-sm sm:px-4" onClick={install}><Download size={17} /><span className="hidden sm:inline">Install Munch</span></button> : <p className="hidden rounded-full bg-white px-4 py-2 text-xs font-extrabold text-ink/55 sm:block">Little meals, less thinking.</p>}
      </div>
    </header>
    {saveFailed && <div className="bg-tomato px-4 py-2 text-center text-sm font-bold text-white">Changes are in memory, but this device could not save them.</div>}
    <main key={currentPath} className="page-enter">{children}</main>
    <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-ink/10 bg-white/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_30px_rgba(23,59,52,.10)] backdrop-blur-xl sm:left-1/2 sm:bottom-5 sm:w-[min(42rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:rounded-[1.5rem] sm:border-2 sm:p-2">
      <div className="grid grid-cols-5 gap-1">
        {nav.map(([path, text, Icon]) => { const active = currentPath === path; return <a key={path} href={`#${path}`} aria-current={active ? 'page' : undefined} className={`relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-extrabold transition sm:flex-row sm:text-xs ${active ? 'bg-mint text-leaf' : 'text-ink/50 hover:bg-butter hover:text-ink'}`}><Icon size={20} strokeWidth={2.4} /><span>{text}</span>{path === '/grocery' && count > 0 && <b className="absolute right-[20%] top-1 grid h-5 min-w-5 place-items-center rounded-full bg-tomato px-1 text-[10px] text-white">{count}</b>}</a>; })}
      </div>
    </nav>
    <div aria-live="polite" className={`fixed left-1/2 top-20 z-[100] -translate-x-1/2 rounded-full border-2 border-ink bg-ink px-5 py-3 text-sm font-extrabold text-white shadow-pop transition ${toast ? 'translate-y-0 opacity-100' : '-translate-y-3 pointer-events-none opacity-0'}`}>{toast}</div>
  </div>;
}
