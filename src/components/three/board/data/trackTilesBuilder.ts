import {
  HOME_STRETCH_COORDS,
  MAIN_TRACK_COORDS,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
} from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';

/**
 * Pre-calculated track coordinate map for all 72 cells.
 */
export interface TrackTileData {
  key: string;
  x: number;
  z: number;
  row: number;
  col: number;
  type: 'standard' | 'start' | 'safe' | 'home-stretch' | 'entry-arrow';
  color?: PlayerColor;
  arrowDir?: number;
}

export function buildTrackTilesData(): TrackTileData[] {
  const tiles: TrackTileData[] = [];

  // 1. 52 Main Track Tiles
  MAIN_TRACK_COORDS.forEach((coord, idx) => {
    const x = coord.col - 7;
    const z = coord.row - 7;

    let type: TrackTileData['type'] = 'standard';
    let color: PlayerColor | undefined = undefined;

    if (idx === START_TRACK_INDEX.blue) {
      type = 'start';
      color = 'blue';
    } else if (idx === START_TRACK_INDEX.red) {
      type = 'start';
      color = 'red';
    } else if (idx === START_TRACK_INDEX.green) {
      type = 'start';
      color = 'green';
    } else if (idx === START_TRACK_INDEX.yellow) {
      type = 'start';
      color = 'yellow';
    } else if (SAFE_TRACK_INDICES.has(idx)) {
      type = 'safe';
    }

    tiles.push({
      key: `track-${idx}`,
      x,
      z,
      row: coord.row,
      col: coord.col,
      type,
      color,
    });
  });

  // 2. 20 Home Stretch Tiles (5 per color)
  const colors: PlayerColor[] = ['blue', 'red', 'green', 'yellow'];
  colors.forEach((c) => {
    HOME_STRETCH_COORDS[c].forEach((coord, sIdx) => {
      tiles.push({
        key: `home-stretch-${c}-${sIdx}`,
        x: coord.col - 7,
        z: coord.row - 7,
        row: coord.row,
        col: coord.col,
        type: 'home-stretch',
        color: c,
      });
    });
  });

  return tiles;
}

export const ALL_TRACK_TILES = buildTrackTilesData();

// Yard Center Coordinates in 3D world space (6x6 yards centered at +/- 4.5)
export const YARD_OFFSETS: Record<PlayerColor, { x: number; z: number }> = {
  blue: { x: -4.5, z: -4.5 },
  red: { x: 4.5, z: -4.5 },
  yellow: { x: -4.5, z: 4.5 },
  green: { x: 4.5, z: 4.5 },
};

export const YARD_PAD_OFFSETS: [number, number][] = [
  [-1.05, -1.05],
  [1.05, -1.05],
  [-1.05, 1.05],
  [1.05, 1.05],
];
