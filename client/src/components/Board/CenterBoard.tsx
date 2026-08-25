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
    <div className="relative flex flex-col items-center justify-between p-2 bg-[#171328] rounded-xl border border-[#2e284a] select-none w-full h-full">
      {/* Top Free Parking Indicator (if enabled) */}
      <div className="w-full flex items-center justify-between px-1 text-[9px] text-slate-400">
        {gameState.settings.freeParkingMode === 'POT' ? (
          <div className="bg-[#241d3b] border border-[#3b3260] px-2 py-0.5 rounded-full text-[#d49cff] font-bold flex items-center gap-1">
            <span>🎭 Pot:</span>
            <span className="text-amber-300 font-mono font-bold">{gameState.freeParkingPot}</span>
          </div>
        ) : <div />}

        {onOpenRules && (
          <button
            onClick={onOpenRules}
            className="text-[#b1b2f2] hover:text-white underline font-semibold text-[8px] sm:text-[9px]"
          >
            Rules 📋
          </button>
        )}
      </div>

      {/* Center 3D Dice & Decks */}
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 z-10 w-full max-w-xs my-auto">
        {/* Card Decks */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="bg-[#241d3b] border border-[#3b3260] rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-base">⚡</span>
            <span className="text-[7.5px] sm:text-[8px] font-black text-amber-300 uppercase tracking-wider">
              SCENE ON HAI
            </span>
          </div>

          <div className="bg-[#1c2826] border border-[#28483b] rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-base">🇵🇰</span>
            <span className="text-[7.5px] sm:text-[8px] font-black text-emerald-300 uppercase tracking-wider">
              PAKISTAN ZINDABAD
            </span>
          </div>
        </div>

        {/* Borderless Floating 3D Dice */}
        <Dice3D
          dice={gameState.lastDice}
          isRolling={isRolling}
          onRollComplete={() => setIsRolling(false)}
        />
      </div>

      {/* Bottom Turn Status Pill */}
      <div className="w-full flex flex-col items-center gap-1 z-10 mt-auto">
        {currentPlayer && (
          <div
            className={`w-full py-1 px-2 rounded-xl text-center font-extrabold text-xs transition-all ${
              isMyTurn
                ? 'bg-[#7053ff] text-white shadow ring-1 ring-[#b1b2f2] animate-pulse'
                : 'bg-[#1c182c] text-slate-300 border border-[#2e284a]'
            }`}
          >
            {isMyTurn ? (
              <span>YOUR TURN</span>
            ) : (
              <span>{currentPlayer.name}'s Turn</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
