import type {
  CartPayload,
  CartProductStatus,
  CartStatus,
  RetailerCart,
} from "@/domain/retail";
import { productById, cartTotals } from "./matching";
import { extensionApi, type CartMode } from "./mercadona-extension";

/**
 * Retailer-agnostic contract between the planner and whatever puts products in
 * a cart (today: a mock; tomorrow: a Chrome extension driving the retailer's
 * own site inside the user's already-authenticated session).
 *
 * The app never handles credentials, payment data or checkout.
 */
export interface CartIntegrationService {
  readonly retailerId: string;
  /** Validate + shape the approved cart into a transport payload. */
  prepareCart(cart: RetailerCart): CartPayload;
  /** Hand the payload over. Progress arrives through onStatus. */
  sendCart(payload: CartPayload, onStatus: (status: CartStatus) => void): Promise<CartStatus>;
  /** Latest known status (e.g. after a page re-mount). */
  receiveCartStatus(): CartStatus | null;
  /** Retry or skip a single product that could not be added. */
  handleProductFailure(
    retailerProductId: string,
    action: "retry" | "skip",
    onStatus: (status: CartStatus) => void,
  ): Promise<CartStatus>;
  /** The retailer session is missing/expired — the user must sign in themselves. */
  handleSessionFailure(): CartStatus;
}

export class CartIntegrationError extends Error {}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Mercadona implementation.
 *
 * SIMULATION MODE: until the Chrome extension exists this class fakes the
 * transport so the whole UX is testable. No Mercadona DOM selectors, endpoints
 * or undocumented APIs are assumed anywhere — see browser-extension/README.md.
 */
export class MercadonaCartIntegration implements CartIntegrationService {
  readonly retailerId = "mercadona";
  /** Flip to false once a real extension bridge is connected. */
  readonly simulated = true;

  private status: CartStatus | null = null;

  prepareCart(cart: RetailerCart): CartPayload {
    const missing = cart.lines.filter((l) => !l.retailerProductId);
    if (missing.length) {
      throw new CartIntegrationError(
        `${missing.length} ingredient(s) still need a Mercadona product match.`,
      );
    }
    return {
      retailer: this.retailerId,
      cartId: cart.id,
      products: cart.lines.map((line) => {
        const product = productById(line.retailerProductId)!;
        return {
          retailerProductId: product.retailerProductId,
          name: product.name,
          quantity: line.quantity,
          productUrl: product.productUrl,
        };
      }),
    };
  }

  async sendCart(payload: CartPayload, onStatus: (status: CartStatus) => void): Promise<CartStatus> {
    const estimatedTotal = this.estimate(payload);
    const products: CartProductStatus[] = payload.products.map((p) => ({
      retailerProductId: p.retailerProductId,
      name: p.name,
      quantity: p.quantity,
      state: "pending",
    }));

    this.emit({ cartId: payload.cartId, phase: "connecting", products, estimatedTotal }, onStatus);
    await wait(900);

    // One synthetic failure so the recovery UX can be exercised.
    const failIndex = products.length > 3 ? Math.floor(products.length / 2) : -1;

    for (let i = 0; i < products.length; i++) {
      products[i]!.state = "adding";
      this.emit({ cartId: payload.cartId, phase: "adding", products, estimatedTotal }, onStatus);
      await wait(260);
      if (i === failIndex) {
        products[i]!.state = "failed";
        products[i]!.message = "Product unavailable in your Mercadona store (simulated).";
      } else {
        products[i]!.state = "added";
      }
      this.emit({ cartId: payload.cartId, phase: "adding", products, estimatedTotal }, onStatus);
    }

    return this.emit({ cartId: payload.cartId, phase: "complete", products, estimatedTotal }, onStatus);
  }

  receiveCartStatus(): CartStatus | null {
    return this.status;
  }

