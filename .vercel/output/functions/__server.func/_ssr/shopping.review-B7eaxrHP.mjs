import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as EmptyState, i as Chip, n as Button, r as Card } from "./ui-kit-DfxQ38YT.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { W as ArrowRight, p as ShoppingBasket } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { b as useStore, d as formatQty, m as listTotals, n as CATEGORY_ORDER, t as CATEGORY_LABELS, u as formatEuro } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shopping.review-B7eaxrHP.js
var import_jsx_runtime = require_jsx_runtime();
function ReviewPage() {
	const store = useStore();
	const navigate = useNavigate();
	const list = store.list;
	if (!list?.approved) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Final review",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Nothing approved yet",
			body: "Approve your shopping list first and the final basket will be summarised here.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/shopping",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Go to shopping list" })
			})
		})
	});
	const totals = listTotals(list);
	const active = list.items.filter((i) => !i.removed && !i.pantry);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Final basket",
		subtitle: "Approved and ready. Nothing is ordered automatically.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-adults-soft p-2.5 text-adults",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingBasket, { className: "h-5 w-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-semibold",
					children: [
						totals.products,
						" products · ",
						formatEuro(totals.cost),
						" estimated"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Next: match these ingredients to real Mercadona products. You always check out yourself."
				})] })]
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-4",
				children: CATEGORY_ORDER.map((category) => {
					const items = active.filter((i) => i.category === category);
					if (!items.length) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-0 overflow-hidden",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-b border-border px-5 py-3 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: CATEGORY_LABELS[category]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: items.length })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-border",
							children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 px-5 py-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm font-medium",
									children: item.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-muted-foreground",
									children: [
										item.purchaseLabel,
										" · ",
										formatQty(item.requiredQuantity, item.unit)
									]
								})]
							}, item.id))
						})]
					}, category);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					onClick: () => {
						store.matchProducts();
						navigate({ to: "/shopping/mercadona" });
					},
					children: ["Match Mercadona products ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: "You review every proposed product before anything reaches your Mercadona cart."
				})]
			})
		]
	});
}
//#endregion
export { ReviewPage as component };
