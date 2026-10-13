export type PlayerColor = 'blue' | 'red' | 'green' | 'yellow';

export type TokenSkinId =
  | 'classic'
  | 'knight'
  | 'dog'
  | 'cat'
  | 'panda'
  | 'robot'
  | 'astronaut'
  | 'unicorn'
  | 'bamboo-panda'
  | 'cyber-robot'
  | 'astronomer'
  | 'star-unicorn'
  | 'fire-dragon'
  | 'ice-dragon'
  | 'pirate'
  | 'magician'
  | 'alien';

export type DiceSkinId =
  | 'classic-white'
  | 'royal-gold'
  | 'ruby-blaze'
  | 'cyber-neon'
  | 'emerald-jade'
  | 'obsidian-galaxy';

export type BoardThemeId =
  | 'classic-kingdom'
  | 'royal-wood'
  | 'marble-palace'
  | 'midnight-neon';

export type AvatarId =
  | 'avatar-1'
  | 'avatar-2'
  | 'avatar-3'
  | 'avatar-4'
  | 'avatar-5'
  | 'avatar-6';

export interface AvatarOption {
  id: AvatarId;
  name: string;
  src: string;
  accent: string;
}

export interface TokenSkinOption {
  id: TokenSkinId;
  name: string;
  subtitle: string;
  moveStyleName: string;
  price: number;
  unlockedByDefault: boolean;
}

export type DiceShapeType =
  | 'pillowed-cube'
  | 'chamfered-bullion'
  | 'cushion-gem'
  | 'sci-fi-datacube'
  | 'worn-seal'
  | 'monolith-glass';

export type DicePipShape =
  | 'classic-circle'
  | 'star-pyramid'
  | 'crystal-diamond'
  | 'digital-square'
  | 'lotus-spiral'
  | 'constellation-rune';

export type DicePodTheme =
  | 'alabaster-brass'
  | 'scarlet-velvet-gold'
  | 'rosegold-jeweler'
  | 'cyber-hex-dock'
  | 'celadon-lotus'
  | 'meteorite-suspension';

export interface DiceSkinOption {
  id: DiceSkinId;
  name: string;
  bodyColor: string;
  pipColor: string;
  edgeGlow: string;
  metalness: number;
  roughness: number;
  price: number;
  unlockedByDefault: boolean;
  shapeType: DiceShapeType;
  pipShape: DicePipShape;
  transmission: number;
  thickness: number;
  podTheme: DicePodTheme;
  soundId: string;
}

export interface BoardPerk {
  perkName: string;
  badge: string;
  description: string;
  captureBountyBonus: number;
  safeStarFortitudeBonus: number;
  homeStretchSurgeBonus: number;
  cleanMatchBounty: number;
}

export interface BoardLightingRig {
  ambientIntensity: number;
  ambientColor: string;
  keyIntensity: number;
  keyColor: string;
  rimIntensity: number;
  rimColor: string;
  secondaryRimColor?: string;
  secondaryRimIntensity?: number;
  exposure: number;
}

export interface BoardStyleTokens {
  outerContainerBg: string;
  outerBorderClass: string;
  trackBg: string;
  trackBorderClass: string;
  cellDefaultBg: string;
  cellBorderClass: string;
  yardBorderClass: string;
  yardInnerBg: string;
  safeStarFill: string;
  safeStarText: string;
  homeDividerColor: string;
  homeCenterSvgBg: string;
}

export interface BoardThemeOption {
  id: BoardThemeId;
  name: string;
  description: string;
  price: number;
  unlockedByDefault: boolean;
  bgGradient: string;
  cellBg: string;
  borderAccent: string;
  perk: BoardPerk;
  lighting: BoardLightingRig;
  styleTokens: BoardStyleTokens;
}

/**
 * Pawn step progress:
 * -1 = Inside Yard / Base (locked until 6 is rolled)
 * 0..50 = On main 52-cell perimeter track (relative to player's start index)
 * 51..55 = Inside player's colored Home Stretch column (5 cells)
 * 56 = Reached center Home Triangle (completed!)
 */
export interface Pawn {
  id: string; // e.g., "blue-0", "blue-1", "blue-2", "blue-3"
  playerIndex: number;
  color: PlayerColor;
  pawnIndex: number;
  step: number; // -1..56
}

export interface PlayerConfig {
  id: string;
  name: string;
  avatarId: AvatarId;
  color: PlayerColor;
  tokenSkin: TokenSkinId;
  diceSkin: DiceSkinId;
}

export interface GridCoord {
  row: number; // 0..14
  col: number; // 0..14
}

export interface WorldCoord3D {
  x: number;
  y: number;
  z: number;
}

export interface DiceBiasState {
  rahulRollCount: number;
  queuedComboRolls: number[];
  chaseWindowCounter: number;
  chaseWindowTarget: number;
  lastBiasReason: string | null;
}

export interface CapturedPawnInfo {
  pawnId: string;
  color: PlayerColor;
  pawnIndex: number;
  fromStep: number;
}

export interface TurnSnapshot {
  pawns: Pawn[];
  currentPlayerIndex: number;
  consecutiveSixes: number;
  diceValue: number | null;
  biasState: DiceBiasState;
  captureBonusPoints: number[];
  moveDescription: string;
}

export interface MoveEvaluation {
  pawnId: string;
  fromStep: number;
  toStep: number;
  pathSteps: number[]; // Step-by-step indices for GSAP hop animation
  willKillPawnIds: string[];
  capturedPawnsInfo: CapturedPawnInfo[];
  willReachHome: boolean;
  landsOnSafeStar: boolean;
}

export interface SavedGameSession {
  id: string;
  players: PlayerConfig[];
  pawns: Pawn[];
  boardTheme: BoardThemeId;
  currentPlayerIndex: number;
  diceValue: number | null;
  playerLastDiceValues: number[];
  consecutiveSixes: number;
  captureBonusPoints: number[];
  turnNumber: number;
  statusMessage: string;
  timestamp: number;
}

