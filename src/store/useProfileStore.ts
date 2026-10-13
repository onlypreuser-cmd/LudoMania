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

interface ProfileState {
  hasCompletedSetup: boolean;
  userName: string;
  userAvatar: AvatarId;
  selectedTokenSkin: TokenSkinId;
  selectedDiceSkin: DiceSkinId;
  selectedBoardTheme: BoardThemeId;
  preferredColor: PlayerColor;
  coins: number;
  soundEnabled: boolean;

  unlockedTokenSkins: TokenSkinId[];
  unlockedDiceSkins: DiceSkinId[];
  unlockedBoardThemes: BoardThemeId[];

  players: PlayerConfig[];
  matchHistory: MatchRecord[];

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
  unlockItem: (
    category: 'token' | 'dice' | 'board',
    id: string,
    price: number
  ) => boolean;
  addCoins: (amount: number) => void;
  toggleSound: () => void;
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
      coins: 12450,
      soundEnabled: true,

      unlockedTokenSkins: [
        'classic',
        'knight',
        'dog',
        'cat',
        'bamboo-panda',
        'cyber-robot',
        'astronomer',
        'star-unicorn',
        'fire-dragon',
        'ice-dragon',
        'pirate',
        'magician',
        'alien',
      ],
      unlockedDiceSkins: ['classic-white', 'royal-gold', 'ruby-blaze'],
      unlockedBoardThemes: ['classic-kingdom', 'royal-wood'],

      players: DEFAULT_PLAYERS,
      matchHistory: [],

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

        if (index === 0) {
          set({
            players: next,
            userName: next[0].name || get().userName,
            userAvatar: next[0].avatarId,
            selectedDiceSkin: next[0].diceSkin,
            selectedTokenSkin: next[0].tokenSkin,
            preferredColor: next[0].color,
          });
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

      unlockItem: (category, id, price) => {
        const state = get();
        if (state.coins < price) return false;
        const nextCoins = state.coins - price;
        if (category === 'token') {
          const tokenId = id as TokenSkinId;
          set({
            coins: nextCoins,
            unlockedTokenSkins: Array.from(
              new Set([...state.unlockedTokenSkins, tokenId])
            ),
            selectedTokenSkin: tokenId,
          });
        } else if (category === 'dice') {
          const diceId = id as DiceSkinId;
          set({
            coins: nextCoins,
            unlockedDiceSkins: Array.from(
              new Set([...state.unlockedDiceSkins, diceId])
            ),
            selectedDiceSkin: diceId,
          });
        } else if (category === 'board') {
          const boardId = id as BoardThemeId;
          set({
            coins: nextCoins,
            unlockedBoardThemes: Array.from(
              new Set([...state.unlockedBoardThemes, boardId])
            ),
            selectedBoardTheme: boardId,
          });
        }
        return true;
      },

      addCoins: (amount) => set({ coins: get().coins + amount }),

      toggleSound: () => {
        const next = !get().soundEnabled;
        soundManager.setEnabled(next);
        set({ soundEnabled: next });
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
      name: 'ludo-mania-profile-v2',
      onRehydrateStorage: () => (state) => {
        if (state) {
          soundManager.setEnabled(state.soundEnabled);
          const defaultUnlocked: TokenSkinId[] = [
            'classic',
            'knight',
            'dog',
            'cat',
            'bamboo-panda',
            'cyber-robot',
            'astronomer',
            'star-unicorn',
            'fire-dragon',
            'ice-dragon',
            'pirate',
            'magician',
            'alien',
          ];
          const merged = Array.from(
            new Set([...(state.unlockedTokenSkins ?? []), ...defaultUnlocked])
          );
          if (merged.length !== (state.unlockedTokenSkins?.length ?? 0)) {
            state.unlockedTokenSkins = merged;
          }
        }
      },
    }
  )
);
