import gsap from 'gsap';
import * as THREE from 'three';
import { soundManager } from '../audio/soundManager';
import { PlayerColor, TokenSkinId, WorldCoord3D } from '../types/game';
import { haptics } from '../utils/haptics';

/**
 * Animates a 3D Token (`THREE.Group`) sequentially across `stepsCoordinates`
 * using fluid, physics-grounded GSAP parabolic arcs:
 * - Natural board-game pacing (~0.27s - 0.32s per square) so every jump arc is clearly visible
 * - Seamless landing-cushion-to-takeoff-stretch transitions between consecutive squares (zero stutter)
 * - True 2-part gravity parabola (`sine.out` ascent + `sine.in` descent to exact y = 0)
 * - Solid, wobble-free crisp landing on the destination square
 */
export function hopPawn3D(params: {
  group: THREE.Group;
  skin: TokenSkinId;
  color?: PlayerColor;
  stepsCoordinates: WorldCoord3D[];
  onStepLand?: (coord: WorldCoord3D, stepIndex: number, isLastStep: boolean) => void;
  onComplete: () => void;
}): gsap.core.Timeline {
  const { group, skin, stepsCoordinates, onStepLand, onComplete } = params;

  gsap.killTweensOf(group.position);
  gsap.killTweensOf(group.rotation);
  gsap.killTweensOf(group.scale);

  // Normalize rotation before starting move
  group.rotation.x = 0;
  group.rotation.z = 0;
  group.rotation.y = group.rotation.y % (Math.PI * 2);

  const totalSteps = stepsCoordinates.length;
  // Slight organic tempo scaling for longer 5-6 step runs while keeping every hop smooth & readable
  const paceFactor = totalSteps >= 5 ? 0.86 : totalSteps >= 3 ? 0.92 : 1.0;

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.killTweensOf(group.position);
      gsap.killTweensOf(group.rotation);
      gsap.killTweensOf(group.scale);
      group.position.y = 0;
      group.rotation.set(0, 0, 0);
      group.scale.set(1, 1, 1);
      onComplete();
    },
  });

  // Brief anticipation crouch before the first hop
  tl.to(group.scale, {
    x: 1.08,
    y: 0.9,
    z: 1.08,
    duration: 0.055,
    ease: 'sine.out',
  });

  let cursorTime = 0.055;

  stepsCoordinates.forEach((coord, idx) => {
    const isLastStep = idx === totalSteps - 1;
    const stepPitch = 0.96 + idx * 0.045;
    const wagDir = idx % 2 === 0 ? 1 : -1;

    // Skin-specific base duration & jump apex height
    let baseStepDur = 0.28;
    let jumpApex = 0.62;

    switch (skin) {
      case 'classic':
        baseStepDur = 0.28;
        jumpApex = 0.62;
        break;
      case 'knight':
        baseStepDur = 0.31;
        jumpApex = 0.82;
        break;
      case 'dog':
        baseStepDur = 0.27;
        jumpApex = 0.58;
        break;
      case 'cat':
        baseStepDur = 0.29;
        jumpApex = 0.72;
        break;
      case 'panda':
        baseStepDur = 0.3;
        jumpApex = 0.6;
        break;
      case 'robot':
        baseStepDur = 0.26;
        jumpApex = 0.48;
        break;
      case 'astronaut':
        baseStepDur = 0.33;
        jumpApex = 0.8;
        break;
      case 'unicorn':
        baseStepDur = 0.3;
        jumpApex = 0.76;
        break;
      case 'bamboo-panda':
        baseStepDur = 0.3;
        jumpApex = 0.64;
        break;
      case 'cyber-robot':
        baseStepDur = 0.25;
        jumpApex = 0.56;
        break;
      case 'astronomer':
        baseStepDur = 0.33;
        jumpApex = 0.84;
        break;
      case 'star-unicorn':
        baseStepDur = 0.31;
        jumpApex = 0.82;
        break;
      case 'fire-dragon':
        baseStepDur = 0.32;
        jumpApex = 0.88;
        break;
      case 'ice-dragon':
        baseStepDur = 0.31;
        jumpApex = 0.84;
        break;
      case 'pirate':
        baseStepDur = 0.28;
        jumpApex = 0.68;
        break;
      case 'magician':
        baseStepDur = 0.31;
        jumpApex = 0.78;
        break;
      case 'alien':
        baseStepDur = 0.29;
        jumpApex = 0.8;
        break;
    }

    const dur = baseStepDur * paceFactor;
    const half = dur * 0.5;
    const t0 = cursorTime;

    // 1. Smooth horizontal translation (no intermediate overshoot)
    tl.to(
      group.position,
      {
        x: coord.x,
        z: coord.z,
        duration: dur,
        ease: skin === 'robot' ? 'power1.inOut' : 'sine.inOut',
        onStart: () => {
          soundManager.play('pawn_step', stepPitch);
          haptics.stepHop();
        },
      },
      t0
    );

    // 2. True two-part parabolic gravity arc (ascent -> apex -> descent to y = 0)
    tl.to(
      group.position,
      {
        y: jumpApex,
        duration: half,
        ease: 'sine.out',
      },
      t0
    ).to(
      group.position,
      {
        y: 0,
        duration: half,
        ease: 'sine.in',
        onComplete: () => {
          onStepLand?.(coord, idx, isLastStep);
        },
      },
      t0 + half
    );

    // 3. Seamless volume-preserving Takeoff Stretch -> Mid-air -> Landing Cushion
    tl.to(
      group.scale,
      {
        x: 0.93,
        y: 1.11,
        z: 0.93,
        duration: half * 0.85,
        ease: 'sine.out',
      },
      t0
    ).to(
      group.scale,
      {
        x: 1.1,
        y: 0.88,
        z: 1.1,
        duration: half * 0.65,
        ease: 'sine.in',
      },
      t0 + dur - half * 0.65
    );

    // 4. Skin-specific rotational gait + final landing signature flourish
    switch (skin) {
      case 'classic': {
        tl.to(
          group.rotation,
          { x: 0.22, duration: half, ease: 'sine.out' },
          t0
        ).to(
          group.rotation,
          { x: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'knight': {
        // Noble cavalier rear-back on takeoff, plunging crest at landing
        tl.to(
          group.rotation,
          { x: -0.28, duration: half * 0.75, ease: 'sine.out' },
          t0
        )
          .to(
            group.rotation,
            { x: 0.24, duration: half * 0.9, ease: 'sine.inOut' },
            t0 + half * 0.75
          )
          .to(
            group.rotation,
            { x: 0, duration: half * 0.35, ease: 'sine.out' },
            t0 + dur - half * 0.35
          );
        break;
      }

      case 'dog': {
        // Playful puppy side-to-side sway & happy ear bounce
        tl.to(
          group.rotation,
          {
            z: 0.2 * wagDir,
            y: 0.18 * wagDir,
            x: 0.14,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          {
            z: 0,
            y: 0,
            x: 0,
            duration: half,
            ease: 'sine.inOut',
          },
          t0 + half
        );
        break;
      }

      case 'cat': {
        tl.to(
          group.rotation,
          {
            z: 0.16 * wagDir,
            x: 0.18,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { z: 0, x: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'panda': {
        tl.to(
          group.rotation,
          {
            z: 0.24 * wagDir,
            x: 0.2,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { z: 0, x: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'robot': {
        // Precision jet-thruster forward tilt + crisp servo turn
        tl.to(
          group.rotation,
          {
            x: 0.22,
            z: 0.08 * wagDir,
            duration: half,
            ease: 'power1.out',
          },
          t0
        ).to(
          group.rotation,
          {
            x: 0,
            z: 0,
            duration: half,
            ease: 'power1.inOut',
          },
          t0 + half
        );
        break;
      }

      case 'astronaut': {
        // Dreamy zero-G lunar float tilt
        tl.to(
          group.rotation,
          {
            z: 0.2 * wagDir,
            x: -0.18,
            y: 0.15 * wagDir,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          {
            z: 0,
            x: 0,
            y: 0,
            duration: half,
            ease: 'sine.inOut',
          },
          t0 + half
        );
        break;
      }

      case 'unicorn': {
        tl.to(
          group.rotation,
          {
            x: -0.24,
            z: 0.14 * wagDir,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { x: 0, z: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'bamboo-panda': {
        tl.to(
          group.rotation,
          {
            z: 0.25 * wagDir,
            x: 0.22,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { z: 0, x: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'cyber-robot': {
        tl.to(
          group.rotation,
          {
            x: 0.24,
            z: 0.09 * wagDir,
            duration: half,
            ease: 'power1.out',
          },
          t0
        ).to(
          group.rotation,
          { x: 0, z: 0, duration: half, ease: 'power1.inOut' },
          t0 + half
        );
        break;
      }

      case 'astronomer': {
        tl.to(
          group.rotation,
          {
            z: 0.22 * wagDir,
            x: -0.2,
            y: 0.18 * wagDir,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { z: 0, x: 0, y: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'star-unicorn': {
        tl.to(
          group.rotation,
          {
            x: -0.26,
            z: 0.16 * wagDir,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { x: 0, z: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'fire-dragon': {
        tl.to(
          group.rotation,
          {
            x: -0.26,
            z: 0.18 * wagDir,
            duration: half * 0.8,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { x: 0.14, z: 0, duration: half * 1.2, ease: 'sine.inOut' },
          t0 + half * 0.8
        );
        break;
      }

      case 'ice-dragon': {
        tl.to(
          group.rotation,
          {
            x: -0.22,
            z: 0.16 * wagDir,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { x: 0, z: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'pirate': {
        tl.to(
          group.rotation,
          {
            z: 0.24 * wagDir,
            x: 0.18,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { z: 0, x: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'magician': {
        tl.to(
          group.rotation,
          {
            y: 0.28 * wagDir,
            x: -0.18,
            z: 0.12 * wagDir,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { y: 0, x: 0, z: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }

      case 'alien': {
        tl.to(
          group.rotation,
          {
            z: 0.22 * wagDir,
            y: 0.22 * wagDir,
            x: -0.16,
            duration: half,
            ease: 'sine.out',
          },
          t0
        ).to(
          group.rotation,
          { z: 0, y: 0, x: 0, duration: half, ease: 'sine.inOut' },
          t0 + half
        );
        break;
      }
    }

    cursorTime += dur;
  });

  // Final crisp, solid settle on destination cell (ZERO wobble or elasticity)
  tl.to(
    group.scale,
    {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.08,
      ease: 'sine.out',
    },
    cursorTime
  ).to(
    group.rotation,
    {
      x: 0,
      y: 0,
      z: 0,
      duration: 0.08,
      ease: 'sine.out',
    },
    cursorTime
  );

  return tl;
}

/**
 * Ludo King Style Reverse Traversal Animation when a pawn is captured/cut!
 * Pops upward on capture impact, then smoothly retraces the track squares backward
 * (`fromStep -> ... -> 0 -> Yard`) before dropping neatly into its home Yard pad.
 */
export function reverseTraversePawn3D(params: {
  group: THREE.Group;
  reverseCoordinates: WorldCoord3D[];
  onComplete?: () => void;
}): gsap.core.Timeline {
  const { group, reverseCoordinates, onComplete } = params;

  gsap.killTweensOf(group.position);
  gsap.killTweensOf(group.rotation);
  gsap.killTweensOf(group.scale);

  const destCoord =
    reverseCoordinates.length > 0
      ? reverseCoordinates[reverseCoordinates.length - 1]
      : { x: group.position.x, y: 0, z: group.position.z };

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.killTweensOf(group.position);
      gsap.killTweensOf(group.rotation);
      gsap.killTweensOf(group.scale);
      group.position.set(destCoord.x, 0, destCoord.z);
      group.rotation.set(0, 0, 0);
      group.scale.set(1, 1, 1);
      if (onComplete) onComplete();
    },
  });

  // 1. Dramatic high knockback pop & spin (0.00s -> 0.20s)
  tl.to(group.position, {
    y: 1.5,
    duration: 0.2,
    ease: 'power2.out',
  })
    .to(
      group.scale,
      {
        x: 0.86,
        y: 1.22,
        z: 0.86,
        duration: 0.18,
        ease: 'power2.out',
      },
      0
    )
    .to(
      group.rotation,
      {
        y: `+=${Math.PI * 2.5}`,
        x: 0.3,
        duration: 0.58,
        ease: 'power1.out',
      },
      0
    )
    // 2. High-speed smooth arc swoop directly across board to Yard pad (0.16s -> 0.58s)
    .to(
      group.position,
      {
        x: destCoord.x,
        z: destCoord.z,
        duration: 0.42,
        ease: 'sine.inOut',
      },
      0.16
    )
    // 3. Crisp bounce landing on the base slot
    .to(
      group.position,
      {
        y: 0,
        duration: 0.38,
        ease: 'bounce.out',
      },
      0.2
    )
    .to(
      group.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.22,
        ease: 'back.out(2)',
      },
      0.4
    );

  return tl;
}


