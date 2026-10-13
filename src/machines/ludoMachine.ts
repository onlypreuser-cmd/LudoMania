import { assign, setup } from 'xstate';
import { BOARD_THEMES } from '../engine/boardConfig';
import {
  createInitialBiasState,
  getLegalMovesForPlayer,
  rollSmartDice,
} from '../engine/diceEngine';
import {
  BoardThemeId,
  DiceBiasState,
  MoveEvaluation,
  Pawn,
  PlayerConfig,
  SavedGameSession,
} from '../types/game';

export interface LudoMachineContext {
  players: PlayerConfig[];
  pawns: Pawn[];
  boardTheme: BoardThemeId;
  currentPlayerIndex: number;
  diceValue: number | null;
  playerLastDiceValues: number[];
  consecutiveSixes: number;
  legalMoves: MoveEvaluation[];
  activeMove: MoveEvaluation | null;
  hasExtraTurn: boolean;
  lastCapturedPawnIds: string[];
  captureBonusPoints: number[];
  biasState: DiceBiasState;
  winnerIndex: number | null;
  statusMessage: string;
  turnNumber: number;
}

export type LudoMachineEvent =
  | { type: 'CONFIGURE_PLAYERS'; players: PlayerConfig[]; boardTheme?: BoardThemeId }
  | { type: 'RESTORE_SESSION'; session: SavedGameSession }
  | { type: 'ROLL_DICE' }
  | { type: 'DICE_SETTLED' }
  | { type: 'SELECT_PAWN'; pawnId: string }
  | { type: 'ANIMATION_COMPLETE' }
  | { type: 'RESET_MATCH' };

export function createInitialPawns(players: PlayerConfig[]): Pawn[] {
  const pawns: Pawn[] = [];
  players.forEach((player, pIdx) => {
    for (let i = 0; i < 4; i++) {
      pawns.push({
        id: `${player.color}-${i}`,
        playerIndex: pIdx,
        color: player.color,
        pawnIndex: i,
        step: -1,
      });
    }
  });
  return pawns;
}

