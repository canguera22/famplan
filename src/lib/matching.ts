import { INGREDIENT_MAP } from "@/data/ingredients";
import {
  INGREDIENT_PRODUCT_MAPPINGS,
  MERCADONA,
  RETAILER_PRODUCTS,
  RETAILER_PRODUCT_MAP,
} from "@/data/retailers";
import type {
  IngredientProductMapping,
  PreferredProduct,
  RetailerCart,
  RetailerCartLine,
  RetailerProduct,
} from "@/domain/retail";
import type { ShoppingList } from "@/domain/types";

/** Below this we never silently pick a product — the user is asked instead. */
export const MIN_CONFIDENCE = 0.6;

export interface MatchContext {
  householdId: string;
  preferred: PreferredProduct[];
  mappings?: IngredientProductMapping[];
}

export function productById(retailerProductId: string | null): RetailerProduct | undefined {
  return retailerProductId ? RETAILER_PRODUCT_MAP[retailerProductId] : undefined;
}

export function candidatesFor(
  ingredientId: string | null,
  mappings: IngredientProductMapping[] = INGREDIENT_PRODUCT_MAPPINGS,
): Array<{ product: RetailerProduct; confidence: number }> {
  if (!ingredientId) return [];
  return mappings
    .filter((m) => m.ingredientId === ingredientId)
    .map((m) => ({ product: RETAILER_PRODUCT_MAP[m.retailerProductId]!, confidence: m.confidence }))
    .filter((c) => Boolean(c.product))
    .sort((a, b) => b.confidence - a.confidence);
}

/** Packages needed to meet (or slightly exceed) the required quantity. */
export function packagesFor(required: number, product: RetailerProduct): number {
  if (!product.packageSize) return 1;
  return Math.max(1, Math.ceil(round(required, 3) / product.packageSize));
}

export function wasteFor(required: number, product: RetailerProduct, packages: number): number {
  return Math.max(0, packages * product.packageSize - required);
}

function round(n: number, d = 2) {
  return Math.round(n * 10 ** d) / 10 ** d;
}

/**
 * Picks the best product for an ingredient requirement, considering household
 * preferred products first, then confidence, waste (over-purchasing) and price.
 */
export function chooseProduct(
  ingredientId: string | null,
  required: number,
  ctx: MatchContext,
): { product: RetailerProduct; confidence: number } | null {
  const candidates = candidatesFor(ingredientId, ctx.mappings);
  if (!candidates.length) return null;

  const pref = ctx.preferred.find((p) => p.ingredientId === ingredientId);
  if (pref) {
    const match = candidates.find((c) => c.product.retailerProductId === pref.retailerProductId);
    if (match) return { ...match, confidence: Math.max(match.confidence, 0.99) };
  }

  const scored = candidates.map((c) => {
    const packages = packagesFor(required, c.product);
    const waste = wasteFor(required, c.product, packages);
    const wasteRatio = required > 0 ? waste / required : 0;
    const cost = packages * c.product.price;
    return { ...c, score: c.confidence * 2 - wasteRatio * 1.1 - cost * 0.02 };
  });
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0]!;
  return best.confidence >= MIN_CONFIDENCE ? { product: best.product, confidence: best.confidence } : null;
}

/** Turns an approved shopping list into a proposed retailer basket. */
export function buildRetailerCart(list: ShoppingList, ctx: MatchContext): RetailerCart {
  const lines: RetailerCartLine[] = list.items
    .filter((i) => !i.removed && !i.pantry)
    .map((item) => {
      const match = chooseProduct(item.ingredientId, item.requiredQuantity, ctx);
      return {
        id: `line_${item.id}`,
        shoppingItemId: item.id,
        ingredientId: item.ingredientId,
        ingredientName: item.name,
        category: item.category,
        requiredQuantity: item.requiredQuantity,
        unit: item.unit,
        retailerProductId: match?.product.retailerProductId ?? null,
        confidence: match?.confidence ?? 0,
        quantity: match ? packagesFor(item.requiredQuantity, match.product) : 1,
        source: item.source,
        usages: item.usages,
      };
    });

  return {
    id: `cart_${Date.now()}`,
    retailerId: MERCADONA.id,
    mealPlanId: list.mealPlanId,
    createdAt: new Date().toISOString(),
    reviewed: false,
    lines,
  };
}

export function lineTotal(line: RetailerCartLine): number {
  const product = productById(line.retailerProductId);
  return product ? round(product.price * line.quantity) : 0;
}

export function cartTotals(cart: RetailerCart) {
  const sum = (src: RetailerCartLine["source"][]) =>
    round(cart.lines.filter((l) => src.includes(l.source)).reduce((n, l) => n + lineTotal(l), 0));
  return {
    products: cart.lines.reduce((n, l) => n + (l.retailerProductId ? l.quantity : 0), 0),
    lines: cart.lines.length,
    total: sum(["meals", "staple", "manual"]),
    mealsTotal: sum(["meals", "manual"]),
    staplesTotal: sum(["staple"]),
    unmatched: cart.lines.filter((l) => !l.retailerProductId).length,
  };
}

export function searchProducts(query: string, limit = 12): RetailerProduct[] {
  const q = query.trim().toLowerCase();
  if (!q) return RETAILER_PRODUCTS.slice(0, limit);
  return RETAILER_PRODUCTS.filter(
    (p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q),
  ).slice(0, limit);
}

export function ingredientPackageHint(ingredientId: string | null): string {
  const ing = ingredientId ? INGREDIENT_MAP[ingredientId] : undefined;
  return ing?.packageLabel ?? "";
}
