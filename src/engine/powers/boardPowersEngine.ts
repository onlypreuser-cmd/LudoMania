import {
  BoardPowersState,
  BoardThemeId,
  CyberStasis,
  MarbleWall,
  Pawn,
  PlayerColor,
  RoyalGuardState,
} from '../../types/game';

/**
 * Creates the default initial state for Tactical Board Powers.
 */
export function createInitialBoardPowers(): BoardPowersState {
  return {
    walls: [],
    guard: {
      blue: { active: false, ownerColor: 'blue', targetPawnId: null, hitsRemaining: 2 },
      red: { active: false, ownerColor: 'red', targetPawnId: null, hitsRemaining: 2 },
      green: { active: false, ownerColor: 'green', targetPawnId: null, hitsRemaining: 2 },
      yellow: { active: false, ownerColor: 'yellow', targetPawnId: null, hitsRemaining: 2 },
    },
    stasis: [],
    lastNearHomeStasisTimestamp: {
      blue: 0,
      red: 0,
      green: 0,
      yellow: 0,
    },
  };
}

/**
 * Checks whether a specific pawn is encased in an active Cyber Stasis.
 */
export function isPawnInStasis(
  pawnId: string,
  stasisList: CyberStasis[],
  currentTime: number = Date.now()
): boolean {
  return stasisList.some(
    (s) => s.targetPawnId === pawnId && currentTime - s.appliedAt < s.durationMs
  );
}

/**
 * Returns remaining milliseconds of stasis for a pawn (0 if not frozen or expired).
 */
export function getStasisRemainingMs(
  pawnId: string,
  stasisList: CyberStasis[],
  currentTime: number = Date.now()
): number {
  const item = stasisList.find((s) => s.targetPawnId === pawnId);
  if (!item) return 0;
  const elapsed = currentTime - item.appliedAt;
  return Math.max(0, item.durationMs - elapsed);
}

/**
 * Purges expired stasis effects.
 */
export function cleanExpiredStasis(
  stasisList: CyberStasis[],
  currentTime: number = Date.now()
): CyberStasis[] {
  return stasisList.filter((s) => currentTime - s.appliedAt < s.durationMs);
}

/**
 * Checks if a pawn is actively protected by an unbroken Royal Guard.
 */
export function hasActiveRoyalGuard(
  guardRecord: Record<PlayerColor, RoyalGuardState> | undefined,
  pawn: Pawn
): boolean {
  if (!guardRecord) return false;
  const guard = guardRecord[pawn.color];
  return Boolean(
    guard &&
      guard.active &&
      guard.targetPawnId === pawn.id &&
      guard.hitsRemaining > 0
  );
}

/**
 * Finds an opponent's wall on the specified 52-cell perimeter track index.
 */
export function getOpponentWallAtTrackIndex(
  walls: MarbleWall[] | undefined,
  tileIndex: number,
  moverColor: PlayerColor
): MarbleWall | undefined {
  if (!walls) return undefined;
  return walls.find(
    (w) => w.ownerColor !== moverColor && w.tileIndex === tileIndex && w.hp > 0
  );
}

/**
 * Marble Palace Condition:
 * Consecutive sixes >= 2 allows the player to place a Roman Marble Wall.
 */
export function canPlayerPlaceMarbleWall(
  boardTheme: BoardThemeId,
  consecutiveSixes: number
): boolean {
  return boardTheme === 'marble-palace' && consecutiveSixes >= 2;
}

/**
 * Royal Teakwood Condition:
 * Player has exactly 1 token on track (step 0..55) and 3 in yard (step -1),
 * and does NOT already have an active Royal Guard.
 */
export function canPlayerDeployRoyalGuard(
  boardTheme: BoardThemeId,
  playerPawns: Pawn[],
  guardState?: RoyalGuardState
): boolean {
  if (boardTheme !== 'royal-wood') return false;
  if (guardState?.active) return false;

  const onTrackCount = playerPawns.filter(
    (p) => p.step >= 0 && p.step < 56
  ).length;
  const yardCount = playerPawns.filter((p) => p.step === -1).length;

  return onTrackCount === 1 && yardCount === 3;
}

/**
 * Midnight Neon Condition:
 * Consecutive sixes >= 2 OR (current player has >= 2 tokens with step >= 44 [<= 12 to home]
 * AND cooldown of 60s has passed since last near-home stasis launch).
 */
export function canPlayerLaunchCyberAsteroid(
  boardTheme: BoardThemeId,
  playerPawns: Pawn[],
  consecutiveSixes: number,
  lastNearHomeTimestamp: number,
  currentTime: number = Date.now()
): boolean {
  if (boardTheme !== 'midnight-neon') return false;

  if (consecutiveSixes >= 2) {
    return true;
  }

  const nearHomeCount = playerPawns.filter(
    (p) => p.step >= 44 && p.step < 56
  ).length;
  const cooldownPassed = currentTime - (lastNearHomeTimestamp || 0) >= 60000;

  return nearHomeCount >= 2 && cooldownPassed;
}
