import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';
import { ALL_TRACK_TILES, YARD_OFFSETS, YARD_PAD_OFFSETS } from '../data/trackTilesBuilder';
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
    <group position={[0, -0.05, 0]}>
      {/* 1. Heavy English Oak Sub-Chassis Foundation */}
      <mesh geometry={BOARD_GEO.subChassisBox} position={[0, -0.12, 0]} receiveShadow>
        <meshPhysicalMaterial
          color="#381c0d"
          roughness={0.65}
          metalness={0.06}
          clearcoat={0.3}
        />
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

      {/* 4. 4 Sunken Stone Castle Yards with Crenelations & Banners */}
      {(['blue', 'red', 'yellow', 'green'] as PlayerColor[]).map((col) => {
        const yardPos = YARD_OFFSETS[col];
        const pal = COLOR_PALETTE[col];
        return (
          <group key={col} position={[yardPos.x, 0, yardPos.z]}>
            {/* Sunken Stone Basin Floor */}
            <mesh geometry={BOARD_GEO.yardBasinBox} position={[0, -0.07, 0]} receiveShadow>
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.75}
                metalness={0.04}
              />
            </mesh>
            {/* Stone Wall Trim Around Yard */}
            <mesh
              geometry={BOARD_GEO.unitTorus}
              position={[0, 0.02, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[2.75, 2.75, 0.8]}
            >
              <meshPhysicalMaterial color="#cbd5e1" roughness={0.7} />
            </mesh>
            {/* 4 Player Token Resting Pads */}
            {YARD_PAD_OFFSETS.map(([px, pz], pIdx) => (
              <group key={pIdx} position={[px, -0.01, pz]}>
                <mesh geometry={BOARD_GEO.yardPadCylinder}>
                  <meshPhysicalMaterial
                    color={pal.threeHex}
                    roughness={0.25}
                    clearcoat={0.8}
                    ior={1.5}
                  />
                </mesh>
                {/* Gold Inlay Ring on Pad Rim */}
                <mesh
                  geometry={BOARD_GEO.thinTorus}
                  position={[0, 0.035, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.72}
                >
                  <meshStandardMaterial
                    color="#fde047"
                    metalness={0.88}
                    roughness={0.15}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* Waving Heraldic Silk Pennants on 4 Yards */}
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

      {/* 5. 72 Light Oak Parquet Track Tiles */}
      {ALL_TRACK_TILES.map((tile) => {
        const isSafe = tile.type === 'safe';
        const isStart = tile.type === 'start';
        const isHomeStretch = tile.type === 'home-stretch';
        const colorHex = tile.color ? COLOR_PALETTE[tile.color].threeHex : '#fffdfa';

        return (
          <group key={tile.key} position={[tile.x, 0, tile.z]}>
            {/* Base Parquet Chamfer Tile */}
            <mesh geometry={BOARD_GEO.tileChamfer} position={[0, -0.01, 0]} receiveShadow>
              <meshPhysicalMaterial
                color={isHomeStretch || isStart ? colorHex : '#fffdfa'}
                roughness={isHomeStretch || isStart ? 0.32 : 0.62}
                clearcoat={isHomeStretch || isStart ? 0.75 : 0.25}
                metalness={isHomeStretch ? 0.1 : 0.02}
              />
            </mesh>

            {/* Recessed Star Medallion for Safe Squares */}
            {isSafe && (
              <mesh
                geometry={BOARD_GEO.star8Point}
                position={[0, 0.045, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.92}
                  roughness={0.12}
                  clearcoat={1}
                />
              </mesh>
            )}

            {/* Start Tile Embossed Royal Shield Crest */}
            {isStart && (
              <mesh
                geometry={BOARD_GEO.star5Point}
                position={[0, 0.045, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  metalness={0.2}
                  roughness={0.15}
                  clearcoat={1}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 6. Center 3x3 Home Goal: 3-Tiered Golden Dais & Rotating Royal Crown */}
      <group position={[0, 0, 0]}>
        {/* Tier 1 Dais Podium */}
        <mesh geometry={BOARD_GEO.daisTier1} position={[0, 0.03, 0]} receiveShadow>
          <meshPhysicalMaterial color="#eab308" metalness={0.88} roughness={0.2} clearcoat={1} />
        </mesh>
        {/* Tier 2 Dais Podium */}
        <mesh geometry={BOARD_GEO.daisTier2} position={[0, 0.12, 0]} receiveShadow>
          <meshPhysicalMaterial color="#d97706" metalness={0.92} roughness={0.15} clearcoat={1} />
        </mesh>
        {/* Tier 3 Dais Podium (Red Velvet Inlay Top) */}
        <mesh geometry={BOARD_GEO.daisTier3} position={[0, 0.21, 0]}>
          <meshPhysicalMaterial
            color="#881337"
            roughness={0.8}
            sheen={0.85}
            sheenColor="#fda4af"
          />
        </mesh>

        {/* Grand 3D Royal Tournament Crown (Rotating Monument) */}
        <group ref={crownRef} position={[0, 0.35, 0]}>
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
