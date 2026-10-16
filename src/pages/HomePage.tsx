import { motion } from 'framer-motion';
import {
  BookOpen,
  Bot,
  ChevronRight,
  Flame,
  Home,
  Palette,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  Video,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { Home3DHeroPod } from '../components/home/Home3DHeroPod';
import { RulesAndPerksModal } from '../components/modals/RulesAndPerksModal';
import { SkinPickerModal } from '../components/modals/SkinPickerModal';
import { AVATAR_OPTIONS, CROSS_OPPOSITE_COLOR } from '../engine/boardConfig';
import { useProfileStore } from '../store/useProfileStore';
import { PlayerConfig } from '../types/game';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Profile and Progression State
  const userName = useProfileStore((s) => s.userName);
  const userAvatar = useProfileStore((s) => s.userAvatar);
  const coins = useProfileStore((s) => s.coins);
  const playerLevel = useProfileStore((s) => s.playerLevel);
  const playerXp = useProfileStore((s) => s.playerXp);
  const playerXpToNextLevel = useProfileStore((s) => s.playerXpToNextLevel);
  const winStreak = useProfileStore((s) => s.winStreak);
  const preferredColor = useProfileStore((s) => s.preferredColor);
  const selectedTokenSkin = useProfileStore((s) => s.selectedTokenSkin);
  const selectedDiceSkin = useProfileStore((s) => s.selectedDiceSkin);
  const players = useProfileStore((s) => s.players);
  const setPlayers = useProfileStore((s) => s.setPlayers);
  const soundEnabled = useProfileStore((s) => s.soundEnabled);
  const toggleSound = useProfileStore((s) => s.toggleSound);
  const actionCameraEnabled = useProfileStore((s) => s.actionCameraEnabled);
  const toggleActionCamera = useProfileStore((s) => s.toggleActionCamera);
  const savedGameSession = useProfileStore((s) => s.savedGameSession);
  const clearSavedGameSession = useProfileStore((s) => s.clearSavedGameSession);

  // Modals & UI States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isSkinPickerOpen, setIsSkinPickerOpen] = useState(false);

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === userAvatar) ?? AVATAR_OPTIONS[0];

  // Calculated XP percentage for progress bar
  const xpPercent = Math.min(
    100,
    Math.max(5, Math.round((playerXp / (playerXpToNextLevel || 600)) * 100))
  );

  // Mode 1: Quick Play (1 vs 1 Cross Duel)
  const handleQuickPlay = () => {
    soundManager.play('ui_click');
    const p1: PlayerConfig = {
      id: 'p1',
      name: userName.trim() ? userName : 'Player 1',
      avatarId: userAvatar || 'avatar-1',
      color: preferredColor || 'blue',
      tokenSkin: selectedTokenSkin,
      diceSkin: selectedDiceSkin,
    };
    const crossColor = CROSS_OPPOSITE_COLOR[p1.color] || 'green';
    const p2: PlayerConfig = {
      id: 'p2',
      name: players[1]?.name?.trim() ? players[1].name : 'Challenger',
      avatarId: players[1]?.avatarId || 'avatar-2',
      color: crossColor,
      tokenSkin: players[1]?.tokenSkin || 'dog',
      diceSkin: players[1]?.diceSkin || 'royal-gold',
    };
    setPlayers([p1, p2]);
    navigate('/setup');
  };

  // Mode 2: 4-Player Battle (Pass & Play)
  const handle4PlayerBattle = () => {
    soundManager.play('ui_click');
    const p1: PlayerConfig = {
      id: 'p1',
      name: userName.trim() ? userName : 'Player 1',
      avatarId: userAvatar || 'avatar-1',
      color: 'blue',
      tokenSkin: selectedTokenSkin,
      diceSkin: selectedDiceSkin,
    };
    const p2: PlayerConfig = {
      id: 'p2',
      name: 'Player 2',
      avatarId: 'avatar-2',
      color: 'red',
      tokenSkin: 'knight',
      diceSkin: 'ruby-blaze',
    };
    const p3: PlayerConfig = {
      id: 'p3',
      name: 'Player 3',
      avatarId: 'avatar-3',
      color: 'green',
      tokenSkin: 'dog',
      diceSkin: 'emerald-jade',
    };
    const p4: PlayerConfig = {
      id: 'p4',
      name: 'Player 4',
      avatarId: 'avatar-4',
      color: 'yellow',
      tokenSkin: 'cat',
      diceSkin: 'royal-gold',
    };
    setPlayers([p1, p2, p3, p4]);
    navigate('/setup');
  };

  // Mode 3: Solo AI Rush
  const handleSoloAI = () => {
    soundManager.play('ui_click');
    const p1: PlayerConfig = {
      id: 'p1',
      name: userName.trim() ? userName : 'Player 1',
      avatarId: userAvatar || 'avatar-1',
      color: preferredColor || 'blue',
      tokenSkin: selectedTokenSkin,
      diceSkin: selectedDiceSkin,
    };
    const crossColor = CROSS_OPPOSITE_COLOR[p1.color] || 'green';
    const p2: PlayerConfig = {
      id: 'p2',
      name: 'RoboMaster [AI]',
      avatarId: 'avatar-6',
      color: crossColor,
      tokenSkin: 'robot',
      diceSkin: 'cyber-neon',
    };
    setPlayers([p1, p2]);
    navigate('/setup');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-0 sm:p-4 select-none">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[850px] sm:rounded-[42px] bg-gradient-to-b from-[#f8faff] via-[#f3f6fc] to-[#eef2f9] sm:shadow-[0_28px_70px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,1)] sm:border-[6px] sm:border-white flex flex-col justify-between p-4 sm:p-5 overflow-hidden"
      >
        {/* ========================================================================= */}
        {/* 1. GLASSMORPHIC FLOATING TOP BAR: Profile + Level + Coins + Streak + Gear */}
        {/* ========================================================================= */}
        <header className="relative z-20 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            {/* Player Avatar with Golden Rank Ring & Level Progress */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate('/setup')}
                className="relative cursor-pointer group"
                title="Player Profile"
              >
                {/* Golden Rank Ring */}
                <div className="w-12 h-12 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.45)] group-hover:scale-105 transition-transform">
                  <img
                    src={currentAvatar.src}
                    alt={userName || 'Player'}
                    className="w-full h-full rounded-full object-cover border-2 border-white"
                  />
                </div>
                {/* Rank Badge */}
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-[8px] font-black text-amber-950 border border-white shadow-xs">
                  GOLD
                </span>
              </div>

              {/* Player Nickname & Level Badge with XP Bar */}
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-extrabold text-slate-900 leading-tight truncate max-w-[110px]">
                    {userName.trim() ? userName : 'Challenger'}
                  </h1>
                  <span className="px-1.5 py-0.5 rounded-md bg-blue-600 text-[9px] font-black text-white shadow-xs">
                    Lv. {playerLevel}
                  </span>
                </div>
                {/* Mini XP Progress Bar */}
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="w-18 h-1.5 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
                      style={{ width: `${xpPercent}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400">
                    {playerXp}/{playerXpToNextLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right: Coins Wallet Pill + Win Streak + Settings Button */}
            <div className="flex items-center gap-1.5">
              {/* Coins Wallet Pill */}
              <button
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  navigate('/customize');
                }}
                className="px-2.5 py-1 rounded-full bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300/80 text-amber-900 font-black text-xs shadow-xs flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 active:scale-95"
                title="Player Coins (Tap to visit Skin Studio)"
              >
                <span>🪙</span>
                <span>{coins.toLocaleString()}</span>
              </button>

              {/* Win Streak Badge */}
              <div
                className="px-2 py-1 rounded-full bg-orange-100/90 border border-orange-300/80 text-orange-700 font-black text-xs shadow-xs flex items-center gap-1"
                title={`Current Win Streak: ${winStreak}`}
              >
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-pulse" />
                <span>{winStreak}</span>
              </div>

              {/* Settings Gear Button */}
              <button
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  setIsSettingsOpen((v) => !v);
                }}
                aria-label="Game Settings"
                className="w-8 h-8 rounded-full bg-white/95 border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Settings Popover */}
          {isSettingsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white/95 border border-slate-200 p-3 shadow-xl space-y-2 z-30"
            >
              {/* Sound Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-extrabold text-slate-800">
                    Audio & Sfx
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

              {/* Action Camera Toggle */}
              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-extrabold text-slate-800">
                    Action Dynamic Cam
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleActionCamera}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    actionCameraEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      actionCameraEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Rules & Perks Shortcut */}
              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800">
                  Rulebook & Board Abilities
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsRulesModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  View Rules
                </button>
              </div>
            </motion.div>
          )}
        </header>

        {/* ========================================================================= */}
        {/* 2. HERO CENTERPIECE: Dedicated 3D Interactive Hero Pod */}
        {/* ========================================================================= */}
        <section className="my-2 relative z-10">
          <Home3DHeroPod onOpenCustomize={() => setIsSkinPickerOpen(true)} />
        </section>

        {/* ========================================================================= */}
        {/* 3. UNFINISHED MATCH LIVE RESUME BANNER (Conditional) */}
        {/* ========================================================================= */}
        {savedGameSession &&
          (savedGameSession.pawns.some((p) => p.step > -1) ||
            savedGameSession.turnNumber > 1) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="my-1.5 rounded-[22px] p-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-[0_12px_26px_rgba(249,115,22,0.32)] border-2 border-white/80 flex flex-col gap-2 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping" />
                  <span className="text-[10px] font-black tracking-wider uppercase text-amber-100">
                    Live Saved Match
                  </span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-sm">
                  Turn {savedGameSession.turnNumber}
                </span>
              </div>

              <div className="flex items-center justify-between px-0.5">
                <div className="text-left">
                  <p className="text-xs font-black truncate max-w-[210px]">
                    {savedGameSession.players[0]?.name || 'Player 1'} vs{' '}
                    {savedGameSession.players[1]?.name || 'Player 2'}
                  </p>
                  <p className="text-[10px] text-white/85 font-semibold">
                    {savedGameSession.players[savedGameSession.currentPlayerIndex]
                      ?.name || 'Current Player'}
                    's Turn
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      navigate('/game');
                    }}
                    className="py-1.5 px-3 rounded-xl bg-white text-slate-900 font-extrabold text-[11px] shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-600 stroke-[2.8]" />
                    <span>Resume</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      clearSavedGameSession();
                    }}
                    className="py-1.5 px-2 rounded-xl bg-black/30 hover:bg-black/45 text-white/90 font-bold text-[11px] backdrop-blur-sm transition-all cursor-pointer"
                    title="Discard Saved Match"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        {/* ========================================================================= */}
        {/* 4. STREAMLINED GAME MODE CARDS */}
        {/* ========================================================================= */}
        <div className="space-y-2 z-10">
          {/* Mode 1: Quick Play (1 vs 1 Duel) - Primary Gold CTA Button */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={handleQuickPlay}
            className="w-full p-3.5 rounded-[24px] bg-gradient-to-r from-amber-400 via-amber-300 to-orange-400 border-2 border-amber-200 shadow-[0_12px_28px_rgba(245,158,11,0.40),inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-2xl bg-white/40 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/60">
                <Play className="w-6 h-6 fill-amber-950 text-amber-950 ml-0.5 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-slate-950 font-['Fredoka'] tracking-tight">
                    Quick Play (1 vs 1 Duel)
                  </span>
                  <span className="px-1.5 py-0.2 rounded-md bg-amber-600 text-[9px] font-black text-white shadow-xs">
                    POPULAR
                  </span>
                </div>
                <span className="block text-[11px] font-extrabold text-amber-950/80">
                  Cross-Corner Clash • 2 Players
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/85 flex items-center justify-center text-slate-900 shadow group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-5 h-5 stroke-[2.8]" />
            </div>
          </motion.button>

          {/* 2-Column Split for Secondary Modes */}
          <div className="grid grid-cols-2 gap-2">
            {/* Mode 2: 4-Player Battle (Pass & Play) */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handle4PlayerBattle}
              className="p-3 rounded-[20px] bg-white/95 border-2 border-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] flex flex-col justify-between text-left cursor-pointer hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-sm shadow-emerald-500/25">
                  <Users className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="mt-2">
                <span className="block text-xs font-black text-slate-900 font-['Fredoka']">
                  4-Player Battle
                </span>
                <span className="block text-[10px] font-bold text-slate-500">
                  Pass & Play (4 Corners)
                </span>
              </div>
            </motion.button>

            {/* Mode 3: Solo AI Rush */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleSoloAI}
              className="p-3 rounded-[20px] bg-white/95 border-2 border-white shadow-[0_8px_20px_rgba(15,23,42,0.06)] flex flex-col justify-between text-left cursor-pointer hover:border-indigo-300 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/25">
                  <Bot className="w-4 h-4" />
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div className="mt-2">
                <span className="block text-xs font-black text-slate-900 font-['Fredoka']">
                  Solo AI Rush
                </span>
                <span className="block text-[10px] font-bold text-slate-500">
                  Practice vs RoboMaster
                </span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. MODERN BOTTOM NAVIGATION DOCK */}
        {/* ========================================================================= */}
        <nav className="mt-2 pt-2 pb-1.5 px-3 rounded-[24px] bg-white/95 border-2 border-white shadow-[0_10px_28px_rgba(15,23,42,0.08)] grid grid-cols-4 gap-1 z-10">
          {/* Dock 1: Home (Active) */}
          <button
            type="button"
            className="flex flex-col items-center justify-center gap-1 py-1 rounded-xl cursor-default"
          >
            <div className="relative w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
              <Home className="w-4 h-4" />
              <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-blue-600" />
            </div>
            <span className="text-[10px] font-black text-blue-600">Home</span>
          </button>

          {/* Dock 2: Skin Studio & Boards */}
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/customize');
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-slate-600 hover:text-purple-600 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 group-hover:bg-purple-100 text-purple-600 flex items-center justify-center transition-colors">
              <Palette className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-extrabold truncate max-w-[65px]">Studio</span>
          </button>

          {/* Dock 3: Leaderboard */}
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/leaderboard');
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-slate-600 hover:text-amber-600 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 group-hover:bg-amber-100 text-amber-600 flex items-center justify-center transition-colors">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-extrabold truncate max-w-[65px]">Ranking</span>
          </button>

          {/* Dock 4: Rules & Perks */}
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              setIsRulesModalOpen(true);
            }}
            className="flex flex-col items-center justify-center gap-1 py-1 rounded-xl text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-extrabold truncate max-w-[65px]">Rules</span>
          </button>
        </nav>
      </motion.div>

      {/* Rules and Board Perks Modal */}
      <RulesAndPerksModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Quick 3D Skin Picker Modal launched directly from 3D Hero Pod */}
      <SkinPickerModal
        isOpen={isSkinPickerOpen}
        onClose={() => setIsSkinPickerOpen(false)}
        mode="token"
        initialSkinId={selectedTokenSkin}
        initialColor={preferredColor || 'blue'}
      />
    </div>
  );
};

export default HomePage;
