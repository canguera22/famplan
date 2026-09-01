import { r as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-C31UwfQs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_HOUSEHOLD = {
	id: "household_1",
	name: "Our household",
	groups: [{
		id: "adults",
		name: "Adults",
		shortName: "Adults",
		memberCount: 2,
		complexityCeiling: 3,
		order: 0
	}, {
		id: "kids",
		name: "Kids",
		shortName: "Kids",
		memberCount: 2,
		complexityCeiling: 2,
		order: 1
	}]
};
var DEFAULT_OPTIONS = {
	dinnerCount: 5,
	adultEffort: "normal",
	kidsStyle: "normal",
	maxMinutes: 40,
	notes: ""
};
var DEFAULT_PREFERENCES = {
	budget: 120,
	reusePriority: 3,
	wastePriority: 3,
	fishMeals: 2,
	vegetarianMeals: 1,
	groups: [{
		groupId: "adults",
		likes: ["fish", "mexican"],
		dislikes: [],
		introducing: [],
		restrictions: [],
		cuisines: [
			"spanish",
			"italian",
			"asian"
		],
		proteins: ["chicken", "fish"],
		vegetables: [],
		maxMinutes: 45,
		maxComplexity: 3,
		variety: 3
	}, {
		groupId: "kids",
		likes: ["pasta", "chicken"],
		dislikes: ["mushroom"],
		introducing: ["lentils", "broccoli"],
		restrictions: [],
		cuisines: [],
		proteins: ["chicken", "fish"],
		vegetables: [
			"peas",
			"carrot",
			"sweetcorn"
		],
		maxMinutes: 30,
		maxComplexity: 2,
		variety: 2
	}]
};
var DEFAULT_STAPLES = [
	{
		id: "milk",
		name: "Milk",
		category: "dairy",
		quantity: 6,
		unit: "l",
		active: true
	},
	{
		id: "yogurt",
		name: "Natural yogurt",
		category: "dairy",
		quantity: 8,
		unit: "unit",
		active: true
	},
	{
		id: "banana",
		name: "Bananas",
		category: "produce",
		quantity: 1500,
		unit: "g",
		active: true
	},
	{
		id: "apple",
		name: "Apples",
		category: "produce",
		quantity: 1500,
		unit: "g",
		active: true
	},
	{
		id: "bread",
		name: "Bread loaf",
		category: "bakery",
		quantity: 3,
		unit: "unit",
		active: true
	},
	{
		id: "eggs",
		name: "Eggs",
		category: "dairy",
		quantity: 12,
		unit: "unit",
		active: true
	},
	{
		id: "cereal",
		name: "Breakfast cereal",
		category: "pantry",
		quantity: 1e3,
		unit: "g",
		active: true
	},
	{
		id: "kids_snacks",
		name: "Kids snacks",
		category: "pantry",
		quantity: 2,
		unit: "pack",
		active: true
	},
	{
		id: "coffee",
		name: "Ground coffee",
		category: "pantry",
		quantity: 500,
		unit: "g",
		active: true
	},
	{
		id: "toilet_paper",
		name: "Toilet paper",
		category: "household",
		quantity: 1,
		unit: "pack",
		active: true
	},
	{
		id: "cleaning_spray",
		name: "Cleaning supplies",
		category: "household",
		quantity: 1,
		unit: "unit",
		active: false,
		notes: "Only when running low"
	}
];
var DEFAULT_HISTORY = [
	{
		recipeId: "a_fajitas",
		lastServed: "2026-08-02",
		timesServed: 4,
		ratings: [{
			groupId: "adults",
			rating: "loved"
		}, {
			groupId: "kids",
			rating: "fine"
		}]
	},
	{
		recipeId: "k_pasta_tomato",
		lastServed: "2026-08-09",
		timesServed: 7,
		ratings: [{
			groupId: "kids",
			rating: "loved"
		}]
	},
	{
		recipeId: "a_mushroom_pasta",
		lastServed: "2026-07-20",
		timesServed: 2,
		ratings: [{
			groupId: "adults",
			rating: "fine"
		}]
	}
];
var r = (id, name, description, groupId, minutes, effort, complexity, protein, tags, ingredients) => ({
	id,
	name,
	description,
	groupId,
	minutes,
	effort,
	complexity,
	protein,
	tags,
	ingredients: ingredients.map(([ingredientId, quantity, unit]) => ({
		ingredientId,
		quantity,
		unit
	}))
});
var RECIPES = [
	r("a_fajitas", "Chicken fajitas", "Skillet chicken with peppers, onion, avocado and warm tortillas.", "adults", 30, "normal", 2, "chicken", ["mexican", "chicken"], [
		[
			"chicken_breast",
			500,
			"g"
		],
		[
			"pepper_red",
			2,
			"unit"
		],
		[
			"onion",
			200,
			"g"
		],
		[
			"avocado",
			1,
			"unit"
		],
		[
			"tortilla",
			6,
			"unit"
		],
		[
			"paprika",
			10,
			"g"
		],
		[
			"olive_oil",
			20,
			"ml"
		]
	]),
	r("a_salmon_roast", "Salmon with roasted vegetables", "Oven salmon with potatoes, carrots and lemon.", "adults", 35, "easy", 1, "fish", ["fish", "oven"], [
		[
			"salmon",
			400,
			"g"
		],
		[
			"potato",
			600,
			"g"
		],
		[
			"carrot",
			300,
			"g"
		],
		[
			"lemon",
			1,
			"unit"
		],
		[
			"olive_oil",
			25,
			"ml"
		]
	]),
	r("a_stirfry", "Chicken & veg stir fry", "Fast wok chicken with broccoli, carrot and rice.", "adults", 25, "easy", 1, "chicken", [
		"asian",
		"chicken",
		"quick"
	], [
		[
			"chicken_breast",
			400,
			"g"
		],
		[
			"broccoli",
			300,
			"g"
		],
		[
			"carrot",
			200,
			"g"
		],
		[
			"rice",
			200,
			"g"
		],
		[
			"soy_sauce",
			40,
			"ml"
		]
	]),
	r("a_bolognese", "Beef ragu with pasta", "Slow-ish minced beef ragu with passata and herbs.", "adults", 45, "normal", 2, "beef", [
		"italian",
		"beef",
		"pasta"
	], [
		[
			"minced_beef",
			400,
			"g"
		],
		[
			"tomato_passata",
			400,
			"ml"
		],
		[
			"onion",
			150,
			"g"
		],
		[
			"carrot",
			150,
			"g"
		],
		[
			"pasta",
			250,
			"g"
		],
		[
			"garlic",
			1,
			"unit"
		]
	]),
	r("a_cod_chickpea", "Cod with chickpeas & spinach", "Pan cod over garlicky chickpeas and wilted spinach.", "adults", 30, "adventurous", 3, "fish", ["fish", "spanish"], [
		[
			"cod",
			400,
			"g"
		],
		[
			"chickpeas",
			400,
			"g"
		],
		[
			"spinach",
			200,
			"g"
		],
		[
			"garlic",
			1,
			"unit"
		],
		[
			"paprika",
			8,
			"g"
		],
		[
			"olive_oil",
			25,
			"ml"
		]
	]),
	r("a_prawn_rice", "Garlic prawn rice", "Prawns, peppers and rice with lemon and paprika.", "adults", 30, "adventurous", 3, "fish", ["fish", "rice"], [
		[
			"prawns",
			300,
			"g"
		],
		[
			"rice",
			250,
			"g"
		],
		[
			"pepper_red",
			1,
			"unit"
		],
		[
			"garlic",
			1,
			"unit"
		],
		[
			"lemon",
			1,
			"unit"
		]
	]),
	r("a_omelette", "Spanish potato omelette", "Slow-cooked potato and onion tortilla with salad.", "adults", 35, "normal", 2, "vegetarian", ["vegetarian", "spanish"], [
		[
			"eggs",
			6,
			"unit"
		],
		[
			"potato",
			500,
			"g"
		],
		[
			"onion",
			150,
			"g"
		],
		[
			"olive_oil",
			60,
			"ml"
		],
		[
			"tomato",
			200,
			"g"
		]
	]),
	r("a_lentil_stew", "Lentil & vegetable stew", "Hearty lentils with carrot, onion and smoked paprika.", "adults", 40, "easy", 1, "vegetarian", ["vegetarian", "stew"], [
		[
			"lentils",
			300,
			"g"
		],
		[
			"carrot",
			200,
			"g"
		],
		[
			"onion",
			150,
			"g"
		],
		[
			"potato",
			300,
			"g"
		],
		[
			"paprika",
			8,
			"g"
		]
	]),
	r("a_pork_couscous", "Pork loin with couscous", "Seared pork with lemony couscous and courgette.", "adults", 30, "normal", 2, "pork", ["pork"], [
		[
			"pork_loin",
			450,
			"g"
		],
		[
			"couscous",
			200,
			"g"
		],
		[
			"courgette",
			1,
			"unit"
		],
		[
			"lemon",
			1,
			"unit"
		],
		[
			"cumin",
			6,
			"g"
		]
	]),
	r("a_chicken_traybake", "Chicken & sweet potato traybake", "One tray: chicken thighs, sweet potato, peppers.", "adults", 45, "easy", 1, "chicken", ["chicken", "oven"], [
		[
			"chicken_thigh",
			600,
			"g"
		],
		[
			"sweet_potato",
			500,
			"g"
		],
		[
			"pepper_red",
			1,
			"unit"
		],
		[
			"paprika",
			8,
			"g"
		],
		[
			"olive_oil",
			25,
			"ml"
		]
	]),
	r("a_mushroom_pasta", "Creamy mushroom pasta", "Mushrooms, cream and spinach folded through pasta.", "adults", 25, "easy", 1, "vegetarian", [
		"vegetarian",
		"pasta",
		"quick"
	], [
		[
			"mushroom",
			400,
			"g"
		],
		[
			"cream",
			200,
			"ml"
		],
		[
			"pasta",
			250,
			"g"
		],
		[
			"spinach",
			100,
			"g"
		],
		[
			"garlic",
			1,
			"unit"
		]
	]),
	r("a_beef_tacos", "Beef tacos", "Spiced mince, sweetcorn, avocado and tortillas.", "adults", 25, "normal", 2, "beef", ["mexican", "beef"], [
		[
			"minced_beef",
			400,
			"g"
		],
		[
			"tortilla",
			6,
			"unit"
		],
		[
			"sweetcorn",
			150,
			"g"
		],
		[
			"avocado",
			1,
			"unit"
		],
		[
			"cumin",
			6,
			"g"
		],
		[
			"tomato",
			200,
			"g"
		]
	]),
	r("a_salmon_noodleless", "Miso-glazed salmon with rice", "Sticky glazed salmon, rice and broccoli.", "adults", 30, "adventurous", 3, "fish", ["fish", "asian"], [
		[
			"salmon",
			400,
			"g"
		],
		[
			"rice",
			200,
			"g"
		],
		[
			"broccoli",
			300,
			"g"
		],
		[
			"soy_sauce",
			40,
			"ml"
		]
	]),
	r("a_chicken_soup", "Chicken noodle-free soup", "Light chicken broth with carrot, potato and spinach.", "adults", 40, "easy", 1, "chicken", ["chicken", "soup"], [
		[
			"chicken_breast",
			300,
			"g"
		],
		[
			"carrot",
			200,
			"g"
		],
		[
			"potato",
			300,
			"g"
		],
		[
			"spinach",
			100,
			"g"
		],
		[
			"onion",
			100,
			"g"
		]
	]),
	r("k_grilled_chicken_rice", "Grilled chicken with rice", "Plain grilled chicken strips, rice and avocado slices.", "kids", 20, "easy", 1, "chicken", ["chicken", "simple"], [
		[
			"chicken_breast",
			300,
			"g"
		],
		[
			"rice",
			150,
			"g"
		],
		[
			"avocado",
			1,
			"unit"
		]
	]),
	r("k_chicken_wraps", "Mini chicken wraps", "Soft tortillas with chicken, cheese and sweetcorn.", "kids", 20, "easy", 1, "chicken", ["chicken", "simple"], [
		[
			"chicken_breast",
			250,
			"g"
		],
		[
			"tortilla",
			3,
			"unit"
		],
		[
			"cheese_grated",
			60,
			"g"
		],
		[
			"sweetcorn",
			100,
			"g"
		]
	]),
	r("k_salmon_potato_peas", "Salmon with potatoes and peas", "Baked salmon flakes with soft potatoes and peas.", "kids", 25, "easy", 1, "fish", ["fish", "simple"], [
		[
			"salmon",
			200,
			"g"
		],
		[
			"potato",
			300,
			"g"
		],
		[
			"peas",
			150,
			"g"
		]
	]),
	r("k_fish_fingers", "Fish fingers with potato & peas", "Oven fish fingers, potato wedges and peas.", "kids", 20, "easy", 1, "fish", ["fish", "simple"], [
		[
			"fish_fingers",
			6,
			"unit"
		],
		[
			"potato",
			300,
			"g"
		],
		[
			"peas",
			120,
			"g"
		]
	]),
	r("k_pasta_tomato", "Pasta with tomato sauce", "Simple passata sauce with a little grated cheese.", "kids", 18, "easy", 1, "vegetarian", [
		"vegetarian",
		"pasta",
		"simple"
	], [
		[
			"pasta",
			150,
			"g"
		],
		[
			"tomato_passata",
			250,
			"ml"
		],
		[
			"cheese_grated",
			50,
			"g"
		]
	]),
	r("k_meatballs", "Mini beef meatballs", "Soft meatballs in tomato sauce with pasta.", "kids", 30, "normal", 2, "beef", ["beef", "pasta"], [
		[
			"minced_beef",
			250,
			"g"
		],
		[
			"breadcrumbs",
			50,
			"g"
		],
		[
			"tomato_passata",
			200,
			"ml"
		],
		[
			"pasta",
			120,
			"g"
		]
	]),
	r("k_omelette_potato", "Cheesy omelette with potatoes", "Fluffy omelette with cheese and soft potato cubes.", "kids", 20, "easy", 1, "vegetarian", ["vegetarian", "simple"], [
		[
			"eggs",
			4,
			"unit"
		],
		[
			"cheese_grated",
			50,
			"g"
		],
		[
			"potato",
			250,
			"g"
		]
	]),
	r("k_chicken_sweet_potato", "Chicken with sweet potato mash", "Tender chicken pieces with sweet potato mash and peas.", "kids", 25, "easy", 1, "chicken", ["chicken", "simple"], [
		[
			"chicken_thigh",
			300,
			"g"
		],
		[
			"sweet_potato",
			300,
			"g"
		],
		[
			"peas",
			120,
			"g"
		]
	]),
	r("k_cod_rice", "Cod bites with rice", "Gently pan-cooked cod with rice and carrot sticks.", "kids", 22, "normal", 2, "fish", ["fish"], [
		[
			"cod",
			200,
			"g"
		],
		[
			"rice",
			150,
			"g"
		],
		[
			"carrot",
			150,
			"g"
		]
	]),
	r("k_pork_couscous", "Pork strips with couscous", "Mild pork strips with buttery couscous and carrot.", "kids", 22, "normal", 2, "pork", ["pork"], [
		[
			"pork_loin",
			250,
			"g"
		],
		[
			"couscous",
			120,
			"g"
		],
		[
			"carrot",
			150,
			"g"
		],
		[
			"butter",
			20,
			"g"
		]
	]),
	r("k_veg_rice_bowl", "Rice bowl with veg & egg", "Rice with sweetcorn, peas and a soft scrambled egg.", "kids", 20, "easy", 1, "vegetarian", ["vegetarian", "simple"], [
		[
			"rice",
			150,
			"g"
		],
		[
			"sweetcorn",
			100,
			"g"
		],
		[
			"peas",
			100,
			"g"
		],
		[
			"eggs",
			2,
			"unit"
		]
	]),
	r("k_lentil_mash", "Lentils with potato mash", "Mild lentils with carrot and creamy potato mash.", "kids", 28, "normal", 2, "vegetarian", ["vegetarian", "try_new"], [
		[
			"lentils",
			150,
			"g"
		],
		[
			"potato",
			300,
			"g"
		],
		[
			"carrot",
			150,
			"g"
		],
		[
			"milk",
			.1,
			"l"
		]
	]),
	r("k_prawn_pasta", "Prawn & tomato pasta", "Small prawns in a mild tomato sauce with pasta.", "kids", 22, "adventurous", 3, "fish", [
		"fish",
		"try_new",
		"pasta"
	], [
		[
			"prawns",
			150,
			"g"
		],
		[
			"pasta",
			120,
			"g"
		],
		[
			"tomato_passata",
			200,
			"ml"
		]
	]),
	r("k_chicken_broccoli", "Chicken with broccoli & rice", "Chicken pieces with steamed broccoli and rice.", "kids", 22, "normal", 2, "chicken", ["chicken", "try_new"], [
		[
			"chicken_breast",
			250,
			"g"
		],
		[
			"broccoli",
			200,
			"g"
		],
		[
			"rice",
			150,
			"g"
		]
	])
];
var RECIPE_MAP = Object.fromEntries(RECIPES.map((x) => [x.id, x]));
var INGREDIENTS = [
	[
		"chicken_breast",
		"Chicken breast",
		"meat",
		"g",
		500,
		"500 g tray",
		5.6
	],
	[
		"chicken_thigh",
		"Chicken thighs",
		"meat",
		"g",
		600,
		"600 g tray",
		4.9
	],
	[
		"minced_beef",
		"Minced beef",
		"meat",
		"g",
		500,
		"500 g pack",
		6.2
	],
	[
		"pork_loin",
		"Pork loin",
		"meat",
		"g",
		500,
		"500 g pack",
		5.1
	],
	[
		"salmon",
		"Salmon fillet",
		"fish",
		"g",
		400,
		"400 g pack",
		8.4
	],
	[
		"cod",
		"Cod loin",
		"fish",
		"g",
		400,
		"400 g pack",
		7.2
	],
	[
		"prawns",
		"Prawns",
		"fish",
		"g",
		300,
		"300 g pack",
		6.5
	],
	[
		"eggs",
		"Eggs",
		"dairy",
		"unit",
		12,
		"box of 12",
		2.9
	],
	[
		"milk",
		"Milk",
		"dairy",
		"l",
		1,
		"1 L carton",
		1.1
	],
	[
		"yogurt",
		"Natural yogurt",
		"dairy",
		"unit",
		4,
		"pack of 4",
		1.8
	],
	[
		"cheese_grated",
		"Grated cheese",
		"dairy",
		"g",
		200,
		"200 g bag",
		2.4
	],
	[
		"butter",
		"Butter",
		"dairy",
		"g",
		250,
		"250 g block",
		2.2
	],
	[
		"cream",
		"Cooking cream",
		"dairy",
		"ml",
		200,
		"200 ml",
		1.3
	],
	[
		"potato",
		"Potatoes",
		"produce",
		"g",
		1e3,
		"1 kg bag",
		1.7
	],
	[
		"onion",
		"Onions",
		"produce",
		"g",
		1e3,
		"1 kg bag",
		1.5
	],
	[
		"garlic",
		"Garlic",
		"produce",
		"unit",
		3,
		"3 bulbs",
		1
	],
	[
		"pepper_red",
		"Red peppers",
		"produce",
		"unit",
		3,
		"pack of 3",
		2.3
	],
	[
		"carrot",
		"Carrots",
		"produce",
		"g",
		1e3,
		"1 kg bag",
		1.4
	],
	[
		"courgette",
		"Courgette",
		"produce",
		"unit",
		2,
		"pack of 2",
		1.6
	],
	[
		"broccoli",
		"Broccoli",
		"produce",
		"g",
		500,
		"1 head",
		1.9
	],
	[
		"tomato",
		"Tomatoes",
		"produce",
		"g",
		1e3,
		"1 kg",
		2.1
	],
	[
		"avocado",
		"Avocado",
		"produce",
		"unit",
		2,
		"pack of 2",
		2.6
	],
	[
		"lemon",
		"Lemon",
		"produce",
		"unit",
		4,
		"pack of 4",
		1.5
	],
	[
		"spinach",
		"Baby spinach",
		"produce",
		"g",
		200,
		"200 g bag",
		1.8
	],
	[
		"mushroom",
		"Mushrooms",
		"produce",
		"g",
		400,
		"400 g tray",
		2.2
	],
	[
		"sweet_potato",
		"Sweet potato",
		"produce",
		"g",
		1e3,
		"1 kg",
		2.4
	],
	[
		"cucumber",
		"Cucumber",
		"produce",
		"unit",
		1,
		"1 unit",
		.9
	],
	[
		"peas",
		"Garden peas",
		"frozen",
		"g",
		750,
		"750 g bag",
		1.9
	],
	[
		"sweetcorn",
		"Sweetcorn",
		"frozen",
		"g",
		450,
		"450 g bag",
		1.5
	],
	[
		"rice",
		"White rice",
		"pantry",
		"g",
		1e3,
		"1 kg bag",
		1.6
	],
	[
		"pasta",
		"Pasta",
		"pantry",
		"g",
		500,
		"500 g pack",
		1.2
	],
	[
		"couscous",
		"Couscous",
		"pantry",
		"g",
		500,
		"500 g pack",
		1.7
	],
	[
		"tortilla",
		"Wheat tortillas",
		"bakery",
		"unit",
		8,
		"pack of 8",
		1.8
	],
	[
		"bread",
		"Bread loaf",
		"bakery",
		"unit",
		1,
		"1 loaf",
		1.4
	],
	[
		"chickpeas",
		"Chickpeas",
		"pantry",
		"g",
		400,
		"400 g jar",
		1.1
	],
	[
		"lentils",
		"Lentils",
		"pantry",
		"g",
		500,
		"500 g pack",
		1.6
	],
	[
		"tomato_passata",
		"Tomato passata",
		"pantry",
		"ml",
		700,
		"700 ml bottle",
		1.3
	],
	[
		"olive_oil",
		"Olive oil",
		"pantry",
		"ml",
		1e3,
		"1 L bottle",
		6.9
	],
	[
		"soy_sauce",
		"Soy sauce",
		"pantry",
		"ml",
		250,
		"250 ml bottle",
		1.9
	],
	[
		"paprika",
		"Smoked paprika",
		"pantry",
		"g",
		75,
		"75 g jar",
		1.4
	],
	[
		"cumin",
		"Cumin",
		"pantry",
		"g",
		50,
		"50 g jar",
		1.3
	],
	[
		"flour",
		"Plain flour",
		"pantry",
		"g",
		1e3,
		"1 kg bag",
		.9
	],
	[
		"breadcrumbs",
		"Breadcrumbs",
		"pantry",
		"g",
		500,
		"500 g pack",
		1.2
	],
	[
		"fish_fingers",
		"Fish fingers",
		"frozen",
		"unit",
		12,
		"box of 12",
		3.2
	],
	[
		"coffee",
		"Ground coffee",
		"pantry",
		"g",
		250,
		"250 g pack",
		3.4
	],
	[
		"cereal",
		"Breakfast cereal",
		"pantry",
		"g",
		500,
		"500 g box",
		2.7
	],
	[
		"banana",
		"Bananas",
		"produce",
		"g",
		1e3,
		"1 kg",
		1.5
	],
	[
		"apple",
		"Apples",
		"produce",
		"g",
		1e3,
		"1 kg",
		2
	],
	[
		"kids_snacks",
		"Kids snacks",
		"pantry",
		"pack",
		1,
		"1 multipack",
		3.1
	],
	[
		"toilet_paper",
		"Toilet paper",
		"household",
		"pack",
		1,
		"12 rolls",
		5.5
	],
	[
		"cleaning_spray",
		"Cleaning spray",
		"household",
		"unit",
		1,
		"1 bottle",
		2.4
	]
].map(([id, name, category, baseUnit, packageSize, packageLabel, estimatedPrice]) => ({
	id,
	name,
	category,
	baseUnit,
	packageSize,
	packageLabel,
	estimatedPrice
}));
var INGREDIENT_MAP = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));
var CATEGORY_LABELS = {
	produce: "Fruit & vegetables",
	meat: "Meat",
	fish: "Fish",
	dairy: "Dairy",
	pantry: "Pantry",
	bakery: "Bakery",
	frozen: "Frozen",
	household: "Household",
	other: "Other"
};
var CATEGORY_ORDER = [
	"produce",
	"meat",
	"fish",
	"dairy",
	"bakery",
	"pantry",
	"frozen",
	"household",
	"other"
];
/** Convert a quantity into an ingredient's base unit */
function toBase(ingredientId, quantity, unit) {
	const base = INGREDIENT_MAP[ingredientId]?.baseUnit ?? unit;
	if (unit === base) return quantity;
	if (unit === "kg" && base === "g") return quantity * 1e3;
	if (unit === "g" && base === "kg") return quantity / 1e3;
	if (unit === "l" && base === "ml") return quantity * 1e3;
	if (unit === "ml" && base === "l") return quantity / 1e3;
	return quantity;
}
function formatQty(quantity, unit) {
	const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
	if (unit === "g" && quantity >= 1e3) return `${round(quantity / 1e3, 2)} kg`;
	if (unit === "ml" && quantity >= 1e3) return `${round(quantity / 1e3, 2)} L`;
	if (unit === "unit") return `${round(quantity, 1)}${quantity === 1 ? " unit" : " units"}`;
	if (unit === "pack") return `${round(quantity, 1)} ${quantity === 1 ? "pack" : "packs"}`;
	if (unit === "bunch") return `${round(quantity, 1)} bunch`;
	return `${round(quantity, 1)} ${unit}`;
}
function formatEuro(value) {
	return `€${value.toFixed(2)}`;
}
/**
* Consolidates every meal ingredient across all member groups into a single
* basket: duplicates merged, quantities summed in a normalized base unit,
* rounded up to realistic package sizes, and annotated with the meals that use
* them. Shared adult/kids ingredients are counted once per meal only.
*/
function buildShoppingList(plan, staples) {
	const map = /* @__PURE__ */ new Map();
	for (const day of plan.days) for (const meal of day.meals) {
		const recipe = RECIPE_MAP[meal.recipeId];
		if (!recipe) continue;
		const usage = {
			date: day.date,
			groupId: meal.groupId,
			recipeName: recipe.name
		};
		const perRecipe = /* @__PURE__ */ new Map();
		for (const ri of recipe.ingredients) {
			const qty = toBase(ri.ingredientId, ri.quantity, ri.unit);
			perRecipe.set(ri.ingredientId, (perRecipe.get(ri.ingredientId) ?? 0) + qty);
		}
		for (const [ingredientId, qty] of perRecipe) {
			const ing = INGREDIENT_MAP[ingredientId];
			if (!ing) continue;
			const existing = map.get(ingredientId);
			if (existing) {
				existing.requiredQuantity += qty;
				if (!existing.usages.some((u) => u.date === usage.date && u.groupId === usage.groupId)) existing.usages.push(usage);
			} else map.set(ingredientId, {
				id: `item_${ingredientId}`,
				ingredientId,
				name: ing.name,
				category: ing.category,
				requiredQuantity: qty,
				unit: ing.baseUnit,
				purchaseQuantity: 0,
				purchaseLabel: "",
				estimatedPrice: 0,
				source: "meals",
				usages: [usage],
				removed: false,
				pantry: false
			});
		}
	}
	for (const staple of staples.filter((s) => s.active)) {
		const ing = staple.name ? INGREDIENT_MAP[staple.id] : void 0;
		const key = `staple_${staple.id}`;
		map.set(key, {
			id: key,
			ingredientId: ing?.id ?? null,
			name: staple.name,
			category: staple.category,
			requiredQuantity: staple.quantity,
			unit: staple.unit,
			purchaseQuantity: 0,
			purchaseLabel: "",
			estimatedPrice: 0,
			source: "staple",
			usages: [],
			removed: false,
			pantry: false
		});
	}
	const items = [...map.values()].map(applyPackaging);
	return {
		id: `list_${Date.now()}`,
		mealPlanId: plan.id,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		approved: false,
		items
	};
}
/** Round a required quantity up to whole supermarket packages. */
function applyPackaging(item) {
	const ing = item.ingredientId ? INGREDIENT_MAP[item.ingredientId] : void 0;
	if (!ing) return {
		...item,
		purchaseQuantity: Math.max(1, Math.ceil(item.requiredQuantity)),
		purchaseLabel: `${Math.max(1, Math.ceil(item.requiredQuantity))} × ${item.unit}`,
		estimatedPrice: Math.max(1, Math.ceil(item.requiredQuantity)) * 1.5
	};
	const packs = Math.max(1, Math.ceil(item.requiredQuantity / ing.packageSize));
	return {
		...item,
		purchaseQuantity: packs,
		purchaseLabel: `${packs} × ${ing.packageLabel}`,
		estimatedPrice: Math.round(packs * ing.estimatedPrice * 100) / 100
	};
}
function listTotals(list) {
	const active = list.items.filter((i) => !i.removed && !i.pantry);
	return {
		products: active.reduce((n, i) => n + i.purchaseQuantity, 0),
		lines: active.length,
		cost: Math.round(active.reduce((n, i) => n + i.estimatedPrice, 0) * 100) / 100
	};
}
var MERCADONA = {
	id: "mercadona",
	name: "Mercadona",
	website: "https://tienda.mercadona.es",
	active: true
};
/**
* Mock Mercadona catalog. Product data is synthetic: it is shaped like a real
* retailer catalog so the matching engine and cart payload are realistic, but
* no Mercadona API or page structure is assumed anywhere.
*/
var CATALOG_UPDATED = "2026-08-10T00:00:00.000Z";
/** Ingredients we deliberately ship without a trustworthy match. */
var LOW_CONFIDENCE = /* @__PURE__ */ new Set(["couscous", "cleaning_spray"]);
var VARIANTS = [
	{
		suffix: "",
		brand: "Hacendado",
		sizeFactor: 1,
		priceFactor: 1,
		confidence: .94
	},
	{
		suffix: "selección",
		brand: "Mercadona Selección",
		sizeFactor: .7,
		priceFactor: .85,
		confidence: .8
	},
	{
		suffix: "formato familiar",
		brand: "Hacendado",
		sizeFactor: 2,
		priceFactor: 1.85,
		confidence: .76
	}
];
var round$1 = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
function sizeLabelValue(size, unit) {
	if (unit === "g" || unit === "ml") return Math.max(25, Math.round(size / 25) * 25);
	if (unit === "unit" || unit === "pack" || unit === "bunch") return Math.max(1, Math.round(size));
	return round$1(size, 2);
}
var products = [];
var mappings = [];
for (const ing of INGREDIENTS) VARIANTS.forEach((variant, index) => {
	const packageSize = sizeLabelValue(ing.packageSize * variant.sizeFactor, ing.baseUnit);
	const price = round$1(ing.estimatedPrice * variant.priceFactor * (index === 1 ? .95 : 1));
	const retailerProductId = `${ing.id}-${index + 1}`;
	products.push({
		id: `mercadona_${retailerProductId}`,
		retailerId: MERCADONA.id,
		retailerProductId,
		name: variant.suffix ? `${ing.name} ${variant.suffix}` : ing.name,
		brand: variant.brand,
		category: ing.category,
		packageSize,
		packageUnit: ing.baseUnit,
		price,
		pricePerUnit: round$1(price / packageSize, 4),
		productUrl: `${MERCADONA.website}/product/${retailerProductId}`,
		imageUrl: "",
		lastUpdated: CATALOG_UPDATED
	});
	mappings.push({
		id: `map_${retailerProductId}`,
		ingredientId: ing.id,
		retailerProductId,
		confidence: LOW_CONFIDENCE.has(ing.id) ? round$1(variant.confidence - .5) : variant.confidence - index * .02,
		preferred: false,
		lastUsed: null
	});
});
var RETAILER_PRODUCTS = products;
var RETAILER_PRODUCT_MAP = Object.fromEntries(products.map((p) => [p.retailerProductId, p]));
var INGREDIENT_PRODUCT_MAPPINGS = mappings;
function productById(retailerProductId) {
	return retailerProductId ? RETAILER_PRODUCT_MAP[retailerProductId] : void 0;
}
function candidatesFor(ingredientId, mappings = INGREDIENT_PRODUCT_MAPPINGS) {
	if (!ingredientId) return [];
	return mappings.filter((m) => m.ingredientId === ingredientId).map((m) => ({
		product: RETAILER_PRODUCT_MAP[m.retailerProductId],
		confidence: m.confidence
	})).filter((c) => Boolean(c.product)).sort((a, b) => b.confidence - a.confidence);
}
/** Packages needed to meet (or slightly exceed) the required quantity. */
function packagesFor(required, product) {
	if (!product.packageSize) return 1;
	return Math.max(1, Math.ceil(round(required, 3) / product.packageSize));
}
function wasteFor(required, product, packages) {
	return Math.max(0, packages * product.packageSize - required);
}
function round(n, d = 2) {
	return Math.round(n * 10 ** d) / 10 ** d;
}
/**
* Picks the best product for an ingredient requirement, considering household
* preferred products first, then confidence, waste (over-purchasing) and price.
*/
function chooseProduct(ingredientId, required, ctx) {
	const candidates = candidatesFor(ingredientId, ctx.mappings);
	if (!candidates.length) return null;
	const pref = ctx.preferred.find((p) => p.ingredientId === ingredientId);
	if (pref) {
		const match = candidates.find((c) => c.product.retailerProductId === pref.retailerProductId);
		if (match) return {
			...match,
			confidence: Math.max(match.confidence, .99)
		};
	}
	const scored = candidates.map((c) => {
		const packages = packagesFor(required, c.product);
		const waste = wasteFor(required, c.product, packages);
		const wasteRatio = required > 0 ? waste / required : 0;
		const cost = packages * c.product.price;
		return {
			...c,
			score: c.confidence * 2 - wasteRatio * 1.1 - cost * .02
		};
	});
	scored.sort((a, b) => b.score - a.score);
	const best = scored[0];
	return best.confidence >= .6 ? {
		product: best.product,
		confidence: best.confidence
	} : null;
}
/** Turns an approved shopping list into a proposed retailer basket. */
function buildRetailerCart(list, ctx) {
	const lines = list.items.filter((i) => !i.removed && !i.pantry).map((item) => {
		const match = chooseProduct(item.ingredientId, item.requiredQuantity, ctx);
		return {
			id: `line_${item.id}`,
			shoppingItemId: item.id,
			ingredientId: item.ingredientId,
			ingredientName: item.name,
			category: item.category,
			requiredQuantity: item.requiredQuantity,
			unit: item.unit,
			retailerProductId: match?.product.retailerProductId ?? null,
			confidence: match?.confidence ?? 0,
			quantity: match ? packagesFor(item.requiredQuantity, match.product) : 1,
			source: item.source,
			usages: item.usages
		};
	});
	return {
		id: `cart_${Date.now()}`,
		retailerId: MERCADONA.id,
		mealPlanId: list.mealPlanId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		reviewed: false,
		lines
	};
}
function lineTotal(line) {
	const product = productById(line.retailerProductId);
	return product ? round(product.price * line.quantity) : 0;
}
function cartTotals(cart) {
	const sum = (src) => round(cart.lines.filter((l) => src.includes(l.source)).reduce((n, l) => n + lineTotal(l), 0));
	return {
		products: cart.lines.reduce((n, l) => n + (l.retailerProductId ? l.quantity : 0), 0),
		lines: cart.lines.length,
		total: sum([
			"meals",
			"staple",
			"manual"
		]),
		mealsTotal: sum(["meals", "manual"]),
		staplesTotal: sum(["staple"]),
		unmatched: cart.lines.filter((l) => !l.retailerProductId).length
	};
}
function searchProducts(query, limit = 12) {
	const q = query.trim().toLowerCase();
	if (!q) return RETAILER_PRODUCTS.slice(0, limit);
	return RETAILER_PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)).slice(0, limit);
}
function startOfWeek(d = /* @__PURE__ */ new Date()) {
	const date = new Date(d);
	const day = (date.getDay() + 6) % 7;
	date.setDate(date.getDate() - day);
	date.setHours(0, 0, 0, 0);
	return date;
}
function isoDate(d) {
	return d.toISOString().slice(0, 10);
}
function formatDay(iso) {
	return (/* @__PURE__ */ new Date(iso + "T00:00:00")).toLocaleDateString("en-GB", {
		weekday: "long",
		day: "numeric",
		month: "short"
	});
}
function shortDay(iso) {
	return (/* @__PURE__ */ new Date(iso + "T00:00:00")).toLocaleDateString("en-GB", { weekday: "short" });
}
var WEEKDAYS = [
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
	"sunday"
];
/** Very light natural-language parsing of the free-text notes field. */
function parseNotes(notes) {
	const text = notes.toLowerCase();
	const parsed = {
		avoid: [],
		favour: [],
		skipDays: [],
		alreadyHave: []
	};
	for (const word of [
		"pasta",
		"fish",
		"chicken",
		"beef",
		"pork",
		"rice",
		"vegetarian",
		"prawns",
		"salmon"
	]) {
		if (new RegExp(`(avoid|no|without|skip)[^.,;]{0,20}${word}`).test(text)) parsed.avoid.push(word);
		if (new RegExp(`(more|extra|use more)[^.,;]{0,20}${word}`).test(text)) parsed.favour.push(word);
		if (new RegExp(`(already have|we have|got)[^.,;]{0,20}${word}`).test(text)) parsed.alreadyHave.push(word);
	}
	WEEKDAYS.forEach((d, i) => {
		if (new RegExp(`(away|out|not home|no dinner)[^.,;]{0,20}${d}|${d}[^.,;]{0,20}away`).test(text)) parsed.skipDays.push(i);
	});
	return parsed;
}
function matchesText(recipe, term) {
	return `${recipe.name} ${recipe.description} ${recipe.tags.join(" ")} ${recipe.protein}`.toLowerCase().includes(term);
}
function effortScore(recipe, options) {
	const target = options.adultEffort;
	if (recipe.effort === target) return 3;
	if (target === "normal") return 1;
	return 0;
}
function kidsScore(recipe, options) {
	if (options.kidsStyle === "very_simple") return recipe.complexity === 1 ? 3 : -2;
	if (options.kidsStyle === "try_new") return recipe.tags.includes("try_new") ? 3 : 0;
	return recipe.complexity <= 2 ? 2 : 0;
}
function ingredientIds(recipe) {
	return new Set(recipe.ingredients.map((i) => i.ingredientId));
}
function sharedIngredients(a, b) {
	const setB = ingredientIds(b);
	return [...ingredientIds(a)].filter((id) => setB.has(id));
}
function historyPenalty(recipeId, history) {
	const entry = history.find((h) => h.recipeId === recipeId);
	if (!entry) return 0;
	let penalty = Math.min(entry.timesServed, 4) * .8;
	if (entry.ratings.some((r) => r.rating === "never")) penalty += 10;
	if (entry.ratings.some((r) => r.rating === "loved")) penalty -= 1.5;
	if (entry.lastServed) {
		if ((Date.now() - new Date(entry.lastServed).getTime()) / 864e5 < 14) penalty += 4;
	}
	return penalty;
}
function scoreAdult(recipe, input, notes) {
	const { options, preferences } = input;
	const group = preferences.groups.find((g) => g.groupId === "adults");
	let score = effortScore(recipe, options) + Math.random() * 1.5;
	if (recipe.minutes > options.maxMinutes) score -= 6;
	if (notes.avoid.some((t) => matchesText(recipe, t))) score -= 20;
	if (notes.favour.some((t) => matchesText(recipe, t))) score += 6;
	if (notes.alreadyHave.some((t) => matchesText(recipe, t))) score += 3;
	if (group) {
		if (group.dislikes.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 12;
		if (group.likes.some((t) => matchesText(recipe, t.toLowerCase()))) score += 3;
		if (group.restrictions.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 20;
		if (recipe.minutes > group.maxMinutes) score -= 3;
	}
	score -= historyPenalty(recipe.id, input.history);
	return score;
}
function scoreKids(recipe, adultRecipe, input, notes) {
	const { options, preferences } = input;
	const group = preferences.groups.find((g) => g.groupId === "kids");
	let score = sharedIngredients(adultRecipe, recipe).length * (1.5 + preferences.reusePriority) + kidsScore(recipe, options);
	if (recipe.protein === adultRecipe.protein) score += 1.5;
	if (recipe.minutes > options.maxMinutes) score -= 4;
	if (notes.avoid.some((t) => matchesText(recipe, t))) score -= 20;
	if (group) {
		if (group.dislikes.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 12;
		if (group.likes.some((t) => matchesText(recipe, t.toLowerCase()))) score += 2;
		if (group.introducing.some((t) => matchesText(recipe, t.toLowerCase()))) score += 2;
		if (group.restrictions.some((t) => matchesText(recipe, t.toLowerCase()))) score -= 20;
		if (recipe.complexity > group.maxComplexity) score -= 5;
	}
	score -= historyPenalty(recipe.id, input.history) * .6;
	return score + Math.random();
}
function adultPool(input, notes, used) {
	return RECIPES.filter((r) => r.groupId === "adults").map((r) => ({
		r,
		s: scoreAdult(r, input, notes) - (used.includes(r.id) ? 30 : 0)
	})).sort((a, b) => b.s - a.s);
}
function pickAdultRecipe(input, used) {
	return adultPool(input, parseNotes(input.options.notes), used)[0].r;
}
function pickKidsRecipe(input, adultRecipe, used) {
	const notes = parseNotes(input.options.notes);
	return RECIPES.filter((r) => r.groupId === "kids").map((r) => ({
		r,
		s: scoreKids(r, adultRecipe, input, notes) - (used.includes(r.id) ? 12 : 0)
	})).sort((a, b) => b.s - a.s)[0].r;
}
function buildDay(input, date, usedAdult, usedKids) {
	const adult = pickAdultRecipe(input, usedAdult);
	const kids = pickKidsRecipe(input, adult, usedKids);
	return {
		id: `day_${date}_${Math.random().toString(36).slice(2, 7)}`,
		date,
		meals: [{
			id: `meal_${date}_adults`,
			recipeId: adult.id,
			groupId: "adults"
		}, {
			id: `meal_${date}_kids`,
			recipeId: kids.id,
			groupId: "kids"
		}],
		sharedIngredientIds: sharedIngredients(adult, kids)
	};
}
function recomputeShared(day) {
	const recipes = day.meals.map((m) => RECIPE_MAP[m.recipeId]).filter(Boolean);
	if (recipes.length < 2) return {
		...day,
		sharedIngredientIds: []
	};
	const counts = /* @__PURE__ */ new Map();
	for (const rec of recipes) for (const id of new Set(rec.ingredients.map((i) => i.ingredientId))) counts.set(id, (counts.get(id) ?? 0) + 1);
	return {
		...day,
		sharedIngredientIds: [...counts.entries()].filter(([, c]) => c > 1).map(([id]) => id)
	};
}
function generatePlan(input) {
	const notes = parseNotes(input.options.notes);
	const week = startOfWeek();
	const dates = [];
	for (let i = 0; i < 7 && dates.length < input.options.dinnerCount; i++) {
		if (notes.skipDays.includes(i)) continue;
		const d = new Date(week);
		d.setDate(week.getDate() + i);
		dates.push(isoDate(d));
	}
	const usedAdult = [];
	const usedKids = [];
	const days = dates.map((date) => {
		const day = buildDay(input, date, usedAdult, usedKids);
		day.meals.forEach((m) => (m.groupId === "adults" ? usedAdult : usedKids).push(m.recipeId));
		return day;
	});
	return {
		id: `plan_${Date.now()}`,
		weekStart: isoDate(week),
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		approved: false,
		days
	};
}
var STORAGE_KEY = "mealplanner_state_v1";
var initialState = {
	household: DEFAULT_HOUSEHOLD,
	options: DEFAULT_OPTIONS,
	preferences: DEFAULT_PREFERENCES,
	staples: DEFAULT_STAPLES,
	history: DEFAULT_HISTORY,
	plan: null,
	list: null,
	preferredProducts: [],
	cart: null
};
var StoreContext = (0, import_react.createContext)(null);
function StoreProvider({ children }) {
	const [state, setState] = (0, import_react.useState)(initialState);
	const [hydrated, setHydrated] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) setState({
				...initialState,
				...JSON.parse(raw)
			});
		} catch {}
		setHydrated(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!hydrated) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
		} catch {}
	}, [state, hydrated]);
	const planInput = (0, import_react.useCallback)((s) => ({
		household: s.household,
		options: s.options,
		preferences: s.preferences,
		history: s.history
	}), []);
	const value = (0, import_react.useMemo)(() => {
		const usedIds = (plan, groupId) => plan.days.flatMap((d) => d.meals.filter((m) => m.groupId === groupId).map((m) => m.recipeId));
		return {
			...state,
			hydrated,
			setOptions: (patch) => setState((s) => ({
				...s,
				options: {
					...s.options,
					...patch
				}
			})),
			setPreferences: (preferences) => setState((s) => ({
				...s,
				preferences
			})),
			setStaples: (staples) => setState((s) => ({
				...s,
				staples
			})),
			generate: () => setState((s) => ({
				...s,
				plan: generatePlan(planInput(s)),
				list: null,
				cart: null
			})),
			regenerateWeek: () => setState((s) => ({
				...s,
				plan: generatePlan(planInput(s)),
				list: null,
				cart: null
			})),
			regenerateDay: (dayId) => setState((s) => {
				if (!s.plan) return s;
				const days = s.plan.days.map((d) => d.id === dayId ? buildDay(planInput(s), d.date, usedIds(s.plan, "adults"), usedIds(s.plan, "kids")) : d);
				return {
					...s,
					plan: {
						...s.plan,
						days,
						approved: false
					},
					list: null,
					cart: null
				};
			}),
			replaceMeal: (dayId, groupId) => setState((s) => {
				if (!s.plan) return s;
				const days = s.plan.days.map((day) => {
					if (day.id !== dayId) return day;
					const current = day.meals.find((m) => m.groupId === groupId);
					const other = day.meals.find((m) => m.groupId !== groupId);
					const used = [...usedIds(s.plan, groupId).filter((id) => id !== current?.recipeId), ...current ? [current.recipeId] : []];
					const input = planInput(s);
					const next = groupId === "adults" ? pickAdultRecipe(input, used) : pickKidsRecipe(input, RECIPE_MAP[other?.recipeId ?? ""] ?? RECIPE_MAP["a_stirfry"], used);
					const meals = day.meals.map((m) => m.groupId === groupId ? {
						...m,
						recipeId: next.id
					} : m);
					return recomputeShared({
						...day,
						meals
					});
				});
				return {
					...s,
					plan: {
						...s.plan,
						days,
						approved: false
					},
					list: null,
					cart: null
				};
			}),
			approvePlan: () => setState((s) => {
				if (!s.plan) return s;
				const plan = {
					...s.plan,
					approved: true
				};
				const history = [...s.history];
				for (const day of plan.days) for (const meal of day.meals) {
					const entry = history.find((h) => h.recipeId === meal.recipeId);
					if (entry) {
						entry.timesServed += 1;
						entry.lastServed = day.date;
					} else history.push({
						recipeId: meal.recipeId,
						lastServed: day.date,
						timesServed: 1,
						ratings: []
					});
				}
				return {
					...s,
					plan,
					history,
					list: buildShoppingList(plan, s.staples)
				};
			}),
			updateItem: (itemId, patch) => setState((s) => {
				if (!s.list) return s;
				const items = s.list.items.map((i) => i.id === itemId ? patch.requiredQuantity !== void 0 ? applyPackaging({
					...i,
					...patch
				}) : {
					...i,
					...patch
				} : i);
				return {
					...s,
					list: {
						...s.list,
						items,
						approved: false
					},
					cart: null
				};
			}),
			addManualItem: (item) => setState((s) => {
				if (!s.list) return s;
				const next = applyPackaging({
					id: `manual_${Date.now()}`,
					ingredientId: null,
					purchaseQuantity: 0,
					purchaseLabel: "",
					estimatedPrice: 0,
					source: "manual",
					usages: [],
					removed: false,
					pantry: false,
					...item
				});
				return {
					...s,
					list: {
						...s.list,
						items: [...s.list.items, next]
					}
				};
			}),
			approveList: () => setState((s) => s.list ? {
				...s,
				list: {
					...s.list,
					approved: true
				}
			} : s),
			matchProducts: () => setState((s) => s.list ? {
				...s,
				list: {
					...s.list,
					approved: true
				},
				cart: buildRetailerCart(s.list, {
					householdId: s.household.id,
					preferred: s.preferredProducts
				})
			} : s),
			setLineProduct: (lineId, retailerProductId, remember) => setState((s) => {
				if (!s.cart) return s;
				const product = productById(retailerProductId);
				if (!product) return s;
				let preferredProducts = s.preferredProducts;
				const lines = s.cart.lines.map((line) => {
					if (line.id !== lineId) return line;
					if (remember && line.ingredientId) {
						const ingredientId = line.ingredientId;
						preferredProducts = [...preferredProducts.filter((p) => p.ingredientId !== ingredientId), {
							id: `pref_${ingredientId}`,
							householdId: s.household.id,
							ingredientId,
							retailerProductId
						}];
					}
					return {
						...line,
						retailerProductId,
						confidence: remember ? .99 : Math.max(line.confidence, .9),
						quantity: packagesFor(line.requiredQuantity, product)
					};
				});
				return {
					...s,
					preferredProducts,
					cart: {
						...s.cart,
						lines,
						reviewed: false
					}
				};
			}),
			setLineQuantity: (lineId, quantity) => setState((s) => s.cart ? {
				...s,
				cart: {
					...s.cart,
					lines: s.cart.lines.map((l) => l.id === lineId ? {
						...l,
						quantity: Math.max(0, quantity)
					} : l)
				}
			} : s),
			removeLine: (lineId) => setState((s) => s.cart ? {
				...s,
				cart: {
					...s.cart,
					lines: s.cart.lines.filter((l) => l.id !== lineId)
				}
			} : s),
			addCartProduct: (retailerProductId) => setState((s) => {
				if (!s.cart) return s;
				const product = productById(retailerProductId);
				if (!product) return s;
				const line = {
					id: `line_extra_${retailerProductId}_${s.cart.lines.length}`,
					shoppingItemId: `extra_${retailerProductId}`,
					ingredientId: null,
					ingredientName: product.name,
					category: product.category,
					requiredQuantity: product.packageSize,
					unit: product.packageUnit,
					retailerProductId,
					confidence: 1,
					quantity: 1,
					source: "manual",
					usages: []
				};
				return {
					...s,
					cart: {
						...s.cart,
						lines: [...s.cart.lines, line]
					}
				};
			}),
			setPreferredProduct: (ingredientId, retailerProductId) => setState((s) => ({
				...s,
				preferredProducts: [...s.preferredProducts.filter((p) => p.ingredientId !== ingredientId), {
					id: `pref_${ingredientId}`,
					householdId: s.household.id,
					ingredientId,
					retailerProductId
				}]
			})),
			markCartReviewed: () => setState((s) => s.cart ? {
				...s,
				cart: {
					...s.cart,
					reviewed: true
				}
			} : s),
			rateMeal: (recipeId, groupId, rating) => setState((s) => {
				const history = s.history.map((h) => ({
					...h,
					ratings: [...h.ratings]
				}));
				let entry = history.find((h) => h.recipeId === recipeId);
				if (!entry) {
					entry = {
						recipeId,
						lastServed: null,
						timesServed: 0,
						ratings: []
					};
					history.push(entry);
				}
				const existing = entry.ratings.find((r) => r.groupId === groupId);
				if (existing) existing.rating = rating;
				else entry.ratings.push({
					groupId,
					rating
				});
				return {
					...s,
					history
				};
			})
		};
	}, [
		state,
		hydrated,
		planInput
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StoreContext.Provider, {
		value,
		children
	});
}
function useStore() {
	const ctx = (0, import_react.useContext)(StoreContext);
	if (!ctx) throw new Error("useStore must be used inside StoreProvider");
	return ctx;
}
//#endregion
export { searchProducts as _, RECIPE_MAP as a, useStore as b, cartTotals as c, formatQty as d, isoDate as f, productById as g, packagesFor as h, MERCADONA as i, formatDay as l, listTotals as m, CATEGORY_ORDER as n, StoreProvider as o, lineTotal as p, INGREDIENT_MAP as r, candidatesFor as s, CATEGORY_LABELS as t, formatEuro as u, shortDay as v, startOfWeek as y };
