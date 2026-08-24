import React, { useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { SplashScreen } from './components/Splash/SplashScreen';
import { LobbyView } from './components/Lobby/LobbyView';
import { Board } from './components/Board/Board';
import { SidePanel } from './components/SidePanel/SidePanel';
import { ActionPanel } from './components/ActionPanel/ActionPanel';
import { TitleDeedModal } from './components/Modals/TitleDeedModal';
import { CardDrawModal } from './components/Modals/CardDrawModal';
import { TradeModal } from './components/Modals/TradeModal';
import { AuctionModal } from './components/Modals/AuctionModal';
import { GameOverModal } from './components/Modals/GameOverModal';
import { GameInfoModal } from './components/Modals/GameInfoModal';
import { sounds } from './audio/SoundEffects';
import { Player } from './types';

export function App() {
  const {
    connected,
    gameState,
    myPlayerId,
    myPlayer,
    isMyTurn,
    isHost,
    selectedPropertyIndex,
    setSelectedPropertyIndex,
    showTradeModal,
    setShowTradeModal,
    tradeTargetPlayer,
    setTradeTargetPlayer,
    activeCardPopup,
    setActiveCardPopup,
    createRoom,
    joinRoom,
    addBot,
    removeBot,
    updateSettings,
    startGame,
    rollDice,
    buyProperty,
    declineBuy,
    buildHouse,
    mortgageProperty,
    unmortgageProperty,
    payBail,
    useJailCard,
    endTurn,
    placeAuctionBid,
    foldAuction,
    createTradeOffer,
    respondTrade,
    sendChat,
    leaveRoom,
  } = useGameSocket();

  const [isMuted, setIsMuted] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState<'NONE' | 'PLAYERS' | 'LOGS'>('NONE');

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleOpenTradeWith = (target: Player) => {
    setTradeTargetPlayer(target);
    setShowTradeModal(true);
  };

  // 1. Splash Screen (Landing / Create / Join)
  if (!gameState) {
    return (
      <SplashScreen
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
      />
    );
  }

  // 2. Lobby View
  if (gameState.status === 'LOBBY') {
    return (
      <div className="h-[100dvh] max-h-[100dvh] overflow-y-auto p-3 sm:p-6 flex items-center justify-center bg-slate-950 text-slate-100">
        <LobbyView
          gameState={gameState}
          myPlayerId={myPlayerId}
          isHost={isHost}
          onAddBot={addBot}
          onRemoveBot={removeBot}
          onUpdateSettings={updateSettings}
          onStartGame={startGame}
          onLeaveRoom={leaveRoom}
        />
      </div>
    );
  }

  // 3. Active Match Screen (100% Viewport Contained - Zero Page Scroll)
  return (
    <div className="h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between bg-slate-950 text-slate-100 select-none">
      {/* Top Navbar */}
      <header className="w-full h-12 bg-slate-900/90 border-b border-emerald-500/30 px-3 sm:px-4 flex items-center justify-between z-30 shadow-md backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl animate-bounce-short">🇵🇰</span>
          <div>
            <h1 className="font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-400 bg-clip-text text-transparent leading-none">
              PLOT TWIST
            </h1>
            <span className="text-[9px] text-slate-400 font-semibold block leading-none mt-0.5">
              Room: <strong className="text-amber-400 font-mono">{gameState.roomCode}</strong>
            </span>
          </div>
        </div>

        {/* Center Turn Status Indicator */}
        <div className="flex items-center gap-2 text-xs bg-slate-950 px-3 py-1 rounded-full border border-slate-800 shadow-inner">
          <span className="text-slate-400 hidden sm:inline">Turn {gameState.turnNumber} •</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <span>Turn:</span>
            <strong className="text-white">
              {gameState.players[gameState.currentPlayerIndex]?.name || 'Player'}
            </strong>
          </span>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Drawer Triggers */}
          <button
            onClick={() => setMobileDrawer(mobileDrawer === 'PLAYERS' ? 'NONE' : 'PLAYERS')}
            className="lg:hidden px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
            title="View Tycoons"
          >
            👥 ({gameState.players.length})
          </button>

          <button
            onClick={() => setMobileDrawer(mobileDrawer === 'LOGS' ? 'NONE' : 'LOGS')}
            className="lg:hidden px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700"
            title="View Game Log"
          >
            📜
          </button>

          <button
            onClick={() => setShowRulesModal(true)}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center gap-1"
            title="Inspect Match Rules"
          >
            <span>📋</span>
            <span className="hidden sm:inline">Rules</span>
          </button>

          <button
            onClick={handleToggleMute}
            className="p-1.5 sm:p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={() => setShowTradeModal(true)}
            className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs rounded-lg shadow hidden sm:inline-flex items-center gap-1"
          >
            <span>🤝</span>
            <span>Trade</span>
          </button>

          <button
            onClick={leaveRoom}
            className="px-2.5 py-1 bg-slate-800 hover:bg-red-950/80 text-slate-300 hover:text-red-300 font-bold text-xs rounded-lg border border-slate-700"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Board & SidePanel Area (Fits 100% Viewport) */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center p-1 sm:p-3 gap-3 overflow-hidden">
        {/* Dynamic Scaling Board */}
        <div className="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
          <Board
            gameState={gameState}
            myPlayerId={myPlayerId}
            onSelectProperty={(idx) => setSelectedPropertyIndex(idx)}
            onOpenRules={() => setShowRulesModal(true)}
          />
        </div>

        {/* Desktop SidePanel (Leaderboard, Logs, Chat) */}
        <div className="hidden lg:block w-80 h-full shrink-0">
          <SidePanel
            gameState={gameState}
            myPlayer={myPlayer}
            onSendChat={sendChat}
            onSelectProperty={(idx) => setSelectedPropertyIndex(idx)}
            onOpenTradeWith={handleOpenTradeWith}
          />
        </div>
      </main>

      {/* Bottom Sticky Action Panel */}
      <div className="shrink-0 z-20">
        <ActionPanel
          gameState={gameState}
          myPlayer={myPlayer}
          isMyTurn={isMyTurn}
          onRollDice={rollDice}
          onBuyProperty={buyProperty}
          onDeclineBuy={declineBuy}
          onPayBail={payBail}
          onUseJailCard={useJailCard}
          onEndTurn={endTurn}
          onOpenTrade={() => setShowTradeModal(true)}
          onOpenManageProperties={() => {
            if (myPlayer && myPlayer.properties.length > 0) {
              setSelectedPropertyIndex(myPlayer.properties[0]);
            }
          }}
        />
      </div>

      {/* Mobile Drawer Bottom Sheet (Players or Logs) */}
      {mobileDrawer !== 'NONE' && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-slate-900 border-t-2 border-emerald-500 rounded-t-3xl max-h-[75vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
              <span className="text-xs font-black uppercase text-amber-300">
                {mobileDrawer === 'PLAYERS' ? '👥 TYCOONS & ASSETS' : '📜 EVENT FEED & BANTER'}
              </span>
              <button
                onClick={() => setMobileDrawer('NONE')}
                className="text-slate-400 hover:text-white text-xs font-bold bg-slate-800 px-2.5 py-1 rounded-full"
              >
                ✕ Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <SidePanel
                gameState={gameState}
                myPlayer={myPlayer}
                onSendChat={sendChat}
                onSelectProperty={(idx) => {
                  setMobileDrawer('NONE');
                  setSelectedPropertyIndex(idx);
                }}
                onOpenTradeWith={(p) => {
                  setMobileDrawer('NONE');
                  handleOpenTradeWith(p);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedPropertyIndex !== null && (
        <TitleDeedModal
          spaceIndex={selectedPropertyIndex}
          gameState={gameState}
          myPlayerId={myPlayerId}
          onClose={() => setSelectedPropertyIndex(null)}
          onBuildHouse={buildHouse}
          onMortgage={mortgageProperty}
          onUnmortgage={unmortgageProperty}
        />
      )}

      {activeCardPopup && (
        <CardDrawModal
          card={activeCardPopup}
          onClose={() => setActiveCardPopup(null)}
        />
      )}

      <TradeModal
        isOpen={showTradeModal}
        gameState={gameState}
        myPlayer={myPlayer}
        onClose={() => setShowTradeModal(false)}
        onCreateTradeOffer={createTradeOffer}
        onRespondTrade={respondTrade}
      />

      {gameState.status === 'AUCTION' && (
        <AuctionModal
          auction={gameState.currentAuction}
          gameState={gameState}
          myPlayer={myPlayer}
          onBid={placeAuctionBid}
          onFold={foldAuction}
        />
      )}

      <GameInfoModal
        isOpen={showRulesModal}
        settings={gameState.settings}
        roomCode={gameState.roomCode}
        roomName={gameState.roomName}
        onClose={() => setShowRulesModal(false)}
      />

      {gameState.status === 'GAME_OVER' && (
        <GameOverModal
          gameState={gameState}
          onBackToLobby={leaveRoom}
        />
      )}
    </div>
  );
}
