import React, { useEffect } from 'react';

interface Dice3DProps {
  dice: [number, number];
  isRolling: boolean;
  onRollComplete?: () => void;
}

// Pip placement percentages on 100x100 face
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
      className={`relative w-10 h-10 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-white via-[#fcfbf9] to-[#e8e4dc] border border-white/80 shadow-[0_12px_24px_rgba(0,0,0,0.65),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-3px_5px_rgba(0,0,0,0.15)] flex items-center justify-center select-none transition-all duration-300 ${
        rolling ? 'animate-spin scale-110' : 'hover:scale-105'
      }`}
      style={{
        animationDuration: rolling ? '0.7s' : '0s',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Specular highlight bevel */}
      <div className="absolute inset-1 rounded-xl bg-gradient-to-t from-transparent via-white/20 to-white/80 pointer-events-none" />

      {/* Die Pips (Vibrant Ruby Red) */}
      <div className="relative w-full h-full pointer-events-none">
        {pips.map(([top, left], i) => (
          <span
            key={i}
            className="absolute w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-b from-[#e11d48] to-[#9f1239] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_1px_rgba(255,255,255,0.9)] -translate-x-1/2 -translate-y-1/2"
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

  useEffect(() => {
    if (isRolling) {
      const timer = setTimeout(() => {
        onRollComplete?.();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isRolling, onRollComplete]);

  return (
    <div className="flex items-center justify-center gap-3.5 py-1 select-none pointer-events-none">
      <PhysicalDie3D value={d1} rolling={isRolling} delay={0} />
      <PhysicalDie3D value={d2} rolling={isRolling} delay={100} />
    </div>
  );
};
