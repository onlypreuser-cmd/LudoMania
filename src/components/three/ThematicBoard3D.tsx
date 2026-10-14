import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  COLOR_PALETTE,
  HOME_STRETCH_COORDS,
  MAIN_TRACK_COORDS,
  SAFE_TRACK_INDICES,
  START_TRACK_INDEX,
} from '../../engine/boardConfig';
import { BoardThemeId, PlayerColor } from '../../types/game';

interface ThematicBoard3DProps {
  themeId: BoardThemeId;
}

/**
 * Pre-allocated singleton geometries at module scope so the board
 * and all 72 track tiles share minimal GPU memory buffers with zero duplicate allocations.
 */
const BOARD_GEO = {
  tileChamfer: new THREE.BoxGeometry(0.92, 0.1, 0.92),
  trackDividerH: new THREE.BoxGeometry(15.2, 0.04, 0.03),
  trackDividerV: new THREE.BoxGeometry(0.03, 0.04, 15.2),
  unitSphere: new THREE.SphereGeometry(1, 24, 24),
  lowSphere: new THREE.SphereGeometry(1, 14, 14),
  unitCylinder: new THREE.CylinderGeometry(1, 1, 1, 24),
  unitCone: new THREE.ConeGeometry(1, 1, 20),
  unitTorus: new THREE.TorusGeometry(1, 0.08, 16, 32),
  thinTorus: new THREE.TorusGeometry(1, 0.035, 12, 28),
  subChassisBox: new THREE.BoxGeometry(15.1, 0.22, 15.1),
  outerRailH: new THREE.BoxGeometry(15.4, 0.36, 0.36),
  outerRailV: new THREE.BoxGeometry(0.36, 0.36, 15.4),
  cornerPlinth: new THREE.BoxGeometry(0.85, 0.44, 0.85),
  yardBasinBox: new THREE.BoxGeometry(5.85, 0.16, 5.85),
  yardPadCylinder: new THREE.CylinderGeometry(0.72, 0.78, 0.06, 28),
  star8Point: createStar8Geometry(0.36, 0.16, 0.035),
  star5Point: createStar5Geometry(0.32, 0.14, 0.03),
  waterPlane: new THREE.PlaneGeometry(5.4, 5.4),
  daisTier1: new THREE.CylinderGeometry(1.4, 1.48, 0.12, 6),
  daisTier2: new THREE.CylinderGeometry(1.1, 1.18, 0.12, 6),
  daisTier3: new THREE.CylinderGeometry(0.8, 0.88, 0.12, 6),
  corinthianCap: new THREE.BoxGeometry(0.55, 0.12, 0.55),
  flutedColumn: new THREE.CylinderGeometry(0.24, 0.27, 0.85, 16),
};

function createStar8Geometry(outer: number, inner: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
}

function createStar5Geometry(outer: number, inner: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
}

/**
 * Pre-calculated track coordinate map for all 72 cells.
 */
interface TrackTileData {
  key: string;
  x: number;
  z: number;
  row: number;
  col: number;
  type: 'standard' | 'start' | 'safe' | 'home-stretch' | 'entry-arrow';
  color?: PlayerColor;
  arrowDir?: number; // rotation in rad
}

function buildTrackTilesData(): TrackTileData[] {
  const tiles: TrackTileData[] = [];

  // 1. 52 Main Track Tiles
  MAIN_TRACK_COORDS.forEach((coord, idx) => {
    const x = coord.col - 7;
    const z = coord.row - 7;

    let type: TrackTileData['type'] = 'standard';
    let color: PlayerColor | undefined = undefined;

    if (idx === START_TRACK_INDEX.blue) {
      type = 'start';
      color = 'blue';
    } else if (idx === START_TRACK_INDEX.red) {
      type = 'start';
      color = 'red';
    } else if (idx === START_TRACK_INDEX.green) {
      type = 'start';
      color = 'green';
    } else if (idx === START_TRACK_INDEX.yellow) {
      type = 'start';
      color = 'yellow';
    } else if (SAFE_TRACK_INDICES.has(idx)) {
      type = 'safe';
    }

    tiles.push({
      key: `track-${idx}`,
      x,
      z,
      row: coord.row,
      col: coord.col,
      type,
      color,
    });
  });

  // 2. 20 Home Stretch Tiles (5 per color)
  const colors: PlayerColor[] = ['blue', 'red', 'green', 'yellow'];
  colors.forEach((c) => {
    HOME_STRETCH_COORDS[c].forEach((coord, sIdx) => {
      tiles.push({
        key: `home-stretch-${c}-${sIdx}`,
        x: coord.col - 7,
        z: coord.row - 7,
        row: coord.row,
        col: coord.col,
        type: 'home-stretch',
        color: c,
      });
    });
  });

  return tiles;
}

