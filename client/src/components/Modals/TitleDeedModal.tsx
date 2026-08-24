import React from 'react';
import { BoardSpace, PropertyState, Player, GameState, BOARD_SPACES, CITY_GROUP_COLORS, CITY_GROUP_MEMBERS } from '../../types';

interface TitleDeedModalProps {
  spaceIndex: number | null;
  gameState: GameState;
  myPlayerId: string | null;
  onClose: () => void;
  onBuildHouse: (spaceIndex: number) => void;
  onMortgage: (spaceIndex: number) => void;
  onUnmortgage: (spaceIndex: number) => void;
}

export const TitleDeedModal: React.FC<TitleDeedModalProps> = ({
  spaceIndex,
  gameState,
  myPlayerId,
  onClose,
  onBuildHouse,
  onMortgage,
  onUnmortgage,
}) => {
  if (spaceIndex === null) return null;

  const space = BOARD_SPACES[spaceIndex];
  if (!space) return null;

  const propState = gameState.properties[spaceIndex];
  const owner = propState?.ownerId ? gameState.players.find((p) => p.id === propState.ownerId) : null;
  const isOwner = Boolean(myPlayerId && propState?.ownerId === myPlayerId);
  const myPlayer = gameState.players.find((p) => p.id === myPlayerId);

  // Check monopoly full set
  let ownsFullSet = false;
  if (space.cityGroup && owner) {
    const group = CITY_GROUP_MEMBERS[space.cityGroup];
    ownsFullSet = group.every((idx) => owner.properties.includes(idx));
  }

  const unmortgageCost = propState?.isMortgaged
    ? Math.floor((space.mortgageValue || 50) * (1 + gameState.settings.mortgageInterest))
    : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header Card Banner */}
        <div
          className="p-4 text-center text-white shadow-md relative"
          style={{ backgroundColor: space.colorHex || '#065f46' }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
          <span className="text-[10px] font-black tracking-widest uppercase opacity-90 block">
            TITLE DEED / ملکیت نامہ
          </span>
          <h2 className="text-xl font-black mt-0.5 drop-shadow">{space.name}</h2>
          {space.urduName && (
            <p className="text-xs font-urdu opacity-90 mt-0.5">{space.urduName}</p>
          )}
          {space.cityGroup && (
            <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-bold inline-block mt-1">
              {CITY_GROUP_COLORS[space.cityGroup]?.name} Group
            </span>
          )}
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-3 text-xs">
          {/* Ownership Status */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-400 font-medium">Owner:</span>
            {owner ? (
              <span className="font-bold flex items-center gap-1.5" style={{ color: owner.color }}>
                <span>{owner.tokenEmoji}</span>
                <span>{owner.name} {isOwner ? '(You)' : ''}</span>
              </span>
            ) : (
              <span className="text-emerald-400 font-bold">Unowned (Bank)</span>
            )}
          </div>

          {/* Property Rent Table */}
          {space.type === 'PROPERTY' && (
            <div className="space-y-1.5 border-t border-b border-slate-800 py-2">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Base Rent:</span>
                <span className="text-emerald-400">Rs {space.rent}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rent with Full City Set:</span>
                <span className="font-semibold text-emerald-400">Rs {space.rentWithSet}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 1 House:</span>
                <span className="text-slate-200">Rs {space.rentWith1House}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 2 Houses:</span>
                <span className="text-slate-200">Rs {space.rentWith2Houses}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 3 Houses:</span>
                <span className="text-slate-200">Rs {space.rentWith3Houses}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 4 Houses:</span>
                <span className="text-slate-200">Rs {space.rentWith4Houses}</span>
              </div>
              <div className="flex justify-between font-bold text-red-300">
                <span>With Luxury Hotel 🏨:</span>
                <span className="text-red-400 font-black">Rs {space.rentWithHotel}</span>
              </div>
            </div>
          )}

          {/* Transport / Utility Rent rules */}
          {space.type === 'TRANSPORT' && (
            <div className="space-y-1 text-slate-300 border-t border-b border-slate-800 py-2">
              <p>• 1 Station: Rs 25</p>
              <p>• 2 Stations: Rs 50</p>
              <p>• 3 Stations: Rs 100</p>
              <p>• 4 Stations: Rs 200</p>
            </div>
          )}

          {space.type === 'UTILITY' && (
            <div className="space-y-1 text-slate-300 border-t border-b border-slate-800 py-2">
              <p>• If 1 Utility owned: 4 × Dice Roll</p>
              <p>• If Both Utilities owned: 10 × Dice Roll</p>
            </div>
          )}

          {/* Building & Mortgage Costs */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            {space.houseCost && (
              <div>
                <span className="text-slate-400 block">House Cost:</span>
                <span className="font-bold text-amber-400">Rs {space.houseCost} each</span>
              </div>
            )}
            {space.hotelCost && (
              <div>
                <span className="text-slate-400 block">Hotel Cost:</span>
                <span className="font-bold text-red-400">Rs {space.hotelCost} (+4 houses)</span>
              </div>
            )}
            {space.mortgageValue && (
              <div>
                <span className="text-slate-400 block">Mortgage Value:</span>
                <span className="font-bold text-slate-200">Rs {space.mortgageValue}</span>
              </div>
            )}
            {space.price && (
              <div>
                <span className="text-slate-400 block">Purchase Price:</span>
                <span className="font-bold text-emerald-400">Rs {space.price}</span>
              </div>
            )}
          </div>

          {/* Actions if Current Player is Owner */}
          {isOwner && propState && (
            <div className="pt-2 flex flex-col gap-2">
              {/* Build Button */}
              {space.type === 'PROPERTY' && ownsFullSet && !propState.hasHotel && !propState.isMortgaged && (
                <button
                  onClick={() => onBuildHouse(space.index)}
                  className="w-full py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold rounded-lg shadow-md transition-transform hover:scale-[1.02]"
                >
                  {propState.houses === 4
                    ? `🏨 Build Luxury Hotel (Rs ${space.hotelCost})`
                    : `🏡 Build House #${propState.houses + 1} (Rs ${space.houseCost})`}
                </button>
              )}

              {/* Mortgage / Unmortgage Button */}
              {propState.isMortgaged ? (
                <button
                  onClick={() => onUnmortgage(space.index)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-transform hover:scale-[1.02]"
                >
                  📄 Lift Mortgage (Pay Rs {unmortgageCost})
                </button>
              ) : (
                <button
                  onClick={() => onMortgage(space.index)}
                  className="w-full py-2 bg-slate-800 hover:bg-red-950/80 border border-slate-700 text-red-300 font-bold rounded-lg transition-colors"
                >
                  📄 Mortgage Property (Receive Rs {space.mortgageValue})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
