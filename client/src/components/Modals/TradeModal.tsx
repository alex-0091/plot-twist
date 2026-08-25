import React, { useState } from 'react';
import { GameState, Player, BOARD_SPACES } from '../../types';
import { sounds } from '../../audio/SoundEffects';

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
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>(
    otherPlayers[0]?.id || ''
  );

  const partner = gameState.players.find((p) => p.id === selectedPartnerId) || otherPlayers[0];

  const [offeredCash, setOfferedCash] = useState<number>(0);
  const [requestedCash, setRequestedCash] = useState<number>(0);
  const [offeredProps, setOfferedProps] = useState<number[]>([]);
  const [requestedProps, setRequestedProps] = useState<number[]>([]);

  const incomingTrade =
    gameState.activeTrade && gameState.activeTrade.toPlayerId === myPlayer.id
      ? gameState.activeTrade
      : null;

  const sender = incomingTrade
    ? gameState.players.find((p) => p.id === incomingTrade.fromPlayerId)
    : null;

  const handleToggleOfferedProp = (propIdx: number) => {
    sounds.playCash();
    setOfferedProps((prev) =>
      prev.includes(propIdx) ? prev.filter((i) => i !== propIdx) : [...prev, propIdx]
    );
  };

  const handleToggleRequestedProp = (propIdx: number) => {
    sounds.playCash();
    setRequestedProps((prev) =>
      prev.includes(propIdx) ? prev.filter((i) => i !== propIdx) : [...prev, propIdx]
    );
  };

  const handleSendTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partner) return;
    sounds.playCash();
    onCreateTradeOffer(
      partner.id,
      offeredCash,
      offeredProps,
      0,
      requestedCash,
      requestedProps,
      0
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none">
      <div className="bg-[#1c182c] border border-[#2e284a] rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#130f1d] p-3 sm:p-4 border-b border-[#2e284a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤝</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">TRADE NEGOTIATION</h2>
              <p className="text-[10px] text-[#b1b2f2]">
                Property & Cash Exchange
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-[#1c182c] rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold border border-[#2e284a]"
          >
            ✕
          </button>
        </div>

        {/* Incoming Trade Offer Banner */}
        {incomingTrade && sender && (
          <div className="p-4 bg-[#241d3b] border-b border-[#3b3260] space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-amber-300">
              <span>📩</span>
              <span>TRADE PROPOSAL RECEIVED FROM {sender.name.toUpperCase()}!</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-[#130f1d] p-3 rounded-xl border border-[#2e284a]">
              <div>
                <span className="text-slate-400 block font-bold">They Give You:</span>
                <span className="text-emerald-400 font-mono font-bold">{incomingTrade.offeredCash}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {incomingTrade.offeredProperties.map((idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                      style={{ backgroundColor: BOARD_SPACES[idx]?.colorHex || '#475569' }}
                    >
                      {BOARD_SPACES[idx]?.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-bold">They Want From You:</span>
                <span className="text-amber-400 font-mono font-bold">{incomingTrade.requestedCash}</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {incomingTrade.requestedProperties.map((idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
                      style={{ backgroundColor: BOARD_SPACES[idx]?.colorHex || '#475569' }}
                    >
                      {BOARD_SPACES[idx]?.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onRespondTrade(incomingTrade.id, true)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow"
              >
                Accept Trade
              </button>
              <button
                onClick={() => onRespondTrade(incomingTrade.id, false)}
                className="flex-1 py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Create Trade Offer Body */}
        <div className="p-3 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {/* Partner Selector */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Select Trading Partner:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {otherPlayers.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPartnerId(p.id)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    selectedPartnerId === p.id
                      ? 'bg-[#241d3b] border-[#7053ff] ring-1 ring-[#b1b2f2] text-white'
                      : 'bg-[#130f1d] border-[#2e284a] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-lg">{p.tokenEmoji}</span>
                  <div className="truncate">
                    <span className="font-extrabold text-xs block truncate">{p.name}</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      {p.cash.toLocaleString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {partner && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* LEFT COLUMN: YOU GIVE */}
              <div className="bg-[#130f1d] p-3 rounded-2xl border border-[#2e284a] space-y-3">
                <div className="flex items-center justify-between border-b border-[#2e284a] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{myPlayer.tokenEmoji}</span>
                    <span className="font-black text-xs text-white">YOU GIVE</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Max: {myPlayer.cash}
                  </span>
                </div>

                {/* Cash Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cash:</span>
                    <span className="font-black text-amber-300 font-mono">{offeredCash}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={myPlayer.cash}
                    step={10}
                    value={offeredCash}
                    onChange={(e) => setOfferedCash(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* Properties Selection */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Your Plots ({myPlayer.properties.length}):
                  </span>
                  {myPlayer.properties.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic block">No plots owned</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {myPlayer.properties.map((propIdx) => {
                        const sp = BOARD_SPACES[propIdx];
                        const isSelected = offeredProps.includes(propIdx);
                        return (
                          <button
                            key={propIdx}
                            type="button"
                            onClick={() => handleToggleOfferedProp(propIdx)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border transition-all ${
                              isSelected
                                ? 'ring-2 ring-white scale-105 shadow text-white'
                                : 'opacity-70 hover:opacity-100 text-slate-200'
                            }`}
                            style={{ backgroundColor: sp.colorHex || '#475569' }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{sp.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: YOU RECEIVE */}
              <div className="bg-[#130f1d] p-3 rounded-2xl border border-[#2e284a] space-y-3">
                <div className="flex items-center justify-between border-b border-[#2e284a] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{partner.tokenEmoji}</span>
                    <span className="font-black text-xs text-white">YOU RECEIVE</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">
                    Max: {partner.cash}
                  </span>
                </div>

                {/* Partner Cash Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Cash:</span>
                    <span className="font-black text-amber-300 font-mono">{requestedCash}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={partner.cash}
                    step={10}
                    value={requestedCash}
                    onChange={(e) => setRequestedCash(Number(e.target.value))}
                    className="w-full accent-[#7053ff]"
                  />
                </div>

                {/* Partner Properties Selection */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {partner.name}'s Plots ({partner.properties.length}):
                  </span>
                  {partner.properties.length === 0 ? (
                    <span className="text-[10px] text-slate-500 italic block">No plots owned</span>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                      {partner.properties.map((propIdx) => {
                        const sp = BOARD_SPACES[propIdx];
                        const isSelected = requestedProps.includes(propIdx);
                        return (
                          <button
                            key={propIdx}
                            type="button"
                            onClick={() => handleToggleRequestedProp(propIdx)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 border transition-all ${
                              isSelected
                                ? 'ring-2 ring-white scale-105 shadow text-white'
                                : 'opacity-70 hover:opacity-100 text-slate-200'
                            }`}
                            style={{ backgroundColor: sp.colorHex || '#475569' }}
                          >
                            <span>{isSelected ? '✓' : '+'}</span>
                            <span>{sp.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Review & Send */}
        <div className="p-3 sm:p-4 bg-[#130f1d] border-t border-[#2e284a] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1c182c] hover:bg-[#26213b] text-slate-300 font-bold text-xs rounded-xl border border-[#2e284a]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendTrade}
            disabled={!partner || (offeredCash === 0 && offeredProps.length === 0 && requestedCash === 0 && requestedProps.length === 0)}
            className="px-6 py-2.5 bg-[#7053ff] hover:bg-[#6244f5] disabled:opacity-40 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
          >
            Send Trade Offer
          </button>
        </div>
      </div>
    </div>
  );
};
