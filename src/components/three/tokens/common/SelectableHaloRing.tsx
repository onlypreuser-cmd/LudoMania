import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { SHARED_GEO } from '../geometries/tokenGeometries';

export const SelectableHaloRing: React.FC = React.memo(() => {
  const ringRef = useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (ringRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 5.5) * 0.1;
      ringRef.current.scale.set(pulse, pulse, 1);
      ringRef.current.rotation.z += delta * 1.0;
    }
  });

  return (
    <group
      ref={ringRef}
      position={[0, 0.025, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <mesh geometry={SHARED_GEO.selectRingOuter}>
        <meshBasicMaterial
          color="#facc15"
          side={THREE.DoubleSide}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh geometry={SHARED_GEO.selectRingInner}>
        <meshBasicMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
});
SelectableHaloRing.displayName = 'SelectableHaloRing';
