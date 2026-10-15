import React from 'react';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const ClassicSkin: React.FC<SkinComponentProps> = React.memo(({ color }) => {
  const palette = COLOR_PALETTE[color];

  return (
    <group position={[0, 0.14, 0]}>
      {/* Stepped 8-Facet Plinth in Vibrant Player Color */}
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.31, 0.36, 0.08, 8]} />
        <meshPhysicalMaterial
          color={palette.threeHex}
          metalness={0.2}
          roughness={0.18}
          clearcoat={1}
        />
      </mesh>
      {/* Gilded Filigree Ring */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.08, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1.22}
      >
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* Fluted Greco-Roman Sceptre Column in Player Color */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.24, 0.36, 16]} />
        <meshPhysicalMaterial
          color={palette.threeHex}
          roughness={0.12}
          metalness={0.25}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.55}
        />
      </mesh>

      {/* Upper Imperial Gold Ring & Heraldic Studs */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.46, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={0.95}
      >
        <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
      </mesh>
      {[0, 1, 2, 3].map((studIdx) => {
        const ang = (studIdx * Math.PI) / 2;
        return (
          <mesh
            key={studIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[Math.cos(ang) * 0.2, 0.46, Math.sin(ang) * 0.2]}
            scale={0.024}
          >
            <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.08} />
          </mesh>
        );
      })}

      {/* Royal Velvet Cushion Dome Under Crown */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.54, 0]}
        scale={[0.22, 0.12, 0.22]}
        castShadow
      >
        <meshPhysicalMaterial
          color={palette.threeHex}
          roughness={0.7}
          sheen={0.85}
          sheenColor="#ffffff"
        />
      </mesh>

      {/* Hollow 3D Filigree Royal Coronet (6 Arched Golden Spikes) */}
      <group position={[0, 0.55, 0]}>
        <mesh
          geometry={SHARED_GEO.collarTorus}
          scale={[1.05, 1.05, 0.8]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.95}
            roughness={0.08}
            clearcoat={1}
          />
        </mesh>
        {[0, 1, 2, 3, 4, 5].map((sIdx) => {
          const sAngle = (sIdx * Math.PI) / 3;
          return (
            <group
              key={sIdx}
              position={[Math.cos(sAngle) * 0.21, 0.08, Math.sin(sAngle) * 0.21]}
              rotation={[0, -sAngle, 0.12]}
            >
              <mesh geometry={SHARED_GEO.hornCone} scale={[0.5, 0.6, 0.5]}>
                <meshPhysicalMaterial
                  color="#fde047"
                  metalness={0.95}
                  roughness={0.08}
                  clearcoat={1}
                />
              </mesh>
              {/* Pearl at Spire Tip */}
              <mesh geometry={SHARED_GEO.lowSphere} position={[0, 0.09, 0]} scale={0.024}>
                <meshPhysicalMaterial color="#ffffff" roughness={0.05} clearcoat={1} />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Solid Faceted Royal Gem Orb in Vibrant Player Color (100% Opaque, ZERO Glass!) */}
      <mesh
        geometry={SHARED_GEO.gemOrb}
        position={[0, 0.72, 0]}
        rotation={[0.3, 0.4, 0.1]}
        castShadow
      >
        <meshPhysicalMaterial
          color={palette.threeHex}
          roughness={0.05}
          metalness={0.15}
          clearcoat={1}
          clearcoatRoughness={0.02}
          ior={1.65}
        />
      </mesh>

      {/* Royal Imperial Cross Finial at Sceptre Apex */}
      <group position={[0, 0.87, 0]}>
        <mesh position={[0, 0.04, 0]} scale={[0.022, 0.08, 0.022]}>
          <boxGeometry />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh position={[0, 0.055, 0]} scale={[0.065, 0.022, 0.022]}>
          <boxGeometry />
          <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
        </mesh>
        <mesh geometry={SHARED_GEO.lowSphere} position={[0, 0.085, 0]} scale={0.018}>
          <meshStandardMaterial color="#fef08a" metalness={0.95} roughness={0.08} />
        </mesh>
      </group>
    </group>
  );
});
ClassicSkin.displayName = 'ClassicSkin';
