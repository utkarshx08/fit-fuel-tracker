import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as fitnessService from '../services/fitnessService';
import { calculateDiaryTotals, calculateRemainingCalories } from '../utils/nutritionCalculations';
import { toIsoDate } from '../utils/dateUtils';

const FitnessContext = createContext(null);

export function FitnessProvider({ children }) {
  const { user, isConfigured } = useAuth();
  const userId = user?.id || null;

  const [selectedDate, setSelectedDate] = useState(toIsoDate());
  const [profile, setProfile] = useState({ full_name: 'Utkarsh', goal_type: 'Muscle & fat loss', current_weight: 75.0 });
  const [goals, setGoals] = useState({ calories: 2800, protein: 160, carbs: 300, fats: 85 });
  const [foods, setFoods] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [weights, setWeights] = useState([]);
  const [activity, setActivity] = useState({ steps: 7420, water: 1.5, burned_calories: 0 });
  const [customFoods, setCustomFoods] = useState([]);
  const [savedMeals, setSavedMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dbReadiness, setDbReadiness] = useState({
    mode: isConfigured ? 'checking' : 'demo',
    ready: false,
    message: isConfigured ? 'Checking cloud connection...' : 'Local / Demo Mode',
  });

  // Toast feedback state
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const toastTimeoutRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ show: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2400);
  }, []);

  // Cleanup active toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Fetch all initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        profileData,
        goalsData,
        diaryData,
        workoutsData,
        weightsData,
        activityData,
        customFoodsData,
        savedMealsData,
        readiness,
      ] = await Promise.all([
        fitnessService.getProfile(userId),
        fitnessService.getDailyGoals(userId),
        fitnessService.getFoodDiary(userId, selectedDate),
        fitnessService.getWorkouts(userId),
        fitnessService.getWeightLogs(userId),
        fitnessService.getDailyActivity(userId, selectedDate),
        fitnessService.getCustomFoods(userId),
        fitnessService.getSavedMeals(userId),
        fitnessService.checkDatabaseReadiness(),
      ]);

      if (profileData) setProfile(profileData);
      if (goalsData) setGoals(goalsData);
      if (diaryData) setFoods(diaryData);
      if (workoutsData) setWorkouts(workoutsData);
      if (weightsData) setWeights(weightsData);
      if (activityData) setActivity(activityData);
      if (customFoodsData) setCustomFoods(customFoodsData);
      if (savedMealsData) setSavedMeals(savedMealsData);
      if (readiness) setDbReadiness(readiness);
    } catch (err) {
      console.error('Error loading fitness data:', err);
      showToast('Error syncing with cloud, using local cache', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedDate, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Derived nutrition totals
  const totals = useMemo(() => {
    return calculateDiaryTotals(foods);
  }, [foods]);

  const caloriesRemaining = useMemo(() => {
    return calculateRemainingCalories(goals.calories, totals.calories, activity.burned_calories || 0);
  }, [goals.calories, totals.calories, activity.burned_calories]);

  // Food Diary Actions
  const addFood = async (entry) => {
    try {
      const saved = await fitnessService.addFoodDiaryEntry(userId, {
        ...entry,
        entry_date: selectedDate,
      });
      setFoods((prev) => [...prev, saved]);
      showToast('Food added to your diary!', 'success');
      return saved;
    } catch (err) {
      console.error('Error adding food:', err);
      showToast('Failed to add food entry', 'error');
      throw err;
    }
  };

  const updateFood = async (entryId, updates) => {
    try {
      const updated = await fitnessService.updateFoodDiaryEntry(userId, entryId, updates);
      setFoods((prev) => prev.map((f) => (f.id === entryId ? { ...f, ...updated } : f)));
      showToast('Food entry updated.', 'success');
      return updated;
    } catch (err) {
      console.error('Error updating food:', err);
      showToast('Failed to update food entry', 'error');
      throw err;
    }
  };

  const deleteFood = async (entryId) => {
    try {
      await fitnessService.deleteFoodDiaryEntry(userId, entryId);
      setFoods((prev) => prev.filter((f) => f.id !== entryId));
      showToast('Food entry removed.', 'info');
    } catch (err) {
      console.error('Error removing food:', err);
      showToast('Failed to remove food entry', 'error');
      throw err;
    }
  };

  const addCustomFood = async (food) => {
    try {
      const saved = await fitnessService.createCustomFood(userId, food);
      setCustomFoods((prev) => [...prev, saved]);
      showToast(`Custom food "${saved.name}" saved!`, 'success');
      return saved;
    } catch (err) {
      console.error('Error saving custom food:', err);
      showToast('Failed to create custom food', 'error');
      throw err;
    }
  };

  // Saved Meals Actions
  const addSavedMeal = async (mealData) => {
    try {
      const saved = await fitnessService.createSavedMeal(userId, mealData);
      setSavedMeals((prev) => [saved, ...prev]);
      showToast(`Saved meal "${saved.name}" created!`, 'success');
      return saved;
    } catch (err) {
      console.error('Error creating saved meal:', err);
      showToast('Failed to save meal template', 'error');
      throw err;
    }
  };

  const deleteSavedMeal = async (mealId) => {
    try {
      await fitnessService.deleteSavedMeal(userId, mealId);
      setSavedMeals((prev) => prev.filter((m) => m.id !== mealId));
      showToast('Saved meal removed.', 'info');
    } catch (err) {
      console.error('Error deleting saved meal:', err);
      showToast('Failed to remove saved meal', 'error');
      throw err;
    }
  };

  const logSavedMeal = async (savedMeal, mealCategory = 'Lunch') => {
    try {
      const items = Array.isArray(savedMeal.items) ? savedMeal.items : [];
      if (items.length === 0) {
        // Fallback: log the meal as a single entry
        await addFood({
          name: savedMeal.name,
          meal: mealCategory,
          serving_size: 1,
          serving_unit: 'meal',
          calories: savedMeal.calories || 0,
          protein: savedMeal.protein || 0,
          carbs: savedMeal.carbs || 0,
          fats: savedMeal.fats || 0,
        });
      } else {
        for (const item of items) {
          await addFood({
            ...item,
            meal: mealCategory,
          });
        }
      }
      showToast(`Meal "${savedMeal.name}" logged to ${mealCategory}!`, 'success');
    } catch (err) {
      console.error('Error logging saved meal:', err);
      showToast('Failed to log saved meal', 'error');
      throw err;
    }
  };

  // Workout Actions
  const addWorkout = async (workout) => {
    try {
      const saved = await fitnessService.addWorkout(userId, workout);
      setWorkouts((prev) => [saved, ...prev]);
      showToast('Workout logged. Great work!', 'success');
      return saved;
    } catch (err) {
      console.error('Error adding workout:', err);
      showToast('Failed to log workout', 'error');
      throw err;
    }
  };

  const deleteWorkout = async (workoutId) => {
    try {
      await fitnessService.deleteWorkout(userId, workoutId);
      setWorkouts((prev) => prev.filter((w) => w.id !== workoutId));
      showToast('Workout removed.', 'info');
    } catch (err) {
      console.error('Error removing workout:', err);
      showToast('Failed to remove workout', 'error');
      throw err;
    }
  };

  // Weight Check-in
  const addWeightCheckIn = async (weight) => {
    try {
      const saved = await fitnessService.addWeightLog(userId, weight);
      setWeights((prev) => [saved, ...prev]);
      setProfile((prev) => ({ ...prev, current_weight: Number(weight) }));
      showToast('Weight check-in saved!', 'success');
      return saved;
    } catch (err) {
      console.error('Error adding weight log:', err);
      showToast('Failed to save weight', 'error');
      throw err;
    }
  };

  // Activity Updates (Steps, Hydration)
  const addSteps = async (amount = 1000) => {
    const nextSteps = (activity.steps || 0) + amount;
    const updated = { ...activity, steps: nextSteps };
    setActivity(updated);
    try {
      await fitnessService.updateDailyActivity(userId, selectedDate, { steps: nextSteps });
      showToast(`+${amount.toLocaleString()} steps added!`, 'success');
    } catch (err) {
      console.warn('Failed to sync steps:', err);
    }
  };

  const addWater = async (amount = 0.25) => {
    const nextWater = Math.min(10, Math.round(((activity.water || 0) + amount) * 100) / 100);
    const updated = { ...activity, water: nextWater };
    setActivity(updated);
    try {
      await fitnessService.updateDailyActivity(userId, selectedDate, { water: nextWater });
      showToast(`+${Math.round(amount * 1000)} ml water logged!`, 'success');
    } catch (err) {
      console.warn('Failed to sync water:', err);
    }
  };

  // Goals & Profile
  const updateGoals = async (newGoals) => {
    try {
      const saved = await fitnessService.saveDailyGoals(userId, newGoals);
      setGoals(saved);
      showToast('Daily goals updated.', 'success');
      return saved;
    } catch (err) {
      console.error('Error saving goals:', err);
      showToast('Failed to update goals', 'error');
      throw err;
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const saved = await fitnessService.updateProfile(userId, profileData);
      setProfile(saved);
      showToast('Profile updated.', 'success');
      return saved;
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('Failed to update profile', 'error');
      throw err;
    }
  };

  const storageMode = dbReadiness.mode || (isConfigured ? 'local_fallback' : 'demo');

  const value = {
    selectedDate,
    setSelectedDate,
    profile,
    goals,
    foods,
    workouts,
    weights,
    activity,
    customFoods,
    savedMeals,
    dbReadiness,
    storageMode,
    totals,
    caloriesRemaining,
    loading,
    toast,
    showToast,
    addFood,
    updateFood,
    deleteFood,
    addCustomFood,
    addSavedMeal,
    deleteSavedMeal,
    logSavedMeal,
    addWorkout,
    deleteWorkout,
    addWeightCheckIn,
    addSteps,
    addWater,
    updateGoals,
    updateUserProfile,
    refreshData: loadData,
  };

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>;
}

export function useFitness() {
  const context = useContext(FitnessContext);
  if (!context) {
    throw new Error('useFitness must be used within a FitnessProvider');
  }
  return context;
}
