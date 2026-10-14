import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

/**
 * High-Performance Turntable Controller.
 * Operates purely on refs inside useFrame without triggering React component re-renders!
 * Supports inertia flick physics and gentle idle auto-rotation.
 */
export const TurntableController: React.FC<{
  rotationTargetRef: React.MutableRefObject<number>;
  rotationCurrentRef: React.MutableRefObject<number>;
  isDraggingRef: React.MutableRefObject<boolean>;
  isAutoRotatingRef: React.MutableRefObject<boolean>;
  velocityRef: React.MutableRefObject<number>;
  children: React.ReactNode;
}> = ({
  rotationTargetRef,
  rotationCurrentRef,
  isDraggingRef,
  isAutoRotatingRef,
  velocityRef,
  children,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (!isDraggingRef.current) {
      if (Math.abs(velocityRef.current) > 0.0006) {
        rotationTargetRef.current += velocityRef.current;
        velocityRef.current *= 0.92; // smooth friction decay
      } else if (isAutoRotatingRef.current) {
        rotationTargetRef.current += delta * 0.55; // gentle idle spin
      }
    }

    // High refresh rate smooth lerp interpolation
    rotationCurrentRef.current = THREE.MathUtils.lerp(
      rotationCurrentRef.current,
      rotationTargetRef.current,
      0.22
    );

    groupRef.current.rotation.y = rotationCurrentRef.current;
  });

  return <group ref={groupRef}>{children}</group>;
};
