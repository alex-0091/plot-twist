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
      className="relative w-full h-full bg-[#1b1533] border border-[#382c66] flex flex-col items-center justify-center p-1 text-center cursor-pointer hover:bg-[#281f4a] transition-colors select-none overflow-hidden group shadow-sm rounded-sm"
    >
      {/* 1. Space 0: START */}
      {space.index === 0 && (
        <div className="flex flex-col items-center justify-center leading-none">
          <span className="text-base sm:text-xl md:text-2xl filter drop-shadow">💵</span>
          <span className="text-[8px] sm:text-[9.5px] md:text-xs font-black text-amber-400 tracking-wider mt-0.5">
            START
          </span>
          <span className="text-[7px] sm:text-[8.5px] font-black text-black bg-[#22c55e] px-1.5 py-0.5 rounded mt-0.5 font-mono shadow">
            +200
          </span>
        </div>
      )}

      {/* 2. Space 10: QUETTA CAFE / THANA */}
      {space.index === 10 && (
        <div className="flex flex-col items-center justify-center w-full h-full leading-tight">
          <div className="text-center flex flex-col items-center">
            <span className="text-xs sm:text-sm">☕</span>
            <div className="text-[6.5px] sm:text-[8px] md:text-[9px] font-black text-amber-300 tracking-tight">
              QUETTA CAFE
            </div>
            <div className="text-[5.5px] sm:text-[6.5px] text-slate-400 font-semibold">Visiting</div>
          </div>
          <div className="w-full border-t border-[#382c66] my-0.5" />
          <div className="text-center flex flex-col items-center">
            <span className="text-xs sm:text-sm">🚔</span>
            <div className="text-[6.5px] sm:text-[8px] md:text-[9px] font-black text-red-400 tracking-tight">
              THANA (JAIL)
            </div>
          </div>
        </div>
      )}

      {/* 3. Space 20: HIRA MANDI */}
      {space.index === 20 && (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-base sm:text-xl md:text-2xl filter drop-shadow">🎭</span>
          <span className="text-[7px] sm:text-[8.5px] md:text-[10px] font-black text-purple-400 tracking-tight mt-0.5">
            HIRA MANDI
          </span>
          <span className="text-[6px] sm:text-[7.5px] text-slate-400 font-semibold mt-0.5">Free Parking</span>
        </div>
      )}

      {/* 4. Space 30: MET A LAHORI */}
      {space.index === 30 && (
        <div className="flex flex-col items-center justify-center leading-tight">
          <span className="text-base sm:text-xl md:text-2xl filter drop-shadow animate-pulse">🚨</span>
          <span className="text-[7px] sm:text-[8.5px] md:text-[10px] font-black text-red-400 tracking-tight mt-0.5">
            MET A LAHORI
          </span>
          <span className="text-[6px] sm:text-[7px] font-black text-white bg-red-800/90 px-1 py-0.2 rounded mt-0.5">
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
