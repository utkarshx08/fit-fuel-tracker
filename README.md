# FitFuel 2.0 — Modern React & Cloud Nutrition Tracker

> A production-oriented React.js fitness and nutrition application built with React, Vite, Tailwind CSS, Recharts, and Supabase PostgreSQL.

![FitFuel Dark Theme](https://img.shields.io/badge/Theme-FitFuel%20Dark-c8f169?style=flat-square)
![React 18](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Build-Vite%206-646cff?style=flat-square&logo=vite)
![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL-3ecf8e?style=flat-square&logo=supabase)
![Tests](https://img.shields.io/badge/Tests-12%20Passing-brightgreen?style=flat-square)

---

## ✨ Features

- **Energy & Calorie Tracking**: Real-time remaining calorie ring, energy split, and daily target percentages.
- **Macronutrient Balance**: Live breakdown for Protein, Carbohydrates, and Fats with goal progress bars.
- **Live Food Search & Database**:
  - Live search connected to **USDA FoodData Central** and **Open Food Facts**.
  - Dynamic **serving-size & quantity recalculator** (scaling macros dynamically per serving/weight).
  - Categorized meals: **Breakfast**, **Lunch**, **Dinner**, and **Snacks**.
  - Custom food creator for unlisted items or home-cooked recipes.
- **Workouts & Activity**:
  - Log workouts with type (Strength, Cardio, Sports, Mobility), duration, notes, and date.
  - Interactive **weekly activity chart** built with Recharts.
  - One-click step logging (+1,000 steps) and hydration tracking (+250 ml).
- **Progress & Weight Tracking**:
  - Log weight check-ins and visualize weight progression over time with an interactive Area chart.
  - Weight history chips and goal metrics.
- **Supabase Authentication & Cloud Persistence**:
  - User registration, login, and secure sessions.
  - Row Level Security (RLS) guaranteeing user-level isolation.
  - Zero-friction Demo / Guest Mode for offline evaluation and preview.
- **Responsive Dark Design**:
  - Preserves the sleek FitFuel dark palette (`#0b0d12`), neon-lime accents (`#c8f169`), and typography (`DM Sans` + `Manrope`).
  - Mobile drawer navigation and responsive tablet/desktop layouts.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (v24.x supported)
- **npm**: v9.0.0 or later

### 2. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Supabase project keys and optional USDA API key:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
VITE_USDA_API_KEY=DEMO_KEY
```

> **Note**: If Supabase keys are not set, FitFuel runs automatically in **Demo Mode** using browser persistence and offline verified nutrition data, so you can explore all features immediately.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup (Supabase)

FitFuel 2.0 includes a production-ready SQL migration with PostgreSQL tables, foreign keys, constraints, and Row Level Security (RLS) policies.

### Steps to configure:
1. Create a project at [supabase.com](https://supabase.com).
2. Open your project's **SQL Editor**.
3. Copy the contents of [`supabase/migrations/20261011_initial_schema.sql`](./supabase/migrations/20261011_initial_schema.sql) and paste them into the SQL editor.
4. Click **Run**.
5. Copy your **Project URL** and **anon public key** from `Settings` -> `API` and add them to your `.env` file.

### Schema Architecture:
- `profiles` — User profile, display name, goal focus, baseline weight.
- `daily_goals` — User daily targets (calories, protein, carbs, fats, water, steps).
- `foods` — Shared global verified foods (`user_id IS NULL`) + user custom foods (`user_id = auth.uid()`).
- `food_diary_entries` — Logged meals with original serving metadata and nutritional values.
- `saved_meals` — Reusable meal templates.
- `workouts` — Logged exercise sessions (type, duration, notes, timestamp).
- `weight_logs` — Time-stamped weigh-in records.
- `daily_activity` — Daily aggregate steps, water intake, and burned calories.

---

## 🧪 Running Tests

The test suite validates nutrition scaling formulas, serving size calculations, macro percentages, and diary totals:
```bash
npm run test
```

---

## 📦 Production Build

To build the optimized production assets:
```bash
npm run build
```
Production assets are generated in `dist/` with vendor and chart code-splitting.

---

## 📁 Project Structure

```
├── supabase/
│   └── migrations/
│       └── 20261011_initial_schema.sql   # Complete PostgreSQL schema & RLS policies
├── src/
│   ├── components/
│   │   ├── auth/                        # ProtectedRoute
│   │   ├── common/                      # Sidebar, Navbar, Modal, Toast
│   │   ├── dashboard/                   # CalorieRing, MacroCards, ActivitySummary, HeroBanner
│   │   ├── food/                        # MealCard, FoodSearchModal, CustomFoodModal
│   │   ├── progress/                    # WeightCheckInForm, WeightHistoryChart
│   │   ├── settings/                    # GoalSettingsForm, ProfileSettingsForm
│   │   └── workouts/                    # WorkoutModal, WeeklyActivityChart, SessionList
│   ├── context/
│   │   ├── AuthContext.jsx              # Supabase session & demo authentication
│   │   └── FitnessContext.jsx           # Real-time fitness state & mutations
│   ├── lib/
│   │   └── supabase.js                  # Supabase client & environment validator
│   ├── pages/
│   │   ├── DashboardPage.jsx            # Energy ring, macro split & quick activity
│   │   ├── FoodDiaryPage.jsx            # Meal breakdown & live food search
│   │   ├── WorkoutsPage.jsx             # Activity journal & weekly charts
│   │   ├── ProgressPage.jsx             # Weight tracking & progress trends
│   │   ├── SettingsPage.jsx             # Personalization & cloud status
│   │   ├── LoginPage.jsx                # User login & guest entry
│   │   ├── RegisterPage.jsx             # Account registration
│   │   └── NotFoundPage.jsx             # 404 page
│   ├── services/
│   │   ├── fitnessService.js            # Persistence layer (Supabase + LocalStore)
│   │   └── nutritionApi.js              # USDA & Open Food Facts integration
│   ├── utils/
│   │   ├── dateUtils.js                 # ISO and localized date formatting
│   │   ├── formatters.js                # Numbers, grams and kcal formatters
│   │   └── nutritionCalculations.js     # Serving scaling & macro formulas
│   ├── App.jsx                          # Layout & React Router DOM configuration
│   ├── index.css                        # Design system tokens & Tailwind imports
│   └── main.jsx                         # Application entry point
├── tests/                               # Vitest unit test suite
├── .env.example                         # Environment configuration template
├── package.json                         # Dependencies & scripts
└── vite.config.js                       # Vite configuration with chunk splitting
```

---

## 📄 License
MIT License.
