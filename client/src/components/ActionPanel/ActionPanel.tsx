import React, { useState, useEffect, useRef } from 'react';
import { GameState, Player, BOARD_SPACES } from '../../types';

interface ActionPanelProps {
  gameState: GameState;
  myPlayer: Player | null;
  isMyTurn: boolean;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onDeclineBuy: () => void;
  onPayBail: () => void;
  onUseJailCard: () => void;
  onEndTurn: () => void;
  onOpenTrade: () => void;
  onOpenManageProperties: () => void;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  gameState,
  myPlayer,
  isMyTurn,
  onRollDice,
  onBuyProperty,
  onDeclineBuy,
  onPayBail,
  onUseJailCard,
  onEndTurn,
  onOpenTrade,
  onOpenManageProperties,
}) => {
  if (!myPlayer) return null;

  const currentSpace = BOARD_SPACES[myPlayer.position];
  const propState = gameState.properties[currentSpace?.index];
  const isPurchasable =
    isMyTurn &&
    gameState.diceRolled &&
    ['PROPERTY', 'TRANSPORT', 'UTILITY'].includes(currentSpace?.type) &&
    propState &&
    !propState.ownerId;

  const canAfford = isPurchasable && myPlayer.cash >= (currentSpace.price || 0);

  // Floating Money Diff Animation
  const [moneyDiff, setMoneyDiff] = useState<number | null>(null);
  const prevCashRef = useRef(myPlayer.cash);

  useEffect(() => {
    if (myPlayer.cash !== prevCashRef.current) {
      const diff = myPlayer.cash - prevCashRef.current;
      setMoneyDiff(diff);
      prevCashRef.current = myPlayer.cash;

      const timer = setTimeout(() => {
        setMoneyDiff(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [myPlayer.cash]);

  return (
    <div className="w-full bg-[#1c182c]/95 border-t border-[#2e284a] p-2 sm:p-2.5 backdrop-blur-md shadow-2xl z-20 sticky bottom-0">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Player Profile */}
        <div className="flex items-center gap-2.5 relative">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow border border-[#2e284a] select-none"
            style={{ backgroundColor: myPlayer.color }}
          >
            {myPlayer.tokenEmoji}
          </div>

          <div className="relative">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-slate-100">{myPlayer.name}</span>
              {myPlayer.inJail && (
                <span className="bg-red-600 text-[9px] text-white font-bold px-1.5 py-0.2 rounded-full">
                  JAIL ({myPlayer.jailTurns}/{gameState.settings.maxJailTurns})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-[#81be97] font-black text-xs sm:text-sm font-mono tracking-tight">
                {myPlayer.cash.toLocaleString()}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[10px] sm:text-xs">
                {currentSpace?.name || 'Start'}
              </span>
            </div>

            {/* Floating Diff Badge */}
            {moneyDiff !== null && (
              <span
                className={`absolute -top-3 left-16 px-1.5 py-0.2 rounded-full text-[10px] font-black font-mono animate-bounce shadow-lg ${
                  moneyDiff > 0 ? 'bg-[#22c55e] text-slate-950' : 'bg-[#ef4444] text-white'
                }`}
              >
                {moneyDiff > 0 ? `+${moneyDiff}` : `-${Math.abs(moneyDiff)}`}
              </span>
            )}
          </div>
        </div>

        {/* Right: Contextual Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Jail Actions */}
          {isMyTurn && myPlayer.inJail && !gameState.diceRolled && (
            <div className="flex items-center gap-2">
              <button
                onClick={onPayBail}
                disabled={myPlayer.cash < gameState.settings.jailBail}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow"
              >
                Pay Bail ({gameState.settings.jailBail})
              </button>

              {myPlayer.getOutOfJailCards > 0 && (
                <button
                  onClick={onUseJailCard}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
                >
                  Use Card
                </button>
              )}

              <button
                onClick={onRollDice}
                className="px-4 py-2 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-xs sm:text-sm rounded-xl shadow"
              >
                Roll for Doubles
              </button>
            </div>
          )}

          {/* Normal Roll Dice */}
          {isMyTurn && !myPlayer.inJail && !gameState.diceRolled && (
            <button
              onClick={onRollDice}
              className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-[#7053ff] to-[#8c52ff] hover:from-[#6244f5] hover:to-[#7b42f5] text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ring-1 ring-[#b1b2f2]/50 animate-pulse"
            >
              <span>🎲</span>
              <span>Roll Dice</span>
            </button>
          )}

          {/* Buy & Pass */}
          {isPurchasable && (
            <div className="flex items-center gap-2">
              <button
                onClick={onBuyProperty}
                disabled={!canAfford}
                className="px-4 py-2 bg-[#81be97] hover:bg-[#6eab84] disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Buy {currentSpace.name} ({currentSpace.price})
              </button>

              <button
                onClick={onDeclineBuy}
                className="px-3 py-2 bg-[#130f1d] hover:bg-[#26213b] text-slate-300 font-bold text-xs rounded-xl border border-[#2e284a]"
              >
                Pass
              </button>
            </div>
          )}

          {/* Manage Plots */}
          <button
            onClick={onOpenManageProperties}
            className="px-3 py-2 bg-[#130f1d] hover:bg-[#26213b] text-slate-200 font-bold text-xs rounded-xl border border-[#2e284a] flex items-center gap-1"
          >
            <span>🏢</span>
            <span>Plots ({myPlayer.properties.length})</span>
          </button>

          {/* Trade Trigger */}
          <button
            onClick={onOpenTrade}
            className="px-3 py-2 bg-[#2f284e] hover:bg-[#3d3466] text-[#b1b2f2] font-bold text-xs rounded-xl border border-[#3b3260] flex items-center gap-1"
          >
            <span>🤝</span>
            <span>Trade</span>
          </button>

          {/* End Turn */}
          {isMyTurn && gameState.diceRolled && !isPurchasable && (
            <button
              onClick={onEndTurn}
              className="px-5 py-2.5 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-transform hover:scale-105 active:scale-95"
            >
              End Turn »
            </button>
          )}

          {/* Waiting indicator */}
          {!isMyTurn && (
            <div className="px-3 py-1.5 bg-[#130f1d] text-slate-400 text-xs font-semibold rounded-xl border border-[#2e284a] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Waiting for {gameState.players[gameState.currentPlayerIndex]?.name || 'Player'}...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
