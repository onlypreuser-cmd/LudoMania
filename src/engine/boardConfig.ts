// Re-export all grid coordinate topologies and safe square constants
export {
  CROSS_OPPOSITE_COLOR,
  HOME_GOAL_COORDS,
  HOME_STRETCH_COORDS,
  MAIN_TRACK_COORDS,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
  YARD_SLOT_COORDS,
} from './coordinates/gridCoordinates';

// Re-export all path calculation and 3D coordinate mapping functions
export {
  buildReverseStepPath,
  buildStepPath,
  getGlobalTrackIndex,
  getPawnGridCoord,
  gridToWorld3D,
  isSafeStep,
} from './coordinates/pathMath';

// Re-export color palettes
export { COLOR_PALETTE } from './theme/colorPalette';

// Re-export cosmetic and visual catalogs
export { AVATAR_OPTIONS } from './catalogs/avatarCatalog';
export { BOARD_THEMES } from './catalogs/boardThemeCatalog';
export { DICE_SKINS } from './catalogs/diceSkinCatalog';
export { TOKEN_SKINS } from './catalogs/tokenSkinCatalog';
