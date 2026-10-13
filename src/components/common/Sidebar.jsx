import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, UtensilsCrossed, TrendingUp, BarChart2, Settings, LogOut, ShieldCheck, Zap, HardDrive } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useFitness } from '../../context/FitnessContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, signOut, isConfigured } = useAuth();
  const { profile, storageMode } = useFitness();
  const navigate = useNavigate();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Utkarsh';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-[240px] flex-shrink-0 border-r border-[#20232d] bg-[#0e1016] p-6 flex flex-col z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand */}
        <NavLink to="/" onClick={handleNavClick} className="brand pb-8">
          <span className="mark">F</span>
          <span>
            fitfuel<span className="lime">.</span>
          </span>
        </NavLink>

        {/* Cloud / Fallback / Demo status indicator */}
        <div className="mb-4 px-2">
          {storageMode === 'cloud' ? (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-lime bg-[#1a2612] px-2.5 py-1 rounded-full border border-lime/20" title="Connected to Supabase PostgreSQL cloud database">
              <ShieldCheck size={12} /> Supabase Cloud Sync
            </span>
          ) : isConfigured ? (
            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-amber-400 bg-[#2b2111] px-2.5 py-1 rounded-full border border-amber-500/30 hover:border-amber-400 transition-colors"
              title="Database tables pending in Supabase. Click to view SQL migration."
            >
              <HardDrive size={12} /> Local Fallback (Pending Setup)
            </NavLink>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-orangeAccent bg-[#261f12] px-2.5 py-1 rounded-full border border-orangeAccent/20">
              <Zap size={12} /> Local / Demo Mode
            </span>
          )}
        </div>

        {/* Section eyebrow */}
        <small className="eyebrow px-3 pb-3">WORKSPACE</small>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5">
          <NavLink
            to="/"
            end
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-colors ${
                isActive
                  ? 'bg-[#20261a] text-lime border-l-2 border-lime shadow-inner'
                  : 'text-[#9ca3b2] hover:bg-[#191d26] hover:text-white'
              }`
            }
          >
            <LayoutGrid size={16} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/food"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-colors ${
                isActive
                  ? 'bg-[#20261a] text-lime border-l-2 border-lime shadow-inner'
                  : 'text-[#9ca3b2] hover:bg-[#191d26] hover:text-white'
              }`
            }
          >
            <UtensilsCrossed size={16} />
            <span>Food diary</span>
          </NavLink>

          <NavLink
            to="/workouts"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-colors ${
                isActive
                  ? 'bg-[#20261a] text-lime border-l-2 border-lime shadow-inner'
                  : 'text-[#9ca3b2] hover:bg-[#191d26] hover:text-white'
              }`
            }
          >
            <TrendingUp size={16} />
            <span>Workouts</span>
          </NavLink>

          <NavLink
            to="/progress"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-colors ${
                isActive
                  ? 'bg-[#20261a] text-lime border-l-2 border-lime shadow-inner'
                  : 'text-[#9ca3b2] hover:bg-[#191d26] hover:text-white'
              }`
            }
          >
            <BarChart2 size={16} />
            <span>Progress</span>
          </NavLink>

          <NavLink
            to="/settings"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-3 rounded-xl font-semibold text-xs transition-colors ${
                isActive
                  ? 'bg-[#20261a] text-lime border-l-2 border-lime shadow-inner'
                  : 'text-[#9ca3b2] hover:bg-[#191d26] hover:text-white'
              }`
            }
          >
            <Settings size={16} />
            <span>Settings</span>
          </NavLink>
        </nav>

        {/* Motivational quote */}
        <div className="mt-auto">
          <div className="my-4 border border-[#2b3025] bg-gradient-to-br from-[#1c2318] to-[#131712] rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-lime text-xs">✦</span>
            <b className="font-display text-xs text-white">
              Small steps.<br />Strong results.
            </b>
            <p className="text-[#9ca68d] text-[10px] leading-relaxed m-0 mt-1">
              Consistency beats perfection. Keep showing up.
            </p>
          </div>

          {/* Profile Card & Logout */}
          <div className="border-t border-[#242733] pt-3.5 flex items-center justify-between">
            <NavLink
              to="/settings"
              onClick={handleNavClick}
              className="flex items-center gap-2.5 text-left no-underline hover:opacity-85 transition"
            >
              <div className="w-8 h-8 rounded-full bg-[#d3c7ff] text-[#2d2355] font-extrabold flex items-center justify-center text-xs">
                {initial}
              </div>
              <div className="overflow-hidden">
                <b className="text-xs text-white block truncate max-w-[110px]">{displayName}</b>
                <small className="text-[10px] text-muted block truncate max-w-[110px]">
                  {profile?.goal_type || 'Muscle & fat loss'}
                </small>
              </div>
            </NavLink>

            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-1.5 rounded-lg text-[#8e95a5] hover:text-red-400 hover:bg-[#1c202a] border-0 bg-transparent"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
