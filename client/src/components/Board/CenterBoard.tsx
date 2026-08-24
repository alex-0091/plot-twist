import React, { useState, useEffect } from 'react';
import { GameState, Player } from '../../types';
import { Dice3D } from './Dice3D';

interface CenterBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  myPlayerId: string | null;
  onOpenRules?: () => void;
}

export const CenterBoard: React.FC<CenterBoardProps> = ({
  gameState,
  currentPlayer,
  myPlayerId,
  onOpenRules,
}) => {
  const isMyTurn = currentPlayer?.id === myPlayerId;
  const [isRolling, setIsRolling] = useState(false);
  const prevDiceRef = React.useRef(gameState.lastDice);

  useEffect(() => {
    if (
      gameState.lastDice[0] !== prevDiceRef.current[0] ||
      gameState.lastDice[1] !== prevDiceRef.current[1]
    ) {
      setIsRolling(true);
      prevDiceRef.current = gameState.lastDice;
    }
  }, [gameState.lastDice]);

  return (
    <div className="relative flex flex-col items-center justify-between p-3 sm:p-4 bg-gradient-to-br from-slate-900/95 via-emerald-950/40 to-slate-900/95 rounded-2xl border-2 border-emerald-500/40 shadow-2xl overflow-hidden select-none w-full h-full">
      {/* Background Watermark */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center font-black text-9xl">
        🇵🇰
      </div>

      {/* Header Logo */}
      <div className="flex flex-col items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl animate-bounce-short">🇵🇰</span>
          <h1 className="text-xl sm:text-3xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 bg-clip-text text-transparent drop-shadow">
            PLOT TWIST
          </h1>
        </div>
        <p className="text-[9px] sm:text-[10px] text-amber-300 font-bold tracking-widest uppercase mt-0.5">
          Pakistan's Property Game
        </p>

        {gameState.settings.freeParkingMode === 'POT' && (
          <div className="mt-1 bg-purple-950/90 border border-purple-500/50 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] text-purple-200 font-bold flex items-center gap-1.5 shadow">
            <span>🎭 Hira Mandi Pot:</span>
            <span className="text-amber-300 font-black">Rs {gameState.freeParkingPot}</span>
          </div>
        )}
      </div>

      {/* Center 3D Dice & Decks */}
      <div className="flex flex-col items-center justify-center gap-2.5 z-10 w-full max-w-xs my-auto">
        {/* Interactive Deck Piles */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          {/* Scene On Hai */}
          <div className="bg-amber-950/70 border border-amber-500/60 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-0.5">
            <span className="text-lg">😂</span>
            <span className="text-[9px] font-black text-amber-300 uppercase tracking-wider">
              SCENE ON HAI
            </span>
            <span className="text-[8px] text-amber-400/80 font-urdu">سین آن ہے</span>
          </div>

          {/* Pakistan Zindabad */}
          <div className="bg-emerald-950/70 border border-emerald-500/60 rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:-translate-y-0.5">
            <span className="text-lg">🇵🇰</span>
            <span className="text-[9px] font-black text-emerald-300 uppercase tracking-wider">
              PAKISTAN ZINDABAD
            </span>
            <span className="text-[8px] text-emerald-400/80 font-urdu">پاکستان زندہ باد</span>
          </div>
        </div>

        {/* 3D Realistic Dice */}
        <Dice3D
          dice={gameState.lastDice}
          isRolling={isRolling}
          onRollComplete={() => setIsRolling(false)}
        />
      </div>

      {/* Bottom Turn Status & Bank Supply */}
      <div className="w-full flex flex-col items-center gap-1.5 z-10 mt-auto">
        {currentPlayer && (
          <div
            className={`w-full py-1.5 px-3 rounded-xl text-center font-black text-xs sm:text-sm shadow-md transition-all ${
              isMyTurn
                ? 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white ring-2 ring-emerald-300 animate-pulse'
                : 'bg-slate-800 text-slate-200 border border-slate-700'
            }`}
          >
            {isMyTurn ? (
              <span>👉 IT'S YOUR TURN! Roll & Build!</span>
            ) : (
              <span>⏳ {currentPlayer.name}'s turn...</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between w-full text-[9px] text-slate-400 px-1 font-semibold">
          <span className="flex items-center gap-1">
            <span>🏡 Bank:</span>
            <strong className="text-emerald-400">{gameState.availableHouses}H</strong>
            <span>•</span>
            <strong className="text-red-400">{gameState.availableHotels}Hotels</strong>
          </span>

          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="text-amber-400 hover:text-amber-300 underline font-bold"
            >
              Match Rules 📋
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
