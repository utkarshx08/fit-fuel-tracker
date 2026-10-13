import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <span className="mark text-2xl w-12 h-12 rounded-2xl mb-4">F</span>
      <h1 className="font-display font-extrabold text-3xl text-white m-0 mb-2">Page Not Found</h1>
      <p className="text-muted text-xs max-w-sm mb-6">
        The fitness destination you're looking for doesn't exist or has moved.
      </p>
      <Link to="/" className="primary text-xs flex items-center gap-2">
        <ArrowLeft size={14} /> Back to Overview
      </Link>
    </div>
  );
}
