import { assign, setup } from 'xstate';
import { BOARD_THEMES } from '../engine/boardConfig';
import {
  createInitialBiasState,
  getLegalMovesForPlayer,
  rollSmartDice,
} from '../engine/diceEngine';
import {
  BoardPowersState,
  BoardThemeId,
  CyberStasis,
  DiceBiasState,
  MarbleWall,
  MoveEvaluation,
  Pawn,
  PlayerConfig,
  SavedGameSession,
} from '../types/game';
import {
  canPlayerDeployRoyalGuard,
  canPlayerLaunchCyberAsteroid,
  canPlayerPlaceMarbleWall,
  cleanExpiredStasis,
  createInitialBoardPowers,
} from '../engine/powers/boardPowersEngine';

export interface LudoMachineContext {
  players: PlayerConfig[];
  pawns: Pawn[];
  boardTheme: BoardThemeId;
  currentPlayerIndex: number;
  diceValue: number | null;
  playerLastDiceValues: number[];
  consecutiveSixes: number;
  legalMoves: MoveEvaluation[];
  activeMove: MoveEvaluation | null;
  hasExtraTurn: boolean;
  lastCapturedPawnIds: string[];
  captureBonusPoints: number[];
  /** Per-player flag: true if that player's pawn was ever captured this match */
  capturedPlayerFlags: boolean[];
  /** Per-player flag: true if this player has captured at least 1 opponent pawn this match */
  playerHasCapturedAnyOpponent: boolean[];
  biasState: DiceBiasState;
  winnerIndex: number | null;
  statusMessage: string;
  turnNumber: number;
  boardPowers: BoardPowersState;
  canPlaceMarbleWall: boolean;
  canDeployGuard: boolean;
  canLaunchAsteroid: boolean;
}

export type LudoMachineEvent =
  | { type: 'CONFIGURE_PLAYERS'; players: PlayerConfig[]; boardTheme?: BoardThemeId; pawnCount?: 2 | 4 }
  | { type: 'RESTORE_SESSION'; session: SavedGameSession }
  | { type: 'ROLL_DICE' }
  | { type: 'DICE_SETTLED' }
  | { type: 'SELECT_PAWN'; pawnId: string }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'RESET_MATCH'; pawnCount?: 2 | 4 }
  | { type: 'DEPLOY_MARBLE_WALL'; tileIndex: number }
  | { type: 'DEPLOY_ROYAL_GUARD'; pawnId: string }
  | { type: 'LAUNCH_CYBER_ASTEROID'; targetPawnId: string }
  | { type: 'BREAK_STASIS_WITH_SIX'; pawnId: string }
  | { type: 'TICK_STASIS_TIMERS'; currentTime: number };

export function createInitialPawns(
  players: PlayerConfig[],
  pawnCount: number = 4
): Pawn[] {
  const pawns: Pawn[] = [];
  const count = Math.min(4, Math.max(1, pawnCount));
  players.forEach((player, pIdx) => {
    for (let i = 0; i < count; i++) {
      pawns.push({
        id: `${player.color}-${i}`,
        playerIndex: pIdx,
        color: player.color,
        pawnIndex: i,
        step: -1,
      });
    }
  });
  return pawns;
}

