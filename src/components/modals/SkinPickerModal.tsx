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
} from '../three/Dice3DPod';
import { StudioEnvironment } from '../three/StudioEnvironment';
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
 * 3D Studio Pedestal Platform with glowing neon accent ring and grounded contact shadow.
 */
const StudioPedestal: React.FC<{ glowColor: string }> = ({ glowColor }) => (
  <group position={[0, -0.5, 0]}>
    {/* Base Podium Cylinder */}
    <mesh position={[0, -0.04, 0]}>
      <cylinderGeometry args={[1.08, 1.18, 0.08, 48]} />
      <meshStandardMaterial color="#0b1120" metalness={0.88} roughness={0.22} />
    </mesh>
    {/* Top Rim Bevel */}
    <mesh position={[0, 0.002, 0]}>
      <cylinderGeometry args={[1.05, 1.08, 0.015, 48]} />
      <meshStandardMaterial color="#1e293b" metalness={0.92} roughness={0.18} />
    </mesh>
    {/* Glowing Neon Accent Ring */}
    <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.92, 1.02, 48]} />
      <meshBasicMaterial color={glowColor} toneMapped={false} />
    </mesh>
    {/* Soft Contact Shadow Disk */}
    <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.62, 32]} />
      <meshBasicMaterial color="#020617" transparent opacity={0.52} depthWrite={false} />
    </mesh>
  </group>
);

/**
 * Turntable Controller that handles smooth 360-degree rotation and idle auto-spin.
 */
