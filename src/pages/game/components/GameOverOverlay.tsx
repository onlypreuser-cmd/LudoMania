import { AnimatePresence, motion } from 'framer-motion';
import { Crown, RotateCcw, Trophy, X } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../../../audio/soundManager';
import { AVATAR_OPTIONS } from '../../../engine/boardConfig';
import { PlayerConfig } from '../../../types/game';

interface GameOverOverlayProps {
  isGameOver: boolean;
  winnerPlayer: PlayerConfig;
  loserPlayer: PlayerConfig;
  onPlayAgain: () => void;
}

export const GameOverOverlay: React.FC<GameOverOverlayProps> = ({
  isGameOver,
  winnerPlayer,
  loserPlayer,
  onPlayAgain,
}) => {
  const navigate = useNavigate();

  const winnerAvatar =
    AVATAR_OPTIONS.find((a) => a.id === winnerPlayer.avatarId) ??
    AVATAR_OPTIONS[0];
  const loserAvatar =
    AVATAR_OPTIONS.find((a) => a.id === loserPlayer.avatarId) ??
    AVATAR_OPTIONS[1];

  return (
    <AnimatePresence>
      {isGameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.85, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="relative w-full max-w-md rounded-[34px] bg-gradient-to-b from-amber-50 via-white to-sky-50 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.5),inset_0_2px_4px_rgba(255,255,255,1)] border-4 border-white text-center overflow-hidden"
          >
            <button
              type="button"
              onClick={() => navigate('/')}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 p-1 shadow-[0_14px_32px_rgba(245,158,11,0.45)] flex items-center justify-center border-4 border-white">
              <Trophy className="w-12 h-12 text-white fill-amber-100 drop-shadow" />
            </div>

            <h2 className="mt-3 text-4xl font-black tracking-tight font-['Fredoka'] bg-gradient-to-b from-amber-400 via-amber-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
              {winnerPlayer.name || 'Player'} Wins!
            </h2>
            <p className="mt-1 text-sm font-extrabold text-slate-700">
              Spectacular Victory!
            </p>

            <div className="mt-5 rounded-2xl bg-white border-2 border-slate-100 p-3.5 shadow-sm flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 text-left">
                <img
                  src={winnerAvatar.src}
                  alt={winnerPlayer.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-extrabold text-slate-900">
                      {winnerPlayer.name}
                    </span>
                    <Crown className="w-4 h-4 fill-amber-400 text-amber-500" />
                  </div>
                  <span className="text-xs font-bold text-amber-600">
                    Winner
                  </span>
                </div>
              </div>

              <div className="h-9 w-[1px] bg-slate-200" />

              <div className="flex items-center gap-2.5 text-right flex-row-reverse">
                <img
                  src={loserAvatar.src}
                  alt={loserPlayer.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 shadow"
                />
                <div>
                  <span className="block text-sm font-extrabold text-slate-700">
                    {loserPlayer.name}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    Runner-up
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  onPlayAgain();
                }}
                className="py-3.5 px-4 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-700 text-white font-extrabold text-sm shadow-[0_10px_22px_rgba(37,99,235,0.38)] flex items-center justify-center gap-2 hover:brightness-105 active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  navigate('/');
                }}
                className="py-3.5 px-4 rounded-2xl bg-white border-2 border-slate-200 text-slate-800 font-extrabold text-sm shadow-sm hover:bg-slate-50 active:scale-95 cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
