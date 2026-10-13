import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Star } from 'lucide-react';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  hopPawn3D,
  reverseTraversePawn3D,
} from '../../animations/pawnHop3D';
import { soundManager } from '../../audio/soundManager';
import {
  BOARD_THEMES,
  buildReverseStepPath,
  COLOR_PALETTE,
  getPawnGridCoord,
  gridToWorld3D,
} from '../../engine/boardConfig';
import {
  BoardThemeId,
  MoveEvaluation,
  Pawn,
  PlayerColor,
  PlayerConfig,
} from '../../types/game';
import { haptics, triggerHomeReachConfetti } from '../../utils/haptics';
import { StudioEnvironment } from '../three/StudioEnvironment';
import { Token3DModel } from '../three/Token3DModel';
import { StepEffects3D, stepEffectsManager } from '../three/StepEffects3D';

const BOARD_CAM_Y = 14.5;
const BOARD_CAM_Z = 3.25;
const BOARD_CAM_COS = BOARD_CAM_Y / Math.hypot(BOARD_CAM_Y, BOARD_CAM_Z);

const YARD_PAD_POSITIONS: [number, number][] = [
  [32.5, 32.5],
  [67.5, 32.5],
  [32.5, 67.5],
  [67.5, 67.5],
];

interface AnimatedPawn3DNodeProps {
  pawn: Pawn;
  player: PlayerConfig;
  stackIndex: number;
  stackTotal: number;
  isSelectable: boolean;
  activeMove: MoveEvaluation | null;
  onSelectPawn: (pawnId: string) => void;
  onAnimationComplete: () => void;
}

const CONTACT_SHADOW_GEO = new THREE.CircleGeometry(0.39, 24);

const AnimatedPawn3DNode: React.FC<AnimatedPawn3DNodeProps> = React.memo(
  ({
    pawn,
    player,
    stackIndex,
    stackTotal,
    isSelectable,
    activeMove,
    onSelectPawn,
    onAnimationComplete,
  }) => {
    const groupRef = useRef<THREE.Group>(null);
    const prevStepRef = useRef<number>(pawn.step);
    const isMovingRef = useRef(false);
    const hasInitializedPos = useRef(false);
    const executedMoveKeyRef = useRef<string | null>(null);

    const targetGrid = useMemo(
      () => getPawnGridCoord(pawn.color, pawn.step, pawn.pawnIndex),
      [pawn.color, pawn.step, pawn.pawnIndex]
    );

    const targetWorld = useMemo(
      () => gridToWorld3D(targetGrid, stackIndex, stackTotal),
      [targetGrid, stackIndex, stackTotal]
    );

    // Initial mount position anchor
    useEffect(() => {
      if (groupRef.current && !hasInitializedPos.current) {
        hasInitializedPos.current = true;
        groupRef.current.position.set(targetWorld.x, 0, targetWorld.z);
      }
    }, [targetWorld.x, targetWorld.z]);

    // Set animated position
    useEffect(() => {
      if (!groupRef.current) return;

      // 1. If this pawn is currently executing `activeMove`, run its skin-specific GSAP hop!
      if (activeMove && activeMove.pawnId === pawn.id) {
        const moveKey = `${activeMove.pawnId}_${activeMove.fromStep}->${activeMove.toStep}`;
        if (executedMoveKeyRef.current === moveKey) {
          return;
        }
        executedMoveKeyRef.current = moveKey;
        isMovingRef.current = true;

        const coords = activeMove.pathSteps.map((stepIdx) => {
          const g = getPawnGridCoord(pawn.color, stepIdx, pawn.pawnIndex);
          return gridToWorld3D(g, 0, 1);
        });

        // Compute exact destination coordinates (including stack offset)
        const destGrid = getPawnGridCoord(
          pawn.color,
          activeMove.toStep,
          pawn.pawnIndex
        );
        const destWorld = gridToWorld3D(destGrid, stackIndex, stackTotal);

        const tl = hopPawn3D({
          group: groupRef.current,
          skin: player.tokenSkin,
          color: pawn.color,
          stepsCoordinates: coords,
          onStepLand: (coord) => {
            stepEffectsManager.trigger(
              coord.x,
              coord.z,
              player.tokenSkin,
              pawn.color
            );
          },
          onComplete: () => {
            isMovingRef.current = false;
            prevStepRef.current = activeMove.toStep;
            // Firmly lock at destination coordinates — NEVER snap back to old targetWorld!
            if (groupRef.current) {
              groupRef.current.position.set(destWorld.x, 0, destWorld.z);
            }
            if (activeMove.willKillPawnIds.length > 0) {
              soundManager.play('pawn_kill');
              haptics.pawnCaptured();
            } else if (activeMove.willReachHome) {
              soundManager.play('home_reach');
              haptics.victory();
              triggerHomeReachConfetti();
            } else if (activeMove.landsOnSafeStar) {
              soundManager.play('safe_star');
            }
            onAnimationComplete();
          },
        });

        return () => {
          tl.kill();
        };
      }

      // 2. If this pawn was just captured (step dropped from >= 0 back to -1), run Ludo King style track retreat!
      if (prevStepRef.current >= 0 && pawn.step === -1) {
        isMovingRef.current = true;
        const capturedFromStep = prevStepRef.current;
        prevStepRef.current = -1;
        const reverseSteps = buildReverseStepPath(capturedFromStep);
        const reverseCoordinates = reverseSteps.map((stepIdx) => {
          const g = getPawnGridCoord(pawn.color, stepIdx, pawn.pawnIndex);
          return gridToWorld3D(g, 0, 1);
        });

        const retreatTl = reverseTraversePawn3D({
          group: groupRef.current,
          reverseCoordinates,
          onComplete: () => {
            isMovingRef.current = false;
            if (groupRef.current) {
              groupRef.current.position.set(targetWorld.x, 0, targetWorld.z);
            }
          },
        });

        return () => {
          retreatTl.kill();
        };
      }

      // 3. Smooth stack adjustment or alignment (ONLY if not actively moving and offset exists)
      if (isMovingRef.current) return;
      prevStepRef.current = pawn.step;
      const distX = Math.abs(groupRef.current.position.x - targetWorld.x);
      const distZ = Math.abs(groupRef.current.position.z - targetWorld.z);
      if (distX > 0.04 || distZ > 0.04) {
        // BUG-05 FIX: Store tween reference and kill it on cleanup to prevent
        // zombie tweens accumulating over hundreds of moves in a long game.
        const alignTween = gsap.to(groupRef.current.position, {
          x: targetWorld.x,
          y: 0,
          z: targetWorld.z,
          duration: 0.22,
          ease: 'sine.out',
        });
        return () => { alignTween.kill(); };
      }
    }, [
      activeMove,
      pawn.id,
      pawn.color,
      pawn.pawnIndex,
      pawn.step,
      player.tokenSkin,
      stackIndex,
      stackTotal,
      targetWorld.x,
      targetWorld.z,
      onAnimationComplete,
    ]);

    // Calibrated token sizing so pedestals fit cleanly inside track squares, Yard pads, and Home triangles
    const tokenScale =
      pawn.step === -1
        ? 1.24
        : pawn.step === 56
        ? 0.85
        : stackTotal > 1
        ? 0.88
        : 1.12;

    return (
      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          if (isSelectable) {
            onSelectPawn(pawn.id);
          }
        }}
      >
        {/* Soft Ambient Occlusion Contact Disc Under Token */}
        <mesh
          geometry={CONTACT_SHADOW_GEO}
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={tokenScale}
        >
          <meshBasicMaterial
            color="#0f172a"
            transparent
            opacity={0.26}
            depthWrite={false}
          />
        </mesh>

        <Token3DModel
          skin={player.tokenSkin}
          color={pawn.color}
          isSelectable={isSelectable}
          scale={tokenScale}
        />
      </group>
    );
  },
  (prev, next) => {
    const prevIsActive = prev.activeMove?.pawnId === prev.pawn.id;
    const nextIsActive = next.activeMove?.pawnId === next.pawn.id;
    return (
      prev.pawn.step === next.pawn.step &&
      prev.pawn.color === next.pawn.color &&
      prev.player.tokenSkin === next.player.tokenSkin &&
      prev.stackIndex === next.stackIndex &&
      prev.stackTotal === next.stackTotal &&
      prev.isSelectable === next.isSelectable &&
      prevIsActive === nextIsActive &&
      (!nextIsActive || prev.activeMove === next.activeMove)
    );
  }
);

