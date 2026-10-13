import React from 'react';
import { useFitness } from '../../context/FitnessContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toast } = useFitness();

  if (!toast.show) return null;

  const isError = toast.type === 'error';

  return (
    <div
      className="fixed top-6 right-6 md:right-8 z-[9999] flex items-center gap-2.5 px-4 py-3 rounded-xl font-bold text-xs tracking-wide shadow-2xl transition-all duration-300 animate-fade-in border max-w-sm pointer-events-none"
      style={{
        background: isError ? '#2a1215' : '#1a2612',
        borderColor: isError ? 'rgba(255, 82, 82, 0.4)' : 'rgba(200, 241, 105, 0.4)',
        color: isError ? '#ff8a80' : '#c8f169',
      }}
    >
      {isError ? (
        <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
      ) : (
        <CheckCircle2 size={16} className="text-lime flex-shrink-0" />
      )}
      <span className="text-white text-xs font-medium">{toast.message}</span>
    </div>
  );
}