export const ludoMachine = setup({
  types: {
    context: {} as LudoMachineContext,
    events: {} as LudoMachineEvent,
    input: {} as {
      players: PlayerConfig[];
      boardTheme?: BoardThemeId;
      savedSession?: SavedGameSession | null;
    },
  },
  guards: {
    isThirdConsecutiveSix: ({ context }) => context.consecutiveSixes >= 3,
    hasZeroLegalMoves: ({ context }) => context.legalMoves.length === 0,
    hasSingleAutoMove: ({ context }) => {
      if (context.legalMoves.length === 1) return true;
      if (
        context.legalMoves.length > 1 &&
        context.legalMoves.every((m) => m.fromStep === -1 && m.toStep === 0)
      ) {
        return true;
      }
      return false;
    },
    isValidPawnSelection: ({ context, event }) => {
      if (event.type !== 'SELECT_PAWN') return false;
      return context.legalMoves.some((m) => m.pawnId === event.pawnId);
    },
    hasPlayerWon: ({ context }) => {
      const playerPawns = context.pawns.filter(
        (p) => p.playerIndex === context.currentPlayerIndex
      );
      return playerPawns.length === 4 && playerPawns.every((p) => p.step === 56);
    },
    earnedExtraTurn: ({ context }) => Boolean(context.hasExtraTurn),
  },
  actions: {
    performSmartRoll: assign(({ context }) => {
      const currentPlayer = context.players[context.currentPlayerIndex];

      const { diceValue, nextBiasState } = rollSmartDice({
        players: context.players,
        currentPlayerIndex: context.currentPlayerIndex,
        pawns: context.pawns,
        consecutiveSixes: context.consecutiveSixes,
        biasState: context.biasState,
      });

      const nextConsecutiveSixes =
        diceValue === 6 ? context.consecutiveSixes + 1 : 0;

      const nextLastDiceValues = [...context.playerLastDiceValues];
      nextLastDiceValues[context.currentPlayerIndex] = diceValue;

      return {
        diceValue,
        playerLastDiceValues: nextLastDiceValues,
        consecutiveSixes: nextConsecutiveSixes,
        biasState: nextBiasState,
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        statusMessage: `${currentPlayer.name} is rolling...`,
      };
    }),

    computeLegalMoves: assign(({ context }) => {
      const currentPlayer = context.players[context.currentPlayerIndex];
      const diceValue = context.diceValue ?? 1;

      if (context.consecutiveSixes >= 3) {
        return {
          legalMoves: [],
          statusMessage: `Three 6s in a row! Turn forfeited.`,
        };
      }

      const legalMoves = getLegalMovesForPlayer(
        context.pawns,
        context.currentPlayerIndex,
        currentPlayer.color,
        diceValue
      );

      let statusMessage = `${currentPlayer.name} rolled ${diceValue}!`;
      if (legalMoves.length === 0) {
        statusMessage = `Rolled ${diceValue} — No legal moves available.`;
      } else if (legalMoves.length > 1) {
        statusMessage = `Rolled ${diceValue}! Tap a highlighted token to move.`;
      }

      return {
        legalMoves,
        statusMessage,
      };
    }),

    selectAutoMove: assign(({ context }) => ({
      activeMove: context.legalMoves[0] ?? null,
    })),

    selectChosenPawnMove: assign(({ context, event }) => {
      if (event.type !== 'SELECT_PAWN') return {};
      const chosen =
        context.legalMoves.find((m) => m.pawnId === event.pawnId) ?? null;
      return {
        activeMove: chosen,
      };
    }),

    applyMoveAndCheckCaptures: assign(({ context }) => {
      const move = context.activeMove;
      if (!move) return {};

      const currentPlayer = context.players[context.currentPlayerIndex];
      const killedSet = new Set(move.willKillPawnIds);

      const updatedPawns = context.pawns.map((pawn) => {
        if (pawn.id === move.pawnId) {
          return { ...pawn, step: move.toStep };
        }
        if (killedSet.has(pawn.id)) {
          return { ...pawn, step: -1 };
        }
        return pawn;
      });

      const activeTheme =
        BOARD_THEMES.find((t) => t.id === context.boardTheme) ?? BOARD_THEMES[0];
      const perk = activeTheme.perk;

      const nextBonus = [...context.captureBonusPoints];
      let moveBonusEarned = 0;

      // 1. Capture Bounties (base 30 + theme captureBountyBonus)
      if (move.willKillPawnIds.length > 0) {
        const bountyEach = 30 + (perk.captureBountyBonus || 0);
        moveBonusEarned += move.willKillPawnIds.length * bountyEach;
      }

      // 2. Safe Star Fortitude Bonus
      if (move.landsOnSafeStar && perk.safeStarFortitudeBonus > 0) {
        moveBonusEarned += perk.safeStarFortitudeBonus;
      }

      // 3. Home Stretch Overdrive Surge Bonus
      if (move.toStep >= 51 && move.fromStep < 51 && perk.homeStretchSurgeBonus > 0) {
        moveBonusEarned += perk.homeStretchSurgeBonus;
      }

      if (moveBonusEarned > 0) {
        nextBonus[context.currentPlayerIndex] =
          (nextBonus[context.currentPlayerIndex] ?? 0) + moveBonusEarned;
      }

      const rolledSix = context.diceValue === 6;
      const killedOpponent = move.willKillPawnIds.length > 0;
      const reachedHome = move.willReachHome;
      const earnedExtra = rolledSix || killedOpponent || reachedHome;

      let statusMessage = `${currentPlayer.name} moved to step ${move.toStep}.`;
      if (killedOpponent) {
        const perkTag =
          perk.captureBountyBonus > 0
            ? ` (+${30 + perk.captureBountyBonus} ${perk.perkName})`
            : '';
        statusMessage = `💥 CAPTURE! ${currentPlayer.name} cut opponent token${perkTag} & gets a Bonus Roll!`;
      } else if (reachedHome) {
        statusMessage = `🏠 HOME! ${currentPlayer.name}'s token reached Home! Bonus Roll!`;
      } else if (move.landsOnSafeStar) {
        const fortTag =
          perk.safeStarFortitudeBonus > 0
            ? ` (+${perk.safeStarFortitudeBonus} ${perk.perkName})`
            : '';
        statusMessage = `⭐ Safe Star! ${currentPlayer.name} is fortified${fortTag}.`;
      } else if (move.toStep >= 51 && move.fromStep < 51 && perk.homeStretchSurgeBonus > 0) {
        statusMessage = `⚡ Overdrive! ${currentPlayer.name} entered Home Stretch (+${perk.homeStretchSurgeBonus} Surge)!`;
      } else if (rolledSix) {
        statusMessage = `🎲 Rolled a 6! ${currentPlayer.name} gets an Extra Roll!`;
      }

      return {
        pawns: updatedPawns,
        activeMove: null,
        hasExtraTurn: earnedExtra,
        lastCapturedPawnIds: move.willKillPawnIds,
        captureBonusPoints: nextBonus,
        legalMoves: [],
        statusMessage,
      };
    }),

    prepareExtraTurn: assign(({ context }) => {
      const currentPlayer = context.players[context.currentPlayerIndex];
      return {
        diceValue: null,
        activeMove: null,
        hasExtraTurn: false,
        legalMoves: [],
        statusMessage: `🔥 Bonus Turn for ${currentPlayer.name}! Roll again!`,
      };
    }),

    switchToNextPlayer: assign(({ context }) => {
      const nextIdx = (context.currentPlayerIndex + 1) % context.players.length;
      const nextPlayer = context.players[nextIdx];
      return {
        currentPlayerIndex: nextIdx,
        diceValue: null,
        consecutiveSixes: 0,
        activeMove: null,
        hasExtraTurn: false,
        legalMoves: [],
        lastCapturedPawnIds: [],
        turnNumber: context.turnNumber + 1,
        statusMessage: `${nextPlayer.name}'s turn to roll!`,
      };
    }),

    declareWinner: assign(({ context }) => {
      const winner = context.players[context.currentPlayerIndex];
      const activeTheme =
        BOARD_THEMES.find((t) => t.id === context.boardTheme) ?? BOARD_THEMES[0];
      const nextBonus = [...context.captureBonusPoints];

      // Clean match check: if no opponent captured the winner's pawns
      if (activeTheme.perk.cleanMatchBounty > 0) {
        nextBonus[context.currentPlayerIndex] =
          (nextBonus[context.currentPlayerIndex] ?? 0) +
          activeTheme.perk.cleanMatchBounty;
      }

      return {
        winnerIndex: context.currentPlayerIndex,
        captureBonusPoints: nextBonus,
        statusMessage: `🏆 ${winner.name} wins the match!`,
      };
    }),

    resetMatchState: assign(({ context, event }) => {
      const players =
        event.type === 'CONFIGURE_PLAYERS' ? event.players : context.players;
      const boardTheme =
        event.type === 'CONFIGURE_PLAYERS' && event.boardTheme
          ? event.boardTheme
          : context.boardTheme;
      return {
        players,
        pawns: createInitialPawns(players),
        boardTheme,
        currentPlayerIndex: 0,
        diceValue: null,
        playerLastDiceValues: players.map(() => 1),
        consecutiveSixes: 0,
        legalMoves: [],
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        captureBonusPoints: players.map(() => 0),
        biasState: createInitialBiasState(),
        winnerIndex: null,
        turnNumber: 1,
        statusMessage: `${players[0]?.name || 'Player 1'}'s turn to roll!`,
      };
    }),

    restoreSessionState: assign(({ event }) => {
      if (event.type !== 'RESTORE_SESSION') return {};
      const s = event.session;
      return {
        players: s.players,
        pawns: s.pawns,
        boardTheme: s.boardTheme ?? 'classic-kingdom',
        currentPlayerIndex: s.currentPlayerIndex,
        diceValue: null,
        playerLastDiceValues: s.playerLastDiceValues ?? s.players.map(() => 1),
        consecutiveSixes: s.consecutiveSixes ?? 0,
        legalMoves: [],
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        captureBonusPoints: s.captureBonusPoints ?? s.players.map(() => 0),
        biasState: createInitialBiasState(),
        winnerIndex: null,
        turnNumber: s.turnNumber ?? 1,
        statusMessage:
          s.statusMessage ||
          `${s.players[s.currentPlayerIndex]?.name || 'Player'}'s turn to roll!`,
      };
    }),
  },
}).createMachine({
  id: 'ludoMania',
  initial: 'IDLE',
  context: ({ input }) => {
    if (input.savedSession) {
      const s = input.savedSession;
      return {
        players: s.players,
        pawns: s.pawns,
        boardTheme: s.boardTheme ?? input.boardTheme ?? 'classic-kingdom',
        currentPlayerIndex: s.currentPlayerIndex,
        diceValue: null,
        playerLastDiceValues: s.playerLastDiceValues ?? s.players.map(() => 1),
        consecutiveSixes: s.consecutiveSixes ?? 0,
        legalMoves: [],
        activeMove: null,
        hasExtraTurn: false,
        lastCapturedPawnIds: [],
        captureBonusPoints: s.captureBonusPoints ?? s.players.map(() => 0),
        biasState: createInitialBiasState(),
        winnerIndex: null,
        turnNumber: s.turnNumber ?? 1,
        statusMessage:
          s.statusMessage ||
          `${s.players[s.currentPlayerIndex]?.name || 'Player'}'s turn to roll!`,
      };
    }
    return {
      players: input.players,
      pawns: createInitialPawns(input.players),
      boardTheme: input.boardTheme ?? 'classic-kingdom',
      currentPlayerIndex: 0,
      diceValue: null,
      playerLastDiceValues: input.players.map(() => 1),
      consecutiveSixes: 0,
      legalMoves: [],
      activeMove: null,
      hasExtraTurn: false,
      lastCapturedPawnIds: [],
      captureBonusPoints: input.players.map(() => 0),
      biasState: createInitialBiasState(),
      winnerIndex: null,
      turnNumber: 1,
      statusMessage: `${input.players[0]?.name || 'Player 1'}'s turn to roll!`,
    };
  },
  on: {
    CONFIGURE_PLAYERS: {
      target: '.IDLE',
      actions: 'resetMatchState',
    },
    RESTORE_SESSION: {
      target: '.IDLE',
      actions: 'restoreSessionState',
    },
    RESET_MATCH: {
      target: '.IDLE',
      actions: 'resetMatchState',
    },
  },
  states: {
    IDLE: {
      on: {
        ROLL_DICE: {
          target: 'ROLLING',
          actions: 'performSmartRoll',
        },
      },
    },

    ROLLING: {
      on: {
        DICE_SETTLED: {
          target: 'EVALUATING_MOVES',
          actions: 'computeLegalMoves',
        },
      },
    },

    EVALUATING_MOVES: {
      always: [
        {
          guard: 'isThirdConsecutiveSix',
          target: 'NO_MOVES_PAUSE',
        },
        {
          guard: 'hasZeroLegalMoves',
          target: 'NO_MOVES_PAUSE',
        },
        {
          guard: 'hasSingleAutoMove',
          target: 'AUTO_MOVE_PAUSE',
        },
        {
          target: 'SELECTING_PAWN',
        },
      ],
    },

    AUTO_MOVE_PAUSE: {
      after: {
        280: {
          target: 'MOVING',
          actions: 'selectAutoMove',
        },
      },
    },

    NO_MOVES_PAUSE: {
      after: {
        720: {
          target: 'NEXT_TURN',
        },
      },
    },

    SELECTING_PAWN: {
      on: {
        SELECT_PAWN: {
          guard: 'isValidPawnSelection',
          target: 'MOVING',
          actions: 'selectChosenPawnMove',
        },
      },
    },

    MOVING: {
      on: {
        ANIMATION_COMPLETE: {
          target: 'CHECK_KILL_OR_WIN',
          actions: 'applyMoveAndCheckCaptures',
        },
      },
    },

    CHECK_KILL_OR_WIN: {
      always: [
        {
          guard: 'hasPlayerWon',
          target: 'GAME_OVER',
          actions: 'declareWinner',
        },
        {
          guard: 'earnedExtraTurn',
          target: 'EXTRA_TURN',
        },
        {
          target: 'NEXT_TURN',
        },
      ],
    },

    EXTRA_TURN: {
      after: {
        520: {
          target: 'IDLE',
          actions: 'prepareExtraTurn',
        },
      },
    },

    NEXT_TURN: {
      after: {
        260: {
          target: 'IDLE',
          actions: 'switchToNextPlayer',
        },
      },
    },

    GAME_OVER: {
      on: {
        RESET_MATCH: {
          target: 'IDLE',
          actions: 'resetMatchState',
        },
      },
    },
  },
});
