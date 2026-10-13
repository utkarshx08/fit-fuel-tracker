/**
 * Fitness & Nutrition Data Persistence Service
 * Interacts with Supabase PostgreSQL tables with automatic fallback to localStorage
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { toIsoDate } from '../utils/dateUtils';

const LOCAL_STORAGE_KEY = 'fitfuel_data_v2';

/**
 * Validates if a string is a standard UUID.
 * Supabase PostgreSQL UUID columns require valid UUIDs (or null).
 */
export function isValidUuid(str) {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str.trim());
}

/**
 * Checks if the user is authenticated in Supabase with an active session matching userId.
 * Supabase Row Level Security requires auth.uid() = user_id for all table operations.
 */
export async function isSupabaseAuthenticatedUser(userId) {
  if (!isSupabaseConfigured() || !supabase || !isValidUuid(userId)) return false;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return Boolean(session?.user?.id === userId);
  } catch {
    return false;
  }
}

const DEFAULT_BASE_STATE = {
  goals: {
    calories: 2800,
    protein: 160,
    carbs: 300,
    fats: 85,
    water_target: 3.0,
    step_target: 10000,
  },
  foods: [
    {
      id: 'demo-1',
      name: 'Oats with milk',
      meal: 'Breakfast',
      serving_size: 1,
      serving_unit: 'bowl',
      calories: 350,
      protein: 15,
      carbs: 50,
      fats: 10,
      entry_date: toIsoDate(),
    },
    {
      id: 'demo-2',
      name: 'Eggs & toast',
      meal: 'Breakfast',
      serving_size: 2,
      serving_unit: 'eggs + toast',
      calories: 250,
      protein: 20,
      carbs: 20,
      fats: 10,
      entry_date: toIsoDate(),
    },
    {
      id: 'demo-3',
      name: 'Chicken, rice & vegetables',
      meal: 'Lunch',
      serving_size: 1,
      serving_unit: 'plate',
      calories: 450,
      protein: 38,
      carbs: 45,
      fats: 9,
      entry_date: toIsoDate(),
    },
  ],
  workouts: [
    {
      id: 'demo-w1',
      name: 'Upper body strength',
      type: 'Strength',
      duration: 45,
      notes: 'Push + pull compounds, 4 sets bench, 4 sets pullups',
      workout_date: new Date().toISOString(),
    },
  ],
  weights: [
    {
      id: 'demo-wt1',
      weight: 75.0,
      logged_at: new Date().toISOString(),
    },
  ],
  customFoods: [],
  savedMeals: [],
  activity: {
    steps: 7420,
    water: 1.5,
    burned_calories: 0,
  },
};

// -------------------------------------------------------------
// Local Storage Helper with User-Level Partitioning
// -------------------------------------------------------------
function getStoreKey(userId) {
  if (isValidUuid(userId)) {
    return `fitfuel_data_user_${userId}`;
  }
  return LOCAL_STORAGE_KEY;
}

const NEW_USER_INITIAL_STATE = {
  profile: { full_name: 'Fitness Member', goal_type: 'Muscle & fat loss', current_weight: 70.0 },
  goals: {
    calories: 2200,
    protein: 150,
    carbs: 250,
    fats: 70,
    water_target: 3.0,
    step_target: 10000,
  },
  foods: [],
  workouts: [],
  weights: [],
  customFoods: [],
  savedMeals: [],
  activity: {
    steps: 0,
    water: 0,
    burned_calories: 0,
  },
};

// In-memory fallback if localStorage is restricted (private browsing / disabled cookies / node tests)
const memoryStore = new Map();

const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof localStorage !== 'undefined') {
        return localStorage.getItem(key);
      }
    } catch (e) {
      // SecurityError or restricted quota
    }
    return memoryStore.get(key) || null;
  },
  setItem: (key, val) => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, val);
        return;
      }
    } catch (e) {
      // SecurityError or quota exceeded
    }
    memoryStore.set(key, val);
  },
  clear: () => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.clear();
      }
    } catch (e) {}
    memoryStore.clear();
  },
};

