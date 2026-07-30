import { ingredients as catalogIngredients } from '../data.js';
import { useMunchStore } from '../store.js';
import { ingredientById } from '../utils.js';
import { IngredientThumb } from './IngredientThumb.jsx';

export function RecipeCover({ recipe, className = '' }) {
  const customIngredients = useMunchStore(state => state.customIngredients);
  if (!recipe?.isCustom) {
    return <img className={`h-full w-full object-cover ${className}`} src={recipe.image} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = recipe.fallbackImage; }} alt={recipe.name} />;
  }

  if (recipe.imageData) return <img className={`h-full w-full object-cover ${className}`} src={recipe.imageData} alt={recipe.name} />;

  const allIngredients = [...catalogIngredients, ...customIngredients];
  const featured = recipe.ingredients.slice(0, 4).map(ref => ingredientById(allIngredients, ref.ingredientId));
  return (
    <div className={`relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(255,217,106,.65),transparent_38%),linear-gradient(145deg,#fff8e8,#cfe9d8)] ${className}`} role="img" aria-label={`${recipe.name} ingredient cover`}>
      <span className="absolute -right-5 -top-5 h-24 w-24 rounded-full border-[18px] border-white/30" />
      <span className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-tomato/15" />
      <div className="relative flex -space-x-3 rotate-[-2deg]">
        {featured.map((ingredient, index) => <IngredientThumb key={`${ingredient.id}-${index}`} ingredient={ingredient} size="large" className={index % 2 ? 'translate-y-3 rotate-6' : '-rotate-6'} />)}
      </div>
      <span className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[.12em] text-aubergine">My recipe</span>
    </div>
  );
}
