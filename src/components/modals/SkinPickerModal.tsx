import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Dices,
  Sparkles,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { TOKEN_ICON_MAP } from './skinPicker/constants';
import { SkinStudioPreview3D } from './skinPicker/preview/SkinStudioPreview3D';
import { DiceRibbonRow } from './skinPicker/ribbon/DiceRibbonRow';
import { TokenRibbonRow } from './skinPicker/ribbon/TokenRibbonRow';

export { TOKEN_ICON_MAP };

export interface SkinPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'token' | 'dice';
  targetPlayerIndex?: number;
  initialSkinId?: string;
  initialColor?: PlayerColor;
}

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

  // Zero-rerender high-FPS 360 orbit rotation refs (Yaw & Pitch)
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
      pitchTargetRef.current = 0;
      pitchCurrentRef.current = 0;
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
    lastPointerYRef.current = e.clientY;
    velocityRef.current = 0;
    if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingCanvasRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    const deltaY = e.clientY - lastPointerYRef.current;

    // Horizontal 360 spin
    const stepX = deltaX * 0.030;
    rotationTargetRef.current += stepX;
    velocityRef.current = stepX;

    // Vertical pitch tilt clamped so user can inspect top/bottom without flipping
    const stepY = deltaY * 0.016;
    pitchTargetRef.current = Math.max(
      -0.35,
      Math.min(0.45, pitchTargetRef.current + stepY)
    );

    lastPointerXRef.current = e.clientX;
    lastPointerYRef.current = e.clientY;
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
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-xs select-none"
        >
          <motion.div
            initial={{ scale: 0.97, y: 12, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.97, y: 8, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform, opacity' }}
            className="relative w-full max-w-[480px] max-h-[96vh] rounded-[32px] bg-white p-4 sm:p-5 shadow-[0_24px_60px_rgba(15,23,42,0.35),0_4px_16px_rgba(15,23,42,0.1)] border border-slate-200/80 flex flex-col justify-between overflow-y-auto"
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
            <SkinStudioPreview3D
              currentMode={currentMode}
              activeSkinId={activeSkinId}
              activeColor={activeColor}
              activeGlowColor={activeGlowColor}
              testDiceValue={testDiceValue}
              isTestRolling={isTestRolling}
              isTestHopping={isTestHopping}
              onTriggerTestHop={handleTriggerTestHop}
              onTriggerTestRoll={handleTriggerTestRoll}
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              rotationTargetRef={rotationTargetRef}
              rotationCurrentRef={rotationCurrentRef}
              pitchTargetRef={pitchTargetRef}
              pitchCurrentRef={pitchCurrentRef}
              isDraggingCanvasRef={isDraggingCanvasRef}
              isAutoRotatingRef={isAutoRotatingRef}
              velocityRef={velocityRef}
              tokenContainerRef={tokenContainerRef}
            />

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
                {currentMode === 'token' ? (
                  <TokenRibbonRow
                    activeSkinId={activeSkinId}
                    onSelectSkin={setActiveSkinId}
                    hasDraggedRowRef={hasDraggedRowRef}
                  />
                ) : (
                  <DiceRibbonRow
                    activeSkinId={activeSkinId}
                    onSelectSkin={setActiveSkinId}
                    hasDraggedRowRef={hasDraggedRowRef}
                  />
                )}
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
