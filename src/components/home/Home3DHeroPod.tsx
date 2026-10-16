import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { Eye, Palette, RotateCcw, Sparkles } from 'lucide-react';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';
import { COLOR_PALETTE, DICE_SKINS, TOKEN_SKINS } from '../../engine/boardConfig';
import { useProfileStore } from '../../store/useProfileStore';
import { DiceSkinId, PlayerColor, TokenSkinId } from '../../types/game';
import { haptics } from '../../utils/haptics';
import { ModernStudioPedestal } from '../modals/skinPicker/preview/ModernStudioPedestal';
import { StudioDie3DMesh } from '../modals/skinPicker/preview/StudioDie3DMesh';
import { TurntableController } from '../modals/skinPicker/preview/TurntableController';
import { Token3DModel } from '../three/Token3DModel';

interface Home3DHeroPodProps {
  onOpenCustomize?: () => void;
  className?: string;
}

/**
 * Interactive 3D Hero Pod Component for LudoMania Home Page.
 * Displays the user's equipped 3D token figurine and 3D physics die on a
 * luminous studio pedestal with soft underglow, 360° touch/mouse orbit,
 * idle turntable rotation, and interactive tap-to-hop & roll animations.
 */
export const Home3DHeroPod: React.FC<Home3DHeroPodProps> = ({
  onOpenCustomize,
  className = '',
}) => {
  const navigate = useNavigate();
  const selectedTokenSkin = useProfileStore((s) => s.selectedTokenSkin);
  const selectedDiceSkin = useProfileStore((s) => s.selectedDiceSkin);
  const preferredColor = useProfileStore((s) => s.preferredColor) || 'blue';

  const [testDiceValue, setTestDiceValue] = useState(6);
  const [isTestRolling, setIsTestRolling] = useState(false);
  const [isHopping, setIsHopping] = useState(false);

  // High-performance zero-rerender orbit turntable refs
  const rotationTargetRef = useRef(0);
  const rotationCurrentRef = useRef(0);
  const pitchTargetRef = useRef(0);
  const pitchCurrentRef = useRef(0);
  const isDraggingCanvasRef = useRef(false);
  const isAutoRotatingRef = useRef(true);
  const lastPointerXRef = useRef(0);
  const lastPointerYRef = useRef(0);
  const velocityRef = useRef(0);
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Three.js groups for tap-to-react physics
  const tokenGroupRef = useRef<THREE.Group>(null);
  const sceneRootRef = useRef<THREE.Group>(null);

  const glowColor = useMemo(
    () => COLOR_PALETTE[preferredColor as PlayerColor]?.primary || '#3b82f6',
    [preferredColor]
  );

  const tokenMeta = useMemo(
    () => TOKEN_SKINS.find((t) => t.id === selectedTokenSkin) ?? TOKEN_SKINS[0],
    [selectedTokenSkin]
  );

  const diceMeta = useMemo(
    () => DICE_SKINS.find((d) => d.id === selectedDiceSkin) ?? DICE_SKINS[0],
    [selectedDiceSkin]
  );

  // Resume auto-rotation after 2.2 seconds of inactivity
  const restartAutoRotate = useCallback(() => {
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setTimeout(() => {
      isAutoRotatingRef.current = true;
    }, 2200);
  }, []);

  // Pointer drag events on canvas viewport
  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingCanvasRef.current = true;
    isAutoRotatingRef.current = false;
    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;
    velocityRef.current = 0;
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCanvasRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    const deltaY = e.clientY - lastPointerYRef.current;

    const stepX = deltaX * 0.026;
    rotationTargetRef.current += stepX;
    velocityRef.current = stepX;

    const stepY = deltaY * 0.014;
    pitchTargetRef.current = Math.max(
      -0.3,
      Math.min(0.42, pitchTargetRef.current + stepY)
    );

    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isDraggingCanvasRef.current = false;
    restartAutoRotate();
  };

  // Fun interactive Token Hop Animation
  const handleTriggerHop = useCallback(() => {
    if (isHopping || !tokenGroupRef.current) return;
    setIsHopping(true);
    soundManager.play('token_hop', 1.05);
    haptics.stepHop();

    const grp = tokenGroupRef.current;
    gsap.killTweensOf(grp.position);
    gsap.killTweensOf(grp.scale);
    gsap.killTweensOf(grp.rotation);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsHopping(false);
        grp.position.set(-0.28, -0.40, 0.05);
        grp.scale.set(1.18, 1.18, 1.18);
        grp.rotation.z = 0;
      },
    });

    // Squash prep -> Aerial surge + slight backspin -> Impact bounce
    tl.to(grp.scale, { x: 1.34, y: 0.96, z: 1.34, duration: 0.08, ease: 'sine.out' })
      .to(grp.position, { y: 0.28, duration: 0.22, ease: 'sine.out' }, '>')
      .to(grp.rotation, { z: -0.15, duration: 0.12, ease: 'power1.out' }, '<')
      .to(grp.scale, { x: 1.05, y: 1.35, z: 1.05, duration: 0.22, ease: 'sine.out' }, '<')
      .to(grp.position, { y: -0.40, duration: 0.24, ease: 'bounce.out' })
      .to(grp.rotation, { z: 0, duration: 0.2, ease: 'power2.out' }, '<')
      .to(grp.scale, { x: 1.28, y: 1.02, z: 1.28, duration: 0.08, ease: 'power2.out' }, '<0.16')
      .to(grp.scale, { x: 1.18, y: 1.18, z: 1.18, duration: 0.16, ease: 'back.out(2)' });
  }, [isHopping]);

  // Fun interactive Dice Roll Animation
  const handleTriggerDiceRoll = useCallback(() => {
    if (isTestRolling) return;
    setIsTestRolling(true);
    const nextVal = Math.floor(Math.random() * 6) + 1;
    setTestDiceValue(nextVal);

    setTimeout(() => {
      setIsTestRolling(false);
      if (nextVal === 6) {
        haptics.rolledSix();
      } else {
        haptics.stepHop();
      }
    }, 700);
  }, [isTestRolling]);

  const handleCustomizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.play('ui_click');
    if (onOpenCustomize) {
      onOpenCustomize();
    } else {
      navigate('/customize');
    }
  };

  useEffect(() => {
    return () => {
      if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
      if (tokenGroupRef.current) {
        gsap.killTweensOf(tokenGroupRef.current.position);
        gsap.killTweensOf(tokenGroupRef.current.scale);
        gsap.killTweensOf(tokenGroupRef.current.rotation);
      }
    };
  }, []);

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full h-72 sm:h-80 rounded-[30px] overflow-hidden border-2 border-white/90 shadow-[0_16px_36px_rgba(30,64,175,0.12),inset_0_2px_4px_rgba(255,255,255,0.9)] cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{
        background: 'radial-gradient(circle at 50% 36%, #ffffff 0%, #f4f8fd 62%, #e5eef9 100%)',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
    >
      {/* Soft Dynamic Color Halo underglow */}
      <div
        className="absolute inset-0 pointer-events-none opacity-45 transition-colors duration-700"
        style={{
          background: `radial-gradient(circle at 50% 55%, ${glowColor}40 0%, transparent 68%)`,
        }}
      />

      {/* Floating Pill: 360 Drag Orbit Hint */}
      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 border border-slate-200/80 text-[10px] font-extrabold text-slate-700 pointer-events-none flex items-center gap-1.5 shadow-sm backdrop-blur-xs z-10">
        <RotateCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Drag to Orbit</span>
      </div>

      {/* Floating Quick Action Chip: Customize */}
      <button
        type="button"
        onClick={handleCustomizeClick}
        className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-white/95 hover:bg-white border border-slate-200/80 text-xs font-black text-slate-800 shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-xs z-10 group"
      >
        <Palette className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
        <span className="font-['Fredoka']">Customize</span>
        <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
      </button>

      {/* Interactive Hero 3D Canvas */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.46, 3.4], fov: 36 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <ambientLight intensity={0.95} />
        <directionalLight position={[4, 6, 4]} intensity={1.5} />
        <directionalLight position={[-3, -1, -3]} intensity={0.4} color="#ffffff" />
        <pointLight position={[-1.5, 2.5, 1.5]} intensity={0.6} color={glowColor} />

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
            <group ref={sceneRootRef}>
              {/* Modern Studio Pedestal with Underglow */}
              <ModernStudioPedestal glowColor={glowColor} />

              {/* Equipped Token Figurine (Tap to Hop) */}
              <group
                ref={tokenGroupRef}
                position={[-0.28, -0.40, 0.05]}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerHop();
                }}
              >
                <Token3DModel
                  skin={selectedTokenSkin as TokenSkinId}
                  color={preferredColor as PlayerColor}
                  scale={1.18}
                  autoRotatePreview={false}
                />
              </group>

              {/* Equipped 3D Physics Die (Tap to Roll) */}
              <group
                position={[0.42, -0.22, 0.15]}
                scale={0.78}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerDiceRoll();
                }}
              >
                <StudioDie3DMesh
                  skinId={selectedDiceSkin as DiceSkinId}
                  value={testDiceValue}
                  isRolling={isTestRolling}
                />
              </group>
            </group>
          </TurntableController>
        </Suspense>
      </Canvas>

      {/* Bottom Info Ribbon: Equipped Figurine & Die names + Tap to React */}
      <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between pointer-events-none z-10">
        <div className="px-3 py-1.5 rounded-2xl bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-xs flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: glowColor }} />
          <div className="text-left">
            <span className="block text-[11px] font-black text-slate-900 leading-tight">
              {tokenMeta.name}
            </span>
            <span className="block text-[9px] font-bold text-slate-500">
              🎲 {diceMeta.name}
            </span>
          </div>
        </div>

        {/* Quick Interactive Tap Chip */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleTriggerHop();
            handleTriggerDiceRoll();
          }}
          className="pointer-events-auto px-3 py-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black shadow-md shadow-blue-500/25 flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all cursor-pointer font-['Fredoka']"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Tap Figurine to Hop!</span>
        </button>
      </div>
    </div>
  );
};

export default Home3DHeroPod;
