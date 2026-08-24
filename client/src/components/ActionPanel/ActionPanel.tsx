import React from 'react';
import { GameState, Player } from '../../types';
import { BOARD_SPACES } from '../../types';

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

  return (
    <div className="w-full bg-slate-900/95 border-t-2 border-emerald-500/40 p-3 sm:p-4 backdrop-blur-md shadow-2xl z-20">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Player Quick Balance & Current Position */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-md border-2 border-slate-700"
            style={{ backgroundColor: myPlayer.color }}
          >
            {myPlayer.tokenEmoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-slate-100">{myPlayer.name}</span>
              {myPlayer.inJail && (
                <span className="bg-red-600 text-[10px] text-white font-bold px-1.5 py-0.5 rounded">
                  IN THANA ({myPlayer.jailTurns}/{gameState.settings.maxJailTurns})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-emerald-400 font-black text-sm sm:text-base">
                Rs {myPlayer.cash.toLocaleString()}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-300">
                At: <strong className="text-amber-300">{currentSpace?.name || 'Start'}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Center/Right: Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Jail Actions */}
          {isMyTurn && myPlayer.inJail && !gameState.diceRolled && (
            <>
              <button
                onClick={onPayBail}
                disabled={myPlayer.cash < gameState.settings.jailBail}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md transition-transform hover:scale-105"
              >
                🔓 Pay Bail (Rs {gameState.settings.jailBail})
              </button>
              {myPlayer.getOutOfJailCards > 0 && (
                <button
                  onClick={onUseJailCard}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-md transition-transform hover:scale-105"
                >
                  ⚖️ Use Govt Cousin Card ({myPlayer.getOutOfJailCards})
                </button>
              )}
            </>
          )}

          {/* Roll Dice Button */}
          {isMyTurn && !gameState.diceRolled && (
            <button
              onClick={onRollDice}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 animate-pulse flex items-center gap-1.5"
            >
              <span>🎲</span>
              <span>ROLL DICE</span>
            </button>
          )}

          {/* Buy & Auction Buttons */}
          {isPurchasable && (
            <div className="flex items-center gap-2 animate-bounce-short">
              <button
                onClick={onBuyProperty}
                disabled={!canAfford}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                🏠 BUY FOR Rs {currentSpace.price}
              </button>
              <button
                onClick={onDeclineBuy}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition-colors"
              >
                📢 AUCTION
              </button>
            </div>
          )}

          {/* Manage Properties & Build */}
          <button
            onClick={onOpenManageProperties}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
          >
            <span>🏢</span>
            <span>Manage Properties ({myPlayer.properties.length})</span>
          </button>

          {/* Trade Button */}
          <button
            onClick={onOpenTrade}
            className="px-3 py-2 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs rounded-lg shadow-md transition-transform hover:scale-105 flex items-center gap-1"
          >
            <span>🤝</span>
            <span>Trade</span>
          </button>

          {/* End Turn Button */}
          {isMyTurn && gameState.diceRolled && !isPurchasable && (
            <button
              onClick={onEndTurn}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <span>👉</span>
              <span>END TURN</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
