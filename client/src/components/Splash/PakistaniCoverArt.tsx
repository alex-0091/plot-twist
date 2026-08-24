import React from 'react';

export const PakistaniCoverArt: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto h-48 sm:h-56 rounded-2xl overflow-hidden bg-gradient-to-b from-sky-950 via-emerald-950 to-slate-950 border-2 border-amber-500/60 shadow-2xl flex flex-col items-center justify-between p-3 select-none">
      {/* Background Animated Stars & Crescent */}
      <div className="absolute top-2 right-4 text-3xl animate-pulse opacity-90 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]">
        🌙✨
      </div>

      {/* Margalla Hills / City Skyline Silhouette in background */}
      <div className="absolute bottom-10 inset-x-0 h-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-900/80 to-slate-950 pointer-events-none rounded-t-[50%]" />

      {/* Decorative Truck Art Bunting / Flags on top */}
      <div className="w-full flex justify-between items-center px-2 z-10">
        <div className="flex gap-1">
          {['🔴', '🟡', '🟢', '🔵', '🟠', '🟣'].map((c, i) => (
            <span key={i} className="text-xs animate-bounce" style={{ animationDelay: `${i * 150}ms` }}>
              {c}
            </span>
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full font-sans shadow">
          ★ DHAMAKA PROPERTY SALE ★
        </span>
        <div className="flex gap-1">
          {['🟣', '🟠', '🔵', '🟢', '🟡', '🔴'].map((c, i) => (
            <span key={i} className="text-xs animate-bounce" style={{ animationDelay: `${i * 150 + 75}ms` }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Center Hilarious Pakistani Billboard */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-600 p-0.5 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.5)]">
          <div className="bg-slate-950 px-4 py-1.5 rounded-[10px] text-center border border-amber-400/40 flex items-center gap-2">
            <span className="text-2xl animate-spin-slow">🛺</span>
            <div>
              <div className="text-base sm:text-lg font-black tracking-wider bg-gradient-to-r from-yellow-300 via-emerald-400 to-red-400 bg-clip-text text-transparent">
                PLOT TWIST 🇵🇰
              </div>
              <div className="text-[9px] font-urdu text-amber-300 leading-tight">
                "فاصلہ رکھیں ورنہ پیار ہو جائے گا!"
              </div>
            </div>
            <span className="text-2xl animate-bounce-short">☕</span>
          </div>
        </div>
      </div>

      {/* Animated Animated Bottom Road with Rickshaw & Traffic */}
      <div className="w-full relative z-10 flex flex-col items-center">
        {/* Animated Characters on Road */}
        <div className="w-full flex items-end justify-between px-4 pb-1">
          {/* Charsi Tikka Boss */}
          <div className="flex flex-col items-center animate-bounce-short">
            <span className="text-2xl">🍗</span>
            <span className="text-[8px] font-bold text-amber-300 bg-black/60 px-1 rounded">Charsi Tikka</span>
          </div>

          {/* Center Bouncing Rickshaw with exhaust puffs */}
          <div className="flex items-center gap-1">
            <div className="text-xs text-slate-400 animate-ping opacity-60">💨</div>
            <div className="relative transform hover:scale-125 transition-transform duration-200 cursor-pointer">
              <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-bounce" style={{ animationDuration: '0.8s' }}>
                🛺
              </span>
              <span className="absolute -top-3 -right-2 text-[10px] bg-red-600 text-white font-bold px-1 rounded-full animate-pulse">
                VIP
              </span>
            </div>
            <div className="text-2xl animate-bounce" style={{ animationDuration: '1.2s' }}>
              🚙
            </div>
          </div>

          {/* Plot Uncle */}
          <div className="flex flex-col items-center animate-bounce-short" style={{ animationDelay: '300ms' }}>
            <span className="text-2xl">👴</span>
            <span className="text-[8px] font-bold text-emerald-300 bg-black/60 px-1 rounded">Plot Uncle</span>
          </div>
        </div>

        {/* Asphalt Road with Moving Yellow Lines */}
        <div className="w-full h-3 bg-slate-900 border-t-2 border-slate-700 relative overflow-hidden flex items-center">
          <div className="w-full flex justify-around">
            <div className="w-8 h-1 bg-yellow-400 rounded-full animate-pulse" />
            <div className="w-8 h-1 bg-yellow-400 rounded-full animate-pulse" />
            <div className="w-8 h-1 bg-yellow-400 rounded-full animate-pulse" />
            <div className="w-8 h-1 bg-yellow-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
};
