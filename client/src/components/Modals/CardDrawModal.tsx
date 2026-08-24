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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className={`max-w-md w-full rounded-3xl p-1 shadow-2xl border-4 animate-in fade-in zoom-in duration-300 ${
          isSceneOnHai ? 'border-amber-500 bg-gradient-to-b from-amber-600 to-amber-950' : 'border-emerald-500 bg-gradient-to-b from-emerald-600 to-emerald-950'
        }`}
      >
        <div className="bg-slate-950/95 rounded-[22px] p-6 text-center flex flex-col items-center gap-4 relative overflow-hidden">
          {/* Deck Badge */}
          <div
            className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-md ${
              isSceneOnHai ? 'bg-amber-600' : 'bg-emerald-600'
            }`}
          >
            {isSceneOnHai ? '😂 SCENE ON HAI' : '🇵🇰 PAKISTAN ZINDABAD'}
          </div>

          {/* Illustration */}
          <div className="text-6xl my-2 filter drop-shadow animate-bounce-short">
            {card.illustration || '🃏'}
          </div>

          {/* Card Title & Urdu */}
          <div>
            <h2 className="text-2xl font-black text-slate-100 tracking-wide">
              {card.title}
            </h2>
            {card.urduTitle && (
              <p className="text-sm font-urdu text-amber-400 font-bold mt-1">
                {card.urduTitle}
              </p>
            )}
          </div>

          {/* Setup Description Story */}
          <p className="text-sm text-slate-300 italic px-4 leading-relaxed">
            "{card.description}"
          </p>

          {/* Action Callout Box */}
          <div
            className={`w-full py-3 px-4 rounded-xl border font-black text-sm uppercase tracking-wider shadow-inner ${
              isSceneOnHai
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-200'
                : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
            }`}
          >
            {card.actionText}
          </div>

          {/* Continue Button */}
          <button
            onClick={onClose}
            className="mt-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-black text-base rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          >
            SAMAJH GAYA! (OK)
          </button>
        </div>
      </div>
    </div>
  );
};
