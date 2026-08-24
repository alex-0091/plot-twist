import React, { useState } from 'react';
import { TOKENS } from '../../types';
import { sounds } from '../../audio/SoundEffects';
import { PakistaniCoverArt } from './PakistaniCoverArt';

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
  const [mode, setMode] = useState<'MAIN' | 'CREATE' | 'JOIN' | 'RULES'>('MAIN');

  // Check URL params for room code invite link
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomCodeInput(roomParam.toUpperCase());
      setMode('JOIN');
    }
  }, []);

  const selectedToken = TOKENS.find((t) => t.id === selectedTokenId) || TOKENS[0];

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
    <div className="h-[100dvh] max-h-[100dvh] overflow-y-auto flex flex-col items-center justify-center p-3 sm:p-6 bg-gradient-to-br from-slate-950 via-emerald-950/60 to-slate-950 relative">
      {/* Decorative Pakistani Truck Art Elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-lg bg-slate-900/90 border-2 border-emerald-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl relative z-10 truck-art-border space-y-3.5 my-auto">
        {/* Animated Funny Pakistani Cover Photo Art */}
        <PakistaniCoverArt />
        {/* Branding & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-3">
            <span className="text-4xl animate-bounce-short">🇵🇰</span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 bg-clip-text text-transparent drop-shadow-md">
              PLOT TWIST
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-black text-amber-300 tracking-widest uppercase mt-1">
            Pakistan's Property Game • رول، خرید، تعمیر اور پلاٹ
          </p>

          {/* Rem Development Mascot Badge */}
          <div className="mt-3 flex items-center gap-2 bg-slate-950/80 px-3 py-1 rounded-full border border-sky-500/40 text-[11px] text-sky-200">
            <span className="w-4 h-4 rounded-full bg-sky-400 inline-flex items-center justify-center text-[10px] text-black font-black">
              R
            </span>
            <span>Rem Dev Prototype Edition (Re:Zero Prototype)</span>
          </div>
        </div>

        {/* Setup Profile: Name & Token */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-5 space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Your Tycoon Name:</label>
            <input
              type="text"
              value={playerName}
              maxLength={18}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Owais, Hamza, Raja Sahab"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Choose Player Token: <span className="text-amber-400">{selectedToken.name}</span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {TOKENS.map((token) => (
                <button
                  key={token.id}
                  type="button"
                  onClick={() => {
                    setSelectedTokenId(token.id);
                    sounds.playCash();
                  }}
                  className={`p-2.5 rounded-xl text-2xl flex items-center justify-center transition-all ${
                    selectedTokenId === token.id
                      ? 'bg-emerald-600 ring-2 ring-emerald-300 scale-110 shadow-lg'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                  title={`${token.name} (${token.urduName})`}
                >
                  {token.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Mode Switching */}
        {mode === 'MAIN' && (
          <div className="space-y-3">
            <button
              onClick={() => {
                sounds.playCash();
                setMode('CREATE');
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-sm rounded-2xl shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🏠</span>
              <span>CREATE NEW GAME (نیا کمرہ بنائیں)</span>
            </button>

            <button
              onClick={() => {
                sounds.playCash();
                setMode('JOIN');
              }}
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm rounded-2xl border border-slate-700 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            >
              <span>🔑</span>
              <span>JOIN WITH ROOM CODE (کمرے میں شامل ہوں)</span>
            </button>

            <button
              onClick={() => setMode('RULES')}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 font-semibold transition-colors"
            >
              📖 How to Play & Pakistani Rules
            </button>
          </div>
        )}

        {/* Mode: CREATE */}
        {mode === 'CREATE' && (
          <form onSubmit={handleCreateSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Game / Room Name:</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Owais ka Plot"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('MAIN')}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-2 py-3 px-6 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Launch Room 🚀
              </button>
            </div>
          </form>
        )}

        {/* Mode: JOIN */}
        {mode === 'JOIN' && (
          <form onSubmit={handleJoinSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Enter 6-Letter Room Code:</label>
              <input
                type="text"
                maxLength={6}
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. AB72KD"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-center text-lg font-mono tracking-widest text-amber-400 font-black focus:outline-none focus:border-amber-500 uppercase"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMode('MAIN')}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={roomCodeInput.length < 4}
                className="flex-2 py-3 px-6 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
              >
                Enter Match 🎲
              </button>
            </div>
          </form>
        )}

        {/* Mode: RULES */}
        {mode === 'RULES' && (
          <div className="space-y-3 text-xs text-slate-300 max-h-72 overflow-y-auto pr-2">
            <h3 className="font-black text-sm text-amber-400">Game Rules & Pakistani Economics:</h3>
            <p>• <strong>Goal:</strong> Roll dice, acquire Pakistani city plots, build 4 houses then luxury hotels, and bankrupt all rivals!</p>
            <p>• <strong>Cities:</strong> Rawalpindi (Cheapest Brown) &rarr; Lahore &rarr; Peshawar &rarr; Multan &rarr; Faisalabad &rarr; Murree &rarr; Karachi &rarr; Islamabad (Elite Dark Blue).</p>
            <p>• <strong>Salary:</strong> Collect Rs 200 every time you pass START (Salary Aa Gayi).</p>
            <p>• <strong>Corners:</strong> Thana (Jail) / Quetta Café (Just Visiting), Hira Mandi (Free rest), and Met a Lahori (Go to Thana).</p>
            <p>• <strong>Cards:</strong> "😂 Scene On Hai" and "🇵🇰 Pakistan Zindabad" with real Pakistani chaos (Raja Has Arrived, Khokhar Royalty, Biryani Debate, NADRA Queue).</p>
            <p>• <strong>Bots:</strong> Play solo or invite friends! Smart AI bots like Plot Uncle and Lahori Burger are available.</p>

            <button
              type="button"
              onClick={() => setMode('MAIN')}
              className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl"
            >
              Got it! (سمجھ گیا)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
