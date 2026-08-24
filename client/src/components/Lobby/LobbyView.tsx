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
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-7 bg-slate-900/95 border-2 border-emerald-500/50 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🇵🇰</span>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
              {gameState.roomName}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Host: <strong className="text-emerald-400 font-bold">{gameState.players.find((p) => p.id === gameState.hostId)?.name || 'Host'}</strong>
          </p>
        </div>

        {/* Room Code & Invite Link Box */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-emerald-500/40 shadow-inner">
          <div className="px-4 py-1.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-center">
            <span className="text-[9px] text-emerald-400 font-black uppercase tracking-wider block">
              ROOM CODE
            </span>
            <span className="text-2xl font-black text-white font-mono tracking-widest">
              {gameState.roomCode}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-lg transition-colors shadow"
            >
              {copiedCode ? '✓ Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
            >
              Copy Link 🔗
            </button>
          </div>
        </div>
      </div>

      {/* Seats Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>👥</span>
            <span>PLAYER SEATS ({gameState.players.length}/8)</span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-black rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <span>⚙️</span>
              <span>Rule Settings</span>
            </button>

            {isHost && gameState.players.length < 8 && (
              <button
                onClick={onAddBot}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-black rounded-xl shadow transition-transform hover:scale-105 flex items-center gap-1.5"
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
                  className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col items-center justify-between text-center relative overflow-hidden group shadow-md"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-slate-700 my-1"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.tokenEmoji}
                  </div>

                  <div className="w-full">
                    <span className="font-extrabold text-xs text-slate-100 line-clamp-1 block">
                      {player.name} {isMe ? '(You)' : ''}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold capitalize">
                      {player.token.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-1">
                    {isPlayerHost && (
                      <span className="bg-emerald-950 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full border border-emerald-600/40">
                        HOST
                      </span>
                    )}
                    {player.isBot && (
                      <span className="bg-amber-950 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-600/40">
                        AI BOT
                      </span>
                    )}
                    {!isPlayerHost && !player.isBot && (
                      <span className="bg-slate-800 text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded-full">
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
                className="p-3 bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center text-slate-600 min-h-[120px]"
              >
                <span className="text-2xl opacity-40">🪑</span>
                <span className="text-[10px] font-semibold mt-1">Empty Seat {idx + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
        <button
          onClick={onLeaveRoom}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
        >
          ← Leave Room
        </button>

        {isHost ? (
          <button
            onClick={onStartGame}
            disabled={gameState.players.length < 2}
            className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 disabled:opacity-40 text-white font-black text-sm rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 animate-pulse flex items-center gap-2"
          >
            <span className="text-lg">🎲</span>
            <span>START MATCH (کھیل شروع کریں)</span>
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
