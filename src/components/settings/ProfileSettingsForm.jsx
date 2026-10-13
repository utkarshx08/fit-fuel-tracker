import React, { useState, useEffect } from 'react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettingsForm() {
  const { profile, updateUserProfile } = useFitness();
  const { user, isConfigured } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || 'Utkarsh');
  const [goalType, setGoalType] = useState(profile?.goal_type || 'Muscle & fat loss');
  const [weight, setWeight] = useState(profile?.current_weight || 75.0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || 'Utkarsh');
      setGoalType(profile.goal_type || 'Muscle & fat loss');
      setWeight(profile.current_weight || 75.0);
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile({
        full_name: fullName.trim(),
        goal_type: goalType,
        current_weight: Number(weight),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="panel mb-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <small className="eyebrow block">PROFILE DETAILS</small>
          <h3 className="font-display font-bold text-base text-white m-0 mt-1">Personal information</h3>
        </div>
        <span className="tag">{isConfigured ? 'Supabase Account' : 'Demo Profile'}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Account Email
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'demo@fitfuel.app'}
              className="w-full opacity-60 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Fitness Focus / Goal
            </label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full"
            >
              <option value="Muscle & fat loss">Muscle & fat loss (Recomposition)</option>
              <option value="Hypertrophy (Lean Bulk)">Hypertrophy (Lean Bulk)</option>
              <option value="Fat Loss & Cutting">Fat Loss & Cutting</option>
              <option value="Strength & Power">Strength & Power</option>
              <option value="Cardio & Endurance">Cardio & Endurance</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">
              Starting / Baseline Weight (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="400"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="primary px-6 py-2.5 justify-center text-xs"
        >
          {saving ? 'Updating...' : 'Update profile'}
        </button>
      </form>
    </article>
  );
}
