import { useMachine } from '@xstate/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  ChevronLeft,
  Crown,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { LudoBoard3D } from '../components/game/LudoBoard3D';
import { PlayerSetupModal } from '../components/modals/PlayerSetupModal';
import { Dice3DPod } from '../components/three/Dice3DPod';
import {
  AVATAR_OPTIONS,
  BOARD_THEMES,
  COLOR_PALETTE,
} from '../engine/boardConfig';
import { ludoMachine } from '../machines/ludoMachine';
import { useProfileStore } from '../store/useProfileStore';
import { triggerMatchWinConfetti } from '../utils/haptics';

export const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    selectedBoardTheme,
    soundEnabled,
    toggleSound,
    actionCameraEnabled,
    toggleActionCamera,
    savedGameSession,
    saveActiveGameSession,
    clearSavedGameSession,
    recordMatchResult,
  } = useProfileStore();

  const [state, send] = useMachine(ludoMachine, {
    input: {
      players,
      boardTheme: selectedBoardTheme,
      savedSession: savedGameSession,
    },
  });

  const missingP1Name = !players[0]?.name.trim();
  const missingP2Name = !players[1]?.name.trim();
  const [setupTargetIdx, setSetupTargetIdx] = useState<0 | 1 | null>(
    missingP1Name ? 0 : missingP2Name ? 1 : null
  );

  const hasRestoredSessionRef = useRef(Boolean(savedGameSession));

  useEffect(() => {
    if (!players[0]?.name.trim()) {
      setSetupTargetIdx(0);
    } else if (!players[1]?.name.trim()) {
      setSetupTargetIdx(1);
    } else {
      setSetupTargetIdx(null);
      if (!hasRestoredSessionRef.current) {
        send({
          type: 'CONFIGURE_PLAYERS',
          players,
          boardTheme: selectedBoardTheme,
        });
      } else {
        hasRestoredSessionRef.current = false;
      }
    }
  }, [players, selectedBoardTheme, send]);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const hasRecordedWinRef = useRef(false);

  const isIdle = state.matches('IDLE');
  const isRolling = state.matches('ROLLING');
  const isSelectingPawn = state.matches('SELECTING_PAWN');
  const isMoving = state.matches('MOVING');
  const isGameOver = state.matches('GAME_OVER');

  const {
    pawns,
    currentPlayerIndex,
    diceValue,
    playerLastDiceValues,
    legalMoves,
    activeMove,
    winnerIndex,
    statusMessage,
    turnNumber,
    captureBonusPoints,
  } = state.context;

  const boardThemeMeta =
    BOARD_THEMES.find((b) => b.id === selectedBoardTheme) ?? BOARD_THEMES[0];

  useEffect(() => {
    if (isGameOver && winnerIndex !== null && !hasRecordedWinRef.current) {
      hasRecordedWinRef.current = true;
      soundManager.play('win_fanfare');
      triggerMatchWinConfetti();

      const winner = players[winnerIndex] ?? players[0];
      const loser = players[winnerIndex === 0 ? 1 : 0] ?? players[1];
      recordMatchResult({
        winnerName: winner.name || 'Player 1',
        winnerAvatar: winner.avatarId,
        loserName: loser.name || 'Player 2',
        loserAvatar: loser.avatarId,
        turnsPlayed: turnNumber,
      });
    } else if (!isGameOver) {
      hasRecordedWinRef.current = false;
    }
  }, [
    isGameOver,
    winnerIndex,
    players,
    turnNumber,
    recordMatchResult,
  ]);

  // 1. Auto-Save active match progress whenever turn settles on IDLE
  useEffect(() => {
    if (isIdle && !isGameOver) {
      const hasProgressed = pawns.some((p) => p.step > -1) || turnNumber > 1;
      if (hasProgressed) {
        saveActiveGameSession({
          id: savedGameSession?.id || `session-${Date.now()}`,
          players,
          pawns,
          boardTheme: selectedBoardTheme,
          currentPlayerIndex,
          diceValue: null,
          playerLastDiceValues,
          consecutiveSixes: state.context.consecutiveSixes,
          captureBonusPoints,
          turnNumber,
          statusMessage,
          timestamp: Date.now(),
        });
      }
    }
  }, [
    isIdle,
    isGameOver,
    pawns,
    turnNumber,
    currentPlayerIndex,
    playerLastDiceValues,
    captureBonusPoints,
    statusMessage,
    players,
    selectedBoardTheme,
    saveActiveGameSession,
    savedGameSession?.id,
    state.context.consecutiveSixes,
  ]);

  // 2. Clear saved match session once the game is won
  useEffect(() => {
    if (isGameOver) {
      clearSavedGameSession();
    }
  }, [isGameOver, clearSavedGameSession]);

  // 3. Fullscreen toggle & window state synchronizer
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(
      typeof document !== 'undefined' &&
        (document.fullscreenElement ||
          (document as any).webkitFullscreenElement)
    )
  );

  const toggleFullscreen = useCallback(async () => {
    soundManager.play('ui_click');
    try {
      if (
        !document.fullscreenElement &&
        !(document as any).webkitFullscreenElement
      ) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          await (document.documentElement as any).webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement ||
            (document as any).webkitFullscreenElement
        )
      );
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange
      );
    };
  }, []);

  // 4. Screen Wake Lock API to prevent device from sleeping during match
  useEffect(() => {
    let wakeLockSentinel: any = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && !isGameOver) {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        // Silently ignore if not supported or denied
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isGameOver) {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
    };
  }, [isGameOver]);

  const handleRestartMatch = useCallback(() => {
    soundManager.play('ui_click');
    clearSavedGameSession();
    send({ type: 'RESET_MATCH' });
    setIsSettingsOpen(false);
  }, [clearSavedGameSession, send]);

  const handleTriggerRoll = useCallback(() => {
    if (!isIdle) return;
    send({ type: 'ROLL_DICE' });
  }, [isIdle, send]);

  const handleRollSettled = useCallback(() => {
    send({ type: 'DICE_SETTLED' });
  }, [send]);

  const handleSelectPawn = useCallback(
    (pawnId: string) => {
      send({ type: 'SELECT_PAWN', pawnId });
    },
    [send]
  );

  const handleMoveAnimationComplete = useCallback(() => {
    send({ type: 'ANIMATION_COMPLETE' });
  }, [send]);

  /**
   * Memoized live scores for each player
   */
  const playerScores = useMemo(
    () =>
      players.map((_, playerIdx) => {
        const pPawns = pawns.filter((p) => p.playerIndex === playerIdx);
        const homeCount = pPawns.filter((p) => p.step === 56).length;
        const stepPoints = pPawns.reduce(
          (acc, p) => acc + (p.step > 0 ? p.step : 0),
          0
        );
        return (
          stepPoints + homeCount * 50 + (captureBonusPoints[playerIdx] ?? 0)
        );
      }),
    [players, pawns, captureBonusPoints]
  );

  /**
   * Top Scoreboard Card:
   * No text boxes! Shows Player Name, Score, and 4 Round Token Circles:
   * - Out / Home tokens: filled with the player's actual vibrant color
   * - In (Yard) tokens: filled with soft greyish color (`bg-slate-300`)
   */
  const renderTopScoreCard = (playerIdx: number) => {
    const player = players[playerIdx];
    if (!player) return null;
    const avatar =
      AVATAR_OPTIONS.find((a) => a.id === player.avatarId) ??
      AVATAR_OPTIONS[playerIdx];
    const playerPawns = pawns.filter((p) => p.playerIndex === playerIdx);
    const palette = COLOR_PALETTE[player.color];
    const score = playerScores[playerIdx] ?? 0;
    const isTurn = currentPlayerIndex === playerIdx && !isGameOver;
    const isRight = playerIdx === 1;

    // Sort dots so Out/Home colored circles appear first, followed by Greyish In-Yard circles
    const sortedPawns = [...playerPawns].sort((a, b) => b.step - a.step);

    return (
      <div
        className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-[22px] border-2 transition-all ${
          isRight ? 'flex-row-reverse text-right' : 'flex-row text-left'
        } ${
          isTurn
            ? 'bg-white border-amber-400 shadow-[0_6px_18px_rgba(245,158,11,0.25)]'
            : 'bg-white/85 border-white/85 opacity-85 shadow-sm'
        }`}
      >
        <img
          src={avatar.src}
          alt={player.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div
            className={`flex items-center justify-between gap-1 ${
              isRight ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <span className="text-xs font-extrabold text-slate-900 truncate">
              {player.name || `Player ${playerIdx + 1}`}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tabular-nums shrink-0">
              {score} pts
            </span>
          </div>

          {/* 4 Round Token Circles: Actual Color when Out/Home, Greyish when In Yard */}
          <div
            className={`mt-1.5 flex items-center gap-1.5 ${
              isRight ? 'justify-end' : 'justify-start'
            }`}
          >
            {sortedPawns.map((p) => {
              const isOut = p.step >= 0;
              const isHome = p.step === 56;
              return (
                <span
                  key={p.id}
                  title={
                    isHome
                      ? 'Home!'
                      : isOut
                      ? 'Out on Board'
                      : 'Inside Base'
                  }
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    isHome
                      ? `${palette.bgClass} ring-2 ring-amber-400 scale-110 shadow-sm`
                      : isOut
                      ? `${palette.bgClass} border border-white shadow-sm`
                      : 'bg-slate-300/90 border border-slate-400/40'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Determine which player sits on the TOP half of the board (`blue` = Top-Left, `red` = Top-Right)
   * and which player sits on the BOTTOM half of the board (`yellow` = Bottom-Left, `green` = Bottom-Right)
   * so each player's Dice Pod is ALWAYS on the exact same side & corner as their tokens!
   */
  const isTopColor = (c: string) => c === 'blue' || c === 'red';
  const topPlayerIndex = isTopColor(players[0]?.color) ? 0 : 1;
  const bottomPlayerIndex = topPlayerIndex === 0 ? 1 : 0;

  const topPlayer = players[topPlayerIndex] ?? players[0];
  const bottomPlayer = players[bottomPlayerIndex] ?? players[1];

  const renderCornerDiceDock = (playerIdx: number) => {
    const player = players[playerIdx];
    if (!player) return null;
    const avatar =
      AVATAR_OPTIONS.find((a) => a.id === player.avatarId) ??
      AVATAR_OPTIONS[playerIdx];
    const isMyTurn = currentPlayerIndex === playerIdx && !isGameOver;
    // Blue & Yellow are on the LEFT side of the board; Red & Green are on the RIGHT side of the board!
    const isRightSideCorner =
      player.color === 'red' || player.color === 'green';
    const palette = COLOR_PALETTE[player.color];
    const lastFace = playerLastDiceValues[playerIdx] ?? 1;

    return (
      <div
        className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-[24px] border-2 transition-all duration-200 ${
          isRightSideCorner ? 'flex-row-reverse' : 'flex-row'
        } ${
          isMyTurn
            ? 'bg-white border-amber-400 shadow-[0_10px_25px_rgba(245,158,11,0.28)]'
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
            <span className="block text-xs font-extrabold text-slate-900 leading-tight max-w-[90px] truncate">
              {player.name || `Player ${playerIdx + 1}`}
            </span>
            <span
              className={`block text-[10px] font-extrabold ${
                isMyTurn ? 'text-blue-600' : 'text-slate-400'
              }`}
            >
              {isMyTurn
                ? isIdle
                  ? 'Tap Dice!'
                  : isRolling
                  ? 'Rolling...'
                  : isSelectingPawn
                  ? 'Move Token!'
                  : 'Moving...'
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
          canRoll={isMyTurn && isIdle}
          onTriggerRoll={handleTriggerRoll}
          onRollSettled={isMyTurn ? handleRollSettled : undefined}
          size="md"
        />
      </div>
    );
  };

  const winnerPlayer =
    winnerIndex !== null ? players[winnerIndex] ?? players[0] : players[0];
  const loserPlayer =
    winnerIndex !== null
      ? players[winnerIndex === 0 ? 1 : 0] ?? players[1]
      : players[1];
  const winnerAvatar =
    AVATAR_OPTIONS.find((a) => a.id === winnerPlayer.avatarId) ??
    AVATAR_OPTIONS[0];
  const loserAvatar =
    AVATAR_OPTIONS.find((a) => a.id === loserPlayer.avatarId) ??
    AVATAR_OPTIONS[1];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 flex items-center justify-center p-0 sm:p-3">
      <div
        className={`relative w-full max-w-[445px] min-h-screen sm:min-h-[860px] sm:rounded-[40px] bg-gradient-to-b ${boardThemeMeta.bgGradient} sm:shadow-[0_28px_70px_rgba(15,23,42,0.35),inset_0_2px_4px_rgba(255,255,255,0.8)] sm:border-[6px] sm:border-white flex flex-col justify-between p-3 sm:p-4 overflow-hidden`}
      >
        {/* 1. Header Bar */}
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
                onClick={handleRestartMatch}
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

        {/* 2. TOP SCOREBOARD (Round Colored Dots for Out & Greyish Dots for In + Score) */}
        <div className="mt-1 flex items-center gap-2">
          {renderTopScoreCard(0)}
          {renderTopScoreCard(1)}
        </div>

        {/* 3. TOP-OF-BOARD DICE DOCK (Matches whichever player owns Blue Top-Left or Red Top-Right!) */}
        <div
          className={`mt-2 flex ${
            topPlayer.color === 'red' ? 'justify-end' : 'justify-start'
          }`}
        >
          {renderCornerDiceDock(topPlayerIndex)}
        </div>

        {/* 4. CENTER 15x15 LUDO BOARD */}
        <div className="my-1.5">
          <LudoBoard3D
            players={players}
            pawns={pawns}
            legalMoves={isSelectingPawn ? legalMoves : []}
            activeMove={activeMove}
            boardTheme={selectedBoardTheme}
            actionCameraEnabled={actionCameraEnabled}
            onSelectPawn={handleSelectPawn}
            onMoveAnimationComplete={handleMoveAnimationComplete}
          />
        </div>

        {/* 5. BOTTOM-OF-BOARD DICE DOCK (Matches whichever player owns Yellow Bottom-Left or Green Bottom-Right!) */}
        <footer
          className={`relative mt-1 flex items-center justify-between gap-2 ${
            bottomPlayer.color === 'yellow' ? 'flex-row-reverse' : 'flex-row'
          }`}
        >
          <div className="flex-1" />
          {renderCornerDiceDock(bottomPlayerIndex)}
        </footer>
      </div>

      {/* VICTORY MODAL ("You Win!") */}
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
                You Win!
              </h2>
              <p className="mt-1 text-sm font-extrabold text-slate-700">
                Great game, {winnerPlayer.name}!
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
                    send({ type: 'RESET_MATCH' });
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

      <PlayerSetupModal
        isOpen={setupTargetIdx !== null}
        onClose={() => setSetupTargetIdx(null)}
        targetPlayerIndex={setupTargetIdx ?? 0}
        title={`Player ${(setupTargetIdx ?? 0) + 1} Setup`}
        subtitle="Enter player name, pick your 3D avatar, dice skin & token style before rolling!"
      />
    </div>
  );
};
