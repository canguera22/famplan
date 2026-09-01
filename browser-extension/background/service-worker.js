import { MESSAGES, MERCADONA_ORIGIN } from "../shared/protocol.js";

/**
 * Orchestrates cart population between the Mesa web app and the Mercadona tab.
 * It never handles credentials, payment data or checkout — only cart lines.
 */

/** jobId -> port back to the web app */
const ports = new Map();

chrome.runtime.onConnectExternal.addListener((port) => {
  const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  ports.set(jobId, port);
  port.onDisconnect.addListener(() => ports.delete(jobId));
  port.onMessage.addListener(async (message) => {
    try {
      const value = await handle(message, jobId);
      port.postMessage({ type: MESSAGES.RESULT, requestId: message.requestId, ok: true, value });
    } catch (error) {
      port.postMessage({
        type: MESSAGES.RESULT,
        requestId: message.requestId,
        ok: false,
        error: String(error?.message ?? error),
      });
    }
  });
  port.postMessage({ type: MESSAGES.PROGRESS, phase: "connected", jobId, version: chrome.runtime.getManifest().version });
});

// One-shot messages (ping / feature detection) from the web app.
chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message?.type === MESSAGES.PING) {
    sendResponse({ ok: true, version: chrome.runtime.getManifest().version, api: true });
    return true;
  }
  handle(message, null)
    .then((value) => sendResponse({ ok: true, value }))
    .catch((error) => sendResponse({ ok: false, error: String(error?.message ?? error) }));
  return true;
});

// Progress relayed from the content script for a running job.
chrome.runtime.onMessage.addListener((message) => {
  if (message?.type !== MESSAGES.ADAPTER_EVENT) return false;
  const port = ports.get(message.jobId);
  port?.postMessage({ type: MESSAGES.PROGRESS, ...message.progress });
  return false;
});

async function mercadonaTab() {
  const [tab] = await chrome.tabs.query({ url: `${MERCADONA_ORIGIN}/*` });
  if (tab) return tab;
  throw new Error("No Mercadona tab is open. Open tienda.mercadona.es and sign in first.");
}

async function adapter(method, args, jobId) {
  const tab = await mercadonaTab();
  const response = await chrome.tabs.sendMessage(tab.id, {
    type: MESSAGES.ADAPTER_CALL,
    method,
    args,
    jobId,
  });
  if (!response?.ok) throw new Error(response?.error?.message ?? "Mercadona adapter call failed.");
  return response.value;
}

async function handle(message, jobId) {
  switch (message?.type) {
    case MESSAGES.PING:
      return { version: chrome.runtime.getManifest().version };

    case MESSAGES.GET_SESSION_STATUS:
      return adapter("getSessionStatus", [], jobId);

    case MESSAGES.GET_CART:
      return adapter("getCart", [], jobId);

    case MESSAGES.REMOVE_PRODUCT:
      return adapter("removeProduct", [String(message.productId)], jobId);

    case MESSAGES.DIAGNOSTICS:
      return adapter("diagnostics", [], jobId);

    case MESSAGES.TEST_SINGLE_PRODUCT: {
      const productId = String(message.productId);
      const quantity = Number(message.quantity ?? 1);
      const session = await adapter("getSessionStatus", [], jobId);
      if (!session.signedIn) {
        return { step: "session", ok: false, session, error: "No active Mercadona session." };
      }
      const before = await adapter("getCart", [], jobId);
      const result = await adapter("populateCart", [[{ productId, quantity }]], jobId);
      const after = await adapter("getCart", [], jobId);
      const line = after.lines.find((l) => l.productId === productId);
      return {
        step: "verify",
        ok: Boolean(line && line.quantity === quantity),
        session,
        before: { lines: before.lines.length, version: before.version },
        after: { lines: after.lines.length, version: after.version, line: line ?? null },
        result,
      };
    }

    case MESSAGES.POPULATE_MERCADONA_CART: {
      const items = Array.isArray(message.items) ? message.items : [];
      if (!items.length) throw new Error("No products to add.");
      return adapter("populateCart", [items], jobId);
    }

    default:
      throw new Error(`Unsupported message: ${message?.type}`);
  }
}
