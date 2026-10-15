import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';
import { YARD_OFFSETS } from '../data/trackTilesBuilder';
import { BOARD_GEO } from '../geometries/boardGeometries';

export const ClassicKingdomBoard: React.FC = () => {
  const crownRef = useRef<THREE.Group>(null);
  const bannerGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (crownRef.current) {
      crownRef.current.rotation.y += delta * 0.42;
    }
    if (bannerGroupRef.current) {
      const t = state.clock.getElapsedTime();
      bannerGroupRef.current.children.forEach((child, idx) => {
        child.rotation.z = Math.sin(t * 2.8 + idx * 1.5) * 0.08;
      });
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* 1. Transparent Shadow Receiver Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[15.2, 15.2]} />
        <shadowMaterial opacity={0.24} />
      </mesh>

      {/* 2. Heavy Oak Frame Perimeter Rails */}
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, -7.55]} receiveShadow>
        <meshPhysicalMaterial color="#451a03" roughness={0.58} clearcoat={0.35} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailH} position={[0, 0.06, 7.55]} receiveShadow>
        <meshPhysicalMaterial color="#451a03" roughness={0.58} clearcoat={0.35} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[-7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#451a03" roughness={0.58} clearcoat={0.35} />
      </mesh>
      <mesh geometry={BOARD_GEO.outerRailV} position={[7.55, 0.06, 0]} receiveShadow>
        <meshPhysicalMaterial color="#451a03" roughness={0.58} clearcoat={0.35} />
      </mesh>

      {/* 3. 4 Stamped Burma Brass Corner Bracket Plates & Rivets */}
      {[
        [-7.45, -7.45],
        [7.45, -7.45],
        [-7.45, 7.45],
        [7.45, 7.45],
      ].map(([cx, cz], cIdx) => (
        <group key={cIdx} position={[cx, 0.12, cz]}>
          <mesh geometry={BOARD_GEO.cornerPlinth}>
            <meshPhysicalMaterial
              color="#fbbf24"
              metalness={0.88}
              roughness={0.16}
              clearcoat={1}
            />
          </mesh>
          {/* Embossed Corner Rivet Stud */}
          <mesh
            geometry={BOARD_GEO.lowSphere}
            position={[0, 0.25, 0]}
            scale={[0.16, 0.12, 0.16]}
          >
            <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.15} />
          </mesh>
        </group>
      ))}

      {/* 4. Waving Heraldic Silk Pennants on 4 Yard Outer Corners */}
      <group ref={bannerGroupRef}>
        {(['blue', 'red', 'yellow', 'green'] as PlayerColor[]).map((col) => {
          const yardPos = YARD_OFFSETS[col];
          const pal = COLOR_PALETTE[col];
          return (
            <group key={`banner-${col}`} position={[yardPos.x + 2.5, 0, yardPos.z + 2.5]}>
              {/* Wooden Banner Pole */}
              <mesh
                geometry={BOARD_GEO.unitCylinder}
                position={[0, 0.7, 0]}
                scale={[0.04, 1.4, 0.04]}
              >
                <meshStandardMaterial color="#78350f" roughness={0.6} />
              </mesh>
              {/* Golden Spearhead Finial */}
              <mesh
                geometry={BOARD_GEO.unitCone}
                position={[0, 1.48, 0]}
                scale={[0.08, 0.16, 0.08]}
              >
                <meshStandardMaterial color="#fde047" metalness={0.9} roughness={0.15} />
              </mesh>
              {/* Flowing Pennant Cloth */}
              <mesh position={[0.28, 1.25, 0]}>
                <boxGeometry args={[0.5, 0.28, 0.015]} />
                <meshPhysicalMaterial
                  color={pal.threeHex}
                  roughness={0.65}
                  sheen={0.85}
                  sheenColor="#ffffff"
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* 5. Center 3x3 Home Goal: Grand 3D Royal Tournament Crown (Rotating Monument Hovering Above Home Triangles) */}
      <group position={[0, 0, 0]}>
        <group ref={crownRef} position={[0, 0.45, 0]}>
          {/* Gold Coronet Base Ring */}
          <mesh
            geometry={BOARD_GEO.unitTorus}
            scale={[0.42, 0.42, 0.65]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <meshPhysicalMaterial
              color="#fbbf24"
              metalness={0.95}
              roughness={0.08}
              clearcoat={1}
            />
          </mesh>
          {/* 6 Crown Points / Spikes */}
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const angle = (idx * Math.PI) / 3;
            return (
              <group
                key={idx}
                position={[Math.cos(angle) * 0.38, 0.14, Math.sin(angle) * 0.38]}
                rotation={[0, -angle, 0.14]}
              >
                <mesh geometry={BOARD_GEO.unitCone} scale={[0.075, 0.28, 0.075]}>
                  <meshPhysicalMaterial
                    color="#fde047"
                    metalness={0.94}
                    roughness={0.08}
                    clearcoat={1}
                  />
                </mesh>
                {/* Pearl/Gem at Spire Tip */}
                <mesh geometry={BOARD_GEO.lowSphere} position={[0, 0.16, 0]} scale={0.048}>
                  <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.04}
                    metalness={0.1}
                    clearcoat={1}
                  />
                </mesh>
              </group>
            );
          })}
          {/* 4 Royal Gem Cabochons (Ruby, Sapphire, Emerald, Topaz) on Crown Ring */}
          {[
            { c: '#dc2626', a: 0 },
            { c: '#2563eb', a: Math.PI / 2 },
            { c: '#16a34a', a: Math.PI },
            { c: '#eab308', a: (3 * Math.PI) / 2 },
          ].map((gem, gIdx) => (
            <mesh
              key={gIdx}
              geometry={BOARD_GEO.lowSphere}
              position={[Math.cos(gem.a) * 0.43, 0, Math.sin(gem.a) * 0.43]}
              scale={[0.058, 0.058, 0.038]}
            >
              <meshPhysicalMaterial
                color={gem.c}
                roughness={0.02}
                clearcoat={1}
                ior={1.65}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
};
