import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import Modal from '../common/Modal';
import { searchFoodDatabase } from '../../services/nutritionApi';
import { calculateServingNutrition } from '../../utils/nutritionCalculations';
import { useFitness } from '../../context/FitnessContext';

export default function FoodSearchModal({ isOpen, onClose, initialMeal = 'Breakfast', onOpenCustomFood }) {
  const { customFoods, addFood } = useFitness();

  const [query, setQuery] = useState('');
  const [meal, setMeal] = useState(initialMeal);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [source, setSource] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);

  // Serving calculation controls
  const [quantity, setQuantity] = useState(100);
  const [servingUnit, setServingUnit] = useState('g');
  const [scaledNutrition, setScaledNutrition] = useState({ calories: 0, protein: 0, carbs: 0, fats: 0 });

  useEffect(() => {
    if (initialMeal) {
      setMeal(initialMeal);
    }
  }, [initialMeal]);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedFood(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Debounced Search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setApiError(null);
      setSource('');
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setApiError(null);
      try {
        const { results: res, source: src, error } = await searchFoodDatabase(query, customFoods);
        setResults(res);
        setSource(src);
        if (error) setApiError(error);
      } catch (err) {
        setApiError('Unable to reach external database. You can add foods manually.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, customFoods]);

  // When a food item is selected from search results
  const handleSelectFood = (food) => {
    setSelectedFood(food);
    const initialQty = Number(food.serving_size) || 100;
    const initialUnit = food.serving_unit || 'g';
    setQuantity(initialQty);
    setServingUnit(initialUnit);

    const calculated = calculateServingNutrition(food, initialQty, initialUnit);
    setScaledNutrition(calculated);
  };

  // Recalculate nutrition when quantity changes
  const handleQuantityChange = (val) => {
    setQuantity(val);
    const num = Number(val);
    if (selectedFood) {
      const calculated = calculateServingNutrition(selectedFood, num, servingUnit);
      setScaledNutrition(calculated);
    }
  };

  // Submit to diary
  const handleAddToDiary = async (e) => {
    if (e) e.preventDefault();
    if (!selectedFood || submitting) return;

    setSubmitting(true);
    try {
      const entry = {
        food_id: selectedFood.id,
        name: selectedFood.name,
        meal,
        serving_size: Number(quantity) || 1,
        serving_unit: servingUnit,
        calories: scaledNutrition.calories,
        protein: scaledNutrition.protein,
        carbs: scaledNutrition.carbs,
        fats: scaledNutrition.fats,
        source: selectedFood.source || 'Database',
      };

      await addFood(entry);
      setSelectedFood(null);
      setQuery('');
      setResults([]);
      onClose();
    } catch (err) {
      console.error('Failed to add food to diary:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={selectedFood ? 'Serving size & nutrition' : 'Add food'}
      eyebrow={selectedFood ? 'NUTRITION CALCULATOR' : 'FOOD DATABASE'}
      maxWidth="520px"
    >
      <div className="space-y-3.5">
        {/* If a food IS selected, show clean calculator view */}
        {selectedFood ? (
          <div className="space-y-4 animate-fade-in">
            {/* Top Back / Switch Food link */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="text-xs text-[#9ca3b2] hover:text-white flex items-center gap-1.5 p-0 bg-transparent border-0 font-medium"
              >
                <ArrowLeft size={13} /> Choose a different food
              </button>
              <span className="tag green">{selectedFood.source || 'Database'}</span>
            </div>

            {/* Food Summary Card */}
            <div className="p-3.5 rounded-xl border border-lime/30 bg-[#162013]">
              <b className="text-white text-sm block">{selectedFood.name}</b>
              <small className="text-[#a2af97] text-[11px] block mt-0.5">
                {selectedFood.brand ? `${selectedFood.brand} • ` : ''}Base reference: {selectedFood.serving_size} {selectedFood.serving_unit}
              </small>
            </div>

            {/* Serving Size Quantity Recalculator */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#aeb5c3] font-semibold block mb-1">
                  Serving Amount
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2.5 text-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-[#aeb5c3] font-semibold block mb-1">
                  Unit
                </label>
                <input
                  type="text"
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2.5 text-white text-xs"
                />
              </div>
            </div>

            {/* Meal Selector */}
            <div>
              <label className="text-[10px] text-[#aeb5c3] font-semibold block mb-1">
                Target Meal
              </label>
              <select
                value={meal}
                onChange={(e) => setMeal(e.target.value)}
                className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2.5 text-white text-xs"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
            </div>

            {/* Live Recalculated Nutrition Values */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#252a37] text-center">
              <div className="p-2.5 rounded-xl bg-[#0d1016] border border-[#242936]">
                <span className="text-[9px] text-[#8c93a4] font-semibold block">ENERGY</span>
                <b className="text-white text-xs font-display">{scaledNutrition.calories} kcal</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1016] border border-[#242936]">
                <span className="text-[9px] text-purpleAccent font-semibold block">PROTEIN</span>
                <b className="text-white text-xs font-display">{scaledNutrition.protein} g</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1016] border border-[#242936]">
                <span className="text-[9px] text-orangeAccent font-semibold block">CARBS</span>
                <b className="text-white text-xs font-display">{scaledNutrition.carbs} g</b>
              </div>
              <div className="p-2.5 rounded-xl bg-[#0d1016] border border-[#242936]">
                <span className="text-[9px] text-blueAccent font-semibold block">FATS</span>
                <b className="text-white text-xs font-display">{scaledNutrition.fats} g</b>
              </div>
            </div>

            {/* Add to Diary Action Button */}
            <button
              type="button"
              disabled={submitting}
              onClick={handleAddToDiary}
              className="primary w-full py-3 mt-1 justify-center text-xs font-bold"
            >
              {submitting ? 'Adding to diary...' : `＋ Add to ${meal} Diary`}
            </button>
          </div>
        ) : (
          /* Search view when no food is yet selected */
          <div className="space-y-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search foods (e.g., oats, eggs, chicken, rice)..."
                className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#0d1016] border border-[#303645] rounded-xl text-white placeholder:text-[#6a7282] focus:border-lime"
                autoFocus
              />
              {loading && (
                <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-lime animate-spin" />
              )}
            </div>

            {/* Database indicator and custom food bridge */}
            <div className="flex items-center justify-between text-[11px] text-[#81899a]">
              {source ? (
                <span className="flex items-center gap-1 text-lime">
                  <Sparkles size={12} /> Source: {source}
                </span>
              ) : (
                <span className="text-[#6d7585]">Type to search USDA & verified foods</span>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCustomFood();
                }}
                className="text-lime hover:underline ml-auto flex items-center gap-1 font-semibold bg-transparent border-0"
              >
                <Plus size={12} /> Create custom food
              </button>
            </div>

            {apiError && (
              <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-500/30 text-orange-200 text-[11px] flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Results List */}
            <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1">
              {results.length > 0 ? (
                results.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-3 rounded-xl border border-[#242936] bg-[#12151d] hover:border-lime hover:bg-[#181f20] cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <b className="text-white text-xs block">{food.name}</b>
                      <div className="flex items-center gap-2 text-[10px] text-[#8c93a4] mt-0.5">
                        <span>{food.brand || 'Standard'}</span>
                        <span>•</span>
                        <span>{food.serving_size} {food.serving_unit}</span>
                        <span>•</span>
                        <span className="text-lime font-semibold">{food.calories} kcal</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#b3b9c7]">
                        <span className="text-purpleAccent">{food.protein}p</span> /
                        <span className="text-orangeAccent">{food.carbs}c</span> /
                        <span className="text-blueAccent">{food.fats}f</span>
                      </div>
                      <span className="text-xs text-lime font-bold bg-[#1e2718] px-2 py-1 rounded-md">
                        Select
                      </span>
                    </div>
                  </div>
                ))
              ) : query && !loading ? (
                <div className="p-6 text-center text-[#727a8a] text-xs">
                  <p className="m-0 mb-2">No matching foods found for "{query}".</p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCustomFood();
                    }}
                    className="secondary text-xs"
                  >
                    <Plus size={13} /> Create custom food "{query}"
                  </button>
                </div>
              ) : !query ? (
                <div className="p-5 text-center text-[#727a8a] text-xs">
                  Type any food or brand name to search verified nutritional data.
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
