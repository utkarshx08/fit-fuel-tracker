import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Loader2 } from 'lucide-react';

export default function EditFoodModal({ isOpen, onClose, entry, onSave }) {
  const [meal, setMeal] = useState('Breakfast');
  const [servingSize, setServingSize] = useState('1');
  const [servingUnit, setServingUnit] = useState('serving');
  const [calories, setCalories] = useState('0');
  const [protein, setProtein] = useState('0');
  const [carbs, setCarbs] = useState('0');
  const [fats, setFats] = useState('0');
  const [submitting, setSubmitting] = useState(false);

  // Store initial reference to allow proportional auto-scaling when serving changes
  const [baseRef, setBaseRef] = useState(null);

  useEffect(() => {
    if (entry && isOpen) {
      const sSize = Number(entry.serving_size) || 1;
      const c = Number(entry.calories) || 0;
      const p = Number(entry.protein) || 0;
      const cb = Number(entry.carbs) || 0;
      const f = Number(entry.fats) || 0;

      setMeal(entry.meal || 'Breakfast');
      setServingSize(String(sSize));
      setServingUnit(entry.serving_unit || 'serving');
      setCalories(String(c));
      setProtein(String(p));
      setCarbs(String(cb));
      setFats(String(f));

      setBaseRef({
        servingSize: sSize > 0 ? sSize : 1,
        calories: c,
        protein: p,
        carbs: cb,
        fats: f,
      });
    }
  }, [entry, isOpen]);

  if (!entry) return null;

  // Auto-scale macros when serving amount changes
  const handleServingChange = (val) => {
    setServingSize(val);
    const num = Number(val);
    if (baseRef && !isNaN(num) && num > 0 && baseRef.servingSize > 0) {
      const ratio = num / baseRef.servingSize;
      setCalories(String(Math.max(0, Math.round(baseRef.calories * ratio))));
      setProtein(String(Math.max(0, Math.round(baseRef.protein * ratio * 10) / 10)));
      setCarbs(String(Math.max(0, Math.round(baseRef.carbs * ratio * 10) / 10)));
      setFats(String(Math.max(0, Math.round(baseRef.fats * ratio * 10) / 10)));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await onSave(entry.id, {
        meal,
        serving_size: Number(servingSize) || 1,
        serving_unit: servingUnit.trim() || 'serving',
        calories: Math.max(0, Math.round(Number(calories) || 0)),
        protein: Math.max(0, Math.round((Number(protein) || 0) * 10) / 10),
        carbs: Math.max(0, Math.round((Number(carbs) || 0) * 10) / 10),
        fats: Math.max(0, Math.round((Number(fats) || 0) * 10) / 10),
      });
      onClose();
    } catch (err) {
      console.error('Failed to update food entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit food entry"
      eyebrow="NUTRITION JOURNAL"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Food name banner */}
        <div className="p-3.5 rounded-xl border border-lime/30 bg-[#162013]">
          <span className="text-[10px] text-[#a2af97] font-semibold block uppercase tracking-wider">
            Item Name
          </span>
          <b className="text-white text-sm block mt-0.5 truncate">{entry.name}</b>
        </div>

        {/* Meal Category Dropdown */}
        <div>
          <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
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

        {/* Serving Size and Unit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Serving amount
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              required
              value={servingSize}
              onChange={(e) => handleServingChange(e.target.value)}
              className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2.5 text-white text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Serving unit
            </label>
            <input
              type="text"
              required
              value={servingUnit}
              onChange={(e) => setServingUnit(e.target.value)}
              className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2.5 text-white text-xs"
            />
          </div>
        </div>

        {/* Nutrition values */}
        <div className="p-3.5 rounded-xl bg-[#0e1117] border border-[#232936] space-y-3">
          <span className="text-[10px] text-[#8e96a8] font-bold block uppercase tracking-wider">
            Nutritional Values (Adjustable)
          </span>

          <div>
            <label className="text-[10px] text-[#aeb5c3] font-semibold block mb-1">
              Total Calories (kcal)
            </label>
            <input
              type="number"
              min="0"
              required
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2 text-white text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-purpleAccent font-semibold block mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-orangeAccent font-semibold block mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2 text-white text-xs"
              />
            </div>

            <div>
              <label className="text-[10px] text-blueAccent font-semibold block mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                required
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                className="w-full bg-[#0d1016] border border-[#303645] rounded-lg p-2 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="secondary flex-1 py-2.5 justify-center text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="primary flex-1 py-2.5 justify-center text-xs font-bold"
          >
            {submitting ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
