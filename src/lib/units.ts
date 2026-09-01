import type { Unit } from "@/domain/types";
import { INGREDIENT_MAP } from "@/data/ingredients";

/** Convert a quantity into an ingredient's base unit */
export function toBase(ingredientId: string, quantity: number, unit: Unit): number {
  const base = INGREDIENT_MAP[ingredientId]?.baseUnit ?? unit;
  if (unit === base) return quantity;
  if (unit === "kg" && base === "g") return quantity * 1000;
  if (unit === "g" && base === "kg") return quantity / 1000;
  if (unit === "l" && base === "ml") return quantity * 1000;
  if (unit === "ml" && base === "l") return quantity / 1000;
  return quantity;
}

export function formatQty(quantity: number, unit: Unit): string {
  const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
  if (unit === "g" && quantity >= 1000) return `${round(quantity / 1000, 2)} kg`;
  if (unit === "ml" && quantity >= 1000) return `${round(quantity / 1000, 2)} L`;
  if (unit === "unit") return `${round(quantity, 1)}${quantity === 1 ? " unit" : " units"}`;
  if (unit === "pack") return `${round(quantity, 1)} ${quantity === 1 ? "pack" : "packs"}`;
  if (unit === "bunch") return `${round(quantity, 1)} bunch`;
  return `${round(quantity, 1)} ${unit}`;
}

export function formatEuro(value: number): string {
  return `€${value.toFixed(2)}`;
}