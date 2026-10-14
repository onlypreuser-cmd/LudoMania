import React from 'react';
import { BoardThemeId } from '../../../../types/game';

/**
 * 4 Bespoke Thematic Center Goal Hubs:
 * - Royal Teakwood: Hand-carved Burmese Marquetry Inlay with brass compass rose
 * - Marble Palace: Carrara Crystal & Rose-Gold Prism Mosaic with imperial laurel
 * - Midnight Cyber: Holographic Quantum Reactor Hub with cybernetic laser lines
 * - Classic Kingdom: Grand Tournament Championship Crest with royal sunburst
 */
export const ThematicCenterGoal: React.FC<{
  themeId: BoardThemeId;
  dividerColor: string;
}> = React.memo(({ themeId }) => {
  if (themeId === 'royal-wood') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        <defs>
          <radialGradient id="teak-blue" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </radialGradient>
          <radialGradient id="teak-red" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>
          <radialGradient id="teak-green" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#052e16" />
          </radialGradient>
          <radialGradient id="teak-gold" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>
          <radialGradient id="brass-finial" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        {/* 4 Rich Wood Marquetry Quadrants */}
        <polygon points="0,0 50,50 0,100" fill="url(#teak-blue)" stroke="#451a03" strokeWidth="0.5" />
        <polygon points="0,0 100,0 50,50" fill="url(#teak-red)" stroke="#451a03" strokeWidth="0.5" />
        <polygon points="100,0 100,100 50,50" fill="url(#teak-green)" stroke="#451a03" strokeWidth="0.5" />
        <polygon points="0,100 100,100 50,50" fill="url(#teak-gold)" stroke="#451a03" strokeWidth="0.5" />

        {/* Polished Routered Brass Inlay Dividers */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#f59e0b" strokeWidth="3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#f59e0b" strokeWidth="3" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#78350f" strokeWidth="1" strokeDasharray="2,3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#78350f" strokeWidth="1" strokeDasharray="2,3" />

        {/* Central 8-Point Brass Compass Rose Medallion */}
        <circle cx="50" cy="50" r="19" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="50" cy="50" r="16" fill="#78350f" stroke="#b45309" strokeWidth="1" />
        <polygon points="50,33 53,47 67,50 53,53 50,67 47,53 33,50 47,47" fill="#fef08a" stroke="#d97706" strokeWidth="0.5" />
        <polygon points="50,38 52,48 62,50 52,52 50,62 48,52 38,50 48,48" fill="#b45309" />
        <circle cx="50" cy="50" r="4.5" fill="url(#brass-finial)" stroke="#451a03" strokeWidth="0.8" />
      </svg>
    );
  }

  if (themeId === 'marble-palace') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        <defs>
          <radialGradient id="marble-blue" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
          <radialGradient id="marble-red" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>
          <radialGradient id="marble-green" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
          <radialGradient id="marble-amber" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <radialGradient id="rosegold-medallion" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="50%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#fda4af" />
          </radialGradient>
        </defs>
        {/* Crystal Faceted Quadrants */}
        <polygon points="0,0 50,50 0,100" fill="url(#marble-blue)" />
        <polygon points="0,0 25,25 0,50" fill="#60a5fa" opacity="0.45" />
        <polygon points="0,50 25,75 0,100" fill="#1e40af" opacity="0.35" />

        <polygon points="0,0 100,0 50,50" fill="url(#marble-red)" />
        <polygon points="0,0 50,0 25,25" fill="#fda4af" opacity="0.45" />
        <polygon points="50,0 100,0 75,25" fill="#9f1239" opacity="0.35" />

        <polygon points="100,0 100,100 50,50" fill="url(#marble-green)" />
        <polygon points="100,0 100,50 75,25" fill="#6ee7b7" opacity="0.45" />
        <polygon points="100,50 100,100 75,75" fill="#065f46" opacity="0.35" />

        <polygon points="0,100 100,100 50,50" fill="url(#marble-amber)" />
        <polygon points="0,100 50,100 25,75" fill="#fde68a" opacity="0.45" />
        <polygon points="50,100 100,100 75,75" fill="#78350f" opacity="0.35" />

        {/* Flush Rose-Gold Dividers */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#f43f5e" strokeWidth="2.8" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#f43f5e" strokeWidth="2.8" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#fff1f2" strokeWidth="1" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#fff1f2" strokeWidth="1" />

        {/* Central Roman Palace Laurel & Diamond Jewel */}
        <circle cx="50" cy="50" r="19" fill="#ffffff" stroke="#fda4af" strokeWidth="2" />
        <circle cx="50" cy="50" r="16" fill="url(#rosegold-medallion)" stroke="#f43f5e" strokeWidth="1" />
        <polygon points="50,37 60,45 50,63 40,45" fill="#ffffff" stroke="#fda4af" strokeWidth="1" />
        <line x1="43" y1="45" x2="57" y2="45" stroke="#f43f5e" strokeWidth="0.8" />
        <line x1="50" y1="37" x2="50" y2="63" stroke="#f43f5e" strokeWidth="0.8" />
      </svg>
    );
  }

  if (themeId === 'midnight-neon') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        <defs>
          <filter id="cyber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon points="0,0 50,50 0,100" fill="#082f49" />
        <polygon points="0,0 100,0 50,50" fill="#4c0519" />
        <polygon points="100,0 100,100 50,50" fill="#052e16" />
        <polygon points="0,100 100,100 50,50" fill="#451a03" />

        {/* Cyber Circuit Trace Grid Overlay */}
        <line x1="25" y1="0" x2="25" y2="25" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
        <line x1="75" y1="0" x2="75" y2="25" stroke="#ec4899" strokeWidth="1" opacity="0.6" />
        <line x1="100" y1="25" x2="75" y2="25" stroke="#10b981" strokeWidth="1" opacity="0.6" />
        <line x1="0" y1="75" x2="25" y2="75" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />

        {/* Luminous Laser Beam Dividers with Neon Glow */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#06b6d4" strokeWidth="2.5" filter="url(#cyber-glow)" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#ec4899" strokeWidth="2.5" filter="url(#cyber-glow)" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#ffffff" strokeWidth="1" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#ffffff" strokeWidth="1" />

        {/* Central Quantum Reactor Singularity Core */}
        <circle cx="50" cy="50" r="20" fill="#030712" stroke="#06b6d4" strokeWidth="2" filter="url(#cyber-glow)" />
        <polygon points="50,33 65,41 65,59 50,67 35,59 35,41" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3,2" />
        <circle cx="50" cy="50" r="9" fill="#083344" stroke="#ec4899" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="4.5" fill="#22d3ee" filter="url(#cyber-glow)" />
      </svg>
    );
  }

  // Classic Kingdom
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full block">
      <defs>
        <radialGradient id="classic-gold" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <polygon points="0,0 50,50 0,100" fill="#2563eb" />
      <polygon points="0,0 100,0 50,50" fill="#e11d48" />
      <polygon points="100,0 100,100 50,50" fill="#16a34a" />
      <polygon points="0,100 100,100 50,50" fill="#f59e0b" />

      {/* Gilded Tournament Dividers */}
      <line x1="0" y1="0" x2="100" y2="100" stroke="#fbbf24" strokeWidth="3" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="#fbbf24" strokeWidth="3" />
      <line x1="0" y1="0" x2="100" y2="100" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,3" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,3" />

      {/* Central Royal Sunburst Champion Medallion */}
      <circle cx="50" cy="50" r="20" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="16.5" fill="url(#classic-gold)" stroke="#b45309" strokeWidth="1" />
      <path
        d="M 40,55 L 60,55 L 60,52 L 58,45 L 54,49 L 50,42 L 46,49 L 42,45 L 40,52 Z"
        fill="#78350f"
      />
      <circle cx="50" cy="41" r="1.5" fill="#fef08a" />
      <circle cx="42" cy="44" r="1.2" fill="#fef08a" />
      <circle cx="58" cy="44" r="1.2" fill="#fef08a" />
    </svg>
  );
});

ThematicCenterGoal.displayName = 'ThematicCenterGoal';
