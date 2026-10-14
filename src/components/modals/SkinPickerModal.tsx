import { RoundedBox } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dices,
  Play,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundManager } from '../../audio/soundManager';
import {
  COLOR_PALETTE,
  DICE_SKINS,
  TOKEN_SKINS,
} from '../../engine/boardConfig';
import { useProfileStore } from '../../store/useProfileStore';
import { DiceSkinId, PlayerColor, TokenSkinId } from '../../types/game';
import { haptics } from '../../utils/haptics';
import {
  DICE_FACE_PIPS,
  FACE_EULER_MAP,
  SHARED_DICE_GEO,
  SKIN_PBR_MAP,
  getDiceCubeConfig,
  getDicePipGeometry,
} from '../three/Dice3DPod';
import { Token3DModel } from '../three/Token3DModel';

export interface SkinPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'token' | 'dice';
  targetPlayerIndex?: 0 | 1;
  initialSkinId?: string;
  initialColor?: PlayerColor;
}

export const TOKEN_ICON_MAP: Record<string, string> = {
  classic: '♟️',
  knight: '🐴',
  dog: '🐶',
  cat: '🐱',
  panda: '🐼',
  robot: '🤖',
  astronaut: '🧑‍🚀',
  unicorn: '🦄',
  'bamboo-panda': '🎋',
  'cyber-robot': '🦾',
  astronomer: '🔭',
  'star-unicorn': '✨',
  'fire-dragon': '🐉',
  'ice-dragon': '❄️',
  pirate: '🏴‍☠️',
  magician: '🧙',
  alien: '👽',
};

/**
 * Modern Clean Studio Pedestal Platform with Pearlescent Acrylic Podium,
 * Glowing Dynamic LED Accent Ring, and Soft Ground Shadows.
 */
