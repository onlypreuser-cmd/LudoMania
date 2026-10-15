import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';

/**
 * High-Performance 2-Axis Turntable & Orbit Controller.
 * Operates purely on refs inside useFrame without triggering React component re-renders!
 * Supports:
 * - 360° Infinite Horizontal Spin (Yaw) with inertia flick physics & gentle idle spin.
 * - Vertical Tilt (Pitch, Up/Down) clamped so the user can inspect the top of horns,
 *   wings, face, and pedestal base without flipping upside down.
 */
export const TurntableController: React.FC<{
  rotationTargetRef: React.MutableRefObject<number>;
  rotationCurrentRef: React.MutableRefObject<number>;
  pitchTargetRef?: React.MutableRefObject<number>;
  pitchCurrentRef?: React.MutableRefObject<number>;
  isDraggingRef: React.MutableRefObject<boolean>;
  isAutoRotatingRef: React.MutableRefObject<boolean>;
  velocityRef: React.MutableRefObject<number>;
  children: React.ReactNode;
}> = ({
  rotationTargetRef,
  rotationCurrentRef,
  pitchTargetRef,
  pitchCurrentRef,
  isDraggingRef,
  isAutoRotatingRef,
  velocityRef,
  children,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // 1. Horizontal Momentum / Idle Spin
    if (!isDraggingRef.current) {
      if (Math.abs(velocityRef.current) > 0.0006) {
        rotationTargetRef.current += velocityRef.current;
        velocityRef.current *= 0.92; // smooth friction decay
      } else if (isAutoRotatingRef.current) {
        rotationTargetRef.current += delta * 0.55; // gentle idle spin
      }
    }

    // 2. High refresh rate smooth lerp interpolation for Yaw (Left/Right)
    rotationCurrentRef.current = THREE.MathUtils.lerp(
      rotationCurrentRef.current,
      rotationTargetRef.current,
      0.22
    );
    groupRef.current.rotation.y = rotationCurrentRef.current;

    // 3. Vertical Pitch (Up/Down Orbit)
    if (pitchTargetRef && pitchCurrentRef) {
      if (!isDraggingRef.current && isAutoRotatingRef.current) {
        // Slowly ease pitch back to neutral resting angle during idle
        pitchTargetRef.current = THREE.MathUtils.lerp(pitchTargetRef.current, 0, 0.04);
      }
      pitchCurrentRef.current = THREE.MathUtils.lerp(
        pitchCurrentRef.current,
        pitchTargetRef.current,
        0.22
      );
      groupRef.current.rotation.x = pitchCurrentRef.current;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};
