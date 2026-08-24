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

  const handleToggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const handleOpenTradeWith = (target: Player) => {
    setTradeTargetPlayer(target);
    setShowTradeModal(true);
  };

  // 1. Splash Screen
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
      <div className="min-h-screen p-4 flex items-center justify-center bg-slate-950 text-slate-100">
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

  // 3. Active Match Screen
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <header className="w-full bg-slate-900/90 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between z-30 shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="text-xl">🇵🇰</span>
          <div>
            <h1 className="font-black text-sm sm:text-base tracking-wider bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
              PLOT TWIST
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold block leading-none">
              Room: <strong className="text-amber-400 font-mono">{gameState.roomCode}</strong>
            </span>
          </div>
        </div>

        {/* Center info */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
          <span className="text-slate-400">Turn {gameState.turnNumber}</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">
            Current: {gameState.players[gameState.currentPlayerIndex]?.name || 'Player'}
          </span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs transition-colors"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>

          <button
            onClick={() => setShowTradeModal(true)}
            className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors hidden sm:inline-flex items-center gap-1"
          >
            <span>🤝</span>
            <span>Trade</span>
          </button>

          <button
            onClick={leaveRoom}
            className="px-3 py-1.5 bg-slate-800 hover:bg-red-950/80 text-slate-300 hover:text-red-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
          >
            Exit
          </button>
        </div>
      </header>

      {/* Main Board & SidePanel Area */}
      <main className="flex-1 flex flex-col lg:flex-row items-center lg:items-start justify-center p-2 sm:p-4 gap-4 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Board Container */}
        <div className="w-full lg:flex-1 flex justify-center items-center">
          <Board
            gameState={gameState}
            myPlayerId={myPlayerId}
            onSelectProperty={(idx) => setSelectedPropertyIndex(idx)}
          />
        </div>

        {/* Side Panel (Leaderboard, Logs, Chat) */}
        <div className="w-full lg:w-80 h-[500px] lg:h-[750px]">
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

      {gameState.status === 'GAME_OVER' && (
        <GameOverModal
          gameState={gameState}
          onBackToLobby={leaveRoom}
        />
      )}
    </div>
  );
}
