import { ContactShadows, RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  CuboidCollider,
  Physics,
  RapierRigidBody,
  RigidBody,
} from '@react-three/rapier';
import gsap from 'gsap';
import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';
import { DICE_SKINS } from '../../engine/boardConfig';
import { DiceSkinId } from '../../types/game';
import { haptics } from '../../utils/haptics';
import { StudioEnvironment } from './StudioEnvironment';

/**
 * Target Euler rotations [x, y, z] so that when the camera looks from [0, 2.35, 1.85]
 * toward [0, 0, 0], the top/front face clearly displays `value` (1..6).
 * Face mapping on the local cube:
 * +Y (Top)    = 1
 * -Y (Bottom) = 6
 * +Z (Front)  = 2
 * -Z (Back)   = 5
 * +X (Right)  = 3
 * -X (Left)   = 4
 */
const FACE_EULER_MAP: Record<number, [number, number, number]> = {
  1: [0.35, 0.25, 0], // +Y tilted slightly toward camera
  2: [-Math.PI / 2 + 0.35, 0, 0.2], // +Z facing up/camera
  3: [0.25, 0, Math.PI / 2 - 0.2], // +X facing up/camera
  4: [0.25, 0, -Math.PI / 2 + 0.2], // -X facing up/camera
  5: [Math.PI / 2 + 0.35, 0, -0.2], // -Z facing up/camera
  6: [Math.PI + 0.35, -0.25, 0], // -Y facing up/camera
};

interface PipPositions {
  faceValue: number;
  normal: [number, number, number];
  rotation: [number, number, number];
  pips: [number, number][];
}

