import React from 'react';
import { GameState } from '../../types';
import { BOARD_SPACES } from '../../types';
import { SpaceTile } from './SpaceTile';
import { CornerTile } from './CornerTile';
import { CenterBoard } from './CenterBoard';

interface BoardProps {
  gameState: GameState;
  myPlayerId: string | null;
  onSelectProperty: (spaceIndex: number) => void;
  onOpenRules?: () => void;
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  myPlayerId,
  onSelectProperty,
  onOpenRules,
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
    <div className="relative w-full max-w-[calc(100dvh-130px)] max-h-[calc(100dvh-130px)] aspect-square p-1 sm:p-2 bg-slate-950 rounded-2xl border-2 sm:border-4 border-emerald-600/60 shadow-[0_0_35px_rgba(5,150,105,0.3)] truck-art-border flex items-center justify-center select-none">
      <div className="w-full h-full grid grid-cols-11 grid-rows-11 gap-0.5 sm:gap-1 bg-slate-900/80 rounded-xl p-0.5 sm:p-1">
        {/* 1. TOP ROW: Spaces 20 (Corner) -> 21..29 -> 30 (Corner) */}
        {/* Row 1, Col 1: Space 20 (Hira Mandi / Free Parking) */}
        <div className="col-start-1 row-start-1">
          <CornerTile
            space={BOARD_SPACES[20]}
            playersHere={getPlayersOnSpace(20)}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {/* Row 1, Cols 2..10: Spaces 21 to 29 */}
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

        {/* Row 1, Col 11: Space 30 (Met a Lahori / Go to Jail) */}
        <div className="col-start-11 row-start-1">
          <CornerTile
            space={BOARD_SPACES[30]}
            playersHere={getPlayersOnSpace(30)}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {/* 2. LEFT COLUMN: Spaces 19 down to 11 (Cols 1, Rows 2..10) */}
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

        {/* 3. CENTER AREA: Cols 2..10, Rows 2..10 */}
        <div className="col-start-2 col-end-11 row-start-2 row-end-11 p-1 sm:p-2">
          <CenterBoard
            gameState={gameState}
            currentPlayer={currentPlayer}
            myPlayerId={myPlayerId}
            onOpenRules={onOpenRules}
          />
        </div>

        {/* 4. RIGHT COLUMN: Spaces 31 to 39 (Cols 11, Rows 2..10) */}
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

        {/* 5. BOTTOM ROW: Spaces 10 (Corner) -> 9 down to 1 -> 0 (Corner) */}
        {/* Row 11, Col 1: Space 10 (Thana / Quetta Café) */}
        <div className="col-start-1 row-start-11">
          <CornerTile
            space={BOARD_SPACES[10]}
            playersHere={getPlayersOnSpace(10)}
            currentPlayerId={currentPlayer?.id}
            onClick={onSelectProperty}
          />
        </div>

        {/* Row 11, Cols 2..10: Spaces 9 down to 1 */}
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

        {/* Row 11, Col 11: Space 0 (START / Salary Aa Gayi) */}
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
