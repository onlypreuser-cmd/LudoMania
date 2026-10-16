import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { getPawnGridCoord } from '../../../engine/boardConfig';
import { gridToWorld3D } from '../../../engine/coordinates/pathMath';
import { CyberStasis, Pawn } from '../../../types/game';
import { POWER_GEO } from './powerGeometries';

export interface StasisRock3DProps {
  stasis?: CyberStasis;
  pawn?: Pawn;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  primaryColor?: string;
  secondaryColor?: string;
  animated?: boolean;
  active?: boolean;
}

const DEFAULT_POS: [number, number, number] = [0, 0, 0];
const DEFAULT_ROT: [number, number, number] = [0, 0, 0];

/**
 * Cyber Asteroid / Quantum Stasis Rock Encasement.
 * Tactical Board Power for Midnight Cyber (encases and immobilizes an opponent token).
 *
 * Anatomy & PBR Craft:
 * - Fractured low-poly obsidian/basalt meteor chunks arranged in a containment cage.
 * - Glowing cyan (#00f0ff) and magenta (#ec4899) neon fissures with pulsing energy.
 * - Levitating magnetic containment ring hovering above with counter-rotating nodes.
 * - Semi-transparent quantum stasis beam holding the target in frozen spacetime.
 * - Dual-mode: Supports both board `stasis` encasement around pawn and standalone 3D props.
 */
