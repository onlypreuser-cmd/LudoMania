import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { MAIN_TRACK_COORDS } from '../../../engine/boardConfig';
import { gridToWorld3D } from '../../../engine/coordinates/pathMath';
import { POWER_GEO } from './powerGeometries';

export interface HyperWarpPad3DProps {
  tileIndex: number;
}

/**
 * Hyper Warp Pad 3D - Floating Hexagonal Kinetic Pad.
 * Displays pulsating holographic forward chevrons (>>>) indicating a speed surge pad.
 * Mystery Mechanic: No static number printed—reveals kinetic leap only upon landing!
 */
export const HyperWarpPad3D: React.FC<HyperWarpPad3DProps> = React.memo(({ tileIndex }) => {
  const coord = MAIN_TRACK_COORDS[tileIndex];
  const worldPos = coord ? gridToWorld3D(coord) : { x: 0, y: 0, z: 0 };

  const chevronsGroupRef = useRef<THREE.Group>(null);
  const glowRingRef = useRef<THREE.Mesh>(null);
  const chevronRefs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Floating micro-hover
    if (chevronsGroupRef.current) {
      chevronsGroupRef.current.position.y = 0.045 + Math.sin(t * 3.2) * 0.008;
    }

    // Outer glow pulse
    if (glowRingRef.current) {
      const mat = glowRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = 0.55 + Math.sin(t * 4.0) * 0.25;
      }
    }

    // Sequential forward wave for the 3 chevrons
    chevronRefs.forEach((ref, idx) => {
      if (ref.current) {
        const phase = t * 4.5 - idx * 1.0;
        const forwardOffset = (phase % 3.0) * 0.06 - 0.06;
        ref.current.position.z = forwardOffset;
        const mat = ref.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.35 + Math.max(0, Math.sin(phase)) * 0.65;
        }
      }
    });
  });

  return (
    <group position={[worldPos.x, 0.012, worldPos.z]}>
      {/* 1. Ground Contact Shadow Disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.39, 24]} />
        <meshBasicMaterial color="#020617" opacity={0.4} transparent />
      </mesh>

      {/* 2. Floating Hexagonal Kinetic Base Pad */}
      <mesh
        geometry={POWER_GEO.hexPad}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        scale={[0.9, 0.9, 0.9]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.24}
          metalness={0.88}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* 3. Glowing Neon Cyan Hex Rim */}
      <mesh
        ref={glowRingRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.038, 0]}
      >
        <ringGeometry args={[0.31, 0.35, 6]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Three Floating Holographic Chevrons (>>> Kinetic Wave) */}
      <group ref={chevronsGroupRef} position={[0, 0.045, 0]}>
        {[-0.09, 0, 0.09].map((offsetZ, cIdx) => (
          <mesh
            key={cIdx}
            ref={chevronRefs[cIdx]}
            geometry={POWER_GEO.chevronArrow}
            position={[0, 0, offsetZ]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={0.9}
          >
            <meshBasicMaterial
              color="#38bdf8"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
});

HyperWarpPad3D.displayName = 'HyperWarpPad3D';
