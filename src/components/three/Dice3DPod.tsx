import { Canvas } from '@react-three/fiber';
import React, { Suspense } from 'react';
import { DICE_SKINS } from '../../engine/boardConfig';
import { DiceSkinId } from '../../types/game';
import {
  DICE_FACE_PIPS,
  FACE_EULER_MAP,
  PipPositions,
  SHARED_DICE_GEO,
  getDiceCubeConfig,
  getDicePipGeometry,
} from './dice/diceGeometries';
import {
  POD_CONTAINER_CLASSES,
  SKIN_PBR_MAP,
  SkinPBRProfile,
} from './dice/diceSkinProfiles';
import { PhysicsDieMesh } from './dice/PhysicsDieMesh';

export {
  DICE_FACE_PIPS,
  FACE_EULER_MAP,
  SHARED_DICE_GEO,
  SKIN_PBR_MAP,
  getDiceCubeConfig,
  getDicePipGeometry,
};
export type { PipPositions, SkinPBRProfile };

export interface Dice3DPodProps {
  skinId: DiceSkinId;
  value: number | null;
  lastRolledValue?: number | null;
  isRolling: boolean;
  canRoll: boolean;
  onTriggerRoll: () => void;
  onRollSettled?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export const Dice3DPod: React.FC<Dice3DPodProps> = React.memo(
  ({
    skinId,
    value,
    lastRolledValue,
    isRolling,
    canRoll,
    onTriggerRoll,
    onRollSettled,
    size = 'lg',
  }) => {
    const skin = DICE_SKINS.find((s) => s.id === skinId) ?? DICE_SKINS[0];
    const displayValue = value ?? lastRolledValue ?? 6;

    const sizeClasses =
      size === 'sm'
        ? 'w-16 h-16'
        : size === 'md'
        ? 'w-20 h-20'
        : 'w-24 h-24 sm:w-28 sm:h-28';

    const podPlatformClass =
      POD_CONTAINER_CLASSES[skin.podTheme] ??
      POD_CONTAINER_CLASSES['alabaster-brass'];

    return (
      <button
        type="button"
        disabled={!canRoll || isRolling}
        onClick={onTriggerRoll}
        aria-label="Roll 3D Dice"
        className={`relative ${sizeClasses} rounded-full flex items-center justify-center transition-transform duration-200 select-none ${
          canRoll && !isRolling
            ? 'cursor-pointer hover:scale-105 active:scale-95'
            : 'cursor-not-allowed opacity-90'
        }`}
      >
        {/* Soft Tactile Aura Ring */}
        <div
          className={`absolute -inset-1.5 rounded-full transition-opacity duration-300 ${
            canRoll ? 'opacity-100 animate-pulse' : 'opacity-20'
          }`}
          style={{
            background: `radial-gradient(circle, ${skin.edgeGlow}44 0%, rgba(251,191,36,0.12) 62%, transparent 78%)`,
            boxShadow: canRoll
              ? `0 0 16px 2px ${skin.edgeGlow}44, inset 0 0 8px #ffffff66`
              : 'none',
          }}
        />

        {/* Theme-Adaptive Tactile Pod Platform */}
        <div className={`relative w-full h-full rounded-full ${podPlatformClass} overflow-hidden transition-all duration-300`}>
          <Canvas
            dpr={[1, 1.25]}
            camera={{ position: [0, 2.25, 1.78], fov: 35 }}
            gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          >
            <ambientLight intensity={0.85} />
            <directionalLight position={[3, 5, 3]} intensity={1.5} />
            <directionalLight position={[-2, 1, -2]} intensity={0.35} color="#ffffff" />
            <Suspense fallback={null}>
              {/* Soft Zero-Cost Contact Disc Shadow */}
              <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.62, 24]} />
                <meshBasicMaterial color="#0f172a" transparent opacity={0.32} depthWrite={false} />
              </mesh>
              <PhysicsDieMesh
                skinId={skinId}
                value={displayValue}
                isRolling={isRolling}
                onSettled={onRollSettled}
              />
            </Suspense>
          </Canvas>

          {/* Numeric Value Pill Badge when settled */}
          {displayValue !== null && !isRolling && (
            <span className="absolute bottom-1 right-2 px-1.5 py-0.5 rounded-full bg-slate-900/85 text-amber-300 text-[11px] font-extrabold shadow">
              {displayValue}
            </span>
          )}
        </div>
      </button>
    );
  }
);

Dice3DPod.displayName = 'Dice3DPod';
