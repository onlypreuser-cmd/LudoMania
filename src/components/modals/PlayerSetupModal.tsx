import { AnimatePresence, motion } from 'framer-motion';
import { Check, Dices, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { soundManager } from '../../audio/soundManager';
import {
  AVATAR_OPTIONS,
  COLOR_PALETTE,
  CROSS_OPPOSITE_COLOR,
} from '../../engine/boardConfig';
import { useProfileStore } from '../../store/useProfileStore';
import {
  AvatarId,
  DiceSkinId,
  PlayerColor,
  TokenSkinId,
} from '../../types/game';

const FUN_GAMER_NAMES = [
  'ThunderAce',
  'DiceMaster',
  'PandaKing',
  'GoldenRoll',
  'ShadowNinja',
  'StarStriker',
  'TitanClaw',
  'MysticRoll',
  'CyberHero',
  'DragonLord',
  'LuckyStrike',
  'SpeedyPawn',
];

interface PlayerSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  targetPlayerIndex?: 0 | 1;
  title?: string;
  subtitle?: string;
}

export const PlayerSetupModal: React.FC<PlayerSetupModalProps> = ({
  isOpen,
  onClose,
  targetPlayerIndex = 0,
  title = 'Player Setup',
  subtitle = 'Enter your name, pick your 3D avatar, dice skin & token style before rolling!',
}) => {
  const {
    players,
    unlockedTokenSkins,
    unlockedDiceSkins,
    completeInitialSetup,
    updatePlayerConfig,
    hasCompletedSetup,
  } = useProfileStore();

  const currentTarget = players[targetPlayerIndex] ?? players[0];

  const [name, setName] = useState<string>(currentTarget.name || '');
  const [avatarId, setAvatarId] = useState<AvatarId>(
    currentTarget.avatarId || (targetPlayerIndex === 0 ? 'avatar-1' : 'avatar-2')
  );
  const [color, setColor] = useState<PlayerColor>(
    currentTarget.color || (targetPlayerIndex === 0 ? 'blue' : 'green')
  );
  const [tokenSkin, setTokenSkin] = useState<TokenSkinId>(
    currentTarget.tokenSkin || 'classic'
  );
  const [diceSkin, setDiceSkin] = useState<DiceSkinId>(
    currentTarget.diceSkin || 'classic-white'
  );
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen && currentTarget) {
      setName(currentTarget.name || '');
      setAvatarId(currentTarget.avatarId);
      setColor(currentTarget.color);
      setTokenSkin(currentTarget.tokenSkin);
      setDiceSkin(currentTarget.diceSkin);
      setError('');
    }
  }, [isOpen, targetPlayerIndex, currentTarget]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter player name to continue!');
      return;
    }

    soundManager.play('ui_click');

    if (targetPlayerIndex === 0 && !hasCompletedSetup) {
      completeInitialSetup({
        name: trimmed,
        avatar: avatarId,
        diceSkin,
        tokenSkin,
        color,
      });
    } else {
      updatePlayerConfig(targetPlayerIndex, {
        name: trimmed,
        avatarId,
        color,
        tokenSkin,
        diceSkin,
      });
    }

    setError('');
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative w-full max-w-md rounded-[32px] bg-gradient-to-b from-white via-sky-50/90 to-indigo-50/95 p-5 sm:p-6 shadow-[0_24px_60px_rgba(15,23,42,0.45),inset_0_2px_4px_rgba(255,255,255,1)] border-4 border-white text-slate-800 max-h-[92vh] overflow-y-auto"
          >
            <div className="mb-4">
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900 font-['Fredoka']">
                {title}
              </h2>
              <p className="text-xs font-medium text-slate-500 leading-snug">
                {subtitle}
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* 1. Custom Player Name Input (Clean, no tags/badges) */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Player Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter player name..."
                    maxLength={18}
                    autoFocus
                    className="w-full pl-4 pr-12 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none text-base font-bold text-slate-900 placeholder:text-slate-400 shadow-inner transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      const randName =
                        FUN_GAMER_NAMES[
                          Math.floor(Math.random() * FUN_GAMER_NAMES.length)
                        ];
                      setName(randName);
                      if (error) setError('');
                    }}
                    title="Roll Random Gamer Name"
                    className="absolute right-2.5 w-8 h-8 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Dices className="w-4 h-4 text-amber-600" />
                  </button>
                </div>
                {error && (
                  <p className="mt-1 text-xs font-bold text-rose-600">
                    {error}
                  </p>
                )}
              </div>

              {/* 2. Cropped PNG 3D Avatar Selector */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((av) => {
                    const selected = avatarId === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => {
                          soundManager.play('ui_click');
                          setAvatarId(av.id);
                        }}
                        className={`relative rounded-2xl p-0.5 transition-all cursor-pointer ${
                          selected
                            ? 'ring-3 ring-blue-500 scale-105 shadow-md'
                            : 'opacity-80 hover:opacity-100 hover:scale-105'
                        }`}
                      >
                        <img
                          src={av.src}
                          alt={av.name}
                          className="w-full aspect-square rounded-[14px] object-cover shadow-sm"
                        />
                        {selected && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Cross Corner Color */}
              <div className="rounded-2xl bg-white/90 border border-slate-200/80 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Cross Corner Color
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      Opponent gets {COLOR_PALETTE[CROSS_OPPOSITE_COLOR[color]].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['blue', 'red', 'green', 'yellow'] as PlayerColor[]).map(
                      (c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => {
                            soundManager.play('ui_click');
                            setColor(c);
                          }}
                          title={`${COLOR_PALETTE[c].label} Corner`}
                          className={`w-7 h-7 rounded-full ${
                            COLOR_PALETTE[c].bgClass
                          } border-2 border-white shadow transition-transform cursor-pointer ${
                            color === c
                              ? 'scale-125 ring-2 ring-slate-800'
                              : 'opacity-70 hover:opacity-100'
                          }`}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:to-blue-600 active:scale-[0.99] text-white font-extrabold text-base shadow-[0_10px_20px_rgba(37,99,235,0.35),inset_0_2px_2px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer font-['Fredoka']"
              >
                <UserCheck className="w-5 h-5" />
                <span>Save Profile</span>
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
