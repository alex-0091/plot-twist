import React, { useState } from 'react';
import { GameState, Player, BOARD_SPACES } from '../../types';

interface LeftPlayerPanelProps {
  gameState: GameState;
  myPlayer: Player | null;
  onSelectProperty: (spaceIndex: number) => void;
  onOpenTradeWith: (player: Player) => void;
  onSendChat: (message: string) => void;
}

export const LeftPlayerPanel: React.FC<LeftPlayerPanelProps> = ({
  gameState,
  myPlayer,
  onSelectProperty,
  onOpenTradeWith,
  onSendChat,
}) => {
  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendChat(chatInput.trim());
      setChatInput('');
    }
  };

  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (a.isBankrupt && !b.isBankrupt) return 1;
    if (!a.isBankrupt && b.isBankrupt) return -1;
    return b.cash - a.cash;
  });

  return (
    <aside className="w-full h-full flex flex-col bg-[#171329] border border-[#2e264f] rounded-2xl shadow-xl overflow-hidden select-none">
      {/* 1. PLAYERS HEADER */}
      <div className="px-3.5 py-2.5 border-b border-[#2e264f] bg-[#120e22] flex items-center justify-between">
        <span className="font-extrabold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
          <span>👥</span>
          <span>Players ({gameState.players.length})</span>
        </span>
        <span className="text-[10px] text-[#b1b2f2] font-mono font-bold">
          Turn {gameState.turnNumber}
        </span>
      </div>

      {/* 2. PLAYERS LIST */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[42vh] lg:max-h-none">
        {sortedPlayers.map((player) => {
          const isTurn = gameState.players[gameState.currentPlayerIndex]?.id === player.id;
          const isMe = player.id === myPlayer?.id;

          return (
            <div
              key={player.id}
              className={`p-2.5 rounded-xl border transition-all ${
                player.isBankrupt
                  ? 'bg-[#120e22]/50 border-[#2e264f] opacity-40'
                  : isTurn
                  ? 'bg-[#251e3e] border-[#7053ff] shadow-md ring-2 ring-[#7053ff]/60'
                  : 'bg-[#120e22] border-[#2e264f] hover:border-[#3d3366]'
              }`}
            >
              {/* Player Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shadow font-bold"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.tokenEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-100 line-clamp-1">
                        {player.name}
                      </span>
                      {isMe && (
                        <span className="text-[9px] font-bold text-[#b1b2f2] bg-[#251e3e] px-1 rounded">
                          YOU
                        </span>
                      )}
                      {player.isBot && (
                        <span className="text-[8px] font-bold text-slate-400 bg-black/40 px-1 rounded">
                          BOT
                        </span>
                      )}
                    </div>
                    <div className="text-[9.5px] text-slate-400">
                      {player.isBankrupt ? (
                        <span className="text-red-400 font-bold">BANKRUPT</span>
                      ) : player.inJail ? (
                        <span className="text-amber-400 font-bold">In Thana ({player.jailTurns}/3)</span>
                      ) : (
                        <span>At {BOARD_SPACES[player.position]?.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-black font-mono text-[#81be97]">
                    {player.cash.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-slate-400 font-semibold">
                    {player.properties.length} Plots
                  </div>
                </div>
              </div>

              {/* Owned Properties Chips */}
              {player.properties.length > 0 && !player.isBankrupt && (
                <div className="mt-1.5 pt-1.5 border-t border-[#2e264f]/80 flex items-center gap-1 flex-wrap">
                  {player.properties.map((propIdx) => {
                    const sp = BOARD_SPACES[propIdx];
                    const ps = gameState.properties[propIdx];
                    return (
                      <button
                        key={propIdx}
                        type="button"
                        onClick={() => onSelectProperty(propIdx)}
                        className={`text-[8.5px] px-1 py-0.2 rounded font-bold text-white flex items-center gap-0.5 shadow-sm hover:opacity-80 transition-opacity ${
                          ps?.isMortgaged ? 'opacity-40 line-through' : ''
                        }`}
                        style={{ backgroundColor: sp.colorHex || '#475569' }}
                        title={`${sp.name} - Click to view Title Deed`}
                      >
                        <span>{sp.name}</span>
                        {ps?.hasHotel ? '🏨' : ps?.houses ? `🏡${ps.houses}` : ''}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Propose Trade Button */}
              {!isMe && !player.isBankrupt && (
                <button
                  type="button"
                  onClick={() => onOpenTradeWith(player)}
                  className="mt-1.5 w-full py-1 bg-[#1f1938] hover:bg-[#2e2552] text-[#b1b2f2] text-[9.5px] font-bold rounded-lg border border-[#382d61] transition-colors flex items-center justify-center gap-1"
                >
                  <span>🤝</span>
                  <span>Trade with {player.name}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. CHAT SECTION */}
      <div className="border-t border-[#2e264f] bg-[#120e22] flex flex-col p-2.5 gap-2 shrink-0">
        <span className="font-extrabold text-[11px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <span>💬</span>
          <span>Room Chat</span>
        </span>

        {/* Quick Taunts */}
        <div className="grid grid-cols-3 gap-1">
          {['Good game! 🤝', 'Rent please! 💸', 'Trade deal? 📜'].map((msg) => (
            <button
              key={msg}
              type="button"
              onClick={() => onSendChat(msg)}
              className="px-1.5 py-1 bg-[#171329] hover:bg-[#251e3e] text-slate-300 text-[8.5px] font-semibold rounded border border-[#2e264f] truncate"
              title={msg}
            >
              {msg}
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="max-h-20 overflow-y-auto space-y-1 text-[10.5px] bg-[#171329] p-2 rounded-xl border border-[#2e264f]">
          {gameState.logs
            .filter((l) => l.type === 'CHAT')
            .slice(-6)
            .map((msg) => (
              <div key={msg.id} className="text-slate-300 leading-tight">
                <span className="text-[#81be97] font-bold">• </span>
                <span>{msg.text}</span>
              </div>
            ))}
          {gameState.logs.filter((l) => l.type === 'CHAT').length === 0 && (
            <span className="text-slate-500 italic text-[10px]">No messages yet</span>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="flex gap-1.5">
          <input
            type="text"
            placeholder="Type message..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-[#171329] border border-[#2e264f] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#7053ff]"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-[#7053ff] hover:bg-[#6244f5] text-white font-bold text-xs rounded-lg shadow"
          >
            Send
          </button>
        </form>
      </div>
    </aside>
  );
};
