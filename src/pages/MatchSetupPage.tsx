import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Dices,
  Eye,
  Palette,
  Pencil,
  Sparkles,
  Volume2,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { PlayerSetupModal } from '../components/modals/PlayerSetupModal';
import { SkinPickerModal } from '../components/modals/SkinPickerModal';
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

const TOKEN_ICON_MAP: Record<string, string> = {
  classic: '♟️',
  knight: '🐴',
  dog: '🐶',
  cat: '🐱',
  panda: '🐼',
  robot: '🤖',
  astronaut: '🧑‍🚀',
  unicorn: '🦄',
  'bamboo-panda': '🎋',
  'cyber-robot': '🦾',
  astronomer: '🔭',
  'star-unicorn': '✨',
  'fire-dragon': '🐉',
  'ice-dragon': '❄️',
  pirate: '🏴‍☠️',
  magician: '🧙',
  alien: '👽',
};

export const MatchSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    updatePlayerConfig,
    selectedBoardTheme,
    setSelectedBoardTheme,
    unlockedBoardThemes,
    soundEnabled,
    toggleSound,
    clearSavedGameSession,
  } = useProfileStore();

  const [editingPlayerModalIdx, setEditingPlayerModalIdx] = useState<0 | 1 | null>(
    null
  );
  const [studioModal, setStudioModal] = useState<{
    isOpen: boolean;
    mode: 'token' | 'dice';
    playerIdx: 0 | 1;
    skinId: string;
  } | null>(null);
  const [validationAlert, setValidationAlert] = useState<string>('');

  const cycleAvatar = (playerIdx: 0 | 1, dir: -1 | 1) => {
    soundManager.play('ui_click');
    const current = players[playerIdx];
    const idx = AVATAR_OPTIONS.findIndex((a) => a.id === current.avatarId);
    const nextIdx = (idx + dir + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
    updatePlayerConfig(playerIdx, { avatarId: AVATAR_OPTIONS[nextIdx].id });
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
    clearSavedGameSession(); // Ensure fresh start
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
    const tokenIcon = TOKEN_ICON_MAP[player.tokenSkin] || '♟️';

    return (
      <div
        className={`relative rounded-[28px] p-4 border-2 border-white shadow-[0_12px_28px_rgba(15,23,42,0.07),inset_0_2px_4px_rgba(255,255,255,0.9)] ${bgTone}`}
      >
        {/* Subtle Corner Position Badge */}
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
            className="relative w-18 h-18 rounded-full p-1 bg-white shadow-lg cursor-pointer group hover:scale-105 transition-transform"
          >
            <img
              src={avatar.src}
              alt={player.name || `Player ${playerIdx + 1}`}
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-blue-600 text-white shadow border-2 border-white flex items-center justify-center">
              <Pencil className="w-3 h-3" />
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

        {/* Editable Player Name Input + Quick Random Name Roll */}
        <div className="mt-2.5 flex items-center justify-center">
          <div className="relative w-56 flex items-center">
            <input
              type="text"
              value={player.name}
              onChange={(e) => {
                updatePlayerConfig(playerIdx, { name: e.target.value });
                if (validationAlert) setValidationAlert('');
              }}
              placeholder={`Enter Player ${playerIdx + 1} Name`}
              maxLength={16}
              className="w-full text-center pl-3 pr-9 py-1.5 rounded-xl bg-white/95 border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none text-sm font-extrabold text-slate-900 placeholder:text-slate-400 shadow-inner"
            />
            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                const randName =
                  FUN_GAMER_NAMES[
                    Math.floor(Math.random() * FUN_GAMER_NAMES.length)
                  ];
                updatePlayerConfig(playerIdx, { name: randName });
                if (validationAlert) setValidationAlert('');
              }}
              title="Roll Random Gamer Name"
              className="absolute right-1.5 w-6 h-6 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
            >
              <Dices className="w-3.5 h-3.5 text-amber-600" />
            </button>
          </div>
        </div>

        {/* 4 Color Selectors (Automatically Pairs Opposite Cross Corner!) */}
        <div className="mt-2.5 flex items-center justify-center gap-3">
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
                className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                  active ? 'scale-125' : 'opacity-65 hover:opacity-100'
                }`}
              >
                <span
                  className={`w-5.5 h-5.5 rounded-full ${COLOR_PALETTE[c].bgClass} border-2 border-white shadow-md`}
                />
                {active && (
                  <span className="absolute -inset-0.5 rounded-full border-2 border-slate-800/80" />
                )}
              </button>
            );
          })}
        </div>

        {/* Dedicated Pro Equipment Loadout Pods (Zero WebGL overhead, One-tap 3D Studio) */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
          {/* Token Slot */}
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              setStudioModal({
                isOpen: true,
                mode: 'token',
                playerIdx,
                skinId: player.tokenSkin,
              });
            }}
            className="p-2 rounded-2xl bg-white/95 border border-slate-200 shadow-sm flex items-center gap-2 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-inner border border-slate-200/60"
              style={{
                background: `radial-gradient(circle, ${COLOR_PALETTE[player.color].primary}25 0%, #f1f5f9 85%)`,
              }}
            >
              {tokenIcon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Token
                </span>
                <span className="text-[9px] font-extrabold text-blue-600 group-hover:underline flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> 3D
                </span>
              </div>
              <span className="block text-xs font-black text-slate-800 truncate">
                {tokenMeta.name}
              </span>
            </div>
          </button>

          {/* Dice Slot */}
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              setStudioModal({
                isOpen: true,
                mode: 'dice',
                playerIdx,
                skinId: player.diceSkin,
              });
            }}
            className="p-2 rounded-2xl bg-white/95 border border-slate-200 shadow-sm flex items-center gap-2 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner border border-slate-200/80 font-black text-sm"
              style={{
                backgroundColor: diceMeta.bodyColor,
                color: diceMeta.pipColor,
              }}
            >
              6
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">
                  Dice
                </span>
                <span className="text-[9px] font-extrabold text-blue-600 group-hover:underline flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" /> 3D
                </span>
              </div>
              <span className="block text-xs font-black text-slate-800 truncate">
                {diceMeta.name}
              </span>
            </div>
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
        title={`Player ${(editingPlayerModalIdx ?? 0) + 1} Profile`}
        subtitle="Edit player name, select 2D avatar & corner color!"
      />

      {/* Universal 3D Studio Modal for Match Setup */}
      <SkinPickerModal
        isOpen={studioModal !== null}
        onClose={() => setStudioModal(null)}
        mode={studioModal?.mode || 'token'}
        targetPlayerIndex={studioModal?.playerIdx}
        initialSkinId={studioModal?.skinId}
        initialColor={
          studioModal?.playerIdx !== undefined
            ? players[studioModal.playerIdx].color
            : 'blue'
        }
      />
    </div>
  );
};