  async handleProductFailure(
    retailerProductId: string,
    action: "retry" | "skip",
    onStatus: (status: CartStatus) => void,
  ): Promise<CartStatus> {
    const current = this.status;
    if (!current) throw new CartIntegrationError("No cart in progress.");
    const products = current.products.map((p) => ({ ...p }));
    const target = products.find((p) => p.retailerProductId === retailerProductId);
    if (!target) return current;

    if (action === "skip") {
      target.state = "skipped";
      target.message = undefined;
      return this.emit({ ...current, products }, onStatus);
    }

    target.state = "adding";
    target.message = undefined;
    this.emit({ ...current, phase: "adding", products }, onStatus);
    await wait(700);
    target.state = "added";
    return this.emit({ ...current, phase: "complete", products }, onStatus);
  }

  handleSessionFailure(): CartStatus {
    const base = this.status;
    const next: CartStatus = {
      cartId: base?.cartId ?? "unknown",
      phase: "session_failed",
      products: base?.products ?? [],
      estimatedTotal: base?.estimatedTotal ?? 0,
      message: "You are not signed in to Mercadona. Sign in in your browser and try again.",
    };
    this.status = next;
    return next;
  }

  private estimate(payload: CartPayload): number {
    const total = payload.products.reduce((n, p) => {
      const product = productById(p.retailerProductId);
      return n + (product ? product.price * p.quantity : 0);
    }, 0);
    return Math.round(total * 100) / 100;
  }

  private emit(status: CartStatus, onStatus: (s: CartStatus) => void): CartStatus {
    const snapshot: CartStatus = { ...status, products: status.products.map((p) => ({ ...p })) };
    this.status = snapshot;
    onStatus(snapshot);
    return snapshot;
  }
}

export const mercadonaIntegration = new MercadonaCartIntegration();

/**
 * LIVE MODE: hands the payload to the Mesa Chrome extension, which talks to
 * Mercadona's own cart API from inside the user's authenticated tab. The app
 * never sees a Mercadona token; only product ids and quantities cross over.
 */
export class ExtensionCartIntegration implements CartIntegrationService {
  readonly retailerId = "mercadona";
  readonly simulated = false;

  private status: CartStatus | null = null;

  prepareCart(cart: RetailerCart): CartPayload {
    return mercadonaIntegration.prepareCart(cart);
  }

