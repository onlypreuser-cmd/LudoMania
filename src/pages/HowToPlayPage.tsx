import { motion } from 'framer-motion';
import { ChevronLeft, Dices, ShieldCheck, Sparkles, Swords, Trophy } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { soundManager } from '../audio/soundManager';
import { TOKEN_SKINS } from '../engine/boardConfig';

export const HowToPlayPage: React.FC = () => {
  const navigate = useNavigate();

  const rules = [
    {
      icon: Dices,
      title: '1. Roll a 6 to Deploy',
      text: 'Tap the 3D Physics Dice Pod on your turn. Rolling a 6 unlocks a token from your home Yard onto your colored starting square and grants a Bonus Roll!',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      icon: Swords,
      title: '2. Capture & Knock Out Opponents',
      text: 'Land on a non-safe square occupied by an opponent token to knock it back to their Yard! Every capture rewards you with an immediate Extra Turn.',
      color: 'bg-rose-100 text-rose-600',
    },
    {
      icon: ShieldCheck,
      title: '3. Star Safe Zones',
      text: 'The 4 colored starting squares and 4 Star squares are Safe Zones. Multiple tokens can rest safely on Star squares without being captured.',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      icon: Trophy,
      title: '4. Exact Roll to Enter Home',
      text: 'Complete a full 51-step circuit around the board to enter your colored Home Stretch. Guide all 4 tokens into the center Home Triangle to win!',
      color: 'bg-amber-100 text-amber-600',
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
            How to Play
          </h1>
          <div className="w-10" />
        </header>

        <div className="mt-4 space-y-3 flex-1 overflow-y-auto">
          {rules.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.title}
                className="rounded-[24px] bg-white border-2 border-white p-4 shadow-sm flex items-start gap-3.5"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${r.color} flex items-center justify-center shrink-0 shadow-inner`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {r.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed mt-0.5">
                    {r.text}
                  </p>
                </div>
              </div>
            );
          })}

          {/* 3D Token Move Animations Reference */}
          <div className="rounded-[24px] bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-4 shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-extrabold">
                Unique 3D Token Move Animations
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {TOKEN_SKINS.map((s) => (
                <div
                  key={s.id}
                  className="bg-white/15 backdrop-blur-sm rounded-xl px-2.5 py-1.5 border border-white/15"
                >
                  <span className="font-extrabold block text-amber-200">
                    {s.name}
                  </span>
                  <span className="text-white/90">{s.moveStyleName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
