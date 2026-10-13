---
name: procedural-3d-pbr-craft
description: >-
  Use this skill whenever creating, upgrading, auditing, or optimizing procedural
  3D models, collectible character figurines, board game tokens, physics dice,
  or interactive 3D props in Three.js and React Three Fiber (@react-three/fiber,
  @react-three/drei). Prevents blocky "Minecraft-style" primitive models and flat
  lighting by enforcing organic ellipsoidal/lathe sculpting, 3-layer expressive
  eyes, zero-network Studio HDRI reflections, surface-accurate PBR materials,
  volume-preserving GSAP squash-and-stretch animations, and shared-geometry GPU
  performance patterns.
---

# Procedural 3D Collectible & PBR Craft Skill

This skill provides an industry-standard workflow for building realistic, tactile, collectible-grade 3D models (Amiibo / Supercell / Designer Vinyl aesthetic) entirely in code using Three.js and `@react-three/fiber` without relying on heavy external `.glb` downloads or slow network HDRIs.

---

## When to Activate

Activate this skill when the user asks to:
- Create or redesign 3D characters, mascots, tokens, pawns, dice, or game props in Three.js / R3F
- Fix 3D models that look "blocky", "like Minecraft", "flat", "plastic", or "too small"
- Upgrade lighting, reflections, shadows, or PBR materials in a `<Canvas>`
- Audit and optimize React Three Fiber rendering performance and state synchronization

---

## Core Workflow

### Step 1: Audit Against the "Anti-Minecraft" & Realism Checklist

Before writing or editing any 3D mesh code, check the scene against these 6 rules:

1. **No Raw Boxes for Organic Forms**: Never use raw `<boxGeometry>` or unscaled `<cylinderGeometry>` for animal/humanoid torsos, heads, or snouts. Use non-uniformly scaled spheres (`scale={[rx, ry, rz]}`), `<capsuleGeometry>`, `<latheGeometry>`, `<torusGeometry>`, or high-smoothness `<RoundedBox smoothness={8}>`.
2. **Never Leave `<meshPhysicalMaterial>` Without an Environment Map**: `clearcoat`, `metalness`, `sheen`, and `ior` reflect black void unless `scene.environment` is populated. Always mount the zero-network `StudioEnvironment` component (see Step 2).
3. **3-Layer Expressive Eyes**: Never use a single flat `<meshBasicMaterial>` sphere for eyes. Every character eye must have:
   - **Layer 1 (Cornea/Iris)**: `<meshPhysicalMaterial color={irisHex} roughness={0.02} clearcoat={1} ior={1.45} />`
   - **Layer 2 (Primary Catchlight)**: Top-left white `<meshBasicMaterial color="#ffffff" />` micro-sphere (`~0.3x` eye radius)
   - **Layer 3 (Secondary Catchlight)**: Bottom-right micro-sphere (`~0.15x` eye radius)
4. **Complete Silhouette Anatomy**: Collectible characters need recognizable sub-parts:
   - Seated paws/hooves/boots + tucked hind haunches
   - Puffy cheeks wider than the snout/muzzle (`scale={[0.285, 0.25, 0.245]}`)
   - Inner ear hollows (nested smaller cone/ellipsoid shifted forward by `+0.025` Z)
   - Accessories with thickness (knotted scarves with hanging capsule tails, bevel-rimmed collars, antennae, chest dials)
5. **Engraved / Recessed Surface Details**: Features that are indented in real life (like dice pips or panel seams) must be recessed inward (`z = -0.004`) and framed with a metallic or luminous bevel ring (`<ringGeometry>`), never protruding cylinders.
6. **Grounding Shadows**: Always pair directional shadows (`<shadowMaterial transparent opacity={0.28} />` floor catcher) with per-object ambient occlusion contact discs or `<ContactShadows />` so objects feel physically planted on the surface.

---

### Step 2: Mount Zero-Network Studio HDRI Lighting

Do not rely on external CDN `.hdr` presets that can stall `<Suspense>` or fail offline. Generate a cached studio environment map on the GPU in `<2ms` using Three.js's built-in `RoomEnvironment` and `PMREMGenerator`:

