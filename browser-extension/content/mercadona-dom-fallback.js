/**
 * DOM fallback adapter — DISABLED by default and intentionally last resort.
 *
 * The API adapter (content/mercadona-page.js) is the primary implementation
 * because Mercadona's own storefront calls those endpoints, so they are far
 * more stable than markup. Only enable this if API cart interaction becomes
 * impossible; selectors here must be re-derived from the live site first and
 * will break without notice.
 */
export const DOM_FALLBACK_ENABLED = false;

export async function addProductViaDom() {
  if (!DOM_FALLBACK_ENABLED) {
    throw new Error("DOM fallback is disabled; the Mercadona cart API adapter is the primary path.");
  }
  // TODO(mercadona-spike): search input, product tile, quantity stepper and
  // cart confirmation selectors must be captured from a live signed-in session.
  throw new Error("DOM fallback not implemented.");
}
