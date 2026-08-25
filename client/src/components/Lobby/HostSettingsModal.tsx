import React, { useState } from 'react';
import { GameSettings } from '../../types';

interface HostSettingsModalProps {
  isOpen: boolean;
  currentSettings: GameSettings;
  isHost: boolean;
  onClose: () => void;
  onSave: (newSettings: Partial<GameSettings>) => void;
}

export const HostSettingsModal: React.FC<HostSettingsModalProps> = ({
  isOpen,
  currentSettings,
  isHost,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [settings, setSettings] = useState<GameSettings>({ ...currentSettings });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#1c182c] border border-[#2e284a] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#130f1d] p-4 border-b border-[#2e284a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">MATCH SETTINGS</h2>
              <p className="text-[10px] text-[#b1b2f2]">Host Customization Rules</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-[#1c182c] rounded-full w-7 h-7 flex items-center justify-center font-bold border border-[#2e284a] text-xs"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Economy Settings */}
          <div className="space-y-2 border-b border-[#2e284a] pb-3">
            <h3 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider">
              💵 Economy & Salary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Starting Cash:</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.startingMoney}
                  onChange={(e) => setSettings({ ...settings, startingMoney: Number(e.target.value) })}
                  className="w-full bg-[#130f1d] border border-[#2e284a] rounded-xl px-3 py-1.5 font-bold font-mono text-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Passing Start Salary:</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.salaryOnStart}
                  onChange={(e) => setSettings({ ...settings, salaryOnStart: Number(e.target.value) })}
                  className="w-full bg-[#130f1d] border border-[#2e284a] rounded-xl px-3 py-1.5 font-bold font-mono text-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Property Rules */}
          <div className="space-y-2 border-b border-[#2e284a] pb-3">
            <h3 className="font-extrabold text-xs text-emerald-400 uppercase tracking-wider">
              🏢 Property & Building
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2.5 bg-[#130f1d] rounded-xl border border-[#2e284a] cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.auctionsEnabled}
                  onChange={(e) => setSettings({ ...settings, auctionsEnabled: e.target.checked })}
                  className="rounded text-[#7053ff] focus:ring-0"
                />
                <span className="font-semibold text-slate-200 text-[11px]">Auctions Enabled</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-[#130f1d] rounded-xl border border-[#2e284a] cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.evenBuild}
                  onChange={(e) => setSettings({ ...settings, evenBuild: e.target.checked })}
                  className="rounded text-[#7053ff] focus:ring-0"
                />
                <span className="font-semibold text-slate-200 text-[11px]">Even Building Rule</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-[#130f1d] rounded-xl border border-[#2e284a] cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.mortgagesEnabled}
                  onChange={(e) => setSettings({ ...settings, mortgagesEnabled: e.target.checked })}
                  className="rounded text-[#7053ff] focus:ring-0"
                />
                <span className="font-semibold text-slate-200 text-[11px]">Mortgages Allowed</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 bg-[#130f1d] rounded-xl border border-[#2e284a] cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.doublesExtraTurn}
                  onChange={(e) => setSettings({ ...settings, doublesExtraTurn: e.target.checked })}
                  className="rounded text-[#7053ff] focus:ring-0"
                />
                <span className="font-semibold text-slate-200 text-[11px]">Doubles Extra Turn</span>
              </label>
            </div>
          </div>

          {/* Jail & Free Parking */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-xs text-purple-400 uppercase tracking-wider">
              🚔 Jail & Free Parking
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Jail Bail:</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.jailBail}
                  onChange={(e) => setSettings({ ...settings, jailBail: Number(e.target.value) })}
                  className="w-full bg-[#130f1d] border border-[#2e284a] rounded-xl px-3 py-1.5 font-bold font-mono text-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px]">Free Parking Mode:</label>
                <select
                  disabled={!isHost}
                  value={settings.freeParkingMode}
                  onChange={(e) => setSettings({ ...settings, freeParkingMode: e.target.value as any })}
                  className="w-full bg-[#130f1d] border border-[#2e284a] rounded-xl px-2.5 py-1.5 font-bold text-slate-200 focus:outline-none"
                >
                  <option value="NONE">Rest Only</option>
                  <option value="POT">Jackpot Pot</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#130f1d] border-t border-[#2e284a] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1c182c] hover:bg-[#26213b] text-slate-300 font-bold text-xs rounded-xl border border-[#2e284a]"
          >
            Cancel
          </button>

          {isHost && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-xs rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              Save Settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
