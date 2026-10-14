import { RoundedBox } from '@react-three/drei';
import gsap from 'gsap';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { soundManager } from '../../../../audio/soundManager';
import { DICE_SKINS } from '../../../../engine/boardConfig';
import { DiceSkinId } from '../../../../types/game';
import {
  DICE_FACE_PIPS,
  FACE_EULER_MAP,
  SHARED_DICE_GEO,
  SKIN_PBR_MAP,
  getDiceCubeConfig,
  getDicePipGeometry,
} from '../../../three/Dice3DPod';

/**
 * 3D Studio Die Mesh rendered inside the Skin Picker Modal.
 * Wrapped in an inner group so GSAP roll jumps and squash-and-stretch operate
 * independently of the outer 360 turntable orbit.
 */
export const StudioDie3DMesh: React.FC<{
  skinId: DiceSkinId;
  value: number;
  isRolling: boolean;
}> = React.memo(({ skinId, value, isRolling }) => {
  const dieInnerRef = useRef<THREE.Group>(null);
  const skin = useMemo(
    () => DICE_SKINS.find((s) => s.id === skinId) ?? DICE_SKINS[0],
    [skinId]
  );
  const pbr = SKIN_PBR_MAP[skinId] ?? SKIN_PBR_MAP['classic-white'];
  const cubeConfig = useMemo(() => getDiceCubeConfig(skin.shapeType), [skin.shapeType]);

  useEffect(() => {
    if (!dieInnerRef.current) return;
    const grp = dieInnerRef.current;
    gsap.killTweensOf(grp.position);
    gsap.killTweensOf(grp.rotation);
    gsap.killTweensOf(grp.scale);

    const targetEuler = FACE_EULER_MAP[value] ?? FACE_EULER_MAP[1];

    if (isRolling) {
      soundManager.play('dice_roll');
      const tl = gsap.timeline();
      tl.to(
        grp.rotation,
        {
          x: targetEuler[0] + Math.PI * 4,
          y: targetEuler[1] + Math.PI * 4,
          z: targetEuler[2] + Math.PI * 2,
          duration: 0.65,
          ease: 'power2.out',
        },
        0
      )
        .to(grp.position, { y: 0.75, duration: 0.22, ease: 'sine.out' }, 0)
        .to(grp.position, { y: 0.16, duration: 0.25, ease: 'bounce.out' }, 0.22)
        .to(
          grp.scale,
          { x: 1.15, y: 0.85, z: 1.15, duration: 0.08, ease: 'power2.out' },
          0.44
        )
        .to(
          grp.scale,
          { x: 1, y: 1, z: 1, duration: 0.15, ease: 'back.out(2)' },
          0.52
        );
    } else {
      grp.position.set(0, 0.16, 0);
      grp.rotation.set(targetEuler[0], targetEuler[1], targetEuler[2]);
      grp.scale.set(1, 1, 1);
    }
  }, [isRolling, value]);

  return (
    <group ref={dieInnerRef} position={[0, 0.16, 0]}>
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

      {DICE_FACE_PIPS.map((face, fIdx) => {
        const isAce = face.faceValue === 1;
        const isClassicAce = skinId === 'classic-white' && isAce;
        const pipColor = isClassicAce ? '#dc2626' : skin.pipColor;
        const rimColor = isClassicAce ? '#fbbf24' : pbr.rimColor;
        const pipGeo = getDicePipGeometry(face.faceValue, skinId, skin.pipShape);

        return (
          <group key={fIdx} position={face.normal} rotation={face.rotation}>
            {face.pips.map(([px, py], pIdx) => (
              <group key={pIdx} position={[px, py, 0]}>
                {/* 3D Prominent Visible Pip with Depth */}
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
                {/* Metallic Bevel Rim Around Pip */}
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
});

StudioDie3DMesh.displayName = 'StudioDie3DMesh';
