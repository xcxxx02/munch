import { getAvailability } from '../domain.js';
import { label, recipeCard } from '../ui.js';

export function renderRecipes({ recipes, state, filters = {} }) {
  const timeLimit = filters.time === 'under-20' ? 20 : filters.time === 'under-30' ? 30 : Infinity;
  const visible = recipes.filter(recipe => (!filters.search || (recipe.name + ' ' + recipe.localName).toLowerCase().includes(filters.search.toLowerCase()))
    && (!filters.tag || recipe.dietaryTags.includes(filters.tag))
    && (!filters.stocked || getAvailability(recipe, state.pantry).availableCount > 0)
    && recipe.timeMinutes < timeLimit);
  const tags = ['halal', 'vegetarian', 'no-pork', 'no-seafood'];
  const tagFilters = '<button class="filter-chip ' + (!filters.tag ? 'active' : '') + '" data-filter-tag="">All</button>'
    + tags.map(tag => '<button class="filter-chip ' + (filters.tag === tag ? 'active' : '') + '" data-filter-tag="' + tag + '">' + label(tag) + '</button>').join('')
    + '<button class="filter-chip ' + (filters.stocked ? 'active' : '') + '" data-filter-stocked="true">Use what I have</button>';
  const timeFilters = '<div class="filter-row time-filter" aria-label="Recipe time"><span class="filter-label">Time</span>'
    + [['', 'Any time'], ['under-20', 'Under 20 min'], ['under-30', 'Under 30 min']].map(([value, text]) => '<button class="filter-chip ' + (filters.time === value ? 'active' : '') + '" data-filter-time="' + value + '">' + text + '</button>').join('')
    + '</div>';
  const empty = '<div class="empty-state compact"><span class="empty-emoji">&#127834;</span><h2>Nothing matches yet</h2><p>Try a broader search or let one pantry ingredient lead the way.</p><button class="primary-button" data-filter-tag="">Browse all</button></div>';
  return '<section class="screen"><div class="screen-heading"><div><p class="eyebrow">Curated for everyday kitchens</p><h1>Recipes</h1></div><span class="recipe-count">' + visible.length + '<small>ideas</small></span></div>'
    + '<label class="search-box"><span>&#8981;</span><input data-filter="search" value="' + (filters.search ?? '') + '" placeholder="Search nasi, mee, telur..." aria-label="Search recipes" /></label>'
    + '<div class="filter-row">' + tagFilters + '</div>' + timeFilters
    + (visible.length ? '<div class="recipe-grid">' + visible.map(recipe => recipeCard(recipe, getAvailability(recipe, state.pantry))).join('') + '</div>' : empty)
    + '</section>';
}