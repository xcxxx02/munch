export const dietaryTags = ['halal', 'vegetarian', 'no-pork', 'no-seafood'];

export const mealTypes = ['breakfast', 'lunch', 'dinner'];

export const ingredients = [
  { id: 'basmati-rice', name: 'Basmati rice', localName: 'Beras basmati', icon: '🍚', category: 'Grains', defaultUnit: 'grams' },
  { id: 'cooked-rice', name: 'Cooked rice', localName: 'Nasi putih', icon: '🍚', category: 'Grains', defaultUnit: 'grams' },
  { id: 'egg', name: 'Eggs', localName: 'Telur', icon: '🥚', category: 'Dairy & Eggs', defaultUnit: 'pieces' },
  { id: 'chicken-thigh', name: 'Chicken thigh', localName: 'Peha ayam', icon: '🍗', category: 'Meat', defaultUnit: 'grams' },
  { id: 'chicken-breast', name: 'Chicken breast', localName: 'Dada ayam', icon: '🍗', category: 'Meat', defaultUnit: 'grams' },
  { id: 'ikan-bilis', name: 'Dried anchovies', localName: 'Ikan bilis', icon: '🐟', category: 'Seafood', defaultUnit: 'grams' },
  { id: 'yellow-noodles', name: 'Yellow noodles', localName: 'Mi kuning', icon: '🍜', category: 'Noodles', defaultUnit: 'grams' },
  { id: 'porridge-rice', name: 'Rice', localName: 'Beras', icon: '🍚', category: 'Grains', defaultUnit: 'grams' },
  { id: 'tomato', name: 'Tomatoes', localName: 'Tomato', icon: '🍅', category: 'Produce', defaultUnit: 'pieces' },
  { id: 'cucumber', name: 'Cucumber', localName: 'Timun', icon: '🥒', category: 'Produce', defaultUnit: 'pieces' },
  { id: 'carrot', name: 'Carrot', localName: 'Lobak merah', icon: '🥕', category: 'Produce', defaultUnit: 'pieces' },
  { id: 'green-beans', name: 'Green beans', localName: 'Kacang buncis', icon: '🫛', category: 'Produce', defaultUnit: 'grams' },
  { id: 'bok-choy', name: 'Bok choy', localName: 'Sawi pak choy', icon: '🥬', category: 'Produce', defaultUnit: 'grams' },
  { id: 'spring-onion', name: 'Spring onion', localName: 'Daun bawang', icon: '🌿', category: 'Produce', defaultUnit: 'stalks' },
  { id: 'onion', name: 'Yellow onion', localName: 'Bawang besar', icon: '🧅', category: 'Produce', defaultUnit: 'pieces' },
  { id: 'shallot', name: 'Shallots', localName: 'Bawang merah', icon: '🧅', category: 'Produce', defaultUnit: 'pieces' },
  { id: 'garlic', name: 'Garlic', localName: 'Bawang putih', icon: '🧄', category: 'Produce', defaultUnit: 'cloves' },
  { id: 'ginger', name: 'Ginger', localName: 'Halia', icon: '🫚', category: 'Produce', defaultUnit: 'grams' },
  { id: 'chilli', name: 'Red chilli', localName: 'Cili merah', icon: '🌶️', category: 'Produce', defaultUnit: 'pieces' },
  { id: 'coconut-milk', name: 'Coconut milk', localName: 'Santan', icon: '🥥', category: 'Pantry', defaultUnit: 'millilitres' },
  { id: 'soy-sauce', name: 'Light soy sauce', localName: 'Kicap cair', icon: '🥢', category: 'Pantry', defaultUnit: 'millilitres' },
  { id: 'dark-soy-sauce', name: 'Dark soy sauce', localName: 'Kicap manis', icon: '🥢', category: 'Pantry', defaultUnit: 'millilitres' },
  { id: 'teriyaki-sauce', name: 'Teriyaki sauce', localName: 'Sos teriyaki', icon: '🍶', category: 'Pantry', defaultUnit: 'millilitres' },
  { id: 'sesame-seed', name: 'Sesame seeds', localName: 'Bijan', icon: '🌱', category: 'Pantry', defaultUnit: 'grams' },
  { id: 'cooking-oil', name: 'Cooking oil', localName: 'Minyak masak', icon: '🫗', category: 'Pantry', defaultUnit: 'millilitres' },
  { id: 'salt', name: 'Salt', localName: 'Garam', icon: '🧂', category: 'Pantry', defaultUnit: 'grams' },
  { id: 'sugar', name: 'Sugar', localName: 'Gula', icon: '🧂', category: 'Pantry', defaultUnit: 'grams' },
  { id: 'pepper', name: 'White pepper', localName: 'Lada putih', icon: '⚪', category: 'Pantry', defaultUnit: 'grams' },
  { id: 'curry-powder', name: 'Curry powder', localName: 'Serbuk kari', icon: '🟡', category: 'Spices', defaultUnit: 'grams' },
  { id: 'flour', name: 'Plain flour', localName: 'Tepung gandum', icon: '🌾', category: 'Baking', defaultUnit: 'grams' },
  { id: 'water', name: 'Water', localName: 'Air', icon: '💧', category: 'Pantry', defaultUnit: 'millilitres' },
];

