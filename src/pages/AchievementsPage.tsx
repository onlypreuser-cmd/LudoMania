import { motion } from 'framer-motion';
import { Award, CheckCircle2, ChevronLeft, Flame, Shield, Trophy, Zap } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { useProfileStore } from '../store/useProfileStore';

export const AchievementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { matchHistory, unlockedTokenSkins, coins } = useProfileStore();

  const totalWins = matchHistory.length;

  const achievements = [
    {
      id: 'first-roll',
      title: 'Royal Challenger',
      desc: 'Create your custom Player Profile & Avatar',
      progress: 1,
      target: 1,
      reward: 250,
      icon: Zap,
      color: 'from-blue-400 to-blue-600',
    },
    {
      id: 'first-win',
      title: 'First Victory',
      desc: 'Win your first Local 2-Player Ludo match',
      progress: Math.min(1, totalWins),
      target: 1,
      reward: 500,
      icon: Trophy,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'collector',
      title: '3D Token Collector',
      desc: 'Own at least 5 different 3D Token Skins',
      progress: Math.min(5, unlockedTokenSkins.length),
      target: 5,
      reward: 1000,
      icon: Award,
      color: 'from-purple-400 to-indigo-600',
    },
    {
      id: 'tycoon',
      title: 'Kingdom Tycoon',
      desc: 'Accumulate 12,000+ Gold Coins',
      progress: Math.min(12000, coins),
      target: 12000,
      reward: 1500,
      icon: Flame,
      color: 'from-rose-400 to-red-600',
    },
    {
      id: 'veteran',
      title: 'Grandmaster Tactician',
      desc: 'Complete 5 Local Ludo matches',
      progress: Math.min(5, totalWins),
      target: 5,
      reward: 2000,
      icon: Shield,
      color: 'from-emerald-400 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center p-0 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-[430px] min-h-screen sm:min-h-[840px] sm:rounded-[42px] bg-gradient-to-b from-[#f8faff] via-[#f3f6fc] to-[#eef2f9] sm:shadow-[0_28px_70px_rgba(15,23,42,0.28),inset_0_2px_4px_rgba(255,255,255,1)] sm:border-[6px] sm:border-white flex flex-col p-4 sm:p-5"
      >
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
            Achievements
          </h1>
          <div className="w-10" />
        </header>

        <div className="mt-4 space-y-3 flex-1">
          {achievements.map((item) => {
            const Icon = item.icon;
            const completed = item.progress >= item.target;
            const pct = Math.min(100, Math.round((item.progress / item.target) * 100));

            return (
              <div
                key={item.id}
                className={`rounded-[24px] p-4 border-2 transition-all ${
                  completed
                    ? 'bg-gradient-to-r from-amber-50/90 to-white border-amber-300 shadow-md'
                    : 'bg-white border-white shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-md shrink-0`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-extrabold text-slate-900">
                        {item.title}
                      </h3>
                      {completed ? (
                        <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-600">
                          <CheckCircle2 className="w-4 h-4" /> Unlocked
                        </span>
                      ) : (
                        <span className="text-xs font-extrabold text-amber-600">
                          +{item.reward} ★
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {item.desc}
                    </p>
                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
