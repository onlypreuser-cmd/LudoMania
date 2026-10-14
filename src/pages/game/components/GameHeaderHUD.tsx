import { motion } from 'framer-motion';
import {
  Camera,
  ChevronLeft,
  Maximize,
  Minimize,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../../../audio/soundManager';
import { BOARD_THEMES } from '../../../engine/boardConfig';
import { BoardThemeId } from '../../../types/game';

interface GameHeaderHUDProps {
  statusMessage: string;
  boardTheme: BoardThemeId;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  toggleSound: () => void;
  actionCameraEnabled: boolean;
  toggleActionCamera: () => void;
  turnNumber: number;
  onRestartMatch: () => void;
}

export const GameHeaderHUD: React.FC<GameHeaderHUDProps> = ({
  statusMessage,
  boardTheme,
  isFullscreen,
  toggleFullscreen,
  isSettingsOpen,
  setIsSettingsOpen,
  soundEnabled,
  toggleSound,
  actionCameraEnabled,
  toggleActionCamera,
  turnNumber,
  onRestartMatch,
}) => {
  const navigate = useNavigate();
  const boardThemeMeta =
    BOARD_THEMES.find((b) => b.id === boardTheme) ?? BOARD_THEMES[0];

  return (
    <>
      {/* Top Controls Header Bar */}
      <header className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            soundManager.play('ui_click');
            navigate('/setup');
          }}
          aria-label="Back to Setup"
          className="w-9 h-9 rounded-full bg-white/90 border border-white shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="px-3 py-1 rounded-full bg-white/90 border border-white shadow-sm flex items-center gap-1.5 max-w-[210px] sm:max-w-[240px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-[11px] font-extrabold text-slate-800 truncate">
            {statusMessage}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="w-9 h-9 rounded-full bg-white/90 border border-white shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-slate-700" />
            ) : (
              <Maximize className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Game Settings Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              setIsSettingsOpen((v) => !v);
            }}
            aria-label="Settings"
            className="w-9 h-9 rounded-full bg-white/90 border border-white shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Settings Dropdown Panel */}
      {isSettingsOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 rounded-2xl bg-white/95 border border-slate-200 p-2.5 shadow-xl flex flex-col gap-2 z-30"
        >
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={toggleSound}
              className="flex items-center gap-2 text-xs font-extrabold text-slate-700 cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <span>{soundEnabled ? 'Sound ON' : 'Sound Muted'}</span>
            </button>

            {/* Action Camera Toggle */}
            <button
              type="button"
              onClick={toggleActionCamera}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                actionCameraEnabled
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-500 border border-slate-200'
              }`}
              title="Toggle Action Camera Zoom on token cuts and home run"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Action Cam: {actionCameraEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-500">
              Active Turn: #{turnNumber}
            </span>
            <button
              type="button"
              onClick={onRestartMatch}
              className="px-3 py-1 rounded-xl bg-rose-100 text-rose-700 text-xs font-extrabold hover:bg-rose-200 cursor-pointer transition-colors"
            >
              Restart Match
            </button>
          </div>
        </motion.div>
      )}

      {/* Board Perk Indicator Banner */}
      <div className="mt-1 flex items-center justify-between px-3 py-1 rounded-full bg-white/80 border border-slate-200/80 shadow-xs">
        <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-700">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Board Perk:</span>
          <span className="text-amber-700">{boardThemeMeta.perk.badge}</span>
        </span>
        <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[170px]" title={boardThemeMeta.perk.description}>
          {boardThemeMeta.perk.description}
        </span>
      </div>
    </>
  );
};
