import * as THREE from 'three';

/**
 * Pre-allocated, module-scope shared geometries for Phase 2 Tactical Board Powers.
 * Follows procedural 3D PBR guidelines: zero duplicate heap allocations, smooth organic contours.
 */

// 1. Classical Knight Plume - Sweeping majestic plumage arching over the helmet
export function createPlumeGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const rings = 20;
  const segments = 16;
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= rings; i++) {
    const t = i / rings;
    // Sweeps up and arches backward
    const y = Math.sin(t * Math.PI * 0.8) * 0.28 + t * 0.05;
    const z = -Math.pow(t, 1.35) * 0.26;
    const x = Math.sin(t * Math.PI) * 0.018;
    // Swells in middle, tapers at root and tail
    const r = Math.sin(t * Math.PI) * 0.065 + 0.012;

    for (let j = 0; j <= segments; j++) {
      const theta = (j / segments) * Math.PI * 2;
      // Flatten slightly along X for a crest profile
      const vx = x + Math.cos(theta) * (r * 0.55);
      const vy = y + Math.sin(theta) * r;
      const vz = z;
      vertices.push(vx, vy, vz);
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

// 2. Tower / Kite Shield Geometry with beveled rim & convex arch
export function createTowerShieldGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  // Shield silhouette: arched top, tapering body, pointed/curved bottom tip
  shape.moveTo(0, 0.32);
  shape.quadraticCurveTo(0.18, 0.32, 0.19, 0.16);
  shape.lineTo(0.17, -0.05);
  shape.quadraticCurveTo(0.15, -0.22, 0, -0.32);
  shape.quadraticCurveTo(-0.15, -0.22, -0.17, -0.05);
  shape.lineTo(-0.19, 0.16);
  shape.quadraticCurveTo(-0.18, 0.32, 0, 0.32);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.014,
    bevelSegments: 3,
  });
}

// 3. Heraldic Lion Medallion / Crest
export function createHeraldicLionGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  // Stylized royal lion silhouette
  shape.moveTo(0, 0.12);
  // Crown / ears
  shape.lineTo(0.04, 0.13);
  shape.lineTo(0.06, 0.10);
  shape.lineTo(0.09, 0.07);
  // Mane outer curves
  shape.quadraticCurveTo(0.12, 0.03, 0.10, -0.04);
  shape.quadraticCurveTo(0.08, -0.10, 0.04, -0.12);
  shape.lineTo(0, -0.14);
  shape.lineTo(-0.04, -0.12);
  shape.quadraticCurveTo(-0.08, -0.10, -0.10, -0.04);
  shape.quadraticCurveTo(-0.12, 0.03, -0.09, 0.07);
  shape.lineTo(-0.06, 0.10);
  shape.lineTo(-0.04, 0.13);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.018,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
  });
}

// 4. Ceremonial Halberd Head (Spear point + Crescent Axe + Rear Beak)
export function createHalberdHeadGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  // Central Spear tip
  shape.moveTo(0, 0.28);
  shape.lineTo(0.035, 0.12);
  // Axe side (positive X)
  shape.lineTo(0.03, 0.06);
  shape.quadraticCurveTo(0.16, 0.09, 0.21, 0.02);
  shape.quadraticCurveTo(0.14, -0.06, 0.03, -0.04);
  shape.lineTo(0.02, -0.12);
  shape.lineTo(-0.02, -0.12);
  // Rear armor-piercing beak side (negative X)
  shape.lineTo(-0.03, -0.04);
  shape.quadraticCurveTo(-0.14, -0.05, -0.18, 0.01);
  shape.quadraticCurveTo(-0.13, 0.07, -0.03, 0.06);
  shape.lineTo(-0.035, 0.12);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.004,
    bevelSegments: 2,
  });
}

