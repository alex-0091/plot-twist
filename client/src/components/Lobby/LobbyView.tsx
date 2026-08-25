import React, { useState } from 'react';
import { GameState, Player, GameSettings } from '../../types';
import { HostSettingsModal } from './HostSettingsModal';
import { sounds } from '../../audio/SoundEffects';

interface LobbyViewProps {
  gameState: GameState;
  myPlayerId: string | null;
  isHost: boolean;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  myPlayerId,
  isHost,
  onAddBot,
  onRemoveBot,
  onUpdateSettings,
  onStartGame,
  onLeaveRoom,
}) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    setCopiedCode(true);
    sounds.playCash();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?room=${gameState.roomCode}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    sounds.playCash();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const totalSlots = 8;
  const seats = Array.from({ length: totalSlots }, (_, i) => gameState.players[i] || null);

  return (
    <div className="w-full max-w-3xl mx-auto p-5 sm:p-7 bg-[#1c182c] border border-[#2e284a] rounded-3xl shadow-2xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#2e284a] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇵🇰</span>
            <h1 className="text-2xl font-black text-white">
              {gameState.roomName}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Host: <strong className="text-[#b1b2f2] font-bold">{gameState.players.find((p) => p.id === gameState.hostId)?.name || 'Host'}</strong>
          </p>
        </div>

        {/* Room Code & Invite Box */}
        <div className="flex items-center gap-2 bg-[#130f1d] p-2 rounded-2xl border border-[#2e284a]">
          <div className="px-4 py-1 bg-[#241d3b] border border-[#3b3260] rounded-xl text-center">
            <span className="text-[9px] text-[#b1b2f2] font-bold uppercase tracking-wider block">
              ROOM CODE
            </span>
            <span className="text-2xl font-black text-white font-mono tracking-widest">
              {gameState.roomCode}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 bg-[#7053ff] hover:bg-[#6244f5] text-white text-xs font-bold rounded-lg transition-colors shadow"
            >
              {copiedCode ? '✓ Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-[#1c182c] hover:bg-[#26213b] text-slate-200 text-xs font-bold rounded-lg border border-[#2e284a] transition-colors"
            >
              Copy Link 🔗
            </button>
          </div>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>👥</span>
            <span>PLAYERS ({gameState.players.length}/8)</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-1.5 bg-[#130f1d] hover:bg-[#26213b] text-[#b1b2f2] text-xs font-bold rounded-xl border border-[#2e284a] transition-colors flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            {isHost && gameState.players.length < 8 && (
              <button
                onClick={onAddBot}
                className="px-3.5 py-1.5 bg-[#241d3b] hover:bg-[#342a54] text-[#d49cff] text-xs font-bold rounded-xl border border-[#3b3260] transition-colors flex items-center gap-1.5"
              >
                <span>🤖</span>
                <span>+ Add Bot</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {seats.map((player, idx) => {
            if (player) {
              const isMe = player.id === myPlayerId;
              const isPlayerHost = player.id === gameState.hostId;

              return (
                <div
                  key={player.id}
                  className="p-3 bg-[#130f1d] border border-[#2e284a] rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden group shadow"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow border border-[#2e284a] my-1"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.tokenEmoji}
                  </div>

                  <div className="w-full">
                    <span className="font-extrabold text-xs text-slate-100 line-clamp-1 block">
                      {player.name} {isMe ? '(You)' : ''}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    {isPlayerHost && (
                      <span className="bg-[#241d3b] text-[#b1b2f2] text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#3b3260]">
                        HOST
                      </span>
                    )}
                    {player.isBot && (
                      <span className="bg-[#2b2416] text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#4a3b1d]">
                        BOT
                      </span>
                    )}
                    {!isPlayerHost && !player.isBot && (
                      <span className="bg-[#1c182c] text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-[#2e284a]">
                        READY
                      </span>
                    )}
                  </div>

                  {isHost && player.isBot && (
                    <button
                      onClick={() => onRemoveBot(player.id)}
                      className="absolute top-1.5 right-1.5 text-red-400 hover:text-red-300 bg-red-950/60 p-1 rounded-full text-[10px]"
                      title="Remove Bot"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div
                key={idx}
                className="p-3 bg-[#130f1d]/40 border border-dashed border-[#2e284a] rounded-2xl flex flex-col items-center justify-center text-center text-slate-600 min-h-[110px]"
              >
                <span className="text-xl opacity-30">🪑</span>
                <span className="text-[10px] font-semibold mt-1">Empty Seat</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t border-[#2e284a] pt-5 flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="px-4 py-2.5 bg-[#130f1d] hover:bg-[#26213b] text-slate-300 font-bold text-xs rounded-xl border border-[#2e284a] transition-colors"
        >
          ← Leave Room
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={gameState.players.length < 2}
            className="px-8 py-3.5 bg-gradient-to-r from-[#7053ff] to-[#8c52ff] hover:from-[#6244f5] hover:to-[#7b42f5] disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
          >
            <span>Start Game</span>
            <span className="text-lg">»</span>
          </button>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Waiting for Host to start the game...
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <HostSettingsModal
        isOpen={showSettingsModal}
        currentSettings={gameState.settings}
        isHost={isHost}
        onClose={() => setShowSettingsModal(false)}
        onSave={onUpdateSettings}
      />
    </div>
  );
};
