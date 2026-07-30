import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const focusableSelector = 'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children, size = 'medium' }) {
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    openerRef.current = document.activeElement;
    const panel = panelRef.current;
    const first = panel?.querySelector(focusableSelector);
    (first ?? panel)?.focus();
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose();
      if (event.key !== 'Tab' || !panel) return;
      const focusable = [...panel.querySelectorAll(focusableSelector)].filter(node => !node.hasAttribute('disabled'));
      if (!focusable.length) { event.preventDefault(); panel.focus(); return; }
      const firstItem = focusable[0];
      const lastItem = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); lastItem.focus(); }
      if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); firstItem.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      openerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6" role="presentation">
      <button className="absolute inset-0 cursor-default bg-ink/50 backdrop-blur-sm" aria-label="Close dialog" onClick={onClose} />
      <section ref={panelRef} role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabIndex={-1} className={`page-enter relative max-h-[92vh] w-full overflow-y-auto rounded-t-[2rem] border-2 border-ink bg-butter p-5 shadow-2xl sm:rounded-[2rem] sm:p-7 ${size === 'large' ? 'max-w-3xl' : 'max-w-xl'}`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 id="dialog-title" className="font-display text-2xl font-black tracking-tight text-ink sm:text-3xl">{title}</h2>
          <button type="button" onClick={onClose} className="secondary-btn h-11 w-11 shrink-0 p-0" aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  );
}
