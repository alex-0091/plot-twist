import React from 'react';
import { BoardSpace, Player } from '../../types';
import { TokenPiece } from './TokenPiece';

interface CornerTileProps {
  space: BoardSpace;
  playersHere: Player[];
  currentPlayerId?: string;
  onClick: (spaceIndex: number) => void;
}

export const CornerTile: React.FC<CornerTileProps> = ({
  space,
  playersHere,
  currentPlayerId,
  onClick,
}) => {
  return (
    <div
      onClick={() => onClick(space.index)}
      className="relative w-full h-full bg-[#1a162b] border border-[#2e284a] flex flex-col items-center justify-center p-0.5 sm:p-1 text-center cursor-pointer hover:bg-[#25203d] transition-colors select-none overflow-hidden group shadow-sm rounded-sm"
    >
      {/* 1. Space 0: START */}
      {space.index === 0 && (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-sm sm:text-base md:text-xl">💵</span>
          <span className="text-[7.5px] sm:text-[9px] md:text-xs font-black text-amber-400 tracking-wider mt-0.5">
            START
          </span>
          <span className="text-[6.5px] sm:text-[8px] font-black text-white bg-emerald-700/80 px-1 py-0.2 rounded mt-0.5 font-mono shadow">
            +200
          </span>
        </div>
      )}

      {/* 2. Space 10: QUETTA CAFE / THANA */}
      {space.index === 10 && (
        <div className="flex flex-col items-center justify-center w-full h-full leading-tight">
          <div className="text-center">
            <span className="text-xs sm:text-sm">☕</span>
            <div className="text-[6px] sm:text-[7.5px] md:text-[8px] font-black text-amber-300">
              QUETTA CAFE
            </div>
            <div className="text-[5px] sm:text-[6px] text-slate-400">Visiting</div>
          </div>
          <div className="w-full border-t border-[#2e284a] my-0.5" />
          <div className="text-center">
            <span className="text-[6px] sm:text-[7.5px] md:text-[8px] font-black text-red-400">
              THANA (JAIL)
            </span>
          </div>
        </div>
      )}

      {/* 3. Space 20: HIRA MANDI */}
      {space.index === 20 && (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-sm sm:text-base md:text-lg">🎭</span>
          <span className="text-[6.5px] sm:text-[8px] md:text-[9.5px] font-black text-purple-400 tracking-tight mt-0.5">
            HIRA MANDI
          </span>
          <span className="text-[5.5px] sm:text-[7px] text-slate-400">Free Rest</span>
        </div>
      )}

      {/* 4. Space 30: MET A LAHORI */}
      {space.index === 30 && (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-sm sm:text-base md:text-lg">🚨</span>
          <span className="text-[6.5px] sm:text-[8px] md:text-[9.5px] font-black text-red-400 tracking-tight mt-0.5">
            MET A LAHORI
          </span>
          <span className="text-[5.5px] sm:text-[6.5px] font-bold text-red-300 bg-red-950/80 px-0.5 rounded mt-0.5">
            GO TO JAIL
          </span>
        </div>
      )}

      {/* Players on this corner space */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-30 bg-black/30 backdrop-blur-[0.5px]">
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
