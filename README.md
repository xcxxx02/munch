# Munch

Munch is a mobile-first local-first meal planner web app. It connects recipes, pantry ingredients and shopping into one light kitchen companion.

The browser entry point is `index.html`, which loads the application as an ES module from `app.js`.

## Tests

Install dependencies if needed, then run the Node test suite with:

```sh
npm test
```

The domain tests are an intentionally red checkpoint for the planned behavior; `src/domain.js` is not implemented yet, so the current test run is expected to fail with a missing-module error.
