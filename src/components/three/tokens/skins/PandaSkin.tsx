import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const PandaSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Plump Seated Panda Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.21, 0]}
        scale={[0.245, 0.215, 0.225]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.55}
          clearcoat={0.18}
          sheen={0.5}
        />
      </mesh>
      {/* Round White Panda Belly Patch */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.18, 0.065]}
        scale={[0.195, 0.165, 0.18]}
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.48}
          clearcoat={0.2}
          sheen={0.6}
        />
      </mesh>
      {/* Chubby Black Side Arms */}
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[-0.225, 0.23, 0.05]}
        rotation={[0.25, 0, 0.28]}
        scale={[1.05, 1.0, 1.05]}
        castShadow
      >
        <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.225, 0.23, 0.05]}
        rotation={[0.25, 0, -0.28]}
        scale={[1.05, 1.0, 1.05]}
        castShadow
      >
        <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
      </mesh>
      {/* Seated Black Front Feet / Paws */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.115, 0.065, 0.185]}
        scale={[0.082, 0.062, 0.095]}
        castShadow
      >
        <meshPhysicalMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.115, 0.065, 0.185]}
        scale={[0.082, 0.062, 0.095]}
        castShadow
      >
        <meshPhysicalMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Oversized Round White Panda Head */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.58, 0.01]}
        scale={[0.295, 0.26, 0.255]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.45}
          clearcoat={0.25}
          sheen={0.7}
          sheenColor="#ffffff"
        />
      </mesh>
      {/* Rounded Snout / Muzzle */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.515, 0.215]}
        scale={[0.11, 0.082, 0.085]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.45} />
      </mesh>
      {/* Glossy Black Button Nose */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.548, 0.285]}
        scale={[0.042, 0.03, 0.03]}
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.04}
          clearcoat={1}
        />
      </mesh>
      {/* Classic Tilted Oval Black Eye Patches */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.105, 0.59, 0.195]}
        rotation={[0, -0.22, -0.28]}
        scale={[0.082, 0.068, 0.05]}
      >
        <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.105, 0.59, 0.195]}
        rotation={[0, 0.22, 0.28]}
        scale={[0.082, 0.068, 0.05]}
      >
        <meshPhysicalMaterial color="#0f172a" roughness={0.55} />
      </mesh>
      {/* Sparkling Glossy Eyes Inside Patches */}
      <ExpressiveEye pos={[-0.102, 0.595, 0.238]} irisColor="#090d16" eyeRadius={0.038} />
      <ExpressiveEye pos={[0.102, 0.595, 0.238]} irisColor="#090d16" eyeRadius={0.038} />

      {/* Big Round Black Panda Ears */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.21, 0.79, -0.02]}
        scale={[0.098, 0.098, 0.068]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.5}
          clearcoat={0.15}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.21, 0.79, -0.02]}
        scale={[0.098, 0.098, 0.068]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.5}
          clearcoat={0.15}
        />
      </mesh>
    </group>
  );
});
PandaSkin.displayName = 'PandaSkin';
