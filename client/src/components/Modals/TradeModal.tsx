import React, { useState } from 'react';
import { GameState, Player, TradeOffer, BOARD_SPACES } from '../../types';

interface TradeModalProps {
  isOpen: boolean;
  gameState: GameState;
  myPlayer: Player | null;
  onClose: () => void;
  onCreateTradeOffer: (
    toPlayerId: string,
    offeredCash: number,
    offeredProperties: number[],
    offeredJailCards: number,
    requestedCash: number,
    requestedProperties: number[],
    requestedJailCards: number
  ) => void;
  onRespondTrade: (offerId: string, accept: boolean) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  isOpen,
  gameState,
  myPlayer,
  onClose,
  onCreateTradeOffer,
  onRespondTrade,
}) => {
  if (!isOpen || !myPlayer) return null;

  const otherPlayers = gameState.players.filter((p) => p.id !== myPlayer.id && !p.isBankrupt);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(otherPlayers[0]?.id || '');

  const targetPlayer = gameState.players.find((p) => p.id === selectedTargetId) || otherPlayers[0];

  const [offeredCash, setOfferedCash] = useState<number>(0);
  const [offeredProperties, setOfferedProperties] = useState<number[]>([]);
  const [offeredJailCards, setOfferedJailCards] = useState<number>(0);

  const [requestedCash, setRequestedCash] = useState<number>(0);
  const [requestedProperties, setRequestedProperties] = useState<number[]>([]);
  const [requestedJailCards, setRequestedJailCards] = useState<number>(0);

  // Incoming trade check
  const incomingTrade = gameState.activeTrade && gameState.activeTrade.toPlayerId === myPlayer.id ? gameState.activeTrade : null;
  const outgoingTrade = gameState.activeTrade && gameState.activeTrade.fromPlayerId === myPlayer.id ? gameState.activeTrade : null;
  const incomingTrader = incomingTrade ? gameState.players.find((p) => p.id === incomingTrade.fromPlayerId) : null;

  const handleToggleOfferedProp = (idx: number) => {
    setOfferedProperties((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const handleToggleRequestedProp = (idx: number) => {
    setRequestedProperties((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  };

  const handlePropose = () => {
    if (!targetPlayer) return;
    onCreateTradeOffer(
      targetPlayer.id,
      offeredCash,
      offeredProperties,
      offeredJailCards,
      requestedCash,
      requestedProperties,
      requestedJailCards
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-950/80 border-b border-indigo-500/40 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤝</span>
            <div>
              <h2 className="text-lg font-black text-white">PAKISTANI PROPERTY TRADING</h2>
              <p className="text-xs text-indigo-300">Plots, Cash, and Sifarish Exchange</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Incoming Trade Alert Banner */}
        {incomingTrade && (
          <div className="bg-amber-950/80 border-b border-amber-500/50 p-3 flex items-center justify-between">
            <div className="text-xs">
              <span className="font-bold text-amber-300">⚡ Incoming Trade Offer from {incomingTrader?.name}!</span>
              <p className="text-slate-300">
                Offered: Rs {incomingTrade.offeredCash} + {incomingTrade.offeredProperties.length} plots | Wants: Rs {incomingTrade.requestedCash} + {incomingTrade.requestedProperties.length} plots
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRespondTrade(incomingTrade.id, true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow"
              >
                Accept (Deal Done)
              </button>
              <button
                onClick={() => onRespondTrade(incomingTrade.id, false)}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        )}

        {outgoingTrade && (
          <div className="bg-blue-950/80 border-b border-blue-500/50 p-3 flex items-center justify-between">
            <span className="text-xs text-blue-200">
              ⏳ Pending trade offer sent to {gameState.players.find((p) => p.id === outgoingTrade.toPlayerId)?.name}...
            </span>
            <button
              onClick={() => onRespondTrade(outgoingTrade.id, false)}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded"
            >
              Cancel Offer
            </button>
          </div>
        )}

        {/* Select Target Player */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <label className="text-xs font-semibold text-slate-400 block mb-1.5">Trade Partner:</label>
          <div className="flex items-center gap-2 flex-wrap">
            {otherPlayers.map((other) => (
              <button
                key={other.id}
                onClick={() => {
                  setSelectedTargetId(other.id);
                  setRequestedProperties([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  selectedTargetId === other.id
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{other.tokenEmoji}</span>
                <span>{other.name}</span>
                <span className="text-emerald-400 text-[10px]">(Rs {other.cash})</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Trade Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-800 flex-1 overflow-y-auto p-4 gap-4">
          {/* Left: YOU GIVE */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-1">
              <span>📤</span>
              <span>YOU GIVE</span>
            </h3>

            {/* Cash Input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Cash (Max: Rs {myPlayer.cash}):
              </label>
              <input
                type="number"
                min={0}
                max={myPlayer.cash}
                value={offeredCash}
                onChange={(e) => setOfferedCash(Math.max(0, Math.min(myPlayer.cash, Number(e.target.value))))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Properties List */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Select Properties:</label>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {myPlayer.properties.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">You have no plots to trade</p>
                ) : (
                  myPlayer.properties.map((idx) => {
                    const sp = BOARD_SPACES[idx];
                    const isSelected = offeredProperties.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleOfferedProp(idx)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer border transition-colors ${
                          isSelected
                            ? 'bg-amber-950/60 border-amber-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.colorHex || '#64748b' }} />
                          <span>{sp.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Rs {sp.price}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right: YOU RECEIVE */}
          <div className="space-y-3 pt-3 sm:pt-0">
            <h3 className="font-extrabold text-sm text-emerald-400 flex items-center gap-1">
              <span>📥</span>
              <span>YOU RECEIVE (From {targetPlayer?.name})</span>
            </h3>

            {/* Requested Cash Input */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Requested Cash (Max: Rs {targetPlayer?.cash || 0}):
              </label>
              <input
                type="number"
                min={0}
                max={targetPlayer?.cash || 0}
                value={requestedCash}
                onChange={(e) => setRequestedCash(Math.max(0, Math.min(targetPlayer?.cash || 0, Number(e.target.value))))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-400 font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Target Player Properties */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Request Plots:</label>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {!targetPlayer || targetPlayer.properties.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">{targetPlayer?.name || 'Player'} has no plots</p>
                ) : (
                  targetPlayer.properties.map((idx) => {
                    const sp = BOARD_SPACES[idx];
                    const isSelected = requestedProperties.includes(idx);
                    return (
                      <div
                        key={idx}
                        onClick={() => handleToggleRequestedProp(idx)}
                        className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer border transition-colors ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sp.colorHex || '#64748b' }} />
                          <span>{sp.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">Rs {sp.price}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Propose Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
          >
            Close
          </button>
          <button
            onClick={handlePropose}
            disabled={!targetPlayer}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-500 hover:to-blue-400 text-white text-xs font-black rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            PROPOSE DEAL (سودا بھیجیں)
          </button>
        </div>
      </div>
    </div>
  );
};
