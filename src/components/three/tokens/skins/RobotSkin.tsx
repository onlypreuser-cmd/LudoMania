import { RoundedBox } from '@react-three/drei';
import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const RobotSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Sturdy Dark-Slate Mecha Boots */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.1, 0.055, 0.04]}
        scale={[0.085, 0.06, 0.11]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#334155"
          metalness={0.75}
          roughness={0.22}
          clearcoat={0.8}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.1, 0.055, 0.04]}
        scale={[0.085, 0.06, 0.11]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#334155"
          metalness={0.75}
          roughness={0.22}
          clearcoat={0.8}
        />
      </mesh>

      {/* Rounded Brushed-Aluminum Mecha Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.23, 0]}
        scale={[0.215, 0.195, 0.185]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#94a3b8"
          metalness={0.78}
          roughness={0.18}
          clearcoat={0.9}
          clearcoatRoughness={0.1}
        />
      </mesh>
      {/* Articulated Robot Arms */}
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[-0.24, 0.22, 0.02]}
        rotation={[0.1, 0, 0.22]}
        scale={[0.9, 1.05, 0.9]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#94a3b8"
          metalness={0.78}
          roughness={0.2}
          clearcoat={0.8}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.24, 0.22, 0.02]}
        rotation={[0.1, 0, -0.22]}
        scale={[0.9, 1.05, 0.9]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#94a3b8"
          metalness={0.78}
          roughness={0.2}
          clearcoat={0.8}
        />
      </mesh>
      {/* Chest Diagnostic Control Panel + Micro LEDs */}
      <RoundedBox
        args={[0.21, 0.12, 0.04]}
        radius={0.02}
        smoothness={4}
        position={[0, 0.24, 0.165]}
      >
        <meshStandardMaterial
          color="#cbd5e1"
          metalness={0.6}
          roughness={0.25}
        />
      </RoundedBox>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.045, 0.24, 0.19]}
        scale={0.022}
      >
        <meshStandardMaterial
          color="#22c55e"
          emissive="#22c55e"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.0, 0.24, 0.19]}
        scale={0.022}
      >
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#f59e0b"
          emissiveIntensity={1.5}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.045, 0.24, 0.19]}
        scale={0.022}
      >
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ef4444"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* Pillowed Metallic Chibi Robot Head (RoundedBox) */}
      <RoundedBox
        args={[0.52, 0.39, 0.42]}
        radius={0.13}
        smoothness={8}
        position={[0, 0.58, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#94a3b8"
          metalness={0.78}
          roughness={0.16}
          clearcoat={1}
          clearcoatRoughness={0.08}
        />
      </RoundedBox>
      {/* Recessed Dark Navy Glass Visor Screen */}
      <RoundedBox
        args={[0.38, 0.23, 0.06]}
        radius={0.065}
        smoothness={6}
        position={[0, 0.59, 0.19]}
      >
        <meshPhysicalMaterial
          color="#091526"
          metalness={0.85}
          roughness={0.05}
          clearcoat={1}
          ior={1.6}
        />
      </RoundedBox>
      {/* Glowing Cyan LED Eyes + Bright White Core */}
      {[-0.095, 0.095].map((xPos, idx) => (
        <group key={idx} position={[xPos, 0.59, 0.222]}>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            scale={[0.055, 0.055, 0.022]}
          >
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0ea5e9"
              emissiveIntensity={2.4}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, 0, 0.012]}
            scale={[0.028, 0.028, 0.012]}
          >
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      {/* Copper/Bronze Ear Pods */}
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[-0.275, 0.58, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.075, 0.05, 0.075]}
      >
        <meshPhysicalMaterial
          color="#c2410c"
          metalness={0.75}
          roughness={0.2}
          clearcoat={0.8}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[0.275, 0.58, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.075, 0.05, 0.075]}
      >
        <meshPhysicalMaterial
          color="#c2410c"
          metalness={0.75}
          roughness={0.2}
          clearcoat={0.8}
        />
      </mesh>
      {/* Top Central Copper Beacon + Dual Angled Side Antennas */}
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[0, 0.81, 0]}
        scale={[0.032, 0.09, 0.032]}
      >
        <meshStandardMaterial
          color="#ea580c"
          metalness={0.75}
          roughness={0.2}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.87, 0]}
        scale={0.042}
      >
        <meshStandardMaterial
          color="#fb923c"
          emissive="#f97316"
          emissiveIntensity={1.6}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[-0.14, 0.79, 0]}
        rotation={[0, 0, 0.45]}
        scale={[0.016, 0.07, 0.016]}
      >
        <meshStandardMaterial
          color="#ea580c"
          metalness={0.75}
          roughness={0.2}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[0.14, 0.79, 0]}
        rotation={[0, 0, -0.45]}
        scale={[0.016, 0.07, 0.016]}
      >
        <meshStandardMaterial
          color="#ea580c"
          metalness={0.75}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
});
RobotSkin.displayName = 'RobotSkin';
