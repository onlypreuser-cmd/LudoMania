import { RoundedBox } from '@react-three/drei';
import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * OG Squaries Robot Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 2, Row 2)
 * Features:
 * - Rounded squarish white CRT monitor head (smoothness=8, zero raw cubes)
 * - Recessed dark curved display screen with friendly neon cyan capsule eyes
 * - Gold/orange screen bezel and top recessed status cooling vent
 * - Twin angled antennae with golden/yellow spherical tips
 * - Large side ear turbines with concentric glowing blue neon rings
 * - Plump white mecha torso with glowing amber circular chest reactor
 * - Articulated arms with gold joint rings and dark metallic hands
 * - Chunky white boots with gold toe caps
 * - Dual massive rear spherical rocket thrusters with glowing blue propulsion nozzles
 * - Sci-fi industrial pedestal with bolted rim and electric blue neon power ring
 */
export const RobotSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Sci-Fi Bolted Pedestal Base with Glowing Neon Power Ring */}
      <group position={[0, -0.04, 0]}>
        {/* Bronze / Industrial Dark Collar */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#1e293b"
            metalness={0.88}
            roughness={0.2}
            clearcoat={1}
          />
        </mesh>
        {/* Golden Bolted Outer Ring */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.14} />
        </mesh>
        {/* Inset Electric-Blue Glowing Neon Trench */}
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
        {/* Dark Metallic Center Dais */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#0f172a"
            metalness={0.75}
            roughness={0.25}
            clearcoat={0.8}
          />
        </mesh>
      </group>

      {/* 2. Chunky White Mecha Boots with Gold Toe Caps */}
      {[-0.11, 0.11].map((bx, bIdx) => (
        <group key={bIdx} position={[bx, 0.065, 0.03]}>
          {/* Main White Boot Body */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.088, 0.065, 0.11]} castShadow>
            <meshPhysicalMaterial
              color="#f8fafc"
              roughness={0.18}
              metalness={0.2}
              clearcoat={0.9}
            />
          </mesh>
          {/* Polished Gold Toe Cap */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.005, 0.065]}
            scale={[0.075, 0.045, 0.055]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* Charcoal Tread Sole */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, -0.038, 0]}
            scale={[0.08, 0.015, 0.1]}
          >
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          {/* Blue LED Status Pip */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[bIdx === 0 ? -0.075 : 0.075, 0.01, 0]}
            scale={0.015}
          >
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>
      ))}

      {/* 3. Plump White Mecha Torso & Central Reactor Core */}
      <group position={[0, 0.22, 0]}>
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.225, 0.195, 0.2]} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.16}
            metalness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.05}
          />
        </mesh>
        {/* Golden Waist & Collar Trim Rings */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.1, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.05, 1.05, 0.9]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.12, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.92, 0.92, 0.9]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Central Circular Reactor Core (Gold Bezel + Amber Glow) */}
        <group position={[0, 0.02, 0.185]}>
          {/* Raised Golden Reactor Bezel */}
          <mesh geometry={SHARED_GEO.collarTorus} scale={0.42}>
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Glowing Amber / Yellow Energy Core */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.048, 0.048, 0.022]}>
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={2.8}
              toneMapped={false}
            />
          </mesh>
          {/* Center Hotspot */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, 0, 0.012]}
            scale={[0.024, 0.024, 0.012]}
          >
            <meshBasicMaterial color="#fef08a" />
          </mesh>
        </group>

        {/* Dual Blue Telemetry Accent Screws */}
        {[-0.1, 0.1].map((sx, sIdx) => (
          <mesh
            key={sIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[sx, 0.06, 0.16]}
            scale={0.018}
          >
            <meshStandardMaterial
              color="#06b6d4"
              emissive="#06b6d4"
              emissiveIntensity={2.0}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Segmented Mecha Arms & Hands */}
      {[-0.24, 0.24].map((ax, aIdx) => (
        <group
          key={aIdx}
          position={[ax, 0.23, 0.02]}
          rotation={[0.15, 0, aIdx === 0 ? 0.35 : -0.35]}
        >
          {/* White Upper Arm Capsule */}
          <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.95, 1.05, 0.95]} castShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.18}
              metalness={0.2}
              clearcoat={0.9}
            />
          </mesh>
          {/* Golden Joint Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, -0.04, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.5}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* Charcoal Metallic Hand / Wrist */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.12, 0.01]}
            scale={[0.055, 0.055, 0.048]}
          >
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* 5. Dual Massive Spherical Rocket Thrusters (Backpack) */}
      <group position={[0, 0.26, -0.18]}>
        {[-0.12, 0.12].map((tx, tIdx) => (
          <group key={tIdx} position={[tx, 0, 0]}>
            {/* White Rocket Engine Housing */}
            <mesh geometry={SHARED_GEO.unitSphere} scale={[0.12, 0.13, 0.14]} castShadow>
              <meshPhysicalMaterial
                color="#f8fafc"
                roughness={0.18}
                metalness={0.25}
                clearcoat={0.9}
              />
            </mesh>
            {/* Gold Engine Mounting Ring */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0, -0.06]}
              scale={0.65}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
            </mesh>
            {/* Rear Exhaust Nozzle Cylinder */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0, -0.12]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.075, 0.06, 0.075]}
            >
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* Glowing Blue Rocket Plasma Turbine Core */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0, -0.155]}
              scale={[0.055, 0.055, 0.02]}
            >
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={3.8}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Squarish Rounded White CRT Monitor Head (Zero Boxiness) */}
      <group position={[0, 0.54, 0.01]}>
        {/* Main Head Chassis: High-Smoothness Rounded Box */}
        <RoundedBox
          args={[0.44, 0.36, 0.32]}
          radius={0.08}
          smoothness={8}
          position={[0, 0, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.15}
            metalness={0.25}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        </RoundedBox>

        {/* Top Horizontal Ventilation Cooling Slot with Blue Glow */}
        <group position={[0, 0.182, 0.01]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.18, 0.008, 0.06]} />
            <meshStandardMaterial color="#0f172a" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.004, 0]}>
            <boxGeometry args={[0.14, 0.004, 0.02]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#38bdf8"
              emissiveIntensity={2.5}
            />
          </mesh>
        </group>

        {/* Recessed CRT Curved Display Glass Screen */}
        <group position={[0, -0.01, 0.152]}>
          {/* Chamfered Golden Screen Frame */}
          <RoundedBox args={[0.34, 0.26, 0.02]} radius={0.04} smoothness={6}>
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </RoundedBox>
          {/* Deep Dark Glossy CRT Screen Glass */}
          <RoundedBox
            args={[0.31, 0.23, 0.025]}
            radius={0.035}
            smoothness={6}
            position={[0, 0, 0.006]}
          >
            <meshPhysicalMaterial
              color="#090d16"
              roughness={0.02}
              metalness={0.8}
              clearcoat={1}
              ior={1.6}
            />
          </RoundedBox>

          {/* Friendly Glowing Neon Cyan Capsule Eyes */}
          {[-0.075, 0.075].map((ex, eIdx) => (
            <group key={eIdx} position={[ex, 0.01, 0.024]}>
              {/* Outer Cyan Glow Capsule */}
              <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.38, 0.48, 0.2]}>
                <meshStandardMaterial
                  color="#22d3ee"
                  emissive="#06b6d4"
                  emissiveIntensity={3.6}
                  toneMapped={false}
                />
              </mesh>
              {/* Bright Core Catchlight */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[-0.008, 0.018, 0.014]}
                scale={0.014}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          ))}
        </group>

        {/* Lateral Ear Turbines with Concentric Blue Neon Rings */}
        {[-0.23, 0.23].map((ex, eIdx) => (
          <group
            key={eIdx}
            position={[ex, -0.01, 0]}
            rotation={[0, 0, eIdx === 0 ? Math.PI / 2 : -Math.PI / 2]}
          >
            {/* Gold Outer Turbine Bezel */}
            <mesh geometry={SHARED_GEO.collarTorus} scale={0.58}>
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
            {/* Dark Speaker Core */}
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.08, 0.02, 0.08]}>
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
            {/* Concentric Neon Blue Ring */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.015, 0]}
              scale={0.38}
            >
              <meshStandardMaterial
                color="#06b6d4"
                emissive="#06b6d4"
                emissiveIntensity={3.0}
              />
            </mesh>
          </group>
        ))}

        {/* Twin Golden Antennae with Bright Yellow Orbs */}
        {[
          { x: -0.15, rz: 0.35 },
          { x: 0.15, rz: -0.35 },
        ].map((ant, aIdx) => (
          <group
            key={aIdx}
            position={[ant.x, 0.19, 0]}
            rotation={[0, 0, ant.rz]}
          >
            {/* Golden Stalk */}
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.014, 0.14, 0.014]}>
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
            </mesh>
            {/* Spherical Glowing Tip */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.08, 0]}
              scale={0.038}
            >
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={2.2}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});
RobotSkin.displayName = 'RobotSkin';
