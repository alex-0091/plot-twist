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
    <div className="relative flex flex-col items-center justify-between p-2 sm:p-3 bg-[#171328] rounded-xl border border-[#2e284a] shadow-inner select-none w-full h-full">
      {/* Header Logo */}
      <div className="flex flex-col items-center z-10">
        <div className="flex items-center gap-1.5">
          <span className="text-lg sm:text-xl">🇵🇰</span>
          <h1 className="text-lg sm:text-2xl font-black tracking-wider text-white">
            PLOT TWIST
          </h1>
        </div>
        <p className="text-[8px] sm:text-[9px] text-[#b1b2f2] font-bold tracking-widest uppercase">
          Rule the economy
        </p>

        {gameState.settings.freeParkingMode === 'POT' && (
          <div className="mt-1 bg-[#241d3b] border border-[#3b3260] px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] text-[#d49cff] font-bold flex items-center gap-1">
            <span>🎭 Hira Mandi:</span>
            <span className="text-amber-300 font-bold">Rs {gameState.freeParkingPot}</span>
          </div>
        )}
      </div>

      {/* Center 3D Dice & Decks */}
      <div className="flex flex-col items-center justify-center gap-2 z-10 w-full max-w-xs my-auto">
        {/* Card Decks */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="bg-[#241d3b] border border-[#3b3260] rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow">
            <span className="text-base">😂</span>
            <span className="text-[8px] font-black text-amber-300 uppercase tracking-wider">
              SCENE ON HAI
            </span>
          </div>

          <div className="bg-[#1c2826] border border-[#28483b] rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow">
            <span className="text-base">🇵🇰</span>
            <span className="text-[8px] font-black text-emerald-300 uppercase tracking-wider">
              PAKISTAN ZINDABAD
            </span>
          </div>
        </div>

        {/* 3D Dice */}
        <Dice3D
          dice={gameState.lastDice}
          isRolling={isRolling}
          onRollComplete={() => setIsRolling(false)}
        />
      </div>

      {/* Bottom Turn Status */}
      <div className="w-full flex flex-col items-center gap-1 z-10 mt-auto">
        {currentPlayer && (
          <div
            className={`w-full py-1 px-2.5 rounded-xl text-center font-black text-xs shadow transition-all ${
              isMyTurn
                ? 'bg-[#7053ff] text-white ring-2 ring-[#b1b2f2] animate-pulse'
                : 'bg-[#1c182c] text-slate-300 border border-[#2e284a]'
            }`}
          >
            {isMyTurn ? (
              <span>👉 YOUR TURN</span>
            ) : (
              <span>⏳ {currentPlayer.name}'s turn...</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between w-full text-[8px] sm:text-[9px] text-slate-400 px-1 font-semibold">
          <span className="flex items-center gap-1">
            <span>🏡 Bank:</span>
            <strong className="text-emerald-400">{gameState.availableHouses}H</strong>
            <span>•</span>
            <strong className="text-red-400">{gameState.availableHotels}Hotels</strong>
          </span>

          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="text-[#b1b2f2] hover:text-white underline font-bold"
            >
              Match Rules 📋
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
