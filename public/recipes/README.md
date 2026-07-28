# Recipe image assets

Recipe records always expose a canonical image path in the exact format
`/recipes/<recipe-id>.jpg`, backed by `public/recipes/<recipe-id>.jpg` when the
final photo exists. Task 6 owns generating and adding those final per-recipe JPG
assets; Task 3 deliberately ships only the small local `placeholder.svg` asset.

Until a recipe JPG is present, the UI must use that record's `fallbackImage`
value (`/recipes/placeholder.svg`) instead of rendering a broken image. Keep the
fallback local and stable so recipe data and UI work before Task 6 lands.