function getLocalStore(userId = null) {
  const storeKey = getStoreKey(userId);
  try {
    const raw = safeStorage.getItem(storeKey);
    if (!raw) {
      if (isValidUuid(userId)) {
        // Initialize fresh state for new real Supabase users
        safeStorage.setItem(storeKey, JSON.stringify(NEW_USER_INITIAL_STATE));
        return { ...NEW_USER_INITIAL_STATE };
      }

      // Check legacy 'fitfuel' key to migrate seamlessly for guest / demo users
      const legacyRaw = safeStorage.getItem('fitfuel');
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        const migrated = {
          ...DEFAULT_BASE_STATE,
          goals: { ...DEFAULT_BASE_STATE.goals, ...(legacy.goals || {}) },
          foods: (legacy.foods || []).map((f) => ({
            ...f,
            entry_date: toIsoDate(),
            serving_size: 1,
            serving_unit: 'serving',
          })),
          workouts: legacy.workouts || DEFAULT_BASE_STATE.workouts,
          weights: legacy.weights || DEFAULT_BASE_STATE.weights,
          activity: {
            steps: legacy.steps || 7420,
            water: legacy.water || 1.5,
            burned_calories: legacy.burned || 0,
          },
        };
        safeStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
      safeStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BASE_STATE));
      return { ...DEFAULT_BASE_STATE };
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Error reading from localStorage, using defaults:', err);
    return isValidUuid(userId) ? { ...NEW_USER_INITIAL_STATE } : { ...DEFAULT_BASE_STATE };
  }
}

