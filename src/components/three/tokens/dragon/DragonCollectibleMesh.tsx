import { RoundedBox } from '@react-three/drei';
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { PlayerColor } from '../../../../types/game';
import { DRAGON_GEO } from './dragonGeometries';
import { DragonPalette, getDragonPalette } from './dragonPalettes';

interface DragonCollectibleMeshProps {
  color?: PlayerColor;
  variant?: 'fire' | 'ice';
  customPalette?: Partial<DragonPalette>;
  scale?: number;
}

/**
 * High-Detail Procedural Dragon Collectible Figurine.
 * Faithfully sculpts the 10-view orthographic reference image:
 * - Round Showcase Plinth Base with gold rims & front 3D Flame Medallion
 * - Chubby Seated Torso with 5 layered horizontal cream/gold belly scute plates
 * - 2 Front Paws with 3 gold claw toes planted forward on plinth
 * - Tucked Hind Haunches with claws on pedestal sides
 * - Curled Dragon Tail wrapping to side with golden dorsal ridges & flame spade fin
 * - Segmented 24K Gold Dorsal Spines running all the way up the back
 * - Spread Bat Wings with upper bone spar, elbow thumb claw & 3-scalloped membrane
 * - Heroic Chibi Head: boxy snout, defined nostrils, chin & jowls
 * - Fierce angled brow ridges + Central Forehead Horn + 3-tiered cheek frills
 * - Swept-back curved spiral 24K gold horns
 * - 3-Layer Expressive Pixie Eyes with dual starlight catchlights
 * - 100% Solid Opaque PBR (ZERO glass/transmission!) with satin-matte vinyl finish.
 */
