/**
 * Runs in the MAIN world of https://tienda.mercadona.es/* — i.e. inside the
 * page itself, with the page's own origin, cookies, localStorage and fetch.
 *
 * Why the MAIN world: an isolated content script's fetch is treated as an
 * extension request (cross-origin, no page auth context), so Mercadona's own
 * cart API rejects it. Running in the page context reuses the user's existing
 * authenticated session exactly as their own browser tab would.
 *
 * PHASE 1 (spike) principle: nothing about Mercadona is hardcoded if it can be
 * observed. This script sniffs the storefront's own API traffic to learn the
 * real endpoints, headers and cart shape, and only falls back to candidate
 * paths when nothing has been observed yet.
 *
 * HARD LIMITS: this file may only read the cart and add/update/remove cart
 * lines. It never touches checkout, payment, delivery slots or credentials,
 * and never transmits session data anywhere outside this page.
 */
(() => {
  const CHANNEL_REQ = "mesa:page-request";
  const CHANNEL_RES = "mesa:page-response";
  const ORIGIN = "https://tienda.mercadona.es";

  // ---------------------------------------------------------------- sniffing
  /** @type {{url:string, method:string, headers:Record<string,string>, status:number, at:number}[]} */
  const observed = [];
  const isApi = (url) => typeof url === "string" && url.includes("/api/");

  const record = (url, method, headers, status) => {
    observed.push({ url, method, headers, status, at: Date.now() });
    if (observed.length > 60) observed.shift();
  };

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function patchedFetch(input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const method = (init && init.method) || (input && input.method) || "GET";
    let headers = {};
    try {
      const h = new Headers((init && init.headers) || (input && input.headers) || {});
      h.forEach((v, k) => {
        headers[k.toLowerCase()] = v;
      });
    } catch {
      headers = {};
    }
    const res = await nativeFetch(input, init);
    if (isApi(url)) record(url, method.toUpperCase(), headers, res.status);
    return res;
  };

  const nativeOpen = XMLHttpRequest.prototype.open;
  const nativeSetHeader = XMLHttpRequest.prototype.setRequestHeader;
  const nativeSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__mesa = { method: String(method).toUpperCase(), url: String(url), headers: {} };
    return nativeOpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.setRequestHeader = function (key, value) {
    if (this.__mesa) this.__mesa.headers[String(key).toLowerCase()] = String(value);
    return nativeSetHeader.call(this, key, value);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    if (this.__mesa && isApi(this.__mesa.url)) {
      this.addEventListener("loadend", () => {
        record(this.__mesa.url, this.__mesa.method, this.__mesa.headers, this.status);
      });
    }
    return nativeSend.apply(this, args);
  };

  // ------------------------------------------------------------- page context
  const readJson = (key) => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  /**
   * Mercadona persists the storefront session under localStorage "MO-user"
   * (plus related MO-* keys). We only read it, never copy it out of the page.
   */
  function readSession() {
    const user = readJson("MO-user") ?? readJson("MO-USER");
    const keys = Object.keys(window.localStorage).filter((k) => k.toUpperCase().startsWith("MO"));
    const warehouse =
      user?.warehouse_code ??
      user?.warehouse ??
      user?.wh ??
      readJson("MO-warehouse") ??
      null;
    const postalCode = user?.postal_code ?? user?.postalCode ?? user?.zip_code ?? null;
    return { user, keys, warehouse, postalCode };
  }

  function sessionStatus() {
    const { user, keys, warehouse, postalCode } = readSession();
    const hasUser = Boolean(user && (user.id || user.customer_id || user.email || user.token));
    return {
      isOnMercadona: location.origin === ORIGIN,
      signedIn: hasUser,
      warehouse,
      postalCode,
      storageKeys: keys,
      // A postcode/warehouse must be chosen before products resolve; without it
      // every availability check will fail even for a signed-in user.
      storefrontReady: Boolean(warehouse || postalCode),
    };
  }

  /** Headers the storefront itself sends, reused verbatim where safe. */
  function apiHeaders(extra) {
    const last = [...observed].reverse().find((o) => o.headers && Object.keys(o.headers).length);
    const base = { accept: "application/json", "content-type": "application/json" };
    if (last) {
      for (const [k, v] of Object.entries(last.headers)) {
        if (["authorization", "x-customer", "x-app-version", "accept-language"].includes(k)) {
          base[k] = v;
        }
      }
    }
    return { ...base, ...(extra || {}) };
  }

  async function api(path, { method = "GET", body, headers } = {}) {
    const url = path.startsWith("http") ? path : ORIGIN + path;
    const res = await nativeFetch(url, {
      method,
      credentials: "include",
      headers: apiHeaders(headers),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      const err = new Error(`Mercadona ${method} ${url} → ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // Discovered first, candidates second. Ordered by what the storefront uses.
  const CART_CANDIDATES = ["/api/cart/", "/api/v1_1/cart/", "/api/carts/current/"];

  function discoveredCartPath() {
    const hit = [...observed]
      .reverse()
      .find((o) => /\/api\/[^?]*cart/i.test(o.url) && o.status < 400);
    if (!hit) return null;
    try {
      return new URL(hit.url, ORIGIN).pathname;
    } catch {
      return null;
    }
  }

  let cartPath = null;

  async function resolveCartPath() {
    if (cartPath) return cartPath;
    const candidates = [discoveredCartPath(), ...CART_CANDIDATES].filter(Boolean);
    let lastError = null;
    for (const path of candidates) {
      try {
        await api(path);
        cartPath = path;
        return path;
      } catch (error) {
        lastError = error;
        if (error.status === 401 || error.status === 403) throw error;
      }
    }
    throw lastError ?? new Error("Could not locate the Mercadona cart endpoint.");
  }

  /** Normalise whatever shape the cart endpoint returns. */
  function normaliseCart(raw) {
    const lines = raw?.lines ?? raw?.items ?? raw?.products ?? [];
    return {
      raw,
      // Optimistic locking: Mercadona returns a cart version/updated marker that
      // must be echoed back; a mismatch surfaces as HTTP 409.
      version: raw?.version ?? raw?.cart_version ?? raw?.updated_at ?? null,
      total: Number(raw?.summary?.total ?? raw?.total ?? 0) || 0,
      lines: (Array.isArray(lines) ? lines : []).map((l) => ({
        productId: String(l.product_id ?? l.id ?? l.product?.id ?? ""),
        quantity: Number(l.quantity ?? l.units ?? 0) || 0,
        name: l.display_name ?? l.name ?? l.product?.display_name ?? "",
      })),
    };
  }

  async function getCart() {
    const path = await resolveCartPath();
    return normaliseCart(await api(path));
  }

  async function getProduct(productId) {
    return api(`/api/products/${encodeURIComponent(productId)}/`);
  }

  async function writeLine(productId, quantity, version) {
    const path = await resolveCartPath();
    const payload = {
      lines: [{ id: String(productId), product_id: String(productId), quantity }],
      ...(version ? { version } : {}),
    };
    // PUT is the storefront's own line-write verb; POST is accepted by older
    // deployments, so fall back once rather than failing the whole run.
    try {
      return normaliseCart(await api(path, { method: "PUT", body: payload }));
    } catch (error) {
      if (error.status === 404 || error.status === 405) {
        return normaliseCart(await api(path, { method: "POST", body: payload }));
      }
      throw error;
    }
  }

  const classify = (error) => {
    if (error?.status === 401 || error?.status === 403) return "session_expired";
    if (error?.status === 409) return "version_conflict";
    if (error?.status === 404) return "unavailable";
    if (error?.status === 422 || error?.status === 400) return "rejected";
    return "failed";
  };

  // --------------------------------------------------------------- adapter
  const MercadonaAdapter = {
    isOnMercadona: () => location.origin === ORIGIN,
    getSessionStatus: async () => sessionStatus(),
    getCart,

    async addProduct(productId, quantity) {
      return this.setQuantity(productId, quantity);
    },

    async setQuantity(productId, quantity) {
      let cart = await getCart();
      try {
        cart = await writeLine(productId, quantity, cart.version);
      } catch (error) {
        if (classify(error) !== "version_conflict") throw error;
        // Retry once against the freshest cart version.
        const fresh = await getCart();
        cart = await writeLine(productId, quantity, fresh.version);
      }
      return cart;
    },

    async removeProduct(productId) {
      return this.setQuantity(productId, 0);
    },

    /**
     * items: [{ productId, quantity, requestedIngredient }]
     * Sets the FINAL quantity per product, so re-running never doubles a line.
     */
    async populateCart(items, emit) {
      const result = { success: true, added: [], updated: [], unavailable: [], failed: [] };
      const session = sessionStatus();
      emit?.({ phase: "checking_session", session });
      if (!session.signedIn) {
        return { ...result, success: false, sessionFailed: true, error: "No active Mercadona session." };
      }

      let cart;
      try {
        cart = await getCart();
      } catch (error) {
        return {
          ...result,
          success: false,
          sessionFailed: classify(error) === "session_expired",
          error: error.message,
        };
      }

      const existing = new Map(cart.lines.map((l) => [l.productId, l.quantity]));

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const productId = String(item.productId);
        emit?.({ phase: "adding", index: i, total: items.length, productId, item });

        try {
          let product = null;
          try {
            product = await getProduct(productId);
          } catch (error) {
            if (classify(error) === "unavailable") {
              result.unavailable.push({ ...item, reason: "Product not available in your store." });
              continue;
            }
            throw error;
          }
          const unavailable =
            product?.unavailable_from ||
            product?.status === "unavailable" ||
            product?.is_available === false;
          if (unavailable) {
            result.unavailable.push({ ...item, reason: "Product not available in your store." });
            emit?.({ phase: "item", productId, state: "unavailable", index: i });
            continue;
          }

          const had = existing.get(productId) ?? 0;
          const quantity = Math.max(0, Number(item.quantity) || 0);
          if (had === quantity) {
            result.updated.push({ ...item, from: had, to: quantity, unchanged: true });
            emit?.({ phase: "item", productId, state: "added", index: i });
            continue;
          }

          cart = await MercadonaAdapter.setQuantity(productId, quantity);
          existing.set(productId, quantity);
          (had > 0 ? result.updated : result.added).push({ ...item, from: had, to: quantity });
          emit?.({ phase: "item", productId, state: had > 0 ? "updated" : "added", index: i });
        } catch (error) {
          const kind = classify(error);
          if (kind === "session_expired") {
            return { ...result, success: false, sessionFailed: true, error: error.message };
          }
          result.failed.push({ ...item, reason: error.message, kind, detail: error.data ?? null });
          result.success = false;
          emit?.({ phase: "item", productId, state: "failed", index: i, message: error.message });
        }
      }

      let finalCart = null;
      try {
        finalCart = await getCart();
      } catch {
        finalCart = cart;
      }
      emit?.({ phase: "complete" });
      return { ...result, cart: finalCart };
    },

    /** Read-only spike output. Contains no tokens — only shapes and paths. */
    async diagnostics() {
      const session = sessionStatus();
      let cart = null;
      let cartError = null;
      try {
        cart = await getCart();
      } catch (error) {
        cartError = { message: error.message, status: error.status ?? null };
      }
      return {
        session: { ...session, user: undefined },
        cartPath,
        cartVersion: cart?.version ?? null,
        cartLines: cart?.lines?.length ?? null,
        cartError,
        observedApiCalls: observed.map((o) => ({
          path: (() => {
            try {
              return new URL(o.url, ORIGIN).pathname;
            } catch {
              return o.url;
            }
          })(),
          method: o.method,
          status: o.status,
          headerKeys: Object.keys(o.headers ?? {}),
        })),
      };
    },
  };

  window.__MESA_MERCADONA_ADAPTER__ = MercadonaAdapter;

  // ------------------------------------------------- bridge to content script
  window.addEventListener("message", async (event) => {
    if (event.source !== window) return;
    const msg = event.data;
    if (!msg || msg.channel !== CHANNEL_REQ) return;

    const reply = (payload) =>
      window.postMessage({ channel: CHANNEL_RES, id: msg.id, ...payload }, ORIGIN);

    const emit = (progress) =>
      window.postMessage({ channel: CHANNEL_RES, id: msg.id, progress }, ORIGIN);

    try {
      const { method, args = [] } = msg;
      const fn = MercadonaAdapter[method];
      if (typeof fn !== "function") throw new Error(`Unknown adapter method: ${method}`);
      const value =
        method === "populateCart"
          ? await MercadonaAdapter.populateCart(args[0] ?? [], emit)
          : await fn.apply(MercadonaAdapter, args);
      reply({ ok: true, value });
    } catch (error) {
      reply({ ok: false, error: { message: String(error?.message ?? error), status: error?.status ?? null } });
    }
  });

  window.postMessage({ channel: CHANNEL_RES, ready: true }, ORIGIN);
})();
