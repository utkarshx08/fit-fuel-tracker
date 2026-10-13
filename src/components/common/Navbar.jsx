import React from 'react';
import { Menu, Calendar } from 'lucide-react';
import { useFitness } from '../../context/FitnessContext';
import { useAuth } from '../../context/AuthContext';
import { getGreeting } from '../../utils/formatters';
import { formatDisplayDate, formatShortDate } from '../../utils/dateUtils';

export default function Navbar({ onToggleSidebar, pageTitle, eyebrow = 'YOUR DAILY CHECK-IN' }) {
  const { profile, selectedDate, setSelectedDate } = useFitness();
  const { user } = useAuth();

  const name = profile?.full_name || user?.user_metadata?.full_name || 'Utkarsh';
  const greeting = getGreeting();

  return (
    <header className="flex items-center justify-between gap-4 mb-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden bg-[#171b24] border border-[#242936] text-white p-2 rounded-lg flex items-center justify-center hover:bg-[#202532]"
          aria-label="Toggle navigation menu"
        >
          <Menu size={18} />
        </button>

        <div>
          <small className="eyebrow block">{eyebrow}</small>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold font-display tracking-tight text-white m-0">
            {pageTitle || (
              <>
                {greeting}, {name} <span className="lime">✦</span>
              </>
            )}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 border border-[#242936] bg-[#12151d] rounded-lg px-3 py-2 text-xs text-[#a8afbd]">
          <Calendar size={13} className="text-lime" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent border-0 p-0 text-[#a8afbd] text-xs cursor-pointer focus:ring-0 focus:outline-none"
            title="Change active date"
          />
        </div>
      </div>
    </header>
  );
}
