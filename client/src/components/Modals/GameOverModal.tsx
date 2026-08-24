import React from 'react';
import { GameState } from '../../types';

interface GameOverModalProps {
  gameState: GameState;
  onBackToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  onBackToLobby,
}) => {
  if (gameState.status !== 'GAME_OVER') return null;

  const winner = gameState.players.find((p) => p.id === gameState.winnerId);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-4 border-yellow-500 rounded-3xl max-w-lg w-full p-6 text-center shadow-[0_0_50px_rgba(234,179,8,0.4)] animate-in fade-in zoom-in duration-300">
        <span className="text-6xl my-2 inline-block animate-bounce">🏆</span>

        <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-yellow-400 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
          THE LAST TYCOON STANDING!
        </h1>
        <p className="text-xs font-urdu text-yellow-300 text-lg my-1">
          بادشاہ سلامت! مبارک ہو!
        </p>

        {winner && (
          <div className="my-5 p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg border-2 border-yellow-400"
              style={{ backgroundColor: winner.color }}
            >
              {winner.tokenEmoji}
            </div>
            <h2 className="text-2xl font-black text-white">{winner.name}</h2>
            <div className="flex items-center gap-4 text-sm mt-1">
              <span className="text-emerald-400 font-extrabold">
                💰 Rs {winner.cash.toLocaleString()}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-400 font-bold">
                🏢 {winner.properties.length} Plots Owned
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1.5 text-xs text-slate-400 mb-6">
          <p>Turns Played: <strong className="text-slate-200">{gameState.turnNumber}</strong></p>
          <p className="italic text-slate-500">"Plot gaya. Paisa gaya. Lekin winner ban gaya!"</p>
        </div>

        <button
          onClick={onBackToLobby}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-sm rounded-xl shadow-lg transition-transform hover:scale-105"
        >
          PLAY AGAIN / NEW GAME 🇵🇰
        </button>
      </div>
    </div>
  );
};
