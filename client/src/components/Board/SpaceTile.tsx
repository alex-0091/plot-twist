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
      className={`relative bg-slate-900 border border-slate-800 flex flex-col justify-between cursor-pointer hover:bg-slate-800 transition-colors p-1 select-none overflow-hidden group ${
        propertyState?.isMortgaged ? 'opacity-70 grayscale-[50%]' : ''
      }`}
      title={`${space.name} - Click for details`}
    >
      {/* Top Bar for Color Group (Bottom & Top sides) */}
      {isProperty && (side === 'BOTTOM' || side === 'TOP') && (
        <div
          className={`h-4 w-full rounded-sm flex items-center justify-center font-bold text-[9px] text-white shadow-sm`}
          style={{ backgroundColor: space.colorHex || '#475569' }}
        >
          {/* Houses/Hotels icons */}
          {propertyState?.hasHotel ? (
            <span className="text-[10px] text-red-100 font-extrabold animate-bounce">🏨 HOTEL</span>
          ) : propertyState?.houses ? (
            <span className="text-[9px] font-bold tracking-widest text-emerald-100">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* Side Bar for Color Group (Left & Right sides) */}
      {isProperty && (side === 'LEFT' || side === 'RIGHT') && (
        <div
          className={`h-full w-3.5 absolute top-0 ${side === 'LEFT' ? 'right-0' : 'left-0'} flex flex-col items-center justify-center shadow-sm`}
          style={{ backgroundColor: space.colorHex || '#475569' }}
        >
          {propertyState?.hasHotel ? (
            <span className="text-[9px] font-bold text-red-100">🏨</span>
          ) : propertyState?.houses ? (
            <span className="text-[8px] font-bold text-emerald-100">
              {'🏡'.repeat(propertyState.houses)}
            </span>
          ) : null}
        </div>
      )}

      {/* Main Content Info */}
      <div className={`flex flex-col items-center justify-center flex-1 text-center py-0.5 z-10 ${
        isProperty && (side === 'LEFT' ? 'pr-3' : side === 'RIGHT' ? 'pl-3' : '')
      }`}>
        {/* Urdu Name Subtitle */}
        {space.urduName && (
          <span className="text-[9px] text-emerald-400 font-urdu leading-none truncate max-w-full opacity-80">
            {space.urduName}
          </span>
        )}

        {/* English Name */}
        <span className="text-[10px] sm:text-[11px] font-bold leading-tight line-clamp-2 text-slate-100 group-hover:text-amber-400 transition-colors">
          {space.name}
        </span>

        {/* Icon for special tiles */}
        {(isTransport || isUtility || isCard || isTax) && (
          <span className="text-sm my-0.5 filter drop-shadow">
            {space.icon || (isTransport ? '🚂' : isUtility ? '⚡' : isCard ? '🃏' : '📋')}
          </span>
        )}

        {/* Price / Rent display */}
        {space.price && (
          <span className="text-[9px] font-semibold text-emerald-400 mt-0.5">
            Rs {space.price}
          </span>
        )}
        {space.taxAmount && (
          <span className="text-[9px] font-semibold text-red-400 mt-0.5">
            Pay Rs {space.taxAmount}
          </span>
        )}
      </div>

      {/* Owner Badge */}
      {owner && (
        <div
          className="absolute bottom-0.5 left-0.5 right-0.5 h-1.5 rounded-full z-20"
          style={{ backgroundColor: owner.color || '#22c55e' }}
          title={`Owned by ${owner.name}`}
        />
      )}

      {/* Mortgaged Badge */}
      {propertyState?.isMortgaged && (
        <div className="absolute inset-0 bg-red-950/80 flex items-center justify-center z-20 rotate-[-15deg]">
          <span className="text-[9px] font-extrabold text-red-300 uppercase tracking-widest border border-red-500 px-1 rounded bg-black/60">
            MORTGAGED
          </span>
        </div>
      )}

      {/* Tokens Container */}
      {playersHere.length > 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center gap-0.5 flex-wrap p-1 z-30 bg-black/20 backdrop-blur-[0.5px]">
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
