import {
  CapturedPawnInfo,
  DiceBiasState,
  MoveEvaluation,
  Pawn,
  PlayerColor,
  PlayerConfig,
} from '../types/game';
import {
  buildStepPath,
  getGlobalTrackIndex,
  isSafeStep,
  SAFE_TRACK_INDICES,
} from './boardConfig';

/**
 * Cryptographically uniform integer in [min, max] inclusive
 */
export function fairRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return min + (arr[0] % range);
  }
  return Math.floor(Math.random() * range) + min;
}

/**
 * Stealth check whether a player's name triggers the "Rahul Always Wins" bias engine
 */
export function isRahulName(name: string | undefined | null): boolean {
  if (!name) return false;
  return name.trim().toLowerCase() === 'rahul';
}

/**
 * Computes all legal pawn moves for a given player and dice value (1..6)
 */
export function getLegalMovesForPlayer(
  pawns: Pawn[],
  playerIndex: number,
  playerColor: PlayerColor,
  diceValue: number
): MoveEvaluation[] {
  const playerPawns = pawns.filter((p) => p.playerIndex === playerIndex);
  const legalMoves: MoveEvaluation[] = [];

  for (const pawn of playerPawns) {
    // 1. Pawn in Yard (-1): requires a 6 to deploy to start square (step 0)
    if (pawn.step === -1) {
      if (diceValue === 6) {
        const toStep = 0;
        const targetGlobalIdx = getGlobalTrackIndex(playerColor, toStep);
        const landsOnSafeStar =
          targetGlobalIdx !== null && SAFE_TRACK_INDICES.has(targetGlobalIdx);

        const killedPawns = landsOnSafeStar
          ? []
          : pawns.filter(
              (other) =>
                other.playerIndex !== playerIndex &&
                other.step >= 0 &&
                other.step <= 50 &&
                getGlobalTrackIndex(other.color, other.step) === targetGlobalIdx
            );

        const capturedPawnsInfo: CapturedPawnInfo[] = killedPawns.map((o) => ({
          pawnId: o.id,
          color: o.color,
          pawnIndex: o.pawnIndex,
          fromStep: o.step,
        }));

        legalMoves.push({
          pawnId: pawn.id,
          fromStep: -1,
          toStep: 0,
          pathSteps: [0],
          willKillPawnIds: killedPawns.map((o) => o.id),
          capturedPawnsInfo,
          willReachHome: false,
          landsOnSafeStar,
        });
      }
      continue;
    }

    // 2. Pawn already in Home Goal (56): cannot move
    if (pawn.step >= 56) {
      continue;
    }

    // 3. Pawn on Main Track (0..50) or Home Stretch (51..55)
    const toStep = pawn.step + diceValue;
    if (toStep > 56) {
      continue;
    }

    const pathSteps = buildStepPath(pawn.step, toStep);
    const willReachHome = toStep === 56;
    let landsOnSafeStar = false;
    let killedPawns: Pawn[] = [];

    if (toStep <= 50) {
      const targetGlobalIdx = getGlobalTrackIndex(playerColor, toStep);
      landsOnSafeStar =
        targetGlobalIdx !== null && SAFE_TRACK_INDICES.has(targetGlobalIdx);

      if (!landsOnSafeStar && targetGlobalIdx !== null) {
        killedPawns = pawns.filter(
          (other) =>
            other.playerIndex !== playerIndex &&
            other.step >= 0 &&
            other.step <= 50 &&
            getGlobalTrackIndex(other.color, other.step) === targetGlobalIdx
        );
      }
    }

    const capturedPawnsInfo: CapturedPawnInfo[] = killedPawns.map((o) => ({
      pawnId: o.id,
      color: o.color,
      pawnIndex: o.pawnIndex,
      fromStep: o.step,
    }));

    legalMoves.push({
      pawnId: pawn.id,
      fromStep: pawn.step,
      toStep,
      pathSteps,
      willKillPawnIds: killedPawns.map((o) => o.id),
      capturedPawnsInfo,
      willReachHome,
      landsOnSafeStar,
    });
  }

  return legalMoves;
}

/**
 * Helper: finds clockwise step distance `d` (1..51) from a chaser pawn to a target pawn on the main track.
 */
export function getCaptureDistanceBetweenPawns(
  chaser: Pawn,
  target: Pawn
): number | null {
  if (chaser.step < 0 || chaser.step > 50) return null;
  if (target.step < 0 || target.step > 50) return null;
  if (isSafeStep(target.color, target.step)) return null;

  const chaserGlobal = getGlobalTrackIndex(chaser.color, chaser.step);
  const targetGlobal = getGlobalTrackIndex(target.color, target.step);
  if (chaserGlobal === null || targetGlobal === null) return null;

  const dist = (targetGlobal - chaserGlobal + 52) % 52;
  if (dist <= 0) return null;

  // Ensure chaser does not enter its own home stretch (step > 50) before reaching target
  if (chaser.step + dist > 50) return null;

  return dist;
}

