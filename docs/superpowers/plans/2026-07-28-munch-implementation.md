# Munch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the current static Munch prototype into a mobile-first, local-first meal planner web application with curated Malaysian recipes, pantry-aware recommendations, flexible meal planning and a merged grocery list.

**Architecture:** Keep the app dependency-light and browser-native. Separate curated recipe data, pure meal/pantry calculations, local persistence and DOM rendering so the localStorage adapter can later be replaced by an API adapter without changing the product flows. Use one HTML entry point with ES modules and a small set of focused JavaScript files.

**Tech Stack:** HTML, CSS, vanilla JavaScript ES modules, browser localStorage, Node's built-in `node:test` for pure domain tests. No native packaging, backend or external API in this iteration.

---

## Current project map

- `index.html` is the browser shell and bottom navigation host.
- `styles.css` contains the existing Munch visual language and responsive rules.
- `app.js` currently combines recipe data, state, storage, rendering and event handlers in one file.
- `README.md` documents the current local-only prototype.
- New domain code will live under `src/`; pure behavior tests will live under `tests/`.

## Task 1: Establish the module and test foundation

**Files:**
- Modify: `C:/Users/Nitro/Documents/开发/index.html`
- Modify: `C:/Users/Nitro/Documents/开发/README.md`
- Create: `C:/Users/Nitro/Documents/开发/package.json`
- Create: `C:/Users/Nitro/Documents/开发/tests/domain.test.js`

- [ ] **Step 1: Add a minimal test command and ES module mode**

Create `package.json` with:

```json
{
  "name": "munch",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test tests/*.test.js"
  }
}
```

- [ ] **Step 2: Change the entry script to a module**

In `index.html`, replace the current script tag with:

```html
<script type="module" src="src/app.js"></script>
```

Keep the existing app shell, modal container, toast and navigation hooks so the rendering layer can progressively replace the prototype behavior.

- [ ] **Step 3: Add a failing domain test file**

Create `tests/domain.test.js` with tests for the public domain functions that will be implemented in Task 2:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getAvailability,
  getExpiryRecommendations,
  mergeGroceryItems,
} from '../src/domain.js';

test('calculates available and missing recipe ingredients', () => {
  const recipe = { ingredients: [
    { ingredientId: 'egg', quantity: 2, unit: 'pieces' },
    { ingredientId: 'tomato', quantity: 2, unit: 'pieces' },
  ] };
  const pantry = [
    { ingredientId: 'egg', quantity: 2 },
    { ingredientId: 'tomato', quantity: 1 },
  ];

  assert.deepEqual(getAvailability(recipe, pantry), {
    availableCount: 1,
    totalCount: 2,
    missing: [{ ingredientId: 'tomato', quantity: 1, unit: 'pieces' }],
  });
});

test('returns only pantry items expiring within the recommendation window', () => {
  const today = new Date('2026-07-28T00:00:00.000Z');
  const pantry = [
    { id: 'a', name: 'Eggs', expiryDate: '2026-07-29' },
    { id: 'b', name: 'Rice', expiryDate: '2026-08-20' },
  ];

  assert.deepEqual(getExpiryRecommendations(pantry, today, 3).map(item => item.id), ['a']);
});

