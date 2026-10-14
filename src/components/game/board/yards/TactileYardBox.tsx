import React from 'react';
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
    // Theme-specific Yard Inner Basin styling:
    let yardInnerStyle: React.CSSProperties = {};
    const yardInnerClass = `absolute inset-[10%] rounded-2xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] transition-all`;
    let tokenPadStyle: React.CSSProperties = {};
    const tokenPadClass = `absolute -translate-x-1/2 -translate-y-1/2 w-[27%] h-[27%] rounded-full border-2 transition-all flex items-center justify-center`;

    if (boardTheme === 'royal-wood') {
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #78350f 0%, #451a03 70%, #291002 100%)',
        border: '2px solid #b45309',
      };
      tokenPadStyle = {
        background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #d97706 70%, #78350f 100%)',
        boxShadow: '0 3px 6px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.4)',
        borderColor: '#b45309',
      };
    } else if (boardTheme === 'marble-palace') {
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 65%, #cbd5e1 100%)',
        border: '2px solid #fda4af',
      };
      tokenPadStyle = {
        background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #ffe4e6 70%, #fda4af 100%)',
        boxShadow: '0 3px 6px rgba(159,18,57,0.25), inset 0 2px 4px rgba(255,255,255,0.9)',
        borderColor: '#f43f5e',
      };
    } else if (boardTheme === 'midnight-neon') {
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #0b0f19 0%, #030712 85%, #000000 100%)',
        border: '2px solid #06b6d4',
        boxShadow: 'inset 0 0 15px rgba(6,182,212,0.35)',
      };
      tokenPadStyle = {
        background: 'radial-gradient(circle at 50% 50%, #06b6d433 0%, #090d16 70%, #030712 100%)',
        boxShadow: '0 0 10px rgba(6,182,212,0.6), inset 0 0 6px #22d3ee',
        borderColor: '#22d3ee',
      };
    } else {
      // Classic Kingdom
      yardInnerStyle = {
        background: 'radial-gradient(circle at 50% 50%, #fffdfa 0%, #fef3c7 70%, #fde68a 100%)',
        border: '2px solid #eab308',
      };
      tokenPadStyle = {
        background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 70%, #b45309 100%)',
        boxShadow: '0 3px 6px rgba(180,83,9,0.35), inset 0 2px 3px rgba(255,255,255,0.7)',
        borderColor: '#b45309',
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
