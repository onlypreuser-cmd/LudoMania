import { assign, setup } from 'xstate';
import {
  createInitialBiasState,
  getLegalMovesForPlayer,
  rollSmartDice,
} from '../engine/diceEngine';
import {
  DiceBiasState,
  MoveEvaluation,
  Pawn,
  PlayerConfig,
} from '../types/game';

export interface LudoMachineContext {
  players: PlayerConfig[];
  pawns: Pawn[];
  currentPlayerIndex: number;
  diceValue: number | null;
  playerLastDiceValues: number[];
  consecutiveSixes: number;
  legalMoves: MoveEvaluation[];
  activeMove: MoveEvaluation | null;
  lastCapturedPawnIds: string[];
  captureBonusPoints: number[];
  biasState: DiceBiasState;
  winnerIndex: number | null;
  statusMessage: string;
  turnNumber: number;
}

export type LudoMachineEvent =
  | { type: 'CONFIGURE_PLAYERS'; players: PlayerConfig[] }
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
    input: {} as { players: PlayerConfig[] },
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
    earnedExtraTurn: ({ context }) => {
      if (!context.activeMove) return false;
      const rolledSix = context.diceValue === 6;
      const killedOpponent = context.activeMove.willKillPawnIds.length > 0;
      const reachedHome = context.activeMove.willReachHome;
      return rolledSix || killedOpponent || reachedHome;
    },
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

      const nextBonus = [...context.captureBonusPoints];
      if (move.willKillPawnIds.length > 0) {
        nextBonus[context.currentPlayerIndex] =
          (nextBonus[context.currentPlayerIndex] ?? 0) +
          move.willKillPawnIds.length * 30;
      }

      let statusMessage = `${currentPlayer.name} moved to step ${move.toStep}.`;
      if (move.willKillPawnIds.length > 0) {
        statusMessage = `💥 CAPTURE! ${currentPlayer.name} cut opponent's token & gets a Bonus Roll!`;
      } else if (move.willReachHome) {
        statusMessage = `🏠 HOME! ${currentPlayer.name}'s token reached Home! Bonus Roll!`;
      } else if (context.diceValue === 6) {
        statusMessage = `🎲 Rolled a 6! ${currentPlayer.name} gets an Extra Roll!`;
      } else if (move.landsOnSafeStar) {
        statusMessage = `⭐ Safe Star! ${currentPlayer.name}'s token is protected.`;
      }

      return {
        pawns: updatedPawns,
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
        legalMoves: [],
        lastCapturedPawnIds: [],
        turnNumber: context.turnNumber + 1,
        statusMessage: `${nextPlayer.name}'s turn to roll!`,
      };
    }),

    declareWinner: assign(({ context }) => {
      const winner = context.players[context.currentPlayerIndex];
      return {
        winnerIndex: context.currentPlayerIndex,
        statusMessage: `🏆 ${winner.name} wins the match!`,
      };
    }),

    resetMatchState: assign(({ context, event }) => {
      const players =
        event.type === 'CONFIGURE_PLAYERS' ? event.players : context.players;
      return {
        players,
        pawns: createInitialPawns(players),
        currentPlayerIndex: 0,
        diceValue: null,
        playerLastDiceValues: players.map(() => 1),
        consecutiveSixes: 0,
        legalMoves: [],
        activeMove: null,
        lastCapturedPawnIds: [],
        captureBonusPoints: players.map(() => 0),
        biasState: createInitialBiasState(),
        winnerIndex: null,
        turnNumber: 1,
        statusMessage: `${players[0]?.name || 'Player 1'}'s turn to roll!`,
      };
    }),
  },
}).createMachine({
  id: 'ludoMania',
  initial: 'IDLE',
  context: ({ input }) => ({
    players: input.players,
    pawns: createInitialPawns(input.players),
    currentPlayerIndex: 0,
    diceValue: null,
    playerLastDiceValues: input.players.map(() => 1),
    consecutiveSixes: 0,
    legalMoves: [],
    activeMove: null,
    lastCapturedPawnIds: [],
    captureBonusPoints: input.players.map(() => 0),
    biasState: createInitialBiasState(),
    winnerIndex: null,
    turnNumber: 1,
    statusMessage: `${input.players[0]?.name || 'Player 1'}'s turn to roll!`,
  }),
  on: {
    CONFIGURE_PLAYERS: {
      target: '.IDLE',
      actions: 'resetMatchState',
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
