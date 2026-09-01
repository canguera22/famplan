import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Loader2,
  Minus,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ProductThumb } from "@/components/ProductThumb";
import { Button, Card, Chip, EmptyState, TextInput } from "@/components/ui-kit";
import { MERCADONA } from "@/data/retailers";
import type { CartStatus, RetailerCartLine, RetailerProduct } from "@/domain/retail";
import {
  CartIntegrationError,
  getCartIntegration,
  mercadonaIntegration,
} from "@/lib/cart-integration";
import {
  extensionApi,
  getCartMode,
  getExtensionId,
  setCartMode,
  setExtensionId,
  type CartMode,
} from "@/lib/mercadona-extension";
import {
  candidatesFor,
  cartTotals,
  lineTotal,
  packagesFor,
  productById,
  searchProducts,
} from "@/lib/matching";
import { shortDay } from "@/lib/planner";
import { useStore } from "@/lib/store";
import { formatEuro, formatQty } from "@/lib/units";

export const Route = createFileRoute("/shopping/mercadona")({
  head: () => ({
    meta: [
      { title: "Your Mercadona Basket — Mesa" },
      {
        name: "description",
        content:
          "Review the exact Mercadona products matched to your weekly ingredients, swap any of them, then add the approved basket to your Mercadona cart.",
      },
      { property: "og:title", content: "Your Mercadona Basket — Mesa" },
      {
        property: "og:description",
        content:
          "Every ingredient matched to a real product with package sizes and quantities. You always review before anything is added.",
      },
    ],
  }),
  component: MercadonaPage,
});

