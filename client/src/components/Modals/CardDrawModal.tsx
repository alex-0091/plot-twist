import React from 'react';
import { Card } from '../../types';

interface CardDrawModalProps {
  card: Card | null;
  onClose: () => void;
}

export const CardDrawModal: React.FC<CardDrawModalProps> = ({ card, onClose }) => {
  if (!card) return null;

  const isSceneOnHai = card.deck === 'SCENE_ON_HAI';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div
        className={`max-w-md w-full rounded-3xl p-1 shadow-2xl border-2 animate-in fade-in zoom-in duration-300 ${
          isSceneOnHai ? 'border-amber-500/70 bg-[#241d3b]' : 'border-[#81be97]/70 bg-[#1c2826]'
        }`}
      >
        <div className="bg-[#1c182c] rounded-[22px] p-6 text-center flex flex-col items-center gap-4 relative overflow-hidden">
          {/* Deck Badge */}
          <div
            className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-md ${
              isSceneOnHai ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          >
            {isSceneOnHai ? '😂 SCENE ON HAI' : '🇵🇰 PAKISTAN ZINDABAD'}
          </div>

          {/* Illustration */}
          <div className="text-6xl my-1 filter drop-shadow">
            {card.illustration || '🃏'}
          </div>

          {/* Card Title & Urdu */}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {card.title}
            </h2>
            {card.urduTitle && (
              <p className="text-sm font-urdu text-amber-400 font-bold mt-0.5">
                {card.urduTitle}
              </p>
            )}
          </div>

          {/* Setup Description Story */}
          <p className="text-xs sm:text-sm text-slate-300 italic px-2 leading-relaxed">
            "{card.description}"
          </p>

          {/* Action Callout Box */}
          <div
            className={`w-full py-3 px-4 rounded-xl border font-black text-xs sm:text-sm uppercase tracking-wider shadow-inner ${
              isSceneOnHai
                ? 'bg-[#2b2416] border-amber-500/40 text-amber-200'
                : 'bg-[#12281e] border-emerald-500/40 text-emerald-200'
            }`}
          >
            {card.actionText}
          </div>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="mt-1 w-full py-3 bg-[#7053ff] hover:bg-[#6244f5] text-white font-black text-sm rounded-2xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            SAMAJH GAYA! (OK) »
          </button>
        </div>
      </div>
    </div>
  );
};
