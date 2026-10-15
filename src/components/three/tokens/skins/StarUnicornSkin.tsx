import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const StarUnicornSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Deep Cosmic Amethyst Pedestal Collar + 4 Raised 3D Golden Stars */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#581c87"
          roughness={0.12}
          metalness={0.35}
          clearcoat={1}
          ior={1.62}
        />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((ang, sIdx) => (
        <mesh
          key={sIdx}
          geometry={SHARED_GEO.star3D}
          position={[
            Math.sin(ang) * 0.33,
            -0.04,
            Math.cos(ang) * 0.33,
          ]}
          rotation={[0, ang, 0]}
          scale={0.88}
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.95}
            roughness={0.06}
            clearcoat={1}
          />
        </mesh>
      ))}

      {/* Solid Pearlescent Celestial Nebula Body (ZERO Glass / Transmission!) */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.2, -0.02]}
        scale={[0.22, 0.21, 0.225]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#fdf4ff"
          roughness={0.24}
          metalness={0.08}
          clearcoat={0.9}
          sheen={0.8}
          sheenColor="#e879f9"
        />
      </mesh>

      {/* Rose-Gold Gilded Hooves */}
      {[-0.09, 0.09].map((hx, hIdx) => (
        <mesh
          key={hIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[hx, 0.055, 0.16]}
          scale={[0.072, 0.055, 0.088]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#f472b6"
            metalness={0.75}
            roughness={0.18}
            clearcoat={0.9}
          />
        </mesh>
      ))}

      {/* Graceful Folded Celestial Pegasus Feather Wings on Flanks */}
      {[-1, 1].map((sign, wIdx) => (
        <group
          key={wIdx}
          position={[sign * 0.19, 0.23, -0.02]}
          rotation={[0.3, sign * -0.25, sign * 0.35]}
        >
          {/* 3 Layered Feathers */}
          {[
            { y: 0.1, rz: 0.2, s: 0.85, col: '#c084fc' },
            { y: 0, rz: 0.45, s: 1.0, col: '#e879f9' },
            { y: -0.09, rz: 0.7, s: 0.9, col: '#38bdf8' },
          ].map((f, fIdx) => (
            <mesh
              key={fIdx}
              geometry={SHARED_GEO.wingFeather}
              position={[0, f.y, 0]}
              rotation={[0, 0, sign * f.rz]}
              scale={[0.7 * f.s, 0.9 * f.s, 0.3 * f.s]}
              castShadow
            >
              <meshPhysicalMaterial
                color={f.col}
                roughness={0.18}
                clearcoat={0.95}
                sheen={0.8}
                sheenColor="#fdf4ff"
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* Sculpted Graceful Chibi Pony Head */}
      <group rotation={[0, -0.1, 0]}>
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0.56, 0.01]}
          scale={[0.25, 0.24, 0.245]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.18}
            clearcoat={0.9}
            sheen={0.85}
            sheenColor="#fdf4ff"
          />
        </mesh>
        {/* Sweet Rounded Snout */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0.505, 0.2]}
          rotation={[0.18, 0, 0]}
          scale={[0.145, 0.12, 0.145]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.2}
            clearcoat={0.85}
          />
        </mesh>
        {[-0.045, 0.045].map((nx, nIdx) => (
          <mesh
            key={nIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[nx, 0.525, 0.325]}
            scale={0.018}
          >
            <meshStandardMaterial color="#f43f5e" />
          </mesh>
        ))}

        {/* Enchanting Starlight Violet Eyes with Dual Catchlights */}
        <ExpressiveEye pos={[-0.112, 0.585, 0.185]} irisColor="#6b21a8" eyeRadius={0.052} />
        <ExpressiveEye pos={[0.112, 0.585, 0.185]} irisColor="#6b21a8" eyeRadius={0.052} />

        {/* Equine Ears with Soft Rose-Gold Interior */}
        {[-0.145, 0.145].map((ex, eIdx) => {
          const sign = eIdx === 0 ? 1 : -1;
          return (
            <group
              key={eIdx}
              position={[ex, 0.775, -0.02]}
              rotation={[-0.1, 0, sign * 0.24]}
            >
              <mesh
                geometry={SHARED_GEO.earCone}
                scale={[0.7, 0.88, 0.54]}
                castShadow
              >
                <meshPhysicalMaterial color="#ffffff" roughness={0.24} clearcoat={0.8} />
              </mesh>
              <mesh
                geometry={SHARED_GEO.earCone}
                position={[0, -0.01, 0.022]}
                scale={[0.42, 0.62, 0.32]}
              >
                <meshStandardMaterial color="#f9a8d4" />
              </mesh>
            </group>
          );
        })}

        {/* Forehead 3D Golden Star Tiara Crest */}
        <mesh
          geometry={SHARED_GEO.star3D}
          position={[0, 0.67, 0.21]}
          rotation={[-0.3, 0, 0]}
          scale={0.72}
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.96}
            roughness={0.06}
            clearcoat={1}
          />
        </mesh>

        {/* Twisted Golden Helical Spiral Alicorn Horn with Radiance */}
        <mesh
          geometry={SHARED_GEO.spiralHorn}
          position={[0, 0.76, 0.07]}
          rotation={[0.26, 0, 0]}
          scale={1.02}
          castShadow
        >
          <meshPhysicalMaterial
            color="#fbbf24"
            metalness={0.95}
            roughness={0.06}
            clearcoat={1}
            emissive="#d97706"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Nebula Gradient Cascading Mane (Magenta, Lavender, Cyan) */}
        {[
          { x: 0.02, y: 0.77, z: 0.08, sx: 0.14, sy: 0.1, sz: 0.13, col: '#f472b6' },
          { x: 0.08, y: 0.71, z: -0.12, sx: 0.13, sy: 0.14, sz: 0.13, col: '#c084fc' },
          { x: 0.13, y: 0.57, z: -0.16, sx: 0.125, sy: 0.15, sz: 0.13, col: '#38bdf8' },
          { x: 0.14, y: 0.42, z: -0.15, sx: 0.12, sy: 0.14, sz: 0.12, col: '#c084fc' },
          { x: 0.12, y: 0.28, z: -0.15, sx: 0.115, sy: 0.12, sz: 0.115, col: '#f472b6' },
          { x: 0.02, y: 0.18, z: -0.23, sx: 0.12, sy: 0.13, sz: 0.13, col: '#38bdf8' },
        ].map((m, idx) => (
          <mesh
            key={idx}
            geometry={SHARED_GEO.lowSphere}
            position={[m.x, m.y, m.z]}
            scale={[m.sx, m.sy, m.sz]}
            castShadow
          >
            <meshPhysicalMaterial
              color={m.col}
              roughness={0.24}
              clearcoat={0.8}
              sheen={0.9}
              sheenColor="#fdf4ff"
            />
          </mesh>
        ))}
      </group>
    </group>
  );
});
StarUnicornSkin.displayName = 'StarUnicornSkin';
