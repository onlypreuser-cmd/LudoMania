import React from 'react';
import { SkinComponentProps } from '../types';
import { DragonCollectibleMesh } from '../dragon/DragonCollectibleMesh';

/**
 * Glacial Frost Wyrm - Legendary Dragon Token Skin (Sapphire Ice Variant).
 * Uses the exact same authentic 3D dragon anatomy as the reference image:
 * - Round Showcase Plinth in Royal Sapphire Blue with gold rims & ice-frost crest
 * - Deep royal blue lacquer body with frosty cyan-white scute belly plates
 * - Front paws with 3 gold claw toes + tucked hind haunches
 * - Curled tail with frost flame spade fin
 * - Crystalline gold dorsal spines running from nape to tail
 * - Majestic spread bat wings with gold thumb claw
 * - Heroic chibi head with boxy snout, angled fierce brow ridges & 3-tiered cheek fins
 * - Swept-back curved spiral gold horns + central diamond forehead horn
 * - 3-layer crystalline sapphire dragon eyes with dual catchlights
 * - 100% solid satin-matte vinyl PBR (0% transmission, NO see-through glass).
 */
export const IceDragonSkin: React.FC<SkinComponentProps> = React.memo(({ color }) => {
  return <DragonCollectibleMesh color={color} variant="ice" />;
});

IceDragonSkin.displayName = 'IceDragonSkin';
