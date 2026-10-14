import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const PirateSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Sweeping Antique Burnished Gold Pawn-Lathe Bust & Pedestal (Zero Boxiness) */}
      <mesh
        geometry={SHARED_GEO.piratePawnBust}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#d97706"
          metalness={0.88}
          roughness={0.16}
          clearcoat={0.9}
        />
      </mesh>
      {/* 3D Crossed Cutlasses Emblem on Front Waist of Pawn Bust */}
      <group position={[0, 0.08, 0.2]}>
        {[-0.65, 0.65].map((ang, sIdx) => (
          <group key={sIdx} rotation={[0, 0, ang]}>
            {/* Sword Blade */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              scale={[0.012, 0.16, 0.012]}
            >
              <meshStandardMaterial
                color="#fef08a"
                metalness={0.94}
                roughness={0.1}
              />
            </mesh>
            {/* Sword Crossguard */}
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              position={[0, -0.05, 0]}
              rotation={[0, 0, Math.PI / 2]}
              scale={[0.009, 0.045, 0.009]}
            >
              <meshStandardMaterial
                color="#d97706"
                metalness={0.88}
                roughness={0.15}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Smooth Designer Bone-White Chibi Skull Head */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.54, 0.01]}
        scale={[0.265, 0.235, 0.245]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#fffdf5"
          roughness={0.32}
          clearcoat={0.4}
          sheen={0.45}
        />
      </mesh>
      {/* Rounded Chibi Cheekbones & Upper Jaw */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.42, 0.12]}
        scale={[0.155, 0.088, 0.135]}
      >
        <meshPhysicalMaterial color="#fffdf5" roughness={0.32} />
      </mesh>
      {/* Stylized Chibi Teeth Ridges */}
      {[-0.05, -0.017, 0.017, 0.05].map((tx, tIdx) => (
        <mesh
          key={tIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[tx, 0.395, 0.23]}
          scale={[0.016, 0.022, 0.012]}
        >
          <meshStandardMaterial color="#ffffff" roughness={0.25} />
        </mesh>
      ))}
      {/* Triangular / Inverted Heart Nasal Cavity */}
      <mesh
        geometry={SHARED_GEO.earCone}
        position={[0, 0.465, 0.245]}
        rotation={[Math.PI, 0, 0]}
        scale={[0.018, 0.026, 0.012]}
      >
        <meshBasicMaterial color="#111827" />
      </mesh>

      {/* Right Eye: Deep Round Hollow Socket with Specular Catchlight */}
      <group position={[-0.098, 0.525, 0.218]}>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          scale={[0.055, 0.055, 0.025]}
        >
          <meshBasicMaterial color="#0f172a" />
        </mesh>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[-0.015, 0.018, 0.018]}
          scale={0.014}
        >
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Left Eye: Sleek Black Leather Pirate Eyepatch with Raised Rim */}
      <group position={[0.098, 0.525, 0.218]}>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          scale={[0.068, 0.062, 0.03]}
        >
          <meshPhysicalMaterial
            color="#0f172a"
            roughness={0.65}
            clearcoat={0.3}
          />
        </mesh>
        {/* Gold Buckle Dot on Eyepatch Corner */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0.048, 0.032, 0.02]}
          scale={0.01}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.9} />
        </mesh>
      </group>
      {/* Diagonal Leather Strap */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0.02, 0.54, 0.04]}
        rotation={[0.45, 0.35, -0.55]}
        scale={1.16}
      >
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* Rich Crimson Bandana Wrapped Snugly Under Hat Brim */}
      <mesh
        geometry={SHARED_GEO.scarfTorus}
        position={[0, 0.63, 0.01]}
        rotation={[Math.PI / 2 - 0.08, 0, 0]}
        scale={[1.18, 1.15, 0.85]}
      >
        <meshPhysicalMaterial
          color="#dc2626"
          roughness={0.55}
          sheen={0.6}
        />
      </mesh>
      {/* Bandana Side Knot Ribbons Fluttering Out */}
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.26, 0.53, -0.02]}
        rotation={[0, 0, -0.48]}
        scale={[0.65, 0.72, 0.5]}
      >
        <meshPhysicalMaterial color="#dc2626" roughness={0.55} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.24, 0.47, 0.03]}
        rotation={[0.2, 0, -0.28]}
        scale={[0.55, 0.6, 0.45]}
      >
        <meshPhysicalMaterial color="#b91c1c" roughness={0.55} />
      </mesh>

      {/* Grand Sweeping Black Tricorn Hat with Metallic Gold Piping & Skull Badge */}
      <group position={[0, 0.73, 0]} rotation={[-0.08, 0, 0.02]}>
        {/* Main Hat Crown */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0.02, 0]}
          scale={[0.24, 0.16, 0.22]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#0f172a"
            roughness={0.42}
            sheen={0.55}
          />
        </mesh>
        {/* Sweeping Upturned Front Brim Peak */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0.07, 0.095]}
          rotation={[0.32, 0, 0]}
          scale={[0.35, 0.155, 0.125]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#0f172a"
            roughness={0.4}
            sheen={0.55}
          />
        </mesh>
        {/* Continuous Gold Trim Along Upturned Brim Border */}
        <mesh
          geometry={SHARED_GEO.scarfTorus}
          position={[0, 0.05, 0.065]}
          rotation={[Math.PI / 2 - 0.32, 0, 0]}
          scale={[1.58, 1.12, 0.55]}
        >
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.92}
            roughness={0.12}
          />
        </mesh>
        {/* Sculpted 3D Miniature Skull & Crossbones Badge on Hat Front */}
        <group position={[0, 0.1, 0.22]}>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            scale={[0.032, 0.034, 0.015]}
          >
            <meshStandardMaterial color="#ffffff" roughness={0.3} />
          </mesh>
          {/* Mini Crossbones */}
          {[-0.7, 0.7].map((bang, bIdx) => (
            <mesh
              key={bIdx}
              geometry={SHARED_GEO.unitCylinder}
              rotation={[0, 0, bang]}
              scale={[0.005, 0.045, 0.005]}
            >
              <meshStandardMaterial color="#ffffff" roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Burgundy Plume Feather Cockade on Hat Side */}
        <mesh
          geometry={SHARED_GEO.wingFeather}
          position={[-0.18, 0.12, 0.05]}
          rotation={[0.3, 0, -0.75]}
          scale={[0.7, 0.9, 0.35]}
        >
          <meshPhysicalMaterial
            color="#991b1b"
            roughness={0.4}
            sheen={0.8}
            sheenColor="#fca5a5"
          />
        </mesh>
      </group>

      {/* Curved Cutlass Sword Slung at Hip with Golden Basket Hilt */}
      <group position={[-0.22, 0.14, 0.08]} rotation={[0.4, 0.3, 0.5]}>
        {/* Curved Steel Blade */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          scale={[0.016, 0.32, 0.008]}
        >
          <meshStandardMaterial color="#e2e8f0" metalness={0.96} roughness={0.08} />
        </mesh>
        {/* Golden Basket Hilt Guard */}
        <mesh
          geometry={SHARED_GEO.thinTorus}
          position={[0, -0.15, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.06}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
        </mesh>
        {/* Leather Grip & Pommel */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.19, 0]}
          scale={0.018}
        >
          <meshStandardMaterial color="#d97706" metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
});
PirateSkin.displayName = 'PirateSkin';
