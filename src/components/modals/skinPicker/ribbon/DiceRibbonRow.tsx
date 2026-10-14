import { Check } from 'lucide-react';
import React from 'react';
import { soundManager } from '../../../../audio/soundManager';
import { DICE_SKINS } from '../../../../engine/boardConfig';

interface DiceRibbonRowProps {
  activeSkinId: string;
  onSelectSkin: (skinId: string) => void;
  hasDraggedRowRef: React.MutableRefObject<boolean>;
}

export const DiceRibbonRow: React.FC<DiceRibbonRowProps> = ({
  activeSkinId,
  onSelectSkin,
  hasDraggedRowRef,
}) => {
  return (
    <>
      {DICE_SKINS.map((dice) => {
        const selected = activeSkinId === dice.id;
        return (
          <button
            key={dice.id}
            type="button"
            data-active={selected ? 'true' : 'false'}
            onClick={() => {
              if (hasDraggedRowRef.current) return;
              soundManager.play('ui_click');
              onSelectSkin(dice.id);
            }}
            className={`shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border-2 transition-all cursor-pointer ${
              selected
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-102 ring-2 ring-blue-300'
                : 'bg-white text-slate-700 border-slate-200/90 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <div
              className="w-6 h-6 rounded-lg shadow-sm border border-black/15 p-1 grid grid-cols-2 gap-0.5 items-center justify-items-center shrink-0"
              style={{
                backgroundColor: dice.bodyColor,
                boxShadow: `0 2px 6px ${dice.edgeGlow}55`,
              }}
            >
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
            </div>
            <div className="text-left">
              <span className="block text-xs font-black truncate max-w-[100px] leading-tight">
                {dice.name}
              </span>
              <span
                className={`block text-[9px] font-bold ${
                  selected ? 'text-blue-100' : 'text-slate-400'
                }`}
              >
                {dice.shapeType}
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
