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
      className={`relative bg-slate-900/95 border border-slate-800/80 flex flex-col justify-between cursor-pointer hover:bg-slate-800 transition-all p-0.5 sm:p-1 select-none overflow-hidden group rounded-sm shadow-sm ${
        propertyState?.isMortgaged ? 'opacity-65 grayscale-[60%]' : ''
      }`}
      style={{
        boxShadow: owner ? `inset 0 0 0 1.5px ${owner.color}` : undefined,
      }}
      title={`${space.name} - Click for Title Deed`}
    >
      {/* Top Bar for Color Group (Bottom & Top sides) */}
      {isProperty && (side === 'BOTTOM' || side === 'TOP') && (
        <div
          className="h-3 sm:h-4 w-full rounded-[2px] flex items-center justify-center font-black text-[8px] sm:text-[9px] text-white shadow-sm overflow-hidden"
          style={{ backgroundColor: space.colorHex || '#475569' }}
        >
          {propertyState?.hasHotel ? (
            <span className="text-[8px] sm:text-[10px] text-red-100 font-extrabold animate-pulse">🏨 HOTEL</span>
          ) : propertyState?.houses ? (
            <span className="text-[8px] sm:text-[9px] font-black text-emerald-100 tracking-wider">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* Side Bar for Color Group (Left & Right sides) */}
      {isProperty && (side === 'LEFT' || side === 'RIGHT') && (
        <div
          className={`h-full w-2.5 sm:w-3.5 absolute top-0 ${side === 'LEFT' ? 'right-0' : 'left-0'} flex flex-col items-center justify-center shadow-sm z-10`}
          style={{ backgroundColor: space.colorHex || '#475569' }}
        >
          {propertyState?.hasHotel ? (
            <span className="text-[8px] sm:text-[9px] font-bold text-red-100">🏨</span>
          ) : propertyState?.houses ? (
            <span className="text-[7px] sm:text-[8px] font-bold text-emerald-100">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* Main Content Info */}
      <div
        className={`flex flex-col items-center justify-center flex-1 text-center py-0.5 z-10 leading-tight ${
          isProperty && (side === 'LEFT' ? 'pr-2 sm:pr-3' : side === 'RIGHT' ? 'pl-2 sm:pl-3' : '')
        }`}
      >
        {/* Urdu Name Subtitle */}
        {space.urduName && (
          <span className="text-[7px] sm:text-[8px] text-emerald-400 font-urdu leading-none truncate max-w-full opacity-75 hidden sm:block">
            {space.urduName}
          </span>
        )}

        {/* English Name */}
        <span className="text-[8px] sm:text-[10px] md:text-[11px] font-extrabold leading-tight line-clamp-2 text-slate-100 group-hover:text-amber-300 transition-colors">
          {space.name}
        </span>

        {/* Icon for special tiles */}
        {(isTransport || isUtility || isCard || isTax) && (
          <span className="text-xs sm:text-sm my-0.5 filter drop-shadow">
            {space.icon || (isTransport ? '🚂' : isUtility ? '⚡' : isCard ? '🃏' : '📋')}
          </span>
        )}

        {/* Price / Tax display */}
        {space.price && (
          <span className="text-[8px] sm:text-[9px] font-black text-emerald-400 mt-0.5">
            Rs {space.price}
          </span>
        )}
        {space.taxAmount && (
          <span className="text-[7px] sm:text-[8px] font-black text-red-400 mt-0.5">
            Pay Rs {space.taxAmount}
          </span>
        )}
      </div>

      {/* Owner Badge Pill */}
      {owner && (
        <div
          className="absolute bottom-0 inset-x-0 h-1 sm:h-1.5 z-20"
          style={{ backgroundColor: owner.color || '#22c55e' }}
          title={`Owned by ${owner.name}`}
        />
      )}

      {/* Mortgaged Stamp Banner */}
      {propertyState?.isMortgaged && (
        <div className="absolute inset-0 bg-red-950/85 flex items-center justify-center z-20 rotate-[-12deg]">
          <span className="text-[7px] sm:text-[8px] font-black text-red-200 uppercase tracking-widest border border-red-500 px-1 rounded bg-black/70">
            MORTGAGED
          </span>
        </div>
      )}

      {/* Tokens Container */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-0.5 flex-wrap p-0.5 z-30 bg-black/25 backdrop-blur-[0.5px]">
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
