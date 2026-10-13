import { RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE } from '../../engine/boardConfig';
import { PlayerColor, TokenSkinId } from '../../types/game';

interface Token3DModelProps {
  skin: TokenSkinId;
  color: PlayerColor;
  isSelectable?: boolean;
  isSelected?: boolean;
  scale?: number;
  autoRotatePreview?: boolean;
}

/**
 * Pre-allocated shared geometries at module scope so 16 tokens on the board
 * reuse the exact same GPU vertex buffers (zero duplicate geometry allocations).
 */
function createStar3DGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const outer = 0.048;
  const inner = 0.022;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = -Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
}

/**
 * Swept organic dragon horn that curves backward and upward with smooth tapering.
 */
function createCurvedDragonHornGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 16;
  const segments = 16;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = t * 0.34;
    const z = -Math.pow(t, 1.45) * 0.17 + Math.pow(t, 2.6) * 0.05;
    const x = Math.sin(t * Math.PI * 0.5) * 0.032;
    const r = Math.max(0.001, (1 - t) * 0.062);
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      vertices.push(x + Math.cos(theta) * r, y, z + Math.sin(theta) * r);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = (i + 1) * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + (j + 1);
      const d = i * (segments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Helical twisted spiral alicorn horn with distinct 3D grooves.
 */
function createSpiralAlicornHornGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 32;
  const segments = 20;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = t * 0.36;
    const baseR = (1 - t) * 0.062;
    const spiralAngle = t * Math.PI * 2 * 3.5;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const wave = Math.cos(theta - spiralAngle);
      const r = Math.max(0.001, baseR * (1 + 0.24 * wave));
      vertices.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = (i + 1) * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + (j + 1);
      const d = i * (segments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Sweeping royal chess-pawn bust for Pirate Captain (zero boxiness).
 */
function createPiratePawnLatheGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.31, 0.0),
    new THREE.Vector2(0.315, 0.04),
    new THREE.Vector2(0.28, 0.08),
    new THREE.Vector2(0.23, 0.13),
    new THREE.Vector2(0.18, 0.22),
    new THREE.Vector2(0.155, 0.32),
    new THREE.Vector2(0.175, 0.42),
    new THREE.Vector2(0.185, 0.47),
    new THREE.Vector2(0.14, 0.52),
    new THREE.Vector2(0.0, 0.53),
  ];
  return new THREE.LatheGeometry(points, 32);
}

/**
 * Plump, cuddly pear-shaped seated robe for Grand Magician (zero cylinder).
 */
function createMagicianRobeLatheGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.31, 0.0),
    new THREE.Vector2(0.315, 0.05),
    new THREE.Vector2(0.29, 0.1),
    new THREE.Vector2(0.26, 0.18),
    new THREE.Vector2(0.225, 0.28),
    new THREE.Vector2(0.185, 0.38),
    new THREE.Vector2(0.14, 0.46),
    new THREE.Vector2(0.0, 0.47),
  ];
  return new THREE.LatheGeometry(points, 32);
}

/**
 * Organic floppy wizard hat cone with realistic backward fold/crease.
 */
function createFloppyWizardHatGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 18;
  const segments = 24;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = t * 0.42;
    const z = -Math.pow(t, 2.0) * 0.14;
    const x = Math.sin(t * Math.PI) * 0.035;
    const r = Math.max(0.001, (1 - t) * 0.22 * (1 - t * 0.1));
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      vertices.push(x + Math.cos(theta) * r, y, z + Math.sin(theta) * r);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = (i + 1) * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + (j + 1);
      const d = i * (segments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

const SHARED_GEO = {
  unitSphere: new THREE.SphereGeometry(1, 28, 28),
  lowSphere: new THREE.SphereGeometry(1, 18, 18),
  unitCylinder: new THREE.CylinderGeometry(1, 1, 1, 28),
  pedestalBase: new THREE.CylinderGeometry(0.33, 0.38, 0.13, 32),
  pedestalInner: new THREE.CylinderGeometry(0.28, 0.31, 0.05, 28),
  pedestalRing: new THREE.TorusGeometry(0.31, 0.032, 16, 32),
  themeCollar: new THREE.CylinderGeometry(0.315, 0.345, 0.11, 32),
  selectRingOuter: new THREE.RingGeometry(0.4, 0.54, 36),
  selectRingInner: new THREE.RingGeometry(0.33, 0.38, 36),
  scarfTorus: new THREE.TorusGeometry(0.205, 0.048, 16, 28),
  collarTorus: new THREE.TorusGeometry(0.195, 0.038, 16, 28),
  tailTorus: new THREE.TorusGeometry(0.085, 0.038, 14, 22, Math.PI * 1.35),
  catTailTorus: new THREE.TorusGeometry(0.11, 0.028, 12, 22, Math.PI * 1.2),
  capsuleLimb: new THREE.CapsuleGeometry(0.065, 0.11, 12, 16),
  hornCone: new THREE.ConeGeometry(0.058, 0.28, 20),
  earCone: new THREE.ConeGeometry(0.095, 0.2, 18),
  star3D: createStar3DGeometry(),
  curvedHorn: createCurvedDragonHornGeometry(),
  spiralHorn: createSpiralAlicornHornGeometry(),
  piratePawnBust: createPiratePawnLatheGeometry(),
  magicianRobe: createMagicianRobeLatheGeometry(),
  floppyHat: createFloppyWizardHatGeometry(),
};

/**
 * Generates the smooth turned-wood/lacquer Lathe profile for the Classic Ludo Pawn
 */
function createClassicLatheGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.28, 0.0),
    new THREE.Vector2(0.29, 0.06),
    new THREE.Vector2(0.26, 0.11),
    new THREE.Vector2(0.22, 0.15),
    new THREE.Vector2(0.17, 0.28),
    new THREE.Vector2(0.13, 0.42),
    new THREE.Vector2(0.115, 0.52),
    new THREE.Vector2(0.15, 0.56),
    new THREE.Vector2(0.0, 0.58),
  ];
  return new THREE.LatheGeometry(points, 32);
}

const CLASSIC_LATHE_GEO = createClassicLatheGeometry();

/**
 * Collectible-grade 3D Character & Pawn Token Renderer.
 * - Uses shared GPU geometries (`SHARED_GEO`) for high-FPS performance
 * - Uses organic ellipsoidal sculpting + layered eyes with specular catchlights
 * - Tuned PBR materials (`ior`, `sheen`, `clearcoat`, `metalness`) matching the 8 skins
 */
