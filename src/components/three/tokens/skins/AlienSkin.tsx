import { RoundedBox } from '@react-three/drei';
import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const AlienSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Anti-Gravity Saucer Repulsor Base Harness */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#064e3b"
          metalness={0.65}
          roughness={0.15}
          clearcoat={1}
          ior={1.62}
        />
      </mesh>

      {/* Floating Metallic Saucer Ring with Cyan Repulsor Glow */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, -0.04, 0]}
        scale={1.35}
      >
        <meshPhysicalMaterial
          color="#cbd5e1"
          metalness={0.92}
          roughness={0.1}
          clearcoat={1}
        />
      </mesh>
      {/* 4 Underside Cyan Repulsor Emitters */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((ang, rIdx) => (
        <mesh
          key={rIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[Math.sin(ang) * 0.28, -0.065, Math.cos(ang) * 0.28]}
          scale={[0.035, 0.02, 0.035]}
        >
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#06b6d4"
            emissiveIntensity={2.5}
          />
        </mesh>
      ))}

      {/* Futuristic Communicator Bezel on Harness Front */}
      <RoundedBox
        args={[0.15, 0.09, 0.03]}
        radius={0.018}
        smoothness={4}
        position={[0, -0.04, 0.33]}
      >
        <meshPhysicalMaterial
          color="#0f172a"
          metalness={0.85}
          roughness={0.15}
          clearcoat={1}
        />
      </RoundedBox>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, -0.04, 0.345]}
        scale={[0.032, 0.034, 0.012]}
      >
        <meshStandardMaterial
          color="#4ade80"
          emissive="#22c55e"
          emissiveIntensity={2.0}
        />
      </mesh>

      {/* Pearlescent Martian Spacesuit Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.18, 0]}
        scale={[0.22, 0.18, 0.2]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#84cc16"
          roughness={0.18}
          clearcoat={0.95}
          ior={1.55}
          sheen={0.65}
          sheenColor="#d9f99d"
        />
      </mesh>

      {/* Neon Energy Ring Collar around Neck */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.34, 0]}
        scale={0.78}
      >
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#06b6d4"
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Bulbous Inverted-Pear Martian Cranium */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.61, 0]}
        scale={[0.315, 0.275, 0.265]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#84cc16"
          roughness={0.16}
          clearcoat={0.98}
          ior={1.56}
          sheen={0.7}
          sheenColor="#ecfccb"
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.46, 0.04]}
        scale={[0.195, 0.16, 0.2]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#84cc16"
          roughness={0.16}
          clearcoat={0.95}
          ior={1.55}
        />
      </mesh>

      {/* Oversized Tilted Almond Obsidian-Black Mirror Eyes */}
      {[-0.115, 0.115].map((ex, eIdx) => {
        const sign = eIdx === 0 ? 1 : -1;
        return (
          <group
            key={eIdx}
            position={[ex, 0.56, 0.205]}
            rotation={[0.12, -sign * 0.28, sign * 0.36]}
          >
            <mesh
              geometry={SHARED_GEO.unitSphere}
              scale={[0.095, 0.135, 0.055]}
            >
              <meshPhysicalMaterial
                color="#060911"
                roughness={0.01}
                metalness={0.3}
                clearcoat={1}
                clearcoatRoughness={0.0}
                ior={1.75}
              />
            </mesh>
            {/* Elongated Studio Specular Catchlight Glint */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[-sign * 0.022, 0.042, 0.048]}
              rotation={[0, 0, -sign * 0.2]}
              scale={[0.022, 0.048, 0.012]}
            >
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[sign * 0.02, -0.045, 0.046]}
              scale={0.014}
            >
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}

      {/* Dual Ball-Tipped Martian Antennae with Plasma Nodes */}
      {[-0.155, 0.155].map((ax, aIdx) => {
        const sign = aIdx === 0 ? 1 : -1;
        return (
          <group
            key={ax}
            position={[ax, 0.85, 0]}
            rotation={[0, 0, sign * 0.36]}
          >
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              scale={[0.018, 0.12, 0.018]}
            >
              <meshPhysicalMaterial
                color="#4d7c0f"
                roughness={0.2}
                clearcoat={0.9}
              />
            </mesh>
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.072, 0]}
              scale={0.042}
            >
              <meshPhysicalMaterial
                color="#a3e635"
                emissive="#84cc16"
                emissiveIntensity={1.4}
                roughness={0.08}
                clearcoat={1}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
});
AlienSkin.displayName = 'AlienSkin';
