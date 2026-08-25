import React from 'react';
import { GameState, Player, BOARD_SPACES } from '../../types';
import { SpaceTile } from './SpaceTile';
import { CornerTile } from './CornerTile';
import { CenterBoard } from './CenterBoard';

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

  const getPlayersOnSpace = (spaceIdx: number) => {
    return gameState.players.filter((p) => !p.isBankrupt && p.position === spaceIdx);
  };

  const getOwner = (spaceIdx: number) => {
    const pState = gameState.properties[spaceIdx];
    if (!pState || !pState.ownerId) return undefined;
    return gameState.players.find((p) => p.id === pState.ownerId);
  };

  return (
    <div
      className="relative aspect-square p-0.5 sm:p-1 bg-[#17112b] rounded-2xl border border-[#382c66] shadow-2xl flex items-center justify-center select-none shrink-0"
      style={{
        maxHeight: 'min(calc(100dvh - 90px), calc(100vw - 12px))',
        maxWidth: 'min(calc(100dvh - 90px), calc(100vw - 12px))',
        width: '100%',
        height: '100%',
      }}
    >
      <div className="w-full h-full grid grid-cols-11 grid-rows-11 gap-0.5 bg-[#100c1e] rounded-xl p-0.5">
        {/* 1. TOP ROW: Spaces 20 (Corner) -> 21..29 -> 30 (Corner) */}
        <div className="col-start-1 row-start-1">
          <CornerTile
            space={BOARD_SPACES[20]}
            playersHere={getPlayersOnSpace(20)}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {[21, 22, 23, 24, 25, 26, 27, 28, 29].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: idx + 2, gridRowStart: 1 }}>
            <SpaceTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={getPlayersOnSpace(spaceIdx)}
              currentPlayerId={currentPlayer?.id}
              side="TOP"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        <div className="col-start-11 row-start-1">
          <CornerTile
            space={BOARD_SPACES[30]}
            playersHere={getPlayersOnSpace(30)}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {/* 2. LEFT COLUMN: Spaces 19 down to 11 (Vertical layout) */}
        {[19, 18, 17, 16, 15, 14, 13, 12, 11].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: 1, gridRowStart: idx + 2 }}>
            <SpaceTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={getPlayersOnSpace(spaceIdx)}
              currentPlayerId={currentPlayer?.id}
              side="LEFT"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        {/* 3. CENTER AREA */}
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

        {/* 4. RIGHT COLUMN: Spaces 31 to 39 (Vertical layout) */}
        {[31, 32, 33, 34, 35, 36, 37, 38, 39].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: 11, gridRowStart: idx + 2 }}>
            <SpaceTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={getPlayersOnSpace(spaceIdx)}
              currentPlayerId={currentPlayer?.id}
              side="RIGHT"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        {/* 5. BOTTOM ROW: Spaces 10 down to 0 */}
        <div className="col-start-1 row-start-11">
          <CornerTile
            space={BOARD_SPACES[10]}
            playersHere={getPlayersOnSpace(10)}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((spaceIdx, idx) => (
          <div key={spaceIdx} style={{ gridColumnStart: idx + 2, gridRowStart: 11 }}>
            <SpaceTile
              space={BOARD_SPACES[spaceIdx]}
              propertyState={gameState.properties[spaceIdx]}
              owner={getOwner(spaceIdx)}
              playersHere={getPlayersOnSpace(spaceIdx)}
              currentPlayerId={currentPlayer?.id}
              side="BOTTOM"
              onClick={onSelectProperty}
            />
          </div>
        ))}

        <div className="col-start-11 row-start-11">
          <CornerTile
            space={BOARD_SPACES[0]}
            playersHere={getPlayersOnSpace(0)}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>
      </div>
    </div>
  );
};
