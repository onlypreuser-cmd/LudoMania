import { ContactShadows, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';
import { DICE_SKINS } from '../../engine/boardConfig';
import { DicePodTheme, DiceSkinId } from '../../types/game';
import { haptics } from '../../utils/haptics';
import { StudioEnvironment } from './StudioEnvironment';

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
};

const POD_CONTAINER_CLASSES: Record<DicePodTheme, string> = {
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

const DICE_AUDIO_PITCH_MAP: Record<DiceSkinId, number> = {
  'classic-white': 1.0,
  'royal-gold': 0.82,
  'ruby-blaze': 1.35,
  'cyber-neon': 1.15,
  'emerald-jade': 0.9,
  'obsidian-galaxy': 0.72,
};

interface PhysicsDieMeshProps {
  skinId: DiceSkinId;
  value: number;
  isRolling: boolean;
  onSettled?: () => void;
}

const PhysicsDieMesh: React.FC<PhysicsDieMeshProps> = React.memo(
  ({ skinId, value, isRolling, onSettled }) => {
    const visualGroupRef = useRef<THREE.Group>(null);
    const hasSettledFiredRef = useRef(false);

    const skin = useMemo(
      () => DICE_SKINS.find((s) => s.id === skinId) ?? DICE_SKINS[0],
      [skinId]
    );
    const pbr = SKIN_PBR_MAP[skinId] ?? SKIN_PBR_MAP['classic-white'];

    useEffect(() => {
      if (!visualGroupRef.current) return;
      const grp = visualGroupRef.current;

      gsap.killTweensOf(grp.position);
      gsap.killTweensOf(grp.rotation);
      gsap.killTweensOf(grp.scale);

      if (isRolling) {
        hasSettledFiredRef.current = false;
        soundManager.play('dice_roll', DICE_AUDIO_PITCH_MAP[skinId] ?? 1.0);
        const targetEuler = FACE_EULER_MAP[value] ?? FACE_EULER_MAP[1];

        // Normalize current rotation to [0..2PI) before launching smooth multi-axis spin
        grp.rotation.x = grp.rotation.x % (Math.PI * 2);
        grp.rotation.y = grp.rotation.y % (Math.PI * 2);
        grp.rotation.z = grp.rotation.z % (Math.PI * 2);

        // Smooth 0.70s multi-bounce ballistic tumble synced with dice_roll audio bounces
        const tl = gsap.timeline({
          onComplete: () => {
            if (hasSettledFiredRef.current) return;
            hasSettledFiredRef.current = true;
            grp.position.set(0, 0, 0);
            grp.rotation.set(targetEuler[0], targetEuler[1], targetEuler[2]);
            grp.scale.set(1, 1, 1);
            if (value === 6) {
              haptics.rolledSix();
            } else {
              haptics.stepHop();
            }
            onSettled?.();
          },
        });

        // Continuous smooth multi-axis spin settling onto exact target face
        tl.to(
          grp.rotation,
          {
            x: targetEuler[0] + Math.PI * 4,
            y: targetEuler[1] + Math.PI * 4,
            z: targetEuler[2] + Math.PI * 2,
            duration: 0.68,
            ease: 'power2.out',
          },
          0
        )
          // 1. Toss upward (0.00s -> 0.165s) + volume-preserving stretch
          .to(
            grp.position,
            {
              x: 0.06,
              y: 0.54,
              z: -0.05,
              duration: 0.165,
              ease: 'sine.out',
            },
            0
          )
          .to(
            grp.scale,
            {
              x: 0.93,
              y: 1.13,
              z: 0.93,
              duration: 0.15,
              ease: 'sine.out',
            },
            0
          )
          // 2. First board drop impact (0.165s -> 0.305s) + impact squash
          .to(
            grp.position,
            {
              x: -0.04,
              y: -0.04,
              z: 0.03,
              duration: 0.14,
              ease: 'sine.in',
            },
            0.165
          )
          .to(
            grp.scale,
            {
              x: 1.13,
              y: 0.85,
              z: 1.13,
              duration: 0.055,
              ease: 'power2.out',
            },
            0.28
          )
          // 3. First rebound hop (0.305s -> 0.415s)
          .to(
            grp.position,
            {
              x: 0.02,
              y: 0.22,
              z: -0.02,
              duration: 0.11,
              ease: 'sine.out',
            },
            0.305
          )
          .to(
            grp.scale,
            {
              x: 0.96,
              y: 1.06,
              z: 0.96,
              duration: 0.09,
              ease: 'sine.out',
            },
            0.335
          )
          // 4. Second board impact (0.415s -> 0.505s) + lighter squash
          .to(
            grp.position,
            {
              x: 0,
              y: -0.02,
              z: 0,
              duration: 0.09,
              ease: 'sine.in',
            },
            0.415
          )
          .to(
            grp.scale,
            {
              x: 1.06,
              y: 0.92,
              z: 1.06,
              duration: 0.045,
              ease: 'power1.out',
            },
            0.485
          )
          // 5. Final micro-hop & elastic settle (0.505s -> 0.68s)
          .to(
            grp.position,
            {
              x: 0,
              y: 0.065,
              z: 0,
              duration: 0.075,
              ease: 'sine.out',
            },
            0.505
          )
          .to(
            grp.position,
            {
              x: 0,
              y: 0,
              z: 0,
              duration: 0.1,
              ease: 'sine.inOut',
            },
            0.58
          )
          .to(
            grp.scale,
            {
              x: 1,
              y: 1,
              z: 1,
              duration: 0.15,
              ease: 'back.out(1.6)',
            },
            0.53
          );

        return () => {
          tl.kill();
        };
      } else {
        const targetEuler = FACE_EULER_MAP[value] ?? FACE_EULER_MAP[1];
        grp.position.set(0, 0, 0);
        grp.rotation.set(
          targetEuler[0],
          targetEuler[1],
          targetEuler[2]
        );
        grp.scale.set(1, 1, 1);
      }
    }, [isRolling, value, onSettled]);

    useFrame((state) => {
      if (!isRolling && visualGroupRef.current) {
        const t = state.clock.elapsedTime;
        const targetEuler = FACE_EULER_MAP[value] ?? FACE_EULER_MAP[1];
        // Subtle lifelike idle hover & gentle micro-precession so HDRI reflections shimmer
        visualGroupRef.current.position.y = Math.sin(t * 2.2) * 0.032;
        visualGroupRef.current.rotation.x = targetEuler[0];
        visualGroupRef.current.rotation.y =
          targetEuler[1] + Math.sin(t * 1.4) * 0.04;
        visualGroupRef.current.rotation.z = targetEuler[2];
      }
    });

    const cubeConfig = useMemo(() => {
      switch (skin.shapeType) {
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
    }, [skin.shapeType]);

    const getPipGeo = (faceVal: number) => {
      if (faceVal === 1) {
        if (skinId === 'classic-white') return SHARED_DICE_GEO.crownAce;
        if (skinId === 'royal-gold') return SHARED_DICE_GEO.starPip;
        if (skinId === 'ruby-blaze') return SHARED_DICE_GEO.diamondPip;
        if (skinId === 'cyber-neon') return SHARED_DICE_GEO.squarePip;
        if (skinId === 'emerald-jade') return SHARED_DICE_GEO.lotusPip;
        if (skinId === 'obsidian-galaxy') return SHARED_DICE_GEO.runePip;
        return SHARED_DICE_GEO.pipAceWell;
      }
      switch (skin.pipShape) {
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
    };

    return (
      <group ref={visualGroupRef}>
        {/* Sculpted High-Tessellation Custom Shaped Cube Body */}
        <RoundedBox
          args={cubeConfig.args}
          radius={cubeConfig.radius}
          smoothness={cubeConfig.smoothness}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={skin.bodyColor}
            metalness={skin.metalness}
            roughness={skin.roughness}
            clearcoat={pbr.clearcoat}
            clearcoatRoughness={pbr.clearcoatRoughness}
            ior={pbr.ior}
            sheen={pbr.sheen}
            sheenColor={
              skinId === 'emerald-jade'
                ? '#d1fae5'
                : skinId === 'classic-white'
                ? '#fef3c7'
                : '#ffffff'
            }
            transmission={skin.transmission ?? 0}
            thickness={skin.thickness ?? 0}
          />
        </RoundedBox>

        {/* Engraved Recessed 3D Pips + Metallic Bevel Rims on all 6 faces */}
        {DICE_FACE_PIPS.map((face, fIdx) => {
          const isAce = face.faceValue === 1;
          const isClassicAce = skinId === 'classic-white' && isAce;
          const pipColor = isClassicAce ? '#dc2626' : skin.pipColor;
          const rimColor = isClassicAce ? '#fbbf24' : pbr.rimColor;
          const pipGeo = getPipGeo(face.faceValue);

          return (
            <group
              key={fIdx}
              position={face.normal}
              rotation={face.rotation}
            >
              {face.pips.map(([px, py], pIdx) => (
                <group key={pIdx} position={[px, py, 0]}>
                  {/* Recessed Engraved Custom Pip Well */}
                  <mesh
                    geometry={pipGeo}
                    position={[0, 0, -0.004]}
                    rotation={
                      skin.pipShape === 'digital-square'
                        ? [0, 0, 0]
                        : [Math.PI / 2, 0, 0]
                    }
                  >
                    <meshPhysicalMaterial
                      color={pipColor}
                      roughness={0.24}
                      metalness={0.25}
                      clearcoat={0}
                      emissive={isClassicAce ? '#991b1b' : pbr.pipEmissive}
                      emissiveIntensity={
                        isClassicAce ? 0.25 : pbr.pipEmissiveIntensity
                      }
                    />
                  </mesh>
                  {/* Fine Metallic / Luminous Bevel Rim Around Pip */}
                  <mesh
                    geometry={
                      isClassicAce
                        ? SHARED_DICE_GEO.pipAceRim
                        : SHARED_DICE_GEO.pipRim
                    }
                    position={[0, 0, 0.006]}
                  >
                    <meshStandardMaterial
                      color={rimColor}
                      metalness={0.8}
                      roughness={0.18}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })}
      </group>
    );
  }
);

PhysicsDieMesh.displayName = 'PhysicsDieMesh';

export interface Dice3DPodProps {
  skinId: DiceSkinId;
  value: number | null;
  lastRolledValue?: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onTriggerRoll: () => void;
  onRollSettled?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Dice3DPod: React.FC<Dice3DPodProps> = React.memo(
  ({
    skinId,
    value,
    lastRolledValue,
    isRolling,
    canRoll,
    onTriggerRoll,
    onRollSettled,
    size = 'lg',
  }) => {
    const skin = DICE_SKINS.find((s) => s.id === skinId) ?? DICE_SKINS[0];
    const displayValue = value ?? lastRolledValue ?? 6;

    const sizeClasses =
      size === 'sm'
        ? 'w-16 h-16'
        : size === 'md'
        ? 'w-20 h-20'
        : 'w-24 h-24 sm:w-28 sm:h-28';

    const podPlatformClass =
      POD_CONTAINER_CLASSES[skin.podTheme] ??
      POD_CONTAINER_CLASSES['alabaster-brass'];

    return (
      <button
        type="button"
        disabled={!canRoll || isRolling}
        onClick={onTriggerRoll}
        aria-label="Roll 3D Dice"
        className={`relative ${sizeClasses} rounded-full flex items-center justify-center transition-transform duration-200 select-none ${
          canRoll && !isRolling
            ? 'cursor-pointer hover:scale-105 active:scale-95'
            : 'cursor-not-allowed opacity-90'
        }`}
      >
        {/* Soft Tactile Aura Ring */}
        <div
          className={`absolute -inset-1.5 rounded-full transition-opacity duration-300 ${
            canRoll ? 'opacity-100 animate-pulse' : 'opacity-20'
          }`}
          style={{
            background: `radial-gradient(circle, ${skin.edgeGlow}44 0%, rgba(251,191,36,0.12) 62%, transparent 78%)`,
            boxShadow: canRoll
              ? `0 0 16px 2px ${skin.edgeGlow}44, inset 0 0 8px #ffffff66`
              : 'none',
          }}
        />

        {/* Theme-Adaptive Tactile Pod Platform */}
        <div className={`relative w-full h-full rounded-full ${podPlatformClass} overflow-hidden transition-all duration-300`}>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 2.25, 1.78], fov: 35 }}
            gl={{ alpha: true, antialias: true }}
          >
            <StudioEnvironment intensity={0.9} />
            <ambientLight intensity={0.32} />
            <directionalLight
              position={[4, 6, 4]}
              intensity={1.15}
              castShadow
              shadow-mapSize={[512, 512]}
            />
            <pointLight
              position={[-3, 3, 2]}
              intensity={0.35}
              color={skin.edgeGlow}
            />
            <Suspense fallback={null}>
              <ContactShadows
                position={[0, -0.66, 0]}
                opacity={0.35}
                scale={2.4}
                blur={2.2}
                far={1.5}
                color="#261005"
              />
              <PhysicsDieMesh
                skinId={skinId}
                value={displayValue}
                isRolling={isRolling}
                onSettled={onRollSettled}
              />
            </Suspense>
          </Canvas>

          {/* Numeric Value Pill Badge when settled */}
          {displayValue !== null && !isRolling && (
            <span className="absolute bottom-1 right-2 px-1.5 py-0.5 rounded-full bg-slate-900/85 text-amber-300 text-[11px] font-extrabold shadow">
              {displayValue}
            </span>
          )}
        </div>
      </button>
    );
  }
);

Dice3DPod.displayName = 'Dice3DPod';
