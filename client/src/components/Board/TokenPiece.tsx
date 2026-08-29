import React from 'react';
import { Player } from '../../types';

interface TokenPieceProps {
  player: Player;
  isCurrentPlayer: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TokenPiece: React.FC<TokenPieceProps> = ({ player, isCurrentPlayer, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 sm:w-6 sm:h-6 text-[10px] sm:text-xs',
    md: 'w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm',
    lg: 'w-8 h-8 sm:w-9 sm:h-9 text-sm sm:text-base',
  }[size];

  const initial = player.name ? player.name.charAt(0).toUpperCase() : 'P';
  const playerColor = player.color || '#22c55e';

  return (
    <div
      className={`relative rounded-full flex items-center justify-center font-black text-white select-none transition-all duration-200 cursor-pointer ${
        isCurrentPlayer
          ? 'scale-115 -translate-y-0.5 z-40 animate-bounce'
          : 'hover:scale-110 z-20'
      } ${sizeClasses}`}
      style={{
        backgroundColor: playerColor,
        border: '2px solid #ffffff',
        boxShadow: isCurrentPlayer
          ? `0 0 12px ${playerColor}, 0 4px 10px rgba(0,0,0,0.9), inset 0 2px 3px rgba(255,255,255,0.7)`
          : `0 0 6px ${playerColor}99, 0 3px 6px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,255,255,0.5)`,
      }}
      title={`${player.name} — Balance: ${player.cash}`}
    >
      {/* 3D Gloss highlight */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 via-transparent to-white/40 pointer-events-none" />

      {/* High Contrast Initial */}
      <span className="relative z-10 leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] font-mono">
        {initial}
      </span>

      {/* Active Player Halo Crown */}
      {isCurrentPlayer && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] leading-none filter drop-shadow animate-pulse pointer-events-none">
          ▼
        </span>
      )}

      {/* Jail Indicator */}
      {player.inJail && (
        <span className="absolute -top-1 -right-1 text-[8px] bg-red-600 rounded-full p-0.5 text-white font-bold leading-none border border-white shadow">
          🔒
        </span>
      )}
    </div>
  );
};
