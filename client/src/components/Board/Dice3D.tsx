import React, { useState, useEffect, useRef } from 'react';

interface Dice3DProps {
  dice: [number, number];
  isRolling: boolean;
  onRollComplete?: () => void;
}

// 6 pip configurations for a 100x100 face
const PIP_CONFIGS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

// True 3D Cube Face Component
const DieFace: React.FC<{ value: number; transform: string }> = ({ value, transform }) => {
  const pips = PIP_CONFIGS[value] || PIP_CONFIGS[1];

  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-[#ffffff] via-[#f7f5f0] to-[#e8e4dc] border border-amber-100 rounded-xl shadow-[inset_0_1px_2px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.15)] flex items-center justify-center select-none backface-visible"
      style={{
        transform,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glossy top bevel */}
      <div className="absolute inset-1 rounded-lg bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />

      {/* Ruby Pips */}
      <div className="relative w-full h-full pointer-events-none">
        {pips.map(([x, y], i) => (
          <span
            key={i}
            className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gradient-to-b from-[#e11d48] to-[#881337] shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.8)] -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Rotation mapping for final settle value
const ROTATION_FOR_VALUE: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: -90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: 90 },
  6: { x: 0, y: 180 },
};

export const Physical3DCube: React.FC<{ value: number; rolling: boolean; delay?: number }> = ({
  value,
  rolling,
}) => {
  const turnsCountRef = useRef({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (rolling) {
      // Accumulate forward spins (never spin backward)
      turnsCountRef.current.x += Math.floor(Math.random() * 2) + 2;
      turnsCountRef.current.y += Math.floor(Math.random() * 2) + 2;

      const targetX = turnsCountRef.current.x * 360 + ROTATION_FOR_VALUE[value].x;
      const targetY = turnsCountRef.current.y * 360 + ROTATION_FOR_VALUE[value].y;

      setRotation({ x: targetX, y: targetY, z: 0 });
    }
  }, [rolling, value]);

  const sizeClass = "w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13";

  return (
    <div className="relative perspective-[600px] flex items-center justify-center p-1">
      {/* 3D Drop Shadow on floor */}
      <div
        className={`absolute -bottom-2 w-10 h-3 sm:w-12 sm:h-3.5 bg-black/50 rounded-full blur-sm transition-all duration-500 ${
          rolling ? 'scale-75 opacity-30 animate-pulse' : 'scale-100 opacity-70'
        }`}
      />

      {/* 3D Single Forward Rolling Cube */}
      <div
        className={`relative ${sizeClass} transition-transform duration-600 ease-out`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
        }}
      >
        {/* Face 1: Front (Z+) */}
        <DieFace value={1} transform="translateZ(22px)" />
        {/* Face 6: Back (Z-) */}
        <DieFace value={6} transform="rotateY(180deg) translateZ(22px)" />
        {/* Face 2: Right (X+) */}
        <DieFace value={2} transform="rotateY(90deg) translateZ(22px)" />
        {/* Face 5: Left (X-) */}
        <DieFace value={5} transform="rotateY(-90deg) translateZ(22px)" />
        {/* Face 3: Top (Y-) */}
        <DieFace value={3} transform="rotateX(90deg) translateZ(22px)" />
        {/* Face 4: Bottom (Y+) */}
        <DieFace value={4} transform="rotateX(-90deg) translateZ(22px)" />
      </div>
    </div>
  );
};

export const PhysicalDie3D = Physical3DCube;
export const SingleDie = Physical3DCube;

export const Dice3D: React.FC<Dice3DProps> = ({ dice, isRolling, onRollComplete }) => {
  const [d1, d2] = dice;

  useEffect(() => {
    if (isRolling) {
      const timer = setTimeout(() => {
        onRollComplete?.();
      }, 650);
      return () => clearTimeout(timer);
    }
  }, [isRolling, onRollComplete]);

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-6 py-1 select-none pointer-events-none">
      <Physical3DCube value={d1} rolling={isRolling} />
      <Physical3DCube value={d2} rolling={isRolling} />
    </div>
  );
};
