import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import WeeklyActivityChart from '../components/workouts/WeeklyActivityChart';
import SessionList from '../components/workouts/SessionList';
import WorkoutModal from '../components/workouts/WorkoutModal';

export default function WorkoutsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="animate-fade-in space-y-6">
      {/* Page Heading */}
      <div className="section-title page-heading flex items-center justify-between mb-6">
        <div>
          <small className="eyebrow block">MOVE WITH PURPOSE</small>
          <h2 className="font-display font-extrabold text-2xl text-white m-0">Workouts & activity</h2>
          <p className="text-muted text-xs m-0">Record training sessions and daily movement.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="primary flex items-center gap-1.5"
        >
          <Plus size={15} /> Log workout
        </button>
      </div>

      {/* Hero Workout Banner with Recharts Weekly Activity Chart */}
      <div className="panel workout-hero p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#20251c] to-[#14161c] border-[#313a28]">
        <div className="max-w-[450px]">
          <small className="eyebrow block text-[#a6af9a]">WEEKLY MOVEMENT</small>
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-white my-2 leading-tight">
            Progress is built<br />
            <em className="not-italic text-lime">one session at a time.</em>
          </h2>
          <p className="text-xs text-[#a2aa9a] m-0">
            Track your sessions and build a routine you can stick to.
          </p>
        </div>

        <div className="w-full md:w-[280px]">
          <WeeklyActivityChart />
        </div>
      </div>

      {/* Recent Sessions Section */}
      <div>
        <div className="section-title mb-3">
          <div>
            <h2 className="font-display font-bold text-lg text-white m-0 mb-1">Recent sessions</h2>
            <p className="text-muted text-xs m-0">Your training log</p>
          </div>
        </div>

        <SessionList />
      </div>

      {/* Workout Modal */}
      <WorkoutModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}
