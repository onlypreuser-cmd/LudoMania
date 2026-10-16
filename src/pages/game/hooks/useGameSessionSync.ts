import { useMachine } from '@xstate/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { soundManager } from '../../../audio/soundManager';
import { ludoMachine } from '../../../machines/ludoMachine';
import { useProfileStore } from '../../../store/useProfileStore';
import { triggerMatchWinConfetti } from '../../../utils/haptics';

export function useGameSessionSync() {
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
    _hasHydrated,
  } = useProfileStore();

  const [state, send] = useMachine(ludoMachine, {
    input: {
      players,
      boardTheme: selectedBoardTheme,
      savedSession: savedGameSession,
    },
  });

  const [setupTargetIdx, setSetupTargetIdx] = useState<0 | 1 | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const hasRestoredSessionRef = useRef(Boolean(savedGameSession));
  const gameStartedRef = useRef(
    Boolean(savedGameSession) ||
    (savedGameSession?.pawns?.some((p) => p.step > -1) ?? false) ||
    (savedGameSession?.turnNumber ?? 1) > 1
  );

  useEffect(() => {
    // Gate on store hydration to prevent premature setup modal flash
    if (!_hasHydrated) return;

    if (!players[0]?.name.trim()) {
      setSetupTargetIdx(0);
    } else if (!players[1]?.name.trim()) {
      setSetupTargetIdx(1);
    } else {
      setSetupTargetIdx(null);
      if (!hasRestoredSessionRef.current && !gameStartedRef.current) {
        send({
          type: 'CONFIGURE_PLAYERS',
          players,
          boardTheme: selectedBoardTheme,
        });
      } else if (hasRestoredSessionRef.current) {
        hasRestoredSessionRef.current = false;
      }
    }
  }, [_hasHydrated, players, selectedBoardTheme, send]);

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
    capturedPlayerFlags,
    consecutiveSixes,
    biasState,
    boardPowers,
    canPlaceMarbleWall,
    canDeployGuard,
    canLaunchAsteroid,
  } = state.context;

  // Match victory win recording
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

  // Auto-Save active match progress whenever turn settles on IDLE
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
          consecutiveSixes,
          captureBonusPoints,
          capturedPlayerFlags,
          boardPowers,
          _e: biasState,
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
    capturedPlayerFlags,
    statusMessage,
    players,
    selectedBoardTheme,
    saveActiveGameSession,
    savedGameSession?.id,
    consecutiveSixes,
    biasState,
    boardPowers,
  ]);

  // Update gameStartedRef when game progresses, reset on game over
  useEffect(() => {
    if (isGameOver) {
      clearSavedGameSession();
      gameStartedRef.current = false;
    } else if (pawns.some((p) => p.step > -1) || turnNumber > 1) {
      gameStartedRef.current = true;
    }
  }, [isGameOver, pawns, turnNumber, clearSavedGameSession]);

  // Fullscreen toggle & window state synchronizer
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

  // Screen Wake Lock API to prevent device from sleeping during match
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

  // Tactical Powers: Tick active Cyber Stasis timers every 1s
  useEffect(() => {
    if (isGameOver) return;
    const hasActiveStasis = boardPowers.stasis.length > 0;
    if (!hasActiveStasis) return;

    const intervalId = setInterval(() => {
      send({ type: 'TICK_STASIS_TIMERS', currentTime: Date.now() });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isGameOver, boardPowers.stasis.length, send]);

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

  const handleDeployMarbleWall = useCallback(
    (tileIndex: number) => {
      soundManager.play('ui_click');
      send({ type: 'DEPLOY_MARBLE_WALL', tileIndex });
    },
    [send]
  );

  const handleDeployRoyalGuard = useCallback(
    (pawnId: string) => {
      soundManager.play('ui_click');
      send({ type: 'DEPLOY_ROYAL_GUARD', pawnId });
    },
    [send]
  );

  const handleLaunchCyberAsteroid = useCallback(
    (targetPawnId: string) => {
      soundManager.play('ui_click');
      send({ type: 'LAUNCH_CYBER_ASTEROID', targetPawnId });
    },
    [send]
  );

  const handleBreakStasisWithSix = useCallback(
    (pawnId: string) => {
      soundManager.play('ui_click');
      send({ type: 'BREAK_STASIS_WITH_SIX', pawnId });
    },
    [send]
  );

  // Live scores calculation
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

  return {
    players,
    selectedBoardTheme,
    soundEnabled,
    toggleSound,
    actionCameraEnabled,
    toggleActionCamera,
    setupTargetIdx,
    setSetupTargetIdx,
    isSettingsOpen,
    setIsSettingsOpen,
    isIdle,
    isRolling,
    isSelectingPawn,
    isMoving,
    isGameOver,
    pawns,
    currentPlayerIndex,
    diceValue,
    playerLastDiceValues,
    legalMoves,
    activeMove,
    winnerIndex,
    statusMessage,
    turnNumber,
    playerScores,
    isFullscreen,
    toggleFullscreen,
    handleRestartMatch,
    handleTriggerRoll,
    handleRollSettled,
    handleSelectPawn,
    handleMoveAnimationComplete,
    boardPowers,
    canPlaceMarbleWall,
    canDeployGuard,
    canLaunchAsteroid,
    handleDeployMarbleWall,
    handleDeployRoyalGuard,
    handleLaunchCyberAsteroid,
    handleBreakStasisWithSix,
    send,
  };
}
