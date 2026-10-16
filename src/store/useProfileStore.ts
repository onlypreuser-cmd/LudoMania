import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { soundManager } from '../audio/soundManager';
import { CROSS_OPPOSITE_COLOR } from '../engine/boardConfig';
import {
  AvatarId,
  BoardThemeId,
  DiceSkinId,
  PlayerColor,
  PlayerConfig,
  SavedGameSession,
  TokenSkinId,
} from '../types/game';

export interface MatchRecord {
  id: string;
  timestamp: number;
  winnerName: string;
  winnerAvatar: AvatarId;
  loserName: string;
  loserAvatar: AvatarId;
  turnsPlayed: number;
}

export const ALL_TOKEN_SKINS: TokenSkinId[] = [
  'classic',
  'knight',
  'dog',
  'cat',
  'bamboo-panda',
  'robot',
  'astronaut',
  'unicorn',
  'ninja',
  'astronomer',
  'star-unicorn',
  'fire-dragon',
  'ice-dragon',
  'pirate',
  'magician',
  'alien',
];

export const ALL_DICE_SKINS: DiceSkinId[] = [
  'classic-white',
  'royal-gold',
  'ruby-blaze',
  'cyber-neon',
  'emerald-jade',
  'obsidian-galaxy',
];

export const ALL_BOARD_THEMES: BoardThemeId[] = [
  'classic-kingdom',
  'royal-wood',
  'marble-palace',
  'midnight-neon',
];

interface ProfileState {
  hasCompletedSetup: boolean;
  userName: string;
  userAvatar: AvatarId;
  selectedTokenSkin: TokenSkinId;
  selectedDiceSkin: DiceSkinId;
  selectedBoardTheme: BoardThemeId;
  preferredColor: PlayerColor;
  soundEnabled: boolean;
  actionCameraEnabled: boolean;

  coins: number;
  playerLevel: number;
  playerXp: number;
  playerXpToNextLevel: number;
  winStreak: number;

  unlockedTokenSkins: TokenSkinId[];
  unlockedDiceSkins: DiceSkinId[];
  unlockedBoardThemes: BoardThemeId[];

  players: PlayerConfig[];
  matchHistory: MatchRecord[];
  savedGameSession: SavedGameSession | null;
  _hasHydrated: boolean;

  addCoins: (amount: number) => void;
  addXp: (amount: number) => void;
  completeInitialSetup: (payload: {
    name: string;
    avatar: AvatarId;
    diceSkin: DiceSkinId;
    tokenSkin: TokenSkinId;
    color: PlayerColor;
  }) => void;
  updatePlayerConfig: (index: number, partial: Partial<PlayerConfig>) => void;
  setPlayers: (players: PlayerConfig[]) => void;
  setSelectedTokenSkin: (skin: TokenSkinId) => void;
  setSelectedDiceSkin: (skin: DiceSkinId) => void;
  setSelectedBoardTheme: (theme: BoardThemeId) => void;
  toggleSound: () => void;
  toggleActionCamera: () => void;
  saveActiveGameSession: (session: SavedGameSession) => void;
  clearSavedGameSession: () => void;
  recordMatchResult: (record: Omit<MatchRecord, 'id' | 'timestamp'>) => void;
}

/**
 * Default 2-Player Cross (Diagonal) Allocation:
 * - Player 1: Blue (Top-Left Base)
 * - Player 2: Green (Bottom-Right Base)
 */
