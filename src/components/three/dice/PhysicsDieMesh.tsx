import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from '../../../audio/soundManager';
import { DICE_SKINS } from '../../../engine/boardConfig';
import { DiceSkinId } from '../../../types/game';
import { haptics } from '../../../utils/haptics';
import {
  DICE_FACE_PIPS,
  FACE_EULER_MAP,
  SHARED_DICE_GEO,
  getDiceCubeConfig,
  getDicePipGeometry,
} from './diceGeometries';
import { DICE_AUDIO_PITCH_MAP, SKIN_PBR_MAP } from './diceSkinProfiles';

export interface PhysicsDieMeshProps {
  skinId: DiceSkinId;
  value: number;
  isRolling: boolean;
  onSettled?: () => void;
}

const LAVA_BUBBLES = [
  { pos: [0.42, 0.54, 0.12] as [number, number, number], r: 0.055, speed: 4.2, phase: 0 },
  { pos: [-0.38, 0.54, -0.22] as [number, number, number], r: 0.068, speed: 3.5, phase: 1.2 },
  { pos: [0.54, 0.22, -0.35] as [number, number, number], r: 0.06, speed: 5.0, phase: 2.1 },
  { pos: [-0.54, -0.15, 0.32] as [number, number, number], r: 0.052, speed: 3.8, phase: 3.4 },
  { pos: [0.15, -0.54, 0.42] as [number, number, number], r: 0.07, speed: 4.8, phase: 0.7 },
  { pos: [-0.25, -0.54, -0.38] as [number, number, number], r: 0.048, speed: 3.2, phase: 2.8 },
  { pos: [0.35, -0.22, 0.54] as [number, number, number], r: 0.062, speed: 4.4, phase: 1.8 },
  { pos: [-0.42, 0.35, -0.54] as [number, number, number], r: 0.058, speed: 3.9, phase: 4.0 },
];

const LAVA_DRIPS = [
  { pos: [0.36, -0.52, 0.36] as [number, number, number], speed: 2.5, phase: 0.5 },
  { pos: [-0.36, -0.52, 0.36] as [number, number, number], speed: 2.8, phase: 1.6 },
  { pos: [0.36, -0.52, -0.36] as [number, number, number], speed: 2.2, phase: 2.7 },
  { pos: [-0.36, -0.52, -0.36] as [number, number, number], speed: 3.0, phase: 3.8 },
];

const FROST_SHARDS = [
  { pos: [0.52, 0.52, 0.52] as [number, number, number], rot: [0.6, 0.8, 0.4] as [number, number, number], s: 1 },
  { pos: [-0.52, 0.52, 0.52] as [number, number, number], rot: [-0.6, 0.8, -0.4] as [number, number, number], s: 0.9 },
  { pos: [0.52, -0.52, 0.52] as [number, number, number], rot: [0.6, -0.8, 0.4] as [number, number, number], s: 1.1 },
  { pos: [-0.52, -0.52, 0.52] as [number, number, number], rot: [-0.6, -0.8, -0.4] as [number, number, number], s: 0.85 },
  { pos: [0.52, 0.52, -0.52] as [number, number, number], rot: [0.6, 0.8, -0.4] as [number, number, number], s: 1.05 },
  { pos: [-0.52, 0.52, -0.52] as [number, number, number], rot: [-0.6, 0.8, 0.4] as [number, number, number], s: 0.95 },
  { pos: [0.52, -0.52, -0.52] as [number, number, number], rot: [0.6, -0.8, -0.4] as [number, number, number], s: 0.9 },
  { pos: [-0.52, -0.52, -0.52] as [number, number, number], rot: [-0.6, -0.8, 0.4] as [number, number, number], s: 1 },
];

/**
 * Procedural Dynamic Magma Bubbles & Viscous Oozing Beads
 */