AnimatedPawn3DNode.displayName = 'AnimatedPawn3DNode';

/**
 * Theme-Adaptive Corner Hardware:
 * - Royal Teakwood: Stamped Burma brass brackets with metallic rivets
 * - Marble Palace: Stepped Roman rose-gold plinths with acanthus trim
 * - Midnight Cyber: Carbon-fiber chamfers with cyan & magenta LED indicators
 * - Classic Kingdom: Victorian gilded tournament acanthus filigree
 */
const ThematicCornerDecorations: React.FC<{ themeId: BoardThemeId }> = React.memo(
  ({ themeId }) => {
    if (themeId === 'royal-wood') {
      return (
        <>
          <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[3.5px] border-l-[3.5px] border-amber-400 rounded-tl-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mt-0.5 ml-0.5" />
          </div>
          <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[3.5px] border-r-[3.5px] border-amber-400 rounded-tr-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mt-0.5 mr-0.5" />
          </div>
          <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[3.5px] border-l-[3.5px] border-amber-400 rounded-bl-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-end">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mb-0.5 ml-0.5" />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[3.5px] border-r-[3.5px] border-amber-400 rounded-br-lg shadow-[0_2px_4px_rgba(0,0,0,0.6)] flex items-end justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-200 border border-amber-800 shadow-sm mb-0.5 mr-0.5" />
          </div>
        </>
      );
    }
    if (themeId === 'marble-palace') {
      return (
        <>
          <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-l-[3px] border-rose-300 rounded-tl-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)]">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mt-0.5 ml-0.5" />
          </div>
          <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-r-[3px] border-rose-300 rounded-tr-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)] flex justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mt-0.5 mr-0.5" />
          </div>
          <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-l-[3px] border-rose-300 rounded-bl-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)] flex items-end">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mb-0.5 ml-0.5" />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-r-[3px] border-rose-300 rounded-br-lg shadow-[0_2px_4px_rgba(159,18,57,0.25)] flex items-end justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-100 border border-rose-400 mb-0.5 mr-0.5" />
          </div>
        </>
      );
    }
    if (themeId === 'midnight-neon') {
      return (
        <>
          <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[2.5px] border-l-[2.5px] border-cyan-400 rounded-tl-md shadow-[0_0_8px_rgba(6,182,212,0.6)]">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] mt-0.5 ml-0.5 animate-pulse" />
          </div>
          <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[2.5px] border-r-[2.5px] border-pink-500 rounded-tr-md shadow-[0_0_8px_rgba(236,72,153,0.6)] flex justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-300 shadow-[0_0_6px_#f472b6] mt-0.5 mr-0.5 animate-pulse" />
          </div>
          <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[2.5px] border-l-[2.5px] border-pink-500 rounded-bl-md shadow-[0_0_8px_rgba(236,72,153,0.6)] flex items-end">
            <div className="w-1.5 h-1.5 rounded-full bg-pink-300 shadow-[0_0_6px_#f472b6] mb-0.5 ml-0.5 animate-pulse" />
          </div>
          <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[2.5px] border-r-[2.5px] border-cyan-400 rounded-br-md shadow-[0_0_8px_rgba(6,182,212,0.6)] flex items-end justify-end">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_6px_#22d3ee] mb-0.5 mr-0.5 animate-pulse" />
          </div>
        </>
      );
    }
    // Classic Kingdom
    return (
      <>
        <div className="absolute top-1 left-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-l-[3px] border-amber-400/90 rounded-tl-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mt-0.5 ml-0.5" />
        </div>
        <div className="absolute top-1 right-1 w-6 h-6 pointer-events-none z-20 border-t-[3px] border-r-[3px] border-amber-400/90 rounded-tr-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex justify-end">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mt-0.5 mr-0.5" />
        </div>
        <div className="absolute bottom-1 left-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-l-[3px] border-amber-400/90 rounded-bl-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex items-end">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mb-0.5 ml-0.5" />
        </div>
        <div className="absolute bottom-1 right-1 w-6 h-6 pointer-events-none z-20 border-b-[3px] border-r-[3px] border-amber-400/90 rounded-br-lg shadow-[0_2px_4px_rgba(0,0,0,0.3)] flex items-end justify-end">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-700 mb-0.5 mr-0.5" />
        </div>
      </>
    );
  }
);
ThematicCornerDecorations.displayName = 'ThematicCornerDecorations';

