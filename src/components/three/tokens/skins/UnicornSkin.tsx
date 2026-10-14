import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const UnicornSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Plump Seated Pure-White Unicorn Body */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.2, -0.02]}
        scale={[0.215, 0.205, 0.22]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.32}
          clearcoat={0.65}
          sheen={0.7}
          sheenColor="#fdf4ff"
        />
      </mesh>
      {/* Four Cute Seated Hooves / Legs */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.085, 0.055, 0.155]}
        scale={[0.068, 0.055, 0.082]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.3}
          clearcoat={0.7}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.085, 0.055, 0.155]}
        scale={[0.068, 0.055, 0.082]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.3}
          clearcoat={0.7}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.175, 0.09, -0.04]}
        scale={[0.065, 0.085, 0.095]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.35} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.175, 0.09, -0.04]}
        scale={[0.065, 0.085, 0.095]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.35} />
      </mesh>

      {/* Sculpted Unicorn Head */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.56, 0.01]}
        scale={[0.245, 0.235, 0.24]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.28}
          clearcoat={0.75}
          sheen={0.7}
        />
      </mesh>
      {/* Forward-Protruding Sculpted Unicorn Snout / Muzzle */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.505, 0.2]}
        rotation={[0.2, 0, 0]}
        scale={[0.145, 0.12, 0.145]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.3}
          clearcoat={0.7}
        />
      </mesh>
      {/* Cute Pink Nostrils & Rosy Blush */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.045, 0.525, 0.325]}
        scale={0.018}
      >
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.045, 0.525, 0.325]}
        scale={0.018}
      >
        <meshStandardMaterial color="#f43f5e" />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.15, 0.52, 0.16]}
        scale={[0.038, 0.025, 0.025]}
      >
        <meshStandardMaterial color="#fbcfe8" />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.15, 0.52, 0.16]}
        scale={[0.038, 0.025, 0.025]}
      >
        <meshStandardMaterial color="#fbcfe8" />
      </mesh>

      {/* Large Expressive Eyes with Specular Catchlights */}
      <ExpressiveEye pos={[-0.115, 0.575, 0.175]} irisColor="#3b0764" eyeRadius={0.044} />
      <ExpressiveEye pos={[0.115, 0.575, 0.175]} irisColor="#3b0764" eyeRadius={0.044} />

      {/* Pointed White Equine Ears with Pink Hollows */}
      <group
        position={[-0.14, 0.77, -0.02]}
        rotation={[-0.1, 0, 0.25]}
      >
        <mesh
          geometry={SHARED_GEO.earCone}
          scale={[0.68, 0.85, 0.52]}
          castShadow
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, -0.01, 0.02]}
          scale={[0.4, 0.6, 0.3]}
        >
          <meshStandardMaterial color="#f9a8d4" />
        </mesh>
      </group>
      <group
        position={[0.14, 0.77, -0.02]}
        rotation={[-0.1, 0, -0.25]}
      >
        <mesh
          geometry={SHARED_GEO.earCone}
          scale={[0.68, 0.85, 0.52]}
          castShadow
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, -0.01, 0.02]}
          scale={[0.4, 0.6, 0.3]}
        >
          <meshStandardMaterial color="#f9a8d4" />
        </mesh>
      </group>

      {/* Spiraled Golden Unicorn Horn on Forehead */}
      <group position={[0, 0.86, 0.12]} rotation={[0.32, 0, 0]}>
        <mesh geometry={SHARED_GEO.hornCone} castShadow>
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.92}
            roughness={0.1}
            clearcoat={1}
            emissive="#d97706"
            emissiveIntensity={0.25}
          />
        </mesh>
        {/* Spiral Ridges Around Horn */}
        {[0, 1, 2].map((rIdx) => (
          <mesh
            key={rIdx}
            geometry={SHARED_GEO.collarTorus}
            position={[0, -0.08 + rIdx * 0.065, 0]}
            rotation={[Math.PI / 2 + 0.2, 0, 0]}
            scale={0.24 - rIdx * 0.055}
          >
            <meshStandardMaterial
              color="#fde047"
              metalness={0.95}
              roughness={0.08}
            />
          </mesh>
        ))}
      </group>

      {/* Lush Sculpted Hot-Pink Flowing Forelock, Side Mane & Tail */}
      {/* Sweeping Forelock Puff Over Forehead */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.02, 0.74, 0.08]}
        rotation={[0.2, 0, -0.25]}
        scale={[0.14, 0.095, 0.13]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ec4899"
          roughness={0.38}
          clearcoat={0.4}
          sheen={0.8}
          sheenColor="#fbcfe8"
        />
      </mesh>
      {/* Cascading Pink Mane Waves Along Back & Side */}
      {[
        { x: 0.06, y: 0.7, z: -0.14, sx: 0.12, sy: 0.13, sz: 0.12 },
        { x: 0.11, y: 0.56, z: -0.18, sx: 0.11, sy: 0.14, sz: 0.12 },
        { x: 0.13, y: 0.41, z: -0.17, sx: 0.11, sy: 0.13, sz: 0.11 },
        { x: 0.12, y: 0.27, z: -0.16, sx: 0.1, sy: 0.11, sz: 0.11 },
        { x: 0, y: 0.18, z: -0.23, sx: 0.11, sy: 0.12, sz: 0.12 },
      ].map((m, idx) => (
        <mesh
          key={idx}
          geometry={SHARED_GEO.lowSphere}
          position={[m.x, m.y, m.z]}
          scale={[m.sx, m.sy, m.sz]}
          castShadow
        >
          <meshPhysicalMaterial
            color={idx % 2 === 0 ? '#ec4899' : '#db2777'}
            roughness={0.38}
            clearcoat={0.4}
            sheen={0.8}
            sheenColor="#fbcfe8"
          />
        </mesh>
      ))}
    </group>
  );
});
UnicornSkin.displayName = 'UnicornSkin';
