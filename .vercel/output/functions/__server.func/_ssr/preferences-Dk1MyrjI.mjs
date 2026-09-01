import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as SectionTitle, o as Field, r as Card, s as OptionRow, u as TextInput } from "./ui-kit-DfxQ38YT.mjs";
import { t as AppShell } from "./AppShell-BMEvEt1i.mjs";
import { b as useStore } from "./store-C31UwfQs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/preferences-Dk1MyrjI.js
var import_jsx_runtime = require_jsx_runtime();
var listToText = (list) => list.join(", ");
var textToList = (text) => text.split(",").map((t) => t.trim()).filter(Boolean);
function PreferencesPage() {
	const { preferences, setPreferences, household } = useStore();
	const setGroup = (groupId, patch) => setPreferences({
		...preferences,
		groups: preferences.groups.map((g) => g.groupId === groupId ? {
			...g,
			...patch
		} : g)
	});
	const setShared = (patch) => setPreferences({
		...preferences,
		...patch
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		title: "Preferences",
		subtitle: "The planner keeps these in mind every time it generates.",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [household.groups.map((group) => {
				const prefs = preferences.groups.find((g) => g.groupId === group.id);
				if (!prefs) return null;
				const isKids = group.id === "kids";
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
					title: `${group.name} preferences`,
					subtitle: `${group.memberCount} people in this group`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Foods we like",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: listToText(prefs.likes),
								onChange: (e) => setGroup(group.id, { likes: textToList(e.target.value) })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Foods we dislike",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: listToText(prefs.dislikes),
								onChange: (e) => setGroup(group.id, { dislikes: textToList(e.target.value) })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Dietary restrictions",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: listToText(prefs.restrictions),
								onChange: (e) => setGroup(group.id, { restrictions: textToList(e.target.value) })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Preferred proteins",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: listToText(prefs.proteins),
								onChange: (e) => setGroup(group.id, { proteins: textToList(e.target.value) })
							})
						}),
						isKids ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Currently being introduced",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: listToText(prefs.introducing),
								onChange: (e) => setGroup(group.id, { introducing: textToList(e.target.value) })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Preferred vegetables",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: listToText(prefs.vegetables),
								onChange: (e) => setGroup(group.id, { vegetables: textToList(e.target.value) })
							})
						})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Preferred cuisines",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
								value: listToText(prefs.cuisines),
								onChange: (e) => setGroup(group.id, { cuisines: textToList(e.target.value) })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Maximum cooking time",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
								value: prefs.maxMinutes,
								onChange: (maxMinutes) => setGroup(group.id, { maxMinutes }),
								options: [
									20,
									30,
									45,
									60
								].map((n) => ({
									value: n,
									label: `${n} min`
								}))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: isKids ? "Maximum complexity" : "Desired variety",
							children: isKids ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
								value: prefs.maxComplexity,
								onChange: (maxComplexity) => setGroup(group.id, { maxComplexity }),
								options: [
									{
										value: 1,
										label: "Very simple"
									},
									{
										value: 2,
										label: "Moderate"
									},
									{
										value: 3,
										label: "Anything"
									}
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
								value: prefs.variety,
								onChange: (variety) => setGroup(group.id, { variety }),
								options: [
									1,
									2,
									3,
									4,
									5
								].map((n) => ({
									value: n,
									label: String(n)
								}))
							})
						})
					]
				})] }, group.id);
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionTitle, {
				title: "Shared household",
				subtitle: "Budget, reuse and weekly balance."
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Weekly grocery budget target (€)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextInput, {
							type: "number",
							min: 0,
							value: preferences.budget,
							onChange: (e) => setShared({ budget: Number(e.target.value) || 0 })
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Ingredient reuse priority",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
							value: preferences.reusePriority,
							onChange: (reusePriority) => setShared({ reusePriority }),
							options: [
								1,
								2,
								3,
								4,
								5
							].map((n) => ({
								value: n,
								label: String(n)
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Food waste reduction priority",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
							value: preferences.wastePriority,
							onChange: (wastePriority) => setShared({ wastePriority }),
							options: [
								1,
								2,
								3,
								4,
								5
							].map((n) => ({
								value: n,
								label: String(n)
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Preferred fish meals per week",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
							value: preferences.fishMeals,
							onChange: (fishMeals) => setShared({ fishMeals }),
							options: [
								0,
								1,
								2,
								3
							].map((n) => ({
								value: n,
								label: String(n)
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Preferred vegetarian meals per week",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OptionRow, {
							value: preferences.vegetarianMeals,
							onChange: (vegetarianMeals) => setShared({ vegetarianMeals }),
							options: [
								0,
								1,
								2,
								3
							].map((n) => ({
								value: n,
								label: String(n)
							}))
						})
					})
				]
			})] })]
		})
	});
}
//#endregion
export { PreferencesPage as component };