test('merges duplicate grocery ingredients and preserves checked state', () => {
  assert.deepEqual(mergeGroceryItems([
    { ingredientId: 'egg', name: 'Eggs', quantity: 2, unit: 'pieces', category: 'Dairy', checked: false },
    { ingredientId: 'egg', name: 'Eggs', quantity: 4, unit: 'pieces', category: 'Dairy', checked: true },
  ]), [{ ingredientId: 'egg', name: 'Eggs', quantity: 6, unit: 'pieces', category: 'Dairy', checked: true }]);
});
```

- [ ] **Step 4: Run the tests and verify the expected failure**

Run: `npm test`

Expected: FAIL because `src/domain.js` does not exist yet.

- [ ] **Step 5: Commit the foundation**

```powershell
git add index.html package.json README.md tests/domain.test.js
git commit -m "test: establish Munch domain test foundation"
```

## Task 2: Implement pure pantry, recommendation and grocery domain logic

**Files:**
- Create: `C:/Users/Nitro/Documents/开发/src/domain.js`
- Modify: `C:/Users/Nitro/Documents/开发/tests/domain.test.js`

- [ ] **Step 1: Implement the pure domain functions**

Create `src/domain.js` with these exported functions:

```js
export function getAvailability(recipe, pantry) { /* return availableCount, totalCount and missing */ }
export function getExpiryRecommendations(pantry, today = new Date(), windowDays = 3) { /* sorted soonest first */ }
export function mergeGroceryItems(items) { /* merge by ingredientId and preserve checked */ }
export function createMealPlanEntry({ date, mealType, recipeId }) { /* validate slot and return normalized entry */ }
```

Use quantity subtraction rather than name matching. A pantry item is available only when its quantity is greater than or equal to the recipe requirement. Expiry recommendations must ignore items with no expiry date and sort by earliest expiry. `mergeGroceryItems` must merge only matching `ingredientId` and `unit` pairs.

- [ ] **Step 2: Add validation tests for plan slots and partial quantities**

Append tests that assert:

```js
assert.throws(
  () => createMealPlanEntry({ date: '2026-07-28', mealType: 'snack', recipeId: 'r1' }),
  /mealType/
);
```

Also test that a pantry quantity of 1 satisfies a recipe requirement of 2 only partially and produces a missing quantity of 1.

- [ ] **Step 3: Run the domain tests**

Run: `npm test`

Expected: PASS for availability, expiry sorting, grocery merging and meal-slot validation.

- [ ] **Step 4: Commit the domain layer**

```powershell
git add src/domain.js tests/domain.test.js
git commit -m "feat: add pantry and grocery domain rules"
```

## Task 3: Add curated Malaysian recipe and ingredient data

**Files:**
- Create: `C:/Users/Nitro/Documents/开发/src/data.js`
- Create: `C:/Users/Nitro/Documents/开发/public/recipes/README.md`
- Modify: `C:/Users/Nitro/Documents/开发/tests/domain.test.js`

- [ ] **Step 1: Define normalized ingredient and recipe records**

Create `src/data.js` exporting `ingredients`, `recipes`, `dietaryTags`, `mealTypes` and `defaultPantry`.

The first curated set must contain at least these recipes with real ingredient quantities and ordered steps:

```text
Nasi Lemak
Nasi Goreng Kampung
Tomato Egg Rice
Chicken Teriyaki Rice
Mee Goreng
Chicken Porridge
Vegetable Fried Rice
Roti Telur
```

Each recipe must include `id`, `name`, `localName`, `timeMinutes`, `difficulty`, `dietaryTags`, `image`, `ingredients` and `steps`. Each ingredient reference must include `ingredientId`, `quantity` and `unit`.

- [ ] **Step 2: Add the dietary and meal-slot constants**

Use exact values:

```js
export const dietaryTags = ['halal', 'vegetarian', 'no-pork', 'no-seafood'];
export const mealTypes = ['breakfast', 'lunch', 'dinner'];
```

- [ ] **Step 3: Add an asset contract without blocking the app**

Create `public/recipes/README.md` documenting the required naming format:

```text
public/recipes/<recipe-id>.jpg
```

Use a stable local fallback image or food-art class when an image is not present. The UI must never show a broken image icon.

- [ ] **Step 4: Test the curated data contract**

Add tests asserting every recipe has all required fields, every dietary tag is from `dietaryTags`, every meal type is from `mealTypes`, and every referenced ingredient exists in `ingredients`.

- [ ] **Step 5: Run tests and commit the data layer**

Run: `npm test`

Expected: PASS with all curated recipe records valid.

```powershell
git add src/data.js public/recipes/README.md tests/domain.test.js
git commit -m "feat: add curated Malaysian recipe data"
```

## Task 4: Add local-first persistence and state orchestration

**Files:**
- Create: `C:/Users/Nitro/Documents/开发/src/storage.js`
- Create: `C:/Users/Nitro/Documents/开发/src/state.js`
- Create: `C:/Users/Nitro/Documents/开发/tests/storage.test.js`

- [ ] **Step 1: Define the versioned local storage shape**

Persist one JSON object under `munch:v1`:

```js
{
  version: 1,
  pantry: [],
  mealPlan: [],
  grocery: [],
  preferences: { dietaryTags: [] }
}
```

- [ ] **Step 2: Implement the storage adapter**

Export:

```js
export function loadState(storage, fallbackState) { /* parse, validate version, fallback safely */ }
export function saveState(storage, state) { /* JSON stringify and return success boolean */ }
export function clearState(storage) { /* remove only munch:v1 */ }
```

The adapter must tolerate malformed JSON and unavailable storage by returning the fallback state rather than crashing the app.

- [ ] **Step 3: Implement state actions**

Export pure action functions from `src/state.js`:

```js
export function addPantryItem(state, item) { /* create an id and append */ }
export function toggleGroceryItem(state, groceryId) { /* immutable checked toggle */ }
export function addRecipeToPlan(state, entry) { /* replace same date + mealType */ }
export function addMissingIngredients(state, missing) { /* merge into grocery */ }
```

- [ ] **Step 4: Test persistence and actions**

Use a small in-memory storage object in `tests/storage.test.js` and test round-trip save/load, malformed data fallback, add pantry, replace same meal slot and grocery toggle.

- [ ] **Step 5: Run tests and commit persistence**

Run: `npm test`

Expected: PASS for storage fallback and state transitions.

```powershell
git add src/storage.js src/state.js tests/storage.test.js
git commit -m "feat: add local-first state persistence"
```

## Task 5: Replace the prototype renderer with focused screen modules

**Files:**
- Create: `C:/Users/Nitro/Documents/开发/src/screens/today.js`
- Create: `C:/Users/Nitro/Documents/开发/src/screens/plan.js`
- Create: `C:/Users/Nitro/Documents/开发/src/screens/recipes.js`
- Create: `C:/Users/Nitro/Documents/开发/src/screens/pantry.js`
- Create: `C:/Users/Nitro/Documents/开发/src/screens/grocery.js`
- Create: `C:/Users/Nitro/Documents/开发/src/ui.js`
- Create: `C:/Users/Nitro/Documents/开发/src/app.js`
- Delete: `C:/Users/Nitro/Documents/开发/app.js`

- [ ] **Step 1: Define the shared view contract**

Each screen module exports a function accepting the current state and callbacks, returning an HTML string. For example:

```js
export function renderToday({ recipes, state, onAddToPlan, onOpenRecipe }) { /* return HTML */ }
```

`src/ui.js` owns shared markup helpers for recipe cards, ingredient rows, empty states, modal open/close and toast messages.

- [ ] **Step 2: Implement Today**

Render one recommendation using the earliest expiring pantry item, show mood chips, show `Use these first`, and require `onAddToPlan` before creating a meal-plan entry.

- [ ] **Step 3: Implement Plan**

Render seven days with Breakfast, Lunch and Dinner slots. Empty slots show `+ Add meal`; filled slots show the recipe and a replace/remove action. Use `createMealPlanEntry` and `addRecipeToPlan` rather than mutating markup directly.

- [ ] **Step 4: Implement Recipes**

Render curated recipe cards with search and filters for the four dietary tags, time and `Use what I have`. Recipe detail opens in the existing modal and includes Cooking Mode with one step visible at a time.

- [ ] **Step 5: Implement Pantry**

Render pantry items with expiring items first. Quick Add opens common ingredient choices and immediately appends the selected ingredient with a sensible default quantity. A separate edit action can change quantity and expiry date.

- [ ] **Step 6: Implement Grocery**

Render merged grocery groups, source labels where useful, checked state and `Clear checked items`. Recipe-derived missing items must be added only after a plan entry is confirmed.

- [ ] **Step 7: Wire the application controller**

`src/app.js` must own:

```js
let currentView = 'today';
let state = loadState(localStorage, createDefaultState());

