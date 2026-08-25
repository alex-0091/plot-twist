import React, { useState, useEffect } from 'react';
import { GameState, Player } from '../../types';
import { Dice3D } from './Dice3D';

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
    <div className="relative flex flex-col items-center justify-between p-2.5 bg-gradient-to-b from-[#18132e] via-[#151028] to-[#120e24] rounded-2xl border border-[#382c66] shadow-inner select-none w-full h-full">
      {/* Top Bar: Free Parking Pot (if enabled) */}
      <div className="w-full flex items-center justify-center">
        {gameState.settings.freeParkingMode === 'POT' && (
          <div className="bg-[#241c42] border border-[#443675] px-2.5 py-0.5 rounded-full text-[9px] text-[#d49cff] font-bold flex items-center gap-1.5 shadow-sm">
            <span>🎭 Pot:</span>
            <span className="text-amber-300 font-mono font-black">{gameState.freeParkingPot}</span>
          </div>
        )}
      </div>

      {/* Center 3D Dice & Decks */}
      <div className="flex flex-col items-center justify-center gap-2 sm:gap-3.5 z-10 w-full max-w-xs my-auto">
        {/* Card Decks */}
        <div className="grid grid-cols-2 gap-2.5 w-full">
          <div className="bg-gradient-to-br from-[#2c2250] to-[#1e1738] border border-[#4c3b85] rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-lg">⚡</span>
            <span className="text-[8px] sm:text-[9px] font-black text-amber-300 uppercase tracking-wider mt-0.5">
              SCENE ON HAI
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#1b2b27] to-[#121f1c] border border-[#2d4e45] rounded-xl p-2 flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-lg">🇵🇰</span>
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-300 uppercase tracking-wider mt-0.5">
              PAKISTAN ZINDABAD
            </span>
          </div>
        </div>

        {/* 3D Physical Rolling Dice */}
        <Dice3D
          dice={gameState.lastDice}
          isRolling={isRolling}
          onRollComplete={() => setIsRolling(false)}
        />
      </div>

      {/* Bottom Turn Callout Pill */}
      <div className="w-full flex flex-col items-center z-10 mt-auto">
        {currentPlayer && (
          <div
            className={`w-full py-1.5 px-3 rounded-xl text-center font-extrabold text-xs transition-all ${
              isMyTurn
                ? 'bg-[#7053ff] text-white shadow-lg ring-2 ring-[#b1b2f2] animate-pulse'
                : 'bg-[#1e1838] text-slate-300 border border-[#382c66]'
            }`}
          >
            {isMyTurn ? (
              <span className="tracking-wide">👉 YOUR TURN</span>
            ) : (
              <span className="tracking-normal font-bold text-slate-200">
                ⏳ {currentPlayer.name}'s Turn...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
