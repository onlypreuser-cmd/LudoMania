import { motion } from 'framer-motion';
import {
  BookOpen,
  ChevronRight,
  Medal,
  Palette,
  Plus,
  Settings,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { AVATAR_OPTIONS } from '../engine/boardConfig';
import { useProfileStore } from '../store/useProfileStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    userName,
    userAvatar,
    coins,
    soundEnabled,
    toggleSound,
    addCoins,
  } = useProfileStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const currentAvatar =
    AVATAR_OPTIONS.find((a) => a.id === userAvatar) ?? AVATAR_OPTIONS[0];

  const handlePlayClick = () => {
    soundManager.play('ui_click');
    // Setup happens at play-time on /setup, never interrupting app launch!
    navigate('/setup');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:rounded-[42px] bg-gradient-to-b from-[#f8faff] via-[#f3f6fc] to-[#eef2f9] sm:shadow-[0_28px_70px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,1)] sm:border-[6px] sm:border-white flex flex-col justify-between p-4 sm:p-5 overflow-hidden"
      >
        {/* Top Bar: Profile + Coins + Settings */}
        <header className="flex items-center justify-between gap-2 z-10">
          <button
            type="button"
            onClick={handlePlayClick}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-br from-blue-400 to-indigo-600 shadow-md group-hover:scale-105 transition-transform">
              <img
                src={currentAvatar.src}
                alt={userName || 'Player'}
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">
                Hi, {userName.trim() ? userName : 'Challenger'}
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Ready to roll?
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {/* Coin Pill */}
            <div className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-full bg-white/95 border border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.06),inset_0_2px_4px_rgba(255,255,255,1)]">
              <span className="w-6 h-6 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 flex items-center justify-center text-amber-950 font-black text-xs shadow-inner border border-amber-200">
                ★
              </span>
              <span className="text-sm font-extrabold text-slate-800 tabular-nums">
                {coins.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => {
                  soundManager.play('safe_star');
                  addCoins(500);
                }}
                title="Claim +500 Bonus Coins"
                className="w-6 h-6 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 text-white flex items-center justify-center shadow hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            {/* Settings Gear Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                setIsSettingsOpen((v) => !v);
              }}
              aria-label="Game Settings"
              className="w-10 h-10 rounded-full bg-white/95 border border-slate-200/80 shadow-[0_4px_12px_rgba(15,23,42,0.06)] flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Quick Settings Popover */}
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl bg-white/95 border border-slate-200 p-3 shadow-lg flex items-center justify-between z-20"
          >
            <div className="flex items-center gap-2.5">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-blue-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
              <span className="text-xs font-extrabold text-slate-800">
                Sound & Music Effects
              </span>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                soundEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </motion.div>
        )}

        {/* Center Hero Artwork Card — Uncropped Full Aspect Ratio */}
        <div className="my-2.5 relative rounded-[30px] overflow-hidden shadow-[0_16px_36px_rgba(30,64,175,0.15)] border-4 border-white bg-[#fdf6e9]">
          <img
            src="/assets/hero/home-hero-banner.png"
            alt="Ludo Mania — Roll • Move • Win"
            className="w-full h-auto max-h-[380px] object-contain mx-auto block select-none"
          />
        </div>

        {/* Main CTA Section (Strictly Local Play — No Online/Create Room/Quick Play) */}
        <div className="space-y-3 z-10">
          {/* Primary Gold/Orange 3D Button: Play with Friend */}
          <motion.button
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            type="button"
            onClick={handlePlayClick}
            className="w-full p-4 rounded-[26px] bg-gradient-to-b from-amber-300 via-amber-400 to-orange-500 border-2 border-amber-200 shadow-[0_12px_28px_rgba(245,158,11,0.42),inset_0_3px_4px_rgba(255,255,255,0.8)] flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="relative w-12 h-12 rounded-2xl bg-white/35 backdrop-blur-sm flex items-center justify-center shadow-inner border border-white/50">
                <span className="w-5 h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-700 border border-white shadow -rotate-12 -mr-1.5" />
                <span className="w-5 h-8 rounded-full bg-gradient-to-b from-emerald-400 to-green-700 border border-white shadow rotate-12" />
              </div>
              <div className="text-left">
                <span className="block text-lg font-extrabold text-slate-900 font-['Fredoka'] tracking-tight">
                  Play with Friend
                </span>
                <span className="block text-xs font-bold text-amber-950/80">
                  2 Players (1 vs 1 • Cross Board)
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-white/85 flex items-center justify-center text-slate-900 shadow group-hover:translate-x-0.5 transition-transform">
              <ChevronRight className="w-5 h-5 stroke-[2.8]" />
            </div>
          </motion.button>

          {/* Local Play Offline Card */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handlePlayClick}
            className="w-full p-3.5 rounded-[22px] bg-white/95 border-2 border-white shadow-[0_10px_24px_rgba(15,23,42,0.07)] flex items-center justify-between cursor-pointer hover:bg-white transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-emerald-400 to-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-extrabold text-slate-900">
                  Local Play
                </span>
                <span className="block text-xs font-semibold text-slate-500">
                  2 Players (Offline — Same Device)
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </motion.button>
        </div>

        {/* Bottom Navigation Dock */}
        <nav className="mt-3 pt-3 pb-1 px-2 rounded-[26px] bg-white/95 border-2 border-white shadow-[0_10px_30px_rgba(15,23,42,0.08)] grid grid-cols-4 gap-1 z-10">
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/leaderboard');
            }}
            className="flex flex-col items-center gap-1 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              Leaderboard
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/customize');
            }}
            className="flex flex-col items-center gap-1 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              Customize
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/achievements');
            }}
            className="flex flex-col items-center gap-1 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm">
              <Medal className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              Achievements
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/how-to-play');
            }}
            className="flex flex-col items-center gap-1 py-1.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              How to Play
            </span>
          </button>
        </nav>
      </motion.div>
    </div>
  );
};
