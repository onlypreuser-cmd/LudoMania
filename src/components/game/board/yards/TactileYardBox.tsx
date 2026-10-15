import React from 'react';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { BoardThemeId, PlayerColor } from '../../../../types/game';

export const YARD_PAD_POSITIONS: [number, number][] = [
  [32.5, 32.5],
  [67.5, 32.5],
  [32.5, 67.5],
  [67.5, 67.5],
];

interface TactileYardBoxProps {
  color: PlayerColor;
  gridAreaClass: string;
  gradientClass: string;
  isActive: boolean;
  boardTheme: BoardThemeId;
  yardBorderClass: string;
}

export const TactileYardBox: React.FC<TactileYardBoxProps> = React.memo(
  ({
    color,
    gridAreaClass,
    gradientClass,
    isActive,
    boardTheme,
    yardBorderClass,
  }) => {
    const pal = COLOR_PALETTE[color];

    // Theme-specific Yard Inner Basin styling:
    let yardInnerStyle: React.CSSProperties = {};
    const yardInnerClass = `absolute inset-[10%] rounded-2xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] transition-all`;
    let tokenPadStyle: React.CSSProperties = {};
    const tokenPadClass = `absolute -translate-x-1/2 -translate-y-1/2 w-[27%] h-[27%] rounded-full border-2 transition-all flex items-center justify-center`;

    if (boardTheme === 'royal-wood') {
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #5c2406 0%, #3a1402 70%, #200a01 100%)',
        border: '2px solid #b45309',
      };
      tokenPadStyle = {
        background: `radial-gradient(circle at 35% 35%, #fffbeb 0%, ${pal.primary}60 70%, #78350f 100%)`,
        boxShadow: '0 3px 6px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.4)',
        borderColor: pal.primary,
      };
    } else if (boardTheme === 'marble-palace') {
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f8fafc 65%, #e2e8f0 100%)',
        border: '2px solid #cbd5e1',
      };
      tokenPadStyle = {
        background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${pal.light} 65%, ${pal.primary}25 100%)`,
        boxShadow: `0 3px 6px rgba(0,0,0,0.18), inset 0 2px 4px rgba(255,255,255,0.9)`,
        borderColor: pal.primary,
      };
    } else if (boardTheme === 'midnight-neon') {
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #0b0f19 0%, #030712 85%, #000000 100%)',
        border: `2px solid ${pal.primary}88`,
        boxShadow: `inset 0 0 15px ${pal.primary}33`,
      };
      tokenPadStyle = {
        background: `radial-gradient(circle at 50% 50%, ${pal.primary}33 0%, #090d16 70%, #030712 100%)`,
        boxShadow: `0 0 10px ${pal.primary}66, inset 0 0 6px ${pal.primary}`,
        borderColor: pal.primary,
      };
    } else {
      // Classic Kingdom
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #fffdfa 0%, #fef3c7 70%, #fde68a 100%)',
        border: '2px solid #eab308',
      };
      tokenPadStyle = {
        background: `radial-gradient(circle at 35% 35%, #ffffff 0%, ${pal.light} 65%, ${pal.primary}30 100%)`,
        boxShadow: '0 3px 6px rgba(180,83,9,0.35), inset 0 2px 3px rgba(255,255,255,0.7)',
        borderColor: pal.primary,
      };
    }

    return (
      <div
        className={`${gridAreaClass} relative ${
          isActive ? gradientClass : 'bg-slate-300/40 opacity-40'
        } border ${yardBorderClass} shadow-inner transition-opacity overflow-hidden`}
      >
        <div className={yardInnerClass} style={isActive ? yardInnerStyle : undefined} />
        {YARD_PAD_POSITIONS.map(([leftPct, topPct], slotIdx) => (
          <div
            key={`${color}-pad-${slotIdx}`}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
              ...(isActive ? tokenPadStyle : {}),
            }}
            className={`${tokenPadClass} ${
              isActive ? '' : 'bg-slate-300/60 border-slate-300/50'
            }`}
          />
        ))}
      </div>
    );
  }
);

TactileYardBox.displayName = 'TactileYardBox';
