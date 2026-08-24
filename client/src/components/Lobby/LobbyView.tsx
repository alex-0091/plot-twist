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

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 bg-slate-900/90 border-2 border-emerald-600/50 rounded-3xl shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">🇵🇰</span>
            <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
              {gameState.roomName}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Host: <strong className="text-emerald-400">{gameState.players.find((p) => p.id === gameState.hostId)?.name || 'Host'}</strong>
          </p>
        </div>

        {/* Room Code Badge & Copy Buttons */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-2xl border border-emerald-500/40 shadow-inner">
          <div className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
              ROOM CODE
            </span>
            <span className="text-xl font-black text-white font-mono tracking-widest">
              {gameState.roomCode}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors"
            >
              {copiedCode ? '✓ Copied!' : 'Copy Code'}
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold rounded-lg transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Players in Lobby */}
      <div className="my-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span>👥</span>
            <span>PLAYERS IN LOBBY ({gameState.players.length}/8)</span>
          </h2>

          <div className="flex items-center gap-2">
            {isHost && (
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <span>⚙️</span>
                <span>Rule Settings</span>
              </button>
            )}

            {isHost && gameState.players.length < 8 && (
              <button
                onClick={onAddBot}
                className="px-3 py-1.5 bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow transition-transform hover:scale-105 flex items-center gap-1.5"
              >
                <span>🤖</span>
                <span>+ Add Pakistani Bot</span>
              </button>
            )}
          </div>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gameState.players.map((player) => {
            const isMe = player.id === myPlayerId;
            const isPlayerHost = player.id === gameState.hostId;

            return (
              <div
                key={player.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-slate-700"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.tokenEmoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-100">{player.name}</span>
                      {isPlayerHost && (
                        <span className="bg-emerald-950 text-emerald-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-600/40">
                          HOST
                        </span>
                      )}
                      {player.isBot && (
                        <span className="bg-amber-950 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-600/40">
                          AI BOT
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Token: <strong className="text-amber-400 capitalize">{player.token.replace('_', ' ')}</strong>
                      {isMe && <span className="text-emerald-400 ml-1 font-bold">(You)</span>}
                    </div>
                  </div>
                </div>

                {isHost && player.isBot && (
                  <button
                    onClick={() => onRemoveBot(player.id)}
                    className="text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 p-1.5 rounded-lg text-xs"
                    title="Remove Bot"
                  >
                    ✕
                  </button>
                )}
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
            className="px-8 py-3 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95 animate-pulse"
          >
            START GAME (کھیل شروع کریں) 🎲
          </button>
        ) : (
          <div className="text-xs text-slate-400 italic">
            Waiting for Host ({gameState.players.find((p) => p.id === gameState.hostId)?.name}) to start...
          </div>
        )}
      </div>

      {/* Host Settings Modal */}
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
