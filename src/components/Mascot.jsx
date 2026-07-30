import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useMunchStore } from '../store.js';

export function Mascot({ compact = false, interactive = true }) {
  const mood = useMunchStore(state => state.mascotMood);
  const burst = useMunchStore(state => state.burst);
  const notify = useMunchStore(state => state.notify);
  const [pressed, setPressed] = useState(false);
  const Component = interactive ? 'button' : 'span';
  const mouth = mood === 'oops' ? 'rounded-full h-3 w-3' : mood === 'wink' ? 'h-1.5 w-5 rounded-b-full' : 'h-3 w-6 rounded-b-full';
  const actionProps = interactive ? { type: 'button', onClick: () => { setPressed(true); notify('Munch says: one small meal is still a win!', 'wink'); window.setTimeout(() => setPressed(false), 500); } } : {};

  return (
    <Component
      {...actionProps}
      aria-label={interactive ? 'Say hello to Munch' : undefined}
      className={`group relative shrink-0 border-0 bg-transparent p-1 ${compact ? 'h-14 w-14' : 'h-36 w-36 sm:h-44 sm:w-44'} ${pressed ? 'animate-munch-bounce' : ''}`}
    >
      <span className="absolute inset-[8%] rounded-[48%_48%_42%_42%] border-[3px] border-ink bg-white shadow-[0_9px_0_rgba(23,59,52,.14)] transition group-hover:-translate-y-1" aria-hidden="true">
        <span className="rice-grain left-[25%] top-[18%] [--rice-rotate:35deg]" />
        <span className="rice-grain right-[23%] top-[28%] [--rice-rotate:-22deg]" />
        <span className="rice-grain left-[42%] top-[10%] [--rice-rotate:75deg]" />
        <span className="absolute inset-x-[-2px] bottom-[-2px] h-[36%] rounded-b-[42%] border-x-[3px] border-b-[3px] border-ink bg-aubergine" />
        <span className="absolute left-[28%] top-[46%] h-2.5 w-2.5 rounded-full bg-ink" />
        <span className={`absolute right-[28%] top-[46%] bg-ink ${mood === 'wink' ? 'h-1 w-3 rounded-full' : 'h-2.5 w-2.5 rounded-full'}`} />
        <span className={`absolute left-1/2 top-[58%] -translate-x-1/2 border-2 border-ink bg-tomato ${mouth}`} />
        <span className="absolute left-[15%] top-[57%] h-2 w-3 rounded-full bg-tomato/30" />
        <span className="absolute right-[15%] top-[57%] h-2 w-3 rounded-full bg-tomato/30" />
      </span>
      <Sparkles key={burst} className="absolute right-0 top-0 h-7 w-7 animate-tiny-burst text-tomato" aria-hidden="true" />
    </Component>
  );
}
