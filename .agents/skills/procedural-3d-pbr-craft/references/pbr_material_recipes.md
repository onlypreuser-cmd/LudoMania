# PBR Material Recipes & Advanced Procedural Shaders

This reference accompanies the `procedural-3d-pbr-craft` skill and provides copy-pasteable material configurations, procedural texture generators, and shader enhancements for Three.js / React Three Fiber.

---

## 1. Surface-Accurate PBR Material Taxonomy

| Surface Type | `roughness` | `metalness` | `clearcoat` | `ior` | `sheen` / Special Props |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Plush Fur / Shiba / Kitty** | `0.55 - 0.65` | `0.0` | `0.12 - 0.22` | `1.45` | `sheen={0.65}`, `sheenRoughness={0.75}`, `sheenColor="#fde68a"` |
| **Wet Dog Nose / Eyeball** | `0.02` | `0.0` | `1.0` | `1.45` | Ultra-crisp specular pinpoint reflection |
| **Royal Lacquer / Classic Pawn** | `0.06 - 0.10` | `0.12` | `1.0` | `1.55` | `clearcoatRoughness={0.04}` |
| **Mecha Brushed Aluminum** | `0.16 - 0.20` | `0.78` | `0.9` | `1.5` | `clearcoatRoughness={0.08}` |
| **Anodized Copper / Bronze** | `0.20` | `0.75` | `0.8` | `1.5` | Warm `#c2410c` / `#ea580c` base |
| **Astronaut Bubble Visor** | `0.03` | `0.92` | `1.0` | `1.70` | Deep navy `#091930` + curved white glint mesh |
| **Royal Gold (Dice / Horn)** | `0.10 - 0.12` | `0.88 - 0.92` | `1.0` | `1.70` | Subtle warm emissive `#d97706` (`0.2`) |
| **Imperial Jadeite Stone** | `0.12` | `0.24` | `1.0` | `1.66` | `sheen={0.65}`, `sheenColor="#ecfdf5"` |
| **Volcanic Obsidian Glass** | `0.06` | `0.78` | `1.0` | `1.80` | `clearcoatRoughness={0.02}` + neon emissive inlays |

---

## 2. Zero-Asset Procedural Micro-Bump `CanvasTexture` Generator

To give fabric scarves, brushed metal robots, or matte fur subtle micro-surface texture without loading external PNG/JPG files, generate a reusable procedural `CanvasTexture` once in memory:

```tsx
import * as THREE from 'three';

let cachedMicroBumpMap: THREE.CanvasTexture | null = null;

/**
 * Generates a tileable 128x128 micro-grain bump texture in memory (0 network requests).
 * Attach to `bumpMap={getProceduralMicroBumpMap()}` with `bumpScale={0.004}` for
 * knitted scarves, plush fur, or brushed anodized metal.
 */
export function getProceduralMicroBumpMap(): THREE.CanvasTexture {
  if (cachedMicroBumpMap) return cachedMicroBumpMap;

  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const grain = 115 + Math.floor(Math.random() * 26);
    data[i] = grain;
    data[i + 1] = grain;
    data[i + 2] = grain;
    data[i + 3] = 255;
  }

  ctx.putImageData(imgData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.needsUpdate = true;
  cachedMicroBumpMap = texture;
  return texture;
}
```

---

## 3. Custom Fresnel Rim-Light Shader Enhancement (`onBeforeCompile`)

Top mobile 3D games (Supercell / Brawl Stars / Clash Royale) add a subtle view-dependent Fresnel rim highlight to 3D characters so their silhouette pops against any board color:

```tsx
import * as THREE from 'three';

export function applyFresnelRimHighlight(
  material: THREE.MeshPhysicalMaterial,
  rimColorHex = '#ffffff',
  rimPower = 2.8,
  rimIntensity = 0.35
) {
  const rimColor = new THREE.Color(rimColorHex);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uRimColor = { value: rimColor };
    shader.uniforms.uRimPower = { value: rimPower };
    shader.uniforms.uRimIntensity = { value: rimIntensity };

    shader.fragmentShader = `
      uniform vec3 uRimColor;
      uniform float uRimPower;
      uniform float uRimIntensity;
      ${shader.fragmentShader}
    `.replace(
      '#include <dithering_fragment>',
      `
      float fresnel = pow(1.0 - saturate(dot(normalize(vNormal), normalize(vViewPosition))), uRimPower);
      gl_FragColor.rgb += uRimColor * fresnel * uRimIntensity;
      #include <dithering_fragment>
      `
    );
  };
}
```

---

## 4. Volume-Preserving Squash & Stretch Formula

When animating a 3D figure along $Y$ with scale factor $s_y$, compute $s_x$ and $s_z$ so total volume remains constant ($s_x \cdot s_y \cdot s_z = 1$):

$$s_x = s_z = \frac{1}{\sqrt{s_y}}$$

- **Crouch / Impact Squash** ($s_y = 0.82$): $s_x = s_z = 1 / \sqrt{0.82} \approx 1.104$
- **Mid-Air Apex Stretch** ($s_y = 1.18$): $s_x = s_z = 1 / \sqrt{1.18} \approx 0.920$
