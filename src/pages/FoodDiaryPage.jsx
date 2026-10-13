import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { formatNumber } from '../utils/formatters';
import MealCard from '../components/food/MealCard';
import FoodSearchModal from '../components/food/FoodSearchModal';
import CustomFoodModal from '../components/food/CustomFoodModal';
import EditFoodModal from '../components/food/EditFoodModal';

export default function FoodDiaryPage() {
  const { foods, goals, totals, caloriesRemaining, deleteFood, updateFood } = useFitness();

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [activeMeal, setActiveMeal] = useState('Breakfast');

  const mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  const handleOpenAddFood = (mealName = 'Breakfast') => {
    setActiveMeal(mealName);
    setSearchModalOpen(true);
  };

  const handleOpenCustomFood = (mealName = 'Breakfast') => {
    setActiveMeal(mealName);
    setCustomModalOpen(true);
  };

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page Heading */}
      <div className="section-title page-heading flex items-center justify-between mb-6">
        <div>
          <small className="eyebrow block">NUTRITION JOURNAL</small>
          <h2 className="font-display font-extrabold text-2xl text-white m-0">Food diary</h2>
          <p className="text-muted text-xs m-0">Log meals and keep an eye on your daily fuel.</p>
        </div>

        <button
          onClick={() => handleOpenAddFood('Breakfast')}
          className="primary flex items-center gap-1.5"
        >
          <Plus size={15} /> Add food
        </button>
      </div>

      {/* Food Summary Hero Banner */}
      <div className="panel food-summary flex items-center justify-between p-6 bg-gradient-to-r from-[#1d2718] to-[#141a15] border-[#303c27] mb-6">
        <div>
          <small className="eyebrow block text-[#a6af9a]">CALORIES REMAINING</small>
          <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white my-1">
            {formatNumber(caloriesRemaining)}{' '}
            <small className="text-xs text-[#a6af9a] font-normal">kcal</small>
          </h2>
          <p className="text-xs text-[#a6af9a] m-0">
            {formatNumber(totals.calories)} consumed of {formatNumber(goals.calories)} kcal goal
          </p>
        </div>

        <div className="food-stamp">
          FIT<br />
          <b>FUEL</b>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-4">
        {mealCategories.map((meal) => {
          const mealEntries = foods.filter((f) => f.meal === meal);
          return (
            <MealCard
              key={meal}
              mealName={meal}
              entries={mealEntries}
              onAddFood={handleOpenAddFood}
              onEditFood={(item) => setEditingEntry(item)}
              onRemoveFood={deleteFood}
            />
          );
        })}
      </div>

      {/* Search & Custom Food Modals */}
      <FoodSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        initialMeal={activeMeal}
        onOpenCustomFood={() => handleOpenCustomFood(activeMeal)}
      />

      <CustomFoodModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        initialMeal={activeMeal}
      />

      {/* Edit Food Entry Modal */}
      <EditFoodModal
        isOpen={!!editingEntry}
        entry={editingEntry}
        onClose={() => setEditingEntry(null)}
        onSave={updateFood}
      />
    </section>
  );
}
