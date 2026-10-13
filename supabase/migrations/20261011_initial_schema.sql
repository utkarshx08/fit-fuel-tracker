-- ====================================================================
-- FitFuel 2.0 Hardened Supabase Database Schema Migration
-- ====================================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  goal_type TEXT DEFAULT 'Muscle & fat loss',
  current_weight NUMERIC DEFAULT 75.0,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create daily_goals table
CREATE TABLE IF NOT EXISTS public.daily_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  calories INTEGER NOT NULL DEFAULT 2800 CHECK (calories >= 500 AND calories <= 10000),
  protein INTEGER NOT NULL DEFAULT 160 CHECK (protein >= 0 AND protein <= 1000),
  carbs INTEGER NOT NULL DEFAULT 300 CHECK (carbs >= 0 AND carbs <= 1500),
  fats INTEGER NOT NULL DEFAULT 85 CHECK (fats >= 0 AND fats <= 600),
  water_target NUMERIC DEFAULT 3.0 CHECK (water_target >= 0.5 AND water_target <= 10.0),
  step_target INTEGER DEFAULT 10000 CHECK (step_target >= 1000 AND step_target <= 100000),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create foods table (shared foods + custom user foods)
CREATE TABLE IF NOT EXISTS public.foods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL for shared global food items
  name TEXT NOT NULL,
  brand TEXT,
  serving_size NUMERIC NOT NULL DEFAULT 100 CHECK (serving_size > 0),
  serving_unit TEXT NOT NULL DEFAULT 'g',
  calories NUMERIC NOT NULL CHECK (calories >= 0),
  protein NUMERIC NOT NULL CHECK (protein >= 0),
  carbs NUMERIC NOT NULL CHECK (carbs >= 0),
  fats NUMERIC NOT NULL CHECK (fats >= 0),
  fiber NUMERIC DEFAULT 0 CHECK (fiber >= 0),
  is_custom BOOLEAN DEFAULT false,
  fdc_id TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create food_diary_entries table
