import { Canvas, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Star } from 'lucide-react';
import React, { Suspense, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  hopPawn3D,
  reverseTraversePawn3D,
} from '../../animations/pawnHop3D';
import { soundManager } from '../../audio/soundManager';
import {
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
          stepsCoordinates: coords,
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
        gsap.to(groupRef.current.position, {
          x: targetWorld.x,
          y: 0,
          z: targetWorld.z,
          duration: 0.22,
          ease: 'sine.out',
        });
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

interface LudoBoard3DProps {
  players: PlayerConfig[];
  pawns: Pawn[];
  legalMoves: MoveEvaluation[];
  activeMove: MoveEvaluation | null;
  boardTheme: BoardThemeId;
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
    onSelectPawn,
    onMoveAnimationComplete,
  }) => {
    const isDarkTheme = boardTheme === 'midnight-neon';

    const legalPawnIds = useMemo(
      () => new Set(legalMoves.map((m) => m.pawnId)),
      [legalMoves]
    );

    // Stable key so stackMap only recomputes when a pawn actually changes position
    const pawnsPositionKey = useMemo(
      () => pawns.map((p) => `${p.id}:${p.step}`).join('|'),
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

        let bg = isDarkTheme ? 'bg-slate-800/95' : 'bg-white';
        let icon: React.ReactNode = null;

        // Colored Start Squares
        if (row === 6 && col === 1) {
          bg = 'bg-blue-500 text-white';
          icon = (
            <Star className="w-3.5 h-3.5 fill-white text-white drop-shadow" />
          );
        } else if (row === 1 && col === 8) {
          bg = 'bg-rose-500 text-white';
          icon = (
            <Star className="w-3.5 h-3.5 fill-white text-white drop-shadow" />
          );
        } else if (row === 8 && col === 13) {
          bg = 'bg-emerald-500 text-white';
          icon = (
            <Star className="w-3.5 h-3.5 fill-white text-white drop-shadow" />
          );
        } else if (row === 13 && col === 6) {
          bg = 'bg-amber-400 text-white';
          icon = (
            <Star className="w-3.5 h-3.5 fill-white text-white drop-shadow" />
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
        // 4 Star Safe Squares
        else if (row === 2 && col === 6) {
          icon = <Star className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />;
        } else if (row === 6 && col === 12) {
          icon = (
            <Star className="w-3.5 h-3.5 fill-emerald-400 text-emerald-500" />
          );
        } else if (row === 12 && col === 8) {
          icon = <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />;
        } else if (row === 8 && col === 2) {
          icon = <Star className="w-3.5 h-3.5 fill-blue-400 text-blue-500" />;
        }
        // Home Stretch Entry Arrows
        else if (row === 7 && col === 0) {
          icon = (
            <ArrowRight className="w-3.5 h-3.5 text-blue-500 stroke-[2.8]" />
          );
        } else if (row === 0 && col === 7) {
          icon = (
            <ArrowDown className="w-3.5 h-3.5 text-rose-500 stroke-[2.8]" />
          );
        } else if (row === 7 && col === 14) {
          icon = (
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-500 stroke-[2.8]" />
          );
        } else if (row === 14 && col === 7) {
          icon = (
            <ArrowUp className="w-3.5 h-3.5 text-amber-500 stroke-[2.8]" />
          );
        }

        return (
          <div
            key={`${row}-${col}`}
            style={{
              gridRowStart: row + 1,
              gridColumnStart: col + 1,
            }}
            className={`relative flex items-center justify-center border-[0.5px] ${
              isDarkTheme ? 'border-slate-700' : 'border-slate-200/90'
            } ${bg} shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]`}
          >
            {icon}
          </div>
        );
      };

      return Array.from({ length: 15 }).map((_, r) =>
        Array.from({ length: 15 }).map((__, c) => renderTrackCell(r, c))
      );
    }, [isDarkTheme]);

    const renderYardBox = (
      color: PlayerColor,
      gridAreaClass: string,
      gradientClass: string,
      padClass: string
    ) => (
      <div
        className={`${gridAreaClass} relative ${gradientClass} border border-white/40 shadow-inner`}
      >
        <div
          className={`absolute inset-[11%] rounded-2xl ${
            isDarkTheme ? 'bg-slate-900/90' : 'bg-white/92'
          } shadow-[inset_0_3px_6px_rgba(0,0,0,0.12)]`}
        />
        {YARD_PAD_POSITIONS.map(([leftPct, topPct], slotIdx) => (
          <div
            key={`${color}-pad-${slotIdx}`}
            style={{
              left: `${leftPct}%`,
              top: `${topPct}%`,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-[26.5%] h-[26.5%] rounded-full ${padClass} shadow-[inset_0_3px_6px_rgba(0,0,0,0.22),0_2px_4px_rgba(255,255,255,0.8)] border-2 border-white/85`}
          />
        ))}
      </div>
    );

    return (
      <div className="relative w-full aspect-square max-w-[430px] mx-auto rounded-[28px] p-2 sm:p-2.5 bg-gradient-to-b from-white via-slate-50 to-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.24),inset_0_2px_4px_rgba(255,255,255,1)] border-4 border-white select-none">
        {/* 15x15 Underlying Tactile Ludo Board */}
        <div
          className={`relative w-full h-full rounded-[20px] overflow-hidden grid grid-cols-15 grid-rows-15 border-2 ${
            isDarkTheme
              ? 'border-slate-700 bg-slate-900'
              : 'border-slate-300 bg-white'
          }`}
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
          <div className="col-start-7 col-end-10 row-start-7 row-end-10 relative overflow-hidden border border-slate-300 shadow-inner">
            <svg viewBox="0 0 100 100" className="w-full h-full block">
              <polygon points="0,0 50,50 0,100" fill="#2563eb" />
              <polygon points="0,0 100,0 50,50" fill="#e11d48" />
              <polygon points="100,0 100,100 50,50" fill="#16a34a" />
              <polygon points="0,100 100,100 50,50" fill="#f59e0b" />
              <line
                x1="0"
                y1="0"
                x2="100"
                y2="100"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
              <line
                x1="100"
                y1="0"
                x2="0"
                y2="100"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </svg>
          </div>

          {/* All 52 Track Cells + 20 Home Stretch Cells */}
          {memoizedTrackCells}
        </div>

        {/* 3D Three.js / @react-three/fiber Collectible Token Layer Aligned 1:1 with the 15x15 Grid */}
        <div className="absolute inset-2 sm:inset-2.5 pointer-events-none">
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
            <StudioEnvironment intensity={1.18} />
            <ambientLight intensity={0.45} />
            <hemisphereLight
              args={['#ffffff', '#cbd5e1', 0.55]}
              position={[0, 15, 0]}
            />
            <directionalLight
              position={[6, 15, 8]}
              intensity={2.1}
              castShadow
              shadow-mapSize={[1024, 1024]}
              shadow-camera-left={-9}
              shadow-camera-right={9}
              shadow-camera-top={9}
              shadow-camera-bottom={-9}
              shadow-bias={-0.0008}
            />
            <pointLight
              position={[-6, 8, -4]}
              intensity={0.75}
              color="#fde047"
            />

            {/* Transparent Shadow-Catcher Floor Plane so jumping tokens cast real dynamic shadows */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[0, 0.004, 0]}
              receiveShadow
            >
              <planeGeometry args={[16, 16]} />
              <shadowMaterial transparent opacity={0.28} color="#0f172a" />
            </mesh>

            <Suspense fallback={null}>
              <AutoZoomOrthographicController />
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
                    onAnimationComplete={onMoveAnimationComplete}
                  />
                );
              })}
            </Suspense>
          </Canvas>
        </div>

        {/* Responsive 2D Touch/Click Hit Targets for Legal Movable Pawns */}
        {legalMoves.length > 0 && !activeMove && (
          <div className="absolute inset-2 sm:inset-2.5 pointer-events-none">
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
