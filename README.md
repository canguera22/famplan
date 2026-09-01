# Meal Planner Pro

Build a responsive web application for weekly household meal planning and grocery preparation.

Product goal

The application removes the mental work associated with deciding what a family should eat each week and determining all of the ingredients required.

The user should be able to manually generate a weekly meal plan, review it, replace individual meals, approve it, and then receive one consolidated grocery basket.

Do NOT include scheduling or automatic weekly generation in the MVP. The user manually initiates generation.

Do NOT include checkout, payment processing, or autonomous purchasing.

The longer-term goal is to populate a user's Mercadona online shopping cart after they approve the grocery basket, but initially focus on the meal-planning, ingredient-consolidation and shopping-review experience.

Household profile

Design the initial household configuration around:

2 adults

2 children

Adults and children eat dinner separately and therefore require separate dinner menus.

The system should generate:

Adult dinner menu

Kids' dinner menu

However, these should NOT be treated as completely independent meal plans.

The planning engine should intelligently maximize ingredient overlap where practical.

Example:

Adult meal:
Chicken fajitas with peppers, onions, avocado and tortillas

Kids' meal:
Grilled chicken with rice and avocado

Shared ingredients:

Chicken

Avocado

Another example:

Adult meal:
Salmon with roasted vegetables and potatoes

Kids' meal:
Salmon with potatoes and peas

The objective is to provide age-appropriate/simple kids' meals while minimizing unnecessary ingredients, food waste and cooking complexity.

Main workflow

Create the following primary workflow:

1. Home / Weekly Planner

Prominent CTA:

"Plan this week"

Display the current week's dates.

Before generating, allow the user to select:

Number of dinners to plan

Adult cooking effort:

Easy

Normal

More adventurous

Kids meal preference:

Very simple

Normal

Try new foods

Maximum desired cooking time

Optional notes such as:

"We are away Friday"

"Use more fish this week"

"Avoid pasta"

"We already have chicken"

Then provide:

"Generate meals"

2. Weekly Meal Review

Show each day as a card.

Each day should clearly show:

ADULT DINNER
Meal name
Short description
Estimated prep/cook time

KIDS' DINNER
Meal name
Short description
Estimated prep/cook time

Also show:

"Shared ingredients"

when the adult and kids meals intentionally reuse ingredients.

Each meal should have actions:

Replace meal

View ingredients

Allow the user to replace only the adult meal or only the kids' meal without regenerating the entire week.

Also provide:

"Regenerate day"

and

"Regenerate entire week"

At the bottom:

"Approve meals & build shopping list"

3. Grocery Engine

After approval, combine all ingredients from all adult and kids meals.

The ingredient engine must:

Consolidate duplicate ingredients

Add quantities together

Normalize units

Account for realistic package sizes where possible

Clearly associate ingredients with the meals that use them

Highlight ingredients reused across several meals

Avoid double-counting shared ingredients between adult and kids meals

Example:

Instead of:

Monday adults: 500g chicken
Monday kids: 300g chicken
Wednesday adults: 400g chicken

Display:

Chicken breast — 1.2 kg

Used for:

Monday adult dinner

Monday kids' dinner

Wednesday adult dinner

4. Shopping List Review

Organize ingredients into supermarket-style categories:

Fruit & vegetables

Meat

Fish

Dairy

Pantry

Bakery

Frozen

Other

For each item display:

Ingredient

Required quantity

Estimated purchase quantity

Meals using the ingredient

Allow the user to:

Remove an item because they already have it

Adjust quantity

Mark as pantry item

Add a manual grocery item

Show:

Estimated number of grocery products
Estimated cost placeholder

At the bottom provide:

"Approve shopping list"

For the MVP, approval takes the user to a final review screen.

Later this action will connect to Mercadona product matching and cart population.

5. Household staples

Create a separate "Staples" section accessible from the navigation.

Users can define recurring items such as:

Milk

Yogurt

Fruit

Bread

Eggs

Breakfast cereal

Kids snacks

Coffee

Toilet paper

Cleaning supplies

Each staple should have:

Name

Category

Preferred quantity

Active/inactive toggle

Optional notes

Active staples should automatically be added to the grocery basket when a weekly shopping list is generated.

Keep staples separate from meal ingredients in the UI while combining them into the final shopping basket.

6. Preferences

Create a household preferences page.

Adult preferences:

Foods we like

Foods we dislike

Dietary restrictions

Preferred cuisines

Maximum cooking time

Protein preferences

Desired variety

Kids preferences:

Foods they like

Foods they dislike

Foods currently being introduced

Maximum complexity

Preferred proteins

Preferred vegetables

Dietary restrictions

Shared household preferences:

Weekly grocery budget target

Ingredient reuse priority

Food waste reduction priority

Preferred number of fish meals

Preferred number of vegetarian meals

7. Meal history and learning

Create a basic meal history.

After a meal has been served, users should eventually be able to rate it:

Loved it

Fine

Don't repeat

Maintain separate adult and kids ratings.

Also store:

Last served date

Number of times served

The meal generator should eventually use this information to avoid excessive repetition.

For now, create the data structure and UI even if the recommendation logic is mocked.

Design

Use a clean, modern consumer-app aesthetic.

The application should feel fast, calm and extremely easy to use.

This should NOT look like a recipe website.

The focus is decision reduction and convenience.

Prioritize:

Large meal cards

Clear hierarchy

Minimal text

Obvious primary actions

Mobile-friendly design

Simple weekly overview

Use bottom or sidebar navigation with:

This Week

Shopping

Staples

History

Preferences

Technical architecture

Structure the application so these concepts are separate:

Household
HouseholdMemberGroup
MealPlan
MealPlanDay
Meal
Recipe
Ingredient
RecipeIngredient
ShoppingList
ShoppingListItem
Staple
MealRating
HouseholdPreference

Use Adult and Kids as household member groups rather than hard-coding meal types into every component. This should allow future households to define different groups.

Example future use:

Adults

Kids

Toddler

Vegetarian family member

The meal-generation layer should eventually return structured JSON rather than free text so recipes and ingredients can reliably feed the grocery engine.

Create mock structured data for the first version.

Do not build Mercadona integration yet, but architect the shopping layer so that later we can add:

Retailer
RetailerProduct
IngredientProductMapping
PreferredProduct

The eventual flow will be:

Meal generation
→ recipe ingredients
→ consolidated grocery requirements
→ retailer product matching
→ user review
→ populate Mercadona cart
→ user manually checks out

Never automate checkout or payment.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6a34412b-725c-4966-be19-7ae38a305cd3).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
