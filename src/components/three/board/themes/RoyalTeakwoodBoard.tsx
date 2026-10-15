import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { BOARD_GEO } from '../geometries/boardGeometries';

export const RoyalTeakwoodBoard: React.FC = () => {
  const astrolabeRing1Ref = useRef<THREE.Group>(null);
  const astrolabeRing2Ref = useRef<THREE.Group>(null);
  const astrolabeRing3Ref = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (astrolabeRing1Ref.current) {
      astrolabeRing1Ref.current.rotation.y += delta * 0.38;
    }
    if (astrolabeRing2Ref.current) {
      astrolabeRing2Ref.current.rotation.x += delta * 0.28;
    }
    if (astrolabeRing3Ref.current) {
      astrolabeRing3Ref.current.rotation.z += delta * 0.45;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Transparent Shadow Receiver Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[15.2, 15.2]} />
        <shadowMaterial opacity={0.24} />
      </mesh>

      {/* 2. Beveled Bullnose Carved Teak Rails */}
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, -7.55]} receiveShadow>
        <meshPhysicalMaterial color="#78350f" roughness={0.38} clearcoat={0.9} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, 7.55]} receiveShadow>
        <meshPhysicalMaterial color="#78350f" roughness={0.38} clearcoat={0.9} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[-7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#78350f" roughness={0.38} clearcoat={0.9} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#78350f" roughness={0.38} clearcoat={0.9} />
      </mesh>

      {/* 3. Center 3x3 Home Goal: Multi-Ring 3D Antique Brass Nautical Astrolabe (Hovering Above Home Triangles) */}
      <group position={[0, 0, 0]}>
        {/* 3 Concentric Rotating Brass Astrolabe Rings hovering above Home Goal */}
        <group ref={astrolabeRing1Ref} position={[0, 0.45, 0]}>
          <mesh
            geometry={BOARD_GEO.unitTorus}
            scale={[0.85, 0.85, 0.6]}
            rotation={[Math.PI / 3, 0, 0]}
          >
            <meshPhysicalMaterial
              color="#fbbf24"
              metalness={0.94}
              roughness={0.1}
              clearcoat={1}
            />
          </mesh>
        </group>
        <group ref={astrolabeRing2Ref} position={[0, 0.45, 0]}>
          <mesh
            geometry={BOARD_GEO.unitTorus}
            scale={[0.62, 0.62, 0.5]}
            rotation={[0, Math.PI / 4, 0]}
          >
            <meshPhysicalMaterial
              color="#f59e0b"
              metalness={0.92}
              roughness={0.14}
              clearcoat={1}
            />
          </mesh>
        </group>
        <group ref={astrolabeRing3Ref} position={[0, 0.45, 0]}>
          <mesh
            geometry={BOARD_GEO.unitTorus}
            scale={[0.42, 0.42, 0.4]}
            rotation={[Math.PI / 4, 0, Math.PI / 4]}
          >
            <meshPhysicalMaterial
              color="#d97706"
              metalness={0.94}
              roughness={0.12}
              clearcoat={1}
            />
          </mesh>
        </group>

        {/* Central Faceted Amber Sphere */}
        <mesh geometry={BOARD_GEO.unitSphere} position={[0, 0.45, 0]} scale={0.17}>
          <meshPhysicalMaterial
            color="#d97706"
            roughness={0.02}
            clearcoat={1}
            ior={1.65}
            metalness={0.15}
          />
        </mesh>
      </group>
    </group>
  );
};
