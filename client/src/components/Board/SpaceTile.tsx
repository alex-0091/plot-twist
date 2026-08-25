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

  return (
    <div
      onClick={() => onClick(space.index)}
      className={`relative bg-[#1a162b] border border-[#2e284a] flex flex-col justify-between cursor-pointer hover:bg-[#25203d] transition-all p-0.5 select-none overflow-hidden group rounded-sm shadow-sm ${
        propertyState?.isMortgaged ? 'opacity-60 grayscale-[50%]' : ''
      }`}
      style={{
        boxShadow: owner ? `inset 0 0 0 1.5px ${owner.color}` : undefined,
      }}
      title={`${space.name} - Price: ${space.price || space.taxAmount || ''}`}
    >
      {/* 1. TOP/BOTTOM SIDES: Color Bar with Price Inside */}
      {isProperty && (side === 'BOTTOM' || side === 'TOP') && (
        <div
          className="h-3.5 sm:h-4 w-full rounded-[2px] flex items-center justify-between px-1 shadow-sm overflow-hidden font-mono"
          style={{ backgroundColor: space.colorHex || '#475569' }}
        >
          {/* Price inside color box */}
          <span
            className="text-[8px] sm:text-[9px] font-black tracking-tight"
            style={{
              color: '#000000',
              textShadow: '0 0 2px #ffffff, 0 0 4px #ffffff',
            }}
          >
            {space.price}
          </span>

          {/* Building indicator */}
          {propertyState?.hasHotel ? (
            <span className="text-[8px] font-black text-red-100 animate-pulse">🏨</span>
          ) : propertyState?.houses ? (
            <span className="text-[7px] font-black text-emerald-100">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* 2. LEFT/RIGHT SIDES: Color Bar with Price on vertical edge */}
      {isProperty && (side === 'LEFT' || side === 'RIGHT') && (
        <div
          className={`h-full w-3 sm:w-4 absolute top-0 ${side === 'LEFT' ? 'right-0' : 'left-0'} flex flex-col items-center justify-between py-0.5 shadow-sm z-10 font-mono`}
          style={{ backgroundColor: space.colorHex || '#475569' }}
        >
          <span
            className="text-[7px] sm:text-[8px] font-black tracking-tighter"
            style={{
              color: '#000000',
              textShadow: '0 0 2px #ffffff, 0 0 4px #ffffff',
            }}
          >
            {space.price}
          </span>

          {propertyState?.hasHotel ? (
            <span className="text-[7px] font-black text-red-100">🏨</span>
          ) : propertyState?.houses ? (
            <span className="text-[6px] font-black text-emerald-100">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* 3. Main Name Zone */}
      <div
        className={`flex flex-col items-center justify-center flex-1 text-center py-0.5 z-10 leading-tight ${
          isProperty && (side === 'LEFT' ? 'pr-3.5 sm:pr-4' : side === 'RIGHT' ? 'pl-3.5 sm:pl-4' : '')
        }`}
      >
        <span className="text-[7.5px] sm:text-[9px] md:text-[10px] font-extrabold leading-tight line-clamp-2 text-slate-100 group-hover:text-amber-300 transition-colors">
          {space.name}
        </span>

        {/* Icon for non-property tiles */}
        {(isTransport || isUtility || isCard || isTax) && (
          <div className="flex flex-col items-center mt-0.5">
            <span className="text-[11px] sm:text-xs">
              {space.icon || (isTransport ? '🚂' : isUtility ? '⚡' : isCard ? '🃏' : '📋')}
            </span>
            {space.price && (
              <span className="text-[7px] sm:text-[8px] font-mono font-bold text-emerald-400">
                {space.price}
              </span>
            )}
            {space.taxAmount && (
              <span className="text-[7px] sm:text-[8px] font-mono font-bold text-red-400">
                {space.taxAmount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Owner Color Strip */}
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
