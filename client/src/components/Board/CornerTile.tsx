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
      className="relative w-full h-full bg-slate-900/95 border-2 border-emerald-600/50 flex flex-col items-center justify-center p-1 sm:p-2 text-center cursor-pointer hover:bg-slate-800 transition-colors select-none overflow-hidden group shadow-md rounded-md"
    >
      {/* Corner Specific Designs */}
      {space.index === 0 && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-base sm:text-xl md:text-2xl animate-pulse">💵</span>
          <span className="text-[8px] sm:text-[10px] md:text-xs font-black text-amber-400 tracking-wider">
            START
          </span>
          <span className="text-[7px] sm:text-[8px] font-urdu text-emerald-400 hidden sm:block">تنخواہ آ گئی</span>
          <span className="text-[7px] sm:text-[9px] font-black text-white bg-emerald-700/80 px-1 py-0.2 rounded mt-0.5 shadow">
            +Rs 200
          </span>
        </div>
      )}

      {space.index === 10 && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="text-center">
            <span className="text-sm sm:text-base">☕</span>
            <div className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-amber-300 leading-tight">
              QUETTA CAFÉ
            </div>
            <div className="text-[6px] sm:text-[7px] text-slate-400">Visiting</div>
          </div>
          <div className="w-full border-t border-slate-700/80 my-0.5" />
          <div className="text-center">
            <span className="text-xs sm:text-sm">🚔</span>
            <div className="text-[7px] sm:text-[8px] md:text-[9px] font-black text-red-400 leading-tight">
              THANA
            </div>
          </div>
        </div>
      )}

      {space.index === 20 && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-base sm:text-xl md:text-2xl">🎭</span>
          <span className="text-[8px] sm:text-[10px] md:text-xs font-black text-purple-400 tracking-wider">
            HIRA MANDI
          </span>
          <span className="text-[7px] sm:text-[8px] font-urdu text-purple-300 hidden sm:block">ہیرا منڈی</span>
          <span className="text-[7px] sm:text-[8px] text-slate-400 mt-0.5">Free Parking</span>
        </div>
      )}

      {space.index === 30 && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-base sm:text-xl md:text-2xl animate-bounce">🚨</span>
          <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black text-red-500 leading-tight">
            MET A LAHORI
          </span>
          <span className="text-[7px] sm:text-[8px] text-slate-300 hidden sm:block">Went Wrong Way</span>
          <span className="text-[7px] sm:text-[8px] font-black text-red-400 mt-0.5 bg-red-950/90 px-1 rounded">
            TO THANA
          </span>
        </div>
      )}

      {/* Players on this corner space */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-0.5 flex-wrap p-1 z-30 bg-black/30 backdrop-blur-[0.5px]">
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