const DICE_FACE_PIPS: PipPositions[] = [
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
const SHARED_DICE_GEO = {
  pipWell: new THREE.CylinderGeometry(0.092, 0.076, 0.018, 24),
  pipAceWell: new THREE.CylinderGeometry(0.125, 0.105, 0.02, 28),
  pipRim: new THREE.RingGeometry(0.088, 0.106, 24),
  pipAceRim: new THREE.RingGeometry(0.118, 0.142, 28),
};

interface SkinPBRProfile {
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

const SKIN_PBR_MAP: Record<DiceSkinId, SkinPBRProfile> = {
  'classic-white': {
    metalness: 0.06,
    roughness: 0.14,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    ior: 1.55,
    sheen: 0.45,
    pipEmissive: '#000000',
    pipEmissiveIntensity: 0,
    rimColor: '#cbd5e1',
  },
  'royal-gold': {
    metalness: 0.88,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    ior: 1.7,
    sheen: 0.3,
    pipEmissive: '#451a03',
    pipEmissiveIntensity: 0.15,
    rimColor: '#fef08a',
  },
  'ruby-blaze': {
    metalness: 0.35,
    roughness: 0.09,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    ior: 1.75,
    sheen: 0.5,
    pipEmissive: '#ffffff',
    pipEmissiveIntensity: 0.25,
    rimColor: '#fecdd3',
  },
  'cyber-neon': {
    metalness: 0.68,
    roughness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
    ior: 1.6,
    sheen: 0.2,
    pipEmissive: '#22d3ee',
    pipEmissiveIntensity: 2.2,
    rimColor: '#38bdf8',
  },
  'emerald-jade': {
    metalness: 0.24,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    ior: 1.66,
    sheen: 0.65,
    pipEmissive: '#ecfdf5',
    pipEmissiveIntensity: 0.2,
    rimColor: '#6ee7b7',
  },
  'obsidian-galaxy': {
    metalness: 0.78,
    roughness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    ior: 1.8,
    sheen: 0.35,
    pipEmissive: '#f472b6',
    pipEmissiveIntensity: 2.0,
    rimColor: '#c084fc',
  },
};

interface PhysicsDieMeshProps {
  skinId: DiceSkinId;
  value: number;
  isRolling: boolean;
  onSettled?: () => void;
}

const PhysicsDieMesh: React.FC<PhysicsDieMeshProps> = React.memo(
  ({ skinId, value, isRolling, onSettled }) => {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
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
        soundManager.play('dice_roll');
        const targetEuler = FACE_EULER_MAP[value] ?? FACE_EULER_MAP[1];

        // Normalize current rotation to [0..2PI) before launching smooth multi-axis spin
        grp.rotation.x = grp.rotation.x % (Math.PI * 2);
        grp.rotation.y = grp.rotation.y % (Math.PI * 2);
        grp.rotation.z = grp.rotation.z % (Math.PI * 2);

        // Keep Rapier body anchored at origin so it never drifts or skews the visual die face
        if (rigidBodyRef.current) {
          try {
            rigidBodyRef.current.setTranslation({ x: 0, y: 0, z: 0 }, true);
            rigidBodyRef.current.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
          } catch {
            // Safe fallback if physics world is still initializing
          }
        }

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
        visualGroupRef.current.rotation.y =
          targetEuler[1] + Math.sin(t * 1.4) * 0.04;
      }
    });

    return (
      <RigidBody
        ref={rigidBodyRef}
        type="kinematicPosition"
        colliders="cuboid"
        position={[0, 0, 0]}
      >
        <group ref={visualGroupRef}>
          {/* Sculpted High-Tessellation Rounded Cube Body */}
          <RoundedBox
            args={[1.06, 1.06, 1.06]}
            radius={0.135}
            smoothness={8}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color={skin.bodyColor}
              metalness={pbr.metalness}
              roughness={pbr.roughness}
              clearcoat={pbr.clearcoat}
              clearcoatRoughness={pbr.clearcoatRoughness}
              ior={pbr.ior}
              sheen={pbr.sheen}
              sheenColor="#ffffff"
            />
          </RoundedBox>

          {/* Engraved Recessed 3D Pips + Metallic Bevel Rims on all 6 faces */}
          {DICE_FACE_PIPS.map((face, fIdx) => {
            const isClassicAce =
              skinId === 'classic-white' && face.faceValue === 1;
            const pipColor = isClassicAce ? '#dc2626' : skin.pipColor;
            const rimColor = isClassicAce ? '#fbbf24' : pbr.rimColor;

            return (
              <group
                key={fIdx}
                position={face.normal}
                rotation={face.rotation}
              >
                {face.pips.map(([px, py], pIdx) => (
                  <group key={pIdx} position={[px, py, 0]}>
                    {/* Recessed Engraved Pip Well */}
                    <mesh
                      geometry={
                        isClassicAce
                          ? SHARED_DICE_GEO.pipAceWell
                          : SHARED_DICE_GEO.pipWell
                      }
                      position={[0, 0, -0.004]}
                      rotation={[Math.PI / 2, 0, 0]}
                    >
                      <meshPhysicalMaterial
                        color={pipColor}
                        roughness={0.14}
                        metalness={0.35}
                        clearcoat={1}
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
      </RigidBody>
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
        {/* Luminous Golden/Skin Aura Ring */}
        <div
          className={`absolute -inset-2 rounded-full transition-opacity duration-300 ${
            canRoll ? 'opacity-100 animate-pulse' : 'opacity-30'
          }`}
          style={{
            background: `radial-gradient(circle, ${skin.edgeGlow}88 0%, rgba(251,191,36,0.18) 62%, transparent 78%)`,
            boxShadow: canRoll
              ? `0 0 28px 6px ${skin.edgeGlow}66, inset 0 0 14px #ffffffaa`
              : 'none',
          }}
        />

        {/* Glossy Pod Platform */}
        <div className="relative w-full h-full rounded-full bg-gradient-to-b from-amber-50/95 via-amber-100/90 to-amber-200/95 border-4 border-amber-300/90 shadow-[0_10px_25px_rgba(180,83,9,0.35),inset_0_4px_8px_rgba(255,255,255,0.9)] overflow-hidden">
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 2.25, 1.78], fov: 35 }}
            gl={{ alpha: true, antialias: true }}
          >
            <StudioEnvironment intensity={1.25} />
            <ambientLight intensity={0.45} />
            <directionalLight
              position={[4, 6, 4]}
              intensity={2.1}
              castShadow
              shadow-mapSize={[512, 512]}
            />
            <pointLight
              position={[-3, 3, 2]}
              intensity={1.1}
              color={skin.edgeGlow}
            />
            <Suspense fallback={null}>
              <ContactShadows
                position={[0, -0.66, 0]}
                opacity={0.5}
                scale={2.4}
                blur={2.2}
                far={1.5}
                color="#451a03"
              />
              <Physics gravity={[0, -9.81, 0]} paused={!isRolling}>
                <CuboidCollider position={[0, -1.2, 0]} args={[2, 0.2, 2]} />
                <PhysicsDieMesh
                  skinId={skinId}
                  value={displayValue}
                  isRolling={isRolling}
                  onSettled={onRollSettled}
                />
              </Physics>
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
