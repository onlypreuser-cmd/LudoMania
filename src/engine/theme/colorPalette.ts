import { PlayerColor } from '../../types/game';

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
