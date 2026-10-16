import * as THREE from 'three';
import { DiceSkinId } from '../../../types/game';

function createStarPipGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const rOuter = 0.088;
  const rInner = 0.034;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (i * Math.PI) / 4;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: false,
  });
}

function createDiamondPipGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.095);
  shape.lineTo(0.068, 0);
  shape.lineTo(0, -0.095);
  shape.lineTo(-0.068, 0);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: false,
  });
}

function createCrownAceGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.105, -0.065);
  shape.lineTo(0.105, -0.065);
  shape.lineTo(0.115, 0.038);
  shape.lineTo(0.055, -0.01);
  shape.lineTo(0, 0.075);
  shape.lineTo(-0.055, -0.01);
  shape.lineTo(-0.115, 0.038);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.003,
    bevelSize: 0.003,
    bevelSegments: 2,
  });
}

/**
 * Target Euler rotations [x, y, z] so that when the camera looks from [0, 2.25, 1.78]
 * toward [0, 0, 0], the top/front face clearly displays `value` (1..6).
 * Face mapping on the local cube:
 * +Y (Top)    = 1
 * -Y (Bottom) = 6
 * +Z (Front)  = 2
 * -Z (Back)   = 5
 * +X (Right)  = 3
 * -X (Left)   = 4
 */
export const FACE_EULER_MAP: Record<number, [number, number, number]> = {
  1: [0.35, 0.25, 0], // +Y Top
  2: [-Math.PI / 2 + 0.35, 0, 0], // +Z Front
  3: [0.35, 0, Math.PI / 2], // +X Right
  4: [0.35, 0, -Math.PI / 2], // -X Left
  5: [Math.PI / 2 + 0.35, 0, 0], // -Z Back
  6: [Math.PI + 0.35, -0.25, 0], // -Y Bottom
};

export interface PipPositions {
  faceValue: number;
  normal: [number, number, number];
  rotation: [number, number, number];
  pips: [number, number][];
}

export const DICE_FACE_PIPS: PipPositions[] = [
  // 1 (+Y Top)
  {
    faceValue: 1,
    normal: [0, 0.531, 0],
    rotation: [-Math.PI / 2, 0, 0],
    pips: [[0, 0]],
  },
  // 6 (-Y Bottom)
  {
    faceValue: 6,
    normal: [0, -0.531, 0],
    rotation: [Math.PI / 2, 0, 0],
    pips: [
      [-0.25, -0.27],
      [0.25, -0.27],
      [-0.25, 0],
      [0.25, 0],
      [-0.25, 0.27],
      [0.25, 0.27],
    ],
  },
  // 2 (+Z Front)
  {
    faceValue: 2,
    normal: [0, 0, 0.531],
    rotation: [0, 0, 0],
    pips: [
      [-0.24, 0.24],
      [0.24, -0.24],
    ],
  },
  // 5 (-Z Back)
  {
    faceValue: 5,
    normal: [0, 0, -0.531],
    rotation: [0, Math.PI, 0],
    pips: [
      [-0.25, -0.25],
      [0.25, -0.25],
      [0, 0],
      [-0.25, 0.25],
      [0.25, 0.25],
    ],
  },
  // 3 (+X Right)
  {
    faceValue: 3,
    normal: [0.531, 0, 0],
    rotation: [0, Math.PI / 2, 0],
    pips: [
      [-0.25, 0.25],
      [0, 0],
      [0.25, -0.25],
    ],
  },
  // 4 (-X Left)
  {
    faceValue: 4,
    normal: [-0.531, 0, 0],
    rotation: [0, -Math.PI / 2, 0],
    pips: [
      [-0.25, -0.25],
      [0.25, -0.25],
      [-0.25, 0.25],
      [0.25, 0.25],
    ],
  },
];

/**
 * Pre-allocated shared geometries for Dice pips & beveled rims (zero runtime allocation)
 */
export const SHARED_DICE_GEO = {
  pipWell: new THREE.CylinderGeometry(0.092, 0.076, 0.018, 24),
  pipAceWell: new THREE.CylinderGeometry(0.125, 0.105, 0.02, 28),
  pipRim: new THREE.RingGeometry(0.088, 0.106, 24),
  pipAceRim: new THREE.RingGeometry(0.118, 0.142, 28),
  starPip: createStarPipGeometry(),
  diamondPip: createDiamondPipGeometry(),
  crownAce: createCrownAceGeometry(),
  squarePip: new THREE.BoxGeometry(0.125, 0.125, 0.018),
  lotusPip: new THREE.TorusGeometry(0.065, 0.024, 12, 22),
  runePip: new THREE.CylinderGeometry(0.062, 0.062, 0.018, 6),
};

export function getDiceCubeConfig(shapeType: string) {
  switch (shapeType) {
    case 'chamfered-bullion':
      return { args: [1.06, 1.06, 1.06] as [number, number, number], radius: 0.12, smoothness: 3 };
    case 'cushion-gem':
      return { args: [1.04, 1.04, 1.04] as [number, number, number], radius: 0.14, smoothness: 6 };
    case 'sci-fi-datacube':
      return { args: [1.06, 1.06, 1.06] as [number, number, number], radius: 0.08, smoothness: 4 };
    case 'worn-seal':
      return { args: [1.05, 1.05, 1.05] as [number, number, number], radius: 0.15, smoothness: 8 };
    case 'monolith-glass':
      return { args: [1.06, 1.06, 1.06] as [number, number, number], radius: 0.09, smoothness: 8 };
    default:
      return { args: [1.06, 1.06, 1.06] as [number, number, number], radius: 0.165, smoothness: 10 };
  }
}

export function getDicePipGeometry(faceVal: number, skinId: DiceSkinId, pipShape?: string): THREE.BufferGeometry {
  if (faceVal === 1) {
    if (skinId === 'classic-white') return SHARED_DICE_GEO.crownAce;
    if (skinId === 'royal-gold' || skinId === 'magma-inferno') return SHARED_DICE_GEO.starPip;
    if (skinId === 'ruby-blaze' || skinId === 'cryo-glacial') return SHARED_DICE_GEO.diamondPip;
    if (skinId === 'cyber-neon') return SHARED_DICE_GEO.squarePip;
    if (skinId === 'emerald-jade') return SHARED_DICE_GEO.lotusPip;
    if (skinId === 'obsidian-galaxy') return SHARED_DICE_GEO.runePip;
    return SHARED_DICE_GEO.pipAceWell;
  }
  switch (pipShape) {
    case 'star-pyramid':
      return SHARED_DICE_GEO.starPip;
    case 'crystal-diamond':
      return SHARED_DICE_GEO.diamondPip;
    case 'digital-square':
      return SHARED_DICE_GEO.squarePip;
    case 'lotus-spiral':
      return SHARED_DICE_GEO.lotusPip;
    case 'constellation-rune':
      return SHARED_DICE_GEO.runePip;
    default:
      return SHARED_DICE_GEO.pipWell;
  }
}
