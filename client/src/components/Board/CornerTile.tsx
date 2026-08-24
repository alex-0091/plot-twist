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
      className="relative bg-slate-900/90 border-2 border-emerald-600/40 flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-slate-800 transition-colors select-none overflow-hidden group shadow-md"
    >
      {/* Corner Specific Designs */}
      {space.index === 0 && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl animate-pulse">💵</span>
          <span className="text-[10px] sm:text-xs font-black text-amber-400 tracking-wider">
            START
          </span>
          <span className="text-[9px] font-urdu text-emerald-400">تنخواہ آ گئی</span>
          <span className="text-[9px] sm:text-[10px] font-bold text-white bg-emerald-700/60 px-1 rounded mt-0.5">
            +Rs 200
          </span>
        </div>
      )}

      {space.index === 10 && (
        <div className="flex flex-col items-center justify-center w-full h-full">
          <div className="text-center">
            <span className="text-lg">☕</span>
            <div className="text-[9px] font-bold text-amber-300 leading-tight">
              QUETTA CAFÉ
            </div>
            <div className="text-[8px] text-slate-400">Just Visiting</div>
          </div>
          <div className="w-full border-t border-slate-700 my-0.5" />
          <div className="text-center">
            <span className="text-base">🚔</span>
            <div className="text-[9px] font-black text-red-400 leading-tight">
              THANA
            </div>
            <div className="text-[8px] font-urdu text-red-300">تھانہ</div>
          </div>
        </div>
      )}

      {space.index === 20 && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl">🎭</span>
          <span className="text-[10px] sm:text-xs font-black text-purple-400 tracking-wider">
            HIRA MANDI
          </span>
          <span className="text-[9px] font-urdu text-purple-300">ہیرا منڈی</span>
          <span className="text-[8px] text-slate-400 mt-0.5">Free Parking</span>
        </div>
      )}

      {space.index === 30 && (
        <div className="flex flex-col items-center justify-center">
          <span className="text-xl sm:text-2xl animate-bounce">🚨</span>
          <span className="text-[9px] sm:text-[10px] font-black text-red-500 leading-tight">
            MET A LAHORI
          </span>
          <span className="text-[8px] text-slate-300">Went Wrong Way</span>
          <span className="text-[8px] font-urdu text-amber-400">سیدھا تھانہ!</span>
          <span className="text-[8px] font-bold text-red-400 mt-0.5 bg-red-950/80 px-1 rounded">
            GO TO THANA
          </span>
        </div>
      )}

      {/* Players on this corner space */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-1 flex-wrap p-1 z-30 bg-black/30 backdrop-blur-[0.5px]">
          {playersHere.map((p) => (
            <TokenPiece
              key={p.id}
              player={p}
              isCurrentPlayer={p.id === currentPlayerId}
              size="md"
            />
          ))}
        </div>
      )}
    </div>
  );
};
