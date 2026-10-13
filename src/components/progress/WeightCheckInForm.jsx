import React, { useState } from 'react';
import { useFitness } from '../../context/FitnessContext';
import WeightHistoryChart from './WeightHistoryChart';

export default function WeightCheckInForm() {
  const { weights, addWeightCheckIn } = useFitness();
  const [weight, setWeight] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = Number(weight);
    if (isNaN(val) || val < 20 || val > 400) return;

    await addWeightCheckIn(val);
    setWeight('');
  };

  const sortedWeights = [...weights].sort(
    (a, b) => new Date(b.logged_at || 0) - new Date(a.logged_at || 0)
  );

  return (
    <article className="panel mb-4">
      <h3 className="font-display font-bold text-base text-white m-0 mb-1">Weight check-in</h3>
      <p className="text-xs text-muted m-0">Track trends, not day-to-day fluctuations.</p>

      {/* Visual Progression Chart */}
      <div className="my-4">
        <WeightHistoryChart />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-3 flex-wrap mt-4">
        <div className="flex-1 min-w-[140px] max-w-[200px]">
          <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
            Weight (kg)
          </label>
          <input
            type="number"
            min="20"
            max="400"
            step="0.1"
            placeholder="75.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full"
            required
          />
        </div>

        <button type="submit" className="primary px-5 py-2.5">
          Save weight
        </button>
      </form>

      {/* Weight History Chips */}
      <div className="flex gap-2.5 flex-wrap mt-5">
        {sortedWeights.slice(0, 8).map((x) => {
          const logDate = x.logged_at ? new Date(x.logged_at) : new Date();
          const dateLabel = isNaN(logDate.getTime())
            ? 'Recent'
            : logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <div
              key={x.id || x.logged_at}
              className="border border-[#242936] bg-[#0d1016] rounded-xl px-3 py-2 text-xs text-[#b8bfcb]"
            >
              <b>{Number(x.weight).toFixed(1)} kg</b>
              <small className="block text-[10px] text-[#727b8d] mt-0.5">
                {dateLabel}
              </small>
            </div>
          );
        })}
      </div>
    </article>
  );
}
