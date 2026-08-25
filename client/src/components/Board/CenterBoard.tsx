import React, { useState, useEffect } from 'react';
import { GameState, Player, BOARD_SPACES } from '../../types';
import { Dice3D } from './Dice3D';

interface CenterBoardProps {
  gameState: GameState;
  currentPlayer: Player | null;
  myPlayer: Player | null;
  isMyTurn: boolean;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onDeclineBuy: () => void;
  onPayBail: () => void;
  onUseJailCard: () => void;
  onEndTurn: () => void;
}

export const CenterBoard: React.FC<CenterBoardProps> = ({
  gameState,
  currentPlayer,
  myPlayer,
  isMyTurn,
  onRollDice,
  onBuyProperty,
  onDeclineBuy,
  onPayBail,
  onUseJailCard,
  onEndTurn,
}) => {
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

  const currentSpace = myPlayer ? BOARD_SPACES[myPlayer.position] : null;
  const propState = currentSpace ? gameState.properties[currentSpace.index] : null;
  const isPurchasable =
    isMyTurn &&
    gameState.diceRolled &&
    ['PROPERTY', 'TRANSPORT', 'UTILITY'].includes(currentSpace?.type || '') &&
    propState &&
    !propState.ownerId;

  const canAfford = isPurchasable && myPlayer && myPlayer.cash >= (currentSpace?.price || 0);

  return (
    <div className="relative flex flex-col items-center justify-between p-2.5 bg-gradient-to-b from-[#18132e] via-[#151028] to-[#120e24] rounded-2xl border border-[#382c66] shadow-inner select-none w-full h-full">
      {/* Top Header: Free Parking Pot Indicator */}
      <div className="w-full flex items-center justify-center">
        {gameState.settings.freeParkingMode === 'POT' ? (
          <div className="bg-[#241c42] border border-[#443675] px-3 py-0.5 rounded-full text-[10px] text-[#d49cff] font-bold flex items-center gap-1.5 shadow-sm">
            <span>🎭 Pot:</span>
            <span className="text-amber-300 font-mono font-black">{gameState.freeParkingPot}</span>
          </div>
        ) : <div className="h-4" />}
      </div>

      {/* Center 3D Dice & Decks */}
      <div className="flex flex-col items-center justify-center gap-2 z-10 w-full max-w-xs my-auto">
        {/* Card Decks */}
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="bg-gradient-to-br from-[#2c2250] to-[#1e1738] border border-[#4c3b85] rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-base">⚡</span>
            <span className="text-[7.5px] sm:text-[8.5px] font-black text-amber-300 uppercase tracking-wider">
              SCENE ON HAI
            </span>
          </div>

          <div className="bg-gradient-to-br from-[#1b2b27] to-[#121f1c] border border-[#2d4e45] rounded-xl p-1.5 flex flex-col items-center justify-center text-center shadow-md">
            <span className="text-base">🇵🇰</span>
            <span className="text-[7.5px] sm:text-[8.5px] font-black text-emerald-300 uppercase tracking-wider">
              PAKISTAN ZINDABAD
            </span>
          </div>
        </div>

        {/* 3D Rolling Dice */}
        <Dice3D
          dice={gameState.lastDice}
          isRolling={isRolling}
          onRollComplete={() => setIsRolling(false)}
        />
      </div>

      {/* Bottom Center Turn & Action Hub (Poorup Style) */}
      <div className="w-full flex flex-col items-center gap-1.5 z-20 mt-auto">
        {/* Jail Controls */}
        {isMyTurn && myPlayer?.inJail && !gameState.diceRolled && (
          <div className="w-full flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPayBail}
              disabled={myPlayer.cash < gameState.settings.jailBail}
              className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-[10.5px] rounded-xl shadow"
            >
              Pay Bail ({gameState.settings.jailBail})
            </button>
            {myPlayer.getOutOfJailCards > 0 && (
              <button
                type="button"
                onClick={onUseJailCard}
                className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] rounded-xl shadow"
              >
                Use Card
              </button>
            )}
            <button
              type="button"
              onClick={onRollDice}
              className="flex-1 py-1.5 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-[10.5px] rounded-xl shadow"
            >
              Roll Doubles
            </button>
          </div>
        )}

        {/* Primary Roll Button */}
        {isMyTurn && !myPlayer?.inJail && !gameState.diceRolled && (
          <button
            type="button"
            onClick={onRollDice}
            className="w-full py-2.5 bg-gradient-to-r from-[#7053ff] to-[#8c52ff] hover:from-[#6244f5] hover:to-[#7b42f5] text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ring-2 ring-[#b1b2f2]/60 animate-pulse"
          >
            <span>🎲</span>
            <span>ROLL DICE</span>
          </button>
        )}

        {/* Buy & Pass Actions */}
        {isPurchasable && currentSpace && (
          <div className="w-full flex items-center gap-1.5">
            <button
              type="button"
              onClick={onBuyProperty}
              disabled={!canAfford}
              className="flex-1 py-2 bg-[#81be97] hover:bg-[#6eab84] disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Buy {currentSpace.name} ({currentSpace.price})
            </button>
            <button
              type="button"
              onClick={onDeclineBuy}
              className="py-2 px-3 bg-[#1e1838] hover:bg-[#2e2552] text-slate-300 font-bold text-xs rounded-xl border border-[#382c66]"
            >
              Pass
            </button>
          </div>
        )}

        {/* End Turn Action */}
        {isMyTurn && gameState.diceRolled && !isPurchasable && (
          <button
            type="button"
            onClick={onEndTurn}
            className="w-full py-2 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-transform hover:scale-105 active:scale-95"
          >
            END TURN »
          </button>
        )}

        {/* Not My Turn Status Pill */}
        {!isMyTurn && (
          <div className="w-full py-1.5 px-2.5 rounded-xl bg-[#1e1838] text-slate-300 border border-[#382c66] text-center text-xs font-bold">
            <span>⏳ {currentPlayer?.name || 'Player'}'s Turn...</span>
          </div>
        )}
      </div>
    </div>
  );
};
