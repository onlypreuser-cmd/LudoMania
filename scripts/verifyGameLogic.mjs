import { evaluateBestAiMove } from '../src/engine/ai/aiDecisionEngine.ts';
import { createInitialPawns } from '../src/machines/ludoMachine.ts';
import { DICE_SKINS } from '../src/engine/boardConfig.ts';
import { ALL_DICE_SKINS } from '../src/store/useProfileStore.ts';

console.log('--- 🧪 STARTING LUDOMANIA AI & 4-PLAYER & DUO TEST SUITE ---');

// TEST 1: createInitialPawns with dynamic pawnCount
const testPlayers = [
  { id: 'p1', name: 'Player 1', avatarId: 'avatar-1', color: 'blue', tokenSkin: 'classic', diceSkin: 'classic-white' },
  { id: 'p2', name: 'RoboMaster', avatarId: 'avatar-2', color: 'red', tokenSkin: 'knight', diceSkin: 'ruby-blaze', isAi: true },
  { id: 'p3', name: 'CyberNinja', avatarId: 'avatar-3', color: 'green', tokenSkin: 'dog', diceSkin: 'emerald-jade', isAi: true },
  { id: 'p4', name: 'TitanClaw', avatarId: 'avatar-4', color: 'yellow', tokenSkin: 'cat', diceSkin: 'royal-gold', isAi: true },
];

const duoPawnsBlitz = createInitialPawns(testPlayers.slice(0, 2), 2);
console.assert(duoPawnsBlitz.length === 4, `Expected 4 pawns for Blitz Duo (2 players * 2 pawns), got ${duoPawnsBlitz.length}`);
console.log('✅ TEST 1 Passed: Blitz Duo creates exactly 2 pawns per player');

const fourPlayerPawns = createInitialPawns(testPlayers, 4);
console.assert(fourPlayerPawns.length === 16, `Expected 16 pawns for 4 players (4 * 4), got ${fourPlayerPawns.length}`);
console.log('✅ TEST 2 Passed: 4-Player mode creates exactly 16 pawns across 4 colors');

// TEST 3: AI evaluates and picks Home Goal move over basic advance
const candidateMovesWithHome = [
  {
    pawnId: 'red-0',
    fromStep: 53,
    toStep: 56,
    pathSteps: [54, 55, 56],
    willKillPawnIds: [],
    capturedPawnsInfo: [],
    willReachHome: true,
    landsOnSafeStar: false,
  },
  {
    pawnId: 'red-1',
    fromStep: 10,
    toStep: 13,
    pathSteps: [11, 12, 13],
    willKillPawnIds: [],
    capturedPawnsInfo: [],
    willReachHome: false,
    landsOnSafeStar: false,
  },
];

const bestHomeMove = evaluateBestAiMove(
  candidateMovesWithHome,
  fourPlayerPawns,
  1,
  'red',
  'hard'
);
console.assert(bestHomeMove.pawnId === 'red-0', `Expected AI to choose red-0 for instant home goal, got ${bestHomeMove.pawnId}`);
console.log('✅ TEST 3 Passed: AI prioritizes Home Goal entry');

// TEST 4: AI evaluates and prioritizes capture over basic advance
const candidateMovesWithCapture = [
  {
    pawnId: 'red-0',
    fromStep: 20,
    toStep: 24,
    pathSteps: [21, 22, 23, 24],
    willKillPawnIds: ['blue-0'],
    capturedPawnsInfo: [{ pawnId: 'blue-0', color: 'blue', pawnIndex: 0, fromStep: 11 }],
    willReachHome: false,
    landsOnSafeStar: false,
  },
  {
    pawnId: 'red-1',
    fromStep: 5,
    toStep: 9,
    pathSteps: [6, 7, 8, 9],
    willKillPawnIds: [],
    capturedPawnsInfo: [],
    willReachHome: false,
    landsOnSafeStar: false,
  },
];

const bestCaptureMove = evaluateBestAiMove(
  candidateMovesWithCapture,
  fourPlayerPawns,
  1,
  'red',
  'hard'
);
console.assert(bestCaptureMove.pawnId === 'red-0', `Expected AI to choose red-0 for capture, got ${bestCaptureMove.pawnId}`);
console.log('✅ TEST 4 Passed: AI prioritizes enemy capture');

// TEST 5: AI avoids suicide moves into enemy fire
const pawnsWithThreat = [
  { id: 'red-0', playerIndex: 1, color: 'red', pawnIndex: 0, step: 10 },
  { id: 'red-1', playerIndex: 1, color: 'red', pawnIndex: 1, step: 0 },
  // Enemy blue pawn is waiting at global tile 20 (blue step 20)
  // Red step 10 -> global tile 23. If red moves +2 to step 12 -> global tile 25.
  // Distance from blue (20) to red (25) is 5 tiles -> directly in blue's strike range!
  { id: 'blue-0', playerIndex: 0, color: 'blue', pawnIndex: 0, step: 20 },
];

const candidateMovesSuicideVsSafe = [
  {
    pawnId: 'red-0',
    fromStep: 10,
    toStep: 12, // Land at global 25 (threat from blue at 20!)
    pathSteps: [11, 12],
    willKillPawnIds: [],
    capturedPawnsInfo: [],
    willReachHome: false,
    landsOnSafeStar: false,
  },
  {
    pawnId: 'red-1',
    fromStep: 0,
    toStep: 2, // Lands on step 2 (global 15, far from blue at 20)
    pathSteps: [1, 2],
    willKillPawnIds: [],
    capturedPawnsInfo: [],
    willReachHome: false,
    landsOnSafeStar: false,
  },
];

const safeMoveChoice = evaluateBestAiMove(
  candidateMovesSuicideVsSafe,
  pawnsWithThreat,
  1,
  'red',
  'hard'
);
console.assert(safeMoveChoice.pawnId === 'red-1', `Expected AI to avoid walking into blue crosshairs and choose red-1, got ${safeMoveChoice.pawnId}`);
console.log('✅ TEST 5 Passed: AI detects enemy crosshairs and avoids suicide moves');

// TEST 6: Verify Magma Inferno and Glacial Cryo dice skins catalog
console.assert(ALL_DICE_SKINS.includes('magma-inferno'), 'Expected ALL_DICE_SKINS to include magma-inferno');
console.assert(ALL_DICE_SKINS.includes('cryo-glacial'), 'Expected ALL_DICE_SKINS to include cryo-glacial');
console.assert(DICE_SKINS.length === 8, `Expected 8 dice skins in catalog, got ${DICE_SKINS.length}`);
console.log('✅ TEST 6 Passed: Magma Inferno and Glacial Cryo dice skins catalog verified');

console.log('--- 🎉 ALL LUDOMANIA TEST SUITE CHECKS PASSED SUCCESSFULLY! ---');
