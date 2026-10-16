import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Shield, Sparkles, Trophy, X, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { soundManager } from '../../audio/soundManager';
import { BOARD_THEMES } from '../../engine/boardConfig';

interface RulesAndPerksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesAndPerksModal: React.FC<RulesAndPerksModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'perks' | 'rules'>('perks');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs select-none"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 10, opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[440px] max-h-[90vh] rounded-[32px] bg-white p-4 sm:p-5 shadow-[0_24px_60px_rgba(15,23,42,0.35)] border border-slate-200/80 flex flex-col justify-between overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 font-['Fredoka']">
                  Rules & Board Perks
                </h2>
                <p className="text-[11px] font-semibold text-slate-500">
                  LudoMania Official Rulebook & Special Abilities
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-transform active:scale-95"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="my-3 grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                setActiveTab('perks');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'perks'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Board Perks ({BOARD_THEMES.length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                setActiveTab('rules');
              }}
              className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'rules'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Core Rules</span>
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
            {activeTab === 'perks' ? (
              BOARD_THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">
                      {theme.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black border border-amber-300">
                      {theme.perk.badge}
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-600 leading-snug">
                    {theme.perk.description}
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                    {theme.perk.captureBountyBonus > 0 && (
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        +{theme.perk.captureBountyBonus} Capture Bounty
                      </span>
                    )}
                    {theme.perk.cleanMatchBounty > 0 && (
                      <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        +{theme.perk.cleanMatchBounty} Flawless Victory
                      </span>
                    )}
                    {theme.perk.safeStarFortitudeBonus > 0 && (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        +{theme.perk.safeStarFortitudeBonus} Star Fortitude
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-2.5 text-xs text-slate-700">
                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    6
                  </div>
                  <div>
                    <h4 className="font-black text-blue-950">Roll 6 to Release</h4>
                    <p className="text-[11px] text-blue-900/80 mt-0.5">
                      Pawns start locked in your Yard. Rolling a 6 summons a pawn onto your Starting Square and grants an immediate extra roll!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                    ★
                  </div>
                  <div>
                    <h4 className="font-black text-amber-950">Safe Star Havens</h4>
                    <p className="text-[11px] text-amber-900/80 mt-0.5">
                      Cells marked with a Golden Star are sanctuary safe zones. Pawns on star cells cannot be captured by opponent pieces.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    ⚔️
                  </div>
                  <div>
                    <h4 className="font-black text-rose-950">Capture & Bounty</h4>
                    <p className="text-[11px] text-rose-900/80 mt-0.5">
                      Landing on an opponent's pawn on normal track knocks it back into their yard and awards you a bonus extra turn roll!
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0">
                    🏆
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-950">Victory Condition</h4>
                    <p className="text-[11px] text-emerald-900/80 mt-0.5">
                      Navigate all 4 of your pawns through the home column into the center Home Goal to win the match and claim XP and coins!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close Action */}
          <div className="pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                soundManager.play('ui_click');
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-transform cursor-pointer active:scale-98 font-['Fredoka']"
            >
              Got It, Let's Roll!
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RulesAndPerksModal;
