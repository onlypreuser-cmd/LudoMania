import React from 'react';
import { SkinComponentProps } from '../types';
import { DragonCollectibleMesh } from '../dragon/DragonCollectibleMesh';

/**
 * Volcanic Magma Drake - Legendary Dragon Token Skin.
 * Fully sculpted authentic dragon matching the 10-view Amiibo/Supercell reference:
 * - Round Showcase Plinth with 24K gold rims & 3D flame medallion
 * - Chubby seated baby drake with layered cream scute belly plates
 * - Front paws with 3 gold claw toes + tucked hind legs
 * - Curled tail with gold flame spade fin
 * - 24K gold dorsal spines running from nape to tail
 * - Majestic spread bat wings with gold thumb claw
 * - Heroic chibi head with boxy snout, angled fierce brow ridges & 3-tiered cheek fins
 * - Swept-back curved spiral gold horns + central diamond forehead horn
 * - 3-layer pixie dragon eyes with dual catchlights
 * - 100% solid satin-matte vinyl PBR (0% transmission).
 */
export const FireDragonSkin: React.FC<SkinComponentProps> = React.memo(({ color }) => {
  return <DragonCollectibleMesh color={color} variant="fire" />;
});

FireDragonSkin.displayName = 'FireDragonSkin';