```tsx
import { useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

let cachedEnvMap: THREE.Texture | null = null;
let cachedRenderer: THREE.WebGLRenderer | null = null;

export const StudioEnvironment: React.FC<{ intensity?: number }> = React.memo(
  ({ intensity = 1.15 }) => {
    const { gl, scene } = useThree();

    useEffect(() => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.12;

      if (!cachedEnvMap || cachedRenderer !== gl) {
        const pmrem = new THREE.PMREMGenerator(gl);
        pmrem.compileEquirectangularShader();
        const room = new RoomEnvironment();
        cachedEnvMap = pmrem.fromScene(room, 0.04).texture;
        room.dispose();
        pmrem.dispose();
        cachedRenderer = gl;
      }

      scene.environment = cachedEnvMap;
      if ('environmentIntensity' in scene) {
        (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
          intensity;
      }
    }, [gl, scene, intensity]);

    return null;
  }
);
```

Pair `<StudioEnvironment />` with a 3-point studio light rig:
- **Ambient / Hemisphere Fill**: Low intensity (`0.4 - 0.55`) so shadows stay rich.
- **Key Directional Light**: Intensity `1.9 - 2.2`, `castShadow`, `shadow-mapSize={[1024, 1024]}`, `shadow-bias={-0.0008}`.
- **Warm Rim Point Light**: Positioned behind/side (`[-6, 8, -4]`), warm gold/skin tint (`#fde047`), intensity `0.75 - 1.1`.

---

### Step 3: Sculpt Models Using Shared Geometries & PBR Taxonomy

1. **Pre-allocate Shared Geometries at Module Scope**:
   Create a single `SHARED_GEO` object outside the React component containing unit spheres (`SphereGeometry(1, 28, 28)`), low-poly detail spheres (`SphereGeometry(1, 18, 18)`), unit cylinders, capsules, and toruses. Shape body parts via `<mesh geometry={SHARED_GEO.unitSphere} scale={[rx, ry, rz]} />`.
2. **Apply Surface-Specific PBR Recipes**:
   Read [references/pbr_material_recipes.md](./references/pbr_material_recipes.md) for the exact material properties for:
   - Plush Fur & Velvet (`sheen`, high `roughness`, low `clearcoat`)
   - Wet Nose & Glossy Cornea (`ior: 1.45`, `roughness: 0.02`, `clearcoat: 1`)
   - Turned Enamel / Lacquer (`LatheGeometry` + `ior: 1.55`, `clearcoat: 1`)
   - Brushed Mecha Aluminum & Anodized Copper (`metalness: 0.78 - 0.88`)
   - Deep-Space Mirror Visors (`metalness: 0.92`, `roughness: 0.03`, `ior: 1.7` + curved white glint mesh)
   - Gemstone / Jade / Obsidian Dice (`ior: 1.66 - 1.8`, custom emissive pip inlays)
   - Procedural `CanvasTexture` bump/normal maps & Fresnel rim shaders.

---

### Step 4: Animate With Volume-Preserving Squash & Stretch

When animating 3D tokens or dice with GSAP:
1. **Preserve Volume During Squash & Stretch**:
   Keep $s_x \cdot s_y \cdot s_z \approx 1$.
   - Launch stretch: `scale: { x: 0.92, y: 1.16, z: 0.92 }`
   - Landing impact squash: `scale: { x: 1.14, y: 0.84, z: 1.14 }`
2. **Multi-Stage Physical Dice Tumble**:
   Combine upward launch + multi-axis spin (`+Math.PI * 4`) + floor drop impact squash + micro-rebound hop + `elastic.out` recovery + idle micro-precession so HDRI reflections shimmer even at rest.
3. **Idempotent Animation Callbacks**:
   Always guard `onComplete` state-machine events (like `DICE_SETTLED` or `ANIMATION_COMPLETE`) with a `useRef(false)` flag (`hasSettledFiredRef`) so React re-renders or rapid taps never double-fire transitions.

---

### Step 5: Enforce GPU & React Performance Guards

1. **Conditional `useFrame`**: Never run math inside `useFrame` for static tokens. Check `if (!isAnimated) return;` on line 1 of `useFrame`.
2. **Pause Idle Physics**: Pass `paused={!isRolling}` to `<Physics>` (`@react-three/rapier`) so the WASM physics world consumes 0% CPU when dice are resting.
3. **Custom `React.memo` Comparators**: Wrap 3D node components in `React.memo(Component, arePropsEqual)` comparing primitive step/color/skin/selection values so unrelated state transitions do not re-render 3D subtrees.
4. **Stable Memo Keys for Board Topology**: Derive a primitive string key (`pawns.map(p => `${p.id}:${p.step}`).join('|')`) before computing stack maps.

---

## Verification Step

Always run `npm run build` (or `tsc -b && vite build`) after modifying 3D components to verify that all Three.js geometries, `@react-three/fiber` JSX props, and state-machine event types compile cleanly with zero errors.