const ALL_TRACK_TILES = buildTrackTilesData();

// Yard Center Coordinates in 3D world space (6x6 yards centered at +/- 4.5)
const YARD_OFFSETS: Record<PlayerColor, { x: number; z: number }> = {
  blue: { x: -4.5, z: -4.5 },
  red: { x: 4.5, z: -4.5 },
  yellow: { x: -4.5, z: 4.5 },
  green: { x: 4.5, z: 4.5 },
};

const YARD_PAD_OFFSETS: [number, number][] = [
  [-1.05, -1.05],
  [1.05, -1.05],
  [-1.05, 1.05],
  [1.05, 1.05],
];

// ============================================================================
// THEME 1: CLASSIC KINGDOM (MEDIEVAL GRAND TOURNAMENT COLOSSEUM)
// ============================================================================
const ClassicKingdomBoard: React.FC = () => {
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

// ============================================================================
// THEME 2: ROYAL TEAKWOOD (BURMA TEAK & 3D BRASS ASTROLABE)
// ============================================================================
const RoyalTeakwoodBoard: React.FC = () => {
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
      {ALL_TRACK_TILES.map((tile, tIdx) => {
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

// ============================================================================
// THEME 3: MARBLE PALACE (ROMAN IMPERIAL PERISTYLE & BATHS)
// ============================================================================
const MarblePalaceBoard: React.FC = () => {
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

// ============================================================================
// THEME 4: MIDNIGHT NEON (NEO-TOKYO CYBERNETIC QUANTUM MAINFRAME)
// ============================================================================
const MidnightNeonBoard: React.FC = () => {
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

      {/* 4. Suspended Obsidian Smoked Glass Track Tiles Over Laser Trenches */}
      {ALL_TRACK_TILES.map((tile) => {
        const isSafe = tile.type === 'safe';
        const isStart = tile.type === 'start';
        const isHomeStretch = tile.type === 'home-stretch';
        const colorHex = tile.color ? COLOR_PALETTE[tile.color].primary : '#06b6d4';

        return (
          <group key={tile.key} position={[tile.x, 0, tile.z]}>
            {/* Suspended Smoked Obsidian Glass Tile */}
            <mesh geometry={BOARD_GEO.tileChamfer} position={[0, -0.01, 0]} receiveShadow>
              <meshPhysicalMaterial
                color={isHomeStretch ? colorHex : '#090d16'}
                roughness={0.12}
                metalness={0.85}
                clearcoat={1}
                clearcoatRoughness={0.04}
                ior={1.65}
                emissive={isHomeStretch ? colorHex : '#000000'}
                emissiveIntensity={isHomeStretch ? 0.35 : 0}
              />
            </mesh>

            {/* Glowing Holographic Warp Beacon for Safe Squares */}
            {isSafe && (
              <group position={[0, 0.048, 0]}>
                <mesh geometry={BOARD_GEO.star8Point} rotation={[-Math.PI / 2, 0, 0]}>
                  <meshStandardMaterial
                    color="#22d3ee"
                    emissive="#06b6d4"
                    emissiveIntensity={3.2}
                  />
                </mesh>
                <mesh
                  geometry={BOARD_GEO.thinTorus}
                  position={[0, 0.01, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.48}
                >
                  <meshBasicMaterial color="#ec4899" />
                </mesh>
              </group>
            )}

            {isStart && (
              <mesh
                geometry={BOARD_GEO.star5Point}
                position={[0, 0.048, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshStandardMaterial
                  color={colorHex}
                  emissive={colorHex}
                  emissiveIntensity={2.8}
                />
              </mesh>
            )}
          </group>
        );
      })}

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

// ============================================================================
// MAIN EXPORT: THEMATIC BOARD 3D DISPATCHER
// ============================================================================
export const ThematicBoard3D: React.FC<ThematicBoard3DProps> = React.memo(({ themeId }) => {
  switch (themeId) {
    case 'royal-wood':
      return <RoyalTeakwoodBoard />;
    case 'marble-palace':
      return <MarblePalaceBoard />;
    case 'midnight-neon':
      return <MidnightNeonBoard />;
    case 'classic-kingdom':
    default:
      return <ClassicKingdomBoard />;
  }
});

ThematicBoard3D.displayName = 'ThematicBoard3D';