/**
 * Bespoke Thematic Safe Star Icons:
 * - Royal Teakwood: Stamped brass medallion with burnt-wood relief
 * - Marble Palace: Inlaid 8-point rose-gold Roman star with faceted diamond core
 * - Midnight Cyber: Luminous holographic energy node with cyan hex pulse
 * - Classic Kingdom: Golden tournament champion coronet star
 */
const ThematicSafeStarIcon: React.FC<{ themeId: BoardThemeId; fillClass?: string }> = React.memo(
  ({ themeId, fillClass }) => {
    if (themeId === 'royal-wood') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow">
          <circle cx="12" cy="12" r="10.5" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
          <polygon points="12,3.5 14.5,9 20.5,9.5 16,13.5 17.5,19.5 12,16 6.5,19.5 8,13.5 3.5,9.5 9.5,9" fill="#fef08a" stroke="#d97706" strokeWidth="0.6" />
          <circle cx="12" cy="12" r="2" fill="#78350f" />
        </svg>
      );
    }
    if (themeId === 'marble-palace') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow">
          <circle cx="12" cy="12" r="10" fill="#fff1f2" stroke="#fda4af" strokeWidth="1.5" />
          <polygon points="12,3 14.5,9.5 21,12 14.5,14.5 12,21 9.5,14.5 3,12 9.5,9.5" fill="#f43f5e" />
          <circle cx="12" cy="12" r="2.5" fill="#ffffff" stroke="#fda4af" strokeWidth="0.5" />
        </svg>
      );
    }
    if (themeId === 'midnight-neon') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow-[0_0_6px_#06b6d4]">
          <polygon points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5" fill="#030712" stroke="#06b6d4" strokeWidth="1.8" />
          <polygon points="12,5 14,10 19,10 15,13.5 16.5,18.5 12,15.5 7.5,18.5 9,13.5 5,10 10,10" fill="#22d3ee" />
          <circle cx="12" cy="12" r="2" fill="#ec4899" />
        </svg>
      );
    }
    // Classic Kingdom
    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4 drop-shadow">
        <polygon points="12,2 15,8.5 22,9.5 17,14.5 18.5,21.5 12,18 5.5,21.5 7,14.5 2,9.5 9,8.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        <circle cx="12" cy="12" r="2.5" fill="#fef08a" />
      </svg>
    );
  }
);
ThematicSafeStarIcon.displayName = 'ThematicSafeStarIcon';

/**
 * 4 Bespoke Thematic Center Goal Hubs:
 * - Royal Teakwood: Hand-carved Burmese Marquetry Inlay with brass compass rose
 * - Marble Palace: Carrara Crystal & Rose-Gold Prism Mosaic with imperial laurel
 * - Midnight Cyber: Holographic Quantum Reactor Hub with cybernetic laser lines
 * - Classic Kingdom: Grand Tournament Championship Crest with royal sunburst
 */
