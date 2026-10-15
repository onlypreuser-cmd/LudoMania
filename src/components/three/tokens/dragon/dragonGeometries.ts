import * as THREE from 'three';

/**
 * Creates 3D extruded bat-wing geometry with organic scalloped membrane curvature.
 * Features upper bone spar, elbow thumb claw, and 3 radiated finger struts.
 */
export function createDragonWingGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();

  // Root shoulder joint
  shape.moveTo(0, 0);

  // Upper arm spar extending up and outwards to elbow joint
  shape.quadraticCurveTo(0.08, 0.18, 0.18, 0.32);

  // Elbow thumb claw tip
  shape.lineTo(0.22, 0.34);
  shape.lineTo(0.20, 0.29);

  // First outer wing tip (highest finger point)
  shape.quadraticCurveTo(0.36, 0.35, 0.52, 0.34);

  // Scalloped curve between finger 1 and finger 2
  shape.quadraticCurveTo(0.42, 0.20, 0.46, 0.12);

  // Scalloped curve between finger 2 and finger 3 (lowest finger)
  shape.quadraticCurveTo(0.32, 0.08, 0.34, -0.02);

  // Scalloped inner curve returning to lower torso anchor
  shape.quadraticCurveTo(0.18, 0.02, 0.04, -0.04);
  shape.lineTo(0, 0);

  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
  });
}

/**
 * Creates 3D stylized flame medallion for the plinth pedestal front.
 */
export function createPlinthFlameEmblemGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();

  shape.moveTo(0, -0.06);
  // Right outer flame curve
  shape.quadraticCurveTo(0.05, -0.04, 0.06, 0.01);
  shape.quadraticCurveTo(0.07, 0.05, 0.04, 0.08);
  // Right inner notch
  shape.lineTo(0.03, 0.06);
  // Center high flame tip
  shape.quadraticCurveTo(0.035, 0.10, 0, 0.14);
  // Left inner notch
  shape.quadraticCurveTo(-0.035, 0.10, -0.03, 0.06);
  shape.lineTo(-0.04, 0.08);
  // Left outer flame curve
  shape.quadraticCurveTo(-0.07, 0.05, -0.06, 0.01);
  shape.quadraticCurveTo(-0.05, -0.04, 0, -0.06);

  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
}

/**
 * Swept organic dragon horn with spiral ridges, curving backwards and upwards.
 */
export function createDragonMainHornGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 28;
  const segments = 18;
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    // Swept curve path: upward, back, and slightly outwards
    const y = t * 0.42;
    const z = -Math.pow(t, 1.35) * 0.22 + Math.pow(t, 2.5) * 0.06;
    const x = Math.sin(t * Math.PI * 0.55) * 0.085;
    // Tapering radius with spiral ridge texture
    const baseR = Math.max(0.002, (1 - t) * 0.078);
    const spiralAngle = t * Math.PI * 2 * 3.0;

    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const ridgeWave = Math.cos(theta - spiralAngle);
      const r = baseR * (1 + 0.18 * ridgeWave);

      vertices.push(x + Math.cos(theta) * r, y, z + Math.sin(theta) * r);
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * (segments + 1) + j;
      const b = (i + 1) * (segments + 1) + j;
      const c = (i + 1) * (segments + 1) + (j + 1);
      const d = i * (segments + 1) + (j + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Pre-allocated singleton geometries for the collectible Dragon figurine.
 * Reused across all 16 tokens and both Fire & Ice variants (0 duplicate VRAM allocations).
 */
export const DRAGON_GEO = {
  // Pedestal Plinth
  plinthBaseCylinder: new THREE.CylinderGeometry(0.38, 0.44, 0.16, 36),
  plinthGoldRing: new THREE.TorusGeometry(0.385, 0.016, 16, 36),
  plinthTopSeat: new THREE.CylinderGeometry(0.375, 0.38, 0.02, 36),
  plinthFlameEmblem: createPlinthFlameEmblemGeometry(),

  // Torso, Belly & Body
  torsoSphere: new THREE.SphereGeometry(1, 28, 28),
  bellyPlateCapsule: new THREE.CapsuleGeometry(0.048, 0.18, 12, 20),
  frontPawCapsule: new THREE.CapsuleGeometry(0.045, 0.11, 12, 16),
  clawCone: new THREE.ConeGeometry(0.018, 0.042, 12),
  haunchSphere: new THREE.SphereGeometry(1, 20, 20),
  curledTailTorus: new THREE.TorusGeometry(0.16, 0.052, 14, 28, Math.PI * 1.35),
  tailFlameTip: new THREE.ConeGeometry(0.052, 0.14, 16),

  // Dorsal Spines & Crest
  dorsalSpineCone: new THREE.ConeGeometry(0.038, 0.09, 14),
  foreheadCenterSpine: new THREE.ConeGeometry(0.042, 0.12, 14),
  browSpineCone: new THREE.ConeGeometry(0.028, 0.07, 12),
  cheekFinCone: new THREE.ConeGeometry(0.045, 0.14, 14),

  // Wings
  batWing: createDragonWingGeometry(),
  wingThumbClaw: new THREE.ConeGeometry(0.018, 0.055, 12),

  // Head, Snout & Horns
  headSphere: new THREE.SphereGeometry(1, 30, 30),
  snoutCylinder: new THREE.CylinderGeometry(0.14, 0.18, 0.16, 24),
  browCapsule: new THREE.CapsuleGeometry(0.035, 0.13, 12, 16),
  nostrilSphere: new THREE.SphereGeometry(1, 12, 12),
  mainHorn: createDragonMainHornGeometry(),
};
