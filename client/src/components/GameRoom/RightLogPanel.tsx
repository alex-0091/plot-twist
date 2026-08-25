import React, { useRef, useEffect } from 'react';
import { GameState, Player, BOARD_SPACES, CITY_GROUP_COLORS, CITY_GROUP_MEMBERS } from '../../types';

interface RightLogPanelProps {
  gameState: GameState;
  myPlayer: Player | null;
  selectedPropertyIndex: number | null;
  onSelectProperty: (spaceIndex: number | null) => void;
  onBuildHouse: (spaceIndex: number) => void;
  onMortgage: (spaceIndex: number) => void;
  onUnmortgage: (spaceIndex: number) => void;
  onOpenTrade: () => void;
}

export const RightLogPanel: React.FC<RightLogPanelProps> = ({
  gameState,
  myPlayer,
  selectedPropertyIndex,
  onSelectProperty,
  onBuildHouse,
  onMortgage,
  onUnmortgage,
  onOpenTrade,
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.logs]);

  // Selected space for inspector
  const inspectedSpace = selectedPropertyIndex !== null ? BOARD_SPACES[selectedPropertyIndex] : null;
  const inspectedState = selectedPropertyIndex !== null ? gameState.properties[selectedPropertyIndex] : null;
  const inspectedOwner = inspectedState?.ownerId
    ? gameState.players.find((p) => p.id === inspectedState.ownerId)
    : null;
  const isMyProp = Boolean(myPlayer && inspectedState?.ownerId === myPlayer.id);

  let ownsFullSet = false;
  if (inspectedSpace?.cityGroup && inspectedOwner) {
    const group = CITY_GROUP_MEMBERS[inspectedSpace.cityGroup];
    ownsFullSet = group.every((idx) => inspectedOwner.properties.includes(idx));
  }

  const unmortgageCost = inspectedState?.isMortgaged
    ? Math.floor((inspectedSpace?.mortgageValue || 50) * (1 + gameState.settings.mortgageInterest))
    : 0;

  const cityInfo = inspectedSpace?.cityGroup ? CITY_GROUP_COLORS[inspectedSpace.cityGroup] : null;

  return (
    <aside className="w-full h-full flex flex-col bg-[#171329] border border-[#2e264f] rounded-2xl shadow-xl overflow-hidden select-none">
      {/* 1. PROPERTY QUICK INSPECTOR */}
      {inspectedSpace ? (
        <div className="p-3 bg-[#120e22] border-b border-[#2e264f] flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {cityInfo && (
                <span className="text-base filter drop-shadow">{cityInfo.icon}</span>
              )}
              <div>
                <span className="font-black text-xs text-white block leading-tight">
                  {inspectedSpace.name}
                </span>
                {cityInfo && (
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {cityInfo.name} • {cityInfo.monument}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => onSelectProperty(null)}
              className="text-slate-400 hover:text-white bg-[#171329] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-[#2e264f]"
            >
              ✕
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-[#171329] p-2 rounded-xl border border-[#2e264f]">
            <div>
              <span className="text-slate-400 block font-sans">Owner:</span>
              <strong className="text-slate-200">
                {inspectedOwner ? inspectedOwner.name : 'Bank'}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block font-sans">Rent:</span>
              <strong className="text-[#81be97]">{inspectedSpace.rent || 0}</strong>
            </div>
            {inspectedSpace.houseCost && (
              <div>
                <span className="text-slate-400 block font-sans">House Cost:</span>
                <strong className="text-slate-200">{inspectedSpace.houseCost}</strong>
              </div>
            )}
            {inspectedSpace.mortgageValue && (
              <div>
                <span className="text-slate-400 block font-sans">Mortgage:</span>
                <strong className="text-amber-400">+{inspectedSpace.mortgageValue}</strong>
              </div>
            )}
          </div>

          {/* Owner Actions */}
          {isMyProp && myPlayer && !myPlayer.isBankrupt && (
            <div className="flex gap-1.5">
              {ownsFullSet && !inspectedState?.isMortgaged && !inspectedState?.hasHotel && (
                <button
                  type="button"
                  onClick={() => onBuildHouse(inspectedSpace.index)}
                  disabled={myPlayer.cash < (inspectedSpace.houseCost || 50)}
                  className="flex-1 py-1.5 bg-[#81be97] hover:bg-[#6eab84] disabled:opacity-40 text-slate-950 font-black text-[10px] rounded-lg shadow"
                >
                  {inspectedState?.houses === 4 ? 'Build Hotel' : '+ Build House'}
                </button>
              )}

              {inspectedState?.isMortgaged ? (
                <button
                  type="button"
                  onClick={() => onUnmortgage(inspectedSpace.index)}
                  disabled={myPlayer.cash < unmortgageCost}
                  className="flex-1 py-1.5 bg-[#7053ff] hover:bg-[#6244f5] disabled:opacity-40 text-white font-bold text-[10px] rounded-lg shadow"
                >
                  Lift ({unmortgageCost})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onMortgage(inspectedSpace.index)}
                  disabled={(inspectedState?.houses || 0) > 0 || inspectedState?.hasHotel}
                  className="flex-1 py-1 bg-[#2b1928] hover:bg-[#3d2439] disabled:opacity-40 text-red-300 font-bold text-[10px] rounded-lg border border-red-900/60"
                >
                  Mortgage (+{inspectedSpace.mortgageValue || 50})
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Default Action Card when no plot is selected */
        <div className="p-3 bg-[#120e22] border-b border-[#2e264f] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤝</span>
            <div>
              <span className="font-bold text-xs text-white block">Plot Trade Hub</span>
              <span className="text-[9.5px] text-slate-400">Trade properties & cash</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenTrade}
            className="px-3 py-1.5 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-xs rounded-xl shadow transition-transform hover:scale-105"
          >
            Trade »
          </button>
        </div>
      )}

      {/* 2. ACTIVITY LOG HEADER */}
      <div className="px-3.5 py-2 border-b border-[#2e264f] bg-[#120e22] flex items-center justify-between">
        <span className="font-extrabold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span>📜</span>
          <span>Game Activity</span>
        </span>
        <span className="text-[9px] text-slate-500 font-mono">Live</span>
      </div>

      {/* 3. ACTIVITY LOG FEED */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 font-mono text-[10.5px]">
        {gameState.logs.map((log) => (
          <div
            key={log.id}
            className={`p-1.5 rounded-lg border leading-tight ${
              log.type === 'ROLL'
                ? 'bg-[#120e22] border-[#2e264f] text-slate-300'
                : log.type === 'BUY'
                ? 'bg-[#13271f] border-[#1d4d38] text-emerald-300'
                : log.type === 'RENT'
                ? 'bg-[#292316] border-[#4f401d] text-amber-300'
                : log.type === 'CARD'
                ? 'bg-[#241d3b] border-[#3b3260] text-[#d49cff]'
                : log.type === 'JAIL'
                ? 'bg-[#2b181b] border-[#4f2329] text-red-300'
                : log.type === 'BANKRUPT'
                ? 'bg-red-950/80 border-red-500 text-white font-black'
                : 'bg-[#120e22] border-[#2e264f] text-slate-300'
            }`}
          >
            <span>{log.text}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </aside>
  );
};
