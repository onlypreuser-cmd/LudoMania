import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE, MAIN_TRACK_COORDS } from '../../../engine/boardConfig';
import { gridToWorld3D } from '../../../engine/coordinates/pathMath';
import { MarbleWall } from '../../../types/game';
import { POWER_GEO } from './powerGeometries';

export interface MarbleWall3DProps {
  wall?: MarbleWall;
  scale?: number;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  active?: boolean;
  animated?: boolean;
}

const DEFAULT_POS: [number, number, number] = [0, 0, 0];
const DEFAULT_ROT: [number, number, number] = [0, 0, 0];

/**
 * Classical Roman Carrara Marble Wall / Barricade.
 * Tactical Board Power for Marble Palace (Phalanx Wall blockade on track tiles).
 *
 * Anatomy & PBR Craft:
 * - Fits within a single track cell (world width ~0.85, height ~0.65, depth ~0.40).
 * - Twin fluted Carrara marble pillars with Tuscan capitals & acorn finials.
 * - Architectural stone balustrade with carved balusters and central relief block.
 * - Polished rose-gold laurel wreath filigree medallion in center.
 * - Micro stone shine / ambient dust motes catching atrium sunlight.
 * - Dual-mode: Supports both board `wall: MarbleWall` placement and direct 3D props.
 */
