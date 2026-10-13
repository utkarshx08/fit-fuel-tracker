import React from 'react';
import { Trash2 } from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { formatNumber } from '../../utils/formatters';

export default function SessionList() {
  const { workouts, deleteWorkout } = useFitness();

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.workout_date || b.created_at || 0) - new Date(a.workout_date || a.created_at || 0)
  );

  const getSymbol = (type) => {
    switch (type) {
      case 'Cardio': return '↗';
      case 'Sports': return '◉';
      case 'Mobility': return '✦';
      default: return '✣';
    }
  };

  return (
    <div className="panel p-0 overflow-hidden divide-y divide-[#20242d]">
      {sortedWorkouts.length > 0 ? (
        sortedWorkouts.map((w) => (
          <div
            key={w.id}
            className="flex items-center gap-3.5 p-4 md:px-5 hover:bg-[#151922] transition"
          >
            <div className="w-10 h-10 rounded-xl bg-[#29233e] text-purpleAccent grid place-items-center font-bold text-lg flex-shrink-0">
              {getSymbol(w.type)}
            </div>

            <div className="flex-1 min-w-0">
              <b className="text-xs text-white block truncate">{w.name}</b>
              <small className="block text-[10px] text-[#8991a0] mt-0.5 truncate">
                {w.type} · {(() => {
                  const d = w.workout_date ? new Date(w.workout_date) : new Date();
                  return isNaN(d.getTime()) ? 'Recent' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                })()}
                {w.notes && ` · ${w.notes}`}
              </small>
            </div>

            <span className="text-xs text-[#c4c9d3] whitespace-nowrap font-semibold">
              {formatNumber(w.duration)} min
            </span>

            <button
              onClick={() => deleteWorkout(w.id)}
              title="Delete session"
              className="text-[#70798a] hover:text-red-400 p-1 rounded transition border-0 bg-transparent flex items-center justify-center"
              aria-label={`Delete ${w.name}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))
      ) : (
        <div className="p-5 text-center text-[#727a8a] text-xs">
          No workouts logged yet. Add your first session above.
        </div>
      )}
    </div>
  );
}
