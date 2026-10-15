import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const AstronomerSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Antique Gilded Astrolabe Pedestal Base */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#1e1b4b"
          metalness={0.85}
          roughness={0.18}
          clearcoat={1}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, -0.04, 0]}
        scale={1.22}
      >
        <meshStandardMaterial
          color="#fbbf24"
          metalness={0.92}
          roughness={0.12}
        />
      </mesh>

      {/* Midnight-Navy Velvet Scholar Mantle Robe */}
      <mesh
        geometry={SHARED_GEO.magicianRobe}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.82}
          sheen={0.85}
          sheenColor="#38bdf8"
        />
      </mesh>

      {/* Starlight Constellation Waist Sash & Astrolabe Chart Scroll */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.17, 0]}
        scale={1.05}
      >
        <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[0.18, 0.17, 0.16]}
        rotation={[0.3, 0, 0.6]}
        scale={[0.035, 0.22, 0.035]}
      >
        <meshStandardMaterial color="#fef3c7" roughness={0.65} />
      </mesh>

      {/* 3D Interlocking Brass Armillary Sphere (Held in Front) */}
      <group position={[0, 0.24, 0.19]}>
        {/* Outer Equator Ring */}
        <mesh geometry={SHARED_GEO.armillaryRing} rotation={[Math.PI / 4, 0, 0]}>
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
        </mesh>
        {/* Inner Meridian Ring */}
        <mesh geometry={SHARED_GEO.armillaryRing} rotation={[0, Math.PI / 3, 0]} scale={0.78}>
          <meshStandardMaterial color="#d97706" metalness={0.94} roughness={0.12} />
        </mesh>
        {/* Glowing Celestial Starlight Core */}
        <mesh geometry={SHARED_GEO.lowSphere} scale={0.038}>
          <meshStandardMaterial
            color="#7dd3fc"
            emissive="#38bdf8"
            emissiveIntensity={3.2}
          />
        </mesh>
      </group>

      {/* Compact Brass & Leather Observatory Telescope Slung on Shoulder */}
      <group position={[-0.21, 0.35, -0.06]} rotation={[0.45, 0.2, 0.32]}>
        <mesh geometry={SHARED_GEO.telescopeTube} castShadow>
          <meshPhysicalMaterial
            color="#d97706"
            metalness={0.92}
            roughness={0.16}
            clearcoat={1}
          />
        </mesh>
        {/* Leather Grip Wrap */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.052, 0.052, 0.18, 16]} />
          <meshStandardMaterial color="#78350f" roughness={0.7} />
        </mesh>
        {/* Brass Focus Rings */}
        {[-0.12, 0.12].map((ry, rIdx) => (
          <mesh
            key={rIdx}
            geometry={SHARED_GEO.thinTorus}
            position={[0, ry, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.058}
          >
            <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.08} />
          </mesh>
        ))}
        {/* Solid Polished Optical Sapphire Objective Lens */}
        <mesh geometry={SHARED_GEO.lowSphere} position={[0, 0.21, 0]} scale={[0.042, 0.015, 0.042]}>
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.08}
            metalness={0.2}
            clearcoat={1}
          />
        </mesh>
      </group>

      {/* Wise Scholar Face with Rosy Cheeks */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.52, 0.02]}
        scale={[0.23, 0.21, 0.215]}
        castShadow
      >
        <meshPhysicalMaterial color="#fed7aa" roughness={0.42} sheen={0.35} />
      </mesh>
      {/* Gentle Beard / Mustache */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.44, 0.17]}
        scale={[0.11, 0.075, 0.09]}
      >
        <meshPhysicalMaterial color="#f8fafc" roughness={0.55} />
      </mesh>

      {/* Midnight Velvet Hooded Cowl Draped Around Face */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.56, -0.02]}
        scale={[0.29, 0.28, 0.27]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.85}
          sheen={0.85}
          sheenColor="#38bdf8"
        />
      </mesh>

      {/* Celestial Gilded Monocle Over Right Eye with Glowing Star Reticle */}
      <group position={[-0.095, 0.54, 0.195]}>
        <mesh
          geometry={SHARED_GEO.thinTorus}
          scale={0.052}
          rotation={[0, 0, 0]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh geometry={SHARED_GEO.lowSphere} scale={[0.045, 0.045, 0.01]}>
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.08}
            metalness={0.2}
            clearcoat={1}
          />
        </mesh>
        {/* Glowing Monocle Reticle Pip */}
        <mesh geometry={SHARED_GEO.lowSphere} position={[0, 0, 0.008]} scale={0.014}>
          <meshBasicMaterial color="#38bdf8" />
        </mesh>
      </group>

      {/* Left Eye: Curious Expressive Scholar Eye with Dual Catchlights */}
      <ExpressiveEye pos={[0.095, 0.54, 0.19]} irisColor="#1e3a8a" eyeRadius={0.04} />
    </group>
  );
});
AstronomerSkin.displayName = 'AstronomerSkin';
