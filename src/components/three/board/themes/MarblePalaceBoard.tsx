import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';
import { ALL_TRACK_TILES, YARD_OFFSETS, YARD_PAD_OFFSETS } from '../data/trackTilesBuilder';
import { BOARD_GEO } from '../geometries/boardGeometries';

export const MarblePalaceBoard: React.FC = () => {
  const crystalJewelRef = useRef<THREE.Group>(null);
  const waterPlaneRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (crystalJewelRef.current) {
      crystalJewelRef.current.rotation.y += delta * 0.55;
      crystalJewelRef.current.position.y = 0.38 + Math.sin(state.clock.getElapsedTime() * 2) * 0.04;
    }
  });

  return (
    <group position={[0, -0.05, 0]}>
      {/* 1. Solid Italian Carrara White Marble Sub-Chassis */}
      <mesh geometry={BOARD_GEO.subChassisBox} position={[0, -0.12, 0]} receiveShadow>
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.28}
          metalness={0.04}
          clearcoat={0.95}
          ior={1.54}
        />
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

      {/* 4. 4 Sunken Roman Bath Pools (Impluvium) with Translucent Water */}
      {(['blue', 'red', 'yellow', 'green'] as PlayerColor[]).map((col) => {
        const yardPos = YARD_OFFSETS[col];
        return (
          <group key={col} position={[yardPos.x, 0, yardPos.z]}>
            {/* Sunken Lapis Lazuli Basin Floor */}
            <mesh geometry={BOARD_GEO.yardBasinBox} position={[0, -0.08, 0]} receiveShadow>
              <meshPhysicalMaterial
                color="#0284c7"
                roughness={0.22}
                clearcoat={1}
              />
            </mesh>
            {/* Translucent Reflective Turquoise Water Surface */}
            <mesh
              ref={waterPlaneRef}
              geometry={BOARD_GEO.waterPlane}
              position={[0, -0.015, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <meshPhysicalMaterial
                color="#38bdf8"
                transmission={0.82}
                ior={1.333}
                roughness={0.06}
                clearcoat={1}
                transparent
                opacity={0.88}
              />
            </mesh>
            {/* Rose-Gold Pool Coping Trim */}
            <mesh
              geometry={BOARD_GEO.unitTorus}
              position={[0, 0.02, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[2.7, 2.7, 0.7]}
            >
              <meshPhysicalMaterial
                color="#fda4af"
                metalness={0.85}
                roughness={0.15}
                clearcoat={1}
              />
            </mesh>
            {/* 4 Raised Stepped Marble Token Pedestals Emerging from Pool */}
            {YARD_PAD_OFFSETS.map(([px, pz], pIdx) => (
              <group key={pIdx} position={[px, 0.01, pz]}>
                <mesh geometry={BOARD_GEO.yardPadCylinder}>
                  <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.15}
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
                    color="#f43f5e"
                    metalness={0.88}
                    roughness={0.14}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}

      {/* 5. Honed Carrara Marble Slabs & Rose-Gold Track Tiles */}
      {ALL_TRACK_TILES.map((tile) => {
        const isSafe = tile.type === 'safe';
        const isStart = tile.type === 'start';
        const isHomeStretch = tile.type === 'home-stretch';
        const colorHex = tile.color ? COLOR_PALETTE[tile.color].threeHex : '#f8fafc';

        return (
          <group key={tile.key} position={[tile.x, 0, tile.z]}>
            <mesh geometry={BOARD_GEO.tileChamfer} position={[0, -0.01, 0]} receiveShadow>
              <meshPhysicalMaterial
                color={isHomeStretch || isStart ? colorHex : '#ffffff'}
                roughness={isHomeStretch || isStart ? 0.22 : 0.35}
                clearcoat={1}
                clearcoatRoughness={0.08}
                metalness={isHomeStretch ? 0.12 : 0.02}
              />
            </mesh>

            {/* Inlaid Roman 8-Point Rose-Gold Star with Inset Diamond for Safe Squares */}
            {isSafe && (
              <group position={[0, 0.048, 0]}>
                <mesh geometry={BOARD_GEO.star8Point} rotation={[-Math.PI / 2, 0, 0]}>
                  <meshPhysicalMaterial
                    color="#fda4af"
                    metalness={0.88}
                    roughness={0.14}
                    clearcoat={1}
                  />
                </mesh>
                {/* Inset Faceted Diamond Gem Core */}
                <mesh geometry={BOARD_GEO.lowSphere} scale={[0.075, 0.045, 0.075]}>
                  <meshPhysicalMaterial
                    color="#ffffff"
                    roughness={0.02}
                    clearcoat={1}
                    transmission={0.85}
                    ior={1.8}
                  />
                </mesh>
              </group>
            )}

            {isStart && (
              <mesh
                geometry={BOARD_GEO.star5Point}
                position={[0, 0.048, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshPhysicalMaterial
                  color="#fda4af"
                  metalness={0.85}
                  roughness={0.15}
                  clearcoat={1}
                />
              </mesh>
            )}
          </group>
        );
      })}

      {/* 6. Center 3x3 Home Goal: Grand Roman Rotunda & Floating Faceted Diamond */}
      <group position={[0, 0, 0]}>
        {/* Tier 1 Rotunda Step */}
        <mesh
          geometry={BOARD_GEO.unitCylinder}
          position={[0, 0.03, 0]}
          scale={[1.45, 0.1, 1.45]}
          receiveShadow
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={1} />
        </mesh>
        {/* Tier 2 Rotunda Step with Rose-Gold Filigree */}
        <mesh
          geometry={BOARD_GEO.unitCylinder}
          position={[0, 0.12, 0]}
          scale={[1.15, 0.1, 1.15]}
          receiveShadow
        >
          <meshPhysicalMaterial color="#fda4af" metalness={0.85} roughness={0.16} clearcoat={1} />
        </mesh>
        {/* Tier 3 Basin with Mirror Pool */}
        <mesh
          geometry={BOARD_GEO.unitCylinder}
          position={[0, 0.2, 0]}
          scale={[0.82, 0.08, 0.82]}
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.15} clearcoat={1} />
        </mesh>

        {/* Floating, Slowly Spinning Crystal Diamond Monument */}
        <group ref={crystalJewelRef} position={[0, 0.38, 0]}>
          {/* Top Diamond Cone */}
          <mesh geometry={BOARD_GEO.unitCone} position={[0, 0.12, 0]} scale={[0.34, 0.24, 0.34]}>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.02}
              clearcoat={1}
              transmission={0.88}
              ior={2.4}
              thickness={1.5}
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
              transmission={0.88}
              ior={2.4}
              thickness={1.5}
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