function saveLocalStore(data, userId = null) {
  const storeKey = getStoreKey(userId);
  try {
    safeStorage.setItem(storeKey, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

// -------------------------------------------------------------
// Profile & Goals
// -------------------------------------------------------------
export async function getProfile(userId) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.profile = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getProfile fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return store.profile || { full_name: 'Utkarsh', goal_type: 'Muscle & fat loss', current_weight: 75.0 };
}

export async function updateProfile(userId, profileData) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...profileData, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.profile = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('updateProfile fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  store.profile = { ...(store.profile || {}), ...profileData };
  saveLocalStore(store, userId);
  return store.profile;
}

export async function getDailyGoals(userId) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.goals = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getDailyGoals fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return store.goals || DEFAULT_BASE_STATE.goals;
}

export async function saveDailyGoals(userId, goals) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('daily_goals')
        .upsert({
          user_id: userId,
          calories: Number(goals.calories),
          protein: Number(goals.protein),
          carbs: Number(goals.carbs),
          fats: Number(goals.fats),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.goals = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('saveDailyGoals fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  store.goals = { ...store.goals, ...goals };
  saveLocalStore(store, userId);
  return store.goals;
}

// -------------------------------------------------------------
// Food Diary
// -------------------------------------------------------------
export async function getFoodDiary(userId, dateStr = toIsoDate()) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('food_diary_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_date', dateStr)
        .order('created_at', { ascending: true });
      if (!error && Array.isArray(data)) {
        const store = getLocalStore(userId);
        const otherDays = (store.foods || []).filter((f) => f.entry_date !== dateStr);
        store.foods = [...otherDays, ...data];
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getFoodDiary fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return (store.foods || []).filter((f) => f.entry_date === dateStr);
}

export async function addFoodDiaryEntry(userId, entry) {
  const prepared = {
    ...entry,
    calories: Math.round(Number(entry.calories) || 0),
    protein: Math.round(Number(entry.protein) || 0),
    carbs: Math.round(Number(entry.carbs) || 0),
    fats: Math.round(Number(entry.fats) || 0),
    serving_size: Number(entry.serving_size) || 1,
    serving_unit: entry.serving_unit || 'serving',
    entry_date: entry.entry_date || toIsoDate(),
  };

  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const validFoodId = isValidUuid(entry.food_id) ? entry.food_id : null;
      const { data, error } = await supabase
        .from('food_diary_entries')
        .insert({
          user_id: userId,
          food_id: validFoodId,
          entry_date: prepared.entry_date,
          meal: prepared.meal,
          name: prepared.name,
          serving_size: prepared.serving_size,
          serving_unit: prepared.serving_unit,
          calories: prepared.calories,
          protein: prepared.protein,
          carbs: prepared.carbs,
          fats: prepared.fats,
        })
        .select()
        .single();

      if (!error && data) {
        const store = getLocalStore(userId);
        store.foods = [...(store.foods || []), data];
        saveLocalStore(store, userId);
        return data;
      }
      console.warn('Supabase food insert error, falling back locally:', error?.message);
    } catch (err) {
      console.warn('Supabase exception, falling back locally:', err?.message);
    }
  }

  // Fallback to local storage (for demo users, unauthenticated test runs, or offline mode)
  const store = getLocalStore(userId);
  const newEntry = {
    ...prepared,
    id: entry.id || `food-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    created_at: new Date().toISOString(),
  };
  store.foods = [...(store.foods || []), newEntry];
  saveLocalStore(store, userId);
  return newEntry;
}

export async function updateFoodDiaryEntry(userIdOrEntryId, entryIdOrUpdates, maybeUpdates) {
  let userId = null;
  let entryId = null;
  let updates = {};

  if (maybeUpdates !== undefined) {
    userId = userIdOrEntryId;
    entryId = entryIdOrUpdates;
    updates = maybeUpdates;
  } else {
    entryId = userIdOrEntryId;
    updates = entryIdOrUpdates || {};
  }

  if (await isSupabaseAuthenticatedUser(userId) && isValidUuid(entryId)) {
    try {
      const { data, error } = await supabase
        .from('food_diary_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entryId)
        .eq('user_id', userId)
        .select()
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.foods = (store.foods || []).map((f) => (f.id === entryId ? data : f));
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('updateFoodDiaryEntry fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  store.foods = (store.foods || []).map((f) =>
    f.id === entryId ? { ...f, ...updates, updated_at: new Date().toISOString() } : f
  );
  saveLocalStore(store, userId);
  return store.foods.find((f) => f.id === entryId);
}

export async function deleteFoodDiaryEntry(userIdOrEntryId, maybeEntryId) {
  const userId = maybeEntryId !== undefined ? userIdOrEntryId : null;
  const entryId = maybeEntryId !== undefined ? maybeEntryId : userIdOrEntryId;

  if (await isSupabaseAuthenticatedUser(userId) && isValidUuid(entryId)) {
    try {
      await supabase
        .from('food_diary_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('deleteFoodDiaryEntry fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  store.foods = (store.foods || []).filter((f) => f.id !== entryId);
  saveLocalStore(store, userId);
  return true;
}

// -------------------------------------------------------------
// Custom Foods
// -------------------------------------------------------------
export async function getCustomFoods(userId) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('user_id', userId)
        .eq('is_custom', true);
      if (!error && Array.isArray(data)) {
        const store = getLocalStore(userId);
        store.customFoods = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getCustomFoods fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return store.customFoods || [];
}

export async function createCustomFood(userId, food) {
  const prepared = {
    name: food.name,
    brand: food.brand || 'Custom',
    serving_size: Number(food.serving_size) || 100,
    serving_unit: food.serving_unit || 'g',
    calories: Number(food.calories) || 0,
    protein: Number(food.protein) || 0,
    carbs: Number(food.carbs) || 0,
    fats: Number(food.fats) || 0,
    fiber: Number(food.fiber) || 0,
    is_custom: true,
  };

  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('foods')
        .insert({
          user_id: userId,
          ...prepared,
        })
        .select()
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.customFoods = [...(store.customFoods || []), data];
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('createCustomFood fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  const newFood = {
    ...prepared,
    id: `custom-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  store.customFoods = [...(store.customFoods || []), newFood];
  saveLocalStore(store, userId);
  return newFood;
}

// -------------------------------------------------------------
// Saved Meals
// -------------------------------------------------------------
export async function getSavedMeals(userId) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('saved_meals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const store = getLocalStore(userId);
        store.savedMeals = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getSavedMeals fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return store.savedMeals || [];
}

export async function createSavedMeal(userId, mealData) {
  const prepared = {
    name: mealData.name,
    description: mealData.description || '',
    items: Array.isArray(mealData.items) ? mealData.items : [],
    calories: Math.round(Number(mealData.calories) || 0),
    protein: Math.round(Number(mealData.protein) || 0),
    carbs: Math.round(Number(mealData.carbs) || 0),
    fats: Math.round(Number(mealData.fats) || 0),
  };

  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('saved_meals')
        .insert({
          user_id: userId,
          ...prepared,
        })
        .select()
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.savedMeals = [data, ...(store.savedMeals || [])];
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('createSavedMeal fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  const newMeal = {
    ...prepared,
    id: `meal-${Date.now()}`,
    created_at: new Date().toISOString(),
  };
  store.savedMeals = [newMeal, ...(store.savedMeals || [])];
  saveLocalStore(store, userId);
  return newMeal;
}

export async function deleteSavedMeal(userIdOrMealId, maybeMealId) {
  const userId = maybeMealId !== undefined ? userIdOrMealId : null;
  const mealId = maybeMealId !== undefined ? maybeMealId : userIdOrMealId;

  if (await isSupabaseAuthenticatedUser(userId) && isValidUuid(mealId)) {
    try {
      await supabase
        .from('saved_meals')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('deleteSavedMeal fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  store.savedMeals = (store.savedMeals || []).filter((m) => m.id !== mealId);
  saveLocalStore(store, userId);
  return true;
}

// -------------------------------------------------------------
// Workouts
// -------------------------------------------------------------
export async function getWorkouts(userId) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('workout_date', { ascending: false });
      if (!error && Array.isArray(data)) {
        const store = getLocalStore(userId);
        store.workouts = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getWorkouts fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return store.workouts || DEFAULT_BASE_STATE.workouts;
}

export async function addWorkout(userId, workout) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name: workout.name,
          type: workout.type,
          duration: Number(workout.duration),
          notes: workout.notes || '',
          workout_date: workout.workout_date || new Date().toISOString(),
        })
        .select()
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.workouts = [data, ...(store.workouts || [])];
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('addWorkout fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  const newWorkout = {
    ...workout,
    id: `w-${Date.now()}`,
    workout_date: workout.workout_date || new Date().toISOString(),
  };
  store.workouts = [newWorkout, ...(store.workouts || [])];
  saveLocalStore(store, userId);
  return newWorkout;
}

export async function deleteWorkout(userIdOrWorkoutId, maybeWorkoutId) {
  const userId = maybeWorkoutId !== undefined ? userIdOrWorkoutId : null;
  const workoutId = maybeWorkoutId !== undefined ? maybeWorkoutId : userIdOrWorkoutId;

  if (await isSupabaseAuthenticatedUser(userId) && isValidUuid(workoutId)) {
    try {
      await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', userId);
    } catch (err) {
      console.warn('deleteWorkout fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  store.workouts = (store.workouts || []).filter((w) => w.id !== workoutId);
  saveLocalStore(store, userId);
  return true;
}

// -------------------------------------------------------------
// Weight Logs
// -------------------------------------------------------------
export async function getWeightLogs(userId) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('user_id', userId)
        .order('logged_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        const store = getLocalStore(userId);
        store.weights = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getWeightLogs fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return store.weights || DEFAULT_BASE_STATE.weights;
}

export async function addWeightLog(userId, weight) {
  const numWeight = Number(weight);
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .insert({
          user_id: userId,
          weight: numWeight,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.weights = [data, ...(store.weights || [])];
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('addWeightLog fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  const newLog = {
    id: `wt-${Date.now()}`,
    weight: numWeight,
    logged_at: new Date().toISOString(),
  };
  store.weights = [newLog, ...(store.weights || [])];
  saveLocalStore(store, userId);
  return newLog;
}

// -------------------------------------------------------------
// Daily Activity (Steps, Hydration, Burned)
// -------------------------------------------------------------
export async function getDailyActivity(userId, dateStr = toIsoDate()) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('daily_activity')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateStr)
        .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.activity = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('getDailyActivity fallback:', err);
    }
  }
  const store = getLocalStore(userId);
  return store.activity || DEFAULT_BASE_STATE.activity;
}

export async function updateDailyActivity(userId, dateStr = toIsoDate(), updates = {}) {
  if (await isSupabaseAuthenticatedUser(userId)) {
    try {
      const { data, error } = await supabase
        .from('daily_activity')
        .upsert({
          user_id: userId,
          date: dateStr,
          ...updates,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id, date' })
          .select()
          .single();
      if (!error && data) {
        const store = getLocalStore(userId);
        store.activity = data;
        saveLocalStore(store, userId);
        return data;
      }
    } catch (err) {
      console.warn('updateDailyActivity fallback:', err);
    }
  }

  const store = getLocalStore(userId);
  store.activity = { ...(store.activity || DEFAULT_BASE_STATE.activity), ...updates };
  saveLocalStore(store, userId);
  return store.activity;
}

// -------------------------------------------------------------
// Database Health & Table Schema Diagnostics
// -------------------------------------------------------------
export async function checkDatabaseReadiness() {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      mode: 'demo',
      ready: false,
      message: 'Running in Local / Demo Mode (no Supabase credentials)',
    };
  }

  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (!error) {
      return {
        mode: 'cloud',
        ready: true,
        message: 'Connected to Supabase PostgreSQL cloud database',
      };
    }
    if (
      error.code === 'PGRST205' ||
      error.message?.includes('schema cache') ||
      error.message?.includes('not find the table')
    ) {
      return {
        mode: 'local_fallback',
        ready: false,
        pendingMigration: true,
        message: 'Database schema migration pending in Supabase (PGRST205)',
      };
    }
    return {
      mode: 'local_fallback',
      ready: false,
      message: error.message,
    };
  } catch (err) {
    return {
      mode: 'local_fallback',
      ready: false,
      message: err.message,
    };
  }
}

export async function verifyAllTables() {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      configured: false,
      allReady: false,
      readyCount: 0,
      missingCount: 8,
      totalCount: 8,
      tables: {},
      summary: 'Supabase credentials not configured in .env',
    };
  }

  const tableSpecs = [
    { name: 'profiles', columns: 'id, full_name, goal_type, current_weight' },
    { name: 'daily_goals', columns: 'id, user_id, calories, protein, carbs, fats' },
    { name: 'foods', columns: 'id, name, serving_size, calories, protein' },
    { name: 'food_diary_entries', columns: 'id, user_id, meal, name, calories' },
    { name: 'saved_meals', columns: 'id, user_id, name, items' },
    { name: 'workouts', columns: 'id, user_id, name, type, duration' },
    { name: 'weight_logs', columns: 'id, user_id, weight, logged_at' },
    { name: 'daily_activity', columns: 'id, user_id, date, steps, water' },
  ];

  const results = {};
  let missingCount = 0;
  let readyCount = 0;

  for (const { name, columns } of tableSpecs) {
    const t0 = Date.now();
    try {
      const { data, error } = await supabase.from(name).select(columns).limit(1);
      const latency = Date.now() - t0;
      if (!error) {
        results[name] = {
          status: 'ok',
          latency,
          error: null,
          message: 'Table & columns verified in schema cache',
        };
        readyCount++;
      } else if (
        error.code === 'PGRST205' ||
        error.message?.includes('schema cache') ||
        error.message?.includes('not find the table')
      ) {
        results[name] = {
          status: 'missing',
          latency,
          error: error.message,
          message: 'Table not found in schema cache (PGRST205). Migration required.',
        };
        missingCount++;
      } else if (error.code === '42501' || error.code === 'PGRST301') {
        results[name] = {
          status: 'permission_restricted',
          latency,
          error: error.message,
          message: 'Table exists; RLS enforced for current authentication role',
        };
        readyCount++;
      } else {
        results[name] = {
          status: 'error',
          latency,
          error: error.message,
          message: error.message,
        };
      }
    } catch (err) {
      results[name] = {
        status: 'network_error',
        latency: Date.now() - t0,
        error: err.message,
        message: err.message,
      };
    }
  }

  const allReady = readyCount === tableSpecs.length;
  return {
    configured: true,
    allReady,
    readyCount,
    missingCount,
    totalCount: tableSpecs.length,
    tables: results,
    summary: allReady
      ? 'All 8 PostgreSQL tables verified and operational'
      : `${missingCount} of ${tableSpecs.length} tables missing from schema cache`,
  };
}