const DynamicMagmaFX: React.FC = () => {
  const bubbleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const dripRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Harmonic sine boiling bubbles
    LAVA_BUBBLES.forEach((b, i) => {
      const mesh = bubbleRefs.current[i];
      if (mesh) {
        const sineWave = Math.max(0, Math.sin(t * b.speed + b.phase));
        const scaleVal = b.r * Math.pow(sineWave, 2) * 20;
        mesh.scale.setScalar(scaleVal);
      }
    });

    // Viscous dripping magma droplets
    LAVA_DRIPS.forEach((d, i) => {
      const mesh = dripRefs.current[i];
      if (mesh) {
        const dropCycle = (t * d.speed + d.phase) % Math.PI;
        const stretchY = 0.05 + Math.sin(dropCycle) * 0.03;
        mesh.scale.set(0.035, stretchY, 0.035);
        mesh.position.y = d.pos[1] - Math.sin(dropCycle) * 0.035;
      }
    });
  });

  return (
    <group>
      {/* 8 Dynamic Harmonic Boiling Bubbles */}
      {LAVA_BUBBLES.map((b, i) => (
        <mesh
          key={i}
          ref={(el) => { bubbleRefs.current[i] = el; }}
          position={b.pos}
          scale={0}
        >
          <sphereGeometry args={[1, 14, 14]} />
          <meshStandardMaterial
            color="#ffea00"
            emissive="#ff4500"
            emissiveIntensity={2.8}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* 4 Oozing / Dripping Magma Viscous Beads on Lower Beveled Edges */}
      {LAVA_DRIPS.map((d, i) => (
        <mesh
          key={i}
          ref={(el) => { dripRefs.current[i] = el; }}
          position={d.pos}
          scale={[0.035, 0.05, 0.035]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshStandardMaterial
            color="#ea580c"
            emissive="#ff2200"
            emissiveIntensity={2.2}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Procedural Glacial Ice Frostbite Crystalline Shards & Cold Sublimation Vapor
 */
const DynamicCryoFX: React.FC = () => {
  const mistGroupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (mistGroupRef.current) {
      mistGroupRef.current.rotation.y = t * 0.45;
      mistGroupRef.current.position.y = -0.05 + Math.sin(t * 1.8) * 0.02;
    }
  });

  return (
    <group>
      {/* 8 Needle-Like Frostbite Corner Crystals Protruding from Vertices */}
      {FROST_SHARDS.map((s, i) => (
        <mesh
          key={i}
          position={s.pos}
          rotation={s.rot}
          scale={s.s}
          castShadow
        >
          <coneGeometry args={[0.045, 0.24, 5]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            roughness={0.08}
            metalness={0.1}
            transmission={0.88}
            thickness={1.4}
            ior={1.31}
            clearcoat={1.0}
            clearcoatRoughness={0.05}
          />
        </mesh>
      ))}

      {/* Cold Sublimation Vapor Mist Billowing Around Die */}
      <group ref={mistGroupRef}>
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((ang, i) => (
          <mesh
            key={i}
            position={[Math.cos(ang) * 0.58, -0.06, Math.sin(ang) * 0.58]}
            rotation={[-Math.PI / 2, 0, ang]}
          >
            <planeGeometry args={[0.55, 0.55]} />
            <meshBasicMaterial
              color="#e0f2fe"
              transparent
              opacity={0.24}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export const PhysicsDieMesh: React.FC<PhysicsDieMeshProps> = React.memo(
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

        grp.rotation.x = grp.rotation.x % (Math.PI * 2);
        grp.rotation.y = grp.rotation.y % (Math.PI * 2);
        grp.rotation.z = grp.rotation.z % (Math.PI * 2);

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
    }, [isRolling, value, skinId, onSettled]);

    useFrame((state) => {
      if (!isRolling && visualGroupRef.current) {
        const t = state.clock.elapsedTime;
        const targetEuler = FACE_EULER_MAP[value] ?? FACE_EULER_MAP[1];
        visualGroupRef.current.position.y = Math.sin(t * 2.2) * 0.032;
        visualGroupRef.current.rotation.x = targetEuler[0];
        visualGroupRef.current.rotation.y =
          targetEuler[1] + Math.sin(t * 1.4) * 0.04;
        visualGroupRef.current.rotation.z = targetEuler[2];
      }
    });

    const cubeConfig = useMemo(() => {
      return getDiceCubeConfig(skin.shapeType);
    }, [skin.shapeType]);

    return (
      <group>
        {/* Dock Floor Impact FX: Molten Burn Ring or Cryo Spiderweb Freeze Ring */}
        {skinId === 'magma-inferno' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]}>
            <ringGeometry args={[0.42, 0.68, 32]} />
            <meshBasicMaterial color="#ea580c" transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}
        {skinId === 'cryo-glacial' && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.56, 0]}>
            <ringGeometry args={[0.45, 0.72, 32]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} side={THREE.DoubleSide} />
          </mesh>
        )}

        <group ref={visualGroupRef}>
          {/* Custom Shaped Die Body: Physical Refractive Ice for Cryo, Basalt for Magma */}
          <RoundedBox
            args={cubeConfig.args}
            radius={cubeConfig.radius}
            smoothness={cubeConfig.smoothness}
          >
            {skinId === 'cryo-glacial' ? (
              <meshPhysicalMaterial
                color={skin.bodyColor}
                roughness={0.14}
                metalness={0.05}
                transmission={0.92}
                thickness={1.8}
                ior={1.31}
                attenuationColor="#38bdf8"
                attenuationDistance={0.75}
                clearcoat={0.9}
                clearcoatRoughness={0.08}
                transparent
              />
            ) : skinId === 'magma-inferno' ? (
              <meshStandardMaterial
                color={skin.bodyColor}
                metalness={skin.metalness}
                roughness={skin.roughness}
                emissive="#7c2d12"
                emissiveIntensity={0.25}
              />
            ) : (
              <meshStandardMaterial
                color={skin.bodyColor}
                metalness={skin.metalness}
                roughness={skin.roughness}
              />
            )}
          </RoundedBox>

          {/* Dynamic Magma Boiling Bubbles & Oozing Beads */}
          {skinId === 'magma-inferno' && <DynamicMagmaFX />}

          {/* Dynamic Glacial Frostbite Shards & Sublimation Mist */}
          {skinId === 'cryo-glacial' && <DynamicCryoFX />}

          {/* Engraved High-Contrast 3D Pips + Metallic Bevel Rims on all 6 faces */}
          {DICE_FACE_PIPS.map((face, fIdx) => {
            const isAce = face.faceValue === 1;
            const isClassicAce = skinId === 'classic-white' && isAce;
            const pipColor = isClassicAce ? '#dc2626' : skin.pipColor;
            const rimColor = isClassicAce ? '#fbbf24' : pbr.rimColor;
            const pipGeo = getDicePipGeometry(face.faceValue, skinId, skin.pipShape);

            return (
              <group
                key={fIdx}
                position={face.normal}
                rotation={face.rotation}
              >
                {face.pips.map(([px, py], pIdx) => (
                  <group key={pIdx} position={[px, py, 0]}>
                    <mesh
                      geometry={pipGeo}
                      position={[0, 0, 0.003]}
                      rotation={
                        skin.pipShape === 'digital-square'
                          ? [0, 0, 0]
                          : [Math.PI / 2, 0, 0]
                      }
                    >
                      <meshStandardMaterial
                        color={pipColor}
                        roughness={0.2}
                        metalness={0.15}
                        emissive={isClassicAce ? '#7f1d1d' : pbr.pipEmissive}
                        emissiveIntensity={
                          isClassicAce ? 0.35 : Math.min(2.5, pbr.pipEmissiveIntensity)
                        }
                      />
                    </mesh>
                    <mesh
                      geometry={
                        isClassicAce
                          ? SHARED_DICE_GEO.pipAceRim
                          : SHARED_DICE_GEO.pipRim
                      }
                      position={[0, 0, 0.007]}
                    >
                      <meshStandardMaterial
                        color={rimColor}
                        metalness={0.85}
                        roughness={0.15}
                        side={THREE.DoubleSide}
                      />
                    </mesh>
                  </group>
                ))}
              </group>
            );
          })}
        </group>
      </group>
    );
  }
);

PhysicsDieMesh.displayName = 'PhysicsDieMesh';
