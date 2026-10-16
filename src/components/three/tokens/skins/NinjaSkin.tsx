import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Shadow Ninja Master Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 2, Row 3)
 * Features:
 * - Low martial arts combat stance in black shinobi shozoku
 * - Curved steel katana blade with gold circular tsuba and black hilt
 * - Black shinobi face mask and intense amber-gold expressive anime eyes
 * - Metal forehead protector (hitai-ate) with embossed golden clan spiral emblem
 * - Voluminous spiky black anime hair with high flowing ponytail
 * - Dynamic crimson red headband ribbon tails billowing in the wind
 * - Layered shoulder guards (sode), gold neck gorget, red obi sash, and forearm kote
 * - Traditional Japanese dojo stone flagstone pedestal with crimson lacquer and gold studs
 */
export const NinjaSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Dojo Flagstone Pedestal with Crimson Lacquer & Gold Studs */}
      <group position={[0, -0.04, 0]}>
        {/* Bronze Outer Foundation */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#451a03"
            metalness={0.88}
            roughness={0.2}
            clearcoat={0.9}
          />
        </mesh>
        {/* Crimson Lacquered Outer Ring */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshPhysicalMaterial
            color="#dc2626"
            roughness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.04}
          />
        </mesh>
        {/* Golden Inset Accent Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.052, 0]}
          scale={1.12}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
        {/* Dark Slate Dojo Flagstone Plate */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#334155"
            roughness={0.7}
            clearcoat={0.2}
          />
        </mesh>
        {/* 4 Golden Shuriken Accent Studs Around Rim */}
        {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((ang, sIdx) => (
          <mesh
            key={sIdx}
            geometry={SHARED_GEO.star3D}
            position={[Math.sin(ang) * 0.33, 0.055, Math.cos(ang) * 0.33]}
            rotation={[Math.PI / 2, 0, ang]}
            scale={0.45}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
          </mesh>
        ))}
      </group>

      {/* 2. Low Martial Arts Stance: Shinobi Legs & Tabi Boots */}
      {/* Left Braced Leg */}
      <group position={[-0.14, 0.08, 0.02]} rotation={[0.2, 0.4, 0.5]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.85, 1.05, 0.85]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} />
        </mesh>
        {/* Gold Shin Guard */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0, 0.04]}
          scale={[0.042, 0.1, 0.012]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Black Tabi Boot */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.09, 0.04]}
          scale={[0.065, 0.048, 0.085]}
        >
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>

      {/* Right Forward Braced Leg */}
      <group position={[0.14, 0.08, 0.04]} rotation={[0.25, -0.4, -0.5]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.85, 1.05, 0.85]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0, 0.04]}
          scale={[0.042, 0.1, 0.012]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.09, 0.04]}
          scale={[0.065, 0.048, 0.085]}
        >
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>

      {/* 3. Black Shinobi Torso, Red Scarf & Crimson Obi Sash */}
      <group position={[0, 0.22, 0]}>
        {/* Charcoal Black Fabric Gi */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.22, 0.2, 0.19]} castShadow>
          <meshPhysicalMaterial
            color="#0f172a"
            roughness={0.65}
            clearcoat={0.15}
            sheen={0.4}
          />
        </mesh>

        {/* Crimson Red Waist Obi Sash */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.12, 1.1, 0.85]}
        >
          <meshPhysicalMaterial
            color="#dc2626"
            roughness={0.4}
            sheen={0.8}
            sheenColor="#fca5a5"
          />
        </mesh>
        {/* Obi Knot & Hanging Red Tassels */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[-0.04, -0.08, 0.19]}
          scale={[0.035, 0.035, 0.02]}
        >
          <meshStandardMaterial color="#b91c1c" roughness={0.4} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.capsuleLimb}
          position={[-0.05, -0.15, 0.18]}
          rotation={[0.1, 0, 0.25]}
          scale={[0.4, 0.65, 0.35]}
        >
          <meshStandardMaterial color="#dc2626" roughness={0.45} />
        </mesh>

        {/* Golden Gorget Medallion at Throat */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.1, 0.185]}
          scale={[0.038, 0.038, 0.016]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Red Neck Scarf Wrap */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.12, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.95, 0.95, 0.9]}
        >
          <meshPhysicalMaterial color="#dc2626" roughness={0.45} />
        </mesh>

        {/* Layered Shoulder Guards (Sode) with Gold Trim */}
        {[-0.2, 0.2].map((sx, sIdx) => (
          <group key={sIdx} position={[sx, 0.12, 0]} rotation={[0, 0, sIdx === 0 ? 0.35 : -0.35]}>
            <mesh geometry={SHARED_GEO.lowSphere} scale={[0.075, 0.045, 0.085]}>
              <meshPhysicalMaterial color="#1e293b" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, -0.015, 0]}
              scale={[0.065, 0.01, 0.075]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
            </mesh>
          </group>
        ))}
      </group>

      {/* 4. Arms: Right Arm Holding Katana, Left Arm in Combat Guard */}
      {/* Right Arm: Extended with Katana Angled Outward */}
      <group position={[-0.19, 0.25, 0.08]} rotation={[0.4, 0.3, 0.75]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.9, 1.05, 0.9]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} />
        </mesh>
        {/* Gold Arm Guard (Kote) */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.48}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Handheld Katana Sword */}
        <group position={[0, -0.16, 0.02]} rotation={[0.3, -0.2, 0.4]}>
          {/* Black Wrapped Hilt (Tsuka) */}
          <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.018, 0.16, 0.018]}>
            <meshPhysicalMaterial color="#171717" roughness={0.7} />
          </mesh>
          {/* Gold Pommel (Kashira) */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.085, 0]}
            scale={[0.022, 0.018, 0.022]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
          </mesh>
          {/* Circular Gold Handguard (Tsuba) */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, 0.08, 0]}
            scale={[0.058, 0.008, 0.058]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
          </mesh>
          {/* Gold Habaki Blade Collar */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, 0.095, 0]}
            scale={[0.024, 0.022, 0.024]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* Curved Razor Steel Katana Blade */}
          <mesh
            geometry={SHARED_GEO.katanaBlade}
            position={[0, 0.1, -0.004]}
            rotation={[0, 0, 0]}
            scale={1.25}
            castShadow
          >
            <meshPhysicalMaterial
              color="#e2e8f0"
              metalness={0.98}
              roughness={0.06}
              clearcoat={1}
              clearcoatRoughness={0.02}
            />
          </mesh>
        </group>
      </group>

      {/* Left Arm: Forward Ready Combat Guard Pose */}
      <group position={[0.18, 0.24, 0.14]} rotation={[0.6, -0.5, -0.7]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.9, 1.05, 0.9]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.06, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.48}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Open Palm Guard Hand */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.12, 0.02]}
          scale={[0.045, 0.055, 0.035]}
        >
          <meshStandardMaterial color="#ffedd5" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Head, Face Mask, Forehead Protector & Expressive Eyes */}
      <group position={[0, 0.55, 0.02]}>
        {/* Chibi Anime Head Base (Peach Skin) */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.265, 0.235, 0.25]} castShadow>
          <meshPhysicalMaterial
            color="#ffedd5"
            roughness={0.35}
            clearcoat={0.3}
            sheen={0.4}
            sheenColor="#fed7aa"
          />
        </mesh>

        {/* Black Shinobi Fabric Face Mask (Covering Nose & Mouth) */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.05, 0.12]}
          scale={[0.23, 0.14, 0.18]}
        >
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} clearcoat={0.15} />
        </mesh>

        {/* Black Metal Forehead Protector (Hitai-ate) Plate */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0.09, 0.22]}
          rotation={[0.15, 0, 0]}
          scale={[0.14, 0.048, 0.024]}
        >
          <meshPhysicalMaterial
            color="#1e293b"
            metalness={0.88}
            roughness={0.18}
            clearcoat={0.8}
          />
        </mesh>
        {/* Embossed Golden Clan Spiral / Shuriken Crest */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.09, 0.238]}
          scale={[0.025, 0.025, 0.012]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
        </mesh>

        {/* 3-Layer Intense Expressive Amber Anime Eyes */}
        <ExpressiveEye pos={[-0.095, 0.04, 0.23]} irisColor="#b45309" eyeRadius={0.048} />
        <ExpressiveEye pos={[0.095, 0.04, 0.23]} irisColor="#b45309" eyeRadius={0.048} />

        {/* Voluminous Spiky Anime Hair (Layered Locks) */}
        <group position={[0, 0.08, -0.02]}>
          {/* Hair Cap Base */}
          <mesh geometry={SHARED_GEO.unitSphere} scale={[0.28, 0.24, 0.26]} castShadow>
            <meshPhysicalMaterial
              color="#0f172a"
              roughness={0.5}
              clearcoat={0.4}
              sheen={0.6}
            />
          </mesh>
          {/* Spiky Hair Bangs & Side Locks */}
          {[
            { x: -0.16, y: -0.02, z: 0.18, rz: 0.4 },
            { x: 0.16, y: -0.02, z: 0.18, rz: -0.4 },
            { x: -0.09, y: 0.11, z: 0.21, rz: 0.2 },
            { x: 0.09, y: 0.11, z: 0.21, rz: -0.2 },
            { x: 0, y: 0.14, z: 0.22, rz: 0 },
          ].map((spk, sIdx) => (
            <mesh
              key={sIdx}
              geometry={SHARED_GEO.earCone}
              position={[spk.x, spk.y, spk.z]}
              rotation={[0.3, 0, spk.rz]}
              scale={[0.48, 0.65, 0.35]}
            >
              <meshPhysicalMaterial color="#090d16" roughness={0.45} />
            </mesh>
          ))}
          {/* High Spiky Ninja Ponytail Gathered on Top/Back */}
          <group position={[0, 0.22, -0.1]} rotation={[-0.45, 0, 0]}>
            {/* Red Ponytail Hair Tie */}
            <mesh geometry={SHARED_GEO.collarTorus} scale={0.52}>
              <meshPhysicalMaterial color="#dc2626" roughness={0.4} />
            </mesh>
            {/* Spiky Arched Ponytail Tuft */}
            <mesh
              geometry={SHARED_GEO.spikyHairTuft}
              position={[0, 0.14, 0]}
              scale={[1.3, 1.4, 1.2]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.48}
                clearcoat={0.4}
              />
            </mesh>
            {/* Flared Sub-Spikes on Ponytail */}
            {[-0.05, 0.05].map((px, pIdx) => (
              <mesh
                key={pIdx}
                geometry={SHARED_GEO.earCone}
                position={[px, 0.12, 0.04]}
                rotation={[0.2, 0, pIdx === 0 ? -0.3 : 0.3]}
                scale={[0.42, 0.7, 0.35]}
              >
                <meshPhysicalMaterial color="#090d16" roughness={0.45} />
              </mesh>
            ))}
          </group>
        </group>

        {/* Dynamic Billowing Crimson Ribbon Tails (Tied to Headband) */}
        <group position={[0.18, 0.08, -0.06]} rotation={[0.1, 0.6, 0.2]}>
          {/* Main Long Red Ribbon Strip */}
          <mesh
            geometry={SHARED_GEO.flowingRibbon}
            rotation={[0, 0, -0.1]}
            scale={[1.3, 1.2, 1.0]}
          >
            <meshPhysicalMaterial
              color="#dc2626"
              roughness={0.35}
              clearcoat={0.5}
              sheen={0.8}
              sheenColor="#fca5a5"
            />
          </mesh>
          {/* Second Offset Shorter Ribbon Strip */}
          <mesh
            geometry={SHARED_GEO.flowingRibbon}
            position={[0, -0.04, -0.04]}
            rotation={[0.2, 0.15, -0.3]}
            scale={[1.0, 1.1, 0.9]}
          >
            <meshPhysicalMaterial
              color="#b91c1c"
              roughness={0.38}
              clearcoat={0.5}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
});
NinjaSkin.displayName = 'NinjaSkin';
