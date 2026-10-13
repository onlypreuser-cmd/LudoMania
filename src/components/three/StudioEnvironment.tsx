import { useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const envMapCache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

/**
 * Generates an instant, zero-network, studio-grade PBR HDRI environment map
 * using Three.js's built-in `RoomEnvironment` + `PMREMGenerator`.
 * Gives `meshPhysicalMaterial` (clearcoat, metalness, sheen, ior, transmission)
 * lifelike specular reflections and rim highlights without any external CDN fetch.
 */
export const StudioEnvironment: React.FC<{ intensity?: number }> = React.memo(
  ({ intensity = 1.1 }) => {
    const { gl, scene } = useThree();

    useEffect(() => {
      gl.toneMapping = THREE.ACESFilmicToneMapping;
      gl.toneMappingExposure = 1.12;

      let envTexture = envMapCache.get(gl);
      if (!envTexture) {
        const pmremGenerator = new THREE.PMREMGenerator(gl);
        pmremGenerator.compileEquirectangularShader();
        const roomEnv = new RoomEnvironment();
        envTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
        roomEnv.dispose();
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
