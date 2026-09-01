import { INGREDIENTS, INGREDIENT_MAP } from "@/data/ingredients";
import type {
  IngredientProductMapping,
  Retailer,
  RetailerProduct,
} from "@/domain/retail";

export const MERCADONA: Retailer = {
  id: "mercadona",
  name: "Mercadona",
  website: "https://tienda.mercadona.es",
  active: true,
};

export const RETAILERS: Retailer[] = [MERCADONA];

/**
 * Mock Mercadona catalog. Product data is synthetic: it is shaped like a real
 * retailer catalog so the matching engine and cart payload are realistic, but
 * no Mercadona API or page structure is assumed anywhere.
 */
const CATALOG_UPDATED = "2026-08-10T00:00:00.000Z";

/** Ingredients we deliberately ship without a trustworthy match. */
const LOW_CONFIDENCE = new Set(["couscous", "cleaning_spray"]);

interface Variant {
  suffix: string;
  brand: string;
  sizeFactor: number;
  priceFactor: number;
  confidence: number;
}

const VARIANTS: Variant[] = [
  { suffix: "", brand: "Hacendado", sizeFactor: 1, priceFactor: 1, confidence: 0.94 },
  { suffix: "selección", brand: "Mercadona Selección", sizeFactor: 0.7, priceFactor: 0.85, confidence: 0.8 },
  { suffix: "formato familiar", brand: "Hacendado", sizeFactor: 2, priceFactor: 1.85, confidence: 0.76 },
];

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

function sizeLabelValue(size: number, unit: string) {
  if (unit === "g" || unit === "ml") return Math.max(25, Math.round(size / 25) * 25);
  if (unit === "unit" || unit === "pack" || unit === "bunch") return Math.max(1, Math.round(size));
  return round(size, 2);
}

const products: RetailerProduct[] = [];
const mappings: IngredientProductMapping[] = [];

for (const ing of INGREDIENTS) {
  VARIANTS.forEach((variant, index) => {
    const packageSize = sizeLabelValue(ing.packageSize * variant.sizeFactor, ing.baseUnit);
    const price = round(ing.estimatedPrice * variant.priceFactor * (index === 1 ? 0.95 : 1));
    const retailerProductId = `${ing.id}-${index + 1}`;
    products.push({
      id: `mercadona_${retailerProductId}`,
      retailerId: MERCADONA.id,
      retailerProductId,
      name: variant.suffix ? `${ing.name} ${variant.suffix}` : ing.name,
      brand: variant.brand,
      category: ing.category,
      packageSize,
      packageUnit: ing.baseUnit,
      price,
      pricePerUnit: round(price / packageSize, 4),
      productUrl: `${MERCADONA.website}/product/${retailerProductId}`,
      imageUrl: "",
      lastUpdated: CATALOG_UPDATED,
    });
    mappings.push({
      id: `map_${retailerProductId}`,
      ingredientId: ing.id,
      retailerProductId,
      confidence: LOW_CONFIDENCE.has(ing.id)
        ? round(variant.confidence - 0.5)
        : variant.confidence - index * 0.02,
      preferred: false,
      lastUsed: null,
    });
  });
}

export const RETAILER_PRODUCTS: RetailerProduct[] = products;

export const RETAILER_PRODUCT_MAP: Record<string, RetailerProduct> = Object.fromEntries(
  products.map((p) => [p.retailerProductId, p]),
);

export const INGREDIENT_PRODUCT_MAPPINGS: IngredientProductMapping[] = mappings;

export function ingredientNameFor(ingredientId: string | null): string {
  return ingredientId ? (INGREDIENT_MAP[ingredientId]?.name ?? ingredientId) : "";
}