const DEFAULT_PLAYERS: PlayerConfig[] = [
  {
    id: 'p1',
    name: '',
    avatarId: 'avatar-1',
    color: 'blue',
    tokenSkin: 'classic',
    diceSkin: 'classic-white',
  },
  {
    id: 'p2',
    name: '',
    avatarId: 'avatar-2',
    color: 'green', // Cross opposite of Blue!
    tokenSkin: 'dog',
    diceSkin: 'royal-gold',
  },
];

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      hasCompletedSetup: false,
      userName: '',
      userAvatar: 'avatar-1',
      selectedTokenSkin: 'classic',
      selectedDiceSkin: 'classic-white',
      selectedBoardTheme: 'classic-kingdom',
      preferredColor: 'blue',
      soundEnabled: true,
      actionCameraEnabled: true,

      coins: 2450,
      playerLevel: 5,
      playerXp: 420,
      playerXpToNextLevel: 600,
      winStreak: 3,

      unlockedTokenSkins: ALL_TOKEN_SKINS,
      unlockedDiceSkins: ALL_DICE_SKINS,
      unlockedBoardThemes: ALL_BOARD_THEMES,

      players: DEFAULT_PLAYERS,
      matchHistory: [],
      savedGameSession: null,
      _hasHydrated: false,

      addCoins: (amount) => {
        set((state) => ({
          coins: Math.max(0, state.coins + amount),
        }));
      },

      addXp: (amount) => {
        set((state) => {
          let nextXp = state.playerXp + amount;
          let nextLevel = state.playerLevel;
          let nextXpNeeded = state.playerXpToNextLevel;

          while (nextXp >= nextXpNeeded) {
            nextXp -= nextXpNeeded;
            nextLevel += 1;
            nextXpNeeded = Math.round(nextXpNeeded * 1.35);
          }

          return {
            playerLevel: nextLevel,
            playerXp: nextXp,
            playerXpToNextLevel: nextXpNeeded,
          };
        });
      },

      completeInitialSetup: ({ name, avatar, diceSkin, tokenSkin, color }) => {
        const trimmed = name.trim();
        const currentPlayers = get().players;
        const crossColor = CROSS_OPPOSITE_COLOR[color];
        const updatedP1: PlayerConfig = {
          ...currentPlayers[0],
          name: trimmed,
          avatarId: avatar,
          diceSkin,
          tokenSkin,
          color,
        };
        const updatedP2: PlayerConfig = {
          ...currentPlayers[1],
          color: crossColor,
        };

        set({
          hasCompletedSetup: true,
          userName: trimmed,
          userAvatar: avatar,
          selectedDiceSkin: diceSkin,
          selectedTokenSkin: tokenSkin,
          preferredColor: color,
          players: [updatedP1, updatedP2],
        });
      },

      updatePlayerConfig: (index, partial) => {
        const next = [...get().players];
        if (!next[index]) return;
        next[index] = { ...next[index], ...partial };

        // Enforce Cross (Diagonal) Corner Allocation in 2-Player mode:
        // Blue <-> Green, Red <-> Yellow
        if (partial.color) {
          const otherIdx = index === 0 ? 1 : 0;
          if (next[otherIdx]) {
            next[otherIdx] = {
              ...next[otherIdx],
              color: CROSS_OPPOSITE_COLOR[partial.color],
            };
          }
        }

        // Sync main user profile preferences when player 0 updates
        if (index === 0) {
          const updates: Partial<ProfileState> = {};
          if (partial.name !== undefined) updates.userName = partial.name;
          if (partial.avatarId) updates.userAvatar = partial.avatarId;
          if (partial.color) updates.preferredColor = partial.color;
          if (partial.tokenSkin) updates.selectedTokenSkin = partial.tokenSkin;
          if (partial.diceSkin) updates.selectedDiceSkin = partial.diceSkin;
          set({ players: next, ...updates });
        } else {
          set({ players: next });
        }
      },

      setPlayers: (players) => set({ players }),

      setSelectedTokenSkin: (skin) => {
        const next = [...get().players];
        if (next[0]) next[0] = { ...next[0], tokenSkin: skin };
        set({ selectedTokenSkin: skin, players: next });
      },

      setSelectedDiceSkin: (skin) => {
        const next = [...get().players];
        if (next[0]) next[0] = { ...next[0], diceSkin: skin };
        set({ selectedDiceSkin: skin, players: next });
      },

      setSelectedBoardTheme: (theme) => set({ selectedBoardTheme: theme }),

      toggleSound: () => {
        const next = !get().soundEnabled;
        soundManager.setEnabled(next);
        set({ soundEnabled: next });
      },

      toggleActionCamera: () => {
        set((state) => ({ actionCameraEnabled: !state.actionCameraEnabled }));
      },

      saveActiveGameSession: (session) => {
        set({ savedGameSession: session });
      },

      clearSavedGameSession: () => {
        set({ savedGameSession: null });
      },

      recordMatchResult: (record) => {
        const newEntry: MatchRecord = {
          ...record,
          id: `match-${Date.now()}`,
          timestamp: Date.now(),
        };
        set({
          matchHistory: [newEntry, ...get().matchHistory].slice(0, 50),
        });
      },
    }),
    {
      name: 'ludo-mania-profile-v3',
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<ProfileState>) || {};
        return {
          ...currentState,
          ...persisted,
          coins: typeof persisted.coins === 'number' ? persisted.coins : 2450,
          playerLevel: typeof persisted.playerLevel === 'number' ? persisted.playerLevel : 5,
          playerXp: typeof persisted.playerXp === 'number' ? persisted.playerXp : 420,
          playerXpToNextLevel:
            typeof persisted.playerXpToNextLevel === 'number' ? persisted.playerXpToNextLevel : 600,
          winStreak: typeof persisted.winStreak === 'number' ? persisted.winStreak : 3,
          unlockedTokenSkins: ALL_TOKEN_SKINS,
          unlockedDiceSkins: ALL_DICE_SKINS,
          unlockedBoardThemes: ALL_BOARD_THEMES,
          _hasHydrated: true,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          soundManager.setEnabled(state.soundEnabled);
          state._hasHydrated = true;
        }
      },
    }
  )
);