export const StasisRock3D: React.FC<StasisRock3DProps> = React.memo(
  ({
    stasis,
    pawn,
    scale = 1,
    position = DEFAULT_POS,
    rotation = DEFAULT_ROT,
    primaryColor = '#00f0ff',
    secondaryColor = '#ec4899',
    animated = true,
    active = true,
  }) => {
    const rootRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Group>(null);
    const subRingRef = useRef<THREE.Group>(null);
    const beamRef = useRef<THREE.Mesh>(null);
    const fissureMatCyanRef = useRef<THREE.MeshBasicMaterial>(null);
    const fissureMatMagentaRef = useRef<THREE.MeshBasicMaterial>(null);

    // If attached to board pawn, calculate pawn world coordinates
    let effectivePos: [number, number, number] = position;
    if (pawn) {
      const coord = getPawnGridCoord(pawn.color, pawn.step, pawn.pawnIndex);
      const pw = gridToWorld3D(coord);
      effectivePos = [pw.x, 0, pw.z];
    }

    // Pre-calculate organic boulder placement surrounding a central token hollow (radius ~0.26)
    const meteorChunks = useMemo(() => {
      const chunks = [
        { angle: 0.1, radius: 0.28, y: 0.12, rot: [0.2, 0.4, 0.1], scale: [0.95, 1.1, 0.85] },
        { angle: 1.1, radius: 0.27, y: 0.16, rot: [-0.3, 0.8, 0.2], scale: [1.1, 1.25, 0.9] },
        { angle: 2.2, radius: 0.29, y: 0.13, rot: [0.4, -0.5, 0.3], scale: [0.85, 1.05, 1.0] },
        { angle: 3.3, radius: 0.26, y: 0.18, rot: [-0.2, 1.2, -0.4], scale: [1.05, 1.3, 0.95] },
        { angle: 4.4, radius: 0.28, y: 0.14, rot: [0.5, -0.8, 0.1], scale: [0.9, 1.15, 0.9] },
        { angle: 5.5, radius: 0.27, y: 0.15, rot: [-0.4, 0.3, -0.2], scale: [1.0, 1.2, 1.05] },
      ];
      return chunks.map((c) => ({
        x: Math.cos(c.angle) * c.radius,
        z: Math.sin(c.angle) * c.radius,
        y: c.y,
        rot: c.rot as [number, number, number],
        scale: c.scale as [number, number, number],
      }));
    }, []);

    // Fissure connector coordinates between chunks
    const fissureSegments = useMemo(() => {
      return [
        { pos: [0.22, 0.14, 0.16], rot: [0.2, 0.8, -0.3], color: 'cyan' },
        { pos: [-0.18, 0.16, 0.20], rot: [-0.4, 0.5, 0.6], color: 'magenta' },
        { pos: [-0.24, 0.15, -0.14], rot: [0.3, -0.7, 0.2], color: 'cyan' },
        { pos: [0.15, 0.18, -0.22], rot: [-0.5, -0.4, -0.5], color: 'magenta' },
        { pos: [0.02, 0.22, 0.25], rot: [0.6, 0.1, 0.4], color: 'cyan' },
      ];
    }, []);

    useFrame(({ clock }) => {
      if (!animated) return;
      const t = clock.getElapsedTime();

      // Counter-rotating magnetic containment ring
      if (ringRef.current) {
        ringRef.current.rotation.y = t * 1.2;
        ringRef.current.position.y = 0.54 + Math.sin(t * 2.4) * 0.025;
      }
      if (subRingRef.current) {
        subRingRef.current.rotation.y = -t * 1.8;
        subRingRef.current.rotation.z = Math.sin(t * 1.5) * 0.12;
      }

      // Pulsing neon fissures
      const cyanPulse = 0.65 + Math.sin(t * 4.5) * 0.35;
      const magentaPulse = 0.65 + Math.cos(t * 5.0) * 0.35;
      if (fissureMatCyanRef.current) {
        fissureMatCyanRef.current.opacity = cyanPulse;
      }
      if (fissureMatMagentaRef.current) {
        fissureMatMagentaRef.current.opacity = magentaPulse;
      }

      // Stasis beam opacity pulsation
      if (beamRef.current) {
        const mat = beamRef.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = 0.18 + Math.sin(t * 3) * 0.08;
        }
      }
    });

    return (
      <group ref={rootRef} position={effectivePos} rotation={rotation} scale={scale}>
        {/* ============================================================ */}
        {/* 1. GROUND IMPACT CRATER & CONTACT SHADOW                    */}
        {/* ============================================================ */}
        <group position={[0, 0.02, 0]}>
          {/* Cyber Dark Shadow Disc */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.42, 32]} />
            <meshBasicMaterial color="#020617" opacity={0.65} transparent />
          </mesh>

          {/* Glowing Ground Fissure Circle */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <ringGeometry args={[0.26, 0.38, 32]} />
            <meshBasicMaterial
              color={primaryColor}
              transparent
              opacity={0.3}
            />
          </mesh>
        </group>

        {/* ============================================================ */}
        {/* 2. LOW-POLY OBSIDIAN / BASALT METEOR CHUNKS                 */}
        {/* ============================================================ */}
        <group position={[0, 0, 0]}>
          {meteorChunks.map((chunk, i) => (
            <mesh
              key={i}
              geometry={i % 2 === 0 ? POWER_GEO.chunkLarge : POWER_GEO.chunkMedium}
              position={[chunk.x, chunk.y, chunk.z]}
              rotation={chunk.rot}
              scale={chunk.scale}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#0b0f19"
                roughness={0.2}
                metalness={0.4}
                clearcoat={1.0}
                clearcoatRoughness={0.08}
                reflectivity={0.7}
              />
            </mesh>
          ))}
        </group>

        {/* ============================================================ */}
        {/* 3. GLOWING NEON FISSURES & CRYSTALLINE SEAMS                 */}
        {/* ============================================================ */}
        <group position={[0, 0, 0]}>
          <meshBasicMaterial
            ref={fissureMatCyanRef}
            color={primaryColor}
            transparent
            opacity={0.8}
          />
          <meshBasicMaterial
            ref={fissureMatMagentaRef}
            color={secondaryColor}
            transparent
            opacity={0.8}
          />

          {fissureSegments.map((f, i) => (
            <mesh
              key={i}
              geometry={POWER_GEO.unitBox}
              position={f.pos as [number, number, number]}
              rotation={f.rot as [number, number, number]}
              scale={[0.02, 0.14, 0.015]}
            >
              <meshBasicMaterial
                color={f.color === 'cyan' ? primaryColor : secondaryColor}
                transparent
                opacity={0.85}
              />
            </mesh>
          ))}
        </group>

        {/* ============================================================ */}
        {/* 4. QUANTUM STASIS CYLINDER BEAM                             */}
        {/* ============================================================ */}
        <mesh
          ref={beamRef}
          geometry={POWER_GEO.unitCylinder}
          position={[0, 0.28, 0]}
          scale={[0.26, 0.52, 0.26]}
        >
          <meshBasicMaterial
            color={primaryColor}
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* ============================================================ */}
        {/* 5. FLOATING MAGNETIC CONTAINMENT RING                        */}
        {/* ============================================================ */}
        <group ref={ringRef} position={[0, 0.54, 0]}>
          {/* Main Magnetic Outer Torus */}
          <mesh geometry={POWER_GEO.stasisFieldRing} castShadow>
            <meshPhysicalMaterial
              color="#0f172a"
              metalness={0.9}
              roughness={0.15}
              clearcoat={1.0}
            />
          </mesh>

          {/* Outer Glowing Cyan Trim Ring */}
          <mesh geometry={POWER_GEO.thinTorus} scale={0.382}>
            <meshBasicMaterial color={primaryColor} />
          </mesh>

          {/* 3 Levitating Magnetic Emitter Nodes */}
          {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((nodeAngle, nIdx) => (
            <group
              key={nIdx}
              position={[
                Math.cos(nodeAngle) * 0.38,
                0,
                Math.sin(nodeAngle) * 0.38,
              ]}
            >
              <mesh geometry={POWER_GEO.unitSphere} scale={0.032}>
                <meshStandardMaterial
                  color="#1e293b"
                  metalness={0.95}
                  roughness={0.1}
                />
              </mesh>
              <mesh geometry={POWER_GEO.unitSphere} scale={0.018}>
                <meshBasicMaterial
                  color={nIdx % 2 === 0 ? primaryColor : secondaryColor}
                />
              </mesh>
            </group>
          ))}

          {/* Counter-Rotating Inner Gyro Ring */}
          <group ref={subRingRef}>
            <mesh geometry={POWER_GEO.stasisSubRing} scale={0.78}>
              <meshBasicMaterial color={secondaryColor} />
            </mesh>
          </group>
        </group>
      </group>
    );
  }
);

StasisRock3D.displayName = 'StasisRock3D';
