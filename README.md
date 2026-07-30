# Munch

Munch is a mobile-first meal planner that helps one person decide what to cook, use ingredients before they expire, and build a grocery list from a weekly plan.

## Stack

- React 19 + Vite
- Tailwind CSS
- Zustand
- LocalStorage persistence
- Lucide icons

The app is a responsive web application. It does not require a database or account yet.

## Run locally

```powershell
npm install
npm run dev
```

Open the local URL printed by Vite.

## Checks

```powershell
npm test
npm run build
```

## Main flows

- Today recommendation with mood filters
- Seven-day breakfast, lunch and dinner plan
- Recipe filters, recipe details and step-by-step Cooking Mode
- Pantry quick add, quantity and expiry editing
- Grocery list generated from planned recipes plus manual items

State is saved under the versioned LocalStorage key `munch:v1`.
