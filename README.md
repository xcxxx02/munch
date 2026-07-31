<div align="center">
  <img src="public/icons/munch-icon.svg" alt="Munch bento buddy" width="112" />
  <h1>Munch</h1>
  <p><strong>Little meals, less thinking.</strong></p>
  <p>A mobile-first meal planner that turns pantry ingredients into one practical next meal.</p>
  <p><a href="https://xcxxx02.github.io/munch/"><strong>Open the live app</strong></a></p>
</div>

## Why Munch exists

Meal planning often starts with too many questions: What can I cook? What is about to expire? What do I still need to buy? Munch keeps those decisions in one small, friendly flow. It recommends recipes from the pantry, plans breakfast, lunch and dinner, and builds the grocery list from whatever is missing.

## What it can do

- Recommend a quick, cozy or pantry-first meal
- Highlight ingredients that should be used soon
- Plan one day at a time across a seven-day rhythm
- Fill empty meal slots with pantry-aware suggestions
- Generate grocery items from missing recipe ingredients
- Add, edit and remove pantry ingredients using days-left expiry
- Browse 14 photographed recipes with dietary and time filters
- Create personal recipes with ingredients, steps and an uploaded photo
- Cook in a focused step-by-step mode
- Install as a PWA and reopen previously visited screens offline

## Product details

Munch is designed for a phone first. The visual system uses bento-box shapes, food stickers and a small rice-bowl mascot to make routine kitchen admin feel lighter without hiding the useful information.

The signature feature is **Pantry rescue**. Recipes that use soon-to-expire ingredients are ranked ahead of otherwise convenient choices, so a recommendation explains not only what to cook, but why it is useful today.

## Tech stack

- React 19 and Vite
- Tailwind CSS
- Zustand
- Versioned LocalStorage persistence
- Progressive Web App manifest and service worker
- GitHub Actions and GitHub Pages
- Node test runner

## How the app is organised

- `src/domain.js` contains recipe matching, expiry and grocery rules.
- `src/state.js` keeps state updates immutable and testable.
- `src/store.js` connects the domain to Zustand and browser persistence.
- `src/pages` contains the five mobile workflows: Today, Plan, Recipes, Pantry and Grocery.
- Custom recipe photos are resized in the browser before being stored.

## Built with the help of AI

I used AI as a development partner while building Munch. It helped me explore the product direction, turn the mobile design into React components, generate a consistent set of recipe images, and suggest edge cases for the pantry, planning and grocery logic. I stayed responsible for the product decisions: keeping the app focused on everyday usefulness, simplifying the seven-day plan for a phone, deciding how expiry should be communicated, and checking every interaction in the deployed app. The final project is covered by automated tests and a production build workflow rather than relying on generated code alone.

## Run locally

```powershell
npm install
npm run dev
```

Then open the local address printed by Vite.

## Verify a change

```powershell
npm test
npm run build
```

Every push to `main` runs the same checks and publishes the production build to GitHub Pages.

## Data and privacy

Munch currently works without an account or database. Pantry items, plans, groceries and custom recipes stay in the current browser under the versioned key `munch:v1`. This keeps the demo simple and private, but the data does not yet sync between devices.

## Next step

The next larger release will add optional Supabase sign-in, cloud sync and photo storage while preserving Guest Mode for people who want to use Munch without an account.
