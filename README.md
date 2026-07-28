# Munch

Munch is a mobile-first local-first meal planner for small, happy meals. It connects curated Malaysian recipes, pantry ingredients, meal planning and grocery shopping in one browser-native app.

The browser entry point is `index.html`, which loads the screen controller from `src/app.js`. State is stored locally under `munch:v1`; there is no backend or external image dependency.

## Tests

```sh
npm test
```

The test suite uses Node's built-in test runner and covers the pure pantry, planning, grocery and persistence rules.
