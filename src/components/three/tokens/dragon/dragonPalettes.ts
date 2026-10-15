import { PlayerColor } from '../../../../types/game';

export interface DragonPalette {
  bodyPrimary: string;
  bodyDark: string;
  bodyHighlight: string;
  bellyPlate: string;
  bellyShadow: string;
  hornGold: string;
  hornHighlight: string;
  clawColor: string;
  irisColor: string;
  plinthBody: string;
  plinthGold: string;
  flameEmblem: string;
}

/**
 * Standard Dragon Palettes matching the 10-view reference image:
 * - Fire variant: Rich crimson red lacquer, 24K gold horns & spines, cream scute plates, warm amber-hazel eyes.
 * - Ice variant: Deep royal sapphire blue lacquer, golden/cyan horns, frosty cyan-white scutes, sapphire blue eyes.
 */
export const DRAGON_VARIANTS: Record<'fire' | 'ice', DragonPalette> = {
  fire: {
    bodyPrimary: '#d32f2f',       // Vibrant Crimson Red
    bodyDark: '#991b1b',          // Rich Shaded Crimson
    bodyHighlight: '#ef4444',     // Warm Crimson Highlight
    bellyPlate: '#fef3c7',        // Warm Cream Scute Plates
    bellyShadow: '#fde68a',       // Soft Amber Plate Shadow
    hornGold: '#fbbf24',          // 24K Radiant Gold Horns & Spines
    hornHighlight: '#fde047',     // Bright Specular Gold Glint
    clawColor: '#fde047',         // Polished Gold Claws
    irisColor: '#b45309',         // Warm Amber/Hazel Pixie Eyes
    plinthBody: '#b91c1c',        // Crimson Red Lacquer Plinth Base
    plinthGold: '#fbbf24',        // Metallic Gold Bevel Rims
    flameEmblem: '#f59e0b',       // Golden 3D Flame Medallion
  },
  ice: {
    bodyPrimary: '#1d4ed8',       // Deep Royal Sapphire Blue
    bodyDark: '#1e3a8a',          // Shaded Cobalt Blue
    bodyHighlight: '#3b82f6',     // Vibrant Azure Blue
    bellyPlate: '#e0f2fe',        // Frosty Cyan-White Scute Plates
    bellyShadow: '#bae6fd',       // Soft Glacial Cyan Shadow
    hornGold: '#fde047',          // Bright Crystalline Gold Horns
    hornHighlight: '#ffffff',     // Diamond Frost Specular Glint
    clawColor: '#fde047',         // Polished Gold/Frost Claws
    irisColor: '#0284c7',         // Deep Crystalline Sapphire Eyes
    plinthBody: '#1e40af',        // Royal Blue Lacquer Plinth Base
    plinthGold: '#fbbf24',        // Metallic Gold Bevel Rims
    flameEmblem: '#38bdf8',       // Luminous Frost Flame Medallion
  },
};

/**
 * Resolves dragon palette dynamically based on player color & theme variant.
 * If player color is selected, the dragon's primary hue adapts seamlessly.
 */
export function getDragonPalette(
  color?: PlayerColor,
  variant: 'fire' | 'ice' = 'fire'
): DragonPalette {
  const base = DRAGON_VARIANTS[variant];
  if (!color) return base;

  switch (color) {
    case 'blue':
      return DRAGON_VARIANTS.ice;
    case 'green':
      return {
        bodyPrimary: '#059669',     // Emerald Green
        bodyDark: '#065f46',        // Deep Jade
        bodyHighlight: '#10b981',   // Bright Mint Emerald
        bellyPlate: '#dcfce7',      // Soft Jade Cream Scutes
        bellyShadow: '#bbf7d0',     // Pale Emerald Shadow
        hornGold: '#fbbf24',        // 24K Gold Horns
        hornHighlight: '#fde047',   // Gold Glint
        clawColor: '#fde047',       // Gold Claws
        irisColor: '#047857',       // Forest Emerald Eyes
        plinthBody: '#047857',      // Jade Lacquer Plinth
        plinthGold: '#fbbf24',      // Gold Rims
        flameEmblem: '#10b981',     // Emerald Flame Medallion
      };
    case 'yellow':
      return {
        bodyPrimary: '#d97706',     // Solar Amber Gold
        bodyDark: '#b45309',        // Deep Bronze
        bodyHighlight: '#f59e0b',   // Warm Saffron Gold
        bellyPlate: '#fef9c3',      // Pale Cream Scutes
        bellyShadow: '#fef08a',     // Warm Buttercream Shadow
        hornGold: '#fef08a',        // Light Solar Gold Horns
        hornHighlight: '#ffffff',   // Solar Diamond Glint
        clawColor: '#fef08a',       // Gold Claws
        irisColor: '#92400e',       // Golden Topaz Eyes
        plinthBody: '#b45309',      // Amber Bronze Lacquer Plinth
        plinthGold: '#fbbf24',      // Gold Rims
        flameEmblem: '#f59e0b',     // Solar Flame Medallion
      };
    case 'red':
    default:
      return DRAGON_VARIANTS.fire;
  }
}
