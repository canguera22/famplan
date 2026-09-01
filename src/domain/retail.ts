// Retailer / product layer.
// Deliberately retailer-agnostic: Mercadona is data (a Retailer row + a product
// catalog), never a special case inside the meal, ingredient or grocery models.

import type { IngredientCategory, ShoppingListItemUsage, Unit } from "./types";

export interface Retailer {
  id: string;
  name: string;
  website: string;
  active: boolean;
}

export interface RetailerProduct {
  id: string;
  retailerId: string;
  /** The retailer's own product identifier */
  retailerProductId: string;
  name: string;
  brand: string;
  category: IngredientCategory;
  packageSize: number;
  packageUnit: Unit;
  price: number;
  pricePerUnit: number;
  productUrl: string;
  imageUrl: string;
  lastUpdated: string;
}

export interface IngredientProductMapping {
  id: string;
  ingredientId: string;
  retailerProductId: string;
  /** 0-1. Below MIN_CONFIDENCE the app asks the user instead of guessing. */
  confidence: number;
  preferred: boolean;
  lastUsed: string | null;
}

export interface PreferredProduct {
  id: string;
  householdId: string;
  ingredientId: string;
  retailerProductId: string;
}

/** One proposed purchasable line in a retailer basket. */
export interface RetailerCartLine {
  id: string;
  shoppingItemId: string;
  ingredientId: string | null;
  ingredientName: string;
  category: IngredientCategory;
  requiredQuantity: number;
  unit: Unit;
  /** null => "Product match needed" */
  retailerProductId: string | null;
  confidence: number;
  quantity: number;
  source: "meals" | "staple" | "manual";
  usages: ShoppingListItemUsage[];
}

export interface RetailerCart {
  id: string;
  retailerId: string;
  mealPlanId: string;
  createdAt: string;
  reviewed: boolean;
  lines: RetailerCartLine[];
}

// ---- Cart integration transport ----

export interface CartPayloadProduct {
  retailerProductId: string;
  name: string;
  quantity: number;
  productUrl: string;
}

export interface CartPayload {
  retailer: string;
  cartId: string;
  products: CartPayloadProduct[];
}

export type CartLineState = "pending" | "adding" | "added" | "failed" | "skipped";

export interface CartProductStatus {
  retailerProductId: string;
  name: string;
  quantity: number;
  state: CartLineState;
  message?: string | undefined;
}

export interface CartStatus {
  cartId: string;
  phase: "idle" | "connecting" | "adding" | "complete" | "session_failed";
  products: CartProductStatus[];
  estimatedTotal: number;
  message?: string | undefined;
}
