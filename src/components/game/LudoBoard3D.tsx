import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { soundManager } from '../../audio/soundManager';
import {
  BOARD_THEMES,
  COLOR_PALETTE,
  getPawnGridCoord,
} from '../../engine/boardConfig';
import {
  BoardThemeId,
  MoveEvaluation,
  Pawn,
  PlayerConfig,
} from '../../types/game';
import { StudioEnvironment } from '../three/StudioEnvironment';
import { ThematicBoard3D } from '../three/ThematicBoard3D';
import { StepEffects3D } from '../three/StepEffects3D';
import {
  AutoZoomOrthographicController,
  BOARD_CAM_Y,
  BOARD_CAM_Z,
} from './board/controllers/AutoZoomOrthographicController';
import { ThematicCornerDecorations } from './board/decorations/ThematicCornerDecorations';
import { ThematicSafeStarIcon } from './board/decorations/ThematicSafeStarIcon';
import { ThematicCenterGoal } from './board/decorations/ThematicCenterGoal';
import { TactileYardBox } from './board/yards/TactileYardBox';
import { AnimatedPawn3DNode } from './board/pawns/AnimatedPawn3DNode';

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

        // Subtle, butter-smooth visual focus (1.04x) with zero compositor rumble
        gsap.to(actionZoomLayerRef.current, {
          scale: 1.04,
          transformOrigin: `${originX.toFixed(1)}% ${originY.toFixed(1)}%`,
          duration: 0.32,
          ease: 'power2.out',
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
            duration: 0.25,
            ease: 'sine.out',
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
          duration: 0.18,
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
              className="relative w-full h-full"
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
                <TactileYardBox
                  color="blue"
                  gridAreaClass="col-start-1 col-end-7 row-start-1 row-end-7 rounded-tl-[18px]"
                  gradientClass="bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600"
                  isActive={activeColors.has('blue')}
                  boardTheme={boardTheme}
                  yardBorderClass={styleTokens.yardBorderClass}
                />

                {/* Top-Right RED Yard (rows 1..6, cols 10..15) */}
                <TactileYardBox
                  color="red"
                  gridAreaClass="col-start-10 col-end-16 row-start-1 row-end-7 rounded-tr-[18px]"
                  gradientClass="bg-gradient-to-br from-rose-400 via-rose-500 to-red-600"
                  isActive={activeColors.has('red')}
                  boardTheme={boardTheme}
                  yardBorderClass={styleTokens.yardBorderClass}
                />

                {/* Bottom-Left YELLOW Yard (rows 10..15, cols 1..6) */}
                <TactileYardBox
                  color="yellow"
                  gridAreaClass="col-start-1 col-end-7 row-start-10 row-end-16 rounded-bl-[18px]"
                  gradientClass="bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500"
                  isActive={activeColors.has('yellow')}
                  boardTheme={boardTheme}
                  yardBorderClass={styleTokens.yardBorderClass}
                />

                {/* Bottom-Right GREEN Yard (rows 10..15, cols 10..15) */}
                <TactileYardBox
                  color="green"
                  gridAreaClass="col-start-10 col-end-16 row-start-10 row-end-16 rounded-br-[18px]"
                  gradientClass="bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600"
                  isActive={activeColors.has('green')}
                  boardTheme={boardTheme}
                  yardBorderClass={styleTokens.yardBorderClass}
                />

                {/* Center 3x3 Home Goal Triangles (rows 7..9, cols 7..9) */}
                <div className={`col-start-7 col-end-10 row-start-7 row-end-10 relative overflow-hidden border ${styleTokens.trackBorderClass} shadow-inner`}>
                  <ThematicCenterGoal themeId={boardTheme} dividerColor={styleTokens.homeDividerColor} />
                </div>

                {/* All 52 Track Cells + 20 Home Stretch Cells */}
                {memoizedTrackCells}
              </div>

              {/* 3D Three.js / @react-three/fiber Collectible Token & Thematic Board Layer */}
              <div className="absolute inset-0 pointer-events-none">
                <Canvas
                  orthographic
                  shadows
                  dpr={[1, 1.5]}
                  camera={{
                    position: [0, BOARD_CAM_Y, BOARD_CAM_Z],
                    zoom: 1,
                    near: 0.1,
                    far: 100,
                  }}
                  onCreated={({ camera }) => {
                    camera.lookAt(0, 0, 0);
                  }}
                  gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
                >
                  <StudioEnvironment intensity={1.12} />
                  <ambientLight
                    intensity={lighting.ambientIntensity ?? 0.65}
                    color={lighting.ambientColor}
                  />
                  <directionalLight
                    position={[5, 14, 6]}
                    intensity={lighting.keyIntensity ?? 1.4}
                    color={lighting.keyColor}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                    shadow-camera-left={-8}
                    shadow-camera-right={8}
                    shadow-camera-top={8}
                    shadow-camera-bottom={-8}
                    shadow-camera-near={1}
                    shadow-camera-far={25}
                    shadow-bias={-0.0006}
                  />
                  <pointLight
                    position={[-6, 8, -4]}
                    intensity={0.4}
                    color={lighting.rimColor}
                  />

                  <Suspense fallback={null}>
                    <AutoZoomOrthographicController />
                    <ThematicBoard3D themeId={boardTheme} />
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
                      // Only the pawn executing activeMove fires onMoveAnimationComplete.
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
                          <span className="w-9 h-9 rounded-full border-2 border-amber-300 bg-amber-400/35 shadow-[0_0_12px_#fbbf24] transition-transform group-hover:scale-110 group-active:scale-95" />
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
