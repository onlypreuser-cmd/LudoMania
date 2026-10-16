import React from 'react';
import { PlayerColor, TokenSkinId } from '../../types/game';
import { AutoRotateContainer } from './tokens/common/AutoRotateContainer';
import { PedestalBase } from './tokens/common/PedestalBase';
import { SelectableHaloRing } from './tokens/common/SelectableHaloRing';
import { RenderTokenSkin } from './tokens/TokenSkinRegistry';

export interface Token3DModelProps {
  skin: TokenSkinId;
  color: PlayerColor;
  isSelectable?: boolean;
  isSelected?: boolean;
  scale?: number;
  autoRotatePreview?: boolean;
}

const THEMED_SKINS_WITH_OWN_BASE = new Set([
  'astronomer',
  'astronaut',
  'pirate',
  'unicorn',
  'star-unicorn',
  'robot',
  'cyber-robot',
  'bamboo-panda',
  'panda',
  'ninja',
  'fire-dragon',
  'ice-dragon',
  'magician',
  'alien',
]);

/**
 * Modular Collectible 3D Token Model Orchestrator.
 * Decomposed into independent, component-based skin units with pre-allocated shared GPU geometries.
 */
export const Token3DModel: React.FC<Token3DModelProps> = React.memo(
  ({
    skin,
    color,
    isSelectable = false,
    isSelected = false,
    scale = 1,
    autoRotatePreview = false,
  }) => {
    const hasOwnThemedBase = THEMED_SKINS_WITH_OWN_BASE.has(skin);

    const modelContent = (
      <group scale={scale}>
        {/* Pulsing Selection Halo on Board Surface */}
        {(isSelectable || isSelected) && <SelectableHaloRing />}

        {/* Universal Color-Coded Collector Pedestal Base (rendered only for classic pawns without custom pedestals) */}
        {!hasOwnThemedBase && <PedestalBase color={color} isSelected={isSelected} />}

        {/* Modular Skin Component */}
        <RenderTokenSkin
          skin={skin}
          color={color}
          isSelected={isSelected}
          isSelectable={isSelectable}
        />
      </group>
    );

    if (autoRotatePreview) {
      return <AutoRotateContainer>{modelContent}</AutoRotateContainer>;
    }

    return modelContent;
  }
);

Token3DModel.displayName = 'Token3DModel';

// Export shared geometries, components, and skin registry for external inspection & reuse
export { SHARED_GEO } from './tokens/geometries/tokenGeometries';
export { TOKEN_SKIN_COMPONENTS } from './tokens/TokenSkinRegistry';
