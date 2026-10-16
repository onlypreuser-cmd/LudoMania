import React from 'react';
import { AVATAR_OPTIONS, COLOR_PALETTE } from '../../../engine/boardConfig';
import { Pawn, PlayerConfig } from '../../../types/game';

interface TopScoreCardProps {
  playerIdx: number;
  player: PlayerConfig;
  playerPawns: Pawn[];
  score: number;
  isTurn: boolean;
  compact?: boolean;
}

export const TopScoreCard: React.FC<TopScoreCardProps> = ({
  playerIdx,
  player,
  playerPawns,
  score,
  isTurn,
  compact = false,
}) => {
  const avatar =
    AVATAR_OPTIONS.find((a) => a.id === player.avatarId) ??
    AVATAR_OPTIONS[playerIdx % AVATAR_OPTIONS.length];
  const palette = COLOR_PALETTE[player.color];
  const isRight = playerIdx === 1 && !compact;

  // Sort dots so Out/Home colored circles appear first, followed by Greyish In-Yard circles
  const sortedPawns = [...playerPawns].sort((a, b) => b.step - a.step);

  if (compact) {
    return (
      <div
        className={`flex-1 min-w-0 flex items-center gap-1.5 px-2 py-1 rounded-xl border-2 transition-all ${
          isTurn
            ? player.isAi
              ? 'bg-white border-indigo-400 shadow-[0_4px_12px_rgba(99,102,241,0.30)] scale-[1.02]'
              : 'bg-white border-amber-400 shadow-[0_4px_12px_rgba(245,158,11,0.25)] scale-[1.02]'
            : 'bg-white/80 border-white/70 opacity-80'
        }`}
      >
        <div className="relative shrink-0">
          <img
            src={avatar.src}
            alt={player.name}
            className="w-6 h-6 rounded-full object-cover border border-white shadow-xs"
          />
          {player.isAi && (
            <span className="absolute -bottom-1 -right-1 px-0.5 rounded bg-indigo-600 text-[6px] font-black text-white">
              AI
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-0.5">
            <span className="text-[10px] font-black text-slate-900 truncate">
              {player.name || `P${playerIdx + 1}`}
            </span>
            <span className="text-[9px] font-black text-amber-800 tabular-nums">
              {score}
            </span>
          </div>

          <div className="mt-0.5 flex items-center gap-0.5">
            {sortedPawns.map((p) => {
              const isOut = p.step >= 0;
              const isHome = p.step === 56;
              return (
                <span
                  key={p.id}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isHome
                      ? `${palette.bgClass} ring-1 ring-amber-400 scale-110`
                      : isOut
                      ? `${palette.bgClass} border border-white`
                      : 'bg-slate-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-[22px] border-2 transition-all ${
        isRight ? 'flex-row-reverse text-right' : 'flex-row text-left'
      } ${
        isTurn
          ? 'bg-white border-amber-400 shadow-[0_6px_18px_rgba(245,158,11,0.25)]'
          : 'bg-white/85 border-white/85 opacity-85 shadow-sm'
      }`}
    >
      <img
        src={avatar.src}
        alt={player.name}
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow shrink-0"
      />

      <div className="flex-1 min-w-0">
        <div
          className={`flex items-center justify-between gap-1 ${
            isRight ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <span className="text-xs font-extrabold text-slate-900 truncate">
            {player.name || `Player ${playerIdx + 1}`}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tabular-nums shrink-0">
            {score} pts
          </span>
        </div>

        {/* 4 Round Token Circles: Actual Color when Out/Home, Greyish when In Yard */}
        <div
          className={`mt-1.5 flex items-center gap-1.5 ${
            isRight ? 'justify-end' : 'justify-start'
          }`}
        >
          {sortedPawns.map((p) => {
            const isOut = p.step >= 0;
            const isHome = p.step === 56;
            return (
              <span
                key={p.id}
                title={
                  isHome
                    ? 'Home!'
                    : isOut
                    ? 'Out on Board'
                    : 'Inside Base'
                }
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  isHome
                    ? `${palette.bgClass} ring-2 ring-amber-400 scale-110 shadow-sm`
                    : isOut
                    ? `${palette.bgClass} border border-white shadow-sm`
                    : 'bg-slate-300/90 border border-slate-400/40'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
