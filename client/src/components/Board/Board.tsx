import React from 'react';
import { GameState, Player, BOARD_SPACES } from '../../types';
import { PoorupPropertyTile } from './PoorupPropertyTile';
import { PoorupCornerTile } from './PoorupCornerTile';
import { CenterBoard } from './CenterBoard';
import { PoorupTokenLayer } from './PoorupTokenLayer';

interface BoardProps {
  gameState: GameState;
  myPlayerId: string | null;
  myPlayer: Player | null;
  isMyTurn: boolean;
  onSelectProperty: (spaceIndex: number) => void;
  onRollDice: () => void;
  onBuyProperty: () => void;
  onDeclineBuy: () => void;
  onPayBail: () => void;
  onUseJailCard: () => void;
  onEndTurn: () => void;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  myPlayerId,
  myPlayer,
  isMyTurn,
  onSelectProperty,
  onRollDice,
  onBuyProperty,
  onDeclineBuy,
  onPayBail,
  onUseJailCard,
  onEndTurn,
}) => {
  const currentPlayer = gameState.players[gameState.currentPlayerIndex] || null;

  const getOwner = (spaceIdx: number) => {
    const pState = gameState.properties[spaceIdx];
    if (!pState || !pState.ownerId) return undefined;
    return gameState.players.find((p) => p.id === pState.ownerId);
  };

  return (
    <div
      className="relative aspect-square w-full h-full max-h-[min(calc(100dvh-54px),calc(100vw-4px))] lg:max-h-[min(calc(100dvh-75px),calc(100vw-20px))] max-w-[min(calc(100dvh-54px),calc(100vw-4px))] lg:max-w-[min(calc(100dvh-75px),calc(100vw-20px))] p-0.5 sm:p-1 bg-[#15102a] rounded-xl sm:rounded-2xl border border-[#382b66] shadow-2xl flex items-center justify-center select-none shrink-0"
    >
      {/* Poorup Global Token Layer with smooth coordinate transitions */}
      <PoorupTokenLayer
        players={gameState.players}
        currentPlayerId={currentPlayer?.id}
      />

      {/* 11x11 Grid with 1.4fr corners matching Poorup Monopoly Geometry */}
      <div
        className="w-full h-full grid gap-[1px] bg-[#0c0818] rounded-lg sm:rounded-xl p-[1px]"
        style={{
          gridTemplateColumns: 'minmax(0, 1.4fr) repeat(9, minmax(0, 1fr)) minmax(0, 1.4fr)',
          gridTemplateRows: 'minmax(0, 1.4fr) repeat(9, minmax(0, 1fr)) minmax(0, 1.4fr)',
        }}
      >
        {/* 1. TOP ROW: Spaces 20 (Corner) -> 21..29 -> 30 (Corner) */}
        <div className="col-start-1 row-start-1">
          <PoorupCornerTile
            space={BOARD_SPACES[20]}
            playersHere={[]}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {[21, 22, 23, 24, 25, 26, 27, 28, 29].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: idx + 2, gridRowStart: 1 }}>
            <PoorupPropertyTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={[]}
              currentPlayerId={currentPlayer?.id}
              side="TOP"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        <div className="col-start-11 row-start-1">
          <PoorupCornerTile
            space={BOARD_SPACES[30]}
            playersHere={[]}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {/* 2. LEFT COLUMN: Spaces 19 down to 11 */}
        {[19, 18, 17, 16, 15, 14, 13, 12, 11].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: 1, gridRowStart: idx + 2 }}>
            <PoorupPropertyTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={[]}
              currentPlayerId={currentPlayer?.id}
              side="LEFT"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        {/* 3. CENTER AREA (Spans cols 2-10 and rows 2-10) */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 p-0.5 sm:p-1">
          <CenterBoard
            gameState={gameState}
            currentPlayer={currentPlayer}
            myPlayer={myPlayer}
            isMyTurn={isMyTurn}
            onRollDice={onRollDice}
            onBuyProperty={onBuyProperty}
            onDeclineBuy={onDeclineBuy}
            onPayBail={onPayBail}
            onUseJailCard={onUseJailCard}
            onEndTurn={onEndTurn}
          />
        </div>

        {/* 4. RIGHT COLUMN: Spaces 31 to 39 */}
        {[31, 32, 33, 34, 35, 36, 37, 38, 39].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: 11, gridRowStart: idx + 2 }}>
            <PoorupPropertyTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={[]}
              currentPlayerId={currentPlayer?.id}
              side="RIGHT"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        {/* 5. BOTTOM ROW: Spaces 10 down to 0 */}
        <div className="col-start-1 row-start-11">
          <PoorupCornerTile
            space={BOARD_SPACES[10]}
            playersHere={[]}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: idx + 2, gridRowStart: 11 }}>
            <PoorupPropertyTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={[]}
              currentPlayerId={currentPlayer?.id}
              side="BOTTOM"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        <div className="col-start-11 row-start-11">
          <PoorupCornerTile
            space={BOARD_SPACES[0]}
            playersHere={[]}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>
      </div>
    </div>
  );
};
