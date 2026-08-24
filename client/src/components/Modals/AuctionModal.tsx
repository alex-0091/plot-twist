import React, { useState } from 'react';
import { AuctionState, GameState, Player, BOARD_SPACES } from '../../types';

interface AuctionModalProps {
  auction: AuctionState | null;
  gameState: GameState;
  myPlayer: Player | null;
  onBid: (amount: number) => void;
  onFold: () => void;
}

export const AuctionModal: React.FC<AuctionModalProps> = ({
  auction,
  gameState,
  myPlayer,
  onBid,
  onFold,
}) => {
  if (!auction || !myPlayer) return null;

  const space = BOARD_SPACES[auction.propertyIndex];
  const highestBidder = auction.highestBidderId
    ? gameState.players.find((p) => p.id === auction.highestBidderId)
    : null;

  const isHighestBidder = auction.highestBidderId === myPlayer.id;
  const isFolded = !auction.activePlayerIds.includes(myPlayer.id);

  const [customBid, setCustomBid] = useState<number>(auction.highestBid + 10);

  const handleQuickBid = (increment: number) => {
    const nextAmount = auction.highestBid + increment;
    if (nextAmount <= myPlayer.cash) {
      onBid(nextAmount);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header */}
        <div
          className="p-4 text-center text-white relative shadow"
          style={{ backgroundColor: space?.colorHex || '#d97706' }}
        >
          <span className="text-[10px] font-black tracking-widest uppercase bg-black/40 px-2 py-0.5 rounded-full inline-block">
            📢 LIVE PROPERTY AUCTION / کھلی بولی
          </span>
          <h2 className="text-xl font-black mt-1">{space?.name}</h2>
          <p className="text-xs opacity-90">Original Price: Rs {space?.price}</p>
        </div>

        {/* Auction Status Body */}
        <div className="p-5 flex flex-col items-center gap-4 text-center">
          {/* Timer Countdown Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-slate-400">Time Remaining:</span>
              <span className="text-amber-400 font-extrabold text-sm animate-pulse">
                ⏳ {auction.timerSeconds}s
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-amber-500 h-full transition-all duration-1000"
                style={{ width: `${Math.min(100, (auction.timerSeconds / 15) * 100)}%` }}
              />
            </div>
          </div>

          {/* Current Highest Bid */}
          <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3">
            <span className="text-xs text-slate-400 block font-medium">Current Highest Bid:</span>
            <div className="text-3xl font-black text-emerald-400 my-1">
              Rs {auction.highestBid.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-slate-300">
              {highestBidder ? (
                <span className="flex items-center justify-center gap-1.5" style={{ color: highestBidder.color }}>
                  <span>{highestBidder.tokenEmoji}</span>
                  <span>Held by {highestBidder.name} {isHighestBidder ? '(You)' : ''}</span>
                </span>
              ) : (
                <span className="text-slate-500 italic">No bids yet (Starting at Rs 10)</span>
              )}
            </div>
          </div>

          {/* Active Bidders List */}
          <div className="w-full flex items-center justify-center gap-2 flex-wrap">
            {gameState.players.map((p) => {
              const active = auction.activePlayerIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                    active
                      ? 'bg-slate-800 border-slate-700 text-slate-200'
                      : 'bg-red-950/60 border-red-800 text-red-400 line-through'
                  }`}
                >
                  <span>{p.tokenEmoji}</span>
                  <span>{p.name}</span>
                </div>
              );
            })}
          </div>

          {/* Bid Control Buttons */}
          {!isFolded ? (
            <div className="w-full space-y-2 pt-2">
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickBid(10)}
                  disabled={myPlayer.cash < auction.highestBid + 10}
                  className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow transition-transform hover:scale-105"
                >
                  +Rs 10
                </button>
                <button
                  onClick={() => handleQuickBid(50)}
                  disabled={myPlayer.cash < auction.highestBid + 50}
                  className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow transition-transform hover:scale-105"
                >
                  +Rs 50
                </button>
                <button
                  onClick={() => handleQuickBid(100)}
                  disabled={myPlayer.cash < auction.highestBid + 100}
                  className="py-2.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow transition-transform hover:scale-105"
                >
                  +Rs 100
                </button>
              </div>

              <button
                onClick={onFold}
                className="w-full py-2 bg-slate-800 hover:bg-red-950/80 text-red-300 border border-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Pass / Fold (ہاتھ کھڑے ہیں)
              </button>
            </div>
          ) : (
            <div className="p-3 bg-slate-950 rounded-xl text-xs text-red-400 font-semibold">
              You have folded from this auction. Waiting for result...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
