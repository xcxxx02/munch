const tones = ['bg-mint', 'bg-custard/70', 'bg-tomato/15', 'bg-aubergine/15', 'bg-butter'];

function toneFor(value = '') {
  return tones[[...value].reduce((sum, char) => sum + char.codePointAt(0), 0) % tones.length];
}

export function IngredientThumb({ ingredient, size = 'medium', className = '' }) {
  const dimensions = size === 'small' ? 'h-9 w-9 text-xl rounded-xl' : size === 'large' ? 'h-16 w-16 text-3xl rounded-[1.25rem]' : 'h-12 w-12 text-2xl rounded-2xl';
  return (
    <span
      aria-hidden="true"
      className={`ingredient-sticker grid shrink-0 place-items-center border-2 border-white/80 shadow-[0_3px_0_rgba(23,59,52,.12)] ${dimensions} ${toneFor(ingredient?.id)} ${className}`}
    >
      {ingredient?.icon || '\u{1F9FA}'}
    </span>
  );
}