// 5. Fluted Column Pillar for Roman Carrara Marble Wall
export function createFlutedColumnGeometry(): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  const height = 0.58;
  const radius = 0.085;
  const heightSegments = 16;
  const radialSegments = 24; // 12 flutes (concave grooves)
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let yIdx = 0; yIdx <= heightSegments; yIdx++) {
    const y = (yIdx / heightSegments) * height;
    // Slight classical entasis (widening slightly near middle-bottom)
    const entasis = 1 + Math.sin((yIdx / heightSegments) * Math.PI) * 0.06;

    for (let rIdx = 0; rIdx <= radialSegments; rIdx++) {
      const theta = (rIdx / radialSegments) * Math.PI * 2;
      // 12 fluted scallops
      const scallop = Math.cos(theta * 12) * 0.007;
      const r = (radius + scallop) * entasis;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      vertices.push(x, y, z);
    }
  }

  for (let yIdx = 0; yIdx < heightSegments; yIdx++) {
    for (let rIdx = 0; rIdx < radialSegments; rIdx++) {
      const a = yIdx * (radialSegments + 1) + rIdx;
      const b = (yIdx + 1) * (radialSegments + 1) + rIdx;
      const c = (yIdx + 1) * (radialSegments + 1) + (rIdx + 1);
      const d = yIdx * (radialSegments + 1) + (rIdx + 1);
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

// 6. Classical Baluster (Carved stone spindle)
export function createBalusterLatheGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.045, 0.0),
    new THREE.Vector2(0.045, 0.04),
    new THREE.Vector2(0.03, 0.08),
    new THREE.Vector2(0.024, 0.16),
    new THREE.Vector2(0.042, 0.23),
    new THREE.Vector2(0.046, 0.28),
    new THREE.Vector2(0.025, 0.34),
    new THREE.Vector2(0.04, 0.38),
    new THREE.Vector2(0.045, 0.42),
    new THREE.Vector2(0.0, 0.42),
  ];
  return new THREE.LatheGeometry(points, 20);
}

// 7. Roman Laurel Wreath Medallion
export function createLaurelWreathGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  // Circular ring with stylized leaf scallops
  const outerR = 0.13;
  const innerR = 0.09;
  for (let i = 0; i <= 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const wave = Math.sin(angle * 8) * 0.015;
    const r = outerR + wave;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  const hole = new THREE.Path();
  for (let i = 0; i <= 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    const x = Math.cos(angle) * innerR;
    const y = Math.sin(angle) * innerR;
    if (i === 0) hole.moveTo(x, y);
    else hole.lineTo(x, y);
  }
  shape.holes.push(hole);

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
}

// 8. Jagged Shield Fracture Decal (used when hitsRemaining === 1)
export function createJaggedFractureGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.22);
  shape.lineTo(0.02, 0.14);
  shape.lineTo(-0.01, 0.08);
  shape.lineTo(0.04, 0.02);
  shape.lineTo(0.01, -0.06);
  shape.lineTo(0.05, -0.15);
  shape.lineTo(0.02, -0.22);
  // Slight thickness
  shape.lineTo(0.005, -0.22);
  shape.lineTo(0.03, -0.15);
  shape.lineTo(-0.01, -0.06);
  shape.lineTo(0.02, 0.02);
  shape.lineTo(-0.03, 0.08);
  shape.lineTo(0.005, 0.14);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.008,
    bevelEnabled: false,
  });
}

// 9. Sculpted Paladin Cuirass (Lathe Breastplate with anatomical swell)
export function createCuirassGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, -0.15),
    new THREE.Vector2(0.125, -0.15), // Waist flare
    new THREE.Vector2(0.138, -0.08), // Flared belt line
    new THREE.Vector2(0.152, 0.02),  // Ribcage contour
    new THREE.Vector2(0.175, 0.12),  // Pectoral plate swell
    new THREE.Vector2(0.162, 0.18),  // Clavicle taper
    new THREE.Vector2(0.125, 0.22),  // Gorget collar rim
    new THREE.Vector2(0.0, 0.22),
  ];
  return new THREE.LatheGeometry(points, 24);
}

// 10. Chibi Medieval Barbute Helmet (Monolithic sculpted helm)
export function createBarbuteHelmGeometry(): THREE.LatheGeometry {
  const points = [
    new THREE.Vector2(0.0, -0.13),
    new THREE.Vector2(0.135, -0.13), // Lower cheek/neck rim
    new THREE.Vector2(0.155, -0.04), // Chin and jawline
    new THREE.Vector2(0.178, 0.08),  // Temple & brow ridge swell
    new THREE.Vector2(0.152, 0.17),  // Cranium arch
    new THREE.Vector2(0.085, 0.22),  // Crown apex
    new THREE.Vector2(0.0, 0.23),
  ];
  return new THREE.LatheGeometry(points, 24);
}

