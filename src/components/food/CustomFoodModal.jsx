import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';

export default function CustomFoodModal({ isOpen, onClose, initialMeal = 'Breakfast' }) {
  const { addFood, addCustomFood } = useFitness();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [meal, setMeal] = useState(initialMeal);
  const [servingSize, setServingSize] = useState('100');
  const [servingUnit, setServingUnit] = useState('g');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fats, setFats] = useState('0');
  const [saveToCustoms, setSaveToCustoms] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !calories) return;

    const foodData = {
      name: name.trim(),
      brand: brand.trim() || 'Custom',
      serving_size: Number(servingSize) || 1,
      serving_unit: servingUnit.trim() || 'serving',
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
    };

    // Save as persistent custom food if checked
    let savedFoodId = null;
    if (saveToCustoms) {
      const saved = await addCustomFood(foodData);
      savedFoodId = saved?.id;
    }

    // Add to today's diary
    await addFood({
      ...foodData,
      food_id: savedFoodId,
      meal,
      source: 'Custom Entry',
    });

    // Reset and close
    setName('');
    setBrand('');
    setCalories('');
    setProtein('0');
    setCarbs('0');
    setFats('0');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom food" eyebrow="MANUAL NUTRITION">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Food name</label>
          <input
            type="text"
            required
            placeholder="e.g., Paneer Bhurji, Homemade Protein Smoothie"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Brand or Source (optional)</label>
            <input
              type="text"
              placeholder="e.g. Homemade, Local Cafe"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Meal</label>
            <select
              value={meal}
              onChange={(e) => setMeal(e.target.value)}
              className="w-full"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Dinner">Dinner</option>
              <option value="Snacks">Snacks</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Serving size</label>
            <input
              type="number"
              min="0.1"
              step="any"
              required
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Serving unit</label>
            <input
              type="text"
              placeholder="e.g. g, ml, bowl, piece"
              required
              value={servingUnit}
              onChange={(e) => setServingUnit(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Calories (kcal)</label>
            <input
              type="number"
              min="0"
              required
              placeholder="350"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Protein (g)</label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Carbs (g)</label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Fats (g)</label>
            <input
              type="number"
              min="0"
              step="any"
              required
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="saveCustoms"
            checked={saveToCustoms}
            onChange={(e) => setSaveToCustoms(e.target.checked)}
            className="w-4 h-4 rounded border-gray-600 text-lime focus:ring-lime"
          />
          <label htmlFor="saveCustoms" className="text-xs text-[#aeb5c3] cursor-pointer">
            Save this item to my reusable custom foods list
          </label>
        </div>

        <p className="text-[10px] text-[#81899a] leading-relaxed m-0">
          Enter nutrition information directly from a package label, recipe estimate, or custom calculation.
        </p>

        <button type="submit" className="primary w-full py-3 justify-center text-xs mt-3">
          Save & Add to Diary
        </button>
      </form>
    </Modal>
  );
}
