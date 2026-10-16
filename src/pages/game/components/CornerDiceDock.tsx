import React from 'react';
import { Dice3DPod } from '../../../components/three/Dice3DPod';
import { AVATAR_OPTIONS, COLOR_PALETTE } from '../../../engine/boardConfig';
import { PlayerConfig } from '../../../types/game';

interface CornerDiceDockProps {
  playerIdx: number;
  player: PlayerConfig;
  isMyTurn: boolean;
  isIdle: boolean;
  isRolling: boolean;
  isSelectingPawn: boolean;
  diceValue: number | null;
  lastFace: number;
  onTriggerRoll: () => void;
  onRollSettled: () => void;
}

export const CornerDiceDock: React.FC<CornerDiceDockProps> = ({
  playerIdx,
  player,
  isMyTurn,
  isIdle,
  isRolling,
  isSelectingPawn,
  diceValue,
  lastFace,
  onTriggerRoll,
  onRollSettled,
}) => {
  const avatar =
    AVATAR_OPTIONS.find((a) => a.id === player.avatarId) ??
    AVATAR_OPTIONS[playerIdx];
  // Blue & Yellow are on the LEFT side of the board; Red & Green are on the RIGHT side of the board!
  const isRightSideCorner =
    player.color === 'red' || player.color === 'green';
  const palette = COLOR_PALETTE[player.color];

  const isAi = Boolean(player.isAi);

  return (
    <div
      className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-[24px] border-2 transition-all duration-200 ${
        isRightSideCorner ? 'flex-row-reverse' : 'flex-row'
      } ${
        isMyTurn
          ? isAi
            ? 'bg-white border-indigo-400 shadow-[0_10px_25px_rgba(99,102,241,0.30)]'
            : 'bg-white border-amber-400 shadow-[0_10px_25px_rgba(245,158,11,0.28)]'
          : 'bg-white/75 border-white/70 opacity-80'
      }`}
    >
      <div
        className={`flex items-center gap-2 ${
          isRightSideCorner ? 'flex-row-reverse text-right' : 'flex-row text-left'
        }`}
      >
        <div
          className={`relative w-11 h-11 rounded-2xl p-0.5 ${palette.bgClass} shadow shrink-0`}
        >
          <img
            src={avatar.src}
            alt={player.name}
            className="w-full h-full rounded-[14px] object-cover border border-white"
          />
        </div>
        <div>
          <div className={`flex items-center gap-1 ${isRightSideCorner ? 'justify-end' : 'justify-start'}`}>
            <span className="block text-xs font-extrabold text-slate-900 leading-tight max-w-[85px] truncate">
              {player.name || `Player ${playerIdx + 1}`}
            </span>
            {isAi && (
              <span className="px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 text-[8px] font-black shrink-0">
                AI
              </span>
            )}
          </div>
          <span
            className={`block text-[10px] font-extrabold ${
              isMyTurn
                ? isAi
                  ? 'text-indigo-600 animate-pulse'
                  : 'text-blue-600'
                : 'text-slate-400'
            }`}
          >
            {isMyTurn
              ? isAi
                ? isIdle
                  ? '🤖 Thinking...'
                  : isRolling
                  ? '🤖 Rolling...'
                  : isSelectingPawn
                  ? '🤖 Moving...'
                  : '🤖 In Action'
                : isIdle
                ? 'Tap Dice!'
                : isRolling
                ? 'Rolling...'
                : isSelectingPawn
                ? 'Move Token!'
                : 'Moving...'
              : isAi
              ? '🤖 AI Bot'
              : 'Waiting...'}
          </span>
        </div>
      </div>

      {/* Large 3D Dice Pod Locked to This Player's Last Rolled Value */}
      <Dice3DPod
        skinId={player.diceSkin}
        value={isMyTurn ? diceValue : lastFace}
        lastRolledValue={lastFace}
        isRolling={isMyTurn && isRolling}
        canRoll={isMyTurn && isIdle && !isAi}
        onTriggerRoll={onTriggerRoll}
        onRollSettled={isMyTurn ? onRollSettled : undefined}
        size="md"
      />
    </div>
  );
};
