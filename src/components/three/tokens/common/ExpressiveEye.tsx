import React from 'react';
import { SHARED_GEO } from '../geometries/tokenGeometries';

interface ExpressiveEyeProps {
  pos: [number, number, number];
  irisColor?: string;
  eyeRadius?: number;
}

export const ExpressiveEye: React.FC<ExpressiveEyeProps> = React.memo(
  ({ pos, irisColor = '#1e1b18', eyeRadius = 0.042 }) => {
    const sideSign = pos[0] >= 0 ? 1 : -1;
    return (
      <group position={pos}>
        {/* Glossy Iris/Cornea */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          scale={[eyeRadius, eyeRadius * 1.08, eyeRadius * 0.75]}
        >
          <meshStandardMaterial
            color={irisColor}
            roughness={0.15}
            metalness={0.1}
          />
        </mesh>
        {/* Primary Top-Left Specular Catchlight Dot */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[
            -sideSign * eyeRadius * 0.28,
            eyeRadius * 0.32,
            eyeRadius * 0.68,
          ]}
          scale={eyeRadius * 0.32}
        >
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Secondary Micro Catchlight */}
        <mesh
          geometry={SHARED_GEO.lowSphere}
          position={[
            sideSign * eyeRadius * 0.25,
            -eyeRadius * 0.25,
            eyeRadius * 0.65,
          ]}
          scale={eyeRadius * 0.16}
        >
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    );
  }
);
ExpressiveEye.displayName = 'ExpressiveEye';
