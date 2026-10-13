import React from 'react';
import { Sparkles } from 'lucide-react';
import { useFitness } from '../context/FitnessContext';
import { formatNumber } from '../utils/formatters';
import WeightCheckInForm from '../components/progress/WeightCheckInForm';

export default function ProgressPage() {
  const { profile, goals, weights } = useFitness();

  const sortedWeights = [...weights].sort(
    (a, b) => new Date(b.logged_at || 0) - new Date(a.logged_at || 0)
  );
  const currentWeight = sortedWeights[0]?.weight ?? profile?.current_weight ?? 75.0;

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page Heading */}
      <div className="section-title page-heading mb-6">
        <div>
          <small className="eyebrow block">THE BIG PICTURE</small>
          <h2 className="font-display font-extrabold text-2xl text-white m-0">Your progress</h2>
          <p className="text-muted text-xs m-0">Small habits add up to meaningful change.</p>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <article className="panel flex flex-col justify-between">
          <small className="eyebrow block">CURRENT WEIGHT</small>
          <strong className="block font-display font-extrabold text-3xl text-white my-2">
            {Number(currentWeight).toFixed(1)}{' '}
            <small className="text-xs text-[#9ba2b1] font-normal">kg</small>
          </strong>
          <p className="text-muted text-xs m-0">Log your weight below</p>
        </article>

        <article className="panel flex flex-col justify-between">
          <small className="eyebrow block">DAILY CALORIE GOAL</small>
          <strong className="block font-display font-extrabold text-3xl text-white my-2">
            {formatNumber(goals.calories)}{' '}
            <small className="text-xs text-[#9ba2b1] font-normal">kcal</small>
          </strong>
          <p className="text-muted text-xs m-0">Personalize as needed</p>
        </article>

        <article className="panel flex flex-col justify-between">
          <small className="eyebrow block">PROTEIN GOAL</small>
          <strong className="block font-display font-extrabold text-3xl text-white my-2">
            {formatNumber(goals.protein)}{' '}
            <small className="text-xs text-[#9ba2b1] font-normal">g</small>
          </strong>
          <p className="text-muted text-xs m-0">Support muscle recovery</p>
        </article>
      </div>

      {/* Weight Check-in and Trends */}
      <WeightCheckInForm />

      {/* Educational Guideline Card */}
      <article className="panel tip-panel flex gap-4 items-start p-5 bg-[#141620] border-[#252837]">
        <div className="w-9 h-9 rounded-xl bg-[#2a2340] text-purpleAccent grid place-items-center flex-shrink-0 text-base">
          ✦
        </div>
        <div>
          <h3 className="font-display font-bold text-sm text-white m-0 mb-1.5">
            Muscle gain + fat loss
          </h3>
          <p className="text-xs text-[#969eae] leading-relaxed m-0">
            Start with consistent strength training, sufficient protein, sleep, and a calorie target
            that matches your activity. Treat these default goals as starting points—not medical advice.
          </p>
        </div>
      </article>
    </section>
  );
}