export const MarbleWall3D: React.FC<MarbleWall3DProps> = React.memo(
  ({
    wall,
    scale = 1,
    color,
    position = DEFAULT_POS,
    rotation = DEFAULT_ROT,
    active = true,
    animated = true,
  }) => {
    const rootRef = useRef<THREE.Group>(null);
    const dustMotesRef = useRef<THREE.Group>(null);
    const scaleRef = useRef(wall ? 0 : 1);

    // If wall object is provided, compute board tile world coordinates
    let effectivePos: [number, number, number] = position;
    let effectiveColor = color || '#e29578';

    if (wall) {
      const coord = MAIN_TRACK_COORDS[wall.tileIndex];
      const worldPos = coord ? gridToWorld3D(coord) : { x: 0, y: 0, z: 0 };
      effectivePos = [worldPos.x, 0.02, worldPos.z];
      effectiveColor = COLOR_PALETTE[wall.ownerColor]?.primary ?? '#e29578';
    }

    // Pre-calculate 8 stable dust mote positions
    const dustPoints = useMemo(() => {
      const pts: [number, number, number][] = [];
      for (let i = 0; i < 8; i++) {
        const x = Math.sin(i * 1.7) * 0.35;
        const y = 0.15 + i * 0.05;
        const z = Math.cos(i * 2.3) * 0.18;
        pts.push([x, y, z]);
      }
      return pts;
    }, []);

    useFrame((_, delta) => {
      // Smooth entrance pop animation when wall is deployed on board
      if (wall && scaleRef.current < 1) {
        scaleRef.current = Math.min(1, scaleRef.current + delta * 5);
        if (rootRef.current) {
          rootRef.current.scale.setScalar(scaleRef.current * scale);
        }
      }

      if (!animated) return;
      const t = delta * 10;

      // Subtle atmospheric stone shine / breathing shimmer
      if (dustMotesRef.current) {
        dustMotesRef.current.position.y = Math.sin(t * 1.2) * 0.02;
        dustMotesRef.current.rotation.y += delta * 0.15;
      }
    });

    return (
      <group
        ref={rootRef}
        position={effectivePos}
        rotation={rotation}
        scale={wall ? [0, 0, 0] : scale}
      >
        {/* ============================================================ */}
        {/* 1. STEPPED CARRARA MARBLE FOUNDATION PLINTH                   */}
        {/* ============================================================ */}
        <group position={[0, 0.03, 0]}>
          {/* Lower Marble Step (Fits inside 0.85 cell) */}
          <mesh
            geometry={POWER_GEO.unitBox}
            position={[0, 0, 0]}
            scale={[0.82, 0.05, 0.38]}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#f8fafc"
              roughness={0.22}
              metalness={0.05}
              clearcoat={0.7}
              clearcoatRoughness={0.15}
              reflectivity={0.65}
            />
          </mesh>

          {/* Rose-Gold Inlay Line Between Foundation Steps */}
          <mesh
            geometry={POWER_GEO.unitBox}
            position={[0, 0.026, 0]}
            scale={[0.80, 0.008, 0.36]}
          >
            <meshStandardMaterial
              color={effectiveColor}
              metalness={0.88}
              roughness={0.18}
            />
          </mesh>

          {/* Upper Plinth Step */}
          <mesh
            geometry={POWER_GEO.unitBox}
            position={[0, 0.045, 0]}
            scale={[0.74, 0.04, 0.32]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#f1f5f9"
              roughness={0.2}
              metalness={0.04}
              clearcoat={0.75}
            />
          </mesh>

          {/* Ground Contact Shadow */}
          <mesh position={[0, -0.024, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.86, 0.42]} />
            <meshBasicMaterial color="#0f172a" opacity={0.28} transparent />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* 2. TWIN FLUTED CARRARA PILLARS (Left & Right)                 */}
        {/* ============================================================ */}
        {[-0.31, 0.31].map((pX, idx) => (
          <group key={idx} position={[pX, 0.1, 0]}>
            {/* Pillar Attic Base (Molded Plinth & Torus) */}
            <mesh
              geometry={POWER_GEO.unitBox}
              position={[0, 0.02, 0]}
              scale={[0.16, 0.04, 0.16]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.2}
                clearcoat={0.7}
              />
            </mesh>
            <mesh
              geometry={POWER_GEO.unitTorus}
              position={[0, 0.045, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.075}
            >
              <meshStandardMaterial
                color={effectiveColor}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>

            {/* Classical Fluted Column Shaft */}
            <mesh
              geometry={POWER_GEO.flutedColumn}
              position={[0, 0.05, 0]}
              scale={[1, 0.78, 1]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.25}
                metalness={0.02}
                clearcoat={0.8}
                clearcoatRoughness={0.12}
              />
            </mesh>

            {/* Tuscan Capital (Pillar Head) */}
            <group position={[0, 0.50, 0]}>
              <mesh
                geometry={POWER_GEO.unitTorus}
                position={[0, 0, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.08}
              >
                <meshStandardMaterial
                  color={effectiveColor}
                  metalness={0.85}
                  roughness={0.2}
                />
              </mesh>
              <mesh
                geometry={POWER_GEO.unitBox}
                position={[0, 0.025, 0]}
                scale={[0.17, 0.04, 0.17]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#f8fafc"
                  roughness={0.22}
                  clearcoat={0.7}
                />
              </mesh>

              {/* Finial (Spherical Marble Ornament with Rose Gold Collar) */}
              <mesh
                geometry={POWER_GEO.unitSphere}
                position={[0, 0.075, 0]}
                scale={[0.045, 0.055, 0.045]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.15}
                  clearcoat={0.95}
                />
              </mesh>
              <mesh
                geometry={POWER_GEO.thinTorus}
                position={[0, 0.05, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.038}
              >
                <meshStandardMaterial
                  color={effectiveColor}
                  metalness={0.9}
                  roughness={0.15}
                />
              </mesh>
            </group>
          </group>
        ))}

        {/* ============================================================ */}
        {/* 3. ARCHITECTURAL CRENELATED FORTRESS BATTLEMENT & STONE SPAN  */}
        {/* ============================================================ */}
        <group position={[0, 0.1, -0.11]}>
          {/* Monolithic Carrara Marble Crenelated Fortress Battlement */}
          <mesh
            geometry={POWER_GEO.crenelatedWall}
            position={[0, 0.02, 0]}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color="#f8fafc"
              roughness={0.22}
              metalness={0.04}
              clearcoat={0.75}
              clearcoatRoughness={0.12}
            />
          </mesh>

          {/* Gold Decorative Frieze Trim along the Merlon Crest Base */}
          <mesh
            geometry={POWER_GEO.unitBox}
            position={[0, 0.44, 0.11]}
            scale={[0.70, 0.016, 0.22]}
          >
            <meshStandardMaterial
              color={effectiveColor}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>

          {/* Flanking Carved Balusters embedded in the wall face */}
          {[-0.20, 0.20].map((bX, bIdx) => (
            <mesh
              key={bIdx}
              geometry={POWER_GEO.balusterLathe}
              position={[bX, 0.04, 0.11]}
              scale={[0.85, 0.8, 0.85]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.2}
                clearcoat={0.7}
              />
            </mesh>
          ))}
        </group>

        {/* ============================================================ */}
        {/* 4. ROSE-GOLD / GILDED LAUREL WREATH & LION CREST MEDALLION    */}
        {/* ============================================================ */}
        <group position={[0, 0.30, 0.04]}>
          {/* Front Laurel Medallion */}
          <mesh
            geometry={POWER_GEO.laurelWreath}
            position={[0, 0, 0]}
            scale={1.05}
            castShadow
          >
            <meshStandardMaterial
              color={effectiveColor}
              metalness={0.92}
              roughness={0.14}
            />
          </mesh>

          {/* Centered Embossed Golden Lion Relief on Front */}
          <mesh
            geometry={POWER_GEO.lionEmblem}
            position={[0, 0, 0.015]}
            scale={0.58}
            castShadow
          >
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>

          {/* Back Laurel Medallion (Double-Sided Wall for 360 Viewing) */}
          <mesh
            geometry={POWER_GEO.laurelWreath}
            position={[0, 0, -0.08]}
            rotation={[0, Math.PI, 0]}
            scale={1.05}
            castShadow
          >
            <meshStandardMaterial
              color={effectiveColor}
              metalness={0.92}
              roughness={0.14}
            />
          </mesh>

          {/* Centered Embossed Golden Lion Relief on Back */}
          <mesh
            geometry={POWER_GEO.lionEmblem}
            position={[0, 0, -0.095]}
            rotation={[0, Math.PI, 0]}
            scale={0.58}
            castShadow
          >
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.95}
              roughness={0.1}
            />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* 5. AMBIENT DUST MOTES & STONE SPECULAR SHINE                  */}
        {/* ============================================================ */}
        <group ref={dustMotesRef}>
          {dustPoints.map(([x, y, z], i) => (
            <mesh
              key={i}
              geometry={POWER_GEO.lowSphere}
              position={[x, y, z]}
              scale={0.007}
            >
              <meshBasicMaterial
                color="#fed7aa"
                transparent
                opacity={0.45}
              />
            </mesh>
          ))}
        </group>
      </group>
    );
  }
);

MarbleWall3D.displayName = 'MarbleWall3D';