const ModernStudioPedestal: React.FC<{ glowColor: string }> = ({ glowColor }) => (
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

/**
 * High-Performance Turntable Controller.
 * Operates purely on refs inside useFrame without triggering React component re-renders!
 * Supports inertia flick physics and gentle idle auto-rotation.
 */
const TurntableController: React.FC<{
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

/**
 * 3D Studio Die Mesh rendered inside the Skin Picker Modal.
 * Wrapped in an inner group so GSAP roll jumps and squash-and-stretch operate
 * independently of the outer 360 turntable orbit.
 */
const StudioDie3DMesh: React.FC<{
  skinId: DiceSkinId;
  value: number;
  isRolling: boolean;
}> = React.memo(({ skinId, value, isRolling }) => {
  const dieInnerRef = useRef<THREE.Group>(null);
  const skin = useMemo(
    () => DICE_SKINS.find((s) => s.id === skinId) ?? DICE_SKINS[0],
    [skinId]
  );
  const pbr = SKIN_PBR_MAP[skinId] ?? SKIN_PBR_MAP['classic-white'];
  const cubeConfig = useMemo(() => getDiceCubeConfig(skin.shapeType), [skin.shapeType]);

  useEffect(() => {
    if (!dieInnerRef.current) return;
    const grp = dieInnerRef.current;
    gsap.killTweensOf(grp.position);
    gsap.killTweensOf(grp.rotation);
    gsap.killTweensOf(grp.scale);

    const targetEuler = FACE_EULER_MAP[value] ?? FACE_EULER_MAP[1];

    if (isRolling) {
      soundManager.play('dice_roll');
      const tl = gsap.timeline();
      tl.to(
        grp.rotation,
        {
          x: targetEuler[0] + Math.PI * 4,
          y: targetEuler[1] + Math.PI * 4,
          z: targetEuler[2] + Math.PI * 2,
          duration: 0.65,
          ease: 'power2.out',
        },
        0
      )
        .to(grp.position, { y: 0.75, duration: 0.22, ease: 'sine.out' }, 0)
        .to(grp.position, { y: 0.16, duration: 0.25, ease: 'bounce.out' }, 0.22)
        .to(
          grp.scale,
          { x: 1.15, y: 0.85, z: 1.15, duration: 0.08, ease: 'power2.out' },
          0.44
        )
        .to(
          grp.scale,
          { x: 1, y: 1, z: 1, duration: 0.15, ease: 'back.out(2)' },
          0.52
        );
    } else {
      grp.position.set(0, 0.16, 0);
      grp.rotation.set(targetEuler[0], targetEuler[1], targetEuler[2]);
      grp.scale.set(1, 1, 1);
    }
  }, [isRolling, value]);

  return (
    <group ref={dieInnerRef} position={[0, 0.16, 0]}>
      <RoundedBox
        args={cubeConfig.args}
        radius={cubeConfig.radius}
        smoothness={cubeConfig.smoothness}
      >
        <meshStandardMaterial
          color={skin.bodyColor}
          metalness={skin.metalness}
          roughness={skin.roughness}
        />
      </RoundedBox>

      {DICE_FACE_PIPS.map((face, fIdx) => {
        const isAce = face.faceValue === 1;
        const isClassicAce = skinId === 'classic-white' && isAce;
        const pipColor = isClassicAce ? '#dc2626' : skin.pipColor;
        const rimColor = isClassicAce ? '#fbbf24' : pbr.rimColor;
        const pipGeo = getDicePipGeometry(face.faceValue, skinId, skin.pipShape);

        return (
          <group key={fIdx} position={face.normal} rotation={face.rotation}>
            {face.pips.map(([px, py], pIdx) => (
              <group key={pIdx} position={[px, py, 0]}>
                {/* 3D Prominent Visible Pip with Depth */}
                <mesh
                  geometry={pipGeo}
                  position={[0, 0, 0.003]}
                  rotation={
                    skin.pipShape === 'digital-square'
                      ? [0, 0, 0]
                      : [Math.PI / 2, 0, 0]
                  }
                >
                  <meshStandardMaterial
                    color={pipColor}
                    roughness={0.2}
                    metalness={0.15}
                    emissive={isClassicAce ? '#7f1d1d' : pbr.pipEmissive}
                    emissiveIntensity={
                      isClassicAce ? 0.35 : Math.min(1.0, pbr.pipEmissiveIntensity)
                    }
                  />
                </mesh>
                {/* Metallic Bevel Rim Around Pip */}
                <mesh
                  geometry={
                    isClassicAce
                      ? SHARED_DICE_GEO.pipAceRim
                      : SHARED_DICE_GEO.pipRim
                  }
                  position={[0, 0, 0.007]}
                >
                  <meshStandardMaterial
                    color={rimColor}
                    metalness={0.85}
                    roughness={0.15}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
});

StudioDie3DMesh.displayName = 'StudioDie3DMesh';

/**
 * Universal Modern 3D Studio Picker Modal for Tokens and Dice.
 * Features:
 * - Ultra-Clean Luminous Studio Lighting (zero dark gloom).
 * - Butter-smooth 60-120 FPS Mobile Touch 360° Drag Orbit with Momentum.
 * - Zero React Re-render drag loop for 100% lag-free performance.
 * - Hardware-accelerated Draggable Preset Ribbon with touch-pan-x, mouse grab, and arrow nav.
 * - Modern Glassmorphic UI with dynamic color halo and live physics tests.
 */
export const SkinPickerModal: React.FC<SkinPickerModalProps> = ({
  isOpen,
  onClose,
  mode,
  targetPlayerIndex,
  initialSkinId,
  initialColor,
}) => {
  const {
    players,
    selectedTokenSkin,
    selectedDiceSkin,
    setSelectedTokenSkin,
    setSelectedDiceSkin,
    updatePlayerConfig,
  } = useProfileStore();

  const isPlayerContext = targetPlayerIndex !== undefined;
  const targetPlayer = isPlayerContext ? players[targetPlayerIndex] : null;

  // Active mode state (user can toggle between Token and Dice directly inside modal)
  const [currentMode, setCurrentMode] = useState<'token' | 'dice'>(mode);

  const [activeSkinId, setActiveSkinId] = useState<string>(() => {
    if (initialSkinId) return initialSkinId;
    if (mode === 'token') {
      return isPlayerContext ? targetPlayer?.tokenSkin || 'classic' : selectedTokenSkin;
    }
    return isPlayerContext ? targetPlayer?.diceSkin || 'classic-white' : selectedDiceSkin;
  });

  const [activeColor, setActiveColor] = useState<PlayerColor>(() => {
    if (initialColor) return initialColor;
    return isPlayerContext ? targetPlayer?.color || 'blue' : 'blue';
  });

  // Zero-rerender high-FPS 360 orbit rotation refs
  const rotationTargetRef = useRef(0);
  const rotationCurrentRef = useRef(0);
  const isDraggingCanvasRef = useRef(false);
  const isAutoRotatingRef = useRef(true);
  const lastPointerXRef = useRef(0);
  const velocityRef = useRef(0);
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [testDiceValue, setTestDiceValue] = useState(6);
  const [isTestRolling, setIsTestRolling] = useState(false);
  const [isTestHopping, setIsTestHopping] = useState(false);
  const [showEquippedToast, setShowEquippedToast] = useState(false);

  const tokenContainerRef = useRef<THREE.Group>(null);

  // Preset Ribbon Drag & Scroll State
  const ribbonRef = useRef<HTMLDivElement>(null);
  const [isDraggingRow, setIsDraggingRow] = useState(false);
  const [rowStartX, setRowStartX] = useState(0);
  const [rowScrollLeft, setRowScrollLeft] = useState(0);
  const hasDraggedRowRef = useRef(false);

  // Sync when modal opens or initial props change
  useEffect(() => {
    if (isOpen) {
      setCurrentMode(mode);
      if (initialSkinId) {
        setActiveSkinId(initialSkinId);
      } else if (mode === 'token') {
        setActiveSkinId(
          isPlayerContext ? targetPlayer?.tokenSkin || 'classic' : selectedTokenSkin
        );
      } else {
        setActiveSkinId(
          isPlayerContext ? targetPlayer?.diceSkin || 'classic-white' : selectedDiceSkin
        );
      }

      if (initialColor) {
        setActiveColor(initialColor);
      } else if (isPlayerContext && targetPlayer) {
        setActiveColor(targetPlayer.color);
      }
      rotationTargetRef.current = 0;
      rotationCurrentRef.current = 0;
      velocityRef.current = 0;
      isAutoRotatingRef.current = true;
      setIsTestRolling(false);
      setIsTestHopping(false);
      setShowEquippedToast(false);
    }
  }, [
    isOpen,
    mode,
    isPlayerContext,
    targetPlayer,
    initialSkinId,
    initialColor,
    selectedTokenSkin,
    selectedDiceSkin,
  ]);

  // Restart auto-rotation after 2.2 seconds of inactivity
  const restartAutoRotate = useCallback(() => {
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
    autoRotateTimerRef.current = setTimeout(() => {
      isAutoRotatingRef.current = true;
    }, 2200);
  }, []);

  // Zero-rerender Canvas Pointer Handlers (60-120 FPS buttery smooth on mobile touch!)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingCanvasRef.current = true;
    isAutoRotatingRef.current = false;
    lastPointerXRef.current = e.clientX;
    velocityRef.current = 0;
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCanvasRef.current) return;
    const delta = e.clientX - lastPointerXRef.current;
    // Responsive touch multiplier (swift & natural on mobile touch)
    const step = delta * 0.032;
    rotationTargetRef.current += step;
    velocityRef.current = step;
    lastPointerXRef.current = e.clientX;
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    isDraggingCanvasRef.current = false;
    restartAutoRotate();
  };

  // Draggable Ribbon Handlers
  const handleRibbonMouseDown = (e: React.MouseEvent) => {
    if (!ribbonRef.current) return;
    setIsDraggingRow(true);
    setRowStartX(e.pageX - ribbonRef.current.offsetLeft);
    setRowScrollLeft(ribbonRef.current.scrollLeft);
    hasDraggedRowRef.current = false;
  };

  const handleRibbonMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRow || !ribbonRef.current) return;
    e.preventDefault();
    const x = e.pageX - ribbonRef.current.offsetLeft;
    const walk = (x - rowStartX) * 1.6;
    if (Math.abs(walk) > 5) {
      hasDraggedRowRef.current = true;
    }
    ribbonRef.current.scrollLeft = rowScrollLeft - walk;
  };

  const handleRibbonMouseUp = () => {
    setIsDraggingRow(false);
  };

  const handleRibbonWheel = (e: React.WheelEvent) => {
    if (!ribbonRef.current) return;
    if (e.deltaY) {
      ribbonRef.current.scrollLeft += e.deltaY * 0.85;
    }
  };

  const scrollRibbon = (direction: 'left' | 'right') => {
    if (!ribbonRef.current) return;
    soundManager.play('ui_click');
    const offset = direction === 'left' ? -220 : 220;
    ribbonRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  // Auto-scroll active item into view when activeSkinId or mode changes
  useEffect(() => {
    if (!ribbonRef.current) return;
    const timer = setTimeout(() => {
      const activeBtn = ribbonRef.current?.querySelector<HTMLElement>('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 80);
    return () => clearTimeout(timer);
  }, [activeSkinId, currentMode]);

  // Test Hop Physics Animation
  const handleTriggerTestHop = useCallback(() => {
    if (isTestHopping || !tokenContainerRef.current) return;
    setIsTestHopping(true);
    soundManager.play('pawn_step', 1.05);
    haptics.stepHop();

    const grp = tokenContainerRef.current;
    gsap.killTweensOf(grp.position);
    gsap.killTweensOf(grp.scale);

    const tl = gsap.timeline({
      onComplete: () => {
        setIsTestHopping(false);
        grp.position.set(0, -0.45, 0);
        grp.scale.set(1.4, 1.4, 1.4);
      },
    });

    tl.to(grp.scale, { x: 1.55, y: 1.2, z: 1.55, duration: 0.08, ease: 'sine.out' })
      .to(grp.position, { y: 0.38, duration: 0.22, ease: 'sine.out' })
      .to(grp.scale, { x: 1.25, y: 1.55, z: 1.25, duration: 0.22, ease: 'sine.out' }, '<')
      .to(grp.position, { y: -0.45, duration: 0.22, ease: 'bounce.out' })
      .to(grp.scale, { x: 1.52, y: 1.22, z: 1.52, duration: 0.08, ease: 'power2.out' }, '<0.15')
      .to(grp.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.16, ease: 'back.out(2)' });
  }, [isTestHopping]);

  // Test Roll Physics Animation
  const handleTriggerTestRoll = useCallback(() => {
    if (isTestRolling) return;
    setIsTestRolling(true);
    const randomFace = Math.floor(Math.random() * 6) + 1;
    setTestDiceValue(randomFace);
    setTimeout(() => {
      setIsTestRolling(false);
      if (randomFace === 6) {
        haptics.rolledSix();
      } else {
        haptics.stepHop();
      }
    }, 700);
  }, [isTestRolling]);

  // Handle Equip Skin
  const handleEquip = () => {
    soundManager.play('ui_click');
    haptics.stepHop();

    if (currentMode === 'token') {
      if (isPlayerContext && targetPlayerIndex !== undefined) {
        updatePlayerConfig(targetPlayerIndex, { tokenSkin: activeSkinId as TokenSkinId });
      } else {
        setSelectedTokenSkin(activeSkinId as TokenSkinId);
      }
    } else {
      if (isPlayerContext && targetPlayerIndex !== undefined) {
        updatePlayerConfig(targetPlayerIndex, { diceSkin: activeSkinId as DiceSkinId });
      } else {
        setSelectedDiceSkin(activeSkinId as DiceSkinId);
      }
    }

    setShowEquippedToast(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  const activeTokenMeta =
    TOKEN_SKINS.find((t) => t.id === activeSkinId) ?? TOKEN_SKINS[0];
  const activeDiceMeta =
    DICE_SKINS.find((d) => d.id === activeSkinId) ?? DICE_SKINS[0];

  const activeGlowColor =
    currentMode === 'token'
      ? COLOR_PALETTE[activeColor].primary
      : activeDiceMeta.edgeGlow;

  const isCurrentlyEquipped = isPlayerContext
    ? currentMode === 'token'
      ? targetPlayer?.tokenSkin === activeSkinId
      : targetPlayer?.diceSkin === activeSkinId
    : currentMode === 'token'
    ? selectedTokenSkin === activeSkinId
    : selectedDiceSkin === activeSkinId;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xl select-none"
        >
          <motion.div
            initial={{ scale: 0.94, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="relative w-full max-w-[480px] max-h-[96vh] rounded-[32px] bg-white/95 backdrop-blur-2xl p-4 sm:p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18),0_4px_16px_rgba(15,23,42,0.06)] border border-white/80 flex flex-col justify-between overflow-y-auto"
          >
            {/* Header & Mode Switcher */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                  {currentMode === 'token' ? (
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  ) : (
                    <Dices className="w-5 h-5 text-amber-300" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-900 leading-tight font-['Fredoka']">
                    {currentMode === 'token' ? '3D Token Studio' : '3D Dice Studio'}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {isPlayerContext
                      ? `Player ${targetPlayerIndex! + 1} (${targetPlayer?.name || 'Player'})`
                      : 'Global Default Loadout'}
                  </p>
                </div>
              </div>

              {/* Segmented Mode Switcher & Close */}
              <div className="flex items-center gap-2">
                <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      setCurrentMode('token');
                      setActiveSkinId(
                        isPlayerContext ? targetPlayer?.tokenSkin || 'classic' : selectedTokenSkin
                      );
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentMode === 'token'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ♟️ Token
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      setCurrentMode('dice');
                      setActiveSkinId(
                        isPlayerContext ? targetPlayer?.diceSkin || 'classic-white' : selectedDiceSkin
                      );
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      currentMode === 'dice'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🎲 Dice
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundManager.play('ui_click');
                    onClose();
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Modern Luminous 3D Viewport Stage */}
            <div
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
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
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/80 text-[10px] font-extrabold text-slate-700 pointer-events-none flex items-center gap-1.5 shadow-sm">
                <RotateCcw className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Swipe 360° to Orbit</span>
              </div>

              {/* Action Floating Test Button */}
              <div className="absolute bottom-3 right-3 z-10">
                {currentMode === 'token' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerTestHop();
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
                      handleTriggerTestRoll();
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
              <Canvas
                dpr={[1, 1.5]}
                camera={
                  currentMode === 'token'
                    ? { position: [0, 0.9, 2.25], fov: 33 }
                    : { position: [0, 1.25, 2.2], fov: 34 }
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
                    isDraggingRef={isDraggingCanvasRef}
                    isAutoRotatingRef={isAutoRotatingRef}
                    velocityRef={velocityRef}
                  >
                    {/* Modern Clean Studio Pedestal */}
                    <ModernStudioPedestal glowColor={activeGlowColor} />

                    {currentMode === 'token' ? (
                      <group
                        ref={tokenContainerRef}
                        position={[0, -0.45, 0]}
                      >
                        <Token3DModel
                          skin={activeSkinId as TokenSkinId}
                          color={activeColor}
                          scale={1.4}
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

            {/* Model Info Bar & Color Selector */}
            <div className="mt-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div>
                <span className="block text-xs font-black text-slate-900">
                  {currentMode === 'token' ? activeTokenMeta.name : activeDiceMeta.name}
                </span>
                <span className="block text-[10px] font-bold text-blue-600">
                  {currentMode === 'token'
                    ? `Style: ${activeTokenMeta.moveStyleName}`
                    : `PBR Profile: ${activeDiceMeta.shapeType}`}
                </span>
              </div>

              {/* Color Swatch Selector for Tokens */}
              {currentMode === 'token' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-slate-400 mr-1">Color:</span>
                  {(['blue', 'red', 'green', 'yellow'] as PlayerColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        soundManager.play('ui_click');
                        setActiveColor(c);
                      }}
                      className={`w-5 h-5 rounded-full ${COLOR_PALETTE[c].bgClass} border-2 border-white shadow transition-transform cursor-pointer ${
                        activeColor === c ? 'scale-125 ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Draggable Preset Ribbon */}
            <div className="relative mt-2.5">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                  {currentMode === 'token'
                    ? 'All 17 Tokens (Swipe / Drag)'
                    : 'All 6 Dice Skins (Swipe / Drag)'}
                </span>

                {/* Left/Right Arrow Navigation Controls */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollRibbon('left')}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRibbon('right')}
                    className="w-6 h-6 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center shadow-xs cursor-pointer active:scale-95 transition-all"
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Draggable Row Container with touch-pan-x for native mobile swipe */}
              <div
                ref={ribbonRef}
                onMouseDown={handleRibbonMouseDown}
                onMouseMove={handleRibbonMouseMove}
                onMouseUp={handleRibbonMouseUp}
                onMouseLeave={handleRibbonMouseUp}
                onWheel={handleRibbonWheel}
                className={`flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none select-none touch-pan-x ${
                  isDraggingRow ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ scrollBehavior: isDraggingRow ? 'auto' : 'smooth' }}
              >
                {currentMode === 'token'
                  ? TOKEN_SKINS.map((skin) => {
                      const selected = activeSkinId === skin.id;
                      const icon = TOKEN_ICON_MAP[skin.id] || '♟️';
                      return (
                        <button
                          key={skin.id}
                          type="button"
                          data-active={selected ? 'true' : 'false'}
                          onClick={() => {
                            if (hasDraggedRowRef.current) return;
                            soundManager.play('ui_click');
                            setActiveSkinId(skin.id);
                          }}
                          className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            selected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-102 ring-2 ring-blue-300'
                              : 'bg-white text-slate-700 border-slate-200/90 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="text-xl shrink-0 drop-shadow-xs">{icon}</span>
                          <div className="text-left">
                            <span className="block text-xs font-black truncate max-w-[100px] leading-tight">
                              {skin.name}
                            </span>
                            <span
                              className={`block text-[9px] font-bold ${
                                selected ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {skin.subtitle.split(' ')[0]}
                            </span>
                          </div>
                          {selected && (
                            <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3] shrink-0" />
                          )}
                        </button>
                      );
                    })
                  : DICE_SKINS.map((dice) => {
                      const selected = activeSkinId === dice.id;
                      return (
                        <button
                          key={dice.id}
                          type="button"
                          data-active={selected ? 'true' : 'false'}
                          onClick={() => {
                            if (hasDraggedRowRef.current) return;
                            soundManager.play('ui_click');
                            setActiveSkinId(dice.id);
                          }}
                          className={`shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border-2 transition-all cursor-pointer ${
                            selected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md shadow-blue-500/20 scale-102 ring-2 ring-blue-300'
                              : 'bg-white text-slate-700 border-slate-200/90 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-lg shadow-sm border border-black/15 p-1 grid grid-cols-2 gap-0.5 items-center justify-items-center shrink-0"
                            style={{
                              backgroundColor: dice.bodyColor,
                              boxShadow: `0 2px 6px ${dice.edgeGlow}55`,
                            }}
                          >
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: dice.pipColor }} />
                          </div>
                          <div className="text-left">
                            <span className="block text-xs font-black truncate max-w-[100px] leading-tight">
                              {dice.name}
                            </span>
                            <span
                              className={`block text-[9px] font-bold ${
                                selected ? 'text-blue-100' : 'text-slate-400'
                              }`}
                            >
                              {dice.shapeType}
                            </span>
                          </div>
                          {selected && (
                            <Check className="w-3.5 h-3.5 text-amber-300 stroke-[3] shrink-0" />
                          )}
                        </button>
                      );
                    })}
              </div>
            </div>

            {/* Bottom Equip Action CTA */}
            <div className="mt-3 pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={handleEquip}
                className={`w-full py-3.5 rounded-2xl text-white font-black text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 transition-transform cursor-pointer active:scale-98 font-['Fredoka'] ${
                  isCurrentlyEquipped
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/25'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {showEquippedToast
                    ? '✓ Successfully Equipped!'
                    : isCurrentlyEquipped
                    ? 'Currently Equipped (Tap to Confirm)'
                    : isPlayerContext
                    ? `Equip for Player ${targetPlayerIndex! + 1}`
                    : 'Equip This Skin'}
                </span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

SkinPickerModal.displayName = 'SkinPickerModal';
export default SkinPickerModal;
