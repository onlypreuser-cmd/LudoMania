import * as THREE from 'three';

export function createStar8Geometry(outer: number, inner: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
  });
}

export function createStar5Geometry(outer: number, inner: number, depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
  });
}

export const BOARD_GEO = {
  tileChamfer: new THREE.BoxGeometry(0.92, 0.1, 0.92),
  trackDividerH: new THREE.BoxGeometry(15.2, 0.04, 0.03),
  trackDividerV: new THREE.BoxGeometry(0.03, 0.04, 15.2),
  unitSphere: new THREE.SphereGeometry(1, 24, 24),
  lowSphere: new THREE.SphereGeometry(1, 14, 14),
  unitCylinder: new THREE.CylinderGeometry(1, 1, 1, 24),
  unitCone: new THREE.ConeGeometry(1, 1, 20),
  unitTorus: new THREE.TorusGeometry(1, 0.08, 16, 32),
  thinTorus: new THREE.TorusGeometry(1, 0.035, 12, 28),
  subChassisBox: new THREE.BoxGeometry(15.1, 0.22, 15.1),
  outerRailH: new THREE.BoxGeometry(15.4, 0.36, 0.36),
  outerRailV: new THREE.BoxGeometry(0.36, 0.36, 15.4),
  cornerPlinth: new THREE.BoxGeometry(0.85, 0.44, 0.85),
  yardBasinBox: new THREE.BoxGeometry(5.85, 0.16, 5.85),
  yardPadCylinder: new THREE.CylinderGeometry(0.72, 0.78, 0.06, 28),
  star8Point: createStar8Geometry(0.36, 0.16, 0.035),
  star5Point: createStar5Geometry(0.32, 0.14, 0.03),
  waterPlane: new THREE.PlaneGeometry(5.4, 5.4),
  daisTier1: new THREE.CylinderGeometry(1.4, 1.48, 0.12, 6),
  daisTier2: new THREE.CylinderGeometry(1.1, 1.18, 0.12, 6),
  daisTier3: new THREE.CylinderGeometry(0.8, 0.88, 0.12, 6),
  corinthianCap: new THREE.BoxGeometry(0.55, 0.12, 0.55),
  flutedColumn: new THREE.CylinderGeometry(0.24, 0.27, 0.85, 16),
};
