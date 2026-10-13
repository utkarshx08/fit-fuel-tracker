import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { formatNumber } from '../../utils/formatters';
import { calculateProgressPercentage } from '../../utils/nutritionCalculations';

export default function MacroCards() {
  const { goals, totals } = useFitness();

  const macros = [
    {
      name: 'Protein',
      letter: 'P',
      consumed: totals.protein,
      goal: goals.protein,
      color: '#a99bff',
    },
    {
      name: 'Carbs',
      letter: 'C',
      consumed: totals.carbs,
      goal: goals.carbs,
      color: '#ffb86c',
    },
    {
      name: 'Fats',
      letter: 'F',
      consumed: totals.fats,
      goal: goals.fats,
      color: '#6cb9ff',
    },
  ];

  return (
    <article className="panel flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <small className="eyebrow block">MACRONUTRIENTS</small>
          <h3 className="font-display font-bold text-base text-white m-0 mt-1">Your macro split</h3>
        </div>
        <span className="tag">Daily</span>
      </div>

      <div className="grid gap-5 py-5">
        {macros.map((m) => {
          const pct = calculateProgressPercentage(m.consumed, m.goal);
          return (
            <div key={m.name} className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl grid place-items-center font-extrabold text-xs flex-shrink-0"
                style={{ backgroundColor: `${m.color}22`, color: m.color }}
              >
                {m.letter}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-2 text-xs">
                  <b className="text-white">{m.name}</b>
                  <span className="text-[#a2a9b7] text-[11px]">
                    {formatNumber(m.consumed)} / {formatNumber(m.goal)} g
                  </span>
                </div>
                <div className="bar h-[5px]">
                  <i
                    style={{
                      width: `${pct}%`,
                      backgroundColor: m.color,
                    }}
                  ></i>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-[#242936] pt-3 text-[11px] text-[#9ba2b1] flex items-center gap-1.5">
        <span className="text-lime text-xs">✦</span>
        <span>Prioritize protein to support muscle recovery.</span>
      </div>
    </article>
  );
}
