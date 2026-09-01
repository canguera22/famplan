import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button, Card, Chip, EmptyState } from "@/components/ui-kit";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/data/ingredients";
import { listTotals } from "@/lib/grocery";
import { useStore } from "@/lib/store";
import { formatEuro, formatQty } from "@/lib/units";

export const Route = createFileRoute("/shopping/review")({
  head: () => ({
    meta: [
      { title: "Final basket review — Mesa" },
      {
        name: "description",
        content: "Final review of the approved grocery basket before it is sent to a retailer cart.",
      },
      { property: "og:title", content: "Final basket review — Mesa" },
      {
        property: "og:description",
        content: "Confirm your weekly basket. Checkout always stays in your hands.",
      },
    ],
  }),
  component: ReviewPage,
});

function ReviewPage() {
  const store = useStore();
  const navigate = useNavigate();
  const list = store.list;

  if (!list?.approved) {
    return (
      <AppShell title="Final review">
        <EmptyState
          title="Nothing approved yet"
          body="Approve your shopping list first and the final basket will be summarised here."
          action={
            <Link to="/shopping">
              <Button>Go to shopping list</Button>
            </Link>
          }
        />
      </AppShell>
    );
  }

  const totals = listTotals(list);
  const active = list.items.filter((i) => !i.removed && !i.pantry);

  return (
    <AppShell title="Final basket" subtitle="Approved and ready. Nothing is ordered automatically.">
      <Card>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-adults-soft p-2.5 text-adults">
            <ShoppingBasket className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">
              {totals.products} products · {formatEuro(totals.cost)} estimated
            </p>
            <p className="text-sm text-muted-foreground">
              Next: match these ingredients to real Mercadona products. You always check out yourself.
            </p>
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {CATEGORY_ORDER.map((category) => {
          const items = active.filter((i) => i.category === category);
          if (!items.length) return null;
          return (
            <Card key={category} className="p-0 overflow-hidden">
              <div className="border-b border-border px-5 py-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{CATEGORY_LABELS[category]}</p>
                <Chip>{items.length}</Chip>
              </div>
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.purchaseLabel} · {formatQty(item.requiredQuantity, item.unit)}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div className="mt-6">
        <Button
          size="lg"
          onClick={() => {
            store.matchProducts();
            navigate({ to: "/shopping/mercadona" });
          }}
        >
          Match Mercadona products <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="mt-2 text-xs text-muted-foreground">
          You review every proposed product before anything reaches your Mercadona cart.
        </p>
      </div>
    </AppShell>
  );
}
