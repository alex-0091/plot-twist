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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-emerald-950 p-4 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚙️</span>
            <div>
              <h2 className="text-lg font-black text-white">MATCH RULE CUSTOMIZATION</h2>
              <p className="text-xs text-emerald-300">Monopoly & Richup-style Host Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 rounded-full w-8 h-8 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Economy Settings */}
          <div className="space-y-2 border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wider">
              💵 Economy & Salary
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Starting Cash (Rs):</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.startingMoney}
                  onChange={(e) => setSettings({ ...settings, startingMoney: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-bold text-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Salary on START (Rs):</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.salaryOnStart}
                  onChange={(e) => setSettings({ ...settings, salaryOnStart: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-bold text-emerald-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Property Rules */}
          <div className="space-y-2 border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wider">
              🏢 Property & Auctions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.auctionsEnabled}
                  onChange={(e) => setSettings({ ...settings, auctionsEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Auctions Enabled</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.forcedAuctions}
                  onChange={(e) => setSettings({ ...settings, forcedAuctions: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Forced Auction Rule</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.mortgagesEnabled}
                  onChange={(e) => setSettings({ ...settings, mortgagesEnabled: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Mortgages Allowed</span>
              </label>

              <label className="flex items-center gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isHost}
                  checked={settings.evenBuild}
                  onChange={(e) => setSettings({ ...settings, evenBuild: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <span className="font-semibold text-slate-200">Even Building Rule</span>
              </label>
            </div>
          </div>

          {/* Building Limits */}
          <div className="space-y-2 border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-yellow-400 uppercase tracking-wider">
              🏡 Building Supply
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-slate-400 block mb-1">Max Houses:</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.housesAvailable}
                  onChange={(e) => setSettings({ ...settings, housesAvailable: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Max Hotels:</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.hotelsAvailable}
                  onChange={(e) => setSettings({ ...settings, hotelsAvailable: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Unmortgage Fee:</label>
                <div className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 font-bold text-amber-400">
                  {Math.round(settings.mortgageInterest * 100)}%
                </div>
              </div>
            </div>
          </div>

          {/* Jail & Free Parking */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-purple-400 uppercase tracking-wider">
              🚔 Thana & Hira Mandi (Free Parking)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Thana Bail (Rs):</label>
                <input
                  type="number"
                  disabled={!isHost}
                  value={settings.jailBail}
                  onChange={(e) => setSettings({ ...settings, jailBail: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-bold text-slate-200"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">Hira Mandi Mode:</label>
                <select
                  disabled={!isHost}
                  value={settings.freeParkingMode}
                  onChange={(e) => setSettings({ ...settings, freeParkingMode: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 font-bold text-purple-300 focus:outline-none"
                >
                  <option value="NONE">Classic (Rest Only)</option>
                  <option value="POT">Jackpot Tax Pot</option>
                  <option value="FIXED">Fixed Cash Reward</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl"
          >
            Cancel
          </button>
          {isHost && (
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-xs font-black rounded-xl shadow-lg transition-transform hover:scale-105"
            >
              SAVE SETTINGS
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
