import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { BOARD_GEO } from '../geometries/boardGeometries';

export const MidnightNeonBoard: React.FC = () => {
  const reactorRing1Ref = useRef<THREE.Group>(null);
  const reactorRing2Ref = useRef<THREE.Group>(null);
  const plasmaCoreRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (reactorRing1Ref.current) {
      reactorRing1Ref.current.rotation.y += delta * 1.6;
    }
    if (reactorRing2Ref.current) {
      reactorRing2Ref.current.rotation.x -= delta * 1.3;
    }
    if (plasmaCoreRef.current) {
      const pulse = 1 + Math.sin(state.clock.getElapsedTime() * 5) * 0.08;
      plasmaCoreRef.current.scale.set(0.19 * pulse, 0.19 * pulse, 0.19 * pulse);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Transparent Shadow Receiver Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[15.2, 15.2]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      {/* 2. Carbon-Fiber Rails with Illuminated Coolant Conduits */}
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, -7.55]} receiveShadow>
        <meshPhysicalMaterial color="#0b0f19" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, 7.55]} receiveShadow>
        <meshPhysicalMaterial color="#0b0f19" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[-7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#0b0f19" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#0b0f19" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Cyan & Magenta Neon Perimeter Glow Tubes */}
      <mesh
        geometry={BOARD_GEO.trackDividerH}
        position={[0, 0.14, -7.42]}
      >
        <meshBasicMaterial color="#22d3ee" />
      </mesh>
      <mesh
        geometry={BOARD_GEO.trackDividerH}
        position={[0, 0.14, 7.42]}
      >
        <meshBasicMaterial color="#ec4899" />
      </mesh>

      {/* 3. Center 3x3 Home Goal: Levitating 3D Quantum Singularity Reactor Core (Hovering Above Home Triangles) */}
      <group position={[0, 0, 0]}>
        {/* Dual Counter-Rotating Gyroscopic Magnetic Rings hovering above Home Goal */}
        <group ref={reactorRing1Ref} position={[0, 0.45, 0]}>
          <mesh
            geometry={BOARD_GEO.unitTorus}
            scale={[0.78, 0.78, 0.6]}
            rotation={[Math.PI / 3, 0, 0]}
          >
            <meshPhysicalMaterial
              color="#38bdf8"
              metalness={0.92}
              roughness={0.12}
              clearcoat={1}
            />
          </mesh>
        </group>
        <group ref={reactorRing2Ref} position={[0, 0.45, 0]}>
          <mesh
            geometry={BOARD_GEO.unitTorus}
            scale={[0.55, 0.55, 0.5]}
            rotation={[0, Math.PI / 4, 0]}
          >
            <meshPhysicalMaterial
              color="#ec4899"
              metalness={0.92}
              roughness={0.12}
              clearcoat={1}
            />
          </mesh>
        </group>

        {/* Levitating Pulsating Plasma Singularity Core */}
        <mesh ref={plasmaCoreRef} geometry={BOARD_GEO.unitSphere} position={[0, 0.45, 0]}>
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={4.5}
            roughness={0.0}
          />
        </mesh>
      </group>
    </group>
  );
};
