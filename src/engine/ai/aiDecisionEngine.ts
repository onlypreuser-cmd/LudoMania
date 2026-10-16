import {
  AiDifficulty,
  MoveEvaluation,
  Pawn,
  PlayerColor,
} from '../../types/game';
import { getGlobalTrackIndex, isSafeStep } from '../boardConfig';
import { fairRandomInt } from '../dice/diceRNG';

export interface AiEvaluationResult {
  bestMove: MoveEvaluation;
  scores: Array<{ pawnId: string; score: number }>;
}

/**
 * Evaluates the tactical strength of each candidate move for an AI player,
 * taking into account home completion, opponent captures, safe stars,
 * threat escapes, suicide blunder penalties, and yard breakout balance.
 */
export function evaluateBestAiMove(
  legalMoves: MoveEvaluation[],
  pawns: Pawn[],
  playerIndex: number,
  playerColor: PlayerColor,
  difficulty: AiDifficulty = 'hard'
): MoveEvaluation {
  if (legalMoves.length === 0) {
    throw new Error('evaluateBestAiMove called with zero legal moves');
  }
  if (legalMoves.length === 1) {
    return legalMoves[0];
  }

  const playerPawns = pawns.filter((p) => p.playerIndex === playerIndex);
  const activePawnsCount = playerPawns.filter((p) => p.step >= 0 && p.step < 56).length;
  const opponentPawns = pawns.filter((p) => p.playerIndex !== playerIndex && p.step >= 0);

  const scoredMoves: Array<{ move: MoveEvaluation; score: number }> = legalMoves.map((move) => {
    let score = 20;

    // Advance bonus (favors advancing forward)
    const stepAdvance =
      move.fromStep >= 0 && move.toStep < move.fromStep
        ? move.toStep - move.fromStep + 51
        : move.toStep - move.fromStep;
    score += stepAdvance * 2;

    // 1. Reaching Home Goal (Ultimate Priority)
    if (move.willReachHome) {
      score += 500;
    }

    // 2. Capturing an Opponent Pawn
    if (move.willKillPawnIds.length > 0) {
      score += 350;
      // Bonus if target opponent pawn is deep in track (step > 40)
      for (const killedId of move.willKillPawnIds) {
        const victim = pawns.find((p) => p.id === killedId);
        if (victim && victim.step > 40) {
          score += 150; // Critical denial!
        }
      }
    }

    // 3. Landing on a Safe Star (Refuge fortress)
    if (move.landsOnSafeStar) {
      score += 180;
    }

    // 4. Entering Home Stretch (Safe colored lane)
    if (move.toStep >= 51 && move.fromStep < 51) {
      score += 150;
    }

    // 5. Deploying from Yard
    if (move.fromStep === -1) {
      if (activePawnsCount === 0) {
        score += 220; // Must deploy at least one soldier
      } else if (activePawnsCount === 1) {
        score += 110; // Tactical 2nd soldier
      } else {
        score += 45; // 3rd/4th soldier
      }
    }

    // 6. Threat assessment on landing tile (only for main track 0..50, non-safe)
    if (move.toStep <= 50 && !move.landsOnSafeStar) {
      const landingGlobal = getGlobalTrackIndex(playerColor, move.toStep);
      if (landingGlobal !== null) {
        let directlyTargeted = false;
        for (const opp of opponentPawns) {
          if (opp.step >= 0 && opp.step <= 50) {
            const oppGlobal = getGlobalTrackIndex(opp.color, opp.step);
            if (oppGlobal !== null) {
              const chaserDist = (landingGlobal - oppGlobal + 52) % 52;
              if (chaserDist >= 1 && chaserDist <= 6) {
                directlyTargeted = true;
                break;
              }
            }
          }
        }

        if (directlyTargeted) {
          score -= 220; // Blunder penalty: walking straight into enemy fire!
        } else {
          score += 40; // Safe advance
        }
      }
    }

    // 7. Escape an existing immediate threat
    if (
      move.fromStep >= 0 &&
      move.fromStep <= 50 &&
      !isSafeStep(playerColor, move.fromStep)
    ) {
      const fromGlobal = getGlobalTrackIndex(playerColor, move.fromStep);
      if (fromGlobal !== null) {
        let currentlyThreatened = false;
        for (const opp of opponentPawns) {
          if (opp.step >= 0 && opp.step <= 50) {
            const oppGlobal = getGlobalTrackIndex(opp.color, opp.step);
            if (oppGlobal !== null) {
              const currentThreatDist = (fromGlobal - oppGlobal + 52) % 52;
              if (currentThreatDist >= 1 && currentThreatDist <= 6) {
                currentlyThreatened = true;
                break;
              }
            }
          }
        }
        if (currentlyThreatened) {
          score += 140; // Successfully fled from danger!
        }
      }
    }

    // Apply difficulty variance
    if (difficulty === 'easy') {
      // High randomness/blunders for easy bot
      score += fairRandomInt(-120, 120);
    } else if (difficulty === 'medium') {
      // Slight variance
      score += fairRandomInt(-30, 30);
    }
    // 'hard' bot uses 100% pure optimal heuristic

    return { move, score };
  });

  // Sort descending by score
  scoredMoves.sort((a, b) => b.score - a.score);

  return scoredMoves[0].move;
}
