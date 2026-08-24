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

  // Floating Money Diff Animation (+Rs 200, -Rs 50)
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
    <div className="w-full bg-slate-900/95 border-t-2 border-emerald-500/50 p-2.5 sm:p-4 backdrop-blur-md shadow-2xl z-20 sticky bottom-0">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Player Profile & Animated Cash */}
        <div className="flex items-center gap-3 relative">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-slate-700 select-none"
            style={{ backgroundColor: myPlayer.color }}
          >
            {myPlayer.tokenEmoji}
          </div>

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-slate-100">{myPlayer.name}</span>
              {myPlayer.inJail && (
                <span className="bg-red-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                  IN THANA ({myPlayer.jailTurns}/{gameState.settings.maxJailTurns})
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-black text-sm sm:text-base tracking-wide">
                Rs {myPlayer.cash.toLocaleString()}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">
                At: <strong className="text-amber-300">{currentSpace?.name || 'Start'}</strong>
              </span>
            </div>

            {/* Floating Money Diff Badge */}
            {moneyDiff !== null && (
              <span
                className={`absolute -top-3 left-20 px-2 py-0.5 rounded-full text-xs font-black animate-bounce shadow-lg ${
                  moneyDiff > 0 ? 'bg-emerald-500 text-slate-950' : 'bg-red-600 text-white'
                }`}
              >
                {moneyDiff > 0 ? `+Rs ${moneyDiff}` : `-Rs ${Math.abs(moneyDiff)}`}
              </span>
            )}
          </div>
        </div>

        {/* Center / Right: Primary Contextual Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* In Thana Actions */}
          {isMyTurn && myPlayer.inJail && !gameState.diceRolled && (
            <div className="flex items-center gap-2">
              <button
                onClick={onPayBail}
                disabled={myPlayer.cash < gameState.settings.jailBail}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                🔓 PAY BAIL (Rs {gameState.settings.jailBail})
              </button>

              {myPlayer.getOutOfJailCards > 0 && (
                <button
                  onClick={onUseJailCard}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  ⚖️ USE GOVT COUSIN CARD
                </button>
              )}

              <button
                onClick={onRollDice}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:scale-105 animate-pulse flex items-center gap-1.5"
              >
                <span>🎲</span>
                <span>ROLL FOR DOUBLES</span>
              </button>
            </div>
          )}

          {/* Normal Roll Dice Button */}
          {isMyTurn && !myPlayer.inJail && !gameState.diceRolled && (
            <button
              onClick={onRollDice}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 animate-pulse flex items-center gap-2 ring-2 ring-emerald-300/60"
            >
              <span className="text-xl">🎲</span>
              <span>ROLL DICE</span>
            </button>
          )}

          {/* Buy Property & Auction */}
          {isPurchasable && (
            <div className="flex items-center gap-2 animate-bounce-short">
              <button
                onClick={onBuyProperty}
                disabled={!canAfford}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 hover:from-amber-400 hover:to-yellow-400 disabled:opacity-40 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all transform hover:scale-105"
              >
                🏠 BUY {currentSpace.name.toUpperCase()} (Rs {currentSpace.price})
              </button>

              <button
                onClick={onDeclineBuy}
                className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition-colors"
              >
                📢 AUCTION
              </button>
            </div>
          )}

          {/* Manage Plots & Build Button */}
          <button
            onClick={onOpenManageProperties}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <span>🏢</span>
            <span>Plots ({myPlayer.properties.length})</span>
          </button>

          {/* Trade Trigger */}
          <button
            onClick={onOpenTrade}
            className="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105 flex items-center gap-1.5"
          >
            <span>🤝</span>
            <span>Trade</span>
          </button>

          {/* End Turn */}
          {isMyTurn && gameState.diceRolled && !isPurchasable && (
            <button
              onClick={onEndTurn}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>👉</span>
              <span>END TURN</span>
            </button>
          )}

          {/* Waiting Indicator if not player's turn */}
          {!isMyTurn && (
            <div className="px-4 py-2 bg-slate-950 text-slate-400 text-xs font-semibold rounded-xl border border-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Waiting for {gameState.players[gameState.currentPlayerIndex]?.name || 'Player'}...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
