# Munch Design Specification

Date: 2026-07-28
Status: Design approved in conversation; awaiting written-spec review

## 1. Product direction

Munch is a mobile-first web application for people who live alone and cook for themselves. Its primary job is to reduce the daily friction of deciding what to eat while helping users use ingredients before they spoil.

The product should feel simple, cute, light and memorable. It is a browser application, not a native mobile app, so it does not require App Store or Play Store distribution.

## 2. Primary user and usage moments

The primary user is a young person living alone who cooks occasionally or regularly.

The main usage moment is deciding what to eat at mealtime. Secondary usage moments are planning several days ahead and checking the list before shopping.

Munch supports all three moments but gives the Today view the strongest emphasis.

## 3. Product principles

- Make the next useful action obvious.
- Prefer quick capture over complete data entry.
- Recommend before requiring.
- Use friendly language and light character without turning the product into a toy.
- Help users use what they already have before asking them to buy more.
- Keep the first release local-first while preserving a clean path to database-backed sync.

## 4. Navigation and screens

The mobile bottom navigation has five entries:

1. Today
2. Plan
3. Recipes
4. Pantry
5. Grocery

### Today

Today is the default landing screen. It includes:

- a single daily recipe suggestion;
- mood shortcuts such as Quick & easy, Cozy food and Use what I have;
- a Use these first section for ingredients nearing expiry;
- a clear Add to plan action;
- a lightweight empty state when no ingredients or recommendations exist.

### Plan

Plan presents seven days. Each day has three optional meal slots:

- Breakfast
- Lunch
- Dinner

Users can add or replace a recipe in any slot. Munch may recommend a recipe based on an expiring ingredient, but it never adds the recommendation without user confirmation.

### Recipes

The first release uses a curated set of recipes focused on Malaysian everyday ingredients and dishes. The UI is English-first, while local food names remain in their familiar form.

Recipe cards show the name, image, time, difficulty, diet tags and available-ingredient count. Filters include Halal, Vegetarian, No pork and No seafood.

The first release does not include user-created recipes. External recipe APIs are a future extension and are not part of the initial implementation.

Each recipe has a detail view and a simple Cooking Mode that displays one step at a time. Voice controls and timers are intentionally out of scope for the first release.

### Pantry

Pantry uses Quick Add. The default flow is:

1. Tap Add.
2. Tap a common ingredient such as Eggs, Tomato or Rice.
3. The ingredient is added immediately.

Quantity and expiry details are optional follow-up edits rather than required fields. Common ingredients should be visible as friendly, tappable choices. Expiring items are placed near the top and clearly marked.

### Grocery

Grocery contains two sources of items:

- ingredients missing from confirmed recipes;
- items manually added by the user.

Items are grouped by category. Duplicate ingredients are merged into one row with a combined quantity. Tapping an item marks it as purchased, and the checked state persists locally.

## 5. Recipe and ingredient imagery

Recipe cards use a consistent food-photo direction: warm natural light, soft cream background, simple ceramic dishes and a centered top-down or gentle 45-degree composition.

Pantry ingredients use a consistent set of small illustrated food characters. These are accents for identity and status, not replacements for recipe photography.

The first release can use a small local asset set. The image system must allow more recipes to be added without mixing unrelated visual styles.

## 6. Data model

The first release stores data in localStorage, but the domain objects should be shaped so they can later map cleanly to an API and PostgreSQL database.

### Recipe

- id
- name
- localName
- time
- difficulty
- dietaryTags
- ingredients
- steps
- image

### PantryItem

- id
- name
- icon
- quantity
- unit
- expiryDate

### MealPlanEntry

- id
- date
- mealType: breakfast | lunch | dinner
- recipeId

### GroceryItem

- id
- name
- quantity
- unit
- category
- source: recipe | manual | mixed (mixed is output-only when both known sources conflict)
- checked

The application state should keep recipes as curated reference data and user-owned pantry, plan and grocery records as mutable data. Grocery entries derived from recipes must be recomputable so that changing a plan can update missing ingredients without creating duplicates.

## 7. Data flow

```text
Quick Add Pantry Item
        ↓
Pantry state
        ↓
Recipe availability calculation
        ↓
Today recommendation or user selection
        ↓
User confirms a Plan entry
        ↓
Missing ingredients are merged into Grocery state
```

The initial persistence adapter is localStorage. A later persistence adapter can replace it with API calls without changing the view-level product flows.

## 8. Empty states and errors

- Empty Pantry: explain that the shelf is waiting for ingredients and offer Add ingredient.
- No matching Recipe: explain that one missing ingredient may unlock more meals and offer Browse all recipes.
- Empty Grocery: show a positive All stocked up state.
- Expired ingredient: mark it as Past its best; do not silently delete it. Offer Remove, Keep or Add replacement.
- Missing recipe ingredient: show the exact missing item and offer Add missing item.
- Persistence failure: show a small visible notice that changes could not be saved and keep the current in-memory state available for retry.

## 9. Scope boundaries

### In scope for first implementation

- mobile-first responsive web UI;
- curated Malaysian-focused recipe data;
- Today, Plan, Recipes, Pantry and Grocery screens;
- dietary tags;
- Quick Add pantry flow;
- expiry-based recommendation with confirmation;
- simple Cooking Mode;
- localStorage persistence;
- basic empty, error and loading states.

### Explicitly out of scope

- native iOS or Android packaging;
- App Store or Play Store submission;
- accounts and cross-device sync;
- external Recipe API integration;
- user-created recipes;
- voice control;
- advanced timers;
- barcode or camera recognition;
- nutrition tracking.

## 10. Verification criteria

The first implementation is acceptable when:

- a user can add a common ingredient in one short interaction;
- a user can view a recipe and see which ingredients are available or missing;
- a user can confirm a recipe into any Breakfast, Lunch or Dinner slot;
- missing ingredients enter Grocery and duplicate items merge;
- checked Grocery items remain checked after refresh;
- expiry-based recommendations are visible and require confirmation;
- the app remains usable at phone width without hover interactions;
- empty states always provide a clear next action;
- local data survives a normal page refresh.
