import React from 'react';
import { BoardSpace, PropertyState, Player, CITY_GROUP_COLORS } from '../../types';
import { TokenPiece } from './TokenPiece';

interface PoorupPropertyTileProps {
  space: BoardSpace;
  propertyState?: PropertyState;
  owner?: Player;
  playersHere: Player[];
  currentPlayerId?: string;
  side: 'BOTTOM' | 'LEFT' | 'TOP' | 'RIGHT';
  onClick: (spaceIndex: number) => void;
}

export const PoorupPropertyTile: React.FC<PoorupPropertyTileProps> = ({
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

  const cityInfo = space.cityGroup ? CITY_GROUP_COLORS[space.cityGroup] : null;

  // TOP & BOTTOM sides: tall tile (flex-col)
  // LEFT & RIGHT sides: wide tile (flex-row)
  const isHorizontalSide = side === 'TOP' || side === 'BOTTOM';

  return (
    <div
      onClick={() => onClick(space.index)}
      className={`relative w-full h-full bg-[#18132e] hover:bg-[#261f47] border border-[#362b61] flex cursor-pointer transition-colors select-none overflow-hidden group shadow-sm ${
        isHorizontalSide ? 'flex-col justify-between' : 'flex-row justify-between'
      } ${propertyState?.isMortgaged ? 'opacity-50 grayscale' : ''}`}
      style={{
        boxShadow: owner ? `inset 0 0 0 2px ${owner.color}` : undefined,
      }}
      title={`${space.name} - Price: ${space.price || space.taxAmount || ''}`}
    >
      {/* 1. PROPERTY COLOR HEADER BAND (POORUP FORMAT) WITH CITY ICON & PRICE */}
      {isProperty && (
        <div
          className={`relative flex items-center justify-between px-0.5 sm:px-1 shrink-0 ${
            side === 'TOP'
              ? 'order-last h-[25%] w-full border-t border-black/20'
              : side === 'BOTTOM'
              ? 'order-first h-[25%] w-full border-b border-black/20'
              : side === 'LEFT'
              ? 'order-last w-[25%] h-full flex-col py-0.5 border-l border-black/20'
              : 'order-first w-[25%] h-full flex-col py-0.5 border-r border-black/20'
          }`}
          style={{ backgroundColor: space.colorHex || '#6366f1' }}
        >
          {/* Pakistani City Icon */}
          {cityInfo && (
            <span className="text-[8px] sm:text-[9.5px] leading-none filter drop-shadow">
              {cityInfo.icon}
            </span>
          )}

          {/* Bold Price Pill Inside Color Band */}
          <span
            className={`text-[7px] sm:text-[8px] font-black font-mono text-black bg-white/95 px-0.5 rounded shadow-sm leading-none ${
              !isHorizontalSide ? '[writing-mode:vertical-rl] rotate-180' : ''
            }`}
          >
            {space.price}
          </span>

          {/* Building Count Indicators (Houses / Hotel) */}
          {propertyState?.hasHotel ? (
            <span className="text-[8px] font-black text-red-100 animate-pulse">🏨</span>
          ) : propertyState?.houses ? (
            <span className="text-[6.5px] font-black text-emerald-100 tracking-tighter">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* 2. BODY CONTENT (NAME + SPECIAL ICONS & PRICES) */}
      <div
        className={`flex-1 flex flex-col items-center justify-center p-0.5 text-center overflow-hidden z-10 ${
          !isHorizontalSide ? 'w-[75%] h-full' : 'h-[75%] w-full'
        }`}
      >
        {/* Special space icons (Railways, Utilities, Cards, Taxes) */}
        {!isProperty && (
          <div className="text-[10px] sm:text-xs leading-none filter drop-shadow mb-0.5">
            {space.icon || (isTransport ? '🚂' : isUtility ? '⚡' : isCard ? '🃏' : '📋')}
          </div>
        )}

        {/* Property / Space Name */}
        <span
          className={`font-black tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors leading-[1.1] text-center ${
            !isHorizontalSide
              ? 'text-[6.5px] sm:text-[7.5px] md:text-[8.5px] line-clamp-2 px-0.5'
              : 'text-[6.5px] sm:text-[7.5px] md:text-[8.5px] line-clamp-2 px-0.5'
          }`}
        >
          {space.name}
        </span>

        {/* Non-property Price / Tax Tag */}
        {!isProperty && space.price && (
          <span className="text-[6.5px] sm:text-[7.5px] font-black font-mono text-emerald-400 bg-black/60 px-1 py-0.2 rounded mt-0.5 leading-none">
            {space.price}
          </span>
        )}
        {!isProperty && space.taxAmount && (
          <span className="text-[6.5px] sm:text-[7.5px] font-black font-mono text-red-400 bg-black/60 px-1 py-0.2 rounded mt-0.5 leading-none">
            {space.taxAmount}
          </span>
        )}
      </div>

      {/* 3. OWNER INDICATOR STRIP */}
      {owner && (
        <div
          className={`absolute z-20 ${
            isHorizontalSide
              ? side === 'BOTTOM'
                ? 'bottom-0 inset-x-0 h-1'
                : 'top-0 inset-x-0 h-1'
              : side === 'LEFT'
              ? 'left-0 inset-y-0 w-1'
              : 'right-0 inset-y-0 w-1'
          }`}
          style={{ backgroundColor: owner.color || '#22c55e' }}
          title={`Owned by ${owner.name}`}
        />
      )}

      {/* 4. MORTGAGE BANNER */}
      {propertyState?.isMortgaged && (
        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-[0.5px] flex items-center justify-center z-30">
          <span className="text-[6px] sm:text-[7px] font-black text-red-300 uppercase tracking-wider border border-red-500/80 px-1 py-0.5 rounded bg-black/80 rotate-[-15deg]">
            MORTGAGED
          </span>
        </div>
      )}

      {/* 5. PLAYER TOKENS ON THIS TILE */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-40 bg-black/25 backdrop-blur-[0.5px]">
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
