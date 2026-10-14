import * as THREE from 'three';

let cachedMicroNormalTexture: THREE.CanvasTexture | null = null;

/**
 * Generates an ultra-lightweight, 256x256 seamless procedural micro-normal map
 * directly in memory (0 KB network download).
 * Gives metallic, ceramic, and cloth surfaces micro-abrasions and tactile brushed grain.
 */
export function getMicroNormalTexture(): THREE.CanvasTexture {
  if (cachedMicroNormalTexture) {
    return cachedMicroNormalTexture;
  }

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    // Fallback if 2d context unavailable
    const dummy = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
    dummy.needsUpdate = true;
    return dummy as unknown as THREE.CanvasTexture;
  }

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  // Simple pseudo-random hash generator for deterministic noise
  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453123;
    return s - Math.floor(s);
  };

  // Generate subtle brushed micro-noise
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Anisotropic brushed noise streak along x-axis
      const n1 = hash(x * 0.4, y * 3.2);
      const n2 = hash(x * 1.5, y * 8.0);
      const noise = (n1 * 0.7 + n2 * 0.3 - 0.5) * 0.22;

      // Tangent space normal: dx, dy, dz
      const nx = noise * 0.8;
      const ny = noise * 0.2;
      const nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));

      // Pack into 8-bit RGB [0..255]
      data[idx] = Math.floor((nx * 0.5 + 0.5) * 255);
      data[idx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      data[idx + 2] = Math.floor(nz * 255);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.needsUpdate = true;

  cachedMicroNormalTexture = texture;
  return texture;
}
