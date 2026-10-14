import { RoundedBox } from '@react-three/drei';
import React from 'react';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const AstronautSkin: React.FC<SkinComponentProps> = React.memo(({ color }) => {
  const palette = COLOR_PALETTE[color];

  return (
    <group position={[0, 0.14, 0]}>
      {/* Grey Moon Boots */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.095, 0.055, 0.04]}
        scale={[0.082, 0.06, 0.105]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#64748b"
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.095, 0.055, 0.04]}
        scale={[0.082, 0.06, 0.105]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#64748b"
          roughness={0.35}
          metalness={0.3}
        />
      </mesh>

      {/* Plump White EVA Spacesuit Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.23, 0]}
        scale={[0.22, 0.2, 0.195]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.22}
          clearcoat={0.85}
          sheen={0.4}
        />
      </mesh>
      {/* Rear Life-Support Oxygen Pack */}
      <RoundedBox
        args={[0.28, 0.26, 0.14]}
        radius={0.04}
        smoothness={4}
        position={[0, 0.25, -0.17]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#e2e8f0"
          roughness={0.28}
          metalness={0.25}
          clearcoat={0.6}
        />
      </RoundedBox>
      {/* Chubby Spacesuit Arms with Coral Gloves */}
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[-0.24, 0.22, 0.02]}
        rotation={[0.15, 0, 0.24]}
        scale={[0.92, 1.0, 0.92]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.25}
          clearcoat={0.8}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.24, 0.22, 0.02]}
        rotation={[0.15, 0, -0.24]}
        scale={[0.92, 1.0, 0.92]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.25}
          clearcoat={0.8}
        />
      </mesh>
      {/* Chest Control Dial & Telemetry Ports */}
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[0, 0.25, 0.188]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.048, 0.02, 0.048]}
      >
        <meshStandardMaterial
          color="#ea580c"
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.075, 0.21, 0.18]}
        scale={0.022}
      >
        <meshStandardMaterial color="#334155" />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.075, 0.21, 0.18]}
        scale={0.026}
      >
        <meshStandardMaterial color="#fb7185" />
      </mesh>

      {/* Metallic Helmet Neck Ring in Player Color */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.39, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <meshStandardMaterial
          color={palette.threeHex}
          metalness={0.65}
          roughness={0.2}
        />
      </mesh>
      {/* Oversized Glossy White Space Helmet */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.6, 0]}
        scale={[0.295, 0.275, 0.28]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.04}
          ior={1.55}
        />
      </mesh>
      {/* Deep-Space Mirror Bubble Visor */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.6, 0.095]}
        scale={[0.225, 0.195, 0.215]}
      >
        <meshPhysicalMaterial
          color="#091930"
          metalness={0.92}
          roughness={0.03}
          clearcoat={1}
          clearcoatRoughness={0.0}
          ior={1.7}
        />
      </mesh>
      {/* Crisp Curved Specular Glint on Helmet Visor */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.085, 0.675, 0.275]}
        rotation={[0, 0, 0.45]}
        scale={[0.052, 0.024, 0.015]}
      >
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Coral-Pink Side Comms Ear Caps */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.29, 0.59, 0]}
        scale={[0.04, 0.085, 0.085]}
      >
        <meshPhysicalMaterial
          color="#fda4af"
          roughness={0.25}
          clearcoat={0.8}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.29, 0.59, 0]}
        scale={[0.04, 0.085, 0.085]}
      >
        <meshPhysicalMaterial
          color="#fda4af"
          roughness={0.25}
          clearcoat={0.8}
        />
      </mesh>
    </group>
  );
});
AstronautSkin.displayName = 'AstronautSkin';