function dispatch(action) {
  state = action(state);
  saveState(localStorage, state);
  render();
}
```

It binds bottom navigation, modal actions, keyboard-safe buttons and a `beforeunload` save fallback. No screen module may call localStorage directly.

- [ ] **Step 8: Run tests and manually verify each screen**

Run: `npm test`, then open `index.html` through a local static server. Verify the five bottom-nav entries, refresh persistence, Quick Add, recipe confirmation, meal-slot replacement and grocery merging.

- [ ] **Step 9: Commit the screen layer**

```powershell
git add index.html src/ app.js
git commit -m "feat: add Munch mobile-first screens"
```

## Task 6: Refine the visual system and responsive interaction

**Files:**
- Modify: `C:/Users/Nitro/Documents/开发/styles.css`
- Modify: `C:/Users/Nitro/Documents/开发/index.html`
- Create: `C:/Users/Nitro/Documents/开发/public/recipes/tomato-egg-rice.jpg`
- Create: `C:/Users/Nitro/Documents/开发/public/recipes/nasi-lemak.jpg`
- Create: `C:/Users/Nitro/Documents/开发/public/recipes/mee-goreng.jpg`
- Create: `C:/Users/Nitro/Documents/开发/public/recipes/chicken-porridge.jpg`

- [ ] **Step 1: Apply the approved mobile visual system**

Keep the approved tokens:

```css
--cream: #FFF9EF;
--green: #25483C;
--mint: #DCEFE2;
--yellow: #FFD978;
--coral: #F47B61;
```

Use large readable type, 44px minimum primary touch targets, visible focus states and safe-area padding for the bottom navigation.

- [ ] **Step 2: Add a consistent local recipe image set**

Use the same art direction for every image: warm natural light, cream tabletop, simple ceramic dish, centered food, top-down or gentle 45-degree composition, no text or people. If an image is unavailable, use the fallback food-art treatment instead of a broken image.

- [ ] **Step 3: Verify responsive behavior**

Check widths 320px, 375px, 414px and 768px. Confirm no horizontal scroll, no clipped modal content, no inaccessible bottom navigation and no hover-only interaction.

- [ ] **Step 4: Commit visual refinement**

```powershell
git add styles.css index.html public/recipes
git commit -m "feat: refine Munch mobile visual system"
```

## Task 7: Final verification and handoff

**Files:**
- Modify: `C:/Users/Nitro/Documents/开发/README.md`
- Create: `C:/Users/Nitro/Documents/开发/docs/manual-test-checklist.md`

- [ ] **Step 1: Add the manual acceptance checklist**

Document these checks: Quick Add, expiry recommendation, confirmation into all three meal types, recipe filtering, Cooking Mode, missing-ingredient merge, checked grocery persistence, empty states, malformed localStorage fallback and phone-width layout.

- [ ] **Step 2: Run automated checks**

Run: `npm test`

Expected: all tests pass with zero failures.

- [ ] **Step 3: Run the browser smoke test**

Open the app in a local browser and complete this path:

```text
Quick Add Eggs → open Today → accept a recommendation → add it to Monday Breakfast → inspect Grocery → refresh → confirm state remains.
```

- [ ] **Step 4: Check the working tree and commit documentation**

Run: `git diff --check` and `git status --short`. Resolve whitespace errors and ensure only intended Munch files are present.

```powershell
git add README.md docs/manual-test-checklist.md
git commit -m "docs: add Munch verification checklist"
```

## Plan self-review

- Recipe, Pantry, Plan, Grocery, Today, local-first persistence, Malaysian-focused curated data, dietary tags, Cooking Mode, expiry recommendation, Quick Add, empty states and responsive behavior all have explicit tasks.
- No task requires native packaging, accounts, external Recipe APIs, voice, barcode scanning or nutrition tracking.
- Domain names are consistent: `PantryItem`, `MealPlanEntry`, `GroceryItem`, `getAvailability`, `getExpiryRecommendations`, `mergeGroceryItems`.
- The existing one-file prototype is replaced only after tests and data contracts exist; no unrelated Portfolio files are touched.
