import { Canvas } from '@react-three/fiber';
import { Dices, Play, RotateCcw } from 'lucide-react';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { DiceSkinId, PlayerColor, TokenSkinId } from '../../../../types/game';
import { Token3DModel } from '../../../three/Token3DModel';
import { ModernStudioPedestal } from './ModernStudioPedestal';
import { StudioDie3DMesh } from './StudioDie3DMesh';
import { TurntableController } from './TurntableController';

interface SkinStudioPreview3DProps {
  currentMode: 'token' | 'dice';
  activeSkinId: string;
  activeColor: PlayerColor;
  activeGlowColor: string;
  testDiceValue: number;
  isTestRolling: boolean;
  isTestHopping: boolean;
  onTriggerTestHop: () => void;
  onTriggerTestRoll: () => void;
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: (e: React.PointerEvent) => void;
  rotationTargetRef: React.MutableRefObject<number>;
  rotationCurrentRef: React.MutableRefObject<number>;
  pitchTargetRef?: React.MutableRefObject<number>;
  pitchCurrentRef?: React.MutableRefObject<number>;
  isDraggingCanvasRef: React.MutableRefObject<boolean>;
  isAutoRotatingRef: React.MutableRefObject<boolean>;
  velocityRef: React.MutableRefObject<number>;
  tokenContainerRef: React.RefObject<THREE.Group | null>;
}

export const SkinStudioPreview3D: React.FC<SkinStudioPreview3DProps> = ({
  currentMode,
  activeSkinId,
  activeColor,
  activeGlowColor,
  testDiceValue,
  isTestRolling,
  isTestHopping,
  onTriggerTestHop,
  onTriggerTestRoll,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  rotationTargetRef,
  rotationCurrentRef,
  pitchTargetRef,
  pitchCurrentRef,
  isDraggingCanvasRef,
  isAutoRotatingRef,
  velocityRef,
  tokenContainerRef,
}) => {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className="relative mt-3 w-full h-64 sm:h-72 rounded-3xl overflow-hidden border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,0.8)] cursor-grab active:cursor-grabbing select-none"
      style={{
        background: 'radial-gradient(circle at 50% 40%, #ffffff 0%, #f1f5f9 65%, #e2e8f0 100%)',
      }}
    >
      {/* Soft Atmospheric Color Bloom behind the figurine */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeGlowColor}44 0%, transparent 65%)`,
        }}
      />

      {/* 360 Drag Pill Hint */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/85 border border-slate-200/80 text-[10px] font-extrabold text-slate-700 pointer-events-none flex items-center gap-1.5 shadow-sm">
        <RotateCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Drag to Orbit 360° & Tilt</span>
      </div>

      {/* Action Floating Test Button */}
      <div className="absolute bottom-3 right-3 z-10">
        {currentMode === 'token' ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTriggerTestHop();
            }}
            disabled={isTestHopping}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black shadow-md shadow-blue-500/25 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
            <span>{isTestHopping ? 'Hopping...' : 'Test Hop'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTriggerTestRoll();
            }}
            disabled={isTestRolling}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md shadow-emerald-500/25 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-amber-300" />
            <span>{isTestRolling ? 'Rolling...' : `Roll (${testDiceValue})`}</span>
          </button>
        )}
      </div>

      {/* Single Dedicated High-FPS 3D Studio Canvas */}
      {/* Calibrated Camera Distance & Framing: Zero Head Clipping (+25% Headroom) */}
      <Canvas
        dpr={[1, 1.5]}
        camera={
          currentMode === 'token'
            ? { position: [0, 0.42, 3.8], fov: 36 }
            : { position: [0, 0.95, 2.6], fov: 34 }
        }
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 6, 4]} intensity={1.5} />
        <directionalLight position={[-3, -1, -3]} intensity={0.35} color="#ffffff" />
        <pointLight position={[-2, 3, 2]} intensity={0.5} color={activeGlowColor} />

        <Suspense fallback={null}>
          <TurntableController
            rotationTargetRef={rotationTargetRef}
            rotationCurrentRef={rotationCurrentRef}
            pitchTargetRef={pitchTargetRef}
            pitchCurrentRef={pitchCurrentRef}
            isDraggingRef={isDraggingCanvasRef}
            isAutoRotatingRef={isAutoRotatingRef}
            velocityRef={velocityRef}
          >
            {/* Modern Clean Studio Pedestal */}
            <ModernStudioPedestal glowColor={activeGlowColor} />

            {currentMode === 'token' ? (
              <group
                ref={tokenContainerRef as React.RefObject<THREE.Group>}
                position={[0, -0.40, 0]}
              >
                <Token3DModel
                  skin={activeSkinId as TokenSkinId}
                  color={activeColor}
                  scale={1.22}
                  autoRotatePreview={false}
                />
              </group>
            ) : (
              <StudioDie3DMesh
                skinId={activeSkinId as DiceSkinId}
                value={testDiceValue}
                isRolling={isTestRolling}
              />
            )}
          </TurntableController>
        </Suspense>
      </Canvas>
    </div>
  );
};