  async sendCart(payload: CartPayload, onStatus: (status: CartStatus) => void): Promise<CartStatus> {
    const estimatedTotal = payload.products.reduce((n, p) => {
      const product = productById(p.retailerProductId);
      return n + (product ? product.price * p.quantity : 0);
    }, 0);
    const products: CartProductStatus[] = payload.products.map((p) => ({
      retailerProductId: p.retailerProductId,
      name: p.name,
      quantity: p.quantity,
      state: "pending",
    }));

    const emit = (patch: Partial<CartStatus>): CartStatus => {
      const next: CartStatus = {
        cartId: payload.cartId,
        phase: "adding",
        estimatedTotal: Math.round(estimatedTotal * 100) / 100,
        ...this.status,
        ...patch,
        products: products.map((p) => ({ ...p })),
      };
      this.status = next;
      onStatus(next);
      return next;
    };

    emit({ phase: "connecting", message: "Connecting to Mercadona…" });

    try {
      const result = await extensionApi.populateCart(
        payload.products.map((p) => ({
          productId: p.retailerProductId,
          quantity: p.quantity,
          requestedIngredient: p.name,
        })),
        (progress) => {
          if (progress.phase === "checking_session") {
            emit({ phase: "connecting", message: "Checking your Mercadona session…" });
            return;
          }
          if (progress.phase === "adding" && typeof progress.index === "number") {
            const target = products[progress.index];
            if (target) target.state = "adding";
            emit({
              phase: "adding",
              message: `Adding ${progress.index + 1} of ${progress.total ?? products.length} products…`,
            });
            return;
          }
          if (progress.phase === "item" && progress.productId) {
            const target = products.find((p) => p.retailerProductId === progress.productId);
            if (target) {
              target.state =
                progress.state === "updated"
                  ? "added"
                  : progress.state === "unavailable"
                    ? "failed"
                    : ((progress.state as CartProductStatus["state"]) ?? "added");
              target.message =
                progress.state === "unavailable"
                  ? "Not available in your Mercadona store."
                  : (progress.message ?? undefined);
            }
            emit({ phase: "adding" });
          }
        },
      );

      if (result.sessionFailed) {
        return this.handleSessionFailure(onStatus);
      }

      for (const item of result.unavailable ?? []) {
        const target = products.find((p) => p.retailerProductId === String(item.productId));
        if (target) {
          target.state = "failed";
          target.message = item.reason ?? "Not available in your Mercadona store.";
        }
      }
      for (const item of result.failed ?? []) {
        const target = products.find((p) => p.retailerProductId === String(item.productId));
        if (target) {
          target.state = "failed";
          target.message = item.reason ?? "Could not be added.";
        }
      }
      for (const item of [...(result.added ?? []), ...(result.updated ?? [])]) {
        const target = products.find((p) => p.retailerProductId === String(item.productId));
        if (target && target.state !== "failed") {
          target.state = "added";
          target.message = undefined;
        }
      }

      return emit({ phase: "complete", message: "Cart ready for review on Mercadona." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Mercadona cart update failed.";
      if (/session|sign in|not logged/i.test(message)) return this.handleSessionFailure(onStatus);
      const next = emit({ phase: "complete", message });
      throw new CartIntegrationError(message + " (partial state shown: " + next.products.length + " products)");
    }
  }

  receiveCartStatus(): CartStatus | null {
    return this.status;
  }

  async handleProductFailure(
    retailerProductId: string,
    action: "retry" | "skip",
    onStatus: (status: CartStatus) => void,
  ): Promise<CartStatus> {
    const current = this.status;
    if (!current) throw new CartIntegrationError("No cart in progress.");
    const products = current.products.map((p) => ({ ...p }));
    const target = products.find((p) => p.retailerProductId === retailerProductId);
    if (!target) return current;

    if (action === "skip") {
      target.state = "skipped";
      target.message = undefined;
      const next = { ...current, products };
      this.status = next;
      onStatus(next);
      return next;
    }

    target.state = "adding";
    target.message = undefined;
    this.status = { ...current, products };
    onStatus(this.status);
    try {
      const result = await extensionApi.populateCart(
        [{ productId: retailerProductId, quantity: target.quantity, requestedIngredient: target.name }],
        () => {},
      );
      const failed = [...(result.failed ?? []), ...(result.unavailable ?? [])][0];
      target.state = failed ? "failed" : "added";
      target.message = failed?.reason;
    } catch (error) {
      target.state = "failed";
      target.message = error instanceof Error ? error.message : "Retry failed.";
    }
    const next: CartStatus = { ...current, phase: "complete", products };
    this.status = next;
    onStatus(next);
    return next;
  }

  handleSessionFailure(onStatus?: (status: CartStatus) => void): CartStatus {
    const base = this.status;
    const next: CartStatus = {
      cartId: base?.cartId ?? "unknown",
      phase: "session_failed",
      products: base?.products ?? [],
      estimatedTotal: base?.estimatedTotal ?? 0,
      message: "You are not signed in to Mercadona. Sign in in your browser tab and try again.",
    };
    this.status = next;
    onStatus?.(next);
    return next;
  }
}

export const extensionIntegration = new ExtensionCartIntegration();

/** Simulation stays available as a fallback/debug mode. */
export function getCartIntegration(mode: CartMode): CartIntegrationService {
  return mode === "live" ? extensionIntegration : mercadonaIntegration;
}

export function estimateCartTotal(cart: RetailerCart): number {
  return cartTotals(cart).total;
}
