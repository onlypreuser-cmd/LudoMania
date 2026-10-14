import {
  DiceBiasState,
  Pawn,
  PlayerConfig,
} from '../types/game';
import { isSafeStep } from './boardConfig';
import {
  getCaptureDistanceBetweenPawns,
  getLegalMovesForPlayer,
} from './dice/diceMovementRules';
import { fairRandomInt, isRahulName } from './dice/diceRNG';
import {
  calculatePlayerBoardScore,
  createInitialBiasState,
  evaluateFaceTacticalScore,
} from './dice/diceTactics';

export {
  calculatePlayerBoardScore,
  createInitialBiasState,
  evaluateFaceTacticalScore,
  fairRandomInt,
  getCaptureDistanceBetweenPawns,
  getLegalMovesForPlayer,
  isRahulName,
};

export interface SmartDiceResult {
  diceValue: number;
  nextBiasState: DiceBiasState;
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

  // CASE 1: No player is named "Rahul" -> Fair Random Dice with Opening Deployment Assist
  if (rahulPlayerIndex === -1) {
    const playerPawns = pawns.filter((p) => p.playerIndex === currentPlayerIndex);
    const yardPawns = playerPawns.filter((p) => p.step === -1);
    const activePawns = playerPawns.filter((p) => p.step >= 0 && p.step < 56);
    const canRollSix = consecutiveSixes < 2;

    // 1. First Token Opening Assist:
    // Boost chance of rolling 6 to 45% when all pawns are in yard so players don't suffer cold streaks
    if (activePawns.length === 0 && yardPawns.length > 0 && canRollSix) {
      if (fairRandomInt(1, 100) <= 45) {
        return {
          diceValue: 6,
          nextBiasState: {
            ...biasState,
            lastBiasReason: 'OPENING_ASSIST_SIX',
          },
        };
      }
    }

    // 2. Second Token Opening Assist:
    // Boost chance of rolling 6 to 32% when only 1 pawn is active and 2+ in yard for early tactical play
    if (activePawns.length === 1 && yardPawns.length >= 2 && canRollSix) {
      if (fairRandomInt(1, 100) <= 32) {
        return {
          diceValue: 6,
          nextBiasState: {
            ...biasState,
            lastBiasReason: 'SECOND_TOKEN_ASSIST_SIX',
          },
        };
      }
    }

    // Standard fair uniform roll (respecting 3-consecutive-sixes limit)
    const basePool = canRollSix ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 5];
    const diceValue = basePool[fairRandomInt(0, basePool.length - 1)];

    return {
      diceValue,
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
  const canOppRollSix = consecutiveSixes < 2;
  const oppPawns = pawns.filter((p) => p.playerIndex === currentPlayerIndex);
  const oppYardPawns = oppPawns.filter((p) => p.step === -1);
  const oppActivePawns = oppPawns.filter((p) => p.step >= 0 && p.step < 56);
  const oppHomePawns = oppPawns.filter((p) => p.step === 56);

  // 1. OPPONENT OPENING ASSIST:
  // Quick 45% chance of 6 on opening so opponent never feels stuck!
  if (oppActivePawns.length === 0 && oppYardPawns.length > 0 && canOppRollSix) {
    if (fairRandomInt(1, 100) <= 45) {
      return {
        diceValue: 6,
        nextBiasState: { ...nextBias, lastBiasReason: 'OPPONENT_OPENING_ASSIST_SIX' },
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
  const wouldWinMatch =
    oppHomePawns.length >= 3 && moves.some((m) => m.willReachHome);

  if (wouldWinMatch) {
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
