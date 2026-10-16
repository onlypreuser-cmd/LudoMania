import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Starfarer Astronaut Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 1, Row 1)
 * Features:
 * - Giant spherical white glossy helmet with polished gold visor bezel ring
 * - Deep-space dark galaxy visor with starry glints and electric blue rim reflections
 * - Lateral gold cylindrical comms ear pods with glowing cyan central ports
 * - Plump white EVA suit with golden seam rings and chest glowing orbit emblem
 * - Rear life-support backpack with dual glowing blue thrusters
 * - Twin overhead arched oxygen conduit tubes connected to helmet with gold ferrules
 * - Chunky white space boots with gold soles
 * - Championship golden pedestal base with inset electric blue glowing neon ring
 */
export const AstronautSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Golden Pedestal Base with Glowing Blue Neon Ring */}
      <group position={[0, -0.04, 0]}>
        {/* Polished Gold Main Collar */}
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
        {/* Inset Electric-Blue Glowing Neon Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.052, 0]}
          scale={1.12}
        >
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={3.2}
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

      {/* 2. Chunky White Space Boots with Gold Soles */}
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
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* Gold Knee Cuff Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.045, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.45}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
        </group>
      ))}

      {/* 3. Plump White EVA Spacesuit Torso & Chest Orbit Emblem */}
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
        {/* Gold Waist Band */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.09, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.1, 1.1, 0.9]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
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

        {/* Chest Telemetry Plate with Glowing Orbit Planet Emblem */}
        <group position={[0, 0.02, 0.18]}>
          {/* Recessed Dark Badge */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.052, 0.052, 0.015]}>
            <meshPhysicalMaterial color="#090d16" roughness={0.1} clearcoat={1} />
          </mesh>
          {/* Central Blue Planet Core */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={0.02}>
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={3.0}
            />
          </mesh>
          {/* Glowing Planetary Orbit Ring */}
          <mesh
            geometry={SHARED_GEO.thinTorus}
            rotation={[0.4, 0.3, 0]}
            scale={0.038}
          >
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={3.2}
            />
          </mesh>
        </group>

        {/* Golden Seam Accent Pips */}
        {[-0.08, 0.08].map((sx, sIdx) => (
          <mesh
            key={sIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[sx, 0.07, 0.165]}
            scale={0.014}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
        ))}
      </group>

      {/* 4. Plump Spacesuit Arms with Gold Wrist Cuffs */}
      {[-0.23, 0.23].map((ax, aIdx) => (
        <group
          key={aIdx}
          position={[ax, 0.23, 0.02]}
          rotation={[0.15, 0, aIdx === 0 ? 0.35 : -0.35]}
        >
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
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* White Spacesuit Glove */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.12, 0.01]}
            scale={[0.055, 0.055, 0.05]}
          >
            <meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={0.8} />
          </mesh>
        </group>
      ))}

      {/* 5. Rear Life-Support Backpack with Thrusters & Arched Conduits */}
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
        {/* Dual Vertical Glowing Cyan Rocket Thrusters */}
        {[-0.08, 0.08].map((tx, tIdx) => (
          <group key={tIdx} position={[tx, -0.02, -0.06]}>
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.038, 0.16, 0.038]}>
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
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

      {/* 6. Giant Spherical White Space Helmet & Gold Visor Bezel */}
      <group position={[0, 0.58, 0.02]}>
        {/* Spherical Glossy White Outer Helmet */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.3, 0.28, 0.29]} castShadow>
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
          scale={[1.32, 1.15, 1.0]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
        </mesh>

        {/* Deep Space Cosmic Galaxy Visor Glass */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0, 0.11]}
          scale={[0.245, 0.21, 0.22]}
        >
          <meshPhysicalMaterial
            color="#091930"
            metalness={0.92}
            roughness={0.02}
            clearcoat={1}
            clearcoatRoughness={0.0}
            ior={1.75}
          />
        </mesh>

        {/* Starry Glints / Sparkles on Visor Surface */}
        {[
          { x: -0.09, y: 0.07, z: 0.29, s: 0.016 },
          { x: -0.04, y: 0.09, z: 0.3, s: 0.012 },
          { x: 0.08, y: -0.04, z: 0.28, s: 0.014 },
          { x: 0.05, y: 0.06, z: 0.29, s: 0.01 },
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

        {/* Crisp Curved White Specular Glint Reflection */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[-0.09, 0.08, 0.3]}
          rotation={[0, 0, 0.45]}
          scale={[0.055, 0.022, 0.015]}
        >
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Lateral Cylindrical Gold Comms Ear Pods with Glowing Cyan Cores */}
        {[-0.29, 0.29].map((ex, eIdx) => (
          <group
            key={eIdx}
            position={[ex, 0, 0]}
            rotation={[0, 0, eIdx === 0 ? Math.PI / 2 : -Math.PI / 2]}
          >
            {/* Outer Gold Pod Cylinder */}
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.085, 0.035, 0.085]}>
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
            {/* Raised Outer Ring Bezel */}
            <mesh geometry={SHARED_GEO.collarTorus} scale={0.52}>
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
            {/* Glowing Electric-Cyan Concentric Core Lens */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.02, 0]}
              scale={[0.048, 0.015, 0.048]}
            >
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={3.2}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});
AstronautSkin.displayName = 'AstronautSkin';
