/**
 * Web-app side of the Mesa Chrome extension bridge.
 *
 * Everything Mercadona-authenticated happens inside the user's browser: this
 * module only exchanges product ids and quantities with the extension. No
 * Mercadona token, cookie or credential is ever read here or sent anywhere.
 */

export const EXTENSION_ID_KEY = "mesa.extensionId";
export const CART_MODE_KEY = "mesa.cartMode";

export type CartMode = "simulation" | "live";

export interface PopulateItem {
  productId: string;
  quantity: number;
  requestedIngredient?: string;
}

export interface ExtensionProgress {
  phase?: string;
  index?: number;
  total?: number;
  productId?: string;
  state?: string;
  message?: string;
  session?: unknown;
}

export interface PopulateResult {
  success: boolean;
  added: PopulateItem[];
  updated: PopulateItem[];
  unavailable: (PopulateItem & { reason?: string })[];
  failed: (PopulateItem & { reason?: string; kind?: string })[];
  sessionFailed?: boolean;
  error?: string;
  cart?: { lines: { productId: string; quantity: number; name: string }[]; version: unknown } | null;
}

interface ChromeRuntimeLike {
  sendMessage: (id: string, msg: unknown, cb: (res: unknown) => void) => void;
  connect: (id: string) => ChromePortLike;
  lastError?: { message?: string };
}
interface ChromePortLike {
  postMessage: (msg: unknown) => void;
  disconnect: () => void;
  onMessage: { addListener: (fn: (msg: any) => void) => void };
  onDisconnect: { addListener: (fn: () => void) => void };
}

function runtime(): ChromeRuntimeLike | null {
  const chrome = (globalThis as any).chrome;
  return chrome?.runtime?.sendMessage ? (chrome.runtime as ChromeRuntimeLike) : null;
}

export function getCartMode(): CartMode {
  if (typeof window === "undefined") return "simulation";
  return window.localStorage.getItem(CART_MODE_KEY) === "live" ? "live" : "simulation";
}

export function setCartMode(mode: CartMode) {
  window.localStorage.setItem(CART_MODE_KEY, mode);
}

export function getExtensionId(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(EXTENSION_ID_KEY) ?? "";
}

export function setExtensionId(id: string) {
  window.localStorage.setItem(EXTENSION_ID_KEY, id.trim());
}

export class ExtensionUnavailableError extends Error {}

function requireBridge() {
  const chrome = runtime();
  const id = getExtensionId();
  if (!chrome) throw new ExtensionUnavailableError("Chrome extension messaging is not available in this browser.");
  if (!id) throw new ExtensionUnavailableError("Set the Mesa extension ID first (Developer tools below).");
  return { chrome, id };
}

/** One-shot request (ping, session, cart, diagnostics, single-product test). */
export function sendToExtension<T = unknown>(message: Record<string, unknown>): Promise<T> {
  const { chrome, id } = requireBridge();
  return new Promise<T>((resolve, reject) => {
    chrome.sendMessage(id, message, (res: any) => {
      const err = (globalThis as any).chrome?.runtime?.lastError;
      if (err) return reject(new ExtensionUnavailableError(err.message ?? "Extension not reachable."));
      if (!res) return reject(new ExtensionUnavailableError("No response from the Mesa extension."));
      if (res.ok === false) return reject(new Error(res.error ?? "Extension call failed."));
      resolve((res.value ?? res) as T);
    });
  });
}

/** Long-lived request that streams progress while the cart is populated. */
export function streamToExtension<T = unknown>(
  message: Record<string, unknown>,
  onProgress: (p: ExtensionProgress) => void,
): Promise<T> {
  const { chrome, id } = requireBridge();
  return new Promise<T>((resolve, reject) => {
    let port: ChromePortLike;
    try {
      port = chrome.connect(id);
    } catch (error) {
      reject(new ExtensionUnavailableError(String((error as Error).message)));
      return;
    }
    const requestId = `req-${Date.now()}`;
    let settled = false;

    port.onMessage.addListener((msg) => {
      if (msg?.type === "MERCADONA_PROGRESS") {
        if (msg.phase === "connected") {
          port.postMessage({ ...message, requestId });
          onProgress({ phase: "connecting" });
          return;
        }
        onProgress(msg as ExtensionProgress);
        return;
      }
      if (msg?.type === "MERCADONA_RESULT" && msg.requestId === requestId) {
        settled = true;
        port.disconnect();
        if (msg.ok) resolve(msg.value as T);
        else reject(new Error(msg.error ?? "Mercadona cart update failed."));
      }
    });

    port.onDisconnect.addListener(() => {
      if (!settled) reject(new ExtensionUnavailableError("The Mesa extension disconnected."));
    });
  });
}

export const extensionApi = {
  ping: () => sendToExtension<{ version: string }>({ type: "mesa:ping" }),
  sessionStatus: () => sendToExtension<Record<string, unknown>>({ type: "GET_SESSION_STATUS" }),
  cart: () => sendToExtension<Record<string, unknown>>({ type: "GET_CART" }),
  diagnostics: () => sendToExtension<Record<string, unknown>>({ type: "DIAGNOSTICS" }),
  removeProduct: (productId: string) => sendToExtension({ type: "REMOVE_PRODUCT", productId }),
  testSingleProduct: (productId: string, quantity = 1) =>
    sendToExtension<Record<string, unknown>>({ type: "TEST_SINGLE_PRODUCT", productId, quantity }),
  populateCart: (items: PopulateItem[], onProgress: (p: ExtensionProgress) => void) =>
    streamToExtension<PopulateResult>({ type: "POPULATE_MERCADONA_CART", items }, onProgress),
};
