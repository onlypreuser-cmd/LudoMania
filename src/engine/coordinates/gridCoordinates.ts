import { GridCoord, PlayerColor } from '../../types/game';

/**
 * Standard 15x15 Ludo Board Topology matching the reference mockup:
 * - Top-Left Yard: BLUE (rows 0..5, cols 0..5)
 * - Top-Right Yard: RED (rows 0..5, cols 9..14)
 * - Bottom-Right Yard: GREEN (rows 9..14, cols 9..14)
 * - Bottom-Left Yard: YELLOW (rows 9..14, cols 0..5)
 *
 * 52-cell clockwise main track starting from Blue's start square at (row 6, col 1):
 */
export const MAIN_TRACK_COORDS: GridCoord[] = [
  // Left arm top row moving right (0..4): Blue starts at index 0 (row 6, col 1)
  { row: 6, col: 1 },
  { row: 6, col: 2 },
  { row: 6, col: 3 },
  { row: 6, col: 4 },
  { row: 6, col: 5 },
  // Top arm left column moving up (5..10)
  { row: 5, col: 6 },
  { row: 4, col: 6 },
  { row: 3, col: 6 },
  { row: 2, col: 6 }, // Index 8: Star Safe Square
  { row: 1, col: 6 },
  { row: 0, col: 6 },
  // Top arm middle turn (11..12)
  { row: 0, col: 7 },
  { row: 0, col: 8 },
  // Top arm right column moving down (13..17): Red starts at index 13 (row 1, col 8)
  { row: 1, col: 8 },
  { row: 2, col: 8 },
  { row: 3, col: 8 },
  { row: 4, col: 8 },
  { row: 5, col: 8 },
  // Right arm top row moving right (18..23)
  { row: 6, col: 9 },
  { row: 6, col: 10 },
  { row: 6, col: 11 },
  { row: 6, col: 12 }, // Index 21: Star Safe Square
  { row: 6, col: 13 },
  { row: 6, col: 14 },
  // Right arm middle turn (24..25)
  { row: 7, col: 14 },
  { row: 8, col: 14 },
  // Right arm bottom row moving left (26..30): Green starts at index 26 (row 8, col 13)
  { row: 8, col: 13 },
  { row: 8, col: 12 },
  { row: 8, col: 11 },
  { row: 8, col: 10 },
  { row: 8, col: 9 },
  // Bottom arm right column moving down (31..36)
  { row: 9, col: 8 },
  { row: 10, col: 8 },
  { row: 11, col: 8 },
  { row: 12, col: 8 }, // Index 34: Star Safe Square
  { row: 13, col: 8 },
  { row: 14, col: 8 },
  // Bottom arm middle turn (37..38)
  { row: 14, col: 7 },
  { row: 14, col: 6 },
  // Bottom arm left column moving up (39..43): Yellow starts at index 39 (row 13, col 6)
  { row: 13, col: 6 },
  { row: 12, col: 6 },
  { row: 11, col: 6 },
  { row: 10, col: 6 },
  { row: 9, col: 6 },
  // Left arm bottom row moving left (44..49)
  { row: 8, col: 5 },
  { row: 8, col: 4 },
  { row: 8, col: 3 },
  { row: 8, col: 2 }, // Index 47: Star Safe Square
  { row: 8, col: 1 },
  { row: 8, col: 0 },
  // Left arm middle turn (50..51)
  { row: 7, col: 0 },
  { row: 6, col: 0 },
];

export const START_TRACK_INDEX: Record<PlayerColor, number> = {
  blue: 0,
  red: 13,
  green: 26,
  yellow: 39,
};

/**
 * Global track indices (0..51) that are SAFE SQUARES (cannot be captured here).
 * Includes the 4 player start squares (0, 13, 26, 39) and the 4 star squares (8, 21, 34, 47).
 */
export const SAFE_TRACK_INDICES = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]);

/**
 * 5-step colored Home Stretch coordinates (steps 51..55) for each color
 */
