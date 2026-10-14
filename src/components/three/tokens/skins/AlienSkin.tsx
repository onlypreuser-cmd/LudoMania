import { RoundedBox } from '@react-three/drei';
import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const AlienSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Silver-and-Emerald UFO Pedestal Collar + Alien Emblem */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#10b981"
          metalness={0.45}
          roughness={0.15}
          clearcoat={1}
        />
      </mesh>
      {/* Silver Front UFO Bezel + Mini Green Alien Emblem */}
      <RoundedBox
        args={[0.14, 0.095, 0.03]}
        radius={0.02}
        smoothness={4}
        position={[0, -0.04, 0.325]}
      >
        <meshPhysicalMaterial
          color="#cbd5e1"
          metalness={0.85}
          roughness={0.15}
          clearcoat={1}
        />
      </RoundedBox>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, -0.04, 0.342]}
        scale={[0.032, 0.036, 0.012]}
      >
        <meshStandardMaterial
          color="#4ade80"
          emissive="#22c55e"
          emissiveIntensity={1.2}
        />
      </mesh>

      {/* Pearlescent Lime-Green Martian Bust */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.18, 0]}
        scale={[0.22, 0.175, 0.2]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#84cc16"
          roughness={0.2}
          clearcoat={0.92}
          ior={1.52}
          sheen={0.6}
          sheenColor="#d9f99d"
        />
      </mesh>

      {/* Bulbous Inverted-Pear Martian Cranium + Tapered Chin */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.61, 0]}
        scale={[0.315, 0.275, 0.265]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#84cc16"
          roughness={0.18}
          clearcoat={0.95}
          ior={1.55}
          sheen={0.65}
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
          roughness={0.18}
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
                color="#090d16"
                roughness={0.01}
                metalness={0.25}
                clearcoat={1}
                clearcoatRoughness={0.0}
                ior={1.72}
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

      {/* Dual Ball-Tipped Martian Antennae */}
      {[-0.155, 0.155].map((ax, aIdx) => {
        const sign = aIdx === 0 ? 1 : -1;
        return (
          <group
            key={aIdx}
            position={[ax, 0.85, 0]}
            rotation={[0, 0, sign * 0.36]}
          >
            <mesh
              geometry={SHARED_GEO.unitCylinder}
              scale={[0.018, 0.12, 0.018]}
            >
              <meshPhysicalMaterial
                color="#65a30d"
                roughness={0.22}
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
                emissive="#65a30d"
                emissiveIntensity={0.75}
                roughness={0.12}
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
