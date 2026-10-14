import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const CatSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Plump Seated Pearl-White Kitty Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.2, -0.01]}
        scale={[0.225, 0.215, 0.21]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.48}
          clearcoat={0.22}
          sheen={0.7}
          sheenRoughness={0.65}
          sheenColor="#ffffff"
        />
      </mesh>
      {/* Two Cute White Seated Front Paws */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.09, 0.055, 0.16]}
        scale={[0.07, 0.05, 0.085]}
        castShadow
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.45} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.09, 0.055, 0.16]}
        scale={[0.07, 0.05, 0.085]}
        castShadow
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.45} />
      </mesh>
      {/* Curled White Kitty Tail */}
      <mesh
        geometry={SHARED_GEO.catTailTorus}
        position={[-0.14, 0.14, -0.16]}
        rotation={[0.5, 0.6, 0]}
        castShadow
      >
        <meshPhysicalMaterial color="#f8fafc" roughness={0.5} />
      </mesh>

      {/* Cozy Red Scarf + Hanging Pom-Pom & Golden Bell */}
      <mesh
        geometry={SHARED_GEO.scarfTorus}
        position={[0, 0.35, 0.01]}
        rotation={[Math.PI / 2 + 0.06, 0, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#e11d48"
          roughness={0.62}
          sheen={0.5}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.19, 0.23, 0.12]}
        rotation={[0.15, 0, -0.3]}
        scale={[0.65, 0.8, 0.5]}
      >
        <meshPhysicalMaterial color="#e11d48" roughness={0.6} />
      </mesh>
      {/* Fluffy Red Pom-Pom at Scarf Tip */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.23, 0.13, 0.15]}
        scale={0.065}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ef4444"
          roughness={0.75}
          sheen={0.7}
        />
      </mesh>
      {/* Golden Collar Bell */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.32, 0.22]}
        scale={0.048}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.85}
          roughness={0.14}
        />
      </mesh>

      {/* Wide Chubby Kitty Head */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.58, 0.01]}
        scale={[0.285, 0.25, 0.245]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.45}
          clearcoat={0.25}
          sheen={0.75}
          sheenColor="#ffffff"
        />
      </mesh>
      {/* Puffy Whisker Pads / Muzzle */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.042, 0.515, 0.215]}
        scale={[0.055, 0.042, 0.048]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.042, 0.515, 0.215]}
        scale={[0.055, 0.042, 0.048]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.4} />
      </mesh>
      {/* Dainty Pink Triangle Nose */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.545, 0.255]}
        scale={[0.034, 0.025, 0.028]}
      >
        <meshPhysicalMaterial
          color="#f43f5e"
          roughness={0.15}
          clearcoat={0.8}
        />
      </mesh>
      {/* Soft Rosy Blush Cheeks */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.155, 0.53, 0.185]}
        scale={[0.045, 0.028, 0.025]}
      >
        <meshStandardMaterial color="#fda4af" roughness={0.6} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.155, 0.53, 0.185]}
        scale={[0.045, 0.028, 0.025]}
      >
        <meshStandardMaterial color="#fda4af" roughness={0.6} />
      </mesh>
      {/* Subtle Silver Tabby Forehead Stripes */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.72, 0.195]}
        scale={[0.018, 0.05, 0.015]}
      >
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.045, 0.71, 0.19]}
        rotation={[0, 0, 0.2]}
        scale={[0.015, 0.04, 0.015]}
      >
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.045, 0.71, 0.19]}
        rotation={[0, 0, -0.2]}
        scale={[0.015, 0.04, 0.015]}
      >
        <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
      </mesh>
      {/* Expressive Dark Kitty Eyes with Specular Catchlights */}
      <ExpressiveEye pos={[-0.105, 0.59, 0.215]} irisColor="#1e293b" eyeRadius={0.046} />
      <ExpressiveEye pos={[0.105, 0.59, 0.215]} irisColor="#1e293b" eyeRadius={0.046} />

      {/* Pointed Kitty Ears with Soft Pink Inner Triangles */}
      <group
        position={[-0.17, 0.79, -0.01]}
        rotation={[0.1, 0.08, 0.28]}
      >
        <mesh
          geometry={SHARED_GEO.earCone}
          scale={[1.05, 0.98, 0.58]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.45}
            clearcoat={0.2}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, -0.01, 0.025]}
          scale={[0.64, 0.7, 0.32]}
        >
          <meshStandardMaterial color="#fda4af" roughness={0.5} />
        </mesh>
      </group>
      <group
        position={[0.17, 0.79, -0.01]}
        rotation={[0.1, -0.08, -0.28]}
      >
        <mesh
          geometry={SHARED_GEO.earCone}
          scale={[1.05, 0.98, 0.58]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.45}
            clearcoat={0.2}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, -0.01, 0.025]}
          scale={[0.64, 0.7, 0.32]}
        >
          <meshStandardMaterial color="#fda4af" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
});
CatSkin.displayName = 'CatSkin';
