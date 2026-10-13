import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useFitness } from '../../context/FitnessContext';

export default function WeightHistoryChart() {
  const { weights } = useFitness();

  if (!weights || weights.length < 2) {
    return (
      <div className="h-[140px] flex items-center justify-center text-xs text-[#727a8a] border border-dashed border-[#242936] rounded-xl p-4">
        Log at least 2 weight check-ins to view the trend chart.
      </div>
    );
  }

  // Sort chronological for chart
  const chartData = [...weights]
    .sort((a, b) => new Date(a.logged_at || 0) - new Date(b.logged_at || 0))
    .slice(-14)
    .map((w) => {
      const d = w.logged_at ? new Date(w.logged_at) : new Date();
      const dateStr = isNaN(d.getTime())
        ? 'Recent'
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        weight: Number(w.weight) || 0,
      };
    });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-[#151922] border border-[#2b303a] px-3 py-1.5 rounded-lg text-xs shadow-xl">
          <p className="text-white font-bold m-0">{p.date}</p>
          <p className="text-lime text-[11px] m-0">{p.weight.toFixed(1)} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[160px] pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c8f169" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c8f169" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#81899a', fontSize: 10 }}
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#81899a', fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="weight"
            stroke="#c8f169"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#weightGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
