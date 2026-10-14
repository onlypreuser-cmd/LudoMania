import { useThree } from '@react-three/fiber';
import React, { useEffect } from 'react';
import * as THREE from 'three';

export const BOARD_CAM_Y = 14.5;
export const BOARD_CAM_Z = 3.25;
export const BOARD_CAM_COS = BOARD_CAM_Y / Math.hypot(BOARD_CAM_Y, BOARD_CAM_Z);

/**
 * Calibrates the OrthographicCamera frustum to [-7.5 .. +7.5] horizontally and
 * [-7.5 * cos(theta) .. +7.5 * cos(theta)] vertically so every floor cell (row, col)
 * maps with 0.0px foreshortening error onto the flat 15x15 CSS Grid below.
 */
export const AutoZoomOrthographicController: React.FC = () => {
  const { camera, size } = useThree();
  useEffect(() => {
    if ('zoom' in camera) {
      const ortho = camera as THREE.OrthographicCamera;
      ortho.position.set(0, BOARD_CAM_Y, BOARD_CAM_Z);
      ortho.left = -7.5;
      ortho.right = 7.5;
      ortho.top = 7.5 * BOARD_CAM_COS;
      ortho.bottom = -7.5 * BOARD_CAM_COS;
      ortho.zoom = 1;
      ortho.lookAt(0, 0, 0);
      ortho.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);
  return null;
};
