import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Captain Pirate Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 1, Row 2)
 * Features:
 * - Chibi anime pirate boy, cute friendly anime face with a cheerful smile and rosy cheeks
 * - Black leather eyepatch over left eye with diagonal strap and gold buckle
 * - Golden hoop earrings on BOTH ears!
 * - Wavy, layered chocolate-brown anime hair curling down around face, ears, and neck
 * - Sweeping black pirate captain bicorne/tricorn hat with wide flared brim, gold filigree border, and 3D golden skull & crossbones emblem
 * - Red bandana tied underneath hat with vibrant red ribbon tails fluttering behind/left
 * - Crimson red pirate captain frock coat with gold lapels, gold buttons, white ruffled lace jabot/cravat, brown belt with gold buckle
 * - Holding curved steel pirate cutlass / saber with gold guard in right hand, left hand on hip
 * - Dark buccaneer trousers & black boots with gold buckles
 * - Round dark oak ship-deck / barrel plank pedestal with brass hoops and mini golden skull studs
 */
export const PirateSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Dark Oak Ship-Deck / Barrel Plank Pedestal Base with Brass Hoops & Skull Studs */}
      <group position={[0, -0.04, 0]}>
        {/* Dark Oak Wooden Barrel Body */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#3d1e08"
            roughness={0.65}
            clearcoat={0.25}
          />
        </mesh>
        {/* Upper Polished Brass Barrel Hoop */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.14} />
        </mesh>
        {/* Lower Polished Brass Barrel Hoop */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, -0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.14} />
        </mesh>
        {/* Ship-Deck Top Planks Plate */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#542d14"
            roughness={0.58}
            clearcoat={0.3}
          />
        </mesh>

        {/* Brass Rivets Spaced Around the Upper Rim */}
        {[0, 0.7, 1.4, 2.1, 2.8, 3.5, 4.2, 4.9, 5.6].map((ang, rIdx) => (
          <mesh
            key={rIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[Math.sin(ang) * 0.35, 0.048, Math.cos(ang) * 0.35]}
            scale={0.012}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
        ))}

        {/* 3D Mini Golden Skull & Crossbones Stud on Front Rim */}
        <group position={[0, 0.02, 0.35]}>
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.026, 0.024, 0.014]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
          </mesh>
          {/* Crossed Bones */}
          {[-0.78, 0.78].map((bAng, bIdx) => (
            <mesh
              key={bIdx}
              geometry={SHARED_GEO.unitCylinder}
              rotation={[0, 0, bAng]}
              scale={[0.005, 0.038, 0.005]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 2. Confident Buccaneer Boots & Trousers */}
      {[-0.1, 0.1].map((bx, bIdx) => (
        <group key={bIdx} position={[bx, 0.065, 0.02]}>
          {/* Black Pirate Boot Body */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.085, 0.065, 0.105]} castShadow>
            <meshPhysicalMaterial
              color="#090d16"
              roughness={0.28}
              metalness={0.3}
              clearcoat={0.8}
            />
          </mesh>
          {/* Gold Boot Buckle / Cuff Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.042, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.46}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
          {/* Rectangular Gold Boot Buckle on Front */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, 0.04, 0.09]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.022, 0.008, 0.018]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Dark Charcoal Buccaneer Trousers */}
          <mesh
            geometry={SHARED_GEO.capsuleLimb}
            position={[0, 0.08, 0]}
            scale={[0.7, 0.6, 0.7]}
          >
            <meshStandardMaterial color="#1e293b" roughness={0.65} />
          </mesh>
        </group>
      ))}

      {/* 3. Crimson Pirate Captain Frock Coat, Lapels, Lace Jabot & Belt */}
      <group position={[0, 0.22, 0]}>
        {/* Main Crimson Red Frock Coat Body */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.225, 0.2, 0.195]} castShadow>
          <meshPhysicalMaterial
            color="#b91c1c"
            roughness={0.38}
            clearcoat={0.35}
            sheen={0.75}
            sheenColor="#fca5a5"
          />
        </mesh>

        {/* Dynamic Flowing Red Coat Tails Flared Backward (visible in Left/Top view) */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, -0.07, -0.11]}
          rotation={[0.35, 0, 0]}
          scale={[0.22, 0.16, 0.16]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#991b1b"
            roughness={0.42}
            sheen={0.7}
            sheenColor="#fca5a5"
          />
        </mesh>

        {/* Polished Gold Lapel Trim Borders */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[-0.065, 0.04, 0.19]}
          rotation={[0.2, 0.15, -0.45]}
          scale={[0.014, 0.24, 0.008]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0.065, 0.04, 0.19]}
          rotation={[0.2, -0.15, 0.45]}
          scale={[0.014, 0.24, 0.008]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>

        {/* Polished Gold Buttons Down Coat Front */}
        {[-0.04, 0.02, 0.08].map((by, bIdx) => (
          <group key={bIdx}>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-0.07, by, 0.185]}
              scale={0.012}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0.07, by, 0.185]}
              scale={0.012}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
          </group>
        ))}

        {/* White Ruffled Lace Jabot / Cravat Collar (Tiered Scalloped Lace) */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.13, 0.18]}
          scale={[0.065, 0.05, 0.03]}
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.45} sheen={0.6} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.08, 0.19]}
          scale={[0.052, 0.045, 0.024]}
        >
          <meshPhysicalMaterial color="#f8fafc" roughness={0.45} sheen={0.5} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.03, 0.195]}
          scale={[0.038, 0.035, 0.02]}
        >
          <meshPhysicalMaterial color="#f1f5f9" roughness={0.45} />
        </mesh>

        {/* Dark Brown Leather Waist Belt */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.12, 1.1, 0.85]}
        >
          <meshPhysicalMaterial color="#29180c" roughness={0.4} clearcoat={0.4} />
        </mesh>
        {/* Polished Gold Rectangular Belt Buckle */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, -0.08, 0.2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.075, 0.015, 0.055]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
        {/* Inner Belt Cutout */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, -0.08, 0.208]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[0.045, 0.018, 0.032]}
        >
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
      </group>

      {/* 4. Arms: Right Arm Holding Steel Cutlass, Left Arm Confidently on Hip */}
      {/* Right Arm: Holding Curved Steel Cutlass Sword */}
      <group position={[-0.2, 0.24, 0.06]} rotation={[0.38, 0.22, 0.58]}>
        {/* Crimson Sleeve with Gold Cuff Ring */}
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
          {/* Black Leather Handle Grip */}
          <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.018, 0.14, 0.018]}>
            <meshPhysicalMaterial color="#1c1917" roughness={0.6} />
          </mesh>
          {/* Gold Pommel Cap at Handle Base */}
          <mesh geometry={SHARED_GEO.lowSphere} position={[0, -0.075, 0]} scale={0.024}>
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
          </mesh>
          {/* Golden D-Guard / Basket Knuckle Guard */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0.028, 0.01, 0]}
            rotation={[0, 0, Math.PI / 2]}
            scale={[0.42, 0.26, 0.26]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Curved Razor Steel Cutlass Blade */}
          <mesh
            geometry={SHARED_GEO.cutlassBlade}
            position={[0, 0.07, -0.005]}
            scale={1.38}
            castShadow
          >
            <meshPhysicalMaterial
              color="#e2e8f0"
              metalness={0.98}
              roughness={0.05}
              clearcoat={1}
            />
          </mesh>
        </group>
      </group>

      {/* Left Arm: Confidently Resting on Hip */}
      <group position={[0.2, 0.22, 0.04]} rotation={[-0.1, -0.2, -0.75]}>
        {/* Crimson Sleeve with Gold Cuff Ring */}
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
        {/* Hand Resting on Hip */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.12, 0.01]}
          scale={[0.048, 0.048, 0.042]}
        >
          <meshStandardMaterial color="#fed7aa" roughness={0.4} />
        </mesh>
      </group>

      {/* 5. Chibi Anime Captain Head, Face, Eyepatch, Earrings & Layered Wavy Hair */}
      <group position={[0, 0.54, 0.02]}>
        {/* Smooth Peach Skin Chibi Cranium */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.265, 0.235, 0.245]} castShadow>
          <meshPhysicalMaterial
            color="#ffedd5"
            roughness={0.35}
            clearcoat={0.3}
            sheen={0.4}
            sheenColor="#fed7aa"
          />
        </mesh>

        {/* Chubby Cheeks */}
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

        {/* Rosy Anime Blush Circles on Cheeks */}
        {[-0.145, 0.145].map((bx, bIdx) => (
          <mesh
            key={bIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[bx, -0.015, 0.19]}
            scale={[0.042, 0.025, 0.018]}
          >
            <meshStandardMaterial color="#fda4af" roughness={0.55} />
          </mesh>
        ))}

        {/* Cute Button Nose */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.02, 0.238]}
          scale={[0.018, 0.014, 0.015]}
        >
          <meshStandardMaterial color="#fed7aa" roughness={0.45} />
        </mesh>

        {/* Cheerful Friendly Anime Smile */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.06, 0.22]}
          rotation={[0.3, 0, 0]}
          scale={[0.16, 0.12, 0.08]}
        >
          <meshStandardMaterial color="#be123c" roughness={0.5} />
        </mesh>

        {/* Right Eye: Large Expressive Sparkling Anime Boy Eye */}
        <group position={[-0.095, 0.035, 0.225]}>
          {/* Deep Navy/Ocean Blue Iris */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.052, 0.056, 0.038]}>
            <meshPhysicalMaterial
              color="#1d4ed8"
              roughness={0.06}
              clearcoat={1}
              ior={1.48}
            />
          </mesh>
          {/* Dark Pupil */}
          <mesh geometry={SHARED_GEO.lowSphere} position={[0, 0, 0.02]} scale={[0.034, 0.036, 0.02]}>
            <meshBasicMaterial color="#090d16" />
          </mesh>
          {/* Primary Top-Left Catchlight */}
          <mesh geometry={SHARED_GEO.lowSphere} position={[-0.016, 0.018, 0.032]} scale={0.018}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Secondary Bottom-Right Catchlight */}
          <mesh geometry={SHARED_GEO.lowSphere} position={[0.014, -0.014, 0.03]} scale={0.01}>
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Delicate Upper Anime Eyelid Line */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.032, 0.022]}
            rotation={[0, 0, -0.1]}
            scale={[0.16, 0.08, 0.06]}
          >
            <meshBasicMaterial color="#3e1e0d" />
          </mesh>
          {/* Confident Brown Eyebrow */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0.005, 0.055, 0.015]}
            rotation={[0, 0, 0.15]}
            scale={[0.045, 0.012, 0.012]}
          >
            <meshStandardMaterial color="#451a03" roughness={0.6} />
          </mesh>
        </group>

        {/* Left Eye: Authentic Black Leather Eyepatch & Diagonal Strap */}
        <group>
          {/* Diagonal Leather Strap Crossing Forehead to Ear */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.045, 0]}
            rotation={[0.3, 0.45, 0.28]}
            scale={[1.16, 1.14, 0.9]}
          >
            <meshPhysicalMaterial color="#090d16" roughness={0.35} clearcoat={0.5} />
          </mesh>
          {/* Convex Black Leather Eyepatch Cup Over Left Eye */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0.095, 0.035, 0.235]}
            scale={[0.062, 0.062, 0.02]}
          >
            <meshPhysicalMaterial color="#090d16" roughness={0.28} clearcoat={0.6} />
          </mesh>
          {/* Golden Strap Buckle/Rivet Stud Detail */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0.135, 0.065, 0.21]}
            scale={0.013}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
        </group>

        {/* Chibi Ears on Both Sides with SHINY GOLDEN HOOP EARRINGS ON BOTH EARS! */}
        {[-0.24, 0.24].map((ex, eIdx) => {
          const sign = eIdx === 0 ? -1 : 1;
          return (
            <group key={eIdx} position={[ex, 0, 0.02]}>
              {/* Peach Ear Flesh */}
              <mesh geometry={SHARED_GEO.lowSphere} scale={[0.035, 0.05, 0.03]}>
                <meshStandardMaterial color="#ffedd5" roughness={0.4} />
              </mesh>
              {/* Golden Hoop Earring Hanging from Lobe */}
              <mesh
                geometry={SHARED_GEO.collarTorus}
                position={[sign * 0.01, -0.045, 0]}
                rotation={[0, Math.PI / 2, 0]}
                scale={0.16}
              >
                <meshStandardMaterial
                  color="#fbbf24"
                  metalness={0.96}
                  roughness={0.06}
                />
              </mesh>
            </group>
          );
        })}

        {/* Wavy, Layered Chocolate-Brown Anime Hair Curling Around Face & Neck */}
        <group>
          {/* Front Forehead Fringe Bangs Peeking Under Bandana */}
          {[
            { x: -0.06, y: 0.11, z: 0.23, rz: 0.25, s: 0.8 },
            { x: 0.02, y: 0.12, z: 0.235, rz: -0.15, s: 0.85 },
            { x: -0.12, y: 0.08, z: 0.21, rz: 0.4, s: 0.75 },
          ].map((bang, bIdx) => (
            <mesh
              key={bIdx}
              geometry={SHARED_GEO.earCone}
              position={[bang.x, bang.y, bang.z]}
              rotation={[0.3, 0, bang.rz]}
              scale={[0.35 * bang.s, 0.5 * bang.s, 0.25 * bang.s]}
            >
              <meshPhysicalMaterial color="#3d1e08" roughness={0.5} />
            </mesh>
          ))}

          {/* Left & Right Wavy Sideburn Curls Framing Cheeks */}
          {[-0.18, 0.18].map((sx, sIdx) => {
            const sSign = sIdx === 0 ? -1 : 1;
            return (
              <group key={sIdx}>
                <mesh
                  geometry={SHARED_GEO.lowSphere}
                  position={[sx, -0.04, 0.14]}
                  rotation={[0.2, 0, sSign * 0.3]}
                  scale={[0.075, 0.11, 0.07]}
                >
                  <meshPhysicalMaterial color="#3d1e08" roughness={0.5} />
                </mesh>
                <mesh
                  geometry={SHARED_GEO.earCone}
                  position={[sx * 1.08, -0.1, 0.1]}
                  rotation={[0.3, 0, sSign * 0.4]}
                  scale={[0.38, 0.52, 0.3]}
                >
                  <meshPhysicalMaterial color="#3d1e08" roughness={0.5} />
                </mesh>
              </group>
            );
          })}

          {/* Lush Wavy Back Hair Cascading Down Neck (visible under hat from left & top) */}
          {[
            { x: -0.12, y: -0.1, z: -0.12, s: 1.05 },
            { x: 0, y: -0.11, z: -0.14, s: 1.15 },
            { x: 0.12, y: -0.1, z: -0.12, s: 1.05 },
            { x: -0.18, y: -0.07, z: -0.05, s: 0.95 },
            { x: 0.18, y: -0.07, z: -0.05, s: 0.95 },
          ].map((hair, hIdx) => (
            <mesh
              key={hIdx}
              geometry={SHARED_GEO.lowSphere}
              position={[hair.x, hair.y, hair.z]}
              scale={[0.09 * hair.s, 0.13 * hair.s, 0.09 * hair.s]}
              castShadow
            >
              <meshPhysicalMaterial color="#3d1e08" roughness={0.52} />
            </mesh>
          ))}
        </group>

        {/* Crimson Red Bandana Wrapped Snugly Under Hat */}
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

        {/* Bandana Knotted Knot & Fluttering Red Ribbon Tails Draping to Left/Rear */}
        <group position={[0.22, 0.08, -0.05]} rotation={[0.1, -0.5, -0.3]}>
          {/* Bandana Knot */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.048, 0.048, 0.035]}>
            <meshStandardMaterial color="#b91c1c" roughness={0.45} />
          </mesh>
          {/* Long Fluttering Red Ribbon Tails */}
          <mesh
            geometry={SHARED_GEO.flowingRibbon}
            position={[0.02, -0.02, 0]}
            rotation={[0, 0, -0.2]}
            scale={[1.15, 1.05, 0.95]}
          >
            <meshPhysicalMaterial
              color="#dc2626"
              roughness={0.35}
              clearcoat={0.5}
              sheen={0.8}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.flowingRibbon}
            position={[0.01, -0.05, -0.02]}
            rotation={[0.2, 0.2, -0.35]}
            scale={[0.9, 0.85, 0.85]}
          >
            <meshPhysicalMaterial
              color="#b91c1c"
              roughness={0.4}
              clearcoat={0.5}
              sheen={0.8}
            />
          </mesh>
        </group>

        {/* 6. Sweeping Black Bicorne / Tricorn Captain Hat with Gold Filigree Brim & 3D Skull Crest */}
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

          {/* Sweeping Wide Flared Hat Brim Rim */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.04, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.56, 1.18, 0.7]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
          {/* Additional Outer Gold Filigree Accent Ring */}
          <mesh
            geometry={SHARED_GEO.collarTorus}
            position={[0, 0.05, -0.02]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.6, 1.22, 0.65]}
          >
            <meshStandardMaterial color="#d97706" metalness={0.92} roughness={0.14} />
          </mesh>

          {/* 3D Embossed Golden Skull & Crossbones Front Crest */}
          <group position={[0, 0.06, 0.165]}>
            {/* Skull Cranium */}
            <mesh geometry={SHARED_GEO.lowSphere} scale={[0.048, 0.044, 0.022]}>
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
            {/* Skull Eye Socket Holes */}
            {[-0.015, 0.015].map((skX, sIdx) => (
              <mesh
                key={sIdx}
                geometry={SHARED_GEO.lowSphere}
                position={[skX, 0.005, 0.018]}
                scale={0.009}
              >
                <meshBasicMaterial color="#090d16" />
              </mesh>
            ))}
            {/* Skull Nose Cavity */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, -0.008, 0.018]}
              scale={[0.006, 0.007, 0.006]}
            >
              <meshBasicMaterial color="#090d16" />
            </mesh>
            {/* Crossed Bones Behind Skull */}
            {[-0.75, 0.75].map((bAng, bIdx) => (
              <mesh
                key={bIdx}
                geometry={SHARED_GEO.unitCylinder}
                rotation={[0, 0, bAng]}
                scale={[0.008, 0.095, 0.008]}
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