export const ludoMachine = setup({
  types: {
    context: {} as LudoMachineContext,
    events: {} as LudoMachineEvent,
    input: {} as {
      players: PlayerConfig[];
      boardTheme?: BoardThemeId;
      savedSession?: SavedGameSession | null;
      pawnCount?: 2 | 4;
    },
  },
  guards: {
    isThirdConsecutiveSix: ({ context }) => context.consecutiveSixes >= 3,
    hasZeroLegalMoves: ({ context }) => context.legalMoves.length === 0,
    hasSingleAutoMove: ({ context }) => {
      // BUG-04 FIX: Only auto-move when there is EXACTLY 1 legal move.
      // Previously, 2+ yard pawns all landing on step-0 were treated as
      // "all equivalent → auto-pick first". This silently removed player
      // choice. Now those cases fall through to SELECTING_PAWN so the
      // player explicitly chooses which yard pawn to deploy.
      return context.legalMoves.length === 1;
    },
    isValidPawnSelection: ({ context, event }) => {
      if (event.type !== 'SELECT_PAWN') return false;
      return context.legalMoves.some((m) => m.pawnId === event.pawnId);
    },
    hasPlayerWon: ({ context }) => {
      const playerPawns = context.pawns.filter(
        (p) => p.playerIndex === context.currentPlayerIndex
      );
      return playerPawns.length > 0 && playerPawns.every((p) => p.step === 56);
    },
    earnedExtraTurn: ({ context }) => Boolean(context.hasExtraTurn),
  },
  actions: {
    performSmartRoll: assign(({ context }) => {
      const currentPlayer = context.players[context.currentPlayerIndex];

      const { diceValue, nextBiasState } = rollSmartDice({
        players: context.players,
        currentPlayerIndex: context.currentPlayerIndex,
        pawns: context.pawns,
        consecutiveSixes: context.consecutiveSixes,
        biasState: context.biasState,
      });

      const nextConsecutiveSixes =
        diceValue === 6 ? context.consecutiveSixes + 1 : 0;

      const nextLastDiceValues = [...context.playerLastDiceValues];
      nextLastDiceValues[context.currentPlayerIndex] = diceValue;

      const playerPawns = context.pawns.filter(
        (p) => p.playerIndex === context.currentPlayerIndex
      );
      const canPlaceMarbleWall = canPlayerPlaceMarbleWall(
        context.boardTheme,
        nextConsecutiveSixes
      );
      const canDeployGuard = canPlayerDeployRoyalGuard(
        context.boardTheme,
        playerPawns,
        context.boardPowers.guard[currentPlayer.color]
      );
      const canLaunchAsteroid = canPlayerLaunchCyberAsteroid(
        context.boardTheme,
        playerPawns,
        nextConsecutiveSixes,
        context.boardPowers.lastNearHomeStasisTimestamp[currentPlayer.color] ?? 0
      );

      return {
        diceValue,
        playerLastDiceValues: nextLastDiceValues,
        consecutiveSixes: nextConsecutiveSixes,
        biasState: nextBiasState,
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        statusMessage: `${currentPlayer.name} is rolling...`,
        canPlaceMarbleWall,
        canDeployGuard,
        canLaunchAsteroid,
      };
    }),

    computeLegalMoves: assign(({ context }) => {
      const currentPlayer = context.players[context.currentPlayerIndex];
      const diceValue = context.diceValue ?? 1;

      if (context.consecutiveSixes >= 3) {
        return {
          legalMoves: [],
          statusMessage: `Three 6s in a row! Turn forfeited.`,
        };
      }

      const playerHasCaptured = Boolean(
        context.playerHasCapturedAnyOpponent?.[context.currentPlayerIndex]
      );

      const legalMoves = getLegalMovesForPlayer(
        context.pawns,
        context.currentPlayerIndex,
        currentPlayer.color,
        diceValue,
        context.boardTheme,
        playerHasCaptured,
        context.boardPowers
      );

      const playerPawns = context.pawns.filter(
        (p) => p.playerIndex === context.currentPlayerIndex
      );
      const canPlaceMarbleWall = canPlayerPlaceMarbleWall(
        context.boardTheme,
        context.consecutiveSixes
      );
      const canDeployGuard = canPlayerDeployRoyalGuard(
        context.boardTheme,
        playerPawns,
        context.boardPowers.guard[currentPlayer.color]
      );
      const canLaunchAsteroid = canPlayerLaunchCyberAsteroid(
        context.boardTheme,
        playerPawns,
        context.consecutiveSixes,
        context.boardPowers.lastNearHomeStasisTimestamp[currentPlayer.color] ?? 0
      );

      let statusMessage = `${currentPlayer.name} rolled ${diceValue}!`;
      if (legalMoves.length === 0) {
        if (playerPawns.every((p) => p.step === -1)) {
          statusMessage = `Rolled ${diceValue} — Need a 6 to deploy from Yard.`;
        } else {
          statusMessage = `Rolled ${diceValue} — No legal moves available.`;
        }
      } else if (legalMoves.length > 1) {
        statusMessage = `Rolled ${diceValue}! Tap a highlighted token to move.`;
      }

      return {
        legalMoves,
        statusMessage,
        canPlaceMarbleWall,
        canDeployGuard,
        canLaunchAsteroid,
      };
    }),

    selectAutoMove: assign(({ context }) => ({
      activeMove: context.legalMoves[0] ?? null,
    })),

    selectChosenPawnMove: assign(({ context, event }) => {
      if (event.type !== 'SELECT_PAWN') return {};
      const chosen =
        context.legalMoves.find((m) => m.pawnId === event.pawnId) ?? null;
      return {
        activeMove: chosen,
      };
    }),

    applyMoveAndCheckCaptures: assign(({ context }) => {
      const move = context.activeMove;
      if (!move) return {};

      const currentPlayer = context.players[context.currentPlayerIndex];
      const killedSet = new Set(move.willKillPawnIds);

      const updatedPawns = context.pawns.map((pawn) => {
        if (pawn.id === move.pawnId) {
          return { ...pawn, step: move.toStep };
        }
        if (killedSet.has(pawn.id)) {
          return { ...pawn, step: -1 };
        }
        return pawn;
      });

      const activeTheme =
        BOARD_THEMES.find((t) => t.id === context.boardTheme) ?? BOARD_THEMES[0];
      const perk = activeTheme.perk;

      const nextBonus = [...context.captureBonusPoints];
      let moveBonusEarned = 0;

      // Track which players had pawns captured this match & which players have captured
      const nextCapturedFlags = [...context.capturedPlayerFlags];
      const nextHasCaptured = [
        ...(context.playerHasCapturedAnyOpponent ??
          context.players.map(() => false)),
      ];

      if (move.willKillPawnIds.length > 0) {
        nextHasCaptured[context.currentPlayerIndex] = true;
        for (const killedId of move.willKillPawnIds) {
          const victim = context.pawns.find((p) => p.id === killedId);
          if (victim) {
            nextCapturedFlags[victim.playerIndex] = true;
          }
        }
      }

      // 1. Capture Bounties (base 30 + theme captureBountyBonus)
      if (move.willKillPawnIds.length > 0) {
        const bountyEach = 30 + (perk.captureBountyBonus || 0);
        moveBonusEarned += move.willKillPawnIds.length * bountyEach;
      }

      // 2. Safe Star Fortitude Bonus
      if (move.landsOnSafeStar && perk.safeStarFortitudeBonus > 0) {
        moveBonusEarned += perk.safeStarFortitudeBonus;
      }

      // 3. Home Stretch Overdrive Surge Bonus
      if (move.toStep >= 51 && move.fromStep < 51 && perk.homeStretchSurgeBonus > 0) {
        moveBonusEarned += perk.homeStretchSurgeBonus;
      }

      // 4. Roman Phalanx & Royal March (Marble Palace)
      // When a capture occurs, teammate pawn advances +2 steps
      let royalMarchTriggered = false;
      if (context.boardTheme === 'marble-palace' && move.willKillPawnIds.length > 0) {
        const teammate = updatedPawns.find(
          (p) =>
            p.playerIndex === context.currentPlayerIndex &&
            p.id !== move.pawnId &&
            p.step >= 0 &&
            p.step <= 48
        );
        if (teammate) {
          teammate.step = Math.min(50, teammate.step + 2);
          royalMarchTriggered = true;
        }
      }

      // 5. Kinetic Hyper Warp Surge Pads (Tiles 8, 21, 34, 47 grant mystery rocket surge +2..+5!)
      const DASH_STEPS = [8, 21, 34, 47];
      let speedDashTriggered = false;
      let warpSurgeLeap = 0;
      if (
        move.toStep <= 48 &&
        DASH_STEPS.includes(move.toStep) &&
        !move.landsOnSafeStar
      ) {
        const movedPawn = updatedPawns.find((p) => p.id === move.pawnId);
        if (movedPawn && movedPawn.step < 50) {
          const SURGE_POOLS = [2, 3, 4, 5];
          warpSurgeLeap = SURGE_POOLS[Math.floor(Math.random() * SURGE_POOLS.length)];
          movedPawn.step = Math.min(50, movedPawn.step + warpSurgeLeap);
          speedDashTriggered = true;
        }
      }

      if (moveBonusEarned > 0) {
        nextBonus[context.currentPlayerIndex] =
          (nextBonus[context.currentPlayerIndex] ?? 0) + moveBonusEarned;
      }

      // Tactical Board Powers Updates
      let updatedWalls = [...context.boardPowers.walls];
      const updatedGuard = { ...context.boardPowers.guard };
      let updatedStasis = [...context.boardPowers.stasis];

      // A. Destroy broken walls
      if (move.brokenWallIds && move.brokenWallIds.length > 0) {
        const brokenSet = new Set(move.brokenWallIds);
        updatedWalls = updatedWalls.filter((w) => !brokenSet.has(w.id));
      }

      // B. Shielded pawns: decrement Royal Guard hitsRemaining
      let guardAbsorbedMsg = '';
      if (move.shieldedPawnIds && move.shieldedPawnIds.length > 0) {
        for (const shieldedId of move.shieldedPawnIds) {
          const victim = context.pawns.find((p) => p.id === shieldedId);
          if (victim) {
            const gState = updatedGuard[victim.color];
            if (gState && gState.active) {
              const remaining = gState.hitsRemaining - 1;
              if (remaining <= 0) {
                updatedGuard[victim.color] = {
                  ...gState,
                  active: false,
                  targetPawnId: null,
                  hitsRemaining: 0,
                };
                guardAbsorbedMsg = ` 🛡️ Opponent's Royal Guard shattered!`;
              } else {
                updatedGuard[victim.color] = {
                  ...gState,
                  hitsRemaining: remaining,
                };
                guardAbsorbedMsg = ` 🛡️ Opponent's Royal Guard absorbed hit! (${remaining} left)`;
              }
            }
          }
        }
      }

      // C. Dismiss Royal Guard if player deploys a second token from yard (-1 to 0)
      if (move.fromStep === -1 && move.toStep === 0) {
        const myGuard = updatedGuard[currentPlayer.color];
        if (myGuard?.active) {
          const alreadyOnTrack = context.pawns.filter(
            (p) =>
              p.playerIndex === context.currentPlayerIndex &&
              p.id !== move.pawnId &&
              p.step >= 0 &&
              p.step < 56
          );
          if (alreadyOnTrack.length >= 1) {
            updatedGuard[currentPlayer.color] = {
              ...myGuard,
              active: false,
              targetPawnId: null,
              hitsRemaining: 2,
            };
            guardAbsorbedMsg += ` (Royal Guard dismissed: 2nd token deployed)`;
          }
        }
      }

      // D. Stasis break move
      if (move.isStasisBreakMove) {
        updatedStasis = updatedStasis.filter((s) => s.targetPawnId !== move.pawnId);
      }

      const nextBoardPowers: BoardPowersState = {
        ...context.boardPowers,
        walls: updatedWalls,
        guard: updatedGuard,
        stasis: updatedStasis,
      };

      const rolledSix = context.diceValue === 6;
      const killedOpponent = move.willKillPawnIds.length > 0;
      const reachedHome = move.willReachHome;
      const earnedExtra = rolledSix || killedOpponent || reachedHome;

      let statusMessage = `${currentPlayer.name} moved to step ${move.toStep}.`;
      if (killedOpponent) {
        const perkTag =
          perk.captureBountyBonus > 0
            ? ` (+${30 + perk.captureBountyBonus} ${perk.perkName})`
            : '';
        statusMessage = `💥 CAPTURE! ${currentPlayer.name} cut opponent token${perkTag} & gets a Bonus Roll!`;
        if (royalMarchTriggered) {
          statusMessage += ` 🏛️ Royal March: Teammate advanced +2 steps!`;
        }
      } else if (reachedHome) {
        statusMessage = `🏠 HOME! ${currentPlayer.name}'s token reached Home! Bonus Roll!`;
      } else if (move.landsOnSafeStar) {
        const fortTag =
          perk.safeStarFortitudeBonus > 0
            ? ` (+${perk.safeStarFortitudeBonus} ${perk.perkName})`
            : '';
        statusMessage = `⭐ Safe Star! ${currentPlayer.name} is fortified${fortTag}.`;
      } else if (move.toStep >= 51 && move.fromStep < 51 && perk.homeStretchSurgeBonus > 0) {
        statusMessage = `⚡ Overdrive! ${currentPlayer.name} entered Home Stretch (+${perk.homeStretchSurgeBonus} Surge)!`;
      } else if (rolledSix) {
        statusMessage = `🎲 Rolled a 6! ${currentPlayer.name} gets an Extra Roll!`;
      }

      if (move.perkRuleTag) {
        statusMessage += ` [${move.perkRuleTag}]`;
      }
      if (guardAbsorbedMsg) {
        statusMessage += guardAbsorbedMsg;
      }
      if (speedDashTriggered) {
        statusMessage += ` ⚡ HYPER WARP SURGE! Rocketed +${warpSurgeLeap} tiles forward!`;
      }

      return {
        pawns: updatedPawns,
        activeMove: null,
        hasExtraTurn: earnedExtra,
        lastCapturedPawnIds: move.willKillPawnIds,
        captureBonusPoints: nextBonus,
        capturedPlayerFlags: nextCapturedFlags,
        playerHasCapturedAnyOpponent: nextHasCaptured,
        legalMoves: [],
        boardPowers: nextBoardPowers,
        statusMessage,
      };
    }),

    prepareExtraTurn: assign(({ context }) => {
      const currentPlayer = context.players[context.currentPlayerIndex];
      const playerPawns = context.pawns.filter(
        (p) => p.playerIndex === context.currentPlayerIndex
      );
      const canPlaceMarbleWall = canPlayerPlaceMarbleWall(
        context.boardTheme,
        context.consecutiveSixes
      );
      const canDeployGuard = canPlayerDeployRoyalGuard(
        context.boardTheme,
        playerPawns,
        context.boardPowers.guard[currentPlayer.color]
      );
      const canLaunchAsteroid = canPlayerLaunchCyberAsteroid(
        context.boardTheme,
        playerPawns,
        context.consecutiveSixes,
        context.boardPowers.lastNearHomeStasisTimestamp[currentPlayer.color] ?? 0
      );
      return {
        diceValue: null,
        activeMove: null,
        hasExtraTurn: false,
        legalMoves: [],
        statusMessage: `🔥 Bonus Turn for ${currentPlayer.name}! Roll again!`,
        canPlaceMarbleWall,
        canDeployGuard,
        canLaunchAsteroid,
      };
    }),

    switchToNextPlayer: assign(({ context }) => {
      const nextIdx = (context.currentPlayerIndex + 1) % context.players.length;
      const nextPlayer = context.players[nextIdx];
      const nextPawns = context.pawns.filter((p) => p.playerIndex === nextIdx);
      const canDeployGuard = canPlayerDeployRoyalGuard(
        context.boardTheme,
        nextPawns,
        context.boardPowers.guard[nextPlayer.color]
      );
      const canLaunchAsteroid = canPlayerLaunchCyberAsteroid(
        context.boardTheme,
        nextPawns,
        0,
        context.boardPowers.lastNearHomeStasisTimestamp[nextPlayer.color] ?? 0
      );
      return {
        currentPlayerIndex: nextIdx,
        diceValue: null,
        consecutiveSixes: 0,
        activeMove: null,
        hasExtraTurn: false,
        legalMoves: [],
        lastCapturedPawnIds: [],
        turnNumber: context.turnNumber + 1,
        statusMessage: `${nextPlayer.name}'s turn to roll!`,
        canPlaceMarbleWall: false,
        canDeployGuard,
        canLaunchAsteroid,
      };
    }),

    declareWinner: assign(({ context }) => {
      const winner = context.players[context.currentPlayerIndex];
      const activeTheme =
        BOARD_THEMES.find((t) => t.id === context.boardTheme) ?? BOARD_THEMES[0];
      const nextBonus = [...context.captureBonusPoints];

      // BUG-03 FIX: Only award cleanMatchBounty if winner's pawns were NEVER captured
      const winnerWasNeverCaptured =
        !context.capturedPlayerFlags[context.currentPlayerIndex];
      if (activeTheme.perk.cleanMatchBounty > 0 && winnerWasNeverCaptured) {
        nextBonus[context.currentPlayerIndex] =
          (nextBonus[context.currentPlayerIndex] ?? 0) +
          activeTheme.perk.cleanMatchBounty;
      }

      return {
        winnerIndex: context.currentPlayerIndex,
        captureBonusPoints: nextBonus,
        statusMessage: `🏆 ${winner.name} wins the match!`,
      };
    }),

    deployMarbleWall: assign(({ context, event }) => {
      if (event.type !== 'DEPLOY_MARBLE_WALL') return {};
      const currentPlayer = context.players[context.currentPlayerIndex];
      const newWall: MarbleWall = {
        id: `wall-${Date.now()}-${event.tileIndex}`,
        ownerColor: currentPlayer.color,
        tileIndex: event.tileIndex,
        hp: 1,
      };
      return {
        boardPowers: {
          ...context.boardPowers,
          walls: [
            ...context.boardPowers.walls.filter((w) => w.tileIndex !== event.tileIndex),
            newWall,
          ],
        },
        canPlaceMarbleWall: false,
        statusMessage: `🧱 ${currentPlayer.name} erected a Roman Marble Wall at tile ${event.tileIndex}!`,
      };
    }),

    deployRoyalGuard: assign(({ context, event }) => {
      if (event.type !== 'DEPLOY_ROYAL_GUARD') return {};
      const currentPlayer = context.players[context.currentPlayerIndex];
      return {
        boardPowers: {
          ...context.boardPowers,
          guard: {
            ...context.boardPowers.guard,
            [currentPlayer.color]: {
              active: true,
              ownerColor: currentPlayer.color,
              targetPawnId: event.pawnId,
              hitsRemaining: 2,
            },
          },
        },
        canDeployGuard: false,
        statusMessage: `🛡️ Royal Guard deployed to protect token! Absorbs next 2 cuts.`,
      };
    }),

    launchCyberAsteroid: assign(({ context, event }) => {
      if (event.type !== 'LAUNCH_CYBER_ASTEROID') return {};
      const currentPlayer = context.players[context.currentPlayerIndex];
      const newStasis: CyberStasis = {
        targetPawnId: event.targetPawnId,
        appliedAt: Date.now(),
        durationMs: 60000,
      };
      return {
        boardPowers: {
          ...context.boardPowers,
          stasis: [
            ...context.boardPowers.stasis.filter((s) => s.targetPawnId !== event.targetPawnId),
            newStasis,
          ],
          lastNearHomeStasisTimestamp: {
            ...context.boardPowers.lastNearHomeStasisTimestamp,
            [currentPlayer.color]: Date.now(),
          },
        },
        canLaunchAsteroid: false,
        statusMessage: `☄️ Cyber Asteroid impact! Opponent token frozen in stasis for 60s!`,
      };
    }),

    breakStasisWithSix: assign(({ context, event }) => {
      if (event.type !== 'BREAK_STASIS_WITH_SIX') return {};
      const currentPlayer = context.players[context.currentPlayerIndex];
      return {
        boardPowers: {
          ...context.boardPowers,
          stasis: context.boardPowers.stasis.filter((s) => s.targetPawnId !== event.pawnId),
        },
        statusMessage: `⚡ ${currentPlayer.name} broke Cyber Stasis!`,
      };
    }),

    tickStasisTimers: assign(({ context, event }) => {
      if (event.type !== 'TICK_STASIS_TIMERS') return {};
      const nextStasis = cleanExpiredStasis(context.boardPowers.stasis, event.currentTime);
      if (nextStasis.length === context.boardPowers.stasis.length) {
        return {};
      }
      return {
        boardPowers: {
          ...context.boardPowers,
          stasis: nextStasis,
        },
      };
    }),

    resetMatchState: assign(({ context, event }) => {
      const players =
        event.type === 'CONFIGURE_PLAYERS' ? event.players : context.players;
      const boardTheme =
        event.type === 'CONFIGURE_PLAYERS' && event.boardTheme
          ? event.boardTheme
          : context.boardTheme;
      const pCount =
        event.type === 'CONFIGURE_PLAYERS' && event.pawnCount
          ? event.pawnCount
          : event.type === 'RESET_MATCH' && event.pawnCount
          ? event.pawnCount
          : context.pawns.filter((p) => p.playerIndex === 0).length || 4;
      return {
        players,
        pawns: createInitialPawns(players, pCount),
        boardTheme,
        currentPlayerIndex: 0,
        diceValue: null,
        playerLastDiceValues: players.map(() => 1),
        consecutiveSixes: 0,
        legalMoves: [],
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        captureBonusPoints: players.map(() => 0),
        capturedPlayerFlags: players.map(() => false),
        playerHasCapturedAnyOpponent: players.map(() => false),
        biasState: createInitialBiasState(),
        winnerIndex: null,
        turnNumber: 1,
        statusMessage: `${players[0]?.name || 'Player 1'}'s turn to roll!`,
        boardPowers: createInitialBoardPowers(),
        canPlaceMarbleWall: false,
        canDeployGuard: false,
        canLaunchAsteroid: false,
      };
    }),

    restoreSessionState: assign(({ event }) => {
      if (event.type !== 'RESTORE_SESSION') return {};
      const s = event.session;
      const initialPowers = s.boardPowers ?? createInitialBoardPowers();
      const currentPlayer = s.players[s.currentPlayerIndex] ?? s.players[0];
      const playerPawns = s.pawns.filter((p) => p.playerIndex === s.currentPlayerIndex);
      const canPlaceMarbleWall = canPlayerPlaceMarbleWall(
        s.boardTheme ?? 'classic-kingdom',
        s.consecutiveSixes ?? 0
      );
      const canDeployGuard = canPlayerDeployRoyalGuard(
        s.boardTheme ?? 'classic-kingdom',
        playerPawns,
        initialPowers.guard[currentPlayer.color]
      );
      const canLaunchAsteroid = canPlayerLaunchCyberAsteroid(
        s.boardTheme ?? 'classic-kingdom',
        playerPawns,
        s.consecutiveSixes ?? 0,
        initialPowers.lastNearHomeStasisTimestamp[currentPlayer.color] ?? 0
      );
      return {
        players: s.players,
        pawns: s.pawns,
        boardTheme: s.boardTheme ?? 'classic-kingdom',
        currentPlayerIndex: s.currentPlayerIndex,
        diceValue: null,
        playerLastDiceValues: s.playerLastDiceValues ?? s.players.map(() => 1),
        consecutiveSixes: s.consecutiveSixes ?? 0,
        legalMoves: [],
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        captureBonusPoints: s.captureBonusPoints ?? s.players.map(() => 0),
        capturedPlayerFlags: s.capturedPlayerFlags ?? s.players.map(() => false),
        playerHasCapturedAnyOpponent:
          s.playerHasCapturedAnyOpponent ?? s.players.map(() => false),
        biasState: s._e ?? createInitialBiasState(),
        winnerIndex: null,
        turnNumber: s.turnNumber ?? 1,
        statusMessage:
          s.statusMessage ||
          `${s.players[s.currentPlayerIndex]?.name || 'Player'}'s turn to roll!`,
        boardPowers: initialPowers,
        canPlaceMarbleWall,
        canDeployGuard,
        canLaunchAsteroid,
      };
    }),
  },
}).createMachine({
  id: 'ludoMania',
  initial: 'IDLE',
  context: ({ input }) => {
    if (input.savedSession) {
      const s = input.savedSession;
      const initialPowers = s.boardPowers ?? createInitialBoardPowers();
      const currentPlayer = s.players[s.currentPlayerIndex] ?? s.players[0];
      const playerPawns = s.pawns.filter((p) => p.playerIndex === s.currentPlayerIndex);
      const canPlaceMarbleWall = canPlayerPlaceMarbleWall(
        s.boardTheme ?? input.boardTheme ?? 'classic-kingdom',
        s.consecutiveSixes ?? 0
      );
      const canDeployGuard = canPlayerDeployRoyalGuard(
        s.boardTheme ?? input.boardTheme ?? 'classic-kingdom',
        playerPawns,
        initialPowers.guard[currentPlayer.color]
      );
      const canLaunchAsteroid = canPlayerLaunchCyberAsteroid(
        s.boardTheme ?? input.boardTheme ?? 'classic-kingdom',
        playerPawns,
        s.consecutiveSixes ?? 0,
        initialPowers.lastNearHomeStasisTimestamp[currentPlayer.color] ?? 0
      );
      return {
        players: s.players,
        pawns: s.pawns,
        boardTheme: s.boardTheme ?? input.boardTheme ?? 'classic-kingdom',
        currentPlayerIndex: s.currentPlayerIndex,
        diceValue: null,
        playerLastDiceValues: s.playerLastDiceValues ?? s.players.map(() => 1),
        consecutiveSixes: s.consecutiveSixes ?? 0,
        legalMoves: [],
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        captureBonusPoints: s.captureBonusPoints ?? s.players.map(() => 0),
        capturedPlayerFlags: s.capturedPlayerFlags ?? s.players.map(() => false),
        playerHasCapturedAnyOpponent:
          s.playerHasCapturedAnyOpponent ?? s.players.map(() => false),
        biasState: s._e ?? createInitialBiasState(),
        winnerIndex: null,
        turnNumber: s.turnNumber ?? 1,
        statusMessage:
          s.statusMessage ||
          `${s.players[s.currentPlayerIndex]?.name || 'Player'}'s turn to roll!`,
        boardPowers: initialPowers,
        canPlaceMarbleWall,
        canDeployGuard,
        canLaunchAsteroid,
      };
    }
    return {
      players: input.players,
      pawns: createInitialPawns(input.players, input.pawnCount ?? 4),
      boardTheme: input.boardTheme ?? 'classic-kingdom',
      currentPlayerIndex: 0,
      diceValue: null,
      playerLastDiceValues: input.players.map(() => 1),
      consecutiveSixes: 0,
      legalMoves: [],
      activeMove: null,
      hasExtraTurn: false,
      lastCapturedPawnIds: [],
      captureBonusPoints: input.players.map(() => 0),
      capturedPlayerFlags: input.players.map(() => false),
      playerHasCapturedAnyOpponent: input.players.map(() => false),
      biasState: createInitialBiasState(),
      winnerIndex: null,
      turnNumber: 1,
      statusMessage: `${input.players[0]?.name || 'Player 1'}'s turn to roll!`,
      boardPowers: createInitialBoardPowers(),
      canPlaceMarbleWall: false,
      canDeployGuard: false,
      canLaunchAsteroid: false,
    };
  },
  on: {
    CONFIGURE_PLAYERS: {
      target: '.IDLE',
      actions: 'resetMatchState',
    },
    RESTORE_SESSION: {
      target: '.IDLE',
      actions: 'restoreSessionState',
    },
    RESET_MATCH: {
      target: '.IDLE',
      actions: 'resetMatchState',
    },
    TICK_STASIS_TIMERS: {
      actions: 'tickStasisTimers',
    },
    DEPLOY_MARBLE_WALL: {
      actions: 'deployMarbleWall',
    },
    DEPLOY_ROYAL_GUARD: {
      actions: 'deployRoyalGuard',
    },
    LAUNCH_CYBER_ASTEROID: {
      actions: 'launchCyberAsteroid',
    },
    BREAK_STASIS_WITH_SIX: {
      actions: 'breakStasisWithSix',
    },
  },
  states: {
    IDLE: {
      on: {
        ROLL_DICE: {
          target: 'ROLLING',
          actions: 'performSmartRoll',
        },
      },
    },

    ROLLING: {
      on: {
        DICE_SETTLED: {
          target: 'EVALUATING_MOVES',
          actions: 'computeLegalMoves',
        },
      },
    },

    EVALUATING_MOVES: {
      always: [
        {
          guard: 'isThirdConsecutiveSix',
          target: 'NO_MOVES_PAUSE',
        },
        {
          guard: 'hasZeroLegalMoves',
          target: 'NO_MOVES_PAUSE',
        },
        {
          guard: 'hasSingleAutoMove',
          target: 'AUTO_MOVE_PAUSE',
        },
        {
          target: 'SELECTING_PAWN',
        },
      ],
    },

    AUTO_MOVE_PAUSE: {
      after: {
        280: {
          target: 'MOVING',
          actions: 'selectAutoMove',
        },
      },
    },

    NO_MOVES_PAUSE: {
      after: {
        720: {
          target: 'NEXT_TURN',
        },
      },
    },

    SELECTING_PAWN: {
      on: {
        SELECT_PAWN: {
          guard: 'isValidPawnSelection',
          target: 'MOVING',
          actions: 'selectChosenPawnMove',
        },
      },
    },

    MOVING: {
      on: {
        ANIMATION_COMPLETE: {
          target: 'CHECK_KILL_OR_WIN',
          actions: 'applyMoveAndCheckCaptures',
        },
      },
    },

    CHECK_KILL_OR_WIN: {
      always: [
        {
          guard: 'hasPlayerWon',
          target: 'GAME_OVER',
          actions: 'declareWinner',
        },
        {
          guard: 'earnedExtraTurn',
          target: 'EXTRA_TURN',
        },
        {
          target: 'NEXT_TURN',
        },
      ],
    },

    EXTRA_TURN: {
      after: {
        520: {
          target: 'IDLE',
          actions: 'prepareExtraTurn',
        },
      },
    },

    NEXT_TURN: {
      after: {
        260: {
          target: 'IDLE',
          actions: 'switchToNextPlayer',
        },
      },
    },

    GAME_OVER: {
      on: {
        RESET_MATCH: {
          target: 'IDLE',
          actions: 'resetMatchState',
        },
      },
    },
  },
});
