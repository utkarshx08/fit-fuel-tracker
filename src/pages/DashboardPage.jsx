import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBanner from '../components/dashboard/HeroBanner';
import CalorieRing from '../components/dashboard/CalorieRing';
import MacroCards from '../components/dashboard/MacroCards';
import ActivitySummary from '../components/dashboard/ActivitySummary';
import WorkoutModal from '../components/workouts/WorkoutModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);

  return (
    <section className="animate-fade-in space-y-7">
      <HeroBanner />

      {/* Today's Nutrition Section */}
      <div>
        <div className="section-title">
          <div>
            <h2 className="font-display font-bold text-lg text-white m-0 mb-1">Today's nutrition</h2>
            <p className="text-muted text-xs m-0">Keep your fuel aligned with your goals.</p>
          </div>
          <button
            onClick={() => navigate('/food')}
            className="link flex items-center gap-1 font-bold text-xs"
          >
            Open food diary ↗
          </button>
        </div>

        <div className="nutrition grid grid-cols-1 lg:grid-cols-[1.12fr_1fr] gap-4">
          <CalorieRing />
          <MacroCards />
        </div>
      </div>

      {/* Today's Activity Section */}
      <div>
        <div className="section-title">
          <div>
            <h2 className="font-display font-bold text-lg text-white m-0 mb-1">Today's activity</h2>
            <p className="text-muted text-xs m-0">Every rep and every step counts.</p>
          </div>
          <button
            onClick={() => navigate('/workouts')}
            className="link flex items-center gap-1 font-bold text-xs"
          >
            View activity ↗
          </button>
        </div>

        <ActivitySummary onOpenWorkoutModal={() => setWorkoutModalOpen(true)} />
      </div>

      {/* Modals */}
      <WorkoutModal
        isOpen={workoutModalOpen}
        onClose={() => setWorkoutModalOpen(false)}
      />
    </section>
  );
}
