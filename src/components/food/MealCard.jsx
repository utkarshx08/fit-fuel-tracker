import React from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export default function MealCard({ mealName, entries = [], onAddFood, onEditFood, onRemoveFood }) {
  const totalCalories = entries.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
  const totalProtein = entries.reduce((sum, item) => sum + (Number(item.protein) || 0), 0);

  return (
    <article className="panel p-0 overflow-hidden mb-3.5">
      {/* Meal Header */}
      <div className="flex items-center justify-between p-4 md:px-5 border-b border-[#242936] bg-[#12151d]">
        <div>
          <h3 className="font-display font-bold text-sm text-white m-0">{mealName}</h3>
          <span className="text-[10px] text-[#858d9d] block mt-0.5">
            {entries.length} item{entries.length === 1 ? '' : 's'} · {formatNumber(totalCalories)} kcal
            {totalProtein > 0 && ` · ${Math.round(totalProtein)}g protein`}
          </span>
        </div>

        <button
          onClick={() => onAddFood(mealName)}
          className="border border-[#343a46] rounded-lg bg-transparent text-lime px-2.5 py-1 text-xs font-semibold hover:border-lime flex items-center gap-1"
        >
          <Plus size={12} /> Add food
        </button>
      </div>

      {/* Entries */}
      {entries.length > 0 ? (
        <div className="divide-y divide-[#20242d]">
          {entries.map((item) => (
            <div
              key={item.id}
              className="flex items-center px-4 md:px-5 py-3 gap-3 hover:bg-[#151922] transition"
            >
              <span className="w-2 h-2 rounded-[3px] bg-lime flex-shrink-0"></span>

              <div className="flex-1 min-w-0">
                <b className="text-xs text-white block truncate">{item.name}</b>
                <small className="block text-[10px] text-[#858d9d] mt-0.5 truncate">
                  {item.serving_size} {item.serving_unit} • {Math.round(Number(item.protein) || 0)}g protein ·{' '}
                  {Math.round(Number(item.carbs) || 0)}g carbs · {Math.round(Number(item.fats) || 0)}g fats
                </small>
              </div>

              <span className="text-xs text-[#dfe3eb] font-semibold whitespace-nowrap">
                {formatNumber(item.calories)} kcal
              </span>

              <div className="flex items-center gap-1">
                {onEditFood && (
                  <button
                    onClick={() => onEditFood(item)}
                    title="Edit entry"
                    className="text-[#70798a] hover:text-white p-1 rounded transition text-sm flex items-center justify-center border-0 bg-transparent cursor-pointer"
                    aria-label={`Edit ${item.name}`}
                  >
                    <Pencil size={13} />
                  </button>
                )}

                <button
                  onClick={() => onRemoveFood(item.id)}
                  title="Remove entry"
                  className="text-[#70798a] hover:text-red-400 p-1 rounded transition text-sm flex items-center justify-center border-0 bg-transparent cursor-pointer"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 md:px-5 text-[#727a8a] text-xs">
          Nothing logged here yet. Add a meal to get started.
        </div>
      )}
    </article>
  );
}
