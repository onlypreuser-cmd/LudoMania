import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE, getPawnGridCoord } from '../../../engine/boardConfig';
import { gridToWorld3D } from '../../../engine/coordinates/pathMath';
import { Pawn, PlayerColor, RoyalGuardState } from '../../../types/game';
import { POWER_GEO } from './powerGeometries';

export interface RoyalGuard3DModelProps {
  guard?: RoyalGuardState;
  pawn?: Pawn;
  color?: PlayerColor;
  scale?: number;
  hitsRemaining?: 1 | 2;
  animated?: boolean;
  autoRotatePreview?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const DEFAULT_POS: [number, number, number] = [0, 0, 0];
const DEFAULT_ROT: [number, number, number] = [0, 0, 0];

/**
 * Royal Guard Sentinel - Handcrafted 3D Procedural Chibi Palace Knight & Sentry.
 * Tactical Companion for the Royal Teakwood board theme.
 *
 * Anatomy & PBR Craft:
 * - Torso: Polished teakwood-inlay cuirass with gilded steel plates & embossed lion crest.
 * - Helmet: Curved steel bascinet with golden visor slit, side cheek guards, and sweeping royal plume.
 * - Shield: Heavy tower shield with golden rim, brass studs, and heraldic Teakwood lion insignia.
 * - Weapon: Ceremonial halberd held upright in the right gauntlet.
 * - Pedestal: Miniature polished timber plinth with gold rim and corner brass rivets.
 * - Reactive state: When hitsRemaining === 1, shows jagged shield fissures and pulsing battle sparks.
 * - Dual-mode: Supports standalone preview (CustomizePage) AND board game pawn accompaniment.
 */
export const RoyalGuard3DModel: React.FC<RoyalGuard3DModelProps> = React.memo(
  ({
    guard,
    pawn,
    color,
    scale = 1,
    hitsRemaining,
    animated = true,
    autoRotatePreview = false,
    position = DEFAULT_POS,
    rotation = DEFAULT_ROT,
  }) => {
    // Resolve effective parameters (from guard game state or direct props)
    const effectiveColor: PlayerColor =
      guard?.ownerColor ?? color ?? 'yellow';
    const effectiveHits: number =
      guard?.hitsRemaining ?? hitsRemaining ?? 2;
    const isDamaged = effectiveHits <= 1;

    const palette = COLOR_PALETTE[effectiveColor] || COLOR_PALETTE.yellow;
    const plumeColor = palette.threeHex || '#f59e0b';
    const shieldInlayColor = palette.threeHex || '#b45309';

    // Zero-allocation animation refs
    const rootGroupRef = useRef<THREE.Group>(null);
    const plumeRef = useRef<THREE.Mesh>(null);
    const halberdGroupRef = useRef<THREE.Group>(null);
    const sparkDecalRef = useRef<THREE.Mesh>(null);
    const auraRef = useRef<THREE.Mesh>(null);

    // Compute board coordinates if attached to a guarded pawn
    const isBoardAttached = Boolean(pawn && guard);
    let boardWorldPos: [number, number, number] = DEFAULT_POS;
    if (pawn) {
      const coord = getPawnGridCoord(pawn.color, pawn.step, pawn.pawnIndex);
      const pw = gridToWorld3D(coord);
      boardWorldPos = [pw.x, 0, pw.z];
    }

    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();

      // Auto-rotation for 360 preview if enabled
      if (autoRotatePreview && rootGroupRef.current) {
        rootGroupRef.current.rotation.y = t * 0.45;
      }

      if (!animated) return;

      // Subtle breathing motion for sentry figurine
      if (rootGroupRef.current && !autoRotatePreview) {
        const baseOffsetY = isBoardAttached ? 0 : position[1];
        rootGroupRef.current.position.y = baseOffsetY + Math.sin(t * 1.8) * 0.012;
      }

      // Gentle plume sway
      if (plumeRef.current) {
        plumeRef.current.rotation.z = Math.sin(t * 2.2) * 0.035;
      }

      // Halberd micro-sway in hand
      if (halberdGroupRef.current) {
        halberdGroupRef.current.rotation.z = Math.sin(t * 1.5) * 0.02;
      }

      // Protective aura pulse on board
      if (auraRef.current) {
        const mat = auraRef.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.4 + Math.sin(t * 3.5) * 0.2;
        }
      }

      // Spark/fissure flicker when damaged
      if (isDamaged && sparkDecalRef.current) {
        const mat = sparkDecalRef.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.65 + Math.sin(t * 8) * 0.35;
        }
      }
    });

    const finalRootPos = isBoardAttached ? boardWorldPos : position;
    // Offset sentinel slightly to side of pawn on the board so both are visible
    const sentinelOffset: [number, number, number] = isBoardAttached
      ? [0.30, 0.04, -0.15]
      : [0, 0, 0];
    const sentinelScale = isBoardAttached ? scale * 0.88 : scale;

    return (
      <group position={finalRootPos} rotation={rotation}>
        {/* If attached to board token, render ground protection halo */}
        {isBoardAttached && (
          <mesh
            ref={auraRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.015, 0]}
          >
            <ringGeometry args={[0.38, 0.48, 32]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.5} />
          </mesh>
        )}

        {/* Main Royal Guard Figurine */}
        <group
          ref={rootGroupRef}
          position={sentinelOffset}
          scale={sentinelScale}
        >
          {/* ============================================================ */}
          {/* 1. TIMBER PLINTH PEDESTAL (Miniature polished teakwood base)  */}
          {/* ============================================================ */}
          <group position={[0, 0.04, 0]}>
            {/* Polished Teakwood Cylinder Base */}
            <mesh geometry={POWER_GEO.plinthBase} castShadow receiveShadow>
              <meshPhysicalMaterial
                color="#3b1d07"
                roughness={0.32}
                metalness={0.15}
                clearcoat={0.85}
                clearcoatRoughness={0.12}
              />
            </mesh>

            {/* Gilded Gold Plinth Rim */}
            <mesh
              geometry={POWER_GEO.plinthGoldRim}
              position={[0, 0.038, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.94}
                roughness={0.15}
              />
            </mesh>

            {/* 4 Brass Corner Rivets on Rim */}
            {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((ang, i) => (
              <mesh
                key={i}
                geometry={POWER_GEO.unitSphere}
                position={[Math.cos(ang) * 0.33, 0.04, Math.sin(ang) * 0.33]}
                scale={0.016}
              >
                <meshStandardMaterial color="#fef08a" metalness={0.9} roughness={0.1} />
              </mesh>
            ))}

            {/* Contact Ground Shadow Disc */}
            <mesh position={[0, -0.038, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.38, 32]} />
              <meshBasicMaterial color="#020617" opacity={0.32} transparent />
            </mesh>
          </group>

          {/* ============================================================ */}
          {/* 2. LEGS & ARMORED BOOTS (Gilded Greaves & Sabatons)          */}
          {/* ============================================================ */}
          <group position={[0, 0.08, 0]}>
            {[-0.09, 0.09].map((xOffset, idx) => (
              <group key={idx} position={[xOffset, 0, 0.02]}>
                {/* Lower Greave (Shin Armor) */}
                <mesh
                  geometry={POWER_GEO.unitCylinder}
                  position={[0, 0.07, 0]}
                  scale={[0.048, 0.09, 0.048]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#334155"
                    metalness={0.88}
                    roughness={0.22}
                    clearcoat={0.9}
                  />
                </mesh>
                {/* Gold Shin Ridge */}
                <mesh
                  geometry={POWER_GEO.unitBox}
                  position={[0, 0.07, 0.042]}
                  scale={[0.018, 0.09, 0.012]}
                >
                  <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.15} />
                </mesh>
                {/* Sabaton (Armored Foot) */}
                <mesh
                  geometry={POWER_GEO.unitSphere}
                  position={[0, 0.025, 0.035]}
                  scale={[0.052, 0.032, 0.08]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#1e293b"
                    metalness={0.85}
                    roughness={0.25}
                    clearcoat={0.8}
                  />
                </mesh>
                {/* Golden Knee Poleyn */}
                <mesh
                  geometry={POWER_GEO.unitSphere}
                  position={[0, 0.125, 0.025]}
                  scale={0.036}
                  castShadow
                >
                  <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
                </mesh>
              </group>
            ))}
          </group>

          {/* ============================================================ */}
          {/* 3. TORSO & CUIRASS (Master Lathe-Sculpted Plate & Plated Gorget) */}
          {/* ============================================================ */}
          <group position={[0, 0.28, 0]}>
            {/* Hanging Faulds / Tassets (Hanging Skirt Plates) */}
            <mesh
              geometry={POWER_GEO.unitCylinder}
              position={[0, -0.05, 0]}
              scale={[0.16, 0.05, 0.13]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#451a03"
                roughness={0.35}
                clearcoat={0.8}
              />
            </mesh>
            <mesh
              geometry={POWER_GEO.thinTorus}
              position={[0, -0.025, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.165, 0.135, 0.1]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.15} />
            </mesh>

            {/* Master-Crafted Lathe-Sculpted Organic Cuirass */}
            <mesh
              geometry={POWER_GEO.cuirassLathe}
              position={[0, 0.03, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#334155"
                metalness={0.9}
                roughness={0.18}
                clearcoat={0.95}
                clearcoatRoughness={0.06}
              />
            </mesh>

            {/* Polished Burma Teakwood Inset Pectoral Medallion */}
            <mesh
              geometry={POWER_GEO.unitSphere}
              position={[0, 0.06, 0.045]}
              scale={[0.12, 0.10, 0.09]}
            >
              <meshPhysicalMaterial
                color="#5c2e0b"
                roughness={0.28}
                clearcoat={1.0}
                clearcoatRoughness={0.05}
              />
            </mesh>

            {/* Embossed Golden Heraldic Lion Crest Centered on Breastplate */}
            <mesh
              geometry={POWER_GEO.lionEmblem}
              position={[0, 0.065, 0.132]}
              scale={0.55}
              castShadow
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.96}
                roughness={0.1}
              />
            </mesh>

            {/* Gilded Gorget Neck Collar */}
            <mesh
              geometry={POWER_GEO.thinTorus}
              position={[0, 0.22, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.13}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
            </mesh>
          </group>

          {/* ============================================================ */}
          {/* 4. PAULDRONS (Curved Sculpted Shoulder Armor Plates)         */}
          {/* ============================================================ */}
          {[-0.19, 0.19].map((pX, pIdx) => (
            <group
              key={pIdx}
              position={[pX, 0.36, 0]}
              rotation={[0, 0, pIdx === 0 ? 0.32 : -0.32]}
            >
              <mesh
                geometry={POWER_GEO.pauldronCurved}
                position={[0, 0, 0]}
                rotation={[0, pIdx === 0 ? Math.PI : 0, 0]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#334155"
                  metalness={0.92}
                  roughness={0.18}
                  clearcoat={0.9}
                />
              </mesh>
              <mesh
                geometry={POWER_GEO.thinTorus}
                position={[0, -0.015, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={0.088}
              >
                <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
              </mesh>
              <mesh
                geometry={POWER_GEO.unitSphere}
                position={[pIdx === 0 ? -0.02 : 0.02, -0.04, 0]}
                scale={[0.07, 0.045, 0.07]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#451a03"
                  roughness={0.3}
                  clearcoat={0.8}
                />
              </mesh>
            </group>
          ))}

          {/* ============================================================ */}
          {/* 5. HEAD & HELMET (Monolithic Lathe Barbute & Royal Plume)    */}
          {/* ============================================================ */}
          <group position={[0, 0.53, 0]}>
            {/* Sculpted Barbute Helm Geometry */}
            <mesh
              geometry={POWER_GEO.barbuteHelm}
              position={[0, 0, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#334155"
                metalness={0.92}
                roughness={0.18}
                clearcoat={0.95}
                clearcoatRoughness={0.06}
              />
            </mesh>

            {/* Forehead Brow Band (Gilded Helm Ridge) */}
            <mesh
              geometry={POWER_GEO.thinTorus}
              position={[0, 0.045, 0.02]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.175, 0.175, 0.1]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
            </mesh>

            {/* Glowing Golden Visor Slit (Mysterious Champion Gaze) */}
            <mesh
              geometry={POWER_GEO.unitBox}
              position={[0, 0.02, 0.166]}
              scale={[0.13, 0.022, 0.015]}
            >
              <meshBasicMaterial color="#fef08a" />
            </mesh>

            {/* Visor Slit Center Divider */}
            <mesh
              geometry={POWER_GEO.unitBox}
              position={[0, 0.02, 0.172]}
              scale={[0.015, 0.026, 0.01]}
            >
              <meshStandardMaterial color="#b45309" metalness={0.85} roughness={0.2} />
            </mesh>

            {/* Golden Plume Socket on Helmet Crown */}
            <mesh
              geometry={POWER_GEO.unitCylinder}
              position={[0, 0.22, 0.01]}
              scale={[0.038, 0.035, 0.038]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.96} roughness={0.08} />
            </mesh>

            {/* Sweeping Majestic Royal Plume Crest with Organic Sway */}
            <mesh
              ref={plumeRef}
              geometry={POWER_GEO.plumeCrest}
              position={[0, 0.22, 0.01]}
              castShadow
            >
              <meshPhysicalMaterial
                color={plumeColor}
                roughness={0.65}
                sheen={1.0}
                sheenRoughness={0.4}
                sheenColor="#fde047"
                clearcoat={0.25}
              />
            </mesh>
          </group>

          {/* ============================================================ */}
          {/* 6. LEFT ARM & TOWER SHIELD (Firmly Planted on Plinth)        */}
          {/* ============================================================ */}
          <group position={[-0.22, 0.28, 0.15]} rotation={[0.04, 0.28, -0.04]}>
            {/* Armored Left Gauntlet Gripping Shield Bracket */}
            <mesh
              geometry={POWER_GEO.unitSphere}
              position={[0.08, 0.04, -0.08]}
              scale={[0.05, 0.055, 0.05]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#334155"
                metalness={0.9}
                roughness={0.2}
                clearcoat={0.85}
              />
            </mesh>

            {/* Firmly Planted Tower Shield (Touches Base at y=-0.20) */}
            <mesh
              geometry={POWER_GEO.towerShield}
              position={[0, 0, 0]}
              scale={[1.05, 1.05, 1.05]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.95}
                roughness={0.12}
              />
            </mesh>

            {/* Shield Face: Burma Teakwood / Team Color Lacquer Inlay */}
            <mesh
              geometry={POWER_GEO.towerShield}
              position={[0, 0, 0.009]}
              scale={[0.94, 0.94, 0.92]}
            >
              <meshPhysicalMaterial
                color={shieldInlayColor}
                roughness={0.25}
                clearcoat={0.95}
                clearcoatRoughness={0.06}
              />
            </mesh>

            {/* Perimeter Brass Rivets */}
            {[
              [-0.14, 0.18],
              [0.14, 0.18],
              [-0.12, -0.06],
              [0.12, -0.06],
              [0, 0.30],
              [0, -0.28],
            ].map(([sX, sY], sIdx) => (
              <mesh
                key={sIdx}
                geometry={POWER_GEO.unitSphere}
                position={[sX, sY, 0.046]}
                scale={0.014}
              >
                <meshStandardMaterial color="#fde047" metalness={0.95} roughness={0.1} />
              </mesh>
            ))}

            {/* Embossed Golden Heraldic Lion Centerpiece */}
            <mesh
              geometry={POWER_GEO.lionEmblem}
              position={[0, 0.02, 0.042]}
              scale={1.02}
              castShadow
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.96}
                roughness={0.1}
              />
            </mesh>

            {/* REACTIVE STATE: Battle Fracture Decal & Pulsing Emissive Sparks (hitsRemaining === 1) */}
            {isDamaged && (
              <group position={[0, 0, 0.048]}>
                <mesh
                  ref={sparkDecalRef}
                  geometry={POWER_GEO.jaggedFracture}
                  position={[0.02, 0.02, 0]}
                  rotation={[0, 0, -0.15]}
                  scale={[1.15, 1.15, 1]}
                >
                  <meshBasicMaterial
                    color="#ff4400"
                    transparent
                    opacity={0.85}
                  />
                </mesh>
                <mesh
                  geometry={POWER_GEO.unitSphere}
                  position={[0.03, 0.04, 0.01]}
                  scale={0.024}
                >
                  <meshBasicMaterial color="#ffea00" />
                </mesh>
                <mesh
                  geometry={POWER_GEO.unitSphere}
                  position={[0.01, -0.08, 0.01]}
                  scale={0.020}
                >
                  <meshBasicMaterial color="#ff6600" />
                </mesh>
              </group>
            )}

            {/* Fortitude Durability Indicator (2 Orbs vs 1 Orb) */}
            <group position={[0, 0.40, 0.04]}>
              <mesh
                geometry={POWER_GEO.unitSphere}
                position={[-0.045, 0, 0]}
                scale={0.024}
              >
                <meshBasicMaterial color="#22c55e" />
              </mesh>
              <mesh
                geometry={POWER_GEO.unitSphere}
                position={[0.045, 0, 0]}
                scale={0.024}
              >
                <meshBasicMaterial color={isDamaged ? '#ef4444' : '#22c55e'} />
              </mesh>
            </group>
          </group>

          {/* ============================================================ */}
          {/* 7. RIGHT ARM & CEREMONIAL HALBERD (Upright Sentry Weapon)    */}
          {/* ============================================================ */}
          <group
            ref={halberdGroupRef}
            position={[0.26, 0.44, 0.06]}
            rotation={[0.05, -0.12, 0.02]}
          >
            {/* Right Gauntlet Gripping Pole */}
            <mesh
              geometry={POWER_GEO.unitSphere}
              position={[-0.04, 0, 0]}
              scale={[0.048, 0.055, 0.048]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#334155"
                metalness={0.9}
                roughness={0.2}
                clearcoat={0.9}
              />
            </mesh>
            <mesh
              geometry={POWER_GEO.unitBox}
              position={[-0.04, 0, 0.038]}
              scale={[0.04, 0.04, 0.015]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.15} />
            </mesh>

            {/* Long Teakwood Halberd Shaft (Haft) */}
            <mesh
              geometry={POWER_GEO.unitCylinder}
              position={[0, 0.12, 0]}
              scale={[0.016, 0.96, 0.016]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#451a03"
                roughness={0.35}
                clearcoat={0.8}
              />
            </mesh>

            {/* Gold Butt-Cap / Spike Pommel at Base */}
            <mesh
              geometry={POWER_GEO.unitCylinder}
              position={[0, -0.34, 0]}
              scale={[0.02, 0.06, 0.02]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.12} />
            </mesh>

            {/* Gilded Socket Fixture & Blade Collar */}
            <mesh
              geometry={POWER_GEO.unitCylinder}
              position={[0, 0.52, 0]}
              scale={[0.032, 0.08, 0.032]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.12} />
            </mesh>

            {/* Polished Steel Halberd Head (Axe + Spear + Beak) */}
            <mesh
              geometry={POWER_GEO.halberdHead}
              position={[0, 0.58, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f1f5f9"
                metalness={0.95}
                roughness={0.12}
                clearcoat={1.0}
                clearcoatRoughness={0.04}
              />
            </mesh>

            {/* Gold Embossed Collar Ring on Axe Blade */}
            <mesh
              geometry={POWER_GEO.unitTorus}
              position={[0, 0.56, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.035}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        </group>
      </group>
    );
  }
);

RoyalGuard3DModel.displayName = 'RoyalGuard3DModel';
