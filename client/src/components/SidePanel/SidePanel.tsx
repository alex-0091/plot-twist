import React, { useState, useRef, useEffect } from 'react';
import { GameState, Player, BOARD_SPACES } from '../../types';

interface SidePanelProps {
  gameState: GameState;
  myPlayer: Player | null;
  onSendChat: (message: string) => void;
  onSelectProperty: (spaceIndex: number) => void;
  onOpenTradeWith: (player: Player) => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  gameState,
  myPlayer,
  onSendChat,
  onSelectProperty,
  onOpenTradeWith,
}) => {
  const [activeTab, setActiveTab] = useState<'PLAYERS' | 'LOGS' | 'CHAT'>('PLAYERS');
  const [chatInput, setChatInput] = useState('');
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.logs]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendChat(chatInput.trim());
      setChatInput('');
    }
  };

  const handleSendTaunt = (taunt: string) => {
    onSendChat(taunt);
  };

  // Sort players by cash / alive status
  const sortedPlayers = [...gameState.players].sort((a, b) => {
    if (a.isBankrupt && !b.isBankrupt) return 1;
    if (!a.isBankrupt && b.isBankrupt) return -1;
    return b.cash - a.cash;
  });

  return (
    <div className="w-full lg:w-80 h-full flex flex-col bg-[#1c182c] border border-[#2e284a] rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
      {/* Tabs Header */}
      <div className="flex border-b border-[#2e284a] bg-[#130f1d] p-1">
        <button
          onClick={() => setActiveTab('PLAYERS')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'PLAYERS'
              ? 'bg-[#7053ff] text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>👥</span>
          <span>Players ({gameState.players.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'LOGS'
              ? 'bg-[#7053ff] text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>📜</span>
          <span>Log</span>
        </button>
        <button
          onClick={() => setActiveTab('CHAT')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 ${
            activeTab === 'CHAT'
              ? 'bg-[#7053ff] text-white shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>💬</span>
          <span>Chat</span>
        </button>
      </div>

      {/* Tab 1: PLAYERS LEADERBOARD */}
      {activeTab === 'PLAYERS' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {sortedPlayers.map((player, rank) => {
            const isTurn = gameState.players[gameState.currentPlayerIndex]?.id === player.id;
            const isMe = player.id === myPlayer?.id;

            return (
              <div
                key={player.id}
                className={`p-3 rounded-xl border transition-all ${
                  player.isBankrupt
                    ? 'bg-[#130f1d]/50 border-[#2e284a] opacity-50'
                    : isTurn
                    ? 'bg-[#26213b] border-[#7053ff] shadow-md ring-1 ring-[#b1b2f2]'
                    : 'bg-[#130f1d] border-[#2e284a] hover:border-[#3b3260]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">#{rank + 1}</span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm shadow border border-[#2e284a]"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.tokenEmoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-100 line-clamp-1">
                          {player.name} {isMe ? '(You)' : ''}
                        </span>
                        {player.isBot && (
                          <span className="bg-[#241d3b] text-[#b1b2f2] text-[9px] font-bold px-1 rounded border border-[#3b3260]">
                            BOT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {player.isBankrupt ? (
                          <span className="text-red-400 font-bold">💀 BANKRUPT</span>
                        ) : player.inJail ? (
                          <span className="text-amber-400 font-bold">🚔 In Thana ({player.jailTurns}/3)</span>
                        ) : (
                          <span>At {BOARD_SPACES[player.position]?.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-[#81be97]">
                      Rs {player.cash.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {player.properties.length} plots
                    </div>
                  </div>
                </div>

                {/* Properties Mini Badges */}
                {player.properties.length > 0 && !player.isBankrupt && (
                  <div className="mt-2 pt-2 border-t border-[#2e284a] flex items-center gap-1 flex-wrap">
                    {player.properties.map((propIdx) => {
                      const sp = BOARD_SPACES[propIdx];
                      const ps = gameState.properties[propIdx];
                      return (
                        <span
                          key={propIdx}
                          onClick={() => onSelectProperty(propIdx)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold cursor-pointer hover:opacity-80 text-white flex items-center gap-0.5 ${
                            ps?.isMortgaged ? 'opacity-50 line-through' : ''
                          }`}
                          style={{ backgroundColor: sp.colorHex || '#475569' }}
                          title={`${sp.name} - Click to view`}
                        >
                          <span>{sp.name.split(' ')[0]}</span>
                          {ps?.hasHotel ? '🏨' : ps?.houses ? `🏡${ps.houses}` : ''}
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Trade Trigger */}
                {!isMe && !player.isBankrupt && (
                  <button
                    onClick={() => onOpenTradeWith(player)}
                    className="mt-2 w-full py-1 bg-[#241d3b] hover:bg-[#342a54] text-[#b1b2f2] text-[10px] font-bold rounded-lg border border-[#3b3260] transition-colors"
                  >
                    🤝 Propose Trade
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: EVENT LOG */}
      {activeTab === 'LOGS' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 font-mono text-[11px]">
          {gameState.logs.map((log) => (
            <div
              key={log.id}
              className={`p-1.5 rounded-lg border leading-tight ${
                log.type === 'ROLL'
                  ? 'bg-[#130f1d] border-[#2e284a] text-slate-300'
                  : log.type === 'BUY'
                  ? 'bg-[#12281e] border-[#1d4835] text-emerald-300'
                  : log.type === 'RENT'
                  ? 'bg-[#2b2416] border-[#4a3b1d] text-amber-300'
                  : log.type === 'CARD'
                  ? 'bg-[#241d3b] border-[#3b3260] text-[#d49cff]'
                  : log.type === 'JAIL'
                  ? 'bg-[#2e1818] border-[#4a2626] text-red-300'
                  : log.type === 'BANKRUPT'
                  ? 'bg-red-900/60 border-red-500 text-white font-bold'
                  : 'bg-[#130f1d] border-[#2e284a] text-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-1">
                <span>{log.text}</span>
              </div>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}

      {/* Tab 3: CHAT */}
      {activeTab === 'CHAT' && (
        <div className="flex-1 flex flex-col justify-between p-3 gap-2 overflow-hidden">
          {/* Quick Taunts */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick Pakistani Banter:
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                'Wallet check kar le bhai! 💸',
                'Bhai now owns Islamabad! 👑',
                'Plot gaya. Paisa gaya! 💀',
                'Chai pani ka kharcha do! ☕',
                'Abba nahi manenge! 🚗',
                'Lahori directions mat lena! 🧭',
              ].map((taunt) => (
                <button
                  key={taunt}
                  onClick={() => handleSendTaunt(taunt)}
                  className="p-1.5 bg-[#130f1d] hover:bg-[#26213b] text-slate-200 rounded-lg text-[10px] font-semibold text-left truncate border border-[#2e284a] transition-colors"
                  title={taunt}
                >
                  {taunt}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-1 border-t border-b border-[#2e284a] py-2 text-xs">
            {gameState.logs
              .filter((l) => l.type === 'CHAT')
              .map((msg) => (
                <div key={msg.id} className="text-slate-300">
                  <span className="text-[#81be97] font-bold">• </span>
                  <span>{msg.text}</span>
                </div>
              ))}
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSendChat} className="flex gap-1.5">
            <input
              type="text"
              placeholder="Type message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-[#130f1d] border border-[#2e284a] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#7053ff]"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-[#7053ff] hover:bg-[#6244f5] text-white font-bold text-xs rounded-lg shadow"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
