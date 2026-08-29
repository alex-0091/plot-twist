import React from 'react';
import { Player } from '../../types';

interface TokenPieceProps {
  player: Player;
  isCurrentPlayer: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TokenPiece: React.FC<TokenPieceProps> = ({ player, isCurrentPlayer, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-5 h-5 text-[11px]',
    lg: 'w-7 h-7 text-xs',
  }[size];

  const initial = player.name ? player.name.charAt(0).toUpperCase() : 'P';

  return (
    <div
      className={`relative rounded-full flex items-center justify-center font-black text-white shadow-md border-2 border-white/90 transition-all duration-200 select-none ${
        isCurrentPlayer ? 'scale-125 ring-2 ring-amber-300 animate-pulse z-30 shadow-lg' : 'hover:scale-110 z-20'
      } ${sizeClasses}`}
      style={{
        backgroundColor: player.color || '#22c55e',
        boxShadow: `0 2px 6px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.6)`,
      }}
      title={`${player.name} - ${player.cash}`}
    >
      <span className="leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
        {initial}
      </span>
      {player.inJail && (
        <span className="absolute -top-1 -right-1 text-[7px] bg-red-600 rounded-full px-0.5 text-white font-bold leading-none border border-white">
          🔒
        </span>
      )}
    </div>
  );
};
