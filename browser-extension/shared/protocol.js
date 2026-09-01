// Message contract between the Mesa web app, the extension service worker,
// the isolated content script and the injected page script.
// Mirrors src/domain/retail.ts (CartPayload/CartStatus) and
// src/lib/mercadona-extension.ts on the web-app side.

export const MESSAGES = {
  // web app  -> service worker
  PING: "mesa:ping",
  POPULATE_MERCADONA_CART: "POPULATE_MERCADONA_CART",
  TEST_SINGLE_PRODUCT: "TEST_SINGLE_PRODUCT",
  GET_SESSION_STATUS: "GET_SESSION_STATUS",
  GET_CART: "GET_CART",
  REMOVE_PRODUCT: "REMOVE_PRODUCT",
  DIAGNOSTICS: "DIAGNOSTICS",

  // service worker -> web app (over the long-lived port)
  PROGRESS: "MERCADONA_PROGRESS",
  RESULT: "MERCADONA_RESULT",

  // service worker <-> content script
  ADAPTER_CALL: "mesa:adapter-call",
  ADAPTER_EVENT: "mesa:adapter-event",
};

// Phases surfaced to the UI.
export const PHASES = ["idle", "connecting", "checking_session", "adding", "complete", "session_failed"];

// Per-product states, identical to CartLineState in the web app.
export const STATES = ["pending", "adding", "added", "updated", "unavailable", "failed", "skipped"];

export const MERCADONA_ORIGIN = "https://tienda.mercadona.es";
export const MERCADONA_MATCH = "https://tienda.mercadona.es/*";
