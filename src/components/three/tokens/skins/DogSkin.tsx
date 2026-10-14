import React from 'react';
import { ExpressiveEye } from '../common/ExpressiveEye';
import { SHARED_GEO } from '../geometries/tokenGeometries';
import { SkinComponentProps } from '../types';

export const DogSkin: React.FC<SkinComponentProps> = React.memo(() => {
  return (
    <group position={[0, 0.14, 0]}>
      {/* Plump Seated Shiba Torso */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.21, -0.01]}
        scale={[0.235, 0.22, 0.22]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#e58e26"
          roughness={0.62}
          metalness={0.0}
          clearcoat={0.12}
          sheen={0.65}
          sheenRoughness={0.75}
          sheenColor="#fde68a"
        />
      </mesh>
      {/* Cream-White Chest & Belly Fur Patch */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.19, 0.095]}
        scale={[0.165, 0.175, 0.135]}
      >
        <meshPhysicalMaterial
          color="#fffdf7"
          roughness={0.58}
          sheen={0.5}
          sheenColor="#ffffff"
        />
      </mesh>
      {/* Two Cute Cream-White Seated Front Paws */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.095, 0.055, 0.165]}
        scale={[0.072, 0.052, 0.088]}
        castShadow
      >
        <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.095, 0.055, 0.165]}
        scale={[0.072, 0.052, 0.088]}
        castShadow
      >
        <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
      </mesh>
      {/* Tucked Golden Hind Haunches */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.19, 0.11, -0.03]}
        scale={[0.075, 0.105, 0.11]}
      >
        <meshPhysicalMaterial
          color="#e58e26"
          roughness={0.65}
          sheen={0.5}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.19, 0.11, -0.03]}
        scale={[0.075, 0.105, 0.11]}
      >
        <meshPhysicalMaterial
          color="#e58e26"
          roughness={0.65}
          sheen={0.5}
        />
      </mesh>
      {/* Fluffy Curled Shiba Tail at Back */}
      <mesh
        geometry={SHARED_GEO.tailTorus}
        position={[0, 0.23, -0.22]}
        rotation={[0.3, Math.PI / 2, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#e58e26"
          roughness={0.65}
          sheen={0.6}
          sheenColor="#fef3c7"
        />
      </mesh>

      {/* Cozy Red Knitted Scarf + Side Knot & Hanging Tails */}
      <mesh
        geometry={SHARED_GEO.scarfTorus}
        position={[0, 0.355, 0.01]}
        rotation={[Math.PI / 2 + 0.08, 0, 0]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#dc2626"
          roughness={0.68}
          sheen={0.55}
          sheenColor="#fca5a5"
        />
      </mesh>
      {/* Scarf Side Knot & 2 Hanging Ribbons */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.18, 0.33, 0.11]}
        scale={[0.062, 0.058, 0.062]}
      >
        <meshPhysicalMaterial color="#b91c1c" roughness={0.65} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.21, 0.23, 0.13]}
        rotation={[0.15, 0, -0.32]}
        scale={[0.68, 0.72, 0.5]}
        castShadow
      >
        <meshPhysicalMaterial color="#dc2626" roughness={0.65} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.capsuleLimb}
        position={[0.16, 0.22, 0.16]}
        rotation={[0.25, 0, -0.12]}
        scale={[0.62, 0.65, 0.48]}
        castShadow
      >
        <meshPhysicalMaterial color="#dc2626" roughness={0.65} />
      </mesh>

      {/* Wide Sculpted Shiba Head (Chubby Cheeks!) */}
      <mesh
        geometry={SHARED_GEO.unitSphere}
        position={[0, 0.58, 0.01]}
        scale={[0.285, 0.255, 0.25]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#e58e26"
          roughness={0.58}
          clearcoat={0.12}
          sheen={0.65}
          sheenRoughness={0.75}
          sheenColor="#fde68a"
        />
      </mesh>
      {/* Plump Cream-White Lower Cheeks (Urajiro markings) */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.125, 0.51, 0.115]}
        scale={[0.145, 0.115, 0.135]}
      >
        <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.125, 0.51, 0.115]}
        scale={[0.145, 0.115, 0.135]}
      >
        <meshPhysicalMaterial color="#fffdf7" roughness={0.55} />
      </mesh>
      {/* Sculpted Cream-White Snout / Muzzle */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.515, 0.185]}
        scale={[0.135, 0.105, 0.115]}
      >
        <meshPhysicalMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* Wet Glossy Black Nose */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.555, 0.285]}
        scale={[0.044, 0.034, 0.034]}
      >
        <meshPhysicalMaterial
          color="#111827"
          roughness={0.02}
          clearcoat={1}
          ior={1.45}
        />
      </mesh>
      {/* Happy Pink Tongue Peek */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0, 0.475, 0.26]}
        scale={[0.036, 0.026, 0.03]}
      >
        <meshPhysicalMaterial
          color="#fb7185"
          roughness={0.25}
          clearcoat={0.6}
        />
      </mesh>
      {/* Signature Shiba Cream Eyebrow Dots (Maru-Mayuge) */}
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[-0.085, 0.675, 0.215]}
        rotation={[0, 0, -0.25]}
        scale={[0.032, 0.02, 0.02]}
      >
        <meshStandardMaterial color="#fffdf7" roughness={0.5} />
      </mesh>
      <mesh
        geometry={SHARED_GEO.lowSphere}
        position={[0.085, 0.675, 0.215]}
        rotation={[0, 0, 0.25]}
        scale={[0.032, 0.02, 0.02]}
      >
        <meshStandardMaterial color="#fffdf7" roughness={0.5} />
      </mesh>
      {/* Expressive Dark Brown Shiba Eyes with Specular Catchlights */}
      <ExpressiveEye pos={[-0.105, 0.595, 0.22]} irisColor="#271306" eyeRadius={0.044} />
      <ExpressiveEye pos={[0.105, 0.595, 0.22]} irisColor="#271306" eyeRadius={0.044} />

      {/* Plush Triangular Shiba Ears with Pink Inner Hollows */}
      <group
        position={[-0.165, 0.79, -0.01]}
        rotation={[0.12, 0.1, 0.26]}
      >
        <mesh
          geometry={SHARED_GEO.earCone}
          scale={[1.05, 0.95, 0.62]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#e58e26"
            roughness={0.62}
            sheen={0.5}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, -0.01, 0.025]}
          scale={[0.62, 0.68, 0.35]}
        >
          <meshStandardMaterial color="#fda4af" roughness={0.55} />
        </mesh>
      </group>
      <group
        position={[0.165, 0.79, -0.01]}
        rotation={[0.12, -0.1, -0.26]}
      >
        <mesh
          geometry={SHARED_GEO.earCone}
          scale={[1.05, 0.95, 0.62]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#e58e26"
            roughness={0.62}
            sheen={0.5}
          />
        </mesh>
        <mesh
          geometry={SHARED_GEO.earCone}
          position={[0, -0.01, 0.025]}
          scale={[0.62, 0.68, 0.35]}
        >
          <meshStandardMaterial color="#fda4af" roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
});
DogSkin.displayName = 'DogSkin';
