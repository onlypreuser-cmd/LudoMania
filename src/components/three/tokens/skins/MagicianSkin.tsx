import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const MagicianSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Royal Amethyst-Purple Pedestal Collar + 3D Golden Star */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#7e22ce"
          roughness={0.14}
          metalness={0.18}
          clearcoat={1}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.star3D}
        position={[0, -0.04, 0.33]}
        scale={0.85}
      >
        <meshPhysicalMaterial
          color="#fbbf24"
          metalness={0.94}
          roughness={0.08}
          clearcoat={1}
        />
      </mesh>

      {/* Plump, Cuddly Pear-Shaped Seated Wizard Robe (Zero Cylinder) */}
      <mesh
        geometry={SHARED_GEO.magicianRobe}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#6b21a8"
          roughness={0.45}
          sheen={0.8}
          sheenColor="#d8b4fe"
        />
      </mesh>
      {/* Golden Rope Waist Belt & Buckle */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.18, 0]}
        scale={1.05}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.88}
          roughness={0.18}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.18, 0.21]}
        scale={[0.038, 0.038, 0.02]}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.92}
          roughness={0.12}
        />
      </mesh>

      {/* Chubby Purple Bell Sleeves & Soft Peach Hands */}
      {[-0.22, 0.22].map((sx, sIdx) => (
        <group key={sIdx} position={[sx, 0.24, 0.06]}>
          <mesh
            geometry={SHARED_GEO.capsuleLimb}
            rotation={[0.3, 0, sIdx === 0 ? 0.22 : -0.22]}
            scale={[0.92, 0.95, 0.92]}
            castShadow
          >
            <meshPhysicalMaterial color="#6b21a8" roughness={0.48} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.06, 0.04]}
            scale={0.048}
          >
            <meshPhysicalMaterial color="#fed7aa" roughness={0.42} />
          </mesh>
        </group>
      ))}

      {/* Warm Peach Wizard Face, Plump Rosy Cheeks & Button Nose */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.51, 0.02]}
        scale={[0.24, 0.21, 0.22]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#fed7aa"
          roughness={0.42}
          sheen={0.4}
        />
      </mesh>
      {/* Cute Rosy Cheeks */}
      {[-0.12, 0.12].map((cx, cIdx) => (
        <mesh
          key={cIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[cx, 0.49, 0.18]}
          scale={[0.045, 0.028, 0.02]}
        >
          <meshStandardMaterial color="#fda4af" roughness={0.5} />
        </mesh>
      ))}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.485, 0.235]}
        scale={[0.048, 0.04, 0.045]}
      >
        <meshPhysicalMaterial color="#fdba74" roughness={0.38} />
      </mesh>
      <ExpressiveEye pos={[-0.085, 0.525, 0.215]} irisColor="#271306" eyeRadius={0.038} />
      <ExpressiveEye pos={[0.085, 0.525, 0.215]} irisColor="#271306" eyeRadius={0.038} />

      {/* Bushy White Eyebrows */}
      {[-0.088, 0.088].map((bx, bIdx) => (
        <mesh
          key={bIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[bx, 0.58, 0.218]}
          rotation={[0, 0, bIdx === 0 ? 0.18 : -0.18]}
          scale={[0.055, 0.022, 0.025]}
        >
          <meshPhysicalMaterial color="#f8fafc" roughness={0.45} />
        </mesh>
      ))}

      {/* Magnificent Sweeping Handlebar Mustache */}
      {[-0.075, 0.075].map((mx, mIdx) => (
        <mesh
          key={mIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[mx, 0.435, 0.22]}
          rotation={[0, 0, mIdx === 0 ? 0.35 : -0.35]}
          scale={[0.088, 0.042, 0.048]}
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.42}
            sheen={0.7}
          />
        </mesh>
      ))}

      {/* Magnificent Layered Fluffy Cloud Beard Cascading to Robe */}
      {[
        { x: 0, y: 0.32, z: 0.19, sx: 0.145, sy: 0.16, sz: 0.1 },
        { x: -0.09, y: 0.35, z: 0.17, sx: 0.09, sy: 0.13, sz: 0.085 },
        { x: 0.09, y: 0.35, z: 0.17, sx: 0.09, sy: 0.13, sz: 0.085 },
        { x: 0, y: 0.24, z: 0.18, sx: 0.11, sy: 0.12, sz: 0.08 },
      ].map((b, bIdx) => (
        <mesh
          key={bIdx}
          geometry={SHARED_GEO.unitSphere}
          position={[b.x, b.y, b.z]}
          scale={[b.sx, b.sy, b.sz]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.45}
            sheen={0.8}
          />
        </mesh>
      ))}

      {/* Floppy Purple Wizard Hat with Backward Crease, Gold Band & 3D Star */}
      <group position={[0, 0.63, 0]}>
        {/* Wide Undulating Hat Brim */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0, 0]}
          scale={[0.36, 0.032, 0.34]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#7e22ce"
            roughness={0.45}
            sheen={0.7}
          />
        </mesh>
        {/* Gold Hatband */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.03, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={1.08}
        >
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.88}
            roughness={0.15}
          />
        </mesh>
        {/* Organic Backward-Bent Floppy Hat Cone */}
        <mesh
          geometry={SHARED_GEO.floppyHat}
          position={[0, 0.02, 0]}
          scale={1.05}
          castShadow
        >
          <meshPhysicalMaterial
            color="#7e22ce"
            roughness={0.45}
            sheen={0.75}
          />
        </mesh>
        {/* Big 3D Golden Star on Hat Front */}
        <mesh
          geometry={SHARED_GEO.star3D}
          position={[0, 0.12, 0.17]}
          rotation={[-0.32, 0, 0]}
          scale={1.15}
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.94}
            roughness={0.08}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* Upright Golden Arcane Staff with Radiant Blue Mana Crystal Orb */}
      <group position={[-0.255, 0.32, 0.12]} rotation={[0.06, 0, 0.08]}>
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          scale={[0.02, 0.56, 0.02]}
          castShadow
        >
          <meshStandardMaterial
            color="#d97706"
            metalness={0.88}
            roughness={0.16}
          />
        </mesh>
        {/* Golden Orb Cradle */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.28, 0]}
          scale={0.38}
        >
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.94}
            roughness={0.1}
          />
        </mesh>
        {/* Glowing Blue Mana Orb */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.31, 0]}
          scale={0.072}
        >
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={2.8}
            roughness={0.02}
            clearcoat={1}
            ior={1.65}
          />
        </mesh>
      </group>
    </group>
  );
});
MagicianSkin.displayName = 'MagicianSkin';