CREATE TABLE IF NOT EXISTS public.food_diary_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal TEXT NOT NULL CHECK (meal IN ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
  name TEXT NOT NULL,
  serving_size NUMERIC NOT NULL DEFAULT 1 CHECK (serving_size > 0),
  serving_unit TEXT NOT NULL DEFAULT 'serving',
  calories NUMERIC NOT NULL CHECK (calories >= 0),
  protein NUMERIC NOT NULL CHECK (protein >= 0),
  carbs NUMERIC NOT NULL CHECK (carbs >= 0),
  fats NUMERIC NOT NULL CHECK (fats >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create saved_meals table
CREATE TABLE IF NOT EXISTS public.saved_meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  calories NUMERIC DEFAULT 0 CHECK (calories >= 0),
  protein NUMERIC DEFAULT 0 CHECK (protein >= 0),
  carbs NUMERIC DEFAULT 0 CHECK (carbs >= 0),
  fats NUMERIC DEFAULT 0 CHECK (fats >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Strength', 'Cardio', 'Sports', 'Mobility')),
  duration INTEGER NOT NULL CHECK (duration > 0 AND duration <= 1440),
  notes TEXT,
  workout_date TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Create weight_logs table
CREATE TABLE IF NOT EXISTS public.weight_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC NOT NULL CHECK (weight >= 20 AND weight <= 400),
  logged_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Create daily_activity table
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  steps INTEGER NOT NULL DEFAULT 0 CHECK (steps >= 0),
  water NUMERIC NOT NULL DEFAULT 0 CHECK (water >= 0 AND water <= 20),
  burned_calories INTEGER NOT NULL DEFAULT 0 CHECK (burned_calories >= 0),
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, date)
);

-- ====================================================================
-- Indexes for Query Performance
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_diary_user_date ON public.food_diary_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_foods_user ON public.foods(user_id);
CREATE INDEX IF NOT EXISTS idx_foods_name ON public.foods(name);
CREATE INDEX IF NOT EXISTS idx_saved_meals_user ON public.saved_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_user_date ON public.workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_weights_user_date ON public.weight_logs(user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON public.daily_activity(user_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_shared_name ON public.foods(lower(name)) WHERE user_id IS NULL;

-- ====================================================================
-- Enable Row Level Security (RLS) on all tables
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- ====================================================================
-- Idempotent RLS Policies with Owner Integrity (WITH CHECK clauses)
-- ====================================================================

-- 1. Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Daily Goals
DROP POLICY IF EXISTS "Users can view own goals" ON public.daily_goals;
CREATE POLICY "Users can view own goals"
  ON public.daily_goals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own goals" ON public.daily_goals;
CREATE POLICY "Users can insert own goals"
  ON public.daily_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own goals" ON public.daily_goals;
CREATE POLICY "Users can update own goals"
  ON public.daily_goals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Foods: Shared items (user_id IS NULL) are readable by all authenticated users.
-- Custom items (user_id = auth.uid()) are fully managed by their owner.
DROP POLICY IF EXISTS "Users can view shared foods or own custom foods" ON public.foods;
CREATE POLICY "Users can view shared foods or own custom foods"
  ON public.foods FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own custom foods" ON public.foods;
CREATE POLICY "Users can insert own custom foods"
  ON public.foods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own custom foods" ON public.foods;
CREATE POLICY "Users can update own custom foods"
  ON public.foods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own custom foods" ON public.foods;
CREATE POLICY "Users can delete own custom foods"
  ON public.foods FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Food Diary Entries
DROP POLICY IF EXISTS "Users can view own food diary" ON public.food_diary_entries;
CREATE POLICY "Users can view own food diary"
  ON public.food_diary_entries FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own food diary" ON public.food_diary_entries;
CREATE POLICY "Users can insert own food diary"
  ON public.food_diary_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own food diary" ON public.food_diary_entries;
CREATE POLICY "Users can update own food diary"
  ON public.food_diary_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own food diary" ON public.food_diary_entries;
CREATE POLICY "Users can delete own food diary"
  ON public.food_diary_entries FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Saved Meals
DROP POLICY IF EXISTS "Users can manage own saved meals" ON public.saved_meals;
DROP POLICY IF EXISTS "Users can view own saved meals" ON public.saved_meals;
CREATE POLICY "Users can view own saved meals"
  ON public.saved_meals FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own saved meals" ON public.saved_meals;
CREATE POLICY "Users can insert own saved meals"
  ON public.saved_meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own saved meals" ON public.saved_meals;
CREATE POLICY "Users can update own saved meals"
  ON public.saved_meals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own saved meals" ON public.saved_meals;
CREATE POLICY "Users can delete own saved meals"
  ON public.saved_meals FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Workouts
DROP POLICY IF EXISTS "Users can manage own workouts" ON public.workouts;
DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
CREATE POLICY "Users can view own workouts"
  ON public.workouts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own workouts" ON public.workouts;
CREATE POLICY "Users can insert own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own workouts" ON public.workouts;
CREATE POLICY "Users can update own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own workouts" ON public.workouts;
CREATE POLICY "Users can delete own workouts"
  ON public.workouts FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Weight Logs
DROP POLICY IF EXISTS "Users can manage own weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Users can view own weight logs" ON public.weight_logs;
CREATE POLICY "Users can view own weight logs"
  ON public.weight_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own weight logs" ON public.weight_logs;
CREATE POLICY "Users can insert own weight logs"
  ON public.weight_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own weight logs" ON public.weight_logs;
CREATE POLICY "Users can update own weight logs"
  ON public.weight_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own weight logs" ON public.weight_logs;
CREATE POLICY "Users can delete own weight logs"
  ON public.weight_logs FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Daily Activity
DROP POLICY IF EXISTS "Users can manage own activity" ON public.daily_activity;
DROP POLICY IF EXISTS "Users can view own activity" ON public.daily_activity;
CREATE POLICY "Users can view own activity"
  ON public.daily_activity FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own activity" ON public.daily_activity;
CREATE POLICY "Users can insert own activity"
  ON public.daily_activity FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own activity" ON public.daily_activity;
CREATE POLICY "Users can update own activity"
  ON public.daily_activity FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own activity" ON public.daily_activity;
CREATE POLICY "Users can delete own activity"
  ON public.daily_activity FOR DELETE
  USING (auth.uid() = user_id);

-- ====================================================================
-- Automatic Profile & Goals Creation Trigger
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, goal_type, current_weight)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1), 'FitFuel Athlete'),
    NEW.raw_user_meta_data->>'avatar_url',
    'Muscle & fat loss',
    75.0
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  INSERT INTO public.daily_goals (user_id, calories, protein, carbs, fats)
  VALUES (
    NEW.id,
    2800,
    160,
    300,
    85
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger execution on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- Seed Curated Staple Foods (Shared Items where user_id IS NULL)
-- ====================================================================
INSERT INTO public.foods (user_id, name, brand, serving_size, serving_unit, calories, protein, carbs, fats, fiber, is_custom)
VALUES
  (NULL, 'Chicken Breast (cooked)', 'Whole Foods', 100, 'g', 165, 31, 0, 3.6, 0, false),
  (NULL, 'Whole Large Egg', 'Farm Fresh', 1, 'large egg (50g)', 72, 6.3, 0.4, 4.8, 0, false),
  (NULL, 'Rolled Oats', 'Quaker', 50, 'g', 187, 6.5, 33, 3.2, 5, false),
  (NULL, 'Greek Yogurt (0% Fat)', 'Chobani', 170, 'g', 100, 18, 6, 0.7, 0, false),
  (NULL, 'Brown Rice (cooked)', 'Generic', 150, 'g', 168, 3.8, 35, 1.4, 2.5, false),
  (NULL, 'Salmon Fillet (grilled)', 'Atlantic', 100, 'g', 206, 22, 0, 12, 0, false),
  (NULL, 'Paneer (Cottage Cheese)', 'Amul', 100, 'g', 265, 18.3, 3.4, 20.8, 0, false),
  (NULL, 'Whey Protein Powder', 'Optimum Nutrition', 30, 'g (1 scoop)', 120, 24, 3, 1.5, 1, false),
  (NULL, 'Banana', 'Fresh', 118, 'medium banana', 105, 1.3, 27, 0.3, 3.1, false),
  (NULL, 'Peanut Butter', 'Skippy / Jif', 32, 'g (2 tbsp)', 188, 8, 7, 16, 2, false),
  (NULL, 'Almonds', 'Raw', 28, 'g (handful)', 164, 6, 6, 14, 3.5, false),
  (NULL, 'Sweet Potato (baked)', 'Fresh', 150, 'g', 135, 3, 31, 0.2, 4.5, false),
  (NULL, 'Broccoli (steamed)', 'Fresh', 100, 'g', 35, 2.4, 7.2, 0.4, 2.6, false),
  (NULL, 'Whole Milk', 'Generic', 244, 'ml (1 cup)', 149, 7.7, 11.7, 8, 0, false)
ON CONFLICT (lower(name)) WHERE user_id IS NULL DO NOTHING;

-- ====================================================================
-- Principle of Least Privilege Grants (Minimal & Secure)
-- ====================================================================

-- Revoke default public access on schema
REVOKE ALL ON SCHEMA public FROM PUBLIC;

-- Grant schema usage to anon and authenticated
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Minimum privilege for anonymous clients:
-- Anonymous clients can ONLY view shared verified food items (restricted by RLS: user_id IS NULL).
-- Anonymous users CANNOT read or modify any user profiles, diaries, workouts, or goals.
GRANT SELECT ON public.foods TO anon;

-- Minimum privilege for authenticated clients:
-- Standard CRUD access granted exclusively to authenticated users on application tables.
-- Strict Row Level Security enforces that users can only interact with their own rows.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.foods TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_diary_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_meals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weight_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_activity TO authenticated;
