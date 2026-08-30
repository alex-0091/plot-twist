import React from 'react';
import { Player } from '../../types';

interface PoorupTokenLayerProps {
  players: Player[];
  currentPlayerId?: string;
}

// 1180px Monopoly / Poorup Coordinate Generator
function generateBoardPositions() {
  const positions: { left: number; top: number }[] = [];
  const boardSize = 1180;
  const cornerCenter = 70;
  const lastCornerCenter = boardSize - cornerCenter; // 1110
  const sideCenters = Array.from({ length: 9 }, (_, index) => 190 + index * 100);
  const toPercent = (value: number) => Number(((value / boardSize) * 100).toFixed(2));

  // Space 0: START (Bottom-Right)
  positions[0] = { left: toPercent(lastCornerCenter), top: toPercent(lastCornerCenter) };

  // Spaces 1..9: Bottom Row (Right-to-Left: 990 down to 190)
  sideCenters
    .slice()
    .reverse()
    .forEach((x, idx) => {
      positions[1 + idx] = { left: toPercent(x), top: toPercent(lastCornerCenter) };
    });

  // Space 10: JAIL (Bottom-Left)
  positions[10] = { left: toPercent(cornerCenter), top: toPercent(lastCornerCenter) };

  // Spaces 11..19: Left Column (Bottom-to-Top: 990 down to 190)
  sideCenters
    .slice()
    .reverse()
    .forEach((y, idx) => {
      positions[11 + idx] = { left: toPercent(cornerCenter), top: toPercent(y) };
    });

  // Space 20: HIRA MANDI / FREE PARKING (Top-Left)
  positions[20] = { left: toPercent(cornerCenter), top: toPercent(cornerCenter) };

  // Spaces 21..29: Top Row (Left-to-Right: 190 to 990)
  sideCenters.forEach((x, idx) => {
    positions[21 + idx] = { left: toPercent(x), top: toPercent(cornerCenter) };
  });

  // Space 30: MET A LAHORI / GO TO JAIL (Top-Right)
  positions[30] = { left: toPercent(lastCornerCenter), top: toPercent(cornerCenter) };

  // Spaces 31..39: Right Column (Top-to-Bottom: 190 to 990)
  sideCenters.forEach((y, idx) => {
    positions[31 + idx] = { left: toPercent(lastCornerCenter), top: toPercent(y) };
  });

  return positions;
}

export const BOARD_COORDINATE_POSITIONS = generateBoardPositions();

// Poorup Token Multi-Player Offset System
function getTokenOffsets(total: number): { x: number; y: number }[] {
  if (total <= 1) return [{ x: 0, y: 0 }];

  const spacing = 12;
  const compact = Math.floor(spacing * 0.75);

  if (total === 2) {
    return [
      { x: -spacing, y: 0 },
      { x: spacing, y: 0 },
    ];
  }

  if (total === 3) {
    return [
      { x: -spacing, y: -compact },
      { x: spacing, y: -compact },
      { x: 0, y: spacing },
    ];
  }

  if (total === 4) {
    return [
      { x: -spacing, y: -spacing },
      { x: spacing, y: -spacing },
      { x: -spacing, y: spacing },
      { x: spacing, y: spacing },
    ];
  }

  return [
    { x: -spacing, y: -spacing },
    { x: spacing, y: -spacing },
    { x: -spacing, y: spacing },
    { x: spacing, y: spacing },
    { x: 0, y: -spacing * 1.5 },
    { x: 0, y: spacing * 1.5 },
  ];
}

export const PoorupTokenLayer: React.FC<PoorupTokenLayerProps> = ({
  players,
  currentPlayerId,
}) => {
  const activePlayers = players.filter((p) => !p.isBankrupt);

  // Group active players by board position
  const playersBySpace = new Map<number, Player[]>();
  activePlayers.forEach((player) => {
    const spaceIdx = (player.position || 0) % 40;
    const list = playersBySpace.get(spaceIdx) || [];
    list.push(player);
    playersBySpace.set(spaceIdx, list);
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden select-none">
      {Array.from(playersBySpace.entries()).map(([spaceIdx, playersOnSpace]) => {
        const coord = BOARD_COORDINATE_POSITIONS[spaceIdx] || { left: 50, top: 50 };
        const offsets = getTokenOffsets(playersOnSpace.length);

        return playersOnSpace.map((player, idx) => {
          const offset = offsets[idx % offsets.length];
          const isCurrent = player.id === currentPlayerId;
          const initial = player.name ? player.name.charAt(0).toUpperCase() : 'P';
          const playerColor = player.color || '#22c55e';

          return (
            <div
              key={player.id}
              className={`absolute flex items-center justify-center font-black text-white rounded-full transition-all duration-500 ease-out select-none cursor-pointer pointer-events-auto ${
                isCurrent ? 'z-40 scale-120 animate-bounce' : 'z-30 hover:scale-115'
              }`}
              style={{
                left: `${coord.left}%`,
                top: `${coord.top}%`,
                width: '26px',
                height: '26px',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                backgroundColor: playerColor,
                border: '2px solid #ffffff',
                boxShadow: isCurrent
                  ? `0 0 14px ${playerColor}, 0 4px 10px rgba(0,0,0,0.9), inset 0 2px 3px rgba(255,255,255,0.7)`
                  : `0 0 8px ${playerColor}99, 0 3px 6px rgba(0,0,0,0.8), inset 0 1px 2px rgba(255,255,255,0.5)`,
              }}
              title={`${player.name} — Rs ${player.cash}`}
            >
              {/* 3D Gloss Highlight */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/25 via-transparent to-white/45 pointer-events-none" />

              {/* Bold Player Initial */}
              <span className="relative z-10 leading-none text-xs font-mono drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {initial}
              </span>

              {/* Active Player Halo Pointer */}
              {isCurrent && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[9px] text-amber-300 leading-none filter drop-shadow animate-pulse pointer-events-none font-bold">
                  ▼
                </span>
              )}

              {/* Jail Lock Badge */}
              {player.inJail && (
                <span className="absolute -top-1 -right-1 text-[8px] bg-red-600 rounded-full p-0.5 text-white font-bold leading-none border border-white shadow">
                  🔒
                </span>
              )}
            </div>
          );
        });
      })}
    </div>
  );
};
