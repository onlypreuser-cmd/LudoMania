import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Celestial Unicorn Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 1, Row 3)
 * Features:
 * - Cuddly seated baby foal pose in pearlescent white porcelain
 * - Four golden hooves neatly tucked beneath
 * - Forehead-mounted golden helical spiral alicorn horn
 * - Soulful 3-layer anime eyes with amethyst/violet-cyan gradient irises
 * - Multi-layered wavy cotton-candy pastel hair (pastel pink, sky cyan, soft lilac)
 * - 3D golden star hairclip nestled on left mane curls
 * - Delicate white feathered pegasus wings on the back
 * - Whimsical pastel dream cloud pedestal with gold star emblem
 */
export const UnicornSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Whimsical Pastel Dream Cloud Pedestal with Golden Star Crest */}
      <group position={[0, -0.04, 0]}>
        {/* Iridescent Golden Outer Base Ring */}
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

        {/* Puffy Soft Pastel Cloud Mounds Ring */}
        {[
          { x: 0, y: 0.04, z: 0.22, s: 0.14, col: '#fdf4ff' },
          { x: -0.16, y: 0.035, z: 0.16, s: 0.13, col: '#fce7f3' },
          { x: 0.16, y: 0.035, z: 0.16, s: 0.13, col: '#e0f2fe' },
          { x: -0.22, y: 0.03, z: 0, s: 0.13, col: '#f3e8ff' },
          { x: 0.22, y: 0.03, z: 0, s: 0.13, col: '#fce7f3' },
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

      {/* 2. Plump Pure-White Porcelain Foal Body */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.21, -0.01]}
        scale={[0.22, 0.21, 0.23]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.25}
          metalness={0.08}
          clearcoat={0.95}
          clearcoatRoughness={0.04}
          sheen={0.8}
          sheenColor="#fdf4ff"
        />
      </mesh>

      {/* 3. Four Tucked Baby Hooves with Polished Gold Caps */}
      {/* Front Left & Right Hooves */}
      {[-0.09, 0.09].map((hx, hIdx) => (
        <group key={hIdx} position={[hx, 0.065, 0.16]}>
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.068, 0.055, 0.085]} castShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.22}
              clearcoat={0.9}
            />
          </mesh>
          {/* Gold Hoof Cap */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0, -0.02, 0.035]}
            scale={[0.045, 0.02, 0.05]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Tucked Hind Haunches */}
      {[-0.17, 0.17].map((hx, hIdx) => (
        <group key={hIdx} position={[hx, 0.1, -0.04]}>
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.075, 0.095, 0.1]}>
            <meshPhysicalMaterial color="#ffffff" roughness={0.25} clearcoat={0.8} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[hIdx === 0 ? 0.04 : -0.04, -0.05, 0.06]}
            scale={[0.048, 0.04, 0.06]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* 4. Delicate Feathered Pegasus Wings on Shoulders */}
      {[-0.18, 0.18].map((wx, wIdx) => (
        <group
          key={wIdx}
          position={[wx, 0.28, -0.08]}
          rotation={[0.3, wIdx === 0 ? -0.4 : 0.4, wIdx === 0 ? -0.35 : 0.35]}
        >
          {/* Wing Base Feathers */}
          <mesh geometry={SHARED_GEO.wingFeather} scale={[0.85, 0.9, 0.6]} castShadow>
            <meshPhysicalMaterial
              color="#ffffff"
              roughness={0.28}
              clearcoat={0.75}
              sheen={0.6}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.wingFeather}
            position={[wIdx === 0 ? -0.04 : 0.04, -0.04, 0.02]}
            rotation={[0, 0, wIdx === 0 ? -0.2 : 0.2]}
            scale={[0.65, 0.75, 0.5]}
          >
            <meshPhysicalMaterial color="#f8fafc" roughness={0.3} clearcoat={0.7} />
          </mesh>
        </group>
      ))}

      {/* 5. Head, Muzzle, Cheeks & Alicorn Horn */}
      <group position={[0, 0.55, 0.03]}>
        {/* Cranium Base */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.265, 0.245, 0.25]} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.22}
            metalness={0.05}
            clearcoat={0.95}
            clearcoatRoughness={0.03}
            sheen={0.8}
            sheenColor="#fdf4ff"
          />
        </mesh>

        {/* Cute Baby Foal Muzzle & Nostrils */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.06, 0.17]}
          scale={[0.095, 0.07, 0.095]}
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.28} clearcoat={0.8} />
        </mesh>
        {/* Soft Pink Nose Bridge */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.055, 0.23]}
          scale={[0.032, 0.02, 0.025]}
        >
          <meshStandardMaterial color="#fbcfe8" roughness={0.4} />
        </mesh>
        {/* Subtle Rosy Cheeks */}
        {[-0.14, 0.14].map((bx, bIdx) => (
          <mesh
            key={bIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[bx, -0.02, 0.185]}
            scale={[0.042, 0.025, 0.02]}
          >
            <meshStandardMaterial color="#fda4af" roughness={0.55} />
          </mesh>
        ))}

        {/* 3-Layer Soulful Anime Eyes: Violet to Cyan Gradient */}
        <ExpressiveEye pos={[-0.095, 0.02, 0.225]} irisColor="#7c3aed" eyeRadius={0.056} />
        <ExpressiveEye pos={[0.095, 0.02, 0.225]} irisColor="#7c3aed" eyeRadius={0.056} />

        {/* Forehead Golden Spiral Alicorn Horn */}
        <group position={[0, 0.19, 0.18]} rotation={[0.45, 0, 0]}>
          <mesh geometry={SHARED_GEO.spiralHorn} scale={1.05} castShadow>
            <meshPhysicalMaterial
              color="#fbbf24"
              metalness={0.95}
              roughness={0.06}
              clearcoat={1}
            />
          </mesh>
          {/* Subtle Golden Glow Collar */}
          <mesh geometry={SHARED_GEO.collarTorus} scale={0.35}>
            <meshStandardMaterial color="#f59e0b" metalness={0.92} roughness={0.12} />
          </mesh>
        </group>

        {/* Cute White Pony Ears with Soft Pink Hollows */}
        {[-0.18, 0.18].map((ex, eIdx) => (
          <group
            key={eIdx}
            position={[ex, 0.21, 0.01]}
            rotation={[0, 0, eIdx === 0 ? 0.35 : -0.35]}
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
        ))}

        {/* 6. Multi-Layer Wavy Cotton-Candy Pastel Hair (Pink, Cyan, Lilac) */}
        {/* Forehead Sweeping Bangs */}
        {[
          { x: -0.06, y: 0.13, z: 0.21, rx: 0.3, rz: 0.4, col: '#f472b6', s: 0.8 },
          { x: 0.06, y: 0.14, z: 0.21, rx: 0.3, rz: -0.4, col: '#38bdf8', s: 0.85 },
          { x: 0.01, y: 0.17, z: 0.2, rx: 0.2, rz: -0.1, col: '#c084fc', s: 0.75 },
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

        {/* Flowing Left Mane Sweeping Around Neck */}
        {[
          { x: -0.19, y: 0.08, z: 0.08, col: '#f472b6', s: 1.1 },
          { x: -0.22, y: -0.04, z: 0.05, col: '#38bdf8', s: 1.2 },
          { x: -0.21, y: -0.15, z: 0.02, col: '#c084fc', s: 1.15 },
          { x: -0.16, y: -0.24, z: 0.01, col: '#f472b6', s: 1.05 },
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

        {/* 3D Golden Star Hairclip Nestled in Left Mane */}
        <mesh
          geometry={SHARED_GEO.star3D}
          position={[-0.23, 0.14, 0.08]}
          rotation={[0.3, -0.5, 0.2]}
          scale={0.72}
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.95}
            roughness={0.06}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* 7. Lush Curled Pastel Tail at Rear */}
      <group position={[0, 0.16, -0.21]} rotation={[0.4, 0, 0]}>
        {[
          { y: 0, z: 0, col: '#f472b6', s: 1.0 },
          { y: 0.08, z: -0.06, col: '#38bdf8', s: 1.1 },
          { y: 0.16, z: -0.08, col: '#c084fc', s: 0.95 },
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
