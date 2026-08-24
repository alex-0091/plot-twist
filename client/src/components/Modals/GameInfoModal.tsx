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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 to-slate-950 p-4 border-b border-emerald-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-base font-black text-white">MATCH RULES & INFO</h2>
              <p className="text-xs text-emerald-400">
                {roomName} • <span className="font-mono font-bold text-amber-300">{roomCode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1 text-xs">
          {/* Economy */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-extrabold text-amber-400 text-[11px] uppercase tracking-wider">
              💰 Economy & Passing Start
            </h3>
            <div className="flex justify-between text-slate-300">
              <span>Starting Cash:</span>
              <span className="font-bold text-emerald-400">Rs {settings.startingMoney.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Salary on START (Salary Aa Gayi):</span>
              <span className="font-bold text-emerald-400">+Rs {settings.salaryOnStart}</span>
            </div>
          </div>

          {/* Property & Building */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-extrabold text-emerald-400 text-[11px] uppercase tracking-wider">
              🏢 Property & Buildings
            </h3>
            <div className="flex justify-between text-slate-300">
              <span>Auctions on Decline:</span>
              <span className={`font-bold ${settings.auctionsEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                {settings.auctionsEnabled ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Even Building Rule:</span>
              <span className="font-bold text-slate-200">
                {settings.evenBuild ? 'Required (Equal distribution)' : 'Free build'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Mortgages Allowed:</span>
              <span className="font-bold text-slate-200">
                {settings.mortgagesEnabled ? `ON (${Math.round(settings.mortgageInterest * 100)}% Fee)` : 'OFF'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Bank Supply:</span>
              <span className="font-bold text-amber-300">
                {settings.housesAvailable} Houses / {settings.hotelsAvailable} Hotels
              </span>
            </div>
          </div>

          {/* Jail & Free Parking */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <h3 className="font-extrabold text-purple-400 text-[11px] uppercase tracking-wider">
              🚔 Thana (Jail) & Hira Mandi
            </h3>
            <div className="flex justify-between text-slate-300">
              <span>Max Turns in Thana:</span>
              <span className="font-bold text-slate-200">{settings.maxJailTurns} turns</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Thana Bail (Chai Paani):</span>
              <span className="font-bold text-amber-400">Rs {settings.jailBail}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Hira Mandi (Free Parking):</span>
              <span className="font-bold text-purple-300">
                {settings.freeParkingMode === 'POT'
                  ? 'Jackpot Pot (Collects fines)'
                  : settings.freeParkingMode === 'FIXED'
                  ? `Fixed Rs ${settings.freeParkingAmount}`
                  : 'Rest Only (No cash)'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