// 11. Sculpted Curved Pauldron (Shoulder armor plate)
export function createPauldronGeometry(): THREE.BufferGeometry {
  return new THREE.SphereGeometry(0.092, 18, 18, 0, Math.PI, 0, Math.PI * 0.72);
}

// 12. Crenelated Roman Fortress Wall Block (Monolithic Carrara Marble Battlement)
export function createCrenelatedWallGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const hw = 0.36; // half-width 0.72 total
  shape.moveTo(-hw, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, 0.44); // right shoulder
  // Right merlon
  shape.lineTo(hw, 0.52);
  shape.lineTo(hw - 0.10, 0.52);
  shape.lineTo(hw - 0.10, 0.44);
  // Right crenel (gap)
  shape.lineTo(hw - 0.16, 0.44);
  // Center merlon
  shape.lineTo(hw - 0.16, 0.52);
  shape.lineTo(-(hw - 0.16), 0.52);
  shape.lineTo(-(hw - 0.16), 0.44);
  // Left crenel (gap)
  shape.lineTo(-(hw - 0.10), 0.44);
  // Left merlon
  shape.lineTo(-(hw - 0.10), 0.52);
  shape.lineTo(-hw, 0.52);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.016,
    bevelSize: 0.016,
    bevelSegments: 3,
  });
}

// 13. Floating Hexagonal Kinetic Pad (Hyper Warp Tile)
export function createKineticHexPadGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const r = 0.38;
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const x = Math.cos(angle) * r;
    const y = Math.sin(angle) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 2,
  });
}

// 14. Holographic Kinetic Chevron (>>> Energy Wave)
export function createChevronGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.12, -0.06);
  shape.lineTo(0.0, 0.06);
  shape.lineTo(0.12, -0.06);
  shape.lineTo(0.08, -0.09);
  shape.lineTo(0.0, -0.01);
  shape.lineTo(-0.08, -0.09);
  shape.closePath();

  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.01,
    bevelEnabled: false,
  });
}

// Export singleton bundle of shared geometries
export const POWER_GEO = {
  unitSphere: new THREE.SphereGeometry(1, 24, 24),
  lowSphere: new THREE.SphereGeometry(1, 16, 16),
  unitCylinder: new THREE.CylinderGeometry(1, 1, 1, 24),
  unitBox: new THREE.BoxGeometry(1, 1, 1),
  unitTorus: new THREE.TorusGeometry(1, 0.1, 16, 32),
  thinTorus: new THREE.TorusGeometry(1, 0.04, 14, 28),
  plinthBase: new THREE.CylinderGeometry(0.33, 0.36, 0.08, 32),
  plinthGoldRim: new THREE.TorusGeometry(0.34, 0.022, 14, 32),
  plumeCrest: createPlumeGeometry(),
  towerShield: createTowerShieldGeometry(),
  lionEmblem: createHeraldicLionGeometry(),
  halberdHead: createHalberdHeadGeometry(),
  flutedColumn: createFlutedColumnGeometry(),
  balusterLathe: createBalusterLatheGeometry(),
  laurelWreath: createLaurelWreathGeometry(),
  jaggedFracture: createJaggedFractureGeometry(),
  cuirassLathe: createCuirassGeometry(),
  barbuteHelm: createBarbuteHelmGeometry(),
  pauldronCurved: createPauldronGeometry(),
  crenelatedWall: createCrenelatedWallGeometry(),
  hexPad: createKineticHexPadGeometry(),
  chevronArrow: createChevronGeometry(),
  // Obsidian asteroid chunks & celestial core
  chunkLarge: new THREE.DodecahedronGeometry(0.24, 1),
  chunkMedium: new THREE.DodecahedronGeometry(0.17, 0),
  chunkSmall: new THREE.IcosahedronGeometry(0.11, 0),
  crystalCore: new THREE.OctahedronGeometry(0.18, 0),
  stasisFieldRing: new THREE.TorusGeometry(0.38, 0.018, 16, 36),
  stasisSubRing: new THREE.TorusGeometry(0.44, 0.01, 12, 32),
};
