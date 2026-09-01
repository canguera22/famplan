import type { RetailerProduct } from "@/domain/retail";
import { cn } from "@/lib/utils";

/** Catalog images are not available in mock mode, so we render a tinted tile. */
export function ProductThumb({
  product,
  className,
}: {
  product?: RetailerProduct | undefined;
  className?: string | undefined;
}) {
  if (product?.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        className={cn("h-14 w-14 rounded-xl object-cover", className)}
      />
    );
  }
  const initials = (product?.name ?? "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground",
        className,
      )}
    >
      {initials}
    </div>
  );
}
