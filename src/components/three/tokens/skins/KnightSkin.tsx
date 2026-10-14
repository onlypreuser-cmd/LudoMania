import React from 'react';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const KnightSkin: React.FC<SkinComponentProps> = React.memo(({ color }) => {
  const palette = COLOR_PALETTE[color];

  return (
    <group position={[0, 0.14, 0]}>
      {/* Stepped Tournament Pedestal Base with Player Enamel Ring */}
      <mesh
        geometry={SHARED_GEO.pedestalBase}
        position={[0, 0.04, 0]}
        scale={[0.82, 0.8, 0.82]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.25}
          metalness={0.7}
          clearcoat={0.8}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.085, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={1.12}
      >
        <meshStandardMaterial
          color={palette.threeHex}
          metalness={0.4}
          roughness={0.2}
        />
      </mesh>

      {/* Arched Chiseled Paladin Neck with Muscular Contour */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.28, -0.01]}
        rotation={[-0.18, 0, 0]}
        scale={[0.22, 0.28, 0.25]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#334155"
          roughness={0.28}
          metalness={0.75}
          clearcoat={0.9}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.48, 0.02]}
        rotation={[0.22, 0, 0]}
        scale={[0.19, 0.28, 0.22]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#334155"
          roughness={0.28}
          metalness={0.75}
          clearcoat={0.9}
        />
      </mesh>

      {/* Chiseled Equine Cranium & Jawline */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.65, 0.04]}
        scale={[0.18, 0.17, 0.19]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#475569"
          roughness={0.25}
          metalness={0.72}
          clearcoat={0.85}
        />
      </mesh>

      {/* Polished Burnished Steel Champron (Forehead Armor Plate) */}
      <group position={[0, 0.68, 0.16]} rotation={[0.42, 0, 0]}>
        <mesh scale={[0.14, 0.24, 0.05]} castShadow>
          <boxGeometry />
          <meshPhysicalMaterial
            color="#e2e8f0"
            metalness={0.92}
            roughness={0.12}
            clearcoat={1}
          />
        </mesh>
        {/* Central Fluted Champron Spike */}
        <mesh geometry={SHARED_GEO.hornCone} position={[0, 0.06, 0.035]} scale={[0.42, 0.55, 0.42]}>
          <meshPhysicalMaterial color="#fbbf24" metalness={0.95} roughness={0.08} clearcoat={1} />
        </mesh>
        {/* Heraldic Player-Colored Champron Crest */}
        <mesh geometry={SHARED_GEO.lowSphere} position={[0, -0.06, 0.028]} scale={[0.038, 0.038, 0.015]}>
          <meshStandardMaterial color={palette.threeHex} metalness={0.6} roughness={0.15} />
        </mesh>
      </group>

      {/* Tapered Chiseled Muzzle with Flared Nostrils */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.56, 0.21]}
        rotation={[0.38, 0, 0]}
        scale={[0.12, 0.11, 0.17]}
        castShadow
      >
        <meshPhysicalMaterial color="#334155" roughness={0.25} metalness={0.7} />
      </mesh>
      {[-0.045, 0.045].map((nx, nIdx) => (
        <mesh
          key={nIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[nx, 0.54, 0.35]}
          scale={0.02}
        >
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
      ))}

      {/* Golden Leather Bridle & Bit Rings */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.57, 0.16]}
        rotation={[0.35, 0, 0]}
        scale={[0.68, 0.68, 0.45]}
      >
        <meshStandardMaterial color="#f59e0b" metalness={0.88} roughness={0.15} />
      </mesh>
      {[-0.125, 0.125].map((bx, bIdx) => (
        <mesh
          key={bIdx}
          geometry={SHARED_GEO.collarTorus}
          position={[bx, 0.56, 0.22]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.18}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
      ))}

      {/* Flowing Braided Chivalric Plume Mane Along Neck Ridge */}
      {[
        { y: 0.77, z: -0.05, s: 0.11 },
        { y: 0.66, z: -0.14, s: 0.12 },
        { y: 0.53, z: -0.18, s: 0.125 },
        { y: 0.39, z: -0.17, s: 0.115 },
        { y: 0.27, z: -0.14, s: 0.095 },
      ].map((seg, idx) => (
        <mesh
          key={idx}
          geometry={SHARED_GEO.lowSphere}
          position={[0, seg.y, seg.z]}
          scale={[0.07, seg.s, seg.s * 1.2]}
          castShadow
        >
          <meshPhysicalMaterial
            color={palette.threeHex}
            roughness={0.45}
            sheen={0.8}
            sheenColor="#ffffff"
            clearcoat={0.6}
          />
        </mesh>
      ))}

      {/* Chiseled Armored War-Ears */}
      {[-0.095, 0.095].map((ex, eIdx) => {
        const sign = eIdx === 0 ? 1 : -1;
        return (
          <group
            key={eIdx}
            position={[ex, 0.81, -0.01]}
            rotation={[-0.15, 0, sign * 0.22]}
          >
            <mesh geometry={SHARED_GEO.earCone} scale={[0.5, 0.72, 0.45]} castShadow>
              <meshPhysicalMaterial
                color="#e2e8f0"
                metalness={0.9}
                roughness={0.15}
                clearcoat={1}
              />
            </mesh>
            {/* Inner Ear Contrast */}
            <mesh
              geometry={SHARED_GEO.lowSphere}
              position={[0, 0.03, 0.02]}
              scale={[0.032, 0.065, 0.012]}
            >
              <meshStandardMaterial color="#475569" roughness={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* 3-Layer Expressive Chivalric Steed Eyes with Dual Catchlights */}
      <ExpressiveEye pos={[-0.125, 0.67, 0.11]} irisColor="#1e1b4b" eyeRadius={0.036} />
      <ExpressiveEye pos={[0.125, 0.67, 0.11]} irisColor="#1e1b4b" eyeRadius={0.036} />
    </group>
  );
});
KnightSkin.displayName = 'KnightSkin';
