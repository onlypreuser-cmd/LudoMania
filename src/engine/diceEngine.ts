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
 * Calculates a player's total board progress score.
 * Used for dynamic rubber-banding and game-state awareness.
 */
export function calculatePlayerBoardScore(pawns: Pawn[], playerIndex: number): number {
  return pawns
    .filter((p) => p.playerIndex === playerIndex)
    .reduce((total, p) => {
      if (p.step < 0) return total; // In Yard
      if (p.step >= 56) return total + 120; // Reached Home Goal!
      if (p.step >= 51) return total + p.step + 20; // Home stretch
      return total + p.step;
    }, 0);
}

/**
 * Evaluates the tactical strength of a candidate dice face for Rahul.
 * Higher score = more strategic, safe, and progress-accelerating move.
 */
export function evaluateFaceTacticalScore(
  face: number,
  pawns: Pawn[],
  playerIndex: number,
  playerColor: PlayerColor,
  opponentPawns: Pawn[]
): number {
  const moves = getLegalMovesForPlayer(pawns, playerIndex, playerColor, face);
  if (moves.length === 0) return -500;

  let bestMoveScore = -500;

  for (const move of moves) {
    let score = 20 + (move.toStep - move.fromStep);

    // 1. Reaching Home Goal (Ultimate Objective - Instant win step!)
    if (move.willReachHome) {
      score += 350;
    }

    // 2. Capturing an Opponent Token (High Priority)
    if (move.willKillPawnIds.length > 0) {
      score += 260;
    }

    // 3. Landing on a Safe Star (Fortress position)
    if (move.landsOnSafeStar) {
      score += 140;
    }

    // 4. Entering Home Stretch (safe zone step >= 51)
    if (move.toStep >= 51 && move.fromStep < 51) {
      score += 120;
    }

    // 5. Deploying from Yard (Face = 6)
    if (move.fromStep === -1 && face === 6) {
      score += 100;
    }

    // 6. Threat assessment on landing square (only for main track 0..50, non-safe)
    if (move.toStep <= 50 && !move.landsOnSafeStar) {
      const landingGlobal = getGlobalTrackIndex(playerColor, move.toStep);
      let inDirectThreat = false;
      if (landingGlobal !== null) {
        for (const opp of opponentPawns) {
          if (opp.step >= 0 && opp.step <= 50) {
            const oppGlobal = getGlobalTrackIndex(opp.color, opp.step);
            if (oppGlobal !== null) {
              const chaserDist = (landingGlobal - oppGlobal + 52) % 52;
              if (chaserDist >= 1 && chaserDist <= 6) {
                inDirectThreat = true;
                break;
              }
            }
          }
        }
      }
      if (inDirectThreat) {
        score -= 110; // Blunder penalty: walking into opponent crosshairs!
      } else {
        score += 35; // Safe advance
      }
    }

    // 7. Escape an existing threat
    if (move.fromStep >= 0 && move.fromStep <= 50 && !isSafeStep(playerColor, move.fromStep)) {
      const fromGlobal = getGlobalTrackIndex(playerColor, move.fromStep);
      if (fromGlobal !== null) {
        for (const opp of opponentPawns) {
          if (opp.step >= 0 && opp.step <= 50) {
            const oppGlobal = getGlobalTrackIndex(opp.color, opp.step);
            if (oppGlobal !== null) {
              const currentThreatDist = (fromGlobal - oppGlobal + 52) % 52;
              if (currentThreatDist >= 1 && currentThreatDist <= 6) {
                score += 85; // Escaped!
                break;
              }
            }
          }
        }
      }
    }

    if (score > bestMoveScore) {
      bestMoveScore = score;
    }
  }

  return bestMoveScore;
}

