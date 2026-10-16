import { motion } from 'framer-motion';
import {
  Bot,
  ChevronLeft,
  ChevronRight,
  Dices,
  Eye,
  Flame,
  Palette,
  Pencil,
  Sparkles,
  User,
  Users,
  Volume2,
  Zap,
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
import { AiDifficulty, MatchMode, PlayerColor } from '../types/game';

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

const BOT_NAMES = [
  'RoboMaster',
  'CyberNinja',
  'TitanClaw',
  'ShadowBot',
  'AlphaDice',
  'QuantumPawn',
  'MechaKnight',
  'VortexAI',
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
  ninja: '🥷',
  astronomer: '🔭',
  'star-unicorn': '✨',
  'fire-dragon': '🐉',
  'ice-dragon': '❄️',
  pirate: '🏴‍☠️',
  magician: '🧙',
  alien: '👽',
};

const CARD_TONES: string[] = [
  'bg-gradient-to-b from-sky-100/90 via-blue-50/80 to-white',
  'bg-gradient-to-b from-rose-100/90 via-red-50/80 to-white',
  'bg-gradient-to-b from-emerald-100/90 via-green-50/80 to-white',
  'bg-gradient-to-b from-amber-100/90 via-yellow-50/80 to-white',
];

export const MatchSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    updatePlayerConfig,
    matchMode,
    setMatchMode,
    pawnCount,
    setPawnCount,
    selectedBoardTheme,
    setSelectedBoardTheme,
    unlockedBoardThemes,
    soundEnabled,
    toggleSound,
    clearSavedGameSession,
  } = useProfileStore();

  const [editingPlayerModalIdx, setEditingPlayerModalIdx] = useState<number | null>(
    null
  );
  const [studioModal, setStudioModal] = useState<{
    isOpen: boolean;
    mode: 'token' | 'dice';
    playerIdx: number;
    skinId: string;
  } | null>(null);
  const [validationAlert, setValidationAlert] = useState<string>('');

  const cycleAvatar = (playerIdx: number, dir: -1 | 1) => {
    soundManager.play('ui_click');
    const current = players[playerIdx];
    if (!current) return;
    const idx = AVATAR_OPTIONS.findIndex((a) => a.id === current.avatarId);
    const nextIdx = (idx + dir + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
    updatePlayerConfig(playerIdx, { avatarId: AVATAR_OPTIONS[nextIdx].id });
  };

  const toggleBotOrHuman = (playerIdx: number) => {
    soundManager.play('ui_click');
    const current = players[playerIdx];
    if (!current) return;
    const willBeAi = !current.isAi;
    if (willBeAi) {
      const botName =
        BOT_NAMES[playerIdx % BOT_NAMES.length] || `Bot ${playerIdx + 1}`;
      updatePlayerConfig(playerIdx, {
        isAi: true,
        name: botName,
        aiDifficulty: current.aiDifficulty || 'hard',
      });
    } else {
      updatePlayerConfig(playerIdx, {
        isAi: false,
        name: `Player ${playerIdx + 1}`,
      });
    }
  };

  const cycleBotDifficulty = (playerIdx: number) => {
    soundManager.play('ui_click');
    const current = players[playerIdx];
    if (!current || !current.isAi) return;
    const diffs: AiDifficulty[] = ['easy', 'medium', 'hard'];
    const currentIdx = diffs.indexOf(current.aiDifficulty || 'hard');
    const nextDiff = diffs[(currentIdx + 1) % diffs.length];
    updatePlayerConfig(playerIdx, { aiDifficulty: nextDiff });
  };

  const handleStartMatch = () => {
    soundManager.play('ui_click');

    // Validation: make sure all human players have entered a name
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      if (!p.isAi && !p.name?.trim()) {
        setValidationAlert(`Please enter Player ${i + 1} Name before starting!`);
        setEditingPlayerModalIdx(i);
        return;
      }
    }

    setValidationAlert('');
    clearSavedGameSession(); // Ensure fresh start
    navigate('/game');
  };

  const renderPlayerCard = (playerIdx: number, bgTone: string) => {
    const player = players[playerIdx];
    if (!player) return null;

    const avatar =
      AVATAR_OPTIONS.find((a) => a.id === player.avatarId) ??
      AVATAR_OPTIONS[playerIdx % AVATAR_OPTIONS.length];
    const tokenMeta =
      TOKEN_SKINS.find((t) => t.id === player.tokenSkin) ?? TOKEN_SKINS[0];
    const diceMeta =
      DICE_SKINS.find((d) => d.id === player.diceSkin) ?? DICE_SKINS[0];
    const tokenIcon = TOKEN_ICON_MAP[player.tokenSkin] || '♟️';
    const isBot = Boolean(player.isAi);

    return (
      <div
        key={`setup-player-${player.id}-${playerIdx}`}
        className={`relative rounded-[26px] p-3.5 border-2 border-white shadow-[0_10px_24px_rgba(15,23,42,0.06),inset_0_2px_4px_rgba(255,255,255,0.9)] ${bgTone}`}
      >
        {/* Top Header Row in Card: Corner Label + Human/Bot Toggle */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/85 border border-slate-200/80 text-[10px] font-extrabold text-slate-700 shadow-xs">
            {CORNER_LABELS[player.color]}
          </span>

          {/* Player 1 is primary user; Players 2, 3, 4 can toggle between Human & Bot */}
          {playerIdx > 0 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toggleBotOrHuman(playerIdx)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 shadow-xs ${
                  isBot
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
                title="Toggle between Human player and Autonomous AI Bot"
              >
                {isBot ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                <span>{isBot ? 'Bot' : 'Human'}</span>
              </button>

              {isBot && (
                <button
                  type="button"
                  onClick={() => cycleBotDifficulty(playerIdx)}
                  className="px-2 py-0.5 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[9px] font-black tracking-wider uppercase cursor-pointer"
                  title="Click to change Bot difficulty (Easy, Medium, Hard)"
                >
                  {player.aiDifficulty || 'hard'}
                </button>
              )}
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-[10px] font-black text-blue-800">
              You (Host)
            </span>
          )}
        </div>

        {/* Avatar Carousel Row */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => cycleAvatar(playerIdx, -1)}
            aria-label="Previous Avatar"
            className="w-7 h-7 rounded-full bg-white/85 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            onClick={() => setEditingPlayerModalIdx(playerIdx)}
            className="relative w-16 h-16 rounded-full p-1 bg-white shadow-md cursor-pointer group hover:scale-105 transition-transform"
          >
            <img
              src={avatar.src}
              alt={player.name || `Player ${playerIdx + 1}`}
              className="w-full h-full rounded-full object-cover"
            />
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-blue-600 text-white shadow border-2 border-white flex items-center justify-center">
              <Pencil className="w-2.5 h-2.5" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => cycleAvatar(playerIdx, 1)}
            aria-label="Next Avatar"
            className="w-7 h-7 rounded-full bg-white/85 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Editable Player Name Input + Quick Random Name Roll */}
        <div className="mt-2 flex items-center justify-center">
          <div className="relative w-52 flex items-center">
            <input
              type="text"
              value={player.name}
              onChange={(e) => {
                updatePlayerConfig(playerIdx, { name: e.target.value });
                if (validationAlert) setValidationAlert('');
              }}
              placeholder={isBot ? 'Bot Name' : `Player ${playerIdx + 1} Name`}
              maxLength={16}
              className="w-full text-center pl-3 pr-8 py-1 rounded-xl bg-white/95 border border-slate-200/90 focus:border-blue-500 focus:ring-2 focus:ring-blue-400/20 outline-none text-xs font-black text-slate-900 placeholder:text-slate-400 shadow-inner"
            />
            {!isBot && (
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
                className="absolute right-1 w-5 h-5 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-800 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              >
                <Dices className="w-3 h-3 text-amber-600" />
              </button>
            )}
          </div>
        </div>

        {/* Color Selectors (In 2P mode, automatically pairs opposite cross corner!) */}
        {matchMode === 'duo' && (
          <div className="mt-2 flex items-center justify-center gap-2.5">
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
                  className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                    active ? 'scale-125' : 'opacity-65 hover:opacity-100'
                  }`}
                >
                  <span
                    className={`w-4.5 h-4.5 rounded-full ${COLOR_PALETTE[c].bgClass} border-2 border-white shadow-md`}
                  />
                  {active && (
                    <span className="absolute -inset-0.5 rounded-full border-2 border-slate-800/80" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dedicated Equipment Loadout Pods (One-tap 3D Studio Preview) */}
        <div className="mt-2.5 pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
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
            className="p-1.5 rounded-xl bg-white/95 border border-slate-200 shadow-sm flex items-center gap-1.5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 shadow-inner border border-slate-200/60"
              style={{
                background: `radial-gradient(circle, ${COLOR_PALETTE[player.color].primary}25 0%, #f1f5f9 85%)`,
              }}
            >
              {tokenIcon}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">
                Token
              </span>
              <span className="block text-[11px] font-black text-slate-800 truncate">
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
            className="p-1.5 rounded-xl bg-white/95 border border-slate-200 shadow-sm flex items-center gap-1.5 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer text-left group"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-inner border border-slate-200/80 font-black text-xs"
              style={{
                backgroundColor: diceMeta.bodyColor,
                color: diceMeta.pipColor,
              }}
            >
              6
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[8px] font-black uppercase tracking-wider text-slate-400">
                Dice
              </span>
              <span className="block text-[11px] font-black text-slate-800 truncate">
                {diceMeta.name}
              </span>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-0 sm:p-4 select-none">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[860px] sm:rounded-[42px] bg-gradient-to-b from-[#f8faff] via-[#f3f6fc] to-[#eef2f9] sm:shadow-[0_28px_70px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,1)] sm:border-[6px] sm:border-white flex flex-col justify-between p-3.5 sm:p-4"
      >
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/');
            }}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Mode Switcher Pill (2 Players vs 4 Players) */}
          <div className="flex items-center p-1 rounded-full bg-slate-200/80 border border-slate-300 shadow-inner">
            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                setMatchMode('duo');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                matchMode === 'duo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Duo (1v1)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                setMatchMode('four-player');
              }}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                matchMode === 'four-player'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>4 Players</span>
            </button>
          </div>

          <div className="w-9" />
        </header>

        {/* Subheader: Blitz vs Classic Toggle (in Duo mode) */}
        {matchMode === 'duo' && (
          <div className="mt-2 flex items-center justify-center">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-white/80 border border-slate-200 shadow-xs">
              <button
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  setPawnCount(2);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                  pawnCount === 2
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>⚡ Blitz Duo (2 Pawns)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  setPawnCount(4);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                  pawnCount === 4
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>🏆 Classic (4 Pawns)</span>
              </button>
            </div>
          </div>
        )}

        {/* Players Container */}
        <div className="my-2 space-y-2 flex-1 flex flex-col justify-center overflow-y-auto max-h-[520px] pr-0.5">
          {matchMode === 'duo' ? (
            <>
              {renderPlayerCard(0, CARD_TONES[0])}
              <div className="flex items-center justify-center -my-1 z-10">
                <div className="px-3.5 py-0.5 rounded-full bg-gradient-to-b from-amber-400 to-orange-500 text-white font-black text-sm tracking-wider shadow-md border-2 border-white font-['Fredoka']">
                  VS
                </div>
              </div>
              {renderPlayerCard(1, CARD_TONES[2])}
            </>
          ) : (
            <div className="space-y-2">
              {players.map((_, idx) =>
                renderPlayerCard(idx, CARD_TONES[idx % CARD_TONES.length])
              )}
            </div>
          )}

          {/* Board Theme & Sound Bar */}
          <div className="rounded-2xl bg-white/90 border border-slate-200/80 p-2.5 shadow-sm space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[11px] font-extrabold text-slate-700">
                  Theme
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
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                      selectedBoardTheme === b.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {b.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-[11px] font-extrabold text-slate-700">
                  Sound
                </span>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                  soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {validationAlert && (
            <p className="text-center text-xs font-extrabold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl py-1.5 px-3">
              {validationAlert}
            </p>
          )}
        </div>

        {/* Start Game CTA */}
        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          type="button"
          onClick={handleStartMatch}
          className="w-full py-3.5 rounded-[24px] bg-gradient-to-b from-blue-500 via-blue-600 to-blue-700 text-white font-extrabold text-base font-['Fredoka'] shadow-[0_12px_28px_rgba(37,99,235,0.40),inset_0_2px_3px_rgba(255,255,255,0.5)] border-2 border-blue-400 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>
            {matchMode === 'four-player'
              ? 'Start 4-Player Battle'
              : pawnCount === 2
              ? 'Start Blitz Duo Match'
              : 'Start Duo Match'}
          </span>
          <ChevronRight className="w-5 h-5 stroke-[3]" />
        </motion.button>
      </motion.div>

      <PlayerSetupModal
        isOpen={editingPlayerModalIdx !== null}
        onClose={() => setEditingPlayerModalIdx(null)}
        targetPlayerIndex={editingPlayerModalIdx ?? 0}
        title={`Player ${(editingPlayerModalIdx ?? 0) + 1} Profile`}
        subtitle="Edit player name, select avatar & customize colors!"
      />

      <SkinPickerModal
        isOpen={studioModal !== null}
        onClose={() => setStudioModal(null)}
        mode={studioModal?.mode || 'token'}
        targetPlayerIndex={studioModal?.playerIdx}
        initialSkinId={studioModal?.skinId}
        initialColor={
          studioModal?.playerIdx !== undefined
            ? players[studioModal.playerIdx]?.color || 'blue'
            : 'blue'
        }
      />
    </div>
  );
};
