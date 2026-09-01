import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Toggle, n as Button, o as Field, r as Card, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { b as Plus, c as Trash2 } from "../_libs/lucide-react.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { b as useStore, n as CATEGORY_ORDER, t as CATEGORY_LABELS } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staples-B07zDU-G.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var UNITS = [
	"unit",
	"pack",
	"g",
	"kg",
	"ml",
	"l"
];
function StaplesPage() {
	const { staples, setStaples } = useStore();
	const [name, setName] = (0, import_react.useState)("");
	const update = (id, patch) => setStaples(staples.map((s) => s.id === id ? {
		...s,
		...patch
	} : s));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, {
		title: "Staples",
		subtitle: "Always-on items. Active staples join every generated shopping list.",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Add a staple, e.g. Olive oil"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					disabled: !name.trim(),
					onClick: () => {
						setStaples([...staples, {
							id: `staple_${Date.now()}`,
							name: name.trim(),
							category: "other",
							quantity: 1,
							unit: "unit",
							active: true
						}]);
						setName("");
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add"]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: staples.map((staple) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "w-full bg-transparent text-base font-semibold outline-none",
								value: staple.name,
								onChange: (e) => update(staple.id, { name: e.target.value }),
								"aria-label": "Staple name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Category",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm",
											value: staple.category,
											onChange: (e) => update(staple.id, { category: e.target.value }),
											children: CATEGORY_ORDER.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: c,
												children: CATEGORY_LABELS[c]
											}, c))
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Preferred quantity",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
											type: "number",
											min: 0,
											value: staple.quantity,
											onChange: (e) => update(staple.id, { quantity: Number(e.target.value) || 0 })
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Unit",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
											className: "w-full rounded-xl border border-border bg-card px-3 py-2 text-sm",
											value: staple.unit,
											onChange: (e) => update(staple.id, { unit: e.target.value }),
											children: UNITS.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: u,
												children: u
											}, u))
										})
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
									label: "Notes",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
										value: staple.notes ?? "",
										onChange: (e) => update(staple.id, { notes: e.target.value }),
										placeholder: "Optional"
									})
								})
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-end gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
							checked: staple.active,
							onChange: (active) => update(staple.id, { active })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "danger",
							"aria-label": `Delete ${staple.name}`,
							onClick: () => setStaples(staples.filter((s) => s.id !== staple.id)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
						})]
					})]
				})
			}, staple.id))
		})]
	});
}
//#endregion
export { StaplesPage as component };
