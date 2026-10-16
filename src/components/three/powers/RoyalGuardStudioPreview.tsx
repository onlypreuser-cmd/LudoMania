import { Canvas, useFrame } from '@react-three/fiber';
import { RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
import React, { Suspense, useCallback, useRef } from 'react';
import * as THREE from 'three';
import { PlayerColor } from '../../../types/game';
import { RoyalGuard3DModel } from './RoyalGuard3DModel';

interface RoyalGuardStudioPreviewProps {
  color: PlayerColor;
  hitsRemaining: 1 | 2;
  activeGlowColor: string;
}

/**
 * High-performance 2-Axis Turntable & Orbit Controller for Royal Guard Studio.
 * Zero React re-renders during drag gestures.
 */
const GuardTurntable: React.FC<{
  rotationTargetRef: React.MutableRefObject<number>;
  rotationCurrentRef: React.MutableRefObject<number>;
  pitchTargetRef: React.MutableRefObject<number>;
  pitchCurrentRef: React.MutableRefObject<number>;
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

    // Horizontal Momentum & Idle Spin
    if (!isDraggingRef.current) {
      if (Math.abs(velocityRef.current) > 0.0006) {
        rotationTargetRef.current += velocityRef.current;
        velocityRef.current *= 0.92;
      } else if (isAutoRotatingRef.current) {
        rotationTargetRef.current += delta * 0.45;
      }
    }

    // Smooth Lerp for Horizontal Yaw
    rotationCurrentRef.current = THREE.MathUtils.lerp(
      rotationCurrentRef.current,
      rotationTargetRef.current,
      0.2
    );
    groupRef.current.rotation.y = rotationCurrentRef.current;

    // Smooth Lerp for Vertical Pitch
    if (!isDraggingRef.current && isAutoRotatingRef.current) {
      pitchTargetRef.current = THREE.MathUtils.lerp(pitchTargetRef.current, 0, 0.04);
    }
    pitchCurrentRef.current = THREE.MathUtils.lerp(
      pitchCurrentRef.current,
      pitchTargetRef.current,
      0.18
    );
    groupRef.current.rotation.x = pitchCurrentRef.current;
  });

  return <group ref={groupRef}>{children}</group>;
};

export const RoyalGuardStudioPreview: React.FC<RoyalGuardStudioPreviewProps> = ({
  color,
  hitsRemaining,
  activeGlowColor,
}) => {
  const rotationTargetRef = useRef(0);
  const rotationCurrentRef = useRef(0);
  const pitchTargetRef = useRef(0);
  const pitchCurrentRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isAutoRotatingRef = useRef(true);
  const lastPointerXRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const velocityRef = useRef(0);
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const restartAutoRotate = useCallback(() => {
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setTimeout(() => {
      isAutoRotatingRef.current = true;
    }, 2500);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingRef.current = true;
    isAutoRotatingRef.current = false;
    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;
    velocityRef.current = 0;
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    const deltaY = e.clientY - lastPointerYRef.current;

    const stepX = deltaX * 0.026;
    rotationTargetRef.current += stepX;
    velocityRef.current = stepX;

    const stepY = deltaY * 0.016;
    pitchTargetRef.current = THREE.MathUtils.clamp(
      pitchTargetRef.current + stepY,
      -0.45,
      0.45
    );

    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture may have already been released
      }
      restartAutoRotate();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden border border-amber-300/60 shadow-[0_12px_32px_rgba(69,26,3,0.12),inset_0_1px_2px_rgba(255,255,255,0.9)] cursor-grab active:cursor-grabbing select-none"
      style={{
        background: 'radial-gradient(circle at 50% 35%, #ffffff 0%, #fef3c7 50%, #fde68a 100%)',
      }}
    >
      {/* Warm Ambient Color Bloom */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45 transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeGlowColor}50 0%, transparent 68%)`,
        }}
      />

      {/* 360 Orbit Hint Pill */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 border border-amber-200 text-[10px] font-extrabold text-amber-950 pointer-events-none flex items-center gap-1.5 shadow-sm">
        <RotateCcw
          className="w-3.5 h-3.5 text-amber-600 animate-spin"
          style={{ animationDuration: '6s' }}
        />
        <span>Drag to Orbit 360° & Tilt</span>
      </div>

      {/* Durability Status Pill Badge */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/85 text-[10px] font-black text-white pointer-events-none flex items-center gap-1.5 shadow">
        {hitsRemaining === 2 ? (
          <>
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300">Pristine (2/2 Hearts)</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300">Damaged (1/2 Heart • Cracked)</span>
          </>
        )}
      </div>

      {/* 3D WebGL Studio Canvas */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.45, 3.2], fov: 32 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 7, 4]} intensity={1.8} castShadow />
        <directionalLight position={[-3, -1, -2]} intensity={0.4} color="#fef08a" />
        <pointLight position={[0, 3, 2]} intensity={0.6} color="#fbbf24" />

        <Suspense fallback={null}>
          <GuardTurntable
            rotationTargetRef={rotationTargetRef}
            rotationCurrentRef={rotationCurrentRef}
            pitchTargetRef={pitchTargetRef}
            pitchCurrentRef={pitchCurrentRef}
            isDraggingRef={isDraggingRef}
            isAutoRotatingRef={isAutoRotatingRef}
            velocityRef={velocityRef}
          >
            <group position={[0, -0.32, 0]}>
              <RoyalGuard3DModel
                color={color}
                scale={1.38}
                hitsRemaining={hitsRemaining}
                animated={true}
              />
            </group>
          </GuardTurntable>
        </Suspense>
      </Canvas>
    </div>
  );
};
