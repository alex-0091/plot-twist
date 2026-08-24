import React, { useState, useEffect } from 'react';

interface Dice3DProps {
  dice: [number, number];
  isRolling: boolean;
  onRollComplete?: () => void;
}

// 6 pip configurations
const PIP_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

export const SingleDie: React.FC<{ value: number; rolling: boolean; delay?: number }> = ({
  value,
  rolling,
  delay = 0,
}) => {
  const pips = PIP_POSITIONS[value] || PIP_POSITIONS[1];

  return (
    <div
      className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100 border-2 border-amber-200/80 shadow-[0_8px_16px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-2px_4px_rgba(180,83,9,0.2)] flex items-center justify-center select-none transition-all duration-300 ${
        rolling ? 'animate-spin' : 'hover:scale-105'
      }`}
      style={{
        animationDuration: rolling ? '0.7s' : '0s',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* 3D Bevel highlight effect */}
      <div className="absolute inset-1 rounded-xl bg-gradient-to-t from-transparent to-white/40 pointer-events-none" />

      {/* Die Pips */}
      <div className="relative w-full h-full">
        {pips.map(([top, left], i) => (
          <span
            key={i}
            className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-b from-red-700 to-red-900 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6),0_1px_1px_rgba(255,255,255,0.8)] -translate-x-1/2 -translate-y-1/2"
            style={{
              top: `${top}%`,
              left: `${left}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const Dice3D: React.FC<Dice3DProps> = ({ dice, isRolling, onRollComplete }) => {
  const [d1, d2] = dice;
  const total = d1 + d2;
  const isDouble = d1 === d2;

  useEffect(() => {
    if (isRolling) {
      const timer = setTimeout(() => {
        onRollComplete?.();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isRolling, onRollComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-slate-950/90 border border-emerald-500/40 rounded-2xl shadow-inner backdrop-blur-md">
      {/* 3D Dice Pair */}
      <div className="flex items-center gap-3 py-1">
        <SingleDie value={d1} rolling={isRolling} delay={0} />
        <SingleDie value={d2} rolling={isRolling} delay={100} />
      </div>

      {/* Sum & Doubles Callout */}
      <div className="flex items-center gap-2 text-xs font-bold">
        <span className="text-slate-400">Rolled:</span>
        <span className="text-amber-400 text-sm font-black tracking-wide">
          {isRolling ? '...' : total}
        </span>
        {!isRolling && isDouble && (
          <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-bounce shadow">
            🔥 DOUBLES!
          </span>
        )}
      </div>
    </div>
  );
};
