import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

/**
 * Procedural 3D Figurine: Bamboo Panda Master
 * Sculpted to match Reference Sheet 2, Row 1 (Front, Left, Top):
 * - Chubby, lovable baby chibi panda anatomy (pear head with puffy cheeks, plush ears, open smiling mouth with pink tongue)
 * - Symmetrical 38° tilted teardrop black eye patches with 3-layer big glossy anime eyes (emerald green iris, dual white catchlights)
 * - Wearing emerald-green silk cape/poncho draped over shoulders with gold border embroidery trim
 * - Central golden chest medallion with embossed Chinese "竹" calligraphy emblem
 * - Right paw holding an authentic natural segmented green bamboo stalk with nodes and sprouting leaves; gold wrist bangles
 * - Dual bamboo tube quiver backpack with fanning fresh emerald leaves
 * - Round ancient grey cobblestone pathway pedestal rimmed with green bamboo shoots and gold/green accents
 */
export const BambooPandaSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* 1. Ancient Grey Cobblestone Pedestal Rimmed with Green Bamboo Shoots & Gold Accent */}
      <group position={[0, -0.04, 0]}>
        {/* Bronze / Gilded Outer Collar Base */}
        <mesh geometry={SHARED_GEO.themeCollar} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#5e290b"
            metalness={0.9}
            roughness={0.2}
            clearcoat={0.9}
          />
        </mesh>
        {/* Polished Gold Foundation Ring */}
        <mesh geometry={SHARED_GEO.collarTorus} position={[0, 0.05, 0]} scale={1.22}>
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.12} />
        </mesh>
        {/* Ancient Grey Cobblestone Top Plate */}
        <mesh geometry={SHARED_GEO.cobblestonePlate} position={[0, 0.045, 0]}>
          <meshPhysicalMaterial
            color="#475569"
            roughness={0.8}
            clearcoat={0.15}
          />
        </mesh>
        {/* Natural Segmented Green Bamboo Rim Ring Around Pedestal */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.052, 0]}
          scale={[1.14, 1.14, 0.95]}
        >
          <meshPhysicalMaterial
            color="#15803d"
            roughness={0.28}
            clearcoat={0.8}
          />
        </mesh>
        {/* Fresh Sprouting Bamboo Leaves Framing the Perimeter */}
        {[0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((ang, lIdx) => (
          <mesh
            key={lIdx}
            geometry={SHARED_GEO.bambooLeaf}
            position={[Math.sin(ang) * 0.32, 0.065, Math.cos(ang) * 0.32]}
            rotation={[1.1, ang, -0.3]}
            scale={[1.15, 1.25, 1.0]}
          >
            <meshPhysicalMaterial
              color={lIdx % 2 === 0 ? '#15803d' : '#22c55e'}
              roughness={0.28}
              clearcoat={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* 2. Plump Chubby Baby Panda Body & Seated Black Paws */}
      <group position={[0, 0.21, -0.01]}>
        {/* Dark Fluffy Body Base */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.265, 0.235, 0.245]} castShadow>
          <meshPhysicalMaterial
            color="#1e293b"
            roughness={0.52}
            clearcoat={0.2}
            sheen={0.55}
          />
        </mesh>
        {/* Big Rounded White Tummy / Belly Patch */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, -0.01, 0.075]}
          scale={[0.215, 0.185, 0.195]}
        >
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.46}
            clearcoat={0.3}
            sheen={0.65}
          />
        </mesh>
      </group>

      {/* Seated Chubby Black Front/Hind Paws with Claws */}
      {[-0.13, 0.13].map((xFoot, fIdx) => (
        <group key={fIdx} position={[xFoot, 0.07, 0.19]}>
          <mesh
            geometry={SHARED_GEO.lowSphere}
            scale={[0.09, 0.072, 0.098]}
            castShadow
          >
            <meshPhysicalMaterial color="#0f172a" roughness={0.52} />
          </mesh>
          {/* Subtle Soft Toe Pad Indentations */}
          {[-0.032, 0, 0.032].map((tx, tIdx) => (
            <mesh
              key={tIdx}
              geometry={SHARED_GEO.lowSphere}
              position={[tx, 0.02, 0.088]}
              scale={[0.019, 0.019, 0.014]}
            >
              <meshStandardMaterial color="#334155" roughness={0.45} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 3. Emerald-Green Silk Cape / Poncho with Gold Embroidery Trim */}
      <group position={[0, 0.22, 0]}>
        {/* Silk Cape Mantle Draped Over Shoulders */}
        <mesh
          geometry={SHARED_GEO.unitSphere}
          position={[0, 0.02, -0.05]}
          scale={[0.28, 0.225, 0.225]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#047857"
            roughness={0.35}
            clearcoat={0.65}
            sheen={0.85}
            sheenColor="#34d399"
          />
        </mesh>
        {/* Golden Lapel Trim Crossings */}
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[-0.068, 0.03, 0.205]}
          rotation={[0.3, 0.22, -0.65]}
          scale={[0.016, 0.24, 0.008]}
        >
          <meshStandardMaterial color="#facc15" metalness={0.92} roughness={0.12} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.unitCylinder}
          position={[0.068, 0.03, 0.205]}
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

        {/* Central Golden Medallion with Embossed Chinese "竹" Calligraphy Emblem */}
        <group position={[0, -0.008, 0.238]}>
          {/* Raised Polished Gold Outer Medallion Bezel */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.064, 0.064, 0.018]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.08} />
          </mesh>
          {/* Inner Dark Lacquer Inlay Disc */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, 0, 0.008]}
            scale={[0.046, 0.046, 0.012]}
          >
            <meshPhysicalMaterial color="#1c1917" roughness={0.1} clearcoat={1} />
          </mesh>
          {/* Embossed Golden "竹" Character Calligraphy Strokes */}
          {/* Left Bamboo Stem */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[-0.014, -0.002, 0.015]}
            scale={[0.004, 0.036, 0.004]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.94} roughness={0.08} />
          </mesh>
          {/* Right Bamboo Stem */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0.014, -0.006, 0.015]}
            scale={[0.004, 0.034, 0.004]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.94} roughness={0.08} />
          </mesh>
          {/* Left Leaf Stroke */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[-0.014, 0.015, 0.015]}
            rotation={[0, 0, -0.42]}
            scale={[0.003, 0.018, 0.003]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.94} roughness={0.08} />
          </mesh>
          {/* Right Leaf Stroke */}
          <mesh
            geometry={SHARED_GEO.unitCylinder}
            position={[0.014, 0.015, 0.015]}
            rotation={[0, 0, -0.42]}
            scale={[0.003, 0.018, 0.003]}
          >
            <meshStandardMaterial color="#fde047" metalness={0.94} roughness={0.08} />
          </mesh>
        </group>
      </group>

      {/* 4. Chubby Arms with Gold Wrist Bangles */}
      {/* Right Arm: Raised Paw Firmly Gripping Upright Bamboo Stalk */}
      <group position={[-0.18, 0.26, 0.12]} rotation={[0.4, 0.35, 0.5]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[1.1, 1.05, 1.1]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.52} />
        </mesh>
        {/* Polished Gold Wrist Bangle */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.08, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.52}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
      </group>
      {/* Left Arm: Relaxed Resting on Lap/Poncho */}
      <group position={[0.18, 0.24, 0.14]} rotation={[0.2, -0.4, -0.55]}>
        <mesh geometry={SHARED_GEO.capsuleLimb} scale={[1.05, 1.0, 1.05]} castShadow>
          <meshPhysicalMaterial color="#0f172a" roughness={0.52} />
        </mesh>
        {/* Polished Gold Wrist Bangle */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, -0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.52}
        >
          <meshStandardMaterial color="#fbbf24" metalness={0.94} roughness={0.1} />
        </mesh>
      </group>

      {/* 5. Authentic Natural Handheld Segmented Bamboo Stalk */}
      <group position={[-0.24, 0.34, 0.18]} rotation={[0.08, 0.05, 0.1]}>
        {/* Main Bamboo Cane Trunk */}
        <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.026, 0.74, 0.026]} castShadow>
          <meshPhysicalMaterial
            color="#15803d"
            roughness={0.22}
            clearcoat={0.85}
          />
        </mesh>
        {/* Raised Bamboo Segment Node Rings */}
        {[-0.24, -0.06, 0.12, 0.28].map((ny, nIdx) => (
          <mesh
            key={nIdx}
            geometry={SHARED_GEO.collarTorus}
            position={[0, ny, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.165}
          >
            <meshStandardMaterial color="#166534" roughness={0.3} />
          </mesh>
        ))}
        {/* Hollow Cut Bamboo Cane Top Rim */}
        <mesh
          geometry={SHARED_GEO.collarTorus}
          position={[0, 0.37, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={0.155}
        >
          <meshStandardMaterial color="#14532d" roughness={0.4} />
        </mesh>
        {/* Sprouting Fresh Green Leaves on Stalk */}
        {[
          { y: 0.14, rz: -0.68, rx: 0.2, s: 1.15 },
          { y: 0.24, rz: 0.72, rx: -0.2, s: 1.05 },
          { y: 0.33, rz: -0.85, rx: 0.12, s: 0.95 },
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

      {/* 6. Dual Bamboo Tube Quiver on Back with Fanning Fresh Leaves */}
      <group position={[0.12, 0.35, -0.16]} rotation={[0.15, -0.2, -0.15]}>
        {/* Twin Green Bamboo Quiver Tubes */}
        {[-0.042, 0.042].map((tx, qIdx) => (
          <group key={qIdx} position={[tx, 0, 0]}>
            <mesh geometry={SHARED_GEO.unitCylinder} scale={[0.035, 0.46, 0.035]} castShadow>
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
        {/* Fanning Emerald Leaves from Quiver and Cape */}
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

      {/* 7. Adorable Chubby Baby Panda Head */}
      <group position={[0, 0.55, 0.02]}>
        {/* Giant Rounded White Chibi Head */}
        <mesh geometry={SHARED_GEO.unitSphere} scale={[0.305, 0.265, 0.275]} castShadow>
          <meshPhysicalMaterial
            color="#ffffff"
            roughness={0.38}
            clearcoat={0.35}
            sheen={0.7}
            sheenColor="#ffffff"
          />
        </mesh>
        {/* Chubby Puffy Cheeks Wider than Forehead */}
        {[-0.155, 0.155].map((cx, cIdx) => (
          <mesh
            key={cIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[cx, -0.03, 0.13]}
            scale={[0.135, 0.105, 0.115]}
          >
            <meshPhysicalMaterial color="#ffffff" roughness={0.4} sheen={0.65} />
          </mesh>
        ))}

        {/* Plush Black Panda Ears with Rounded Contours */}
        {[-0.21, 0.21].map((ex, eIdx) => {
          const sign = eIdx === 0 ? 1 : -1;
          return (
            <group
              key={eIdx}
              position={[ex, 0.19, 0.01]}
              rotation={[0, 0, sign * 0.35]}
            >
              {/* Outer Plush Black Ear Shell */}
              <mesh geometry={SHARED_GEO.lowSphere} scale={[0.1, 0.115, 0.07]} castShadow>
                <meshPhysicalMaterial color="#0f172a" roughness={0.52} clearcoat={0.2} />
              </mesh>
              {/* Recessed Inner Ear Hollow */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, 0, 0.022]}
                scale={[0.07, 0.082, 0.035]}
              >
                <meshStandardMaterial color="#1e293b" roughness={0.65} />
              </mesh>
            </group>
          );
        })}

        {/* Soft White Muzzle & Glossy Jet-Black Button Nose */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, -0.03, 0.225]}
          scale={[0.115, 0.082, 0.088]}
        >
          <meshPhysicalMaterial color="#ffffff" roughness={0.36} />
        </mesh>
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[0, 0.005, 0.295]}
          scale={[0.042, 0.028, 0.026]}
        >
          <meshPhysicalMaterial color="#090d16" roughness={0.02} clearcoat={1} />
        </mesh>

        {/* Open Cheerful Smiling Mouth with Pink Tongue Inside */}
        <group position={[0, -0.045, 0.285]}>
          {/* Mouth Cavity */}
          <mesh geometry={SHARED_GEO.lowSphere} scale={[0.034, 0.024, 0.018]}>
            <meshBasicMaterial color="#1e1b18" />
          </mesh>
          {/* Cute Little Pink Tongue */}
          <mesh
            geometry={SHARED_GEO.lowSphere}
            position={[0, -0.008, 0.008]}
            scale={[0.022, 0.012, 0.012]}
          >
            <meshStandardMaterial color="#fb7185" roughness={0.3} />
          </mesh>
        </group>

        {/* Rosy Warrior Blush Cheeks */}
        {[-0.155, 0.155].map((bx, bIdx) => (
          <mesh
            key={bIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[bx, -0.04, 0.195]}
            scale={[0.048, 0.026, 0.022]}
          >
            <meshStandardMaterial color="#fda4af" roughness={0.55} />
          </mesh>
        ))}

        {/* Symmetrical 38° Tilted Teardrop Black Eye Patches */}
        {[-1, 1].map((sign, pIdx) => (
          <mesh
            key={pIdx}
            geometry={SHARED_GEO.lowSphere}
            position={[sign * 0.115, 0.055, 0.21]}
            rotation={[0, sign * 0.22, sign * -0.68]}
            scale={[0.09, 0.118, 0.045]}
          >
            <meshPhysicalMaterial color="#0f172a" roughness={0.52} sheen={0.45} />
          </mesh>
        ))}

        {/* 3-Layer Big Glossy Anime Eyes with Emerald Green Iris & White Catchlights */}
        {[-0.108, 0.108].map((ex, eIdx) => {
          const sideSign = eIdx === 0 ? -1 : 1;
          const eyeRadius = 0.054;
          return (
            <group key={eIdx} position={[ex, 0.055, 0.245]}>
              {/* Layer 1: Dark Sclera / Cornea Base */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                scale={[eyeRadius, eyeRadius * 1.08, eyeRadius * 0.75]}
              >
                <meshStandardMaterial color="#090d16" roughness={0.1} />
              </mesh>
              {/* Layer 2: Vibrant Glowing Emerald-Green Iris Crescent */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, -eyeRadius * 0.12, eyeRadius * 0.35]}
                scale={[eyeRadius * 0.78, eyeRadius * 0.82, eyeRadius * 0.45]}
              >
                <meshStandardMaterial
                  color="#059669"
                  emissive="#10b981"
                  emissiveIntensity={1.2}
                  roughness={0.08}
                />
              </mesh>
              {/* Deep Black Pupil */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[0, eyeRadius * 0.02, eyeRadius * 0.52]}
                scale={[eyeRadius * 0.45, eyeRadius * 0.48, eyeRadius * 0.25]}
              >
                <meshBasicMaterial color="#000000" />
              </mesh>
              {/* Primary Large Specular Catchlight (Upper-Inner Quadrant) */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[-sideSign * eyeRadius * 0.28, eyeRadius * 0.32, eyeRadius * 0.68]}
                scale={eyeRadius * 0.32}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
              {/* Secondary Micro Specular Catchlight (Lower-Outer Quadrant) */}
              <mesh
                geometry={SHARED_GEO.lowSphere}
                position={[sideSign * eyeRadius * 0.25, -eyeRadius * 0.25, eyeRadius * 0.65]}
                scale={eyeRadius * 0.16}
              >
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
});
BambooPandaSkin.displayName = 'BambooPandaSkin';
