import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';

export default function GoalSettingsForm() {
  const { goals, updateGoals } = useFitness();

  const [calories, setCalories] = useState(goals.calories || 2800);
  const [protein, setProtein] = useState(goals.protein || 160);
  const [carbs, setCarbs] = useState(goals.carbs || 300);
  const [fats, setFats] = useState(goals.fats || 85);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (goals) {
      setCalories(goals.calories || 2800);
      setProtein(goals.protein || 160);
      setCarbs(goals.carbs || 300);
      setFats(goals.fats || 85);
    }
  }, [goals]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateGoals({
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fats: Number(fats),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="panel mb-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <small className="eyebrow block">NUTRITION TARGETS</small>
          <h3 className="font-display font-bold text-base text-white m-0 mt-1">Daily energy & macro goals</h3>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Calories (kcal)
            </label>
            <input
              type="number"
              min="1000"
              max="7000"
              required
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Protein (g)
            </label>
            <input
              type="number"
              min="20"
              max="400"
              required
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Carbohydrates (g)
            </label>
            <input
              type="number"
              min="20"
              max="800"
              required
              value={carbs}
              onChange={(e) => setCarbs(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Fats (g)
            </label>
            <input
              type="number"
              min="10"
              max="300"
              required
              value={fats}
              onChange={(e) => setFats(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="primary px-6 py-2.5 justify-center text-xs"
        >
          {saving ? 'Saving...' : 'Save daily goals'}
        </button>
      </form>
    </article>
  );
}
