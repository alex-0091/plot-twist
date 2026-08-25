import React, { useState } from 'react';
import { useGameSocket } from './hooks/useGameSocket';
import { SplashScreen } from './components/Splash/SplashScreen';
import { LobbyView } from './components/Lobby/LobbyView';
import { PoorupGameRoom } from './components/GameRoom/PoorupGameRoom';
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
      <div className="h-[100dvh] max-h-[100dvh] overflow-y-auto p-3 sm:p-6 flex items-center justify-center bg-[#0e0a1b] text-slate-100 select-none">
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

  // 3. Poorup-Style 3-Column Game Room
  return (
    <>
      <PoorupGameRoom
        gameState={gameState}
        myPlayerId={myPlayerId}
        myPlayer={myPlayer}
        isMyTurn={isMyTurn}
        selectedPropertyIndex={selectedPropertyIndex}
        onSelectProperty={(idx) => setSelectedPropertyIndex(idx)}
        onRollDice={rollDice}
        onBuyProperty={buyProperty}
        onDeclineBuy={declineBuy}
        onPayBail={payBail}
        onUseJailCard={useJailCard}
        onEndTurn={endTurn}
        onBuildHouse={buildHouse}
        onMortgage={mortgageProperty}
        onUnmortgage={unmortgageProperty}
        onOpenTradeWith={handleOpenTradeWith}
        onOpenTrade={() => setShowTradeModal(true)}
        onSendChat={sendChat}
        onOpenRules={() => setShowRulesModal(true)}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
        onLeaveRoom={leaveRoom}
      />

      {/* Global Modals */}
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
    </>
  );
}
