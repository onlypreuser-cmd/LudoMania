import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';
import { ALL_TRACK_TILES, YARD_OFFSETS, YARD_PAD_OFFSETS } from '../data/trackTilesBuilder';
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
    <group position={[0, -0.05, 0]}>
      {/* 1. Heavy Burma Teak Solid Sub-Chassis with French Polish Finish */}
      <mesh geometry={BOARD_GEO.subChassisBox} position={[0, -0.12, 0]} receiveShadow>
        <meshPhysicalMaterial
          color="#451a03"
          roughness={0.42}
          metalness={0.05}
          clearcoat={0.85}
          clearcoatRoughness={0.12}
        />
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

      {/* 3. 4 Sunken Circular Turned Teakwood Bowls Lined with Velvet */}
      {(['blue', 'red', 'yellow', 'green'] as PlayerColor[]).map((col) => {
        const yardPos = YARD_OFFSETS[col];
        return (
          <group key={col} position={[yardPos.x, 0, yardPos.z]}>
            {/* Sunken Circular Timber Basin */}
            <mesh
              geometry={BOARD_GEO.unitCylinder}
              position={[0, -0.06, 0]}
              scale={[2.7, 0.16, 2.7]}
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#451a03"
                roughness={0.45}
                clearcoat={0.8}
              />
            </mesh>
            {/* Crimson Baize Velvet Inner Floor */}
            <mesh
              geometry={BOARD_GEO.unitCylinder}
              position={[0, -0.05, 0]}
              scale={[2.45, 0.04, 2.45]}
            >
              <meshPhysicalMaterial
                color="#7f1d1d"
                roughness={0.85}
                sheen={0.8}
                sheenColor="#fca5a5"
              />
            </mesh>
            {/* Polished Routered Brass Ring Framing Yard */}
            <mesh
              geometry={BOARD_GEO.unitTorus}
              position={[0, 0.02, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[2.55, 2.55, 0.8]}
            >
              <meshPhysicalMaterial
                color="#d97706"
                metalness={0.92}
                roughness={0.14}
                clearcoat={1}
              />
            </mesh>
            {/* 4 Inlaid Turned Brass Token Pads with Upholstery Studs */}
            {YARD_PAD_OFFSETS.map(([px, pz], pIdx) => (
              <group key={pIdx} position={[px, -0.01, pz]}>
                <mesh geometry={BOARD_GEO.yardPadCylinder}>
                  <meshPhysicalMaterial
                    color="#b45309"
                    metalness={0.88}
                    roughness={0.18}
                    clearcoat={1}
                  />
                </mesh>
                <mesh
                  geometry={BOARD_GEO.thinTorus}
                  position={[0, 0.032, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.68}
                >
                  <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.1} />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* 4. Alternating Blonde Maple & Smoked Walnut Parquet Track Tiles */}
      {ALL_TRACK_TILES.map((tile) => {
        const isSafe = tile.type === 'safe';
        const isStart = tile.type === 'start';
        const isHomeStretch = tile.type === 'home-stretch';
        // Alternating parquet checker pattern
        const isEven = (tile.row + tile.col) % 2 === 0;
        const woodColor = isEven ? '#fef3c7' : '#92400e';
        const tileColor = isHomeStretch || isStart
          ? (tile.color ? COLOR_PALETTE[tile.color].threeHex : woodColor)
          : woodColor;

        return (
          <group key={tile.key} position={[tile.x, 0, tile.z]}>
            <mesh geometry={BOARD_GEO.tileChamfer} position={[0, -0.01, 0]} receiveShadow>
              <meshPhysicalMaterial
                color={tileColor}
                roughness={0.45}
                clearcoat={0.8}
                clearcoatRoughness={0.1}
                metalness={isHomeStretch ? 0.08 : 0.02}
              />
            </mesh>

            {/* Inlaid Routered Brass Wire Channel Lines */}
            <mesh
              geometry={BOARD_GEO.thinTorus}
              position={[0, 0.042, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.44}
            >
              <meshStandardMaterial color="#f59e0b" metalness={0.92} roughness={0.15} />
            </mesh>

            {/* 8-Point Mother-of-Pearl & Brass Nautical Compass Star for Safe Squares */}
            {isSafe && (
              <mesh
                geometry={BOARD_GEO.star8Point}
                position={[0, 0.048, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshPhysicalMaterial
                  color="#fef08a"
                  metalness={0.92}
                  roughness={0.1}
                  clearcoat={1}
                />
              </mesh>
            )}

            {isStart && (
              <mesh
                geometry={BOARD_GEO.star5Point}
                position={[0, 0.048, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.95}
                  roughness={0.08}
                  clearcoat={1}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 5. Center 3x3 Home Goal: Multi-Ring 3D Antique Brass Nautical Astrolabe */}
      <group position={[0, 0, 0]}>
        {/* Sunken Exotic Wood Marquetry Compass Base */}
        <mesh
          geometry={BOARD_GEO.unitCylinder}
          position={[0, 0.02, 0]}
          scale={[1.45, 0.08, 1.45]}
          receiveShadow
        >
          <meshPhysicalMaterial color="#291002" roughness={0.4} clearcoat={0.9} />
        </mesh>
        {/* Outer Stamped Brass Azimuth Rim */}
        <mesh
          geometry={BOARD_GEO.unitTorus}
          position={[0, 0.065, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.38, 1.38, 0.7]}
        >
          <meshPhysicalMaterial color="#d97706" metalness={0.94} roughness={0.12} clearcoat={1} />
        </mesh>

        {/* 3 Concentric Rotating Brass Astrolabe Rings */}
        <group ref={astrolabeRing1Ref} position={[0, 0.22, 0]}>
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
        <group ref={astrolabeRing2Ref} position={[0, 0.22, 0]}>
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
        <group ref={astrolabeRing3Ref} position={[0, 0.22, 0]}>
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

        {/* Central Faceted Amber Glass Finial Sphere */}
        <mesh geometry={BOARD_GEO.unitSphere} position={[0, 0.22, 0]} scale={0.17}>
          <meshPhysicalMaterial
            color="#d97706"
            roughness={0.02}
            clearcoat={1}
            ior={1.65}
            transmission={0.45}
          />
        </mesh>
      </group>
    </group>
  );
};