function MercadonaPage() {
  const store = useStore();
  const cart = store.cart;
  const [changing, setChanging] = useState<RetailerCartLine | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState<CartStatus | null>(() =>
    mercadonaIntegration.receiveCartStatus(),
  );
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<CartMode>("simulation");

  useEffect(() => setMode(getCartMode()), []);
  const integration = getCartIntegration(mode);
  const live = mode === "live";

  const totals = useMemo(() => (cart ? cartTotals(cart) : null), [cart]);

  if (!cart || !totals) {
    return (
      <AppShell title="Your Mercadona Basket">
        <EmptyState
          title="No products matched yet"
          body="Approve your shopping list first, then match it to Mercadona products."
          action={
            <Link to="/shopping">
              <Button>Go to shopping list</Button>
            </Link>
          }
        />
        <ExtensionPanel
          mode={mode}
          onMode={(next) => {
            setCartMode(next);
            setMode(next);
          }}
        />
      </AppShell>
    );
  }


  if (status && status.phase !== "idle") {
    return (
      <AppShell
        title="Adding to Mercadona"
        subtitle={
          live
            ? "Your cart is being updated in your Mercadona tab. No purchase is made."
            : "Simulation mode — no purchase is made."
        }
      >
        <ProgressView
          status={status}
          live={live}
          onStatus={setStatus}
          onClose={() => setStatus(null)}
        />
      </AppShell>
    );
  }

  const mealLines = cart.lines.filter((l) => l.source !== "staple");
  const stapleLines = cart.lines.filter((l) => l.source === "staple");
  const ready =
    Boolean(store.plan?.approved) &&
    Boolean(store.list?.approved) &&
    totals.unmatched === 0 &&
    cart.reviewed;

  const start = async () => {
    setConfirming(false);
    setError(null);
    try {
      const payload = integration.prepareCart(cart);
      const initial: CartStatus = {
        cartId: cart.id,
        phase: "connecting",
        products: [],
        estimatedTotal: totals.total,
      };
      setStatus(initial);
      await integration.sendCart(payload, setStatus);
    } catch (e) {
      setStatus(null);
      setError(
        e instanceof CartIntegrationError || e instanceof Error
          ? e.message
          : "Could not start the hand-off.",
      );
    }
  };

  return (
    <AppShell
      title="Your Mercadona Basket"
      subtitle="Exact products for your approved week. Nothing is added until you say so."
    >
      <Card className="bg-secondary/60">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Estimated basket total</p>
            <p className="text-3xl font-semibold mt-0.5">{formatEuro(totals.total)}</p>
          </div>
          <Chip>{live ? "Live Mercadona cart" : "Simulation mode"}</Chip>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Products" value={String(totals.products)} />
          <Stat label="Meal ingredients" value={formatEuro(totals.mealsTotal)} />
          <Stat label="Household staples" value={formatEuro(totals.staplesTotal)} />
        </div>
      </Card>

      {totals.unmatched > 0 ? (
        <Card className="mt-4 border-destructive/40">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="font-semibold">
                {totals.unmatched} item{totals.unmatched > 1 ? "s need" : " needs"} a product match
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                We will not guess a low-confidence product. Pick the Mercadona product yourself and
                we will remember it next week.
              </p>
            </div>
          </div>
        </Card>
      ) : null}

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold">From your meals</h2>
        {mealLines.map((line) => (
          <ProductLineCard key={line.id} line={line} onChange={() => setChanging(line)} />
        ))}
      </section>

      {stapleLines.length ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold">Household staples</h2>
          {stapleLines.map((line) => (
            <ProductLineCard key={line.id} line={line} onChange={() => setChanging(line)} />
          ))}
        </section>
      ) : null}

      <AddProductPanel />

      <Card className="mt-6">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={cart.reviewed}
            onChange={() => store.markCartReviewed()}
            disabled={cart.reviewed}
          />
          <span>
            I have reviewed every proposed product, its package size and quantity.
          </span>
        </label>
      </Card>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4">
        <Button size="lg" disabled={!ready} onClick={() => setConfirming(true)}>
          <ShoppingCart className="h-4 w-4" /> Add to Mercadona
        </Button>
        {!ready ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Available once the meal plan and shopping list are approved, every item has a product
            and you have confirmed the review above.
          </p>
        ) : null}
      </div>

      <ExtensionPanel mode={mode} onMode={(next) => { setCartMode(next); setMode(next); }} />

      {changing ? (
        <ChangeProductModal line={changing} onClose={() => setChanging(null)} />
      ) : null}

      {confirming ? (
        <Modal title="Ready to add your basket to Mercadona?" onClose={() => setConfirming(false)}>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Mesa adds the approved products and quantities to your Mercadona cart.</li>
            <li>• No purchase is made and no payment information is accessed.</li>
            <li>• You review and complete the order directly on Mercadona.</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            {live
              ? "Mesa sends product ids and quantities to the Mesa extension, which updates the cart inside your own signed-in Mercadona tab. Keep that tab open."
              : "This build runs in simulation mode until you switch to the live extension below."}
          </p>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={start}>
              Add products
            </Button>
          </div>
        </Modal>
      ) : null}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function ProductLineCard({ line, onChange }: { line: RetailerCartLine; onChange: () => void }) {
  const store = useStore();
  const product = productById(line.retailerProductId);
  const preferred = store.preferredProducts.some(
    (p) => p.ingredientId === line.ingredientId && p.retailerProductId === line.retailerProductId,
  );

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <ProductThumb product={product} />
        <div className="min-w-0 flex-1">
          {product ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{product.name}</p>
                {preferred ? <Chip tone="shared">Preferred</Chip> : null}
                {line.source === "staple" ? <Chip>Staple</Chip> : null}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                {product.brand} · {formatQty(product.packageSize, product.packageUnit)} ·{" "}
                {formatEuro(product.price)} each
              </p>
              <p className="text-sm font-medium mt-1">
                {line.quantity} package{line.quantity === 1 ? "" : "s"} —{" "}
                {formatEuro(lineTotal(line))}
              </p>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{line.ingredientName}</p>
                <Chip className="bg-destructive/10 text-destructive">Product match needed</Chip>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Need {formatQty(line.requiredQuantity, line.unit)} — choose a Mercadona product.
              </p>
            </div>
          )}
          {line.ingredientId ? (
            <p className="text-xs text-muted-foreground mt-1.5">
              Fulfils: {line.ingredientName} · need {formatQty(line.requiredQuantity, line.unit)}
            </p>
          ) : null}
          {line.usages.length ? (
            <div className="mt-2 rounded-xl bg-secondary/60 px-3 py-2">
              <p className="text-[0.7rem] font-semibold text-muted-foreground">Needed for</p>
              <ul className="mt-1 space-y-0.5">
                {line.usages.map((u) => (
                  <li key={`${u.date}-${u.groupId}`} className="text-xs text-muted-foreground">
                    {shortDay(u.date)} {u.groupId === "kids" ? "Kids" : "Adult"} — {u.recipeName}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {product ? (
          <div className="flex items-center gap-1 rounded-xl border border-border px-1 py-1">
            <button
              type="button"
              aria-label={`Decrease ${product.name}`}
              className="rounded-lg p-1.5 hover:bg-secondary"
              onClick={() => store.setLineQuantity(line.id, Math.max(1, line.quantity - 1))}
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-medium">{line.quantity}</span>
            <button
              type="button"
              aria-label={`Increase ${product.name}`}
              className="rounded-lg p-1.5 hover:bg-secondary"
              onClick={() => store.setLineQuantity(line.id, line.quantity + 1)}
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
        <Button size="sm" variant="secondary" onClick={onChange}>
          {product ? "Change product" : "Find product"}
        </Button>
        {product && line.ingredientId && !preferred ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => store.setPreferredProduct(line.ingredientId!, product.retailerProductId)}
          >
            <Star className="h-3.5 w-3.5" /> Mark preferred
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="danger"
          onClick={() => store.removeLine(line.id)}
          aria-label={`Remove ${line.ingredientName}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}

function ChangeProductModal({ line, onClose }: { line: RetailerCartLine; onClose: () => void }) {
  const store = useStore();
  const [remember, setRemember] = useState(false);
  const [query, setQuery] = useState("");

  const alternatives = useMemo(() => {
    const mapped = candidatesFor(line.ingredientId).map((c) => c.product);
    if (!query.trim() && mapped.length) return mapped;
    return searchProducts(query || line.ingredientName);
  }, [line.ingredientId, line.ingredientName, query]);

  return (
    <Modal title={`Choose a product for ${line.ingredientName}`} onClose={onClose}>
      <p className="text-sm text-muted-foreground">
        Need {formatQty(line.requiredQuantity, line.unit)}.
      </p>
      <div className="mt-3 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Mercadona products"
          aria-label="Search Mercadona products"
        />
      </div>

      <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto">
        {alternatives.map((product) => (
          <AlternativeRow
            key={product.retailerProductId}
            product={product}
            required={line.requiredQuantity}
            selected={product.retailerProductId === line.retailerProductId}
            onSelect={() => {
              store.setLineProduct(line.id, product.retailerProductId, remember);
              onClose();
            }}
          />
        ))}
        {!alternatives.length ? (
          <li className="text-sm text-muted-foreground">No products found.</li>
        ) : null}
      </ul>

      <label className="mt-4 flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        Remember this choice for {line.ingredientName}
      </label>
    </Modal>
  );
}

function AlternativeRow({
  product,
  required,
  selected,
  onSelect,
}: {
  product: RetailerProduct;
  required: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const packages = packagesFor(required, product);
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
          selected ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60"
        }`}
      >
        <ProductThumb product={product} className="h-10 w-10" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium">{product.name}</span>
          <span className="block text-xs text-muted-foreground">
            {product.brand} · {formatQty(product.packageSize, product.packageUnit)} ·{" "}
            {formatEuro(product.price)}
          </span>
        </span>
        <span className="text-right">
          <span className="block text-sm font-medium">{packages} pack</span>
          <span className="block text-xs text-muted-foreground">
            {formatEuro(Math.round(packages * product.price * 100) / 100)}
          </span>
        </span>
      </button>
    </li>
  );
}

function AddProductPanel() {
  const store = useStore();
  const [query, setQuery] = useState("");
  const results = useMemo(() => (query.trim() ? searchProducts(query, 6) : []), [query]);

  return (
    <Card className="mt-6">
      <p className="text-sm font-semibold">Add another Mercadona product</p>
      <div className="mt-3">
        <TextInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search the catalog"
          aria-label="Add a Mercadona product"
        />
      </div>
      <ul className="mt-3 space-y-2">
        {results.map((product) => (
          <li key={product.retailerProductId} className="flex items-center gap-3">
            <ProductThumb product={product} className="h-10 w-10" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">
                {product.brand} · {formatQty(product.packageSize, product.packageUnit)} ·{" "}
                {formatEuro(product.price)}
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                store.addCartProduct(product.retailerProductId);
                setQuery("");
              }}
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Basket edits never change your approved meal plan.
      </p>
    </Card>
  );
}

function ProgressView({
  status,
  live,
  onStatus,
  onClose,
}: {
  status: CartStatus;
  live: boolean;
  onStatus: (s: CartStatus) => void;
  onClose: () => void;
}) {
  const integration = getCartIntegration(live ? "live" : "simulation");
  const added = status.products.filter((p) => p.state === "added").length;
  const failed = status.products.filter((p) => p.state === "failed");
  const skipped = status.products.filter((p) => p.state === "skipped").length;
  const done = status.phase === "complete" && !status.products.some((p) => p.state === "adding");

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center gap-3">
          {done ? (
            <span className="rounded-full bg-shared-soft p-2.5 text-shared">
              <Check className="h-5 w-5" />
            </span>
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          )}
          <div>
            <p className="font-semibold">
              {status.phase === "session_failed"
                ? "Sign in to Mercadona"
                : status.phase === "connecting"
                ? status.message ?? "Connecting to Mercadona…"
                : done
                  ? "Your Mercadona cart is ready"
                  : "Adding products to Mercadona…"}
            </p>
            <p className="text-sm text-muted-foreground">
              {done
                ? `${added} products added${failed.length ? ` · ${failed.length} could not be added` : ""}${
                    skipped ? ` · ${skipped} skipped` : ""
                  } · Estimated total ${formatEuro(status.estimatedTotal)}`
                : (status.message ??
                  (live
                    ? "Updating your Mercadona cart — nothing is purchased."
                    : "Simulation mode — nothing is purchased."))}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-0 overflow-hidden">
        <ul className="divide-y divide-border">
          {status.products.map((p) => (
            <li key={p.retailerProductId} className="flex items-center gap-3 px-5 py-3">
              <span className="w-5 shrink-0 text-center">
                {p.state === "added" ? (
                  <Check className="h-4 w-4 text-shared" />
                ) : p.state === "failed" ? (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                ) : p.state === "adding" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : p.state === "skipped" ? (
                  <X className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <span className="block h-1.5 w-1.5 mx-auto rounded-full bg-border" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.name}</p>
                {p.message ? (
                  <p className="text-xs text-destructive mt-0.5">{p.message}</p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5">×{p.quantity}</p>
                )}
              </div>
              {p.state === "failed" ? (
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      void integration.handleProductFailure(p.retailerProductId, "retry", onStatus)
                    }
                  >
                    Retry
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void integration.handleProductFailure(p.retailerProductId, "skip", onStatus)
                    }
                  >
                    Skip
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row">
        <a href={MERCADONA.website} target="_blank" rel="noreferrer" className="flex-1">
          <Button size="lg">
            Review cart on Mercadona <ExternalLink className="h-4 w-4" />
          </Button>
        </a>
        <Button variant="secondary" onClick={onClose}>
          Back to basket
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Delivery, checkout and payment always happen on Mercadona.
      </p>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function ExtensionPanel({ mode, onMode }: { mode: CartMode; onMode: (m: CartMode) => void }) {
  const [id, setId] = useState("");
  const [testId, setTestId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => setId(getExtensionId()), []);

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    setOk(null);
    setOutput(null);
    try {
      const value = await fn();
      setOk((value as { ok?: boolean })?.ok !== false);
      setOutput(JSON.stringify(value, null, 2));
    } catch (e) {
      setOk(false);
      setOutput(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="mt-6 border-dashed">
      <p className="text-sm font-semibold">Mercadona extension (developer)</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Live mode talks to Mercadona&apos;s own cart API from inside your signed-in
        tienda.mercadona.es tab. Mesa never sees your Mercadona login, and never checks out.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={mode === "simulation" ? "primary" : "secondary"}
          onClick={() => onMode("simulation")}
        >
          Simulation
        </Button>
        <Button
          size="sm"
          variant={mode === "live" ? "primary" : "secondary"}
          onClick={() => onMode("live")}
        >
          Live extension
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
        <TextInput
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="Extension ID from chrome://extensions"
          aria-label="Mesa extension ID"
        />
        <Button size="sm" variant="secondary" onClick={() => setExtensionId(id)}>
          Save ID
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => void run("ping", extensionApi.ping)}>
          Ping extension
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void run("session", extensionApi.sessionStatus)}>
          Check session
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void run("cart", extensionApi.cart)}>
          Read cart
        </Button>
        <Button size="sm" variant="ghost" onClick={() => void run("diag", extensionApi.diagnostics)}>
          Diagnostics
        </Button>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <TextInput
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder="Real Mercadona product ID (e.g. 4240)"
          aria-label="Test product ID"
        />
        <Button
          size="sm"
          onClick={() => void run("test", () => extensionApi.testSingleProduct(testId.trim(), 1))}
          disabled={!testId.trim() || busy === "test"}
        >
          Test 1 product
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => void run("remove", () => extensionApi.removeProduct(testId.trim()))}
          disabled={!testId.trim()}
        >
          Remove
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Open tienda.mercadona.es and sign in first. The test adds one unit, re-reads the cart and
        verifies the line is present before you switch the weekly basket to live mode.
      </p>

      {busy ? <p className="mt-3 text-xs text-muted-foreground">Running {busy}…</p> : null}
      {output ? (
        <pre
          className={`mt-3 max-h-64 overflow-auto rounded-xl bg-secondary/60 p-3 text-[0.7rem] ${
            ok === false ? "text-destructive" : ""
          }`}
        >
          {output}
        </pre>
      ) : null}
    </Card>
  );
}
