import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Undo2, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  TextInput,
  Toggle,
} from "@/components/ui-kit";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/data/ingredients";
import type { IngredientCategory, ShoppingListItem } from "@/domain/types";
import { listTotals } from "@/lib/grocery";
import { shortDay } from "@/lib/planner";
import { useStore } from "@/lib/store";
import { formatEuro, formatQty } from "@/lib/units";

export const Route = createFileRoute("/shopping/")({
  head: () => ({
    meta: [
      { title: "Shopping list — Mesa" },
      {
        name: "description",
        content:
          "One consolidated grocery basket: duplicate ingredients merged, quantities summed and rounded to real package sizes.",
      },
      { property: "og:title", content: "Shopping list — Mesa" },
      {
        property: "og:description",
        content: "Consolidated weekly grocery basket built from your approved dinners and staples.",
      },
    ],
  }),
  component: ShoppingPage,
});

function ShoppingPage() {
  const store = useStore();
  const navigate = useNavigate();
  const list = store.list;

  if (!list) {
    return (
      <AppShell title="Shopping" subtitle="Your consolidated basket appears once meals are approved.">
        <EmptyState
          title="No shopping list yet"
          body="Approve a weekly meal plan and every ingredient will be consolidated here, together with your active staples."
          action={
            <Link to="/meals">
              <Button>Go to meals</Button>
            </Link>
          }
        />
        <div className="mt-4 text-center">
          <Link to="/shopping/mercadona">
            <Button variant="secondary">Mercadona basket & extension setup</Button>
          </Link>
        </div>
      </AppShell>
    );
  }


  const totals = listTotals(list);
  const mealItems = list.items.filter((i) => i.source !== "staple");
  const stapleItems = list.items.filter((i) => i.source === "staple");

  return (
    <AppShell title="Shopping list" subtitle="Everything for the approved week, in one basket.">
      <div className="mb-4">
        <Link to="/shopping/mercadona">
          <Button variant="secondary" size="sm">Mercadona basket & extension setup</Button>
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Grocery products</p>
          <p className="text-2xl font-semibold mt-1">{totals.products}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Distinct items</p>
          <p className="text-2xl font-semibold mt-1">{totals.lines}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Estimated cost</p>
          <p className="text-2xl font-semibold mt-1">{formatEuro(totals.cost)}</p>
          <p className="text-[0.7rem] text-muted-foreground mt-0.5">Placeholder pricing</p>
        </Card>
      </div>

      <section className="mt-6 space-y-4">
        <h2 className="text-lg font-semibold">From your meals</h2>
        {CATEGORY_ORDER.map((category) => {
          const items = mealItems.filter((i) => i.category === category);
          if (!items.length) return null;
          return <CategoryBlock key={category} category={category} items={items} />;
        })}
      </section>

      {stapleItems.length ? (
        <section className="mt-8 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Household staples</h2>
            <p className="text-sm text-muted-foreground">
              Added automatically from your active staples.
            </p>
          </div>
          {CATEGORY_ORDER.map((category) => {
            const items = stapleItems.filter((i) => i.category === category);
            if (!items.length) return null;
            return <CategoryBlock key={category} category={category} items={items} />;
          })}
        </section>
      ) : null}

      <AddManualItem />

      <div className="mt-6">
        <Button
          size="lg"
          onClick={() => {
            store.approveList();
            navigate({ to: "/shopping/review" });
          }}
        >
          <CheckCircle2 className="h-4 w-4" /> Approve shopping list
        </Button>
      </div>
    </AppShell>
  );
}

function CategoryBlock({
  category,
  items,
}: {
  category: IngredientCategory;
  items: ShoppingListItem[];
}) {
  return (
    <Card className="p-0 overflow-hidden">
      <div className="border-b border-border px-5 py-3">
        <p className="text-sm font-semibold">{CATEGORY_LABELS[category]}</p>
      </div>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>
    </Card>
  );
}

function ItemRow({ item }: { item: ShoppingListItem }) {
  const { updateItem } = useStore();
  const reused = item.usages.length > 1;

  return (
    <li className={`px-5 py-4 ${item.removed ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{item.name}</p>
            {reused ? <Chip tone="shared">Reused ×{item.usages.length}</Chip> : null}
            {item.pantry ? <Chip>Pantry</Chip> : null}
            {item.source === "manual" ? <Chip>Added</Chip> : null}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Need {formatQty(item.requiredQuantity, item.unit)} · Buy {item.purchaseLabel} ·{" "}
            {formatEuro(item.estimatedPrice)}
          </p>
          {item.usages.length ? (
            <p className="text-xs text-muted-foreground mt-1.5">
              {item.usages
                .map((u) => `${shortDay(u.date)} ${u.groupId === "kids" ? "kids" : "adult"}: ${u.recipeName}`)
                .join(" · ")}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={0}
            step="any"
            aria-label={`Quantity for ${item.name}`}
            className="w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
            value={Math.round(item.requiredQuantity * 100) / 100}
            onChange={(e) => updateItem(item.id, { requiredQuantity: Number(e.target.value) || 0 })}
          />
          <Button
            size="sm"
            variant={item.removed ? "secondary" : "danger"}
            onClick={() => updateItem(item.id, { removed: !item.removed })}
            aria-label={item.removed ? "Restore item" : "Remove item"}
          >
            {item.removed ? <Undo2 className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2.5 text-xs text-muted-foreground">
        <Toggle checked={item.pantry} onChange={(pantry) => updateItem(item.id, { pantry })} />
        Already in the pantry
      </label>
    </li>
  );
}

function AddManualItem() {
  const { addManualItem } = useStore();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<IngredientCategory>("other");
  const [quantity, setQuantity] = useState(1);

  return (
    <Card className="mt-6">
      <p className="text-sm font-semibold mb-3">Add an item</p>
      <div className="grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
        <Field label="Name">
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Olive oil" />
        </Field>
        <Field label="Category">
          <select
            className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as IngredientCategory)}
          >
            {CATEGORY_ORDER.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Quantity">
          <TextInput
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          />
        </Field>
        <Button
          disabled={!name.trim()}
          onClick={() => {
            addManualItem({ name: name.trim(), category, requiredQuantity: quantity, unit: "unit" });
            setName("");
            setQuantity(1);
          }}
        >
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
    </Card>
  );
}
