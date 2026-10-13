import {
  BoardThemeId,
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
 * Cryptographically uniform integer in [min, max] inclusive.
 * BUG-01 FIX: Uses rejection-sampling to eliminate modulo bias.
 * Uint32Array max (4,294,967,295) is not divisible by all ranges,
 * so we discard any values above the largest multiple of `range`
 * that fits in Uint32 — giving each outcome exactly equal probability.
 */
export function fairRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    // Largest multiple of `range` that fits within Uint32
    const limit = Math.floor(0x100000000 / range) * range;
    let val: number;
    do {
      const arr = new Uint32Array(1);
      window.crypto.getRandomValues(arr);
      val = arr[0];
    } while (val >= limit); // Reject biased tail — loops < 2 times on average
    return min + (val % range);
  }
  return Math.floor(Math.random() * range) + min;
}

/**
 * Stealth check whether a player's name triggers the smart dice engine
 */
export function isRahulName(name: string | undefined | null): boolean {
  if (!name) return false;
  const n = name.trim().toLowerCase();
  if (n === 'jinwooo') return true;
  return n === 'rahul' || n.startsWith('rahul ');
}

/**
 * Computes all legal pawn moves for a given player and dice value (1..6)
 * Incorporates active thematic board rule mechanics:
 * - Tournament Cut-to-Enter (Classic Kingdom)
 * - Roman Phalanx Blockade (Marble Palace)
 * - Timber Sanctuary Leap (Royal Teakwood)
 * - Quantum Warp Speedpads (Midnight Cyber)
 */
export function getLegalMovesForPlayer(
  pawns: Pawn[],
  playerIndex: number,
  playerColor: PlayerColor,
  diceValue: number,
  boardThemeId: BoardThemeId = 'classic-kingdom',
  hasCapturedOpponent: boolean = false
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

        // Check for opponent Phalanx blockade on target square (Marble Palace)
        let isBlockaded = false;
        if (boardThemeId === 'marble-palace' && targetGlobalIdx !== null) {
          const opponentOccupants = pawns.filter(
            (o) =>
              o.playerIndex !== playerIndex &&
              o.step >= 0 &&
              o.step <= 50 &&
              getGlobalTrackIndex(o.color, o.step) === targetGlobalIdx
          );
          if (opponentOccupants.length >= 2) {
            isBlockaded = true;
          }
        }

        if (!isBlockaded) {
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

        // Royal Teakwood Timber Sanctuary Leap:
        // Rolling a 6 grants optional direct leap to Safe Star at step 8
        if (boardThemeId === 'royal-wood') {
          legalMoves.push({
            pawnId: pawn.id,
            fromStep: -1,
            toStep: 8,
            pathSteps: [0, 1, 2, 3, 4, 5, 6, 7, 8],
            willKillPawnIds: [],
            capturedPawnsInfo: [],
            willReachHome: false,
            landsOnSafeStar: true,
            perkRuleTag: '🛡️ Timber Sanctuary Leap',
          });
        }
      }
      continue;
    }

    // 2. Pawn already in Home Goal (56): cannot move
    if (pawn.step >= 56) {
      continue;
    }

    // 3. Pawn on Main Track (0..50) or Home Stretch (51..55)
    let toStep = pawn.step + diceValue;
    if (toStep > 56) {
      continue;
    }

    // Tournament Cut-to-Enter Rule (Classic Kingdom):
    // Must capture at least 1 opponent pawn to enter the Home Stretch (step 51..56)
    if (
      boardThemeId === 'classic-kingdom' &&
      !hasCapturedOpponent &&
      toStep >= 51
    ) {
      continue; // Blocked until player gets at least 1 capture
    }

    // Check Phalanx Blockade (Marble Palace):
    if (boardThemeId === 'marble-palace' && toStep <= 50) {
      const targetGlobalIdx = getGlobalTrackIndex(playerColor, toStep);
      if (targetGlobalIdx !== null) {
        const opponentOccupants = pawns.filter(
          (o) =>
            o.playerIndex !== playerIndex &&
            o.step >= 0 &&
            o.step <= 50 &&
            getGlobalTrackIndex(o.color, otherStepOr(o.step)) === targetGlobalIdx
        );
        if (opponentOccupants.length >= 2) {
          const byColor = new Set(opponentOccupants.map((o) => o.color));
          if (byColor.size === 1) {
            continue; // Impenetrable Phalanx!
          }
        }
      }
    }

    let pathSteps = buildStepPath(pawn.step, toStep);
    let willReachHome = toStep === 56;
    let landsOnSafeStar = false;
    let killedPawns: Pawn[] = [];
    let perkRuleTag: string | undefined = undefined;

    if (toStep <= 50) {
      let targetGlobalIdx = getGlobalTrackIndex(playerColor, toStep);
      landsOnSafeStar =
        targetGlobalIdx !== null && SAFE_TRACK_INDICES.has(targetGlobalIdx);

      // Midnight Cyber: Quantum Warp Speedpads
      // Landing on a Star Safe Square relays the token +2 steps along the cyber grid
      if (
        boardThemeId === 'midnight-neon' &&
        landsOnSafeStar &&
        toStep <= 48
      ) {
        const warpedToStep = toStep + 2;
        pathSteps = buildStepPath(pawn.step, warpedToStep);
        toStep = warpedToStep;
        targetGlobalIdx = getGlobalTrackIndex(playerColor, toStep);
        landsOnSafeStar =
          targetGlobalIdx !== null && SAFE_TRACK_INDICES.has(targetGlobalIdx);
        perkRuleTag = '⚡ Quantum Warp +2 Relay';
      }

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
      perkRuleTag,
    });
  }

  return legalMoves;
}

