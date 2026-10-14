import { DiceBiasState, Pawn, PlayerColor } from '../../types/game';
import { getGlobalTrackIndex, isSafeStep } from '../boardConfig';
import { getLegalMovesForPlayer } from './diceMovementRules';
import { fairRandomInt } from './diceRNG';

export function createInitialBiasState(): DiceBiasState {
  return {
    rahulRollCount: 0,
    queuedComboRolls: [],
    chaseWindowCounter: 0,
    chaseWindowTarget: fairRandomInt(2, 4),
    lastBiasReason: null,
  };
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
    const stepAdvance =
      move.fromStep >= 0 && move.toStep < move.fromStep
        ? move.toStep - move.fromStep + 51
        : move.toStep - move.fromStep;
    let score = 20 + stepAdvance;

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
