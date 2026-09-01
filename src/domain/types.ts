// Core domain model for household meal planning.
// Kept deliberately generic: meals belong to a HouseholdMemberGroup rather than
// hard-coded "adult"/"kids" fields, so future households can add groups.

export type GroupId = string;

export interface HouseholdMemberGroup {
  id: GroupId;
  name: string;
  shortName: string;
  memberCount: number;
  /** Lower = simpler cooking expected for this group */
  complexityCeiling: 1 | 2 | 3;
  order: number;
}

export interface Household {
  id: string;
  name: string;
  groups: HouseholdMemberGroup[];
}

export type IngredientCategory =
  | "produce"
  | "meat"
  | "fish"
  | "dairy"
  | "pantry"
  | "bakery"
  | "frozen"
  | "household"
  | "other";

export type Unit = "g" | "kg" | "ml" | "l" | "unit" | "bunch" | "pack" | "tbsp";

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  baseUnit: Unit;
  /** Realistic supermarket package size expressed in baseUnit */
  packageSize: number;
  packageLabel: string;
  /** Placeholder price per package, EUR */
  estimatedPrice: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  unit: Unit;
}

export type EffortLevel = "easy" | "normal" | "adventurous";
export type KidsStyle = "very_simple" | "normal" | "try_new";

export interface Recipe {
  id: string;
  name: string;
  description: string;
  /** Which member group this recipe is designed for */
  groupId: GroupId;
  minutes: number;
  effort: EffortLevel;
  complexity: 1 | 2 | 3;
  tags: string[];
  protein: string;
  ingredients: RecipeIngredient[];
}

/** A concrete meal placed on a day for a group */
export interface Meal {
  id: string;
  recipeId: string;
  groupId: GroupId;
}

export interface MealPlanDay {
  id: string;
  date: string; // ISO date
  meals: Meal[];
  sharedIngredientIds: string[];
}

export interface MealPlan {
  id: string;
  weekStart: string;
  createdAt: string;
  approved: boolean;
  days: MealPlanDay[];
}

export interface GenerationOptions {
  dinnerCount: number;
  adultEffort: EffortLevel;
  kidsStyle: KidsStyle;
  maxMinutes: number;
  notes: string;
}

export interface ShoppingListItemUsage {
  date: string;
  groupId: GroupId;
  recipeName: string;
}

export interface ShoppingListItem {
  id: string;
  ingredientId: string | null;
  name: string;
  category: IngredientCategory;
  requiredQuantity: number;
  unit: Unit;
  purchaseQuantity: number;
  purchaseLabel: string;
  estimatedPrice: number;
  source: "meals" | "staple" | "manual";
  usages: ShoppingListItemUsage[];
  removed: boolean;
  pantry: boolean;
}

export interface ShoppingList {
  id: string;
  mealPlanId: string;
  createdAt: string;
  approved: boolean;
  items: ShoppingListItem[];
}

export interface Staple {
  id: string;
  name: string;
  category: IngredientCategory;
  quantity: number;
  unit: Unit;
  active: boolean;
  notes?: string;
}

export type Rating = "loved" | "fine" | "never";

export interface MealRating {
  groupId: GroupId;
  rating: Rating;
}

export interface MealHistoryEntry {
  recipeId: string;
  lastServed: string | null;
  timesServed: number;
  ratings: MealRating[];
}

export interface GroupPreference {
  groupId: GroupId;
  likes: string[];
  dislikes: string[];
  introducing: string[];
  restrictions: string[];
  cuisines: string[];
  proteins: string[];
  vegetables: string[];
  maxMinutes: number;
  maxComplexity: 1 | 2 | 3;
  variety: number;
}

export interface HouseholdPreference {
  budget: number;
  reusePriority: number;
  wastePriority: number;
  fishMeals: number;
  vegetarianMeals: number;
  groups: GroupPreference[];
}

// ---- Retailer layer (architecture placeholder, not implemented in MVP) ----
export interface Retailer {
  id: string;
  name: string;
}
export interface RetailerProduct {
  id: string;
  retailerId: string;
  name: string;
  size: string;
  price: number;
}
export interface IngredientProductMapping {
  ingredientId: string;
  retailerProductId: string;
  confidence: number;
}
export interface PreferredProduct {
  householdId: string;
  ingredientId: string;
  retailerProductId: string;
}