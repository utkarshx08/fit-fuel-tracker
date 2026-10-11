# FitFuel — Fitness & Nutrition Tracker

Responsive dark-themed fitness and nutrition tracking app built with HTML, CSS and vanilla JavaScript.

## Features
- Daily calorie goal, consumed calories and remaining calories
- Protein, carbohydrate and fat tracking
- Food diary split into breakfast, lunch, dinner and snacks
- Add/remove foods with manually entered nutrition values
- Workout logging with type, duration and notes
- Weekly activity visualization
- Step and water tracking
- Weight check-ins and weight history
- Editable calorie and macro goals
- Responsive desktop/mobile navigation
- Browser persistence using `localStorage`

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a browser, or open this folder in VS Code and use Live Server.
3. No dependencies or build step are required.

## Data limitations
Data is stored in the current browser only; it does not sync between devices and is not a secure multi-user database. Nutrition values are entered manually; there is no live food database or wearable integration. Defaults (2,800 kcal, 160 g protein, 300 g carbs, 85 g fat, 75 kg) are demo starting values, not individualized medical advice. Use the gear icon to personalize daily goals.

## Files
- `index.html` — structure and modal forms
- `styles.css` — visual styling and responsive layout
- `app.js` — app logic, rendering and local persistence
