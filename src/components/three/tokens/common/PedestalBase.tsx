import React from 'react';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';
import { SHARED_GEO } from '../geometries/tokenGeometries';

interface PedestalBaseProps {
  color: PlayerColor;
  isSelected?: boolean;
}

export const PedestalBase: React.FC<PedestalBaseProps> = React.memo(({ color, isSelected }) => {
  const palette = COLOR_PALETTE[color];

  return (
    <>
      <mesh
        geometry={SHARED_GEO.pedestalBase}
        position={[0, 0.065, 0]}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={palette.threeHex}
          roughness={0.14}
          metalness={0.18}
          clearcoat={1}
          clearcoatRoughness={0.06}
          ior={1.5}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.pedestalInner}
        position={[0, 0.135, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.25}
          metalness={0.2}
        />
      </mesh>
      <mesh
        geometry={SHARED_GEO.pedestalRing}
        position={[0, 0.13, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={isSelected ? '#fde047' : '#fbbf24'}
          roughness={0.18}
          metalness={0.78}
        />
      </mesh>
    </>
  );
});
PedestalBase.displayName = 'PedestalBase';
