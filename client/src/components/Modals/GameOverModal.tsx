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
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#1c182c] border-2 border-[#7053ff] rounded-3xl max-w-lg w-full p-6 text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        <span className="text-6xl my-1 inline-block animate-bounce">🏆</span>

        <h1 className="text-2xl sm:text-3xl font-black text-white">
          THE LAST TYCOON STANDING!
        </h1>
        <p className="text-xs font-urdu text-amber-300 text-lg my-0.5">
          بادشاہ سلامت! مبارک ہو!
        </p>

        {winner && (
          <div className="my-4 p-4 rounded-2xl bg-[#130f1d] border border-[#2e284a] flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-[#2e284a]"
              style={{ backgroundColor: winner.color }}
            >
              {winner.tokenEmoji}
            </div>
            <h2 className="text-xl font-black text-white">{winner.name}</h2>
            <div className="flex items-center gap-3 text-xs mt-1">
              <span className="text-[#81be97] font-black text-sm">
                💰 Rs {winner.cash.toLocaleString()}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300 font-bold">
                🏢 {winner.properties.length} Plots Owned
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1 text-xs text-slate-400 mb-5">
          <p>Turns Played: <strong className="text-slate-200">{gameState.turnNumber}</strong></p>
          <p className="italic text-slate-500">"Plot gaya. Paisa gaya. Lekin winner ban gaya!"</p>
        </div>

        <button
          onClick={onBackToLobby}
          className="w-full py-3.5 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-sm rounded-2xl shadow-lg transition-transform hover:scale-105"
        >
          PLAY AGAIN »
        </button>
      </div>
    </div>
  );
};
