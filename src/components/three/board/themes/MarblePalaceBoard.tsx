import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { BOARD_GEO } from '../geometries/boardGeometries';

export const MarblePalaceBoard: React.FC = () => {
  const crystalJewelRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (crystalJewelRef.current) {
      crystalJewelRef.current.rotation.y += delta * 0.55;
      crystalJewelRef.current.position.y = 0.45 + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Transparent Shadow Floor: Catches token & column shadows with 0% milky/white washout */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[15.2, 15.2]} />
        <shadowMaterial opacity={0.24} />
      </mesh>

      {/* 2. Honed Marble Perimeter Rails with Rose-Gold Inlay Trim */}
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, -7.55]} receiveShadow>
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} clearcoat={1} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, 7.55]} receiveShadow>
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} clearcoat={1} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[-7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} clearcoat={1} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#ffffff" roughness={0.24} clearcoat={1} />
      </mesh>

      {/* 3. 4 Fluted Roman Corinthian Corner Columns Supporting Rose-Gold Plinths */}
      {[
        [-7.42, -7.42],
        [7.42, -7.42],
        [-7.42, 7.42],
        [7.42, 7.42],
      ].map(([cx, cz], cIdx) => (
        <group key={cIdx} position={[cx, 0.12, cz]}>
          <mesh geometry={BOARD_GEO.flutedColumn} position={[0, 0.18, 0]}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.3} clearcoat={0.8} />
          </mesh>
          <mesh geometry={BOARD_GEO.corinthianCap} position={[0, 0.62, 0]}>
            <meshPhysicalMaterial
              color="#fda4af"
              metalness={0.85}
              roughness={0.16}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}

      {/* 4. Center 3x3 Home Goal: Floating Faceted Diamond Monument with Rose-Gold Ring */}
      <group position={[0, 0, 0]}>
        {/* Floating, Slowly Spinning Crystal Diamond hovering gracefully above Home Goal triangles */}
        <group ref={crystalJewelRef} position={[0, 0.45, 0]}>
          {/* Top Diamond Cone */}
          <mesh geometry={BOARD_GEO.unitCone} position={[0, 0.12, 0]} scale={[0.34, 0.24, 0.34]}>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.02}
              clearcoat={1}
              ior={2.4}
              metalness={0.08}
            />
          </mesh>
          {/* Inverted Bottom Diamond Cone */}
          <mesh
            geometry={BOARD_GEO.unitCone}
            position={[0, -0.12, 0]}
            rotation={[Math.PI, 0, 0]}
            scale={[0.34, 0.32, 0.34]}
          >
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.02}
              clearcoat={1}
              ior={2.4}
              metalness={0.08}
            />
          </mesh>
          {/* Rose-Gold Girdle Ring Around Diamond */}
          <mesh
            geometry={BOARD_GEO.thinTorus}
            scale={[0.35, 0.35, 0.5]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshPhysicalMaterial
              color="#f43f5e"
              metalness={0.92}
              roughness={0.1}
              clearcoat={1}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
};
