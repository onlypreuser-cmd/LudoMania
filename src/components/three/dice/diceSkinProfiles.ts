import { DicePodTheme, DiceSkinId } from '../../../types/game';

export interface SkinPBRProfile {
  metalness: number;
  roughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  ior: number;
  sheen: number;
  pipEmissive: string;
  pipEmissiveIntensity: number;
  rimColor: string;
}

export const SKIN_PBR_MAP: Record<DiceSkinId, SkinPBRProfile> = {
  'classic-white': {
    metalness: 0.02,
    roughness: 0.4,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    ior: 1.5,
    sheen: 0.25,
    pipEmissive: '#000000',
    pipEmissiveIntensity: 0,
    rimColor: '#94a3b8',
  },
  'royal-gold': {
    metalness: 0.88,
    roughness: 0.32,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    ior: 1.88,
    sheen: 0.15,
    pipEmissive: '#b45309',
    pipEmissiveIntensity: 0.12,
    rimColor: '#fef08a',
  },
  'ruby-blaze': {
    metalness: 0.15,
    roughness: 0.24,
    clearcoat: 0.12,
    clearcoatRoughness: 0.15,
    ior: 1.76,
    sheen: 0.25,
    pipEmissive: '#fda4af',
    pipEmissiveIntensity: 0.45,
    rimColor: '#fecdd3',
  },
  'cyber-neon': {
    metalness: 0.72,
    roughness: 0.42,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    ior: 1.6,
    sheen: 0.1,
    pipEmissive: '#22d3ee',
    pipEmissiveIntensity: 1.8,
    rimColor: '#38bdf8',
  },
  'emerald-jade': {
    metalness: 0.12,
    roughness: 0.35,
    clearcoat: 0.0,
    clearcoatRoughness: 0.1,
    ior: 1.66,
    sheen: 0.3,
    pipEmissive: '#ecfdf5',
    pipEmissiveIntensity: 0.15,
    rimColor: '#6ee7b7',
  },
  'obsidian-galaxy': {
    metalness: 0.75,
    roughness: 0.28,
    clearcoat: 0.08,
    clearcoatRoughness: 0.12,
    ior: 1.88,
    sheen: 0.2,
    pipEmissive: '#f472b6',
    pipEmissiveIntensity: 1.6,
    rimColor: '#c084fc',
  },
  'magma-inferno': {
    metalness: 0.2,
    roughness: 0.88,
    clearcoat: 0.05,
    clearcoatRoughness: 0.15,
    ior: 1.54,
    sheen: 0.1,
    pipEmissive: '#f97316',
    pipEmissiveIntensity: 2.4,
    rimColor: '#fdba74',
  },
  'cryo-glacial': {
    metalness: 0.05,
    roughness: 0.14,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    ior: 1.31,
    sheen: 0.4,
    pipEmissive: '#38bdf8',
    pipEmissiveIntensity: 1.5,
    rimColor: '#bae6fd',
  },
};

export const POD_CONTAINER_CLASSES: Record<DicePodTheme, string> = {
  'alabaster-brass':
    'bg-gradient-to-b from-stone-50 via-amber-50 to-stone-200 border-4 border-amber-300 shadow-[0_10px_25px_rgba(180,83,9,0.25),inset_0_4px_8px_rgba(255,255,255,0.9)]',
  'scarlet-velvet-gold':
    'bg-gradient-to-b from-amber-300 via-rose-900 to-red-950 border-4 border-amber-400 shadow-[0_10px_25px_rgba(225,29,72,0.4),inset_0_4px_8px_rgba(255,255,255,0.4)]',
  'rosegold-jeweler':
    'bg-gradient-to-b from-rose-100 via-rose-200 to-rose-300 border-4 border-rose-300 shadow-[0_10px_25px_rgba(244,63,94,0.35),inset_0_4px_8px_rgba(255,255,255,0.8)]',
  'cyber-hex-dock':
    'bg-gradient-to-b from-slate-900 via-cyan-950 to-slate-950 border-4 border-cyan-400 shadow-[0_10px_25px_rgba(6,182,212,0.45),inset_0_4px_8px_rgba(34,211,238,0.25)]',
  'celadon-lotus':
    'bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-200 border-4 border-emerald-400 shadow-[0_10px_25px_rgba(5,150,105,0.3),inset_0_4px_8px_rgba(255,255,255,0.9)]',
  'meteorite-suspension':
    'bg-gradient-to-b from-slate-950 via-purple-950 to-black border-4 border-purple-500 shadow-[0_10px_25px_rgba(168,85,247,0.45),inset_0_4px_8px_rgba(192,132,252,0.25)]',
};

export const DICE_AUDIO_PITCH_MAP: Record<DiceSkinId, number> = {
  'classic-white': 1.0,
  'royal-gold': 0.82,
  'ruby-blaze': 1.35,
  'cyber-neon': 1.15,
  'emerald-jade': 0.9,
  'obsidian-galaxy': 0.72,
  'magma-inferno': 0.78,
  'cryo-glacial': 1.42,
};
