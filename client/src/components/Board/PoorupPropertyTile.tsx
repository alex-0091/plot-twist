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

  // TOP & BOTTOM sides: tall tile (flex flex-col)
  // LEFT & RIGHT sides: wide tile (flex flex-row)
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
      {/* 1. PROPERTY COLOR HEADER BAND (POORUP FORMAT) */}
      {isProperty && (
        <div
          className={`relative flex items-center justify-between px-1 shrink-0 ${
            side === 'TOP'
              ? 'order-last h-[24%] w-full border-t border-black/20'
              : side === 'BOTTOM'
              ? 'order-first h-[24%] w-full border-b border-black/20'
              : side === 'LEFT'
              ? 'order-last w-[24%] h-full flex-col py-1 border-l border-black/20'
              : 'order-first w-[24%] h-full flex-col py-1 border-r border-black/20'
          }`}
          style={{ backgroundColor: space.colorHex || '#6366f1' }}
        >
          {/* Pakistani City Icon */}
          {cityInfo && (
            <span className="text-[9px] sm:text-[10px] leading-none filter drop-shadow">
              {cityInfo.icon}
            </span>
          )}

          {/* Building Count Indicators (Houses / Hotel) */}
          {propertyState?.hasHotel ? (
            <span className="text-[8.5px] font-black text-red-100 animate-pulse">🏨</span>
          ) : propertyState?.houses ? (
            <span className="text-[7px] font-black text-emerald-100 tracking-tighter">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* 2. BODY CONTENT (NAME + PRICE + SPECIAL ICONS) */}
      <div
        className={`flex-1 flex flex-col items-center justify-between p-0.5 text-center overflow-hidden z-10 ${
          !isHorizontalSide ? 'w-[76%] justify-center' : 'h-[76%]'
        }`}
      >
        {/* Special space icons (Railways, Utilities, Cards, Taxes) */}
        {!isProperty && (
          <div className="text-[11px] sm:text-xs my-auto leading-none filter drop-shadow">
            {space.icon || (isTransport ? '🚂' : isUtility ? '⚡' : isCard ? '🃏' : '📋')}
          </div>
        )}

        {/* Property / Space Name (Reduced by 1px font size) */}
        <div className="w-full my-auto flex items-center justify-center">
          <span
            className={`font-black tracking-tight text-slate-100 group-hover:text-amber-300 transition-colors leading-tight text-center ${
              !isHorizontalSide
                ? 'text-[7px] sm:text-[8px] md:text-[8.5px] line-clamp-2 px-0.5'
                : 'text-[7px] sm:text-[8px] md:text-[8.5px] line-clamp-2 px-0.5'
            }`}
          >
            {space.name}
          </span>
        </div>

        {/* Clean Numeric Price Tag */}
        {space.price ? (
          <div className="mt-auto">
            <span className="text-[7px] sm:text-[8px] font-black font-mono text-emerald-400 bg-black/50 px-1 py-0.2 rounded leading-none inline-block">
              {space.price}
            </span>
          </div>
        ) : space.taxAmount ? (
          <div className="mt-auto">
            <span className="text-[7px] sm:text-[8px] font-black font-mono text-red-400 bg-black/50 px-1 py-0.2 rounded leading-none inline-block">
              {space.taxAmount}
            </span>
          </div>
        ) : null}
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
