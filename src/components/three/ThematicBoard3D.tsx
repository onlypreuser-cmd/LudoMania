import React from 'react';
import { BoardThemeId } from '../../types/game';
import { ClassicKingdomBoard } from './board/themes/ClassicKingdomBoard';
import { MarblePalaceBoard } from './board/themes/MarblePalaceBoard';
import { MidnightNeonBoard } from './board/themes/MidnightNeonBoard';
import { RoyalTeakwoodBoard } from './board/themes/RoyalTeakwoodBoard';

export interface ThematicBoard3DProps {
  themeId: BoardThemeId;
}

/**
 * Modular 3D Thematic Ludo Board Dispatcher.
 * Delegates rendering to isolated, high-performance theme subcomponents.
 */
export const ThematicBoard3D: React.FC<ThematicBoard3DProps> = React.memo(({ themeId }) => {
  switch (themeId) {
    case 'royal-wood':
      return <RoyalTeakwoodBoard />;
    case 'marble-palace':
      return <MarblePalaceBoard />;
    case 'midnight-neon':
      return <MidnightNeonBoard />;
    case 'classic-kingdom':
    default:
      return <ClassicKingdomBoard />;
  }
});

ThematicBoard3D.displayName = 'ThematicBoard3D';

// Re-export shared board geometries and track data builders
export { ALL_TRACK_TILES, buildTrackTilesData } from './board/data/trackTilesBuilder';
export { BOARD_GEO } from './board/geometries/boardGeometries';
