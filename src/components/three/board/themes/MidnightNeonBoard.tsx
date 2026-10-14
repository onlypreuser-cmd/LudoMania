import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';
import { YARD_OFFSETS, YARD_PAD_OFFSETS } from '../data/trackTilesBuilder';
import { BOARD_GEO } from '../geometries/boardGeometries';
import { InstancedTrackTiles } from '../common/InstancedTrackTiles';

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
    <group position={[0, -0.05, 0]}>
      {/* 1. Aerospace Carbon-Fiber Sub-Chassis Foundation */}
      <mesh geometry={BOARD_GEO.subChassisBox} position={[0, -0.12, 0]} receiveShadow>
        <meshPhysicalMaterial
          color="#030712"
          roughness={0.35}
          metalness={0.7}
          clearcoat={0.6}
        />
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

      {/* 3. 4 Sub-Level Quantum Magnetic Containment Yards */}
      {(['blue', 'red', 'yellow', 'green'] as PlayerColor[]).map((col) => {
        const yardPos = YARD_OFFSETS[col];
        const pal = COLOR_PALETTE[col];
        return (
          <group key={col} position={[yardPos.x, 0, yardPos.z]}>
            {/* Sunken Magnetic Bay Floor */}
            <mesh geometry={BOARD_GEO.yardBasinBox} position={[0, -0.08, 0]} receiveShadow>
              <meshPhysicalMaterial
                color="#030712"
                roughness={0.32}
                metalness={0.85}
              />
            </mesh>
            {/* Glowing Hexagonal Forcefield Ring */}
            <mesh
              geometry={BOARD_GEO.unitTorus}
              position={[0, 0.02, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[2.7, 2.7, 0.6]}
            >
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={1.8}
              />
            </mesh>
            {/* 4 Glowing Hexagonal Induction Pads */}
            {YARD_PAD_OFFSETS.map(([px, pz], pIdx) => (
              <group key={pIdx} position={[px, -0.01, pz]}>
                <mesh geometry={BOARD_GEO.yardPadCylinder}>
                  <meshPhysicalMaterial
                    color="#090d16"
                    metalness={0.85}
                    roughness={0.2}
                    clearcoat={1}
                  />
                </mesh>
                <mesh
                  geometry={BOARD_GEO.thinTorus}
                  position={[0, 0.035, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.72}
                >
                  <meshStandardMaterial
                    color={pal.primary}
                    emissive={pal.primary}
                    emissiveIntensity={2.5}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* 4. Suspended Obsidian Smoked Glass Track Tiles Over Laser Trenches (GPU Instanced) */}
      <InstancedTrackTiles
        standardColor="#090d16"
        baseRoughness={0.12}
        baseClearcoat={1.0}
        baseMetalness={0.85}
        safeStarColor="#22d3ee"
        startEmblemColor="#06b6d4"
      />

      {/* 5. Center 3x3 Home Goal: Levitating 3D Quantum Singularity Reactor Core */}
      <group position={[0, 0, 0]}>
        {/* Sub-Level Magnetic Reactor Basin */}
        <mesh
          geometry={BOARD_GEO.unitCylinder}
          position={[0, 0.02, 0]}
          scale={[1.45, 0.08, 1.45]}
          receiveShadow
        >
          <meshPhysicalMaterial color="#030712" metalness={0.9} roughness={0.18} />
        </mesh>
        {/* Outer Cyan Forcefield Containment Ring */}
        <mesh
          geometry={BOARD_GEO.unitTorus}
          position={[0, 0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.38, 1.38, 0.6]}
        >
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2.2} />
        </mesh>

        {/* Dual Counter-Rotating Gyroscopic Magnetic Rings */}
        <group ref={reactorRing1Ref} position={[0, 0.28, 0]}>
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
        <group ref={reactorRing2Ref} position={[0, 0.28, 0]}>
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
        <mesh ref={plasmaCoreRef} geometry={BOARD_GEO.unitSphere} position={[0, 0.28, 0]}>
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
