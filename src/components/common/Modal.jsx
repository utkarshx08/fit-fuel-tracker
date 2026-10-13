import React, { useEffect, useState, useRef } from 'react';
import { X, GripHorizontal } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  eyebrow = 'MODAL',
  children,
  maxWidth = '540px',
  draggable = true,
}) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startCoordRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef({ x: 0, y: 0 });

  // Reset position and manage escape key & body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Pointer drag event handlers for mouse & touch
  const handlePointerDown = (e) => {
    if (!draggable) return;
    // Only primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    // Do not initiate drag if user clicked an interactive control
    if (e.target.closest('button, input, select, textarea, a')) return;

    isDraggingRef.current = true;
    setIsDragging(true);
    startCoordRef.current = { x: e.clientX, y: e.clientY };
    startPosRef.current = { ...position };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {}
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;

    const deltaX = e.clientX - startCoordRef.current.x;
    const deltaY = e.clientY - startCoordRef.current.y;

    let nextX = startPosRef.current.x + deltaX;
    let nextY = startPosRef.current.y + deltaY;

    // Viewport bounds clamping so the dialog is never dragged off screen
    const maxBoundX = Math.max(window.innerWidth / 2 - 80, 100);
    const maxBoundY = Math.max(window.innerHeight / 2 - 80, 100);

    nextX = Math.max(-maxBoundX, Math.min(maxBoundX, nextX));
    nextY = Math.max(-maxBoundY, Math.min(maxBoundY, nextY));

    setPosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = (e) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {}
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex min-h-full items-center justify-center p-4 sm:p-6 text-center"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className={`w-full text-left rounded-2xl border border-[#353b49] bg-[#151821] text-[#f2f4f8] shadow-2xl p-5 sm:p-7 animate-fade-in relative my-auto ${
            isDragging ? 'select-none ring-1 ring-lime/40 shadow-[0_25px_50px_-12px_rgba(200,241,105,0.18)]' : ''
          }`}
          style={{
            maxWidth,
            transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            transition: isDragging ? 'none' : 'transform 0.12s ease-out, box-shadow 0.2s ease',
            willChange: 'transform',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Draggable Header & Grip Handle */}
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={() => setPosition({ x: 0, y: 0 })}
            className={`group -mt-2 -mx-2 px-2 pt-1 pb-3 mb-3 border-b border-[#232936] rounded-t-xl transition-colors ${
              draggable ? 'cursor-grab active:cursor-grabbing select-none hover:bg-[#1a1e29]/40' : ''
            }`}
            title={draggable ? 'Click & drag to move dialog • Double click to center' : undefined}
          >
            {/* Subtle Grip Bar */}
            {draggable && (
              <div className="flex items-center justify-center pb-2">
                <div className="w-10 h-1 rounded-full bg-[#2e3544] group-hover:bg-[#4d5770] transition-colors" />
              </div>
            )}

            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0 pr-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="eyebrow m-0">{eyebrow}</span>
                  {draggable && (
                    <span className="text-[10px] text-[#6b7588] group-hover:text-[#a0abc0] flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                      <GripHorizontal size={12} />
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white m-0 truncate">
                  {title}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                onPointerDown={(e) => e.stopPropagation()}
                className="w-8 h-8 rounded-lg bg-[#252a35] text-[#d5dae4] hover:text-white hover:bg-[#343b49] flex items-center justify-center border-0 cursor-pointer flex-shrink-0 ml-2 transition"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}