const TurntableController: React.FC<{
  rotationY: number;
  isAutoRotating: boolean;
  isDragging: boolean;
  onAutoRotate: (delta: number) => void;
  children: React.ReactNode;
}> = ({ rotationY, isAutoRotating, isDragging, onAutoRotate, children }) => {
  useFrame((_, delta) => {
    if (isAutoRotating && !isDragging) {
      onAutoRotate(delta * 0.45);
    }
  });
  return <group rotation={[0, rotationY, 0]}>{children}</group>;
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
      <RoundedBox args={[1.18, 1.18, 1.18]} radius={0.145} smoothness={8} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={skin.bodyColor}
          metalness={pbr.metalness}
          roughness={pbr.roughness}
          clearcoat={pbr.clearcoat}
          clearcoatRoughness={pbr.clearcoatRoughness}
          ior={pbr.ior}
          sheen={pbr.sheen}
          sheenColor="#ffffff"
        />
      </RoundedBox>

      {DICE_FACE_PIPS.map((face, fIdx) => {
        const isClassicAce = skinId === 'classic-white' && face.faceValue === 1;
        const pipColor = isClassicAce ? '#dc2626' : skin.pipColor;
        const rimColor = isClassicAce ? '#fbbf24' : pbr.rimColor;

        return (
          <group key={fIdx} position={face.normal} rotation={face.rotation}>
            {face.pips.map(([px, py], pIdx) => (
              <group key={pIdx} position={[px, py, 0]}>
                <mesh
                  geometry={isClassicAce ? SHARED_DICE_GEO.pipAceWell : SHARED_DICE_GEO.pipWell}
                  position={[0, 0, -0.004]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <meshPhysicalMaterial
                    color={pipColor}
                    roughness={0.14}
                    metalness={0.35}
                    clearcoat={1}
                    emissive={isClassicAce ? '#991b1b' : pbr.pipEmissive}
                    emissiveIntensity={isClassicAce ? 0.25 : pbr.pipEmissiveIntensity}
                  />
                </mesh>
                <mesh
                  geometry={isClassicAce ? SHARED_DICE_GEO.pipAceRim : SHARED_DICE_GEO.pipRim}
                  position={[0, 0, 0.006]}
                >
                  <meshStandardMaterial
                    color={rimColor}
                    metalness={0.8}
                    roughness={0.18}
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
 * Universal Dedicated 3D Studio Picker Modal for Tokens and Dice.
 * Features:
 * - Single WebGL Canvas for 0 background overhead.
 * - Interactive 360° Drag Orbit on the canvas with touch/pointer capture.
 * - Smooth Draggable Preset Ribbon with mouse grab-to-scroll, wheel scroll, and arrow buttons.
 * - Live 3D Pedestal Platform with matching dynamic neon rim lighting.
 * - Live Physics Simulators ("Test Hop" and "Roll Die").
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

  // Active mode state (user can toggle between Token and Dice inside the modal)
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

  // 360-degree Orbit & Physics Test States
  const [rotationY, setRotationY] = useState(0);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [canvasStartX, setCanvasStartX] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
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
      setRotationY(0);
      setIsAutoRotating(true);
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
      setIsAutoRotating(true);
    }, 2200);
  }, []);

  // Canvas 360 Drag Orbit Handlers
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingCanvas(true);
    setCanvasStartX(e.clientX);
    setIsAutoRotating(false);
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCanvas) return;
    const delta = e.clientX - canvasStartX;
    setRotationY((prev) => prev + delta * 0.014);
    setCanvasStartX(e.clientX);
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setIsDraggingCanvas(false);
    restartAutoRotate();
  };

  // Draggable Ribbon Mouse Handlers
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
    const walk = (x - rowStartX) * 1.5;
    if (Math.abs(walk) > 4) {
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
        grp.position.set(0, -0.46, 0);
        grp.scale.set(1.4, 1.4, 1.4);
      },
    });

    tl.to(grp.scale, { x: 1.55, y: 1.2, z: 1.55, duration: 0.08, ease: 'sine.out' })
      .to(grp.position, { y: 0.35, duration: 0.22, ease: 'sine.out' })
      .to(grp.scale, { x: 1.25, y: 1.55, z: 1.25, duration: 0.22, ease: 'sine.out' }, '<')
      .to(grp.position, { y: -0.46, duration: 0.22, ease: 'bounce.out' })
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
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md select-none"
        >
          <motion.div
            initial={{ scale: 0.92, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.92, y: 16, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
            className="relative w-full max-w-[480px] max-h-[96vh] rounded-[36px] bg-gradient-to-b from-white via-sky-50/95 to-slate-100 p-4 sm:p-5 shadow-[0_28px_70px_rgba(15,23,42,0.5),inset_0_2px_4px_rgba(255,255,255,1)] border-4 border-white flex flex-col justify-between overflow-y-auto"
          >
            {/* Header & Mode Switcher */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  {currentMode === 'token' ? (
                    <Sparkles className="w-5 h-5 text-amber-300" />
                  ) : (
                    <Dices className="w-5 h-5 text-amber-300" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight font-['Fredoka']">
                    {currentMode === 'token' ? '3D Token Studio' : '3D Dice Studio'}
                  </h2>
                  <p className="text-[11px] font-semibold text-slate-500">
                    {isPlayerContext
                      ? `Player ${targetPlayerIndex! + 1} (${targetPlayer?.name || 'Player'})`
                      : 'Global Default Loadout'}
                  </p>
                </div>
              </div>

              {/* Mode Toggle & Close Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-0.5 bg-slate-200/80 rounded-xl border border-slate-300/50">
                  <button
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      setCurrentMode('token');
                      setActiveSkinId(
                        isPlayerContext ? targetPlayer?.tokenSkin || 'classic' : selectedTokenSkin
                      );
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      currentMode === 'token'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
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
                    className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      currentMode === 'dice'
                        ? 'bg-white text-blue-600 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
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
                  className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* 3D Viewport Studio Stage */}
            <div
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              className="relative mt-2.5 w-full h-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-indigo-400/40 shadow-[0_12px_36px_rgba(15,23,42,0.35),inset_0_2px_4px_rgba(255,255,255,0.15)] cursor-grab active:cursor-grabbing select-none"
              style={{
                background: 'radial-gradient(circle at 50% 35%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
              }}
            >
              {/* Radial Lighting Glow Overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-45 transition-colors duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 45%, ${activeGlowColor}66 0%, transparent 68%)`,
                }}
              />

              {/* 360 Drag Pill Hint */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-extrabold text-white/90 pointer-events-none flex items-center gap-1.5 shadow-md">
                <RotateCcw className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Drag 360° to Orbit</span>
              </div>

              {/* Test Action Floating Pill */}
              <div className="absolute bottom-3 right-3 z-10">
                {currentMode === 'token' ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTriggerTestHop();
                    }}
                    disabled={isTestHopping}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black shadow-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
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
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black shadow-lg flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Dices className="w-3.5 h-3.5" />
                    <span>{isTestRolling ? 'Rolling...' : `Roll (${testDiceValue})`}</span>
                  </button>
                )}
              </div>

              {/* Single Dedicated 3D Studio Canvas */}
              <Canvas
                shadows
                dpr={[1, 1.5]}
                camera={
                  currentMode === 'token'
                    ? { position: [0, 0.9, 2.25], fov: 33 }
                    : { position: [0, 1.35, 2.25], fov: 33 }
                }
                gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
              >
                <StudioEnvironment intensity={1.25} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[4, 6, 4]} intensity={2.0} castShadow />
                <pointLight position={[-3, 3, 2]} intensity={0.9} color={activeGlowColor} />

                <Suspense fallback={null}>
                  <TurntableController
                    rotationY={rotationY}
                    isAutoRotating={isAutoRotating}
                    isDragging={isDraggingCanvas}
                    onAutoRotate={(delta) => setRotationY((prev) => prev + delta)}
                  >
                    {/* Glowing Circular Studio Pedestal */}
                    <StudioPedestal glowColor={activeGlowColor} />

                    {currentMode === 'token' ? (
                      <group
                        ref={tokenContainerRef}
                        position={[0, -0.46, 0]}
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
            <div className="mt-2.5 px-3.5 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <span className="block text-xs font-black text-slate-900">
                  {currentMode === 'token' ? activeTokenMeta.name : activeDiceMeta.name}
                </span>
                <span className="block text-[10px] font-bold text-blue-600">
                  {currentMode === 'token'
                    ? `Hop Style: ${activeTokenMeta.moveStyleName}`
                    : `PBR Material: ${activeDiceMeta.shapeType}`}
                </span>
              </div>

              {/* Color Swatch Selector for Tokens */}
              {currentMode === 'token' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold text-slate-500 mr-1">Color:</span>
                  {(['blue', 'red', 'green', 'yellow'] as PlayerColor[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        soundManager.play('ui_click');
                        setActiveColor(c);
                      }}
                      className={`w-5 h-5 rounded-full ${COLOR_PALETTE[c].bgClass} border-2 border-white shadow transition-transform cursor-pointer ${
                        activeColor === c ? 'scale-125 ring-2 ring-slate-800' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Smooth Draggable Preset Ribbon */}
            <div className="relative mt-2.5">
              <div className="flex items-center justify-between mb-1.5 px-0.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  {currentMode === 'token'
                    ? 'All 17 Tokens (Drag / Swipe to browse)'
                    : 'All 6 Dice Skins (Drag / Swipe to browse)'}
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

              {/* Draggable Row Container */}
              <div
                ref={ribbonRef}
                onMouseDown={handleRibbonMouseDown}
                onMouseMove={handleRibbonMouseMove}
                onMouseUp={handleRibbonMouseUp}
                onMouseLeave={handleRibbonMouseUp}
                onWheel={handleRibbonWheel}
                className={`flex items-center gap-2 overflow-x-auto py-1 px-1 scrollbar-none select-none ${
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
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102 ring-2 ring-blue-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
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
                              ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102 ring-2 ring-blue-300'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-lg shadow-sm border border-black/20 flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: dice.bodyColor,
                              boxShadow: `0 2px 6px ${dice.edgeGlow}55`,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full shadow-inner"
                              style={{ backgroundColor: dice.pipColor }}
                            />
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
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700'
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
