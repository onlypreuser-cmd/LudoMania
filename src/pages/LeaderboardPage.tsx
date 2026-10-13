import { motion } from 'framer-motion';
import { ChevronLeft, Crown, Medal } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { AVATAR_OPTIONS } from '../engine/boardConfig';
import {
  LeaderboardPeriod,
  useLeaderboardQuery,
} from '../queries/useLeaderboard';

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<LeaderboardPeriod>('weekly');
  const { data: entries = [], isLoading } = useLeaderboardQuery(period);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:rounded-[42px] bg-gradient-to-b from-[#f8faff] via-[#f3f6fc] to-[#eef2f9] sm:shadow-[0_28px_70px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,1)] sm:border-[6px] sm:border-white flex flex-col p-4 sm:p-5"
      >
        {/* Top Bar */}
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              soundManager.play('ui_click');
              navigate('/');
            }}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:scale-105 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 font-['Fredoka']">
            Leaderboard
          </h1>
          <div className="w-10" />
        </header>

        {/* Period Tabs: Weekly | Monthly | All Time (Exact Reference Match) */}
        <div className="mt-4 grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-200/75 border border-white">
          {(
            [
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'allTime', label: 'All Time' },
            ] as { id: LeaderboardPeriod; label: string }[]
          ).map((tab) => {
            const active = period === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundManager.play('ui_click');
                  setPeriod(tab.id);
                }}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Ranked Player Cards */}
        <div className="mt-4 space-y-2.5 flex-1">
          {isLoading ? (
            <div className="py-16 text-center text-sm font-bold text-slate-400">
              Loading rankings...
            </div>
          ) : (
            entries.map((item) => {
              const avatar =
                AVATAR_OPTIONS.find((a) => a.id === item.avatarId) ??
                AVATAR_OPTIONS[0];

              const badgeColors =
                item.rank === 1
                  ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-amber-950 border-amber-200'
                  : item.rank === 2
                  ? 'bg-gradient-to-b from-slate-200 to-slate-400 text-slate-900 border-slate-100'
                  : item.rank === 3
                  ? 'bg-gradient-to-b from-orange-300 to-amber-700 text-white border-orange-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200';

              return (
                <motion.div
                  key={`${item.name}-${item.rank}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-[22px] p-3 flex items-center justify-between border-2 transition-all ${
                    item.isCurrentUser
                      ? 'bg-gradient-to-r from-amber-50 via-white to-sky-50 border-amber-300 shadow-md'
                      : 'bg-white border-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Medal Pill */}
                    <div
                      className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs shadow-sm ${badgeColors}`}
                    >
                      {item.rank <= 3 ? (
                        <Medal className="w-4 h-4" />
                      ) : (
                        item.rank
                      )}
                    </div>

                    {/* Cropped PNG Avatar */}
                    <img
                      src={avatar.src}
                      alt={item.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-white shadow"
                    />

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-extrabold text-slate-900">
                          {item.name}
                        </span>
                        {item.hasCrown && (
                          <Crown className="w-4 h-4 fill-amber-400 text-amber-500" />
                        )}
                        {item.isCurrentUser && (
                          <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {item.wins} Victories
                      </span>
                    </div>
                  </div>

                  <span className="text-sm font-black text-slate-900 tabular-nums">
                    {item.score.toLocaleString()}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};
