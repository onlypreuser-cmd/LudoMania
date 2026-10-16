import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Celestial Unicorn Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 1, Row 3)
 * Features:
 * - Cuddly quadruped white pony/foal sitting neatly on a cloud platform (front hooves in front, hind haunches tucked, golden hooves)
 * - Cute pony muzzle/snout with soft pink nostrils and baby cheeks (real horse/foal feel, not a human doll!)
 * - Giant soulful anime eyes with deep indigo/violet gradient, white catchlights, and star glints
 * - Golden helical spiral alicorn horn on forehead with cute white pony ears
 * - Golden star hair clip nestled on left mane curls
 * - Multi-layered pastel cotton-candy rainbow swirl mane (pink, purple, cyan, yellow) cascading down both sides
 * - Swirled pastel rainbow tail curving up at rear
 * - Delicate white pegasus wings on the sides
 * - Golden collar necklace with glowing blue jewel pendant on chest!
 * - Whimsical pastel-rainbow dream cloud pedestal with a golden star crest on front
 */
export const UnicornSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Whimsical Pastel-Rainbow Dream Cloud Pedestal with Golden Star Crest */}
      <group position={[0, -0.04, 0]}>
        {/* Iridescent Golden Foundation Rim */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.92}
            roughness={0.12}
            clearcoat={1}
          />
        </mesh>
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#f59e0b" metalness={0.94} roughness={0.08} />
        </mesh>
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, -0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#f59e0b" metalness={0.94} roughness={0.08} />
        </mesh>

        {/* Puffy Soft Pastel Cotton-Candy Cloud Mounds Ring */}
        {[
          { x: 0, y: 0.04, z: 0.22, s: 0.14, col: '#fdf4ff' },
          { x: -0.16, y: 0.035, z: 0.16, s: 0.13, col: '#fce7f3' },
          { x: 0.16, y: 0.035, z: 0.16, s: 0.13, col: '#e0f2fe' },
          { x: -0.22, y: 0.03, z: 0, s: 0.13, col: '#f3e8ff' },
          { x: 0.22, y: 0.03, z: 0, s: 0.13, col: '#fef08a' },
          { x: -0.15, y: 0.035, z: -0.16, s: 0.13, col: '#e0f2fe' },
          { x: 0.15, y: 0.035, z: -0.16, s: 0.13, col: '#fdf4ff' },
          { x: 0, y: 0.03, z: -0.2, s: 0.14, col: '#f3e8ff' },
        ].map((c, cIdx) => (
          <mesh
            key={cIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[c.x, c.y, c.z]}
            scale={[c.s * 1.3, c.s * 0.75, c.s * 1.2]}
            castShadow
          >
            <meshPhysicalMaterial
              color={c.col}
              roughness={0.3}
              clearcoat={0.8}
              sheen={0.9}
              sheenColor="#f472b6"
            />
          </mesh>
        ))}

        {/* 3D Golden Star Crest on Front Cloud Rim */}
        <mesh
          geometry={SHARED_GEO.star3D}
          position={[0, 0.045, 0.33]}
          rotation={[0.3, 0, 0]}
          scale={0.95}
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.95}
            roughness={0.06}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* 2. Plump Pure-White Pearlescent Seated Foal Body */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.21, -0.01]}
        scale={[0.22, 0.21, 0.23]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.22}
          metalness={0.08}
          clearcoat={0.95}
          clearcoatRoughness={0.04}
          sheen={0.85}
          sheenColor="#fdf4ff"
        />
      </mesh>

      {/* 3. Golden Collar Necklace with Glowing Blue Gem Pendant on Chest */}
      <group position={[0, 0.25, 0.06]}>
        {/* Gold Choker Collar Ring */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          rotation={[0.35, 0, 0]}
          scale={[0.62, 0.62, 0.45]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
        </mesh>
        {/* Gold Pendant Bezel Setting */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.06, 0.12]}
          scale={[0.034, 0.042, 0.02]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
        </mesh>
        {/* Glowing Sky-Blue / Cyan Faceted Gem Jewel */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.06, 0.13]}
          scale={[0.024, 0.032, 0.018]}
        >
          <meshPhysicalMaterial
            color="#06b6d4"
            emissive="#06b6d4"
            emissiveIntensity={2.8}
            metalness={0.25}
            roughness={0.05}
            clearcoat={1}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* 4. Quadruped Seated Foal Legs with Polished Golden Hooves */}
      {/* Front Left & Right Planted Legs with Gold Hooves */}
      {[-0.09, 0.09].map((hx, hIdx) => (
        <group key={hIdx} position={[hx, 0.065, 0.16]}>
          {/* White Foal Foreleg */}
          <mesh geometry={SHARED_GEO.capsuleLimb} scale={[0.6, 0.65, 0.6]} castShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.22}
              clearcoat={0.9}
            />
          </mesh>
          {/* Polished Gold Hoof */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, -0.025, 0.035]}
            scale={[0.05, 0.022, 0.055]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
          </mesh>
        </group>
      ))}

      {/* Tucked Seated Hind Haunches & Side Hooves */}
      {[-0.17, 0.17].map((hx, hIdx) => {
        const sign = hIdx === 0 ? -1 : 1;
        return (
          <group key={hIdx} position={[hx, 0.1, -0.04]}>
            {/* Plump Hind Haunch */}
            <mesh geometry={SHARED_GEO.lowSphere} scale={[0.075, 0.095, 0.1]}>
              <meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={0.8} />
            </mesh>
            {/* Tucked Hind Leg with Gold Hoof */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[sign * 0.03, -0.05, 0.07]}
              scale={[0.048, 0.04, 0.06]}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
            </mesh>
          </group>
        );
      })}

      {/* 5. Delicate White Pegasus Wings on Sides */}
      {[-0.18, 0.18].map((wx, wIdx) => {
        const sign = wIdx === 0 ? -1 : 1;
        return (
          <group
            key={wIdx}
            position={[wx, 0.28, -0.08]}
            rotation={[0.3, sign * -0.4, sign * -0.35]}
          >
            {/* Upper Primary Feather */}
            <mesh geometry={SHARED_GEO.wingFeather} scale={[0.85, 0.9, 0.6]} castShadow>
              <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.25}
                clearcoat={0.8}
                sheen={0.7}
                sheenColor="#fdf4ff"
              />
            </mesh>
            {/* Lower Secondary Feather */}
            <mesh
              geometry={SHARED_GEO.wingFeather}
              position={[sign * -0.04, -0.04, 0.02]}
              rotation={[0, 0, sign * -0.2]}
              scale={[0.65, 0.75, 0.5]}
            >
              <meshPhysicalMaterial color="#f8fafc" roughness={0.28} clearcoat={0.75} />
            </mesh>
          </group>
        );
      })}

      {/* 6. Adorable Pony Head, Muzzle, Cheeks, Ears & Alicorn Horn */}
      <group position={[0, 0.55, 0.03]}>
        {/* Pearlescent White Foal Cranium */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.265, 0.245, 0.25]} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.22}
            metalness={0.05}
            clearcoat={0.95}
            clearcoatRoughness={0.03}
            sheen={0.85}
            sheenColor="#fdf4ff"
          />
        </mesh>

        {/* Cute Baby Pony Muzzle / Snout (Real Horse Proportions!) */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.06, 0.18]}
          scale={[0.11, 0.08, 0.11]}
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.26} clearcoat={0.85} />
        </mesh>

        {/* Soft Pink Pony Nostrils */}
        {[-0.032, 0.032].map((nx, nIdx) => (
          <mesh
            key={nIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[nx, -0.055, 0.24]}
            scale={[0.015, 0.012, 0.012]}
          >
            <meshStandardMaterial color="#f472b6" roughness={0.4} />
          </mesh>
        ))}

        {/* Sweet Smiling Foal Mouth */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.09, 0.21]}
          rotation={[0.3, 0, 0]}
          scale={[0.12, 0.08, 0.06]}
        >
          <meshStandardMaterial color="#fb7185" roughness={0.5} />
        </mesh>

        {/* Chubby Rosy Cheeks */}
        {[-0.145, 0.145].map((bx, bIdx) => (
          <mesh
            key={bIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[bx, -0.02, 0.19]}
            scale={[0.045, 0.026, 0.02]}
          >
            <meshStandardMaterial color="#fda4af" roughness={0.55} />
          </mesh>
        ))}

        {/* Giant Soulful Anime Pony Eyes (Deep Indigo to Violet Gradient with Stars) */}
        {[-0.095, 0.095].map((ex, eIdx) => {
          const side = eIdx === 0 ? -1 : 1;
          return (
            <group key={eIdx} position={[ex, 0.025, 0.22]}>
              {/* Deep Indigo/Violet Iris */}
              <mesh geometry={SHARED_GEO.lowSphere} scale={[0.058, 0.064, 0.04]}>
                <meshPhysicalMaterial
                  color="#581c87"
                  roughness={0.04}
                  clearcoat={1}
                  ior={1.48}
                />
              </mesh>
              {/* Vibrant Violet-Blue Midtone */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, -0.012, 0.012]}
                scale={[0.048, 0.04, 0.028]}
              >
                <meshStandardMaterial color="#7c3aed" roughness={0.1} />
              </mesh>
              {/* Dark Velvety Pupil */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, 0.005, 0.02]}
                scale={[0.038, 0.045, 0.02]}
              >
                <meshBasicMaterial color="#090d16" />
              </mesh>
              {/* Primary Large Top Catchlight */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[side * -0.016, 0.022, 0.034]}
                scale={0.02}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Secondary Lower Catchlight */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[side * 0.018, -0.016, 0.032]}
                scale={0.011}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Star Glint Sparkle */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, -0.022, 0.03]}
                scale={0.008}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Elegant Anime Eyelash Arch */}
              <mesh
                geometry={SHARED_GEO.collarTorus}
                position={[0, 0.038, 0.022]}
                rotation={[0, 0, side * -0.15]}
                scale={[0.18, 0.09, 0.06]}
              >
                <meshBasicMaterial color="#1e1b4b" />
              </mesh>
            </group>
          );
        })}

        {/* Forehead Golden Spiral Alicorn Horn */}
        <group position={[0, 0.2, 0.18]} rotation={[0.42, 0, 0]}>
          <mesh geometry={SHARED_GEO.spiralHorn} scale={1.05} castShadow>
            <meshPhysicalMaterial
              color="#fbbf24"
              metalness={0.96}
              roughness={0.06}
              clearcoat={1}
            />
          </mesh>
          {/* Golden Collar Base */}
          <mesh geometry={SHARED_GEO.collarTorus} scale={0.35}>
            <meshStandardMaterial color="#f59e0b" metalness={0.94} roughness={0.1} />
          </mesh>
        </group>

        {/* Cute White Pony Ears with Soft Pink Hollows */}
        {[-0.18, 0.18].map((ex, eIdx) => {
          const sign = eIdx === 0 ? 1 : -1;
          return (
            <group
              key={eIdx}
              position={[ex, 0.21, 0.01]}
              rotation={[0, 0, sign * 0.35]}
            >
              <mesh geometry={SHARED_GEO.earCone} scale={[0.55, 0.75, 0.4]} castShadow>
                <meshPhysicalMaterial color="#ffffff" roughness={0.3} clearcoat={0.8} />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, 0, 0.018]}
                scale={[0.38, 0.55, 0.25]}
              >
                <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
              </mesh>
            </group>
          );
        })}

        {/* 7. Multi-Layer Pastel Cotton-Candy Rainbow Swirl Mane (Pink, Purple, Cyan, Yellow) */}
        {/* Forehead Sweeping Bangs Between & Beside Horn */}
        {[
          { x: -0.06, y: 0.14, z: 0.21, rx: 0.3, rz: 0.4, col: '#f472b6', s: 0.82 },
          { x: 0.06, y: 0.15, z: 0.21, rx: 0.3, rz: -0.4, col: '#38bdf8', s: 0.85 },
          { x: 0.01, y: 0.18, z: 0.2, rx: 0.2, rz: -0.1, col: '#c084fc', s: 0.78 },
          { x: 0.1, y: 0.13, z: 0.18, rx: 0.25, rz: -0.5, col: '#fef08a', s: 0.7 },
        ].map((lock, lIdx) => (
          <mesh
            key={lIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[lock.x, lock.y, lock.z]}
            rotation={[lock.rx, 0, lock.rz]}
            scale={[0.07 * lock.s, 0.09 * lock.s, 0.05 * lock.s]}
            castShadow
          >
            <meshPhysicalMaterial
              color={lock.col}
              roughness={0.25}
              clearcoat={0.85}
              sheen={0.8}
            />
          </mesh>
        ))}

        {/* Lush Flowing Left Mane Cascading Down Neck */}
        {[
          { x: -0.19, y: 0.08, z: 0.08, col: '#f472b6', s: 1.1 },
          { x: -0.22, y: -0.04, z: 0.05, col: '#38bdf8', s: 1.2 },
          { x: -0.21, y: -0.15, z: 0.02, col: '#c084fc', s: 1.15 },
          { x: -0.16, y: -0.24, z: 0.01, col: '#fef08a', s: 1.05 },
        ].map((lock, lIdx) => (
          <mesh
            key={lIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[lock.x, lock.y, lock.z]}
            scale={[0.095 * lock.s, 0.13 * lock.s, 0.08 * lock.s]}
            castShadow
          >
            <meshPhysicalMaterial
              color={lock.col}
              roughness={0.22}
              clearcoat={0.9}
              sheen={0.9}
            />
          </mesh>
        ))}

        {/* Right Mane Locks (visible in Front & Top view) */}
        {[
          { x: 0.18, y: 0.09, z: 0.07, col: '#c084fc', s: 1.0 },
          { x: 0.21, y: -0.03, z: 0.04, col: '#f472b6', s: 1.1 },
          { x: 0.19, y: -0.14, z: 0.02, col: '#38bdf8', s: 1.05 },
        ].map((lock, lIdx) => (
          <mesh
            key={lIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[lock.x, lock.y, lock.z]}
            scale={[0.09 * lock.s, 0.12 * lock.s, 0.075 * lock.s]}
            castShadow
          >
            <meshPhysicalMaterial
              color={lock.col}
              roughness={0.22}
              clearcoat={0.9}
              sheen={0.9}
            />
          </mesh>
        ))}

        {/* 3D Golden Star Hairclip Nestled in Left Mane Curls */}
        <mesh
          geometry={SHARED_GEO.star3D}
          position={[-0.23, 0.14, 0.08]}
          rotation={[0.3, -0.5, 0.2]}
          scale={0.75}
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.96}
            roughness={0.06}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* 8. Swirled Pastel Rainbow Tail Curving Up at Rear */}
      <group position={[0, 0.16, -0.21]} rotation={[0.4, 0, 0]}>
        {[
          { y: 0, z: 0, col: '#f472b6', s: 1.0 },
          { y: 0.08, z: -0.06, col: '#38bdf8', s: 1.15 },
          { y: 0.16, z: -0.08, col: '#c084fc', s: 1.0 },
          { y: 0.22, z: -0.05, col: '#fef08a', s: 0.85 },
        ].map((tailLock, tlIdx) => (
          <mesh
            key={tlIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[0, tailLock.y, tailLock.z]}
            scale={[0.08 * tailLock.s, 0.11 * tailLock.s, 0.08 * tailLock.s]}
            castShadow
          >
            <meshPhysicalMaterial
              color={tailLock.col}
              roughness={0.25}
              clearcoat={0.85}
              sheen={0.9}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
});
UnicornSkin.displayName = 'UnicornSkin';
