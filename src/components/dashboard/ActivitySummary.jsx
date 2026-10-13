import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Dumbbell, Droplets, Plus } from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { formatNumber } from '../../utils/formatters';
import { calculateProgressPercentage } from '../../utils/nutritionCalculations';
import { toIsoDate } from '../../utils/dateUtils';

export default function ActivitySummary({ onOpenWorkoutModal }) {
  const { activity, addSteps, addWater, workouts, selectedDate } = useFitness();
  const navigate = useNavigate();

  const stepGoal = 10000;
  const currentSteps = activity.steps || 0;
  const stepPct = calculateProgressPercentage(currentSteps, stepGoal);

  const waterGoal = 3.0;
  const currentWater = Number(activity.water) || 0;
  const waterPct = calculateProgressPercentage(currentWater, waterGoal);

  // Filter workouts for today/selectedDate
  const todayWorkouts = workouts.filter((w) => {
    const wDate = w.workout_date ? toIsoDate(new Date(w.workout_date)) : null;
    return wDate === selectedDate;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Steps Card */}
      <article className="panel flex flex-col justify-between min-h-[200px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#27321b] text-lime flex items-center justify-center font-bold text-lg">
              ↗
            </div>
            <span className="tag">Daily</span>
          </div>
          <span className="text-xs text-[#c7cbd4] font-medium block mb-1">Steps</span>
          <strong className="block font-display font-extrabold text-2xl text-white mb-3">
            {formatNumber(currentSteps)}{' '}
            <small className="text-[10px] text-[#81899a] font-normal">/ {formatNumber(stepGoal)}</small>
          </strong>
          <div className="bar mb-3">
            <i style={{ width: `${stepPct}%` }}></i>
          </div>
          <p className="text-[11px] text-[#858d9d] m-0 mb-3">You're moving in the right direction</p>
        </div>

        <button
          onClick={() => addSteps(1000)}
          className="secondary w-full justify-center"
        >
          <Plus size={13} /> Log 1,000 steps
        </button>
      </article>

      {/* Workout Card */}
      <article className="panel flex flex-col justify-between min-h-[200px]">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#2a2340] text-purpleAccent flex items-center justify-center font-bold text-lg">
              ✣
            </div>
            <span className="tag purple">Strength & Cardio</span>
          </div>
          <span className="text-xs text-[#c7cbd4] font-medium block mb-1">Workout</span>
          <strong className="block font-display font-extrabold text-2xl text-white mb-3">
            {todayWorkouts.length}{' '}
            <small className="text-[10px] text-[#81899a] font-normal">session(s) logged today</small>
          </strong>
          
          <div className="h-6 flex items-end gap-1.5 mb-3">
            <i className="h-[30%] flex-1 rounded-t bg-[#8171ce]/60 block"></i>
            <i className="h-[50%] flex-1 rounded-t bg-[#8171ce]/60 block"></i>
            <i className="h-[40%] flex-1 rounded-t bg-[#8171ce]/60 block"></i>
            <i className="h-[75%] flex-1 rounded-t bg-[#8171ce] block"></i>
            <i className="h-[45%] flex-1 rounded-t bg-[#8171ce]/60 block"></i>
            <i className="h-[90%] flex-1 rounded-t bg-lime block"></i>
            <i className="h-[60%] flex-1 rounded-t bg-[#8171ce] block"></i>
          </div>
          <p className="text-[11px] text-[#858d9d] m-0 mb-3">Train smart. Recover well.</p>
        </div>

        <button
          onClick={onOpenWorkoutModal || (() => navigate('/workouts'))}
          className="secondary w-full justify-center"
        >
          <Plus size={13} /> Log a workout
        </button>
      </article>

      {/* Hydration Card */}
      <article className="panel flex flex-col justify-between min-h-[200px] md:col-span-2 lg:col-span-1">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#1d2c3c] text-blueAccent flex items-center justify-center font-bold text-lg">
              ≈
            </div>
            <span className="tag blue">Hydration</span>
          </div>
          <span className="text-xs text-[#c7cbd4] font-medium block mb-1">Water Intake</span>
          <strong className="block font-display font-extrabold text-2xl text-white mb-3">
            {currentWater.toFixed(2).replace(/0$/, '')}{' '}
            <small className="text-[10px] text-[#81899a] font-normal">/ {waterGoal.toFixed(1)} L</small>
          </strong>
          <div className="bar mb-3">
            <i
              style={{
                width: `${waterPct}%`,
                backgroundColor: 'var(--blue)',
              }}
            ></i>
          </div>
          <p className="text-[11px] text-[#858d9d] m-0 mb-3">Stay hydrated throughout the day</p>
        </div>

        <button
          onClick={() => addWater(0.25)}
          className="secondary w-full justify-center"
        >
          <Plus size={13} /> Add 250 ml
        </button>
      </article>
    </div>
  );
}
