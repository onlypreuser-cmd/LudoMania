import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Bamboo Panda Master Figurine (Ground-up procedural 3D sculpture matching Reference Sheet 2, Row 1)
 * Features:
 * - Natural segmented bamboo stalk with nodes and sprouting leaves
 * - Dual bamboo quiver backpack with fanning emerald leaves
 * - Forest-green martial arts cape with golden embroidery trim
 * - Centered golden chest medallion with embossed "竹" calligraphy seal
 * - Golden-rope sash, black sleeves with gold wrist bracers
 * - Chubby white panda anatomy with 3-layer expressive eyes and teardrop patches
 * - Cobblestone plate pedestal bordered with fresh bamboo sprouts
 */
export const BambooPandaSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Cobblestone Pedestal Base with Bamboo Leaf Garland */}
      <group position={[0, -0.04, 0]}>
        {/* Bronze / Gilded Outer Collar */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#78350f"
            metalness={0.88}
            roughness={0.2}
            clearcoat={0.9}
          />
        </mesh>
        {/* Golden Base Ring */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
        </mesh>
        {/* Cobblestone Top Plate */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#475569"
            roughness={0.78}
            clearcoat={0.15}
          />
        </mesh>
        {/* Sprouting Bamboo Leaves Framing the Pedestal Rim */}
        {[0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((ang, lIdx) => (
          <mesh
            key={lIdx}
            geometry={SHARED_GEO.bambooLeaf}
            position={[Math.sin(ang) * 0.32, 0.065, Math.cos(ang) * 0.32]}
            rotation={[1.1, ang, -0.3]}
            scale={[1.1, 1.2, 1.0]}
          >
            <meshPhysicalMaterial
              color={lIdx % 2 === 0 ? '#15803d' : '#22c55e'}
              roughness={0.3}
              clearcoat={0.75}
            />
          </mesh>
        ))}
      </group>

      {/* 2. Plump Seated Panda Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.21, -0.01]}
        scale={[0.26, 0.23, 0.24]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#1e293b"
          roughness={0.52}
          clearcoat={0.2}
          sheen={0.5}
        />
      </mesh>
      {/* White Chest & Belly Patch */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.2, 0.065]}
        scale={[0.21, 0.18, 0.19]}
      >
        <meshPhysicalMaterial
          color="#f8fafc"
          roughness={0.48}
          clearcoat={0.3}
          sheen={0.6}
        />
      </mesh>

      {/* 3. Seated Black Paws with Claws */}
      {[-0.13, 0.13].map((xFoot, fIdx) => (
        <group key={fIdx} position={[xFoot, 0.07, 0.19]}>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            scale={[0.088, 0.07, 0.096]}
            castShadow
          >
            <meshPhysicalMaterial color="#0f172a" roughness={0.5} />
          </mesh>
          {/* Subtle Paw Toe Indentations */}
          {[-0.032, 0, 0.032].map((tx, tIdx) => (
            <mesh
              key={tIdx}
              geometry={SHARED_GEO.lowSphere}
              position={[tx, 0.02, 0.085]}
              scale={[0.018, 0.018, 0.014]}
            >
              <meshStandardMaterial color="#334155" roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 4. Forest-Green Martial Arts Cape & Robe */}
      <group position={[0, 0.22, 0]}>
        {/* Cape Mantle Over Shoulders */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0.02, -0.05]}
          scale={[0.275, 0.22, 0.22]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#047857"
            roughness={0.38}
            clearcoat={0.6}
            sheen={0.8}
            sheenColor="#34d399"
          />
        </mesh>
        {/* Golden Lapel Trim Crossings */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[-0.065, 0.03, 0.2]}
          rotation={[0.3, 0.22, -0.65]}
          scale={[0.016, 0.24, 0.008]}
        >
          <meshStandardMaterial color="#facc15" metalness={0.92} roughness={0.12} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0.065, 0.03, 0.2]}
          rotation={[0.3, -0.22, 0.65]}
          scale={[0.016, 0.24, 0.008]}
        >
          <meshStandardMaterial color="#facc15" metalness={0.92} roughness={0.12} />
        </mesh>
        {/* Golden Braided Rope Belt Sash */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.09, 0.02]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[1.18, 1.15, 0.9]}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.15} />
        </mesh>
        {/* Centered Golden Disc Medallion with Calligraphy Ring */}
        <group position={[0, -0.01, 0.23]}>
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.062, 0.062, 0.018]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.08} />
          </mesh>
          {/* Inner Dark Lacquer Inlay */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, 0, 0.008]}
            scale={[0.044, 0.044, 0.012]}
          >
            <meshPhysicalMaterial color="#1c1917" roughness={0.1} clearcoat={1} />
          </mesh>
          {/* Embossed Golden "竹" Character Emblem (Vertical Stems & Lateral Strokes) */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[-0.014, 0, 0.014]}
            scale={[0.004, 0.038, 0.004]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.92} roughness={0.1} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0.014, -0.004, 0.014]}
            scale={[0.004, 0.034, 0.004]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.92} roughness={0.1} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[-0.014, 0.014, 0.014]}
            rotation={[0, 0, -0.4]}
            scale={[0.003, 0.018, 0.003]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.92} roughness={0.1} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0.014, 0.014, 0.014]}
            rotation={[0, 0, -0.4]}
            scale={[0.003, 0.018, 0.003]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.92} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 5. Chubby Arms with Golden Wrist Bracers */}
      {/* Right Arm: Gripping Upright Bamboo Stalk */}
      <group position={[-0.18, 0.26, 0.12]} rotation={[0.4, 0.35, 0.5]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[1.1, 1.05, 1.1]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Polished Gold Wrist Bracer */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.52}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
      </group>
      {/* Left Arm: Relaxed Resting on Lap */}
      <group position={[0.18, 0.24, 0.14]} rotation={[0.2, -0.4, -0.55]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[1.05, 1.0, 1.05]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.52}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
      </group>

      {/* 6. Handheld Natural Bamboo Stalk with Sprouting Leaves */}
      <group position={[-0.24, 0.34, 0.18]} rotation={[0.08, 0.05, 0.1]}>
        {/* Main Bamboo Trunk */}
        <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.026, 0.72, 0.026]} castShadow>
          <meshPhysicalMaterial
            color="#15803d"
            roughness={0.22}
            clearcoat={0.85}
          />
        </mesh>
        {/* Bamboo Node Segment Rings */}
        {[-0.22, -0.04, 0.14, 0.3].map((ny, nIdx) => (
          <mesh
            key={nIdx}
            geometry={SHARED_GEO.collarTorus}
            position={[0, ny, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.16}
          >
            <meshStandardMaterial color="#166534" roughness={0.3} />
          </mesh>
        ))}
        {/* Sprouting Fresh Leaves on Stalk */}
        {[
          { y: 0.15, rz: -0.65, rx: 0.2, s: 1.1 },
          { y: 0.25, rz: 0.7, rx: -0.2, s: 1.0 },
          { y: 0.34, rz: -0.85, rx: 0.1, s: 0.9 },
        ].map((lf, lIdx) => (
          <mesh
            key={lIdx}
            geometry={SHARED_GEO.bambooLeaf}
            position={[0, lf.y, 0]}
            rotation={[lf.rx, 0, lf.rz]}
            scale={lf.s}
          >
            <meshPhysicalMaterial
              color="#22c55e"
              roughness={0.28}
              clearcoat={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* 7. Rear Bamboo Quiver Backpack with Fanning Leaves */}
      <group position={[0.12, 0.35, -0.16]} rotation={[0.15, -0.2, -0.15]}>
        {/* Twin Bamboo Tubes */}
        {[-0.04, 0.04].map((tx, qIdx) => (
          <group key={qIdx} position={[tx, 0, 0]}>
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.034, 0.46, 0.034]} castShadow>
              <meshPhysicalMaterial color="#15803d" roughness={0.25} clearcoat={0.8} />
            </mesh>
            {/* Top Hollow Opening Rim */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.23, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.21}
            >
              <meshStandardMaterial color="#14532d" roughness={0.4} />
            </mesh>
            {/* Golden Binding Band */}
            <mesh
              geometry={SHARED_GEO.collarTorus}
              position={[0, 0.02, 0]}
              rotation={[Math.PI / 2, 0, 0]}
              scale={0.22}
            >
              <meshStandardMaterial color="#fbbf24" metalness={0.92} roughness={0.12} />
            </mesh>
          </group>
        ))}
        {/* Fanning Emerald Leaves from Quiver */}
        {[
          { x: -0.06, y: 0.24, rz: -0.5, ry: 0.3, s: 1.3 },
          { x: 0.02, y: 0.28, rz: 0.2, ry: 0, s: 1.4 },
          { x: 0.08, y: 0.22, rz: 0.65, ry: -0.4, s: 1.2 },
        ].map((qf, qfIdx) => (
          <mesh
            key={qfIdx}
            geometry={SHARED_GEO.bambooLeaf}
            position={[qf.x, qf.y, 0]}
            rotation={[0.3, qf.ry, qf.rz]}
            scale={qf.s}
          >
            <meshPhysicalMaterial
              color={qfIdx % 2 === 0 ? '#22c55e' : '#16a34a'}
              roughness={0.26}
              clearcoat={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* 8. Giant Chubby White Panda Head */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.55, 0.02]}
        scale={[0.295, 0.25, 0.265]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#ffffff"
          roughness={0.4}
          clearcoat={0.35}
          sheen={0.7}
          sheenColor="#ffffff"
        />
      </mesh>
      {/* Puffy Cheeks */}
      {[-0.155, 0.155].map((cx, cIdx) => (
        <mesh
          key={cIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[cx, 0.52, 0.13]}
          scale={[0.13, 0.1, 0.11]}
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.42} sheen={0.65} />
        </mesh>
      ))}

      {/* Plush Black Panda Ears with Inner Hollows */}
      {[-0.21, 0.21].map((ex, eIdx) => (
        <group key={eIdx} position={[ex, 0.74, 0.03]} rotation={[0, 0, eIdx === 0 ? 0.35 : -0.35]}>
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.095, 0.11, 0.065]} castShadow>
            <meshPhysicalMaterial color="#0f172a" roughness={0.5} clearcoat={0.2} />
          </mesh>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, 0, 0.02]}
            scale={[0.065, 0.08, 0.035]}
          >
            <meshStandardMaterial color="#1e293b" roughness={0.65} />
          </mesh>
        </group>
      ))}

      {/* Soft White Muzzle & Jet-Black Button Nose */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.52, 0.23]}
        scale={[0.11, 0.08, 0.085]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.36} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.55, 0.295]}
        scale={[0.042, 0.026, 0.026]}
      >
        <meshPhysicalMaterial color="#090d16" roughness={0.02} clearcoat={1} />
      </mesh>
      {/* Subtle Smiling Mouth Line */}
      <mesh
        geometry={SHARED_GEO.unitCylinder}
        position={[0, 0.505, 0.29]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[0.004, 0.022, 0.004]}
      >
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* Rosy Warrior Cheeks */}
      {[-0.16, 0.16].map((bx, bIdx) => (
        <mesh
          key={bIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[bx, 0.51, 0.2]}
          scale={[0.045, 0.025, 0.022]}
        >
          <meshStandardMaterial color="#fda4af" roughness={0.55} />
        </mesh>
      ))}

      {/* Symmetrical 38° Tilted Teardrop Black Eye Patches */}
      {[-1, 1].map((sign, pIdx) => (
        <mesh
          key={pIdx}
          geometry={SHARED_GEO.lowSphere}
          position={[sign * 0.115, 0.605, 0.21]}
          rotation={[0, sign * 0.22, sign * -0.68]}
          scale={[0.088, 0.115, 0.045]}
        >
          <meshPhysicalMaterial color="#0f172a" roughness={0.5} sheen={0.45} />
        </mesh>
      ))}

      {/* 3-Layer Glassy Expressive Eyes with Dual Catchlights */}
      <ExpressiveEye pos={[-0.108, 0.605, 0.245]} irisColor="#064e3b" eyeRadius={0.052} />
      <ExpressiveEye pos={[0.108, 0.605, 0.245]} irisColor="#064e3b" eyeRadius={0.052} />
    </group>
  );
});
BambooPandaSkin.displayName = 'BambooPandaSkin';
