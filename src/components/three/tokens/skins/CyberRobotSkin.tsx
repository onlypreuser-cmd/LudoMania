import { RoundedBox } from '@react-three/drei';
import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const CyberRobotSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Angular Titanium Pedestal Base + Cyan Circuit Trench */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#0f172a"
          metalness={0.92}
          roughness={0.14}
          clearcoat={1}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, -0.04, 0]}
        scale={1.22}
      >
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={2.5}
        />
      </mesh>

      {/* Angular Ceramic Mecha Torso */}
      <group position={[0, 0.23, 0]}>
        <RoundedBox args={[0.38, 0.32, 0.28]} radius={0.05} smoothness={4} castShadow>
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.14}
            metalness={0.35}
            clearcoat={1}
            ior={1.55}
          />
        </RoundedBox>
        {/* Chest Hexagonal Quantum Plasma Core */}
        <mesh position={[0, 0.02, 0.145]}>
          <cylinderGeometry args={[0.075, 0.085, 0.03, 6]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#06b6d4"
            emissiveIntensity={3.2}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.thinTorus}
          position={[0, 0.02, 0.16]}
          scale={0.085}
        >
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.1} />
        </mesh>
      </group>

      {/* Dual High-Thrust Rear Booster Rockets with Plasma Glow */}
      {[-0.14, 0.14].map((tx, tIdx) => (
        <group key={tIdx} position={[tx, 0.26, -0.16]} rotation={[0.15, 0, 0]}>
          <mesh geometry={SHARED_GEO.mechaThruster} castShadow>
            <meshPhysicalMaterial
              color="#1e293b"
              metalness={0.88}
              roughness={0.18}
              clearcoat={0.9}
            />
          </mesh>
          {/* Glowing Plasma Exhaust Nozzle */}
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.045, 0.035, 0.04, 16]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#00e5ff"
              emissiveIntensity={4.2}
            />
          </mesh>
        </group>
      ))}

      {/* Angular Stealth Shoulder Pauldrons */}
      {[-0.26, 0.26].map((sx, sIdx) => {
        const sign = sIdx === 0 ? 1 : -1;
        return (
          <group key={sIdx} position={[sx, 0.32, 0.02]} rotation={[0, 0, sign * 0.22]}>
            <mesh castShadow>
              <boxGeometry args={[0.14, 0.16, 0.24]} />
              <meshPhysicalMaterial
                color="#0284c7"
                metalness={0.75}
                roughness={0.2}
                clearcoat={1}
              />
            </mesh>
            {/* Cyan Energy Vent Line */}
            <mesh position={[sign * 0.072, 0, 0]}>
              <boxGeometry args={[0.012, 0.1, 0.18]} />
              <meshStandardMaterial
                color="#22d3ee"
                emissive="#06b6d4"
                emissiveIntensity={2.8}
              />
            </mesh>
          </group>
        );
      })}

      {/* Articulated Mecha Limbs */}
      {[-0.22, 0.22].map((ax, aIdx) => (
        <mesh
          key={aIdx}
          geometry={SHARED_GEO.capsuleLimb}
          position={[ax, 0.16, 0.04]}
          rotation={[0.3, 0, aIdx === 0 ? 0.22 : -0.22]}
          scale={[0.85, 0.9, 0.85]}
          castShadow
        >
          <meshPhysicalMaterial color="#334155" metalness={0.85} roughness={0.18} />
        </mesh>
      ))}

      {/* Sharpened Angular Mecha Head & Tactical Hex Visor */}
      <group position={[0, 0.58, 0]}>
        <RoundedBox args={[0.42, 0.32, 0.36]} radius={0.06} smoothness={6} castShadow>
          <meshPhysicalMaterial
            color="#f8fafc"
            roughness={0.12}
            metalness={0.4}
            clearcoat={1}
          />
        </RoundedBox>
        {/* Tactical Aerodynamic Brow Crest */}
        <mesh position={[0, 0.18, 0.06]} rotation={[0.35, 0, 0]}>
          <boxGeometry args={[0.16, 0.08, 0.22]} />
          <meshPhysicalMaterial
            color="#0284c7"
            metalness={0.8}
            roughness={0.18}
            clearcoat={1}
          />
        </mesh>
        {/* Narrow Glowing Cyan Tactical Hex Visor */}
        <mesh position={[0, 0.01, 0.185]}>
          <boxGeometry args={[0.34, 0.11, 0.04]} />
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#00e5ff"
            emissiveIntensity={3.8}
          />
        </mesh>
        {/* Dual Swept-Back Antenna Vanes */}
        {[-0.22, 0.22].map((vx, vIdx) => {
          const vSign = vIdx === 0 ? 1 : -1;
          return (
            <mesh
              key={vIdx}
              position={[vx, 0.14, -0.06]}
              rotation={[-0.35, 0, vSign * 0.42]}
              scale={[0.025, 0.22, 0.05]}
            >
              <boxGeometry />
              <meshPhysicalMaterial color="#0284c7" metalness={0.88} roughness={0.15} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
});
CyberRobotSkin.displayName = 'CyberRobotSkin';
