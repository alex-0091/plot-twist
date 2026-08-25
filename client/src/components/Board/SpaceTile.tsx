import React from 'react';
import { BoardSpace, PropertyState, Player } from '../../types';
import { TokenPiece } from './TokenPiece';

interface SpaceTileProps {
  space: BoardSpace;
  propertyState?: PropertyState;
  owner?: Player;
  playersHere: Player[];
  currentPlayerId?: string;
  side: 'BOTTOM' | 'LEFT' | 'TOP' | 'RIGHT';
  onClick: (spaceIndex: number) => void;
}

export const SpaceTile: React.FC<SpaceTileProps> = ({
  space,
  propertyState,
  owner,
  playersHere,
  currentPlayerId,
  side,
  onClick,
}) => {
  const isProperty = space.type === 'PROPERTY';
  const isTransport = space.type === 'TRANSPORT';
  const isUtility = space.type === 'UTILITY';
  const isCard = space.type.startsWith('CARD_');
  const isTax = space.type === 'TAX';
  const isVerticalSide = side === 'LEFT' || side === 'RIGHT';

  return (
    <div
      onClick={() => onClick(space.index)}
      className={`relative bg-[#1e1738] hover:bg-[#2c2250] border border-[#382c66] flex flex-col justify-between cursor-pointer transition-all p-0.5 select-none overflow-hidden group rounded-sm shadow-sm ${
        propertyState?.isMortgaged ? 'opacity-60 grayscale-[60%]' : ''
      }`}
      style={{
        boxShadow: owner ? `inset 0 0 0 2px ${owner.color}` : undefined,
      }}
      title={`${space.name} - Price: ${space.price || space.taxAmount || ''}`}
    >
      {/* 1. TOP & BOTTOM SIDES: Horizontal Color Band with Centered Bold Price */}
      {isProperty && !isVerticalSide && (
        <div
          className={`h-4 sm:h-4.5 w-full rounded-[2px] flex items-center justify-center relative shadow-sm overflow-hidden ${
            side === 'BOTTOM' ? 'order-first' : 'order-last'
          }`}
          style={{ backgroundColor: space.colorHex || '#6366f1' }}
        >
          {/* Centered Bold Price Tag */}
          <span className="text-[8.5px] sm:text-[9.5px] font-black font-mono tracking-tight text-black bg-white/90 px-1 py-0.2 rounded shadow-sm">
            {space.price}
          </span>

          {/* Building Indicator */}
          {propertyState?.hasHotel ? (
            <span className="absolute right-0.5 text-[8px] font-black text-red-100 animate-pulse">🏨</span>
          ) : propertyState?.houses ? (
            <span className="absolute right-0.5 text-[7px] font-black text-emerald-100">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* 2. LEFT & RIGHT SIDES: Vertical Edge Color Band with Price */}
      {isProperty && isVerticalSide && (
        <div
          className={`h-full w-3.5 sm:w-4 absolute top-0 ${side === 'LEFT' ? 'right-0' : 'left-0'} flex flex-col items-center justify-center shadow-sm z-10`}
          style={{ backgroundColor: space.colorHex || '#6366f1' }}
        >
          <span className="text-[7.5px] sm:text-[8.5px] font-black font-mono text-black bg-white/90 px-0.5 py-0.5 rounded shadow-sm [writing-mode:vertical-rl] rotate-180">
            {space.price}
          </span>

          {propertyState?.hasHotel ? (
            <span className="text-[7px] font-black text-red-100 mt-1">🏨</span>
          ) : propertyState?.houses ? (
            <span className="text-[6px] font-black text-emerald-100 mt-0.5">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* 3. Main Label Zone */}
      <div
        className={`flex items-center justify-center flex-1 text-center z-10 leading-tight ${
          isVerticalSide
            ? side === 'LEFT'
              ? 'pr-4 sm:pr-4.5 pl-0.5'
              : 'pl-4 sm:pl-4.5 pr-0.5'
            : 'py-0.5'
        }`}
      >
        {isVerticalSide ? (
          /* Vertical Text Layout for Left & Right Columns */
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-[8px] sm:text-[9.5px] font-black tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors [writing-mode:vertical-rl] rotate-180 line-clamp-1">
              {space.name}
            </span>

            {/* Non-property icons */}
            {(isTransport || isUtility || isCard || isTax) && (
              <div className="flex flex-col items-center mt-1">
                <span className="text-[10px] sm:text-xs">
                  {space.icon || (isTransport ? '🚂' : isUtility ? '⚡' : isCard ? '🃏' : '📋')}
                </span>
                {space.price && (
                  <span className="text-[7px] sm:text-[8px] font-mono font-bold text-emerald-400 mt-0.5">
                    {space.price}
                  </span>
                )}
                {space.taxAmount && (
                  <span className="text-[7px] sm:text-[8px] font-mono font-bold text-red-400 mt-0.5">
                    {space.taxAmount}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Horizontal Text Layout for Top & Bottom Rows */
          <div className="flex flex-col items-center justify-center">
            <span className="text-[8px] sm:text-[9.5px] md:text-[10.5px] font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
              {space.name}
            </span>

            {(isTransport || isUtility || isCard || isTax) && (
              <div className="flex flex-col items-center mt-0.5">
                <span className="text-[11px] sm:text-xs">
                  {space.icon || (isTransport ? '🚂' : isUtility ? '⚡' : isCard ? '🃏' : '📋')}
                </span>
                {space.price && (
                  <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-emerald-400">
                    {space.price}
                  </span>
                )}
                {space.taxAmount && (
                  <span className="text-[7.5px] sm:text-[8.5px] font-mono font-bold text-red-400">
                    {space.taxAmount}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner Color Indicator Bar */}
      {owner && (
        <div
          className="absolute bottom-0 inset-x-0 h-1 sm:h-1.5 z-20"
          style={{ backgroundColor: owner.color || '#22c55e' }}
          title={`Owned by ${owner.name}`}
        />
      )}

      {/* Mortgaged Overlay */}
      {propertyState?.isMortgaged && (
        <div className="absolute inset-0 bg-red-950/85 flex items-center justify-center z-20 rotate-[-12deg]">
          <span className="text-[6px] sm:text-[7px] font-black text-red-200 uppercase tracking-widest border border-red-500 px-0.5 rounded bg-black/70">
            MORTGAGED
          </span>
        </div>
      )}

      {/* Player Tokens on this space */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-30 bg-black/30 backdrop-blur-[0.5px]">
          {playersHere.map((p) => (
            <TokenPiece
              key={p.id}
              player={p}
              isCurrentPlayer={p.id === currentPlayerId}
              size="sm"
            />
          ))}
        </div>
      )}
    </div>
  );
};
