import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const BambooPandaSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Imperial Jade Green Pedestal Collar with Golden Bamboo Torus */}
      <mesh
        geometry={SHARED_GEO.themeCollar}
        position={[0, -0.04, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color="#047857"
          roughness={0.12}
          metalness={0.22}
          clearcoat={1}
          ior={1.62}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, -0.04, 0]}
        scale={1.22}
      >
        <meshStandardMaterial
          color="#eab308"
          metalness={0.9}
          roughness={0.14}
        />
      </mesh>

      {/* Robust Stout Warrior Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.2, -0.01]}
        scale={[0.26, 0.23, 0.24]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#171717"
          roughness={0.52}
          clearcoat={0.18}
          sheen={0.5}
        />
      </mesh>

      {/* Forest-Green Martial Arts Gi / Tunic */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.19, 0.05]}
        scale={[0.235, 0.2, 0.21]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#064e3b"
          roughness={0.42}
          clearcoat={0.3}
          sheen={0.65}
          sheenColor="#34d399"
        />
      </mesh>

      {/* Golden Lapel Trim Crossings on Tunic */}
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[-0.05, 0.22, 0.21]}
        rotation={[0.3, 0.2, -0.6]}
        scale={[0.016, 0.22, 0.008]}
      >
        <meshStandardMaterial color="#facc15" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[0.05, 0.22, 0.21]}
        rotation={[0.3, -0.2, 0.6]}
        scale={[0.016, 0.22, 0.008]}
      >
        <meshStandardMaterial color="#facc15" metalness={0.85} roughness={0.2} />
      </mesh>

      {/* Crimson Silk Obi Sash Wrapped Around Waist */}
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.11, 0.02]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[1.18, 1.15, 0.9]}
      >
        <meshPhysicalMaterial
          color="#dc2626"
          roughness={0.45}
          sheen={0.8}
          sheenColor="#fca5a5"
        />
      </mesh>
      {/* Dangling Obi Ribbon Ends & Golden Knot Medallion */}
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.06, 0.04, 0.23]}
        rotation={[0.2, 0, 0.3]}
        scale={[0.5, 0.65, 0.4]}
      >
        <meshPhysicalMaterial color="#dc2626" roughness={0.45} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.03, 0.11, 0.24]}
        scale={[0.03, 0.03, 0.018]}
      >
        <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
      </mesh>

      {/* Imperial Jade Prayer Bead Mala (Necklace of 8 Jade Beads) */}
      {[
        { x: -0.12, y: 0.37, z: 0.14 },
        { x: -0.07, y: 0.33, z: 0.2 },
        { x: 0, y: 0.31, z: 0.22 },
        { x: 0.07, y: 0.33, z: 0.2 },
        { x: 0.12, y: 0.37, z: 0.14 },
        { x: -0.15, y: 0.42, z: 0.05 },
        { x: 0.15, y: 0.42, z: 0.05 },
      ].map((bead, bIdx) => (
        <mesh
          key={bIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[bead.x, bead.y, bead.z]}
          scale={0.024}
        >
          <meshPhysicalMaterial
            color="#10b981"
            roughness={0.08}
            clearcoat={1}
            ior={1.65}
            emissive="#047857"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
      {/* Centered Large Imperial Jade Disc Seal Pendant */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.27, 0.23]}
        scale={[0.042, 0.042, 0.018]}
      >
        <meshPhysicalMaterial
          color="#059669"
          roughness={0.06}
          clearcoat={1}
          ior={1.68}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.collarTorus}
        position={[0, 0.27, 0.23]}
        scale={0.24}
      >
        <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Forward-Facing Seated Black Hind Feet with Paw Pads */}
      {[-0.13, 0.13].map((xFoot, fIdx) => (
        <group key={fIdx} position={[xFoot, 0.07, 0.19]}>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            scale={[0.088, 0.072, 0.098]}
            castShadow
          >
            <meshPhysicalMaterial color="#171717" roughness={0.48} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.01, 0.085]}
            scale={[0.04, 0.03, 0.02]}
          >
            <meshStandardMaterial color="#cbd5e1" roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* Sturdy Black Warrior Arms Gripping Bamboo Bo Staff */}
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[-0.16, 0.25, 0.16]}
        rotation={[0.5, 0.4, 0.6]}
        scale={[1.1, 1.05, 1.1]}
        castShadow
      >
        <meshPhysicalMaterial color="#171717" roughness={0.5} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.15, 0.25, 0.18]}
        rotation={[0.3, -0.5, -0.6]}
        scale={[1.1, 1.05, 1.1]}
        castShadow
      >
        <meshPhysicalMaterial color="#171717" roughness={0.5} />
      </mesh>

      {/* Authentic Master Bamboo Bo Staff (Diagonal, 3 Nodes, Brass Ferrules & Leaves) */}
      <group position={[0.02, 0.32, 0.26]} rotation={[0.15, 0.15, -0.55]}>
        {/* Main Stalk */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          scale={[0.022, 0.68, 0.022]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#15803d"
            roughness={0.22}
            clearcoat={0.8}
          />
        </mesh>
        {/* Raised Bamboo Segment Rings (Nodes) */}
        {[-0.2, 0, 0.2].map((ny, nIdx) => (
          <mesh
            key={nIdx}
            geometry={SHARED_GEO.collarTorus}
            position={[0, ny, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.145}
          >
            <meshStandardMaterial color="#166534" roughness={0.3} />
          </mesh>
        ))}
        {/* Polished Brass End Ferrules (Top & Bottom) */}
        {[-0.34, 0.34].map((capY, cIdx) => (
          <mesh
            key={cIdx}
            geometry={SHARED_GEO.unitCylinder}
            position={[0, capY, 0]}
            scale={[0.025, 0.04, 0.025]}
          >
            <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
          </mesh>
        ))}
        {/* Sprouting Emerald Leaves */}
        {[
          { x: 0.05, y: 0.22, rz: -0.6, s: 1.0 },
          { x: -0.05, y: 0.16, rz: 0.7, s: 0.9 },
          { x: 0.04, y: 0.28, rz: -0.3, s: 0.85 },
        ].map((lf, lIdx) => (
          <mesh
            key={lIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[lf.x, lf.y, 0.015]}
            rotation={[0.15, 0, lf.rz]}
            scale={[0.022 * lf.s, 0.08 * lf.s, 0.009]}
          >
            <meshPhysicalMaterial
              color={lIdx % 2 === 0 ? '#22c55e' : '#16a34a'}
              roughness={0.28}
              clearcoat={0.7}
            />
          </mesh>
        ))}
      </group>

      {/* Giant Chubby Panda Head */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.53, 0.01]}
        scale={[0.31, 0.23, 0.26]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.4}
          clearcoat={0.3}
          sheen={0.8}
          sheenColor="#ffffff"
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.6, 0.0]}
        scale={[0.26, 0.22, 0.24]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.4}
          clearcoat={0.3}
          sheen={0.8}
        />
      </mesh>
      {/* Fluffy Cheeks */}
      {[-0.16, 0.16].map((cx, cIdx) => (
        <mesh
          key={cIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[cx, 0.51, 0.12]}
          scale={[0.12, 0.1, 0.11]}
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.42}
            sheen={0.7}
          />
        </mesh>
      ))}

      {/* Soft Cream Muzzle & Button Nose */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.5, 0.22]}
        scale={[0.11, 0.08, 0.085]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.38} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.535, 0.285]}
        scale={[0.042, 0.026, 0.026]}
      >
        <meshPhysicalMaterial
          color="#0f172a"
          roughness={0.02}
          clearcoat={1}
        />
      </mesh>
      {/* Rosy Warrior Cheeks */}
      {[-0.16, 0.16].map((bx, bIdx) => (
        <mesh
          key={bIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[bx, 0.505, 0.19]}
          scale={[0.045, 0.026, 0.022]}
        >
          <meshStandardMaterial color="#fda4af" roughness={0.55} />
        </mesh>
      ))}

      {/* Iconic 42° Tilted Teardrop Black Eye Patches */}
      {[-1, 1].map((sign, pIdx) => (
        <mesh
          key={pIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[sign * 0.112, 0.595, 0.2]}
          rotation={[0, sign * 0.22, sign * -0.72]}
          scale={[0.085, 0.11, 0.046]}
        >
          <meshPhysicalMaterial
            color="#171717"
            roughness={0.52}
            sheen={0.5}
          />
        </mesh>
      ))}

      {/* Glassy Expressive Eyes with Dual Catchlights */}
      <ExpressiveEye pos={[-0.105, 0.595, 0.235]} irisColor="#064e3b" eyeRadius={0.05} />
      <ExpressiveEye pos={[0.105, 0.595, 0.235]} irisColor="#064e3b" eyeRadius={0.05} />

      {/* Plush Black Ears Peeking from Below Hat */}
      {[-0.22, 0.22].map((ex, eIdx) => (
        <mesh
          key={eIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[ex, 0.72, 0.02]}
          scale={[0.1, 0.1, 0.07]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#171717"
            roughness={0.52}
            clearcoat={0.18}
          />
        </mesh>
      ))}

      {/* Conical Woven Bamboo Straw Hat (Kasa) with Brass Crest */}
      <group position={[0, 0.74, 0.02]} rotation={[-0.08, 0, 0]}>
        {/* Conical Straw Crown */}
        <mesh
          geometry={SHARED_GEO.kasaHat}
          position={[0, 0.08, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#d97706"
            roughness={0.65}
            clearcoat={0.2}
            sheen={0.7}
            sheenColor="#fde68a"
          />
        </mesh>
        {/* Outer Woven Brim Ring */}
        <mesh
          geometry={SHARED_GEO.kasaBrim}
          position={[0, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={1.02}
        >
          <meshStandardMaterial color="#b45309" roughness={0.7} />
        </mesh>
        {/* Crimson Chin Cord / Ribbon Trim */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.04, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={1.05}
        >
          <meshPhysicalMaterial color="#dc2626" roughness={0.5} />
        </mesh>
        {/* Polished Brass Apex Finial Spire */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0, 0.17, 0]}
          scale={[0.024, 0.04, 0.024]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.2, 0]}
          scale={0.03}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
        </mesh>
      </group>
    </group>
  );
});
BambooPandaSkin.displayName = 'BambooPandaSkin';
