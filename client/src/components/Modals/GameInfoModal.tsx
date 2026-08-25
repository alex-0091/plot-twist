import React from 'react';
import { GameSettings } from '../../types';

interface GameInfoModalProps {
  isOpen: boolean;
  settings: GameSettings;
  roomCode: string;
  roomName: string;
  onClose: () => void;
}

export const GameInfoModal: React.FC<GameInfoModalProps> = ({
  isOpen,
  settings,
  roomCode,
  roomName,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#1c182c] border border-[#2e284a] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#130f1d] p-4 border-b border-[#2e284a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">MATCH RULES</h2>
              <p className="text-xs text-[#b1b2f2]">
                {roomName} • <span className="font-mono font-bold text-amber-300">{roomCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-[#1c182c] rounded-full w-7 h-7 flex items-center justify-center font-bold border border-[#2e284a] text-xs"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* Economy */}
          <div className="bg-[#130f1d] p-3 rounded-xl border border-[#2e284a] space-y-1.5 font-mono">
            <h3 className="font-extrabold text-amber-400 text-[11px] uppercase tracking-wider font-sans">
              💰 Economy & Salary
            </h3>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Starting Cash:</span>
              <span className="font-bold text-emerald-400">{settings.startingMoney.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="font-sans">Passing Start:</span>
              <span className="font-bold text-emerald-400">+{settings.salaryOnStart}</span>
            </div>
          </div>

          {/* Property & Building */}
          <div className="bg-[#130f1d] p-3 rounded-xl border border-[#2e284a] space-y-1.5">
            <h3 className="font-extrabold text-emerald-400 text-[11px] uppercase tracking-wider">
              🏢 Property & Building
            </h3>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="font-sans">Auctions on Decline:</span>
              <span className={`font-bold ${settings.auctionsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {settings.auctionsEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="font-sans">Even Building Rule:</span>
              <span className="font-bold text-slate-200">
                {settings.evenBuild ? 'Equal Distribution' : 'Free Build'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="font-sans">Mortgages:</span>
              <span className="font-bold text-slate-200">
                {settings.mortgagesEnabled ? `ON (${Math.round(settings.mortgageInterest * 100)}% Fee)` : 'OFF'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="font-sans">Supply:</span>
              <span className="font-bold text-amber-300">
                {settings.housesAvailable} Houses / {settings.hotelsAvailable} Hotels
              </span>
            </div>
          </div>

          {/* Jail & Free Parking */}
          <div className="bg-[#130f1d] p-3 rounded-xl border border-[#2e284a] space-y-1.5">
            <h3 className="font-extrabold text-purple-400 text-[11px] uppercase tracking-wider">
              🚔 Jail & Free Parking
            </h3>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="font-sans">Max Turns in Jail:</span>
              <span className="font-bold text-slate-200">{settings.maxJailTurns} turns</span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="font-sans">Jail Bail:</span>
              <span className="font-bold text-amber-400">{settings.jailBail}</span>
            </div>
            <div className="flex justify-between text-slate-300 font-mono">
              <span className="font-sans">Free Parking:</span>
              <span className="font-bold text-purple-300">
                {settings.freeParkingMode === 'POT'
                  ? 'Jackpot Pot'
                  : settings.freeParkingMode === 'FIXED'
                  ? `Fixed ${settings.freeParkingAmount}`
                  : 'Rest Only'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#130f1d] border-t border-[#2e284a] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#7053ff] hover:bg-[#6244f5] text-white font-bold text-xs rounded-xl shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