export const DragonCollectibleMesh: React.FC<DragonCollectibleMeshProps> = React.memo(
  ({ color, variant = 'fire', customPalette, scale = 1 }) => {
    const palette = useMemo(() => {
      const resolved = getDragonPalette(color, variant);
      return customPalette ? { ...resolved, ...customPalette } : resolved;
    }, [color, variant, customPalette]);

    return (
      <group scale={scale} position={[0, -0.05, 0]}>
        {/* ============================================================== */}
        {/* 1. ROUND SHOWCASE PLINTH BASE WITH 24K GOLD RIMS & EMBLEM     */}
        {/* ============================================================== */}
        <group position={[0, 0, 0]}>
          {/* Main Lacquer Tapered Plinth Cylinder */}
          <mesh
            geometry={DRAGON_GEO.plinthBaseCylinder}
            position={[0, 0.05, 0]}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color={palette.plinthBody}
              roughness={0.24}
              metalness={0.15}
              clearcoat={0.9}
              clearcoatRoughness={0.06}
            />
          </mesh>

          {/* Lower 24K Gold Plinth Rim */}
          <mesh
            geometry={DRAGON_GEO.plinthGoldRing}
            position={[0, -0.02, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[1.1, 1.1, 1]}
          >
            <meshStandardMaterial
              color={palette.plinthGold}
              metalness={0.94}
              roughness={0.1}
            />
          </mesh>

          {/* Upper 24K Gold Plinth Rim */}
          <mesh
            geometry={DRAGON_GEO.plinthGoldRing}
            position={[0, 0.125, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[0.97, 0.97, 0.85]}
          >
            <meshStandardMaterial
              color={palette.plinthGold}
              metalness={0.94}
              roughness={0.1}
            />
          </mesh>

          {/* Top Circular Seat Plate */}
          <mesh
            geometry={DRAGON_GEO.plinthTopSeat}
            position={[0, 0.13, 0]}
            receiveShadow
          >
            <meshPhysicalMaterial
              color={palette.bodyDark}
              roughness={0.32}
              metalness={0.1}
            />
          </mesh>

          {/* 3D Stylized Flame Medallion on Front Plinth Curve */}
          <mesh
            geometry={DRAGON_GEO.plinthFlameEmblem}
            position={[0, 0.05, 0.405]}
            rotation={[-0.14, 0, 0]}
            scale={0.95}
          >
            <meshPhysicalMaterial
              color={palette.flameEmblem}
              metalness={0.88}
              roughness={0.12}
              clearcoat={1}
            />
          </mesh>
        </group>

        {/* ============================================================== */}
        {/* 2. CHUBBY SEATED DRAGON TORSO & 5 LAYERED BELLY SCUTE PLATES    */}
        {/* ============================================================== */}
        <group position={[0, 0.13, 0]}>
          {/* Main Seated Organic Torso */}
          <mesh
            geometry={DRAGON_GEO.torsoSphere}
            position={[0, 0.20, -0.02]}
            scale={[0.26, 0.28, 0.235]}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color={palette.bodyPrimary}
              roughness={0.36}
              metalness={0.12}
              clearcoat={0.24}
              clearcoatRoughness={0.12}
            />
          </mesh>

          {/* 5 Layered Horizontal Cream/Gold Scute Belly Plates */}
          {[
            { y: 0.08, w: 0.18, d: 0.14 },
            { y: 0.14, w: 0.17, d: 0.145 },
            { y: 0.20, w: 0.155, d: 0.14 },
            { y: 0.26, w: 0.135, d: 0.13 },
            { y: 0.32, w: 0.11, d: 0.11 },
          ].map((plate, pIdx) => (
            <mesh
              key={pIdx}
              geometry={DRAGON_GEO.bellyPlateCapsule}
              position={[0, plate.y, 0.135]}
              rotation={[0, 0, Math.PI / 2]}
              scale={[0.75, plate.w, plate.d]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.bellyPlate}
                roughness={0.32}
                metalness={0.08}
                clearcoat={0.28}
              />
            </mesh>
          ))}

          {/* ============================================================== */}
          {/* 3. FRONT CHUBBY PAWS WITH 3 GOLD CLAW TOES                     */}
          {/* ============================================================== */}
          {[-0.095, 0.095].map((px, pIdx) => (
            <group key={pIdx} position={[px, 0.055, 0.16]}>
              {/* Chubby Leg Capsule Planted Forward */}
              <mesh
                geometry={DRAGON_GEO.frontPawCapsule}
                rotation={[0.35, 0, pIdx === 0 ? 0.18 : -0.18]}
                scale={[0.95, 0.9, 0.95]}
                castShadow
              >
                <meshPhysicalMaterial
                  color={palette.bodyPrimary}
                  roughness={0.36}
                  clearcoat={0.2}
                />
              </mesh>
              {/* 3 Golden Claws on Paw Tip */}
              {[-0.026, 0, 0.026].map((cx, cIdx) => (
                <mesh
                  key={cIdx}
                  geometry={DRAGON_GEO.clawCone}
                  position={[cx, -0.045, 0.065]}
                  rotation={[0.85, 0, cx * 3]}
                  scale={0.9}
                >
                  <meshStandardMaterial
                    color={palette.clawColor}
                    metalness={0.92}
                    roughness={0.12}
                  />
                </mesh>
              ))}
            </group>
          ))}

          {/* ============================================================== */}
          {/* 4. TUCKED HIND HAUNCHES WITH CLAWS ON PEDESTAL SIDES           */}
          {/* ============================================================== */}
          {[-0.175, 0.175].map((hx, hIdx) => (
            <group key={hIdx} position={[hx, 0.085, 0.02]}>
              <mesh
                geometry={DRAGON_GEO.haunchSphere}
                scale={[0.11, 0.125, 0.145]}
                rotation={[0.2, 0, hIdx === 0 ? 0.15 : -0.15]}
                castShadow
              >
                <meshPhysicalMaterial
                  color={palette.bodyDark}
                  roughness={0.36}
                  clearcoat={0.2}
                />
              </mesh>
              {/* Side Hind Claws resting on plinth */}
              {[-0.018, 0.018].map((cx, cIdx) => (
                <mesh
                  key={cIdx}
                  geometry={DRAGON_GEO.clawCone}
                  position={[hIdx === 0 ? -0.05 + cx : 0.05 + cx, -0.06, 0.11]}
                  rotation={[0.7, 0, cx * 3]}
                  scale={0.8}
                >
                  <meshStandardMaterial
                    color={palette.clawColor}
                    metalness={0.92}
                    roughness={0.12}
                  />
                </mesh>
              ))}
            </group>
          ))}

          {/* ============================================================== */}
          {/* 5. CURLED DRAGON TAIL WITH GOLDEN FLAME SPADE FIN TIP          */}
          {/* ============================================================== */}
          <group position={[0.02, 0.055, -0.08]}>
            {/* Curled Organic Tail Wrapping Around to the Right */}
            <mesh
              geometry={DRAGON_GEO.curledTailTorus}
              position={[0.08, 0.04, -0.04]}
              rotation={[0.3, 0.45, -0.1]}
              scale={[1.05, 0.85, 0.95]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.bodyDark}
                roughness={0.35}
                clearcoat={0.2}
              />
            </mesh>
            {/* Golden Flame Spade Fin Tip at the Front Right */}
            <mesh
              geometry={DRAGON_GEO.tailFlameTip}
              position={[0.24, 0.055, 0.09]}
              rotation={[0.4, 0.2, -1.2]}
              scale={[0.85, 1.15, 0.55]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.hornGold}
                metalness={0.88}
                roughness={0.14}
                clearcoat={1}
              />
            </mesh>
          </group>

          {/* ============================================================== */}
          {/* 6. CONTINUOUS 24K GOLD DORSAL SPINE RIDGE ALONG BACK           */}
          {/* ============================================================== */}
          {[
            { y: 0.38, z: -0.16, s: 0.048, rot: -0.7 },
            { y: 0.32, z: -0.18, s: 0.044, rot: -0.85 },
            { y: 0.26, z: -0.19, s: 0.040, rot: -1.0 },
            { y: 0.20, z: -0.18, s: 0.036, rot: -1.15 },
            { y: 0.14, z: -0.16, s: 0.032, rot: -1.3 },
            { y: 0.08, z: -0.13, s: 0.028, rot: -1.45 },
          ].map((sp, sIdx) => (
            <mesh
              key={sIdx}
              geometry={DRAGON_GEO.dorsalSpineCone}
              position={[0, sp.y, sp.z]}
              rotation={[sp.rot, 0, 0]}
              scale={[sp.s * 0.9, sp.s * 1.4, sp.s * 0.5]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.hornGold}
                metalness={0.92}
                roughness={0.12}
                clearcoat={1}
              />
            </mesh>
          ))}

          {/* ============================================================== */}
          {/* 7. MAJESTIC SPREAD BAT WINGS (VISIBLE IN FRONT & TOP-DOWN!)    */}
          {/* ============================================================== */}
          {[-1, 1].map((side, wIdx) => (
            <group
              key={wIdx}
              position={[side * 0.12, 0.24, -0.10]}
              rotation={[0.16, side * -0.42, side * -0.15]}
            >
              {/* 3D Extruded Scalloped Bat Wing Membrane */}
              <mesh
                geometry={DRAGON_GEO.batWing}
                rotation={[0, side === 1 ? 0 : Math.PI, 0]}
                position={[0, 0, 0]}
                scale={[0.78, 0.78, 0.78]}
                castShadow
              >
                <meshPhysicalMaterial
                  color={palette.bodyPrimary}
                  roughness={0.36}
                  metalness={0.1}
                  clearcoat={0.3}
                />
              </mesh>
              {/* Sharp 24K Gold Thumb Claw at Wing Elbow */}
              <mesh
                geometry={DRAGON_GEO.wingThumbClaw}
                position={[side * 0.15, 0.25, 0.02]}
                rotation={[0.2, 0, side * -0.6]}
                scale={0.75}
              >
                <meshStandardMaterial
                  color={palette.hornGold}
                  metalness={0.94}
                  roughness={0.1}
                />
              </mesh>
            </group>
          ))}

          {/* ============================================================== */}
          {/* 8. HEROIC CHIBI DRAGON HEAD WITH DEFINED SNOUT & CHEEKS        */}
          {/* ============================================================== */}
          <group position={[0, 0.44, 0.04]}>
            {/* Main Rounded Cranium */}
            <mesh
              geometry={DRAGON_GEO.headSphere}
              scale={[0.28, 0.25, 0.255]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.bodyPrimary}
                roughness={0.34}
                metalness={0.1}
                clearcoat={0.24}
              />
            </mesh>

            {/* Puffy Lower Side Jowls / Cheeks */}
            {[-0.145, 0.145].map((cx, cIdx) => (
              <mesh
                key={cIdx}
                geometry={DRAGON_GEO.torsoSphere}
                position={[cx, -0.05, 0.10]}
                scale={[0.11, 0.09, 0.11]}
                castShadow
              >
                <meshPhysicalMaterial
                  color={palette.bodyPrimary}
                  roughness={0.34}
                  clearcoat={0.24}
                />
              </mesh>
            ))}

            {/* Boxier Forward Dragon Snout Bridge & Chin (NOT a ball nose!) */}
            <group position={[0, -0.065, 0.18]}>
              <RoundedBox
                args={[0.23, 0.15, 0.20]}
                radius={0.05}
                smoothness={4}
                castShadow
              >
                <meshPhysicalMaterial
                  color={palette.bodyPrimary}
                  roughness={0.32}
                  clearcoat={0.26}
                />
              </RoundedBox>
              {/* Subtle nostril indentations */}
              {[-0.038, 0.038].map((nx, nIdx) => (
                <mesh
                  key={nIdx}
                  geometry={DRAGON_GEO.nostrilSphere}
                  position={[nx, 0.028, 0.102]}
                  scale={[0.016, 0.012, 0.014]}
                >
                  <meshStandardMaterial color={palette.bodyDark} roughness={0.4} />
                </mesh>
              ))}
            </group>

            {/* Fierce Angled Brow Ridges (Heroic Expression!) */}
            {[-0.115, 0.115].map((bx, bIdx) => {
              const sign = bIdx === 0 ? -1 : 1;
              return (
                <mesh
                  key={bIdx}
                  geometry={DRAGON_GEO.browCapsule}
                  position={[bx, 0.115, 0.175]}
                  rotation={[0.22, sign * -0.22, sign * -0.42]}
                  scale={[0.9, 0.85, 0.9]}
                >
                  <meshPhysicalMaterial
                    color={palette.bodyPrimary}
                    roughness={0.32}
                    clearcoat={0.3}
                  />
                </mesh>
              );
            })}

            {/* 3-Layer Expressive Pixie Dragon Eyes with Dual Catchlights */}
            {[-0.112, 0.112].map((ex, eIdx) => {
              const sign = eIdx === 0 ? -1 : 1;
              return (
                <group key={eIdx} position={[ex, 0.045, 0.175]}>
                  {/* Dark Almond Eyelid Rim */}
                  <mesh
                    geometry={DRAGON_GEO.haunchSphere}
                    scale={[0.058, 0.065, 0.045]}
                    rotation={[0.1, sign * 0.12, sign * 0.18]}
                  >
                    <meshBasicMaterial color="#1e1b18" />
                  </mesh>
                  {/* Rich Amber/Sapphire Iris */}
                  <mesh
                    geometry={DRAGON_GEO.haunchSphere}
                    position={[0, 0, 0.018]}
                    scale={[0.050, 0.056, 0.038]}
                  >
                    <meshPhysicalMaterial
                      color={palette.irisColor}
                      roughness={0.1}
                      clearcoat={1}
                      clearcoatRoughness={0.02}
                    />
                  </mesh>
                  {/* Glossy Black Pupil */}
                  <mesh
                    geometry={DRAGON_GEO.haunchSphere}
                    position={[0, 0, 0.032]}
                    scale={[0.030, 0.036, 0.024]}
                  >
                    <meshBasicMaterial color="#09090b" />
                  </mesh>
                  {/* Primary Large Upper-Left Catchlight */}
                  <mesh
                    geometry={DRAGON_GEO.nostrilSphere}
                    position={[-sign * 0.014, 0.022, 0.050]}
                    scale={0.016}
                  >
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                  {/* Secondary Micro Lower-Right Glint */}
                  <mesh
                    geometry={DRAGON_GEO.nostrilSphere}
                    position={[sign * 0.016, -0.016, 0.048]}
                    scale={0.008}
                  >
                    <meshBasicMaterial color="#ffffff" />
                  </mesh>
                </group>
              );
            })}

            {/* ============================================================== */}
            {/* 9. 24K GOLD HORNS, FOREHEAD CREST & 3-TIERED CHEEK FRILLS       */}
            {/* ============================================================== */}
            {/* Twin Main Curved Swept-Back 24K Gold Horns */}
            {[-0.13, 0.13].map((hx, hIdx) => {
              const sign = hIdx === 0 ? 1 : -1;
              return (
                <mesh
                  key={hx}
                  geometry={DRAGON_GEO.mainHorn}
                  position={[hx, 0.17, -0.02]}
                  rotation={[-0.18, sign * 0.16, sign * 0.35]}
                  scale={[0.82, 0.92, 0.82]}
                  castShadow
                >
                  <meshPhysicalMaterial
                    color={palette.hornGold}
                    metalness={0.92}
                    roughness={0.12}
                    clearcoat={1}
                  />
                </mesh>
              );
            })}

            {/* Central Forehead 24K Gold Diamond Spine */}
            <mesh
              geometry={DRAGON_GEO.foreheadCenterSpine}
              position={[0, 0.145, 0.155]}
              rotation={[0.35, 0, 0]}
              scale={[0.85, 1.15, 0.65]}
              castShadow
            >
              <meshPhysicalMaterial
                color={palette.hornGold}
                metalness={0.92}
                roughness={0.12}
                clearcoat={1}
              />
            </mesh>

            {/* 2 Brow Ridge Mini Horn Spikes */}
            {[-0.075, 0.075].map((bx, bIdx) => (
              <mesh
                key={bIdx}
                geometry={DRAGON_GEO.browSpineCone}
                position={[bx, 0.16, 0.11]}
                rotation={[0.15, 0, bIdx === 0 ? -0.3 : 0.3]}
                scale={0.8}
              >
                <meshStandardMaterial
                  color={palette.hornGold}
                  metalness={0.9}
                  roughness={0.15}
                />
              </mesh>
            ))}

            {/* 3-Tiered Pointed Cheek Frills on Each Temple/Cheek */}
            {[-1, 1].map((sign, sIdx) => (
              <group key={sIdx} position={[sign * 0.24, 0.01, 0.03]}>
                {/* Upper Cheek Fin */}
                <mesh
                  geometry={DRAGON_GEO.cheekFinCone}
                  position={[0, 0.06, 0]}
                  rotation={[0, 0, sign * 1.25]}
                  scale={[0.42, 0.58, 0.24]}
                >
                  <meshPhysicalMaterial
                    color={palette.hornGold}
                    metalness={0.9}
                    roughness={0.15}
                  />
                </mesh>
                {/* Middle Cheek Fin */}
                <mesh
                  geometry={DRAGON_GEO.cheekFinCone}
                  position={[0, 0, 0.015]}
                  rotation={[0, 0, sign * 1.4]}
                  scale={[0.46, 0.65, 0.26]}
                >
                  <meshPhysicalMaterial
                    color={palette.hornGold}
                    metalness={0.9}
                    roughness={0.15}
                  />
                </mesh>
                {/* Lower Cheek Fin */}
                <mesh
                  geometry={DRAGON_GEO.cheekFinCone}
                  position={[0, -0.06, 0.02]}
                  rotation={[0, 0, sign * 1.55]}
                  scale={[0.38, 0.52, 0.22]}
                >
                  <meshPhysicalMaterial
                    color={palette.hornGold}
                    metalness={0.9}
                    roughness={0.15}
                  />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </group>
    );
  }
);

DragonCollectibleMesh.displayName = 'DragonCollectibleMesh';
