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
    }, [isRolling, value, skinId, onSettled]);

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
      return getDiceCubeConfig(skin.shapeType);
    }, [skin.shapeType]);

    return (
      <group ref={visualGroupRef}>
        {/* Sculpted High-Tessellation Custom Shaped Cube Body */}
        <RoundedBox
          args={cubeConfig.args}
          radius={cubeConfig.radius}
          smoothness={cubeConfig.smoothness}
        >
          <meshStandardMaterial
            color={skin.bodyColor}
            metalness={skin.metalness}
            roughness={skin.roughness}
          />
        </RoundedBox>

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
                  {/* High-Contrast Visible 3D Pip */}
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
                        isClassicAce ? 0.35 : Math.min(1.0, pbr.pipEmissiveIntensity)
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
    );
  }
);

PhysicsDieMesh.displayName = 'PhysicsDieMesh';
