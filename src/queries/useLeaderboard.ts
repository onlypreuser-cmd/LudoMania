import { useQuery } from '@tanstack/react-query';
import { useProfileStore } from '../store/useProfileStore';
import { AvatarId } from '../types/game';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'allTime';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatarId: AvatarId;
  score: number;
  wins: number;
  isCurrentUser?: boolean;
  hasCrown?: boolean;
}

const BASE_COMPETITORS: Record<LeaderboardPeriod, Omit<LeaderboardEntry, 'rank'>[]> = {
  weekly: [
    { name: 'Aryan', avatarId: 'avatar-3', score: 10320, wins: 18 },
    { name: 'Sneha', avatarId: 'avatar-2', score: 8900, wins: 14 },
    { name: 'Karan', avatarId: 'avatar-4', score: 7540, wins: 11 },
    { name: 'Priya', avatarId: 'avatar-5', score: 6880, wins: 9 },
    { name: 'Vikram', avatarId: 'avatar-6', score: 5420, wins: 7 },
  ],
  monthly: [
    { name: 'Aryan', avatarId: 'avatar-3', score: 28400, wins: 49 },
    { name: 'Sneha', avatarId: 'avatar-2', score: 24150, wins: 41 },
    { name: 'Karan', avatarId: 'avatar-4', score: 19800, wins: 33 },
    { name: 'Priya', avatarId: 'avatar-5', score: 17200, wins: 28 },
    { name: 'Rohan', avatarId: 'avatar-6', score: 14900, wins: 22 },
  ],
  allTime: [
    { name: 'Aryan', avatarId: 'avatar-3', score: 64200, wins: 112 },
    { name: 'Sneha', avatarId: 'avatar-2', score: 53900, wins: 95 },
    { name: 'Karan', avatarId: 'avatar-4', score: 48100, wins: 84 },
    { name: 'Priya', avatarId: 'avatar-5', score: 41600, wins: 71 },
    { name: 'Kabir', avatarId: 'avatar-6', score: 36500, wins: 60 },
  ],
};

export function useLeaderboardQuery(period: LeaderboardPeriod) {
  const { userName, userAvatar, matchHistory } = useProfileStore();

  return useQuery({
    queryKey: ['leaderboard', period, userName, userAvatar, matchHistory.length],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      // Simulate fast local query resolution with real match stats merged
      await new Promise((r) => setTimeout(r, 80));

      const baseList = BASE_COMPETITORS[period].map((item) => ({ ...item }));
      const activeName = userName.trim() || 'Challenger';

      // BUG-08 FIX: Count actual wins — no fake base wins for new players
      const userWins = matchHistory.filter(
        (m) => m.winnerName.toLowerCase() === activeName.toLowerCase()
      ).length;

      // BUG-08 FIX: Score starts from 0 (not a fake inflated base).
      // 600 points per win gives a realistic progression vs competitors.
      const computedUserScore = userWins * 600;

      const combined: Omit<LeaderboardEntry, 'rank'>[] = [
        // BUG-08 FIX: Filter using same case-insensitive comparison as wins count
        ...baseList.filter(
          (b) => b.name.toLowerCase() !== activeName.toLowerCase()
        ),
        {
          name: activeName,
          avatarId: userAvatar,
          score: computedUserScore,
          wins: userWins,
          isCurrentUser: true,
        },
      ];

      combined.sort((a, b) => b.score - a.score);

      return combined.map((entry, idx) => ({
        ...entry,
        rank: idx + 1,
        hasCrown: idx === 0,
      }));
    },
    staleTime: 1000 * 30,
  });
}
