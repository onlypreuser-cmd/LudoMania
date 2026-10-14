import * as THREE from 'three';

/**
 * Pre-allocated shared geometries at module scope so 16 tokens on the board
 * reuse the exact same GPU vertex buffers (zero duplicate geometry allocations).
 */
export function createStar3DGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const outer = 0.048;
  const inner = 0.022;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(angle) * r;
    const y = -Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
}

/**
 * Swept organic dragon horn that curves backward and upward with smooth tapering.
 */
export function createCurvedDragonHornGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 16;
  const segments = 16;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = t * 0.34;
    const z = -Math.pow(t, 1.45) * 0.17 + Math.pow(t, 2.6) * 0.05;
    const x = Math.sin(t * Math.PI * 0.5) * 0.032;
    const r = Math.max(0.001, (1 - t) * 0.062);
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
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
 * Helical twisted spiral alicorn horn with distinct 3D grooves.
 */
export function createSpiralAlicornHornGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 32;
  const segments = 20;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = t * 0.36;
    const baseR = (1 - t) * 0.062;
    const spiralAngle = t * Math.PI * 2 * 3.5;
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      const wave = Math.cos(theta - spiralAngle);
      const r = Math.max(0.001, baseR * (1 + 0.24 * wave));
      vertices.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
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
 * Sweeping royal chess-pawn bust for Pirate Captain (zero boxiness).
 */
export function createPiratePawnLatheGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.31, 0.0),
    new THREE.Vector2(0.315, 0.04),
    new THREE.Vector2(0.28, 0.08),
    new THREE.Vector2(0.23, 0.13),
    new THREE.Vector2(0.18, 0.22),
    new THREE.Vector2(0.155, 0.32),
    new THREE.Vector2(0.175, 0.42),
    new THREE.Vector2(0.185, 0.47),
    new THREE.Vector2(0.14, 0.52),
    new THREE.Vector2(0.0, 0.53),
  ];
  return new THREE.LatheGeometry(points, 32);
}

/**
 * Plump, cuddly pear-shaped seated robe for Grand Magician (zero cylinder).
 */
export function createMagicianRobeLatheGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.31, 0.0),
    new THREE.Vector2(0.315, 0.05),
    new THREE.Vector2(0.29, 0.1),
    new THREE.Vector2(0.26, 0.18),
    new THREE.Vector2(0.225, 0.28),
    new THREE.Vector2(0.185, 0.38),
    new THREE.Vector2(0.14, 0.46),
    new THREE.Vector2(0.0, 0.47),
  ];
  return new THREE.LatheGeometry(points, 32);
}

/**
 * Organic floppy wizard hat cone with realistic backward fold/crease.
 */
export function createFloppyWizardHatGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 18;
  const segments = 24;
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    const y = t * 0.42;
    const z = -Math.pow(t, 2.0) * 0.14;
    const x = Math.sin(t * Math.PI) * 0.035;
    const r = Math.max(0.001, (1 - t) * 0.22 * (1 - t * 0.1));
    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
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

export function createClassicLatheGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.28, 0.0),
    new THREE.Vector2(0.29, 0.06),
    new THREE.Vector2(0.26, 0.11),
    new THREE.Vector2(0.22, 0.15),
    new THREE.Vector2(0.17, 0.28),
    new THREE.Vector2(0.13, 0.42),
    new THREE.Vector2(0.115, 0.52),
    new THREE.Vector2(0.15, 0.56),
    new THREE.Vector2(0.0, 0.58),
  ];
  return new THREE.LatheGeometry(points, 32);
}

export const CLASSIC_LATHE_GEO = createClassicLatheGeometry();

export const SHARED_GEO = {
  unitSphere: new THREE.SphereGeometry(1, 28, 28),
  lowSphere: new THREE.SphereGeometry(1, 18, 18),
  unitCylinder: new THREE.CylinderGeometry(1, 1, 1, 28),
  pedestalBase: new THREE.CylinderGeometry(0.33, 0.38, 0.13, 32),
  pedestalInner: new THREE.CylinderGeometry(0.28, 0.31, 0.05, 28),
  pedestalRing: new THREE.TorusGeometry(0.31, 0.032, 16, 32),
  themeCollar: new THREE.CylinderGeometry(0.315, 0.345, 0.11, 32),
  selectRingOuter: new THREE.RingGeometry(0.4, 0.54, 36),
  selectRingInner: new THREE.RingGeometry(0.33, 0.38, 36),
  scarfTorus: new THREE.TorusGeometry(0.205, 0.048, 16, 28),
  collarTorus: new THREE.TorusGeometry(0.195, 0.038, 16, 28),
  tailTorus: new THREE.TorusGeometry(0.085, 0.038, 14, 22, Math.PI * 1.35),
  catTailTorus: new THREE.TorusGeometry(0.11, 0.028, 12, 22, Math.PI * 1.2),
  thinTorus: new THREE.TorusGeometry(1, 0.15, 14, 28),
  capsuleLimb: new THREE.CapsuleGeometry(0.065, 0.11, 12, 16),
  hornCone: new THREE.ConeGeometry(0.058, 0.28, 20),
  earCone: new THREE.ConeGeometry(0.095, 0.2, 18),
  star3D: createStar3DGeometry(),
  curvedHorn: createCurvedDragonHornGeometry(),
  spiralHorn: createSpiralAlicornHornGeometry(),
  piratePawnBust: createPiratePawnLatheGeometry(),
  magicianRobe: createMagicianRobeLatheGeometry(),
  floppyHat: createFloppyWizardHatGeometry(),
  kasaHat: new THREE.ConeGeometry(0.38, 0.16, 28),
  kasaBrim: new THREE.TorusGeometry(0.38, 0.02, 12, 28),
  telescopeTube: new THREE.CylinderGeometry(0.045, 0.055, 0.42, 20),
  armillaryRing: new THREE.TorusGeometry(0.12, 0.014, 12, 24),
  mechaThruster: new THREE.CylinderGeometry(0.05, 0.07, 0.22, 18),
  wingFeather: new THREE.ConeGeometry(0.06, 0.32, 16),
  gemOrb: new THREE.IcosahedronGeometry(0.18, 1),
};
