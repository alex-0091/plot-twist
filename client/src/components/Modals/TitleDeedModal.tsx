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

// City monument icons/vectors
const CITY_MONUMENT_ICONS: Record<string, string> = {
  ISLAMABAD: '🏛️', // Faisal Mosque / Centaurus
  KARACHI: '🏛️', // Mazar-e-Quaid
  LAHORE: '🕌', // Minar-e-Pakistan / Badshahi Mosque
  PESHAWAR: '⛩️', // Bab-e-Khyber
  RAWALPINDI: '🏰', // Liaquat Bagh / Fort
  MULTAN: '🕌', // Tomb of Rukn-e-Alam
  FAISALABAD: '🕰️', // Ghanta Ghar / Clock Tower
  MURREE: '🌲', // Pine Hills & Mall Road
};

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

  let ownsFullSet = false;
  if (space.cityGroup && owner) {
    const group = CITY_GROUP_MEMBERS[space.cityGroup];
    ownsFullSet = group.every((idx) => owner.properties.includes(idx));
  }

  const unmortgageCost = propState?.isMortgaged
    ? Math.floor((space.mortgageValue || 50) * (1 + gameState.settings.mortgageInterest))
    : 0;

  const cityInfo = space.cityGroup ? CITY_GROUP_COLORS[space.cityGroup] : null;
  const monumentIcon = space.cityGroup ? CITY_MONUMENT_ICONS[space.cityGroup] || '🏛️' : '🏢';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-[#1c182c] border border-[#2e284a] rounded-3xl max-w-xs sm:max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Top Header Banner with Monument */}
        <div
          className="p-3.5 sm:p-4 text-center text-white shadow-md relative"
          style={{ backgroundColor: space.colorHex || '#7053ff' }}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
          >
            ✕
          </button>

          {/* Monument Silhouette Box */}
          <div className="w-10 h-10 mx-auto rounded-xl bg-black/40 border border-white/30 flex items-center justify-center text-2xl shadow-inner mb-1">
            {monumentIcon}
          </div>

          <span className="text-[9px] font-black tracking-widest uppercase opacity-90 block">
            TITLE DEED
          </span>
          <h2 className="text-lg sm:text-xl font-black drop-shadow">{space.name}</h2>
          {cityInfo && (
            <span className="text-[9px] bg-black/40 px-2 py-0.5 rounded-full font-bold inline-block mt-0.5">
              {cityInfo.name} • {cityInfo.monument}
            </span>
          )}
        </div>

        {/* Body Content */}
        <div className="p-3.5 space-y-2.5 text-xs">
          {/* Owner Status */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#130f1d] border border-[#2e284a]">
            <span className="text-slate-400 font-semibold text-[11px]">Owner:</span>
            {owner ? (
              <span className="font-extrabold flex items-center gap-1.5 text-xs" style={{ color: owner.color }}>
                <span>{owner.tokenEmoji}</span>
                <span>{owner.name} {isOwner ? '(You)' : ''}</span>
              </span>
            ) : (
              <span className="text-[#81be97] font-bold text-xs">Bank (Unowned)</span>
            )}
          </div>

          {/* Rent Table */}
          {space.type === 'PROPERTY' && (
            <div className="space-y-1 border-t border-b border-[#2e284a] py-2 font-mono text-[11px]">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Base Rent:</span>
                <span className="text-[#81be97]">{space.rent}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>With Full City Set:</span>
                <span className="font-bold text-[#81be97]">{space.rentWithSet}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 1 House:</span>
                <span className="text-slate-200">{space.rentWith1House}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 2 Houses:</span>
                <span className="text-slate-200">{space.rentWith2Houses}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 3 Houses:</span>
                <span className="text-slate-200">{space.rentWith3Houses}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>With 4 Houses:</span>
                <span className="text-slate-200">{space.rentWith4Houses}</span>
              </div>
              <div className="flex justify-between font-bold text-red-400">
                <span>With Hotel:</span>
                <span>{space.rentWithHotel}</span>
              </div>
            </div>
          )}

          {/* Costs & Mortgage Info */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-[#130f1d] p-2 rounded-xl border border-[#2e284a]">
            <div>
              <span className="text-slate-400 block font-sans">House Cost:</span>
              <strong className="text-slate-200">{space.houseCost || 50}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Hotel Cost:</span>
              <strong className="text-slate-200">{space.hotelCost || 100}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Mortgage:</span>
              <strong className="text-amber-400">+{space.mortgageValue || 50}</strong>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Unmortgage:</span>
              <strong className="text-emerald-400">-{Math.floor((space.mortgageValue || 50) * 1.1)}</strong>
            </div>
          </div>

          {/* Actions for Owner */}
          {isOwner && myPlayer && !myPlayer.isBankrupt && (
            <div className="pt-1 flex flex-col gap-1.5">
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
                  className="w-full py-2 bg-[#81be97] hover:bg-[#6eab84] disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow transition-transform hover:scale-105"
                >
                  {propState?.houses === 4
                    ? `Build Hotel (${space.hotelCost || 100})`
                    : `Build House #${(propState?.houses || 0) + 1} (${space.houseCost || 50})`}
                </button>
              )}

              {propState?.isMortgaged ? (
                <button
                  onClick={() => {
                    onUnmortgage(space.index);
                    onClose();
                  }}
                  disabled={myPlayer.cash < unmortgageCost}
                  className="w-full py-2 bg-[#7053ff] hover:bg-[#6244f5] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow"
                >
                  Lift Mortgage ({unmortgageCost})
                </button>
              ) : (
                <button
                  onClick={() => {
                    onMortgage(space.index);
                    onClose();
                  }}
                  disabled={(propState?.houses || 0) > 0 || propState?.hasHotel}
                  className="w-full py-1.5 bg-[#2e1818] hover:bg-[#4a2626] disabled:opacity-40 text-red-300 font-bold text-xs rounded-xl border border-red-800"
                >
                  Mortgage Property (+{space.mortgageValue || 50})
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
