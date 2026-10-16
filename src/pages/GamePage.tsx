import React, { useCallback, useState } from 'react';
import { LudoBoard3D } from '../components/game/LudoBoard3D';
import { TacticalPowerBanner } from './game/components/TacticalPowerBanner';
import { PlayerSetupModal } from '../components/modals/PlayerSetupModal';
import { BOARD_THEMES } from '../engine/boardConfig';
import { CornerDiceDock } from './game/components/CornerDiceDock';
import { GameHeaderHUD } from './game/components/GameHeaderHUD';
import { GameOverOverlay } from './game/components/GameOverOverlay';
import { TopScoreCard } from './game/components/TopScoreCard';
import { useGameSessionSync } from './game/hooks/useGameSessionSync';

export const GamePage: React.FC = () => {
  const {
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
    isAiTurn,
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
    send,
  } = useGameSessionSync();

  const [targetingMode, setTargetingMode] = useState<
    'wall' | 'guard' | 'asteroid' | null
  >(null);

  const handleStartTargeting = useCallback(
    (mode: 'wall' | 'guard' | 'asteroid') => {
      setTargetingMode(mode);
    },
    []
  );

  const handleCancelTargeting = useCallback(() => {
    setTargetingMode(null);
  }, []);

  const handleSelectTrackTile = useCallback(
    (tileIndex: number) => {
      if (targetingMode === 'wall') {
        handleDeployMarbleWall(tileIndex);
        setTargetingMode(null);
      }
    },
    [targetingMode, handleDeployMarbleWall]
  );

  const handleSelectTargetPawn = useCallback(
    (pawnId: string) => {
      if (targetingMode === 'guard') {
        handleDeployRoyalGuard(pawnId);
        setTargetingMode(null);
      } else if (targetingMode === 'asteroid') {
        handleLaunchCyberAsteroid(pawnId);
        setTargetingMode(null);
      }
    },
    [targetingMode, handleDeployRoyalGuard, handleLaunchCyberAsteroid]
  );

  const boardThemeMeta =
    BOARD_THEMES.find((b) => b.id === selectedBoardTheme) ?? BOARD_THEMES[0];

  const isFourPlayer = players.length === 4;

  const bluePlayerIdx = players.findIndex((p) => p.color === 'blue');
  const redPlayerIdx = players.findIndex((p) => p.color === 'red');
  const greenPlayerIdx = players.findIndex((p) => p.color === 'green');
  const yellowPlayerIdx = players.findIndex((p) => p.color === 'yellow');

  // In 2-player mode, top is Blue or Red, bottom is Yellow or Green
  const isTopColor = (c: string) => c === 'blue' || c === 'red';
  const topPlayerIndex = isTopColor(players[0]?.color) ? 0 : 1;
  const bottomPlayerIndex = topPlayerIndex === 0 ? 1 : 0;

  const topPlayer = players[topPlayerIndex] ?? players[0];
  const bottomPlayer = players[bottomPlayerIndex] ?? players[1];

  const winnerPlayer =
    winnerIndex !== null ? players[winnerIndex] ?? players[0] : players[0];
  const loserPlayer =
    winnerIndex !== null
      ? players[winnerIndex === 0 ? 1 : 0] ?? players[1]
      : players[1];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 flex items-center justify-center p-0 sm:p-3 select-none">
      <div
        className={`relative w-full max-w-[445px] min-h-screen sm:min-h-[860px] sm:rounded-[40px] bg-gradient-to-b ${boardThemeMeta.bgGradient} sm:shadow-[0_28px_70px_rgba(15,23,42,0.35),inset_0_2px_4px_rgba(255,255,255,0.8)] sm:border-[6px] sm:border-white flex flex-col justify-between p-3 sm:p-4 overflow-hidden`}
      >
        {/* 1. Header Bar with Settings & Board Perk Banner */}
        <GameHeaderHUD
          statusMessage={statusMessage}
          boardTheme={selectedBoardTheme}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          actionCameraEnabled={actionCameraEnabled}
          toggleActionCamera={toggleActionCamera}
          turnNumber={turnNumber}
          onRestartMatch={handleRestartMatch}
        />

        {/* 2. Scoreboard (Single Compact Row for 4 Players or 2 Wide Cards for Duo) */}
        <div className="mt-1 flex items-center gap-1.5">
          {players.map((p, pIdx) => (
            <TopScoreCard
              key={`score-${p.id}-${pIdx}`}
              playerIdx={pIdx}
              player={p}
              playerPawns={pawns.filter((pawn) => pawn.playerIndex === pIdx)}
              score={playerScores[pIdx] ?? 0}
              isTurn={currentPlayerIndex === pIdx && !isGameOver}
              compact={isFourPlayer}
            />
          ))}
        </div>

        {/* 3. Top-of-Board Dice Docks (Blue Top-Left & Red Top-Right) */}
        {isFourPlayer ? (
          <div className="mt-1.5 flex items-center justify-between gap-1">
            {bluePlayerIdx !== -1 && (
              <CornerDiceDock
                playerIdx={bluePlayerIdx}
                player={players[bluePlayerIdx]}
                isMyTurn={currentPlayerIndex === bluePlayerIdx && !isGameOver}
                isIdle={isIdle}
                isRolling={isRolling}
                isSelectingPawn={isSelectingPawn}
                diceValue={diceValue}
                lastFace={playerLastDiceValues[bluePlayerIdx] ?? 1}
                onTriggerRoll={handleTriggerRoll}
                onRollSettled={handleRollSettled}
              />
            )}
            {redPlayerIdx !== -1 && (
              <CornerDiceDock
                playerIdx={redPlayerIdx}
                player={players[redPlayerIdx]}
                isMyTurn={currentPlayerIndex === redPlayerIdx && !isGameOver}
                isIdle={isIdle}
                isRolling={isRolling}
                isSelectingPawn={isSelectingPawn}
                diceValue={diceValue}
                lastFace={playerLastDiceValues[redPlayerIdx] ?? 1}
                onTriggerRoll={handleTriggerRoll}
                onRollSettled={handleRollSettled}
              />
            )}
          </div>
        ) : (
          <div
            className={`mt-2 flex ${
              topPlayer.color === 'red' ? 'justify-end' : 'justify-start'
            }`}
          >
            <CornerDiceDock
              playerIdx={topPlayerIndex}
              player={topPlayer}
              isMyTurn={currentPlayerIndex === topPlayerIndex && !isGameOver}
              isIdle={isIdle}
              isRolling={isRolling}
              isSelectingPawn={isSelectingPawn}
              diceValue={diceValue}
              lastFace={playerLastDiceValues[topPlayerIndex] ?? 1}
              onTriggerRoll={handleTriggerRoll}
              onRollSettled={handleRollSettled}
            />
          </div>
        )}

        {/* 4. Center 15x15 Ludo Board */}
        <div className="my-1 flex flex-col items-center">
          {/* Tactical Board Power Floating Action Banner */}
          <TacticalPowerBanner
            canPlaceMarbleWall={canPlaceMarbleWall}
            canDeployGuard={canDeployGuard}
            canLaunchAsteroid={canLaunchAsteroid}
            boardTheme={selectedBoardTheme}
            targetingMode={targetingMode}
            onStartTargeting={handleStartTargeting}
            onCancelTargeting={handleCancelTargeting}
          />

          <LudoBoard3D
            players={players}
            pawns={pawns}
            legalMoves={isSelectingPawn ? legalMoves : []}
            activeMove={activeMove}
            boardTheme={selectedBoardTheme}
            actionCameraEnabled={actionCameraEnabled}
            isAiTurn={isAiTurn}
            boardPowers={boardPowers}
            targetingMode={targetingMode}
            currentPlayerColor={players[currentPlayerIndex]?.color}
            onSelectPawn={handleSelectPawn}
            onMoveAnimationComplete={handleMoveAnimationComplete}
            onSelectTrackTile={handleSelectTrackTile}
            onSelectTargetPawn={handleSelectTargetPawn}
          />
        </div>

        {/* 5. Bottom-of-Board Dice Docks (Yellow Bottom-Left & Green Bottom-Right) */}
        <footer
          className={`relative mt-1 flex items-center justify-between gap-1 ${
            !isFourPlayer && bottomPlayer.color === 'yellow'
              ? 'flex-row-reverse'
              : 'flex-row'
          }`}
        >
          {isFourPlayer ? (
            <>
              {yellowPlayerIdx !== -1 && (
                <CornerDiceDock
                  playerIdx={yellowPlayerIdx}
                  player={players[yellowPlayerIdx]}
                  isMyTurn={currentPlayerIndex === yellowPlayerIdx && !isGameOver}
                  isIdle={isIdle}
                  isRolling={isRolling}
                  isSelectingPawn={isSelectingPawn}
                  diceValue={diceValue}
                  lastFace={playerLastDiceValues[yellowPlayerIdx] ?? 1}
                  onTriggerRoll={handleTriggerRoll}
                  onRollSettled={handleRollSettled}
                />
              )}
              <div className="flex-1" />
              {greenPlayerIdx !== -1 && (
                <CornerDiceDock
                  playerIdx={greenPlayerIdx}
                  player={players[greenPlayerIdx]}
                  isMyTurn={currentPlayerIndex === greenPlayerIdx && !isGameOver}
                  isIdle={isIdle}
                  isRolling={isRolling}
                  isSelectingPawn={isSelectingPawn}
                  diceValue={diceValue}
                  lastFace={playerLastDiceValues[greenPlayerIdx] ?? 1}
                  onTriggerRoll={handleTriggerRoll}
                  onRollSettled={handleRollSettled}
                />
              )}
            </>
          ) : (
            <>
              <div className="flex-1" />
              <CornerDiceDock
                playerIdx={bottomPlayerIndex}
                player={bottomPlayer}
                isMyTurn={currentPlayerIndex === bottomPlayerIndex && !isGameOver}
                isIdle={isIdle}
                isRolling={isRolling}
                isSelectingPawn={isSelectingPawn}
                diceValue={diceValue}
                lastFace={playerLastDiceValues[bottomPlayerIndex] ?? 1}
                onTriggerRoll={handleTriggerRoll}
                onRollSettled={handleRollSettled}
              />
            </>
          )}
        </footer>
      </div>

      {/* VICTORY MODAL ("You Win!" or 4-Player Standings) */}
      <GameOverOverlay
        isGameOver={isGameOver}
        winnerPlayer={winnerPlayer}
        loserPlayer={loserPlayer}
        players={players}
        winnerIndex={winnerIndex}
        playerScores={playerScores}
        onPlayAgain={() => send({ type: 'RESET_MATCH' })}
      />

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

export default GamePage;