export const HOME_STRETCH_COORDS: Record<PlayerColor, GridCoord[]> = {
  blue: [
    { row: 7, col: 1 },
    { row: 7, col: 2 },
    { row: 7, col: 3 },
    { row: 7, col: 4 },
    { row: 7, col: 5 },
  ],
  red: [
    { row: 1, col: 7 },
    { row: 2, col: 7 },
    { row: 3, col: 7 },
    { row: 4, col: 7 },
    { row: 5, col: 7 },
  ],
  green: [
    { row: 7, col: 13 },
    { row: 7, col: 12 },
    { row: 7, col: 11 },
    { row: 7, col: 10 },
    { row: 7, col: 9 },
  ],
  yellow: [
    { row: 13, col: 7 },
    { row: 12, col: 7 },
    { row: 11, col: 7 },
    { row: 10, col: 7 },
    { row: 9, col: 7 },
  ],
};

/**
 * Final Home Triangle resting slots (step 56) for each color's 4 pawns.
 * The 3x3 Center Home box spans grid coordinates [5.5 .. 8.5] with apex at (7.0, 7.0).
 * Slots are arranged in a neat crescent inside each color's wide outer triangle base.
 */
export const HOME_GOAL_COORDS: Record<PlayerColor, GridCoord[]> = {
  blue: [
    { row: 6.18, col: 5.88 },
    { row: 6.72, col: 6.04 },
    { row: 7.28, col: 6.04 },
    { row: 7.82, col: 5.88 },
  ],
  red: [
    { row: 5.88, col: 6.18 },
    { row: 6.04, col: 6.72 },
    { row: 6.04, col: 7.28 },
    { row: 5.88, col: 7.82 },
  ],
  green: [
    { row: 6.18, col: 8.12 },
    { row: 6.72, col: 7.96 },
    { row: 7.28, col: 7.96 },
    { row: 7.82, col: 8.12 },
  ],
  yellow: [
    { row: 8.12, col: 6.18 },
    { row: 7.96, col: 6.72 },
    { row: 7.96, col: 7.28 },
    { row: 8.12, col: 7.82 },
  ],
};

/**
 * Yard (Base) coordinates for the 4 locked pawns (step === -1) of each color.
 * Locked 1:1 to the 32.5% and 67.5% pad centers inside each 6x6 Yard box:
 * - Top/Left Yards (cells 0..5, span [-0.5 .. 5.5]): 1.45 and 3.55
 * - Bottom/Right Yards (cells 9..14, span [8.5 .. 14.5]): 10.45 and 12.55
 */
export const YARD_SLOT_COORDS: Record<PlayerColor, GridCoord[]> = {
  blue: [
    { row: 1.45, col: 1.45 },
    { row: 1.45, col: 3.55 },
    { row: 3.55, col: 1.45 },
    { row: 3.55, col: 3.55 },
  ],
  red: [
    { row: 1.45, col: 10.45 },
    { row: 1.45, col: 12.55 },
    { row: 3.55, col: 10.45 },
    { row: 3.55, col: 12.55 },
  ],
  green: [
    { row: 10.45, col: 10.45 },
    { row: 10.45, col: 12.55 },
    { row: 12.55, col: 10.45 },
    { row: 12.55, col: 12.55 },
  ],
  yellow: [
    { row: 10.45, col: 1.45 },
    { row: 10.45, col: 3.55 },
    { row: 12.55, col: 1.45 },
    { row: 12.55, col: 3.55 },
  ],
};

/**
 * Cross (Diagonal) Corner Pairing for 2-Player Ludo:
 * - Blue (Top-Left) <-> Green (Bottom-Right)
 * - Red (Top-Right) <-> Yellow (Bottom-Left)
 */
export const CROSS_OPPOSITE_COLOR: Record<PlayerColor, PlayerColor> = {
  blue: 'green',
  green: 'blue',
  red: 'yellow',
  yellow: 'red',
};
