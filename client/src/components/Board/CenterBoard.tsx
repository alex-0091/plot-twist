import React from 'react';
import { GameState, Player } from '../../types';

interface CenterBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  myPlayerId: string | null;
}

export const CenterBoard: React.FC<CenterBoardProps> = ({
  gameState,
  currentPlayer,
  myPlayerId,
}) => {
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const [d1, d2] = gameState.lastDice;
  const totalRoll = d1 + d2;
  const isDouble = d1 === d2 && gameState.diceRolled;

  return (
    <div className="relative flex flex-col items-center justify-between p-4 bg-gradient-to-br from-slate-900/95 via-emerald-950/40 to-slate-900/95 rounded-xl border border-emerald-500/30 shadow-2xl overflow-hidden select-none">
      {/* Truck Art Background Watermark */}
      <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center font-black text-9xl">
        🇵🇰
      </div>

      {/* Top Header: Game Logo & Free Parking Pot */}
      <div className="flex flex-col items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl sm:text-3xl">🇵🇰</span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 bg-clip-text text-transparent drop-shadow">
            PLOT TWIST
          </h1>
        </div>
        <p className="text-[10px] sm:text-xs text-amber-300 font-semibold tracking-widest uppercase">
          Pakistan's Property Game
        </p>

        {gameState.settings.freeParkingMode === 'POT' && (
          <div className="mt-1 bg-purple-950/80 border border-purple-500/40 px-2 py-0.5 rounded-full text-[10px] text-purple-200 font-bold flex items-center gap-1">
            <span>🎭 Hira Mandi Pot:</span>
            <span className="text-amber-300">Rs {gameState.freeParkingPot}</span>
          </div>
        )}
      </div>

      {/* Center: Interactive Decks & Dice Hub */}
      <div className="flex flex-col items-center justify-center gap-3 my-2 z-10 w-full max-w-sm">
        {/* Card Decks Graphic */}
        <div className="grid grid-cols-2 gap-3 w-full">
          {/* Scene On Hai Deck */}
          <div className="bg-amber-950/60 border border-amber-500/50 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-lg transform hover:-translate-y-0.5 transition-transform">
            <span className="text-xl">😂</span>
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
              SCENE ON HAI
            </span>
            <span className="text-[8px] text-amber-400/80 font-urdu">سین آن ہے</span>
          </div>

          {/* Pakistan Zindabad Deck */}
          <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-lg p-2 flex flex-col items-center justify-center text-center shadow-lg transform hover:-translate-y-0.5 transition-transform">
            <span className="text-xl">🇵🇰</span>
            <span className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">
              PAKISTAN ZINDABAD
            </span>
            <span className="text-[8px] text-emerald-400/80 font-urdu">پاکستان زندہ باد</span>
          </div>
        </div>

        {/* Dice Roller Display */}
        <div className="flex flex-col items-center justify-center bg-slate-950/80 border border-slate-700/60 rounded-xl px-4 py-2 shadow-inner">
          <div className="flex items-center gap-3">
            {/* Die 1 */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-200 text-slate-900 font-black text-xl sm:text-2xl rounded-lg flex items-center justify-center shadow-md border-2 border-amber-300 dice-cube">
              {d1}
            </div>
            {/* Die 2 */}
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-100 to-amber-200 text-slate-900 font-black text-xl sm:text-2xl rounded-lg flex items-center justify-center shadow-md border-2 border-amber-300 dice-cube">
              {d2}
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-300">Total:</span>
            <span className="text-amber-400 text-sm font-extrabold">{totalRoll}</span>
            {isDouble && (
              <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider animate-bounce ml-1">
                DOUBLES!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Status Banner & Bank Supply */}
      <div className="w-full flex flex-col items-center gap-1 z-10">
        {/* Current Turn Banner */}
        {currentPlayer && (
          <div
            className={`w-full py-1.5 px-3 rounded-lg text-center font-bold text-xs sm:text-sm shadow-md transition-all ${
              isMyTurn
                ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white ring-2 ring-emerald-300 animate-pulse'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}
          >
            {isMyTurn ? (
              <span>👉 IT'S YOUR TURN! Roll & Build your empire!</span>
            ) : (
              <span>⏳ {currentPlayer.name}'s turn...</span>
            )}
          </div>
        )}

        {/* Bank Supply Badges */}
        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <span>🏡 Bank Houses:</span>
            <span className="text-emerald-400 font-bold">{gameState.availableHouses}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span>🏨 Bank Hotels:</span>
            <span className="text-red-400 font-bold">{gameState.availableHotels}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
