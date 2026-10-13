import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { PlayerColor, TokenSkinId } from '../../types/game';

type GlyphType =
  | 'paw'
  | 'cyber'
  | 'cosmic'
  | 'flame'
  | 'frost'
  | 'star'
  | 'shield'
  | 'coin'
  | 'rune'
  | 'ripple';

const SKIN_GLYPH_MAP: Record<TokenSkinId, GlyphType> = {
  classic: 'ripple',
  knight: 'shield',
  dog: 'paw',
  cat: 'paw',
  panda: 'paw',
  robot: 'cyber',
  astronaut: 'cosmic',
  unicorn: 'star',
  'bamboo-panda': 'paw',
  'cyber-robot': 'cyber',
  astronomer: 'cosmic',
  'star-unicorn': 'star',
  'fire-dragon': 'flame',
  'ice-dragon': 'frost',
  pirate: 'coin',
  magician: 'rune',
  alien: 'cosmic',
};

const COLOR_HEX_MAP: Record<PlayerColor, { ring: string; glow: string }> = {
  blue: { ring: '#38bdf8', glow: '#60a5fa' },
  red: { ring: '#f87171', glow: '#ef4444' },
  green: { ring: '#34d399', glow: '#10b981' },
  yellow: { ring: '#fbbf24', glow: '#f59e0b' },
};

/**
 * Creates high-contrast, feather-soft alpha textures procedurally using 2D Canvas.
 * Executed only once at module load — ZERO network traffic & <150KB memory footprint.
 */
function createShockwaveTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const center = size / 2;

  // Feathered luminous ring gradient
  const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.48, 'rgba(255, 255, 255, 0.08)');
  grad.addColorStop(0.72, 'rgba(255, 255, 255, 0.95)');
  grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.7)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(center, center, center, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

function createGlyphTexture(glyph: GlyphType): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const c = size / 2;

  ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (glyph) {
    case 'paw': {
      // Main palm pad
      ctx.beginPath();
      ctx.ellipse(c, c + 10, 22, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      // 4 Toe pads
      const toes: [number, number, number][] = [
        [c - 22, c - 10, -0.3],
        [c - 8, c - 22, -0.1],
        [c + 8, c - 22, 0.1],
        [c + 22, c - 10, 0.3],
      ];
      toes.forEach(([tx, ty, rot]) => {
        ctx.beginPath();
        ctx.ellipse(tx, ty, 8, 11, rot, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }

    case 'cyber': {
      // Futuristic cyber reticle & tech crosshair
      ctx.beginPath();
      ctx.arc(c, c, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(c, c, 26, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      // 4 Corner ticks
      ctx.fillRect(c - 4, c - 4, 8, 8);
      ctx.strokeRect(c - 16, c - 16, 32, 32);
      break;
    }

    case 'cosmic': {
      // Celestial planet ring + diamond stardust star
      ctx.beginPath();
      ctx.ellipse(c, c, 44, 18, -0.38, 0, Math.PI * 2);
      ctx.stroke();
      // 4-pointed diamond star
      ctx.beginPath();
      ctx.moveTo(c, c - 28);
      ctx.quadraticCurveTo(c, c, c + 28, c);
      ctx.quadraticCurveTo(c, c, c, c + 28);
      ctx.quadraticCurveTo(c, c, c - 28, c);
      ctx.quadraticCurveTo(c, c, c, c - 28);
      ctx.fill();
      // Orbit sparks
      ctx.beginPath();
      ctx.arc(c - 28, c - 16, 4, 0, Math.PI * 2);
      ctx.arc(c + 28, c + 16, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'flame': {
      // Stylized dynamic fire flame silhouette
      ctx.beginPath();
      ctx.moveTo(c, c - 36);
      ctx.bezierCurveTo(c + 18, c - 14, c + 32, c + 8, c + 20, c + 28);
      ctx.bezierCurveTo(c + 10, c + 40, c - 10, c + 40, c - 20, c + 28);
      ctx.bezierCurveTo(c - 32, c + 8, c - 18, c - 14, c, c - 36);
      ctx.fill();
      // Flame core teardrop
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(c, c + 14, 9, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'frost': {
      // Crisp 6-branch symmetrical snowflake crystal
      for (let i = 0; i < 6; i++) {
        const rad = (i * Math.PI) / 3;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        ctx.beginPath();
        ctx.moveTo(c, c);
        ctx.lineTo(c + cos * 36, c + sin * 36);
        ctx.stroke();
        // Crystal sub-spurs
        const mx = c + cos * 22;
        const my = c + sin * 22;
        const nCos1 = Math.cos(rad + 0.65);
        const nSin1 = Math.sin(rad + 0.65);
        const nCos2 = Math.cos(rad - 0.65);
        const nSin2 = Math.sin(rad - 0.65);
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + nCos1 * 12, my + nSin1 * 12);
        ctx.moveTo(mx, my);
        ctx.lineTo(mx + nCos2 * 12, my + nSin2 * 12);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(c, c, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'star': {
      // Brilliant 8-pointed starburst flare
      ctx.beginPath();
      for (let i = 0; i < 16; i++) {
        const r = i % 2 === 0 ? 38 : i % 4 === 1 ? 14 : 7;
        const angle = (i * Math.PI) / 8 - Math.PI / 2;
        const x = c + Math.cos(angle) * r;
        const y = c + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'shield': {
      // Medieval knight crest shield
      ctx.beginPath();
      ctx.moveTo(c - 26, c - 28);
      ctx.lineTo(c + 26, c - 28);
      ctx.lineTo(c + 26, c + 4);
      ctx.bezierCurveTo(c + 26, c + 24, c + 8, c + 36, c, c + 40);
      ctx.bezierCurveTo(c - 8, c + 36, c - 26, c + 24, c - 26, c + 4);
      ctx.closePath();
      ctx.stroke();
      // Shield cross
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(c, c - 22);
      ctx.lineTo(c, c + 32);
      ctx.moveTo(c - 18, c - 8);
      ctx.lineTo(c + 18, c - 8);
      ctx.stroke();
      break;
    }

    case 'coin': {
      // Pirate gold doubloon border + crossbones emblem
      ctx.beginPath();
      ctx.arc(c, c, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c, c, 28, 0, Math.PI * 2);
      ctx.stroke();
      // Crossed bone markers
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(c - 16, c - 16);
      ctx.lineTo(c + 16, c + 16);
      ctx.moveTo(c + 16, c - 16);
      ctx.lineTo(c - 16, c + 16);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c, c, 8, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'rune': {
      // Mystic arcane runic circle
      ctx.beginPath();
      ctx.arc(c, c, 38, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c, c, 24, 0, Math.PI * 2);
      ctx.stroke();
      // Arcane 3-point star triangle
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const rad = (i * Math.PI * 2) / 3 - Math.PI / 2;
        const x = c + Math.cos(rad) * 24;
        const y = c + Math.sin(rad) * 24;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      break;
    }

    case 'ripple':
    default: {
      // Clean elegant double concentric ripple
      ctx.beginPath();
      ctx.arc(c, c, 36, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(c, c, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(c, c, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

const SHOCKWAVE_TEXTURE = createShockwaveTexture();
const GLYPH_TEXTURES: Record<GlyphType, THREE.CanvasTexture> = {
  paw: createGlyphTexture('paw'),
  cyber: createGlyphTexture('cyber'),
  cosmic: createGlyphTexture('cosmic'),
  flame: createGlyphTexture('flame'),
  frost: createGlyphTexture('frost'),
  star: createGlyphTexture('star'),
  shield: createGlyphTexture('shield'),
  coin: createGlyphTexture('coin'),
  rune: createGlyphTexture('rune'),
  ripple: createGlyphTexture('ripple'),
};

const POOL_SIZE = 8;
const SHARED_PLANE_GEO = new THREE.PlaneGeometry(1, 1);

interface EffectSlot {
  group: THREE.Group;
  ringMesh: THREE.Mesh;
  glyphMesh: THREE.Mesh;
  ringMat: THREE.MeshBasicMaterial;
  glyphMat: THREE.MeshBasicMaterial;
  tween?: gsap.core.Timeline;
}

/**
 * High-performance step effect manager singleton.
 * Uses a fixed pool of 8 instances with zero dynamic object creation / GC impact.
 */
class StepEffectsManager {
  private slots: EffectSlot[] = [];
  private poolIndex = 0;

  registerSlots(slots: EffectSlot[]) {
    this.slots = slots;
  }

  trigger(x: number, z: number, skin: TokenSkinId, color: PlayerColor) {
    if (this.slots.length === 0) return;

    const slot = this.slots[this.poolIndex];
    this.poolIndex = (this.poolIndex + 1) % this.slots.length;

    if (slot.tween) {
      slot.tween.kill();
    }

    const glyphType = SKIN_GLYPH_MAP[skin] ?? 'ripple';
    const glyphTexture = GLYPH_TEXTURES[glyphType];
    const colorTheme = COLOR_HEX_MAP[color] ?? COLOR_HEX_MAP.blue;

    // Reposition pool slot
    slot.group.position.set(x, 0.012, z);
    slot.group.visible = true;

    // Apply color and glyph textures
    slot.ringMat.color.set(colorTheme.ring);
    slot.ringMat.opacity = 0.88;
    slot.ringMesh.scale.set(0.32, 0.32, 1);

    slot.glyphMat.map = glyphTexture;
    slot.glyphMat.color.set(colorTheme.glow);
    slot.glyphMat.opacity = 0.95;
    slot.glyphMesh.scale.set(0.42, 0.42, 1);

    const tl = gsap.timeline({
      onComplete: () => {
        slot.group.visible = false;
        slot.ringMat.opacity = 0;
        slot.glyphMat.opacity = 0;
      },
    });

    // 1. Color-driven elemental shockwave ring expansion
    tl.to(
      slot.ringMesh.scale,
      {
        x: 1.25,
        y: 1.25,
        duration: 0.34,
        ease: 'sine.out',
      },
      0
    ).to(
      slot.ringMat,
      {
        opacity: 0,
        duration: 0.34,
        ease: 'sine.in',
      },
      0.02
    );

    // 2. Character-driven custom glyph imprint (paw, cyber, flame, star, etc.)
    tl.to(
      slot.glyphMesh.scale,
      {
        x: 0.98,
        y: 0.98,
        duration: 0.38,
        ease: 'power1.out',
      },
      0
    ).to(
      slot.glyphMat,
      {
        opacity: 0,
        duration: 0.36,
        ease: 'sine.in',
      },
      0.04
    );

    slot.tween = tl;
  }

  clear() {
    this.slots.forEach((s) => {
      s.tween?.kill();
      s.group.visible = false;
    });
    this.slots = [];
  }
}

export const stepEffectsManager = new StepEffectsManager();

export const StepEffects3D: React.FC = () => {
  const containerRef = useRef<THREE.Group>(null);

  const slots = useMemo<EffectSlot[]>(() => {
    const list: EffectSlot[] = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const group = new THREE.Group();
      group.visible = false;

      // Outer color shockwave mesh
      const ringMat = new THREE.MeshBasicMaterial({
        map: SHOCKWAVE_TEXTURE,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const ringMesh = new THREE.Mesh(SHARED_PLANE_GEO, ringMat);
      ringMesh.rotation.x = -Math.PI / 2;
      group.add(ringMesh);

      // Inner character stamp glyph mesh
      const glyphMat = new THREE.MeshBasicMaterial({
        map: GLYPH_TEXTURES.ripple,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const glyphMesh = new THREE.Mesh(SHARED_PLANE_GEO, glyphMat);
      glyphMesh.rotation.x = -Math.PI / 2;
      group.add(glyphMesh);

      list.push({ group, ringMesh, glyphMesh, ringMat, glyphMat });
    }
    return list;
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    slots.forEach((s) => containerRef.current?.add(s.group));
    stepEffectsManager.registerSlots(slots);

    return () => {
      stepEffectsManager.clear();
    };
  }, [slots]);

  return <group ref={containerRef} />;
};
