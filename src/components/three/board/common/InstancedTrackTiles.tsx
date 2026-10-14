import React, { useMemo } from 'react';
import * as THREE from 'three';
import { COLOR_PALETTE } from '../../../../engine/boardConfig';
import { PlayerColor } from '../../../../types/game';
import { ALL_TRACK_TILES, TrackTileData } from '../data/trackTilesBuilder';
import { BOARD_GEO } from '../geometries/boardGeometries';

interface InstancedTrackTilesProps {
  standardColor?: string;
  baseRoughness?: number;
  baseClearcoat?: number;
  baseMetalness?: number;
  safeStarColor?: string;
  startEmblemColor?: string;
  tileY?: number;
}

const scratchMatrix = new THREE.Matrix4();
const scratchPosition = new THREE.Vector3();
const scratchRotation = new THREE.Euler();
const scratchQuaternion = new THREE.Quaternion();
const scratchScale = new THREE.Vector3(1, 1, 1);
const scratchColor = new THREE.Color();

/**
 * High-Performance Instanced Track Renderer:
 * Collapses 72 individual track tiles + 8 safe stars + 4 start crests
 * from 84 individual draw calls into just 3 GPU instanced draw calls.
 */
export const InstancedTrackTiles: React.FC<InstancedTrackTilesProps> = React.memo(
  ({
    standardColor = '#fffdfa',
    baseRoughness = 0.55,
    baseClearcoat = 0.35,
    baseMetalness = 0.05,
    safeStarColor = '#fbbf24',
    startEmblemColor = '#ffffff',
    tileY = -0.01,
  }) => {
    // 1. Prepare 72 Track Tiles Matrix & Color Buffers
    const { tilesMesh, safeTilesCount, startTilesCount } = useMemo(() => {
      const count = ALL_TRACK_TILES.length;
      const mesh = new THREE.InstancedMesh(
        BOARD_GEO.tileChamfer,
        new THREE.MeshPhysicalMaterial({
          roughness: baseRoughness,
          clearcoat: baseClearcoat,
          metalness: baseMetalness,
        }),
        count
      );
      mesh.receiveShadow = true;

      let safeCount = 0;
      let startCount = 0;

      ALL_TRACK_TILES.forEach((tile: TrackTileData, i: number) => {
        scratchPosition.set(tile.x, tileY, tile.z);
        scratchRotation.set(0, 0, 0);
        scratchQuaternion.setFromEuler(scratchRotation);
        scratchScale.set(1, 1, 1);
        scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
        mesh.setMatrixAt(i, scratchMatrix);

        if (tile.type === 'home-stretch' || tile.type === 'start') {
          const colHex = tile.color ? COLOR_PALETTE[tile.color].threeHex : standardColor;
          scratchColor.set(colHex);
        } else {
          scratchColor.set(standardColor);
        }
        mesh.setColorAt(i, scratchColor);

        if (tile.type === 'safe') safeCount++;
        if (tile.type === 'start') startCount++;
      });

      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

      return { tilesMesh: mesh, safeTilesCount: safeCount, startTilesCount: startCount };
    }, [standardColor, baseRoughness, baseClearcoat, baseMetalness, tileY]);

    // 2. Prepare Safe Stars Instanced Mesh (8 Safe Tiles)
    const safeStarsMesh = useMemo(() => {
      const mesh = new THREE.InstancedMesh(
        BOARD_GEO.star8Point,
        new THREE.MeshPhysicalMaterial({
          color: safeStarColor,
          metalness: 0.92,
          roughness: 0.12,
          clearcoat: 1,
        }),
        safeTilesCount
      );

      let idx = 0;
      scratchRotation.set(-Math.PI / 2, 0, 0);
      scratchQuaternion.setFromEuler(scratchRotation);
      scratchScale.set(1, 1, 1);

      ALL_TRACK_TILES.forEach((tile: TrackTileData) => {
        if (tile.type === 'safe') {
          scratchPosition.set(tile.x, tileY + 0.055, tile.z);
          scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
          mesh.setMatrixAt(idx++, scratchMatrix);
        }
      });

      mesh.instanceMatrix.needsUpdate = true;
      return mesh;
    }, [safeTilesCount, safeStarColor, tileY]);

    // 3. Prepare Start Tile Crests Instanced Mesh (4 Start Tiles)
    const startCrestsMesh = useMemo(() => {
      const mesh = new THREE.InstancedMesh(
        BOARD_GEO.star5Point,
        new THREE.MeshPhysicalMaterial({
          color: startEmblemColor,
          metalness: 0.35,
          roughness: 0.15,
          clearcoat: 1,
        }),
        startTilesCount
      );

      let idx = 0;
      scratchRotation.set(-Math.PI / 2, 0, 0);
      scratchQuaternion.setFromEuler(scratchRotation);
      scratchScale.set(1, 1, 1);

      ALL_TRACK_TILES.forEach((tile: TrackTileData) => {
        if (tile.type === 'start') {
          scratchPosition.set(tile.x, tileY + 0.055, tile.z);
          scratchMatrix.compose(scratchPosition, scratchQuaternion, scratchScale);
          mesh.setMatrixAt(idx++, scratchMatrix);
        }
      });

      mesh.instanceMatrix.needsUpdate = true;
      return mesh;
    }, [startTilesCount, startEmblemColor, tileY]);

    return (
      <group>
        <primitive object={tilesMesh} />
        <primitive object={safeStarsMesh} />
        <primitive object={startCrestsMesh} />
      </group>
    );
  }
);

InstancedTrackTiles.displayName = 'InstancedTrackTiles';
