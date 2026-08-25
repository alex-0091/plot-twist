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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#1c182c] border border-[#2e284a] rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header Card Banner */}
        <div
          className="p-4 text-center text-white shadow-md relative"
          style={{ backgroundColor: space.colorHex || '#7053ff' }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold"
          >
            ✕
          </button>
          <span className="text-[10px] font-black tracking-widest uppercase opacity-90 block">
            TITLE DEED • ملکیت نامہ
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
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#130f1d] border border-[#2e284a]">
            <span className="text-slate-400 font-semibold">Owner:</span>
            {owner ? (
              <span className="font-extrabold flex items-center gap-1.5" style={{ color: owner.color }}>
                <span>{owner.tokenEmoji}</span>
                <span>{owner.name} {isOwner ? '(You)' : ''}</span>
              </span>
            ) : (
              <span className="text-[#81be97] font-extrabold">Unowned (Bank)</span>
            )}
          </div>

          {/* Property Rent Table */}
          {space.type === 'PROPERTY' && (
            <div className="space-y-1.5 border-t border-b border-[#2e284a] py-2.5 font-mono">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Base Rent:</span>
                <span className="text-[#81be97]">Rs {space.rent}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Rent with Full City Set:</span>
                <span className="font-bold text-[#81be97]">Rs {space.rentWithSet}</span>
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
              <div className="flex justify-between font-bold text-red-400">
                <span>With Luxury Hotel:</span>
                <span>Rs {space.rentWithHotel}</span>
              </div>
            </div>
          )}

          {/* Costs & Values */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#130f1d] p-2.5 rounded-xl border border-[#2e284a]">
            <div>
              <span className="text-slate-400 block">House Cost:</span>
              <strong className="text-slate-200">Rs {space.houseCost || 50}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Hotel Cost:</span>
              <strong className="text-slate-200">Rs {space.hotelCost || 100}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Mortgage Value:</span>
              <strong className="text-amber-400">Rs {space.mortgageValue || 50}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Unmortgage (+10%):</span>
              <strong className="text-emerald-400">Rs {Math.floor((space.mortgageValue || 50) * 1.1)}</strong>
            </div>
          </div>

          {/* Current Buildings State */}
          {propState && (
            <div className="flex items-center justify-between text-xs px-1 text-slate-300">
              <span>Current Status:</span>
              {propState.isMortgaged ? (
                <span className="text-red-400 font-bold">📄 Mortgaged</span>
              ) : propState.hasHotel ? (
                <span className="text-red-400 font-bold">🏨 Luxury Hotel</span>
              ) : propState.houses > 0 ? (
                <span className="text-[#81be97] font-bold">🏡 {propState.houses} Houses</span>
              ) : (
                <span className="text-slate-400">Vacant Land</span>
              )}
            </div>
          )}

          {/* Action Buttons for Owner */}
          {isOwner && myPlayer && !myPlayer.isBankrupt && (
            <div className="pt-2 flex flex-col gap-2">
              {/* Build Button */}
              {ownsFullSet && !propState?.isMortgaged && !propState?.hasHotel && (
                <button
                  onClick={() => {
                    onBuildHouse(space.index);
                    onClose();
                  }}
                  disabled={
                    (propState?.houses === 4 && myPlayer.cash < (space.hotelCost || 100)) ||
                    (propState?.houses !== 4 && myPlayer.cash < (space.houseCost || 50))
                  }
                  className="w-full py-2.5 bg-[#81be97] hover:bg-[#6eab84] disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow transition-transform hover:scale-105"
                >
                  {propState?.houses === 4
                    ? `🏨 Build Luxury Hotel (Rs ${space.hotelCost || 100})`
                    : `🏡 Build House #${(propState?.houses || 0) + 1} (Rs ${space.houseCost || 50})`}
                </button>
              )}

              {/* Mortgage / Unmortgage Button */}
              {propState?.isMortgaged ? (
                <button
                  onClick={() => {
                    onUnmortgage(space.index);
                    onClose();
                  }}
                  disabled={myPlayer.cash < unmortgageCost}
                  className="w-full py-2 bg-[#7053ff] hover:bg-[#6244f5] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow transition-transform hover:scale-105"
                >
                  Lift Mortgage (Pay Rs {unmortgageCost})
                </button>
              ) : (
                <button
                  onClick={() => {
                    onMortgage(space.index);
                    onClose();
                  }}
                  disabled={(propState?.houses || 0) > 0 || propState?.hasHotel}
                  className="w-full py-2 bg-[#2e1818] hover:bg-[#4a2626] disabled:opacity-40 text-red-300 font-bold text-xs rounded-xl border border-red-800 transition-transform hover:scale-105"
                >
                  Mortgage Property (Get Rs {space.mortgageValue || 50})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
