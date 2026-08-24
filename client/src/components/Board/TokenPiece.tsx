import React from 'react';
import { Player } from '../../types';

interface TokenPieceProps {
  player: Player;
  isCurrentPlayer: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TokenPiece: React.FC<TokenPieceProps> = ({ player, isCurrentPlayer, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 text-xs',
    md: 'w-7 h-7 text-sm',
    lg: 'w-9 h-9 text-base',
  }[size];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center font-bold shadow-lg transition-transform duration-300 transform select-none ${
        isCurrentPlayer ? 'scale-110 ring-2 ring-yellow-400 animate-pulse' : 'hover:scale-105'
      } ${sizeClasses}`}
      style={{
        backgroundColor: player.color || '#16A34A',
        boxShadow: `0 0 10px ${player.color}88`,
      }}
      title={`${player.name} (${player.token}) - Rs ${player.cash}`}
    >
      <span className="drop-shadow">{player.tokenEmoji || '🛺'}</span>
      {player.inJail && (
        <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 rounded-full px-1 py-0 text-white font-bold leading-none">
          🔒
        </span>
      )}
    </div>
  );
};
