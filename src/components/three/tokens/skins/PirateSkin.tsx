import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Captain Pirate Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 1, Row 2)
 * Features:
 * - Sweeping black bicorne captain hat with gold embroidered border and 3D skull & crossbones
 * - Red bandana tied underneath with dynamic fluttering ribbon tails
 * - Chibi anime captain face with expressive right eye and authentic black leather eyepatch
 * - Crimson red captain frock coat with gold lapels, white lace jabot, and gold belt buckle
 * - Right hand holding curved steel cutlass sword with golden basket/D-guard hilt
 * - Left hand confidently resting on hip
 * - Chunky black buccaneer boots
 * - Dark oak ship-deck / barrel plank pedestal with brass hoops, rivets, and mini gold skull badge
 */
export const PirateSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Dark Oak Ship-Deck / Barrel Pedestal Base with Brass Hoops */}
      <group position={[0, -0.04, 0]}>
        {/* Dark Oak Wooden Base */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#451a03"
            roughness={0.65}
            clearcoat={0.3}
          />
        </mesh>
        {/* Polished Brass Barrel Hoops */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.14} />
        </mesh>
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, -0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.14} />
        </mesh>
        {/* Planks Deck Top Plate */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#5c2c10"
            roughness={0.6}
            clearcoat={0.35}
          />
        </mesh>
        {/* Mini 3D Golden Skull Emblem on Front Rim */}
        <group position={[0, 0.015, 0.34]}>
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.024, 0.022, 0.012]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, -0.01, 0]}
            rotation={[0, 0, Math.PI / 4]}
            scale={[0.005, 0.032, 0.005]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, -0.01, 0]}
            rotation={[0, 0, -Math.PI / 4]}
            scale={[0.005, 0.032, 0.005]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
          </mesh>
        </group>
      </group>

      {/* 2. Confident Buccaneer Boots & Trousers */}
      {[-0.1, 0.1].map((bx, bIdx) => (
        <group key={bIdx} position={[bx, 0.065, 0.02]}>
          {/* Black Pirate Boot Body */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.085, 0.065, 0.105]} castShadow>
            <meshPhysicalMaterial
              color="#090d16"
              roughness={0.3}
              metalness={0.35}
              clearcoat={0.8}
            />
          </mesh>
          {/* Gold Boot Cuff Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.04, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.45}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* Dark Charcoal Trousers */}
          <mesh
            geometry={SHARED_GEO.capsuleLimb}
            position={[0, 0.08, 0]}
            scale={[0.7, 0.6, 0.7]}
          >
            <meshStandardMaterial color="#1e293b" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* 3. Crimson Pirate Captain Coat, White Jabot & Gold Belt */}
      <group position={[0, 0.22, 0]}>
        {/* Red Frock Coat Body */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.225, 0.2, 0.195]} castShadow>
          <meshPhysicalMaterial
            color="#b91c1c"
            roughness={0.4}
            clearcoat={0.3}
            sheen={0.7}
            sheenColor="#fca5a5"
          />
        </mesh>
        {/* Gold Lapel Trim Borders */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[-0.06, 0.04, 0.19]}
          rotation={[0.2, 0.15, -0.45]}
          scale={[0.014, 0.24, 0.008]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0.06, 0.04, 0.19]}
          rotation={[0.2, -0.15, 0.45]}
          scale={[0.014, 0.24, 0.008]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* White Ruffled Lace Jabot / Cravat Collar */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.12, 0.18]}
          scale={[0.065, 0.055, 0.03]}
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.5} sheen={0.6} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.07, 0.19]}
          scale={[0.048, 0.042, 0.022]}
        >
          <meshPhysicalMaterial color="#f8fafc" roughness={0.5} />
        </mesh>

        {/* Black Leather Waist Belt */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.12, 1.1, 0.85]}
        >
          <meshPhysicalMaterial color="#090d16" roughness={0.35} clearcoat={0.5} />
        </mesh>
        {/* Oversized Polished Gold Rectangular Belt Buckle */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, -0.08, 0.2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.075, 0.015, 0.055]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, -0.08, 0.208]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.045, 0.018, 0.032]}
        >
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>

        {/* Coat Flared Tails at Back */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, -0.08, -0.08]}
          scale={[0.22, 0.16, 0.14]}
          castShadow
        >
          <meshPhysicalMaterial color="#991b1b" roughness={0.45} />
        </mesh>
      </group>

      {/* 4. Arms: Right Arm Holding Cutlass, Left Arm on Hip */}
      {/* Right Arm Holding Curved Steel Cutlass */}
      <group position={[-0.2, 0.24, 0.06]} rotation={[0.4, 0.25, 0.6]}>
        {/* Red Coat Sleeve with Gold Cuff */}
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.92, 1.05, 0.92]} castShadow>
          <meshPhysicalMaterial color="#b91c1c" roughness={0.4} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.5}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Handheld Cutlass Sword */}
        <group position={[0, -0.16, 0.02]} rotation={[0.2, -0.3, 0.35]}>
          {/* Black Hilt Handle */}
          <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.018, 0.14, 0.018]}>
            <meshPhysicalMaterial color="#1c1917" roughness={0.6} />
          </mesh>
          {/* Golden D-Guard / Basket Hilt */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0.025, 0.01, 0]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[0.38, 0.25, 0.25]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Curved Razor Steel Cutlass Blade */}
          <mesh
            geometry={SHARED_GEO.cutlassBlade}
            position={[0, 0.07, -0.005]}
            scale={1.35}
            castShadow
          >
            <meshPhysicalMaterial
              color="#e2e8f0"
              metalness={0.98}
              roughness={0.06}
              clearcoat={1}
            />
          </mesh>
        </group>
      </group>

      {/* Left Arm Confidently Resting on Hip */}
      <group position={[0.2, 0.22, 0.04]} rotation={[-0.1, -0.2, -0.75]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.92, 1.05, 0.92]} castShadow>
          <meshPhysicalMaterial color="#b91c1c" roughness={0.4} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.5}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Resting Fist */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.12, 0.01]}
          scale={[0.045, 0.045, 0.04]}
        >
          <meshStandardMaterial color="#fed7aa" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Chibi Captain Head, Hair, Eyepatch & Expressive Eye */}
      <group position={[0, 0.54, 0.02]}>
        {/* Peach Skin Chibi Cranium */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.265, 0.235, 0.245]} castShadow>
          <meshPhysicalMaterial
            color="#ffedd5"
            roughness={0.35}
            clearcoat={0.3}
            sheen={0.4}
            sheenColor="#fed7aa"
          />
        </mesh>
        {/* Soft Cheeks */}
        {[-0.14, 0.14].map((cx, cIdx) => (
          <mesh
            key={cIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[cx, -0.02, 0.12]}
            scale={[0.085, 0.065, 0.08]}
          >
            <meshPhysicalMaterial color="#fed7aa" roughness={0.4} />
          </mesh>
        ))}
        {/* Rosy Captain Cheeks */}
        {[-0.15, 0.15].map((bx, bIdx) => (
          <mesh
            key={bIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[bx, -0.015, 0.185]}
            scale={[0.038, 0.022, 0.018]}
          >
            <meshStandardMaterial color="#fda4af" roughness={0.55} />
          </mesh>
        ))}

        {/* Mischievous Pirate Smirk */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0.02, -0.06, 0.23]}
          rotation={[Math.PI / 2, 0, 0.2]}
          scale={[0.005, 0.03, 0.005]}
        >
          <meshBasicMaterial color="#7c2d12" />
        </mesh>

        {/* Right Eye: Large Expressive Sparkling Anime Eye */}
        <ExpressiveEye pos={[-0.095, 0.035, 0.225]} irisColor="#1e3a8a" eyeRadius={0.052} />

        {/* Left Eye: Authentic Black Leather Eyepatch & Diagonal Strap */}
        {/* Diagonal Black Leather Strap Around Brow */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.04, 0]}
          rotation={[0.3, 0.4, 0.25]}
          scale={[1.16, 1.14, 0.9]}
        >
          <meshPhysicalMaterial color="#090d16" roughness={0.35} clearcoat={0.5} />
        </mesh>
        {/* Eyepatch Cup Over Left Eye */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0.095, 0.035, 0.235]}
          scale={[0.062, 0.062, 0.02]}
        >
          <meshPhysicalMaterial color="#090d16" roughness={0.3} clearcoat={0.6} />
        </mesh>
        {/* Eyepatch Gold Buckle Detail */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0.13, 0.065, 0.21]}
          scale={0.012}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Shaggy Chocolate Brown Anime Hair Tufts Peeking Out */}
        {[
          { x: -0.16, y: -0.04, z: 0.16, rz: 0.4 },
          { x: 0.16, y: -0.04, z: 0.16, rz: -0.4 },
          { x: -0.02, y: 0.1, z: 0.22, rz: 0.1 },
        ].map((tuft, tIdx) => (
          <mesh
            key={tIdx}
            geometry={SHARED_GEO.earCone}
            position={[tuft.x, tuft.y, tuft.z]}
            rotation={[0.2, 0, tuft.rz]}
            scale={[0.42, 0.55, 0.32]}
          >
            <meshPhysicalMaterial color="#451a03" roughness={0.5} />
          </mesh>
        ))}

        {/* Red Bandana Wrapped Under Hat */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.1, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.2, 1.15, 0.9]}
        >
          <meshPhysicalMaterial
            color="#dc2626"
            roughness={0.4}
            sheen={0.7}
            sheenColor="#fca5a5"
          />
        </mesh>
        {/* Bandana Knotted Cloth & Billowing Red Tails on Right Side */}
        <group position={[0.22, 0.08, -0.05]} rotation={[0.1, -0.4, -0.3]}>
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.045, 0.045, 0.03]}>
            <meshStandardMaterial color="#b91c1c" roughness={0.45} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.flowingRibbon}
            position={[0.02, -0.02, 0]}
            rotation={[0, 0, -0.2]}
            scale={[1.1, 1.0, 0.9]}
          >
            <meshPhysicalMaterial
              color="#dc2626"
              roughness={0.35}
              clearcoat={0.5}
              sheen={0.8}
            />
          </mesh>
        </group>

        {/* 6. Sweeping Black Bicorne Captain Hat with Golden Skull */}
        <group position={[0, 0.22, 0]} rotation={[0.08, 0, 0]}>
          {/* Main Felt Bicorne Hat Mesh */}
          <mesh geometry={SHARED_GEO.bicorneHat} position={[0, 0, -0.12]} castShadow>
            <meshPhysicalMaterial
              color="#090d16"
              roughness={0.55}
              clearcoat={0.35}
              sheen={0.5}
            />
          </mesh>
          {/* Embroidered Golden Filigree Hat Brim Border */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.04, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.55, 1.15, 0.7]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>

          {/* 3D Embossed Golden Skull & Crossbones Front Crest */}
          <group position={[0, 0.05, 0.16]}>
            {/* Skull Cranium */}
            <mesh geometry={SHARED_GEO.lowSphere} scale={[0.045, 0.042, 0.02]}>
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
            {/* Skull Eye Holes */}
            {[-0.014, 0.014].map((skX, sIdx) => (
              <mesh
                key={sIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[skX, 0.005, 0.015]}
                scale={0.008}
              >
                <meshBasicMaterial color="#090d16" />
              </mesh>
            ))}
            {/* Crossed Bones Behind Skull */}
            {[-0.75, 0.75].map((bAng, bIdx) => (
              <mesh
                key={bIdx}
                geometry={SHARED_GEO.unitCylinder}
                rotation={[0, 0, bAng]}
                scale={[0.007, 0.09, 0.007]}
              >
                <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
              </mesh>
            ))}
          </group>
        </group>
      </group>
    </group>
  );
});
PirateSkin.displayName = 'PirateSkin';