export const Token3DModel: React.FC<Token3DModelProps> = React.memo(
  ({
    skin,
    color,
    isSelectable = false,
    isSelected = false,
    scale = 1,
    autoRotatePreview = false,
  }) => {
    const innerRef = useRef<THREE.Group>(null);
    const ringRef = useRef<THREE.Group>(null);
    const palette = COLOR_PALETTE[color];

    const isAnimated = autoRotatePreview || isSelectable || isSelected;

    useFrame((state, delta) => {
      if (!isAnimated) return;
      if (autoRotatePreview && innerRef.current) {
        innerRef.current.rotation.y += delta * 1.05;
      }
      if (ringRef.current && (isSelectable || isSelected)) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 6.5) * 0.12;
        ringRef.current.scale.set(pulse, pulse, 1);
        ringRef.current.rotation.z += delta * 1.2;
      }
    });

    // Shared eye helper with sclera/iris + bright white specular catchlight
    const renderExpressiveEye = useMemo(
      () =>
        (
          pos: [number, number, number],
          irisColor = '#1e1b18',
          eyeRadius = 0.042
        ) => {
          const sideSign = pos[0] >= 0 ? 1 : -1;
          return (
            <group position={pos}>
              {/* Glossy Iris/Cornea */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                scale={[eyeRadius, eyeRadius * 1.08, eyeRadius * 0.75]}
              >
                <meshPhysicalMaterial
                  color={irisColor}
                  roughness={0.02}
                  metalness={0.05}
                  clearcoat={1}
                  clearcoatRoughness={0.0}
                  ior={1.45}
                />
              </mesh>
              {/* Primary Top-Left Specular Catchlight Dot */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[
                  -sideSign * eyeRadius * 0.28,
                  eyeRadius * 0.32,
                  eyeRadius * 0.68,
                ]}
                scale={eyeRadius * 0.32}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Secondary Micro Catchlight */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[
                  sideSign * eyeRadius * 0.25,
                  -eyeRadius * 0.25,
                  eyeRadius * 0.65,
                ]}
                scale={eyeRadius * 0.16}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        },
      []
    );

    return (
      <group ref={innerRef} scale={scale}>
        {/* ================================================================ */}
        {/* PULSING TARGET SELECTION HALO ON BOARD FLOOR                     */}
        {/* ================================================================ */}
        {(isSelectable || isSelected) && (
          <group
            ref={ringRef}
            position={[0, 0.025, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <mesh geometry={SHARED_GEO.selectRingOuter}>
              <meshBasicMaterial
                color="#facc15"
                side={THREE.DoubleSide}
                transparent
                opacity={0.92}
              />
            </mesh>
            <mesh geometry={SHARED_GEO.selectRingInner}>
              <meshBasicMaterial
                color="#ffffff"
                side={THREE.DoubleSide}
                transparent
                opacity={0.85}
              />
            </mesh>
          </group>
        )}

        {/* ================================================================ */}
        {/* UNIVERSAL COLOR-CODED COLLECTOR PEDESTAL BASE                    */}
        {/* ================================================================ */}
        <mesh
          geometry={SHARED_GEO.pedestalBase}
          position={[0, 0.065, 0]}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial
            color={palette.threeHex}
            roughness={0.14}
            metalness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.06}
            ior={1.5}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.pedestalInner}
          position={[0, 0.135, 0]}
          receiveShadow
        >
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.25}
            metalness={0.2}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.pedestalRing}
          position={[0, 0.13, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow
        >
          <meshStandardMaterial
            color={isSelected ? '#fde047' : '#fbbf24'}
            roughness={0.18}
            metalness={0.78}
          />
        </mesh>

        {/* ================================================================ */}
        {/* 1. CLASSIC ROYAL LACQUER PAWN (Turned Lathe Profile)             */}
        {/* ================================================================ */}
        {skin === 'classic' && (
          <group position={[0, 0.14, 0]}>
            <mesh geometry={CLASSIC_LATHE_GEO} castShadow receiveShadow>
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.08}
                metalness={0.12}
                clearcoat={1}
                clearcoatRoughness={0.04}
                ior={1.55}
              />
            </mesh>
            {/* Neck Gold Collar */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.55, 0]}
              rotation={[Math.PI / 2, 0, 0]}
               scale={0.82}
            >
              <meshStandardMaterial
                color="#fde047"
                metalness={0.85}
                roughness={0.15}
              />
            </mesh>
            {/* Crown Sphere */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.75, 0]}
              scale={0.235}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.06}
                metalness={0.12}
                clearcoat={1}
                clearcoatRoughness={0.03}
                ior={1.6}
              />
            </mesh>
          </group>
        )}

        {/* ================================================================ */}
        {/* 2. KNIGHT (SCULPTED GRANDMASTER CHESS STEED - NO BOXES)          */}
        {/* ================================================================ */}
        {skin === 'knight' && (
          <group position={[0, 0.14, 0]}>
            {/* Stepped Chess Pedestal Column */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0.08, 0]}
              scale={[0.26, 0.14, 0.26]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.12}
                metalness={0.15}
                clearcoat={1}
                ior={1.5}
              />
            </mesh>
            {/* Sculpted Sweeping Chest & Lower Neck */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.27, 0.03]}
              rotation={[-0.22, 0, 0]}
              scale={[0.22, 0.26, 0.24]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.12}
                metalness={0.15}
                clearcoat={1}
                ior={1.5}
              />
            </mesh>
            {/* Arched Upper Neck */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.48, -0.02]}
              rotation={[0.28, 0, 0]}
              scale={[0.185, 0.27, 0.21]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.12}
                metalness={0.15}
                clearcoat={1}
                ior={1.5}
              />
            </mesh>
            {/* Sculpted Horse Cranium / Cheek */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.66, 0.03]}
              scale={[0.175, 0.165, 0.19]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.1}
                clearcoat={1}
              />
            </mesh>
            {/* Tapered Rounded Muzzle / Snout */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.59, 0.19]}
              rotation={[0.42, 0, 0]}
              scale={[0.125, 0.115, 0.18]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.1}
                clearcoat={1}
              />
            </mesh>
            {/* Sculpted Nostrils */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.048, 0.57, 0.33]}
              scale={0.022}
            >
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.048, 0.57, 0.33]}
              scale={0.022}
            >
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
            {/* Flowing Scalloped Mane Crest along Back of Neck */}
            {[
              { y: 0.75, z: -0.06, s: 0.095 },
              { y: 0.64, z: -0.15, s: 0.105 },
              { y: 0.51, z: -0.18, s: 0.11 },
              { y: 0.37, z: -0.16, s: 0.1 },
              { y: 0.25, z: -0.13, s: 0.085 },
            ].map((seg, idx) => (
              <mesh
                key={idx}
                geometry={SHARED_GEO.lowSphere}
                position={[0, seg.y, seg.z]}
                scale={[0.065, seg.s, seg.s * 1.15]}
                castShadow
              >
                <meshPhysicalMaterial
                  color={palette.threeHex}
                  roughness={0.14}
                  clearcoat={1}
                />
              </mesh>
            ))}
            {/* Forelock Tuft Between Ears */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.77, 0.08]}
              rotation={[0.4, 0, 0]}
              scale={[0.055, 0.075, 0.095]}
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.12}
                clearcoat={1}
              />
            </mesh>
            {/* Alert Curved Equine Ears */}
            <mesh
              geometry={SHARED_GEO.earCone}
              position={[-0.095, 0.81, -0.02]}
              rotation={[-0.18, 0, 0.22]}
              scale={[0.55, 0.75, 0.5]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.12}
                clearcoat={1}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.earCone}
              position={[0.095, 0.81, -0.02]}
              rotation={[-0.18, 0, -0.22]}
              scale={[0.55, 0.75, 0.5]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.threeHex}
                roughness={0.12}
                clearcoat={1}
              />
            </mesh>
            {/* Expressive Dark Glossy Eyes with Catchlights */}
            {renderExpressiveEye([-0.12, 0.67, 0.11], '#0f172a', 0.034)}
            {renderExpressiveEye([0.12, 0.67, 0.11], '#0f172a', 0.034)}
          </group>
        )}

        {/* ================================================================ */}
        {/* 3. DOG (CHUBBY SEATED SHIBA INU FIGURINE)                        */}
        {/* ================================================================ */}
        {skin === 'dog' && (
          <group position={[0, 0.14, 0]}>
            {/* Plump Seated Shiba Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.21, -0.01]}
              scale={[0.235, 0.22, 0.22]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#e58e26"
                roughness={0.62}
                metalness={0.0}
                clearcoat={0.12}
                sheen={0.65}
                sheenRoughness={0.75}
                sheenColor="#fde68a"
              />
            </mesh>
            {/* Cream-White Chest & Belly Fur Patch */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.19, 0.095]}
              scale={[0.165, 0.175, 0.135]}
            >
              <meshPhysicalMaterial
                color="#fffdf7"
                roughness={0.58}
                sheen={0.5}
                sheenColor="#ffffff"
              />
            </mesh>
            {/* Two Cute Cream-White Seated Front Paws */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.095, 0.055, 0.165]}
              scale={[0.072, 0.052, 0.088]}
              castShadow
            >
              <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.095, 0.055, 0.165]}
              scale={[0.072, 0.052, 0.088]}
              castShadow
            >
              <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
            </mesh>
            {/* Tucked Golden Hind Haunches */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.19, 0.11, -0.03]}
              scale={[0.075, 0.105, 0.11]}
            >
              <meshPhysicalMaterial
                color="#e58e26"
                roughness={0.65}
                sheen={0.5}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.19, 0.11, -0.03]}
              scale={[0.075, 0.105, 0.11]}
            >
              <meshPhysicalMaterial
                color="#e58e26"
                roughness={0.65}
                sheen={0.5}
              />
            </mesh>
            {/* Fluffy Curled Shiba Tail at Back */}
            <mesh
              geometry={SHARED_GEO.tailTorus}
              position={[0, 0.23, -0.22]}
              rotation={[0.3, Math.PI / 2, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#e58e26"
                roughness={0.65}
                sheen={0.6}
                sheenColor="#fef3c7"
              />
            </mesh>

            {/* Cozy Red Knitted Scarf + Side Knot & Hanging Tails */}
            <mesh
              geometry={SHARED_GEO.scarfTorus}
              position={[0, 0.355, 0.01]}
              rotation={[Math.PI / 2 + 0.08, 0, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#dc2626"
                roughness={0.68}
                sheen={0.55}
                sheenColor="#fca5a5"
              />
            </mesh>
            {/* Scarf Side Knot & 2 Hanging Ribbons */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.18, 0.33, 0.11]}
              scale={[0.062, 0.058, 0.062]}
            >
              <meshPhysicalMaterial color="#b91c1c" roughness={0.65} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.21, 0.23, 0.13]}
              rotation={[0.15, 0, -0.32]}
              scale={[0.68, 0.72, 0.5]}
              castShadow
            >
              <meshPhysicalMaterial color="#dc2626" roughness={0.65} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.16, 0.22, 0.16]}
              rotation={[0.25, 0, -0.12]}
              scale={[0.62, 0.65, 0.48]}
              castShadow
            >
              <meshPhysicalMaterial color="#dc2626" roughness={0.65} />
            </mesh>

            {/* Wide Sculpted Shiba Head (Chubby Cheeks!) */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.58, 0.01]}
              scale={[0.285, 0.255, 0.25]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#e58e26"
                roughness={0.58}
                clearcoat={0.12}
                sheen={0.65}
                sheenRoughness={0.75}
                sheenColor="#fde68a"
              />
            </mesh>
            {/* Plump Cream-White Lower Cheeks (Urajiro markings) */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.125, 0.51, 0.115]}
              scale={[0.145, 0.115, 0.135]}
            >
              <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.125, 0.51, 0.115]}
              scale={[0.145, 0.115, 0.135]}
            >
              <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
            </mesh>
            {/* Sculpted Cream-White Snout / Muzzle */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.515, 0.185]}
              scale={[0.135, 0.105, 0.115]}
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.5} />
            </mesh>
            {/* Wet Glossy Black Nose */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.555, 0.285]}
              scale={[0.044, 0.034, 0.034]}
            >
              <meshPhysicalMaterial
                color="#111827"
                roughness={0.02}
                clearcoat={1}
                ior={1.45}
              />
            </mesh>
            {/* Happy Pink Tongue Peek */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.475, 0.26]}
              scale={[0.036, 0.026, 0.03]}
            >
              <meshPhysicalMaterial
                color="#fb7185"
                roughness={0.25}
                clearcoat={0.6}
              />
            </mesh>
            {/* Signature Shiba Cream Eyebrow Dots (Maru-Mayuge) */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.085, 0.675, 0.215]}
              rotation={[0, 0, -0.25]}
              scale={[0.032, 0.02, 0.02]}
            >
              <meshStandardMaterial color="#fffdf7" roughness={0.5} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.085, 0.675, 0.215]}
              rotation={[0, 0, 0.25]}
              scale={[0.032, 0.02, 0.02]}
            >
              <meshStandardMaterial color="#fffdf7" roughness={0.5} />
            </mesh>
            {/* Expressive Dark Brown Shiba Eyes with Specular Catchlights */}
            {renderExpressiveEye([-0.105, 0.595, 0.22], '#271306', 0.044)}
            {renderExpressiveEye([0.105, 0.595, 0.22], '#271306', 0.044)}

            {/* Plush Triangular Shiba Ears with Pink Inner Hollows */}
            <group
              position={[-0.165, 0.79, -0.01]}
              rotation={[0.12, 0.1, 0.26]}
            >
              <mesh
                geometry={SHARED_GEO.earCone}
                scale={[1.05, 0.95, 0.62]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#e58e26"
                  roughness={0.62}
                  sheen={0.5}
                />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.01, 0.025]}
                scale={[0.62, 0.68, 0.35]}
              >
                <meshStandardMaterial color="#fda4af" roughness={0.55} />
              </mesh>
            </group>
            <group
              position={[0.165, 0.79, -0.01]}
              rotation={[0.12, -0.1, -0.26]}
            >
              <mesh
                geometry={SHARED_GEO.earCone}
                scale={[1.05, 0.95, 0.62]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#e58e26"
                  roughness={0.62}
                  sheen={0.5}
                />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.01, 0.025]}
                scale={[0.62, 0.68, 0.35]}
              >
                <meshStandardMaterial color="#fda4af" roughness={0.55} />
              </mesh>
            </group>
          </group>
        )}

        {/* ================================================================ */}
        {/* 4. CAT (PLUMP SNOWBELL KITTY WITH RED SCARF & POM-POM)           */}
        {/* ================================================================ */}
        {skin === 'cat' && (
          <group position={[0, 0.14, 0]}>
            {/* Plump Seated Pearl-White Kitty Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.2, -0.01]}
              scale={[0.225, 0.215, 0.21]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.48}
                clearcoat={0.22}
                sheen={0.7}
                sheenRoughness={0.65}
                sheenColor="#ffffff"
              />
            </mesh>
            {/* Two Cute White Seated Front Paws */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.09, 0.055, 0.16]}
              scale={[0.07, 0.05, 0.085]}
              castShadow
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.45} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.09, 0.055, 0.16]}
              scale={[0.07, 0.05, 0.085]}
              castShadow
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.45} />
            </mesh>
            {/* Curled White Kitty Tail */}
            <mesh
              geometry={SHARED_GEO.catTailTorus}
              position={[-0.14, 0.14, -0.16]}
              rotation={[0.5, 0.6, 0]}
              castShadow
            >
              <meshPhysicalMaterial color="#f8fafc" roughness={0.5} />
            </mesh>

            {/* Cozy Red Scarf + Hanging Pom-Pom & Golden Bell */}
            <mesh
              geometry={SHARED_GEO.scarfTorus}
              position={[0, 0.35, 0.01]}
              rotation={[Math.PI / 2 + 0.06, 0, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#e11d48"
                roughness={0.62}
                sheen={0.5}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.19, 0.23, 0.12]}
              rotation={[0.15, 0, -0.3]}
              scale={[0.65, 0.8, 0.5]}
            >
              <meshPhysicalMaterial color="#e11d48" roughness={0.6} />
            </mesh>
            {/* Fluffy Red Pom-Pom at Scarf Tip */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.23, 0.13, 0.15]}
              scale={0.065}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ef4444"
                roughness={0.75}
                sheen={0.7}
              />
            </mesh>
            {/* Golden Collar Bell */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.32, 0.22]}
              scale={0.048}
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.85}
                roughness={0.14}
              />
            </mesh>

            {/* Wide Chubby Kitty Head */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.58, 0.01]}
              scale={[0.285, 0.25, 0.245]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.45}
                clearcoat={0.25}
                sheen={0.75}
                sheenColor="#ffffff"
              />
            </mesh>
            {/* Puffy Whisker Pads / Muzzle */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.042, 0.515, 0.215]}
              scale={[0.055, 0.042, 0.048]}
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.4} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.042, 0.515, 0.215]}
              scale={[0.055, 0.042, 0.048]}
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.4} />
            </mesh>
            {/* Dainty Pink Triangle Nose */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.545, 0.255]}
              scale={[0.034, 0.025, 0.028]}
            >
              <meshPhysicalMaterial
                color="#f43f5e"
                roughness={0.15}
                clearcoat={0.8}
              />
            </mesh>
            {/* Soft Rosy Blush Cheeks */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.155, 0.53, 0.185]}
              scale={[0.045, 0.028, 0.025]}
            >
              <meshStandardMaterial color="#fda4af" roughness={0.6} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.155, 0.53, 0.185]}
              scale={[0.045, 0.028, 0.025]}
            >
              <meshStandardMaterial color="#fda4af" roughness={0.6} />
            </mesh>
            {/* Subtle Silver Tabby Forehead Stripes */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.72, 0.195]}
              scale={[0.018, 0.05, 0.015]}
            >
              <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.045, 0.71, 0.19]}
              rotation={[0, 0, 0.2]}
              scale={[0.015, 0.04, 0.015]}
            >
              <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.045, 0.71, 0.19]}
              rotation={[0, 0, -0.2]}
              scale={[0.015, 0.04, 0.015]}
            >
              <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
            </mesh>
            {/* Expressive Dark Kitty Eyes with Specular Catchlights */}
            {renderExpressiveEye([-0.105, 0.59, 0.215], '#1e293b', 0.046)}
            {renderExpressiveEye([0.105, 0.59, 0.215], '#1e293b', 0.046)}

            {/* Pointed Kitty Ears with Soft Pink Inner Triangles */}
            <group
              position={[-0.17, 0.79, -0.01]}
              rotation={[0.1, 0.08, 0.28]}
            >
              <mesh
                geometry={SHARED_GEO.earCone}
                scale={[1.05, 0.98, 0.58]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.45}
                  clearcoat={0.2}
                />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.01, 0.025]}
                scale={[0.64, 0.7, 0.32]}
              >
                <meshStandardMaterial color="#fda4af" roughness={0.5} />
              </mesh>
            </group>
            <group
              position={[0.17, 0.79, -0.01]}
              rotation={[0.1, -0.08, -0.28]}
            >
              <mesh
                geometry={SHARED_GEO.earCone}
                scale={[1.05, 0.98, 0.58]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.45}
                  clearcoat={0.2}
                />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.01, 0.025]}
                scale={[0.64, 0.7, 0.32]}
              >
                <meshStandardMaterial color="#fda4af" roughness={0.5} />
              </mesh>
            </group>
          </group>
        )}

        {/* ================================================================ */}
        {/* 5. PANDA (CHUBBY SEATED BAMBOO MASTER FIGURINE)                  */}
        {/* ================================================================ */}
        {skin === 'panda' && (
          <group position={[0, 0.14, 0]}>
            {/* Plump Seated Panda Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.21, 0]}
              scale={[0.245, 0.215, 0.225]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#1e293b"
                roughness={0.55}
                clearcoat={0.18}
                sheen={0.5}
              />
            </mesh>
            {/* Round White Panda Belly Patch */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.18, 0.065]}
              scale={[0.195, 0.165, 0.18]}
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.48}
                clearcoat={0.2}
                sheen={0.6}
              />
            </mesh>
            {/* Chubby Black Side Arms */}
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[-0.225, 0.23, 0.05]}
              rotation={[0.25, 0, 0.28]}
              scale={[1.05, 1.0, 1.05]}
              castShadow
            >
              <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.225, 0.23, 0.05]}
              rotation={[0.25, 0, -0.28]}
              scale={[1.05, 1.0, 1.05]}
              castShadow
            >
              <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
            </mesh>
            {/* Seated Black Front Feet / Paws */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.115, 0.065, 0.185]}
              scale={[0.082, 0.062, 0.095]}
              castShadow
            >
              <meshPhysicalMaterial color="#0f172a" roughness={0.5} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.115, 0.065, 0.185]}
              scale={[0.082, 0.062, 0.095]}
              castShadow
            >
              <meshPhysicalMaterial color="#0f172a" roughness={0.5} />
            </mesh>

            {/* Oversized Round White Panda Head */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.58, 0.01]}
              scale={[0.295, 0.26, 0.255]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.45}
                clearcoat={0.25}
                sheen={0.7}
                sheenColor="#ffffff"
              />
            </mesh>
            {/* Rounded Snout / Muzzle */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.515, 0.215]}
              scale={[0.11, 0.082, 0.085]}
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.45} />
            </mesh>
            {/* Glossy Black Button Nose */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.548, 0.285]}
              scale={[0.042, 0.03, 0.03]}
            >
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.04}
                clearcoat={1}
              />
            </mesh>
            {/* Classic Tilted Oval Black Eye Patches */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.105, 0.59, 0.195]}
              rotation={[0, -0.22, -0.28]}
              scale={[0.082, 0.068, 0.05]}
            >
              <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.105, 0.59, 0.195]}
              rotation={[0, 0.22, 0.28]}
              scale={[0.082, 0.068, 0.05]}
            >
              <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
            </mesh>
            {/* Sparkling Glossy Eyes Inside Patches */}
            {renderExpressiveEye([-0.102, 0.595, 0.238], '#090d16', 0.038)}
            {renderExpressiveEye([0.102, 0.595, 0.238], '#090d16', 0.038)}

            {/* Big Round Black Panda Ears */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.21, 0.79, -0.02]}
              scale={[0.098, 0.098, 0.068]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.5}
                clearcoat={0.15}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.21, 0.79, -0.02]}
              scale={[0.098, 0.098, 0.068]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.5}
                clearcoat={0.15}
              />
            </mesh>
          </group>
        )}

        {/* ================================================================ */}
        {/* 6. ROBOT (CHIBI METALLIC CYBER MECHA UNIT)                       */}
        {/* ================================================================ */}
        {skin === 'robot' && (
          <group position={[0, 0.14, 0]}>
            {/* Sturdy Dark-Slate Mecha Boots */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.1, 0.055, 0.04]}
              scale={[0.085, 0.06, 0.11]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#334155"
                metalness={0.75}
                roughness={0.22}
                clearcoat={0.8}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.1, 0.055, 0.04]}
              scale={[0.085, 0.06, 0.11]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#334155"
                metalness={0.75}
                roughness={0.22}
                clearcoat={0.8}
              />
            </mesh>

            {/* Rounded Brushed-Aluminum Mecha Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.23, 0]}
              scale={[0.215, 0.195, 0.185]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.78}
                roughness={0.18}
                clearcoat={0.9}
                clearcoatRoughness={0.1}
              />
            </mesh>
            {/* Articulated Robot Arms */}
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[-0.24, 0.22, 0.02]}
              rotation={[0.1, 0, 0.22]}
              scale={[0.9, 1.05, 0.9]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.78}
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.24, 0.22, 0.02]}
              rotation={[0.1, 0, -0.22]}
              scale={[0.9, 1.05, 0.9]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.78}
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
            {/* Chest Diagnostic Control Panel + Micro LEDs */}
            <RoundedBox
              args={[0.21, 0.12, 0.04]}
              radius={0.02}
              smoothness={4}
              position={[0, 0.24, 0.165]}
            >
              <meshStandardMaterial
                color="#cbd5e1"
                metalness={0.6}
                roughness={0.25}
              />
            </RoundedBox>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.045, 0.24, 0.19]}
              scale={0.022}
            >
              <meshStandardMaterial
                color="#22c55e"
                emissive="#22c55e"
                emissiveIntensity={1.5}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.0, 0.24, 0.19]}
              scale={0.022}
            >
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#f59e0b"
                emissiveIntensity={1.5}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.045, 0.24, 0.19]}
              scale={0.022}
            >
              <meshStandardMaterial
                color="#ef4444"
                emissive="#ef4444"
                emissiveIntensity={1.5}
              />
            </mesh>

            {/* Pillowed Metallic Chibi Robot Head (RoundedBox) */}
            <RoundedBox
              args={[0.52, 0.39, 0.42]}
              radius={0.13}
              smoothness={8}
              position={[0, 0.58, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#94a3b8"
                metalness={0.78}
                roughness={0.16}
                clearcoat={1}
                clearcoatRoughness={0.08}
              />
            </RoundedBox>
            {/* Recessed Dark Navy Glass Visor Screen */}
            <RoundedBox
              args={[0.38, 0.23, 0.06]}
              radius={0.065}
              smoothness={6}
              position={[0, 0.59, 0.19]}
            >
              <meshPhysicalMaterial
                color="#091526"
                metalness={0.85}
                roughness={0.05}
                clearcoat={1}
                ior={1.6}
              />
            </RoundedBox>
            {/* Glowing Cyan LED Eyes + Bright White Core */}
            {[-0.095, 0.095].map((xPos, idx) => (
              <group key={idx} position={[xPos, 0.59, 0.222]}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  scale={[0.055, 0.055, 0.022]}
                >
                  <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#0ea5e9"
                    emissiveIntensity={2.4}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[0, 0, 0.012]}
                  scale={[0.028, 0.028, 0.012]}
                >
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
            {/* Copper/Bronze Ear Pods */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[-0.275, 0.58, 0]}
              rotation={[0, 0, Math.PI / 2]}
              scale={[0.075, 0.05, 0.075]}
            >
              <meshPhysicalMaterial
                color="#c2410c"
                metalness={0.75}
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0.275, 0.58, 0]}
              rotation={[0, 0, Math.PI / 2]}
              scale={[0.075, 0.05, 0.075]}
            >
              <meshPhysicalMaterial
                color="#c2410c"
                metalness={0.75}
                roughness={0.2}
                clearcoat={0.8}
              />
            </mesh>
            {/* Top Central Copper Beacon + Dual Angled Side Antennas */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0.81, 0]}
              scale={[0.032, 0.09, 0.032]}
            >
              <meshStandardMaterial
                color="#ea580c"
                metalness={0.75}
                roughness={0.2}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.87, 0]}
              scale={0.042}
            >
              <meshStandardMaterial
                color="#fb923c"
                emissive="#f97316"
                emissiveIntensity={1.6}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[-0.14, 0.79, 0]}
              rotation={[0, 0, 0.45]}
              scale={[0.016, 0.07, 0.016]}
            >
              <meshStandardMaterial
                color="#ea580c"
                metalness={0.75}
                roughness={0.2}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0.14, 0.79, 0]}
              rotation={[0, 0, -0.45]}
              scale={[0.016, 0.07, 0.016]}
            >
              <meshStandardMaterial
                color="#ea580c"
                metalness={0.75}
                roughness={0.2}
              />
            </mesh>
          </group>
        )}

        {/* ================================================================ */}
        {/* 7. ASTRONAUT (STARFARER VOYAGER CHIBI SPACESUIT)                 */}
        {/* ================================================================ */}
        {skin === 'astronaut' && (
          <group position={[0, 0.14, 0]}>
            {/* Grey Moon Boots */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.095, 0.055, 0.04]}
              scale={[0.082, 0.06, 0.105]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#64748b"
                roughness={0.35}
                metalness={0.3}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.095, 0.055, 0.04]}
              scale={[0.082, 0.06, 0.105]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#64748b"
                roughness={0.35}
                metalness={0.3}
              />
            </mesh>

            {/* Plump White EVA Spacesuit Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.23, 0]}
              scale={[0.22, 0.2, 0.195]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.22}
                clearcoat={0.85}
                sheen={0.4}
              />
            </mesh>
            {/* Rear Life-Support Oxygen Pack */}
            <RoundedBox
              args={[0.28, 0.26, 0.14]}
              radius={0.04}
              smoothness={4}
              position={[0, 0.25, -0.17]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#e2e8f0"
                roughness={0.28}
                metalness={0.25}
                clearcoat={0.6}
              />
            </RoundedBox>
            {/* Chubby Spacesuit Arms with Coral Gloves */}
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[-0.24, 0.22, 0.02]}
              rotation={[0.15, 0, 0.24]}
              scale={[0.92, 1.0, 0.92]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.25}
                clearcoat={0.8}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.24, 0.22, 0.02]}
              rotation={[0.15, 0, -0.24]}
              scale={[0.92, 1.0, 0.92]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.25}
                clearcoat={0.8}
              />
            </mesh>
            {/* Chest Control Dial & Telemetry Ports */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0.25, 0.188]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.048, 0.02, 0.048]}
            >
              <meshStandardMaterial
                color="#ea580c"
                metalness={0.5}
                roughness={0.2}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.075, 0.21, 0.18]}
              scale={0.022}
            >
              <meshStandardMaterial color="#334155" />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.075, 0.21, 0.18]}
              scale={0.026}
            >
              <meshStandardMaterial color="#fb7185" />
            </mesh>

            {/* Metallic Helmet Neck Ring in Player Color */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.39, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <meshStandardMaterial
                color={palette.threeHex}
                metalness={0.65}
                roughness={0.2}
              />
            </mesh>
            {/* Oversized Glossy White Space Helmet */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.6, 0]}
              scale={[0.295, 0.275, 0.28]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.1}
                clearcoat={1}
                clearcoatRoughness={0.04}
                ior={1.55}
              />
            </mesh>
            {/* Deep-Space Mirror Bubble Visor */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.6, 0.095]}
              scale={[0.225, 0.195, 0.215]}
            >
              <meshPhysicalMaterial
                color="#091930"
                metalness={0.92}
                roughness={0.03}
                clearcoat={1}
                clearcoatRoughness={0.0}
                ior={1.7}
              />
            </mesh>
            {/* Crisp Curved Specular Glint on Helmet Visor */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.085, 0.675, 0.275]}
              rotation={[0, 0, 0.45]}
              scale={[0.052, 0.024, 0.015]}
            >
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Coral-Pink Side Comms Ear Caps */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.29, 0.59, 0]}
              scale={[0.04, 0.085, 0.085]}
            >
              <meshPhysicalMaterial
                color="#fda4af"
                roughness={0.25}
                clearcoat={0.8}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.29, 0.59, 0]}
              scale={[0.04, 0.085, 0.085]}
            >
              <meshPhysicalMaterial
                color="#fda4af"
                roughness={0.25}
                clearcoat={0.8}
              />
            </mesh>
          </group>
        )}

        {/* ================================================================ */}
        {/* 8. UNICORN (CELESTIAL MYTH BABY UNICORN FIGURINE)                */}
        {/* ================================================================ */}
        {skin === 'unicorn' && (
          <group position={[0, 0.14, 0]}>
            {/* Plump Seated Pure-White Unicorn Body */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.2, -0.02]}
              scale={[0.215, 0.205, 0.22]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.32}
                clearcoat={0.65}
                sheen={0.7}
                sheenColor="#fdf4ff"
              />
            </mesh>
            {/* Four Cute Seated Hooves / Legs */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.085, 0.055, 0.155]}
              scale={[0.068, 0.055, 0.082]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.3}
                clearcoat={0.7}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.085, 0.055, 0.155]}
              scale={[0.068, 0.055, 0.082]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.3}
                clearcoat={0.7}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.175, 0.09, -0.04]}
              scale={[0.065, 0.085, 0.095]}
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.35} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.175, 0.09, -0.04]}
              scale={[0.065, 0.085, 0.095]}
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.35} />
            </mesh>

            {/* Sculpted Unicorn Head */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.56, 0.01]}
              scale={[0.245, 0.235, 0.24]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.28}
                clearcoat={0.75}
                sheen={0.7}
              />
            </mesh>
            {/* Forward-Protruding Sculpted Unicorn Snout / Muzzle */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.505, 0.2]}
              rotation={[0.2, 0, 0]}
              scale={[0.145, 0.12, 0.145]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.3}
                clearcoat={0.7}
              />
            </mesh>
            {/* Cute Pink Nostrils & Rosy Blush */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.045, 0.525, 0.325]}
              scale={0.018}
            >
              <meshStandardMaterial color="#f43f5e" />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.045, 0.525, 0.325]}
              scale={0.018}
            >
              <meshStandardMaterial color="#f43f5e" />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.15, 0.52, 0.16]}
              scale={[0.038, 0.025, 0.025]}
            >
              <meshStandardMaterial color="#fbcfe8" />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.15, 0.52, 0.16]}
              scale={[0.038, 0.025, 0.025]}
            >
              <meshStandardMaterial color="#fbcfe8" />
            </mesh>

            {/* Large Expressive Eyes with Specular Catchlights */}
            {renderExpressiveEye([-0.115, 0.575, 0.175], '#3b0764', 0.044)}
            {renderExpressiveEye([0.115, 0.575, 0.175], '#3b0764', 0.044)}

            {/* Pointed White Equine Ears with Pink Hollows */}
            <group
              position={[-0.14, 0.77, -0.02]}
              rotation={[-0.1, 0, 0.25]}
            >
              <mesh
                geometry={SHARED_GEO.earCone}
                scale={[0.68, 0.85, 0.52]}
                castShadow
              >
                <meshPhysicalMaterial color="#ffffff" roughness={0.3} />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.01, 0.02]}
                scale={[0.4, 0.6, 0.3]}
              >
                <meshStandardMaterial color="#f9a8d4" />
              </mesh>
            </group>
            <group
              position={[0.14, 0.77, -0.02]}
              rotation={[-0.1, 0, -0.25]}
            >
              <mesh
                geometry={SHARED_GEO.earCone}
                scale={[0.68, 0.85, 0.52]}
                castShadow
              >
                <meshPhysicalMaterial color="#ffffff" roughness={0.3} />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.01, 0.02]}
                scale={[0.4, 0.6, 0.3]}
              >
                <meshStandardMaterial color="#f9a8d4" />
              </mesh>
            </group>

            {/* Spiraled Golden Unicorn Horn on Forehead */}
            <group position={[0, 0.86, 0.12]} rotation={[0.32, 0, 0]}>
              <mesh geometry={SHARED_GEO.hornCone} castShadow>
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.92}
                  roughness={0.1}
                  clearcoat={1}
                  emissive="#d97706"
                  emissiveIntensity={0.25}
                />
              </mesh>
              {/* Spiral Ridges Around Horn */}
              {[0, 1, 2].map((rIdx) => (
                <mesh
                  key={rIdx}
                  geometry={SHARED_GEO.collarTorus}
                  position={[0, -0.08 + rIdx * 0.065, 0]}
                  rotation={[Math.PI / 2 + 0.2, 0, 0]}
                  scale={0.24 - rIdx * 0.055}
                >
                  <meshStandardMaterial
                    color="#fde047"
                    metalness={0.95}
                    roughness={0.08}
                  />
                </mesh>
              ))}
            </group>

            {/* Lush Sculpted Hot-Pink Flowing Forelock, Side Mane & Tail */}
            {/* Sweeping Forelock Puff Over Forehead */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.02, 0.74, 0.08]}
              rotation={[0.2, 0, -0.25]}
              scale={[0.14, 0.095, 0.13]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ec4899"
                roughness={0.38}
                clearcoat={0.4}
                sheen={0.8}
                sheenColor="#fbcfe8"
              />
            </mesh>
            {/* Cascading Pink Mane Waves Along Back & Side */}
            {[
              { x: 0.06, y: 0.7, z: -0.14, sx: 0.12, sy: 0.13, sz: 0.12 },
              { x: 0.11, y: 0.56, z: -0.18, sx: 0.11, sy: 0.14, sz: 0.12 },
              { x: 0.13, y: 0.41, z: -0.17, sx: 0.11, sy: 0.13, sz: 0.11 },
              { x: 0.12, y: 0.27, z: -0.16, sx: 0.1, sy: 0.11, sz: 0.11 },
              { x: 0, y: 0.18, z: -0.23, sx: 0.11, sy: 0.12, sz: 0.12 },
            ].map((m, idx) => (
              <mesh
                key={idx}
                geometry={SHARED_GEO.lowSphere}
                position={[m.x, m.y, m.z]}
                scale={[m.sx, m.sy, m.sz]}
                castShadow
              >
                <meshPhysicalMaterial
                  color={idx % 2 === 0 ? '#ec4899' : '#db2777'}
                  roughness={0.38}
                  clearcoat={0.4}
                  sheen={0.8}
                  sheenColor="#fbcfe8"
                />
              </mesh>
            ))}
          </group>
        )}

        {/* ================================================================ */}
        {/* 9. BAMBOO PANDA (ULTRA-MOCHI CUTE BABY FIGURINE - REFERENCE #8) */}
        {/* ================================================================ */}
        {skin === 'bamboo-panda' && (
          <group position={[0, 0.14, 0]}>
            {/* Emerald Green Themed Upper Pedestal Collar with Golden Bamboo Ring */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#16a34a"
                roughness={0.14}
                metalness={0.18}
                clearcoat={1}
                ior={1.55}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, -0.04, 0]}
              scale={1.22}
            >
              <meshStandardMaterial
                color="#eab308"
                metalness={0.88}
                roughness={0.15}
              />
            </mesh>

            {/* Plump Chubby Pear-Shaped Panda Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.2, -0.01]}
              scale={[0.26, 0.225, 0.24]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#171717"
                roughness={0.52}
                clearcoat={0.18}
                sheen={0.6}
              />
            </mesh>
            {/* Plump Cream-White Belly Pot */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.185, 0.075]}
              scale={[0.21, 0.18, 0.19]}
            >
              <meshPhysicalMaterial
                color="#fffdfa"
                roughness={0.42}
                clearcoat={0.25}
                sheen={0.75}
              />
            </mesh>

            {/* Forward-Facing Seated Black Hind Feet with Pink/Grey Bean Pads */}
            {[-0.13, 0.13].map((xFoot, fIdx) => (
              <group key={fIdx} position={[xFoot, 0.07, 0.19]}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  scale={[0.088, 0.072, 0.098]}
                  castShadow
                >
                  <meshPhysicalMaterial color="#171717" roughness={0.48} />
                </mesh>
                {/* Main Sole Pad */}
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[0, -0.01, 0.085]}
                  scale={[0.04, 0.03, 0.02]}
                >
                  <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
                </mesh>
                {/* 3 Baby Toe Beans */}
                {[-0.03, 0, 0.03].map((tx, tIdx) => (
                  <mesh
                    key={tIdx}
                    geometry={SHARED_GEO.lowSphere}
                    position={[tx, 0.028 - Math.abs(tx) * 0.2, 0.085]}
                    scale={0.013}
                  >
                    <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Both Chubby Baby Arms Hugging Bamboo Stalk to Chest */}
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[-0.14, 0.22, 0.17]}
              rotation={[0.4, 0.5, 0.6]}
              scale={[1.05, 1.0, 1.05]}
              castShadow
            >
              <meshPhysicalMaterial color="#171717" roughness={0.5} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.13, 0.22, 0.18]}
              rotation={[0.4, -0.4, -0.55]}
              scale={[1.05, 1.0, 1.05]}
              castShadow
            >
              <meshPhysicalMaterial color="#171717" roughness={0.5} />
            </mesh>

            {/* Held Fresh Green Bamboo Twig with Nodes & 3 Spreading Leaves */}
            <group position={[0.01, 0.24, 0.24]} rotation={[0.08, 0.08, -0.32]}>
              <mesh
                geometry={SHARED_GEO.unitCylinder}
                scale={[0.022, 0.36, 0.022]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#15803d"
                  roughness={0.25}
                  clearcoat={0.7}
                />
              </mesh>
              {[-0.08, 0.08].map((ny, nIdx) => (
                <mesh
                  key={nIdx}
                  geometry={SHARED_GEO.collarTorus}
                  position={[0, ny, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.14}
                >
                  <meshStandardMaterial color="#166534" roughness={0.35} />
                </mesh>
              ))}
              {/* Lush Spreading Bamboo Leaves */}
              {[
                { x: 0.05, y: 0.13, rz: -0.7, s: 1.0 },
                { x: -0.04, y: 0.09, rz: 0.65, s: 0.92 },
                { x: 0.035, y: 0.19, rz: -0.28, s: 0.95 },
              ].map((lf, lIdx) => (
                <mesh
                  key={lIdx}
                  geometry={SHARED_GEO.lowSphere}
                  position={[lf.x, lf.y, 0.015]}
                  rotation={[0.18, 0, lf.rz]}
                  scale={[0.024 * lf.s, 0.078 * lf.s, 0.01]}
                >
                  <meshPhysicalMaterial
                    color={lIdx % 2 === 0 ? '#22c55e' : '#16a34a'}
                    roughness={0.3}
                    clearcoat={0.6}
                  />
                </mesh>
              ))}
            </group>

            {/* Giant Chubby Mochi Panda Head (Wider at Lower Cheeks) */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.54, 0.01]}
              scale={[0.32, 0.23, 0.27]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.4}
                clearcoat={0.3}
                sheen={0.8}
                sheenColor="#ffffff"
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.61, 0.0]}
              scale={[0.27, 0.23, 0.25]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.4}
                clearcoat={0.3}
                sheen={0.8}
              />
            </mesh>
            {/* Plump Fluffy Mochi Cheeks on Lower Sides */}
            {[-0.17, 0.17].map((cx, cIdx) => (
              <mesh
                key={cIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[cx, 0.52, 0.12]}
                scale={[0.13, 0.11, 0.12]}
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.42}
                  sheen={0.7}
                />
              </mesh>
            ))}

            {/* Soft Cream Muzzle, Tiny Button Nose & Smile Crease */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.51, 0.23]}
              scale={[0.11, 0.08, 0.085]}
            >
              <meshPhysicalMaterial color="#ffffff" roughness={0.38} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.542, 0.298]}
              scale={[0.044, 0.028, 0.028]}
            >
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.02}
                clearcoat={1}
              />
            </mesh>
            {/* Sweet Rosy Cheeks */}
            {[-0.165, 0.165].map((bx, bIdx) => (
              <mesh
                key={bIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[bx, 0.515, 0.2]}
                scale={[0.048, 0.028, 0.025]}
              >
                <meshStandardMaterial color="#fda4af" roughness={0.55} />
              </mesh>
            ))}

            {/* Iconic 42° Tilted Teardrop Oval Black Eye Patches */}
            {[-1, 1].map((sign, pIdx) => (
              <mesh
                key={pIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[sign * 0.115, 0.605, 0.21]}
                rotation={[0, sign * 0.22, sign * -0.72]}
                scale={[0.088, 0.115, 0.048]}
              >
                <meshPhysicalMaterial
                  color="#171717"
                  roughness={0.52}
                  sheen={0.5}
                />
              </mesh>
            ))}

            {/* GIANT Liquid Glassy Black Kawaii Eyes with Dual Specular Catchlights */}
            {renderExpressiveEye([-0.108, 0.605, 0.245], '#111827', 0.052)}
            {renderExpressiveEye([0.108, 0.605, 0.245], '#111827', 0.052)}

            {/* Round Plush Velvet Black Ears */}
            {[-0.22, 0.22].map((ex, eIdx) => (
              <mesh
                key={eIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[ex, 0.79, -0.01]}
                scale={[0.11, 0.11, 0.075]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#171717"
                  roughness={0.52}
                  clearcoat={0.18}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* ================================================================ */}
        {/* 10. CYBER ROBOT (NEW UNIQUE HDR - WHITE PEARL & DUAL ANTENNAE)   */}
        {/* ================================================================ */}
        {skin === 'cyber-robot' && (
          <group position={[0, 0.14, 0]}>
            {/* Brushed Silver Pedestal Collar + 3 Glowing Cyan LED Rim Orbs */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.85}
                roughness={0.16}
                clearcoat={1}
              />
            </mesh>
            {[-0.55, 0, 0.55].map((ang, lIdx) => (
              <mesh
                key={lIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[
                  Math.sin(ang) * 0.33,
                  -0.04,
                  Math.cos(ang) * 0.33,
                ]}
                scale={[0.032, 0.032, 0.02]}
              >
                <meshStandardMaterial
                  color="#38bdf8"
                  emissive="#00e5ff"
                  emissiveIntensity={2.6}
                />
              </mesh>
            ))}
            {/* Seated White-Pearl Android Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.22, 0]}
              scale={[0.215, 0.195, 0.19]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                metalness={0.18}
                roughness={0.1}
                clearcoat={1}
                ior={1.55}
              />
            </mesh>
            {/* Central Glowing Orange Energy Core + Silver Bezel */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.22, 0.175]}
              scale={0.32}
            >
              <meshStandardMaterial
                color="#94a3b8"
                metalness={0.85}
                roughness={0.15}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.22, 0.175]}
              scale={[0.055, 0.055, 0.028]}
            >
              <meshStandardMaterial
                color="#fb923c"
                emissive="#f97316"
                emissiveIntensity={2.2}
              />
            </mesh>
            {/* Seated Android Feet with Dark Navy Soles & Orange Ankle Rings */}
            {[-0.105, 0.105].map((fx, fIdx) => (
              <group key={fIdx} position={[fx, 0.07, 0.155]}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  scale={[0.072, 0.068, 0.082]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#1e293b"
                    metalness={0.65}
                    roughness={0.2}
                    clearcoat={0.9}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.collarTorus}
                  position={[0, 0.01, -0.02]}
                  rotation={[Math.PI / 3, 0, 0]}
                  scale={0.34}
                >
                  <meshStandardMaterial
                    color="#f97316"
                    emissive="#ea580c"
                    emissiveIntensity={0.8}
                  />
                </mesh>
              </group>
            ))}
            {/* Articulated White Arms with Orange Shoulder Rings */}
            {[-0.225, 0.225].map((ax, aIdx) => (
              <group key={aIdx} position={[ax, 0.22, 0.04]}>
                <mesh
                  geometry={SHARED_GEO.capsuleLimb}
                  rotation={[0.25, 0, aIdx === 0 ? 0.28 : -0.28]}
                  scale={[0.88, 0.95, 0.88]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#f8fafc"
                    roughness={0.12}
                    clearcoat={1}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.collarTorus}
                  position={[0, 0.05, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.32}
                >
                  <meshStandardMaterial
                    color="#f97316"
                    emissive="#ea580c"
                    emissiveIntensity={0.8}
                  />
                </mesh>
              </group>
            ))}
            {/* Pillowed White-Pearl Robot Helmet */}
            <RoundedBox
              args={[0.53, 0.4, 0.42]}
              radius={0.15}
              smoothness={8}
              position={[0, 0.58, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                metalness={0.15}
                roughness={0.08}
                clearcoat={1}
                clearcoatRoughness={0.03}
                ior={1.55}
              />
            </RoundedBox>
            {/* Recessed Deep-Navy Curved Screen Visor */}
            <RoundedBox
              args={[0.41, 0.25, 0.06]}
              radius={0.08}
              smoothness={6}
              position={[0, 0.585, 0.19]}
            >
              <meshPhysicalMaterial
                color="#061229"
                metalness={0.9}
                roughness={0.03}
                clearcoat={1}
                ior={1.65}
              />
            </RoundedBox>
            {/* 2 Glowing Neon-Cyan Eyes + Cute Curved Smile */}
            {[-0.095, 0.095].map((ex, eIdx) => (
              <group key={eIdx} position={[ex, 0.59, 0.222]}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  scale={[0.058, 0.058, 0.02]}
                >
                  <meshStandardMaterial
                    color="#38bdf8"
                    emissive="#00e5ff"
                    emissiveIntensity={2.8}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[0, 0, 0.012]}
                  scale={[0.028, 0.028, 0.01]}
                >
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            ))}
            {/* Side Silver & Glowing Orange Ear Pods */}
            {[-0.28, 0.28].map((px, pIdx) => (
              <mesh
                key={pIdx}
                geometry={SHARED_GEO.unitCylinder}
                position={[px, 0.58, 0]}
                rotation={[0, 0, Math.PI / 2]}
                scale={[0.082, 0.045, 0.082]}
              >
                <meshPhysicalMaterial
                  color="#f97316"
                  emissive="#ea580c"
                  emissiveIntensity={0.65}
                  metalness={0.5}
                  roughness={0.2}
                  clearcoat={1}
                />
              </mesh>
            ))}
            {/* Dual V-Shape Top Antennae with Glowing Orange Ball Tips */}
            {[-0.095, 0.095].map((tx, tIdx) => {
              const sign = tIdx === 0 ? 1 : -1;
              return (
                <group
                  key={tIdx}
                  position={[tx, 0.81, 0]}
                  rotation={[0, 0, sign * 0.28]}
                >
                  <mesh
                    geometry={SHARED_GEO.unitCylinder}
                    scale={[0.018, 0.11, 0.018]}
                  >
                    <meshStandardMaterial
                      color="#94a3b8"
                      metalness={0.88}
                      roughness={0.15}
                    />
                  </mesh>
                  <mesh
                    geometry={SHARED_GEO.lowSphere}
                    position={[0, 0.068, 0]}
                    scale={0.044}
                  >
                    <meshPhysicalMaterial
                      color="#f97316"
                      emissive="#ea580c"
                      emissiveIntensity={1.4}
                      roughness={0.1}
                      clearcoat={1}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}

        {/* ================================================================ */}
        {/* 11. ASTRONOMER (NEW UNIQUE HDR - STARLIGHT PEDESTAL & EVA SUIT)  */}
        {/* ================================================================ */}
        {skin === 'astronomer' && (
          <group position={[0, 0.14, 0]}>
            {/* Deep Cosmic-Sapphire Pedestal Collar + 3 Starlight LED Ports */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#1e3a8a"
                metalness={0.78}
                roughness={0.14}
                clearcoat={1}
              />
            </mesh>
            {[-0.55, 0, 0.55].map((ang, lIdx) => (
              <mesh
                key={lIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[
                  Math.sin(ang) * 0.33,
                  -0.04,
                  Math.cos(ang) * 0.33,
                ]}
                scale={[0.032, 0.032, 0.02]}
              >
                <meshStandardMaterial
                  color="#bae6fd"
                  emissive="#38bdf8"
                  emissiveIntensity={2.8}
                />
              </mesh>
            ))}
            {/* Seated White NASA EVA Suit Torso */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.22, 0]}
              scale={[0.225, 0.2, 0.2]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.24}
                clearcoat={0.85}
                sheen={0.5}
              />
            </mesh>
            {/* Chest Telemetry Unit with Gold/Orange Controls */}
            <RoundedBox
              args={[0.17, 0.11, 0.045]}
              radius={0.02}
              smoothness={4}
              position={[0, 0.23, 0.185]}
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.2}
                clearcoat={0.9}
              />
            </RoundedBox>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.23, 0.21]}
              scale={[0.04, 0.03, 0.015]}
            >
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#d97706"
                emissiveIntensity={0.8}
              />
            </mesh>
            {/* Seated Moon Boots & Arms with Orange Mission Stripes */}
            {[-0.105, 0.105].map((fx, fIdx) => (
              <mesh
                key={fIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[fx, 0.075, 0.165]}
                scale={[0.078, 0.068, 0.09]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#f1f5f9"
                  roughness={0.28}
                  clearcoat={0.7}
                />
              </mesh>
            ))}
            {[-0.225, 0.225].map((ax, aIdx) => (
              <group key={aIdx} position={[ax, 0.22, 0.04]}>
                <mesh
                  geometry={SHARED_GEO.capsuleLimb}
                  rotation={[0.25, 0, aIdx === 0 ? 0.28 : -0.28]}
                  scale={[0.92, 0.98, 0.92]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#f8fafc"
                    roughness={0.25}
                    clearcoat={0.8}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.collarTorus}
                  position={[0, 0.03, 0]}
                  rotation={[Math.PI / 2, 0, 0]}
                  scale={0.34}
                >
                  <meshStandardMaterial color="#f97316" roughness={0.25} />
                </mesh>
              </group>
            ))}
            {/* Rear Life-Support Backpack */}
            <RoundedBox
              args={[0.28, 0.26, 0.15]}
              radius={0.04}
              smoothness={4}
              position={[0, 0.25, -0.17]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#e2e8f0"
                roughness={0.25}
                metalness={0.2}
                clearcoat={0.7}
              />
            </RoundedBox>
            {/* Oversized White EVA Space Helmet */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.595, 0]}
              scale={[0.3, 0.28, 0.285]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.08}
                clearcoat={1}
                clearcoatRoughness={0.03}
                ior={1.55}
              />
            </mesh>
            {/* Deep-Space Midnight Mirror Bubble Visor */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.595, 0.095]}
              scale={[0.232, 0.205, 0.22]}
            >
              <meshPhysicalMaterial
                color="#051026"
                metalness={0.95}
                roughness={0.02}
                clearcoat={1}
                clearcoatRoughness={0.0}
                ior={1.75}
              />
            </mesh>
            {/* Specular Glint Arc on Visor */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.09, 0.675, 0.28]}
              rotation={[0, 0, 0.45]}
              scale={[0.058, 0.026, 0.015]}
            >
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            {/* Orange Helmet Comms Ear Caps */}
            {[-0.295, 0.295].map((ex, eIdx) => (
              <mesh
                key={eIdx}
                geometry={SHARED_GEO.unitCylinder}
                position={[ex, 0.59, 0]}
                rotation={[0, 0, Math.PI / 2]}
                scale={[0.08, 0.04, 0.08]}
              >
                <meshPhysicalMaterial
                  color="#f97316"
                  roughness={0.2}
                  clearcoat={0.9}
                />
              </mesh>
            ))}
          </group>
        )}

        {/* ================================================================ */}
        {/* 12. STAR UNICORN (DESIGNER PONY FIGURINE - REFERENCE #11)        */}
        {/* ================================================================ */}
        {skin === 'star-unicorn' && (
          <group position={[0, 0.14, 0]}>
            {/* Candy-Pink Pedestal Collar + 3 Raised 3D Golden Stars */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#ec4899"
                roughness={0.14}
                metalness={0.14}
                clearcoat={1}
              />
            </mesh>
            {[-0.6, 0, 0.6].map((ang, sIdx) => (
              <mesh
                key={sIdx}
                geometry={SHARED_GEO.star3D}
                position={[
                  Math.sin(ang) * 0.33,
                  -0.04,
                  Math.cos(ang) * 0.33,
                ]}
                rotation={[0, ang, 0]}
                scale={0.82}
              >
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.94}
                  roughness={0.08}
                  clearcoat={1}
                />
              </mesh>
            ))}

            {/* Seated Porcelain-White Pony Body & Pastel Pink Hooves */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.2, -0.02]}
              scale={[0.22, 0.21, 0.225]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.24}
                clearcoat={0.85}
                sheen={0.8}
                sheenColor="#fdf4ff"
              />
            </mesh>
            {[-0.09, 0.09].map((hx, hIdx) => (
              <mesh
                key={hIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[hx, 0.055, 0.16]}
                scale={[0.072, 0.055, 0.088]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#fbcfe8"
                  roughness={0.26}
                  clearcoat={0.8}
                />
              </mesh>
            ))}

            {/* Sculpted Graceful Chibi Pony Head & Snout */}
            <group rotation={[0, -0.12, 0]}>
              <mesh
                geometry={SHARED_GEO.unitSphere}
                position={[0, 0.56, 0.01]}
                scale={[0.25, 0.24, 0.245]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.24}
                  clearcoat={0.85}
                  sheen={0.8}
                />
              </mesh>
              {/* Sweet Rounded Pony Muzzle & Nostrils */}
              <mesh
                geometry={SHARED_GEO.unitSphere}
                position={[0, 0.505, 0.2]}
                rotation={[0.18, 0, 0]}
                scale={[0.145, 0.12, 0.145]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.25}
                  clearcoat={0.82}
                />
              </mesh>
              {[-0.045, 0.045].map((nx, nIdx) => (
                <mesh
                  key={nIdx}
                  geometry={SHARED_GEO.lowSphere}
                  position={[nx, 0.525, 0.325]}
                  scale={0.018}
                >
                  <meshStandardMaterial color="#f43f5e" />
                </mesh>
              ))}

              {/* Enchanting Violet/Amethyst Eyes with Dual Starlight Catchlights */}
              {renderExpressiveEye([-0.112, 0.585, 0.185], '#581c87', 0.05)}
              {renderExpressiveEye([0.112, 0.585, 0.185], '#581c87', 0.05)}

              {/* Pointed Equine Ears with Soft Pink Hollows */}
              {[-0.145, 0.145].map((ex, eIdx) => {
                const sign = eIdx === 0 ? 1 : -1;
                return (
                  <group
                    key={eIdx}
                    position={[ex, 0.775, -0.02]}
                    rotation={[-0.1, 0, sign * 0.24]}
                  >
                    <mesh
                      geometry={SHARED_GEO.earCone}
                      scale={[0.7, 0.88, 0.54]}
                      castShadow
                    >
                      <meshPhysicalMaterial color="#ffffff" roughness={0.26} />
                    </mesh>
                    <mesh
                      geometry={SHARED_GEO.earCone}
                      position={[0, -0.01, 0.022]}
                      scale={[0.42, 0.62, 0.32]}
                    >
                      <meshStandardMaterial color="#f9a8d4" />
                    </mesh>
                  </group>
                );
              })}

              {/* Twisted Golden Helical Spiral Alicorn Horn */}
              <mesh
                geometry={SHARED_GEO.spiralHorn}
                position={[0, 0.75, 0.08]}
                rotation={[0.26, 0, 0]}
                scale={0.95}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.95}
                  roughness={0.08}
                  clearcoat={1}
                  emissive="#d97706"
                  emissiveIntensity={0.25}
                />
              </mesh>

              {/* Whipped-Frosting Cascading Mane Locks in Pastel Pink & Lavender */}
              {[
                { x: 0.02, y: 0.76, z: 0.09, sx: 0.14, sy: 0.1, sz: 0.13, col: '#f472b6' },
                { x: 0.08, y: 0.71, z: -0.12, sx: 0.125, sy: 0.135, sz: 0.125, col: '#ec4899' },
                { x: 0.13, y: 0.57, z: -0.16, sx: 0.12, sy: 0.145, sz: 0.125, col: '#c084fc' },
                { x: 0.14, y: 0.42, z: -0.15, sx: 0.115, sy: 0.135, sz: 0.115, col: '#f472b6' },
                { x: 0.12, y: 0.28, z: -0.15, sx: 0.11, sy: 0.115, sz: 0.11, col: '#db2777' },
                { x: 0.02, y: 0.18, z: -0.23, sx: 0.115, sy: 0.125, sz: 0.125, col: '#c084fc' },
              ].map((m, idx) => (
                <mesh
                  key={idx}
                  geometry={SHARED_GEO.lowSphere}
                  position={[m.x, m.y, m.z]}
                  scale={[m.sx, m.sy, m.sz]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color={m.col}
                    roughness={0.32}
                    clearcoat={0.6}
                    sheen={0.85}
                    sheenColor="#fbcfe8"
                  />
                </mesh>
              ))}
            </group>
          </group>
        )}

        {/* ================================================================ */}
        {/* 13. FIRE DRAGON (CHUBBY BABY DRAKE FIGURINE - REFERENCE #1)     */}
        {/* ================================================================ */}
        {skin === 'fire-dragon' && (
          <group position={[0, 0.14, 0]}>
            {/* Crimson Pedestal Collar + 3D Flame Relief Emblem */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#dc2626"
                roughness={0.14}
                metalness={0.16}
                clearcoat={1}
              />
            </mesh>
            {/* 3D Sculpted Flame Emblem on Pedestal Front */}
            <group position={[0, -0.04, 0.33]}>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, 0.012, 0]}
                scale={[0.36, 0.44, 0.18]}
              >
                <meshStandardMaterial
                  color="#f97316"
                  emissive="#ea580c"
                  emissiveIntensity={1.4}
                />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.004, 0.012]}
                scale={[0.2, 0.28, 0.14]}
              >
                <meshStandardMaterial
                  color="#fde047"
                  emissive="#facc15"
                  emissiveIntensity={1.6}
                />
              </mesh>
            </group>

            {/* Ultra-Chubby Pear-Shaped Baby Dragon Pot-Belly */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.2, -0.01]}
              scale={[0.26, 0.235, 0.245]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ef4444"
                roughness={0.28}
                clearcoat={0.8}
                sheen={0.65}
                sheenColor="#fca5a5"
              />
            </mesh>

            {/* 4 Sculpted Horizontal Segmented Golden Belly Rib Plates */}
            {[
              { y: 0.11, sx: 0.165, sz: 0.145 },
              { y: 0.16, sx: 0.155, sz: 0.14 },
              { y: 0.21, sx: 0.14, sz: 0.13 },
              { y: 0.26, sx: 0.12, sz: 0.115 },
            ].map((plate, pIdx) => (
              <mesh
                key={pIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[0, plate.y, 0.13]}
                scale={[plate.sx, 0.038, plate.sz]}
              >
                <meshPhysicalMaterial
                  color="#fef08a"
                  roughness={0.28}
                  clearcoat={0.6}
                  sheen={0.4}
                />
              </mesh>
            ))}

            {/* Two Chubby Baby Dragon Arms with Paws Resting on Lower Belly */}
            {[-1, 1].map((sign, armIdx) => (
              <group key={armIdx} position={[sign * 0.14, 0.18, 0.1]}>
                <mesh
                  geometry={SHARED_GEO.capsuleLimb}
                  rotation={[0.42, sign * -0.35, sign * -0.55]}
                  scale={[0.9, 0.95, 0.9]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#ef4444"
                    roughness={0.3}
                    clearcoat={0.6}
                  />
                </mesh>
                {/* 3 Tiny Golden Claws on Each Baby Paw */}
                {[-0.02, 0, 0.02].map((cx, cIdx) => (
                  <mesh
                    key={cIdx}
                    geometry={SHARED_GEO.lowSphere}
                    position={[sign * -0.05 + cx, -0.05, 0.08]}
                    scale={[0.012, 0.016, 0.012]}
                  >
                    <meshStandardMaterial
                      color="#fbbf24"
                      metalness={0.85}
                      roughness={0.15}
                    />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Seated Hind Thighs & Rounded Foot Pads on Pedestal */}
            {[-0.135, 0.135].map((px, pIdx) => (
              <group key={pIdx} position={[px, 0.07, 0.16]}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  scale={[0.082, 0.065, 0.092]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#dc2626"
                    roughness={0.32}
                    clearcoat={0.6}
                  />
                </mesh>
                {/* Sole Pad */}
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[0, -0.01, 0.075]}
                  scale={[0.038, 0.026, 0.02]}
                >
                  <meshStandardMaterial color="#fef08a" roughness={0.4} />
                </mesh>
              </group>
            ))}

            {/* Curled Dragon Tail with Spade Flame Tip */}
            <mesh
              geometry={SHARED_GEO.tailTorus}
              position={[-0.14, 0.13, -0.15]}
              rotation={[0.4, 0.6, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#dc2626"
                roughness={0.3}
                clearcoat={0.6}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.earCone}
              position={[-0.19, 0.22, -0.18]}
              rotation={[-0.5, 0, -0.8]}
              scale={[0.07, 0.12, 0.04]}
            >
              <meshStandardMaterial
                color="#f59e0b"
                emissive="#d97706"
                emissiveIntensity={0.8}
              />
            </mesh>

            {/* Cute Miniature Scalloped Bat Wings on Back */}
            {[-1, 1].map((side, wIdx) => (
              <group
                key={wIdx}
                position={[side * 0.16, 0.28, -0.11]}
                rotation={[0.15, side * -0.42, side * -0.25]}
              >
                <mesh
                  geometry={SHARED_GEO.earCone}
                  rotation={[0, 0, side * -1.1]}
                  scale={[0.88, 1.05, 0.22]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#b91c1c"
                    roughness={0.32}
                    clearcoat={0.5}
                  />
                </mesh>
                {/* Gold Wing-Tip Thumb Claw */}
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[side * 0.06, 0.1, 0]}
                  scale={0.018}
                >
                  <meshStandardMaterial
                    color="#fbbf24"
                    metalness={0.9}
                    roughness={0.12}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[side * 0.065, -0.02, 0.015]}
                  scale={[0.088, 0.07, 0.02]}
                >
                  <meshPhysicalMaterial color="#f87171" roughness={0.4} />
                </mesh>
              </group>
            ))}

            {/* Giant Chubby Baby Dragon Head & Cheeks */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.56, 0.01]}
              scale={[0.29, 0.255, 0.255]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ef4444"
                roughness={0.26}
                clearcoat={0.82}
                sheen={0.65}
              />
            </mesh>
            {/* Plump Lower Side Jowls */}
            {[-0.15, 0.15].map((jx, jIdx) => (
              <mesh
                key={jIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[jx, 0.52, 0.11]}
                scale={[0.115, 0.095, 0.11]}
              >
                <meshPhysicalMaterial
                  color="#ef4444"
                  roughness={0.28}
                  clearcoat={0.7}
                />
              </mesh>
            ))}

            {/* Stubby Baby Muzzle, Nostrils & Sweet Smile Crease */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.505, 0.2]}
              scale={[0.15, 0.11, 0.135]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ef4444"
                roughness={0.26}
                clearcoat={0.8}
              />
            </mesh>
            {[-0.045, 0.045].map((nx, nIdx) => (
              <mesh
                key={nIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[nx, 0.53, 0.315]}
                scale={0.018}
              >
                <meshStandardMaterial color="#450a0a" />
              </mesh>
            ))}

            {/* GIANT Liquid Ruby-Black Kawaii Eyes with Dual Starlight Highlights */}
            {renderExpressiveEye([-0.118, 0.585, 0.198], '#450a0a', 0.056)}
            {renderExpressiveEye([0.118, 0.585, 0.198], '#450a0a', 0.056)}

            {/* Sweeping Organic Curved Golden Horns */}
            {[-0.135, 0.135].map((hx, hIdx) => {
              const sign = hIdx === 0 ? 1 : -1;
              return (
                <mesh
                  key={hIdx}
                  geometry={SHARED_GEO.curvedHorn}
                  position={[hx, 0.72, 0.02]}
                  rotation={[-0.18, sign * 0.15, sign * 0.32]}
                  scale={[0.88, 0.95, 0.88]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#f59e0b"
                    metalness={0.88}
                    roughness={0.12}
                    clearcoat={1}
                  />
                </mesh>
              );
            })}

            {/* Cheek Golden Baby Spikes */}
            {[-0.26, 0.26].map((fx, fIdx) => {
              const sign = fIdx === 0 ? 1 : -1;
              return (
                <mesh
                  key={fIdx}
                  geometry={SHARED_GEO.earCone}
                  position={[fx, 0.57, 0]}
                  rotation={[0, 0, sign * 1.15]}
                  scale={[0.45, 0.58, 0.26]}
                >
                  <meshPhysicalMaterial
                    color="#fbbf24"
                    metalness={0.85}
                    roughness={0.15}
                    clearcoat={1}
                  />
                </mesh>
              );
            })}
          </group>
        )}

        {/* ================================================================ */}
        {/* 14. ICE DRAGON (CHUBBY FROST WYRM FIGURINE - REFERENCE #2)       */}
        {/* ================================================================ */}
        {skin === 'ice-dragon' && (
          <group position={[0, 0.14, 0]}>
            {/* Glacial-Blue Pedestal Collar + 3D Ice Snowflake Relief */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#0284c7"
                roughness={0.1}
                metalness={0.2}
                clearcoat={1}
                ior={1.6}
              />
            </mesh>
            {/* 3D Ice Snowflake Emblem on Pedestal Front */}
            <group position={[0, -0.04, 0.33]}>
              {[0, Math.PI / 3, (Math.PI * 2) / 3].map((ang, sIdx) => (
                <mesh
                  key={sIdx}
                  geometry={SHARED_GEO.unitCylinder}
                  rotation={[0, 0, ang]}
                  scale={[0.01, 0.088, 0.01]}
                >
                  <meshStandardMaterial
                    color="#e0f2fe"
                    emissive="#38bdf8"
                    emissiveIntensity={1.6}
                  />
                </mesh>
              ))}
            </group>

            {/* Ultra-Chubby Pear-Shaped Frost Dragon Pot-Belly */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.2, -0.01]}
              scale={[0.26, 0.235, 0.245]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#38bdf8"
                roughness={0.18}
                clearcoat={0.92}
                ior={1.58}
                sheen={0.65}
                sheenColor="#bae6fd"
              />
            </mesh>

            {/* 4 Sculpted Horizontal Segmented Frosted Mint-White Belly Plates */}
            {[
              { y: 0.11, sx: 0.165, sz: 0.145 },
              { y: 0.16, sx: 0.155, sz: 0.14 },
              { y: 0.21, sx: 0.14, sz: 0.13 },
              { y: 0.26, sx: 0.12, sz: 0.115 },
            ].map((plate, pIdx) => (
              <mesh
                key={pIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[0, plate.y, 0.13]}
                scale={[plate.sx, 0.038, plate.sz]}
              >
                <meshPhysicalMaterial
                  color="#e0f2fe"
                  roughness={0.2}
                  clearcoat={0.8}
                />
              </mesh>
            ))}

            {/* Two Chubby Baby Frost Arms with Paws Resting on Lower Belly */}
            {[-1, 1].map((sign, armIdx) => (
              <group key={armIdx} position={[sign * 0.14, 0.18, 0.1]}>
                <mesh
                  geometry={SHARED_GEO.capsuleLimb}
                  rotation={[0.42, sign * -0.35, sign * -0.55]}
                  scale={[0.9, 0.95, 0.9]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#38bdf8"
                    roughness={0.2}
                    clearcoat={0.85}
                  />
                </mesh>
                {/* 3 Translucent Ice Claws */}
                {[-0.02, 0, 0.02].map((cx, cIdx) => (
                  <mesh
                    key={cIdx}
                    geometry={SHARED_GEO.lowSphere}
                    position={[sign * -0.05 + cx, -0.05, 0.08]}
                    scale={[0.012, 0.016, 0.012]}
                  >
                    <meshStandardMaterial
                      color="#bae6fd"
                      emissive="#38bdf8"
                      emissiveIntensity={0.6}
                    />
                  </mesh>
                ))}
              </group>
            ))}

            {/* Seated Hind Thighs on Pedestal */}
            {[-0.135, 0.135].map((px, pIdx) => (
              <group key={pIdx} position={[px, 0.07, 0.16]}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  scale={[0.082, 0.065, 0.092]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#0284c7"
                    roughness={0.2}
                    clearcoat={0.85}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[0, -0.01, 0.075]}
                  scale={[0.038, 0.026, 0.02]}
                >
                  <meshStandardMaterial color="#e0f2fe" roughness={0.3} />
                </mesh>
              </group>
            ))}

            {/* Curled Frost Dragon Tail */}
            <mesh
              geometry={SHARED_GEO.tailTorus}
              position={[-0.14, 0.13, -0.15]}
              rotation={[0.4, 0.6, 0]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#0284c7"
                roughness={0.2}
                clearcoat={0.85}
              />
            </mesh>

            {/* Spread Frost Wings */}
            {[-1, 1].map((side, wIdx) => (
              <group
                key={wIdx}
                position={[side * 0.16, 0.28, -0.11]}
                rotation={[0.15, side * -0.42, side * -0.25]}
              >
                <mesh
                  geometry={SHARED_GEO.earCone}
                  rotation={[0, 0, side * -1.1]}
                  scale={[0.88, 1.05, 0.22]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#0284c7"
                    roughness={0.18}
                    clearcoat={0.9}
                  />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[side * 0.065, -0.02, 0.015]}
                  scale={[0.088, 0.07, 0.02]}
                >
                  <meshPhysicalMaterial
                    color="#bae6fd"
                    roughness={0.12}
                    clearcoat={1}
                  />
                </mesh>
              </group>
            ))}

            {/* Giant Chubby Frost Head & Jowls */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.56, 0.01]}
              scale={[0.29, 0.255, 0.255]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#38bdf8"
                roughness={0.16}
                clearcoat={0.95}
                ior={1.6}
                sheen={0.65}
              />
            </mesh>
            {[-0.15, 0.15].map((jx, jIdx) => (
              <mesh
                key={jIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[jx, 0.52, 0.11]}
                scale={[0.115, 0.095, 0.11]}
              >
                <meshPhysicalMaterial
                  color="#38bdf8"
                  roughness={0.18}
                  clearcoat={0.85}
                />
              </mesh>
            ))}

            {/* Frost Snout & Nostrils */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.505, 0.2]}
              scale={[0.15, 0.11, 0.135]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#38bdf8"
                roughness={0.16}
                clearcoat={0.9}
              />
            </mesh>
            {[-0.045, 0.045].map((nx, nIdx) => (
              <mesh
                key={nIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[nx, 0.53, 0.315]}
                scale={0.018}
              >
                <meshStandardMaterial color="#0369a1" />
              </mesh>
            ))}

            {/* GIANT Deep Sapphire Kawaii Eyes */}
            {renderExpressiveEye([-0.118, 0.585, 0.198], '#0369a1', 0.056)}
            {renderExpressiveEye([0.118, 0.585, 0.198], '#0369a1', 0.056)}

            {/* Sweeping Organic Curved Crystalline Ice Horns */}
            {[-0.135, 0.135].map((hx, hIdx) => {
              const sign = hIdx === 0 ? 1 : -1;
              return (
                <mesh
                  key={hIdx}
                  geometry={SHARED_GEO.curvedHorn}
                  position={[hx, 0.72, 0.02]}
                  rotation={[-0.18, sign * 0.15, sign * 0.32]}
                  scale={[0.88, 0.95, 0.88]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color="#e0f2fe"
                    roughness={0.04}
                    clearcoat={1}
                    transmission={0.45}
                    ior={1.34}
                    emissive="#38bdf8"
                    emissiveIntensity={0.35}
                  />
                </mesh>
              );
            })}

            {/* Cheek Frost Crystals */}
            {[-0.26, 0.26].map((fx, fIdx) => {
              const sign = fIdx === 0 ? 1 : -1;
              return (
                <mesh
                  key={fIdx}
                  geometry={SHARED_GEO.earCone}
                  position={[fx, 0.57, 0]}
                  rotation={[0, 0, sign * 1.15]}
                  scale={[0.45, 0.58, 0.26]}
                >
                  <meshPhysicalMaterial
                    color="#bae6fd"
                    roughness={0.08}
                    clearcoat={1}
                    ior={1.65}
                  />
                </mesh>
              );
            })}
          </group>
        )}

        {/* ================================================================ */}
        {/* 15. CAPTAIN PIRATE (CHIBI SKULL PAWN BUST - REFERENCE #6)       */}
        {/* ================================================================ */}
        {skin === 'pirate' && (
          <group position={[0, 0.14, 0]}>
            {/* Sweeping Antique Burnished Gold Pawn-Lathe Bust & Pedestal (Zero Boxiness) */}
            <mesh
              geometry={SHARED_GEO.piratePawnBust}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#d97706"
                metalness={0.88}
                roughness={0.16}
                clearcoat={0.9}
              />
            </mesh>
            {/* 3D Crossed Cutlasses Emblem on Front Waist of Pawn Bust */}
            <group position={[0, 0.08, 0.2]}>
              {[-0.65, 0.65].map((ang, sIdx) => (
                <group key={sIdx} rotation={[0, 0, ang]}>
                  {/* Sword Blade */}
                  <mesh
                    geometry={SHARED_GEO.unitCylinder}
                    scale={[0.012, 0.16, 0.012]}
                  >
                    <meshStandardMaterial
                      color="#fef08a"
                      metalness={0.94}
                      roughness={0.1}
                    />
                  </mesh>
                  {/* Sword Crossguard */}
                  <mesh
                    geometry={SHARED_GEO.unitCylinder}
                    position={[0, -0.05, 0]}
                    rotation={[0, 0, Math.PI / 2]}
                    scale={[0.009, 0.045, 0.009]}
                  >
                    <meshStandardMaterial
                      color="#d97706"
                      metalness={0.88}
                      roughness={0.15}
                    />
                  </mesh>
                </group>
              ))}
            </group>

            {/* Smooth Designer Bone-White Chibi Skull Head */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.54, 0.01]}
              scale={[0.265, 0.235, 0.245]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#fffdf5"
                roughness={0.32}
                clearcoat={0.4}
                sheen={0.45}
              />
            </mesh>
            {/* Rounded Chibi Cheekbones & Upper Jaw */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.42, 0.12]}
              scale={[0.155, 0.088, 0.135]}
            >
              <meshPhysicalMaterial color="#fffdf5" roughness={0.32} />
            </mesh>
            {/* Stylized Chibi Teeth Ridges */}
            {[-0.05, -0.017, 0.017, 0.05].map((tx, tIdx) => (
              <mesh
                key={tIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[tx, 0.395, 0.23]}
                scale={[0.016, 0.022, 0.012]}
              >
                <meshStandardMaterial color="#ffffff" roughness={0.25} />
              </mesh>
            ))}
            {/* Triangular / Inverted Heart Nasal Cavity */}
            <mesh
              geometry={SHARED_GEO.earCone}
              position={[0, 0.465, 0.245]}
              rotation={[Math.PI, 0, 0]}
              scale={[0.018, 0.026, 0.012]}
            >
              <meshBasicMaterial color="#111827" />
            </mesh>

            {/* Right Eye: Deep Round Hollow Socket with Specular Catchlight */}
            <group position={[-0.098, 0.525, 0.218]}>
              <mesh
                geometry={SHARED_GEO.lowSphere}
                scale={[0.055, 0.055, 0.025]}
              >
                <meshBasicMaterial color="#0f172a" />
              </mesh>
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[-0.015, 0.018, 0.018]}
                scale={0.014}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>

            {/* Left Eye: Sleek Black Leather Pirate Eyepatch with Raised Rim */}
            <group position={[0.098, 0.525, 0.218]}>
              <mesh
                geometry={SHARED_GEO.lowSphere}
                scale={[0.068, 0.062, 0.03]}
              >
                <meshPhysicalMaterial
                  color="#0f172a"
                  roughness={0.65}
                  clearcoat={0.3}
                />
              </mesh>
              {/* Gold Buckle Dot on Eyepatch Corner */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0.048, 0.032, 0.02]}
                scale={0.01}
              >
                <meshStandardMaterial color="#fbbf24" metalness={0.9} />
              </mesh>
            </group>
            {/* Diagonal Leather Strap */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0.02, 0.54, 0.04]}
              rotation={[0.45, 0.35, -0.55]}
              scale={1.16}
            >
              <meshStandardMaterial color="#0f172a" roughness={0.7} />
            </mesh>

            {/* Rich Crimson Bandana Wrapped Snugly Under Hat Brim */}
            <mesh
              geometry={SHARED_GEO.scarfTorus}
              position={[0, 0.63, 0.01]}
              rotation={[Math.PI / 2 - 0.08, 0, 0]}
              scale={[1.18, 1.15, 0.85]}
            >
              <meshPhysicalMaterial
                color="#dc2626"
                roughness={0.55}
                sheen={0.6}
              />
            </mesh>
            {/* Bandana Side Knot Ribbons Fluttering Out */}
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.26, 0.53, -0.02]}
              rotation={[0, 0, -0.48]}
              scale={[0.65, 0.72, 0.5]}
            >
              <meshPhysicalMaterial color="#dc2626" roughness={0.55} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.capsuleLimb}
              position={[0.24, 0.47, 0.03]}
              rotation={[0.2, 0, -0.28]}
              scale={[0.55, 0.6, 0.45]}
            >
              <meshPhysicalMaterial color="#b91c1c" roughness={0.55} />
            </mesh>

            {/* Grand Sweeping Black Tricorn Hat with Metallic Gold Piping & Skull Badge */}
            <group position={[0, 0.73, 0]} rotation={[-0.08, 0, 0.02]}>
              {/* Main Hat Crown */}
              <mesh
                geometry={SHARED_GEO.unitSphere}
                position={[0, 0.02, 0]}
                scale={[0.24, 0.16, 0.22]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#0f172a"
                  roughness={0.42}
                  sheen={0.55}
                />
              </mesh>
              {/* Sweeping Upturned Front Brim Peak */}
              <mesh
                geometry={SHARED_GEO.unitSphere}
                position={[0, 0.07, 0.095]}
                rotation={[0.32, 0, 0]}
                scale={[0.35, 0.155, 0.125]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#0f172a"
                  roughness={0.4}
                  sheen={0.55}
                />
              </mesh>
              {/* Continuous Gold Trim Along Upturned Brim Border */}
              <mesh
                geometry={SHARED_GEO.scarfTorus}
                position={[0, 0.05, 0.065]}
                rotation={[Math.PI / 2 - 0.32, 0, 0]}
                scale={[1.58, 1.12, 0.55]}
              >
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.92}
                  roughness={0.12}
                />
              </mesh>
              {/* Sculpted 3D Miniature Skull & Crossbones Badge on Hat Front */}
              <group position={[0, 0.1, 0.22]}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  scale={[0.032, 0.034, 0.015]}
                >
                  <meshStandardMaterial color="#ffffff" roughness={0.3} />
                </mesh>
                {/* Mini Crossbones */}
                {[-0.7, 0.7].map((bang, bIdx) => (
                  <mesh
                    key={bIdx}
                    geometry={SHARED_GEO.unitCylinder}
                    rotation={[0, 0, bang]}
                    scale={[0.005, 0.045, 0.005]}
                  >
                    <meshStandardMaterial color="#ffffff" roughness={0.3} />
                  </mesh>
                ))}
              </group>
            </group>
          </group>
        )}

        {/* ================================================================ */}
        {/* 16. ARCANE MAGICIAN (CHUBBY WIZARD FIGURINE - REFERENCE #8)     */}
        {/* ================================================================ */}
        {skin === 'magician' && (
          <group position={[0, 0.14, 0]}>
            {/* Royal Amethyst-Purple Pedestal Collar + 3D Golden Star */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#7e22ce"
                roughness={0.14}
                metalness={0.18}
                clearcoat={1}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.star3D}
              position={[0, -0.04, 0.33]}
              scale={0.85}
            >
              <meshPhysicalMaterial
                color="#fbbf24"
                metalness={0.94}
                roughness={0.08}
                clearcoat={1}
              />
            </mesh>

            {/* Plump, Cuddly Pear-Shaped Seated Wizard Robe (Zero Cylinder) */}
            <mesh
              geometry={SHARED_GEO.magicianRobe}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#6b21a8"
                roughness={0.45}
                sheen={0.8}
                sheenColor="#d8b4fe"
              />
            </mesh>
            {/* Golden Rope Waist Belt & Buckle */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.18, 0]}
              scale={1.05}
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.88}
                roughness={0.18}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.18, 0.21]}
              scale={[0.038, 0.038, 0.02]}
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.92}
                roughness={0.12}
              />
            </mesh>

            {/* Chubby Purple Bell Sleeves & Soft Peach Hands */}
            {[-0.22, 0.22].map((sx, sIdx) => (
              <group key={sIdx} position={[sx, 0.24, 0.06]}>
                <mesh
                  geometry={SHARED_GEO.capsuleLimb}
                  rotation={[0.3, 0, sIdx === 0 ? 0.22 : -0.22]}
                  scale={[0.92, 0.95, 0.92]}
                  castShadow
                >
                  <meshPhysicalMaterial color="#6b21a8" roughness={0.48} />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[0, -0.06, 0.04]}
                  scale={0.048}
                >
                  <meshPhysicalMaterial color="#fed7aa" roughness={0.42} />
                </mesh>
              </group>
            ))}

            {/* Warm Peach Wizard Face, Plump Rosy Cheeks & Button Nose */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.51, 0.02]}
              scale={[0.24, 0.21, 0.22]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#fed7aa"
                roughness={0.42}
                sheen={0.4}
              />
            </mesh>
            {/* Cute Rosy Cheeks */}
            {[-0.12, 0.12].map((cx, cIdx) => (
              <mesh
                key={cIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[cx, 0.49, 0.18]}
                scale={[0.045, 0.028, 0.02]}
              >
                <meshStandardMaterial color="#fda4af" roughness={0.5} />
              </mesh>
            ))}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.485, 0.235]}
              scale={[0.048, 0.04, 0.045]}
            >
              <meshPhysicalMaterial color="#fdba74" roughness={0.38} />
            </mesh>
            {renderExpressiveEye([-0.085, 0.525, 0.215], '#271306', 0.038)}
            {renderExpressiveEye([0.085, 0.525, 0.215], '#271306', 0.038)}

            {/* Bushy White Eyebrows */}
            {[-0.088, 0.088].map((bx, bIdx) => (
              <mesh
                key={bIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[bx, 0.58, 0.218]}
                rotation={[0, 0, bIdx === 0 ? 0.18 : -0.18]}
                scale={[0.055, 0.022, 0.025]}
              >
                <meshPhysicalMaterial color="#f8fafc" roughness={0.45} />
              </mesh>
            ))}

            {/* Magnificent Sweeping Handlebar Mustache */}
            {[-0.075, 0.075].map((mx, mIdx) => (
              <mesh
                key={mIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[mx, 0.435, 0.22]}
                rotation={[0, 0, mIdx === 0 ? 0.35 : -0.35]}
                scale={[0.088, 0.042, 0.048]}
              >
                <meshPhysicalMaterial
                  color="#ffffff"
                  roughness={0.42}
                  sheen={0.7}
                />
              </mesh>
            ))}

            {/* Magnificent Layered Fluffy Cloud Beard Cascading to Robe */}
            {[
              { x: 0, y: 0.32, z: 0.19, sx: 0.145, sy: 0.16, sz: 0.1 },
              { x: -0.09, y: 0.35, z: 0.17, sx: 0.09, sy: 0.13, sz: 0.085 },
              { x: 0.09, y: 0.35, z: 0.17, sx: 0.09, sy: 0.13, sz: 0.085 },
              { x: 0, y: 0.24, z: 0.18, sx: 0.11, sy: 0.12, sz: 0.08 },
            ].map((b, bIdx) => (
              <mesh
                key={bIdx}
                geometry={SHARED_GEO.unitSphere}
                position={[b.x, b.y, b.z]}
                scale={[b.sx, b.sy, b.sz]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#f8fafc"
                  roughness={0.45}
                  sheen={0.8}
                />
              </mesh>
            ))}

            {/* Floppy Purple Wizard Hat with Backward Crease, Gold Band & 3D Star */}
            <group position={[0, 0.63, 0]}>
              {/* Wide Undulating Hat Brim */}
              <mesh
                geometry={SHARED_GEO.unitCylinder}
                position={[0, 0, 0]}
                scale={[0.36, 0.032, 0.34]}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#7e22ce"
                  roughness={0.45}
                  sheen={0.7}
                />
              </mesh>
              {/* Gold Hatband */}
              <mesh
                geometry={SHARED_GEO.collarTorus}
                position={[0, 0.03, 0]}
                rotation={[Math.PI / 2, 0, 0]}
                scale={1.08}
              >
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.88}
                  roughness={0.15}
                />
              </mesh>
              {/* Organic Backward-Bent Floppy Hat Cone */}
              <mesh
                geometry={SHARED_GEO.floppyHat}
                position={[0, 0.02, 0]}
                scale={1.05}
                castShadow
              >
                <meshPhysicalMaterial
                  color="#7e22ce"
                  roughness={0.45}
                  sheen={0.75}
                />
              </mesh>
              {/* Big 3D Golden Star on Hat Front */}
              <mesh
                geometry={SHARED_GEO.star3D}
                position={[0, 0.12, 0.17]}
                rotation={[-0.32, 0, 0]}
                scale={1.15}
              >
                <meshPhysicalMaterial
                  color="#fbbf24"
                  metalness={0.94}
                  roughness={0.08}
                  clearcoat={1}
                />
              </mesh>
            </group>

            {/* Upright Golden Arcane Staff with Radiant Blue Mana Crystal Orb */}
            <group position={[-0.255, 0.32, 0.12]} rotation={[0.06, 0, 0.08]}>
              <mesh
                geometry={SHARED_GEO.unitCylinder}
                scale={[0.02, 0.56, 0.02]}
                castShadow
              >
                <meshStandardMaterial
                  color="#d97706"
                  metalness={0.88}
                  roughness={0.16}
                />
              </mesh>
              {/* Golden Orb Cradle */}
              <mesh
                geometry={SHARED_GEO.collarTorus}
                position={[0, 0.28, 0]}
                scale={0.38}
              >
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.94}
                  roughness={0.1}
                />
              </mesh>
              {/* Glowing Blue Mana Orb */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, 0.31, 0]}
                scale={0.072}
              >
                <meshPhysicalMaterial
                  color="#38bdf8"
                  emissive="#0284c7"
                  emissiveIntensity={2.8}
                  roughness={0.02}
                  clearcoat={1}
                  ior={1.65}
                />
              </mesh>
            </group>
          </group>
        )}

        {/* ================================================================ */}
        {/* 17. COSMIC ALIEN (NEW UNIQUE HDR - MARTIAN & MIRROR EYES)        */}
        {/* ================================================================ */}
        {skin === 'alien' && (
          <group position={[0, 0.14, 0]}>
            {/* Silver-and-Emerald UFO Pedestal Collar + Alien Emblem */}
            <mesh
              geometry={SHARED_GEO.themeCollar}
              position={[0, -0.04, 0]}
              castShadow
              receiveShadow
            >
              <meshPhysicalMaterial
                color="#10b981"
                metalness={0.45}
                roughness={0.15}
                clearcoat={1}
              />
            </mesh>
            {/* Silver Front UFO Bezel + Mini Green Alien Emblem */}
            <RoundedBox
              args={[0.14, 0.095, 0.03]}
              radius={0.02}
              smoothness={4}
              position={[0, -0.04, 0.325]}
            >
              <meshPhysicalMaterial
                color="#cbd5e1"
                metalness={0.85}
                roughness={0.15}
                clearcoat={1}
              />
            </RoundedBox>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, -0.04, 0.342]}
              scale={[0.032, 0.036, 0.012]}
            >
              <meshStandardMaterial
                color="#4ade80"
                emissive="#22c55e"
                emissiveIntensity={1.2}
              />
            </mesh>

            {/* Pearlescent Lime-Green Martian Bust */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.18, 0]}
              scale={[0.22, 0.175, 0.2]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#84cc16"
                roughness={0.2}
                clearcoat={0.92}
                ior={1.52}
                sheen={0.6}
                sheenColor="#d9f99d"
              />
            </mesh>

            {/* Bulbous Inverted-Pear Martian Cranium + Tapered Chin */}
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.61, 0]}
              scale={[0.315, 0.275, 0.265]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#84cc16"
                roughness={0.18}
                clearcoat={0.95}
                ior={1.55}
                sheen={0.65}
                sheenColor="#ecfccb"
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.unitSphere}
              position={[0, 0.46, 0.04]}
              scale={[0.195, 0.16, 0.2]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#84cc16"
                roughness={0.18}
                clearcoat={0.95}
                ior={1.55}
              />
            </mesh>

            {/* Oversized Tilted Almond Obsidian-Black Mirror Eyes */}
            {[-0.115, 0.115].map((ex, eIdx) => {
              const sign = eIdx === 0 ? 1 : -1;
              return (
                <group
                  key={eIdx}
                  position={[ex, 0.56, 0.205]}
                  rotation={[0.12, -sign * 0.28, sign * 0.36]}
                >
                  <mesh
                    geometry={SHARED_GEO.unitSphere}
                    scale={[0.095, 0.135, 0.055]}
                  >
                    <meshPhysicalMaterial
                      color="#090d16"
                      roughness={0.01}
                      metalness={0.25}
                      clearcoat={1}
                      clearcoatRoughness={0.0}
                      ior={1.72}
                    />
                  </mesh>
                  {/* Elongated Studio Specular Catchlight Glint */}
                  <mesh
                    geometry={SHARED_GEO.lowSphere}
                    position={[-sign * 0.022, 0.042, 0.048]}
                    rotation={[0, 0, -sign * 0.2]}
                    scale={[0.022, 0.048, 0.012]}
                  >
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                  <mesh
                    geometry={SHARED_GEO.lowSphere}
                    position={[sign * 0.02, -0.045, 0.046]}
                    scale={0.014}
                  >
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
              );
            })}

            {/* Dual Ball-Tipped Martian Antennae */}
            {[-0.155, 0.155].map((ax, aIdx) => {
              const sign = aIdx === 0 ? 1 : -1;
              return (
                <group
                  key={aIdx}
                  position={[ax, 0.85, 0]}
                  rotation={[0, 0, sign * 0.36]}
                >
                  <mesh
                    geometry={SHARED_GEO.unitCylinder}
                    scale={[0.018, 0.12, 0.018]}
                  >
                    <meshPhysicalMaterial
                      color="#65a30d"
                      roughness={0.22}
                      clearcoat={0.9}
                    />
                  </mesh>
                  <mesh
                    geometry={SHARED_GEO.lowSphere}
                    position={[0, 0.072, 0]}
                    scale={0.042}
                  >
                    <meshPhysicalMaterial
                      color="#a3e635"
                      emissive="#65a30d"
                      emissiveIntensity={0.75}
                      roughness={0.12}
                      clearcoat={1}
                    />
                  </mesh>
                </group>
              );
            })}
          </group>
        )}
      </group>
    );
  }
);

Token3DModel.displayName = 'Token3DModel';
