import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const IceDragonSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Glacial-Blue Pedestal Collar + 3D Ice Snowflake Relief */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#0284c7"
          roughness={0.1}
          metalness={0.2}
          clearcoat={1}
          ior={1.6}
        />
      </mesh>
      {/* 3D Ice Snowflake Emblem on Pedestal Front */}
      <group position={[0, -0.04, 0.33]}>
        {[0, Math.PI / 3, (Math.PI * 2) / 3].map((ang, sIdx) => (
          <mesh
            key={sIdx}
            geometry={SHARED_GEO.unitCylinder}
            rotation={[0, 0, ang]}
            scale={[0.01, 0.088, 0.01]}
          >
            <meshStandardMaterial
              color="#e0f2fe"
              emissive="#38bdf8"
              emissiveIntensity={1.6}
            />
          </mesh>
        ))}
      </group>

      {/* Ultra-Chubby Pear-Shaped Frost Dragon Pot-Belly */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.2, -0.01]}
        scale={[0.26, 0.235, 0.245]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.18}
          clearcoat={0.92}
          ior={1.58}
          sheen={0.65}
          sheenColor="#bae6fd"
        />
      </mesh>

      {/* 4 Sculpted Horizontal Segmented Frosted Mint-White Belly Plates */}
      {[
        { y: 0.11, sx: 0.165, sz: 0.145 },
        { y: 0.16, sx: 0.155, sz: 0.14 },
        { y: 0.21, sx: 0.14, sz: 0.13 },
        { y: 0.26, sx: 0.12, sz: 0.115 },
      ].map((plate, pIdx) => (
        <mesh
          key={pIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[0, plate.y, 0.13]}
          scale={[plate.sx, 0.038, plate.sz]}
        >
          <meshPhysicalMaterial
            color="#e0f2fe"
            roughness={0.2}
            clearcoat={0.8}
          />
        </mesh>
      ))}

      {/* Two Chubby Baby Frost Arms with Paws Resting on Lower Belly */}
      {[-1, 1].map((sign, armIdx) => (
        <group key={armIdx} position={[sign * 0.14, 0.18, 0.1]}>
          <mesh
            geometry={SHARED_GEO.capsuleLimb}
            rotation={[0.42, sign * -0.35, sign * -0.55]}
            scale={[0.9, 0.95, 0.9]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#38bdf8"
              roughness={0.2}
              clearcoat={0.85}
            />
          </mesh>
          {/* 3 Translucent Ice Claws */}
          {[-0.02, 0, 0.02].map((cx, cIdx) => (
            <mesh
              key={cIdx}
              geometry={SHARED_GEO.lowSphere}
              position={[sign * -0.05 + cx, -0.05, 0.08]}
              scale={[0.012, 0.016, 0.012]}
            >
              <meshStandardMaterial
                color="#bae6fd"
                emissive="#38bdf8"
                emissiveIntensity={0.6}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Seated Hind Thighs on Pedestal */}
      {[-0.135, 0.135].map((px, pIdx) => (
        <group key={pIdx} position={[px, 0.07, 0.16]}>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            scale={[0.082, 0.065, 0.092]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#0284c7"
              roughness={0.2}
              clearcoat={0.85}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.01, 0.075]}
            scale={[0.038, 0.026, 0.02]}
          >
            <meshStandardMaterial color="#e0f2fe" roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Curled Frost Dragon Tail */}
      <mesh
        geometry={SHARED_GEO.tailTorus}
        position={[-0.14, 0.13, -0.15]}
        rotation={[0.4, 0.6, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#0284c7"
          roughness={0.2}
          clearcoat={0.85}
        />
      </mesh>

      {/* Spread Frost Wings */}
      {[-1, 1].map((side, wIdx) => (
        <group
          key={wIdx}
          position={[side * 0.16, 0.28, -0.11]}
          rotation={[0.15, side * -0.42, side * -0.25]}
        >
          <mesh
            geometry={SHARED_GEO.earCone}
            rotation={[0, 0, side * -1.1]}
            scale={[0.88, 1.05, 0.22]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#0284c7"
              roughness={0.18}
              clearcoat={0.9}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[side * 0.065, -0.02, 0.015]}
            scale={[0.088, 0.07, 0.02]}
          >
            <meshPhysicalMaterial
              color="#bae6fd"
              roughness={0.12}
              clearcoat={1}
            />
          </mesh>
        </group>
      ))}

      {/* Giant Chubby Frost Head & Jowls */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.56, 0.01]}
        scale={[0.29, 0.255, 0.255]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.16}
          clearcoat={0.95}
          ior={1.6}
          sheen={0.65}
        />
      </mesh>
      {[-0.15, 0.15].map((jx, jIdx) => (
        <mesh
          key={jIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[jx, 0.52, 0.11]}
          scale={[0.115, 0.095, 0.11]}
        >
          <meshPhysicalMaterial
            color="#38bdf8"
            roughness={0.18}
            clearcoat={0.85}
          />
        </mesh>
      ))}

      {/* Frost Snout & Nostrils */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.505, 0.2]}
        scale={[0.15, 0.11, 0.135]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.16}
          clearcoat={0.9}
        />
      </mesh>
      {[-0.045, 0.045].map((nx, nIdx) => (
        <mesh
          key={nIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[nx, 0.53, 0.315]}
          scale={0.018}
        >
          <meshStandardMaterial color="#0369a1" />
        </mesh>
      ))}

      {/* GIANT Deep Sapphire Kawaii Eyes */}
      <ExpressiveEye pos={[-0.118, 0.585, 0.198]} irisColor="#0369a1" eyeRadius={0.056} />
      <ExpressiveEye pos={[0.118, 0.585, 0.198]} irisColor="#0369a1" eyeRadius={0.056} />

      {/* Sweeping Organic Curved Crystalline Ice Horns */}
      {[-0.135, 0.135].map((hx, hIdx) => {
        const sign = hIdx === 0 ? 1 : -1;
        return (
          <mesh
            key={hIdx}
            geometry={SHARED_GEO.curvedHorn}
            position={[hx, 0.72, 0.02]}
            rotation={[-0.18, sign * 0.15, sign * 0.32]}
            scale={[0.88, 0.95, 0.88]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#e0f2fe"
              roughness={0.04}
              clearcoat={1}
              transmission={0.45}
              ior={1.34}
              emissive="#38bdf8"
              emissiveIntensity={0.35}
            />
          </mesh>
        );
      })}

      {/* Cheek Frost Crystals */}
      {[-0.26, 0.26].map((fx, fIdx) => {
        const sign = fIdx === 0 ? 1 : -1;
        return (
          <mesh
            key={fIdx}
            geometry={SHARED_GEO.earCone}
            position={[fx, 0.57, 0]}
            rotation={[0, 0, sign * 1.15]}
            scale={[0.45, 0.58, 0.26]}
          >
            <meshPhysicalMaterial
              color="#bae6fd"
              roughness={0.08}
              clearcoat={1}
              ior={1.65}
            />
          </mesh>
        );
      })}
    </group>
  );
});
IceDragonSkin.displayName = 'IceDragonSkin';
