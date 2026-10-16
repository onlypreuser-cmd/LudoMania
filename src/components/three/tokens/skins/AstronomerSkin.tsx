import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Astronomer / Starfarer Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 1, Row 1)
 * Replaces the old hooded cowl/beard with the exact space explorer figurine:
 * - Large spherical white space helmet with polished gold visor bezel ring
 * - Dark deep-space galaxy cosmic visor with sparkling stars, white specular glint, and cyan rim highlights
 * - Top illuminated cyan panel with gold bracket frame
 * - Side circular communicator ear pods with gold rings & blue glowing centers
 * - Plump white spacesuit with gold shoulder trims, gold wrist cuffs, gold boots/shoes
 * - Chest telemetry badge: circular glowing blue core with orbit ring and gold bezel
 * - Rear backpack: dual glowing blue cylindrical thruster ports, side thrusters, and gold pipes
 * - Circular gold pedestal with glowing cyan/blue halo ring
 */
export const AstronomerSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Championship Golden Pedestal Base with Inset Glowing Neon Blue Halo Ring */}
      <group position={[0, -0.04, 0]}>
        {/* Polished Gold Tiered Base Collar */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#d97706"
            metalness={0.92}
            roughness={0.14}
            clearcoat={1}
          />
        </mesh>
        {/* Upper Gold Rim Ring */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
        {/* Lower Gold Base Ring */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, -0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
        {/* Inset Electric-Blue Glowing Neon Halo Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.052, 0]}
          scale={1.12}
        >
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>
        {/* Dark Metallic Center Plate */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#0f172a"
            metalness={0.7}
            roughness={0.2}
            clearcoat={0.9}
          />
        </mesh>
      </group>

      {/* 2. Chunky White Space Boots with Polished Gold Soles */}
      {[-0.11, 0.11].map((bx, bIdx) => (
        <group key={bIdx} position={[bx, 0.065, 0.03]}>
          {/* Main White Boot Body */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.088, 0.065, 0.11]} castShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.15}
              clearcoat={0.9}
              sheen={0.4}
            />
          </mesh>
          {/* Gold Sole Base */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, -0.035, 0]}
            scale={[0.082, 0.015, 0.1]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Gold Ankle Cuff Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.045, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.45}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* 3. Plump White EVA Spacesuit Torso & Gold Trims */}
      <group position={[0, 0.22, 0]}>
        {/* White Spacesuit Torso Sphere */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.225, 0.195, 0.195]} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.16}
            metalness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        </mesh>
        {/* Gold Waist Band Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.09, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.1, 1.1, 0.9]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
        {/* Gold Neck Seal Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.13, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.96, 0.96, 0.9]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>

        {/* Gold Shoulder Trim Rings on Torso */}
        {[-0.2, 0.2].map((sx, sIdx) => (
          <mesh
            key={sx}
            geometry={SHARED_GEO.collarTorus}
            position={[sx, 0.09, 0]}
            rotation={[0, 0, sIdx === 0 ? 0.35 : -0.35]}
            scale={[0.42, 0.42, 0.35]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
        ))}

        {/* Chest Telemetry Badge with Glowing Blue Core & Orbit Ring */}
        <group position={[0, 0.02, 0.185]}>
          {/* Raised Gold Outer Bezel */}
          <mesh geometry={SHARED_GEO.collarTorus} scale={[0.34, 0.34, 0.2]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Recessed Dark Telemetry Disc */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.055, 0.055, 0.015]}>
            <meshPhysicalMaterial color="#090d16" roughness={0.1} clearcoat={1} />
          </mesh>
          {/* Central Glowing Electric Blue Core */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={0.024}>
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={3.5}
              toneMapped={false}
            />
          </mesh>
          {/* Glowing Planetary Orbit Ring */}
          <mesh
            geometry={SHARED_GEO.thinTorus}
            rotation={[0.4, 0.3, 0]}
            scale={0.042}
          >
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={3.2}
              toneMapped={false}
            />
          </mesh>
        </group>

        {/* Golden Seam Dial / Pip Details on Chest */}
        {[-0.08, 0.08].map((dx, dIdx) => (
          <mesh
            key={dIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[dx, 0.07, 0.165]}
            scale={0.014}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
        ))}
      </group>

      {/* 4. Plump Spacesuit Arms with Gold Wrist Cuffs & Knuckle Accents */}
      {[-0.23, 0.23].map((ax, aIdx) => (
        <group
          key={aIdx}
          position={[ax, 0.23, 0.02]}
          rotation={[0.15, 0, aIdx === 0 ? 0.35 : -0.35]}
        >
          {/* Arm Limb Capsule */}
          <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.92, 1.05, 0.92]} castShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.18}
              metalness={0.15}
              clearcoat={0.9}
            />
          </mesh>
          {/* Gold Wrist Cuff Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, -0.05, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.48}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* White Spacesuit Glove Hand */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.12, 0.01]}
            scale={[0.055, 0.055, 0.05]}
          >
            <meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={0.8} />
          </mesh>
          {/* Gold Glove Knuckle Accent Pip */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.135, 0.035]}
            scale={0.012}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
        </group>
      ))}

      {/* 5. Rear Life-Support Backpack with Dual Thrusters, Side Ports & Gold Pipes */}
      <group position={[0, 0.28, -0.17]}>
        {/* Main Backpack Housing */}
        <mesh geometry={SHARED_GEO.lowSphere} scale={[0.22, 0.22, 0.12]} castShadow>
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.18}
            metalness={0.2}
            clearcoat={0.9}
          />
        </mesh>

        {/* Top Gold Handle / Bracket Pipe */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0.11, 0]}
          rotation={[0, 0, Math.PI / 2]}
          scale={[0.016, 0.18, 0.016]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>

        {/* Dual Vertical Glowing Cyan Rocket Thrusters */}
        {[-0.08, 0.08].map((tx, tIdx) => (
          <group key={tIdx} position={[tx, -0.02, -0.06]}>
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.038, 0.16, 0.038]}>
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
            {/* Blue Thruster Exhaust Glow */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, -0.085, 0]}
              scale={[0.032, 0.018, 0.032]}
            >
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={3.5}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Lateral Side Thruster Ports (Visible in Left view) */}
        {[-0.13, 0.13].map((sx, sIdx) => (
          <group key={sIdx} position={[sx, 0.01, -0.02]}>
            {/* Gold Outer Ring Bezel */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              rotation={[0, Math.PI / 2, 0]}
              scale={0.32}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
            {/* Glowing Blue Center Disc */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              scale={[0.015, 0.032, 0.032]}
            >
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={3.5}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}

        {/* Twin Overhead Arched Oxygen Conduit Tubes into Helmet Top */}
        {[-0.08, 0.08].map((cx, cIdx) => (
          <group key={cIdx} position={[cx, 0.08, 0]} rotation={[0.4, cIdx === 0 ? -0.2 : 0.2, 0]}>
            <mesh geometry={SHARED_GEO.archedConduit} scale={1.1} castShadow>
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.25}
                metalness={0.1}
                clearcoat={0.8}
              />
            </mesh>
            {/* Gold Connection Collar Ferrules */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.02, 0]}
              scale={0.2}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Giant Spherical White Space Helmet, Gold Bezel & Deep Galaxy Visor */}
      <group position={[0, 0.58, 0.02]}>
        {/* Spherical Glossy White Outer Helmet */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.3, 0.285, 0.29]} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.12}
            metalness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.03}
            ior={1.55}
          />
        </mesh>

        {/* Heavy Polished Gold Visor Bezel Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0, 0.12]}
          rotation={[0, 0, 0]}
          scale={[1.34, 1.18, 1.0]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
        </mesh>

        {/* Deep Space Cosmic Galaxy Visor Glass */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0, 0.11]}
          scale={[0.25, 0.215, 0.22]}
        >
          <meshPhysicalMaterial
            color="#070f1e"
            metalness={0.94}
            roughness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.0}
            ior={1.75}
          />
        </mesh>

        {/* Electric Cyan Rim Highlight Inside Visor */}
        <mesh
          geometry={SHARED_GEO.thinTorus}
          position={[0, 0, 0.14]}
          scale={[0.23, 0.2, 0.01]}
        >
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>

        {/* Starry Glints / Sparkles on Visor Surface */}
        {[
          { x: -0.09, y: 0.07, z: 0.29, s: 0.016 },
          { x: -0.04, y: 0.09, z: 0.3, s: 0.012 },
          { x: 0.08, y: -0.04, z: 0.28, s: 0.014 },
          { x: 0.05, y: 0.06, z: 0.29, s: 0.01 },
          { x: -0.02, y: -0.05, z: 0.3, s: 0.011 },
        ].map((gl, gIdx) => (
          <mesh
            key={gIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[gl.x, gl.y, gl.z]}
            scale={gl.s}
          >
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Crisp Curved White Specular Glint Reflection Streak */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[-0.09, 0.08, 0.3]}
          rotation={[0, 0, 0.45]}
          scale={[0.055, 0.022, 0.015]}
        >
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Top Illuminated Cyan Light Panel with Gold Bracket Frame (Reference Sheet 1, Top/Front/Left) */}
        <group position={[0, 0.278, 0.02]}>
          {/* Gold Bracket Frame */}
          <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.095, 0.018, 0.055]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Illuminated Cyan Screen */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, 0.011, 0]}
            scale={[0.078, 0.012, 0.038]}
          >
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={3.6}
              toneMapped={false}
            />
          </mesh>
          {/* Gold Side Bracket Lugs */}
          {[-0.095, 0.095].map((lx, lIdx) => (
            <mesh
              key={lIdx}
              geometry={SHARED_GEO.lowSphere}
              position={[lx, 0.005, 0]}
              scale={[0.014, 0.016, 0.025]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* Lateral Cylindrical Gold Communicator Ear Pods with Glowing Blue Cores */}
        {[-0.295, 0.295].map((ex, eIdx) => (
          <group
            key={eIdx}
            position={[ex, 0, 0]}
            rotation={[0, 0, eIdx === 0 ? Math.PI / 2 : -Math.PI / 2]}
          >
            {/* White Extension Base Collar */}
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.08, 0.025, 0.08]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.2} clearcoat={0.8} />
            </mesh>
            {/* Outer Gold Pod Cylinder */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0.02, 0]}
              scale={[0.085, 0.025, 0.085]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
            {/* Raised Outer Ring Bezel */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.035, 0]}
              scale={0.52}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
            {/* Glowing Electric-Cyan Concentric Core Lens */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.038, 0]}
              scale={[0.048, 0.015, 0.048]}
            >
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={3.6}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});
AstronomerSkin.displayName = 'AstronomerSkin';
