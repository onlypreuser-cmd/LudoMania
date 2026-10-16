import { Shield, Sparkles, X } from 'lucide-react';
import React from 'react';
import { BoardThemeId } from '../../../types/game';

interface TacticalPowerBannerProps {
  canPlaceMarbleWall: boolean;
  canDeployGuard: boolean;
  canLaunchAsteroid: boolean;
  boardTheme: BoardThemeId;
  targetingMode: 'wall' | 'guard' | 'asteroid' | null;
  onStartTargeting: (mode: 'wall' | 'guard' | 'asteroid') => void;
  onCancelTargeting: () => void;
}

export const TacticalPowerBanner: React.FC<TacticalPowerBannerProps> = React.memo(
  ({
    canPlaceMarbleWall,
    canDeployGuard,
    canLaunchAsteroid,
    boardTheme,
    targetingMode,
    onStartTargeting,
    onCancelTargeting,
  }) => {
    // If targeting is active, show the interactive targeting prompt
    if (targetingMode) {
      let promptText = '';
      let accentBorder = 'border-amber-400';
      let accentBg = 'bg-slate-900/90';

      if (targetingMode === 'wall') {
        promptText = '🧱 Tap any track square to erect Roman Wall';
        accentBorder = 'border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.35)]';
      } else if (targetingMode === 'guard') {
        promptText = '🛡️ Tap your active token to deploy Royal Guard';
        accentBorder = 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.35)]';
      } else if (targetingMode === 'asteroid') {
        promptText = '☄️ Tap an opponent token to freeze in Cyber Stasis';
        accentBorder = 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.45)]';
      }

      return (
        <div className="w-full flex items-center justify-center my-1 z-30">
          <div
            className={`w-full max-w-[390px] px-3.5 py-1.5 rounded-2xl backdrop-blur-md border ${accentBorder} ${accentBg} flex items-center justify-between shadow-xl transition-all animate-pulse`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-100">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="truncate">{promptText}</span>
            </div>
            <button
              type="button"
              onClick={onCancelTargeting}
              className="ml-2 p-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Cancel power targeting"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      );
    }

    const hasAnyPower =
      (canPlaceMarbleWall && boardTheme === 'marble-palace') ||
      (canDeployGuard && boardTheme === 'royal-wood') ||
      (canLaunchAsteroid && boardTheme === 'midnight-neon');

    if (!hasAnyPower) {
      return null;
    }

    return (
      <div className="w-full flex items-center justify-center my-1 z-30">
        {/* Marble Palace: Roman Wall Button */}
        {canPlaceMarbleWall && boardTheme === 'marble-palace' && (
          <button
            type="button"
            onClick={() => onStartTargeting('wall')}
            className="w-full max-w-[360px] px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_16px_rgba(245,158,11,0.45),inset_0_1px_2px_rgba(255,255,255,0.7)] border-2 border-amber-200 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-base">🧱</span>
            <span>BUILD ROMAN WALL</span>
            <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded-full font-bold">
              -1 Opponent Step
            </span>
          </button>
        )}

        {/* Royal Teakwood: Royal Guard Button */}
        {canDeployGuard && boardTheme === 'royal-wood' && (
          <button
            type="button"
            onClick={() => onStartTargeting('guard')}
            className="w-full max-w-[360px] px-4 py-2 rounded-2xl bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-400 hover:from-yellow-500 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_16px_rgba(234,179,8,0.45),inset_0_1px_2px_rgba(255,255,255,0.7)] border-2 border-yellow-200 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Shield className="w-4 h-4 text-slate-950 fill-slate-950 stroke-[2.5]" />
            <span>DEPLOY ROYAL GUARD</span>
            <span className="text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded-full font-bold">
              Shields 2 Cuts
            </span>
          </button>
        )}

        {/* Midnight Neon: Cyber Asteroid Button */}
        {canLaunchAsteroid && boardTheme === 'midnight-neon' && (
          <button
            type="button"
            onClick={() => onStartTargeting('asteroid')}
            className="w-full max-w-[360px] px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-500 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_4px_20px_rgba(6,182,212,0.5),inset_0_1px_2px_rgba(255,255,255,0.8)] border-2 border-cyan-200 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-base">☄️</span>
            <span>LAUNCH CYBER ASTEROID</span>
            <span className="text-[10px] bg-slate-950/25 px-1.5 py-0.5 rounded-full font-bold">
              Freeze in Stasis (60s)
            </span>
          </button>
        )}
      </div>
    );
  }
);

TacticalPowerBanner.displayName = 'TacticalPowerBanner';
