import React from 'react';

/**
 * Modern Clean Studio Pedestal Platform with Pearlescent Acrylic Podium,
 * Glowing Dynamic LED Accent Ring, and Soft Ground Shadows.
 */
export const ModernStudioPedestal: React.FC<{ glowColor: string }> = ({ glowColor }) => (
  <group position={[0, -0.48, 0]}>
    {/* Clean White/Pearlescent Acrylic Podium */}
    <mesh position={[0, -0.035, 0]}>
      <cylinderGeometry args={[1.06, 1.15, 0.07, 48]} />
      <meshStandardMaterial color="#f8fafc" roughness={0.15} metalness={0.08} />
    </mesh>
    {/* Glossy Top Surface Plate */}
    <mesh position={[0, 0.002, 0]}>
      <cylinderGeometry args={[1.04, 1.06, 0.012, 48]} />
      <meshStandardMaterial color="#ffffff" roughness={0.06} metalness={0.12} />
    </mesh>
    {/* Luminous Neon Ring Inset */}
    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.92, 1.01, 48]} />
      <meshBasicMaterial color={glowColor} toneMapped={false} />
    </mesh>
    {/* Soft Ground Contact Shadow on the Podium */}
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.55, 32]} />
      <meshBasicMaterial color="#0f172a" transparent opacity={0.16} depthWrite={false} />
    </mesh>
    {/* Subtle Inner Core Shadow */}
    <mesh position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.32, 32]} />
      <meshBasicMaterial color="#0f172a" transparent opacity={0.25} depthWrite={false} />
    </mesh>
  </group>
);
