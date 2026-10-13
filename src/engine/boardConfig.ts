import {
  AvatarOption,
  BoardThemeOption,
  DiceSkinOption,
  GridCoord,
  Pawn,
  PlayerColor,
  TokenSkinOption,
  WorldCoord3D,
} from '../types/game';

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

/**
 * Builds the array of step indices a pawn traverses when moving from `fromStep` to `toStep`.
 */
export function buildStepPath(fromStep: number, toStep: number): number[] {
  if (fromStep === -1 && toStep === 0) {
    return [0];
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

/**
 * Color palette metadata for the 4 Ludo colors
 */
export const COLOR_PALETTE: Record<
  PlayerColor,
  {
    label: string;
    primary: string;
    secondary: string;
    light: string;
    threeHex: string;
    emissiveHex: string;
    ringClass: string;
    bgClass: string;
    badgeText: string;
  }
> = {
  blue: {
    label: 'Royal Blue',
    primary: '#1d7dfa',
    secondary: '#0d47a1',
    light: '#dbeafe',
    threeHex: '#1e88e5',
    emissiveHex: '#0d47a1',
    ringClass: 'ring-blue-500',
    bgClass: 'bg-blue-500',
    badgeText: 'text-blue-600',
  },
  red: {
    label: 'Crimson Red',
    primary: '#ef233c',
    secondary: '#9b0000',
    light: '#ffe4e6',
    threeHex: '#e53935',
    emissiveHex: '#8e0000',
    ringClass: 'ring-rose-500',
    bgClass: 'bg-rose-500',
    badgeText: 'text-rose-600',
  },
  green: {
    label: 'Emerald Green',
    primary: '#16a34a',
    secondary: '#065f46',
    light: '#dcfce7',
    threeHex: '#2ebd59',
    emissiveHex: '#0b6b29',
    ringClass: 'ring-emerald-500',
    bgClass: 'bg-emerald-500',
    badgeText: 'text-emerald-600',
  },
  yellow: {
    label: 'Sunny Gold',
    primary: '#f59e0b',
    secondary: '#b45309',
    light: '#fef3c7',
    threeHex: '#ffb300',
    emissiveHex: '#a36200',
    ringClass: 'ring-amber-400',
    bgClass: 'bg-amber-400',
    badgeText: 'text-amber-600',
  },
};

/**
 * Cropped PNG Avatars from the user-provided 6-avatar sheet
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'avatar-1',
    name: 'Leo',
    src: '/assets/avatars/avatar-1.png',
    accent: 'from-blue-400 to-blue-600',
  },
  {
    id: 'avatar-2',
    name: 'Mia',
    src: '/assets/avatars/avatar-2.png',
    accent: 'from-pink-400 to-rose-500',
  },
  {
    id: 'avatar-3',
    name: 'Kai',
    src: '/assets/avatars/avatar-3.png',
    accent: 'from-purple-500 to-indigo-600',
  },
  {
    id: 'avatar-4',
    name: 'Shiba',
    src: '/assets/avatars/avatar-4.png',
    accent: 'from-amber-400 to-orange-500',
  },
  {
    id: 'avatar-5',
    name: 'Mochi',
    src: '/assets/avatars/avatar-5.png',
    accent: 'from-pink-300 to-pink-500',
  },
  {
    id: 'avatar-6',
    name: 'Nova Bot',
    src: '/assets/avatars/avatar-6.png',
    accent: 'from-cyan-400 to-sky-600',
  },
];

/**
 * 8 3D Token Skins matching the Customize mockup & each having a unique GSAP 3D move animation
 */
export const TOKEN_SKINS: TokenSkinOption[] = [
  {
    id: 'classic',
    name: 'Classic',
    subtitle: 'Royal Glossy Pawn',
    moveStyleName: 'Parabolic Arc Hop',
    price: 0,
    unlockedByDefault: true,
  },
  {
    id: 'knight',
    name: 'Knight',
    subtitle: 'Grandmaster Steed',
    moveStyleName: 'Heroic Cavalier Vault',
    price: 0,
    unlockedByDefault: true,
  },
  {
    id: 'dog',
    name: 'Dog',
    subtitle: 'Lucky Shiba Inu',
    moveStyleName: 'Excited Puppy Pounce',
    price: 0,
    unlockedByDefault: true,
  },
  {
    id: 'cat',
    name: 'Cat',
    subtitle: 'Snowbell Kitty',
    moveStyleName: '360° Feline Pirouette',
    price: 0,
    unlockedByDefault: true,
  },
  {
    id: 'panda',
    name: 'Panda',
    subtitle: 'Bamboo Master',
    moveStyleName: 'Roly-Poly Somersault',
    price: 1500,
    unlockedByDefault: false,
  },
  {
    id: 'robot',
    name: 'Robot',
    subtitle: 'Cyber Mecha Unit',
    moveStyleName: 'Jet-Thruster Hover Glide',
    price: 2000,
    unlockedByDefault: false,
  },
  {
    id: 'astronaut',
    name: 'Astronaut',
    subtitle: 'Starfarer Voyager',
    moveStyleName: 'Zero-G Moonwalk Float',
    price: 2500,
    unlockedByDefault: false,
  },
  {
    id: 'unicorn',
    name: 'Unicorn',
    subtitle: 'Celestial Myth',
    moveStyleName: 'Rainbow Spiral Prance',
    price: 3000,
    unlockedByDefault: false,
  },
  {
    id: 'bamboo-panda',
    name: 'Bamboo Panda',
    subtitle: 'Emerald Leaf Guardian',
    moveStyleName: 'Bamboo Roll & Belly Bounce',
    price: 1600,
    unlockedByDefault: true,
  },
  {
    id: 'cyber-robot',
    name: 'Cyber Bot',
    subtitle: 'Neon Core Android',
    moveStyleName: 'Plasma Thruster Hover-Dash',
    price: 2100,
    unlockedByDefault: true,
  },
  {
    id: 'astronomer',
    name: 'Astronomer',
    subtitle: 'Cosmic Star Explorer',
    moveStyleName: 'Orbital Zero-G Lunar Bound',
    price: 2600,
    unlockedByDefault: true,
  },
  {
    id: 'star-unicorn',
    name: 'Star Unicorn',
    subtitle: 'Royal Starlight Steed',
    moveStyleName: 'Celestial Starlight Prance',
    price: 3100,
    unlockedByDefault: true,
  },
  {
    id: 'fire-dragon',
    name: 'Fire Dragon',
    subtitle: 'Inferno Flame Drake',
    moveStyleName: 'Inferno Wing-Flap Swoop',
    price: 3400,
    unlockedByDefault: true,
  },
  {
    id: 'ice-dragon',
    name: 'Ice Dragon',
    subtitle: 'Glacial Frost Wyrm',
    moveStyleName: 'Glacier Frost-Wing Glide',
    price: 3500,
    unlockedByDefault: true,
  },
  {
    id: 'pirate',
    name: 'Captain Pirate',
    subtitle: 'Golden Cutlass Skull',
    moveStyleName: 'Swashbuckler Cannon Vault',
    price: 3200,
    unlockedByDefault: true,
  },
  {
    id: 'magician',
    name: 'Arcane Magician',
    subtitle: 'Grand Starlight Wizard',
    moveStyleName: 'Arcane Staff Levitation',
    price: 3800,
    unlockedByDefault: true,
  },
  {
    id: 'alien',
    name: 'Cosmic Alien',
    subtitle: 'Galactic UFO Voyager',
    moveStyleName: 'UFO Tractor-Beam Zip',
    price: 3600,
    unlockedByDefault: true,
  },
];

/**
 * 6 3D Physics Dice Skins
 */
export const DICE_SKINS: DiceSkinOption[] = [
  {
    id: 'classic-white',
    name: 'Pearl Ivory',
    bodyColor: '#ffffff',
    pipColor: '#1e293b',
    edgeGlow: '#fbbf24',
    metalness: 0.1,
    roughness: 0.15,
    price: 0,
    unlockedByDefault: true,
  },
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    bodyColor: '#f59e0b',
    pipColor: '#451a03',
    edgeGlow: '#fef08a',
    metalness: 0.65,
    roughness: 0.18,
    price: 0,
    unlockedByDefault: true,
  },
  {
    id: 'ruby-blaze',
    name: 'Ruby Blaze',
    bodyColor: '#e11d48',
    pipColor: '#ffffff',
    edgeGlow: '#fda4af',
    metalness: 0.35,
    roughness: 0.15,
    price: 0,
    unlockedByDefault: true,
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    bodyColor: '#1e1b4b',
    pipColor: '#22d3ee',
    edgeGlow: '#38bdf8',
    metalness: 0.5,
    roughness: 0.12,
    price: 1200,
    unlockedByDefault: false,
  },
  {
    id: 'emerald-jade',
    name: 'Imperial Jade',
    bodyColor: '#059669',
    pipColor: '#ecfdf5',
    edgeGlow: '#6ee7b7',
    metalness: 0.3,
    roughness: 0.14,
    price: 1500,
    unlockedByDefault: false,
  },
  {
    id: 'obsidian-galaxy',
    name: 'Obsidian Void',
    bodyColor: '#0f172a',
    pipColor: '#f472b6',
    edgeGlow: '#c084fc',
    metalness: 0.6,
    roughness: 0.1,
    price: 2200,
    unlockedByDefault: false,
  },
];

/**
 * 4 Board Themes
 */
export const BOARD_THEMES: BoardThemeOption[] = [
  {
    id: 'classic-kingdom',
    name: 'Classic Kingdom',
    description: 'Bright glossy tournament board with warm oak table backdrop',
    price: 0,
    unlockedByDefault: true,
    bgGradient: 'from-amber-100 via-orange-50 to-amber-200',
    cellBg: '#ffffff',
    borderAccent: '#e2e8f0',
  },
  {
    id: 'royal-wood',
    name: 'Royal Teakwood',
    description: 'Hand-carved heritage wood finish with warm gold inlays',
    price: 0,
    unlockedByDefault: true,
    bgGradient: 'from-amber-800 via-amber-700 to-yellow-900',
    cellBg: '#fffbeb',
    borderAccent: '#d97706',
  },
  {
    id: 'marble-palace',
    name: 'Marble Palace',
    description: 'Italian white Carrara marble with rose-gold trim',
    price: 1800,
    unlockedByDefault: false,
    bgGradient: 'from-slate-200 via-indigo-50 to-rose-100',
    cellBg: '#f8fafc',
    borderAccent: '#cbd5e1',
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Cyber',
    description: 'Futuristic dark arena with luminous neon grid lines',
    price: 2500,
    unlockedByDefault: false,
    bgGradient: 'from-slate-950 via-indigo-950 to-slate-900',
    cellBg: '#1e293b',
    borderAccent: '#475569',
  },
];
