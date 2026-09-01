# Mesa Chrome extension — Mercadona cart helper

Populates the user's **existing** Mercadona cart via Mercadona's own storefront
API, from inside their already-signed-in tab.

    manifest.json
    background/service-worker.js       orchestration + web-app messaging
    content/mercadona.js               isolated relay (no Mercadona logic)
    content/mercadona-page.js          MAIN-world MercadonaAdapter (API calls)
    content/mercadona-dom-fallback.js  disabled last-resort DOM path
    shared/protocol.js                 message contract

## Hard limits

Add / update / remove cart lines and read the cart. Never sign in, never read or
submit payment data, never pick a delivery slot, never check out. No Mercadona
token or session value ever leaves the page — the web app only ever exchanges
product ids and quantities with the extension.

## Why MAIN world instead of DOM automation

An isolated content script's `fetch` is an extension request, so Mercadona's
cart API rejects it. `content/mercadona-page.js` therefore runs in the page's own
world, reusing the tab's authenticated session, origin and headers exactly as the
storefront does. DOM selectors are the fallback adapter only, disabled by default.

## Spike behaviour (discovery over hardcoding)

`mercadona-page.js` patches `fetch`/`XMLHttpRequest` at `document_start` and
records every `/api/` call the storefront makes (path, method, status, header
keys). From that it derives:

- **Cart endpoint** — the observed `/api/*cart*` path; falls back to
  `/api/cart/`, `/api/v1_1/cart/`, `/api/carts/current/`.
- **Headers** — reuses the storefront's own `authorization`, `x-customer`,
  `x-app-version`, `accept-language` when present.
- **Session** — `localStorage["MO-user"]` plus other `MO*` keys; warehouse /
  postal code drive product availability, so `storefrontReady` is false until one
  is set.
- **Cart version** — `version` / `cart_version` / `updated_at` is echoed on write;
  HTTP 409 means an optimistic-locking conflict and is retried once against a
  freshly read cart.
- **Errors** — 401/403 session expired, 404 unavailable/unknown path, 409 version
  conflict, 400/422 rejected (e.g. quantity limits).

Run **Diagnostics** from the app's developer panel on a live Mercadona tab to
print the observed paths and shapes without exposing any token.

## Install

1. `chrome://extensions` → Developer mode → **Load unpacked** → this folder.
2. Copy the extension ID into Mesa → Mercadona basket → developer panel → Save ID.
3. Open `https://tienda.mercadona.es`, sign in and choose your postcode.

## Test order (do not skip)

1. **One product**: paste a real Mercadona product id, click *Test 1 product*.
   It checks the session, reads the cart, sets quantity 1, re-reads and verifies.
2. Multiple products · quantity > 1 · changing an existing line's quantity ·
   an unavailable product · *Remove* · signed-out session.
3. Only then switch the basket screen from **Simulation** to **Live extension**.

Simulation mode stays available permanently as a fallback/debug path.
