import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { formatNumber } from '../../utils/formatters';
import { calculateProgressPercentage } from '../../utils/nutritionCalculations';

export default function CalorieRing() {
  const { goals, totals, activity, caloriesRemaining } = useFitness();

  const consumed = totals.calories;
  const goal = goals.calories;
  const burned = activity.burned_calories || 0;
  const pct = calculateProgressPercentage(consumed, goal);
  const isOver = consumed > goal;

  const ringConic = `conic-gradient(var(--lime) 0% ${pct}%, #2b303a ${pct}% 100%)`;

  return (
    <article className="panel flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <small className="eyebrow block">CALORIES</small>
          <h3 className="font-display font-bold text-base text-white m-0 mt-1">Daily energy</h3>
        </div>
        <span className={`tag ${isOver ? 'tag' : 'green'}`}>
          {isOver ? 'Over target' : 'On track'}
        </span>
      </div>

      <div className="flex items-center gap-6 md:gap-7 py-5">
        {/* Circular Progress Ring */}
        <div
          className="ring"
          style={{ background: ringConic }}
        >
          <div>
            <b>{formatNumber(caloriesRemaining)}</b>
            <small>kcal left</small>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="grid gap-3.5 flex-1">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted">Consumed</span>
            <b className="font-display font-bold text-base text-white">
              {formatNumber(consumed)} <small className="text-[10px] text-[#9299a8] font-normal">kcal</small>
            </b>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted">Daily goal</span>
            <b className="font-display font-bold text-base text-white">
              {formatNumber(goal)} <small className="text-[10px] text-[#9299a8] font-normal">kcal</small>
            </b>
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted">Burned</span>
            <b className="font-display font-bold text-base text-white">
              {formatNumber(burned)} <small className="text-[10px] text-[#9299a8] font-normal">kcal</small>
            </b>
          </div>
        </div>
      </div>

      {/* Progress Bar & Percentage */}
      <div>
        <div className="bar">
          <i style={{ width: `${Math.min(100, pct)}%` }}></i>
        </div>
        <div className="flex justify-between items-center mt-2 text-[10px] text-[#858d9d]">
          <span>Daily target</span>
          <b className="text-[#e9ebf0]">{pct}%</b>
        </div>
      </div>
    </article>
  );
}
