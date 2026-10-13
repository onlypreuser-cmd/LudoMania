import { Canvas } from '@react-three/fiber';
import React, { Suspense } from 'react';
import * as THREE from 'three';
import { PlayerColor, TokenSkinId } from '../../types/game';
import { StudioEnvironment } from './StudioEnvironment';
import { Token3DModel } from './Token3DModel';

interface TokenPreviewCanvasProps {
  skin: TokenSkinId;
  color: PlayerColor;
  className?: string;
}

const PREVIEW_SHADOW_OUTER = new THREE.CircleGeometry(0.46, 24);
const PREVIEW_SHADOW_INNER = new THREE.CircleGeometry(0.32, 24);

/**
 * Standalone 3D viewport card for previewing any of the 17 Collectible 3D Token Models
 * inside the Customize screen, Match Setup screen, and Pre-Game Setup Popup.
 * Uses zero-pass shared CircleGeometry contact shadows and capped DPR for butter-smooth 60fps.
 */
export const TokenPreviewCanvas: React.FC<TokenPreviewCanvasProps> = React.memo(
  ({ skin, color, className = 'w-16 h-16' }) => {
    return (
      <div className={`relative ${className} pointer-events-none select-none`}>
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0.92, 1.72], fov: 34 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
          }}
        >
          <StudioEnvironment intensity={1.2} />
          <ambientLight intensity={0.45} />
          <directionalLight position={[3, 5, 4]} intensity={1.85} />
          <pointLight position={[-2, 2.5, 2]} intensity={0.75} color="#fde047" />
          <Suspense fallback={null}>
            <group position={[0, -0.44, 0]}>
              <Token3DModel
                skin={skin}
                color={color}
                scale={1.15}
                autoRotatePreview
              />
              <mesh
                geometry={PREVIEW_SHADOW_OUTER}
                position={[0, 0.006, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshBasicMaterial
                  color="#0f172a"
                  transparent
                  opacity={0.18}
                  depthWrite={false}
                />
              </mesh>
              <mesh
                geometry={PREVIEW_SHADOW_INNER}
                position={[0, 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
              >
                <meshBasicMaterial
                  color="#0f172a"
                  transparent
                  opacity={0.28}
                  depthWrite={false}
                />
              </mesh>
            </group>
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

TokenPreviewCanvas.displayName = 'TokenPreviewCanvas';
