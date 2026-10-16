import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Procedural 3D Figurine: Shadow Ninja Master
 * Sculpted to match Reference Sheet 2, Row 3 (Front, Left, Top):
 * - Dynamic low martial arts combat stance in black shinobi shozoku with red belt sash and gold rope trim
 * - Sleek, tight-fitting black fabric face mask covering nose and mouth (cleanly contoured, NO King Kong snout!)
 * - Curved metal forehead protector (hitai-ate) with embossed golden clan spiral crest and gold rivets
 * - Intense sharp anime ninja eyes with amber/gold irises, black eyeliner, and white sclera
 * - Wild voluminous spiky black anime hair with high arched ponytail tied with a red ribbon
 * - Long vibrant crimson red scarf wrapped around neck, billowing dynamically in the wind
 * - Right arm wielding razor-sharp curved steel Katana with gold circular tsuba (handguard) in ready combat stance
 * - Left arm forward in tactical martial arts guard
 * - Circular traditional Japanese dojo flagstone pedestal with crimson lacquer and gold studs
 */
export const NinjaSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Traditional Dojo Stone Flagstone Pedestal with Crimson Lacquer & Gold Studs */}
      <group position={[0, -0.04, 0]}>
        {/* Dark Bronze Foundation Collar */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#2a1408"
            metalness={0.9}
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
        {/* Dark Slate Dojo Flagstone Floor Plate */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#334155"
            roughness={0.7}
            clearcoat={0.2}
          />
        </mesh>
        {/* 4 Golden Diamond / Shuriken Accent Studs Around Rim */}
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

      {/* 2. Low Martial Arts Combat Stance: Crouched Shinobi Legs & Tabi Boots */}
      {/* Left Braced Leg */}
      <group position={[-0.14, 0.08, 0.02]} rotation={[0.2, 0.4, 0.5]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.85, 1.05, 0.85]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} />
        </mesh>
        {/* Gold Shin Armor (Sune-ate) */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0, 0.04]}
          scale={[0.042, 0.1, 0.012]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Black Ninja Tabi Boot */}
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
        {/* Gold Shin Armor (Sune-ate) */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0, 0.04]}
          scale={[0.042, 0.1, 0.012]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Black Ninja Tabi Boot */}
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
        {/* Golden Braided Rope Cord on Obi */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.14, 1.12, 0.35]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.15} />
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

        {/* Golden Neck Gorget Medallion */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.1, 0.185]}
          scale={[0.038, 0.038, 0.016]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Thick Crimson Red Neck Scarf Wrap */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.12, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.96, 0.96, 0.92]}
        >
          <meshPhysicalMaterial
            color="#dc2626"
            roughness={0.45}
            sheen={0.8}
            sheenColor="#fca5a5"
          />
        </mesh>

        {/* Layered Shoulder Guards (Sode) with Gold Trim */}
        {[-0.2, 0.2].map((sx, sIdx) => {
          const sSign = sIdx === 0 ? 1 : -1;
          return (
            <group key={sIdx} position={[sx, 0.12, 0]} rotation={[0, 0, sSign * 0.35]}>
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
          );
        })}
      </group>

      {/* 4. Arms & Katana: Right Arm Wielding Katana, Left Arm in Martial Arts Guard */}
      {/* Right Arm: Extended Holding Katana Angled Dynamically Outward */}
      <group position={[-0.19, 0.25, 0.08]} rotation={[0.4, 0.3, 0.75]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.9, 1.05, 0.9]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} />
        </mesh>
        {/* Polished Gold Arm Guard (Tekko) */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.48}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Handheld Katana Sword Assembly */}
        <group position={[0, -0.16, 0.02]} rotation={[0.3, -0.2, 0.4]}>
          {/* Black Wrapped Hilt (Tsuka) */}
          <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.018, 0.16, 0.018]}>
            <meshPhysicalMaterial color="#171717" roughness={0.7} />
          </mesh>
          {/* Gold Pommel Cap (Kashira) */}
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
          {/* Gold Blade Collar (Habaki) */}
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
              color="#f1f5f9"
              metalness={0.98}
              roughness={0.06}
              clearcoat={1}
              clearcoatRoughness={0.02}
            />
          </mesh>
        </group>
      </group>

      {/* Left Arm: Forward Martial Arts Tactical Guard Pose */}
      <group position={[0.18, 0.24, 0.14]} rotation={[0.6, -0.5, -0.7]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.9, 1.05, 0.9]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.65} />
        </mesh>
        {/* Polished Gold Arm Guard (Tekko) */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.06, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.48}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Open Palm Guarding Hand */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.12, 0.02]}
          scale={[0.045, 0.055, 0.035]}
        >
          <meshStandardMaterial color="#fed7aa" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Chibi Anime Head, Sleek Contoured Face Mask, Forehead Protector & Spiky Hair */}
      <group position={[0, 0.55, 0.02]}>
        {/* Chibi Anime Head Base (Warm Peach Skin) */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.265, 0.245, 0.25]} castShadow>
          <meshPhysicalMaterial
            color="#fed7aa"
            roughness={0.35}
            clearcoat={0.3}
            sheen={0.4}
            sheenColor="#fde68a"
          />
        </mesh>

        {/* Sleek Tight-Fitting Black Shinobi Fabric Face Mask (NO Gorilla/King Kong Snout!) */}
        {/* Lower Face Fitted Mask Wrap */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, -0.055, 0.025]}
          scale={[0.268, 0.165, 0.248]}
        >
          <meshPhysicalMaterial
            color="#0f172a"
            roughness={0.65}
            clearcoat={0.12}
          />
        </mesh>
        {/* Gentle Nose Bridge Contour Under Fabric (Tight, Subtle, Non-Protruding) */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.015, 0.23]}
          scale={[0.038, 0.032, 0.028]}
        >
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>

        {/* Black Fabric Headband Strip Wrapping Around Forehead */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0.125, 0.01]}
          scale={[0.272, 0.055, 0.258]}
        >
          <meshStandardMaterial color="#090d16" roughness={0.7} />
        </mesh>

        {/* Curved Metal Forehead Protector (Hitai-ate) Plate Seated Flush Above Eyes */}
        <group position={[0, 0.125, 0.225]} rotation={[0.15, 0, 0]}>
          {/* Dark Metallic Curved Plate */}
          <mesh scale={[0.16, 0.055, 0.018]}>
            <boxGeometry />
            <meshPhysicalMaterial
              color="#1e293b"
              metalness={0.9}
              roughness={0.16}
              clearcoat={0.8}
            />
          </mesh>
          {/* Polished Gold Plate Rim Bezel */}
          <mesh position={[0, 0, 0.008]} scale={[0.155, 0.05, 0.004]}>
            <boxGeometry />
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Embossed Golden Clan Spiral / Whirlpool Crest */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0, 0.016]}
            scale={[0.22, 0.22, 0.15]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.96} roughness={0.08} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, 0, 0.016]}
            scale={[0.012, 0.012, 0.008]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.96} roughness={0.08} />
          </mesh>
          {/* Left & Right Corner Metal Rivets */}
          {[-0.065, 0.065].map((rx, rIdx) => (
            <mesh
              key={rIdx}
              geometry={SHARED_GEO.lowSphere}
              position={[rx, 0, 0.014]}
              scale={0.007}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
            </mesh>
          ))}
        </group>

        {/* Intense Sharp Anime Ninja Eyes with Amber/Gold Irises & White Sclera */}
        {[-0.092, 0.092].map((ex, eIdx) => {
          const sideSign = eIdx === 0 ? -1 : 1;
          const eyeRadius = 0.044;
          return (
            <group key={eIdx} position={[ex, 0.045, 0.228]} rotation={[0, sideSign * 0.14, sideSign * -0.06]}>
              {/* Sharp Black Stylized Anime Eyeliner Frame */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, 0.008, 0]}
                scale={[eyeRadius * 1.15, eyeRadius * 0.95, eyeRadius * 0.35]}
              >
                <meshBasicMaterial color="#090d16" />
              </mesh>
              {/* Clean White Sclera Base */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, 0, 0.006]}
                scale={[eyeRadius * 1.05, eyeRadius * 0.85, eyeRadius * 0.4]}
              >
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              {/* Glowing Warm Amber/Gold Iris */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, -0.002, 0.014]}
                scale={[eyeRadius * 0.65, eyeRadius * 0.72, eyeRadius * 0.28]}
              >
                <meshStandardMaterial
                  color="#d97706"
                  emissive="#f59e0b"
                  emissiveIntensity={1.3}
                  roughness={0.1}
                />
              </mesh>
              {/* Sharp Black Pupil */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, -0.002, 0.02]}
                scale={[eyeRadius * 0.35, eyeRadius * 0.42, eyeRadius * 0.16]}
              >
                <meshBasicMaterial color="#000000" />
              </mesh>
              {/* Crisp White Specular Catchlight Dot */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[-sideSign * eyeRadius * 0.24, eyeRadius * 0.22, 0.026]}
                scale={eyeRadius * 0.25}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Determined Angled Anime Eyebrow */}
              <mesh
                geometry={SHARED_GEO.unitCylinder}
                position={[0, eyeRadius * 0.78, 0.015]}
                rotation={[0, 0, sideSign * 0.35]}
                scale={[0.006, eyeRadius * 1.1, 0.006]}
              >
                <meshBasicMaterial color="#090d16" />
              </mesh>
            </group>
          );
        })}

        {/* Voluminous Spiky Anime Hair with High Arched Ponytail Tied with Red Ribbon */}
        <group position={[0, 0.08, -0.02]}>
          {/* Base Hair Helmet Cap */}
          <mesh geometry={SHARED_GEO.unitSphere} scale={[0.28, 0.24, 0.26]} castShadow>
            <meshPhysicalMaterial
              color="#0f172a"
              roughness={0.5}
              clearcoat={0.4}
              sheen={0.6}
            />
          </mesh>

          {/* Spiky Anime Bangs & Side Temple Locks */}
          {[
            { x: -0.16, y: -0.02, z: 0.18, rz: 0.4 },
            { x: 0.16, y: -0.02, z: 0.18, rz: -0.4 },
            { x: -0.10, y: 0.11, z: 0.22, rz: 0.25 },
            { x: 0.10, y: 0.11, z: 0.22, rz: -0.25 },
            { x: 0, y: 0.14, z: 0.23, rz: 0 },
            { x: -0.21, y: 0.03, z: 0.06, rz: 0.65 },
            { x: 0.21, y: 0.03, z: 0.06, rz: -0.65 },
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

          {/* High Voluminous Ninja Ponytail Gathered on Top/Back */}
          <group position={[0, 0.23, -0.09]} rotation={[-0.45, 0, 0]}>
            {/* Vibrant Red Ponytail Hair Tie Ribbon */}
            <mesh geometry={SHARED_GEO.collarTorus} scale={0.52}>
              <meshPhysicalMaterial
                color="#dc2626"
                roughness={0.4}
                sheen={0.8}
                sheenColor="#fca5a5"
              />
            </mesh>
            {/* Main Arched Spiky Ponytail Plume */}
            <mesh
              geometry={SHARED_GEO.spikyHairTuft}
              position={[0, 0.15, 0]}
              scale={[1.35, 1.45, 1.25]}
              castShadow
            >
              <meshPhysicalMaterial
                color="#0f172a"
                roughness={0.48}
                clearcoat={0.4}
              />
            </mesh>
            {/* Flared Sub-Spikes on Ponytail */}
            {[-0.05, 0.05].map((px, pIdx) => {
              const sign = pIdx === 0 ? -1 : 1;
              return (
                <mesh
                  key={pIdx}
                  geometry={SHARED_GEO.earCone}
                  position={[px, 0.12, 0.04]}
                  rotation={[0.2, 0, sign * 0.32]}
                  scale={[0.44, 0.72, 0.36]}
                >
                  <meshPhysicalMaterial color="#090d16" roughness={0.45} />
                </mesh>
              );
            })}
          </group>
        </group>

        {/* Dynamic Billowing Crimson Ribbon & Long Scarf Tails Sweeping in Wind */}
        <group position={[0.18, 0.04, -0.06]} rotation={[0.1, 0.6, 0.2]}>
          {/* Main Flowing Red Scarf Tail Ribbon */}
          <mesh
            geometry={SHARED_GEO.flowingRibbon}
            rotation={[0, 0, -0.1]}
            scale={[1.4, 1.25, 1.0]}
          >
            <meshPhysicalMaterial
              color="#dc2626"
              roughness={0.35}
              clearcoat={0.55}
              sheen={0.85}
              sheenColor="#fca5a5"
            />
          </mesh>
          {/* Secondary Shorter Billowing Scarf Streamer */}
          <mesh
            geometry={SHARED_GEO.flowingRibbon}
            position={[0, -0.045, -0.045]}
            rotation={[0.2, 0.15, -0.3]}
            scale={[1.1, 1.15, 0.9]}
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
