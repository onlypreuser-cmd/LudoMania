import { AnimatePresence, motion } from 'framer-motion';
import { Check, Dices, Sparkles, UserCheck } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { soundManager } from '../../audio/soundManager';
import {
  AVATAR_OPTIONS,
  COLOR_PALETTE,
  CROSS_OPPOSITE_COLOR,
  DICE_SKINS,
  TOKEN_SKINS,
} from '../../engine/boardConfig';
import { useProfileStore } from '../../store/useProfileStore';
import {
  AvatarId,
  DiceSkinId,
  PlayerColor,
  TokenSkinId,
} from '../../types/game';
import { TokenPreviewCanvas } from '../three/TokenPreviewCanvas';

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

  const activeTokenMeta =
    TOKEN_SKINS.find((t) => t.id === tokenSkin) ?? TOKEN_SKINS[0];

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
                  className="w-full px-4 py-3 rounded-2xl bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 outline-none text-base font-bold text-slate-900 placeholder:text-slate-400 shadow-inner transition-all"
                />
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

              {/* 3. Cross Corner Color & 3D Token Picker */}
              <div className="rounded-2xl bg-white/90 border border-slate-200/80 p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                      Token & Cross Color
                    </span>
                    <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Move: {activeTokenMeta.moveStyleName}
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
                          title={`${COLOR_PALETTE[c].label} (Opponent gets ${
                            COLOR_PALETTE[CROSS_OPPOSITE_COLOR[c]].label
                          })`}
                          className={`w-6 h-6 rounded-full ${
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

                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-sky-100 to-indigo-100 border border-sky-200 flex items-center justify-center shrink-0 shadow-inner">
                    <TokenPreviewCanvas
                      skin={tokenSkin}
                      color={color}
                      className="w-18 h-18"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 flex-1 max-h-32 overflow-y-auto pr-1">
                    {TOKEN_SKINS.filter((s) =>
                      unlockedTokenSkins.includes(s.id)
                    ).map((s) => {
                      const active = tokenSkin === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            soundManager.play('ui_click');
                            setTokenSkin(s.id);
                          }}
                          className={`px-2 py-1.5 rounded-xl text-center border text-[11px] font-bold truncate transition-all cursor-pointer ${
                            active
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4. Dice Skin Selector */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  <Dices className="w-3.5 h-3.5 text-amber-500" />
                  Select Dice Skin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DICE_SKINS.filter((d) =>
                    unlockedDiceSkins.includes(d.id)
                  ).map((d) => {
                    const selected = diceSkin === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          soundManager.play('ui_click');
                          setDiceSkin(d.id);
                        }}
                        className={`flex items-center gap-2 p-2 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                          selected
                            ? 'border-blue-500 bg-blue-50/80 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-7 h-7 rounded-lg border border-slate-300 shadow-inner flex items-center justify-center shrink-0"
                          style={{ backgroundColor: d.bodyColor }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: d.pipColor }}
                          />
                        </span>
                        <span className="text-xs font-extrabold text-slate-800 truncate">
                          {d.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 hover:from-blue-400 hover:to-blue-600 active:scale-[0.99] text-white font-extrabold text-base shadow-[0_10px_20px_rgba(37,99,235,0.35),inset_0_2px_2px_rgba(255,255,255,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <UserCheck className="w-5 h-5" />
                Save Player Setup
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
