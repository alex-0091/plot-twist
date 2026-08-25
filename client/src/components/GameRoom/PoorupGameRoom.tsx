import React, { useState } from 'react';
import { GameState, Player } from '../../types';
import { Board } from '../Board/Board';
import { LeftPlayerPanel } from './LeftPlayerPanel';
import { RightLogPanel } from './RightLogPanel';

interface PoorupGameRoomProps {
  gameState: GameState;
  myPlayerId: string | null;
  myPlayer: Player | null;
  isMyTurn: boolean;
  selectedPropertyIndex: number | null;
  onSelectProperty: (spaceIndex: number | null) => void;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onDeclineBuy: () => void;
  onPayBail: () => void;
  onUseJailCard: () => void;
  onEndTurn: () => void;
  onBuildHouse: (spaceIndex: number) => void;
  onMortgage: (spaceIndex: number) => void;
  onUnmortgage: (spaceIndex: number) => void;
  onOpenTradeWith: (player: Player) => void;
  onOpenTrade: () => void;
  onSendChat: (message: string) => void;
  onOpenRules: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  onLeaveRoom: () => void;
}

export const PoorupGameRoom: React.FC<PoorupGameRoomProps> = ({
  gameState,
  myPlayerId,
  myPlayer,
  isMyTurn,
  selectedPropertyIndex,
  onSelectProperty,
  onRollDice,
  onBuyProperty,
  onDeclineBuy,
  onPayBail,
  onUseJailCard,
  onEndTurn,
  onBuildHouse,
  onMortgage,
  onUnmortgage,
  onOpenTradeWith,
  onOpenTrade,
  onSendChat,
  onOpenRules,
  onToggleMute,
  isMuted,
  onLeaveRoom,
}) => {
  const [mobileTab, setMobileTab] = useState<'BOARD' | 'PLAYERS' | 'LOG'>('BOARD');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(gameState.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentPlayer = gameState.players[gameState.currentPlayerIndex] || null;

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between bg-[#0e0a1b] text-slate-100 select-none">
      {/* 1. TOPBAR */}
      <header className="w-full h-12 bg-[#171329]/95 border-b border-[#2e264f] px-3 sm:px-6 flex items-center justify-between z-30 shadow-md backdrop-blur-md shrink-0">
        {/* Left: Brand & Room Code */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xl filter drop-shadow">🇵🇰</span>
            <span className="font-black text-sm sm:text-base tracking-wider text-white">
              PLOT TWIST
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-[#100c1e] border border-[#2e264f] px-2.5 py-0.5 rounded-full text-xs">
            <span className="text-slate-400 font-semibold">Room:</span>
            <span className="font-mono font-black text-amber-400">{gameState.roomCode}</span>
            <button
              onClick={handleCopyRoomCode}
              className="text-[10px] bg-[#251e3e] hover:bg-[#342a54] text-[#b1b2f2] px-1.5 py-0.2 rounded font-bold transition-colors ml-1"
            >
              {copiedCode ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Center: Turn Status Pill */}
        <div className="flex items-center gap-1.5 text-xs bg-[#100c1e] px-3 py-1 rounded-full border border-[#2e264f] shadow-inner">
          <span className="text-slate-400 hidden md:inline">Turn {gameState.turnNumber} •</span>
          <span className="text-[#81be97] font-bold flex items-center gap-1">
            <span>Turn:</span>
            <strong className="text-white">
              {currentPlayer?.name || 'Player'} {isMyTurn ? '(You)' : ''}
            </strong>
          </span>
        </div>

        {/* Right: Controls (Rules, Mute, Leave) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={onOpenRules}
            className="px-2.5 py-1 bg-[#100c1e] hover:bg-[#251e3e] text-[#b1b2f2] text-xs font-bold rounded-lg border border-[#2e264f] flex items-center gap-1 transition-colors"
            title="Rules & Game Settings"
          >
            <span>📋</span>
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={onToggleMute}
            className="p-1.5 bg-[#100c1e] hover:bg-[#251e3e] rounded-lg text-xs border border-[#2e264f] transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={onLeaveRoom}
            className="px-2.5 py-1 bg-[#100c1e] hover:bg-red-950/80 text-slate-300 hover:text-red-300 font-bold text-xs rounded-lg border border-[#2e264f] transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-COLUMN WORKSPACE (POORUP LAYOUT) */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-3 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[300px_1fr_300px] gap-3 items-stretch justify-center overflow-hidden">
        {/* LEFT COLUMN: Players Leaderboard & Chat */}
        <div className={`h-full overflow-hidden ${mobileTab === 'PLAYERS' ? 'block' : 'hidden lg:block'}`}>
          <LeftPlayerPanel
            gameState={gameState}
            myPlayer={myPlayer}
            onSelectProperty={onSelectProperty}
            onOpenTradeWith={onOpenTradeWith}
            onSendChat={onSendChat}
          />
        </div>

        {/* CENTER COLUMN: Central Board & Rolling 3D Action Hub */}
        <div className={`h-full flex items-center justify-center overflow-hidden ${mobileTab === 'BOARD' ? 'flex' : 'hidden lg:flex'}`}>
          <Board
            gameState={gameState}
            myPlayerId={myPlayerId}
            myPlayer={myPlayer}
            isMyTurn={isMyTurn}
            onSelectProperty={onSelectProperty}
            onRollDice={onRollDice}
            onBuyProperty={onBuyProperty}
            onDeclineBuy={onDeclineBuy}
            onPayBail={onPayBail}
            onUseJailCard={onUseJailCard}
            onEndTurn={onEndTurn}
          />
        </div>

        {/* RIGHT COLUMN: Property Deed Inspector & Game Activity Log */}
        <div className={`h-full overflow-hidden ${mobileTab === 'LOG' ? 'block' : 'hidden lg:block'}`}>
          <RightLogPanel
            gameState={gameState}
            myPlayer={myPlayer}
            selectedPropertyIndex={selectedPropertyIndex}
            onSelectProperty={onSelectProperty}
            onBuildHouse={onBuildHouse}
            onMortgage={onMortgage}
            onUnmortgage={onUnmortgage}
            onOpenTrade={onOpenTrade}
          />
        </div>
      </main>

      {/* 3. MOBILE RESPONSIVE BOTTOM NAVIGATION TABS (Only on small screens) */}
      <nav className="lg:hidden w-full h-12 bg-[#171329]/98 border-t border-[#2e264f] px-2 flex items-center justify-around z-30 shrink-0">
        <button
          onClick={() => setMobileTab('BOARD')}
          className={`flex-1 py-1.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'BOARD'
              ? 'bg-[#7053ff] text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🎲</span>
          <span>Board</span>
        </button>

        <button
          onClick={() => setMobileTab('PLAYERS')}
          className={`flex-1 py-1.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'PLAYERS'
              ? 'bg-[#7053ff] text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>👥</span>
          <span>Players ({gameState.players.length})</span>
        </button>

        <button
          onClick={() => setMobileTab('LOG')}
          className={`flex-1 py-1.5 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
            mobileTab === 'LOG'
              ? 'bg-[#7053ff] text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>📜</span>
          <span>Activity</span>
        </button>

        <button
          onClick={onOpenTrade}
          className="py-1.5 px-3 bg-[#241c42] hover:bg-[#342a54] text-[#b1b2f2] text-xs font-black rounded-xl border border-[#3b3260] flex items-center gap-1"
        >
          <span>🤝</span>
          <span>Trade</span>
        </button>
      </nav>
    </div>
  );
};
