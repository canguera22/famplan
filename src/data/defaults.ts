import type {
  GenerationOptions,
  Household,
  HouseholdPreference,
  MealHistoryEntry,
  Staple,
} from "@/domain/types";

export const DEFAULT_HOUSEHOLD: Household = {
  id: "household_1",
  name: "Our household",
  groups: [
    { id: "adults", name: "Adults", shortName: "Adults", memberCount: 2, complexityCeiling: 3, order: 0 },
    { id: "kids", name: "Kids", shortName: "Kids", memberCount: 2, complexityCeiling: 2, order: 1 },
  ],
};

export const DEFAULT_OPTIONS: GenerationOptions = {
  dinnerCount: 5,
  adultEffort: "normal",
  kidsStyle: "normal",
  maxMinutes: 40,
  notes: "",
};

export const DEFAULT_PREFERENCES: HouseholdPreference = {
  budget: 120,
  reusePriority: 3,
  wastePriority: 3,
  fishMeals: 2,
  vegetarianMeals: 1,
  groups: [
    {
      groupId: "adults",
      likes: ["fish", "mexican"],
      dislikes: [],
      introducing: [],
      restrictions: [],
      cuisines: ["spanish", "italian", "asian"],
      proteins: ["chicken", "fish"],
      vegetables: [],
      maxMinutes: 45,
      maxComplexity: 3,
      variety: 3,
    },
    {
      groupId: "kids",
      likes: ["pasta", "chicken"],
      dislikes: ["mushroom"],
      introducing: ["lentils", "broccoli"],
      restrictions: [],
      cuisines: [],
      proteins: ["chicken", "fish"],
      vegetables: ["peas", "carrot", "sweetcorn"],
      maxMinutes: 30,
      maxComplexity: 2,
      variety: 2,
    },
  ],
};

export const DEFAULT_STAPLES: Staple[] = [
  { id: "milk", name: "Milk", category: "dairy", quantity: 6, unit: "l", active: true },
  { id: "yogurt", name: "Natural yogurt", category: "dairy", quantity: 8, unit: "unit", active: true },
  { id: "banana", name: "Bananas", category: "produce", quantity: 1500, unit: "g", active: true },
  { id: "apple", name: "Apples", category: "produce", quantity: 1500, unit: "g", active: true },
  { id: "bread", name: "Bread loaf", category: "bakery", quantity: 3, unit: "unit", active: true },
  { id: "eggs", name: "Eggs", category: "dairy", quantity: 12, unit: "unit", active: true },
  { id: "cereal", name: "Breakfast cereal", category: "pantry", quantity: 1000, unit: "g", active: true },
  { id: "kids_snacks", name: "Kids snacks", category: "pantry", quantity: 2, unit: "pack", active: true },
  { id: "coffee", name: "Ground coffee", category: "pantry", quantity: 500, unit: "g", active: true },
  { id: "toilet_paper", name: "Toilet paper", category: "household", quantity: 1, unit: "pack", active: true },
  {
    id: "cleaning_spray",
    name: "Cleaning supplies",
    category: "household",
    quantity: 1,
    unit: "unit",
    active: false,
    notes: "Only when running low",
  },
];

export const DEFAULT_HISTORY: MealHistoryEntry[] = [
  {
    recipeId: "a_fajitas",
    lastServed: "2026-08-02",
    timesServed: 4,
    ratings: [
      { groupId: "adults", rating: "loved" },
      { groupId: "kids", rating: "fine" },
    ],
  },
  {
    recipeId: "k_pasta_tomato",
    lastServed: "2026-08-09",
    timesServed: 7,
    ratings: [{ groupId: "kids", rating: "loved" }],
  },
  {
    recipeId: "a_mushroom_pasta",
    lastServed: "2026-07-20",
    timesServed: 2,
    ratings: [{ groupId: "adults", rating: "fine" }],
  },
];