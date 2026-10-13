import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Dices,
  Palette,
  Pencil,
  Sparkles,
  Volume2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { PlayerSetupModal } from '../components/modals/PlayerSetupModal';
import { TokenPreviewCanvas } from '../components/three/TokenPreviewCanvas';
import {
  AVATAR_OPTIONS,
  BOARD_THEMES,
  COLOR_PALETTE,
  DICE_SKINS,
  TOKEN_SKINS,
} from '../engine/boardConfig';
import { useProfileStore } from '../store/useProfileStore';
import { PlayerColor } from '../types/game';

const CORNER_LABELS: Record<PlayerColor, string> = {
  blue: 'Top-Left Corner',
  green: 'Bottom-Right Corner',
  red: 'Top-Right Corner',
  yellow: 'Bottom-Left Corner',
};

export const MatchSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    updatePlayerConfig,
    selectedBoardTheme,
    setSelectedBoardTheme,
    unlockedBoardThemes,
    unlockedTokenSkins,
    unlockedDiceSkins,
    soundEnabled,
    toggleSound,
  } = useProfileStore();

  const [editingPlayerModalIdx, setEditingPlayerModalIdx] = useState<0 | 1 | null>(
    null
  );
  const [validationAlert, setValidationAlert] = useState<string>('');

  const cycleAvatar = (playerIdx: 0 | 1, dir: -1 | 1) => {
    soundManager.play('ui_click');
    const current = players[playerIdx];
    const idx = AVATAR_OPTIONS.findIndex((a) => a.id === current.avatarId);
    const nextIdx = (idx + dir + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
    updatePlayerConfig(playerIdx, { avatarId: AVATAR_OPTIONS[nextIdx].id });
  };

  const cycleTokenSkin = (playerIdx: 0 | 1) => {
    soundManager.play('ui_click');
    const available = TOKEN_SKINS.filter((s) =>
      unlockedTokenSkins.includes(s.id)
    );
    const current = players[playerIdx];
    const idx = available.findIndex((s) => s.id === current.tokenSkin);
    const next = available[(idx + 1) % available.length] ?? TOKEN_SKINS[0];
    updatePlayerConfig(playerIdx, { tokenSkin: next.id });
  };

  const cycleDiceSkin = (playerIdx: 0 | 1) => {
    soundManager.play('ui_click');
    const available = DICE_SKINS.filter((d) =>
      unlockedDiceSkins.includes(d.id)
    );
    const current = players[playerIdx];
    const idx = available.findIndex((d) => d.id === current.diceSkin);
    const next = available[(idx + 1) % available.length] ?? DICE_SKINS[0];
    updatePlayerConfig(playerIdx, { diceSkin: next.id });
  };

  const handleStartMatch = () => {
    soundManager.play('ui_click');
    const p1Name = players[0]?.name.trim();
    const p2Name = players[1]?.name.trim();

    if (!p1Name) {
      setValidationAlert('Please enter Player 1 Name before starting!');
      setEditingPlayerModalIdx(0);
      return;
    }
    if (!p2Name) {
      setValidationAlert('Please enter Player 2 Name before starting!');
      setEditingPlayerModalIdx(1);
      return;
    }

    setValidationAlert('');
    navigate('/game');
  };

  const renderPlayerCard = (playerIdx: 0 | 1, bgTone: string) => {
    const player = players[playerIdx];
    const avatar =
      AVATAR_OPTIONS.find((a) => a.id === player.avatarId) ??
      AVATAR_OPTIONS[playerIdx];
    const tokenMeta =
      TOKEN_SKINS.find((t) => t.id === player.tokenSkin) ?? TOKEN_SKINS[0];
    const diceMeta =
      DICE_SKINS.find((d) => d.id === player.diceSkin) ?? DICE_SKINS[0];

    return (
      <div
        className={`relative rounded-[28px] p-4 border-2 border-white shadow-[0_12px_28px_rgba(15,23,42,0.07),inset_0_2px_4px_rgba(255,255,255,0.9)] ${bgTone}`}
      >
        {/* Subtle Corner Position Badge (Shows Cross Allocation clearly, no Setup/VIP tag!) */}
        <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-white/85 border border-slate-200/80 text-[10px] font-extrabold text-slate-600">
          {CORNER_LABELS[player.color]}
        </span>

        {/* Avatar Carousel Row */}
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => cycleAvatar(playerIdx, -1)}
            aria-label="Previous Avatar"
            className="w-8 h-8 rounded-full bg-white/85 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            onClick={() => setEditingPlayerModalIdx(playerIdx)}
            className="relative w-20 h-20 rounded-full p-1 bg-white shadow-lg cursor-pointer group"
          >
            <img
              src={avatar.src}
              alt={player.name || `Player ${playerIdx + 1}`}
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow border border-slate-100 flex items-center justify-center">
              <TokenPreviewCanvas
                skin={player.tokenSkin}
                color={player.color}
                className="w-7 h-7"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => cycleAvatar(playerIdx, 1)}
            aria-label="Next Avatar"
            className="w-8 h-8 rounded-full bg-white/85 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Editable Player Name Input (Clean, no tags) */}
        <div className="mt-2.5 flex items-center justify-center">
          <div className="relative w-52">
            <input
              type="text"
              value={player.name}
              onChange={(e) => {
                updatePlayerConfig(playerIdx, { name: e.target.value });
                if (validationAlert) setValidationAlert('');
              }}
              placeholder={`Enter Player ${playerIdx + 1} Name`}
              maxLength={16}
              className="w-full text-center px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none text-base font-extrabold text-slate-900 placeholder:text-slate-400 placeholder:font-semibold"
            />
            <Pencil className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* 4 Color Selectors (Automatically Pairs Opposite Cross Corner!) */}
        <div className="mt-3 flex items-center justify-center gap-3">
          {(['blue', 'red', 'green', 'yellow'] as PlayerColor[]).map((c) => {
            const active = player.color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  updatePlayerConfig(playerIdx, { color: c });
                }}
                className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                  active ? 'scale-125' : 'opacity-65 hover:opacity-100'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full ${COLOR_PALETTE[c].bgClass} border-2 border-white shadow-md`}
                />
                {active && (
                  <span className="absolute -inset-0.5 rounded-full border-2 border-slate-800/80" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Skin & Dice Pills */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
          <button
            type="button"
            onClick={() => cycleTokenSkin(playerIdx)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/85 border border-slate-200/80 flex items-center justify-center gap-1.5 font-bold text-slate-700 hover:bg-white cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span className="truncate">Token: {tokenMeta.name}</span>
          </button>

          <button
            type="button"
            onClick={() => cycleDiceSkin(playerIdx)}
            className="flex-1 py-1.5 px-2.5 rounded-xl bg-white/85 border border-slate-200/80 flex items-center justify-center gap-1.5 font-bold text-slate-700 hover:bg-white cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">Dice: {diceMeta.name}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:rounded-[42px] bg-gradient-to-b from-[#f8faff] via-[#f3f6fc] to-[#eef2f9] sm:shadow-[0_28px_70px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,1)] sm:border-[6px] sm:border-white flex flex-col justify-between p-4 sm:p-5"
      >
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/');
            }}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-extrabold text-slate-900 font-['Fredoka']">
              2 Player Match
            </h1>
            <p className="text-[11px] font-semibold text-slate-500">
              Cross Corner Allocation • Same Device
            </p>
          </div>
          <div className="w-10" />
        </header>

        <div className="my-2 space-y-2.5 flex-1 flex flex-col justify-center">
          {renderPlayerCard(
            0,
            'bg-gradient-to-b from-sky-100/90 via-blue-50/80 to-white'
          )}

          <div className="flex items-center justify-center -my-1 z-10">
            <div className="px-4 py-1 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white font-black text-base tracking-wider shadow-md border-2 border-white font-['Fredoka']">
              VS
            </div>
          </div>

          {renderPlayerCard(
            1,
            'bg-gradient-to-b from-emerald-100/90 via-green-50/80 to-white'
          )}

          <div className="rounded-2xl bg-white/90 border border-slate-200/80 p-3 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-extrabold text-slate-700">
                  Game Theme
                </span>
              </div>
              <div className="flex items-center gap-1">
                {BOARD_THEMES.filter((b) =>
                  unlockedBoardThemes.includes(b.id)
                ).map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      setSelectedBoardTheme(b.id);
                    }}
                    className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      selectedBoardTheme === b.id
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-extrabold text-slate-700">
                  Sound & Music
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {validationAlert && (
            <p className="text-center text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl py-2 px-3">
              {validationAlert}
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="button"
          onClick={handleStartMatch}
          className="w-full py-4 rounded-[26px] bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white font-extrabold text-lg font-['Fredoka'] shadow-[0_14px_30px_rgba(37,99,235,0.42),inset_0_2px_3px_rgba(255,255,255,0.5)] border-2 border-blue-400 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Start Game</span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </motion.button>
      </motion.div>

      <PlayerSetupModal
        isOpen={editingPlayerModalIdx !== null}
        onClose={() => setEditingPlayerModalIdx(null)}
        targetPlayerIndex={editingPlayerModalIdx ?? 0}
        title={`Player ${(editingPlayerModalIdx ?? 0) + 1} Setup`}
        subtitle="Enter player name, select 3D avatar, dice skin & token animation style!"
      />
    </div>
  );
};
