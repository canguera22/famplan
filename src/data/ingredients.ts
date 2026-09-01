import type { Ingredient } from "@/domain/types";

const raw: Array<
  [string, string, Ingredient["category"], Ingredient["baseUnit"], number, string, number]
> = [
  ["chicken_breast", "Chicken breast", "meat", "g", 500, "500 g tray", 5.6],
  ["chicken_thigh", "Chicken thighs", "meat", "g", 600, "600 g tray", 4.9],
  ["minced_beef", "Minced beef", "meat", "g", 500, "500 g pack", 6.2],
  ["pork_loin", "Pork loin", "meat", "g", 500, "500 g pack", 5.1],
  ["salmon", "Salmon fillet", "fish", "g", 400, "400 g pack", 8.4],
  ["cod", "Cod loin", "fish", "g", 400, "400 g pack", 7.2],
  ["prawns", "Prawns", "fish", "g", 300, "300 g pack", 6.5],
  ["eggs", "Eggs", "dairy", "unit", 12, "box of 12", 2.9],
  ["milk", "Milk", "dairy", "l", 1, "1 L carton", 1.1],
  ["yogurt", "Natural yogurt", "dairy", "unit", 4, "pack of 4", 1.8],
  ["cheese_grated", "Grated cheese", "dairy", "g", 200, "200 g bag", 2.4],
  ["butter", "Butter", "dairy", "g", 250, "250 g block", 2.2],
  ["cream", "Cooking cream", "dairy", "ml", 200, "200 ml", 1.3],
  ["potato", "Potatoes", "produce", "g", 1000, "1 kg bag", 1.7],
  ["onion", "Onions", "produce", "g", 1000, "1 kg bag", 1.5],
  ["garlic", "Garlic", "produce", "unit", 3, "3 bulbs", 1.0],
  ["pepper_red", "Red peppers", "produce", "unit", 3, "pack of 3", 2.3],
  ["carrot", "Carrots", "produce", "g", 1000, "1 kg bag", 1.4],
  ["courgette", "Courgette", "produce", "unit", 2, "pack of 2", 1.6],
  ["broccoli", "Broccoli", "produce", "g", 500, "1 head", 1.9],
  ["tomato", "Tomatoes", "produce", "g", 1000, "1 kg", 2.1],
  ["avocado", "Avocado", "produce", "unit", 2, "pack of 2", 2.6],
  ["lemon", "Lemon", "produce", "unit", 4, "pack of 4", 1.5],
  ["spinach", "Baby spinach", "produce", "g", 200, "200 g bag", 1.8],
  ["mushroom", "Mushrooms", "produce", "g", 400, "400 g tray", 2.2],
  ["sweet_potato", "Sweet potato", "produce", "g", 1000, "1 kg", 2.4],
  ["cucumber", "Cucumber", "produce", "unit", 1, "1 unit", 0.9],
  ["peas", "Garden peas", "frozen", "g", 750, "750 g bag", 1.9],
  ["sweetcorn", "Sweetcorn", "frozen", "g", 450, "450 g bag", 1.5],
  ["rice", "White rice", "pantry", "g", 1000, "1 kg bag", 1.6],
  ["pasta", "Pasta", "pantry", "g", 500, "500 g pack", 1.2],
  ["couscous", "Couscous", "pantry", "g", 500, "500 g pack", 1.7],
  ["tortilla", "Wheat tortillas", "bakery", "unit", 8, "pack of 8", 1.8],
  ["bread", "Bread loaf", "bakery", "unit", 1, "1 loaf", 1.4],
  ["chickpeas", "Chickpeas", "pantry", "g", 400, "400 g jar", 1.1],
  ["lentils", "Lentils", "pantry", "g", 500, "500 g pack", 1.6],
  ["tomato_passata", "Tomato passata", "pantry", "ml", 700, "700 ml bottle", 1.3],
  ["olive_oil", "Olive oil", "pantry", "ml", 1000, "1 L bottle", 6.9],
  ["soy_sauce", "Soy sauce", "pantry", "ml", 250, "250 ml bottle", 1.9],
  ["paprika", "Smoked paprika", "pantry", "g", 75, "75 g jar", 1.4],
  ["cumin", "Cumin", "pantry", "g", 50, "50 g jar", 1.3],
  ["flour", "Plain flour", "pantry", "g", 1000, "1 kg bag", 0.9],
  ["breadcrumbs", "Breadcrumbs", "pantry", "g", 500, "500 g pack", 1.2],
  ["fish_fingers", "Fish fingers", "frozen", "unit", 12, "box of 12", 3.2],
  ["coffee", "Ground coffee", "pantry", "g", 250, "250 g pack", 3.4],
  ["cereal", "Breakfast cereal", "pantry", "g", 500, "500 g box", 2.7],
  ["banana", "Bananas", "produce", "g", 1000, "1 kg", 1.5],
  ["apple", "Apples", "produce", "g", 1000, "1 kg", 2.0],
  ["kids_snacks", "Kids snacks", "pantry", "pack", 1, "1 multipack", 3.1],
  ["toilet_paper", "Toilet paper", "household", "pack", 1, "12 rolls", 5.5],
  ["cleaning_spray", "Cleaning spray", "household", "unit", 1, "1 bottle", 2.4],
];

export const INGREDIENTS: Ingredient[] = raw.map(
  ([id, name, category, baseUnit, packageSize, packageLabel, estimatedPrice]) => ({
    id,
    name,
    category,
    baseUnit,
    packageSize,
    packageLabel,
    estimatedPrice,
  }),
);

export const INGREDIENT_MAP: Record<string, Ingredient> = Object.fromEntries(
  INGREDIENTS.map((i) => [i.id, i]),
);

export const CATEGORY_LABELS: Record<Ingredient["category"], string> = {
  produce: "Fruit & vegetables",
  meat: "Meat",
  fish: "Fish",
  dairy: "Dairy",
  pantry: "Pantry",
  bakery: "Bakery",
  frozen: "Frozen",
  household: "Household",
  other: "Other",
};

export const CATEGORY_ORDER: Ingredient["category"][] = [
  "produce",
  "meat",
  "fish",
  "dairy",
  "bakery",
  "pantry",
  "frozen",
  "household",
  "other",
];