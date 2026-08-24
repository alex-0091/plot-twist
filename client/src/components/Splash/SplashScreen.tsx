import React, { useState, useEffect } from 'react';
import { TOKENS } from '../../types';
import { sounds } from '../../audio/SoundEffects';
import { PakistaniCoverArt } from './PakistaniCoverArt';
import { SingleDie } from '../Board/Dice3D';

interface SplashScreenProps {
  onCreateRoom: (roomName: string, playerName: string, avatar: string, token: string, tokenEmoji: string) => void;
  onJoinRoom: (roomCode: string, playerName: string, avatar: string, token: string, tokenEmoji: string) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onCreateRoom,
  onJoinRoom,
}) => {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('pt_username') || 'Owais');
  const [selectedTokenId, setSelectedTokenId] = useState('rickshaw');
  const [roomName, setRoomName] = useState('Owais ka Plot');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [viewState, setViewState] = useState<'HOME' | 'CREATE' | 'JOIN' | 'ROOMS'>('HOME');
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomCodeInput(roomParam.toUpperCase());
      setViewState('JOIN');
    }
  }, []);

  const selectedToken = TOKENS.find((t) => t.id === selectedTokenId) || TOKENS[0];

  const handleQuickPlay = () => {
    if (!playerName.trim()) return;
    localStorage.setItem('pt_username', playerName.trim());
    sounds.playRickshawHorn();
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(playerName)}`;
    onCreateRoom(`${playerName.trim()}'s Game`, playerName.trim(), avatar, selectedToken.id, selectedToken.emoji);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    localStorage.setItem('pt_username', playerName.trim());
    sounds.playRickshawHorn();
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(playerName)}`;
    onCreateRoom(roomName, playerName.trim(), avatar, selectedToken.id, selectedToken.emoji);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCodeInput.trim()) return;
    localStorage.setItem('pt_username', playerName.trim());
    sounds.playDiceRoll();
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(playerName)}`;
    onJoinRoom(roomCodeInput.trim().toUpperCase(), playerName.trim(), avatar, selectedToken.id, selectedToken.emoji);
  };

  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-y-auto bg-gradient-to-b from-slate-950 via-[#0d1527] to-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* 1. Top Navbar (Richup-style header) */}
      <header className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = sounds.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 text-slate-300 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 px-3 py-1 rounded-full font-bold">
            🇵🇰 Pakistan Edition v1.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#how-to-play"
            className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition-colors hidden sm:inline-block"
          >
            How to Play 📖
          </a>
        </div>
      </header>

      {/* 2. Hero & Central Action Box */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-2 flex flex-col items-center justify-center gap-4 z-10 my-auto">
        {/* Animated Pakistani Cover Art & Logo */}
        <div className="w-full flex flex-col items-center text-center">
          <div className="w-full max-w-sm mb-2">
            <PakistaniCoverArt />
          </div>

          <div className="flex items-center gap-2">
            <SingleDie value={6} rolling={false} />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
              PLOT TWIST
            </h1>
            <SingleDie value={6} rolling={false} />
          </div>
          <p className="text-xs font-black text-amber-300 tracking-widest uppercase mt-0.5">
            Rule The Pakistani Economy • رول اور پلاٹ
          </p>
        </div>

        {/* Action Card (Richup-style Central Hub) */}
        <div className="w-full bg-slate-900/95 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3.5 truck-art-border">
          {/* Nickname Input & Token Picker */}
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
              Tycoon Name & Token
            </label>
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <input
                type="text"
                value={playerName}
                maxLength={16}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="flex-1 bg-transparent px-3 py-1.5 text-sm font-bold text-white focus:outline-none placeholder:text-slate-600"
              />
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shadow cursor-pointer border border-emerald-500/50 bg-emerald-950"
                title={`Selected: ${selectedToken.name}`}
              >
                {selectedToken.emoji}
              </div>
            </div>

            {/* Token Selector Row */}
            <div className="grid grid-cols-8 gap-1 pt-1">
              {TOKENS.map((token) => (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => {
                    setSelectedTokenId(token.id);
                    sounds.playCash();
                  }}
                  className={`h-8 rounded-lg text-lg flex items-center justify-center transition-all ${
                    selectedTokenId === token.id
                      ? 'bg-emerald-600 ring-2 ring-emerald-300 scale-105 shadow'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800/80'
                  }`}
                  title={`${token.name} (${token.urduName})`}
                >
                  {token.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW: HOME */}
          {viewState === 'HOME' && (
            <div className="space-y-2.5 pt-1">
              {/* Primary PLAY Button (Richup-style) */}
              <button
                onClick={handleQuickPlay}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-white font-black text-base rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 ring-2 ring-emerald-300/40 animate-pulse"
              >
                <span>⚡ PLAY GAME</span>
                <span className="text-xl">»</span>
              </button>

              {/* Secondary Buttons: All Rooms & Create Private Game */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    sounds.playCash();
                    setViewState('JOIN');
                  }}
                  className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-200 font-black text-xs rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🔑</span>
                  <span>Join Code</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playCash();
                    setViewState('CREATE');
                  }}
                  className="py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-amber-300 font-black text-xs rounded-xl border border-slate-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🔒</span>
                  <span>Private Game</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW: CREATE */}
          {viewState === 'CREATE' && (
            <form onSubmit={handleCreateSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Islamabad Elite Match"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setViewState('HOME')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  Create Room 🚀
                </button>
              </div>
            </form>
          )}

          {/* VIEW: JOIN */}
          {viewState === 'JOIN' && (
            <form onSubmit={handleJoinSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-black uppercase text-slate-400 block mb-1">
                  Enter 6-Letter Room Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AB72KD"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-amber-400 font-black focus:outline-none focus:border-amber-500 uppercase"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setViewState('HOME')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={roomCodeInput.length < 4}
                  className="flex-2 py-2.5 px-5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  Enter Game 🎲
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* 3. Richup-style "How to Play" Info Cards Section */}
      <footer id="how-to-play" className="w-full max-w-4xl mx-auto px-4 py-4 text-xs text-slate-400 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-2xl flex flex-col gap-1">
            <span className="text-emerald-400 text-lg">💰</span>
            <span className="font-bold text-slate-200">Start with Rs 1,500</span>
            <span className="text-[10px] text-slate-400 leading-tight">Every player begins with Rs 1,500 starting cash.</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-2xl flex flex-col gap-1">
            <span className="text-red-400 text-lg">🎲</span>
            <span className="font-bold text-slate-200">Roll & Move</span>
            <span className="text-[10px] text-slate-400 leading-tight">Roll dice on your turn. Doubles give an extra turn!</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-2xl flex flex-col gap-1">
            <span className="text-amber-400 text-lg">🏢</span>
            <span className="font-bold text-slate-200">Buy & Rent</span>
            <span className="text-[10px] text-slate-400 leading-tight">Acquire Pakistani city plots and collect rent from rivals.</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-2xl flex flex-col gap-1">
            <span className="text-purple-400 text-lg">🏨</span>
            <span className="font-bold text-slate-200">Build Houses & Hotels</span>
            <span className="text-[10px] text-slate-400 leading-tight">Complete city sets, build hotels, and bankrupt everyone!</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
