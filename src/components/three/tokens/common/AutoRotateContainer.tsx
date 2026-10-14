import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

export const AutoRotateContainer: React.FC<{ children: React.ReactNode }> = React.memo(({ children }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 1.05;
    }
  });
  return <group ref={groupRef}>{children}</group>;
});
AutoRotateContainer.displayName = 'AutoRotateContainer';