export function createInitialBiasState(): DiceBiasState {
  return {
    rahulRollCount: 0,
    queuedComboRolls: [],
    chaseWindowCounter: 0,
    chaseWindowTarget: fairRandomInt(2, 4),
    lastBiasReason: null,
  };
}

export interface SmartDiceResult {
  diceValue: number;
  nextBiasState: DiceBiasState;
}

/**
 * Stealth Smart Dice Engine:
 * - Normal users (when no player is named "Rahul"): 100% fair uniform random 1..6.
 * - When a player is named "Rahul" (100% stealth, no every-4th-roll 6 spike):
 *   1. Emergency Near-Home Assassination: If opponent is near their home (step >= 35) and <= 7 steps ahead of Rahul:
 *      - Distance 1..6 -> Exact roll immediately!
 *      - Distance 7 -> Rolls 6 (extra turn) + queues 1 for immediate bonus roll (6 + 1 = 7)!
 *   2. Opponent <= 5 Steps Ahead of Rahul: Within 2 to 4 rolls randomly, deals the exact distance (1..5) to capture.
 *   3. Always-Win Guarantee: Natural deployment + exact home entry bias + opponent anti-win/anti-kill shield.
 */
export function rollSmartDice(params: {
  players: PlayerConfig[];
  currentPlayerIndex: number;
  pawns: Pawn[];
  consecutiveSixes: number;
  biasState: DiceBiasState;
}): SmartDiceResult {
  const { players, currentPlayerIndex, pawns, consecutiveSixes, biasState } = params;
  const currentPlayer = players[currentPlayerIndex];
  const rahulPlayerIndex = players.findIndex((p) => isRahulName(p.name));

  // CASE 1: No player is named "Rahul" -> 100% Fair Unbiased Random Dice
  if (rahulPlayerIndex === -1) {
    return {
      diceValue: fairRandomInt(1, 6),
      nextBiasState: {
        ...biasState,
        lastBiasReason: null,
      },
    };
  }

  const nextBias: DiceBiasState = {
    ...biasState,
    queuedComboRolls: [...biasState.queuedComboRolls],
  };

  // CASE 2: Current Player IS "Rahul" -> Stealth Winning Engine
  if (currentPlayerIndex === rahulPlayerIndex) {
    nextBias.rahulRollCount += 1;
    const canRollSix = consecutiveSixes < 2;

    const rahulPawns = pawns.filter((p) => p.playerIndex === rahulPlayerIndex);
    const opponentPawns = pawns.filter((p) => p.playerIndex !== rahulPlayerIndex);

    // PRIORITY 0: Execute Queued Combo Roll (e.g., [1] after rolling 6 for dist=7)
    if (nextBias.queuedComboRolls.length > 0) {
      const nextComboRoll = nextBias.queuedComboRolls.shift()!;
      if (nextComboRoll !== 6 || canRollSix) {
        nextBias.lastBiasReason = 'COMBO_FOLLOWUP_EXACT';
        return { diceValue: nextComboRoll, nextBiasState: nextBias };
      }
    }

    // PRIORITY 1: Opponent Near Their Home (step >= 35) & Within <= 7 of Rahul
    const nearHomeOpponents = opponentPawns
      .filter((op) => op.step >= 35 && op.step <= 50 && !isSafeStep(op.color, op.step))
      .sort((a, b) => b.step - a.step);

    for (const opp of nearHomeOpponents) {
      for (const rPawn of rahulPawns) {
        const dist = getCaptureDistanceBetweenPawns(rPawn, opp);
        if (dist !== null && dist >= 1 && dist <= 7) {
          if (dist <= 5) {
            nextBias.lastBiasReason = `NEAR_HOME_EXACT_${dist}`;
            nextBias.chaseWindowCounter = 0;
            return { diceValue: dist, nextBiasState: nextBias };
          }
          if (dist === 6 && canRollSix) {
            nextBias.lastBiasReason = 'NEAR_HOME_EXACT_6';
            nextBias.chaseWindowCounter = 0;
            return { diceValue: 6, nextBiasState: nextBias };
          }
          if (dist === 7 && canRollSix) {
            nextBias.queuedComboRolls = [1];
            nextBias.lastBiasReason = 'NEAR_HOME_COMBO_6_PLUS_1';
            nextBias.chaseWindowCounter = 0;
            return { diceValue: 6, nextBiasState: nextBias };
          }
        }
      }

      // If Rahul has a pawn in Yard (-1) and the near-home opponent is 1..5 steps past Rahul's start square:
      const hasYardPawn = rahulPawns.some((rp) => rp.step === -1);
      if (hasYardPawn && canRollSix) {
        const fakeStartPawn: Pawn = {
          id: 'sim-start',
          playerIndex: rahulPlayerIndex,
          color: currentPlayer.color,
          pawnIndex: 0,
          step: 0,
        };
        const distFromStart = getCaptureDistanceBetweenPawns(fakeStartPawn, opp);
        if (distFromStart !== null && distFromStart >= 1 && distFromStart <= 5) {
          nextBias.queuedComboRolls = [distFromStart];
          nextBias.lastBiasReason = `NEAR_HOME_YARD_DEPLOY_PLUS_${distFromStart}`;
          return { diceValue: 6, nextBiasState: nextBias };
        }
      }
    }

    // PRIORITY 2: Opponent Within <= 5 Steps Ahead of Rahul (2 to 4 rolls random window)
    const closeKillDistances: number[] = [];
    for (const opp of opponentPawns) {
      for (const rPawn of rahulPawns) {
        const dist = getCaptureDistanceBetweenPawns(rPawn, opp);
        if (dist !== null && dist >= 1 && dist <= 5) {
          closeKillDistances.push(dist);
        }
      }
    }

    if (closeKillDistances.length > 0) {
      nextBias.chaseWindowCounter += 1;
      const shouldTriggerKillNow =
        nextBias.chaseWindowCounter >= nextBias.chaseWindowTarget ||
        (nextBias.chaseWindowCounter >= 2 && fairRandomInt(1, 100) <= 60);

      if (shouldTriggerKillNow) {
        const chosenDist = closeKillDistances[0];
        nextBias.chaseWindowCounter = 0;
        nextBias.chaseWindowTarget = fairRandomInt(2, 4);
        nextBias.lastBiasReason = `HUNTER_LE_5_EXACT_${chosenDist}`;
        return { diceValue: chosenDist, nextBiasState: nextBias };
      }
    } else {
      nextBias.chaseWindowCounter = 0;
    }

    // PRIORITY 3: Natural Opening Deployment & Exact Home Entry (Always-Win Engine)
    const activeBoardPawns = rahulPawns.filter((p) => p.step >= 0 && p.step < 56);
    const yardPawns = rahulPawns.filter((p) => p.step === -1);

    if (activeBoardPawns.length === 0 && yardPawns.length > 0 && canRollSix) {
      if (fairRandomInt(1, 100) <= 55) {
        nextBias.lastBiasReason = 'OPENING_DEPLOY_SIX';
        return { diceValue: 6, nextBiasState: nextBias };
      }
    }

    for (const rPawn of rahulPawns) {
      const stepsToHome = 56 - rPawn.step;
      if (stepsToHome >= 1 && stepsToHome <= 6) {
        if (stepsToHome === 6 && !canRollSix) continue;
        if (fairRandomInt(1, 100) <= 72) {
          nextBias.lastBiasReason = `HOME_FINISH_EXACT_${stepsToHome}`;
          return { diceValue: stepsToHome, nextBiasState: nextBias };
        }
      }
    }

    const candidateFaces = canRollSix ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
    const facesWithLegalMoves = candidateFaces.filter(
      (face) =>
        getLegalMovesForPlayer(pawns, currentPlayerIndex, currentPlayer.color, face)
          .length > 0
    );

    const pool = facesWithLegalMoves.length > 0 ? facesWithLegalMoves : candidateFaces;
    const chosenFace = pool[fairRandomInt(0, pool.length - 1)];
    nextBias.lastBiasReason = 'SMART_PROGRESSION';
    return { diceValue: chosenFace, nextBiasState: nextBias };
  }

  // CASE 3: Opponent Rolling in a Match Against "Rahul" (Protective Shield)
  const oppHomeCount = pawns.filter(
    (p) => p.playerIndex === currentPlayerIndex && p.step === 56
  ).length;

  const safeOpponentFaces: number[] = [];
  for (let face = 1; face <= 6; face++) {
    if (face === 6 && consecutiveSixes >= 2) continue;
    const moves = getLegalMovesForPlayer(
      pawns,
      currentPlayerIndex,
      currentPlayer.color,
      face
    );

    const wouldWinMatch =
      oppHomeCount >= 3 && moves.some((m) => m.willReachHome);
    if (wouldWinMatch) continue;

    const wouldKillAdvancedRahulPawn = moves.some((m) =>
      m.willKillPawnIds.some((killedId) => {
        const victim = pawns.find((p) => p.id === killedId);
        return (
          victim &&
          victim.playerIndex === rahulPlayerIndex &&
          victim.step >= 15
        );
      })
    );
    if (wouldKillAdvancedRahulPawn) continue;

    safeOpponentFaces.push(face);
  }

  const finalOppFace =
    safeOpponentFaces.length > 0
      ? safeOpponentFaces[fairRandomInt(0, safeOpponentFaces.length - 1)]
      : 1;

  return {
    diceValue: finalOppFace,
    nextBiasState: {
      ...nextBias,
      lastBiasReason: null,
    },
  };
}
