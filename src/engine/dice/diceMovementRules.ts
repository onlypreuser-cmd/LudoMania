import {
  BoardThemeId,
  CapturedPawnInfo,
  MoveEvaluation,
  Pawn,
  PlayerColor,
} from '../../types/game';
import {
  buildStepPath,
  getGlobalTrackIndex,
  isSafeStep,
  SAFE_TRACK_INDICES,
} from '../boardConfig';

function otherStepOr(step: number): number {
  return step;
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
