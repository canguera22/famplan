import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as EmptyState, d as Toggle, i as Chip, n as Button, o as Field, r as Card, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { P as CircleCheck, b as Plus, c as Trash2, o as Undo2 } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { b as useStore, d as formatQty, m as listTotals, n as CATEGORY_ORDER, t as CATEGORY_LABELS, u as formatEuro, v as shortDay } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/shopping.index-X09oEfI2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ShoppingPage() {
	const store = useStore();
	const navigate = useNavigate();
	const list = store.list;
	if (!list) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Shopping",
		subtitle: "Your consolidated basket appears once meals are approved.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "No shopping list yet",
			body: "Approve a weekly meal plan and every ingredient will be consolidated here, together with your active staples.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/meals",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "Go to meals" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 text-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/shopping/mercadona",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					children: "Mercadona basket & extension setup"
				})
			})
		})]
	});
	const totals = listTotals(list);
	const mealItems = list.items.filter((i) => i.source !== "staple");
	const stapleItems = list.items.filter((i) => i.source === "staple");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Shopping list",
		subtitle: "Everything for the approved week, in one basket.",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/shopping/mercadona",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "sm",
						children: "Mercadona basket & extension setup"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Grocery products"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-semibold mt-1",
							children: totals.products
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Distinct items"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-2xl font-semibold mt-1",
							children: totals.lines
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Estimated cost"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-semibold mt-1",
								children: formatEuro(totals.cost)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[0.7rem] text-muted-foreground mt-0.5",
								children: "Placeholder pricing"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-6 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "From your meals"
				}), CATEGORY_ORDER.map((category) => {
					const items = mealItems.filter((i) => i.category === category);
					if (!items.length) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryBlock, {
						category,
						items
					}, category);
				})]
			}),
			stapleItems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-8 space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Household staples"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Added automatically from your active staples."
				})] }), CATEGORY_ORDER.map((category) => {
					const items = stapleItems.filter((i) => i.category === category);
					if (!items.length) return null;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryBlock, {
						category,
						items
					}, category);
				})]
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AddManualItem, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "lg",
					onClick: () => {
						store.approveList();
						navigate({ to: "/shopping/review" });
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Approve shopping list"]
				})
			})
		]
	});
}
function CategoryBlock({ category, items }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "p-0 overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-b border-border px-5 py-3",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: CATEGORY_LABELS[category]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ItemRow, { item }, item.id))
		})]
	});
}
function ItemRow({ item }) {
	const { updateItem } = useStore();
	const reused = item.usages.length > 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: `px-5 py-4 ${item.removed ? "opacity-50" : ""}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: item.name
							}),
							reused ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
								tone: "shared",
								children: ["Reused ×", item.usages.length]
							}) : null,
							item.pantry ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: "Pantry" }) : null,
							item.source === "manual" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: "Added" }) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: [
							"Need ",
							formatQty(item.requiredQuantity, item.unit),
							" · Buy ",
							item.purchaseLabel,
							" ·",
							" ",
							formatEuro(item.estimatedPrice)
						]
					}),
					item.usages.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-1.5",
						children: item.usages.map((u) => `${shortDay(u.date)} ${u.groupId === "kids" ? "kids" : "adult"}: ${u.recipeName}`).join(" · ")
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 shrink-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "number",
					min: 0,
					step: "any",
					"aria-label": `Quantity for ${item.name}`,
					className: "w-20 rounded-lg border border-border bg-card px-2 py-1.5 text-sm",
					value: Math.round(item.requiredQuantity * 100) / 100,
					onChange: (e) => updateItem(item.id, { requiredQuantity: Number(e.target.value) || 0 })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: item.removed ? "secondary" : "danger",
					onClick: () => updateItem(item.id, { removed: !item.removed }),
					"aria-label": item.removed ? "Restore item" : "Remove item",
					children: item.removed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "mt-3 flex items-center gap-2.5 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
				checked: item.pantry,
				onChange: (pantry) => updateItem(item.id, { pantry })
			}), "Already in the pantry"]
		})]
	});
}
function AddManualItem() {
	const { addManualItem } = useStore();
	const [name, setName] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("other");
	const [quantity, setQuantity] = (0, import_react.useState)(1);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
		className: "mt-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold mb-3",
			children: "Add an item"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Name",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						value: name,
						onChange: (e) => setName(e.target.value),
						placeholder: "Olive oil"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Category",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						className: "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm",
						value: category,
						onChange: (e) => setCategory(e.target.value),
						children: CATEGORY_ORDER.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c,
							children: CATEGORY_LABELS[c]
						}, c))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "Quantity",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
						type: "number",
						min: 1,
						value: quantity,
						onChange: (e) => setQuantity(Number(e.target.value) || 1)
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: !name.trim(),
					onClick: () => {
						addManualItem({
							name: name.trim(),
							category,
							requiredQuantity: quantity,
							unit: "unit"
						});
						setName("");
						setQuantity(1);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add"]
				})
			]
		})]
	});
}
//#endregion
export { ShoppingPage as component };
