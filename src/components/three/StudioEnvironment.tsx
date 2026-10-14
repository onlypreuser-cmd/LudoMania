import { useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import * as THREE from 'three';

const envMapCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

/**
 * Creates a procedural 3-point photo studio lighting rig scene:
 * - Key Light: 45° angle broad warm softbox for natural directional highlights
 * - Rim Light: High-intensity cold narrow strip for sharp silhouette separation
 * - Fill Light: Soft neutral bounce panel to illuminate shadow crevices
 * - Bounce Floor: Warm dark floor reflection
 * - Overhead Ring: Soft zenith fill
 */
function createStudioRigScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0d14');

  // 1. Key Light Softbox (Warm broad panel at top-right 45°)
  const keySoftbox = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 6),
    new THREE.MeshBasicMaterial({ color: '#fffdf5', side: THREE.DoubleSide })
  );
  keySoftbox.position.set(7.5, 9.5, 6.5);
  keySoftbox.lookAt(0, 0, 0);
  scene.add(keySoftbox);

  // 2. Rim Light Strip (Cold high-intensity narrow strip behind & left)
  const rimStrip = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 2.2),
    new THREE.MeshBasicMaterial({ color: '#c7d2fe', side: THREE.DoubleSide })
  );
  rimStrip.position.set(-8.5, 6.0, -9.0);
  rimStrip.lookAt(0, 0, 0);
  scene.add(rimStrip);

  // 3. Fill Softbox (Front-left gentle neutral panel)
  const fillSoftbox = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 4.5),
    new THREE.MeshBasicMaterial({ color: '#e2e8f0', side: THREE.DoubleSide })
  );
  fillSoftbox.position.set(-6.5, 6.5, 7.5);
  fillSoftbox.lookAt(0, 0, 0);
  scene.add(fillSoftbox);

  // 4. Subtle Floor Bounce (Dark slate ground reflection)
  const floorBounce = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({ color: '#1e293b', side: THREE.DoubleSide })
  );
  floorBounce.position.set(0, -6, 0);
  floorBounce.rotation.x = -Math.PI / 2;
  scene.add(floorBounce);

  // 5. Overhead Soft Zenith Disk
  const topDisk = new THREE.Mesh(
    new THREE.CircleGeometry(4.0, 32),
    new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide })
  );
  topDisk.position.set(0, 13, 0);
  topDisk.rotation.x = Math.PI / 2;
  scene.add(topDisk);

  return scene;
}

/**
 * Generates an instant, zero-network, studio-grade PBR HDRI environment map
 * with 3-point softbox studio lighting + AgX tone mapping.
 * Gives `meshPhysicalMaterial` (clearcoat, metalness, sheen, ior, transmission)
 * commercial-grade specular reflections and crisp rim highlights with 0 external CDN fetch.
 */
export const StudioEnvironment: React.FC<{ intensity?: number }> = React.memo(
  ({ intensity = 1.15 }) => {
    const { gl, scene } = useThree();

    useEffect(() => {
      // Use cinematic AgX tone mapping (with ACESFilmic fallback)
      gl.toneMapping = (THREE as unknown as { AgXToneMapping?: THREE.ToneMapping }).AgXToneMapping ?? THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.08;

      let envTexture = envMapCache.get(gl);
      if (!envTexture) {
        const pmremGenerator = new THREE.PMREMGenerator(gl);
        pmremGenerator.compileEquirectangularShader();
        const rigScene = createStudioRigScene();
        envTexture = pmremGenerator.fromScene(rigScene, 0.04).texture;

        // Clean up temporary procedural rig meshes
        rigScene.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mesh = obj as THREE.Mesh;
            mesh.geometry.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material.dispose();
            }
          }
        });
        pmremGenerator.dispose();
        envMapCache.set(gl, envTexture);
      }

      scene.environment = envTexture;
      if ('environmentIntensity' in scene) {
        (scene as THREE.Scene & { environmentIntensity: number }).environmentIntensity =
          intensity;
      }
    }, [gl, scene, intensity]);

    return null;
  }
);

StudioEnvironment.displayName = 'StudioEnvironment';