const ThematicCenterGoal: React.FC<{
  themeId: BoardThemeId;
  dividerColor: string;
}> = React.memo(({ themeId, dividerColor }) => {
  if (themeId === 'royal-wood') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        <defs>
          <radialGradient id="teak-blue" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#172554" />
          </radialGradient>
          <radialGradient id="teak-red" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#881337" />
            <stop offset="100%" stopColor="#4c0519" />
          </radialGradient>
          <radialGradient id="teak-green" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#14532d" />
            <stop offset="100%" stopColor="#052e16" />
          </radialGradient>
          <radialGradient id="teak-gold" cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>
          <radialGradient id="brass-finial" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#78350f" />
          </radialGradient>
        </defs>
        {/* 4 Rich Wood Marquetry Quadrants */}
        <polygon points="0,0 50,50 0,100" fill="url(#teak-blue)" stroke="#451a03" strokeWidth="0.5" />
        <polygon points="0,0 100,0 50,50" fill="url(#teak-red)" stroke="#451a03" strokeWidth="0.5" />
        <polygon points="100,0 100,100 50,50" fill="url(#teak-green)" stroke="#451a03" strokeWidth="0.5" />
        <polygon points="0,100 100,100 50,50" fill="url(#teak-gold)" stroke="#451a03" strokeWidth="0.5" />

        {/* Polished Routered Brass Inlay Dividers */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#f59e0b" strokeWidth="3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#f59e0b" strokeWidth="3" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#78350f" strokeWidth="1" strokeDasharray="2,3" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#78350f" strokeWidth="1" strokeDasharray="2,3" />

        {/* Central 8-Point Brass Compass Rose Medallion */}
        <circle cx="50" cy="50" r="19" fill="#451a03" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="50" cy="50" r="16" fill="#78350f" stroke="#b45309" strokeWidth="1" />
        <polygon points="50,33 53,47 67,50 53,53 50,67 47,53 33,50 47,47" fill="#fef08a" stroke="#d97706" strokeWidth="0.5" />
        <polygon points="50,38 52,48 62,50 52,52 50,62 48,52 38,50 48,48" fill="#b45309" />
        <circle cx="50" cy="50" r="4.5" fill="url(#brass-finial)" stroke="#451a03" strokeWidth="0.8" />
      </svg>
    );
  }

  if (themeId === 'marble-palace') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        <defs>
          <radialGradient id="marble-blue" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
          <radialGradient id="marble-red" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#be123c" />
          </radialGradient>
          <radialGradient id="marble-green" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </radialGradient>
          <radialGradient id="marble-amber" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </radialGradient>
          <radialGradient id="rosegold-medallion" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fff1f2" />
            <stop offset="50%" stopColor="#fecdd3" />
            <stop offset="100%" stopColor="#fda4af" />
          </radialGradient>
        </defs>
        {/* Crystal Faceted Quadrants */}
        <polygon points="0,0 50,50 0,100" fill="url(#marble-blue)" />
        <polygon points="0,0 25,25 0,50" fill="#60a5fa" opacity="0.45" />
        <polygon points="0,50 25,75 0,100" fill="#1e40af" opacity="0.35" />

        <polygon points="0,0 100,0 50,50" fill="url(#marble-red)" />
        <polygon points="0,0 50,0 25,25" fill="#fda4af" opacity="0.45" />
        <polygon points="50,0 100,0 75,25" fill="#9f1239" opacity="0.35" />

        <polygon points="100,0 100,100 50,50" fill="url(#marble-green)" />
        <polygon points="100,0 100,50 75,25" fill="#6ee7b7" opacity="0.45" />
        <polygon points="100,50 100,100 75,75" fill="#065f46" opacity="0.35" />

        <polygon points="0,100 100,100 50,50" fill="url(#marble-amber)" />
        <polygon points="0,100 50,100 25,75" fill="#fde68a" opacity="0.45" />
        <polygon points="50,100 100,100 75,75" fill="#78350f" opacity="0.35" />

        {/* Flush Rose-Gold Dividers */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#f43f5e" strokeWidth="2.8" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#f43f5e" strokeWidth="2.8" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#fff1f2" strokeWidth="1" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#fff1f2" strokeWidth="1" />

        {/* Central Roman Palace Laurel & Diamond Jewel */}
        <circle cx="50" cy="50" r="19" fill="#ffffff" stroke="#fda4af" strokeWidth="2" />
        <circle cx="50" cy="50" r="16" fill="url(#rosegold-medallion)" stroke="#f43f5e" strokeWidth="1" />
        <polygon points="50,37 60,45 50,63 40,45" fill="#ffffff" stroke="#fda4af" strokeWidth="1" />
        <line x1="43" y1="45" x2="57" y2="45" stroke="#f43f5e" strokeWidth="0.8" />
        <line x1="50" y1="37" x2="50" y2="63" stroke="#f43f5e" strokeWidth="0.8" />
      </svg>
    );
  }

  if (themeId === 'midnight-neon') {
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full block">
        <defs>
          <filter id="cyber-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon points="0,0 50,50 0,100" fill="#082f49" />
        <polygon points="0,0 100,0 50,50" fill="#4c0519" />
        <polygon points="100,0 100,100 50,50" fill="#052e16" />
        <polygon points="0,100 100,100 50,50" fill="#451a03" />

        {/* Cyber Circuit Trace Grid Overlay */}
        <line x1="25" y1="0" x2="25" y2="25" stroke="#06b6d4" strokeWidth="1" opacity="0.6" />
        <line x1="75" y1="0" x2="75" y2="25" stroke="#ec4899" strokeWidth="1" opacity="0.6" />
        <line x1="100" y1="25" x2="75" y2="25" stroke="#10b981" strokeWidth="1" opacity="0.6" />
        <line x1="0" y1="75" x2="25" y2="75" stroke="#f59e0b" strokeWidth="1" opacity="0.6" />

        {/* Luminous Laser Beam Dividers with Neon Glow */}
        <line x1="0" y1="0" x2="100" y2="100" stroke="#06b6d4" strokeWidth="2.5" filter="url(#cyber-glow)" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#ec4899" strokeWidth="2.5" filter="url(#cyber-glow)" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#ffffff" strokeWidth="1" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#ffffff" strokeWidth="1" />

        {/* Central Quantum Reactor Singularity Core */}
        <circle cx="50" cy="50" r="20" fill="#030712" stroke="#06b6d4" strokeWidth="2" filter="url(#cyber-glow)" />
        <polygon points="50,33 65,41 65,59 50,67 35,59 35,41" fill="none" stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="3,2" />
        <circle cx="50" cy="50" r="9" fill="#083344" stroke="#ec4899" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="4.5" fill="#22d3ee" filter="url(#cyber-glow)" />
      </svg>
    );
  }

  // Classic Kingdom
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full block">
      <defs>
        <radialGradient id="classic-gold" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="70%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <polygon points="0,0 50,50 0,100" fill="#2563eb" />
      <polygon points="0,0 100,0 50,50" fill="#e11d48" />
      <polygon points="100,0 100,100 50,50" fill="#16a34a" />
      <polygon points="0,100 100,100 50,50" fill="#f59e0b" />

      {/* Gilded Tournament Dividers */}
      <line x1="0" y1="0" x2="100" y2="100" stroke="#fbbf24" strokeWidth="3" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="#fbbf24" strokeWidth="3" />
      <line x1="0" y1="0" x2="100" y2="100" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,3" />
      <line x1="100" y1="0" x2="0" y2="100" stroke="#ffffff" strokeWidth="1" strokeDasharray="2,3" />

      {/* Central Royal Sunburst Champion Medallion */}
      <circle cx="50" cy="50" r="20" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="16.5" fill="url(#classic-gold)" stroke="#b45309" strokeWidth="1" />
      <path
        d="M 40,55 L 60,55 L 60,52 L 58,45 L 54,49 L 50,42 L 46,49 L 42,45 L 40,52 Z"
        fill="#78350f"
      />
      <circle cx="50" cy="41" r="1.5" fill="#fef08a" />
      <circle cx="42" cy="44" r="1.2" fill="#fef08a" />
      <circle cx="58" cy="44" r="1.2" fill="#fef08a" />
    </svg>
  );
});
ThematicCenterGoal.displayName = 'ThematicCenterGoal';