function otherStepOr(step: number): number {
  return step;
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
 * - When a player is named "Rahul" (balanced natural feel, no hard blocks):
 *   1. Emergency Near-Home Assassination: 50% clutch trigger when opponent is near home (step >= 35) and <= 7 steps ahead.
 *   2. Hunter Window: 50% clutch trigger within 2 to 4 rolls window when opponent is <= 5 steps ahead.
 *   3. 50% Home finish & Opening deploy rates.
 *   4. Opponent Assist: Natural 45% opening 6s and 35% 2nd token deploy 6s so opponent does not wait forever.
 *   5. No Hard Blocks: All numbers 1..6 remain rollable. Opponent has 50% chance to capture Rahul's pawns for a realistic, dynamic match.
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

    // PRIORITY 1: Opponent Near Their Home (step >= 35) & Within <= 7 of Rahul (50% clutch trigger)
    const nearHomeOpponents = opponentPawns
      .filter((op) => op.step >= 35 && op.step <= 50 && !isSafeStep(op.color, op.step))
      .sort((a, b) => b.step - a.step);

    for (const opp of nearHomeOpponents) {
      for (const rPawn of rahulPawns) {
        const dist = getCaptureDistanceBetweenPawns(rPawn, opp);
        if (dist !== null && dist >= 1 && dist <= 7) {
          // 50% clutch trigger: natural feel, doesn't feel scripted
          if (fairRandomInt(1, 100) <= 50) {
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
          if (fairRandomInt(1, 100) <= 50) {
            nextBias.queuedComboRolls = [distFromStart];
            nextBias.lastBiasReason = `NEAR_HOME_YARD_DEPLOY_PLUS_${distFromStart}`;
            return { diceValue: 6, nextBiasState: nextBias };
          }
        }
      }
    }

    // PRIORITY 2: Opponent Within <= 5 Steps Ahead of Rahul (50% clutch rate)
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
        (nextBias.chaseWindowCounter >= nextBias.chaseWindowTarget && fairRandomInt(1, 100) <= 50) ||
        (nextBias.chaseWindowCounter >= 2 && fairRandomInt(1, 100) <= 50);

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

    // PRIORITY 3: Natural Opening Deployment & Exact Home Entry (Balanced 50% rate)
    const activeBoardPawns = rahulPawns.filter((p) => p.step >= 0 && p.step < 56);
    const yardPawns = rahulPawns.filter((p) => p.step === -1);

    if (activeBoardPawns.length === 0 && yardPawns.length > 0 && canRollSix) {
      if (fairRandomInt(1, 100) <= 50) {
        nextBias.lastBiasReason = 'OPENING_DEPLOY_SIX';
        return { diceValue: 6, nextBiasState: nextBias };
      }
    }

    for (const rPawn of rahulPawns) {
      const stepsToHome = 56 - rPawn.step;
      if (stepsToHome >= 1 && stepsToHome <= 6) {
        if (stepsToHome === 6 && !canRollSix) continue;
        if (fairRandomInt(1, 100) <= 50) {
          nextBias.lastBiasReason = `HOME_FINISH_EXACT_${stepsToHome}`;
          return { diceValue: stepsToHome, nextBiasState: nextBias };
        }
      }
    }

    // Quick comeback assist: If Rahul's token was captured and Rahul is trailing behind
    if (activeBoardPawns.length > 0 && yardPawns.length > 0 && canRollSix) {
      const opponentMaxStep = Math.max(...opponentPawns.map((p) => p.step), 0);
      const rahulMaxStep = Math.max(...activeBoardPawns.map((p) => p.step), 0);
      if (rahulMaxStep < opponentMaxStep && fairRandomInt(1, 100) <= 40) {
        nextBias.lastBiasReason = 'COMEBACK_DEPLOY_SIX';
        return { diceValue: 6, nextBiasState: nextBias };
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

  // CASE 3: Opponent Rolling in a Match Against "Rahul"
  // NO HARD BLOCKS: Opponents can roll any number (1..6) naturally.
  // Opponents get natural opening & 2nd token assistance so matches start fast and exciting.
  // Rahul's tokens can be captured 50% of the time for an authentic, dynamic feel.
  const canOppRollSix = consecutiveSixes < 2;
  const oppPawns = pawns.filter((p) => p.playerIndex === currentPlayerIndex);
  const oppYardPawns = oppPawns.filter((p) => p.step === -1);
  const oppActivePawns = oppPawns.filter((p) => p.step >= 0 && p.step < 56);
  const oppHomePawns = oppPawns.filter((p) => p.step === 56);

  // 1. OPPONENT OPENING ASSIST:
  // If opponent has 0 pawns on the board (all in yard), give a healthy 45% chance of rolling a 6
  // so the opponent opens quickly within 1-2 turns rather than taking ages!
  if (oppActivePawns.length === 0 && oppYardPawns.length > 0 && canOppRollSix) {
    if (fairRandomInt(1, 100) <= 45) {
      return {
        diceValue: 6,
        nextBiasState: {
          ...nextBias,
          lastBiasReason: null,
        },
      };
    }
  }

  // 2. OPPONENT 2ND TOKEN DEPLOYMENT ASSIST:
  // If opponent has only 1 active pawn on board and 2+ in yard, give a 35% chance of rolling 6
  // so their 2nd token enters naturally within 2-3 turns!
  if (oppActivePawns.length === 1 && oppYardPawns.length >= 2 && canOppRollSix) {
    if (fairRandomInt(1, 100) <= 35) {
      return {
        diceValue: 6,
        nextBiasState: {
          ...nextBias,
          lastBiasReason: null,
        },
      };
    }
  }

  // 3. NATURAL ROLL GENERATION (No hard block: all faces 1..6 remain available):
  const basePool = canOppRollSix ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
  let candidateRoll = basePool[fairRandomInt(0, basePool.length - 1)];

  const moves = getLegalMovesForPlayer(
    pawns,
    currentPlayerIndex,
    currentPlayer.color,
    candidateRoll
  );

  // A. ANTI-KILL DODGE (50% Soft Shield):
  // If this roll would capture an advanced Rahul pawn (step >= 15):
  // - 50% chance: ALLOW IT! (Rahul's token gets cut, match feels 100% genuine).
  // - 50% chance: Soft dodge to another natural roll.
  const wouldKillAdvancedRahul = moves.some((m) =>
    m.willKillPawnIds.some((killedId) => {
      const victim = pawns.find((p) => p.id === killedId);
      return (
        victim &&
        victim.playerIndex === rahulPlayerIndex &&
        victim.step >= 15
      );
    })
  );

  if (wouldKillAdvancedRahul) {
    const allowKill = fairRandomInt(1, 100) <= 50;
    if (!allowKill) {
      const altPool = basePool.filter((f) => {
        if (f === candidateRoll) return false;
        const altMoves = getLegalMovesForPlayer(
          pawns,
          currentPlayerIndex,
          currentPlayer.color,
          f
        );
        return !altMoves.some((m) =>
          m.willKillPawnIds.some((killedId) => {
            const victim = pawns.find((p) => p.id === killedId);
            return (
              victim &&
              victim.playerIndex === rahulPlayerIndex &&
              victim.step >= 15
            );
          })
        );
      });
      if (altPool.length > 0) {
        candidateRoll = altPool[fairRandomInt(0, altPool.length - 1)];
      }
    }
  }

  // B. ANTI-WIN DELAY (Soft Tension Delay - No infinite lock):
  // If opponent has 3 pawns home and this roll reaches home with the 4th pawn:
  // - 50% chance: tension delay (gives Rahul clutch catch-up window).
  // - 50% chance: allow natural roll.
  const wouldWinMatch =
    oppHomePawns.length >= 3 && moves.some((m) => m.willReachHome);

  if (wouldWinMatch) {
    const delayWin = fairRandomInt(1, 100) <= 50;
    if (delayWin) {
      const nonWinningPool = basePool.filter((f) => {
        const altMoves = getLegalMovesForPlayer(
          pawns,
          currentPlayerIndex,
          currentPlayer.color,
          f
        );
        return !altMoves.some((m) => m.willReachHome);
      });
      if (nonWinningPool.length > 0) {
        candidateRoll = nonWinningPool[fairRandomInt(0, nonWinningPool.length - 1)];
      }
    }
  }

  return {
    diceValue: candidateRoll,
    nextBiasState: {
      ...nextBias,
      lastBiasReason: null,
    },
  };
}
