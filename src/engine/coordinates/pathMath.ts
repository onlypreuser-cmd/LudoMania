import { GridCoord, PlayerColor, WorldCoord3D } from '../../types/game';
import {
  HOME_GOAL_COORDS,
  HOME_STRETCH_COORDS,
  MAIN_TRACK_COORDS,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
  YARD_SLOT_COORDS,
} from './gridCoordinates';

/**
 * Converts a player's relative step (0..50) into the global 52-cell track index (0..51).
 * Returns null if the pawn is in Yard (-1), Home Stretch (51..55), or Home Goal (56).
 */
export function getGlobalTrackIndex(color: PlayerColor, step: number): number | null {
  if (step < 0 || step > 50) return null;
  return (START_TRACK_INDEX[color] + step) % 52;
}

/**
 * Checks if a relative step for a given color is on one of the 8 Safe Star squares.
 */
export function isSafeStep(color: PlayerColor, step: number): boolean {
  if (step < 0 || step >= 51) return true; // Yard and Home Stretch are always safe from capture
  const globalIdx = getGlobalTrackIndex(color, step);
  return globalIdx !== null && SAFE_TRACK_INDICES.has(globalIdx);
}

/**
 * Resolves exact 15x15 grid coordinates { row, col } for a pawn at any step (-1..56).
 */
export function getPawnGridCoord(color: PlayerColor, step: number, pawnIndex: number): GridCoord {
  if (step === -1) {
    return YARD_SLOT_COORDS[color][pawnIndex] ?? YARD_SLOT_COORDS[color][0];
  }
  if (step >= 0 && step <= 50) {
    const globalIdx = getGlobalTrackIndex(color, step)!;
    return MAIN_TRACK_COORDS[globalIdx];
  }
  if (step >= 51 && step <= 55) {
    return HOME_STRETCH_COORDS[color][step - 51];
  }
  return HOME_GOAL_COORDS[color][pawnIndex] ?? { row: 7, col: 7 };
}

/**
 * Converts a 15x15 GridCoord { row, col } into 3D world space coordinates
 * where the board spans [-7.5..+7.5] on X and Z axes (1 unit = 1 grid cell) and Y = 0 is board surface.
 * Includes a subtle +0.08 Z grounding anchor so the 3D figurine's upright body + base sit optically centered in every cell.
 */
export function gridToWorld3D(
  coord: GridCoord,
  stackIndex = 0,
  stackTotal = 1
): WorldCoord3D {
  let offsetX = 0;
  let offsetZ = 0;
  if (stackTotal > 1 && stackIndex < 4) {
    const angle = (stackIndex / stackTotal) * Math.PI * 2 + Math.PI / 4;
    const radius = 0.21;
    offsetX = Math.cos(angle) * radius;
    offsetZ = Math.sin(angle) * radius;
  }
  return {
    x: (coord.col - 7) + offsetX,
    y: 0,
    z: (coord.row - 7) + 0.08 + offsetZ,
  };
}

/**
 * Builds the array of step indices a pawn traverses when moving from `fromStep` to `toStep`.
 * Supports both forward motion and perimeter track wrap-around (e.g. from step 48..50 wrapping to 0..5).
 */
export function buildStepPath(fromStep: number, toStep: number): number[] {
  if (fromStep === -1 && toStep === 0) {
    return [0];
  }
  // Wrap-around track path (e.g., from step 48..50 to 0..5 for hunting opponents in Cut-to-Enter)
  if (fromStep >= 0 && toStep < fromStep) {
    const steps: number[] = [];
    for (let s = fromStep + 1; s <= 50; s++) {
      steps.push(s);
    }
    for (let s = 0; s <= toStep; s++) {
      steps.push(s);
    }
    return steps;
  }
  const steps: number[] = [];
  for (let s = fromStep + 1; s <= toStep; s++) {
    steps.push(s);
  }
  return steps;
}

/**
 * Builds the full Ludo King style reverse path when a pawn at `fromStep` (0..50)
 * is captured/cut and traverses backward square-by-square all the way to its Yard (-1).
 */
export function buildReverseStepPath(fromStep: number): number[] {
  const reverseSteps: number[] = [];
  for (let s = fromStep - 1; s >= 0; s--) {
    reverseSteps.push(s);
  }
  reverseSteps.push(-1); // Final hop back into the home Yard pad
  return reverseSteps;
}
