import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as EmptyState, f as cn, i as Chip, n as Button, r as Card, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as LoaderCircle, _ as Search, b as Plus, c as Trash2, k as ExternalLink, l as Star, m as ShoppingCart, s as TriangleAlert, t as X, x as Minus, z as Check } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { _ as searchProducts, b as useStore, c as cartTotals, d as formatQty, g as productById, h as packagesFor, i as MERCADONA, p as lineTotal, s as candidatesFor, u as formatEuro, v as shortDay } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shopping.mercadona-BQVGunmW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Catalog images are not available in mock mode, so we render a tinted tile. */
function ProductThumb({ product, className }) {
	if (product?.imageUrl) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: product.imageUrl,
		alt: product.name,
		loading: "lazy",
		className: cn("h-14 w-14 rounded-xl object-cover", className)
	});
	const initials = (product?.name ?? "?").split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground", className),
		children: initials
	});
}
/**
* Web-app side of the Mesa Chrome extension bridge.
*
* Everything Mercadona-authenticated happens inside the user's browser: this
* module only exchanges product ids and quantities with the extension. No
* Mercadona token, cookie or credential is ever read here or sent anywhere.
*/
var EXTENSION_ID_KEY = "mesa.extensionId";
var CART_MODE_KEY = "mesa.cartMode";
function runtime() {
	const chrome = globalThis.chrome;
	return chrome?.runtime?.sendMessage ? chrome.runtime : null;
}
function getCartMode() {
	if (typeof window === "undefined") return "simulation";
	return window.localStorage.getItem("mesa.cartMode") === "live" ? "live" : "simulation";
}
function setCartMode(mode) {
	window.localStorage.setItem(CART_MODE_KEY, mode);
}
function getExtensionId() {
	if (typeof window === "undefined") return "";
	return window.localStorage.getItem("mesa.extensionId") ?? "";
}
function setExtensionId(id) {
	window.localStorage.setItem(EXTENSION_ID_KEY, id.trim());
}
var ExtensionUnavailableError = class extends Error {};
function requireBridge() {
	const chrome = runtime();
	const id = getExtensionId();
	if (!chrome) throw new ExtensionUnavailableError("Chrome extension messaging is not available in this browser.");
	if (!id) throw new ExtensionUnavailableError("Set the Mesa extension ID first (Developer tools below).");
	return {
		chrome,
		id
	};
}
/** One-shot request (ping, session, cart, diagnostics, single-product test). */
function sendToExtension(message) {
	const { chrome, id } = requireBridge();
	return new Promise((resolve, reject) => {
		chrome.sendMessage(id, message, (res) => {
			const err = globalThis.chrome?.runtime?.lastError;
			if (err) return reject(new ExtensionUnavailableError(err.message ?? "Extension not reachable."));
			if (!res) return reject(new ExtensionUnavailableError("No response from the Mesa extension."));
			if (res.ok === false) return reject(new Error(res.error ?? "Extension call failed."));
			resolve(res.value ?? res);
		});
	});
}
/** Long-lived request that streams progress while the cart is populated. */
function streamToExtension(message, onProgress) {
	const { chrome, id } = requireBridge();
	return new Promise((resolve, reject) => {
		let port;
		try {
			port = chrome.connect(id);
		} catch (error) {
			reject(new ExtensionUnavailableError(String(error.message)));
			return;
		}
		const requestId = `req-${Date.now()}`;
		let settled = false;
		port.onMessage.addListener((msg) => {
			if (msg?.type === "MERCADONA_PROGRESS") {
				if (msg.phase === "connected") {
					port.postMessage({
						...message,
						requestId
					});
					onProgress({ phase: "connecting" });
					return;
				}
				onProgress(msg);
				return;
			}
			if (msg?.type === "MERCADONA_RESULT" && msg.requestId === requestId) {
				settled = true;
				port.disconnect();
				if (msg.ok) resolve(msg.value);
				else reject(new Error(msg.error ?? "Mercadona cart update failed."));
			}
		});
		port.onDisconnect.addListener(() => {
			if (!settled) reject(new ExtensionUnavailableError("The Mesa extension disconnected."));
		});
	});
}
var extensionApi = {
	ping: () => sendToExtension({ type: "mesa:ping" }),
	sessionStatus: () => sendToExtension({ type: "GET_SESSION_STATUS" }),
	cart: () => sendToExtension({ type: "GET_CART" }),
	diagnostics: () => sendToExtension({ type: "DIAGNOSTICS" }),
	removeProduct: (productId) => sendToExtension({
		type: "REMOVE_PRODUCT",
		productId
	}),
	testSingleProduct: (productId, quantity = 1) => sendToExtension({
		type: "TEST_SINGLE_PRODUCT",
		productId,
		quantity
	}),
	populateCart: (items, onProgress) => streamToExtension({
		type: "POPULATE_MERCADONA_CART",
		items
	}, onProgress)
};
var CartIntegrationError = class extends Error {};
var wait = (ms) => new Promise((r) => setTimeout(r, ms));
/**
* Mercadona implementation.
*
* SIMULATION MODE: until the Chrome extension exists this class fakes the
* transport so the whole UX is testable. No Mercadona DOM selectors, endpoints
* or undocumented APIs are assumed anywhere — see browser-extension/README.md.
*/
var MercadonaCartIntegration = class {
	retailerId = "mercadona";
	/** Flip to false once a real extension bridge is connected. */
	simulated = true;
	status = null;
	prepareCart(cart) {
		const missing = cart.lines.filter((l) => !l.retailerProductId);
		if (missing.length) throw new CartIntegrationError(`${missing.length} ingredient(s) still need a Mercadona product match.`);
		return {
			retailer: this.retailerId,
			cartId: cart.id,
			products: cart.lines.map((line) => {
				const product = productById(line.retailerProductId);
				return {
					retailerProductId: product.retailerProductId,
					name: product.name,
					quantity: line.quantity,
					productUrl: product.productUrl
				};
			})
		};
	}
	async sendCart(payload, onStatus) {
		const estimatedTotal = this.estimate(payload);
		const products = payload.products.map((p) => ({
			retailerProductId: p.retailerProductId,
			name: p.name,
			quantity: p.quantity,
			state: "pending"
		}));
		this.emit({
			cartId: payload.cartId,
			phase: "connecting",
			products,
			estimatedTotal
		}, onStatus);
		await wait(900);
		const failIndex = products.length > 3 ? Math.floor(products.length / 2) : -1;
		for (let i = 0; i < products.length; i++) {
			products[i].state = "adding";
			this.emit({
				cartId: payload.cartId,
				phase: "adding",
				products,
				estimatedTotal
			}, onStatus);
			await wait(260);
			if (i === failIndex) {
				products[i].state = "failed";
				products[i].message = "Product unavailable in your Mercadona store (simulated).";
			} else products[i].state = "added";
			this.emit({
				cartId: payload.cartId,
				phase: "adding",
				products,
				estimatedTotal
			}, onStatus);
		}
		return this.emit({
			cartId: payload.cartId,
			phase: "complete",
			products,
			estimatedTotal
		}, onStatus);
	}
	receiveCartStatus() {
		return this.status;
	}
	async handleProductFailure(retailerProductId, action, onStatus) {
		const current = this.status;
		if (!current) throw new CartIntegrationError("No cart in progress.");
		const products = current.products.map((p) => ({ ...p }));
		const target = products.find((p) => p.retailerProductId === retailerProductId);
		if (!target) return current;
		if (action === "skip") {
			target.state = "skipped";
			target.message = void 0;
			return this.emit({
				...current,
				products
			}, onStatus);
		}
		target.state = "adding";
		target.message = void 0;
		this.emit({
			...current,
			phase: "adding",
			products
		}, onStatus);
		await wait(700);
		target.state = "added";
		return this.emit({
			...current,
			phase: "complete",
			products
		}, onStatus);
	}
	handleSessionFailure() {
		const base = this.status;
		const next = {
			cartId: base?.cartId ?? "unknown",
			phase: "session_failed",
			products: base?.products ?? [],
			estimatedTotal: base?.estimatedTotal ?? 0,
			message: "You are not signed in to Mercadona. Sign in in your browser and try again."
		};
		this.status = next;
		return next;
	}
	estimate(payload) {
		const total = payload.products.reduce((n, p) => {
			const product = productById(p.retailerProductId);
			return n + (product ? product.price * p.quantity : 0);
		}, 0);
		return Math.round(total * 100) / 100;
	}
	emit(status, onStatus) {
		const snapshot = {
			...status,
			products: status.products.map((p) => ({ ...p }))
		};
		this.status = snapshot;
		onStatus(snapshot);
		return snapshot;
	}
};
var mercadonaIntegration = new MercadonaCartIntegration();
/**
* LIVE MODE: hands the payload to the Mesa Chrome extension, which talks to
* Mercadona's own cart API from inside the user's authenticated tab. The app
* never sees a Mercadona token; only product ids and quantities cross over.
*/
var ExtensionCartIntegration = class {
	retailerId = "mercadona";
	simulated = false;
	status = null;
	prepareCart(cart) {
		return mercadonaIntegration.prepareCart(cart);
	}
	async sendCart(payload, onStatus) {
		const estimatedTotal = payload.products.reduce((n, p) => {
			const product = productById(p.retailerProductId);
			return n + (product ? product.price * p.quantity : 0);
		}, 0);
		const products = payload.products.map((p) => ({
			retailerProductId: p.retailerProductId,
			name: p.name,
			quantity: p.quantity,
			state: "pending"
		}));
		const emit = (patch) => {
			const next = {
				cartId: payload.cartId,
				phase: "adding",
				estimatedTotal: Math.round(estimatedTotal * 100) / 100,
				...this.status,
				...patch,
				products: products.map((p) => ({ ...p }))
			};
			this.status = next;
			onStatus(next);
			return next;
		};
		emit({
			phase: "connecting",
			message: "Connecting to Mercadona…"
		});
		try {
			const result = await extensionApi.populateCart(payload.products.map((p) => ({
				productId: p.retailerProductId,
				quantity: p.quantity,
				requestedIngredient: p.name
			})), (progress) => {
				if (progress.phase === "checking_session") {
					emit({
						phase: "connecting",
						message: "Checking your Mercadona session…"
					});
					return;
				}
				if (progress.phase === "adding" && typeof progress.index === "number") {
					const target = products[progress.index];
					if (target) target.state = "adding";
					emit({
						phase: "adding",
						message: `Adding ${progress.index + 1} of ${progress.total ?? products.length} products…`
					});
					return;
				}
				if (progress.phase === "item" && progress.productId) {
					const target = products.find((p) => p.retailerProductId === progress.productId);
					if (target) {
						target.state = progress.state === "updated" ? "added" : progress.state === "unavailable" ? "failed" : progress.state ?? "added";
						target.message = progress.state === "unavailable" ? "Not available in your Mercadona store." : progress.message ?? void 0;
					}
					emit({ phase: "adding" });
				}
			});
			if (result.sessionFailed) return this.handleSessionFailure(onStatus);
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
			for (const item of [...result.added ?? [], ...result.updated ?? []]) {
				const target = products.find((p) => p.retailerProductId === String(item.productId));
				if (target && target.state !== "failed") {
					target.state = "added";
					target.message = void 0;
				}
			}
			return emit({
				phase: "complete",
				message: "Cart ready for review on Mercadona."
			});
		} catch (error) {
			const message = error instanceof Error ? error.message : "Mercadona cart update failed.";
			if (/session|sign in|not logged/i.test(message)) return this.handleSessionFailure(onStatus);
			const next = emit({
				phase: "complete",
				message
			});
			throw new CartIntegrationError(message + " (partial state shown: " + next.products.length + " products)");
		}
	}
	receiveCartStatus() {
		return this.status;
	}
	async handleProductFailure(retailerProductId, action, onStatus) {
		const current = this.status;
		if (!current) throw new CartIntegrationError("No cart in progress.");
		const products = current.products.map((p) => ({ ...p }));
		const target = products.find((p) => p.retailerProductId === retailerProductId);
		if (!target) return current;
		if (action === "skip") {
			target.state = "skipped";
			target.message = void 0;
			const next = {
				...current,
				products
			};
			this.status = next;
			onStatus(next);
			return next;
		}
		target.state = "adding";
		target.message = void 0;
		this.status = {
			...current,
			products
		};
		onStatus(this.status);
		try {
			const result = await extensionApi.populateCart([{
				productId: retailerProductId,
				quantity: target.quantity,
				requestedIngredient: target.name
			}], () => {});
			const failed = [...result.failed ?? [], ...result.unavailable ?? []][0];
			target.state = failed ? "failed" : "added";
			target.message = failed?.reason;
		} catch (error) {
			target.state = "failed";
			target.message = error instanceof Error ? error.message : "Retry failed.";
		}
		const next = {
			...current,
			phase: "complete",
			products
		};
		this.status = next;
		onStatus(next);
		return next;
	}
	handleSessionFailure(onStatus) {
		const base = this.status;
		const next = {
			cartId: base?.cartId ?? "unknown",
			phase: "session_failed",
			products: base?.products ?? [],
			estimatedTotal: base?.estimatedTotal ?? 0,
			message: "You are not signed in to Mercadona. Sign in in your browser tab and try again."
		};
		this.status = next;
		onStatus?.(next);
		return next;
	}
};
var extensionIntegration = new ExtensionCartIntegration();
/** Simulation stays available as a fallback/debug mode. */
function getCartIntegration(mode) {
	return mode === "live" ? extensionIntegration : mercadonaIntegration;
}
function MercadonaPage() {
	const store = useStore();
	const cart = store.cart;
	const [changing, setChanging] = (0, import_react.useState)(null);
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	const [status, setStatus] = (0, import_react.useState)(() => mercadonaIntegration.receiveCartStatus());
	const [error, setError] = (0, import_react.useState)(null);
	const [mode, setMode] = (0, import_react.useState)("simulation");
	(0, import_react.useEffect)(() => setMode(getCartMode()), []);
	const integration = getCartIntegration(mode);
	const live = mode === "live";
	const totals = (0, import_react.useMemo)(() => cart ? cartTotals(cart) : null, [cart]);
	if (!cart || !totals) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Your Mercadona Basket",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No products matched yet",
			body: "Approve your shopping list first, then match it to Mercadona products.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/shopping",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Go to shopping list" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExtensionPanel, {
			mode,
			onMode: (next) => {
				setCartMode(next);
				setMode(next);
			}
		})]
	});
	if (status && status.phase !== "idle") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Adding to Mercadona",
		subtitle: live ? "Your cart is being updated in your Mercadona tab. No purchase is made." : "Simulation mode — no purchase is made.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgressView, {
			status,
			live,
			onStatus: setStatus,
			onClose: () => setStatus(null)
		})
	});
	const mealLines = cart.lines.filter((l) => l.source !== "staple");
	const stapleLines = cart.lines.filter((l) => l.source === "staple");
	const ready = Boolean(store.plan?.approved) && Boolean(store.list?.approved) && totals.unmatched === 0 && cart.reviewed;
	const start = async () => {
		setConfirming(false);
		setError(null);
		try {
			const payload = integration.prepareCart(cart);
			const initial = {
				cartId: cart.id,
				phase: "connecting",
				products: [],
				estimatedTotal: totals.total
			};
			setStatus(initial);
			await integration.sendCart(payload, setStatus);
		} catch (e) {
			setStatus(null);
			setError(e instanceof CartIntegrationError || e instanceof Error ? e.message : "Could not start the hand-off.");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Your Mercadona Basket",
		subtitle: "Exact products for your approved week. Nothing is added until you say so.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-secondary/60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Estimated basket total"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-3xl font-semibold mt-0.5",
						children: formatEuro(totals.total)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: live ? "Live Mercadona cart" : "Simulation mode" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Products",
							value: String(totals.products)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Meal ingredients",
							value: formatEuro(totals.mealsTotal)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
							label: "Household staples",
							value: formatEuro(totals.staplesTotal)
						})
					]
				})]
			}),
			totals.unmatched > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-4 border-destructive/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-destructive shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-semibold",
						children: [
							totals.unmatched,
							" item",
							totals.unmatched > 1 ? "s need" : " needs",
							" a product match"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: "We will not guess a low-confidence product. Pick the Mercadona product yourself and we will remember it next week."
					})] })]
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "From your meals"
				}), mealLines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductLineCard, {
					line,
					onChange: () => setChanging(line)
				}, line.id))]
			}),
			stapleLines.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Household staples"
				}), stapleLines.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductLineCard, {
					line,
					onChange: () => setChanging(line)
				}, line.id))]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddProductPanel, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex items-start gap-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: "mt-0.5 h-4 w-4",
						checked: cart.reviewed,
						onChange: () => store.markCartReviewed(),
						disabled: cart.reviewed
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "I have reviewed every proposed product, its package size and quantity." })]
				})
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-destructive",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					disabled: !ready,
					onClick: () => setConfirming(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }), " Add to Mercadona"]
				}), !ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "Available once the meal plan and shopping list are approved, every item has a product and you have confirmed the review above."
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExtensionPanel, {
				mode,
				onMode: (next) => {
					setCartMode(next);
					setMode(next);
				}
			}),
			changing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChangeProductModal, {
				line: changing,
				onClose: () => setChanging(null)
			}) : null,
			confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
				title: "Ready to add your basket to Mercadona?",
				onClose: () => setConfirming(false),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• Mesa adds the approved products and quantities to your Mercadona cart." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• No purchase is made and no payment information is accessed." }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "• You review and complete the order directly on Mercadona." })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-muted-foreground",
						children: live ? "Mesa sends product ids and quantities to the Mesa extension, which updates the cart inside your own signed-in Mercadona tab. Keep that tab open." : "This build runs in simulation mode until you switch to the live extension below."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "secondary",
							onClick: () => setConfirming(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "flex-1",
							onClick: start,
							children: "Add products"
						})]
					})
				]
			}) : null
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-card px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-lg font-semibold mt-0.5",
			children: value
		})]
	});
}
function ProductLineCard({ line, onChange }) {
	const store = useStore();
	const product = productById(line.retailerProductId);
	const preferred = store.preferredProducts.some((p) => p.ingredientId === line.ingredientId && p.retailerProductId === line.retailerProductId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, { product }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [
					product ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: product.name
								}),
								preferred ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
									tone: "shared",
									children: "Preferred"
								}) : null,
								line.source === "staple" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: "Staple" }) : null
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground mt-0.5",
							children: [
								product.brand,
								" · ",
								formatQty(product.packageSize, product.packageUnit),
								" ·",
								" ",
								formatEuro(product.price),
								" each"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm font-medium mt-1",
							children: [
								line.quantity,
								" package",
								line.quantity === 1 ? "" : "s",
								" —",
								" ",
								formatEuro(lineTotal(line))
							]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: line.ingredientName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							className: "bg-destructive/10 text-destructive",
							children: "Product match needed"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mt-0.5",
						children: [
							"Need ",
							formatQty(line.requiredQuantity, line.unit),
							" — choose a Mercadona product."
						]
					})] }),
					line.ingredientId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted-foreground mt-1.5",
						children: [
							"Fulfils: ",
							line.ingredientName,
							" · need ",
							formatQty(line.requiredQuantity, line.unit)
						]
					}) : null,
					line.usages.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 rounded-xl bg-secondary/60 px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[0.7rem] font-semibold text-muted-foreground",
							children: "Needed for"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-1 space-y-0.5",
							children: line.usages.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-xs text-muted-foreground",
								children: [
									shortDay(u.date),
									" ",
									u.groupId === "kids" ? "Kids" : "Adult",
									" — ",
									u.recipeName
								]
							}, `${u.date}-${u.groupId}`))
						})]
					}) : null
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap items-center gap-2",
			children: [
				product ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 rounded-xl border border-border px-1 py-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Decrease ${product.name}`,
							className: "rounded-lg p-1.5 hover:bg-secondary",
							onClick: () => store.setLineQuantity(line.id, Math.max(1, line.quantity - 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, { className: "h-3.5 w-3.5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "w-6 text-center text-sm font-medium",
							children: line.quantity
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": `Increase ${product.name}`,
							className: "rounded-lg p-1.5 hover:bg-secondary",
							onClick: () => store.setLineQuantity(line.id, line.quantity + 1),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" })
						})
					]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: onChange,
					children: product ? "Change product" : "Find product"
				}),
				product && line.ingredientId && !preferred ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "ghost",
					onClick: () => store.setPreferredProduct(line.ingredientId, product.retailerProductId),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5" }), " Mark preferred"]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "danger",
					onClick: () => store.removeLine(line.id),
					"aria-label": `Remove ${line.ingredientName}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
				})
			]
		})]
	});
}
function ChangeProductModal({ line, onClose }) {
	const store = useStore();
	const [remember, setRemember] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const alternatives = (0, import_react.useMemo)(() => {
		const mapped = candidatesFor(line.ingredientId).map((c) => c.product);
		if (!query.trim() && mapped.length) return mapped;
		return searchProducts(query || line.ingredientName);
	}, [
		line.ingredientId,
		line.ingredientName,
		query
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Modal, {
		title: `Choose a product for ${line.ingredientName}`,
		onClose,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					"Need ",
					formatQty(line.requiredQuantity, line.unit),
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search Mercadona products",
					"aria-label": "Search Mercadona products"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 max-h-72 space-y-2 overflow-y-auto",
				children: [alternatives.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlternativeRow, {
					product,
					required: line.requiredQuantity,
					selected: product.retailerProductId === line.retailerProductId,
					onSelect: () => {
						store.setLineProduct(line.id, product.retailerProductId, remember);
						onClose();
					}
				}, product.retailerProductId)), !alternatives.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "text-sm text-muted-foreground",
					children: "No products found."
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "mt-4 flex items-center gap-2.5 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						className: "h-4 w-4",
						checked: remember,
						onChange: (e) => setRemember(e.target.checked)
					}),
					"Remember this choice for ",
					line.ingredientName
				]
			})
		]
	});
}
function AlternativeRow({ product, required, selected, onSelect }) {
	const packages = packagesFor(required, product);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: onSelect,
		className: `flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${selected ? "border-primary bg-secondary" : "border-border hover:bg-secondary/60"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, {
				product,
				className: "h-10 w-10"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-medium",
					children: product.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block text-xs text-muted-foreground",
					children: [
						product.brand,
						" · ",
						formatQty(product.packageSize, product.packageUnit),
						" ·",
						" ",
						formatEuro(product.price)
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "text-right",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "block text-sm font-medium",
					children: [packages, " pack"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-xs text-muted-foreground",
					children: formatEuro(Math.round(packages * product.price * 100) / 100)
				})]
			})
		]
	}) });
}
function AddProductPanel() {
	const store = useStore();
	const [query, setQuery] = (0, import_react.useState)("");
	const results = (0, import_react.useMemo)(() => query.trim() ? searchProducts(query, 6) : [], [query]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Add another Mercadona product"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: query,
					onChange: (e) => setQuery(e.target.value),
					placeholder: "Search the catalog",
					"aria-label": "Add a Mercadona product"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2",
				children: results.map((product) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProductThumb, {
							product,
							className: "h-10 w-10"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium truncate",
								children: product.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: [
									product.brand,
									" · ",
									formatQty(product.packageSize, product.packageUnit),
									" ·",
									" ",
									formatEuro(product.price)
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => {
								store.addCartProduct(product.retailerProductId);
								setQuery("");
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add"]
						})
					]
				}, product.retailerProductId))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: "Basket edits never change your approved meal plan."
			})
		]
	});
}
function ProgressView({ status, live, onStatus, onClose }) {
	const integration = getCartIntegration(live ? "live" : "simulation");
	const added = status.products.filter((p) => p.state === "added").length;
	const failed = status.products.filter((p) => p.state === "failed");
	const skipped = status.products.filter((p) => p.state === "skipped").length;
	const done = status.phase === "complete" && !status.products.some((p) => p.state === "adding");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-shared-soft p-2.5 text-shared",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5" })
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: status.phase === "session_failed" ? "Sign in to Mercadona" : status.phase === "connecting" ? status.message ?? "Connecting to Mercadona…" : done ? "Your Mercadona cart is ready" : "Adding products to Mercadona…"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: done ? `${added} products added${failed.length ? ` · ${failed.length} could not be added` : ""}${skipped ? ` · ${skipped} skipped` : ""} · Estimated total ${formatEuro(status.estimatedTotal)}` : status.message ?? (live ? "Updating your Mercadona cart — nothing is purchased." : "Simulation mode — nothing is purchased.")
				})] })]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-0 overflow-hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "divide-y divide-border",
					children: status.products.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 px-5 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "w-5 shrink-0 text-center",
								children: p.state === "added" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4 text-shared" }) : p.state === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-destructive" }) : p.state === "adding" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin text-muted-foreground" }) : p.state === "skipped" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "block h-1.5 w-1.5 mx-auto rounded-full bg-border" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium truncate",
									children: p.name
								}), p.message ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive mt-0.5",
									children: p.message
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground mt-0.5",
									children: ["×", p.quantity]
								})]
							}),
							p.state === "failed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "secondary",
									onClick: () => void integration.handleProductFailure(p.retailerProductId, "retry", onStatus),
									children: "Retry"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									onClick: () => void integration.handleProductFailure(p.retailerProductId, "skip", onStatus),
									children: "Skip"
								})]
							}) : null
						]
					}, p.retailerProductId))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2 sm:flex-row",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: MERCADONA.website,
					target: "_blank",
					rel: "noreferrer",
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "lg",
						children: ["Review cart on Mercadona ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "h-4 w-4" })]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: onClose,
					children: "Back to basket"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Delivery, checkout and payment always happen on Mercadona."
			})
		]
	});
}
function Modal({ title, onClose, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-6",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": title,
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-lg rounded-t-3xl bg-card p-5 shadow-xl sm:rounded-3xl",
			onClick: (e) => e.stopPropagation(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-base font-semibold",
					children: title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onClose,
					"aria-label": "Close",
					className: "p-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children
			})]
		})
	});
}
function ExtensionPanel({ mode, onMode }) {
	const [id, setId] = (0, import_react.useState)("");
	const [testId, setTestId] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(null);
	const [output, setOutput] = (0, import_react.useState)(null);
	const [ok, setOk] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => setId(getExtensionId()), []);
	const run = async (label, fn) => {
		setBusy(label);
		setOk(null);
		setOutput(null);
		try {
			const value = await fn();
			setOk(value?.ok !== false);
			setOutput(JSON.stringify(value, null, 2));
		} catch (e) {
			setOk(false);
			setOutput(e instanceof Error ? e.message : String(e));
		} finally {
			setBusy(null);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mt-6 border-dashed",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Mercadona extension (developer)"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: "Live mode talks to Mercadona's own cart API from inside your signed-in tienda.mercadona.es tab. Mesa never sees your Mercadona login, and never checks out."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: mode === "simulation" ? "primary" : "secondary",
					onClick: () => onMode("simulation"),
					children: "Simulation"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: mode === "live" ? "primary" : "secondary",
					onClick: () => onMode("live"),
					children: "Live extension"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-[1fr_auto]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: id,
					onChange: (e) => setId(e.target.value),
					placeholder: "Extension ID from chrome://extensions",
					"aria-label": "Mesa extension ID"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "secondary",
					onClick: () => setExtensionId(id),
					children: "Save ID"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => void run("ping", extensionApi.ping),
						children: "Ping extension"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => void run("session", extensionApi.sessionStatus),
						children: "Check session"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => void run("cart", extensionApi.cart),
						children: "Read cart"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						onClick: () => void run("diag", extensionApi.diagnostics),
						children: "Diagnostics"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid gap-2 sm:grid-cols-[1fr_auto_auto]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: testId,
						onChange: (e) => setTestId(e.target.value),
						placeholder: "Real Mercadona product ID (e.g. 4240)",
						"aria-label": "Test product ID"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => void run("test", () => extensionApi.testSingleProduct(testId.trim(), 1)),
						disabled: !testId.trim() || busy === "test",
						children: "Test 1 product"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "danger",
						onClick: () => void run("remove", () => extensionApi.removeProduct(testId.trim())),
						disabled: !testId.trim(),
						children: "Remove"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: "Open tienda.mercadona.es and sign in first. The test adds one unit, re-reads the cart and verifies the line is present before you switch the weekly basket to live mode."
			}),
			busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					"Running ",
					busy,
					"…"
				]
			}) : null,
			output ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: `mt-3 max-h-64 overflow-auto rounded-xl bg-secondary/60 p-3 text-[0.7rem] ${ok === false ? "text-destructive" : ""}`,
				children: output
			}) : null
		]
	});
}
//#endregion
export { MercadonaPage as component };