const recipe = details => ({ image: `/recipes/${details.id}.jpg`, ...details });

export const recipes = [
  recipe({ id: 'nasi-lemak', name: 'Nasi Lemak', localName: 'Nasi Lemak', timeMinutes: 55, difficulty: 'medium', mealType: 'breakfast', dietaryTags: ['halal', 'no-pork'], ingredients: [
    { ingredientId: 'basmati-rice', quantity: 300, unit: 'grams' }, { ingredientId: 'coconut-milk', quantity: 250, unit: 'millilitres' }, { ingredientId: 'water', quantity: 250, unit: 'millilitres' }, { ingredientId: 'ikan-bilis', quantity: 60, unit: 'grams' }, { ingredientId: 'egg', quantity: 2, unit: 'pieces' }, { ingredientId: 'cucumber', quantity: 1, unit: 'pieces' }, { ingredientId: 'chilli', quantity: 3, unit: 'pieces' }, { ingredientId: 'shallot', quantity: 4, unit: 'pieces' }, { ingredientId: 'cooking-oil', quantity: 45, unit: 'millilitres' }, { ingredientId: 'salt', quantity: 5, unit: 'grams' },
  ], steps: ['Rinse the rice until the water runs mostly clear.', 'Cook rice with coconut milk, water and half the salt until tender, then rest covered for 10 minutes.', 'Boil the eggs for 8 minutes, cool them, and halve.', 'Blend shallots and chillies with a splash of water.', 'Fry the blended sambal in oil for 8 minutes; season with remaining salt.', 'Fry the ikan bilis until crisp and serve with rice, egg and sliced cucumber.'] }),
  recipe({ id: 'nasi-goreng-kampung', name: 'Nasi Goreng Kampung', localName: 'Nasi Goreng Kampung', timeMinutes: 25, difficulty: 'easy', mealType: 'dinner', dietaryTags: ['halal', 'no-pork'], ingredients: [
    { ingredientId: 'cooked-rice', quantity: 500, unit: 'grams' }, { ingredientId: 'egg', quantity: 2, unit: 'pieces' }, { ingredientId: 'ikan-bilis', quantity: 35, unit: 'grams' }, { ingredientId: 'chilli', quantity: 3, unit: 'pieces' }, { ingredientId: 'garlic', quantity: 3, unit: 'cloves' }, { ingredientId: 'shallot', quantity: 3, unit: 'pieces' }, { ingredientId: 'green-beans', quantity: 100, unit: 'grams' }, { ingredientId: 'soy-sauce', quantity: 15, unit: 'millilitres' }, { ingredientId: 'cooking-oil', quantity: 30, unit: 'millilitres' },
  ], steps: ['Pound chillies, garlic, shallots and ikan bilis into a coarse paste.', 'Heat oil in a wok and fry the paste until fragrant and slightly darkened.', 'Add green beans and stir-fry for 2 minutes.', 'Push everything aside, scramble in the eggs, then add the rice.', 'Toss over high heat with soy sauce until every grain is hot and coated.'] }),
  recipe({ id: 'tomato-egg-rice', name: 'Tomato Egg Rice', localName: 'Nasi Telur Tomato', timeMinutes: 20, difficulty: 'easy', mealType: 'lunch', dietaryTags: ['halal', 'vegetarian', 'no-pork', 'no-seafood'], ingredients: [
    { ingredientId: 'cooked-rice', quantity: 400, unit: 'grams' }, { ingredientId: 'egg', quantity: 3, unit: 'pieces' }, { ingredientId: 'tomato', quantity: 3, unit: 'pieces' }, { ingredientId: 'spring-onion', quantity: 2, unit: 'stalks' }, { ingredientId: 'garlic', quantity: 2, unit: 'cloves' }, { ingredientId: 'cooking-oil', quantity: 30, unit: 'millilitres' }, { ingredientId: 'salt', quantity: 4, unit: 'grams' }, { ingredientId: 'sugar', quantity: 3, unit: 'grams' },
  ], steps: ['Beat eggs with half the salt and set aside.', 'Sauté garlic in oil, add chopped tomatoes and cook until soft.', 'Season tomatoes with remaining salt and sugar.', 'Pour in eggs and gently fold until softly set.', 'Spoon over hot rice and finish with sliced spring onion.'] }),
  recipe({ id: 'chicken-teriyaki-rice', name: 'Chicken Teriyaki Rice', localName: 'Nasi Ayam Teriyaki', timeMinutes: 30, difficulty: 'easy', mealType: 'dinner', dietaryTags: ['halal', 'no-pork', 'no-seafood'], ingredients: [
    { ingredientId: 'cooked-rice', quantity: 400, unit: 'grams' }, { ingredientId: 'chicken-thigh', quantity: 400, unit: 'grams' }, { ingredientId: 'teriyaki-sauce', quantity: 90, unit: 'millilitres' }, { ingredientId: 'garlic', quantity: 2, unit: 'cloves' }, { ingredientId: 'ginger', quantity: 15, unit: 'grams' }, { ingredientId: 'cooking-oil', quantity: 15, unit: 'millilitres' }, { ingredientId: 'bok-choy', quantity: 200, unit: 'grams' }, { ingredientId: 'sesame-seed', quantity: 10, unit: 'grams' },
  ], steps: ['Pat the chicken dry and cut it into bite-size pieces.', 'Sear chicken in oil until golden and cooked through.', 'Add grated garlic and ginger; stir for 30 seconds.', 'Pour in teriyaki sauce and simmer until glossy and thick.', 'Steam the bok choy, then serve chicken and sauce over rice with sesame seeds.'] }),
  recipe({ id: 'mee-goreng', name: 'Mee Goreng', localName: 'Mi Goreng Mamak', timeMinutes: 30, difficulty: 'medium', mealType: 'dinner', dietaryTags: ['halal', 'no-pork', 'no-seafood'], ingredients: [
    { ingredientId: 'yellow-noodles', quantity: 400, unit: 'grams' }, { ingredientId: 'egg', quantity: 2, unit: 'pieces' }, { ingredientId: 'chicken-breast', quantity: 200, unit: 'grams' }, { ingredientId: 'tomato', quantity: 2, unit: 'pieces' }, { ingredientId: 'bok-choy', quantity: 150, unit: 'grams' }, { ingredientId: 'onion', quantity: 1, unit: 'pieces' }, { ingredientId: 'garlic', quantity: 3, unit: 'cloves' }, { ingredientId: 'curry-powder', quantity: 8, unit: 'grams' }, { ingredientId: 'soy-sauce', quantity: 30, unit: 'millilitres' }, { ingredientId: 'dark-soy-sauce', quantity: 15, unit: 'millilitres' }, { ingredientId: 'cooking-oil', quantity: 30, unit: 'millilitres' },
  ], steps: ['Rinse the noodles briefly and drain well.', 'Stir-fry chicken in half the oil until just cooked, then set aside.', 'Fry onion and garlic, then add curry powder and cook until fragrant.', 'Add tomato and bok choy; cook until the greens soften.', 'Add noodles, sauces and chicken, tossing over high heat.', 'Push noodles aside, scramble the eggs, then fold everything together.'] }),
  recipe({ id: 'chicken-porridge', name: 'Chicken Porridge', localName: 'Bubur Ayam', timeMinutes: 45, difficulty: 'easy', mealType: 'breakfast', dietaryTags: ['halal', 'no-pork', 'no-seafood'], ingredients: [
    { ingredientId: 'porridge-rice', quantity: 150, unit: 'grams' }, { ingredientId: 'chicken-breast', quantity: 250, unit: 'grams' }, { ingredientId: 'water', quantity: 1200, unit: 'millilitres' }, { ingredientId: 'ginger', quantity: 20, unit: 'grams' }, { ingredientId: 'garlic', quantity: 2, unit: 'cloves' }, { ingredientId: 'spring-onion', quantity: 2, unit: 'stalks' }, { ingredientId: 'soy-sauce', quantity: 20, unit: 'millilitres' }, { ingredientId: 'salt', quantity: 5, unit: 'grams' }, { ingredientId: 'pepper', quantity: 2, unit: 'grams' },
  ], steps: ['Rinse rice and put it in a pot with water, ginger and garlic.', 'Bring to a boil, add chicken, then simmer uncovered for 35 minutes.', 'Remove chicken, shred it, and keep warm.', 'Stir porridge until the grains break down and season with salt and pepper.', 'Ladle into bowls and top with shredded chicken, spring onion and soy sauce.'] }),
  recipe({ id: 'vegetable-fried-rice', name: 'Vegetable Fried Rice', localName: 'Nasi Goreng Sayur', timeMinutes: 20, difficulty: 'easy', mealType: 'lunch', dietaryTags: ['vegetarian', 'no-pork', 'no-seafood'], ingredients: [
    { ingredientId: 'cooked-rice', quantity: 500, unit: 'grams' }, { ingredientId: 'egg', quantity: 2, unit: 'pieces' }, { ingredientId: 'carrot', quantity: 1, unit: 'pieces' }, { ingredientId: 'green-beans', quantity: 120, unit: 'grams' }, { ingredientId: 'bok-choy', quantity: 100, unit: 'grams' }, { ingredientId: 'spring-onion', quantity: 2, unit: 'stalks' }, { ingredientId: 'garlic', quantity: 2, unit: 'cloves' }, { ingredientId: 'soy-sauce', quantity: 25, unit: 'millilitres' }, { ingredientId: 'cooking-oil', quantity: 30, unit: 'millilitres' },
  ], steps: ['Dice the carrot and trim the green beans and bok choy.', 'Heat oil in a wok, fry garlic, then stir-fry vegetables until crisp-tender.', 'Push vegetables aside and scramble the eggs.', 'Add rice and soy sauce, tossing until hot and separated.', 'Garnish with spring onion and serve immediately.'] }),
  recipe({ id: 'roti-telur', name: 'Roti Telur', localName: 'Roti Telur', timeMinutes: 25, difficulty: 'medium', mealType: 'breakfast', dietaryTags: ['halal', 'vegetarian', 'no-pork', 'no-seafood'], ingredients: [
    { ingredientId: 'flour', quantity: 300, unit: 'grams' }, { ingredientId: 'water', quantity: 170, unit: 'millilitres' }, { ingredientId: 'egg', quantity: 3, unit: 'pieces' }, { ingredientId: 'onion', quantity: 1, unit: 'pieces' }, { ingredientId: 'cooking-oil', quantity: 60, unit: 'millilitres' }, { ingredientId: 'salt', quantity: 5, unit: 'grams' },
  ], steps: ['Mix flour, water and salt into a soft dough; knead for 5 minutes.', 'Divide into two balls, coat with oil and rest for 15 minutes.', 'Stretch each dough ball thinly, fold into a square and flatten.', 'Beat eggs with diced onion and a pinch of salt.', 'Cook each roti in an oiled pan, pour egg mixture over it, fold and fry until golden on both sides.'] }),
];

export const defaultPantry = [
  { id: 'pantry-rice', ingredientId: 'cooked-rice', name: 'Cooked rice', icon: '🍚', quantity: 500, unit: 'grams' },
  { id: 'pantry-eggs', ingredientId: 'egg', name: 'Eggs', icon: '🥚', quantity: 6, unit: 'pieces', expiryDate: '2026-08-02' },
  { id: 'pantry-garlic', ingredientId: 'garlic', name: 'Garlic', icon: '🧄', quantity: 1, unit: 'bulb' },
  { id: 'pantry-soy', ingredientId: 'soy-sauce', name: 'Light soy sauce', icon: '🥢', quantity: 250, unit: 'millilitres' },
  { id: 'pantry-oil', ingredientId: 'cooking-oil', name: 'Cooking oil', icon: '🫗', quantity: 500, unit: 'millilitres' },
  { id: 'pantry-onion', ingredientId: 'onion', name: 'Yellow onion', icon: '🧅', quantity: 3, unit: 'pieces' },
];
