import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  hopPawn3D,
  reverseTraversePawn3D,
} from '../../../../animations/pawnHop3D';
import { soundManager } from '../../../../audio/soundManager';
import {
  buildReverseStepPath,
  getPawnGridCoord,
  gridToWorld3D,
} from '../../../../engine/boardConfig';
import {
  MoveEvaluation,
  Pawn,
  PlayerConfig,
} from '../../../../types/game';
import { haptics, triggerHomeReachConfetti } from '../../../../utils/haptics';
import { stepEffectsManager } from '../../../three/StepEffects3D';
import { Token3DModel } from '../../../three/Token3DModel';

export interface AnimatedPawn3DNodeProps {
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

export const AnimatedPawn3DNode: React.FC<AnimatedPawn3DNodeProps> = React.memo(
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
    const shadowMeshRef = useRef<THREE.Mesh>(null);

    const targetGrid = useMemo(
      () => getPawnGridCoord(pawn.color, pawn.step, pawn.pawnIndex),
      [pawn.color, pawn.step, pawn.pawnIndex]
    );

    const targetWorld = useMemo(
      () => gridToWorld3D(targetGrid, stackIndex, stackTotal),
      [targetGrid, stackIndex, stackTotal]
    );

    // Frame-rate independent zero-allocation shadow grounding:
    // Keeps contact shadow pinned to board surface (y = 0.01) while scaling & diffusing with hop height
    useFrame(() => {
      if (groupRef.current && shadowMeshRef.current) {
        const y = groupRef.current.position.y;
        shadowMeshRef.current.position.y = -y + 0.01;
        const shadowScale = Math.max(0.38, 1 - y * 0.42);
        shadowMeshRef.current.scale.set(tokenScale * shadowScale, tokenScale * shadowScale, 1);
        const mat = shadowMeshRef.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = Math.max(0.06, 0.28 * (1 - y * 0.5));
        }
      }
    });

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
          onStepLand: (coord, _stepIdx, isLastStep) => {
            if (isLastStep) {
              stepEffectsManager.trigger(
                coord.x,
                coord.z,
                player.tokenSkin,
                pawn.color
              );
            }
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
        // Store tween reference and kill it on cleanup to prevent zombie tweens accumulating
        const alignTween = gsap.to(groupRef.current.position, {
          x: targetWorld.x,
          y: 0,
          z: targetWorld.z,
          duration: 0.22,
          ease: 'sine.out',
        });
        return () => {
          alignTween.kill();
        };
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
        {/* Dynamic Grounded Ambient Occlusion Contact Disc (Diffuses & Pinned to Ground During Hop) */}
        <mesh
          ref={shadowMeshRef}
          geometry={CONTACT_SHADOW_GEO}
          position={[0, 0.01, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={tokenScale}
        >
          <meshBasicMaterial
            color="#090d16"
            transparent
            opacity={0.28}
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
