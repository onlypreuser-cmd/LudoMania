import { Check } from 'lucide-react';
import React from 'react';
import { soundManager } from '../../../../audio/soundManager';
import { TOKEN_SKINS } from '../../../../engine/boardConfig';
import { TOKEN_ICON_MAP } from '../constants';

interface TokenRibbonRowProps {
  activeSkinId: string;
  onSelectSkin: (skinId: string) => void;
  hasDraggedRowRef: React.MutableRefObject<boolean>;
}

export const TokenRibbonRow: React.FC<TokenRibbonRowProps> = ({
  activeSkinId,
  onSelectSkin,
  hasDraggedRowRef,
}) => {
  return (
    <>
      {TOKEN_SKINS.map((skin) => {
        const selected = activeSkinId === skin.id;
        const icon = TOKEN_ICON_MAP[skin.id] || '♟️';
        return (
          <button
            key={skin.id}
            type="button"
            data-active={selected ? 'true' : 'false'}
            onClick={() => {
              if (hasDraggedRowRef.current) return;
              soundManager.play('ui_click');
              onSelectSkin(skin.id);
            }}
            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition-all cursor-pointer ${
              selected
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-102 ring-2 ring-blue-300'
                : 'bg-white text-slate-700 border-slate-200/90 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <span className="text-xl shrink-0 drop-shadow-xs">{icon}</span>
            <div className="text-left">
              <span className="block text-xs font-black truncate max-w-[100px] leading-tight">
                {skin.name}
              </span>
              <span
                className={`block text-[9px] font-bold ${
                  selected ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {skin.subtitle.split(' ')[0]}
              </span>
            </div>
            {selected && (
              <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3] shrink-0" />
            )}
          </button>
        );
      })}
    </>
  );
};