interface LudoBoard3DProps {
  players: PlayerConfig[];
  pawns: Pawn[];
  legalMoves: MoveEvaluation[];
  activeMove: MoveEvaluation | null;
  boardTheme: BoardThemeId;
  actionCameraEnabled?: boolean;
  onSelectPawn: (pawnId: string) => void;
  onMoveAnimationComplete: () => void;
}

export const LudoBoard3D: React.FC<LudoBoard3DProps> = React.memo(
  ({
    players,
    pawns,
    legalMoves,
    activeMove,
    boardTheme,
    actionCameraEnabled = true,
    onSelectPawn,
    onMoveAnimationComplete,
  }) => {
    const themeMeta = useMemo(
      () => BOARD_THEMES.find((t) => t.id === boardTheme) ?? BOARD_THEMES[0],
      [boardTheme]
    );
    const { styleTokens, lighting } = themeMeta;

    const actionZoomLayerRef = useRef<HTMLDivElement>(null);
    const [actionCamBadge, setActionCamBadge] = useState<{
      type: 'cut' | 'home';
      text: string;
      subtitle: string;
    } | null>(null);

    // Dynamic Action Camera Zoom: ONLY triggers when a pawn cuts an opponent or reaches home!
    useEffect(() => {
      if (!actionCameraEnabled || !activeMove) {
        if (actionZoomLayerRef.current) {
          gsap.killTweensOf(actionZoomLayerRef.current);
          gsap.to(actionZoomLayerRef.current, {
            scale: 1,
            transformOrigin: '50% 50%',
            x: 0,
            y: 0,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => setActionCamBadge(null),
          });
        }
        return;
      }

      const isCut = activeMove.willKillPawnIds.length > 0;
      const isHome = activeMove.willReachHome;

      if (!isCut && !isHome) {
        return;
      }

      // Calculate focal target coordinates
      const movingPawn = pawns.find((p) => p.id === activeMove.pawnId);
      const targetGrid = isHome
        ? { row: 7, col: 7 }
        : movingPawn
        ? getPawnGridCoord(
            movingPawn.color,
            activeMove.toStep,
            movingPawn.pawnIndex
          )
        : { row: 7, col: 7 };

      const originX = ((targetGrid.col + 0.5) / 15) * 100;
      const originY = ((targetGrid.row + 0.5) / 15) * 100;

      // Set Action Cam Banner
      if (isCut) {
        setActionCamBadge({
          type: 'cut',
          text: 'ACTION CAM • TOKEN CAPTURE!',
          subtitle: 'Opponent Cut! Bonus Turn Earned',
        });
      } else {
        setActionCamBadge({
          type: 'home',
          text: 'ACTION CAM • REACHED HOME!',
          subtitle: 'Kingdom Triumph! Bonus Turn Earned',
        });
      }

      if (actionZoomLayerRef.current) {
        gsap.killTweensOf(actionZoomLayerRef.current);

        // 1. Smooth rapid zoom in to focus on the target square
        gsap.to(actionZoomLayerRef.current, {
          scale: 1.42,
          transformOrigin: `${originX.toFixed(1)}% ${originY.toFixed(1)}%`,
          duration: 0.38,
          ease: 'power2.out',
        });

        // 2. Impact camera rumble right when the pawn lands
        gsap.to(actionZoomLayerRef.current, {
          duration: 0.22,
          delay: 0.28,
          ease: 'rough',
          keyframes: [
            { x: -3.5, y: 2.5, duration: 0.05 },
            { x: 3, y: -2, duration: 0.05 },
            { x: -2, y: 1.5, duration: 0.05 },
            { x: 0, y: 0, duration: 0.07 },
          ],
        });
      }

      return () => {
        if (actionZoomLayerRef.current) {
          gsap.killTweensOf(actionZoomLayerRef.current);
          gsap.to(actionZoomLayerRef.current, {
            scale: 1,
            transformOrigin: '50% 50%',
            x: 0,
            y: 0,
            duration: 0.35,
            ease: 'power2.inOut',
            onComplete: () => setActionCamBadge(null),
          });
        }
      };
    }, [activeMove, actionCameraEnabled, pawns]);

    const handleDismissActionZoom = () => {
      if (actionZoomLayerRef.current) {
        gsap.killTweensOf(actionZoomLayerRef.current);
        gsap.to(actionZoomLayerRef.current, {
          scale: 1,
          transformOrigin: '50% 50%',
          x: 0,
          y: 0,
          duration: 0.2,
          ease: 'sine.out',
          onComplete: () => setActionCamBadge(null),
        });
      }
    };

    const legalPawnIds = useMemo(
      () => new Set(legalMoves.map((m) => m.pawnId)),
      [legalMoves]
    );

    const activeColors = useMemo(
      () => new Set(players.map((p) => p.color)),
      [players]
    );

    // Stable key so stackMap only recomputes when a pawn actually changes position
    const pawnsPositionKey = useMemo(
      () => pawns.reduce((acc, p) => acc + `${p.id}:${p.step}|`, ''),
      [pawns]
    );

    // Group pawns by grid location so multiple pawns on the same cell stack neatly
    const stackMap = useMemo(() => {
      const groups = new Map<string, string[]>();
      pawns.forEach((p) => {
        const g = getPawnGridCoord(p.color, p.step, p.pawnIndex);
        const key = `${g.row.toFixed(2)},${g.col.toFixed(2)}`;
        const list = groups.get(key) ?? [];
        list.push(p.id);
        groups.set(key, list);
      });
      return groups;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pawnsPositionKey]);

    // Memoize the 15x15 static board track cells so they never re-render during gameplay
    const memoizedTrackCells = useMemo(() => {
      const renderTrackCell = (row: number, col: number) => {
        // Skip cells covered by the 4 6x6 Yards and the 3x3 Center Home Triangle
        if (row < 6 && col < 6) return null;
        if (row < 6 && col > 8) return null;
        if (row > 8 && col < 6) return null;
        if (row > 8 && col > 8) return null;
        if (row >= 6 && row <= 8 && col >= 6 && col <= 8) return null;

        let bg = styleTokens.cellDefaultBg;
        let borderClass = styleTokens.cellBorderClass;
        let icon: React.ReactNode = null;

        // Colored Start Squares
        if (row === 6 && col === 1) {
          bg = 'bg-blue-500 text-white';
          icon = (
            <ThematicSafeStarIcon themeId={boardTheme} fillClass="fill-white text-white" />
          );
        } else if (row === 1 && col === 8) {
          bg = 'bg-rose-500 text-white';
          icon = (
            <ThematicSafeStarIcon themeId={boardTheme} fillClass="fill-white text-white" />
          );
        } else if (row === 8 && col === 13) {
          bg = 'bg-emerald-500 text-white';
          icon = (
            <ThematicSafeStarIcon themeId={boardTheme} fillClass="fill-white text-white" />
          );
        } else if (row === 13 && col === 6) {
          bg = 'bg-amber-400 text-white';
          icon = (
            <ThematicSafeStarIcon themeId={boardTheme} fillClass="fill-white text-white" />
          );
        }
        // Colored Home Stretch Columns
        else if (row === 7 && col >= 1 && col <= 5) {
          bg = 'bg-blue-500';
        } else if (col === 7 && row >= 1 && row <= 5) {
          bg = 'bg-rose-500';
        } else if (row === 7 && col >= 9 && col <= 13) {
          bg = 'bg-emerald-500';
        } else if (col === 7 && row >= 9 && row <= 13) {
          bg = 'bg-amber-400';
        }
        // 4 Star Safe Squares (Theme-adaptive bespoke icons!)
        else if (
          (row === 2 && col === 6) ||
          (row === 6 && col === 12) ||
          (row === 12 && col === 8) ||
          (row === 8 && col === 2)
        ) {
          icon = <ThematicSafeStarIcon themeId={boardTheme} fillClass={styleTokens.safeStarFill} />;
        }
        // Home Stretch Entry Arrows
        else if (row === 7 && col === 0) {
          icon = (
            <ArrowRight className={`w-3.5 h-3.5 text-blue-500 stroke-[2.8] ${boardTheme === 'midnight-neon' ? 'drop-shadow-[0_0_6px_#06b6d4]' : ''}`} />
          );
        } else if (row === 0 && col === 7) {
          icon = (
            <ArrowDown className={`w-3.5 h-3.5 text-rose-500 stroke-[2.8] ${boardTheme === 'midnight-neon' ? 'drop-shadow-[0_0_6px_#ec4899]' : ''}`} />
          );
        } else if (row === 7 && col === 14) {
          icon = (
            <ArrowLeft className={`w-3.5 h-3.5 text-emerald-500 stroke-[2.8] ${boardTheme === 'midnight-neon' ? 'drop-shadow-[0_0_6px_#10b981]' : ''}`} />
          );
        } else if (row === 14 && col === 7) {
          icon = (
            <ArrowUp className={`w-3.5 h-3.5 text-amber-500 stroke-[2.8] ${boardTheme === 'midnight-neon' ? 'drop-shadow-[0_0_6px_#f59e0b]' : ''}`} />
          );
        }

        return (
          <div
            key={`${row}-${col}`}
            style={{
              gridRowStart: row + 1,
              gridColumnStart: col + 1,
            }}
            className={`relative flex items-center justify-center border-[0.5px] ${borderClass} ${bg} shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)]`}
          >
            {icon}
          </div>
        );
      };

      return Array.from({ length: 15 }).map((_, r) =>
        Array.from({ length: 15 }).map((__, c) => renderTrackCell(r, c))
      );
    }, [styleTokens, boardTheme]);

    const renderYardBox = (
      color: PlayerColor,
      gridAreaClass: string,
      gradientClass: string,
      padClass: string
    ) => {
      const isActive = activeColors.has(color);

      // Theme-specific Yard Inner Basin styling:
      let yardInnerStyle: React.CSSProperties = {};
      const yardInnerClass = `absolute inset-[10%] rounded-2xl shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)] transition-all`;
      let tokenPadStyle: React.CSSProperties = {};
      const tokenPadClass = `absolute -translate-x-1/2 -translate-y-1/2 w-[27%] h-[27%] rounded-full border-2 transition-all flex items-center justify-center`;

      if (boardTheme === 'royal-wood') {
        yardInnerStyle = {
          background: 'radial-gradient(circle at 50% 50%, #78350f 0%, #451a03 70%, #291002 100%)',
          border: '2px solid #b45309',
        };
        tokenPadStyle = {
          background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #d97706 70%, #78350f 100%)',
          boxShadow: '0 3px 6px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.4)',
          borderColor: '#b45309',
        };
      } else if (boardTheme === 'marble-palace') {
        yardInnerStyle = {
          background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 65%, #cbd5e1 100%)',
          border: '2px solid #fda4af',
        };
        tokenPadStyle = {
          background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #ffe4e6 70%, #fda4af 100%)',
          boxShadow: '0 3px 6px rgba(159,18,57,0.25), inset 0 2px 4px rgba(255,255,255,0.9)',
          borderColor: '#f43f5e',
        };
      } else if (boardTheme === 'midnight-neon') {
        yardInnerStyle = {
          background: 'radial-gradient(circle at 50% 50%, #0b0f19 0%, #030712 85%, #000000 100%)',
          border: '2px solid #06b6d4',
          boxShadow: 'inset 0 0 15px rgba(6,182,212,0.35)',
        };
        tokenPadStyle = {
          background: 'radial-gradient(circle at 50% 50%, #06b6d433 0%, #090d16 70%, #030712 100%)',
          boxShadow: '0 0 10px rgba(6,182,212,0.6), inset 0 0 6px #22d3ee',
          borderColor: '#22d3ee',
        };
      } else {
        // Classic Kingdom
        yardInnerStyle = {
          background: 'radial-gradient(circle at 50% 50%, #fffdfa 0%, #fef3c7 70%, #fde68a 100%)',
          border: '2px solid #eab308',
        };
        tokenPadStyle = {
          background: 'radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 70%, #b45309 100%)',
          boxShadow: '0 3px 6px rgba(180,83,9,0.35), inset 0 2px 3px rgba(255,255,255,0.7)',
          borderColor: '#b45309',
        };
      }

      return (
        <div
          className={`${gridAreaClass} relative ${
            isActive ? gradientClass : 'bg-slate-300/40 opacity-40'
          } border ${styleTokens.yardBorderClass} shadow-inner transition-opacity overflow-hidden`}
        >
          <div className={yardInnerClass} style={isActive ? yardInnerStyle : undefined} />
          {YARD_PAD_POSITIONS.map(([leftPct, topPct], slotIdx) => (
            <div
              key={`${color}-pad-${slotIdx}`}
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                ...(isActive ? tokenPadStyle : {}),
              }}
              className={`${tokenPadClass} ${
                isActive ? '' : 'bg-slate-300/60 border-slate-300/50'
              }`}
            />
          ))}
        </div>
      );
    };

    return (
      <div className="relative w-full max-w-[430px] mx-auto flex flex-col items-center select-none">
        <div
          onClick={actionCamBadge ? handleDismissActionZoom : undefined}
          className={`relative w-full aspect-square rounded-[28px] p-2 sm:p-2.5 ${styleTokens.outerContainerBg} border-4 ${styleTokens.outerBorderClass} transition-colors duration-300`}
        >
          {/* Thematic Hardware Corner Brackets (Burma Brass / Roman Plinths / Cyber LEDs) */}
          <ThematicCornerDecorations themeId={boardTheme} />

        {/* Dynamic Action Camera Floating Badge */}
        {actionCamBadge && (
          <div
            className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.4)] border border-white/70 flex items-center gap-2 pointer-events-none animate-bounce backdrop-blur-md"
            style={{
              background:
                actionCamBadge.type === 'cut'
                  ? 'linear-gradient(135deg, rgba(225, 29, 72, 0.95), rgba(185, 28, 28, 0.95))'
                  : 'linear-gradient(135deg, rgba(234, 179, 8, 0.95), rgba(217, 119, 6, 0.95))',
            }}
          >
            <span className="text-sm">
              {actionCamBadge.type === 'cut' ? '⚡' : '👑'}
            </span>
            <div className="flex flex-col text-left leading-tight">
              <span className="text-[10px] font-black tracking-wider uppercase text-white drop-shadow">
                {actionCamBadge.text}
              </span>
              <span className="text-[9px] font-bold text-white/85">
                {actionCamBadge.subtitle}
              </span>
            </div>
          </div>
        )}

        {/* Overflow boundary wrapper so zoom stays cleanly inside rounded board frame */}
        <div className="relative w-full h-full rounded-[20px] overflow-hidden">
          <div
            ref={actionZoomLayerRef}
            className="relative w-full h-full will-change-transform"
          >
            {/* 15x15 Underlying Tactile Ludo Board */}
            <div
              className={`relative w-full h-full grid grid-cols-15 grid-rows-15 border-2 ${styleTokens.trackBorderClass} ${styleTokens.trackBg} transition-colors duration-300`}
              style={{
                gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
                gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
              }}
            >
              {/* Top-Left BLUE Yard (rows 1..6, cols 1..6) */}
              {renderYardBox(
                'blue',
                'col-start-1 col-end-7 row-start-1 row-end-7 rounded-tl-[18px]',
                'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600',
                'bg-gradient-to-b from-blue-400 to-blue-600'
              )}

              {/* Top-Right RED Yard (rows 1..6, cols 10..15) */}
              {renderYardBox(
                'red',
                'col-start-10 col-end-16 row-start-1 row-end-7 rounded-tr-[18px]',
                'bg-gradient-to-br from-rose-400 via-rose-500 to-red-600',
                'bg-gradient-to-b from-rose-400 to-red-600'
              )}

              {/* Bottom-Left YELLOW Yard (rows 10..15, cols 1..6) */}
              {renderYardBox(
                'yellow',
                'col-start-1 col-end-7 row-start-10 row-end-16 rounded-bl-[18px]',
                'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500',
                'bg-gradient-to-b from-amber-300 to-amber-500'
              )}

              {/* Bottom-Right GREEN Yard (rows 10..15, cols 10..15) */}
              {renderYardBox(
                'green',
                'col-start-10 col-end-16 row-start-10 row-end-16 rounded-br-[18px]',
                'bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600',
                'bg-gradient-to-b from-emerald-400 to-green-600'
              )}

              {/* Center 3x3 Home Goal Triangles (rows 7..9, cols 7..9) */}
              <div className={`col-start-7 col-end-10 row-start-7 row-end-10 relative overflow-hidden border ${styleTokens.trackBorderClass} shadow-inner`}>
                <ThematicCenterGoal themeId={boardTheme} dividerColor={styleTokens.homeDividerColor} />
              </div>

              {/* All 52 Track Cells + 20 Home Stretch Cells */}
              {memoizedTrackCells}
            </div>

        {/* 3D Three.js / @react-three/fiber Collectible Token Layer Aligned 1:1 with the 15x15 Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <Canvas
            orthographic
            shadows
            dpr={[1, 2]}
            camera={{
              position: [0, BOARD_CAM_Y, BOARD_CAM_Z],
              zoom: 1,
              near: 0.1,
              far: 100,
            }}
            onCreated={({ camera }) => {
              camera.lookAt(0, 0, 0);
            }}
            gl={{ alpha: true, antialias: true }}
          >
            <StudioEnvironment intensity={lighting.exposure} />
            <ambientLight
              intensity={lighting.ambientIntensity}
              color={lighting.ambientColor}
            />
            <directionalLight
              position={[6, 14, 8]}
              intensity={lighting.keyIntensity}
              color={lighting.keyColor}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-left={-9}
              shadow-camera-right={9}
              shadow-camera-top={9}
              shadow-camera-bottom={-9}
              shadow-bias={-0.0006}
            />
            <pointLight
              position={[-6, 8, -4]}
              intensity={lighting.rimIntensity}
              color={lighting.rimColor}
            />
            {lighting.secondaryRimColor && (
              <pointLight
                position={[6, 8, -4]}
                intensity={lighting.secondaryRimIntensity ?? 0.45}
                color={lighting.secondaryRimColor}
              />
            )}

            {/* Transparent Shadow-Catcher Floor Plane so jumping tokens cast real dynamic shadows */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.004, 0]}
              receiveShadow
            >
              <planeGeometry args={[16, 16]} />
              <shadowMaterial
                transparent
                opacity={boardTheme === 'midnight-neon' ? 0.22 : 0.28}
                color="#0f172a"
              />
            </mesh>

            <Suspense fallback={null}>
              <AutoZoomOrthographicController />
              <StepEffects3D />
              {pawns.map((pawn) => {
                const player = players[pawn.playerIndex] ?? players[0];
                const g = getPawnGridCoord(
                  pawn.color,
                  pawn.step,
                  pawn.pawnIndex
                );
                const key = `${g.row.toFixed(2)},${g.col.toFixed(2)}`;
                const stackList = stackMap.get(key) ?? [pawn.id];
                const stackIndex = Math.max(0, stackList.indexOf(pawn.id));
                const isSelectable = legalPawnIds.has(pawn.id);
                // BUG-02 FIX: Only the pawn executing activeMove fires onMoveAnimationComplete.
                // All other pawns get a no-op so simultaneous callbacks cannot double-trigger
                // ANIMATION_COMPLETE in the state machine.
                const handleComplete =
                  activeMove?.pawnId === pawn.id ? onMoveAnimationComplete : () => {};

                return (
                  <AnimatedPawn3DNode
                    key={pawn.id}
                    pawn={pawn}
                    player={player}
                    stackIndex={stackIndex}
                    stackTotal={stackList.length}
                    isSelectable={isSelectable}
                    activeMove={activeMove}
                    onSelectPawn={onSelectPawn}
                    onAnimationComplete={handleComplete}
                  />
                );
              })}
            </Suspense>
          </Canvas>
        </div>

        {/* Responsive 2D Touch/Click Hit Targets for Legal Movable Pawns */}
        {legalMoves.length > 0 && !activeMove && (
          <div className="absolute inset-0 pointer-events-none">
            {pawns
              .filter((p) => legalPawnIds.has(p.id))
              .map((pawn) => {
                const coord = getPawnGridCoord(
                  pawn.color,
                  pawn.step,
                  pawn.pawnIndex
                );
                const leftPct = ((coord.col + 0.5) / 15) * 100;
                const topPct = ((coord.row + 0.5) / 15) * 100;
                const palette = COLOR_PALETTE[pawn.color];

                return (
                  <button
                    key={`hit-${pawn.id}`}
                    type="button"
                    onClick={() => {
                      soundManager.play('ui_click');
                      onSelectPawn(pawn.id);
                    }}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                    }}
                    title={`Move ${palette.label} Token`}
                    className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full cursor-pointer flex items-center justify-center group focus:outline-none"
                  >
                    <span className="w-9 h-9 rounded-full border-2 border-amber-300 bg-amber-400/25 animate-ping" />
                  </button>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Active Thematic Tactical Rule Pill */}
        <div className="mt-1.5 w-full px-3 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-white/15 flex items-center justify-between text-xs shadow-md">
          <span className="font-black text-amber-300 flex items-center gap-1.5 shrink-0 text-[11px]">
            <span>{themeMeta.perk.badge}</span>
          </span>
          <span className="text-[10px] sm:text-[11px] text-slate-200 font-medium truncate ml-2 text-right">
            {themeMeta.perk.description}
          </span>
        </div>
      </div>
    );
  }
);

LudoBoard3D.displayName = 'LudoBoard3D';

/**
 * Calibrates the OrthographicCamera frustum to [-7.5 .. +7.5] horizontally and
 * [-7.5 * cos(theta) .. +7.5 * cos(theta)] vertically so every floor cell (row, col)
 * maps with 0.0px foreshortening error onto the flat 15x15 CSS Grid below.
 */
const AutoZoomOrthographicController: React.FC = () => {
  const { camera, size } = useThree();
  useEffect(() => {
    if ('zoom' in camera) {
      const ortho = camera as THREE.OrthographicCamera;
      ortho.position.set(0, BOARD_CAM_Y, BOARD_CAM_Z);
      ortho.left = -7.5;
      ortho.right = 7.5;
      ortho.top = 7.5 * BOARD_CAM_COS;
      ortho.bottom = -7.5 * BOARD_CAM_COS;
      ortho.zoom = 1;
      ortho.lookAt(0, 0, 0);
      ortho.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);
  return null;
};
