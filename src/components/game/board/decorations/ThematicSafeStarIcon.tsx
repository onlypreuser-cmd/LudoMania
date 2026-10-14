import React from 'react';
import { BoardThemeId } from '../../../../types/game';

/**
 * Bespoke Thematic Safe Star Icons:
 * - Royal Teakwood: Stamped brass medallion with burnt-wood relief
 * - Marble Palace: Inlaid 8-point rose-gold Roman star with faceted diamond core
 * - Midnight Cyber: Luminous holographic energy node with cyan hex pulse
 * - Classic Kingdom: Golden tournament champion coronet star
 */
export const ThematicSafeStarIcon: React.FC<{ themeId: BoardThemeId; fillClass?: string }> = React.memo(
  ({ themeId, fillClass }) => {
    if (themeId === 'royal-wood') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow">
          <circle cx="12" cy="12" r="10.5" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
          <polygon points="12,3.5 14.5,9 20.5,9.5 16,13.5 17.5,19.5 12,16 6.5,19.5 8,13.5 3.5,9.5 9.5,9" fill="#fef08a" stroke="#d97706" strokeWidth="0.6" />
          <circle cx="12" cy="12" r="2" fill="#78350f" />
        </svg>
      );
    }
    if (themeId === 'marble-palace') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow">
          <circle cx="12" cy="12" r="10" fill="#fff1f2" stroke="#fda4af" strokeWidth="1.5" />
          <polygon points="12,3 14.5,9.5 21,12 14.5,14.5 12,21 9.5,14.5 3,12 9.5,9.5" fill="#f43f5e" />
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" stroke="#fda4af" strokeWidth="0.5" />
        </svg>
      );
    }
    if (themeId === 'midnight-neon') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow-[0_0_6px_#06b6d4]">
          <polygon points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5" fill="#030712" stroke="#06b6d4" strokeWidth="1.8" />
          <polygon points="12,5 14,10 19,10 15,13.5 16.5,18.5 12,15.5 7.5,18.5 9,13.5 5,10 10,10" fill="#22d3ee" />
          <circle cx="12" cy="12" r="2" fill="#ec4899" />
        </svg>
      );
    }
    // Classic Kingdom
    return (
      <svg viewBox="0 0 24 24" className={`w-4 h-4 drop-shadow ${fillClass ?? ''}`}>
        <polygon points="12,2 15,8.5 22,9.5 17,14.5 18.5,21.5 12,18 5.5,21.5 7,14.5 2,9.5 9,8.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        <circle cx="12" cy="12" r="2.5" fill="#fef08a" />
      </svg>
    );
  }
);

ThematicSafeStarIcon.displayName = 'ThematicSafeStarIcon';
