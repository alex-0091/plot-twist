import React from 'react';
import { BoardSpace, Player } from '../../types';
import { TokenPiece } from './TokenPiece';

interface PoorupCornerTileProps {
  space: BoardSpace;
  playersHere: Player[];
  currentPlayerId?: string;
  onClick: (spaceIndex: number) => void;
}

export const PoorupCornerTile: React.FC<PoorupCornerTileProps> = ({
  space,
  playersHere,
  currentPlayerId,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(space.index)}
      className="relative w-full h-full bg-[#1b1435] border border-[#382b66] flex flex-col items-center justify-center p-0.5 sm:p-1 text-center cursor-pointer hover:bg-[#281e4d] transition-colors select-none overflow-hidden group shadow-sm"
    >
      {/* Space 0: START / GO */}
      {space.index === 0 && (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-sm sm:text-xl filter drop-shadow">💵</span>
          <span className="text-[7.5px] sm:text-[9px] font-black text-amber-300 tracking-wider mt-0.5">
            START
          </span>
          <span className="text-[6.5px] sm:text-[7.5px] font-black text-black bg-[#22c55e] px-1 py-0.2 rounded font-mono shadow-sm mt-0.5">
            +200
          </span>
        </div>
      )}

      {/* Space 10: JAIL & QUETTA CAFE */}
      {space.index === 10 && (
        <div className="w-full h-full flex flex-col justify-between p-0.5 text-center">
          {/* Visiting Outer Section */}
          <div className="flex items-center justify-center gap-0.5 bg-[#15102a] rounded py-0.5 border border-[#382b66]">
            <span className="text-[8px] sm:text-[10px]">☕</span>
            <div className="text-[5.5px] sm:text-[7px] font-black text-amber-300 leading-tight">
              QUETTA CAFE (VISITING)
            </div>
          </div>

          {/* Locked In Jail Section */}
          <div className="flex items-center justify-center gap-0.5 bg-[#2b181b] rounded py-0.5 border border-red-900/60 mt-0.5">
            <span className="text-[8px] sm:text-[10px]">🚔</span>
            <div className="text-[5.5px] sm:text-[7px] font-black text-red-400 leading-tight">
              IN THANA (JAIL)
            </div>
          </div>
        </div>
      )}

      {/* Space 20: HIRA MANDI (FREE PARKING) */}
      {space.index === 20 && (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-sm sm:text-xl filter drop-shadow">🎭</span>
          <span className="text-[6.5px] sm:text-[8px] font-black text-purple-300 tracking-tight mt-0.5">
            HIRA MANDI
          </span>
          <span className="text-[5.5px] sm:text-[6.5px] font-semibold text-slate-400">
            Free Rest
          </span>
        </div>
      )}

      {/* Space 30: MET A LAHORI (GO TO JAIL) */}
      {space.index === 30 && (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-sm sm:text-xl filter drop-shadow animate-pulse">🚨</span>
          <span className="text-[6.5px] sm:text-[8px] font-black text-red-400 tracking-tight mt-0.5">
            MET A LAHORI
          </span>
          <span className="text-[5.5px] sm:text-[6.5px] font-black text-white bg-red-900 px-1 py-0.2 rounded mt-0.5">
            GO TO JAIL
          </span>
        </div>
      )}

      {/* Player Tokens on this corner space */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-1 flex-wrap p-0.5 z-40">
          {playersHere.map((p) => (
            <TokenPiece
              key={p.id}
              player={p}
              isCurrentPlayer={p.id === currentPlayerId}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
};
