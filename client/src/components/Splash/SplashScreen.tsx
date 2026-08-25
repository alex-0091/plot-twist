import React, { useState, useEffect } from 'react';
import { TOKENS } from '../../types';
import { sounds } from '../../audio/SoundEffects';
import { PhysicalDie3D } from '../Board/Dice3D';

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
    <div className="h-[100dvh] max-h-[100dvh] overflow-y-auto bg-[#130f1d] text-slate-100 flex flex-col justify-between select-none">
      {/* 1. Richup Top Bar */}
      <header className="w-full max-w-5xl mx-auto px-4 py-3 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = sounds.toggleMute();
              setIsMuted(muted);
            }}
            className="p-2.5 bg-[#1c182c] hover:bg-[#26213b] rounded-xl border border-[#2e284a] text-slate-300 transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
          <span className="text-xs bg-[#241d3b] text-[#b1b2f2] border border-[#3b3260] px-3 py-1 rounded-full font-bold">
            🇵🇰 Monopoly Pakistan Edition
          </span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#how-to-play"
            className="text-xs text-[#b1b2f2] hover:text-white font-bold transition-colors"
          >
            How to play 📖
          </a>
        </div>
      </header>

      {/* 2. Richup Hero & Central Action Hub */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-2 flex flex-col items-center justify-center gap-4 z-10 my-auto">
        {/* Richup-style Logo with 3D Die */}
        <div className="w-full flex flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <PhysicalDie3D value={6} rolling={false} />
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>PLOT TWIST</span>
              <span className="text-2xl">🇵🇰</span>
            </h1>
          </div>
          <h2 className="text-sm font-semibold text-[#b1b2f2] tracking-wide">
            Rule the economy
          </h2>
        </div>

        {/* Central Action Card */}
        <div className="w-full bg-[#1c182c] border border-[#2e284a] rounded-3xl p-5 shadow-2xl space-y-4">
          {/* Avatar & Player Name Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 bg-[#130f1d] p-2 rounded-2xl border border-[#2e284a]">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl bg-[#26213b] border border-[#3b3260] shadow"
                title={`Selected Token: ${selectedToken.name}`}
              >
                {selectedToken.emoji}
              </div>
              <input
                type="text"
                value={playerName}
                maxLength={16}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your nickname..."
                className="flex-1 bg-transparent px-2 text-sm font-bold text-white focus:outline-none placeholder:text-slate-500"
              />
            </div>

            {/* Token Selector */}
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
                      ? 'bg-[#7053ff] ring-2 ring-[#b1b2f2] scale-105 shadow text-white'
                      : 'bg-[#130f1d] hover:bg-[#26213b] text-slate-400 border border-[#2e284a]'
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
              {/* Big Richup Play Button */}
              <button
                onClick={handleQuickPlay}
                className="w-full py-4 bg-gradient-to-r from-[#7053ff] to-[#8c52ff] hover:from-[#6244f5] hover:to-[#7b42f5] text-white font-black text-base rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Play</span>
                <span className="text-xl">»</span>
              </button>

              {/* Secondary Buttons: All Rooms & Create Private Game */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    sounds.playCash();
                    setViewState('JOIN');
                  }}
                  className="py-3 px-3 bg-[#130f1d] hover:bg-[#26213b] text-slate-200 font-bold text-xs rounded-xl border border-[#2e284a] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>👥</span>
                  <span>Join Game</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playCash();
                    setViewState('CREATE');
                  }}
                  className="py-3 px-3 bg-[#130f1d] hover:bg-[#26213b] text-[#b1b2f2] font-bold text-xs rounded-xl border border-[#2e284a] transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>🔑</span>
                  <span>Create a private game</span>
                </button>
              </div>
            </div>
          )}

          {/* VIEW: CREATE */}
          {viewState === 'CREATE' && (
            <form onSubmit={handleCreateSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-[#b1b2f2] block mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Islamabad Elite Match"
                  className="w-full bg-[#130f1d] border border-[#2e284a] rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#7053ff]"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setViewState('HOME')}
                  className="flex-1 py-2.5 bg-[#130f1d] hover:bg-[#26213b] text-slate-300 font-bold text-xs rounded-xl border border-[#2e284a]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 px-5 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  Create Room
                </button>
              </div>
            </form>
          )}

          {/* VIEW: JOIN */}
          {viewState === 'JOIN' && (
            <form onSubmit={handleJoinSubmit} className="space-y-3 pt-1">
              <div>
                <label className="text-xs font-bold text-[#b1b2f2] block mb-1">
                  Enter 6-Letter Room Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={roomCodeInput}
                  onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                  placeholder="e.g. AB72KD"
                  className="w-full bg-[#130f1d] border border-[#2e284a] rounded-xl px-3 py-2.5 text-center text-lg font-mono tracking-widest text-amber-400 font-black focus:outline-none focus:border-[#7053ff] uppercase"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setViewState('HOME')}
                  className="flex-1 py-2.5 bg-[#130f1d] hover:bg-[#26213b] text-slate-300 font-bold text-xs rounded-xl border border-[#2e284a]"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={roomCodeInput.length < 4}
                  className="flex-2 py-2.5 px-5 bg-[#7053ff] hover:bg-[#6244f5] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
                >
                  Enter Game
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* 3. Richup Exact "How to play" Cards */}
      <footer id="how-to-play" className="w-full max-w-4xl mx-auto px-4 py-4 text-xs text-slate-400 shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-[#1c182c] border border-[#2e284a] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[#81be97] text-lg">💵</span>
            <span className="font-bold text-slate-200">All players start with Rs 1,500</span>
            <span className="text-[10px] text-slate-400 leading-tight">Every player begins with Rs 1,500 starting money.</span>
          </div>

          <div className="bg-[#1c182c] border border-[#2e284a] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[#ffa1a1] text-lg">🎲</span>
            <span className="font-bold text-slate-200">Roll the dice to move</span>
            <span className="text-[10px] text-slate-400 leading-tight">On your turn, roll dice to move forward. Got doubles? Roll again!</span>
          </div>

          <div className="bg-[#1c182c] border border-[#2e284a] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[#ffdba1] text-lg">🏢</span>
            <span className="font-bold text-slate-200">Purchase valuable properties</span>
            <span className="text-[10px] text-slate-400 leading-tight">Buy Pakistani city plots. Rivals pay rent when landing on your plots.</span>
          </div>

          <div className="bg-[#1c182c] border border-[#2e284a] p-3 rounded-2xl flex flex-col gap-1">
            <span className="text-[#d49cff] text-lg">🏨</span>
            <span className="font-bold text-slate-200">Build houses and hotels</span>
            <span className="text-[10px] text-slate-400 leading-tight">Own a full set? Build houses and hotels to maximize rent and bankrupt rivals!</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
