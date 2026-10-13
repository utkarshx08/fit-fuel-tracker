import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useFitness } from '../../context/FitnessContext';

export default function WorkoutModal({ isOpen, onClose }) {
  const { addWorkout } = useFitness();

  const [name, setName] = useState('');
  const [type, setType] = useState('Strength');
  const [duration, setDuration] = useState('45');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addWorkout({
      name: name.trim(),
      type,
      duration: Number(duration) || 30,
      notes: notes.trim(),
      workout_date: new Date().toISOString(),
    });

    setName('');
    setType('Strength');
    setDuration('45');
    setNotes('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log a workout" eyebrow="ACTIVITY LOG">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Workout name</label>
          <input
            type="text"
            required
            placeholder="e.g. Push day, Morning 5k Run, HIIT Circuit"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full"
            >
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Sports">Sports</option>
              <option value="Mobility">Mobility</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Duration (min)</label>
            <input
              type="number"
              min="1"
              max="600"
              required
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[#aeb5c3] font-semibold block mb-1">Notes (optional)</label>
          <textarea
            rows="3"
            placeholder="Exercises, sets, weights, heart rate or reflections..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full resize-none"
          ></textarea>
        </div>

        <button type="submit" className="primary w-full py-3 justify-center text-xs">
          Save workout
        </button>
      </form>
    </Modal>
  );
}
