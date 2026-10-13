import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { getWeekDays, toIsoDate } from '../../utils/dateUtils';
import { useFitness } from '../../context/FitnessContext';

export default function WeeklyActivityChart() {
  const { workouts } = useFitness();
  const weekDays = getWeekDays();

  // Aggregate workout minutes per day of current week
  const data = weekDays.map((d) => {
    const dayMins = workouts
      .filter((w) => {
        const wDate = w.workout_date ? toIsoDate(new Date(w.workout_date)) : null;
        return wDate === d.dateStr;
      })
      .reduce((sum, w) => sum + (Number(w.duration) || 0), 0);

    return {
      day: d.label,
      fullDay: d.fullDay,
      minutes: dayMins,
      isToday: d.isToday,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-[#151922] border border-[#2b303a] px-3 py-1.5 rounded-lg text-xs shadow-xl">
          <p className="text-white font-bold m-0">{p.fullDay}</p>
          <p className="text-lime text-[11px] m-0">{p.minutes} minutes logged</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[120px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#81899a', fontSize: 10, fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200, 241, 105, 0.05)' }} />
          <Bar dataKey="minutes" radius={[4, 4, 2, 2]} minPointSize={6}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.minutes > 0 ? '#c8f169' : '#323a2b'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
