import React, { useState, useEffect } from 'react';

interface Dice3DProps {
  dice: [number, number];
  isRolling: boolean;
  onRollComplete?: () => void;
}

// 6 pip positions on a 100x100 grid
const PIP_POSITIONS: Record<number, number[][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 22], [75, 22], [25, 50], [75, 50], [25, 78], [75, 78]],
};

export const PhysicalDie3D: React.FC<{ value: number; rolling: boolean; delay?: number }> = ({
  value,
  rolling,
  delay = 0,
}) => {
  const pips = PIP_POSITIONS[value] || PIP_POSITIONS[1];

  return (
    <div
      className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100 border border-amber-200/90 shadow-[0_10px_20px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-3px_5px_rgba(180,83,9,0.25)] flex items-center justify-center select-none transition-all duration-300 ${
        rolling ? 'animate-spin scale-110' : 'hover:scale-105'
      }`}
      style={{
        animationDuration: rolling ? '0.75s' : '0s',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* 3D Highlight Bevel */}
      <div className="absolute inset-1 rounded-xl bg-gradient-to-t from-transparent via-white/30 to-white/70 pointer-events-none" />

      {/* Die Pips */}
      <div className="relative w-full h-full pointer-events-none">
        {pips.map(([top, left], i) => (
          <span
            key={i}
            className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-b from-red-700 via-red-800 to-red-950 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.9)] -translate-x-1/2 -translate-y-1/2"
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

export const SingleDie = PhysicalDie3D;

export const Dice3D: React.FC<Dice3DProps> = ({ dice, isRolling, onRollComplete }) => {
  const [d1, d2] = dice;
  const total = d1 + d2;
  const isDouble = d1 === d2;

  useEffect(() => {
    if (isRolling) {
      const timer = setTimeout(() => {
        onRollComplete?.();
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [isRolling, onRollComplete]);

  return (
    <div className="flex flex-col items-center justify-center gap-1 p-2 bg-slate-950/95 border-2 border-emerald-500/50 rounded-2xl shadow-2xl backdrop-blur-md">
      {/* 3D Physical Dice Pair */}
      <div className="flex items-center gap-3.5 py-1">
        <PhysicalDie3D value={d1} rolling={isRolling} delay={0} />
        <PhysicalDie3D value={d2} rolling={isRolling} delay={120} />
      </div>

      {/* Sum & Doubles Callout Banner */}
      <div className="flex items-center gap-2 text-xs font-bold pt-0.5">
        <span className="text-slate-400">Total:</span>
        <span className="text-amber-400 text-sm sm:text-base font-black tracking-wider font-mono">
          {isRolling ? '...' : `${d1} + ${d2} = ${total}`}
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
