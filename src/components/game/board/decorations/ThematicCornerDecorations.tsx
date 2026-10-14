import React from 'react';
import { BoardThemeId } from '../../../../types/game';

/**
 * Theme-Adaptive Corner Hardware:
 * - Royal Teakwood: Stamped Burma brass brackets with metallic rivets
 * - Marble Palace: Stepped Roman rose-gold plinths with acanthus trim
 * - Midnight Cyber: Carbon-fiber chamfers with cyan & magenta LED indicators
 * - Classic Kingdom: Victorian gilded tournament acanthus filigree
 */
export const ThematicCornerDecorations: React.FC<{ themeId: BoardThemeId }> = React.memo(
  ({ themeId }) => {
    if (themeId === 'royal-wood') {
      return (
        <>
          <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[3.5px] border-l-[3.5px] border-amber-400 rounded-tl-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mt-0.5 ml-0.5" />
          </div>
          <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[3.5px] border-r-[3.5px] border-amber-400 rounded-tr-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mt-0.5 mr-0.5" />
          </div>
          <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[3.5px] border-l-[3.5px] border-amber-400 rounded-bl-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-end">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mb-0.5 ml-0.5" />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[3.5px] border-r-[3.5px] border-amber-400 rounded-br-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-end justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mb-0.5 mr-0.5" />
          </div>
        </>
      );
    }
    if (themeId === 'marble-palace') {
      return (
        <>
          <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-l-[3px] border-rose-300 rounded-tl-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)]">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mt-0.5 ml-0.5" />
          </div>
          <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-r-[3px] border-rose-300 rounded-tr-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)] flex justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mt-0.5 mr-0.5" />
          </div>
          <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-l-[3px] border-rose-300 rounded-bl-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)] flex items-end">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mb-0.5 ml-0.5" />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-r-[3px] border-rose-300 rounded-br-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)] flex items-end justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mb-0.5 mr-0.5" />
          </div>
        </>
      );
    }
    if (themeId === 'midnight-neon') {
      return (
        <>
          <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[2.5px] border-l-[2.5px] border-cyan-400 rounded-tl-md shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] mt-0.5 ml-0.5 animate-pulse" />
          </div>
          <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[2.5px] border-r-[2.5px] border-pink-500 rounded-tr-md shadow-[0_0_8px_rgba(236,72,153,0.6)] flex justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-300 shadow-[0_0_6px_#f472b6] mt-0.5 mr-0.5 animate-pulse" />
          </div>
          <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[2.5px] border-l-[2.5px] border-pink-500 rounded-bl-md shadow-[0_0_8px_rgba(236,72,153,0.6)] flex items-end">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-300 shadow-[0_0_6px_#f472b6] mb-0.5 ml-0.5 animate-pulse" />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[2.5px] border-r-[2.5px] border-cyan-400 rounded-br-md shadow-[0_0_8px_rgba(6,182,212,0.6)] flex items-end justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] mb-0.5 mr-0.5 animate-pulse" />
          </div>
        </>
      );
    }
    // Classic Kingdom
    return (
      <>
        <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-l-[3px] border-amber-400/90 rounded-tl-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mt-0.5 ml-0.5" />
        </div>
        <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-r-[3px] border-amber-400/90 rounded-tr-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex justify-end">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mt-0.5 mr-0.5" />
        </div>
        <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-l-[3px] border-amber-400/90 rounded-bl-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex items-end">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mb-0.5 ml-0.5" />
        </div>
        <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-r-[3px] border-amber-400/90 rounded-br-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex items-end justify-end">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mb-0.5 mr-0.5" />
        </div>
      </>
    );
  }
);

ThematicCornerDecorations.displayName = 'ThematicCornerDecorations';
