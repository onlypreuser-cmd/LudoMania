import { RoundedBox } from '@react-three/drei';
import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Procedural 3D Figurine: Robot (OG Squaries / Cyber Robot)
 * Sculpted to match Reference Sheet 2, Row 2 (Front, Left, Top):
 * - Retro-futuristic TV monitor head with smooth rounded corners (smoothness=8, zero raw cubes)
 * - Recessed dark CRT display glass screen with chamfered gold bezel
 * - Friendly vertical pill/capsule cyan neon glowing digital eyes with white specular catchlights
 * - Top: dual angled yellow/gold antennae with glowing spherical tips, and 3 horizontal blue cooling vents
 * - Sides: clean yellow/orange circular ear knob caps (NO massive stacks of floating rings!)
 * - Body: glossy white mecha torso, round glowing yellow/gold circular chest power core with white hotspot center
 * - Limbs: articulated white arms with gold elbow joint rings, dark metallic hands; white stubby legs with dark feet & gold toe caps
 * - Rear backpack: dual cylindrical rocket thruster turbines with gold rims and glowing cyan exhaust ports
 * - Pedestal: dark sci-fi industrial dais with glowing blue neon circle
 */
export const RobotSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Dark Sci-Fi Industrial Dais with Inset Glowing Cyan Neon Circle */}
      <group position={[0, -0.04, 0]}>
        {/* Dark Industrial Foundation Collar */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#0b1326"
            metalness={0.92}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.06}
          />
        </mesh>
        {/* Polished Gold / Bronze Segmented Outer Ring */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
        </mesh>
        {/* Embedded Glowing Electric-Blue Neon Circle */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.052, 0]} scale={1.12}>
          <meshStandardMaterial
            color="#00e5ff"
            emissive="#00e5ff"
            emissiveIntensity={3.6}
            toneMapped={false}
          />
        </mesh>
        {/* Inset Dark Metallic Dais Floor */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.046, 0]}>
          <meshPhysicalMaterial
            color="#090e1a"
            metalness={0.8}
            roughness={0.22}
            clearcoat={0.9}
          />
        </mesh>
      </group>

      {/* 2. White Stubby Mecha Legs & Chunky Boots with Gold Toe Caps */}
      {[-0.11, 0.11].map((lx, lIdx) => (
        <group key={lIdx} position={[lx, 0.065, 0.02]}>
          {/* White Stubby Leg Thigh */}
          <mesh geometry={SHARED_GEO.unitSphere} scale={[0.072, 0.065, 0.075]} castShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.15}
              metalness={0.22}
              clearcoat={1}
            />
          </mesh>
          {/* Gold Knee Accent Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, -0.01, 0.03]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.36}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* Chunky Mecha Boot Body */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.02, 0.025]}
            scale={[0.082, 0.055, 0.095]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#f8fafc"
              roughness={0.16}
              metalness={0.24}
              clearcoat={0.95}
            />
          </mesh>
          {/* Polished Gold Toe Cap */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.024, 0.085]}
            scale={[0.068, 0.04, 0.045]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Dark Charcoal Tread Sole */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, -0.048, 0.025]}
            scale={[0.078, 0.012, 0.092]}
          >
            <meshStandardMaterial color="#0f172a" roughness={0.65} metalness={0.4} />
          </mesh>
        </group>
      ))}

      {/* 3. Glossy White Mecha Torso & Central Glowing Chest Core */}
      <group position={[0, 0.22, 0]}>
        {/* Plump Ceramic White Torso Shell */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.235, 0.205, 0.21]} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.14}
            metalness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        </mesh>
        {/* Golden Waist Joint Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.095, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.05, 1.05, 0.9]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Golden Neck Collar Joint */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.115, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.9, 0.9, 0.85]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Central Circular Chest Power Core */}
        <group position={[0, 0.015, 0.192]}>
          {/* Raised Golden Outer Bezel */}
          <mesh geometry={SHARED_GEO.collarTorus} scale={0.42}>
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
          </mesh>
          {/* Glowing Amber Power Lens */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.052, 0.052, 0.022]}>
            <meshStandardMaterial
              color="#f59e0b"
              emissive="#f59e0b"
              emissiveIntensity={3.2}
              toneMapped={false}
            />
          </mesh>
          {/* Intense White Energy Hotspot Center */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, 0, 0.014]}
            scale={[0.026, 0.026, 0.012]}
          >
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* Dual Flanking Cyan Telemetry Rivets */}
        {[-0.105, 0.105].map((sx, sIdx) => (
          <mesh
            key={sIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[sx, 0.065, 0.165]}
            scale={0.018}
          >
            <meshStandardMaterial
              color="#00e5ff"
              emissive="#00e5ff"
              emissiveIntensity={2.8}
            />
          </mesh>
        ))}
      </group>

      {/* 4. Articulated White Arms with Gold Joint Rings & Dark Metallic Hands */}
      {[-0.24, 0.24].map((ax, aIdx) => {
        const sign = aIdx === 0 ? 1 : -1;
        return (
          <group
            key={aIdx}
            position={[ax, 0.23, 0.02]}
            rotation={[0.15, 0, sign * 0.35]}
          >
            {/* White Upper Arm Shoulder Capsule */}
            <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.95, 1.05, 0.95]} castShadow>
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.16}
                metalness={0.2}
                clearcoat={0.95}
              />
            </mesh>
            {/* Polished Gold Elbow Joint Ring */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, -0.045, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.5}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
            </mesh>
            {/* Dark Metallic Charcoal Mitten Hand / Wrist */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, -0.125, 0.012]}
              scale={[0.058, 0.058, 0.052]}
            >
              <meshStandardMaterial color="#1e293b" metalness={0.78} roughness={0.25} />
            </mesh>
          </group>
        );
      })}

      {/* 5. Dual Rear Backpack Cylindrical Rocket Thruster Turbines */}
      <group position={[0, 0.25, -0.16]}>
        {[-0.11, 0.11].map((tx, tIdx) => (
          <group key={tIdx} position={[tx, 0, 0]}>
            {/* White Rocket Turbine Housing Cylinder */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.068, 0.14, 0.068]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.16}
                metalness={0.22}
                clearcoat={0.95}
              />
            </mesh>
            {/* Polished Gold Turbine Exhaust Rim */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0, -0.072]}
              scale={0.42}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
            {/* Dark Recessed Exhaust Chamber */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0, -0.075]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={[0.052, 0.015, 0.052]}
            >
              <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.6} />
            </mesh>
            {/* Glowing Cyan Plasma Exhaust Core Disc */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0, -0.082]}
              scale={[0.045, 0.045, 0.016]}
            >
              <meshStandardMaterial
                color="#00e5ff"
                emissive="#00e5ff"
                emissiveIntensity={4.2}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* 6. Retro-Futuristic CRT Monitor Head with Smooth Rounded Corners */}
      <group position={[0, 0.54, 0.01]}>
        {/* Main TV Monitor Head Chassis: High-Smoothness Rounded Box */}
        <RoundedBox
          args={[0.46, 0.38, 0.34]}
          radius={0.08}
          smoothness={8}
          position={[0, 0, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.14}
            metalness={0.22}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        </RoundedBox>

        {/* Top Recessed Ventilation Cooling Slots: 3 Horizontal Blue Glowing Bars */}
        <group position={[0, 0.191, 0.01]}>
          {[-0.045, 0, 0.045].map((vz, vIdx) => (
            <group key={vIdx} position={[0, 0, vz]}>
              {/* Recessed Dark Slot Trench */}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.16, 0.006, 0.02]} />
                <meshStandardMaterial color="#0b1326" roughness={0.4} />
              </mesh>
              {/* Glowing Electric-Blue Core Bar */}
              <mesh position={[0, 0.002, 0]}>
                <boxGeometry args={[0.13, 0.004, 0.012]} />
                <meshStandardMaterial
                  color="#00e5ff"
                  emissive="#00e5ff"
                  emissiveIntensity={3.2}
                />
              </mesh>
            </group>
          ))}
        </group>

        {/* Recessed CRT Curved Display Glass Screen */}
        <group position={[0, -0.01, 0.162]}>
          {/* Chamfered Golden/Amber Screen Frame Bezel */}
          <RoundedBox args={[0.35, 0.27, 0.02]} radius={0.04} smoothness={6}>
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.14} />
          </RoundedBox>
          {/* Deep Dark Glossy CRT Curved Screen Glass */}
          <RoundedBox
            args={[0.32, 0.24, 0.025]}
            radius={0.035}
            smoothness={6}
            position={[0, 0, 0.006]}
          >
            <meshPhysicalMaterial
              color="#060913"
              roughness={0.03}
              metalness={0.82}
              clearcoat={1}
              ior={1.6}
            />
          </RoundedBox>

          {/* Friendly Glowing Neon Cyan Capsule Eyes */}
          {[-0.075, 0.075].map((ex, eIdx) => {
            const sideSign = eIdx === 0 ? -1 : 1;
            return (
              <group key={eIdx} position={[ex, 0.008, 0.026]}>
                {/* Glowing Cyan Vertical Pill Eye */}
                <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.42, 0.52, 0.22]}>
                  <meshStandardMaterial
                    color="#22d3ee"
                    emissive="#00e5ff"
                    emissiveIntensity={3.8}
                    toneMapped={false}
                  />
                </mesh>
                {/* Crisp White Specular Catchlight Dot */}
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[sideSign * -0.006, 0.022, 0.016]}
                  scale={0.014}
                >
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Clean Circular Yellow/Orange Ear Knob Caps (NO Stacks of Rings!) */}
        {[-0.238, 0.238].map((ex, eIdx) => {
          const eSign = eIdx === 0 ? -1 : 1;
          return (
            <group
              key={eIdx}
              position={[ex, -0.005, 0]}
              rotation={[0, 0, eSign * (Math.PI / 2)]}
            >
              {/* Clean Gold/Orange Cylindrical Bezel Knob */}
              <mesh
                geometry={SHARED_GEO.unitCylinder}
                scale={[0.072, 0.025, 0.072]}
              >
                <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
              </mesh>
              {/* Concentric Recessed Cyan-Blue Glowing Lens Disc */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, 0.014, 0]}
                scale={[0.046, 0.012, 0.046]}
              >
                <meshStandardMaterial
                  color="#00e5ff"
                  emissive="#00e5ff"
                  emissiveIntensity={3.4}
                />
              </mesh>
            </group>
          );
        })}

        {/* Dual Angled Golden Antennae with Glowing Spherical Tips */}
        {[
          { x: -0.16, rz: 0.38 },
          { x: 0.16, rz: -0.38 },
        ].map((ant, aIdx) => (
          <group
            key={aIdx}
            position={[ant.x, 0.20, 0]}
            rotation={[0, 0, ant.rz]}
          >
            {/* Gold Antenna Base Mount */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0.01, 0]}
              scale={[0.022, 0.02, 0.022]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
            {/* Slender Golden Antenna Stalk */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, 0.08, 0]}
              scale={[0.013, 0.14, 0.013]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
            </mesh>
            {/* Glowing Golden Spherical Tip Bulb */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.16, 0]}
              scale={0.042}
            >
              <meshStandardMaterial
                color="#fbbf24"
                emissive="#f59e0b"
                emissiveIntensity={2.8}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
});
RobotSkin.displayName = 'RobotSkin';