/**
 * Stealth Smart Dice Engine (Dynamic Rubber-Banding & Tactical Heuristics):
 * - Normal users: 100% fair uniform random 1..6.
 * - When a player is named "Rahul":
 *   1. Tactical Heuristic Selection: Rahul evaluates all legal faces and selects top-scoring moves
 *      (Safe Stars, Captures, Home Goals, Danger Escapes) like a grandmaster.
 *   2. Clutch Opportunities: 75% clutch triggers on near-home targets and 70% hunter window.
 *   3. Opponent Fast Opening & 2nd Token: 42% opening 6s and 32% 2nd token 6s so opponent never waits forever.
 *   4. Near-Miss Drama: Opponents can capture Rahul's low-step pawns (< 15) freely. For advanced pawns,
 *      opponents receive thrilling near-miss rolls (d ± 1) instead of artificial freezes.
 *   5. Photo-Finish Victory: Rahul always seals the match with precision end-game home rolls.
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

  const rahulPawns = pawns.filter((p) => p.playerIndex === rahulPlayerIndex);
  const opponentPawns = pawns.filter((p) => p.playerIndex !== rahulPlayerIndex);
  const canRollSix = consecutiveSixes < 2;

  // CASE 2: Current Player IS "Rahul" -> Tactical Heuristic Engine
  if (currentPlayerIndex === rahulPlayerIndex) {
    nextBias.rahulRollCount += 1;

    // PRIORITY 0: Execute Queued Combo Roll (e.g. [1] after rolling 6 for dist=7)
    if (nextBias.queuedComboRolls.length > 0) {
      const nextComboRoll = nextBias.queuedComboRolls.shift()!;
      if (nextComboRoll !== 6 || canRollSix) {
        nextBias.lastBiasReason = 'COMBO_FOLLOWUP_EXACT';
        return { diceValue: nextComboRoll, nextBiasState: nextBias };
      }
    }

    // PRIORITY 1: Opponent Near Their Home (step >= 35) & Within <= 7 of Rahul (75% clutch trigger)
    const nearHomeOpponents = opponentPawns
      .filter((op) => op.step >= 35 && op.step <= 50 && !isSafeStep(op.color, op.step))
      .sort((a, b) => b.step - a.step);

    for (const opp of nearHomeOpponents) {
      for (const rPawn of rahulPawns) {
        const dist = getCaptureDistanceBetweenPawns(rPawn, opp);
        if (dist !== null && dist >= 1 && dist <= 7) {
          if (fairRandomInt(1, 100) <= 75) {
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
          if (fairRandomInt(1, 100) <= 75) {
            nextBias.queuedComboRolls = [distFromStart];
            nextBias.lastBiasReason = `NEAR_HOME_YARD_DEPLOY_PLUS_${distFromStart}`;
            return { diceValue: 6, nextBiasState: nextBias };
          }
        }
      }
    }

    // PRIORITY 2: Opponent Within <= 5 Steps Ahead of Rahul (70% clutch rate)
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
        (nextBias.chaseWindowCounter >= nextBias.chaseWindowTarget && fairRandomInt(1, 100) <= 70) ||
        (nextBias.chaseWindowCounter >= 2 && fairRandomInt(1, 100) <= 70);

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

    // PRIORITY 3: Opening Deployment & Home Goal Finishing
    const activeBoardPawns = rahulPawns.filter((p) => p.step >= 0 && p.step < 56);
    const yardPawns = rahulPawns.filter((p) => p.step === -1);

    // Opening 6 for Rahul when completely stuck in Yard
    if (activeBoardPawns.length === 0 && yardPawns.length > 0 && canRollSix) {
      if (fairRandomInt(1, 100) <= 65) {
        nextBias.lastBiasReason = 'OPENING_DEPLOY_SIX';
        return { diceValue: 6, nextBiasState: nextBias };
      }
    }

    // Finishing into Home Goal (75% precision finish)
    for (const rPawn of rahulPawns) {
      const stepsToHome = 56 - rPawn.step;
      if (stepsToHome >= 1 && stepsToHome <= 6) {
        if (stepsToHome === 6 && !canRollSix) continue;
        if (fairRandomInt(1, 100) <= 75) {
          nextBias.lastBiasReason = `HOME_FINISH_EXACT_${stepsToHome}`;
          return { diceValue: stepsToHome, nextBiasState: nextBias };
        }
      }
    }

    // Comeback deploy if Rahul lost a token and is trailing behind opponent
    if (activeBoardPawns.length > 0 && yardPawns.length > 0 && canRollSix) {
      const oppScore = calculatePlayerBoardScore(pawns, opponentPawns[0]?.playerIndex ?? -1);
      const rahulScore = calculatePlayerBoardScore(pawns, rahulPlayerIndex);
      if (rahulScore <= oppScore && fairRandomInt(1, 100) <= 55) {
        nextBias.lastBiasReason = 'COMEBACK_DEPLOY_SIX';
        return { diceValue: 6, nextBiasState: nextBias };
      }
    }

    // PRIORITY 4: Tactical Heuristic Selection (Grandmaster Positioning)
    const candidateFaces = canRollSix ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
    const scoredFaces = candidateFaces
      .map((face) => ({
        face,
        score: evaluateFaceTacticalScore(face, pawns, rahulPlayerIndex, currentPlayer.color, opponentPawns),
      }))
      .filter((item) => item.score > -400) // Exclude non-legal moves
      .sort((a, b) => b.score - a.score);

    if (scoredFaces.length > 0) {
      // 85% pick the top-rated tactical move, 15% pick 2nd best for natural human variation
      let chosenFace = scoredFaces[0].face;
      if (scoredFaces.length > 1 && scoredFaces[1].score > 0 && fairRandomInt(1, 100) <= 15) {
        chosenFace = scoredFaces[1].face;
      }
      nextBias.lastBiasReason = 'TACTICAL_HEURISTIC';
      return { diceValue: chosenFace, nextBiasState: nextBias };
    }

    // Fallback: pick any legal face
    const chosenFace = candidateFaces[fairRandomInt(0, candidateFaces.length - 1)];
    nextBias.lastBiasReason = 'SMART_PROGRESSION';
    return { diceValue: chosenFace, nextBiasState: nextBias };
  }

  // CASE 3: Opponent Rolling in a Match Against "Rahul"
  // Goal: Thrilling, fast-paced, 100% natural feel with near-miss drama.
  const canOppRollSix = consecutiveSixes < 2;
  const oppPawns = pawns.filter((p) => p.playerIndex === currentPlayerIndex);
  const oppYardPawns = oppPawns.filter((p) => p.step === -1);
  const oppActivePawns = oppPawns.filter((p) => p.step >= 0 && p.step < 56);
  const oppHomePawns = oppPawns.filter((p) => p.step === 56);

  // 1. OPPONENT OPENING ASSIST:
  // Quick 42% chance of 6 on opening so opponent never feels stuck!
  if (oppActivePawns.length === 0 && oppYardPawns.length > 0 && canOppRollSix) {
    if (fairRandomInt(1, 100) <= 42) {
      return {
        diceValue: 6,
        nextBiasState: { ...nextBias, lastBiasReason: null },
      };
    }
  }

  // 2. OPPONENT 2ND TOKEN ASSIST:
  // 32% chance of 6 when 1 pawn is out and 2+ in yard
  if (oppActivePawns.length === 1 && oppYardPawns.length >= 2 && canOppRollSix) {
    if (fairRandomInt(1, 100) <= 32) {
      return {
        diceValue: 6,
        nextBiasState: { ...nextBias, lastBiasReason: null },
      };
    }
  }

  // 3. NATURAL ROLL WITH NEAR-MISS DRAMA:
  const basePool = canOppRollSix ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
  let candidateRoll = basePool[fairRandomInt(0, basePool.length - 1)];

  const moves = getLegalMovesForPlayer(
    pawns,
    currentPlayerIndex,
    currentPlayer.color,
    candidateRoll
  );

  // A. CAPTURE CHECK ON RAHUL'S PAWNS:
  const killingMove = moves.find((m) =>
    m.willKillPawnIds.some((killedId) => {
      const victim = pawns.find((p) => p.id === killedId);
      return victim && victim.playerIndex === rahulPlayerIndex;
    })
  );

  if (killingMove) {
    const victimId = killingMove.willKillPawnIds[0];
    const victim = pawns.find((p) => p.id === victimId);

    // If Rahul's pawn is low-step (< 15), ALLOW THE KILL! (Great authentic battle feel)
    if (victim && victim.step < 15) {
      return {
        diceValue: candidateRoll,
        nextBiasState: { ...nextBias, lastBiasReason: null },
      };
    }

    // If Rahul's pawn is advanced (>= 15):
    const rahulScore = calculatePlayerBoardScore(pawns, rahulPlayerIndex);
    const oppScore = calculatePlayerBoardScore(pawns, currentPlayerIndex);

    // If Rahul is far ahead (score lead > 40), allow kill 35% of the time for thrilling comeback
    if (rahulScore - oppScore > 40 && fairRandomInt(1, 100) <= 35) {
      return {
        diceValue: candidateRoll,
        nextBiasState: { ...nextBias, lastBiasReason: null },
      };
    }

    // Near-Miss Redirection: Try to give a roll that misses by 1 (d + 1 or d - 1)
    const nearMissDeltas = [1, -1];
    let redirectedFace: number | null = null;

    for (const delta of nearMissDeltas) {
      const altFace = candidateRoll + delta;
      if (basePool.includes(altFace)) {
        const altMoves = getLegalMovesForPlayer(pawns, currentPlayerIndex, currentPlayer.color, altFace);
        const wouldStillKill = altMoves.some((m) =>
          m.willKillPawnIds.some((id) => {
            const v = pawns.find((p) => p.id === id);
            return v && v.playerIndex === rahulPlayerIndex && v.step >= 15;
          })
        );
        if (!wouldStillKill && altMoves.length > 0) {
          redirectedFace = altFace;
          break;
        }
      }
    }

    if (redirectedFace !== null) {
      candidateRoll = redirectedFace;
    } else {
      // Pick another non-killing face from basePool
      const safePool = basePool.filter((f) => {
        if (f === candidateRoll) return false;
        const altMoves = getLegalMovesForPlayer(pawns, currentPlayerIndex, currentPlayer.color, f);
        return !altMoves.some((m) =>
          m.willKillPawnIds.some((id) => {
            const v = pawns.find((p) => p.id === id);
            return v && v.playerIndex === rahulPlayerIndex && v.step >= 15;
          })
        );
      });
      if (safePool.length > 0) {
        candidateRoll = safePool[fairRandomInt(0, safePool.length - 1)];
      }
    }
  }

  // B. OPPONENT WIN DELAY (Photo-Finish Guarantee):
  // If opponent has 3 pawns home and this roll reaches home with the 4th pawn:
  const wouldWinMatch =
    oppHomePawns.length >= 3 && moves.some((m) => m.willReachHome);

  if (wouldWinMatch) {
    // Steer to a face that advances another pawn or stops at step 54/55 (near-miss)
    const nonWinningPool = basePool.filter((f) => {
      const altMoves = getLegalMovesForPlayer(pawns, currentPlayerIndex, currentPlayer.color, f);
      return !altMoves.some((m) => m.willReachHome);
    });
    if (nonWinningPool.length > 0) {
      candidateRoll = nonWinningPool[fairRandomInt(0, nonWinningPool.length - 1)];
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
