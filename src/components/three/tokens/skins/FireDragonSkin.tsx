import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const FireDragonSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Volcanic Crimson-and-Charcoal Pedestal Collar with Golden Flame Emblem */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#7f1d1d"
          roughness={0.16}
          metalness={0.3}
          clearcoat={1}
          ior={1.62}
        />
      </mesh>
      {/* 3D Sculpted Molten Flame Emblem on Pedestal Front */}
      <group position={[0, -0.04, 0.33]}>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, 0.012, 0]}
          scale={[0.36, 0.44, 0.18]}
        >
          <meshStandardMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={1.8}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, -0.004, 0.012]}
          scale={[0.2, 0.28, 0.14]}
        >
          <meshStandardMaterial
            color="#fde047"
            emissive="#facc15"
            emissiveIntensity={2.2}
          />
        </mesh>
      </group>

      {/* Volcanic Crimson Scaled Dragon Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.2, -0.01]}
        scale={[0.26, 0.235, 0.245]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#b91c1c"
          roughness={0.22}
          clearcoat={0.9}
          sheen={0.75}
          sheenColor="#fca5a5"
        />
      </mesh>

      {/* 4 Segmented Molten Magma Belly Plates with Fiery Emissive Seams */}
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
            color="#f97316"
            roughness={0.18}
            clearcoat={0.8}
            emissive="#ea580c"
            emissiveIntensity={1.4 + pIdx * 0.2}
          />
        </mesh>
      ))}

      {/* Two Dragon Arms with Paws Resting on Lower Belly */}
      {[-1, 1].map((sign, armIdx) => (
        <group key={armIdx} position={[sign * 0.14, 0.18, 0.1]}>
          <mesh
            geometry={SHARED_GEO.capsuleLimb}
            rotation={[0.42, sign * -0.35, sign * -0.55]}
            scale={[0.9, 0.95, 0.9]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#b91c1c"
              roughness={0.24}
              clearcoat={0.8}
            />
          </mesh>
          {/* 3 Golden Claws on Each Paw */}
          {[-0.02, 0, 0.02].map((cx, cIdx) => (
            <mesh
              key={cIdx}
              geometry={SHARED_GEO.lowSphere}
              position={[sign * -0.05 + cx, -0.05, 0.08]}
              scale={[0.012, 0.016, 0.012]}
            >
              <meshStandardMaterial
                color="#fbbf24"
                metalness={0.92}
                roughness={0.1}
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
              color="#991b1b"
              roughness={0.28}
              clearcoat={0.7}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.01, 0.075]}
            scale={[0.038, 0.026, 0.02]}
          >
            <meshStandardMaterial color="#fef08a" roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* 4 Dorsal Spines Along Upper Spine */}
      {[
        { y: 0.36, z: -0.15, s: 0.05 },
        { y: 0.28, z: -0.16, s: 0.045 },
        { y: 0.20, z: -0.16, s: 0.04 },
        { y: 0.12, z: -0.14, s: 0.035 },
      ].map((sp, spIdx) => (
        <mesh
          key={spIdx}
          geometry={SHARED_GEO.earCone}
          position={[0, sp.y, sp.z]}
          rotation={[-1.2, 0, 0]}
          scale={[sp.s * 0.8, sp.s * 1.4, sp.s * 0.4]}
        >
          <meshStandardMaterial
            color="#f97316"
            emissive="#ea580c"
            emissiveIntensity={1.5}
          />
        </mesh>
      ))}

      {/* Curled Dragon Tail with Molten Spade Tip */}
      <mesh
        geometry={SHARED_GEO.tailTorus}
        position={[-0.14, 0.13, -0.15]}
        rotation={[0.4, 0.6, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#991b1b"
          roughness={0.25}
          clearcoat={0.8}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.earCone}
        position={[-0.19, 0.22, -0.18]}
        rotation={[-0.5, 0, -0.8]}
        scale={[0.07, 0.13, 0.04]}
      >
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#ea580c"
          emissiveIntensity={1.6}
        />
      </mesh>

      {/* Scalloped Bat Wings with Sharp Claws & Fiery Membrane */}
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
              color="#7f1d1d"
              roughness={0.28}
              clearcoat={0.7}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[side * 0.06, 0.1, 0]}
            scale={0.018}
          >
            <meshStandardMaterial
              color="#fbbf24"
              metalness={0.92}
              roughness={0.1}
            />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[side * 0.065, -0.02, 0.015]}
            scale={[0.088, 0.07, 0.02]}
          >
            <meshPhysicalMaterial
              color="#f87171"
              roughness={0.3}
              emissive="#ea580c"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>
      ))}

      {/* Giant Chubby Dragon Head & Cheeks */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.56, 0.01]}
        scale={[0.29, 0.255, 0.255]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#b91c1c"
          roughness={0.22}
          clearcoat={0.9}
          sheen={0.75}
          sheenColor="#fca5a5"
        />
      </mesh>
      {/* Plump Lower Side Jowls */}
      {[-0.15, 0.15].map((jx, jIdx) => (
        <mesh
          key={jIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[jx, 0.52, 0.11]}
          scale={[0.115, 0.095, 0.11]}
        >
          <meshPhysicalMaterial
            color="#b91c1c"
            roughness={0.24}
            clearcoat={0.8}
          />
        </mesh>
      ))}

      {/* Stubby Dragon Muzzle & Nostrils */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.505, 0.2]}
        scale={[0.15, 0.11, 0.135]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#b91c1c"
          roughness={0.22}
          clearcoat={0.85}
        />
      </mesh>
      {[-0.045, 0.045].map((nx, nIdx) => (
        <mesh
          key={nIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[nx, 0.53, 0.315]}
          scale={0.018}
        >
          <meshStandardMaterial color="#450a0a" />
        </mesh>
      ))}

      {/* Fiery Ruby Expressive Eyes with Dual Starlight Catchlights */}
      <ExpressiveEye pos={[-0.118, 0.585, 0.198]} irisColor="#450a0a" eyeRadius={0.056} />
      <ExpressiveEye pos={[0.118, 0.585, 0.198]} irisColor="#450a0a" eyeRadius={0.056} />

      {/* Sweeping Organic Curved Golden Dragon Horns with Magma Glow */}
      {[-0.135, 0.135].map((hx, hIdx) => {
        const sign = hIdx === 0 ? 1 : -1;
        return (
          <mesh
            key={hx}
            geometry={SHARED_GEO.curvedHorn}
            position={[hx, 0.72, 0.02]}
            rotation={[-0.18, sign * 0.15, sign * 0.32]}
            scale={[0.88, 0.95, 0.88]}
            castShadow
          >
            <meshPhysicalMaterial
              color="#f59e0b"
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
              emissive="#d97706"
              emissiveIntensity={0.4}
            />
          </mesh>
        );
      })}

      {/* Cheek Golden Spikes */}
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
              color="#fbbf24"
              metalness={0.88}
              roughness={0.12}
              clearcoat={1}
            />
          </mesh>
        );
      })}
    </group>
  );
});
FireDragonSkin.displayName = 'FireDragonSkin';
